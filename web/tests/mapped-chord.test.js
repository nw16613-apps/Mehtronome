import {test} from 'node:test';
import assert from 'node:assert/strict';
import {diagramSvg,fretboardFor,POSITIONS,TUNING} from '../src/guitar/fretboard.js';
import {recommendedGrip} from '../src/guitar/grips.js';
import {harmonyAt,MODES} from '../src/audio/music.js';

function renderedNotes(svg) {
  const pattern=/<g class="fret-note ([^"]+)" data-string="(\d+)" data-fret="(\d+)" data-pc="(\d+)"[^>]*><title>(.*?)<\/title><circle cx="([^"]+)" cy="([^"]+)" r="13"/g;
  return Array.from(svg.matchAll(pattern),match=>({
    classes:match[1].split(' '),string:Number(match[2]),fret:Number(match[3]),pc:Number(match[4]),
    title:match[5],x:match[6],y:match[7],
  }));
}
const geometry=notes=>notes.map(({string,fret,pc,x,y})=>({string,fret,pc,x,y}));
const location=note=>`${note.string}:${note.fret}`;

function physicalNote(harmony,string,fret) {
  const midi=TUNING[string]+fret,pc=midi%12;
  const scaleIndex=harmony.scalePcs.indexOf(pc),chordIndex=harmony.chordPcs.indexOf(pc);
  return {string,fret,midi,pc,root:pc===harmony.midi[0]%12,chord:chordIndex>=0,scaleIndex,
    name:chordIndex>=0?harmony.tones[chordIndex]:scaleIndex>=0?harmony.scaleNames[scaleIndex]:'chromatic',
    chromaticDegree:['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'][(pc-harmony.scalePcs[0]+12)%12]};
}

test('mapped chords select exact string/fret notes without highlighting every copy of a pitch',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(const {shape} of POSITIONS){
    const harmony=harmonyAt({key:9,mode,chord:definition.chord});
    const board=fretboardFor(harmony,shape),snapshot=structuredClone(board);
    const note=board.notes.find(candidate=>board.notes.some(other=>other.pc===candidate.pc&&location(other)!==location(candidate)));
    const mappedChord={name:'Chosen voicing',notes:[note]};
    const plain=diagramSvg(board,true,definition.degrees,'Position');
    const svg=diagramSvg(board,true,definition.degrees,'Position',false,null,null,mappedChord);
    const rendered=renderedNotes(svg),selected=rendered.filter(candidate=>candidate.classes.includes('mapped-chord-note'));
    assert.deepEqual(geometry(rendered),geometry(renderedNotes(plain)),`${mode} ${shape}`);
    assert.deepEqual(selected.map(location),[location(note)]);
    assert.ok(rendered.some(other=>other.pc===note.pc&&!other.classes.includes('mapped-chord-note')));
    assert.match(svg,/class="fretboard mapped-chord-active"/);
    assert.equal((svg.match(/class="mapped-chord-ring"/g)||[]).length,1);
    assert.ok(!svg.includes('stroke-dasharray'));
    assert.match(selected[0].title,/selected chord: Chosen voicing/);
    assert.deepEqual(board,snapshot);
  }
});

test('only mapped rendering expands to adjacent frets and adds physical notes outside the CAGED windows',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'}),board=fretboardFor(harmony,'A');
  const snapshot=structuredClone(board),plain=diagramSvg(board,true,MODES.major.degrees,'Position IV');
  const notes=[physicalNote(harmony,0,board.start-1),physicalNote(harmony,5,board.end+1),physicalNote(harmony,3,7)];
  assert.ok(notes.every(note=>!board.notes.some(original=>location(original)===location(note))));
  for(const note of board.notes)Object.freeze(note);
  Object.freeze(board.notes);Object.freeze(board);
  const svg=diagramSvg(board,true,MODES.major.degrees,'Position IV',false,null,null,{name:'Expanded voicing',notes});
  const rendered=renderedNotes(svg),selected=rendered.filter(note=>note.classes.includes('mapped-chord-note'));
  assert.equal(rendered.length,board.notes.length+notes.length);
  assert.deepEqual(new Set(selected.map(location)),new Set(notes.map(location)));
  assert.deepEqual(new Set(rendered.map(location)),new Set([...board.notes,...notes].map(location)));
  assert.match(svg,/class="fret-number"[^>]*>1<\/text>/);
  assert.match(svg,/class="fret-number"[^>]*>8<\/text>/);
  assert.ok(rendered.every(note=>note.fret>=1&&note.fret<=24));
  assert.deepEqual(board,snapshot);
  assert.equal(diagramSvg(board,true,MODES.major.degrees,'Position IV'),plain);
  assert.equal(fretboardFor(harmony,'A').notes.some(note=>note.string===3&&note.fret===7),false);
});

