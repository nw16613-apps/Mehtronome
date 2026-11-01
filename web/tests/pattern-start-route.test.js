import {test} from 'node:test';import assert from 'node:assert/strict';
import {patternStartRoute} from '../src/practice/pattern-start-route.js';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const h=harmonyAt({key:9,chord:'min7',mode:'dorian'}),hs=Array(4).fill(h);
const role=(g)=>{const core=arpeggioHarmony(g.harmony);return core.intervals[core.chordPcs.indexOf(g.notes[0].pc)]?.match(/\d+/)?.[0];};
test('route choices bind to original chart slots, survive serialization and reject another chart',()=>{
 const initial=patternStartRoute(hs),edited=patternStartRoute(hs,initial.value,{step:2,value:'3:0'});
 assert.deepEqual(edited.choices,['inherit','inherit','3:0','inherit']);assert.deepEqual(patternStartRoute(hs,edited.value),edited);
 assert.deepEqual(patternStartRoute([harmonyAt({key:2,chord:'maj7',mode:'major'}),...hs.slice(1)],edited.value).choices,initial.choices);
 assert.deepEqual(patternStartRoute(hs,'<bad>').choices,initial.choices);
});
test('card entries override the global degree independently at all subdivisions and positions',()=>{
 for(const study of ['positional','positionalscale'])for(const rhythm of ['eighths','triplets','sixteenths'])for(const shapes of [Array(4).fill('C'),['D','C','A','G']]){
  const path=shapes.map(shape=>({...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape}));
  const groups=progressionExerciseGroups(hs,[1,1,1,1],fretboardFor(h,shapes[0]),{study,rhythm,startTone:'1:0',startTones:['3:0','5:0','7:0','inherit'],positionPath:path});
  assert.deepEqual(groups.map(role),['3','5','7','1'],`${study} ${rhythm}`);
  const defaults=progressionExerciseGroups(hs,[1,1,1,1],fretboardFor(h,shapes[0]),{study,rhythm,startTone:'3:0',startTones:['inherit','default','3:0','3:0'],positionPath:path});
  assert.equal(defaults[2].notes[0].pc,0);assert.equal(defaults[3].notes[0].pc,0);
 }
});
test('an override starts once at entry and a long card traverses continuously',()=>{
 for(const study of ['positional','positionalscale'])for(const rhythm of ['eighths','triplets','sixteenths']){
  const board=fretboardFor(h,'C'),position={...cagedPositionFor(board),geometryShape:'C'};
  const options={study,rhythm,startTone:'1:0',positionPath:[position]};
  const override=progressionExerciseGroups([h],[8],board,{...options,startTones:['3:0']});
  const global=progressionExerciseGroups([h],[8],board,{...options,startTone:'3:0'});
  assert.deepEqual(override[0].notes,global[0].notes);
 }
});
