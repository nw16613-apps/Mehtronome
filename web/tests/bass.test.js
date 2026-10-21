import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SampledBass} from '../src/audio/bass.js';
import {BASS_SAMPLE_ZONES} from '../src/audio/sample-manifest.js';

const RATE=8000;
function render(bass,frames) {
  return Float32Array.from({length:frames},()=>bass.render());
}
function sine(midi,seconds=2,decay=0) {
  const frequency=440*2**((midi-69)/12);
  return Float32Array.from({length:Math.round(RATE*seconds)},(_,i)=>
    .7*Math.sin(2*Math.PI*frequency*i/RATE)*Math.exp(-decay*i/RATE));
}
function kitFor(makeSample) {
  return Object.fromEntries(BASS_SAMPLE_ZONES.map(zone=>[zone.id,makeSample(zone)]));
}
function rms(samples) { return Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length); }

// The probe sample's silent lead-in distinguishes real PCM playback from an
// oscillator while its isolated recorded event exercises the interpolation path.
test('bass plays installed recording content instead of the oscillator fallback',()=>{
  assert.ok(BASS_SAMPLE_ZONES.length>=1);
  const zone=BASS_SAMPLE_ZONES[0];
  const recording=new Float32Array(1000);recording.fill(.7,100,120);
  const bass=new SampledBass(RATE,{[zone.id]:recording});
  bass.noteOn(zone.rootMidi,.2,1,'fifths');
  const sampled=render(bass,150);
  assert.ok(sampled.subarray(0,100).every(value=>value===0));
  assert.ok(sampled.subarray(100,120).some(value=>value>.2));
  const fallback=new SampledBass(RATE);fallback.noteOn(zone.rootMidi,.2);
  assert.ok(render(fallback,100).some(value=>Math.abs(value)>.01));
});

test('nearest recorded roots transpose to the requested bass pitch without changing the clock',()=>{
  const kit=kitFor(zone=>sine(zone.rootMidi));
  for (const midi of [28,31,36,43,47,54,59]) {
    const bass=new SampledBass(RATE,kit);
    const voice=bass.noteOn(midi,1,1,'funk');
    const expectedDistance=Math.min(...BASS_SAMPLE_ZONES.map(zone=>Math.abs(zone.rootMidi-midi)));
    assert.equal(Math.abs(voice.rootMidi-midi),expectedDistance);
    const audio=render(bass,RATE);
    let crossings=0;
    for (let i=RATE/4+1;i<3*RATE/4;i++) if(audio[i-1]<=0&&audio[i]>0) crossings++;
    const measured=crossings/.5,expected=440*2**((midi-69)/12);
    assert.ok(Math.abs(measured-expected)<3,`${midi}: ${measured}Hz vs ${expected}Hz`);
    assert.equal(voice.age,RATE);
  }
});

test('natural sample dynamics survive the sustain instead of gaining a second synthetic pluck decay',()=>{
  const zone=BASS_SAMPLE_ZONES[0];
  const recording=Float32Array.from({length:RATE*2},(_,index)=>index<RATE?.4:.1);
  const bass=new SampledBass(RATE,{[zone.id]:recording});
  bass.noteOn(zone.rootMidi,2,1,'roots');
  const audio=render(bass,RATE*2-100);
  const early=rms(audio.subarray(1000,2000)),late=rms(audio.subarray(10000,11000));
  assert.ok(early>.35);
  assert.ok(late/early>.23&&late/early<.27);
});

test('articulations preserve the same sampled pitch with different attack, tone and note releases',()=>{
  const zone=BASS_SAMPLE_ZONES[0],recording=sine(zone.rootMidi);
  const signatures=[];
  for (const style of ['roots','fifths','walk','bossa','funk']) {
    const bass=new SampledBass(RATE,{[zone.id]:recording});
    const voice=bass.noteOn(zone.rootMidi,.1,1,style);
    assert.equal(voice.gate,800);
    const audio=render(bass,2000);
    signatures.push([rms(audio.subarray(0,100)),rms(audio.subarray(1500)),voice.releaseDecay]);
  }
  assert.equal(new Set(signatures.map(JSON.stringify)).size,5);
});

test('gates and retriggers release smoothly, remain bounded and eventually reach silence',()=>{
  const kit=kitFor(zone=>sine(zone.rootMidi,2));
  const bass=new SampledBass(RATE,kit),audio=[];
  for (let note=0;note<16;note++) {
    bass.noteOn(36+(note%5),.075,1.2,'funk');
    audio.push(...render(bass,200));
  }
  const release=render(bass,RATE*2);
  for (const value of [...audio,...release])assert.ok(Number.isFinite(value)&&Math.abs(value)<1);
  assert.ok(release.subarray(RATE).every(value=>Math.abs(value)<1e-5));
  // A held waveform doesn't reset immediately to zero when the next note starts.
  const sustained=new SampledBass(RATE,kit);
  sustained.noteOn(36,1);render(sustained,400);
  const before=sustained.render();sustained.noteOn(38,1);const after=sustained.render();
  assert.ok(Math.abs(after-before)<.15);
});

test('recording endpoints fade before EOF and clear or new kit installation stops all old notes',()=>{
  const zone=BASS_SAMPLE_ZONES[0],recording=new Float32Array(1000).fill(.7);
  const bass=new SampledBass(RATE,{[zone.id]:recording});
  bass.noteOn(zone.rootMidi,1);
  const audio=render(bass,1100);
  assert.ok(audio[990]<audio[900]*.25);
  assert.ok(audio.subarray(1000).every(value=>value===0));
  bass.noteOn(zone.rootMidi,1);render(bass,100);bass.clear();
  assert.ok(render(bass,100).every(value=>value===0));
  bass.noteOn(zone.rootMidi,1);render(bass,100);bass.installKit(null);
  assert.ok(render(bass,100).every(value=>value===0));
  assert.equal(bass.zones.length,0);
});

test('round robin alternates available takes and reset is deterministic',()=>{
  const byRoot=new Map();
  for (const zone of BASS_SAMPLE_ZONES) {
    const list=byRoot.get(zone.rootMidi)||[];list.push(zone);byRoot.set(zone.rootMidi,list);
  }
  const group=[...byRoot.values()].find(zones=>zones.length>1);
  const kit=kitFor((zone)=>new Float32Array(1000).fill((BASS_SAMPLE_ZONES.indexOf(zone)+1)/100));
  const zones=group||[BASS_SAMPLE_ZONES[0]],bass=new SampledBass(RATE,kit);
  const first=bass.noteOn(zones[0].rootMidi,.1).sample;
  const second=bass.noteOn(zones[0].rootMidi,.1).sample;
  if (group)assert.notEqual(first,second);else assert.equal(first,second);
  bass.clear();assert.equal(bass.noteOn(zones[0].rootMidi,.1).sample,first);
});

test('invalid note requests stay silent and gain is safely bounded',()=>{
  const bass=new SampledBass(RATE,kitFor(zone=>sine(zone.rootMidi)));
  for (const [midi,length] of [[NaN,1],[Infinity,1],[36,0],[36,-1],[36,NaN]]) {
    assert.equal(bass.noteOn(midi,length),null);
  }
  assert.ok(render(bass,100).every(value=>value===0));
  bass.noteOn(36,1,Infinity);assert.ok(render(bass,100).every(value=>value===0));
  bass.noteOn(36,1,100);assert.ok(render(bass,1000).every(value=>Number.isFinite(value)&&Math.abs(value)<1));
});
