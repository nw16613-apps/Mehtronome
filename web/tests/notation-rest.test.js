import {test} from 'node:test';import assert from 'node:assert/strict';
import {notationRest} from '../src/practice/notation-rest.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
test('all rest values use accessible vector shapes without font glyphs',()=>{
 for(const [beats,kind]of [[4,'whole'],[2,'half'],[1,'quarter'],[.5,'eighth'],[1/3,'eighth'],[.25,'sixteenth']]){
  const svg=notationRest(100,beats);assert.match(svg,new RegExp(`data-rest-kind="${kind}"`));assert.match(svg,new RegExp(`aria-label="${kind} rest"`));assert.match(svg,/<(?:rect|path)/);assert.doesNotMatch(svg,/<text|[𝄻𝄼𝄽𝄾𝄿]/u);
 }
});
test('empty measures and partial bars render real vector rests',()=>{
 for(const division of [2,3,4]){
  const plan={beats:4,duration:8,division,study:'enclosures4',slots:[{slot:0,start:0,duration:8,chord:'Am7',annotation:''}],events:[{index:0,slot:0,start:1,duration:.25,note:{name:'A',midi:57,string:2,fret:7}}]};
  const svg=progressionNotationSvg(plan,'Rest check');assert.match(svg,/<g class="notation-rest"/);assert.match(svg,/data-rest-kind="whole"/);assert.doesNotMatch(svg,/<text class="notation-rest"/);
 }
});
