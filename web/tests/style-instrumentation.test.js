import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CompingInstrument} from '../src/audio/comping.js';
import {Rhythm} from '../src/audio/rhythm.js';
import {SampledBass} from '../src/audio/bass.js';
import {Engine} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {INSTRUMENT_SAMPLE_ZONES} from '../src/audio/instrument-samples.js';
import {DRUM_KITS} from '../src/audio/instrumentation.js';
const metadata=JSON.parse(readFileSync(new URL('../src/audio/samples/band/sources.json',import.meta.url)));
const kit=Object.fromEntries(metadata.files.map(file=>{
 const data=readFileSync(new URL('../src/audio/samples/band/'+file.id+'.wav',import.meta.url));
 assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.readUInt32LE(24),32000);assert.equal(data.readUInt16LE(22),1);assert.equal(data.readUInt16LE(34),16);
 assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256);
 return [file.id,Float32Array.from({length:(data.length-44)/2},(_,i)=>data.readInt16LE(44+i*2)/32768)];
}));
test('genre assignments provide recorded guitar/piano/upright banks and keep electric keys for fusion, funk and soul',()=>{
 const expected={popRock:'cleanGuitar',traditionalJazz:'acousticPiano',fusionJazz:'brightTine',blues:'bluesGuitar',motown:'acousticPiano',funk:'clav',neoSoul:'brightTine',bossa:'nylonGuitar',latin:'acousticPiano',ballad:'softPiano'};
 for(const [id,tone]of Object.entries(expected)){assert.equal(BACKING_STYLES[id].settings.compingTone,tone);assert.ok(DRUM_KITS[backingStyleInstruments(id).drumKit]);}
 assert.deepEqual(INSTRUMENT_SAMPLE_ZONES.upright.map(z=>z.rootMidi),[28,36,42,49,52]);
});
test('real samples are selected by nearest pitch and sampled comping stays finite, bounded and releases when muted',()=>{
 for(const [tone,bank]of [['acousticPiano','piano'],['softPiano','piano'],['cleanGuitar','electricGuitar'],['bluesGuitar','electricGuitar'],['nylonGuitar','nylonGuitar']]){
  const instrument=new CompingInstrument(32000);instrument.installKit(kit);instrument.strike([57,60,64],.3,.7,120,0,0,null,'comping',tone);
  const first=instrument.voices[0],nearest=INSTRUMENT_SAMPLE_ZONES[bank].reduce((a,b)=>Math.abs(a.rootMidi-57)<Math.abs(b.rootMidi-57)?a:b);
  assert.equal(first.pcm,kit[nearest.id]);assert.ok(Math.abs(first.sampleIncrement-2**((57-nearest.rootMidi)/12))<1e-12);
  let energy=0;for(let i=0;i<96000;i++){const value=instrument.render();assert.ok(Number.isFinite(value)&&Math.abs(value)<2);energy+=value*value;}
  assert.ok(energy>1,tone);assert.ok(instrument.voices.every(v=>!v.active));
  instrument.strike([57,60,64],.1,.7,120,0,0,null,'comping',tone);for(let i=0;i<96000;i++)assert.equal(instrument.render(false),0);assert.ok(instrument.voices.every(v=>!v.active));
 }
});
test('upright plays the selected recorded octave and engine reset retains installed comping banks',()=>{
 const bass=new SampledBass(32000,kit);bass.noteOn(36,.4,.5,'walk','upright');assert.equal(bass.voices[0].sample,kit.upright36);assert.equal(bass.voices[0].increment,1);
 const engine=new Engine(32000);engine.installDrumKit(kit);engine.reset();assert.equal(engine.comping.banks.piano[0].pcm,kit.piano55);
});
test('Motown adds tambourine only to its kit and drum treatments change the rendered attack',()=>{
 const render=id=>{const engine=new Engine(32000);engine.installDrumKit(kit);engine.configure({...BACKING_STYLES[id].settings,drums:true,bass:false,comping:false,countIn:false,bpm:120,click:0,harmony:0});engine.reset();const events=[];engine.render(new Float32Array(64000),undefined,null,null,null,new Float32Array(64000),e=>events.push(e));return events;};
 const attack=profile=>{const rhythm=new Rhythm(32000);rhythm.hitDrum('snare',.6,0,0,0,0,()=>{},profile);return Array.from({length:4000},()=>{rhythm.render(true,false);return rhythm.drums;});};assert.notDeepEqual(attack('rock'),attack('soft'));
 assert.ok(render('motown').some(e=>e.type==='tambourine'));assert.ok(!render('popRock').some(e=>e.type==='tambourine'));
});
