import test from 'node:test';import assert from 'node:assert/strict';
import {styleSequenceStep} from '../src/audio/style-phrases.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';import {Engine} from '../src/audio/engine.js';import {harmonyAt,characteristicNotes} from '../src/audio/music.js';import {CompingInstrument} from '../src/audio/comping.js';
function phrase(id,activity='countermelody',bars=16,extra={}){const s={...BACKING_STYLES[id].settings,beats:BACKING_STYLES[id].suggestedBeats||4,sequenceActivity:activity,backingVariation:1,comping:true,compingVolume:.25,...extra},out=[];for(let grid=0;grid<bars*s.beats*s.sequenceRate;grid++){const n=styleSequenceStep(s,grid,7);if(n)out.push({...n,grid});}return {s,out};}
test('all styles have complete phrases, graded activity and deliberate rests without a fourth-bar gate',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  const a=phrase(id,'supporting',4),b=phrase(id,'countermelody',4),c=phrase(id,'featured',4);assert.ok(a.out.length>=5,id);assert.ok(b.out.length>=8&&b.out.length>a.out.length,id);assert.ok(c.out.length>b.out.length,id);assert.ok(new Set(b.out.map(n=>n.phraseId)).size>=2,id);assert.ok(new Set(b.out.map(n=>n.phraseId)).size<4,id);
  for(const {s,out}of [a,b,c]){for(const pid of new Set(out.map(n=>n.phraseId))){const notes=out.filter(n=>n.phraseId===pid);assert.ok(notes.length>=3&&notes.length<=6,id);assert.equal(notes[0].target,'guide');assert.equal(notes.at(-1).target,'resolve');assert.ok(notes.every(n=>n.duration>0&&n.local<s.beats*s.sequenceRate));}assert.equal(new Set(out.map(n=>n.grid)).size,out.length,id);}
 }
});
test('sixteen-bar themes develop, answer and return predictably; stable mode preserves its theme',()=>{
 for(const id of ['popRock','traditionalJazz','reggae','legatoFusion']){
  const {out}=phrase(id),at=pid=>out.filter(n=>n.phraseId===pid),shape=ns=>ns.map(n=>n.degree);assert.equal(at(0)[0].section,'theme');assert.equal(at(4)[0].section,'development');assert.equal(at(8)[0].section,'answer');assert.equal(at(12)[0].section,'return');assert.notDeepEqual(shape(at(0)),shape(at(8)),id);assert.deepEqual(shape(at(0)).slice(0,1),shape(at(4)).slice(0,1),id);
  const stable=phrase(id,'countermelody',12,{sequenceDevelopment:'stable'}).out;assert.deepEqual(shape(stable.filter(n=>n.phraseId===0)),shape(stable.filter(n=>n.phraseId===8)),id);assert.deepEqual(phrase(id).out,out);
 }
});
test('comping shifts phrase placement without removing notes or suppressing whole bars',()=>{
 let changed=0;for(const id of Object.keys(BACKING_STYLES)){const busy=phrase(id).out,open=phrase(id,'countermelody',16,{comping:false}).out;assert.equal(busy.length,open.length,id);assert.deepEqual(busy.map(n=>n.phraseId),open.map(n=>n.phraseId),id);if(JSON.stringify(busy.map(n=>n.grid))!==JSON.stringify(open.map(n=>n.grid)))changed++;}assert.ok(changed>=12);
});
test('developed melodies and cadences use only the current chord and scale through real changes',()=>{
 for(const id of ['traditionalJazz','blues','latin','neoSoul','reggae','legatoFusion']){
  const e=new Engine(8000);e.configure({...BACKING_STYLES[id].settings,bpm:120,beats:4,key:9,mode:'major',chord:'maj7',sequenceActivity:'featured',sequence:true,comping:true,countIn:false,click:0,harmony:0,progression:true,template:'major251essential'});e.reset();const notes=[];e.render(new Float32Array(64000),undefined,null,null,n=>notes.push(n));assert.ok(notes.some(n=>n.step===1),id);
  for(const n of notes){const h=harmonyAt(e.settings,n.step),allowed=[...h.scalePcs,...h.chordPcs];assert.ok(allowed.includes(n.midi%12),id);if(n.target){assert.ok([...h.chordPcs,...characteristicNotes(h).map(c=>c.pc)].includes(n.midi%12),id);}}
 }
});
test('blues phrase endings have a short bend that settles on the scheduled target pitch',()=>{
 const i=new CompingInstrument(8000);i.installKit({electricGuitar63:Float32Array.from({length:16000},(_,n)=>Math.sin(n*.2)*.2)});i.strike([64],1,.4,120,0,0,null,'sequence','bluesGuitar',0,null,'bend');const v=i.voices.find(v=>v.active),target=2**((64-62.9982)/12);assert.ok(v.sampleIncrement<target);for(let n=0;n<480;n++)assert.ok(Number.isFinite(i.render()));assert.ok(Math.abs(v.sampleIncrement-target)<1e-10);
});
