import {test} from 'node:test';import assert from 'node:assert/strict';
import {dropStudy} from '../src/guitar/drop-study.js';import {selectedVoices} from '../src/guitar/voicing-phrases.js';import {harmonyAt} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';import {earQuestion,earAnswer,EAR_QUALITIES} from '../src/practice/ear-training.js';import {validateTake,compareTime,takeExtension} from '../src/practice/takes.js';
test('written drop phrases retain physical string restrictions, rhythms and real semitone resolutions across all keys',()=>{
 for(let key=0;key<12;key++)for(const type of ['drop2','drop3'])for(const part of ['all','upper','inner','top'])for(const phrase of ['arpeggio','motif','approach']){
  const harmonies=[0,1,2].map(i=>harmonyAt({key,progression:true,template:'major251essential'},i)),study=dropStudy(harmonies,[0,1,2],[4,4,8],4,{type,part,phrase});assert.equal(study.plan.duration,16);
  for(const group of study.groups){assert.ok(group.drop);const strings=selectedVoices(group.drop,part).map(n=>n.string);for(const note of group.notes){assert.ok(part==='all'||strings.includes(note.string));assert.equal(note.midi,TUNING[note.string]+note.fret);assert.ok(note.fret>=1&&note.fret<=17);assert.ok(group.board.start<=note.fret&&group.board.end>=note.fret);}if(phrase==='motif')assert.ok(group.timing.some(e=>e.duration===1.5));}
  if(phrase==='approach'){for(let slot=0;slot<2;slot++){const from=study.groups[slot].notes.at(-1),to=study.groups[slot+1].notes[0];assert.equal(from.string,to.string);assert.equal(Math.abs(from.midi-to.midi),1);}assert.ok(harmonies[2].chordPcs.includes(study.groups[2].notes.at(-1).pc));}
  for(const e of study.plan.events){const slot=study.plan.slots[e.slot];assert.ok(e.start+e.duration<=slot.start+slot.duration+1e-8);}
 }
 const h=harmonyAt({key:0,chord:'maj7'});assert.equal(dropStudy([h],[0],[3],3,{phrase:'motif'}).plan.events.length,0);assert.equal(dropStudy([h],[0],[1],4,{part:'top'}).groups[0].notes.length,1);
});
test('ear questions match their sounded pitches, answer keys and physical fretboard locations',()=>{
 for(let i=0;i<100;i++)for(const kind of ['quality','movement','fretboard']){let n=i;const q=earQuestion(kind,()=>((n++*37)%100)/100);assert.equal(earAnswer(q,q.answer),true);assert.equal(earAnswer(q,'invalid'),false);if(kind==='quality')assert.deepEqual(q.events.map(e=>e.midi-q.events[0].midi),EAR_QUALITIES[q.answer].intervals);if(kind==='movement')assert.equal(q.events[1].midi-q.events[0].midi,Number(q.answer));if(kind==='fretboard')for(const c of q.choices){const [string,fret]=c.id.split(':').map(Number);assert.equal(c.midi,TUNING[string]+fret);}}
});
test('recording storage limits, trim alignment and file extensions are honest',()=>{
 const t={id:'x',name:'Take',blob:new Blob(['audio'],{type:'audio/webm'}),trimMs:400};assert.equal(validateTake(t).trimMs,400);assert.equal(compareTime(2,400,10),2.4);assert.equal(compareTime(20,400,5),null);assert.equal(compareTime(0,-50,3),0);assert.equal(takeExtension('audio/mp4'),'m4a');assert.equal(takeExtension('audio/webm;codecs=opus'),'webm');assert.throws(()=>validateTake({...t,blob:new Blob([])}));assert.throws(()=>validateTake(t,Array.from({length:10},(_,i)=>({...t,id:String(i)}))));
});
