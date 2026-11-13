import {withExerciseResolution} from '../src/practice/exercise-resolution.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {CONTENT_MATERIALS,contentMaterial,contentSource,contentFamily,contentFamilies,changeContentMaterial,changeContentSource,changeContentFamily,groupPatternLabel} from '../src/practice/exercise-catalogue.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {perStringExerciseChoice} from '../src/practice/per-string-exercises.js';import {perStringCatalogue} from '../src/guitar/per-string.js';import {cagedStudy} from '../src/guitar/exercises.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {sequenceEntryChoices,sequenceEntryState,sequenceEntryNote} from '../src/practice/sequence-entry.js';import {scaleStartingState} from '../src/practice/scale-start.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position=cagedPositionFor(board);
const run=(v,ds=[4,4])=>progressionExerciseGroups(ds.map(()=>h),ds,board,{rhythm:'sixteenths',motion:'ascending',positionPath:ds.map(()=>position),...v});
test('every offered material/source/family maps back to itself without hiding a different note source',()=>{
 for(const [material]of CONTENT_MATERIALS)for(const source of material==='scale'?['mode','pentatonic']:['selectedChord','diatonic','chordRoots',...(material==='triad'?['triadPair']:[])])for(const [family]of contentFamilies(material,source)){
  const v=normalizeExerciseOptions(changeContentFamily({study:'positionalscale',material:'seventh',arpeggioPattern:'straight'},family,{material,source}));assert.equal(contentMaterial(v),material,`${material} ${source} ${family}`);assert.equal(contentSource(v),source,`${material} ${source} ${family}`);assert.equal(contentFamily(v),family,`${material} ${source} ${family}`);
 }
});
test('material switches retain compatible pattern families and distinguish note groups from arpeggio-root groups',()=>{
 const v={study:'groups5',material:'seventh'};changeContentMaterial(v,'triad');assert.equal(v.study,'arpseq_groups5');changeContentMaterial(v,'scale');assert.equal(v.study,'groups5');changeContentFamily(v,'continuous');changeContentMaterial(v,'seventh');assert.equal(v.study,'positional');changeContentSource(v,'diatonic');assert.equal(v.study,'harmonized');assert.equal(v.arpeggioSource,'diatonic');assert.equal(groupPatternLabel('groups3','Groups of 3'),'Groups of 3 notes');assert.equal(groupPatternLabel('groups3','Groups of 3','arpeggios'),'Groups of 3 arpeggios');
});
test('non-root scale entry preserves 1–3–2–4, both directions, and phase across bar splits',()=>{
 for(const motion of ['ascending','descending'])for(const sequenceOrder of ['normal','reverse','alternate','rotate']){
  const v={study:'digital1324',entryTone:'scale:2',sequenceOrder,motion},a=run(v,[1,2,1,4]),b=run(v,[8]);assert.equal(a[0].notes[0].pc,0);assert.deepEqual(a.flatMap(g=>g.notes),b.flatMap(g=>g.notes));const cells=cagedStudy(board,h,v.study,'seventh',motion,{sequenceOrder:'normal'}),entry=sequenceEntryState(cells,h,v);assert.equal(sequenceEntryNote(cells[entry.index],v).pc,0);
 }
 assert.deepEqual(run({study:'digital1324',entryTone:'scale:2'})[0].notes.slice(0,4).map(n=>n.midi),[48,52,50,54]);
});
test('arpeggio groups enter on another chord tone and triad/seventh material changes the actual notes',()=>{
 for(const material of ['triad','seventh']){const gs=run({study:'arpseq_groups3',material,entryTone:'chord:3'});assert.equal(gs[0].notes[0].pc,0);if(material==='triad')assert.ok(gs.every(g=>g.notes.every(n=>[9,0,4].includes(n.pc))));}
 const triad=run({study:'positional',material:'triad'}),seventh=run({study:'positional',material:'seventh'});assert.ok(triad.every(g=>g.notes.every(n=>[9,0,4].includes(n.pc))));assert.ok(seventh.some(g=>g.notes.some(n=>n.pc===7)));
});
test('whole-arpeggio entry names the first root independently of the selected internal note order',()=>{
 const v={study:'harmonized',material:'triad',arpeggioSource:'diatonic',arpeggioPattern:'perm3_513',arpeggioRegister:'up',arpeggioClose:false,entryTone:'scale:2'},cells=cagedStudy(board,h,v.study,v.material,'ascending',v),choices=sequenceEntryChoices(cells,h,v);assert.ok(choices.some(c=>c.value==='scale:2'));const g=run(v)[0];assert.equal(g.sequenceAnchors[0]%12,0);assert.equal(g.notes[0].pc,7);
});
test('chromatic patterns select target entries and keep triad targets free of the seventh',()=>{
 for(const study of ['enclosures4','doubleapproach','chromaticneighbors']){const v={study,material:'triad',entryTone:'chord:5'},g=run(v)[0],target=g.notes[g.targetIndices[0]];assert.equal(target.pc,4);assert.ok(g.targetIndices.every(i=>[9,0,4].includes(g.notes[i].pc)));}
});
test('all scale degrees are available for continuous entries, retaining degree roles through mode changes',()=>{
 for(const mode of ['dorian','major','minor_pentatonic']){const harmony=harmonyAt({key:9,mode,chord:mode==='major'?'maj7':'min7'}),span=cagedStudy(fretboardFor(harmony,'C'),harmony,'positionalscale').flatMap(c=>c.notes),entry=scaleStartingState(span,harmony,false,'degree:3');assert.ok(entry.supported);assert.ok(['C','C♯'].includes(entry.note.name));}
 assert.equal(normalizeExerciseOptions({study:'positionalscale',startTone:'degree:2'}).startTone,'degree:2');
});
test('legacy favourites migrate into the new controls and different entries remain different recipes',()=>{
 const old=readExerciseFavourites(JSON.stringify([{study:'chordtones',material:'triad',arpeggioPattern:'wideSkips'},{study:'arpgroups3'},{study:'positionalscale',startTone:'3:0'}]));assert.equal(contentMaterial(old[0]),'triad');assert.equal(contentSource(old[0]),'chordRoots');assert.equal(contentSource(old[1]),'selectedChord');assert.equal(old[2].startTone,'3:0');
 assert.notEqual(exerciseFavouriteKey({study:'groups4',entryTone:'scale:2'}),exerciseFavouriteKey({study:'groups4',entryTone:'scale:1'}));assert.notEqual(exerciseFavouriteKey({study:'positional',material:'triad'}),exerciseFavouriteKey({study:'positional',material:'seventh'}));
});

