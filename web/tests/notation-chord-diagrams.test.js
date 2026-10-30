import {test} from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {notationChordDiagram} from '../src/practice/notation-chord-diagram.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
const diagramCount=svg=>(svg.match(/class="notation-chord-diagram"/g)||[]).length;
test('every plotted grip note belongs to the chord and the assigned CAGED board',()=>{
 for(let key=0;key<12;key++)for(const shape of ['C','A','G','E','D'])for(const [mode,chord]of [['dorian','min7'],['mixolydian','dom7'],['major','maj7'],['dorian','min13'],['locrian','halfDim']]){
  const h=harmonyAt({key,mode,chord}),board=fretboardFor(h,shape),position=cagedPositionFor(board),svg=notationChordDiagram(h,board,position,100,58);
  assert.ok(svg.includes(`data-position="${position.numeral}"`));assert.ok(svg.includes('role="img"'));
  const dots=[...svg.matchAll(/data-string="(\d+)" data-fret="(\d+)"/g)];
  if(svg.includes('data-grip-available="false"')){assert.equal(dots.length,0);continue;}
  assert.ok(dots.length>=3);assert.equal(new Set(dots.map(d=>d[1])).size,dots.length);
  for(const dot of dots){const note=board.notes.find(n=>n.string===Number(dot[1])&&n.fret===Number(dot[2]));assert.ok(note);assert.ok(h.chordPcs.includes(note.pc));}
 }
});
test('repeated chord symbols remain suppressed while changed positions show their own grips',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 const groups=['C','C','A','A'].map((shape,slot)=>{const board=fretboardFor(h,shape);return {slot,chord:'Am7',harmony:h,board,position:cagedPositionFor(board),annotation:'',notes:[]};});
 const plan=progressionStudyPlan(groups,[0,1,2,3],[1,1,1,1],4,'positional','sixteenths');
 const off=progressionNotationSvg(plan,'Optional'),on=progressionNotationSvg(plan,'Optional',{chordDiagrams:true});
 assert.equal(diagramCount(off),0);assert.equal(diagramCount(on),2);
 assert.equal((on.match(/class="notation-chord-symbol"/g)||[]).length,1);
 assert.ok(on.includes('data-position="II"'));assert.ok(on.includes('data-position="III"'));
 // Adjacent CAGED regions can share a valid grip; their position labels
 // still need separate diagrams at the position-change beat.
 const chunks=on.split('class="notation-chord-diagram"').slice(1);
 for(const chunk of chunks)assert.equal([...chunk.matchAll(/class="notation-grip-dot"/g)].length,4);
});
test('an unavailable position grip is explicit instead of substituting another shape',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),svg=notationChordDiagram(h,{notes:[]},{numeral:'III',shape:'C'},0,0);
 assert.ok(svg.includes('No grip in this'));assert.ok(!svg.includes('notation-grip-dot'));assert.ok(svg.includes('Position III'));
});


test('only a CAGED position change repeats a diagram, independently of chord and fret changes',()=>{
 const hs=[9,11,2,4,9].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'}));
 const groups=['C','C','A','A','C'].map((shape,slot)=>{const h=hs[slot],board=fretboardFor(h,shape);return {slot,chord:h.name+h.suffix,harmony:h,board,position:cagedPositionFor(board),annotation:'',notes:[]};});
 const plan=progressionStudyPlan(groups,[0,1,2,3,4],[1,1,1,1,1],4,'positional','sixteenths');
 const svg=progressionNotationSvg(plan,'Position changes',{chordDiagrams:true});
 assert.equal(diagramCount(svg),3);assert.equal((svg.match(/class="notation-chord-symbol"/g)||[]).length,5);
 assert.deepEqual([...svg.matchAll(/class="notation-chord-diagram" data-position="([^"]+)"/g)].map(match=>match[1]),['II','III','II']);
 assert.ok(svg.includes('aria-label="Dm7 · Position III'));assert.ok(!svg.includes('aria-label="Bm7 · Position II'));
});


test('position captions appear only below the stave at position changes, with diagrams on or off',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 const groups=['C','C','C','A','C'].map((shape,slot)=>{const board=fretboardFor(h,shape);return {slot,chord:'Am7',harmony:h,board,position:cagedPositionFor(board),annotation:'',notes:[board.notes[0]]};});
 const plan=progressionStudyPlan(groups,[0,1,2,3,4],[1,1,1,1,1],4,'positional','sixteenths');
 for(const chordDiagrams of [false,true]){
  const svg=progressionNotationSvg(plan,'Position captions',{chordDiagrams});
  assert.deepEqual([...svg.matchAll(/class="exercise-degree"[^>]*>(Position[^<]+)<\/text>/g)].map(match=>match[1]),['Position II · D shape','Position III · C shape','Position II · D shape']);
 }
 const diagram=notationChordDiagram(h,groups[0].board,groups[0].position,0,0);
 assert.doesNotMatch(diagram,/<text[^>]*>Position/);assert.ok(diagram.includes('aria-label="Am7 · Position II'));
});
