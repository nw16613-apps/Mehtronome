import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BACKING_STYLES,STYLE_CONTROLS,backingStyleId,backingStyleForControls} from '../src/practice/backing-styles.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {CompingInstrument,COMPING_PATTERNS,COMPING_TONES} from '../src/audio/comping.js';
import {DRUM_GROOVES,BASS_PATTERNS} from '../src/audio/rhythm.js';
import {SEQUENCE_ROLES,SEQUENCE_PATTERNS} from '../src/audio/sequence.js';
import {exportPresets,importPresets} from '../src/practice/presets.js';
test('styles provide distinct complete arrangements with valid sound and pattern choices, without taking over chart or mixer settings',()=>{
 assert.equal(Object.keys(BACKING_STYLES).length,21);
 for(const [id,{settings:s}]of Object.entries(BACKING_STYLES)){
  assert.ok(DRUM_GROOVES[s.drumGroove]);assert.ok(BASS_PATTERNS[s.bassPattern]);assert.ok(COMPING_PATTERNS[s.compingPattern]);assert.ok(COMPING_TONES[s.compingTone]);assert.ok(SEQUENCE_ROLES[s.sequenceRole]);assert.ok(SEQUENCE_PATTERNS[s.sequencePattern]);
  for(const field of Object.keys(STYLE_CONTROLS))assert.notEqual(s[field],undefined,id+' '+field);
  for(const field of ['bpm','key','chord','mode','template','beats','customProgression','mutedChannels','drumsVolume','bassVolume','compingVolume','sequenceVolume','clickSwing','countIn'])assert.equal(s[field],undefined,id+' '+field);
 }
 assert.equal(new Set(Object.values(BACKING_STYLES).map(s=>JSON.stringify(s.settings))).size,21);
});
test('legacy instrument presets choose a matching style and explicit style selections round-trip through saved presets',()=>{
 assert.equal(backingStyleForControls({'drum-groove':'swing','bass-pattern':'walk'}),'traditionalJazz');
 assert.equal(backingStyleForControls({'drum-groove':'shuffle'}),'blues');
 assert.equal(backingStyleForControls({'backing-style':'motown','drum-groove':'swing'}),'motown');
 assert.equal(backingStyleId('unknown'),'popRock');
 const preset={id:'style',name:'Motown mix',progression:true,controls:{'backing-style':'motown','mute-bass':true,'comping-volume':'28',bpm:'115'}};
 assert.deepEqual(importPresets(exportPresets([preset])).items,[preset]);
});
test('bright comping has a faster attack, more upper-partial energy and a shorter release than warm tine',()=>{
 const measure=tone=>{
  const instrument=new CompingInstrument(48000);instrument.strike([60],.2,.7,120,0,0,undefined,'comping',tone);
  const samples=Array.from({length:24000},()=>instrument.render()),power=(from,to)=>samples.slice(from,to).reduce((sum,v)=>sum+v*v,0)/(to-from);
  let energy=0,edge=0;for(let i=1;i<4800;i++){energy+=samples[i]**2;edge+=(samples[i]-samples[i-1])**2;}
  assert.ok(samples.every(Number.isFinite));return {attack:power(0,480),tail:power(14400,19200),brightness:edge/energy};
 };
 const warm=measure('warmTine');for(const tone of ['brightKeys','brightTine','clav']){const fresh=measure(tone);assert.ok(fresh.attack>warm.attack,tone);assert.ok(fresh.tail<warm.tail*.25,tone);assert.ok(fresh.brightness>warm.brightness*1.5,tone);}
});
test('each style produces its own repeatable band phrase and adapts over chord changes in common and odd meters',()=>{
 const signatures=[];
 for(const [id,style]of Object.entries(BACKING_STYLES))for(const beats of [3,4,5]){
  const engine=new Engine(8000);engine.configure({...DEFAULTS,...style.settings,drums:true,bass:true,comping:true,sequence:true,countIn:false,bpm:120,beats,key:9,mode:'dorian',chord:'min7',progression:true,template:'major251essential',click:0,harmony:0});engine.reset();
  const events=[],melody=[],audio=new Float32Array(8000*beats*2);
  engine.render(new Float32Array(audio.length),undefined,null,null,e=>melody.push(e),audio,e=>events.push(e));
  assert.ok(events.some(e=>e.type==='bass'),id);assert.ok(events.some(e=>e.type==='comping'),id);assert.ok(melody.length,id);
  assert.ok(events.some(e=>e.step===1),id);assert.ok(audio.every(v=>Number.isFinite(v)&&Math.abs(v)<=1));
  if(beats===4)signatures.push(JSON.stringify(events.map(e=>[e.type,e.sample,e.midi,e.notes,e.duration])));
 }
 assert.equal(new Set(signatures).size,21);
});
