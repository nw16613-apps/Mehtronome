import {modeChordHarmonies} from './mode-chords.js';
import {MODES} from '../audio/music.js';
import {TUNING} from './fretboard.js';
import {exerciseArpeggioHarmony} from './arpeggio-harmony.js';
// Every three-string subset, ordered from bass string to treble string.
export const SPREAD_STRING_SETS=[];
for(let a=0;a<4;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<6;c++)SPREAD_STRING_SETS.push([a,b,c]);
/** Open triads: bass, next-but-one chord tone, then the remaining tone above
 * the octave. Enumerate actual pitches, preserving bass inversion and strings. */
function chordCatalogue(harmony,setIndex=0){
 const core=exerciseArpeggioHarmony(harmony,'triad'),strings=SPREAD_STRING_SETS[setIndex];
 if(!strings)throw new Error('Choose a supported three-string combination.');
 if(core.chordPcs.length!==3)return [];
 return core.chordPcs.map((pc,inversion)=>{
  const choices=[];
  for(let first=TUNING[strings[0]]+1;first<=TUNING[strings[0]]+24;first++){
   if(first%12!==pc)continue;
   const pitches=[first];
   for(let voice=1;voice<3;voice++){
    const nextPc=core.chordPcs[(inversion+voice*2)%3];
    let midi=pitches.at(-1)+1;while(midi%12!==nextPc)midi++;
    pitches.push(midi);
   }
   const notes=pitches.map((midi,i)=>{const string=strings[i],pc=midi%12,index=harmony.chordPcs.indexOf(pc);return {string,fret:midi-TUNING[string],midi,pc,root:pc===harmony.chordPcs[0],chord:true,scale:harmony.scalePcs.includes(pc),scaleIndex:-1,characteristic:false,name:harmony.tones[index],chromaticDegree:harmony.intervals[index]};});
   if(notes.some(n=>n.fret<1||n.fret>24))continue;
   const frets=notes.map(n=>n.fret);
   if(Math.max(...frets)-Math.min(...frets)>4)continue;
   choices.push({kind:'spread',firstFret:notes[0].fret,start:Math.min(...frets),end:Math.max(...frets),notes,rootPc:harmony.chordPcs[0],muted:TUNING.map((_,i)=>i).filter(i=>!strings.includes(i))});
  }
  return {degree:harmony.chordPcs.indexOf(pc),inversion,choices,extended:false};
 });
}

const inversionNames=['Root position','First inversion','Second inversion'];
export function spreadTriadCatalogue(harmony,setIndex=0,source='chord'){
 const sources=source==='mode'?modeChordHarmonies(harmony,3):[exerciseArpeggioHarmony(harmony,'triad')];
 return sources.flatMap((h,degree)=>chordCatalogue(h,setIndex).map((entry,inversion)=>({...entry,degree:source==='mode'?degree*3+inversion:entry.degree,harmony:h,label:(source==='mode'?'Degree '+MODES[harmony.mode].degrees[degree]+' · '+h.name+h.suffix+' · ':'')+inversionNames[inversion]+' · '+h.tones[inversion]+' ('+h.intervals[inversion]+')',tag:source==='mode'?MODES[harmony.mode].degrees[degree]+['R','¹','²'][inversion]:['R','1st','2nd'][inversion]})));
}
// Retain stable set indices for saved exercises; menus expose only sets with
// at least one fully fretted inversion spanning at most five fret positions.
export function playableSpreadStringSets(harmony,source='chord'){
 return SPREAD_STRING_SETS.map((strings,index)=>({strings,index})).filter(({index})=>spreadTriadCatalogue(harmony,index,source).some(entry=>entry.choices.length));
}
