import {test} from 'node:test';import assert from 'node:assert/strict';
import {TRIAD_PERMUTATIONS,SEVENTH_PERMUTATIONS,TRIAD_CELLS,SEVENTH_CELLS,ARPEGGIO_PATTERNS,arpeggioPatternGroups,normalizeArpeggioPattern} from '../src/guitar/arpeggio-patterns.js';
import {cagedStudy} from '../src/guitar/exercises.js';import {harmonyAt} from '../src/audio/music.js';import {DEFAULTS} from '../src/audio/engine.js';import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
test('catalogues exhaust their stated rules without duplicates',()=>{
 for(const [perms,count,size]of [[TRIAD_PERMUTATIONS,6,3],[SEVENTH_PERMUTATIONS,24,4]]){assert.equal(perms.length,count);assert.equal(new Set(perms.map(p=>p.join(','))).size,count);assert.ok(perms.every(p=>p.length===size&&new Set(p).size===size));}
 for(const [cells,count,size]of [[TRIAD_CELLS,18,3],[SEVENTH_CELLS,144,4]]){assert.equal(cells.length,count);assert.equal(new Set(cells.map(p=>p.join(','))).size,count);assert.ok(cells.every(p=>p.length===size+1&&new Set(p).size===size&&p.every((n,i)=>!i||n!==p[i-1])));}
 assert.equal(arpeggioPatternGroups('triad','permutations').flatMap(g=>g.items).length,6);assert.equal(arpeggioPatternGroups('seventh','repeatTone').flatMap(g=>g.items).length,144);
});
test('every note order retains each arpeggio’s actual alterations and physical pitch in both source families',()=>{
 for(let key=0;key<12;key++){
  const h=harmonyAt({...DEFAULTS,key,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,'E');
  for(const study of ['harmonized','chordtones'])for(const [material,patterns]of [['triad',[...TRIAD_PERMUTATIONS.map(p=>'perm3_'+p.join('')),...TRIAD_CELLS.map(p=>'cell3_'+p.join(''))]],['seventh',[...SEVENTH_PERMUTATIONS.map(p=>'perm4_'+p.join('')),...SEVENTH_CELLS.map(p=>'cell4_'+p.join(''))]]]){
   for(const pattern of patterns){const groups=cagedStudy(board,h,study,material,'ascending',{arpeggioPattern:pattern});assert.ok(groups.length,`${key} ${study} ${pattern}`);
    for(const g of groups){const degree=h.scaleNames.indexOf(g.rootName);assert.ok(degree>=0);assert.equal(g.notes.length,g.patternOrder.length);
     for(const [i,n]of g.notes.entries()){const index=[1,3,5,7].indexOf(g.patternOrder[i]);assert.equal(n.pc,h.scalePcs[(degree+index*2)%h.scalePcs.length]);assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>=board.start&&n.fret<=board.end);}
     if(pattern.startsWith('perm3_'))assert.equal(g.notes.at(-1).midi-g.notes[0].midi,12);
    }
   }
  }
 }
});
test('every general family works for triads and sevenths, both source filters, both travel directions and registers',()=>{
 const h=harmonyAt({...DEFAULTS,key:9,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,'E');
 for(const pattern of ['inversionCycle','brokenPairs','wideSkips','outsideInside','returnStart','upBack','approachEach','connected'])for(const material of ['triad','seventh'])for(const study of ['harmonized','chordtones'])for(const motion of ['ascending','descending'])for(const register of ['up','down','alternating']){
  const groups=cagedStudy(board,h,study,material,motion,{arpeggioPattern:pattern,arpeggioRegister:register});assert.ok(groups.length,`${study} ${material} ${pattern} ${motion} ${register}`);
  assert.ok(groups.flatMap(g=>g.notes).every(n=>n.midi===TUNING[n.string]+n.fret&&n.fret>=board.start&&n.fret<=board.end));
  if(pattern==='approachEach')for(const g of groups){assert.equal(g.targetIndices.length,g.notes.length/2);for(const i of g.targetIndices)assert.equal(g.notes[i].midi-g.notes[i-1].midi,1);}
 }
});
test('triad closure is optional; material changes preserve family and default options remain compatible',()=>{
 const h=harmonyAt({...DEFAULTS,key:9,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,'E');
 for(const close of [true,false]){const cells=cagedStudy(board,h,'harmonized','triad','descending',{arpeggioPattern:'perm3_513',arpeggioClose:close,arpeggioRegister:'down'});assert.ok(cells.length);assert.ok(cells.every(g=>g.notes.length===(close?4:3)));if(close)assert.ok(cells.every(g=>g.notes.at(-1).midi-g.notes[0].midi===-12));}
 assert.equal(normalizeArpeggioPattern('perm3_513','seventh'),'perm4_1357');assert.equal(normalizeArpeggioPattern('cell4_13571','triad'),'cell3_1315');
 assert.equal(normalizeExerciseOptions({study:'harmonized',material:'seventh'}).arpeggioPattern,'straight');
});
test('progression patterns remain duration-aligned and complete chromatic pairs do not cross harmonic boundaries',()=>{
 const harmonies=[0,1,2].map(step=>harmonyAt({...DEFAULTS,progression:true,template:'major251essential'},step)),anchor=fretboardFor(harmonies[0],'E');
 for(const pattern of ['perm3_513','perm4_5731','cell3_1353','cell4_13573','inversionCycle','approachEach','connected']){
  const material=/3_/.test(pattern)?'triad':'seventh',groups=progressionExerciseGroups(harmonies,[4,2,2],anchor,{study:'harmonized',material,arpeggioPattern:pattern,rhythm:'sixteenths'}),plan=progressionStudyPlan(groups,[0,1,2],[1,.5,.5],4,'harmonized','sixteenths');assert.ok(plan.events.length);
  for(const e of plan.events)assert.ok(e.start>=0&&e.duration>0&&e.start+e.duration<=plan.duration+1e-8);
  if(pattern==='approachEach')for(const g of groups)for(const target of g.targetIndices)assert.equal(g.notes[target].midi-g.notes[target-1].midi,1);
 }
});
