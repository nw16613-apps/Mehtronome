import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SEQUENCE_PATTERNS,SEQUENCE_ROLES,musicalSequenceStep,sequenceStep} from '../src/audio/sequence.js';
import {Engine,melodicNotePool,melodicRoleContext} from '../src/audio/engine.js';
import {harmonyAt} from '../src/audio/music.js';
import {modalPentatonicPcs} from '../src/guitar/superimposition.js';

function setup(settings={}){
  const engine=new Engine(8000);
  engine.configure({countIn:false,click:0,harmony:0,sequence:true,sequenceRole:'pattern',sequenceDensity:1,sequenceVolume:1,sequencePattern:'up',bpm:120,...settings});
  engine.reset();return engine;
}

test('sequence subdivisions and swing use exact sample-clock boundaries',()=>{
  for(const [rate,swing,expected] of [
    [2,0,[0,2000,4000,6000]],
    [2,.5,[0,2500,4000,6500]],
    [4,.5,[0,1250,2000,3250]],
    [3,.5,[0,1334,2667,4000]],
  ]){
    const engine=setup({sequenceRate:rate,sequenceSwing:swing});const notes=[];
    engine.render(new Float32Array(8000),()=>{},null,null,note=>notes.push(note));
    assert.deepEqual(notes.slice(0,4).map(n=>n.sample),expected);
  }
});

test('all sequence patterns follow the harmony, respect count-in and are silent during chord previews',()=>{
  for(const pattern of Object.keys(SEQUENCE_PATTERNS)){
    const engine=setup({countIn:true,progression:true,template:'major251',sequencePattern:pattern});
    const notes=[];const output=new Float32Array(8000*12);
    engine.render(output,()=>{},null,null,note=>notes.push(note));
    assert.ok(output.subarray(0,16000).every(x=>x===0));
    assert.ok(notes.length>4);
    assert.ok(notes[0].sample>=16000 && notes[0].sample<20000);
    if(pattern!=='voiceLead')for(const note of notes)assert.ok(harmonyAt(engine.settings,note.step).midi.includes(note.midi-12));
    assert.ok(notes.some(n=>n.step===1));
    engine.audition(1);const previews=[];
    engine.render(new Float32Array(8000),()=>{},null,null,note=>previews.push(note));
    assert.equal(previews.length,0);
  }
});

test('melodic note sources expose chord, mode, modal pentatonic and guide-tone pools',()=>{
  const settings={...new Engine(8000).settings,countIn:false,key:9,mode:'dorian',chord:'min13'};
  const harmony=harmonyAt(settings,0),chord=harmony.midi;
  assert.deepEqual(melodicNotePool('chord',harmony,chord),chord);
  assert.equal(melodicNotePool('mode',harmony,chord).length,7);
  assert.deepEqual(melodicNotePool('pentatonic',harmony,chord).map(n=>n%12),[9,0,4,6,7]);
  assert.deepEqual(melodicNotePool('guide',harmony,chord),[chord[1],chord[3]]);
});

test('musical roles retain a modal hook and target changing harmony',()=>{
  const settings={...new Engine(8000).settings,key:9,mode:'dorian',chord:'min13',progression:true,template:'modal_dorian',sequenceRole:'modalHook'};
  const current=harmonyAt(settings,0),next=harmonyAt(settings,1);
  const context=melodicRoleContext(settings,current,next,current.midi,next.midi);
  assert.deepEqual(context.modalHook.map(note=>note%12),[9,4,6,4]);
  assert.ok(context.modalHook.some(note=>note%12===6),'A Dorian hook features F♯');
  assert.deepEqual(context.chordResponse,current.midi);
  assert.deepEqual(context.nextChord,next.midi);
  assert.equal(Object.keys(SEQUENCE_ROLES).length,6);
});

