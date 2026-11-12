import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
const render=(e,n,events=[])=>{for(let i=0;i<n;i+=128)e.render(new Float32Array(Math.min(128,n-i)),event=>events.push(event),null,null,undefined,null,undefined,null,event=>events.push(event));return events;};
const setup=()=>{const e=new Engine(8000);e.configure({bpm:120,beats:4,countIn:false,progression:false,key:0,mode:'major',chord:'maj7',click:0,harmony:0});e.reset();return e;};
test('harmony changes wait for the exact downbeat and preserve the current bar position',()=>{
 const e=setup();render(e,5000);const before=e.beat;assert.equal(e.requestSettings({key:2},null,1),true);assert.equal(e.settings.key,0);assert.equal(e.beat,before);
 const events=render(e,11000);assert.equal(e.settings.key,0);render(e,1,events);assert.equal(e.settings.key,2);assert.equal(e.beat,4);assert.equal(events.filter(v=>v.type==='settings-applied').length,1);assert.equal(events.find(v=>v.type==='settings-applied').id,1);
});
test('tempo and mixer edits apply immediately while retaining the latest queued harmony',()=>{
 const e=setup();render(e,1000);e.requestSettings({key:2},null,1);e.requestSettings({key:5,bpm:180,compingVolume:.3,mutedChannels:'drums'},null,2);assert.equal(e.settings.key,0);assert.equal(e.currentBpm,180);assert.equal(e.settings.compingVolume,.3);assert.ok(e.muted.has('drums'));const phase=e.phase;assert.ok(phase>0);
 const events=render(e,16000);assert.equal(e.settings.key,5);assert.deepEqual(events.filter(v=>v.type==='settings-applied').map(v=>v.id),[2]);
});
test('new chart and metre restart at beat one without a second count-in',()=>{
 const e=setup();render(e,5000);e.requestSettings({progression:true,template:'single',beats:3,countIn:true,liveChartRevision:1},null,3);const events=render(e,11001);const ack=events.findIndex(v=>v.type==='settings-applied');assert.ok(ack>=0);const beat=events.slice(ack+1).find(v=>Number.isInteger(v.beat));assert.equal(beat.beat,0);assert.equal(beat.bar,1);assert.equal(beat.musicalBeat,0);assert.equal(beat.counting,false);assert.equal(e.remainingCount,0);
});
test('pending changes can be replaced, cancelled and cleared on restart',()=>{
 const e=setup();render(e,1000);e.requestSettings({key:5},null,1);assert.equal(e.requestSettings({key:0},null,2),false);assert.equal(e.pendingSettings,null);e.requestSettings({key:7},null,3);e.reset();assert.equal(e.pendingSettings,null);assert.equal(e.settings.key,0);
});

test('live controls stay immediate during sample preparation and update pending tempo',()=>{const e=setup();render(e,1000);e.requestSettings({key:2},null,1);e.updateLiveSettings({bpm:170,click:.2});assert.equal(e.currentBpm,170);assert.equal(e.settings.key,0);assert.equal(e.pendingSettings.settings.bpm,170);render(e,16000);assert.equal(e.settings.key,2);assert.equal(e.currentBpm,170);e.requestSettings({key:5},null,2);e.updateLiveSettings({bpm:140},true);assert.equal(e.pendingSettings,null);assert.equal(e.settings.key,2);assert.equal(e.currentBpm,140);});
