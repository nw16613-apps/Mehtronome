import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Engine,DEFAULTS} from '../../web/src/audio/engine.js';
import {referenceBasePlan,referencePlanKey} from '../../web/src/audio/reference-performances.js';
import {readSampleBank} from '../../web/scripts/read-sample-bank.mjs';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../../web/src/practice/backing-styles.js';
import {normalizeCustomProgression} from '../../web/src/practice/custom-progression.js';
const output=new URL('./prepared/',import.meta.url);await mkdir(output,{recursive:true});
const rate=32000,bpm=100,beatSeconds=60/bpm;
const changes=[['F9',0,16],['B♭9',5,8],['F9',0,8],['C9',7,4],['B♭9',5,4],['F9',0,4],['C9',7,4]];
let start=0;const chart=changes.map(([symbol,root,beats])=>{const result={symbol,root,beats,startBeat:start,startSeconds:start*beatSeconds,endSeconds:(start+beats)*beatSeconds};start+=beats;return result;});
const settings={...DEFAULTS,...BACKING_STYLES.blues.settings,...backingStyleInstruments('blues'),automaticBacking:true,backingStyle:'blues',
 bpm,beats:4,key:5,progression:true,template:'custom',customProgression:normalizeCustomProgression({name:'Original 12-bar F blues audio guide',steps:chart.map(h=>({root:h.root,chord:'dom9',mode:'mixolydian',beats:h.beats}))}),
 extensionMorph:false,loopEnabled:false,countIn:false,click:0,harmony:0,sequence:false,drums:true,bass:true,comping:true,
 drumsVolume:.45,bassVolume:.45,compingVolume:.45,sequenceVolume:0,backingHumanize:.4,soundLibrary:'expanded',sequenceActivity:'supporting'};
settings.drumKit=resolveDrumKit(settings);
const bank=await readSampleBank(rate),engine=new Engine(rate);
engine.installDrumKit(bank);engine.configure(settings,{key:referencePlanKey(settings),plan:referenceBasePlan(settings)});engine.reset();
const frames=Math.round(start*beatSeconds*rate),click=new Float32Array(frames),left=new Float32Array(frames),right=new Float32Array(frames),rhythm=new Float32Array(frames);
engine.render(click,undefined,left,right,undefined,rhythm);
let peak=0;for(let i=0;i<frames;i++){left[i]+=rhythm[i];right[i]+=rhythm[i];if(!Number.isFinite(left[i]+right[i]))throw new Error('Non-finite audio');peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
if(peak<.001)throw new Error('Silent guide');const gain=Math.min(1,.84/peak);
const wav=Buffer.alloc(44+frames*4);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(frames*4,40);
for(let i=0;i<frames;i++){const envelope=Math.min(1,i/(rate*.008),(frames-1-i)/(rate*.008));wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,left[i]*gain*envelope))*32767),44+i*4);wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,right[i]*gain*envelope))*32767),46+i*4);}
await writeFile(new URL('original-f-blues-guide.wav',output),wav);
const receipt={generatedByAI:false,kind:'current-arranger audio guide',originalComposition:true,style:'blues',key:'F',bpm,metre:'4/4',bars:12,durationSeconds:frames/rate,sampleRate:rate,channels:2,drumKit:settings.drumKit,melodicLead:false,chords:chart,sourcePeak:peak,outputGain:gain,sha256:createHash('sha256').update(wav).digest('hex')};
await writeFile(new URL('guide.json',output),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
