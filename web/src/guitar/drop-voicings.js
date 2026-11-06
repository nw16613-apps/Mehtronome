import {TUNING} from './fretboard.js';
import {arpeggioHarmony} from './arpeggio-harmony.js';
export const DROP_STRING_SETS={drop2:[[0,1,2,3],[1,2,3,4],[2,3,4,5]],drop3:[[0,2,3,4],[1,3,4,5]]};
/** Form actual drop voicings from close-position tetrads, then assign the
 * ordered voices to a standard guitar string set. No nearest-tone substitutions. */
export function dropVoicingCatalogue(harmony,kind='drop2',setIndex=0){
 const core=arpeggioHarmony(harmony),sets=DROP_STRING_SETS[kind],strings=sets?.[setIndex];
 if(!strings)throw new Error('Choose a supported drop voicing and string set.');
 if(core.chordPcs.length!==4)return [];
 const entries=core.chordPcs.map((pc,index)=>({degree:harmony.chordPcs.indexOf(pc),inversion:index,choices:[],extended:false}));
 const dropIndex=kind==='drop2'?2:1,seen=new Set();
 for(let inversion=0;inversion<4;inversion++)for(let first=24;first<=100;first++){
  if(first%12!==core.chordPcs[inversion])continue;
  const close=[first];for(let voice=1;voice<4;voice++){const pc=core.chordPcs[(inversion+voice)%4];let midi=close.at(-1)+1;while(midi%12!==pc)midi++;close.push(midi);}
  const voiced=[...close];voiced[dropIndex]-=12;voiced.sort((a,b)=>a-b);
  const notes=voiced.map((midi,i)=>{const string=strings[i],pc=midi%12,index=harmony.chordPcs.indexOf(pc);return {string,fret:midi-TUNING[string],midi,pc,root:pc===harmony.chordPcs[0],chord:true,scale:harmony.scalePcs.includes(pc),scaleIndex:-1,characteristic:false,name:harmony.tones[index],chromaticDegree:harmony.intervals[index]};});
  if(notes.some(n=>n.fret<0||n.fret>24))continue;
  const fretted=notes.filter(n=>n.fret>0).map(n=>n.fret);if(fretted.length&&Math.max(...fretted)-Math.min(...fretted)>5)continue;
  const key=notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(key))continue;seen.add(key);
  const frets=notes.map(n=>n.fret),entry=entries[core.chordPcs.indexOf(notes[0].pc)];
  entry.choices.push({kind,firstFret:notes[0].fret,start:Math.min(...frets),end:Math.max(...frets),notes,rootPc:harmony.chordPcs[0],muted:TUNING.map((_,i)=>i).filter(i=>!strings.includes(i))});
 }
 for(const entry of entries)entry.choices.sort((a,b)=>a.firstFret-b.firstFret);
 return entries;
}
