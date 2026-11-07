import test from 'node:test';import assert from 'node:assert/strict';import {readSampleBank} from '../scripts/read-sample-bank.mjs';import {Rhythm} from '../src/audio/rhythm.js';import {DRUM_KITS} from '../src/audio/instrumentation.js';import {BACKING_STYLES,MELODIC_TONES} from '../src/practice/backing-styles.js';import {CompingInstrument} from '../src/audio/comping.js';import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';import {Engine} from '../src/audio/engine.js';
const rate=16000,kit=await readSampleBank(rate);
function energy(piece,profile,gain,positions){const r=new Rhythm(rate,kit),frames=rate*8,onsets=new Set(positions.map(t=>Math.round(t*rate)));let power=0,hits=0;for(let n=0;n<frames;n++){if(onsets.has(n%(2*rate))&&(piece!=='crash'||n===0))r.hitDrum(piece,gain,n,0,0,0,()=>hits++,profile);r.render(true,false);power+=r.drums*r.drums;}assert.ok(hits,piece+' '+profile);return Math.sqrt(power/frames);}
test('repeating cymbals stay behind the reference backbeat in every installed kit',()=>{
 for(const profile of Object.keys(DRUM_KITS)){
  const snare=energy('snare',profile,.65,[.5,1.5]);
  for(const [piece,gain,onsets]of [['ride',.31,[0,.25,.5,.75,1,1.25,1.5,1.75]],['rideBell',.25,[0,1]],['flatRide',.22,[0,.5,1,1.5]],['hat',.24,[0,.25,.5,.75,1,1.25,1.5,1.75]],['hatOpen',.19,[1.75]],['hatPedal',.13,[.5,1.5]],['crash',.25,[0]]])assert.ok(energy(piece,profile,gain,onsets)<snare*.85,profile+' '+piece);
 }
});
test('cymbal calibration preserves kick, snare and existing hat gains and accented sample choice',()=>{
 const r=new Rhythm(rate,kit);for(const [piece,gain]of [['kick',.7],['snare',.65]]){r.hitDrum(piece,gain,0,0,0,0,()=>{},'rock');assert.equal(r.drumVoices[(r.drumCursor-1)%24].gain,gain);}
 r.hitDrum('hat',.3,0,0,0,0,()=>{},'rock');assert.equal(r.drumVoices[(r.drumCursor-1)%24].gain,.3*.55);let event;r.hitDrum('ride',.31,0,0,0,0,e=>event=e,'jazz');assert.match(event.sampleId,/jazzRideAccent/);
});
test('every style has a different melodic source family from its chord instrument and loads the right bank',()=>{
 const instrument=new CompingInstrument(rate),family=tone=>instrument.shapes[tone].bank||tone;
 for(const [id,{settings:s,parts}]of Object.entries(BACKING_STYLES)){
  assert.equal(s.sequenceTone,MELODIC_TONES[id]);assert.notEqual(family(s.sequenceTone),family(s.compingTone),id);assert.ok(parts['Melodic movement'].includes(' · '));const wanted=sampleNamesForSettings({...s,sequence:true,sequenceVolume:.25,drums:false,bass:false,comping:false});if(instrument.shapes[s.sequenceTone].bank)assert.ok(wanted.length>=4,id);
 }
 assert.equal(BACKING_STYLES.legatoFusion.settings.sequenceTone,'fluteLead');assert.equal(BACKING_STYLES.traditionalJazz.settings.sequenceTone,'jazzGuitar');
});
test('new melodic colours stay bounded and deterministic with recorded instruments and connected flute phrases',()=>{
 for(const id of ['traditionalJazz','fusionJazz','blues','samba','legatoFusion']){
  const s={...BACKING_STYLES[id].settings,sequenceActivity:'featured',bpm:120,beats:4,sequence:true,comping:true,drums:true,bass:true,click:0,harmony:0,countIn:false};
  function play(block){const e=new Engine(rate);e.installDrumKit(kit);e.configure(s);e.reset();const notes=[],dry=new Float32Array(rate*8);for(let at=0;at<dry.length;at+=block){const end=Math.min(dry.length,at+block);e.render(new Float32Array(end-at),undefined,null,null,n=>notes.push(n),dry.subarray(at,end));}return {notes,dry};}
  const a=play(rate*8),b=play(127);assert.deepEqual(a.dry,b.dry,id);assert.deepEqual(a.notes,b.notes,id);assert.ok(a.notes.every(n=>n.tone===s.sequenceTone));assert.ok(a.dry.every(n=>Number.isFinite(n)&&Math.abs(n)<=1));
 }
});
