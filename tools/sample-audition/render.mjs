// Offline source comparison: no app sampler, arrangement or settings are changed.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Engine,DEFAULTS} from '../../web/src/audio/engine.js';
import {readSampleBank} from '../../web/scripts/read-sample-bank.mjs';
import {referenceChart} from '../../web/src/audio/reference-performances.js';
import {normalizeCustomProgression} from '../../web/src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../../web/src/practice/backing-styles.js';
import {recordedZone} from '../../web/src/audio/sound-library.js';

const [cacheArg,outArg]=process.argv.slice(2);
if(!cacheArg||!outArg)throw Error('Usage: node tools/sample-audition/render.mjs CACHE OUTPUT');
const cache=resolve(cacheArg),out=resolve(outArg),rate=32000;
await mkdir(out,{recursive:true});
const provenance=JSON.parse(await readFile(join(cache,'sources.json'),'utf8'));
const families={};
for(const zone of provenance.files){
 const raw=await readFile(join(cache,zone.id+'.f32'));
 assert.equal(createHash('sha256').update(raw).digest('hex'),zone.sha256);
 assert.equal(zone.license,'CC0-1.0');
 const pcm=new Float32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
 (families[zone.family]??=[]).push({...zone,pcm});
}
const bank=await readSampleBank(rate);
const cases=[
 {id:'blues-guitar',style:'blues',track:'comping',family:'shiny',title:'Blues guitar',candidate:'Shinyguitar · pickup',current:'FreePats FSBS clean · current Blues tone'},
 {id:'clean-guitar',style:'popRock',track:'comping',family:'shiny',title:'Clean pop / rock guitar',candidate:'Shinyguitar · pickup',current:'FreePats FSBS clean · current clean tone'},
 {id:'swell-guitar',style:'legatoFusion',track:'comping',family:'shiny',title:'Legato Fusion guitar swells',candidate:'Shinyguitar · pickup',current:'FreePats FSBS clean · current swell tone'},
 {id:'electric-bass',style:'funk',track:'bass',family:'growly',title:'Electric bass',candidate:'Growlybass · Squier Jazz Bass',current:'Current electric bass recordings'},
 {id:'upright-bass',style:'traditionalJazz',track:'bass',family:'sneaky',title:'Upright bass',candidate:'Sneakybass · quiet pizzicato session',current:'Current upright blend, including Meatbass'},
];
function settings(id){
 const chart=referenceChart(id);
 const s={...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,
  backingStyle:id,key:chart.key,bpm:chart.bpm,beats:chart.beats,template:'custom',progression:true,
  customProgression:normalizeCustomProgression(chart.progression),soundLibrary:'expanded',sequenceActivity:'supporting',
  countIn:false,click:0,harmony:0,drums:true,bass:true,comping:true,sequence:true,
  drumsVolume:.25,bassVolume:.25,compingVolume:.25,sequenceVolume:.25};
 s.drumKit=resolveDrumKit(s);return s;
}
function render(c,candidate){
 const s=settings(c.style),e=new Engine(rate);e.installDrumKit(bank);e.configure(s);e.reset();
 if(candidate){
  const zones=families[c.family];
  if(c.track==='comping')e.comping.banks['expanded:electricGuitar']=zones;
  else{
   // Adapt only source selection to the existing bass voice/envelope implementation.
   const bass=e.rhythm.bassInstrument,original=bass.noteOn.bind(bass),cursors=new Map();
   bass.noteOn=(midi,length,gain,style,instrument)=>{
    const z=recordedZone(zones,Math.max(24,Math.min(72,midi)),gain,cursors);
    bass.banks[instrument]=[{...z,samples:[z.pcm]}];
    return original(midi,length,gain,style,instrument,'original');
   };
  }
 }
 const frames=Math.ceil(32*60/s.bpm*rate),audio=()=>new Float32Array(frames),stems={drums:audio(),bass:audio(),comping:audio(),sequenceLeft:audio(),sequenceRight:audio()};
 const events=[];e.render(audio(),undefined,audio(),audio(),v=>events.push(v),audio(),v=>events.push(v),null,undefined,stems);
 return {stems,events,bpm:s.bpm,frames};
}
async function raw(path,channels){
 const frames=channels[0].length,data=Buffer.alloc(frames*channels.length*4);
 for(let i=0;i<frames;i++)for(let ch=0;ch<channels.length;ch++){const x=channels[ch][i];assert.ok(Number.isFinite(x));data.writeFloatLE(x,(i*channels.length+ch)*4);}
 await writeFile(path,data);
}
function measure(path,channels){
 const {stderr,status}=spawnSync('ffmpeg',['-hide_banner','-f','f32le','-ar',String(rate),'-ac',String(channels),'-i',path,'-af','loudnorm=print_format=json','-f','null','-'],{encoding:'utf8'});
 assert.equal(status,0,stderr);
 return JSON.parse(stderr.slice(stderr.lastIndexOf('{'),stderr.lastIndexOf('}')+1));
}
function encode(input,output,channels,gain){
 execFileSync('ffmpeg',['-v','error','-y','-f','f32le','-ar',String(rate),'-ac',String(channels),'-i',input,'-af',`volume=${gain}dB`,'-codec:a','libmp3lame','-b:a','160k',output]);
}
const report=[];
for(const c of cases){
 const current=render(c,false),candidate=render(c,true);
 assert.deepEqual(candidate.events,current.events,'Source swap must preserve pitches, articulation and event timing');
 for(const name of Object.keys(current.stems))if(name!==c.track)assert.deepEqual(candidate.stems[name],current.stems[name],'Unchanged ensemble stem: '+name);
 const a=join(cache,c.id+'-current.raw'),b=join(cache,c.id+'-candidate.raw');
 await raw(a,[current.stems[c.track]]);await raw(b,[candidate.stems[c.track]]);
 const am=measure(a,1),bm=measure(b,1),difference=Number(am.input_i)-Number(bm.input_i);
 // Fixed gain only: match source loudness, preserving the complete performance dynamics.
 const target=Math.min(-23,Number(am.input_i)-Number(am.input_tp)-2,Number(bm.input_i)-Number(bm.input_tp)-2);
 encode(a,join(out,c.id+'-current-solo.mp3'),1,target-Number(am.input_i));
 encode(b,join(out,c.id+'-candidate-solo.mp3'),1,target-Number(bm.input_i));
 const mix=(result,trackGain)=>{
  const channels=[new Float32Array(result.frames),new Float32Array(result.frames)];
  for(let n=0;n<result.frames;n++)for(let ch=0;ch<2;ch++){
   const s=result.stems;channels[ch][n]=s.drums[n]+s.bass[n]*(c.track==='bass'?trackGain:1)+s.comping[n]*(c.track==='comping'?trackGain:1)+(ch?s.sequenceRight[n]:s.sequenceLeft[n]);
  }return channels;
 };
 const ma=join(cache,c.id+'-current-mix.raw'),mb=join(cache,c.id+'-candidate-mix.raw');
 await raw(ma,mix(current,1));await raw(mb,mix(candidate,10**(difference/20)));
 const mam=measure(ma,2),mbm=measure(mb,2),mixGain=Math.min(-20-Number(mam.input_i),-2-Number(mam.input_tp),-2-Number(mbm.input_tp));
 encode(ma,join(out,c.id+'-current-mix.mp3'),2,mixGain);encode(mb,join(out,c.id+'-candidate-mix.mp3'),2,mixGain);
 report.push({...c,bpm:current.bpm,bars:8,seconds:current.frames/rate,events:current.events.length,
  sourceLoudness:{current:Number(am.input_i),candidate:Number(bm.input_i),candidateGainDb:difference,soloTargetLufs:target},
  ensembleLoudness:{current:Number(mam.input_i)+mixGain,candidate:Number(mbm.input_i)+mixGain,commonGainDb:mixGain},
  eventParity:true,unmodifiedStemsIdentical:true});
 console.log('Rendered',c.id);
}
await writeFile(join(out,'comparisons.json'),JSON.stringify(report,null,2)+'\n');
await writeFile(join(out,'sources.json'),JSON.stringify(provenance,null,2)+'\n');
for(const family of Object.keys(families))await copyFile(join(cache,'LICENSE-'+(family==='shiny'?'shiny':family==='growly'?'growly':'sneaky')),join(out,'LICENSE-'+family+'.txt'));
await copyFile(new URL('./index.html',import.meta.url),join(out,'index.html'));
console.log('Five source comparisons verified; normal app files unchanged.');
