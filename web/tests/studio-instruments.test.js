import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {STUDIO_SAMPLE_ZONES} from '../src/audio/studio-zones.js';import {STUDIO_SAMPLE_FILES} from '../src/audio/studio-manifest.js';import {recordedZone,expandedBankForTone} from '../src/audio/sound-library.js';import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';import {CompingInstrument} from '../src/audio/comping.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const rate=16000,kit=await readSampleBank(rate),player=()=>{const p=new CompingInstrument(rate);p.soundLibrary='expanded';p.installKit(kit);return p;};
test('the bundled upgrade has seven free source families, verified recordings and documented redistribution licences',()=>{
 const meta=JSON.parse(readFileSync(new URL('../src/audio/samples/studio-instruments/sources.json',import.meta.url)));assert.equal(meta.files.length,244);assert.equal(Object.keys(STUDIO_SAMPLE_ZONES).length,7);for(const f of meta.files){assert.ok(['CC0-1.0','CC-BY-3.0','CC-BY-4.0'].includes(f.license));assert.match(f.revision,/^[a-f0-9]{40}$/);assert.equal(createHash('sha256').update(readFileSync(STUDIO_SAMPLE_FILES[f.id])).digest('hex'),f.sha256);assert.ok(f.seconds>0&&f.bytes>1000);}
});
test('real velocity layers change sample timbre and alternating guitar takes avoid replaying one recording',()=>{
 const cursors=new Map();assert.deepEqual([.1,.4,.65,.9].map(v=>recordedZone(STUDIO_SAMPLE_ZONES.piano,60,v,cursors).layer),[1,2,3,4]);
 const a=recordedZone(STUDIO_SAMPLE_ZONES.electricGuitar,60,.4,cursors),b=recordedZone(STUDIO_SAMPLE_ZONES.electricGuitar,60,.4,cursors);assert.notEqual(a.id,b.id);assert.equal(a.nominalMidi,b.nominalMidi);assert.equal(a.layer,b.layer);
 for(const midi of [55,65,76,85]){const z=recordedZone(STUDIO_SAMPLE_ZONES.electricGuitar,midi,.2,cursors);assert.ok(Math.abs(z.rootMidi-midi)<5);}
});
test('every comping and melodic source is genuinely sampled and loading excludes muted tracks and superseded banks',()=>{
 for(const [id,{settings}]of Object.entries(BACKING_STYLES))for(const channel of ['comping','sequence']){
  const tone=channel==='comping'?settings.compingTone:settings.sequenceTone,p=player();p.strike([67],1,.48,120,0,0,undefined,channel,tone);const v=p.voices.find(v=>v.active);assert.ok(v?.pcm&&v.sourceId?.startsWith('q'),id+' '+channel+' '+tone);
  const s={...settings,soundLibrary:'expanded',drums:false,bass:false,comping:false,sequence:false,[channel]:true,[channel+'Volume']:.25};const names=sampleNamesForSettings(s);assert.ok(names.includes(v.sourceId));assert.ok(names.every(n=>n.startsWith('q')),id);assert.deepEqual(sampleNamesForSettings({...s,mutedChannels:channel}),[]);
 }
});
test('organ sustain loops keep sounding and release cleanly; guitar chords have alternating string attacks',()=>{
 const organ=player();organ.strike([60],24,.45,120,0,0,undefined,'comping','drawbarOrgan');let late=0;for(let n=0;n<rate*10;n++){const s=organ.render();if(n>rate*8)late+=s*s;}assert.ok(late>.01);assert.ok(organ.voices.some(v=>v.active&&v.loopEnd>v.loopStart));for(let n=0;n<rate*6;n++)organ.render();assert.ok(!organ.voices.some(v=>v.active));
 const guitar=player();guitar.strike([60,64,67],2,.45,120,0,0,undefined,'comping','cleanGuitar');assert.deepEqual(guitar.voices.filter(v=>v.active).map(v=>v.delay),[0,96,192]);guitar.strike([60,64,67],2,.45,120,0,0,undefined,'comping','cleanGuitar');assert.deepEqual(guitar.voices.slice(3,6).map(v=>v.delay),[192,96,0]);
});
test('connected sampled flute notes crossfade into the sustained recording rather than repeating each breath attack',()=>{
 const p=player();p.strike([72],2,.5,120,0,0,undefined,'sequence','fluteLead');for(let n=0;n<100;n++)p.render();p.strike([74],2,.5,120,100,0,undefined,'sequence','fluteLead',0,null,'legato');const v=p.voices[1];assert.ok(v.samplePosition>=rate*.069);assert.equal(p.voices[0].releaseAt,p.voices[0].age+1);for(let n=0;n<rate;n++)assert.ok(Number.isFinite(p.render()));
});
test('the new sources retain stereo mix headroom at the mobile render rate with all instrument faders up',async()=>{
 const {Engine,DEFAULTS}=await import('../src/audio/engine.js'),{backingStyleInstruments,resolveDrumKit}=await import('../src/practice/backing-styles.js'),nativeRate=32000,native=await readSampleBank(nativeRate);
 for(const id of ['hardRock','legatoFusion','fusionJazz','neoSoul','traditionalJazz','funk']){
  const style=BACKING_STYLES[id],s={...DEFAULTS,...style.settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,soundLibrary:'expanded',key:9,mode:'dorian',chord:'min9',template:'single',progression:true,bpm:120,beats:4,countIn:false,click:0,harmony:0,drums:true,bass:true,comping:true,sequence:true,drumsVolume:1,bassVolume:1,compingVolume:1,sequenceVolume:1,sequenceActivity:'featured'};s.drumKit=resolveDrumKit(s);const e=new Engine(nativeRate);e.installDrumKit(native);e.configure(s);e.reset();const frames=nativeRate*8,click=new Float32Array(frames),left=new Float32Array(frames),right=new Float32Array(frames),band=new Float32Array(frames);e.render(click,undefined,left,right,undefined,band);let peak=0;for(let n=0;n<frames;n++){peak=Math.max(peak,Math.abs(click[n]+left[n]+band[n]),Math.abs(click[n]+right[n]+band[n]));}assert.ok(Number.isFinite(peak)&&peak<1,id+' peak '+peak);
 }
});
