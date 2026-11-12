import {fingeringCatalogue,playableFingeringStringSets,fingeringName} from '../guitar/fingering-catalogue.js';
import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {MODES} from '../audio/music.js';
export const PER_STRING_STUDIES=new Set(['positional','positionalscale','arpgroups3','arpgroups4']);
export function exerciseFingeringCatalogue(h,o){
 const sets=playableFingeringStringSets(h,o.fingering,o.spreadSource),set=sets.find(s=>s.index===o.fingeringStringSet)?.index??sets[0]?.index??o.fingeringStringSet??0;
 const material=o.fingering==='three'||o.exactFingering||o.material===undefined?h:exerciseArpeggioHarmony(h,o.material);
 return fingeringCatalogue(material,o.fingering,set,o.spreadSource,o.material==='triad'?3:4);
}
const inversionNames=['Root position','First inversion','Second inversion','Third inversion','Fourth inversion','Fifth inversion','Sixth inversion'];
export function perStringExerciseChoice(harmony,options){
 const catalogue=exerciseFingeringCatalogue(harmony,options),entry=catalogue[options.inversion]?.choices.length?catalogue[options.inversion]:catalogue.find(e=>e.choices.length);
 if(!entry||!entry.choices.length)return {board:{start:1,end:5,notes:[],muted:[]},entry:{choices:[]},index:0,label:options.fingering==='spread'?'Spread triad':options.fingering==='drop2'?'Drop 2':'Drop 3',warning:`${harmony.name}${harmony.suffix}: no playable chord voicing on this string set; rest for this chord.`};
 const board=entry.choices.reduce((best,b)=>!best||Math.abs(b.firstFret-options.fingeringFret)<Math.abs(best.firstFret-options.fingeringFret)?b:best,null);
 const index=catalogue.indexOf(entry),label=entry.label?fingeringName(options.fingering)+' · '+entry.label:`${options.fingering==='three'?'3 notes per string':options.fingering==='spread'?'Spread triad':options.fingering==='drop2'?'Drop 2':options.fingering==='drop3'?'Drop 3':options.fingering==='oneTwo'?'1–2–1–2–1–2':'2–1–2–1–2–1'} · ${options.fingering==='three'?'Starting degree '+MODES[harmony.mode].degrees[entry.degree]:inversionNames[index]}`;
 return {board,entry,index,label,warning:catalogue[options.inversion]?.choices.length?'':`The selected inversion is absent from ${harmony.name}${harmony.suffix}; using the first playable inversion.`};
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
  const phaseStart=cycle.length?phase%cycle.length:0;
  const notes=Array.from({length:cycle.length?capacity:0},()=>cycle[phase++%cycle.length]);
  const cellLengths=[],cellOffsets=[],cellSizes=[];
  if(!size&&cycle.length)for(let offset=0;offset<notes.length;){const at=(phaseStart+offset)%cycle.length,legStart=at<up.length?0:up.length,legSize=at<up.length?up.length:down.length,length=Math.min(notes.length-offset,legStart+legSize-at);cellLengths.push(length);cellOffsets.push(at-legStart);cellSizes.push(legSize);offset+=length;}
  const endingDirection=notes.length&&cycle.length>1?Math.sign(cycle[phase%cycle.length].midi-notes.at(-1).midi):options.motion==='descending'?-1:1;
  const group={...(cellLengths.length?{cellLengths,cellOffsets,cellSizes}:{}),endingDirection,slot,globalStart,harmony,board,position:{...positions[slot],perString:true},perString:true,fingeringLabel:choice.label,applicationLabel:choice.label,chord:harmony.name+harmony.suffix,annotation:choice.label,notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),warning:[choice.warning,capacity<board.notes.length?`${harmony.name}${harmony.suffix}: only ${capacity} notes fit before the next chord. Use a faster subdivision or longer chord duration for the full shape.`:'',choice.entry.extended?'This continuous shape extends beyond fret 24.':''].filter(Boolean).join(' '),targetIndices:[]};
  globalStart+=notes.length;return group;
 });
}
