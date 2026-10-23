import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine,padVoicing,padMotionNotes} from '../src/audio/engine.js';
import {SOUNDS,harmonyAt,progressionStep} from '../src/audio/music.js';
import {WAVE_LAYERS} from '../src/audio/waves.js';

const noop=()=>{};
function setup(settings={},rate=8000){
  const engine=new Engine(rate);
  engine.configure({countIn:false,click:0,harmony:1,key:9,chord:'major',sound:'bloom',...settings});
  engine.reset();return engine;
}
function render(engine,frames){
  const left=new Float32Array(frames),right=new Float32Array(frames);
  engine.render(new Float32Array(frames),noop,left,right);
  return {left,right};
}
function rms(samples){let energy=0;for(const sample of samples)energy+=sample*sample;return Math.sqrt(energy/samples.length);}
function brightness(samples){
  let derivative=0,energy=0;
  for(let i=1;i<samples.length;i++){derivative+=(samples[i]-samples[i-1])**2;energy+=samples[i]**2;}
  return Math.sqrt(derivative/energy);
}

test('all pads have evolving harmonic colour and a stable mono centre',()=>{
  const signatures=[];
  for(const sound of Object.keys(SOUNDS)){
    const {left,right}=render(setup({sound}),96000);
    const colours=Array.from({length:10},(_,index)=>brightness(left.subarray((index+2)*8000,(index+3)*8000)));
    // Normalised high-frequency energy removes simple volume breathing. The
    // sustained colour really changes, rather than only becoming louder.
    assert.ok((Math.max(...colours)-Math.min(...colours))/Math.min(...colours)>.02,sound);
    let monoEnergy=0,sideEnergy=0;
    for(let i=16000;i<left.length;i++){
      monoEnergy+=((left[i]+right[i])*.5)**2;
      sideEnergy+=((left[i]-right[i])*.5)**2;
      assert.ok(Number.isFinite(left[i]+right[i])&&Math.abs(left[i])<.5&&Math.abs(right[i])<.5,sound);
    }
    assert.ok(sideEnergy>monoEnergy*.005,`${sound}: stereo motion`);
    assert.ok(sideEnergy<monoEnergy*.3,`${sound}: centre remains present in mono`);
    signatures.push([rms(left),...colours]);
  }
  for(let a=0;a<signatures.length;a++)for(let b=a+1;b<signatures.length;b++){
    const distance=Math.hypot(...signatures[a].map((value,index)=>value-signatures[b][index]));
    assert.ok(distance>.015,`${Object.keys(SOUNDS)[a]} / ${Object.keys(SOUNDS)[b]} retain different tone profiles`);
  }
});

test('cinematic presets and pad shaping controls create distinct scale, motion and brightness',()=>{
  for(const id of ['horizon','aurora','cathedral','constellation','deepSpace'])assert.ok(SOUNDS[id],id);
  const character=settings=>{
    const {left,right}=render(setup({sound:'horizon',...settings}),96000);
    let mono=0,side=0,derivative=0,energy=0;
    for(let i=16001;i<left.length;i++){
      mono+=((left[i]+right[i])*.5)**2;side+=((left[i]-right[i])*.5)**2;
      derivative+=(left[i]-left[i-1])**2;energy+=left[i]**2;
    }
    return {width:side/mono,brightness:Math.sqrt(derivative/energy)};
  };
  assert.ok(character({padDepth:'epic'}).width>character({padDepth:'intimate'}).width*1.3);
  assert.ok(character({padBrightness:'luminous'}).brightness>character({padBrightness:'dark'}).brightness*1.08);
  assert.ok(character({padMovement:'expansive'}).brightness>character({padMovement:'still'}).brightness*1.08);
});

test('depth choices reshape harmony from compact to bass-weighted open voicings',()=>{
  const chord=[48,52,55,59,62,69];
  assert.deepEqual(padVoicing(chord,'intimate').map(note=>note.midi),chord);
  assert.deepEqual(padVoicing(chord,'wide').map(note=>note.midi),[36,52,55,59,62,69]);
  assert.deepEqual(padVoicing(chord,'epic').map(note=>note.midi),[36,43,52,59,62,69,72]);
  for(const depth of ['intimate','wide','epic']){
    const voicing=padVoicing(chord,depth);
    assert.ok(voicing.every(note=>chord.some(source=>(source-note.midi)%12===0)));
    assert.ok(new Set(voicing.map(note=>note.midi)).size===voicing.length);
  }
});

test('ambient drift voice cycles through upper chord colours only',()=>{
  for(const chord of [[48,52,55],[48,52,55,59,62,69],[48,51,54,58,61,63]]){
    const notes=padMotionNotes(chord);
    assert.ok(notes.length>=2);
    assert.ok(notes.every(note=>note>=67&&note<=86));
    assert.ok(notes.every(note=>chord.some(source=>(source-note)%12===0)));
    assert.equal(new Set(notes).size,notes.length);
  }
  const engine=setup({sound:'horizon',padMovement:'evolving',chord:'min13'}),heard=[];
  for(let block=0;block<8;block++){
    render(engine,8000);
    heard.push(engine.motionFrequency);
  }
  assert.ok(new Set(heard).size>2,'the drift voice changes chord tone over time');
});

