import {test} from 'node:test';import assert from 'node:assert/strict';
import {orderedRoots,generateProgression,generatorPositions,ROOT_ORDERS,generatorModes} from '../src/practice/progression-generator.js';
import {harmonyAt,CHORDS,MODES} from '../src/audio/music.js';
test('minor-third order covers all roots in three non-repeating groups, or repeats only its starting cycle',()=>{
 assert.deepEqual(orderedRoots({start:9,order:'minorThird',count:12}),[9,0,3,6,10,1,4,7,11,2,5,8]);
 assert.deepEqual(orderedRoots({start:9,order:'minorThird',count:8,coverage:false}),[9,0,3,6,9,0,3,6]);
 assert.deepEqual(orderedRoots({start:9,order:'minorThird',count:4,direction:-1}),[9,6,3,0]);
});
test('every root order covers the selected roots before repeating, respects direction and replays by seed',()=>{
 for(const order of Object.keys(ROOT_ORDERS))for(const direction of [1,-1])for(const roots of [[0,1,2,3,4,5,6,7,8,9,10,11],[0,3,6,9],[2,5,9]]){
  const config={order,direction,roots,start:roots[0],count:roots.length*3,seed:123},out=orderedRoots(config);
  assert.equal(out.length,roots.length*3);assert.deepEqual(out,orderedRoots(config));for(let i=0;i<out.length;i+=roots.length)assert.deepEqual(new Set(out.slice(i,i+roots.length)),new Set(roots));
  if(roots.length>1)assert.ok(out.every((n,i)=>i===0||n!==out[i-1]),order);
 }
 assert.deepEqual(orderedRoots({start:0,order:'fourths',count:4}),[0,5,10,3]);assert.deepEqual(orderedRoots({start:0,order:'majorThird',count:3}),[0,4,8]);assert.deepEqual(orderedRoots({start:0,order:'whole',count:6}),[0,2,4,6,8,10]);
});
test('same-quality study preserves mode and quality over transposed roots and spells flat thirds readably',()=>{
 const chart=generateProgression({approach:'fixed',key:9,chord:'min7',mode:'dorian',order:'minorThird',count:'all',bars:2},5);
 assert.equal(chart.progression.steps.length,12);assert.ok(chart.progression.steps.every(s=>s.chord==='min7'&&s.mode==='dorian'&&s.bars===2));
 const names=chart.progression.steps.slice(0,4).map((s,i)=>{const h=harmonyAt({...chart,progression:true,template:'custom',customProgression:chart.progression},i);assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));return h.name+h.suffix;});assert.deepEqual(names,['Am7','Cm7','E♭m7','G♭m7']);
 assert.throws(()=>generateProgression({approach:'fixed',chord:'maj7',mode:'dorian'}),/mode/);
});
test('random drills obey their quality and root filters; generated charts are stable data',()=>{
 const config={approach:'random',roots:[0,4,7],key:0,qualities:['min7','dom7'],count:8,bars:1};const a=generateProgression(config,82),b=generateProgression(config,82);assert.deepEqual(a,b);assert.ok(a.progression.steps.every(s=>['min7','dom7'].includes(s.chord)&&[0,4,7].includes(s.root)));assert.throws(()=>generateProgression({...config,qualities:[]}),/quality/);assert.throws(()=>generateProgression({...config,roots:[]}),/root/);
});
test('musical progressions maintain diatonic membership or explicit compatible borrowed/secondary/substitute harmony',()=>{
 for(const tonality of ['major','minor','modal'])for(const modalMode of ['dorian','lydian','phrygian'])for(const vocabulary of ['triads','sevenths','extensions'])for(const complexity of ['diatonic','borrowed','secondary','substitutions']){
  const c=generateProgression({approach:'musical',key:4,count:16,tonality,modalMode,vocabulary,complexity},36),parent=MODES[tonality==='modal'?modalMode:tonality];assert.equal(c.progression.steps.length,16);assert.equal(c.progression.steps.at(-1).root,0);
  for(const s of c.progression.steps){assert.ok(generatorModes(s.chord).some(m=>m.id===s.mode),s.chord+' '+s.mode);if(complexity==='diatonic'||tonality==='modal')assert.ok(CHORDS[s.chord].intervals.every(n=>parent.intervals.includes((s.root+n)%12)));}
 }
});
test('position selection stays independent and preserves a custom route across a longer chart',()=>{
 assert.deepEqual(generatorPositions({},8,['I','IV','V']),['I','IV','V','I','IV','V','I','IV']);assert.equal(generatorPositions({},8),null);assert.deepEqual(generatorPositions({position:'III'},4),['III','III','III','III']);
 const selected=generatorPositions({position:'selected',positionSet:['II','V']},12,null,37);assert.ok(selected.every(n=>['II','V'].includes(n)));assert.ok(selected.every((n,i)=>!i||n!==selected[i-1]));assert.throws(()=>generatorPositions({position:'selected',positionSet:[]},4),/position/);
});

test('automatic length uses one interval cycle when full root coverage is off',()=>{
 const base={approach:'fixed',key:9,chord:'maj7',mode:'lydian',count:'all',coverage:false,bars:2};
 for(const direction of [1,-1])for(const [order,length]of Object.entries({chromatic:12,whole:6,minorThird:4,majorThird:3,fourths:12,fifths:12,tritone:2,alternating:24})){
  const chart=generateProgression({...base,order,direction},2);assert.equal(chart.progression.steps.length,length,order);assert.equal(chart.positions,null);
  assert.equal(chart.progression.steps[0].root,0);assert.notEqual(chart.progression.steps.at(-1).root,0,order);
 }
 const major=generateProgression({...base,order:'majorThird'},2);assert.deepEqual(major.progression.steps.map(s=>s.root),[0,4,8]);assert.ok(major.progression.steps.every(s=>s.chord==='maj7'&&s.mode==='lydian'&&s.bars===2));
 const longer=generateProgression({...base,order:'majorThird',count:12},2);assert.deepEqual(longer.progression.steps.map(s=>s.root),[0,4,8,0,4,8,0,4,8,0,4,8]);
 const covered=generateProgression({...base,order:'majorThird',coverage:true},2);assert.equal(covered.progression.steps.length,12);assert.equal(new Set(covered.progression.steps.map(s=>s.root)).size,12);
});
test('automatic random drills use one selected-root pass and interval cycles respect root filters',()=>{
 for(const approach of ['fixed','random']){
  const random=generateProgression({approach,key:9,chord:'min7',mode:'dorian',order:'random',roots:[9,0,3,6],count:'all',coverage:false},7);assert.equal(random.progression.steps.length,4);assert.equal(new Set(random.progression.steps.map(s=>s.root)).size,4);
  const cycle=generateProgression({approach,key:9,chord:'min7',mode:'dorian',order:'minorThird',roots:[9,0,3,6],count:'all',coverage:false},7);assert.deepEqual(cycle.progression.steps.map(s=>s.root),[0,3,6,9]);
  assert.throws(()=>generateProgression({approach,key:9,chord:'min7',mode:'dorian',order:'minorThird',roots:[9,0,3],count:'all',coverage:false},7),/interval cycle leaves/);
 }
 const musical=generateProgression({approach:'musical',key:9,count:'all',coverage:false},5);assert.equal(musical.progression.steps.length,8);
});
