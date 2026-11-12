import {test} from 'node:test';import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';import {SampledBass} from '../src/audio/bass.js';import {CompingInstrument} from '../src/audio/comping.js';import {Sequence} from '../src/audio/sequence.js';
import {BASS_SAMPLE_ZONES} from '../src/audio/sample-map.js';import {GUITAR_TUNINGS,normalizeGuitarTuning,guitarTuningRatio} from '../src/audio/guitar-tuning.js';
import {BACKING_STYLES} from '../src/practice/backing-styles.js';
const rate=12000,ratio=guitarTuningRatio(-1),sine=(midi,seconds=2)=>Float32Array.from({length:rate*seconds},(_,i)=>.4*Math.sin(i*2*Math.PI*440*2**((midi-69)/12)/rate));
// Measure actual output pitch, rather than reading a frequency property.
function peak(samples,low,high){let best=0,energy=-Infinity;const data=samples.subarray(2400,8400);for(let hz=low;hz<=high;hz+=.25){const k=2*Math.cos(2*Math.PI*hz/rate);let a=0,b=0;for(let i=0;i<data.length;i++){const next=data[i]*Math.sin(Math.PI*i/data.length)**2+k*a-b;b=a;a=next;}const power=a*a+b*b-k*a*b;if(power>energy){energy=power;best=hz;}}return best;}
const near=(a,b,tolerance=.7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} Hz, expected ${b} Hz`);
test('only supported uniform tunings are accepted and E-flat uses the equal-tempered semitone ratio',()=>{
 assert.equal(GUITAR_TUNINGS.length,2);assert.equal(normalizeGuitarTuning('-1'),-1);for(const value of [null,undefined,NaN,1,-12,'dropD'])assert.equal(normalizeGuitarTuning(value),0);near(ratio,2**(-1/12),1e-12);
});
test('sampled bass and modeled comping sound one semitone lower without changing note duration or written MIDI',()=>{
 const kit=Object.fromEntries(BASS_SAMPLE_ZONES.map(z=>[z.id,sine(z.rootMidi)]));
 for(const tuning of [0,-1]){
  const r=guitarTuningRatio(tuning),bass=new SampledBass(rate,kit),voice=bass.noteOn(57,1.5,.7),gate=voice.gate;
  const audio=Float32Array.from({length:rate},()=>bass.render(true,r));near(peak(audio,195,230),220*r);assert.equal(voice.midi,57);assert.equal(voice.gate,gate);assert.equal(voice.age,rate);
  const comp=new CompingInstrument(rate);comp.strike([69],4,.6,120,0,0,undefined,'comping','warmTine');const written=comp.voices.find(v=>v.active);
  const notes=Float32Array.from({length:rate},()=>comp.render(true,r));near(peak(notes,400,450),440*r);assert.equal(written.midi,69);assert.equal(written.age,rate);
 }
});
test('sampled comping and melody use the same ratio while their clocks remain fixed',()=>{
 for(const tuning of [0,-1]){
  const r=guitarTuningRatio(tuning),comp=new CompingInstrument(rate);comp.strike([69],4,.6,120,0,0,undefined,'sequence','warmTine');const v=comp.voices.find(v=>v.active);v.pcm=sine(69);v.sampleIncrement=1;v.loopStart=0;v.loopEnd=0;v.sourceGain=1;
  const audio=Float32Array.from({length:rate},()=>comp.render(true,r));near(peak(audio,400,450),440*r);assert.equal(v.age,rate);assert.equal(v.midi,69);
  const melody=new Sequence(rate);const voice=melody.voices[0];Object.assign(voice,{frequency:440,increment:440/rate,age:0,envelope:.5});
  melody.render(true,r);near(voice.phase,440/rate*r,1e-12);assert.equal(voice.age,1);
 }
});
test('pad and acoustic chord audition sound lower while the written chord remains unchanged',()=>{
 for(const tuning of [0,-1])for(const acoustic of [false,true]){
  const e=new Engine(rate);e.configure({key:9,mode:'dorian',chord:'min7',guitarTuning:tuning,countIn:false,harmony:1,click:0,padMovement:'still',padDepth:'intimate',sound:'warm'});e.audition(0,[57,69,81],acoustic);
  const audio=new Float32Array(rate);e.render(audio);near(peak(audio,195,230),220*guitarTuningRatio(tuning),acoustic?2:.7);assert.deepEqual(e.chordMidi,[57,69,81]);assert.equal(e.settings.key,9);
 }
});
test('clicks, drums and sample-clock beats are identical in every backing style',()=>{
 for(const [style,profile]of Object.entries(BACKING_STYLES)){
  const render=tuning=>{const e=new Engine(rate);e.configure({...profile.settings,backingStyle:style,guitarTuning:tuning,bpm:120,countIn:false,harmony:0,bass:false,comping:false,sequence:false,drums:true,click:1});e.reset();const beats=[],audio=new Float32Array(rate*2);e.render(audio,b=>beats.push(b));return {audio,beats};};
  assert.deepEqual(render(-1),render(0),style);
 }
});
test('live compensation preserves beat and queued chart changes, with no harmonic transposition',()=>{
 const e=new Engine(rate);e.configure({bpm:120,countIn:false,key:9,mode:'dorian',chord:'min7'});e.reset();e.render(new Float32Array(3000));const before=[e.beat,e.phase,e.sessionFrames,...e.chordMidi];
 e.requestSettings({key:2},null,1);e.updateLiveSettings({guitarTuning:-1});assert.deepEqual([e.beat,e.phase,e.sessionFrames,...e.chordMidi],before);assert.equal(e.settings.key,9);assert.equal(e.pendingSettings.settings.key,2);assert.equal(e.pendingSettings.settings.guitarTuning,-1);assert.equal(e.pitchRatio,ratio);
});
