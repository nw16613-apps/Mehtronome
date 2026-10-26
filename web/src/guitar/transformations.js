import {TUNING} from './fretboard.js';
export const TRANSFORMATIONS=[
 {id:'major-minor',name:'Major → minor',from:'major',to:'minor',instruction:'Lower the third by one semitone. Keep the root and fifth still.'},
 {id:'maj7-dom7',name:'Major seventh → dominant seventh',from:'maj7',to:'dom7',instruction:'Lower the major seventh by one semitone. Keep the root and major third still.'},
 {id:'dom7-min7',name:'Dominant seventh → minor seventh',from:'dom7',to:'min7',instruction:'Lower the major third by one semitone. Keep the root and minor seventh still.'},
 {id:'min7-min6',name:'Minor seventh → minor sixth',from:'min7',to:'min6',instruction:'Replace the minor seventh with the major sixth, one semitone lower. Keep the root and minor third still.'},
];
const QUALITIES={major:{symbol:'',intervals:[0,4,7],degrees:['1','3','5']},minor:{symbol:'m',intervals:[0,3,7],degrees:['1','♭3','5']},maj7:{symbol:'maj7',intervals:[0,4,11],degrees:['1','3','7']},dom7:{symbol:'7',intervals:[0,4,10],degrees:['1','3','♭7']},min7:{symbol:'m7',intervals:[0,3,10],degrees:['1','♭3','♭7']},min6:{symbol:'m6',intervals:[0,3,9],degrees:['1','♭3','6']}};
function spell(rootName,rootPc,interval,degree){
 const letters='CDEFGAB',natural=[0,2,4,5,7,9,11],letter=(letters.indexOf(rootName[0])+Number(degree.replace(/[^0-9]/g,''))-1)%7;
 let delta=((rootPc+interval-natural[letter])%12+12)%12;if(delta>6)delta-=12;
 return letters[letter]+(delta<0?'♭'.repeat(-delta):'♯'.repeat(delta));
}
function coordinates(quality,family,base){
 const minor=['minor','min7','min6'].includes(quality),triad=['major','minor'].includes(quality);
 if(family==='sixth')return triad?[[0,base],[3,base+(minor?0:1)],[4,base]]:[[0,base],[2,base+(quality==='maj7'?1:quality==='min6'?-1:0)],[3,base+(minor?0:1)]];
 return triad?[[1,base],[2,base-(minor?2:1)],[3,base-3]]:[[1,base],[2,base-(minor?2:1)],[3,base+(quality==='maj7'?1:quality==='min6'?-1:0)]];
}
/** Explicit three-note templates, not generated finger numbers or CAGED-region claims. */
export function transformationPair(rootPc,rootName,family='sixth',id='maj7-dom7',centre=7){
 const lesson=TRANSFORMATIONS.find(t=>t.id===id)||TRANSFORMATIONS[1],rootString=family==='sixth'?0:1;
 const bases=Array.from({length:21},(_,i)=>i).filter(fret=>(TUNING[rootString]+fret)%12===rootPc&&[lesson.from,lesson.to].every(quality=>coordinates(quality,family,fret).every(([,f])=>f>=0&&f<=20)));
 const base=bases.sort((a,b)=>Math.abs(a-centre)-Math.abs(b-centre)||a-b)[0];
 const make=quality=>{
  const definition=QUALITIES[quality],names=definition.intervals.map((interval,i)=>spell(rootName,rootPc,interval,definition.degrees[i]));
  const notes=coordinates(quality,family,base).map(([string,fret])=>{const midi=TUNING[string]+fret,pc=midi%12,index=definition.intervals.findIndex(n=>(rootPc+n)%12===pc);return {string,fret,midi,pc,name:names[index],chromaticDegree:definition.degrees[index],scaleIndex:-1,root:pc===rootPc,chord:true};});
  return {quality,name:rootName+definition.symbol,rootName,rootPc,notes,muted:[0,1,2,3,4,5].filter(s=>!notes.some(n=>n.string===s)),formula:(['major','minor'].includes(quality)?definition.degrees:[...definition.degrees.slice(0,2),'5',definition.degrees[2]]).join(' · '),omitted:['major','minor'].includes(quality)?'None · complete triad':`${spell(rootName,rootPc,7,'5')} (5th) · this is a three-note shell, not the complete four-note chord`,frets:[0,1,2,3,4,5].map(s=>notes.find(n=>n.string===s)?.fret??'×')};
 };
 const before=make(lesson.from),after=make(lesson.to),changed=before.notes.flatMap(note=>{const next=after.notes.find(n=>n.string===note.string);return !next||next.midi===note.midi?[]:[{before:note,after:next,delta:next.midi-note.midi}];});
 const frets=[...before.notes,...after.notes].map(n=>n.fret),start=Math.min(...frets),end=Math.max(start+2,...frets);
 return {lesson,before,after,changed,start,end,base,family,unchanged:before.notes.filter(n=>!changed.some(c=>c.before.string===n.string))};
}
