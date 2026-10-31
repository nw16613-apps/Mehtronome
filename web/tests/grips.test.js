import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendedGrip,CAGED_GRIP_SHAPES} from '../src/guitar/grips.js';
import {POSITIONS,fretboardFor,diagramSvg,TUNING,cagedPositionFor} from '../src/guitar/fretboard.js';
import {CHORDS,MODES,harmonyAt} from '../src/audio/music.js';
import {Engine} from '../src/audio/engine.js';

function checkGrip(info,board){
  const snapshot=JSON.stringify(board),grip=recommendedGrip(info,board);
  assert.ok(grip,`${info.name}${info.suffix} ${info.mode} ${board.shape}`);
  assert.equal(JSON.stringify(board),snapshot); // Recommendations cannot alter established CAGED fingerings.
  assert.ok(grip.notes.length>=3&&grip.notes.length<=6);
  assert.equal(new Set(grip.notes.map(n=>n.string)).size,grip.notes.length);
  assert.ok(grip.span<=3);
  for(const note of grip.notes){
    assert.ok(note.fret>=board.start&&note.fret<=board.end);
    assert.ok(info.chordPcs.includes(note.pc));assert.equal(note.midi,TUNING[note.string]+note.fret);
    assert.ok(Number.isInteger(note.finger)&&note.finger>=1&&note.finger<=4);
  }
  assert.equal(grip.framework,cagedPositionFor(board).shape);
  const skeleton=CAGED_GRIP_SHAPES[grip.framework];
  assert.equal(grip.notes[0].pc,board.rootPc);
  assert.ok(grip.notes.some(n=>n.string===skeleton.rootString&&n.pc===board.rootPc));
  assert.ok(grip.notes.every(n=>skeleton.frets[n.string]!==null));
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

test('shape-derived playable grips fit every chord, key and corrected CAGED position',()=>{
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

test('Cmaj9 recommendation retains root, third, seventh and ninth and discloses omissions',()=>{
  const info=harmonyAt({key:0,mode:'major',chord:'maj9'}),grip=checkGrip(info,fretboardFor(info,'A'));
  for(const pc of [0,4,11,2])assert.ok(grip.notes.some(n=>n.pc===pc));
  const svg=diagramSvg(fretboardFor(info,'A'),false,MODES.major.degrees,'Grip',true,grip);
  assert.equal((svg.match(/class="grip-ring"/g)||[]).length,grip.notes.length);
  assert.equal((svg.match(/class="grip-finger"/g)||[]).length,0);
  assert.equal((svg.match(/class="grip-mute"/g)||[]).length,grip.muted.length);
  assert.ok(svg.includes('recommended chord tone'));
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

// Golden shapes are independent of the scale-position geometry. In particular,
// A Dorian's E framework lives in the parent scale's D geometry.
test('major triads reproduce all five standard movable CAGED skeletons in every key',()=>{
 for(let key=0;key<12;key++)for(const p of POSITIONS){
  const h=harmonyAt({key,mode:'major',chord:'major'}),b=fretboardFor(h,p.shape),g=checkGrip(h,b);
  const skeleton=CAGED_GRIP_SHAPES[g.framework],root=g.notes.find(n=>n.string===skeleton.rootString);
  const offset=root.fret-skeleton.frets[skeleton.rootString];
  assert.deepEqual(Array.from({length:6},(_,string)=>g.notes.find(n=>n.string===string)?.fret??null),skeleton.frets.map(f=>f===null?null:f+offset));
 }
});
test('A Dorian chords retain the expected E, A and D quality variations',()=>{
 const gold={
  minor:{E:[5,7,7,5,5,5],A:[null,12,14,14,13,12],D:[null,null,7,9,10,8]},
  min7:{E:[5,7,5,5,5,5],A:[null,12,14,12,13,12],D:[null,null,7,9,8,8]},
  maj7:{E:[5,7,6,6,5,5],A:[null,12,14,13,14,12],D:[null,null,7,9,9,9]},
  dom7:{E:[5,7,5,6,5,5],A:[null,12,14,12,14,12],D:[null,null,7,9,8,9]},
 };
 for(const [chord,shapes]of Object.entries(gold))for(const [framework,frets]of Object.entries(shapes)){
  const h=harmonyAt({key:9,mode:'dorian',chord});
  const b=POSITIONS.map(p=>fretboardFor(h,p.shape)).find(b=>cagedPositionFor(b).shape===framework);
  const g=checkGrip(h,b);
  assert.deepEqual(Array.from({length:6},(_,string)=>g.notes.find(n=>n.string===string)?.fret??null),frets);
 }
});
test('chord alterations outside per-string scale windows display without changing the scale',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'maj7'}),b=fretboardFor(h,'A'),before=JSON.stringify(b);
 const g=checkGrip(h,b),extra=g.notes.filter(g=>!b.notes.some(n=>n.string===g.string&&n.fret===g.fret));
 assert.ok(extra.length);const svg=diagramSvg(b,false,MODES.dorian.degrees,'Chord',true,g);
 assert.equal((svg.match(/class="grip-ring"/g)||[]).length,g.notes.length);
 assert.equal(JSON.stringify(b),before);
});

 test('G-framework minor seventh uses the practical E/D/G/B grip in every key and compatible mode',()=>{
  for(const mode of ['dorian','minor','phrygian'])for(let key=0;key<12;key++)for(const chord of ['min7','min9','min11','min13']){
    const h=harmonyAt({key,mode,chord});
    const b=POSITIONS.map(p=>fretboardFor(h,p.shape)).find(b=>cagedPositionFor(b).shape==='G');
    const g=checkGrip(h,b),root=g.notes[0].fret;
    assert.deepEqual(g.notes.map(n=>n.string),[0,2,3,4]);
    assert.ok(g.notes.every(n=>n.fret===root));
    assert.deepEqual(g.intervals,['1','♭7','♭3','5']);
    assert.deepEqual(g.muted,[1,5]);
  }
  const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),b=fretboardFor(h,'E');
  assert.deepEqual(recommendedGrip(h,b).notes.map(n=>[n.string,n.fret]),[[0,5],[2,5],[3,5],[4,5]]);
 });
