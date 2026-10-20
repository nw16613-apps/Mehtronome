import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendedGrip} from '../src/guitar/grips.js';
import {POSITIONS,fretboardFor,diagramSvg,TUNING} from '../src/guitar/fretboard.js';
import {CHORDS,MODES,harmonyAt} from '../src/audio/music.js';
import {Engine} from '../src/audio/engine.js';

function checkGrip(info,board){
  const snapshot=JSON.stringify(board),grip=recommendedGrip(info,board);
  assert.ok(grip,`${info.name}${info.suffix} ${info.mode} ${board.shape}`);
  assert.equal(JSON.stringify(board),snapshot); // Recommendations cannot alter established CAGED fingerings.
  assert.ok(grip.notes.length>=3&&grip.notes.length<=4);
  assert.equal(new Set(grip.notes.map(n=>n.string)).size,grip.notes.length);
  assert.ok(grip.span<=3);
  for(const note of grip.notes){
    assert.ok(board.notes.some(n=>n.string===note.string&&n.fret===note.fret&&n.midi===note.midi));
    assert.ok(info.chordPcs.includes(note.pc));assert.equal(note.midi,TUNING[note.string]+note.fret);
    assert.ok(Number.isInteger(note.finger)&&note.finger>=1&&note.finger<=4);
  }
  const played=new Set(grip.notes.map(n=>n.pc));
  assert.deepEqual(grip.omitted,info.tones.filter((_,i)=>!played.has(info.chordPcs[i])));
  assert.equal(grip.muted.length,6-grip.notes.length);
  assert.ok(grip.muted.every(string=>!grip.notes.some(n=>n.string===string)));
  for(const barre of grip.barres)for(let string=barre.from;string<=barre.to;string++){
    assert.ok(grip.notes.some(n=>n.string===string&&n.fret>=barre.fret));
    assert.ok(grip.notes.filter(n=>n.finger===barre.finger).every(n=>n.fret===barre.fret));
  }
  return grip;
}

test('compact playable grips fit every chord, key and corrected CAGED position',()=>{
  for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++)for(const p of POSITIONS){
    const info=harmonyAt({key,mode:'major',chord});checkGrip(info,fretboardFor(info,p.shape));
  }
});

test('modal and progression grips voice the selected harmony, including parent-major positions',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++)for(const p of POSITIONS){
    const info=harmonyAt({key,mode,chord:definition.chord});checkGrip(info,fretboardFor(info,p.shape));
  }
  for(const step of [0,1,2])for(const p of POSITIONS){
    const info=harmonyAt({key:0,progression:true,template:'major251'},step);checkGrip(info,fretboardFor(info,p.shape));
  }
});

test('Cmaj9 recommendation retains root, third, seventh and ninth and discloses the omitted fifth',()=>{
  const info=harmonyAt({key:0,mode:'major',chord:'maj9'}),grip=checkGrip(info,fretboardFor(info,'A'));
  assert.deepEqual(new Set(grip.notes.map(n=>n.pc)),new Set([0,4,11,2]));
  assert.deepEqual(grip.omitted,['G']);
  const svg=diagramSvg(fretboardFor(info,'A'),false,MODES.major.degrees,'Grip',true,grip);
  assert.equal((svg.match(/class="grip-ring"/g)||[]).length,4);
  assert.equal((svg.match(/class="grip-finger"/g)||[]).length,4);
  assert.equal((svg.match(/class="grip-mute"/g)||[]).length,2);
  assert.ok(svg.includes('recommended chord grip, finger'));
  assert.ok(svg.includes('characteristic-ring'));
  assert.ok(!diagramSvg(fretboardFor(info,'A'),false,MODES.major.degrees,'Scale',true).includes('grip-active'));
});

test('grip audition sounds the exact fretted pitches and stays off the metronome, sequence and rhythm buses',()=>{
  const settings={key:0,mode:'major',chord:'maj9',countIn:false,sequence:true,drums:true,bass:true,gapEnabled:true,gapPlayBars:1,gapMuteBars:1};
  const info=harmonyAt(settings),grip=recommendedGrip(info,fretboardFor(info,'C'));
  const engine=new Engine(8000);engine.configure(settings);engine.audition(0,grip.notes.map(n=>n.midi));
  assert.deepEqual(engine.chordMidi,grip.notes.map(n=>n.midi));
  assert.deepEqual(engine.frequencies,grip.notes.map(n=>440*2**((n.midi-69)/12)));
  const click=new Float32Array(8000),left=new Float32Array(8000),right=new Float32Array(8000),rhythm=new Float32Array(8000),beats=[];
  engine.render(click,e=>beats.push(e),left,right,undefined,rhythm);
  assert.ok(left.some(x=>Math.abs(x)>.01));assert.ok(click.every(x=>x===0));assert.ok(rhythm.every(x=>x===0));assert.deepEqual(beats,[]);
  engine.running=false;engine.render(click,()=>{},left,right,undefined,rhythm);
  engine.render(click,()=>{},left,right,undefined,rhythm);assert.ok(left.every(x=>Math.abs(x)<1e-8));
  engine.reset();assert.deepEqual(engine.chordMidi,info.midi);
});

test('acoustic grips strum exact pitches independently of the backing sound and stop cleanly', () => {
  const render = sound => {
    const engine = new Engine(48000);
    engine.configure({sound,harmony:.7,sequence:true,drums:true,bass:true});
    engine.audition(0,[48,55,59,64],true);
    assert.deepEqual(engine.chordMidi,[48,55,59,64]);
    assert.deepEqual(engine.guitar.voices.map(v=>v.start),[0,1056,2112,3168]);
    const dry=new Float32Array(48000), left=new Float32Array(48000), right=new Float32Array(48000), rhythm=new Float32Array(48000), wet=new Float32Array(48000);
    engine.render(dry,undefined,left,right,undefined,rhythm,undefined,wet);
    assert.ok(left.some(v=>Math.abs(v)>.01));
    assert.ok(wet.every(v=>v===1));
    for(const buffer of [dry,rhythm]) assert.ok(buffer.every(v=>v===0));
    assert.deepEqual(left,right);
    engine.running=false;
    const release=new Float32Array(48000);
    engine.render(release);
    assert.ok(release.slice(-1000).every(v=>Math.abs(v)<.00001));
    return left;
  };
  assert.deepEqual(render('warm'),render('glass'));
});
