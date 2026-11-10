import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {referencePlan} from '../src/audio/reference-performances.js';import {harmonyAt} from '../src/audio/music.js';
test('single-chord vamps develop voicings in every style while retaining the same chord and mode',()=>{
 for(const[id,style]of Object.entries(BACKING_STYLES))for(const [chord,mode]of [['min7','dorian'],['dom7','mixolydian'],['maj7','lydian']]){
  const settings={...DEFAULTS,...style.settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,progression:false,extensionMorph:false,beats:style.suggestedBeats||4,key:9,chord,mode,sequenceActivity:'supporting'},a=referencePlan(settings).score,b=referencePlan(settings).score,h=harmonyAt(settings,0),rows=a.comping.flat();
  assert.ok(new Set(rows.map(e=>e.notes.join(','))).size>=3,id+' '+chord+' voicing development');assert.deepEqual(rows,b.comping.flat(),'deterministic');
  for(const e of rows){assert.ok(e.notes.length>=2&&e.notes.length<=4);assert.ok(e.notes.every(n=>n>=40&&n<=84));assert.ok(e.notes.every(n=>h.chordPcs.includes(n%12)||h.scalePcs.includes(n%12)),id+' stays within harmony');}
  if(id==='hardRock')assert.ok(rows.every(e=>e.notes.every(n=>[9,4].includes(n%12))),'power identity preserved');
 }
});
