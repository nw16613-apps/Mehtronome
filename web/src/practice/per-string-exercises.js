import {perStringCatalogue} from '../guitar/per-string.js';
export const PER_STRING_STUDIES=new Set(['positional','arpgroups3','arpgroups4']);
const inversionNames=['Root position','First inversion','Second inversion','Third inversion','Fourth inversion','Fifth inversion','Sixth inversion'];
export function perStringExerciseChoice(harmony,options){
 const catalogue=perStringCatalogue(harmony,options.fingering),entry=catalogue[options.inversion]||catalogue[0];
 const board=entry.choices.reduce((best,b)=>!best||Math.abs(b.firstFret-options.fingeringFret)<Math.abs(best.firstFret-options.fingeringFret)?b:best,null);
 const index=catalogue.indexOf(entry),label=`${options.fingering==='oneTwo'?'1–2–1–2–1–2':'2–1–2–1–2–1'} · ${inversionNames[index]}`;
 return {board,entry,index,label,warning:catalogue[options.inversion]?'':`The selected inversion is absent from ${harmony.name}${harmony.suffix}; using root position.`};
}
/** Reuse the precise fretboard fingering. Cycles preserve string/fret identity
 * and never repeat turning notes. Repeated identical slots retain their phase. */
export function perStringExerciseGroups(harmonies,durations,positions,options){
 const division=options.rhythm==='sixteenths'?4:options.rhythm==='triplets'?3:2;
 let globalStart=0,phase=0,previous='';
 return harmonies.map((harmony,slot)=>{
  const choice=perStringExerciseChoice(harmony,options),board=choice.board;
  const ordered=options.motion==='descending'?[...board.notes].reverse():board.notes;
  const size=options.study==='arpgroups3'?3:options.study==='arpgroups4'?4:0;
  const up=size?ordered.slice(0,ordered.length-size+1).flatMap((_,i)=>ordered.slice(i,i+size)):ordered;
  const reverse=[...ordered].reverse();
  const down=size?reverse.slice(1,reverse.length-size).flatMap((_,i)=>reverse.slice(i+1,i+1+size)):ordered.slice(1,-1).reverse();
  const cycle=[...up,...down],identity=JSON.stringify([harmony.chordPcs,board.notes.map(n=>[n.string,n.fret]),options.motion,options.study]);
  if(identity!==previous)phase=0;previous=identity;
  const capacity=durations?Math.max(1,Math.floor(durations[slot]*division)):cycle.length;
  const notes=Array.from({length:capacity},()=>cycle[phase++%cycle.length]);
  const group={slot,globalStart,harmony,board,position:{...positions[slot],perString:true},perString:true,fingeringLabel:choice.label,applicationLabel:choice.label,chord:harmony.name+harmony.suffix,annotation:choice.label,notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),warning:[choice.warning,capacity<board.notes.length?`${harmony.name}${harmony.suffix}: only ${capacity} notes fit before the next chord. Use a faster subdivision or longer chord duration for the full shape.`:'',choice.entry.extended?'This continuous shape extends beyond fret 24.':''].filter(Boolean).join(' '),targetIndices:[]};
  globalStart+=notes.length;return group;
 });
}
