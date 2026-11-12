import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt,progressionBeatDurations} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {progressionNotationSvg} from '../src/practice/progression-notation.js';import {passagePlaybackPlan,passageBackingSettings} from '../src/practice/cell-playback.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position=cagedPositionFor(board);
const make=(study,extra={})=>{const gs=progressionExerciseGroups(Array(4).fill(h),Array(4).fill(4),board,{study,rhythm:'sixteenths',positionPath:Array(4).fill(position),...extra});return progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,study,'sixteenths');};
test('root motifs have one selectable bracket level and ignore retired label settings',()=>{
 const plan=make('harmonized',{material:'triad',arpeggioPattern:'perm3_135',arpeggioClose:false,arpeggioSequence:'groups3'}),svg=progressionNotationSvg(plan,'Root motifs',{cellLabels:'order'});
 assert.doesNotMatch(svg,/inner-cell|class="cell-label"/);assert.match(svg,/role="button"/);assert.match(svg,/tabindex="0"/);
 const first=plan.events.filter(e=>e.cellId===0);assert.match(svg,new RegExp(`data-cell-key="0"[^>]*data-range-start="${first[0].index}" data-range-end="${first.at(-1).index}"`));assert.equal(first.length,9);
});
test('solo passage starts immediately; accompanied passage retains enclosing bars and original note/cell identities',()=>{
 const plan=make('groups5'),range={start:30,end:34},solo=passagePlaybackPlan(plan,range),backed=passagePlaybackPlan(plan,range,true);
 assert.equal(solo.duration,1.25);assert.equal(solo.events[0].start,0);assert.equal(solo.scoreStart,7.5);assert.equal(solo.events.at(-1).index,34);assert.equal(solo.events[0].cellId,plan.events[30].cellId);
 assert.equal(backed.scoreStart,4);assert.equal(backed.duration,8);assert.equal(backed.events[0].start,3.5);assert.deepEqual(backed.slots.map(s=>s.slot),[1,2]);assert.equal(backed.resolution,undefined);
 assert.equal(passagePlaybackPlan(plan,null),plan);
});
test('passage accompaniment copies the selected harmonies and durations into a private chart',()=>{
 const settings={key:0,mode:'major',chord:'maj7',progression:true,template:'major251essential',beats:4},plan=make('groups5'),selected=passagePlaybackPlan(plan,{start:30,end:34},true),config=passageBackingSettings(settings,selected);
 assert.deepEqual(progressionBeatDurations(config),selected.slots.map(s=>s.duration));assert.equal(config.loopEnabled,false);assert.equal(settings.template,'major251essential');assert.equal(config.customProgression.steps.length,2);for(const [i,slot]of selected.slots.entries())assert.deepEqual(harmonyAt(config,i).chordPcs,harmonyAt(settings,slot.step).chordPcs);
});

test('a cell in a repeated short harmonic cycle selects only that occurrence',()=>{const note={midi:60,name:'C',pc:0,string:1,fret:15},plan=progressionStudyPlan([{slot:0,chord:'C',notes:[note,note],cellLengths:[2]}],[0],[1/4],4,'groups3','eighths');const selected=passagePlaybackPlan(plan,{start:0,end:1,cellId:2});assert.equal(selected.events.length,2);assert.equal(selected.scoreStart,2);assert.equal(selected.duration,1);assert.ok(selected.events.every(e=>e.cellId===2));});