test('enabling bass reduces the pad foundation without removing upper harmony',()=>{
  const without=setup({sound:'horizon',padDepth:'epic',bass:false});
  const withBass=setup({sound:'horizon',padDepth:'epic',bass:true});
  const levels=engine=>({low:engine.voices.filter(voice=>voice.role==='foundation').reduce((sum,voice)=>sum+voice.targetLevel,0),upper:engine.voices.filter(voice=>!['foundation',undefined].includes(voice.role)).reduce((sum,voice)=>sum+voice.targetLevel,0)});
  assert.ok(levels(withBass).low<levels(without).low*.6);
  assert.ok(levels(withBass).upper>levels(without).upper);
});

test('paired harmonic layers are bounded, seamless and pitch-band limited',()=>{
  for(const bands of Object.values(WAVE_LAYERS))for(const values of bands){
    assert.ok(values.every(value=>Number.isFinite(value)&&Math.abs(value)<=1));
    assert.equal(values[0],values.at(-1));
  }
});

test('chord changes preserve common notes and crossfade other voices at exact pitches',()=>{
  const engine=setup({key:0,chord:'major'});
  const before=render(engine,16000);
  const common=engine.voices.filter(voice=>voice.targetLevel>0).map(voice=>({voice,phase:voice.phase,frequency:voice.frequency}));
  engine.configure({chord:'maj7'});
  for(const note of common){
    assert.ok(engine.voices.includes(note.voice));assert.equal(note.voice.phase,note.phase);
    assert.equal(note.voice.frequency,note.frequency);assert.ok(note.voice.targetLevel>0);
  }
  const old=engine.padVoicing.map(note=>440*2**((note.midi-69)/12));
  engine.configure({key:6});
  const allowed=new Set([...old,...engine.padVoicing.map(note=>440*2**((note.midi-69)/12))]);
  const changed=render(engine,512);
  assert.ok(Math.abs(changed.left[0]-before.left.at(-1))<.08,'chord onset stays smooth');
  for(const voice of engine.voices)if(voice.level>.000001)assert.ok(allowed.has(voice.frequency),'no pitch slide between chords');
  assert.equal(engine.voices.length,12,'bounded oscillator pool');
});

test('sound and chord crossfades are independent of callback boundaries',()=>{
  const schedule=[
    [2300,{sound:'air'}],[4200,{chord:'maj9sharp11',mode:'lydian'}],
    [6300,{key:6}],[8100,{sound:'strings'}],[10001,{chord:'halfDim',mode:'locrian'}],
  ];
  const perform=block=>{
    const engine=setup(),left=new Float32Array(16000),right=new Float32Array(16000);
    let offset=0;
    for(const [end,settings] of [...schedule,[left.length,null]]){
      while(offset<end){
        const length=Math.min(block,end-offset);
        engine.render(new Float32Array(length),noop,left.subarray(offset,offset+length),right.subarray(offset,offset+length));
        offset+=length;
      }
      if(settings)engine.configure(settings);
    }
    return {left,right};
  };
  assert.deepEqual(perform(16000),perform(127));
});

test('full instrument mixes and repeated pad switches retain headroom and stop cleanly',()=>{
  const engine=setup({key:0,chord:'maj9sharp11',mode:'lydian',bpm:240,
    click:1,harmony:1,drums:true,bass:true,drumsVolume:1,bassVolume:1,bassPattern:'funk',
    sequence:true,sequenceVolume:1,sequenceDensity:1,sequenceRate:4});
  for(const sound of Object.keys(SOUNDS)){
    engine.configure({sound});
    const output=new Float32Array(8000);
    engine.render(output);
    assert.ok(output.every(value=>Number.isFinite(value)&&Math.abs(value)<1),sound);
  }
  engine.running=false;render(engine,16000);
  const stopped=render(engine,8000);
  assert.ok(stopped.left.every(value=>Math.abs(value)<1e-8));
  assert.ok(stopped.right.every(value=>Math.abs(value)<1e-8));
});

test('bass lookahead follows the next musical bar through tonic holds and selected loops',()=>{
  const engine=setup({key:0,progression:true,template:'major251',loopEnabled:true,loopStart:2,loopEnd:0,bpm:120});
  for(let bar=0;bar<5;bar++){
    engine.render(new Float32Array(bar===0?1:16000));
    const expected=harmonyAt(engine.settings,progressionStep(engine.settings,bar+1)).midi;
    assert.deepEqual(engine.nextChordMidi,expected);
  }
});
