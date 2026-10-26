import {test} from 'node:test';import assert from 'node:assert/strict';import {progressionNotationSvg} from '../src/practice/progression-notation.js';
const note={midi:60,name:'C',string:1,fret:15};
function plan(events,division=2){return {beats:4,duration:4,division,study:'harmonized',slots:[{slot:0,start:0,duration:4,chord:'Cmaj7',annotation:''}],events:events.map((event,index)=>({index,note,slot:0,...event}))};}
test('quavers and semiquavers beam by beat and keep existing note indices and durations',()=>{
 const eighths=progressionNotationSvg(plan(Array.from({length:8},(_,i)=>({start:i/2,duration:.5}))),'Quavers');assert.equal((eighths.match(/class="note-beam"/g)||[]).length,4);assert.ok(!eighths.includes('class="note-flag"'));assert.equal((eighths.match(/data-duration-beats="0.5"/g)||[]).length,8);
 const sixteenths=progressionNotationSvg(plan(Array.from({length:16},(_,i)=>({start:i/4,duration:.25})),4),'Semiquavers');assert.equal((sixteenths.match(/class="note-beam"/g)||[]).length,4);assert.equal((sixteenths.match(/class="note-beam secondary"/g)||[]).length,12);assert.ok(!sixteenths.includes('class="note-flag"'));
});
test('rests, beat boundaries and chord changes break beams; single notes retain flags',()=>{
 const p=plan([{start:0,duration:.5},{start:1,duration:.5},{start:1.5,duration:.5,slot:1}]);p.slots=[{slot:0,start:0,duration:1.5,chord:'C',annotation:''},{slot:1,start:1.5,duration:2.5,chord:'G',annotation:''}];const svg=progressionNotationSvg(p,'Separate');assert.ok(!svg.includes('class="note-beam"'));assert.equal((svg.match(/class="note-flag"/g)||[]).length,3);assert.ok(svg.includes('notation-rest'));
});