test('musical phrases repeat deliberate cells with space and a voice-led cadence',()=>{
  const base={sequenceRole:'modalHook',sequenceRate:2,beats:4,sequencePhraseBars:4,sequenceDensity:.5,sequenceDevelopment:'subtle',sequenceInteraction:'independent'};
  const phrase=Array.from({length:32},(_,grid)=>musicalSequenceStep(base,grid,4));
  assert.ok(phrase.slice(0,8).filter(Boolean).length>=2);
  assert.ok(phrase.slice(8,24).every(note=>note===null),'middle bars leave space at sparse activity');
  assert.equal(phrase.filter(Boolean).at(-1)?.target,'next');
  const stableA=phrase.slice(0,8).filter(Boolean).map(note=>note.index);
  const stableB=phrase.slice(24).filter(Boolean).map(note=>note.index);
  assert.deepEqual(stableB.slice(0,-1),stableA.slice(0,-1));
  const answers=Array.from({length:8},(_,grid)=>musicalSequenceStep({...base,sequenceInteraction:'answerDrums',sequenceDensity:1},grid,4));
  assert.notDeepEqual(answers.map(Boolean),phrase.slice(0,8).map(Boolean));
});

test('default modal-hook playback states the colour note and repeats on the sample clock',()=>{
  const settings={sequenceRole:'modalHook',sequencePhraseBars:4,sequenceDevelopment:'subtle',sequenceInteraction:'independent',sequenceDensity:.5,key:9,mode:'dorian',chord:'min13'};
  const engine=setup(settings),notes=[];
  engine.render(new Float32Array(64000),()=>{},null,null,note=>notes.push(note));
  assert.ok(notes.length>=6);assert.ok(notes.every(note=>note.role==='modalHook'));
  assert.ok(notes.some(note=>note.midi%12===6),'the hook includes Dorian’s F♯');
  assert.deepEqual(notes.slice(0,2).map(note=>note.midi%12),notes.slice(-3,-1).map(note=>note.midi%12));
  const chordPcs=new Set(harmonyAt(engine.settings,0).chordPcs);
  assert.ok(chordPcs.has(notes.at(-1).midi%12),'the phrase resolves to the nearest chord tone');
  assert.ok(notes.filter(note=>note.grid%8===0).every(note=>chordPcs.has(note.midi%12)));
});

test('sequencer modal pentatonics match the curated Guitar reference choice in every mode and key',()=>{
  for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian','melodic_minor','dorian_b2','lydian_augmented','lydian_dominant','mixolydian_b6','locrian_natural2','altered','harmonic_minor','locrian_natural6','ionian_sharp5','dorian_sharp4','phrygian_dominant','lydian_sharp2','ultralocrian'])for(let key=0;key<12;key++){
    const harmony=harmonyAt({key,mode,chord:'min7'},0);
    assert.deepEqual(melodicNotePool('pentatonic',harmony,harmony.midi).map(note=>note%12),modalPentatonicPcs(harmony),`${key}/${mode}`);
  }
  const lydian=harmonyAt({key:0,mode:'lydian',chord:'maj7sharp11'},0);
  assert.deepEqual(melodicNotePool('pentatonic',lydian,lydian.midi).map(note=>note%12),[0,4,6,7,11]);
});

test('formula patterns retain their cells',()=>{
  const indices=pattern=>Array.from({length:8},(_,grid)=>sequenceStep(pattern,grid,7,2)?.index??null);
  assert.deepEqual(indices('formula1235'),[0,1,2,4,1,2,3,5]);
  assert.deepEqual(indices('formula1324'),[0,2,1,3,1,3,2,4]);
  assert.deepEqual(indices('thirds'),[0,2,1,3,2,4,3,5]);
});

test('progression-leading phrase targets a note in the coming chord',()=>{
  const engine=setup({progression:true,template:'major251',sequencePattern:'voiceLead',sequenceRate:2,beats:4});
  const notes=[];engine.render(new Float32Array(32000),()=>{},null,null,n=>notes.push(n));
  const final=notes.find(n=>n.grid===7);
  const next=harmonyAt(engine.settings,1).midi.map(n=>n+12);
  assert.ok(final);assert.ok(next.some(n=>n%12===final.midi%12));
});