test('an imported extended fretboard shape retains all its written notes and register',()=>{
 const extended=harmonyAt({key:9,mode:'dorian',chord:'min13'}),o=normalizeExerciseOptions({study:'positional',material:'seventh',fingering:'twoOne',inversion:2,fingeringFret:8,exactFingering:true}),choice=perStringExerciseChoice(extended,o),reference=perStringCatalogue(extended,'twoOne')[2].choices.find(b=>b.firstFret===choice.board.firstFret);assert.deepEqual(choice.board.notes,reference.notes);assert.equal(contentMaterial(o),'shape');assert.equal(contentSource(o),'selectedChord');changeContentMaterial(o,'triad');assert.equal(o.exactFingering,false);assert.equal(contentMaterial(o),'triad');
});

test('legacy per-string favourites preserve their exact written-chord material',()=>{const old=readExerciseFavourites(JSON.stringify([{study:'positional',material:'triad',fingering:'twoOne',inversion:2,fingeringFret:8}]));assert.equal(old[0].exactFingering,true);assert.equal(contentMaterial(old[0]),'shape');const extended=harmonyAt({key:9,mode:'dorian',chord:'min13'}),choice=perStringExerciseChoice(extended,old[0]);assert.deepEqual(choice.board.notes,perStringCatalogue(extended,'twoOne')[2].choices.find(b=>b.firstFret===choice.board.firstFret).notes);});

test('triad material also limits the final resolution to triad tones',()=>{const groups=run({study:'positional',material:'triad'}),plan=progressionStudyPlan(groups,[0,1],[1,1],4,'positional','sixteenths'),result=withExerciseResolution(groups,plan,'triad');assert.ok([9,0,4].includes(result.plan.events.at(-1).note.pc));});

test('superimposed alternating patterns honour their chosen first note and triad-pair phase',()=>{
 for(const motion of ['ascending','descending']){const v={study:'pentatonic',pattern:'alternating3',motion},cells=cagedStudy(board,h,v.study,'seventh',motion,v),choices=sequenceEntryChoices(cells,h,v);assert.ok(choices.length);for(const choice of choices){const g=run({...v,entryTone:choice.value})[0];assert.equal(g.notes[0].pc,choice.note.pc);}}
 const v={study:'triadpairs',material:'triad',motion:'ascending'},cells=cagedStudy(board,h,v.study,'triad','ascending',v),choices=sequenceEntryChoices(cells,h,v);assert.ok(choices.length>=2);const gs=run({...v,entryTone:choices[1].value},[1,1,1]);assert.equal(gs[0].notes[0].pc,choices[1].note.pc);assert.deepEqual(gs.flatMap(g=>g.notes),run({...v,entryTone:choices[1].value},[3])[0].notes);assert.deepEqual(gs.map(g=>g.notes.length),[4,4,4]);
});
