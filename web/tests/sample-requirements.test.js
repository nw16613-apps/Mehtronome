import{test}from'node:test';import assert from'node:assert/strict';
import{sampleNamesForSettings}from'../src/audio/sample-requirements.js';import{BACKING_STYLES}from'../src/practice/backing-styles.js';import{SAMPLE_FILES}from'../src/audio/sample-manifest.js';import{Engine}from'../src/audio/engine.js';
test('only audible sample-based instruments are requested, using the selected style',()=>{
 const base={...BACKING_STYLES.popRock.settings,drums:true,bass:true,comping:true,drumsVolume:.25,bassVolume:.25,compingVolume:.25};assert.deepEqual(sampleNamesForSettings({...base,mutedChannels:'drums,bass,comping'}),[]);
 const jazz=sampleNamesForSettings({...base,...BACKING_STYLES.traditionalJazz.settings,mutedChannels:'bass,comping'});assert.equal(jazz.length,38);assert.ok(jazz.every(id=>id.startsWith('jazz')));
 const soul=sampleNamesForSettings({...base,...BACKING_STYLES.motown.settings,mutedChannels:'bass,comping'});assert.equal(soul.length,34);assert.ok(soul.includes('liveKick1')&&soul.includes('tambourine1'));
 assert.equal(sampleNamesForSettings({...base,mutedChannels:'drums,bass',compingTone:'brightTine'}).length,0);assert.equal(sampleNamesForSettings({...base,mutedChannels:'drums,comping',bassInstrument:'upright'}).length,5);
 for(const style of Object.values(BACKING_STYLES))for(const name of sampleNamesForSettings({...base,...style.settings}))assert.ok(SAMPLE_FILES[name]);
});
test('installing additional banks preserves active drum, bass and comping voices and cursors',()=>{
 const e=new Engine(8000),kick=new Float32Array(4000).fill(.1),bass=new Float32Array(16000).fill(.2);e.installDrumKit({liveKick1:kick,bass28:bass});e.rhythm.hitDrum('kick',.6,0,0,0,0,()=>{},'rock');e.rhythm.bassInstrument.noteOn(28,.5,.5,'walk','electric');e.comping.strike([60,64,67],1,.5,120,0,0,()=>{});e.rhythm.render(true,true);e.comping.render();const drum=e.rhythm.drumVoices[0],note=e.rhythm.bassVoices[0],keys=e.comping.voices[0],positions=[drum.position,note.position,keys.age],cursor=e.comping.cursor;e.mergeDrumKit({piano55:new Float32Array(4000).fill(.1)});assert.equal(e.rhythm.kit.liveKick1,kick);assert.equal(drum.sample,kick);assert.equal(note.sample,bass);assert.deepEqual([drum.position,note.position,keys.age],positions);assert.equal(e.comping.cursor,cursor);assert.ok(keys.active);assert.equal(e.comping.banks.piano.length,1);
});
