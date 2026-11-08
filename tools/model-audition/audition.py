"""Prepare AMT MIDI inputs or run a locally downloaded checkpoint, never a paid API."""
import argparse
import hashlib
import json
import math
import random
import signal
import subprocess
import sys
import time
from pathlib import Path

import mido

UPSTREAM = "https://github.com/jthickstun/anticipation"
UPSTREAM_REVISION = "af37397922665a0fb8d474d7988b0f3755a38d45"


def validate(data):
    if data.get("version") != 1 or data.get("generated") is not False:
        raise ValueError("Expected a labelled original-arranger audition fixture")
    if data["style"] not in ("blues", "legatoFusion"):
        raise ValueError("Unsupported initial audition style")
    for field in ("bpm", "totalBeats", "primerBeats"):
        if not math.isfinite(data[field]) or data[field] <= 0:
            raise ValueError("Invalid " + field)
    if data["primerBeats"] >= data["totalBeats"]:
        raise ValueError("Primer must leave space for generation")
    for rows in [*data["tracks"].values(), data["chords"]]:
        for event in rows:
            if not all(math.isfinite(event[k]) for k in ("beat", "duration")):
                raise ValueError("Nonfinite event")
            if event["beat"] < 0 or event["duration"] <= 0 or event["beat"] >= data["totalBeats"]:
                raise ValueError("Event outside the chart")
            if any(not isinstance(n, int) or not 0 <= n <= 127 for n in event.get("notes", [])):
                raise ValueError("Invalid MIDI pitch")
    return data


def write_midi(data, path, *, primer=False, controls=False):
    midi = mido.MidiFile(ticks_per_beat=480)
    meta = mido.MidiTrack(); midi.tracks.append(meta)
    meta.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(data["bpm"])))
    meta.append(mido.MetaMessage("time_signature", numerator=data["beatsPerBar"], denominator=4))
    tracks = {"controls": [{"beat": h["beat"], "duration": min(h["duration"], 1.5),
                           "notes": h.get("controlNotes",[48 + n for n in h["chordPcs"]]), "velocity": .42}
                          for h in data["chords"]]} if controls else data["tracks"]
    for channel, (name, events) in enumerate(tracks.items()):
        track = mido.MidiTrack(); midi.tracks.append(track)
        track.append(mido.MetaMessage("track_name", name=name))
        track.append(mido.Message("program_change", channel=channel, program=data["programs"][name]))
        pending=[]
        for e in events:
            if primer and e["beat"] >= data["primerBeats"]:
                continue
            end=min(e["beat"]+e["duration"], data["primerBeats"] if primer else data["totalBeats"])
            for note in e["notes"]:
                pending.extend([(round(e["beat"]*480), 1, note, round(max(.01,min(1,e["velocity"]))*127)),
                                (max(round(e["beat"]*480)+1,round(end*480)), 0, note, 0)])
        previous=0
        for tick, on, note, velocity in sorted(pending):
            track.append(mido.Message("note_on" if on else "note_off", channel=channel,
                                      note=note, velocity=velocity, time=tick-previous)); previous=tick
    midi.save(path)


def read_events(path, bpm, primer_beats, programs):
    elapsed=0.; active={}; instruments={}; result=[]
    for message in mido.MidiFile(path):
        elapsed+=message.time
        if message.type == "program_change":
            instruments[message.channel]=message.program
        elif message.type in ("note_on", "note_off"):
            key=(message.channel, message.note)
            if message.type == "note_on" and message.velocity:
                # MIDI has no voice IDs; retain simultaneous same-pitch onsets.
                active.setdefault(key, []).append((elapsed, message.velocity, instruments.get(message.channel, 0)))
            elif active.get(key):
                start, velocity, program=active[key].pop(0)
                beat=start*bpm/60; duration=(elapsed-start)*bpm/60
                role="drums" if message.channel==9 else next((k for k,v in programs.items() if k!="controls" and v==program), "unmapped")
                result.append({"beat":beat,"duration":duration,"midi":message.note,"program":program,"role":role,
                               # AMT rounds absolute time to 10 ms; integer MIDI
                               # tempo also rounds. Allow one model time quantum
                               # when identifying the generation boundary.
                               "velocity":velocity/127,"origin":"primer" if beat<primer_beats-.011*bpm/60 else "model"})
    return sorted(result,key=lambda e:(e["beat"],e["midi"]))


