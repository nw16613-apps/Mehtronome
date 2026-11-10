import {resolutionBackingSettings} from '../src/practice/exercise-resolution.js';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {STANDARD_MELODIES} from '../src/audio/standard-melodies-data.js';
import {prepareStandardMelody,standardMelodyStatus} from '../src/audio/standard-melodies.js';
import {JAZZ_STANDARDS} from '../src/practice/jazz-standards.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
const config=(id,extra={})=>{const song=JAZZ_STANDARDS.find(s=>s.id===id);return {...DEFAULTS,...BACKING_STYLES.bossa.settings,...backingStyleInstruments('bossa'),automaticBacking:true,backingStyle:'bossa',key:song.key,beats:4,bpm:120,progression:true,template:'custom',customProgression:structuredClone(song.progression),countIn:false,click:0,harmony:0,drums:false,bass:false,comping:false,sequence:true,sequenceVolume:.2,sequenceActivity:'supporting',...extra};};
const rows=plan=>plan.slots.flatMap((events,grid)=>events.map(e=>({at:grid/12,...e})));
test('all supplied head forms retain pickups, rests, ties and distinct source keys',()=>{
 const expected={'autumn-leaves':[4,32,3,71],'all-the-things':[8,36,0,85],'another-you':[3,32,1,92],'blue-bossa':[0,16,1,40]};
 for(const [id,[key,bars,pickup,count]]of Object.entries(expected)){
  const def=STANDARD_MELODIES[id];assert.deepEqual([def.key,def.bars,def.pickupBeats,def.notes.length],[key,bars,pickup,count]);
  for(const [at,pitch,duration]of def.notes){assert.ok(at>=-pickup&&at<bars*4);assert.ok(duration>0&&at+duration<=bars*4+1e-6);assert.match(pitch,/^[A-G][b#]?\d+$/);}
  const song=JAZZ_STANDARDS.find(s=>s.id===id);assert.equal(song.progression.standardMelody,id);assert.equal(normalizeCustomProgression(song.progression).standardMelody,id);
 }
 assert.deepEqual(STANDARD_MELODIES['autumn-leaves'].notes.filter(([at])=>at>=96&&at<100).map(e=>e[1]),['C5','C5','Bb4','A4']);
 assert.ok(STANDARD_MELODIES['all-the-things'].notes.some(([at,n,d])=>at===136&&n==='Ab4'&&d===6));
 assert.deepEqual(rows(prepareStandardMelody(config('blue-bossa'))).slice(0,4).map(e=>[e.at,e.midi]),[[0,79],[1.5,77],[2,75],[2.5,74]]);
});
test('written pitches transpose with the chart and do not change with activity or chord-guide edits',()=>{
 for(const song of JAZZ_STANDARDS){
  const base=prepareStandardMelody(config(song.id));assert.equal(base.period,song.barCount*4);
  for(const delta of [-5,2,5]){const shifted=prepareStandardMelody(config(song.id,{key:(song.key+delta+12)%12}));const source=STANDARD_MELODIES[song.id],a=((song.key-source.key+18)%12)-6,b=(((song.key+delta+12)%12-source.key+18)%12)-6;assert.deepEqual(rows(shifted).map(e=>e.midi),rows(base).map(e=>e.midi+b-a));}
  for(const sequenceActivity of ['supporting','countermelody','featured'])assert.deepEqual(rows(prepareStandardMelody(config(song.id,{sequenceActivity}))),rows(base));
  const changed=config(song.id);changed.customProgression.steps[0].mode='altered';changed.customProgression.steps[0].chord='dom7alt';assert.deepEqual(rows(prepareStandardMelody(changed)),rows(base));
 }
});
test('selected loops start at the correct tune location and resume held notes without retriggering chord boundaries',()=>{
 const s=config('autumn-leaves',{loopEnabled:true,loopUnit:'beats',loopBeatStart:4,loopBeatEnd:7}),p=prepareStandardMelody(s),notes=rows(p);
 assert.equal(p.period,4);assert.equal(p.pickupBeats,0);assert.deepEqual(notes.map(e=>[e.at,e.midi,e.duration]),[[0,75,1],[1,65,1],[2,67,1],[3,69,1]]);assert.equal(notes[0].resumed,true);
 const full=rows(prepareStandardMelody(config('autumn-leaves')));assert.equal(full[0].duration,5);assert.ok(!full.some(e=>e.at===4));
 const triplets=rows(prepareStandardMelody(config('all-the-things'))).filter(e=>e.at>=122&&e.at<124);assert.equal(triplets.length,3);[122,122+2/3,123+1/3].forEach((at,i)=>assert.ok(Math.abs(triplets[i].at-at)<1e-7));
});
test('swung eighths follow swing styles while written triplets and bossa rhythm remain intact',()=>{
 const straight=prepareStandardMelody(config('another-you')),swing=prepareStandardMelody(config('another-you',{backingStyle:'traditionalJazz'}));
 assert.equal(rows(straight).find(e=>e.midi===65&&e.at>4).at,7.5);assert.ok(rows(swing).some(e=>Math.abs(e.at-(7+2/3))<1e-7));
 assert.deepEqual(rows(prepareStandardMelody(config('blue-bossa',{backingStyle:'blues'}))),rows(prepareStandardMelody(config('blue-bossa'))));
 const tuplets=rows(prepareStandardMelody(config('all-the-things',{backingStyle:'traditionalJazz'}))).filter(e=>e.at>=122&&e.at<124);assert.equal(tuplets.length,3);assert.ok(tuplets.every(e=>Math.abs(e.duration-2/3)<1e-6));
});
test('engine plays the complete written melody, with an automatic pickup and no generated notes',()=>{
 const rate=2000;
 for(const song of JAZZ_STANDARDS){
  const s=config(song.id),p=prepareStandardMelody(s),engine=new Engine(rate);engine.configure(s);engine.reset();
  assert.equal(engine.remainingCount,p.pickupBeats);const events=[],pulses=[],frames=Math.round((p.period+p.pickupBeats)*rate/2);
  const audio=new Float32Array(frames);engine.render(audio,e=>pulses.push(e),null,null,e=>events.push(e));
  const expected=[...Object.values(p.pickup).flat(),...rows(p)].sort((a,b)=>a.at-b.at);
  assert.deepEqual(events.map(e=>e.midi),expected.map(e=>e.midi),song.id);assert.ok(events.every(e=>e.standardMelody===song.id));
  for(let i=0;i<events.length;i++)assert.ok(Math.abs(events[i].sample-(expected[i].at+p.pickupBeats)*rate/2)<=2,song.id+' onset '+i);
  assert.ok(audio.every(n=>Number.isFinite(n)&&Math.abs(n)<1));assert.ok(pulses.some(e=>!e.counting));
 }
});
test('muting melody avoids automatic lead-in; explicit count-in retains written pickups',()=>{
 for(const [extra,count,notes]of [[{mutedChannels:'sequence'},0,0],[{sequence:false},0,0],[{countIn:true},4,3]]){
  const engine=new Engine(2000);engine.configure(config('autumn-leaves',extra));engine.reset();assert.equal(engine.remainingCount,count);
  const events=[];engine.render(new Float32Array(4000),undefined,null,null,e=>events.push(e));assert.equal(events.length,notes);
 }
});
test('melody identity survives save/Study metadata and invalid or structurally edited charts are rejected',()=>{
 const valid=config('blue-bossa');assert.ok(standardMelodyStatus(valid));assert.equal(prepareStandardMelody({...valid,beats:3}),null);
 const changed=structuredClone(valid);changed.customProgression.steps[0].bars=2;assert.equal(prepareStandardMelody(changed),null);
 for(const id of ['constructor','missing',''])assert.equal(prepareStandardMelody({...valid,customProgression:{...valid.customProgression,standardMelody:id}}),null);
 const duplicate=structuredClone(valid);duplicate.customProgression.steps.push(...structuredClone(duplicate.customProgression.steps));assert.equal(prepareStandardMelody(duplicate).period,128);
});

test('backed exercises preserve the original melody location and leave their added resolution bar clear',()=>{
 const s=config('autumn-leaves',{loopEnabled:true,loopUnit:'beats',loopBeatStart:4,loopBeatEnd:7});
 const exercise={resolution:{duration:4},slots:[{step:1,duration:4},{step:0,duration:4,resolution:true}]};
 const privateSettings=resolutionBackingSettings(s,exercise),p=prepareStandardMelody(privateSettings),original=prepareStandardMelody(s);
 assert.equal(privateSettings.standardMelodyPickup,false);assert.equal(p.period,8);assert.deepEqual(rows(p),rows(original));assert.ok(p.slots.slice(48).every(es=>!es.length));
});

test('written notes remain complete in later loops and block boundaries do not change playback',()=>{
 const s=config('blue-bossa'),rate=2000,p=prepareStandardMelody(s),frames=(p.period*3+p.pickupBeats)*rate/2;
 const run=chunk=>{const engine=new Engine(rate),events=[];engine.configure(s);engine.reset();for(let at=0;at<frames;at+=chunk)engine.render(new Float32Array(Math.min(chunk,frames-at)),undefined,null,null,e=>events.push([e.sample,e.midi,e.durationBeats]));return events;};
 const full=run(frames),blocks=run(127);assert.deepEqual(blocks,full);assert.equal(full.length,rows(p).length*3+Object.values(p.pickup).flat().length);
});
test('an incompatible edited form pauses written melody instead of substituting generated notes',()=>{
 const s=config('blue-bossa');s.customProgression.steps[0].bars=2;
 const engine=new Engine(2000);engine.configure(s);engine.reset();assert.equal(engine.clockSettings.standardMelodyUnavailable,true);const events=[];
 engine.render(new Float32Array(8000),undefined,null,null,e=>events.push(e));assert.equal(events.length,0);
});
