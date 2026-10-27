import {test} from 'node:test';import assert from 'node:assert/strict';import {harmonyAt,CHORDS} from '../src/audio/music.js';import {recommendedMode} from '../src/practice/custom-progression.js';import {fretboardFor,TUNING,POSITIONS} from '../src/guitar/fretboard.js';import {dropCandidates,dropStudy} from '../src/guitar/drop-study.js';import {shellCandidates,shellStudy} from '../src/guitar/shells.js';import {earQuestion,earAnswer,readEarProgress,earProgressAttempt} from '../src/practice/ear-training.js';import {waveformPeaks,trimAtFraction} from '../src/practice/waveform.js';
test('CAGED pitch/interval labels and unique position identities remain coherent for every key and chord',()=>{
 for(let key=0;key<12;key++)for(const chord of Object.keys(CHORDS)){
  const h=harmonyAt({key,chord,mode:recommendedMode(chord)}),identities=[];
  for(const p of POSITIONS){const board=fretboardFor(h,p.shape);identities.push(board.positionIdentity);for(const n of board.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.equal(n.root,n.pc===h.chordPcs[0]);assert.equal(n.chord,h.chordPcs.includes(n.pc));if(n.chord)assert.equal(n.chromaticDegree,h.intervals[h.chordPcs.indexOf(n.pc)]);}}assert.equal(new Set(identities).size,5);
 }
 const outside=fretboardFor(harmonyAt({key:0,chord:'augMaj7',mode:'dorian'}));assert.ok(outside.notes.some(n=>n.pc===8&&n.chromaticDegree==='♯5'));
});
test('workshops honour slash basses or leave explicit gaps instead of mislabelling another bass',()=>{
 for(let key=0;key<12;key++)for(const chord of ['maj7','min7','dom7','halfDim','min6','augMaj7']){
  const h=harmonyAt({key,chord,mode:recommendedMode(chord)});for(const pc of h.chordPcs){const slash={...h,bassMidi:36+pc};for(const type of ['drop2','drop3'])for(const v of dropCandidates(slash,type))assert.equal(v.notes[0].pc,pc);if(pc!==key)assert.equal(shellCandidates(slash).length,0);}
 }
 const h={...harmonyAt({key:0,chord:'maj7',mode:'major'}),bassMidi:40,suffix:'maj7/E'};assert.ok(dropCandidates(h).length);assert.match(shellStudy([h],[0],[4],4).groups[0].warning,/requested slash bass/);const outside={...h,bassMidi:42};assert.equal(dropCandidates(outside).length,0);assert.equal(dropStudy([outside],[0],[4],4).plan.events.length,0);
});
test('long and syncopated forms retain string restrictions and fit their true chord durations',()=>{
 for(let key=0;key<12;key++)for(const phrase of ['syncopated','conversation'])for(const part of ['all','upper','inner','top']){
  const harmonies=[0,1,2].map(i=>harmonyAt({key,template:'major251essential',progression:true},i)),study=dropStudy(harmonies,[0,1,2],[8,8,16],4,{part,phrase});assert.equal(study.plan.duration,32);assert.equal(study.groups[0].timing[0].start,phrase==='syncopated'?.5:0);if(phrase==='conversation')assert.ok(study.groups[0].timing.some(e=>e.start===7&&e.duration===1));if(part==='top')assert.equal(new Set(study.groups.flatMap(g=>g.notes.map(n=>n.string))).size,1);for(const e of study.plan.events){const s=study.plan.slots[e.slot];assert.ok(e.start+e.duration<=s.start+s.duration);}
 }
 const h=harmonyAt({key:0,chord:'maj7'});assert.equal(dropStudy([h],[0],[4],4,{phrase:'conversation'}).plan.events.length,0);
});
test('ear levels have honest answer sets and bounded persisted activity scores',()=>{
 assert.equal(earQuestion('quality',()=>0,'foundation').choices.length,4);assert.equal(earQuestion('quality',()=>0,'extended').choices.length,7);assert.equal(earQuestion('fretboard',()=>0,'extended').choices.length,30);
 for(let i=0;i<100;i++){let n=i;for(const kind of ['quality','movement','fretboard']){const q=earQuestion(kind,()=>((n++*19)%100)/100,'extended');assert.ok(earAnswer(q,q.answer));}}
 let p=earProgressAttempt({},'extended:quality',true);p=earProgressAttempt(p,'extended:quality',false);p=earProgressAttempt(p,'extended:quality',null);assert.deepEqual(readEarProgress(JSON.stringify(p)),{'extended:quality':{total:2,correct:1,revealed:1}});assert.deepEqual(readEarProgress('{broken'),{});assert.deepEqual(readEarProgress('{"extended:quality":{"total":1,"correct":4,"revealed":0}}'),{});
});
test('waveform summaries preserve transients and click trims are clamped to the audio range',()=>{const samples=new Float32Array(1000);samples[127]=-.9;samples[800]=.5;const peaks=waveformPeaks(samples,10);assert.ok(peaks[1]>.89);assert.equal(peaks[8],.5);assert.equal(peaks[2],0);assert.equal(trimAtFraction(.25,8),2000);assert.equal(trimAtFraction(2,8),8000);assert.equal(trimAtFraction(-1,8),0);assert.ok(waveformPeaks(new Float32Array()).every(n=>n===0));});
