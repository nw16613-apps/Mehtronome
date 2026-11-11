import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {cagedStudy} from '../src/guitar/exercises.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {singleChordExercisePlan,withExerciseResolution} from '../src/practice/exercise-resolution.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {progressionNotationSvg} from '../src/practice/progression-notation.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position=cagedPositionFor(board);
test('single-chord scores retain each scale, core-arpeggio and whole-arpeggio cell bracket without count captions',()=>{
 for(const study of ['groups5','scaleperm_312','arpseq_groups4','harmonized']){
  const groups=cagedStudy(board,h,study,'seventh','ascending',{arpeggioPattern:'perm4_1357'}),single=singleChordExercisePlan(groups,h,board,position,study,'sixteenths',4),resolved=withExerciseResolution(single.groups,single.plan),svg=progressionNotationSvg(resolved.plan,'Cells');
  assert.equal(new Set(single.plan.events.map(e=>e.cellId)).size,groups.length);assert.equal((svg.match(/data-cell-start-offset="0"/g)||[]).length,groups.length);assert.match(svg,/class="pattern-bracket"/);assert.doesNotMatch(svg,/>\d+ cell(?: segments|s)?<\/text>/);
  assert.ok(resolved.plan.events.at(-1).resolution);assert.equal(resolved.plan.events.at(-1).cellId,undefined);
 }
});
test('five-note cells cross bars intact and split with open brackets only at system boundaries',()=>{
 const groups=progressionExerciseGroups(Array(4).fill(h),Array(4).fill(4),board,{study:'groups5',rhythm:'sixteenths',positionPath:Array(4).fill(position)}),plan=progressionStudyPlan(groups,[0,1,2,3],[1,1,1,1],4,'groups5','sixteenths');
 // Notes 15..19 cross the first bar; 45..49 cross the three-bar system.
 assert.equal(plan.events[15].cellId,plan.events[16].cellId);assert.equal(plan.events[45].cellId,plan.events[48].cellId);
 const svg=progressionNotationSvg(plan,'Five-note groups'),parts=svg.split('</svg>');assert.match(parts[0],/data-cell-index="9"[^>]*data-continued-left="false" data-continued-right="true"/);assert.match(parts[1],/data-cell-index="9"[^>]*data-cell-start-offset="3"[^>]*data-continued-left="true" data-continued-right="false"/);
 assert.equal((parts[0].match(/data-cell-index="3"/g)||[]).length,1,'a bar line must not split the bracket');
});
test('enclosure bracket follows its sounding notes and excludes the following rest',()=>{
 const groups=progressionExerciseGroups([h],[4],board,{study:'enclosures5',rhythm:'eighths',positionPath:[position]}),plan=progressionStudyPlan(groups,[0],[1],4,'enclosures5','eighths');
 assert.ok(plan.events.length);const ids=[...new Set(plan.events.map(e=>e.cellId))];for(const id of ids){const notes=plan.events.filter(e=>e.cellId===id);assert.equal(notes.length,5);assert.deepEqual(notes.map(e=>e.cellOffset),[0,1,2,3,4]);}
 const svg=progressionNotationSvg(plan,'Enclosures');assert.equal((svg.match(/class="pattern-bracket"/g)||[]).length,ids.length);assert.match(svg,/notation-rest/);
});
test('repeated short harmonic cycles have distinct cell identifiers',()=>{
 const note={midi:60,name:'C',pc:0,string:1,fret:15},group={slot:0,notes:[note,note],cellLengths:[2],chord:'C'};
 const plan=progressionStudyPlan([group],[0],[1],3,'groups3','eighths');assert.equal(plan.cycles,1);
 const repeated=progressionStudyPlan([group],[0],[1/4],4,'groups3','eighths');assert.equal(repeated.cycles,4);assert.equal(new Set(repeated.events.map(e=>e.cellId)).size,4);
});
