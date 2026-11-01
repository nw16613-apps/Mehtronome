import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const harmonies=[{key:9,chord:'min7',mode:'dorian'},{key:0,chord:'maj7',mode:'major'},{key:6,chord:'halfDim',mode:'locrian'},{key:4,chord:'augMaj7',mode:'lydian_augmented'}].map(harmonyAt);
const generate=(hs,shapes,durations,study,rhythm,degree,motion='ascending')=>progressionExerciseGroups(hs,durations,fretboardFor(hs[0],shapes[0]),{study,rhythm,motion,startTone:degree,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,shapes[i])),geometryShape:shapes[i]}))});
const role=(h,n)=>{const core=arpeggioHarmony(h);return core.intervals[core.chordPcs.indexOf(n.pc)]?.match(/\d+/)?.[0];};
test('selected degrees apply to every incoming chord in scales and arpeggios at every rhythm',()=>{
 for(const study of ['positional','positionalscale'])for(const rhythm of ['eighths','sixteenths','triplets'])for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){
  const durations=[1,3,2,4],groups=generate(harmonies,['C','E','G','A'],durations,study,rhythm,degree+':0',motion),division={eighths:2,sixteenths:4,triplets:3}[rhythm];
  for(const [i,g]of groups.entries()){
   assert.equal(role(g.harmony,g.notes[0]),degree,`${study} ${rhythm} ${motion} chord ${i} degree ${degree}`);assert.equal(g.notes.length,durations[i]*division);
   for(const n of g.notes)assert.ok(g.board.notes.some(b=>b.string===n.string&&b.fret===n.fret&&b.midi===n.midi));
  }
 }
});
test('a new assigned position also re-enters the selected degree when the chord is unchanged',()=>{
 const h=harmonies[0];for(const study of ['positional','positionalscale'])for(const rhythm of ['eighths','sixteenths','triplets'])for(const degree of ['1','3','5','7']){
  const groups=generate(Array(4).fill(h),['D','C','A','G'],[1,2,3,4],study,rhythm,degree+':0');for(const g of groups)assert.equal(role(h,g.notes[0]),degree,`${study} ${rhythm} ${g.position.numeral}`);
 }
});
test('splitting an unchanged harmony into repeated bars does not restart its selected-degree pattern',()=>{
 const h=harmonies[0];for(const study of ['positional','positionalscale'])for(const rhythm of ['eighths','sixteenths','triplets'])for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){
  const bars=generate(Array(4).fill(h),Array(4).fill('C'),[1,2,3,4],study,rhythm,degree+':0',motion),whole=generate([h],['C'],[10],study,rhythm,degree+':0',motion);
  assert.deepEqual(bars.flatMap(g=>g.notes),whole[0].notes,`${study} ${rhythm} ${degree}`);
 }
});
test('a selected third adapts from minor to major and a suspended chord reports an unavailable third',()=>{
 const minor=harmonies[0],major=harmonyAt({key:9,chord:'maj7',mode:'major'}),sus=harmonyAt({key:2,chord:'sevenSus',mode:'mixolydian'});
 for(const study of ['positional','positionalscale'])for(const rhythm of ['eighths','sixteenths','triplets']){
  const groups=generate([minor,major,sus],['C','C','E'],[1,1,1],study,rhythm,'3:0');assert.equal(groups[0].notes[0].pc,0);assert.equal(groups[1].notes[0].pc,1);assert.match(groups[2].warning,/absent|not available/);
 }
});

test('new arpeggio entries keep the ongoing direction when the chosen tone is inside the span',()=>{
 for(const rhythm of ['eighths','sixteenths','triplets'])for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){
  const groups=generate(harmonies,['C','E','G','A'],[1,3,2,4],'positional',rhythm,degree+':0',motion);
  for(let i=1;i<groups.length;i++){
   const before=groups[i-1],g=groups[i],index=g.positionalSpan.findIndex(n=>n.midi===g.notes[0].midi);if(index===0||index===g.positionalSpan.length-1)continue;
   const nextPhase=(before.phrasePhase+before.notes.length)%before.phraseCycleLength,up=nextPhase<before.phraseLegLength?motion==='ascending':motion==='descending';
   assert.equal(g.notes[1].midi>g.notes[0].midi,up);
  }
 }
});
