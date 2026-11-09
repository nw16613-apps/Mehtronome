"""Prepare pinned CC0 candidates outside the app's runtime sample library.
Usage: python3 tools/sample-audition/prepare.py /workspace/sample-candidates
Requires numpy and ffmpeg. Downloads original recordings, not synthesised notes.
"""
import concurrent.futures, hashlib, json, pathlib, re, subprocess, sys, urllib.request
import numpy as np

OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
SOURCES = {
    'shiny': ('sfzinstruments/karoryfer.shinyguitar', '57243cca85277dbcc120ce17c6178032f93c80f3'),
    'growly': ('sfzinstruments/karoryfer.growlybass', '4f483268fc66b5a6d5781d421c0d11b8d08d3fc6'),
    'sneaky': ('sfzinstruments/karoryfer.sneakybass', 'cc1a67e5c913678b85eaad1a3b5cb180d3be3e2d'),
}
def fetch(source, path):
    repo, revision = SOURCES[source]
    return urllib.request.urlopen(f'https://raw.githubusercontent.com/{repo}/{revision}/{path}', timeout=60).read()

specs = []
# Use the source SFZ's actual pitch centres and dynamics, never filename guesses.
shiny = fetch('shiny', 'Programs/electric_one.sfz').decode()
for group in shiny.split('<group>')[1:]:
    if not re.search(r'pitch_keycenter=(\d+)', group): continue
    root = int(re.search(r'pitch_keycenter=(\d+)', group)[1])
    if not 40 <= root <= 84: continue
    low = int(re.search(r'lovel=(\d+)', group)[1]) if 'lovel=' in group else 0
    high = int(re.search(r'hivel=(\d+)', group)[1]) if 'hivel=' in group else 127
    for path in re.findall(r'sample=([^\r\n]+)', group)[:2]:
        specs.append(dict(family='shiny', source='shiny', path='Samples/'+path.replace('\\','/'),
                          nominalMidi=root, rootMidi=root, velLow=low/128, velHigh=(high+1)/128, layer=low))
growly = fetch('growly', 'growlybass_clean.sfz').decode()
for group in growly.split('<group>')[1:]:
    if not re.search(r'pitch_keycenter=(\d+)', group): continue
    root = int(re.search(r'pitch_keycenter=(\d+)', group)[1])
    if not 28 <= root <= 61: continue
    for region in group.split('<region>')[1:]:
        path = re.search(r'sample=([^\r\n]+)', region)[1].replace('\\','/')
        if not path.startswith('sustain/') or not re.search(r'_rr[12]\.wav$',path): continue
        low = int(re.search(r'lovel=(\d+)',region)[1]) if 'lovel=' in region else 0
        high = int(re.search(r'hivel=(\d+)',region)[1]) if 'hivel=' in region else 127
        specs.append(dict(family='growly',source='growly',path=path,nominalMidi=root,rootMidi=root,
                          velLow=low/128,velHigh=(high+1)/128,layer=low))
sneaky = fetch('sneaky','Programs/modules/maps/sneakybass_pluck_map.sfz').decode()
for region in sneaky.split('<region>')[1:]:
    if not re.search(r'pitch_keycenter=(\d+)', region): continue
    root=int(re.search(r'pitch_keycenter=(\d+)',region)[1])
    path=re.search(r'sample=([^\r\n]+)',region)[1].replace('\\','/').removeprefix('../')
    if root%3 or not 33 <= root <= 66 or not re.search(r'_rr[12]\.wav$',path): continue
    tune=re.search(r'tune=(-?[\d.]+)',region)
    specs.append(dict(family='sneaky',source='sneaky',path=path,nominalMidi=root,
                      rootMidi=root-(float(tune[1]) if tune else 0)/100,velLow=0,velHigh=1.01,layer=0))

def prepare(pair):
    index,s=pair; name=f'{s["family"]}-{index:03}'; target=OUT/(name+'.f32')
    receipt=OUT/(name+'.json')
    if receipt.exists() and target.exists():
        cached=json.loads(receipt.read_text())
        if cached['path']==s['path'] and hashlib.sha256(target.read_bytes()).hexdigest()==cached['sha256']: return cached
    raw=fetch(s['source'],s['path']); sourcefile=OUT/(name+'.wav');sourcefile.write_bytes(raw)
    data=subprocess.check_output(['ffmpeg','-v','error','-i',str(sourcefile),'-ac','1','-ar','32000','-f','f32le','-'])
    x=np.frombuffer(data,dtype='<f4').copy(); x-=np.mean(x)
    start=max(0,int(np.flatnonzero(abs(x)>max(abs(x))*.002)[0])-16)
    x=x[start:start+32000*6];x*=.85/max(abs(x))
    x[:16]*=np.arange(16)/16;x[-384:]*=np.linspace(1,0,384)
    target.write_bytes(x.astype('<f4').tobytes());sourcefile.unlink()
    repo,revision=SOURCES[s['source']]
    result=s|dict(id=name,repository=repo,revision=revision,license='CC0-1.0',
                  sourceSha256=hashlib.sha256(raw).hexdigest(),sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
                  seconds=len(x)/32000,onsetTrimFrames=start)
    receipt.write_text(json.dumps(result));return result

for source in SOURCES:
    licence=fetch(source,'LICENSE');assert b'CC0 1.0 Universal' in licence
    (OUT/('LICENSE-'+source)).write_bytes(licence)
print(f'Preparing {len(specs)} recordings',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: files=list(pool.map(prepare,enumerate(specs)))
(OUT/'sources.json').write_text(json.dumps(dict(sampleRate=32000,processing='Mono float PCM; DC and silence trim, peak .85, 6-second maximum natural decay, edge fades. Source tuning retained. Two independent takes per zone.',files=files),indent=2)+'\n')
print('Prepared',len(files),'recordings',flush=True)
