import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';
import {referencePlan,referenceBasePlan,referenceChart,referenceScore} from '../src/audio/reference-performances.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {STYLE_PERFORMANCES} from '../src/audio/style-performance-vocabulary.js';
const settings=(id,extra={})=>{const c=referenceChart(id);return {...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,key:c.key,beats:c.beats,progression:true,template:'custom',customProgression:normalizeCustomProgression(c.progression),sequenceActivity:'featured',...extra};};
const rows=(score,track)=>score[track].flatMap((es,grid)=>es.map(e=>({grid,...e})));

test('every style has varied eight-bar phrases, breathing space and developed chord parts without mutating its reference or cached score',()=>{
 assert.deepEqual([...Object.keys(STYLE_PERFORMANCES),'blues','legatoFusion'].sort(),Object.keys(BACKING_STYLES).sort());
 const fingerprints=new Set();
 for(const id of Object.keys(BACKING_STYLES)){
  const s=settings(id),source=JSON.stringify(referenceScore(id)),base=referenceBasePlan(s),snapshot=JSON.stringify(base.score);
  const score=referencePlan(s).score,b=score.beats*12,n=score.developmentBeats*12;
  assert.equal(score.performanceStudy.style,id);assert.equal(score.performanceStudy.phraseBars,8);
  const rhythms=Array.from({length:8},(_,i)=>score.sequence.slice(i*b,(i+1)*b).flat().map(e=>[e.at,e.duration]));
  assert.ok(new Set(rhythms.map(JSON.stringify)).size>=6,id+' varies the audible rhythm');fingerprints.add(JSON.stringify(rhythms));
  const phrases=rows(score,'sequence');assert.ok(phrases.every(e=>e.motifId===id+':conversation'));
  assert.ok(phrases.some(e=>e.phraseGesture==='call')&&phrases.some(e=>e.phraseGesture==='answer'));
  const occupied=new Uint8Array(score.sequence.length);
  for(const e of phrases)for(let g=e.grid;g<Math.min(occupied.length,e.grid+e.duration*12);g++)occupied[g]=1;
  assert.ok(occupied.filter(v=>!v).length>occupied.length*.2,id+' leaves actual rests');
  const passes=Array.from({length:4},(_,i)=>JSON.stringify(rows({...score,comping:score.comping.slice(i*n,(i+1)*n)},'comping').map(e=>[e.grid,e.duration,e.notes])));
  assert.ok(new Set(passes).size>=3,id+' chordal development');assert.ok(score.comping.flat().every(e=>['damped','ringing','swell'].includes(e.articulation)));
  const supporting=referencePlan({...s,sequenceActivity:'supporting'}).score;
  assert.ok(supporting.sequence.flat().length<phrases.length,id+' respects supporting activity');
  if(!STYLE_PERFORMANCES[id]?.ostinato)assert.ok(supporting.interaction.chordReplies>0,id+' audible lead gaps admit replies');
  if(score.performanceStudy.version>=2)for(const e of rows(supporting,'comping').filter(e=>e.conversation==='reply')){
   for(let g=e.grid;g<Math.min(supporting.sequence.length,e.grid+e.duration*12);g++)assert.equal(supporting.sequence[g].length,0,id+' reply ends before melodic re-entry');
  }
  assert.equal(JSON.stringify(base.score),snapshot,id+' cached composition untouched');assert.equal(JSON.stringify(referenceScore(id)),source,id+' source untouched');
 }
 assert.equal(fingerprints.size,20,'styles have individual rhythmic phrases');
});

test('native groove identities survive phrase development: skank, son, samba, 6/8, 12/8, swing and rock',()=>{
 const reggae=referencePlan(settings('reggae')).score;
 for(const e of rows(reggae,'comping'))assert.ok([.5,1.5,2.5,3.5].includes(e.at),'skank remains on offbeats');
 for(const e of rows(reggae,'drums').filter(e=>e.name==='kick'))assert.equal(e.at,2,'one-drop retained');
 const son=referencePlan(settings('latin')).score;
 for(const e of rows(son,'comping'))assert.ok((e.bar%2?[0,1,2.5,3.5]:[.5,1.5,2.5,3.5]).includes(e.at),'two-bar guajeo stays in phase');
 for(let bar=0;bar<son.bars;bar++)assert.deepEqual(son.drums.slice(bar*48,(bar+1)*48).flat().filter(e=>e.name==='clave').map(e=>e.at),bar%2?[0,1.5,3]:[1,2]);
 for(const id of ['samba','bossa','afroCuban68','funk','motown']){
  const score=referencePlan(settings(id)).score;assert.equal(score.interaction.collisionsRemoved,0,id+' defining ostinato retained');
  assert.ok(score.bass.flat().some(e=>e.performanceTouch));
 }
 const six=referencePlan(settings('afroCuban68')).score;assert.equal(six.beats,3);
 assert.ok(rows(six,'comping').every(e=>Number.isInteger(e.at*2)));
 const soul=referencePlan(settings('slowSoul128')).score;
 for(const track of ['sequence','comping'])assert.ok(rows(soul,track).every(e=>Math.abs(e.at*3-Math.round(e.at*3))<1e-6),'triplet grid');
 const jazz=referencePlan(settings('traditionalJazz')).score;assert.ok(jazz.comping.flat().some(e=>e.notes.length===2),'guide-tone shells');
 const rock=referencePlan(settings('hardRock')).score;
 assert.ok(rock.comping.flat().every(e=>new Set(e.notes.map(n=>n%12)).size===2),'power voicings retain root/fifth instead of added thirds');
 assert.ok(rock.comping.flat().some(e=>e.articulation==='ringing')&&rock.comping.flat().some(e=>e.articulation==='damped'));
});

test('held open parts respect split-bar changes, short beat loops and written bass notes',()=>{
 for(const id of ['neoSoul','ballad','modernStraightJazz','slowSoul128']){
  const custom=normalizeCustomProgression({name:'Split changes',steps:[{root:0,chord:'min9',mode:'dorian',beats:2,bass:7},{root:1,chord:'maj7',mode:'lydian',beats:1},{root:6,chord:'dom7',mode:'mixolydian',beats:4}]});
  const s=settings(id,{key:0,customProgression:custom,loopEnabled:true,loopUnit:'beats',loopBeatStart:0,loopBeatEnd:6});
  const score=referencePlan(s).score;assert.equal(score.chartBeats,7);
  assert.ok(rows(score,'comping').every(e=>e.duration>0&&e.notes.every(Number.isFinite)));
  const bass=score.bass.slice(0,9).flat().find(e=>!e.anticipation);assert.ok(bass);assert.equal(bass.midi%12,7,id+' written G bass');
  // Pitch holds may cross a boundary only while every held pitch is allowed.
  const {steps}=custom;const pcs=[[0,2,3,5,7,9,10],[1,3,5,7,8,10,0],[6,8,10,11,1,3,4]];
  const harmony=beat=>{let t=beat%7;for(let i=0;i<steps.length;i++){if(t<steps[i].beats)return pcs[i];t-=steps[i].beats;}return pcs[0];};
  for(const track of ['sequence','comping'])for(const e of rows(score,track))for(let tick=0;tick<Math.ceil(e.duration*12)-1;tick++){
   const allowed=harmony((e.grid+tick)/12);for(const n of e.notes||[e.midi])assert.ok(allowed.includes(n%12),id+' '+track+' held across a change');
  }
 }
});
