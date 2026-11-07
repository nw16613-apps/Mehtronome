import test from 'node:test';import assert from 'node:assert/strict';
import {styleSequenceStep} from '../src/audio/style-phrases.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';import {Engine} from '../src/audio/engine.js';import {harmonyAt,characteristicNotes} from '../src/audio/music.js';import {CompingInstrument} from '../src/audio/comping.js';
test('developed melodies and cadences use only the current chord and scale through real changes',()=>{
 for(const id of ['traditionalJazz','blues','latin','neoSoul','reggae','legatoFusion']){
  const e=new Engine(8000);e.configure({...BACKING_STYLES[id].settings,bpm:120,beats:4,key:9,mode:'major',chord:'maj7',sequenceActivity:'featured',sequence:true,comping:true,countIn:false,click:0,harmony:0,progression:true,template:'major251essential'});e.reset();const notes=[];e.render(new Float32Array(64000),undefined,null,null,n=>notes.push(n));assert.ok(notes.some(n=>n.step===1),id);
  for(const n of notes){const h=harmonyAt(e.settings,n.step),allowed=[...h.scalePcs,...h.chordPcs];assert.ok(allowed.includes(n.midi%12),id);if(n.target){assert.ok([...h.chordPcs,...characteristicNotes(h).map(c=>c.pc)].includes(n.midi%12),id);}}
 }
});
test('guitar bend expressions settle on the scheduled target pitch',()=>{
 const i=new CompingInstrument(8000);i.installKit({electricGuitar63:Float32Array.from({length:16000},(_,n)=>Math.sin(n*.2)*.2)});i.strike([64],1,.4,120,0,0,null,'sequence','bluesGuitar',0,null,'bend');const v=i.voices.find(v=>v.active),target=2**((64-62.9982)/12);assert.ok(v.sampleIncrement<target);for(let n=0;n<480;n++)assert.ok(Number.isFinite(i.render()));assert.ok(Math.abs(v.sampleIncrement-target)<1e-10);
});
