import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {MODES,harmonyAt,PROGRESSIONS} from '../src/audio/music.js';
import {extensionChoices,extensionBlend} from '../src/audio/extensions.js';

function engine(settings={}){const result=new Engine(1200);result.configure({bpm:120,countIn:false,click:0,harmony:0,...settings});result.reset();return result;}
function render(engine,samples=3600){const audio=new Float32Array(samples),beats=[];engine.render(audio,event=>beats.push(event));return {audio,beats};}
const peak=audio=>Math.max(...audio.map(Math.abs));

test('metronome volume and mute control both pulse and polyrhythm without stopping the clock',()=>{
  const state=engine({click:.6,polyBeats:3});
  assert.ok(peak(render(state).audio)>.01);
  state.configure({mutedChannels:'click'});const quiet=render(state,6000);
  assert.ok(peak(quiet.audio.slice(-1200))<.000001);assert.ok(quiet.beats.length>0);
  assert.equal(state.settings.click,.6);assert.equal(state.running,true);
  state.configure({mutedChannels:'',click:0});assert.ok(peak(render(state,6000).audio.slice(-1200))<.000001);
  state.configure({click:.6});assert.ok(peak(render(state).audio)>.01);
});

test('backing channel mutes retain enabled parts and their levels while their voices age',()=>{
  const state=engine({drums:true,bass:true,comping:true,sequence:true,harmony:.4,mutedChannels:'harmony,drums,bass,comping,sequence'});
  assert.equal(peak(render(state).audio),0);
  assert.ok(state.rhythm.lastGrid>0);assert.equal(state.settings.drums,true);
  assert.equal(state.settings.harmony,.4);assert.equal(state.settings.drumsVolume,.35);
  state.configure({mutedChannels:''});assert.ok(peak(render(state).audio)>.001);
});

test('extension choices stay in the current mode for every tonic and mode',()=>{
  for(let key=0;key<12;key++)for(const [mode,definition] of Object.entries(MODES)){
    const harmony=harmonyAt({key,mode,chord:definition.chord,progression:false});
    const choices=extensionChoices(harmony);
    assert.ok(choices.length>0,`${key}/${mode} has extension choices`);
    for(const choice of choices)assert.ok(harmony.scalePcs.includes(choice.midi%12));
    const state=engine({key,mode,chord:definition.chord,extensionMorph:true});
    assert.ok(state.padVoicing.length<=12);
    for(const entry of state.padVoicing)assert.ok(harmony.scalePcs.includes((entry.midi%12+12)%12),`${key}/${mode}: ${entry.midi}`);
    assert.ok(state.padVoicing.some(entry=>entry.midi%12===harmony.midi[0]%12),'root is retained');
  }
});

test('extension weights evolve smoothly while root and chord clock stay fixed',()=>{
  const state=engine({key:9,mode:'dorian',chord:'min7',extensionMorph:true,extensionBars:4,harmony:.4});
  const before=state.padVoicing.map(entry=>state.padEntryWeight(entry));
  const chord=[...state.chordMidi],root=state.chordMidi[0];
  render(state,6000);
  assert.notDeepEqual(state.padVoicing.map(entry=>state.padEntryWeight(entry)),before);
  assert.deepEqual(state.chordMidi,chord);assert.equal(state.chordMidi[0],root);
  const choices=state.extensionCandidates;
  for(let beat=0;beat<32;beat+=.1)for(let index=0;index<choices.length;index++)assert.ok(Math.abs(extensionBlend(index,choices.length,beat,4,4)-extensionBlend(index,choices.length,beat+.001,4,4))<.001);
});

test('progression morphs use each jazz chord scale and reset cleanly when disabled',()=>{
  const settings={key:0,mode:'major',chord:'maj7',progression:true,template:'major251',extensionMorph:true};
  const state=engine(settings);
  for(let step=0;step<PROGRESSIONS.major251.steps.length;step++){
    state.setChord(step);const harmony=harmonyAt(settings,step);
    for(const choice of state.extensionCandidates)assert.ok(harmony.scalePcs.includes(choice.midi%12));
  }
  state.configure({extensionMorph:false});assert.equal(state.extensionCandidates.length,0);
  assert.ok(state.padVoicing.every(entry=>entry.extensionIndex===undefined));
});

test('mutes and evolving extensions remain independent of callback block sizes',()=>{
  const settings={key:9,mode:'dorian',chord:'min7',extensionMorph:true,polyBeats:3,click:.5,harmony:.4,mutedChannels:'click'};
  const whole=engine(settings),chunked=engine(settings),expected=render(whole,18000).audio,actual=new Float32Array(18000);
  for(let start=0;start<actual.length;start+=127)actual.set(render(chunked,Math.min(127,actual.length-start)).audio,start);
  assert.deepEqual(actual,expected);
});

test('polyrhythm has comparable onset energy to the main click at a shared level',()=>{
  const onsetEnergy=settings=>{
    const state=new Engine(48000);state.configure({bpm:120,countIn:false,click:1,harmony:0,...settings});state.reset();
    const audio=new Float32Array(1920);state.render(audio);
    return Math.sqrt(audio.reduce((sum,sample)=>sum+sample*sample,0)/audio.length);
  };
  const main=onsetEnergy({polyBeats:0});
  const poly=onsetEnergy({polyBeats:3,beatAccents:'0000'});
  assert.ok(poly/main>.7&&poly/main<1.1,`polyrhythm/main onset ratio: ${poly/main}`);
});
