import test from 'node:test';import assert from 'node:assert/strict';
import {CompingInstrument,spreadCompingVoicings,compingChordVoicings} from '../src/audio/comping.js';import {harmonyAt,CHORDS} from '../src/audio/music.js';import {recommendedMode} from '../src/practice/custom-progression.js';import {Engine} from '../src/audio/engine.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';
test('spread voicings retain their complete source pitch-class sets, current scale colours and altered chord identity',()=>{
 for(const chord of Object.keys(CHORDS))for(const key of [0,4,9]){
  const h=harmonyAt({key,chord,mode:recommendedMode(chord)}),spread=spreadCompingVoicings(h),close=compingChordVoicings(h,h,'extensions',4);assert.ok(spread.length,chord);
  for(const v of spread){assert.ok(v.every(n=>n>=48&&n<=84));assert.ok(close.some(c=>JSON.stringify([...new Set(c.map(n=>n%12))].sort())===JSON.stringify([...new Set(v.map(n=>n%12))].sort())),chord);}
 }
 for(const chord of ['major','minor','maj7','min7','dom7','halfDim','minMaj7']){const h=harmonyAt({key:9,chord,mode:recommendedMode(chord)});assert.ok(spreadCompingVoicings(h).every(v=>v.at(-1)-v[0]>=19),chord);}
});
test('overlapping legato notes retain phase and envelope, glide smoothly and honor delayed scheduling',()=>{
 const instrument=new CompingInstrument(8000);instrument.strike([60],1,.5,120,0,0,null,'sequence','legatoGuitar');for(let i=0;i<2000;i++)instrument.render();const voice=instrument.voices.find(v=>v.active),phase=voice.phase,age=voice.age,body=voice.body,cursor=instrument.cursor,oldPitch=voice.increment;
 instrument.strike([67],1,.5,120,2000,0,null,'sequence','legatoGuitar',24);assert.equal(voice.midi,60);assert.equal(voice.phase,phase);assert.equal(voice.age,age);assert.equal(instrument.cursor,cursor);
 for(let i=0;i<25;i++)instrument.render();assert.equal(voice.midi,67);assert.ok(voice.increment>oldPitch);assert.ok(voice.body<=body);assert.ok(voice.age>age);assert.ok(voice.phase!==0);for(let i=0;i<120;i++)instrument.render();assert.equal(voice.increment,440*2**((67-69)/12)/8000);assert.equal(instrument.voices.filter(v=>v.active).length,1);
 instrument.releaseVoice(voice);assert.equal(voice.pendingLegato,null);instrument.strike([64],.5,.5,120,2200,0,null,'sequence','legatoGuitar');assert.equal(instrument.cursor,cursor+1);
 for(let i=0;i<16000;i++)assert.ok(Number.isFinite(instrument.render()));assert.ok(instrument.voices.every(v=>!v.active));
});
test('legato arrangement is sparse, follows chord changes and remains identical across render blocks',()=>{
 const s={...BACKING_STYLES.legatoFusion.settings,bpm:120,beats:4,key:9,mode:'dorian',chord:'min7',progression:true,template:'major251essential',drums:true,bass:true,comping:true,sequence:true,click:0,harmony:0,countIn:false,backingHumanize:0,backingVariation:1};
 function play(block){const e=new Engine(8000);e.configure(s);e.reset();const events=[],melody=[],dry=new Float32Array(128000);for(let at=0;at<dry.length;at+=block){const end=Math.min(dry.length,at+block);e.render(new Float32Array(end-at),undefined,null,null,n=>melody.push(n),dry.subarray(at,end),n=>events.push(n));}return {e,events,melody,dry};}
 const a=play(128000),b=play(127);assert.deepEqual(a.dry,b.dry);assert.deepEqual(a.events,b.events);assert.deepEqual(a.melody,b.melody);const chords=a.events.filter(n=>n.type==='comping'&&n.notes.length>=3);assert.ok(chords.length>0&&chords.length<12);assert.ok(chords.some(n=>n.duration>2));assert.ok(a.melody.length>0&&a.melody.length<16);assert.ok(a.melody.every(n=>n.tone==='legatoGuitar'));assert.ok(a.events.some(n=>n.step===1));assert.ok(a.dry.every(Number.isFinite));
});
