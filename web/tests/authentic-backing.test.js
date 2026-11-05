import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {Engine} from '../src/audio/engine.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';
import {styleSequenceStep} from '../src/audio/style-phrases.js';
const kit=await readSampleBank(8000);
function play(style,bars=8,settings={},block=0,samples=kit){
 const e=new Engine(8000);e.installDrumKit(samples);e.configure({...BACKING_STYLES[style].settings,bpm:120,beats:4,key:9,mode:'dorian',chord:'min7',countIn:false,drums:true,bass:true,comping:true,sequence:true,click:0,harmony:0,backingHumanize:0,...settings});e.reset();
 const events=[],melody=[],size=bars*16000,output=new Float32Array(size),dry=new Float32Array(size);
 for(let offset=0;offset<size;offset+=block||size){const end=Math.min(size,offset+(block||size));e.render(output.subarray(offset,end),undefined,null,null,n=>melody.push(n),dry.subarray(offset,end),v=>events.push(v));}
 return {events,melody,output,dry,e};
}
test('son clave keeps its 2–3 orientation through phrase endings, bell sections and section cues',()=>{
 const {events}=play('latin',16,{backingTurnaround:true});
 const offsets=events.filter(e=>e.type==='clave').map(e=>e.gridSample/1000);
 assert.deepEqual(offsets,Array.from({length:8},(_,pair)=>[4,8,16,22,28].map(p=>pair*32+p)).flat());
 assert.ok(events.filter(e=>e.type==='congaOpen'||e.type==='tumbaOpen').length===32);
 assert.ok(events.some(e=>e.type==='guiroLong'&&e.sampleId.startsWith('latinGuiro')));
 assert.ok(events.some(e=>e.type==='cowbell'&&e.gridSample>=128000));
 assert.ok(!events.some(e=>e.type==='cowbell'&&e.gridSample<128000));
 assert.ok(!events.some(e=>['snare','hat','crash','tomHigh','tomLow'].includes(e.type)));
 for(const type of ['clave','congaOpen','congaMute','tumbaOpen','guiroShort'])assert.equal(new Set(events.filter(e=>e.type===type).map(e=>e.sampleId)).size,2,type);
});
test('bossa keeps samba feet and a two-bar cross-stick answer without generic fills',()=>{
 const {events}=play('bossa',8,{backingTurnaround:true});
 assert.deepEqual(events.filter(e=>e.type==='rim').map(e=>e.gridSample/1000),Array.from({length:4},(_,pair)=>[0,6,12,20,26].map(p=>pair*32+p)).flat());
 for(let bar=0;bar<8;bar++)assert.deepEqual(events.filter(e=>e.type==='kick'&&Math.floor(e.gridSample/16000)===bar).map(e=>e.gridSample/1000-bar*16),[0,6,8,14]);
 assert.ok(events.some(e=>e.type==='shaker'&&e.sampleId.startsWith('latinShaker')));
 assert.ok(!events.some(e=>['snare','crash','tomHigh','clave','congaOpen'].includes(e.type)));
});
test('tumbao sustains across held-chord downbeats, but states a new harmony at its change',()=>{
 const held=play('latin',4).events.filter(e=>e.type==='bass');
 assert.deepEqual(held.map(e=>e.sample/1000),[0,6,12,22,28,38,44,54,60]);
 assert.ok(held.filter(e=>e.sub===0&&e.beat===3).every(e=>e.durationBeats>1.8));
 const changing=play('latin',4,{progression:true,template:'major251essential'}).events.filter(e=>e.type==='bass');
 assert.ok(changing.some(e=>e.step===1&&e.beat===0&&e.sub===0));
});
test('each style has a distinct melodic part, appropriate timbre, deliberate rests and bounded phrases',()=>{
 const signatures=[];
 for(const [style,arrangement]of Object.entries(BACKING_STYLES)){
  const {melody,e,dry}=play(style,8,{progression:true,template:'major251essential'});assert.ok(melody.length>0&&melody.length<=48,style);
  assert.ok(melody.every(n=>n.style===style&&n.tone===arrangement.settings.sequenceTone),style);
  assert.ok(new Set(melody.map(n=>Math.floor(n.gridSample/16000))).size<8,style+' leaves bars open');
  if(['popRock','traditionalJazz','blues','motown','bossa','latin','ballad'].includes(style))assert.ok(e.sequence.instrument.voices.some(v=>v.pcm?.length),style+' uses recordings');
  for(const note of melody){const harmony=harmonyAt(e.settings,note.step);assert.ok([...harmony.scalePcs,...harmony.chordPcs].includes(note.midi%12),style+' follows the current harmony');}
  assert.ok(dry.every(Number.isFinite));signatures.push(JSON.stringify(melody.map(n=>[n.gridSample,n.midi,n.durationBeats])));
  assert.equal(styleSequenceStep({...arrangement.settings,sequenceDensity:0},0,4),null);
 }
 assert.equal(new Set(signatures).size,10);
});
test('melodic-only playback requests its own recordings even when comping is muted',()=>{
 for(const style of ['popRock','traditionalJazz','motown','bossa','latin','ballad']){
  const names=sampleNamesForSettings({...BACKING_STYLES[style].settings,sequence:true,sequenceVolume:.25,drums:false,bass:false,comping:false});
  assert.ok(names.length>=4&&names.length<=5,style);
 }
 assert.equal(sampleNamesForSettings({...BACKING_STYLES.latin.settings,drums:true,drumsVolume:.25,mutedChannels:'drums'}).length,0);
});
test('full recorded Latin ensemble stays identical across render block sizes at a non-round tempo',()=>{
 const whole=play('latin',4,{bpm:137}),blocks=play('latin',4,{bpm:137},127);
 assert.deepEqual(blocks.dry,whole.dry);assert.deepEqual(blocks.events,whole.events);assert.deepEqual(blocks.melody,whole.melody);
});

test('muted melodic parts advance their clock without creating hidden sample voices',()=>{
 const {e,melody}=play('motown',1,{mutedChannels:'sequence'});assert.deepEqual(melody,[]);
 assert.ok(e.sequence.lastGrid>0);assert.ok(e.sequence.instrument.voices.every(v=>!v.active));
});

test('minimal Latin/bossa downloads sound identical to the full installed bank',()=>{
 for(const style of ['latin','bossa']){
  const settings={...BACKING_STYLES[style].settings,drums:true,bass:true,comping:true,sequence:true};
  const names=sampleNamesForSettings(settings),subset=Object.fromEntries(names.map(id=>[id,kit[id]]));
  const drums=sampleNamesForSettings({...settings,bass:false,comping:false,sequence:false});
  assert.equal(drums.length,style==='latin'?16:9);
  const full=play(style,8),minimal=play(style,8,{},0,subset);
  assert.deepEqual(minimal.events,full.events);assert.deepEqual(minimal.dry,full.dry);assert.deepEqual(minimal.melody,full.melody);
 }
});

test('active melodic phrases follow every ii–V–I chord without playing a future harmony early',()=>{
 for(const style of Object.keys(BACKING_STYLES)){
  const {melody,e}=play(style,4,{comping:false,progression:true,template:'major251essential',sequenceDensity:1});
  assert.ok(melody.some(n=>n.step===1),style);
  for(const note of melody){const harmony=harmonyAt(e.settings,note.step);assert.ok([...harmony.scalePcs,...harmony.chordPcs].includes(note.midi%12),style);}
 }
});
