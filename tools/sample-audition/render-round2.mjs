// Offline auditions only. Existing app playback, source maps and controls stay intact.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Engine,DEFAULTS} from '../../web/src/audio/engine.js';
import {readSampleBank} from '../../web/scripts/read-sample-bank.mjs';
import {referenceChart} from '../../web/src/audio/reference-performances.js';
import {normalizeCustomProgression} from '../../web/src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../../web/src/practice/backing-styles.js';
import {recordedZone} from '../../web/src/audio/sound-library.js';
const [cacheArg,outArg]=process.argv.slice(2);if(!cacheArg||!outArg)throw Error('Usage: render-round2.mjs CACHE OUTPUT');
const cache=resolve(cacheArg),out=resolve(outArg),rate=32000;await mkdir(out,{recursive:true});
const provenance=JSON.parse(await readFile(join(cache,'sources.json'),'utf8')),families={};
for(const z of provenance.files){const raw=await readFile(join(cache,z.id+'.f32'));assert.equal(createHash('sha256').update(raw).digest('hex'),z.sha256);assert.equal(z.license,'CC0-1.0');(families[z.family]??=[]).push({...z,pcm:new Float32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength))});}
assert.equal(createHash('sha256').update(await readFile(join(cache,'cabinet.wav'))).digest('hex'),provenance.cabinet.sha256);
const bank=await readSampleBank(rate),cases=[
 {id:'clean-guitar',title:'Clean pop / rock guitar',style:'popRock',track:'comping',amp:'clean'},
 {id:'blues-guitar',title:'Blues guitar',style:'blues',track:'comping',amp:'blues'},
 {id:'fusion-guitar',title:'Fusion guitar swells',style:'legatoFusion',track:'comping',amp:'fusion'},
 {id:'funk-bass',title:'Electric bass · Funk and upper-register attacks',style:'funk',track:'bass'},
 {id:'fusion-bass',title:'Electric bass · sustained Fusion part',style:'legatoFusion',track:'bass'}];
