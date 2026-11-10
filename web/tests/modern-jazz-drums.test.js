import {test} from 'node:test';import assert from 'node:assert/strict';
import {modernJazzDrumCell} from '../src/audio/modern-jazz-drums.js';
import {referencePlan} from '../src/audio/reference-performances.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {DEFAULTS} from '../src/audio/engine.js';
import {additionalDrumCell} from '../src/audio/additional-styles.js';
import {ensembleDrums} from '../src/audio/ensemble-arrangements.js';
test('Modern Straight-Eighth Jazz develops four broken ride phrases over a stable half-time pulse',()=>{
 const signatures=new Set();for(let bar=0;bar<4;bar++){
  const cell=modernJazzDrumCell(bar);signatures.add(JSON.stringify(cell));
  assert.deepEqual(cell.filter(([,name,v])=>name==='snare'&&v>.3).map(([at])=>at),[8]);
  assert.ok(cell.some(([at,name])=>name==='kick'&&at%4));assert.deepEqual(cell.filter(([,name])=>name==='hatPedal').map(([at])=>at),[4,12]);
  assert.ok(cell.some(([,name])=>name==='ride'));assert.ok(!cell.some(([,name])=>name==='hat'));assert.ok(cell.every(([at,,v])=>Number.isInteger(at)&&at>=0&&at<16&&v>0&&v<.5));
  assert.deepEqual(additionalDrumCell('modernStraightJazz',bar,false),cell);
 }
 assert.equal(signatures.size,4);assert.deepEqual(modernJazzDrumCell(7,true).filter(([,name])=>name.startsWith('tom')).map(([at])=>at),[14,15]);
});
test('automatic and ensemble versions retain the new beat and do not acquire the Fusion Jazz backbeat',()=>{
 const s={...DEFAULTS,...BACKING_STYLES.modernStraightJazz.settings,...backingStyleInstruments('modernStraightJazz'),automaticBacking:true,backingStyle:'modernStraightJazz',progression:false,sequenceActivity:'supporting'};
 const score=referencePlan(s).score;for(let bar=0;bar<score.bars;bar++){
  const rows=score.drums.slice(bar*48,(bar+1)*48).flat();assert.ok(rows.some(e=>e.name==='snare'&&e.at===2&&e.velocity>.2));assert.ok(rows.some(e=>e.name==='ride'));assert.ok(!rows.some(e=>e.name==='hat'));
 }
 for(let bar=0;bar<4;bar++)assert.deepEqual(ensembleDrums({...s,automaticBacking:false},bar),modernJazzDrumCell(bar,bar===3));
});
