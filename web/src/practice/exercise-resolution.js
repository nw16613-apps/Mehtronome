import {cellDetails} from './notation-cells.js';
import {isEnclosureStudy,enclosureNoteStarts} from '../guitar/enclosures.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {progressionPositionPath} from '../guitar/position-path.js';
import {progressionStudyPlan} from './progression-timing.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {cloneTemplate} from './custom-progression.js';
import {progressionDefinition,progressionTimeline,progressionBeatDurations} from '../audio/music.js';

/** Prefer structural traversal direction over a permutation's final interval. */
export function exerciseEndingDirection(groups,plan){
 const last=plan?.events?.at(-1),group=groups.find(g=>g.slot===last?.slot)||groups.at(-1);
 const explicit=group?.endingDirection??group?.sequenceDirections?.at(-1)??group?.sequenceDirection;
 if(explicit===1||explicit===-1)return explicit;
 if(last)for(let i=plan.events.length-2;i>=0;i--){const delta=last.note.midi-plan.events[i].note.midi;if(delta)return Math.sign(delta);}
 return 0;
}

/** Add an ending to the displayed/playable study, never to the user's chart or
 * to the sequence generators. The closest different core tone in the final traversal direction uses a CAGED
 * position near the final fret region; a unison on another string is still the same pitch. */
export function withExerciseResolution(groups,plan,material='seventh'){
 if(!plan?.events.length||plan.resolution)return {groups,plan};
 const firstSlot=plan.slots[0],finalSlot=plan.slots.at(-1),last=plan.events.at(-1),harmony=firstSlot?.harmony;
 if(!harmony||!finalSlot?.board)return {groups,plan};
 const identity=h=>JSON.stringify([h?.mode,h?.chordPcs,h?.scalePcs,h?.tones,h?.scaleNames]);
 const sameHarmony=identity(harmony)===identity(finalSlot.harmony);
 const perString=firstSlot.position?.perString;
 const position=perString?firstSlot.position:sameHarmony?finalSlot.position:progressionPositionPath([harmony],finalSlot.board)[0];
 const board=perString?firstSlot.board:sameHarmony?finalSlot.board:fretboardFor(harmony,position.geometryShape);
 const core=exerciseArpeggioHarmony(harmony,material),candidates=board.notes.filter(n=>core.chordPcs.includes(n.pc)&&n.midi!==last.note.midi);
 const direction=exerciseEndingDirection(groups,plan),forward=candidates.filter(n=>(n.midi-last.note.midi)*direction>0);
 // At an actual position boundary no further tone may fit in this direction.
 // Stay in the selected region rather than inventing a fretboard jump.
 const preferred=forward.length?forward:candidates;
 const ranked=preferred.map(n=>({...n,name:core.tones[core.chordPcs.indexOf(n.pc)],chromaticDegree:core.intervals[core.chordPcs.indexOf(n.pc)]})).sort((a,b)=>
  Math.abs(a.midi-last.note.midi)-Math.abs(b.midi-last.note.midi)||
  Number(a.pc!==core.chordPcs[0])-Number(b.pc!==core.chordPcs[0])||
  Number(a.string!==last.note.string)-Number(b.string!==last.note.string)||a.midi-b.midi||a.string-b.string);
 const note=ranked[0];if(!note)return {groups,plan};
 const slot=groups.length,index=groups.reduce((sum,g)=>sum+g.notes.length,0),start=plan.duration,duration=plan.beats;
 const group={...(perString?groups[firstSlot.slot]:groups[finalSlot.slot]),slot,notes:[note],pcs:[note.pc],names:[note.name],harmony,board,position,chord:firstSlot.chord,
  globalStart:index,targetIndices:[0],cellLengths:[1],materialCells:['Resolution'],annotation:'Resolution',warning:'',resolution:true};
 const ending={...finalSlot,step:firstSlot.step,chord:firstSlot.chord,harmony,board,position,slot,start,duration,annotation:'Resolution',resolution:true};
 return {groups:[...groups,group],plan:{...plan,events:[...plan.events,{index,note,step:ending.step,slot,start,duration,target:true,resolution:true}],
  slots:[...plan.slots,ending],duration:start+duration,resolution:{start,duration,slot,index,direction}}};
}

/** A private playback copy returns to the opening chord for the ending bar and
 * loops back only after the hold. Original chart/loop settings stay untouched. */
export function resolutionBackingSettings(settings,plan){
 if(!settings.progression||!plan?.resolution)return settings;
 const base=cloneTemplate(progressionDefinition(settings),settings.chord,settings.mode,settings);
 const steps=plan.slots.map(slot=>({...base.steps[slot.step],beats:slot.duration}));
 const originalBeats=progressionBeatDurations(settings).reduce((a,b)=>a+b,0);
 const melodyTimeline=settings.customProgression?.standardMelody?{standardMelodyOriginalBeats:originalBeats,standardMelodyTimeline:[...progressionTimeline(settings),{start:originalBeats,duration:plan.resolution.duration}]}:{};
 return {...settings,...melodyTimeline,standardMelodyPickup:false,standardMelodyEnding:plan.resolution.duration,template:'custom',loopEnabled:false,customProgression:{...base,...(settings.customProgression?.standardMelody?{standardMelody:settings.customProgression.standardMelody}:{}),steps,roman:plan.slots.map(slot=>base.roman[slot.step])}};
}

/** Route a held-chord study through the same duration-aware score/playback path. */
export function singleChordExercisePlan(groups,harmony,board,position,study,rhythm,beats){
 const notes=groups.flatMap(g=>g.notes),division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
 let offset=0;const targetIndices=[];
 for(const group of groups){targetIndices.push(...(group.targetIndices||(group.targetIndex===undefined?[]:[group.targetIndex])).map(i=>i+offset));offset+=group.notes.length;}
 const noteStarts=isEnclosureStudy(study)?enclosureNoteStarts(groups.map(g=>g.notes.length),division):null;
 const cellLengths=groups.flatMap(g=>g.cellLengths||[g.notes.length]),cellOffsets=groups.flatMap(g=>(g.cellLengths||[g.notes.length]).map((_,i)=>g.cellOffsets?.[i]||0)),cellSizes=groups.flatMap(g=>(g.cellLengths||[g.notes.length]).map((length,i)=>g.cellSizes?.[i]||length));
 const details=groups.flatMap(g=>g.cellDetails||[cellDetails(g,harmony)]);
 const lastDirection=groups.at(-1)?.endingDirection??groups.at(-1)?.sequenceDirection;
 const group={cellLengths,cellOffsets,cellSizes,cellDetails:details,...(lastDirection?{endingDirection:lastDirection}:{}),...(noteStarts?{noteStarts}:{}),...(groups[0]?.perString?{perString:true,fingeringLabel:groups[0].fingeringLabel,applicationLabel:groups[0].applicationLabel}:{}),slot:0,chord:harmony.name+harmony.suffix,harmony,board,position,notes,annotation:groups[0]?.annotation||'Study',globalStart:0,targetIndices};
 return {groups:[group],plan:progressionStudyPlan([group],[0],[Math.max(1,Math.ceil((noteStarts?.length?noteStarts.at(-1)+1/division:notes.length/division)/beats))],beats,study,rhythm)};
}