function render(c,family){
 const chart=referenceChart(c.style),s={...DEFAULTS,...BACKING_STYLES[c.style].settings,...backingStyleInstruments(c.style),automaticBacking:true,
 backingStyle:c.style,key:chart.key,bpm:chart.bpm,beats:chart.beats,template:'custom',progression:true,customProgression:normalizeCustomProgression(chart.progression),
 soundLibrary:'expanded',sequenceActivity:'supporting',countIn:false,click:0,harmony:0,drums:true,bass:true,comping:true,sequence:true,
 drumsVolume:.25,bassVolume:.25,compingVolume:.25,sequenceVolume:.25};s.drumKit=resolveDrumKit(s);
 const e=new Engine(rate);e.installDrumKit(bank);e.configure(s);e.reset();const sourceNotes=[];
 if(family){const zones=families[family];assert.ok(zones?.length);
  if(c.track==='comping'){
   e.comping.banks['expanded:electricGuitar']=zones;
   // Candidate DI goes through only the sampler envelope, not the old per-note distortion.
   e.comping.shapes[s.compingTone]={...e.comping.shapes[s.compingTone],drive:0,cutoff:14000};
  }else{const bass=e.rhythm.bassInstrument,original=bass.noteOn.bind(bass),cursors=new Map();
   bass.noteOn=(midi,length,gain,style,instrument)=>{const z=recordedZone(zones,Math.max(24,Math.min(72,midi)),gain,cursors);sourceNotes.push({midi,rootMidi:z.rootMidi,source:z.path,velocity:gain});bass.banks[instrument]=[{...z,samples:[z.pcm]}];return original(midi,length,gain,style,instrument,'original');};
  }
 }
 const frames=Math.ceil(32*60/s.bpm*rate),audio=()=>new Float32Array(frames),stems={drums:audio(),bass:audio(),comping:audio(),sequenceLeft:audio(),sequenceRight:audio()},events=[];
 e.render(audio(),undefined,audio(),audio(),v=>events.push(v),audio(),v=>events.push(v),null,undefined,stems);
 return {stems,events,frames,bpm:s.bpm,sourceNotes};
}
async function raw(path,channels){const frames=channels[0].length,data=Buffer.alloc(frames*channels.length*4);for(let i=0;i<frames;i++)for(let ch=0;ch<channels.length;ch++){assert.ok(Number.isFinite(channels[ch][i]));data.writeFloatLE(channels[ch][i],(i*channels.length+ch)*4);}await writeFile(path,data);}
function measure(path,channels,encoded=false){const input=encoded?[]:['-f','f32le','-ar',String(rate),'-ac',String(channels)],r=spawnSync('ffmpeg',['-hide_banner',...input,'-i',path,'-af','loudnorm=print_format=json','-f','null','-'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const m=JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'),r.stderr.lastIndexOf('}')+1));return {lufs:Number(m.input_i),truePeakDb:Number(m.input_tp)};}
function encode(input,output,channels,gain){execFileSync('ffmpeg',['-v','error','-y','-f','f32le','-ar',String(rate),'-ac',String(channels),'-i',input,'-af',`volume=${gain}dB`,'-codec:a','libmp3lame','-b:a','160k',output]);}
const reports=[];
for(const c of cases){
 const baseline=render(c,null),variants=[{id:'current',label:'Current',description:'Current app recordings and processing',result:baseline}];
 for(const family of c.track==='comping'?['emily','direct']:['yr','swag']){
  const result=render(c,family);assert.deepEqual(result.events,baseline.events);
  for(const name of Object.keys(baseline.stems))if(name!==c.track)assert.deepEqual(result.stems[name],baseline.stems[name]);
  const label={emily:'Emilyguitar',direct:'Fender',yr:'Yamaha RBX',swag:'Swagbass'}[family];
  variants.push({id:family,label:label+(c.track==='comping'?' · DI':''),description:family==='direct'?'Unprocessed version of the current Fender source; a processing control, not a different guitar':family==='yr'?'Yamaha RBX finger recordings; sparse one-octave source map, transposed higher for upper notes':family==='swag'?'Flatwound bass; source dynamics and alternate takes retained':'Epiphone flatwound guitar; original DI recordings',result});
  if(c.track==='comping'){
   const input=join(cache,c.id+'-'+family+'-di.raw'),output=join(cache,c.id+'-'+family+'-amp.raw');await raw(input,[result.stems.comping]);
   execFileSync('python3',[new URL('./amp.py',import.meta.url).pathname,input,output,c.amp,join(cache,'cabinet.wav')]);
   const data=await readFile(output),pcm=new Float32Array(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));assert.equal(pcm.length,result.frames);
   variants.push({id:family+'-amp',label:label+' · amp',description:`${c.amp} amp model + recorded Deluxe Reverb speaker response`,result:{...result,stems:{...result.stems,comping:pcm}}});
   if(family==='emily'&&c.id==='clean-guitar'){
    const chorused=join(cache,c.id+'-emily-chorus.raw');
    execFileSync('python3',[new URL('./chorus.py',import.meta.url).pathname,output,chorused]);
    const bytes=await readFile(chorused),data=new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));assert.equal(data.length,result.frames*2);
    const left=new Float32Array(result.frames),right=new Float32Array(result.frames);for(let n=0;n<result.frames;n++){left[n]=data[n*2];right[n]=data[n*2+1];}
    variants.push({id:'emily-chorus',label:'Emilyguitar · amp + chorus',description:'Emily through the clean amp/cab, then subtle stereo chorus: 0.32 Hz, 14 ms delay, 1.3 ms depth, 18% wet; dry attack stays undelayed',stereo:[left,right],result:{...result,stems:{...result.stems,comping:pcm}}});
   }
  }
 }
 for(const v of variants){v.raw=join(cache,c.id+'-'+v.id+'-solo.raw');await raw(v.raw,v.stereo||[v.result.stems[c.track],v.result.stems[c.track]]);v.solo=measure(v.raw,2);}
 const target=Math.min(-23,...variants.map(v=>v.solo.lufs-v.solo.truePeakDb-2));
 for(const v of variants){
  v.sourceGainDb=variants[0].solo.lufs-v.solo.lufs;
  encode(v.raw,join(out,`${c.id}-${v.id}-solo.mp3`),2,target-v.solo.lufs);
  const s=v.result.stems,channels=[new Float32Array(baseline.frames),new Float32Array(baseline.frames)],gain=10**(v.sourceGainDb/20);
  for(let n=0;n<baseline.frames;n++)for(let ch=0;ch<2;ch++)channels[ch][n]=s.drums[n]+s.bass[n]*(c.track==='bass'?gain:1)+(v.stereo?v.stereo[ch][n]:s.comping[n])*(c.track==='comping'?gain:1)+(ch?s.sequenceRight[n]:s.sequenceLeft[n]);
  v.mixRaw=join(cache,c.id+'-'+v.id+'-mix.raw');await raw(v.mixRaw,channels);v.mix=measure(v.mixRaw,2);
 }
 const mixGain=Math.min(-20-variants[0].mix.lufs,...variants.map(v=>-2-v.mix.truePeakDb));
 const row={...c,bpm:baseline.bpm,bars:8,seconds:baseline.frames/rate,eventParity:true,unaffectedStemsIdentical:true,soloTargetLufs:target,variants:[]};
 for(const v of variants){encode(v.mixRaw,join(out,`${c.id}-${v.id}-mix.mp3`),2,mixGain);const encodedSolo=measure(join(out,`${c.id}-${v.id}-solo.mp3`),2,true),encodedMix=measure(join(out,`${c.id}-${v.id}-mix.mp3`),2,true);
  assert.ok(encodedSolo.truePeakDb<0&&encodedMix.truePeakDb<0);
  // Encoder padding can shift short-file integrated readings. Compare decoded
  // versions with the decoded reference, rather than only the pre-encode target.
  if(row.variants.length)assert.ok(Math.abs(encodedSolo.lufs-row.variants[0].solo.lufs)<.3,`${c.id}/${v.id} decoded loudness mismatch`);
  row.variants.push({id:v.id,label:v.label,description:v.description,sourceGainDb:v.sourceGainDb,solo:encodedSolo,mix:encodedMix,sourceNotes:v.result.sourceNotes});
 }
 reports.push(row);console.log('Verified',c.id,variants.length,'versions');
}
await writeFile(join(out,'comparisons.json'),JSON.stringify(reports,null,2)+'\n');
await writeFile(join(out,'sources.json'),JSON.stringify(provenance,null,2)+'\n');
for(const family of Object.keys(families))await copyFile(join(cache,'LICENSE-'+family),join(out,'LICENSE-'+family+'.txt'));
await copyFile(join(cache,'cabinet-source.md'),join(out,'cabinet-source.md'));
await copyFile(new URL('./round2.html',import.meta.url),join(out,'index.html'));
console.log('Audition complete: source hashes, event/stem parity, finite audio, encoded headroom and loudness checks passed.');