test('sequence audio has its own volume, density and enable switch',()=>{
  for(const settings of [{sequence:false},{sequenceVolume:0},{sequenceDensity:0}]){
    const engine=setup(settings);const output=new Float32Array(8000);
    engine.render(output);assert.ok(output.every(x=>x===0));
  }
  const engine=setup();const output=new Float32Array(8000);
  engine.render(output);assert.ok(output.some(x=>Math.abs(x)>.01));
  engine.configure({sequence:false});engine.render(new Float32Array(16000));
  engine.render(output);assert.ok(output.every(x=>Math.abs(x)<1e-8));
});

test('evolving stereo pad and sequence are block-size independent, bounded and fade fully on stop',()=>{
  const settings={sound:'bloom',harmony:1,chord:'maj9sharp11',mode:'lydian',sequencePattern:'updown',sequenceRate:3,bpm:137};
  const a=setup(settings),b=setup(settings);
  const left=new Float32Array(40000),right=new Float32Array(40000);
  const actual=new Float32Array(40000),actualRight=new Float32Array(40000);
  a.render(new Float32Array(40000),()=>{},left,right);
  for(let offset=0;offset<actual.length;offset+=128)b.render(new Float32Array(Math.min(128,actual.length-offset)),()=>{},actual.subarray(offset,offset+128),actualRight.subarray(offset,offset+128));
  assert.deepEqual(actual,left);assert.deepEqual(actualRight,right);
  assert.notDeepEqual(left,right);
  for(const samples of [left,right])assert.ok(samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1));
  a.running=false;a.render(new Float32Array(16000));
  a.render(new Float32Array(40000),()=>{},left,right);
  assert.ok(left.every(x=>Math.abs(x)<1e-8));assert.ok(right.every(x=>Math.abs(x)<1e-8));
});

test('enabling a sequence mid-beat waits for the next subdivision',()=>{
  const engine=setup({sequence:false});const notes=[];
  engine.render(new Float32Array(1500));
  engine.configure({sequence:true});
  engine.render(new Float32Array(3000),()=>{},null,null,note=>notes.push(note));
  assert.deepEqual(notes.map(n=>n.sample),[2000,4000]);
});


test('new melodic contours and rhythmic rests form distinct, repeatable phrases',()=>{
  const phrase=pattern=>Array.from({length:16},(_,grid)=>sequenceStep(pattern,grid,4,2)?.index??null);
  assert.deepEqual(phrase('rootColours').slice(0,8),[0,1,0,2,0,3,0,1]);
  assert.deepEqual(phrase('alberti').slice(0,8),[0,3,1,3,0,3,1,3]);
  assert.deepEqual(phrase('skips').slice(0,8),[0,2,1,3,2,0,3,1]);
  assert.deepEqual(phrase('cascade').slice(0,8),[3,2,1,0,2,1,0,3]);
  assert.deepEqual(phrase('offbeat').slice(0,8),[null,0,null,1,null,2,null,3]);
  assert.deepEqual(phrase('tresillo').slice(0,8),[0,null,null,1,null,null,3,null]);
  assert.deepEqual(phrase('clave'),[0,null,null,2,null,null,1,null,null,null,3,null,1,null,null,null]);
  assert.deepEqual(phrase('wander'),phrase('wander'));
  assert.ok(phrase('wander').includes(null));
  for(const pattern of Object.keys(SEQUENCE_PATTERNS))for(const length of [1,2,3,4,6])for(let grid=0;grid<100;grid++){
    const note=sequenceStep(pattern,grid,length,3);
    if(note){assert.ok(note.index>=0&&note.index<length);assert.ok(note.velocity>0&&note.velocity<=1);}
  }
});

test('wandering sequence is independent of render block size across chord changes',()=>{
  const settings={sequencePattern:'wander',progression:true,template:'major251'};
  const a=setup(settings),b=setup(settings),expected=[],actual=[];
  a.render(new Float32Array(80000),undefined,null,null,n=>expected.push(n));
  for(let i=0;i<80000;i+=128)b.render(new Float32Array(Math.min(128,80000-i)),undefined,null,null,n=>actual.push(n));
  assert.deepEqual(actual,expected);
  assert.ok(new Set(expected.map(n=>n.step)).size>1);
});
