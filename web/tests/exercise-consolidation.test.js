import {test} from 'node:test';import assert from 'node:assert/strict';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {exerciseFavouriteKey,readExerciseFavourites,toggleExerciseFavourite} from '../src/practice/exercise-favourites.js';
import {arpeggioFamilies} from '../src/guitar/arpeggio-patterns.js';import {cagedStudy} from '../src/guitar/exercises.js';import {fretboardFor} from '../src/guitar/fretboard.js';import {harmonyAt} from '../src/audio/music.js';import {DEFAULTS} from '../src/audio/engine.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const base={study:'harmonized',material:'seventh',motion:'ascending',rhythm:'sixteenths'},notes=gs=>gs.map(g=>g.notes.map(n=>n.midi));
test('aliases have one canonical order and cannot create duplicate favourites',()=>{
 for(const [material,alias,id,close]of [['triad','brokenPairs','cell3_1353',false],['triad','upBack','cell3_1353',false],['triad','wideSkips','perm3_153',false],['triad','outsideInside','perm3_153',false],['seventh','straight','perm4_1357',false],['seventh','brokenPairs','perm4_1375',false],['seventh','wideSkips','perm4_1537',false],['seventh','outsideInside','perm4_1735',false]]){
  const a={...base,material,arpeggioPattern:alias},b={...base,material,arpeggioPattern:id,arpeggioClose:close};assert.equal(exerciseFavouriteKey(a),exerciseFavouriteKey(b));
  assert.equal(readExerciseFavourites(JSON.stringify([a,b])).length,1);
 }
 for(const material of ['triad','seventh'])assert.ok(arpeggioFamilies(material).every(([id])=>!['straight','brokenPairs','wideSkips','outsideInside','inversionCycle','connected','approachEach'].includes(id)));
});
test('legacy exercise entry points migrate to sources, routines and preparation without losing the recipe',()=>{
 const chord=normalizeExerciseOptions({...base,study:'chordtones',arpeggioPattern:'wideSkips'});assert.equal(chord.study,'harmonized');assert.equal(chord.arpeggioSource,'chordRoots');assert.equal(chord.arpeggioPattern,'perm4_1537');
 for(const study of ['inversions']){const v=normalizeExerciseOptions({...base,study});assert.equal(v.study,'harmonized');assert.equal(v.arpeggioSource,'selectedChord');assert.equal(v.arpeggioRoutine,'inversions');}
 for(const n of [3,4])assert.equal(normalizeExerciseOptions({...base,study:'arpgroups'+n}).study,'arpseq_groups'+n);
 const approach=normalizeExerciseOptions({...base,study:'approacheverytone',motion:'descending'});assert.equal(approach.arpeggioPattern,'perm4_7531');assert.equal(approach.arpeggioRegister,'down');assert.equal(approach.arpeggioApproach,'directional');
 assert.equal(normalizeExerciseOptions({...base,study:'alternating'}).arpeggioRoutine,'alternate');
 assert.equal(normalizeExerciseOptions({...base,study:'alternating',arpeggioPattern:'perm4_1537'}).arpeggioRegister,'alternating');
});
test('canonical aliases preserve notes, while genuine octave and source differences stay distinct',()=>{
 const h=harmonyAt({...DEFAULTS,key:9,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,'E');
 for(const alias of ['brokenPairs','wideSkips','outsideInside','upBack'])for(const material of ['triad','seventh']){
  const old={...base,material,arpeggioPattern:alias},v=normalizeExerciseOptions({...old});assert.deepEqual(notes(cagedStudy(board,h,'harmonized',material,'ascending',old)),notes(cagedStudy(board,h,v.study,material,'ascending',v)));
 }
 assert.notEqual(exerciseFavouriteKey({...base,material:'triad',arpeggioPattern:'perm3_135',arpeggioClose:true}),exerciseFavouriteKey({...base,material:'triad',arpeggioPattern:'cell3_1351'}));
 assert.notEqual(exerciseFavouriteKey({...base,arpeggioSource:'selectedChord'}),exerciseFavouriteKey({...base,arpeggioSource:'diatonic'}));
});
test('favourites toggle, survive reloads, ignore display and tempo, and preserve meaningful variants',()=>{
 const a={...base,arpeggioPattern:'perm4_1537',tempo:90,display:'both'},b={...a,tempo:140,display:'tab',zoom:'large'};let items=toggleExerciseFavourite([],a);assert.equal(items.length,1);items=readExerciseFavourites(JSON.stringify(items));assert.equal(items.length,1);assert.equal(exerciseFavouriteKey(a),exerciseFavouriteKey(b));assert.equal(toggleExerciseFavourite(items,b).length,0);
 assert.notEqual(exerciseFavouriteKey(a),exerciseFavouriteKey({...a,rhythm:'triplets'}));assert.deepEqual(readExerciseFavourites('{broken'),[]);
});
test('source/routine combinations are playable and approach targets remain paired through alternating cells and changes',()=>{
 const hs=[0,1,2].map(step=>harmonyAt({...DEFAULTS,progression:true,template:'major251essential'},step)),board=fretboardFor(hs[0],'E');
 for(const source of ['diatonic','chordRoots','selectedChord'])for(const routine of ['repeat','alternate','inversions','connected'])for(const approach of ['none','below','above','directional']){
  const v=normalizeExerciseOptions({...base,arpeggioSource:source,arpeggioRoutine:routine,arpeggioApproach:approach,arpeggioPattern:'perm4_1537'}),gs=progressionExerciseGroups(hs,[8,8,8],board,v);assert.ok(gs.some(g=>g.notes.length),`${source} ${routine} ${approach}`);
  for(const g of gs){for(const n of g.notes)assert.ok(n.fret>=g.board.start&&n.fret<=g.board.end);if(approach!=='none')for(const i of g.targetIndices)assert.equal(Math.abs(g.notes[i].midi-g.notes[i-1].midi),1);}
 }
});
test('unused fingering controls cannot create a second bookmark for a CAGED traversal',()=>{
 const a={study:'positional',motion:'ascending',rhythm:'sixteenths',fingering:'caged',fingeringFret:5},b={...a,fingeringFret:17,inversion:3};assert.equal(exerciseFavouriteKey(a),exerciseFavouriteKey(b));
 assert.notEqual(exerciseFavouriteKey({...a,fingering:'oneTwo'}),exerciseFavouriteKey({...b,fingering:'oneTwo'}));
});
test('nearest-entry routine chooses against the last audible note, including across bars and turns',()=>{
 const h=harmonyAt({...DEFAULTS,key:9,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,'E'),position={geometryShape:'E'},v=normalizeExerciseOptions({...base,arpeggioPattern:'perm4_1537',arpeggioRoutine:'connected'}),gs=progressionExerciseGroups(Array(12).fill(h),Array(12).fill(4),board,{...v,positionPath:Array(12).fill(position)});let previous=null;
 for(const g of gs){let start=0;for(let i=0;i<g.cellLengths.length;i++){
  const length=g.cellLengths[i],played=g.notes.slice(start,start+length);if(previous!==null&&!g.cellOffsets[i]){
   const candidates=cagedStudy(board,h,'harmonized','seventh',g.sequenceDirections[i]>0?'ascending':'descending',{...v,arpeggioDeferConnection:true}).filter(c=>c.sequenceAnchor===g.sequenceAnchors[i]);
   assert.equal(Math.abs(played[0].midi-previous),Math.min(...candidates.map(c=>Math.abs(c.notes[0].midi-previous))));
  }previous=played.at(-1).midi;start+=length;
 }}
});
