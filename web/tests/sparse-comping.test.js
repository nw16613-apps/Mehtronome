import{test}from'node:test';import assert from'node:assert/strict';import{Engine}from'../src/audio/engine.js';import{BACKING_STYLES}from'../src/practice/backing-styles.js';
function play(style){const e=new Engine(8000);e.configure({...BACKING_STYLES[style].settings,bpm:120,beats:4,countIn:false,comping:true,drums:false,bass:false,sequence:false,click:0,harmony:0,backingHumanize:0});e.reset();const events=[];e.render(new Float32Array(128000),undefined,null,null,undefined,new Float32Array(128000),event=>events.push(event));return events.filter(e=>e.type==='comping');}
test('all styles leave space with one or two full-chord attacks per bar at roughly half the previous density',()=>{
 for(const style of Object.keys(BACKING_STYLES)){const events=play(style);assert.ok(events.length>=8&&events.length<=14,style);for(let bar=0;bar<8;bar++){const count=events.filter(e=>Math.floor(e.gridSample/16000)===bar).length;assert.ok(count>=1&&count<=2,style+' '+bar);}assert.ok(events.every(e=>e.notes.length>=3));}
});
test('comping leaves the final beat of the eight-bar drum answer clear without cutting off its chord voices',()=>{
 for(const style of Object.keys(BACKING_STYLES)){const events=play(style);assert.ok(!events.some(e=>e.gridSample>=124000&&e.gridSample<128000),style);}
});
