import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt,progressionBeatDurations} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {progressionNotationSvg} from '../src/practice/progression-notation.js';import {passagePlaybackPlan,passageBackingSettings} from '../src/practice/cell-playback.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position=cagedPositionFor(board);
const make=(study,extra={})=>{const gs=progressionExerciseGroups(Array(4).fill(h),Array(4).fill(4),board,{study,rhythm:'sixteenths',positionPath:Array(4).fill(position),...extra});return progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,study,'sixteenths');};
test('root motifs contain independently selectable arpeggio brackets, with full ranges through score systems',()=>{
 const plan=make('harmonized',{material:'triad',arpeggioPattern:'perm3_135',arpeggioClose:false,arpeggioSequence:'groups3'}),svg=progressionNotationSvg(plan,'Root motifs');
 assert.ok(plan.events.some(e=>e.cellInfo.parts.length===3));assert.match(svg,/class="notation-cell inner-cell"/);assert.match(svg,/role="button"/);assert.match(svg,/tabindex="0"/);
 for(const id of new Set(plan.events.map(e=>e.cellId))){const notes=plan.events.filter(e=>e.cellId===id);for(const e of notes){assert.equal(e.subcellIndex,Math.floor(e.cellOffset/3));assert.equal(e.subcellOffset,e.cellOffset%3);assert.equal(e.subcellSize,3);}}
 const first=plan.events.filter(e=>e.cellId===0);assert.match(svg,new RegExp(`data-cell-key="0"[^>]*data-range-start="${first[0].index}" data-range-end="${first.at(-1).index}"`));assert.match(svg,/data-cell-key="0:1"[^>]*data-range-start="3" data-range-end="5"/);
});
test('optional order/start/length labels are suppressed until the label changes and stay off by default',()=>{
 const plan=make('scaleperm_312'),off=progressionNotationSvg(plan,'Orders');assert.doesNotMatch(off,/class="cell-label"/);
 const order=progressionNotationSvg(plan,'Orders',{cellLabels:'order'});assert.equal((order.match(/class="cell-label"/g)||[]).length,1);assert.match(order,/>3–1–2<\/text>/);
 const length=progressionNotationSvg(plan,'Lengths',{cellLabels:'length'});assert.equal((length.match(/class="cell-label"/g)||[]).length,1);
 const alternating=make('scaleperm_312',{sequenceOrder:'alternate'}),labels=progressionNotationSvg(alternating,'Alternating',{cellLabels:'order'});assert.match(labels,/>3–1–2<\/text>/);assert.match(labels,/>2–1–3<\/text>/);
 const starts=progressionNotationSvg(plan,'Starts',{cellLabels:'start'});assert.match(starts,/class="cell-label"/);assert.match(starts,/ · [A-G]/);
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
