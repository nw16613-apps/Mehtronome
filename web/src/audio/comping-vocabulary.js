import {CHORDS} from './music.js';
const pc=n=>(n%12+12)%12;
const tuning=[40,45,50,55,59,64],grips=new Map();
export function playableCompingGrip(notes){
 const key=notes.join(',');if(grips.has(key))return grips.get(key);if(grips.size>4096)grips.clear();
 const visit=(i,used,frets)=>{
  if(i===notes.length)return true;
  for(let string=0;string<6;string++){
   const fret=notes[i]-tuning[string];
   if(used.has(string)||fret<1||fret>20||frets.length&&Math.max(...frets,fret)-Math.min(...frets,fret)>4)continue;
   if(visit(i+1,new Set([...used,string]),[...frets,fret]))return true;
  }
  return false;
 };
 const valid=visit(0,new Set(),[]);grips.set(key,valid);return valid;
}
const modern=new Set(['fusionJazz','modernStraightJazz','legatoFusion','neoSoul']);
const jazz=new Set(['traditionalJazz','jazzWaltz','ballad','boogaloo']);
export function compingGesture(style,bar,stroke=0){
 const phase=((bar%8)+8)%8;
 const families=modern.has(style)?['rootless','quartal','pentatonic','pentatonic','rootless','quartal','triadPair','triadPair']:
  jazz.has(style)?['rootless','shell','quartal','rootless','pentatonic','pentatonic','triadPair','triadPair']:
  style==='blues'?['rootless','shell','pentatonic','rootless','shell','pentatonic','rootless','shell']:
  ['rootless','rootless','shell','rootless','rootless','pentatonic','rootless','shell'];
 const later=((bar%16)+16)%16>=8;
 const family=later&&[0,3,6].includes(phase)&&(modern.has(style)||jazz.has(style))?'upperStructure':style==='legatoFusion'?['rootless','quartal','quartal','pentatonic','pentatonic','rootless','triadPair','triadPair'][phase]:families[phase];
 return {family,phase,side:stroke%2,contour:[0,2,5,2,-4,-1,4,0][phase]};
}
// Bounded harmonic vocabulary: every colour comes from the actual scale and
// chart. Guide tones anchor superimpositions; major-third/natural-11 clashes
// and ambiguous changes to an altered fifth are excluded.
export function compingVocabulary(h,{guitar=false}={}){
 const ints=CHORDS[h.chord].intervals,core=ints.filter(n=>n<12).map(n=>pc(h.root+n));
 const third=pc(h.root+ints[1]),seventhInterval=ints.find(n=>n>=9&&n<=11),guides=[third,...(seventhInterval===undefined?[]:[pc(h.root+seventhInterval)])];
 const allowed=[...new Set([...h.scalePcs,...core])].filter(n=>!(ints.includes(4)&&n===pc(h.root+5))&&!((ints.includes(6)||ints.includes(8))&&!ints.includes(7)&&n===pc(h.root+7)));
 // A triad-only chart keeps its explicitly selected chord identity.
 if(seventhInterval===undefined)return [];
 const result=[],seen=new Set();
 const add=(notes,technique,source,side=0)=>{
  notes=[...new Set(notes)].sort((a,b)=>a-b);
  if(notes.length<3||notes.length>4||notes[0]<48||notes.at(-1)>81||notes.at(-1)-notes[0]>21||!notes.every(n=>allowed.includes(pc(n)))||!notes.some(n=>guides.includes(pc(n))))return;
  // Retain the altered fifth when it is structural, rather than accidentally
  // turning half-diminished/augmented harmony into a generic minor/major chord.
  if(ints.includes(6)&&!notes.some(n=>pc(n)===pc(h.root+6))||ints.includes(8)&&!notes.some(n=>pc(n)===pc(h.root+8)))return;
  if(guitar&&!playableCompingGrip(notes))return;
  const key=[technique,source,side,notes.join(',')].join(':');if(seen.has(key))return;seen.add(key);
  result.push({notes,technique,source,side});
 };
 const anchored=(tones,technique,source,side)=>{
  for(let inversion=0;inversion<tones.length;inversion++)for(let octave=4;octave<=5;octave++){
   const notes=[];for(let i=0;i<tones.length;i++){let n=octave*12+tones[(inversion+i)%tones.length];while(notes.length&&n<=notes.at(-1))n+=12;notes.push(n);}
   if(notes.some(n=>guides.includes(pc(n))))add(notes,technique,source,side);
   else for(const guide of guides)for(let midi=48+guide;midi<=76;midi+=12)add([...notes,midi],technique,source,side);
  }
 };
 anchored([h.root,third,pc(h.root+seventhInterval)],'shell','root + guide tones');
 for(let start=48;start<=69;start++)for(const count of [3,4]){
  const notes=Array.from({length:count},(_,i)=>start+i*5);
  if(notes.every(n=>allowed.includes(pc(n)))){
   add(notes,'quartal','fourths');
   if(count===3&&!notes.some(n=>guides.includes(pc(n))))for(const guide of guides)for(let n=48+guide;n<=76;n+=12)add([...notes,n],'quartal','fourths + guide');
  }
 }
 for(let root=0;root<12;root++)for(const [quality,formula]of [['major',[0,2,4,7,9]],['minor',[0,3,5,7,10]]]){
  const tones=formula.map(n=>pc(root+n));if(!tones.every(n=>allowed.includes(n)))continue;
  for(let i=0;i<5;i++)anchored([tones[i],tones[(i+1)%5],tones[(i+2)%5]],'pentatonic',`${root}:${quality}`);
 }
 const triads=[];
 for(let root=0;root<12;root++)for(const [quality,formula]of [['major',[0,4,7]],['minor',[0,3,7]]]){
  const tones=formula.map(n=>pc(root+n));if(tones.every(n=>allowed.includes(n)))triads.push({root,quality,tones});
 }
 for(const triad of triads)anchored(triad.tones,'upperStructure',`${triad.root}:${triad.quality}`);
 for(let a=0;a<triads.length;a++)for(let b=a+1;b<triads.length;b++){
  const x=triads[a],y=triads[b];if(x.tones.some(n=>y.tones.includes(n)))continue;
  const source=`${x.root}:${x.quality}/${y.root}:${y.quality}`,before=result.length;
  anchored(x.tones,'triadPair',source,0);anchored(y.tones,'triadPair',source,1);
  // A real pair needs both triads playable in the current instrument range.
  if(![0,1].every(side=>result.slice(before).some(v=>v.side===side)))result.splice(before);
 }
 return result;
}
