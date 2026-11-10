import {CHORDS} from './music.js';
import {extensionChoices} from './extensions.js';
const pc=n=>(n%12+12)%12;
// Bass owns the low register. Keep defining tones, and draw colours only from
// the chart's scale: no major-third/natural-eleventh clash or invented seventh.
export function pianoVoicings(h){
 const ints=CHORDS[h.chord].intervals,third=ints[1],seventh=ints.find(n=>n>=9&&n<=11);
 const required=[third,seventh,...ints.filter(n=>pc(n)===6||pc(n)===8)].filter(n=>n!==undefined).map(n=>pc(h.root+n));
 const core=[...new Set(ints.map(n=>pc(h.root+n)))],sets=[core.slice(0,4)];
 if(seventh!==undefined){
  const colours=extensionChoices(h,Infinity).map(n=>pc(n.midi));
  for(const colour of colours)sets.push([...new Set([...required,colour,core[2]])].slice(0,4));
  for(let a=0;a<colours.length;a++)for(let b=a+1;b<colours.length;b++){
   const tones=[...new Set([...required,colours[a],colours[b]])];if(tones.length<=4)sets.push(tones);
  }
 }
 const result=[],seen=new Set();
 for(const set of sets){const tones=[...set].sort((a,b)=>a-b);
 for(let inversion=0;inversion<tones.length;inversion++)for(let octave=4;octave<=5;octave++){
  const notes=[];for(let i=0;i<tones.length;i++){let n=octave*12+tones[(inversion+i)%tones.length];while(notes.length&&n<=notes.at(-1))n+=12;notes.push(n);}
  if(notes.length===2)notes.push(notes[0]+12);
  if(notes.length<3||notes[0]<48||notes.at(-1)>81||notes.at(-1)-notes[0]>19)continue;
  const key=notes.join(',');if(!seen.has(key)){seen.add(key);result.push(notes);}
 }
 }
 return result;
}
