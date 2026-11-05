import{test}from'node:test';import assert from'node:assert/strict';import{Engine}from'../src/audio/engine.js';import{BACKING_STYLES}from'../src/practice/backing-styles.js';
function play(style,changes={}){const e=new Engine(8000);e.configure({...BACKING_STYLES[style].settings,bpm:120,beats:4,countIn:false,comping:true,drums:false,bass:false,sequence:false,click:0,harmony:0,backingHumanize:0,compingMovementAmount:0,backingVariation:0,...changes});e.reset();const events=[];e.render(new Float32Array(128000),undefined,null,null,undefined,new Float32Array(128000),event=>events.push(event));return events.filter(e=>e.type==='comping');}
test('each accompaniment combines individual voices and partial chords, with bounded activity and space',()=>{
 for(const style of Object.keys(BACKING_STYLES)){const events=play(style);assert.ok(events.length>=8&&events.length<=56,style);assert.ok(events.some(e=>e.notes.length===1),style);assert.ok(events.some(e=>e.notes.length>=2),style);assert.ok(events.every(e=>e.part===style&&e.notes.length<=4));
  for(let bar=0;bar<8;bar++){const count=events.filter(e=>Math.floor(e.gridSample/16000)===bar).length;assert.ok(count>=1&&count<=7,style+' '+bar);}
 }
});
test('Brazilian and Cuban base parts preserve their two-bar cycle when part variation is disabled',()=>{
 for(const style of ['latin','bossa']){const events=play(style),positions=bar=>events.filter(e=>Math.floor(e.gridSample/16000)===bar).map(e=>[e.gridSample%16000,e.role]);assert.deepEqual(positions(7),positions(1));assert.deepEqual(positions(6),positions(0));}
});
test('riffs preserve their note contour, articulation and two-bar identity; sustained styles let voices overlap',()=>{
 for(const style of ['popRock','fusionJazz','blues','motown','funk','latin','bossa']){
  const events=play(style),signature=bar=>events.filter(e=>Math.floor(e.gridSample/16000)===bar).map(e=>[e.gridSample%16000,e.notes,e.duration,e.velocity,e.role]);
  assert.deepEqual(signature(0),signature(2),style);assert.deepEqual(signature(1),signature(3),style);
  assert.ok(new Set(events.map(e=>e.notes.join(','))).size>=3,style+' has a pitch contour');
 }
 assert.ok(play('neoSoul').some(e=>e.role==='pad'&&e.duration>=3.5));assert.ok(play('ballad').some(e=>e.duration>=3));
 const neo=play('neoSoul');assert.notDeepEqual(neo.find(e=>e.role==='innerThird').notes,neo.find(e=>e.role==='innerColour').notes);
});
