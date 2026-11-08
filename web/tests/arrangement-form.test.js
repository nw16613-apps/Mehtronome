import {test} from 'node:test';import assert from 'node:assert/strict';
import {referenceChart,referencePlan,referenceScore,referenceBasePlan,REFERENCE_PERFORMANCES} from '../src/audio/reference-performances.js';
import {cadenceKind} from '../src/audio/arrangement-form.js';import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';import {Engine} from '../src/audio/engine.js';import {harmonyAt,progressionPositionAtBeat,CHORDS} from '../src/audio/music.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
function config(id,activity='supporting'){const c=referenceChart(id);return {...BACKING_STYLES[id].settings,...backingStyleInstruments(id),...c,backingStyle:id,template:'custom',progression:true,customProgression:normalizeCustomProgression(c.progression),extensionMorph:false,loopEnabled:false,sequenceActivity:activity,countIn:false,bpm:120,beats:c.beats,drums:true,bass:true,comping:true,sequence:true,soundLibrary:'expanded',click:0,harmony:0,backingHumanize:0};}
function chart(id,steps,activity='supporting'){const s=config(id,activity);s.key=0;s.customProgression=normalizeCustomProgression({name:'Section test',arrangedPerformance:id,steps});return s;}
const A=(root,chord,mode,beats=4,section='')=>({root,chord,mode,beats,...(section?{section}:{})});
const changes=[A(2,'min9','dorian',8,'A'),A(7,'dom13','mixolydian',4),A(0,'maj9','major',4),A(5,'min9','dorian',4,'B'),A(10,'dom13','mixolydian',4),A(0,'maj9','major',8),A(2,'min9','dorian',8,'A'),A(7,'dom13','mixolydian',4),A(0,'maj9','major',4)];
test('all twenty references default to Supporting and provide graded whole-phrase activity without changing the rhythm section',()=>{
 for(const id of Object.keys(REFERENCE_PERFORMANCES)){
  assert.equal(referenceChart(id).sequenceActivity,'supporting');const original=referenceScore(id),snapshot=JSON.stringify(original.sequence),support=referencePlan(config(id)),counter=referencePlan(config(id,'countermelody')),featured=referencePlan(config(id,'featured'));
  const count=p=>p.score.sequence.flat().length;assert.ok(count(support)>0&&count(support)<count(counter)&&count(counter)<count(featured),id+' graded density');
  assert.deepEqual(featured.score.sequence,original.sequence,id+' complete source retained');assert.equal(JSON.stringify(original.sequence),snapshot,id+' immutable score');
  for(const track of ['bass','comping','drums'])assert.equal(support.score[track],original[track],id+' unchanged '+track);
  const rate=original.gridRate||original.rate;let resting=0,longest=0;for(const events of support.score.sequence){if(events.length)resting=0;else{resting++;longest=Math.max(longest,resting);}}assert.ok(longest/rate>=(original.beats||4)*2,id+' breathing space');
 }
});
const H=(root,chord)=>({root,chord,chordPcs:CHORDS[chord].intervals.map(i=>(root+i)%12)});
test('cadence analysis distinguishes dominant, backdoor, tritone and plagal movement from modal vamps',()=>{
 const s={backingStyle:'traditionalJazz',key:0};assert.equal(cadenceKind(H(2,'min9'),H(7,'dom13'),H(0,'maj9'),s),'dominant');assert.equal(cadenceKind(H(5,'min9'),H(10,'dom13'),H(0,'maj9'),s),'backdoor');assert.equal(cadenceKind(H(2,'min9'),H(1,'dom9sharp11'),H(0,'maj9'),s),'tritone');assert.equal(cadenceKind(H(0,'maj9'),H(5,'min9'),H(0,'maj9'),s),'plagal');
 assert.equal(cadenceKind(H(2,'min9'),H(7,'dom13'),H(9,'min9'),s),'deceptive');assert.equal(cadenceKind(H(0,'min9'),H(2,'min9'),H(7,'dom13'),s),null);assert.equal(cadenceKind(H(9,'maj9sharp11'),H(11,'dom13'),H(9,'maj9sharp11'),s),null);
});
test('actual A–B–A sections control source phrases and transitions, including a split-bar section boundary',()=>{
 const s=chart('traditionalJazz',changes,'featured'),score=referencePlan(s).score;
 const explicit=score.form.phrases.filter(p=>p.explicit).slice(0,3);assert.deepEqual(explicit.map(p=>[p.start,p.section,p.role]),[[0,'A','opening'],[16,'B','contrast'],[32,'A','return']]);
 assert.ok(score.form.cadences.some(c=>c.at===12&&c.kind==='dominant'));assert.ok(score.form.cadences.some(c=>c.at===24&&c.kind==='backdoor'));
 const planned=referenceBasePlan(s).score;for(const at of [16,32])assert.ok(planned.drums[Math.round((at-.5)*12)].some(e=>e.transition),'fill before section '+at);
 const split=chart('funk',[A(0,'min9','dorian',2,'A'),A(1,'dom9sharp11','lydian_dominant',2,'B'),A(6,'maj9sharp11','lydian',4,'A')],'featured');const p=referencePlan(split).score;
 assert.ok(p.form.phrases.some(f=>f.start===2&&f.section==='B'));assert.ok(referenceBasePlan(split).score.drums[18].some(e=>e.transition),'split-bar cue before beat 2');
});
test('cadential melody resolves by nearby guide tones and bass approaches point at the actual destination',()=>{
 const s=chart('traditionalJazz',changes,'featured'),score=referencePlan(s).score;
 const before=score.sequence.slice(10*12,12*12).flat().findLast(e=>e.cadenceRole==='lead-in'),after=score.sequence.slice(12*12,13*12+1).flat().find(e=>e.cadenceRole==='arrival');
 assert.ok(before&&after);assert.ok(Math.abs(before.midi-after.midi)<=2,'nearby resolution');assert.ok([0,4].includes(after.midi%12),'C root or third arrival');
 const bass=score.bass.slice(11*12,12*12).flat().findLast(e=>e.cadence==='dominant');assert.ok(bass?.approach);assert.ok([11,1].includes(bass.midi%12));
 const support=referencePlan(chart('traditionalJazz',changes)).score;
 for(let grid=0;grid<support.sequence.length;grid++)for(const e of support.sequence[grid]){const h=harmonyAt(s,progressionPositionAtBeat(s,grid/12).step);assert.ok([...h.scalePcs,...h.chordPcs].includes(e.midi%12));}
});
test('section planning preserves son clave, one-drop kicks and compound metre at real transitions',()=>{
 for(const id of ['latin','reggae','slowSoul128','afroCuban68']){
  const beats=config(id).beats,s=chart(id,[A(0,'min9','dorian',beats*4,'A'),A(5,'dom13','mixolydian',beats*4,'B'),A(0,'min9','dorian',beats*4,'A')]);
  const score=referencePlan(s).score;
  for(let bar=0;bar<score.bars;bar++){
   const events=score.drums.slice(bar*beats*12,(bar+1)*beats*12).flat();
   if(id==='latin')assert.deepEqual(events.filter(e=>e.name==='clave').map(e=>e.at),bar%2?[0,1.5,3]:[1,2]);
   if(id==='reggae')assert.ok(events.filter(e=>e.name==='kick').every(e=>e.at===2));
   if(id==='slowSoul128'){assert.equal(events.filter(e=>e.name==='hat').length,12);assert.ok(events.every(e=>Math.abs(e.at*3-Math.round(e.at*3))<1e-6),'triplet-aligned fills');}
   if(id==='afroCuban68')assert.ok(events.every(e=>e.at>=0&&e.at<3));
  }
 }
});
const bank=await readSampleBank(8000);
test('Supporting renders fewer melodic attacks, activity edits rebuild once and fader edits keep the cached score',()=>{
 const s=config('legatoFusion'),play=activity=>{const engine=new Engine(8000);engine.installDrumKit(bank);engine.configure({...s,sequenceActivity:activity});engine.reset();const notes=[],events=[];engine.render(new Float32Array(64*4000-1),undefined,null,null,e=>notes.push(e),new Float32Array(64*4000-1),e=>events.push(e));return {engine,notes,events};};
 const a=play('supporting'),b=play('featured');assert.ok(a.notes.length<b.notes.length*.65);assert.deepEqual(a.events,b.events);
 const initial=a.engine.clockSettings.referencePlan,base=a.engine.cachedReferenceBasePlan;a.engine.configure({bassVolume:.2});assert.equal(a.engine.clockSettings.referencePlan,initial);a.engine.configure({sequenceActivity:'featured'});assert.equal(a.engine.cachedReferenceBasePlan,base,'activity reuses harmonic plan');assert.notEqual(a.engine.clockSettings.referencePlan,initial);assert.equal(a.engine.clockSettings.referencePlan.score.sequence.flat().length,b.notes.length);
});
