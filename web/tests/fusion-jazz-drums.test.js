import {test} from 'node:test';import assert from 'node:assert/strict';
import {fusionJazzDrumCell} from '../src/audio/fusion-jazz-drums.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {referencePlan} from '../src/audio/reference-performances.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
test('Fusion Jazz has four related hat-led bars with a firm backbeat, displaced kick and light ghost notes',()=>{
 const signatures=new Set();
 for(let bar=0;bar<4;bar++){
  const cell=fusionJazzDrumCell(bar);signatures.add(JSON.stringify(cell));
  assert.deepEqual(cell.filter(([,n,v])=>n==='snare'&&v>.3).map(([at])=>at),[4,12]);
  assert.ok(cell.some(([at,n])=>n==='kick'&&at%4!==0));assert.ok(cell.some(([,n,v])=>n==='snare'&&v<.2));
  assert.ok(cell.filter(([,n])=>n==='hat').length>=7);assert.ok(!cell.some(([,n])=>n==='ride'||n==='rideBell'));
  assert.ok(cell.every(([at,,v])=>at>=0&&at<16&&v>0&&v<.6));
 }
 assert.equal(signatures.size,4);
 const fill=fusionJazzDrumCell(3,true);assert.deepEqual(fill.filter(([,n])=>n.startsWith('tom')).map(([at])=>at),[14,15]);assert.ok(!fill.some(([at,n])=>at>12&&n==='hat'));
});
const s={...DEFAULTS,...BACKING_STYLES.fusionJazz.settings,...backingStyleInstruments('fusionJazz'),backingStyle:'fusionJazz',bpm:120,beats:4,countIn:false,click:0,harmony:0,drums:true,bass:false,comping:false,sequence:false,backingHumanize:0};
test('automatic and reference-free playback use the new beat while Legato Fusion retains its ride groove',()=>{
 const plan=referencePlan({...s,automaticBacking:true,progression:false});assert.ok(plan);
 for(let bar=0;bar<plan.score.bars;bar++){
  const events=plan.score.drums.slice(bar*48,(bar+1)*48).flat();assert.ok(events.some(e=>e.name==='hat'));assert.ok(!events.some(e=>['ride','rideBell'].includes(e.name)));
  for(const at of [1,3])assert.ok(events.some(e=>e.name==='snare'&&e.at===at&&e.velocity>.2),'backbeat survives arrangement coordination');
 }
 const kit=awaitKit;
 for(const ensemble of [false,true]){
  const e=new Engine(8000);e.installDrumKit(kit);e.configure({...s,automaticBacking:false,...(!ensemble?{backingStyle:null,accompanimentStyle:null}:{}),backingVariation:0});e.reset();const events=[],out=new Float32Array(64000);e.render(new Float32Array(out.length),undefined,null,null,undefined,out,x=>events.push(x));
  assert.ok(events.some(e=>e.type==='hat'));assert.ok(!events.some(e=>e.type==='ride'||e.type==='rideBell'));assert.ok(out.every(x=>Number.isFinite(x)&&Math.abs(x)<1));
  assert.deepEqual(events.filter(e=>e.type==='kick'&&e.gridSample<16000).map(e=>e.gridSample),[0,7000,10000]);
 }
 const legato=referencePlan({...s,...BACKING_STYLES.legatoFusion.settings,...backingStyleInstruments('legatoFusion'),backingStyle:'legatoFusion',automaticBacking:true}).score;
 assert.ok(legato.drums.flat().some(e=>e.name==='ride'));assert.ok(!legato.drums.flat().some(e=>e.name==='hat'));
});
const awaitKit=await readSampleBank(8000);
