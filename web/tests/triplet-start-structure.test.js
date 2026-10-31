import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {positionalArpeggio} from '../src/practice/learning.js';
import {tripletStartingState,migrateTripletPhrase} from '../src/practice/arpeggio-start.js';
import {POSITIONAL_TRIPLET_PHRASES} from '../src/practice/exercise-options.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const shapes=['C','A','G','E','D'],phrases=['balanced','balancedcycle','turnaround'];
const run=(hs,ss,ds,phrase,startTone,motion='ascending')=>progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study:'positional',rhythm:'triplets',phrase,startTone,motion,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}))});
test('three phrase concepts replace numbered starting variations',()=>{
 assert.deepEqual(POSITIONAL_TRIPLET_PHRASES.map(p=>p[0]),phrases);
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),available=positionalArpeggio(fretboardFor(h,'C'),h,'ascending')[0].notes;
 for(const [legacy,degree]of [['balanced2','5:0'],['balanced3','7:0']]){const view={phrase:legacy};migrateTripletPhrase(view,available,h,false);assert.deepEqual(view,{phrase:'balanced',startTone:degree});assert.deepEqual(run([h],['C'],[4],view.phrase,view.startTone)[0].notes,run([h],['C'],[4],legacy,'default')[0].notes);}
});
test('balanced starts select intact windows; cycling starts enter at whole balanced bars',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),[g]=run([h],['C'],[4],'balanced','5:0');assert.deepEqual(g.notes.map(n=>n.midi),[52,55,57,60,64,67,69,67,64,60,57,55]);
 const [base]=run([h],['C'],[16],'balancedcycle','default'),[cycle]=run([h],['C'],[16],'balancedcycle','5:0');assert.equal(cycle.phrasePhase,12);assert.deepEqual(cycle.notes,[...base.notes.slice(12),...base.notes.slice(0,12)]);
});
test('full-position formulas keep their entire range; unsupported starts explicitly fall back',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base=run([h],['C'],[8],'turnaround','default')[0];for(const degree of ['1','3','5','7']){const g=run([h],['C'],[8],'turnaround',degree+':0')[0];assert.deepEqual(g.notes,base.notes);assert.equal(!!g.warning,degree!=='3');}
});
test('all modes and positions preserve complete triplet contours for each supported starting degree',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending'])for(const phrase of phrases){
  const h=harmonyAt({key,mode,chord:def.chord}),available=positionalArpeggio(fretboardFor(h,shape),h,'ascending')[0].notes,base=run([h],[shape],[16],phrase,'default',motion)[0];
  for(const degree of ['1','3','5','7']){const g=run([h],[shape],[16],phrase,degree+':0',motion)[0],state=tripletStartingState(available,h,motion==='descending',phrase,degree+':0');if(!state.supported){assert.deepEqual(g.notes,base.notes);assert.ok(g.warning);continue;}assert.equal(h.intervals[h.chordPcs.indexOf(g.notes[0].pc)].match(/\d+/)[0],degree);const leg=phrase==='turnaround'?6:Math.max(1,Math.min(7,g.positionalSpan.length)-1);for(let start=0;start+leg<=g.notes.length;start+=leg){const down=(motion==='descending')!==(phrase==='turnaround'?Math.floor(start/(g.phraseCycleLength/2))%2===1:Math.floor(start/leg)%2===1);for(let i=start+1;i<start+leg;i++)assert.ok(down?g.notes[i].midi<=g.notes[i-1].midi:g.notes[i].midi>=g.notes[i-1].midi);}for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));}
 }
});
test('legacy span migration matches the old variation for all modal CAGED geometries',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const shape of shapes)for(const motion of ['ascending','descending'])for(const legacy of ['balanced2','balanced3']){const h=harmonyAt({key:9,mode,chord:def.chord}),available=positionalArpeggio(fretboardFor(h,shape),h,'ascending')[0].notes,view={phrase:legacy};migrateTripletPhrase(view,available,h,motion==='descending');assert.deepEqual(run([h],[shape],[4],view.phrase,view.startTone,motion)[0].notes,run([h],[shape],[4],legacy,'default',motion)[0].notes);}
});
test('selected triplet degrees adapt through mixed harmony and mid-run position changes without losing phrase phase',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})],ss=['C','A','E','D'],ds=[1,3,2,6];
 for(const phrase of phrases)for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){const gs=run(hs,ss,ds,phrase,degree+':0',motion),defaults=run(hs,ss,ds,phrase,'default',motion);let cursor=0;
  for(const [i,g]of gs.entries()){const available=positionalArpeggio(g.board,g.harmony,'ascending')[0].notes,state=tripletStartingState(available,g.harmony,motion==='descending',phrase,degree+':0');if(!state.supported)assert.deepEqual(g.notes,defaults[i].notes);else{const [whole]=run([g.harmony],[ss[i]],[48],phrase,degree+':0',motion),cycle=whole.notes.slice(0,whole.phraseCycleLength);assert.deepEqual(g.notes,Array.from({length:g.notes.length},(_,n)=>cycle[(cursor+n)%cycle.length]));}cursor+=g.notes.length;}
 }
});
