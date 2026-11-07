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
  const {out}=phrase(id),first=section=>{const notes=out.filter(n=>n.section===section);return notes.filter(n=>n.phraseId===notes[0].phraseId);},shape=ns=>ns.map(n=>n.degree);assert.equal(first('theme')[0].section,'theme');assert.equal(first('development')[0].section,'development');assert.equal(first('answer')[0].section,'answer');assert.equal(first('return')[0].section,'return');assert.notDeepEqual(shape(first('theme')),shape(first('answer')),id);assert.deepEqual(shape(first('theme')).slice(0,1),shape(first('development')).slice(0,1),id);
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
test('guitar bend expressions settle on the scheduled target pitch',()=>{
 const i=new CompingInstrument(8000);i.installKit({electricGuitar63:Float32Array.from({length:16000},(_,n)=>Math.sin(n*.2)*.2)});i.strike([64],1,.4,120,0,0,null,'sequence','bluesGuitar',0,null,'bend');const v=i.voices.find(v=>v.active),target=2**((64-62.9982)/12);assert.ok(v.sampleIncrement<target);for(let n=0;n<480;n++)assert.ok(Number.isFinite(i.render()));assert.ok(Math.abs(v.sampleIncrement-target)<1e-10);
});
test('default melodic rhythms vary their internal spacing, note lengths and phrase entries in every style',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  const {out}=phrase(id,'countermelody',32,{comping:false}),groups=[...new Set(out.map(n=>n.phraseId))].map(pid=>out.filter(n=>n.phraseId===pid));
  const spacing=notes=>notes.slice(1).map((n,i)=>n.local-notes[i].local).join(',');
  assert.ok(new Set(groups.map(spacing)).size>=4,id+' changes intervals between attacks, not just the starting offset');
  assert.ok(new Set(groups.map(ns=>ns.length)).size>=2,id+' changes phrase lengths');
  assert.ok(new Set(out.map(n=>n.duration.toFixed(3))).size>=5,id+' uses short and sustained notes');
  const presence=Array.from({length:4},(_,section)=>[...new Set(out.filter(n=>n.phraseId>=section*4&&n.phraseId<section*4+4).map(n=>n.phraseId%4))].join(','));assert.ok(new Set(presence).size>=2,id+' varies breathing bars');
  for(let i=2;i<groups.length;i++)assert.ok(!(spacing(groups[i])===spacing(groups[i-1])&&spacing(groups[i-1])===spacing(groups[i-2])),id+' avoids three identical consecutive rhythmic phrases');
 }
});
test('legato phrases alternate uneven connected groups, held notes and breaths while retaining stable playback on request',()=>{
 const {s,out}=phrase('legatoFusion','countermelody',32,{comping:false}),phrases=[...new Set(out.map(n=>n.phraseId))].map(pid=>out.filter(n=>n.phraseId===pid));
 const gaps=phrases.flatMap(ns=>ns.slice(1).map((n,i)=>(n.local-ns[i].local)/s.sequenceRate));assert.ok(new Set(gaps).size>=3);assert.ok(out.some(n=>n.duration>1));assert.ok(phrases.some(ns=>ns.slice(1).some((n,i)=>ns[i].duration<(n.local-ns[i].local)/s.sequenceRate)));
 for(const extra of [{sequenceDevelopment:'stable'},{backingVariation:0}]){const events=phrase('legatoFusion','countermelody',12,{comping:false,...extra}).out,signature=bar=>events.filter(n=>n.phraseId===bar).map(n=>[n.local,n.duration]);assert.deepEqual(signature(0),signature(8));}
});
