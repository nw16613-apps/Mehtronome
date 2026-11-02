import {TUNING} from './fretboard.js';
import {recommendedGrip} from './grips.js';
import {arpeggioHarmony} from './arpeggio-harmony.js';
import {CHORDS,MODES} from '../audio/music.js';
export const VOICING_FAMILIES={caged:'CAGED grips',close:'Close position',spread:'Spread triads',drop2:'Drop 2',drop3:'Drop 3',drop24:'Drop 2 & 4'};
export const CHORD_MATERIALS={guide:'Guide tones · defining tone & seventh',triad:'Triads',seventh:'Seventh chords',shell:'Shells · root, third, seventh',rootless:'Rootless · guide tones and colour',extensions:'Written extensions'};
export const STRING_SETS={auto:'Playable string sets',21:[4,5],32:[3,4],43:[2,3],54:[1,2],65:[0,1],321:[3,4,5],432:[2,3,4],543:[1,2,3],654:[0,1,2],421:[2,4,5],532:[1,3,4],643:[0,2,3],4321:[2,3,4,5],5432:[1,2,3,4],6543:[0,1,2,3],5321:[1,3,4,5],6432:[0,2,3,4],5421:[1,2,4,5],6431:[0,2,3,5],6532:[0,1,3,4]};
const mod=n=>(n%12+12)%12,role=i=>Number(i?.match(/\d+/)?.[0]),natural=[0,2,4,5,7,9,11];
function degreeName(root,name,semitones){const d=('CDEFGAB'.indexOf(name[0])-'CDEFGAB'.indexOf(root[0])+7)%7,delta=semitones-natural[d];return (delta<0?'♭'.repeat(-delta):'♯'.repeat(delta))+(d+1);}
function symbolFor(root,intervals,fallback){const matches=Object.values(CHORDS).filter(c=>c.intervals.length===intervals.length&&c.intervals.every(i=>intervals.includes(mod(i))));return root+(matches[0]?.symbol??fallback);}
export function chordMaterial(harmony,material='seventh'){
 const core=arpeggioHarmony(harmony),indices=core.intervals.map((i,index)=>({index,degree:role(i)}));let selected;
 if(material==='triad')selected=indices.filter(t=>t.degree<=5).slice(0,3).map(t=>t.index);
 else if(material==='shell')selected=indices.filter(t=>[1,3,7].includes(t.degree)||!indices.some(t=>t.degree===3)&&[2,4].includes(t.degree)).map(t=>t.index);
 else if(material==='rootless'||material==='guide')selected=indices.filter(t=>[3,7].includes(t.degree)||!indices.some(t=>t.degree===3)&&[2,4].includes(t.degree)||material==='rootless'&&t.degree===5&&/[♭♯]/.test(core.intervals[t.index])).map(t=>t.index);
 else selected=indices.map(t=>t.index);
 if(['shell','rootless','guide'].includes(material)&&!indices.some(t=>t.degree===7))return null;
 let pcs=selected.map(i=>core.chordPcs[i]),tones=selected.map(i=>core.tones[i]),intervals=selected.map(i=>core.intervals[i]);
 if(material==='rootless')for(const degree of [2,6]){if(pcs.length>=4)break;const index=degree-1,pc=harmony.scalePcs[index];if(pc!==undefined&&!pcs.includes(pc)){pcs.push(pc);tones.push(harmony.scaleNames[index]);intervals.push(degreeName(harmony.name,harmony.scaleNames[index],mod(pc-harmony.chordPcs[0])).replace(/2$/,'9').replace(/6$/,'13'));}}
 if(material==='extensions'){
  const written=harmony.intervals.map((interval,index)=>({interval,index,degree:role(interval)})),colours=written.filter(t=>t.degree>7);
  if(!colours.length)return null;
  const highest=colours.toSorted((a,b)=>b.degree-a.degree)[0],essential=colours.filter(t=>/[♭♯]/.test(t.interval));if(!essential.includes(highest))essential.push(highest);
  const defining=written.filter(t=>[3,6,7].includes(t.degree)||!written.some(t=>t.degree===3)&&[2,4].includes(t.degree)||t.degree===5&&/[♭♯]/.test(t.interval));
  const picked=[...defining,...essential],root=written.find(t=>t.degree===1);if(root&&picked.length<4)picked.unshift(root);
  for(const tone of [...colours,...written])if(picked.length<4&&!picked.includes(tone))picked.push(tone);
  pcs=picked.map(t=>harmony.chordPcs[t.index]);tones=picked.map(t=>harmony.tones[t.index]);intervals=picked.map(t=>harmony.intervals[t.index]);
 }
 if(pcs.length<2)return null;
 const root=harmony.chordPcs[0],order=pcs.map((pc,index)=>({pc,index,offset:mod(pc-root)})).sort((a,b)=>a.offset-b.offset);
 const result={...harmony,rootPc:harmony.rootPc??harmony.chordPcs[0],chordPcs:order.map(t=>t.pc),tones:order.map(t=>tones[t.index]),intervals:order.map(t=>intervals[t.index]),midi:order.map(t=>48+mod(root)+t.offset)};
 result.studyLabel=material==='guide'?harmony.name+harmony.suffix+' · guide tones':material==='rootless'?harmony.name+harmony.suffix+' · rootless':material==='shell'?harmony.name+harmony.suffix+' · shell':material==='extensions'?harmony.name+harmony.suffix: symbolFor(harmony.name,order.map(t=>t.offset),harmony.suffix);
 return result;
}
export function parseChordFormula(text){
 const values=String(text).trim().split(/[ ,–-]+/).map(Number);
 return values.length>=2&&values.length<=4&&values.every(n=>Number.isInteger(n)&&n>=1&&n<=13)&&new Set(values.map(n=>(n-1)%7)).size===values.length?values:null;
}
export function scaleChord(harmony,degree=0,material='seventh',construction='thirds',formula='1,9,5'){
 const custom=construction==='root95'?[1,9,5]:construction==='custom'?parseChordFormula(formula):null;if(construction==='custom'&&!custom)return null;
 const count=custom?custom.length:material==='triad'?3:material==='extensions'?5:4,skip={thirds:2,fourths:3,fifths:4}[construction]||2,n=harmony.scalePcs.length;
 const selected=Array.from({length:count},(_,i)=>(degree+(custom?(custom[i]-1)%7:i*skip))%n),root=harmony.scalePcs[degree],name=harmony.scaleNames[degree];
 const ordered=[...new Set(selected)].map(i=>({pc:harmony.scalePcs[i],name:harmony.scaleNames[i]})).sort((a,b)=>mod(a.pc-root)-mod(b.pc-root));
 if(new Set(ordered.map(t=>t.pc)).size!==count)return null;
 const intervals=ordered.map(t=>mod(t.pc-root)),scalePcs=harmony.scalePcs.map((_,i)=>harmony.scalePcs[(degree+i)%n]),scaleNames=harmony.scaleNames.map((_,i)=>harmony.scaleNames[(degree+i)%n]),relative=scalePcs.map(pc=>mod(pc-root));
 const mode=Object.keys(MODES).find(id=>MODES[id].intervals.length===n&&MODES[id].intervals.every((v,i)=>v===relative[i]))||harmony.mode;
 return {...harmony,rootPc:root,name,mode,scalePcs,scaleNames,suffix:'',chordId:'study',chordPcs:ordered.map(t=>t.pc),tones:ordered.map(t=>t.name),intervals:ordered.map(t=>custom?degreeName(name,t.name,mod(t.pc-root)).replace(/\d+$/,String(custom[selected.indexOf(harmony.scalePcs.indexOf(t.pc))])):construction==='thirds'&&selected.indexOf(harmony.scalePcs.indexOf(t.pc))===4?degreeName(name,t.name,mod(t.pc-root)).replace(/2$/,'9'):degreeName(name,t.name,mod(t.pc-root))),midi:intervals.map(i=>48+root+i),studyLabel:construction==='thirds'?symbolFor(name,intervals,' stack'):name+(custom?' · '+custom.join('–'):construction==='fourths'?' · quartal':' · quintal')};
}
/** Transform a close voicing; voices are counted from the top, before sorting. */
export function dropVoices(close,family){
 const voices=[...close];if(family==='drop2'||family==='spread')voices[voices.length-2]-=12;
 if(family==='drop3')voices[voices.length-3]-=12;
 if(family==='drop24'){voices[voices.length-2]-=12;voices[0]-=12;}
 return voices.sort((a,b)=>a-b);
}
export function chordGrip(notes,harmony,family){
 const sorted=[...notes].sort((a,b)=>a.midi-b.midi),bass=sorted[0],intervals=sorted.map(n=>harmony.intervals[harmony.chordPcs.indexOf(n.pc)]||n.chromaticDegree);
 return {stringSet:notes.toSorted((a,b)=>a.string-b.string).map(n=>6-n.string).join(''),notes:sorted.map(n=>({...n,finger:0})),barres:[],framework:VOICING_FAMILIES[family]||family,span:Math.max(...notes.map(n=>n.fret))-Math.min(...notes.map(n=>n.fret)),omitted:harmony.tones.filter((_,i)=>!notes.some(n=>n.pc===harmony.chordPcs[i])),intervals,muted:TUNING.map((_,i)=>i).filter(i=>!notes.some(n=>n.string===i)),bass};
}
export function chordVoicings(harmony,board,options={}){
 if(!harmony)return [];
 const {family='drop2',strings='auto',inversion='all',region='near'}=options;
 if(family==='caged'){const grip=recommendedGrip(harmony,board);return grip?[{...chordGrip(grip.notes,harmony,family),family,inversion:harmony.chordPcs.indexOf(grip.notes.toSorted((a,b)=>a.midi-b.midi)[0].pc),label:harmony.studyLabel||harmony.name+harmony.suffix}]:[];}
 const count=harmony.chordPcs.length;
 if((['drop2','drop3','drop24'].includes(family)&&count!==4)||(family==='spread'&&count!==3)||count>4)return [];
 const sets=strings==='auto'?Object.entries(STRING_SETS).filter(([id,s])=>id!=='auto'&&s.length===count):[[strings,STRING_SETS[strings]]];
 const root=harmony.chordPcs[0],relative=harmony.chordPcs.map(pc=>mod(pc-root)).sort((a,b)=>a-b),result=[],seen=new Set();
 for(let bass=0;bass<count;bass++)for(let base=24+root;base<=84;base+=12){
  const close=relative.map((_,i)=>base+relative[(i+bass)%count]+(i+bass>=count?12:0)),pitches=dropVoices(close,family),actualInversion=harmony.chordPcs.indexOf(mod(pitches[0]));
  if(inversion!=='all'&&Number(inversion)!==actualInversion)continue;
  for(const [set,strings]of sets){if(!Array.isArray(strings)||strings.length!==count)continue;
   const notes=strings.map((string,i)=>{const midi=pitches[i],pc=mod(midi),index=harmony.chordPcs.indexOf(pc);return {string,fret:midi-TUNING[string],midi,pc,name:harmony.tones[index],chromaticDegree:harmony.intervals[index],root:pc===(harmony.rootPc??root),chord:true,scaleIndex:-1};});
   if(notes.some(n=>n.fret<0||n.fret>20))continue;
   const fretted=notes.filter(n=>n.fret>0).map(n=>n.fret),span=fretted.length?Math.max(...fretted)-Math.min(...fretted):0;
   if(span>4)continue;
   const center=notes.reduce((s,n)=>s+n.fret,0)/count,target=(board.start+board.end)/2;
   if(region==='near'&&Math.abs(center-target)>3)continue;
   const key=notes.map(n=>`${n.string}:${n.fret}`).join(',');if(seen.has(key))continue;seen.add(key);
   result.push({...chordGrip(notes,harmony,family),family,stringSet:set,inversion:actualInversion,closeInversion:bass,label:harmony.studyLabel||harmony.name+harmony.suffix,score:Math.abs(center-target)*2+span*.2});
  }
 }
 return result.sort((a,b)=>a.score-b.score||a.notes[0].midi-b.notes[0].midi);
}
export function voiceLeadingCost(a,b){if(!a)return b.score||0;const byString=new Map(a.notes.map(n=>[n.string,n.midi]));return b.notes.reduce((sum,n)=>sum+(byString.has(n.string)?Math.abs(n.midi-byString.get(n.string)):8),0)+(b.score||0)*.03;}
export function referenceChord(harmony,options){
 if(options.explore!=='scale'&&(!options.construction||options.construction==='thirds'))return chordMaterial(harmony,options.material);
 let target=scaleChord(harmony,options.explore==='scale'?(Number(options.degree)||0)%harmony.scalePcs.length:Math.max(0,harmony.scalePcs.indexOf(harmony.chordPcs[0])),options.material,options.construction,options.formula);
 if(target&&['guide','shell','rootless','extensions'].includes(options.material))target=chordMaterial(target,options.material);
 return target;
}
