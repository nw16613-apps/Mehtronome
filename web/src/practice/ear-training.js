export const EAR_QUALITIES={maj7:{label:'Major 7',intervals:[0,4,7,11]},min7:{label:'Minor 7',intervals:[0,3,7,10]},dom7:{label:'Dominant 7',intervals:[0,4,7,10]},halfDim:{label:'Half-diminished 7',intervals:[0,3,6,10]}};
export const EAR_MOVEMENTS=[{id:'-2',label:'Down a tone'},{id:'-1',label:'Down a semitone'},{id:'0',label:'Same pitch'},{id:'1',label:'Up a semitone'},{id:'2',label:'Up a tone'}];
const pick=(items,random)=>items[Math.min(items.length-1,Math.floor(random()*items.length))];
export function earQuestion(kind='quality',random=Math.random){
 if(kind==='movement'){
  const move=pick(EAR_MOVEMENTS,random),root=55+Math.floor(random()*10);
  return {kind,prompt:'How does the second pitch move?',answer:move.id,explanation:move.label,choices:EAR_MOVEMENTS,events:[{midi:root,start:0,duration:.6},{midi:root+Number(move.id),start:.9,duration:.6}]};
 }
 if(kind==='fretboard'){
  const choices=[2,3].flatMap(string=>Array.from({length:5},(_,i)=>({id:`${string}:${i+5}`,label:`String ${6-string}, fret ${i+5}`,midi:[40,45,50,55,59,64][string]+i+5}))),target=pick(choices,random);
  return {kind,prompt:'Match the heard pitch on your guitar, then choose its location on strings 4 and 3, frets 5–9.',answer:target.id,explanation:target.label,choices,events:[{midi:target.midi,start:0,duration:1}]};
 }
 const id=pick(Object.keys(EAR_QUALITIES),random),quality=EAR_QUALITIES[id],root=48+Math.floor(random()*12);
 return {kind:'quality',prompt:'Which seventh-chord quality do you hear?',answer:id,explanation:quality.label,choices:Object.entries(EAR_QUALITIES).map(([id,q])=>({id,label:q.label})),events:quality.intervals.map(interval=>({midi:root+interval,start:0,duration:1.5}))};
}
export function earAnswer(question,id){
 const choice=question.choices.find(c=>c.id===id);return !!choice&&(question.kind==='fretboard'?choice.midi===question.events[0].midi:id===question.answer);
}
