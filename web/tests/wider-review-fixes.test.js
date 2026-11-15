import test from 'node:test';import assert from 'node:assert/strict';
import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor} from '../src/guitar/fretboard.js';
import {changeContentFamily,changeContentSource,changeContentMaterial,contentSource,contentFamilies} from '../src/practice/exercise-catalogue.js';
import {exerciseCapability,exerciseChartCapability} from '../src/practice/exercise-capabilities.js';import {practiceRecipe,studyRecipeControls,practiceRecipeLabel} from '../src/practice/recipe-controls.js';
import {neckExerciseGroups,neckExerciseCells} from '../src/practice/neck-exercises.js';import {cagedStudy} from '../src/guitar/exercises.js';import {theoryOptions} from '../src/guitar/superimposition.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {sequenceEntryState,sequenceEntryPitch} from '../src/practice/sequence-entry.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'groups3',material:'seventh',fingering:'caged',linkedFingering:true,entryTone:'scale:2',startTone:'degree:3',motion:'ascending',rhythm:'sixteenths',traversal:'position',sequenceAdvance:1,sequenceOrder:'normal',arpeggioRegister:'up'};
test('family, material and source changes preserve valid starts rather than resetting unrelated axes',()=>{
 const v={...base};changeContentFamily(v,'intervals');assert.equal(v.entryTone,'scale:2');assert.equal(v.startTone,'degree:3');changeContentSource(v,'pentatonic');assert.equal(v.entryTone,'scale:2');changeContentMaterial(v,'triad');assert.equal(v.entryTone,'scale:2');assert.equal(sequenceEntryPitch(v.entryTone,h),0);
 const board=fretboardFor(h,'E'),cells=cagedStudy(board,h,v.study,v.material,'ascending',v);assert.equal(sequenceEntryState(cells,h,v).warning,'');
 const unavailable={...v,entryTone:'chord:7'};const result=sequenceEntryState(cells,h,unavailable);assert.match(result.warning,/boundary/);assert.equal(unavailable.entryTone,'chord:7');
});
test('fit checks reject incomplete groups and accept smaller complete groups in the same exact cells',()=>{
 const v={...base,fingering:'three',study:'groups4',traversal:'horizontal',traversalStrings:'5',traversalStart:5,traversalEnd:10};
 assert.equal(exerciseCapability(h,v).available,false);assert.equal(exerciseCapability(h,{...v,study:'groups3'}).available,true);assert.equal(neckExerciseGroups([h],[8],v)[0].notes.length,0);
 const next={...v,study:'groups3'};assert.ok(neckExerciseGroups([h],[8],next)[0].notes.length);assert.equal(exerciseCapability(h,v).available,false,'cached checks must not change the recipe');
});
test('both alternating-string arpeggio layouts retain exact cells and phase in horizontal and diagonal routes',()=>{
 for(const fingering of ['oneTwo','twoOne'])for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending']){
  const v={...base,entryTone:'default',startTone:'default',study:'arpseq_groups3',material:'seventh',arpeggioSource:'selectedChord',fingering,traversal,motion,traversalStrings:'0,1,2,3,4,5',traversalStart:1,traversalEnd:24,traversalShiftStrings:3};
  const shapes=neckExerciseCells(h,v);assert.ok(shapes.length);const physical=new Map(shapes.flatMap(s=>(s.blocks||[s]).map(b=>[b.degree,new Set(b.board.notes.map(n=>n.string+':'+n.fret))])));
  assert.equal(exerciseCapability(h,v).available,true);const whole=neckExerciseGroups([h],[8],v),split=neckExerciseGroups([h,h],[4,4],v);assert.ok(whole[0].notes.length);assert.deepEqual(split.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret])),whole.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret])));
  assert.ok(whole[0].notes.every(n=>h.chordPcs.includes(n.pc)&&physical.get(n.neckCell.id)?.has(n.string+':'+n.fret)));
  const selected=shapes.at(-1).degree;assert.equal(normalizeExerciseOptions({...v,traversalCell:selected}).traversalCell,selected);
 }
});
test('triad pairs retain their selected six-note source in general groups, intervals and permutations',()=>{
 const pair=theoryOptions(h).triadPairs[0],board=fretboardFor(h,'E');
 for(const family of ['groups','intervals','permutations3','arp_permutations']){
  const v={...base,study:'triadpairs',material:'triad',source:pair.id,arpeggioSource:'triadPair'};assert.ok(contentFamilies('triad','triadPair',v).some(([id])=>id===family));changeContentFamily(v,family);normalizeExerciseOptions(v);assert.equal(contentSource(v),'triadPair');const cells=cagedStudy(board,h,v.study,'triad','ascending',v);assert.ok(cells.length);assert.ok(cells.flatMap(c=>c.notes).every(n=>pair.pcs.includes(n.pc)));
 }
});
test('Study controls share the live recipe and snapshots exclude playback/display settings',()=>{
 const v={...base,study:'arpseq_groups3',material:'triad',fingering:'oneTwo',arpeggioSource:'selectedChord',tempo:123,zoom:'large',display:'tab'};
 const controls=studyRecipeControls(h,v);assert.match(controls,/study-recipe-material-kind/);assert.match(controls,/study-recipe-fingering/);assert.match(controls,/study-recipe-family/);assert.doesNotMatch(controls,/id="study-material"/);assert.doesNotMatch(practiceRecipeLabel(v),/arpseq|oneTwo/);const snapshot=practiceRecipe(v);assert.equal(snapshot.fingering,'oneTwo');assert.equal(snapshot.study,'arpseq_groups3');assert.equal(snapshot.entryTone,'scale:2');assert.equal(snapshot.tempo,undefined);assert.equal(snapshot.display,undefined);assert.equal(snapshot.zoom,undefined);
});

test('triad-pair generic patterns retain source identity in favourites',()=>{
 const choices=theoryOptions(h).triadPairs;assert.ok(choices.length>1);const v={...base,study:'arpseq_groups3',material:'triad',arpeggioSource:'triadPair',source:choices[0].id};assert.notEqual(exerciseFavouriteKey(v),exerciseFavouriteKey({...v,source:choices[1].id}));
});

test('fit cache distinguishes a single complete shape from alternating-position requirements',()=>{
 const v={...base,fingering:'three',traversal:'horizontal',traversalStrings:'5',traversalStart:5,traversalEnd:8,traversalPositionOrder:'follow'};assert.equal(exerciseCapability(h,v).available,true);assert.equal(exerciseCapability(h,{...v,traversalPositionOrder:'alternate'}).available,false);assert.equal(exerciseCapability(h,v).available,true);
});

test('capability checks cover every chord slot rather than accepting a playable first chord',()=>{
 const board=fretboardFor(h,'E'),v={...base,study:'groups4'},thin={...board,notes:board.notes.slice(0,3)};assert.equal(exerciseCapability(h,v,board).available,true);const fit=exerciseChartCapability([{harmony:h,board},{harmony:h,board:thin}],v);assert.equal(fit.available,false);assert.match(fit.reason,/Chord slot 2/);
});
