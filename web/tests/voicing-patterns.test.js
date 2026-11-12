import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {spreadTriadCatalogue,playableSpreadStringSets} from '../src/guitar/spread-triads.js';
import {dropVoicingCatalogue} from '../src/guitar/drop-voicings.js';
import {TRIAD_PERMUTATIONS,TRIAD_CELLS,TRIAD_PAIRS,arpeggioPatternGroups,patternedArpeggios,selectedChordSeeds} from '../src/guitar/arpeggio-patterns.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {ENCLOSURE_PATTERNS} from '../src/guitar/enclosures.js';
import {contentFamilies,changeContentFamily} from '../src/practice/exercise-catalogue.js';
import {linkExerciseFingering} from '../src/practice/linked-fingering.js';
import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),key=n=>n.string+':'+n.fret;
const patterns=[...TRIAD_PERMUTATIONS.map(p=>'perm3_'+p.join('')),...TRIAD_CELLS.map(p=>'cell3_'+p.join('')),...TRIAD_PAIRS.map(p=>'pair3_'+p.join('')),...arpeggioPatternGroups('triad','returnStart').flatMap(g=>g.items.map(([id])=>id))];
test('bounded triad families have exact counts, distinct orders and all entry tones',()=>{
 assert.equal(TRIAD_PERMUTATIONS.length,6);assert.equal(TRIAD_CELLS.length,18);assert.equal(TRIAD_PAIRS.length,6);assert.equal(arpeggioPatternGroups('triad','returnStart').flatMap(g=>g.items).length,3);assert.equal(new Set(patterns).size,33);
 const families=contentFamilies('triad','selectedChord',{fingering:'spread'});for(const id of ['continuous','arp_pairs','arp_permutations','arp_repeatTone','arp_returnStart','enclosures','doubleapproach','chromaticneighbors'])assert.ok(families.some(([key])=>key===id));assert.ok(!families.some(([id])=>id==='groups'));
 const view={linkedFingering:true,fingering:'spread',material:'triad',study:'positional'};changeContentFamily(view,'arp_pairs');linkExerciseFingering(view,{kind:'spread',fret:5,inversion:0},h);assert.equal(view.study,'harmonized');assert.match(view.arpeggioPattern,/^pair3_/);
});
test('every applicable triad order retains actual pitches, strings and frets across keys, qualities, inversions and string sets',()=>{
 for(const chord of ['major','minor','diminished','augmented'])for(let root=0;root<12;root++){
  const harmony=harmonyAt({key:root,mode:'major',chord});
  for(const {index}of playableSpreadStringSets(harmony))for(const entry of spreadTriadCatalogue(harmony,index))for(const board of entry.choices){
   const seeds=selectedChordSeeds(board,harmony,'triad');assert.equal(seeds.length,1);const allowed=new Set(board.notes.map(key));
   for(const pattern of patterns){const cells=patternedArpeggios(board,seeds,pattern,{closeTriad:false});assert.equal(cells.length,1,`${root} ${chord} ${index} ${entry.inversion} ${pattern}`);const cell=cells[0];assert.ok(cell.notes.every(n=>allowed.has(key(n))));for(let i=0;i<cell.notes.length;i++)assert.equal(cell.notes[i].pc,harmony.chordPcs[[1,3,5].indexOf(cell.patternOrder[i])]);}
  }
 }
});
test('the same fixed-voicing executor supports four-tone drop chord permutations',()=>{
 for(const kind of ['drop2','drop3'])for(const entry of dropVoicingCatalogue(h,kind))for(const board of entry.choices){const seeds=selectedChordSeeds(board,h);const allowed=new Set(board.notes.map(key));for(const family of ['pairs','permutations','repeatTone','returnStart'])for(const [pattern]of arpeggioPatternGroups('seventh',family).flatMap(g=>g.items)){const cells=patternedArpeggios(board,seeds,pattern,{closeTriad:false});assert.equal(cells.length,1);assert.ok(cells[0].notes.every(n=>allowed.has(key(n))));}}
});
test('enclosures approach each selected voice on its own string, using only fretted physical neighbours',()=>{
 const board=spreadTriadCatalogue(h,4)[0].choices[0];
 for(const study of ['enclosures4','enclosures5'])for(const pattern of Object.keys(ENCLOSURE_PATTERNS[study])){
  const cells=cagedStudy(board,h,study,'triad','ascending',{enclosurePattern:pattern,enclosureTarget:'all'});assert.ok(cells.length);for(const cell of cells){const target=cell.notes.at(-1);assert.ok(board.notes.some(n=>key(n)===key(target)));assert.deepEqual(cell.notes.map(n=>n.midi-target.midi),ENCLOSURE_PATTERNS[study][pattern]);assert.ok(cell.notes.every(n=>n.string===target.string&&n.fret>=1&&n.fret<=24));}
 }
});
test('pattern phase crosses chord slots intact and chromatic diagrams include their neighbours',()=>{
 const board=spreadTriadCatalogue(h,4)[0].choices[0],o={study:'harmonized',material:'triad',motion:'ascending',rhythm:'sixteenths',arpeggioSource:'selectedChord',arpeggioPattern:'perm3_153',arpeggioClose:false,boardFor:()=>board};
 const whole=progressionExerciseGroups([h],[4],board,o),split=progressionExerciseGroups([h,h],[2,2],board,o);assert.deepEqual(split.flatMap(g=>g.notes.map(key)),whole.flatMap(g=>g.notes.map(key)));
 const enclosed=progressionExerciseGroups([h],[8],board,{...o,study:'enclosures4',enclosurePattern:'upper',enclosureTarget:'all'})[0];assert.ok(enclosed.notes.length);assert.ok(enclosed.notes.every(n=>n.fret>=enclosed.board.start&&n.fret<=enclosed.board.end));assert.deepEqual(enclosed.board.notes,board.notes);
});
test('favourites retain exact physical geometry for non-continuous patterns and ignore unavailable register shifts',()=>{
 const v={linkedFingering:true,fingering:'spread',study:'harmonized',material:'triad',arpeggioPattern:'perm3_153',inversion:0,fingeringFret:5,fingeringStringSet:4};
 assert.notEqual(exerciseFavouriteKey(v),exerciseFavouriteKey({...v,inversion:1}));assert.notEqual(exerciseFavouriteKey(v),exerciseFavouriteKey({...v,fingering:'caged'}));assert.equal(exerciseFavouriteKey(v),exerciseFavouriteKey({...v,arpeggioRegister:'down'}));
});
