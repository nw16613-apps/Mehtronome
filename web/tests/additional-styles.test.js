import {ensembleDrums} from '../src/audio/ensemble-arrangements.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {ADDITIONAL_STYLES,additionalDrumCell} from '../src/audio/additional-styles.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';import {Engine} from '../src/audio/engine.js';import {Rhythm} from '../src/audio/rhythm.js';import {backingSubdivision} from '../src/audio/groove-time.js';import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';import {SAMPLE_FILES} from '../src/audio/sample-manifest.js';
const rate=8000;
function settings(id){return {...BACKING_STYLES[id].settings,beats:ADDITIONAL_STYLES[id].beats,bpm:120,key:9,mode:'dorian',chord:'min7',drums:true,bass:true,comping:true,sequence:true,drumsVolume:.25,bassVolume:.25,compingVolume:.25,sequenceVolume:.25,countIn:false,click:0,harmony:0,backingHumanize:0,backingVariation:1};}
function decode(url){const b=readFileSync(url);let data,sr;for(let o=12;o+8<=b.length;){const n=b.readUInt32LE(o+4),tag=b.toString('ascii',o,o+4);if(tag==='fmt ')sr=b.readUInt32LE(o+12);if(tag==='data')data=b.subarray(o+8,o+8+n);o+=8+n+(n%2);}assert.ok(data&&sr);return Float32Array.from({length:Math.floor(data.length/2*rate/sr)},(_,i)=>data.readInt16LE(Math.min(data.length/2-1,Math.floor(i*sr/rate))*2)/32768);}
const names=new Set(Object.keys(ADDITIONAL_STYLES).flatMap(id=>sampleNamesForSettings(settings(id)))),kit=Object.fromEntries([...names].map(id=>[id,decode(SAMPLE_FILES[id])]));
test('all additional styles load their required recorded instruments and percussion, with different full-band phrases',()=>{
 assert.equal(Object.keys(ADDITIONAL_STYLES).length,10);const signatures=[];
 for(const [id,style]of Object.entries(ADDITIONAL_STYLES)){
  const s=settings(id),e=new Engine(rate);e.installDrumKit(kit);e.configure(s);e.reset();const events=[],melody=[],frames=style.beats*4000*8,dry=new Float32Array(frames);e.render(new Float32Array(frames),undefined,null,null,n=>melody.push(n),dry,n=>events.push(n));
  assert.ok(events.some(n=>n.type==='bass'),id);assert.ok(events.some(n=>n.type==='comping'),id);assert.ok(melody.length,id);assert.ok(dry.every(n=>Number.isFinite(n)&&Math.abs(n)<=1),id);assert.ok(dry.some(n=>Math.abs(n)>.001),id);
  // The active ensemble can omit legacy kit gestures within this eight-bar window.
  const written=Array.from({length:8},(_,bar)=>ensembleDrums(s,bar)||additionalDrumCell(id,bar,true,false));
  for(const type of new Set(written.flatMap(bar=>bar.map(n=>n[1]))))assert.ok(events.some(n=>n.type===type),id+' missing '+type);
  assert.ok(events.filter(n=>n.type==='comping').every(n=>n.notes.every(midi=>[9,11,0,2,4,6,7].includes(midi%12))),id);
  signatures.push(JSON.stringify(events.map(n=>[n.type,n.sample,n.midi,n.notes])));
 }
 assert.equal(new Set(signatures).size,10);
});
test('one-drop omits the downbeat kick and keeps kick/cross-stick together on beat three',()=>{
 const r=new Rhythm(rate),events=[];r.hitDrum=(type,gain,sample,step,beat,sub)=>events.push({type,beat,sub});const s=settings('reggae');for(let beat=0;beat<4;beat++)for(let sub=0;sub<4;sub++)r.playDrums(s,sub,beat,0,0,0,()=>{});
 assert.deepEqual(events.filter(e=>e.type==='kick').map(e=>[e.beat,e.sub]),[[2,0]]);assert.ok(events.some(e=>e.type==='rim'&&e.beat===2&&e.sub===0));
});
test('compound soul subdivisions are equally spaced triplets and Afro-Cuban bell orientation survives fills',()=>{
 assert.deepEqual([0,.32,1/3,.65,2/3,.99].map(p=>backingSubdivision(p,'soul128')),[0,0,1,1,2,2]);
 const bell=bar=>additionalDrumCell('afroCuban68',bar,true,true).filter(n=>n[1]==='cowbell');for(let bar=0;bar<8;bar++)assert.deepEqual(bell(bar),ADDITIONAL_STYLES.afroCuban68.drums[bar%4].filter(n=>n[1]==='cowbell'));
 assert.equal(ADDITIONAL_STYLES.jazzWaltz.beats,3);assert.equal(ADDITIONAL_STYLES.afroCuban68.beats,3);
});
test('hard rock requires recorded driven guitar and remains distinct from legato fusion',()=>{
 for(const id of ['hardRock']){const wanted=sampleNamesForSettings({...settings(id),mutedChannels:'drums,bass'});assert.ok(wanted.some(id=>id.startsWith('electricGuitar')));assert.equal(BACKING_STYLES[id].settings.compingTone,'drivenGuitar');}
 assert.equal(BACKING_STYLES.fusionJazz.settings.compingTone,'brightTine');assert.notDeepEqual(ADDITIONAL_STYLES.legatoFusion.base,ADDITIONAL_STYLES.hardRock.base);
});