test('mapped mode suppresses other overlays and includes escaped chord names and movement explanations',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'}),board=fretboardFor(harmony,'A');
  const notes=[0,1,2].map(string=>board.notes.find(note=>note.string===string));
  const mappedChord={name:'A minor & "colour" <voicing>',notes,movements:[
    {string:0,delta:0,common:true},{string:1,delta:1,common:false},{string:2,delta:-2,common:false},
  ]};
  const theory={kind:'pentatonic',name:'Other overlay',pcs:harmony.scalePcs.slice(0,5)};
  const svg=diagramSvg(board,true,MODES.dorian.degrees,'A Dorian',true,recommendedGrip(harmony,board),theory,mappedChord);
  for(const name of ['grip-active','grip-ring','grip-finger','grip-mute','characteristic-ring','theory-active','theory-ring'])assert.ok(!svg.includes(name));
  assert.match(svg,/selected chord: A minor &amp; &quot;colour&quot; &lt;voicing&gt;/);
  assert.match(svg,/class="voice-motion"[^>]*>held<\/text>/);
  assert.match(svg,/class="voice-motion"[^>]*>\+1<\/text>/);
  assert.match(svg,/class="voice-motion"[^>]*>-2<\/text>/);
  const selected=renderedNotes(svg).filter(note=>note.classes.includes('mapped-chord-note'));
  assert.ok(selected.find(note=>note.string===0).classes.includes('voice-held'));
  assert.match(selected.find(note=>note.string===0).title,/held note, 0 semitones/);
  assert.ok(selected.find(note=>note.string===1).classes.includes('voice-moving'));
  assert.match(selected.find(note=>note.string===1).title,/voice moves up 1 semitone/);
  assert.match(selected.find(note=>note.string===2).title,/voice moves down 2 semitones/);
});

test('invalid or open mapped frets are ignored and switching the overlay off restores legacy geometry and layers',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(harmony,'E');
  const grip=recommendedGrip(harmony,board);
  const theory={kind:'pentatonic',name:'A minor pentatonic',pcs:[9,0,2,4,7]};
  const args=[board,true,MODES.dorian.degrees,'Position I',true,grip,theory];
  const original=diagramSvg(...args);
  assert.equal(diagramSvg(...args,null),original);
  assert.equal(diagramSvg(...args,{name:'Empty',notes:[]}),original);
  const invalid=[physicalNote(harmony,0,0),physicalNote(harmony,0,-1),physicalNote(harmony,0,25),physicalNote(harmony,0,2.5),{...physicalNote(harmony,0,2),string:6}];
  assert.equal(diagramSvg(...args,{name:'Invalid',notes:invalid}),original);
  const svg=diagramSvg(...args,{name:'Frets only',notes:[...invalid,physicalNote(harmony,5,24)]});
  assert.ok(!svg.includes('data-fret="0"'));
  assert.ok(!svg.includes('data-fret="25"'));
  const selected=renderedNotes(svg).filter(note=>note.classes.includes('mapped-chord-note'));
  assert.deepEqual(selected.map(location),['5:24']);
  assert.equal(diagramSvg(...args,null),original);
});

test('a shared pitch moved to another string is not labelled as a physically held note',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian'}),board=fretboardFor(harmony,'A');
  const note=board.notes[0];
  const svg=diagramSvg(board,true,MODES.dorian.degrees,'Position',false,null,null,{
    name:'String change',notes:[note],movements:[{string:note.string,delta:0,common:false}],
  });
  assert.ok(!svg.includes('voice-held'));
  assert.ok(!svg.includes('held note'));
});
