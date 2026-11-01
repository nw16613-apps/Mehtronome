import {test} from 'node:test';import assert from 'node:assert/strict';
import {editableProgression,duplicateProgressionStep,editProgressionCards} from '../src/practice/progression-editing.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {harmonyAt} from '../src/audio/music.js';import {assignedPositionPath,progressionPositionPath} from '../src/guitar/position-path.js';
const chart=()=>editableProgression({version:2,name:'Editing',steps:[{root:0,chord:'min7',mode:'dorian',bars:2,bass:null,position:'III',startTone:'3:0'},{root:5,chord:'dom7',mode:'mixolydian',bars:1,bass:null,position:'IV',startTone:'5:0'},{root:10,chord:'maj7',mode:'major',beats:3,bass:null,position:'I'}]});
test('chart and card identities plus practice settings survive normalization and JSON storage',()=>{
 const c=chart(),copy=editableProgression(JSON.parse(JSON.stringify(c)));assert.deepEqual(copy,c);assert.equal(new Set(c.steps.map(s=>s.id)).size,3);
 assert.deepEqual(normalizeCustomProgression(c),c);
 const duplicated=editableProgression({...c,steps:[c.steps[0],c.steps[0]]});assert.notEqual(duplicated.steps[0].id,duplicated.steps[1].id);
});
test('bulk qualities change only selected cards and retain roots, duration, position and entry role',()=>{
 const c=chart(),before=structuredClone(c);editProgressionCards(c,[c.steps[0].id,c.steps[2].id],{chord:'maj7'});
 assert.equal(c.steps[0].chord,'maj7');assert.equal(c.steps[2].chord,'maj7');assert.deepEqual(c.steps[1],before.steps[1]);
 for(let i=0;i<3;i++)for(const key of ['id','root','bars','beats','position','startTone'])assert.equal(c.steps[i][key],before.steps[i][key]);
});
test('positions and starts travel with moved and duplicated cards; automatic unpins only selected cards',()=>{
 const c=chart(),first=c.steps.shift();c.steps.push(first);assert.equal(c.steps.at(-1).position,'III');assert.equal(c.steps.at(-1).startTone,'3:0');
 const duplicate=duplicateProgressionStep(first);assert.notEqual(duplicate.id,first.id);assert.equal(duplicate.position,first.position);assert.equal(duplicate.startTone,first.startTone);
 editProgressionCards(c,[first.id],{position:'auto'});assert.equal(first.position,undefined);assert.equal(c.steps[0].position,'IV');
 editProgressionCards(c,c.steps.map(s=>s.id),{position:'V'});assert.ok(c.steps.every(s=>s.position==='V'));
});
test('saved position identities resolve against changed roots, chord qualities and modal geometries',()=>{
 const hs=[harmonyAt({key:9,chord:'min7',mode:'dorian'}),harmonyAt({key:2,chord:'maj7',mode:'major'})],path=assignedPositionPath(hs,progressionPositionPath(hs),['III','III']);
 assert.ok(path.every(p=>p.numeral==='III'));assert.notEqual(path[0].geometryShape,path[1].geometryShape);
});