def checksum(path):
    digest=hashlib.sha256()
    with Path(path).open("rb") as source:
        for block in iter(lambda:source.read(1024*1024),b""):
            digest.update(block)
    return digest.hexdigest()


def run(args):
    data=validate(json.loads(Path(args.fixture).read_text()))
    output=Path(args.output); output.mkdir(parents=True, exist_ok=True)
    for name, options in [("baseline",{}),("primer",{"primer":True}),("controls",{"controls":True})]:
        write_midi(data,output/(name+".mid"),**options)
    manifest={"status":"inputs-prepared", "generated":False,"style":data["style"],"fixtureSha256":checksum(args.fixture),
              "sourceCommit":data["sourceCommit"],"bpm":data["bpm"],"primerBeats":data["primerBeats"],
              "totalBeats":data["totalBeats"],"seeds":data["seeds"],"upstream":UPSTREAM,
              "inputs":{n:checksum(output/(n+".mid")) for n in ("baseline","primer","controls")}}
    manifest_path=output/"manifest.json"
    manifest_path.write_text(json.dumps(manifest,indent=2)+"\n")
    if args.check:
        if args.upstream:
            revision=subprocess.check_output(["git","-C",args.upstream,"rev-parse","HEAD"],text=True).strip()
            if revision!=UPSTREAM_REVISION:
                raise ValueError("Use the inspected upstream revision: "+UPSTREAM_REVISION)
            sys.path.insert(0,str(Path(args.upstream).resolve()))
            import torch
            from transformers import GPT2LMHeadModel
            from anticipation.convert import midi_to_events,events_to_midi
            from anticipation.tokenize import extract_instruments
            from anticipation.vocab import CONTROL_OFFSET
            events=midi_to_events(str(output/"primer.mid"))
            _,controls=extract_instruments(midi_to_events(str(output/"controls.mid")),[0])
            if not events or not controls or not all(t>=CONTROL_OFFSET for t in controls) or not all(t<CONTROL_OFFSET for t in events):
                raise ValueError("The upstream token conversion did not separate controls and primer")
            roundtrip=output/"primer-token-roundtrip.mid"; events_to_midi(events).save(roundtrip)
            converted=midi_to_events(str(roundtrip))
            if events[2::3]!=converted[2::3]:
                raise ValueError("Upstream MIDI roundtrip changed the pitches/instruments")
            manifest["preflight"]={"upstreamRevision":revision,"torch":torch.__version__,"modelClassImport":True,
                                   "gpu":torch.cuda.is_available(),"primerEvents":len(events)//3,"controlEvents":len(controls)//3,
                                   "controlTokensSeparated":True,"pitchRoundTripPassed":True,"generationRan":False}
            manifest_path.write_text(json.dumps(manifest,indent=2)+"\n")
        print(json.dumps({"status":manifest["status"],"generated":False,"output":str(output)})); return
    if not args.checkpoint or not args.revision or not args.upstream:
        raise ValueError("Generation requires --checkpoint LOCAL_PATH --revision MODEL_SHA --upstream SOURCE_CHECKOUT")
    if len(args.revision)!=40 or any(c not in "0123456789abcdef" for c in args.revision):
        raise ValueError("Pin the checkpoint to its full model repository revision")
    checkpoint=Path(args.checkpoint)
    if not checkpoint.is_dir() or not (checkpoint/"config.json").is_file():
        raise FileNotFoundError("Local model checkpoint is missing; no network download is attempted")
    model_receipt=checkpoint/"audition-model.json"
    if model_receipt.is_file():
        downloaded=json.loads(model_receipt.read_text())
        if downloaded.get("status")!="downloaded" or downloaded.get("revision")!=args.revision:
            raise ValueError("The requested model revision does not match the download receipt")
    revision=subprocess.check_output(["git","-C",args.upstream,"rev-parse","HEAD"],text=True).strip()
    if revision!=UPSTREAM_REVISION:
        raise ValueError("Use the inspected upstream revision: "+UPSTREAM_REVISION)
    sys.path.insert(0,str(Path(args.upstream).resolve()))
    import numpy as np
    import torch
    from transformers import GPT2LMHeadModel
    from anticipation.convert import midi_to_events,events_to_midi
    from anticipation.tokenize import extract_instruments
    from anticipation.sample import generate
    torch.set_num_threads(args.threads)
    model=GPT2LMHeadModel.from_pretrained(str(checkpoint),local_files_only=True,trust_remote_code=False).eval()
    inputs=midi_to_events(str(output/"primer.mid"))
    _,controls=extract_instruments(midi_to_events(str(output/"controls.mid")),[data["programs"]["controls"]])
    manifest.update(status="generating",declaredModelRevision=args.revision,upstreamRevision=revision,
                    modelFiles={p.name:checksum(p) for p in checkpoint.iterdir() if p.is_file() and p.suffix in (".json",".safetensors",".bin")},
                    model="stanford-crfm/music-medium-800k",device="cpu",candidates=[])
    manifest_path.write_text(json.dumps(manifest,indent=2)+"\n")
    def timed_out(signum,frame):
        raise TimeoutError("Model exceeded the per-candidate wall-clock limit")
    signal.signal(signal.SIGALRM,timed_out)
    for seed in args.seeds or data["seeds"]:
        random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
        start=time.monotonic(); signal.alarm(args.timeout)
        try:
            events=generate(model,data["primerBeats"]*60/data["bpm"],data["totalBeats"]*60/data["bpm"],
                            inputs=inputs,controls=controls,top_p=.95)
        finally:
            signal.alarm(0)
        raw=output/(str(seed)+"-raw.mid"); events_to_midi(events).save(raw)
        notes=read_events(raw,data["bpm"],data["primerBeats"],data["programs"])
        continuation=[e for e in notes if e["origin"]=="model"]
        if not continuation:
            raise RuntimeError("Model produced no continuation; raw MIDI was retained for diagnosis")
        report={"seed":seed,"seconds":round(time.monotonic()-start,3),"rawSha256":checksum(raw),
                "modelNotes":len(continuation),"unmappedNotes":sum(e["role"]=="unmapped" for e in continuation),
                "harmonicRepairApplied":False,"notes":notes}
        (output/(str(seed)+"-events.json")).write_text(json.dumps(report,indent=2)+"\n")
        manifest["candidates"].append({k:v for k,v in report.items() if k!="notes"})
        manifest.update(status="generated-unreviewed",generated=True)
        manifest_path.write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps({"status":manifest["status"],"candidates":len(manifest["candidates"])}))


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("fixture"); parser.add_argument("--output",required=True)
    parser.add_argument("--check",action="store_true")
    parser.add_argument("--checkpoint"); parser.add_argument("--revision"); parser.add_argument("--upstream")
    parser.add_argument("--seeds",nargs="+",type=int); parser.add_argument("--threads",type=int,default=3)
    parser.add_argument("--timeout",type=int,default=300)
    args=parser.parse_args()
    try:
        run(args)
    except Exception as error:
        receipt=Path(args.output)/"manifest.json"
        if receipt.is_file():
            manifest=json.loads(receipt.read_text());manifest.update(status="preflight-failed" if args.check else "generation-failed",error=str(error))
            receipt.write_text(json.dumps(manifest,indent=2)+"\n")
        raise
