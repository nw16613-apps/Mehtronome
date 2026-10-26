import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS,Engine} from '../src/audio/engine.js';
import {harmonyAt,progressionOrder,progressionDurations,progressionStep} from '../src/audio/music.js';
import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';
import {alignedProgressionGroups} from '../src/guitar/exercises.js';
import {progressionStudyPlan,planPosition} from '../src/practice/progression-timing.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
function fixture(settings,shape='E',study='guidetones',motion='ascending',rhythm='eighths'){
 const order=progressionOrder(settings),harmonies=order.map(i=>harmonyAt(settings,i)),board=fretboardFor(harmonies[0],shape),groups=alignedProgressionGroups(board,harmonies,study,'seventh',motion);
 return {order,harmonies,board,groups,plan:progressionStudyPlan(groups,order,progressionDurations(settings),settings.beats,study,rhythm)};
}
test('guide studies transpose across 12 keys and five regions; chord order is independent of pitch direction',()=>{
 for(let key=0;key<12;key++)for(const shape of ['C','A','G','E','D'])for(const motion of ['ascending','descending']){
 const s={...DEFAULTS,key,progression:true,template:'major251essential'},f=fixture(s,shape,'guidetones',motion);
 assert.equal(f.plan.duration,16);assert.deepEqual(f.plan.events.map(e=>e.start),[0,4,8]);assert.deepEqual(f.plan.events.map(e=>e.duration),[4,4,8]);
 for(const [i,g]of f.groups.entries()){assert.ok([f.harmonies[i].chordPcs[1],f.harmonies[i].chordPcs[3]].includes(g.notes[0].pc));assert.equal(g.notes[0].midi,TUNING[g.notes[0].string]+g.notes[0].fret);assert.ok(g.notes[0].fret>=f.board.start&&g.notes[0].fret<=f.board.end);}
 }});
test('plan chord slots agree with engine progression order, wrapped loops, metres and custom durations',()=>{
 for(const beats of [3,4,5,7])for(const loop of [false,true]){
 const s={...DEFAULTS,progression:true,template:'major251essential',beats,loopEnabled:loop,loopStart:2,loopEnd:1};const {plan}=fixture(s);
 for(let beat=0;beat<plan.duration*2;beat+=.25)assert.equal(planPosition(plan,beat).slot.step,progressionStep(s,Math.floor(beat/beats)));
 }
 const s={...DEFAULTS,progression:true,template:'custom',customProgression:{steps:[{bars:3},{bars:1},{bars:2}]}},groups=[0,1,2].map(slot=>({slot,chord:'X',notes:[{midi:60,name:'C',string:1,fret:15}]}));
 const plan=progressionStudyPlan(groups,[2,0,1],progressionDurations(s),4,'guidetones');assert.deepEqual(plan.events.map(e=>[e.step,e.start,e.duration]),[[2,0,8],[0,8,12],[1,20,4]]);
});
test('connections play inside each chord and rest afterwards; a short cell retains the silent chord slots',()=>{
 const s={...DEFAULTS,progression:true,template:'major251essential'};const f=fixture(s,'E','connections','ascending','triplets');assert.equal(f.plan.slots.length,3);
 for(const e of f.plan.events){const slot=f.plan.slots[e.slot];assert.ok(e.start>=slot.start);assert.ok(e.start+e.duration<=slot.start+slot.duration+1e-9);assert.ok(f.harmonies[e.slot].chordPcs.includes(e.note.pc));}
 assert.equal(planPosition(f.plan,3).event,undefined);
 const groups=f.groups.map((g,i)=>i?{...g,notes:[]}:g),plan=progressionStudyPlan(groups,f.order,progressionDurations(s),4,'connections');assert.equal(plan.duration,16);assert.equal(planPosition(plan,4).slot.step,1);assert.equal(planPosition(plan,4).event,undefined);
});
test('notation shows whole-note holds, tied multi-bar notes, correct metre and real rests',()=>{
 const f=fixture({...DEFAULTS,progression:true,template:'major251essential'});const svg=progressionNotationSvg(f.plan,'Guide');assert.match(svg,/class="note-hole"/);assert.match(svg,/class="note-tie"/);assert.match(svg,/data-note-index="2"/);assert.equal((svg.match(/data-duration-beats="4"/g)||[]).length,4);assert.equal((svg.match(/class="bar-line" data-bar/g)||[]).length,4);
 const c=fixture({...DEFAULTS,progression:true,template:'major251essential',beats:3},'E','connections');const notes=progressionNotationSvg(c.plan,'Connections');assert.match(notes,/class="time-signature">3</);assert.match(notes,/data-rest-beats=/);
});
test('real engine changes chords at the same beat offsets as the study plan after count-in',()=>{
 const s={...DEFAULTS,key:9,bpm:240,beats:4,progression:true,template:'major251essential',countIn:true};const f=fixture(s),engine=new Engine(8000);engine.configure(s);engine.reset();const beats=[];engine.render(new Float32Array(8000*6),event=>{if(!event.counting&&event.step!==undefined)beats.push(event);});
 assert.equal(beats[0].step,0);assert.equal(beats[4].step,1);assert.equal(beats[8].step,2);assert.equal(beats[16].step,0);
 for(let i=0;i<beats.length;i++)assert.equal(beats[i].step,planPosition(f.plan,i).slot.step);
});
test('one-shot backing ends on the progression boundary without starting an extra chord',()=>{
 const settings={...DEFAULTS,bpm:240,beats:4,progression:true,template:'major251essential',countIn:true,sessionSeconds:4,sessionFinishBar:false};
 const engine=new Engine(8000);engine.configure(settings);engine.reset();const beats=[],completion=[];
 engine.render(new Float32Array(8000*6),e=>{if(!e.counting)beats.push(e);},undefined,undefined,undefined,undefined,undefined,undefined,e=>{if(e.type==='session-complete')completion.push(e);});
 assert.equal(engine.running,false);assert.equal(beats.filter(e=>e.beat!==undefined).length,16);assert.equal(completion.length,1);assert.equal(completion[0].elapsed,4);
});
test('very short chord slots warn when the chosen arpeggio rhythm cannot fit',()=>{const f=fixture({...DEFAULTS,beats:1,progression:true,template:'major251essential'},'E','connections');assert.ok(f.plan.warnings.some(s=>s.includes('only the first 2 notes fit')));for(const rhythm of ['triplets','sixteenths'])assert.ok(progressionNotationSvg(fixture({...DEFAULTS,progression:true,template:'major251essential'},'E','connections','ascending',rhythm).plan,'Rhythm').includes('notation-rest'));});
