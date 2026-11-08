import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {SONOR_DRUM_GROUPS} from '../src/audio/sonor-groups.js';import {SONOR_SAMPLE_FILES} from '../src/audio/sonor-samples.js';import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';import {BACKING_STYLES,resolveDrumKit} from '../src/practice/backing-styles.js';import {Rhythm} from '../src/audio/rhythm.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const kit=await readSampleBank(16000);
test('fusion uses the new Sonor recording library exclusively with verified provenance and complete articulations',()=>{
 const meta=JSON.parse(readFileSync(new URL('../src/audio/samples/sonor/sources.json',import.meta.url)));assert.equal(meta.license,'CC-BY-SA-4.0');assert.equal(meta.files.length,45);assert.ok(meta.files.reduce((sum,f)=>sum+f.bytes,0)<2.5*1024*1024);
 for(const f of meta.files)assert.equal(createHash('sha256').update(readFileSync(SONOR_SAMPLE_FILES[f.id])).digest('hex'),f.sha256);
 for(const id of ['fusionJazz','legatoFusion']){
  const s={...BACKING_STYLES[id].settings,backingStyle:id,soundLibrary:'expanded',drums:true,drumsVolume:.25,bass:false,comping:false,sequence:false};s.drumKit=resolveDrumKit(s);const names=sampleNamesForSettings(s);assert.equal(names.length,45);assert.ok(names.every(n=>n.startsWith('sonor')));
  const r=new Rhythm(16000,kit);r.expandedSounds=true;for(const name of ['kick','snare','hat','hatOpen','hatPedal','ride','rideBell','crash','rim','tomHigh','tomLow'])for(const gain of [.1,.3,.45,.6,.8]){let event;r.hitDrum(name,gain,0,0,0,0,e=>event=e,s.drumKit);assert.ok(event?.sampleId.startsWith('sonor'),name);assert.ok(names.includes(event.sampleId));}
  assert.deepEqual(sampleNamesForSettings({...s,mutedChannels:'drums'}),[]);
 }
 assert.equal(resolveDrumKit({...BACKING_STYLES.funk.settings,backingStyle:'funk',soundLibrary:'expanded'}),'tama');assert.equal(resolveDrumKit({...BACKING_STYLES.bossa.settings,backingStyle:'bossa',soundLibrary:'expanded'}),'latin');
 assert.ok(SONOR_DRUM_GROUPS.snareAccent.length===2);
});
test('new snare and tom attacks have greater high-frequency definition than the replaced recordings',()=>{
 const detail=x=>{let hi=0,total=0;for(let i=1;i<Math.min(x.length,3200);i++){const d=x[i]-x[i-1];hi+=d*d;total+=x[i]*x[i];}return hi/total;};
 assert.ok(detail(kit.sonorSnare1)>detail(kit.liveSnare1)*2);assert.ok(detail(kit.sonorTomHigh1)>detail(kit.liveTomHigh1)*2);
});
test('all kit profiles have comparable backbone levels and toms stay behind the backbeat',async()=>{
 const {DRUM_KITS}=await import('../src/audio/instrumentation.js');const snareLevels=[];
 const energy=(profile,piece,gain,times)=>{const r=new Rhythm(16000,kit);r.expandedSounds=true;const at=new Set(times.map(t=>t*16000));let sum=0;for(let n=0;n<16000*8;n++){if(at.has(n%32000))r.hitDrum(piece,gain,n,0,0,0,()=>{},profile);r.render(true,false);sum+=r.drums*r.drums;}return 10*Math.log10(sum/(16000*8));};
 for(const profile of Object.keys(DRUM_KITS)){
  const snare=energy(profile,'snare',.65,[.5,1.5]),kick=energy(profile,'kick',.7,[0,1]);snareLevels.push(snare);assert.ok(Math.abs(kick-snare)<4.5,profile+' kick/snare '+(kick-snare));
  for(const tom of ['tomHigh','tomLow']){const level=energy(profile,tom,.45,[1.5]);assert.ok(level<snare+.5&&level>snare-6,profile+' '+tom+' '+(level-snare));}
 }
 assert.ok(Math.max(...snareLevels)-Math.min(...snareLevels)<3.5);
});
