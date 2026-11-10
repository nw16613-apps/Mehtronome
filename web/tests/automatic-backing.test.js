import {ensembleDrums} from '../src/audio/ensemble-arrangements.js';
import {createReferencePreparation} from '../src/audio/reference-plan-preparation.js';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {Engine,DEFAULTS} from '../src/audio/engine.js';import {automaticBackingSettings,referencePlan,referenceBasePlan,referenceScore} from '../src/audio/reference-performances.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';import {harmonyAt,progressionBeatDurations,progressionPositionAtBeat} from '../src/audio/music.js';import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
function settings(id,extra={}){return {...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,key:9,beats:BACKING_STYLES[id].suggestedBeats||4,mode:'dorian',chord:'min9',progression:true,template:'single',sequenceActivity:'supporting',...extra};}
test('the automatic path enables the developed composer for every style without chart markers',()=>{
 for(const id of Object.keys(BACKING_STYLES)){const s=settings(id),before=JSON.stringify(s),plan=referencePlan(s);assert.equal(plan?.score.composition.method,'whole-progression-paths',id);assert.deepEqual(plan.score.choruses.map(p=>p.role),['statement','development','contrast','return']);assert.equal(JSON.stringify(s),before);assert.equal(s.customProgression?.arrangedPerformance,undefined);}
});
test('templates, modal-parent guides and custom changes retain their actual harmony, duration and spelling',()=>{
 const configs=[settings('traditionalJazz',{key:0,template:'diatonic',mode:'major'}),settings('funk',{key:2,template:'modal_dorian',mode:'dorian'}),settings('blues',{key:5,template:'major1625'}),settings('legatoFusion',{key:0,template:'custom',customProgression:normalizeCustomProgression({name:'Own chart',steps:[{root:2,chord:'min9',mode:'dorian',beats:2,section:'A'},{root:1,chord:'dom9sharp11',mode:'lydian_dominant',beats:2},{root:0,chord:'maj9',mode:'major',beats:8,bass:7,section:'B'}]})})];
 for(const s of configs){const normalized=automaticBackingSettings(s),durations=progressionBeatDurations(s);assert.deepEqual(normalized.customProgression.steps.map(step=>step.beats),durations);
  for(let i=0;i<durations.length;i++){const a=harmonyAt(s,i),b=harmonyAt(normalized,i);assert.deepEqual(new Set(b.chordPcs),new Set(a.chordPcs));assert.deepEqual(new Set(b.scalePcs),new Set(a.scalePcs));assert.equal(b.bassMidi??null,a.bassMidi??null);assert.ok(!b.name.includes('undefined'));}
 }
});
test('current style wins over older reference and arrangement markers, with extensions and loops preserved in user settings',()=>{
 const chart=normalizeCustomProgression({referencePerformance:'legatoFusion',arrangedPerformance:'blues',steps:[{root:0,chord:'min9',mode:'dorian',bars:2},{root:5,chord:'dom13',mode:'mixolydian',bars:2}]});
 const s=settings('funk',{template:'custom',customProgression:chart,extensionMorph:true,loopEnabled:true,loopUnit:'beats',loopBeatStart:2,loopBeatEnd:9}),before=JSON.stringify(s),plan=referencePlan(s);assert.equal(plan.score.id,'funk');assert.equal(plan.score.chartBeats,8);assert.equal(JSON.stringify(s),before);
 for(let grid=0;grid<plan.score.sequence.length;grid++)for(const e of plan.score.sequence[grid]){const h=harmonyAt(s,progressionPositionAtBeat(s,grid/12).step);assert.equal(e.targetStep,progressionPositionAtBeat(s,grid/12).step);assert.ok([...h.scalePcs,...h.chordPcs].includes(e.midi%12));}
 assert.equal(referencePlan({...s,backingStyle:'blues'}).score.id,'blues');
});
test('single chords and supported chart edits are composed automatically; unusual metres retain the existing fallback',()=>{
 const s=settings('legatoFusion',{progression:false,extensionMorph:true}),p=referenceBasePlan(s);assert.equal(p.score.composition.method,'whole-progression-paths');
 const a=referencePlan(settings('blues',{template:'major1625'})),b=referencePlan(settings('blues',{template:'major1625',key:4}));assert.notDeepEqual(a.score.sequence,b.score.sequence);
 assert.equal(referenceBasePlan(settings('funk',{beats:5})),null);const e=new Engine(8000);e.configure(settings('funk',{beats:5}));assert.equal(e.clockSettings.referencePlan,null);
});

test('automatic cached plans refresh when the single chord or scale guide changes',()=>{
 const prepare=createReferencePreparation(),s=settings('legatoFusion',{template:'single'}),a=prepare.get(s),b=prepare.get({...s,chord:'maj7',mode:'lydian'});
 assert.notEqual(a.key,b.key);assert.notDeepEqual(a.plan.score.comping,b.plan.score.comping);
 assert.equal(prepare.get({...s,chord:'maj7',mode:'lydian',sequenceActivity:'featured',comping:.5}),b);
});

test('Blues timekeeping uses ride in reference, automatic and fallback arrangements',()=>{
 const written=referenceScore('blues').drums.flat();assert.ok(written.some(e=>e.name==='ride'));assert.ok(written.some(e=>e.name==='tomLow'));assert.ok(!written.some(e=>['hat','hatOpen'].includes(e.name)));
 for(const template of ['single','major1625']){
  const drums=referencePlan(settings('blues',{template})).score.drums.flat();assert.ok(drums.some(e=>e.name==='ride'));assert.ok(!drums.some(e=>['hat','hatOpen'].includes(e.name)));
  assert.ok(drums.some(e=>e.name==='snare'));assert.ok(drums.some(e=>e.name==='kick'));
 }
 for(const beats of [3,4,5])for(let bar=0;bar<16;bar++){
  const drums=ensembleDrums(settings('blues',{beats}),bar);assert.ok(drums.some(([,piece])=>piece==='ride'));assert.ok(!drums.some(([,piece])=>['hat','hatOpen'].includes(piece)));
 }
});
