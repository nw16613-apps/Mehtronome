import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {perStringExerciseGroups} from '../src/practice/per-string-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
const h=harmonyAt({key:9,mode:'lydian',chord:'maj7'}),o={fingering:'twoOne',inversion:0,fingeringFret:5,motion:'ascending',rhythm:'sixteenths',study:'positional'};
test('fingering captions occur once across bars, repeated slots and system breaks, then again on register change',()=>{
 const groups=perStringExerciseGroups([h,h,h],[8,8,8],[{},{},{}],o);let plan=progressionStudyPlan(groups,[0,1,2],[2,2,2],4,'positional','sixteenths');
 const captions=svg=>[...svg.matchAll(/class="exercise-degree"[^>]*>([^<]*)/g)].map(m=>m[1]);assert.deepEqual(captions(progressionNotationSvg(plan,'Study')),[groups[0].fingeringLabel]);
 const changed=perStringExerciseGroups([h],[8],[{}],{...o,fingeringFret:17})[0];groups[2]={...changed,slot:2};plan=progressionStudyPlan(groups,[0,1,2],[2,2,2],4,'positional','sixteenths');assert.equal(captions(progressionNotationSvg(plan,'Study')).length,2);
});
