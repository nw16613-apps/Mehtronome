import {MODES} from '../audio/music.js';
import {modeChordHarmonies} from './mode-chords.js';
import {SPREAD_STRING_SETS,spreadTriadCatalogue} from './spread-triads.js';
import {DROP_STRING_SETS,dropVoicingCatalogue} from './drop-voicings.js';
import {perStringCatalogue} from './per-string.js';
const inversions=['Root position','First inversion','Second inversion','Third inversion','Fourth inversion','Fifth inversion','Sixth inversion'];
export const fingeringName=kind=>({spread:'Spread triad',drop2:'Drop 2',drop3:'Drop 3',oneTwo:'1–2–1–2–1–2',twoOne:'2–1–2–1–2–1',three:'3 notes per string'}[kind]);
const practicalArpeggio=board=>board.end<=24&&board.notes.every(n=>n.fret>0)&&Array.from({length:6},(_,string)=>board.notes.filter(n=>n.string===string).map(n=>n.fret)).every(frets=>Math.max(...frets)-Math.min(...frets)<=4);
export function fingeringCatalogue(harmony,kind,setIndex=0,source='chord',size=4){
 if(kind==='spread')return spreadTriadCatalogue(harmony,setIndex,source);
 if(kind==='three')return perStringCatalogue(harmony,kind);
 const sources=source==='mode'?modeChordHarmonies(harmony,kind.startsWith('drop')?4:size):[harmony];
 return sources.flatMap((h,modeDegree)=>{
  const entries=kind.startsWith('drop')?dropVoicingCatalogue(h,kind,setIndex):perStringCatalogue(h,kind);
  return entries.map((entry,inversion)=>{
   const choices=kind.startsWith('drop')?entry.choices:entry.choices.filter(practicalArpeggio);
   return {...entry,choices,extended:false,inversion,harmony:h,degree:source==='mode'?modeDegree*size+inversion:entry.degree,label:(source==='mode'?'Degree '+MODES[harmony.mode].degrees[modeDegree]+' · '+h.name+h.suffix+' · ':'')+inversions[inversion]+' · '+h.tones[entry.degree]+' ('+h.intervals[entry.degree]+')',tag:source==='mode'?MODES[harmony.mode].degrees[modeDegree]+['R','¹','²','³'][inversion]:['R','1st','2nd','3rd','4th','5th','6th'][inversion]};
  });
 });
}
export function playableFingeringStringSets(harmony,kind,source='chord'){
 const sets=kind==='spread'?SPREAD_STRING_SETS:DROP_STRING_SETS[kind]||[];
 return sets.map((strings,index)=>({strings,index})).filter(({index})=>fingeringCatalogue(harmony,kind,index,source).some(e=>e.choices.length));
}
