import {test} from 'node:test';import assert from 'node:assert/strict';
import {drumFillPhrase} from '../src/audio/drum-fill-vocabulary.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {referencePlan,referenceEvents} from '../src/audio/reference-performances.js';
const settings=id=>({...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,beats:BACKING_STYLES[id].suggestedBeats||4,progression:false,key:9,mode:'dorian',chord:'min7',extensionMorph:false,sequenceActivity:'featured',backingVariation:1});
test('fills are distinct authored gestures with accents, rests and style-specific subdivisions',()=>{
 for(const style of ['popRock','funk','motown','traditionalJazz','blues','ballad','slowSoul128','latin','bossa']){
  const phrases=Array.from({length:6},(_,p)=>drumFillPhrase(style,p,0,true));assert.equal(new Set(phrases.map(JSON.stringify)).size,6,style);
  for(const phrase of phrases){assert.ok(phrase.length<=5);assert.ok(phrase.every(([at,name,v])=>at>0&&at<=24&&v>0&&v<=.42&&name!=='kick'&&name!=='crash'));assert.equal(new Set(phrase.map(([at])=>at)).size,phrase.length);
   if(['blues','traditionalJazz'].includes(style))assert.ok(phrase.every(([at])=>at%6===0));
   if(style==='slowSoul128')assert.ok(phrase.every(([at])=>at%4===0));
   if(style==='latin')assert.ok(phrase.every(([,name])=>name==='congaMute'));
   if(style==='bossa')assert.ok(phrase.every(([,name])=>['rim','hatPedal'].includes(name)));
  }
 }
});
test('automatic single-chord vamps receive phrase-ending fills in the first pass and different later answers',()=>{
 let firstPass=0;
 for(const id of Object.keys(BACKING_STYLES)){
  const plan=referencePlan(settings(id)),score=plan.score,n=score.drums.length,signatures=[];
  for(const cycle of [0,1,2]){
   const fills=[];
   for(let g=0;g<n;g++){
    const events=referenceEvents(plan,'drums',cycle*n+g),newFills=events.filter(e=>e.sessionFill);
    if(!newFills.length)continue;fills.push(...newFills.map(e=>[g,e.name,e.velocity]));
    assert.ok(events.filter(e=>!['kick','hatPedal'].includes(e.name)).length<=2,id+' playable hands');
    for(const e of newFills){assert.ok(e.at>=Math.max(0,score.beats-2)&&e.at<score.beats,id+' stays inside final two beats');for(let near=Math.max(0,g-3);near<Math.min(n,g+4);near++)assert.equal(score.sequence[near].length,0,id+' leaves melody attacks clear');}
   }
   if(cycle===0&&fills.length)firstPass++;
   signatures.push(JSON.stringify(fills));
   for(const name of ['kick',...(id==='latin'?['clave']:id==='reggae'?['rim']:id==='slowSoul128'?['hat']:[])]){
    const written=score.drums.flatMap((es,g)=>es.filter(e=>e.name===name).map(()=>g));
    const played=Array.from({length:n},(_,g)=>referenceEvents(plan,'drums',cycle*n+g).filter(e=>e.name===name&&!e.sessionFill).map(()=>g)).flat();assert.deepEqual(played,written,id+' preserves '+name);
   }
  }
  assert.ok(new Set(signatures).size>=2,id+' varied phrasing');
 }
 assert.ok(firstPass>=16,'single chord does not prevent phrase fills');
});
test('fills use deterministic human touch without moving the pulse and remain callback-independent',()=>{
 const run=block=>{const rate=2000,e=new Engine(rate);e.configure({...settings('popRock'),countIn:false,bpm:180,click:1,harmony:0,drums:true,bass:false,comping:false,sequence:false,backingHumanize:.8});e.reset();const events=[],beats=[];for(let i=0;i<48000;i+=block){const count=Math.min(block,48000-i);e.render(new Float32Array(count),b=>beats.push(b.sample),null,null,undefined,new Float32Array(count),hit=>events.push(hit));}return {events,beats};};
 const a=run(127),b=run(1024);assert.deepEqual(a,b);assert.ok(a.events.some(e=>e.type==='snare'&&e.delayFrames>0));assert.ok(a.events.every(e=>e.delayFrames>=0&&e.delayFrames<25));
});
