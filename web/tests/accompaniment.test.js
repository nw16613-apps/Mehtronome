import {test} from 'node:test';import assert from 'node:assert/strict';
import {Engine,DEFAULTS} from '../src/audio/engine.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {prepareAccompaniment,ACCOMPANIMENT_PARTS} from '../src/audio/accompaniment.js';import {compingChordVoicings} from '../src/audio/comping.js';
import {harmonyAt,CHORDS} from '../src/audio/music.js';import {recommendedMode} from '../src/practice/custom-progression.js';
function engine(style,extra={}){const e=new Engine(8000);e.configure({...BACKING_STYLES[style].settings,bpm:137,beats:4,comping:true,bass:false,drums:false,sequence:false,click:0,harmony:0,countIn:false,backingHumanize:0,...extra});e.reset();return e;}
test('all chord qualities and roots map every part role to current chord/mode pitches within the instrument range',()=>{
 for(const chord of Object.keys(CHORDS))for(const key of [0,4,9]){
  const h=harmonyAt({...DEFAULTS,key,chord,mode:recommendedMode(chord)}),v=compingChordVoicings(h,h,'extensions');
  for(const style of Object.keys(ACCOMPANIMENT_PARTS)){const p=prepareAccompaniment(h,v,style);assert.ok(p);for(const option of p.options)for(const notes of Object.values(option))for(const midi of notes){assert.ok(midi>=(style==='hardRock'?40:48)&&midi<=84,style+' '+midi);assert.ok(p.allowed.has(midi%12),chord+' '+style);}}
 }
});
test('montuno contains octaves and upper fragments; funk has single-note and dyad attacks',()=>{
 for(const style of ['latin','funk']){const e=engine(style),events=[];e.render(new Float32Array(32000),undefined,null,null,undefined,new Float32Array(32000),n=>events.push(n));assert.ok(events.some(n=>n.notes.length===1));assert.ok(events.some(n=>n.notes.length===2));assert.ok(events.every(n=>n.notes.length<3));if(style==='latin')assert.ok(events.some(n=>n.role==='rootOctave'&&n.notes[1]-n.notes[0]===12));}
});
test('neo-soul holds its backing voices while the inner voice moves independently',()=>{
 const e=engine('neoSoul',{bpm:120});e.render(new Float32Array(8001));
 const pad=e.comping.voices.filter(v=>v.active&&v.group==='pad'),inner=e.comping.voices.filter(v=>v.active&&v.group==='inner');
 assert.ok(pad.length>=2);assert.ok(pad.every(v=>v.age<v.releaseAt));assert.ok(inner.some(v=>v.midi===e.accompanimentPool.options[0].innerColour[0]));
});
test('new figures follow actual chord changes and are identical across render block sizes',()=>{
 for(const style of Object.keys(BACKING_STYLES)){
  const settings={progression:true,template:'major251essential'},whole=engine(style,settings),blocks=engine(style,settings),size=64000,expected=new Float32Array(size),actual=new Float32Array(size),a=[],b=[];
  whole.render(new Float32Array(size),undefined,null,null,undefined,expected,n=>a.push(n));
  for(let offset=0;offset<size;offset+=127){const end=Math.min(size,offset+127);blocks.render(new Float32Array(end-offset),undefined,null,null,undefined,actual.subarray(offset,end),n=>b.push(n));}
  assert.deepEqual(actual,expected,style);assert.deepEqual(b,a,style);assert.ok(a.some(n=>n.step!==0));
  for(const note of a){const h=harmonyAt(whole.settings,note.step);assert.ok(note.notes.every(midi=>[...h.chordPcs,...h.scalePcs].includes(midi%12)),style);}
 }
});
test('pitch maps are reused through fader edits and comping interaction retains developed melodic phrases',()=>{
 for(const style of ['latin','funk','popRock']){
  const busy=engine(style,{bpm:120,sequence:true}),open=engine(style,{bpm:120,sequence:true,comping:false}),a=[],b=[],cache=busy.cachedAccompaniment;
  busy.render(new Float32Array(64000),undefined,null,null,n=>a.push(n));open.render(new Float32Array(64000),undefined,null,null,n=>b.push(n));assert.ok(a.length>=8&&a.length===b.length,style);assert.ok(a.every(n=>n.durationBeats>0),style);busy.configure({compingVolume:.15});assert.equal(busy.cachedAccompaniment,cache);
 }
});
