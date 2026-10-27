export const EAR_QUALITIES={maj7:{label:'Major 7',intervals:[0,4,7,11]},min7:{label:'Minor 7',intervals:[0,3,7,10]},dom7:{label:'Dominant 7',intervals:[0,4,7,10]},halfDim:{label:'Half-diminished 7',intervals:[0,3,6,10]},minMaj7:{label:'Minor major 7',intervals:[0,3,7,11]},dim7:{label:'Diminished 7',intervals:[0,3,6,9]},augMaj7:{label:'Augmented major 7',intervals:[0,4,8,11]}};
export const EAR_MOVEMENTS=[{id:'-2',label:'Down a tone'},{id:'-1',label:'Down a semitone'},{id:'0',label:'Same pitch'},{id:'1',label:'Up a semitone'},{id:'2',label:'Up a tone'}];
const pick=(items,random)=>items[Math.min(items.length-1,Math.floor(random()*items.length))];
export function earQuestion(kind='quality',random=Math.random,level='foundation'){
 const expanded=level==='extended';
 if(kind==='movement'){
  const movements=expanded?[...EAR_MOVEMENTS,...[3,4,5,7,12].flatMap(n=>[-1,1].map(sign=>({id:String(n*sign),label:`${sign>0?'Up':'Down'} ${({3:'a minor third',4:'a major third',5:'a fourth',7:'a fifth',12:'an octave'})[n]}`})))]:EAR_MOVEMENTS;const move=pick(movements,random),root=55+Math.floor(random()*10);
  return {kind,prompt:'How does the second pitch move?',answer:move.id,explanation:move.label,choices:movements,events:[{midi:root,start:0,duration:.6},{midi:root+Number(move.id),start:.9,duration:.6}]};
 }
 if(kind==='fretboard'){
  const choices=(expanded?[0,1,2,3,4,5]:[2,3]).flatMap(string=>Array.from({length:5},(_,i)=>({id:`${string}:${i+5}`,label:`String ${6-string}, fret ${i+5}`,midi:[40,45,50,55,59,64][string]+i+5}))),target=pick(choices,random);
  return {kind,prompt:`Match the heard pitch on your guitar, then choose its location on ${expanded?'all six strings':'strings 4 and 3'}, frets 5–9.`,answer:target.id,explanation:target.label,choices,events:[{midi:target.midi,start:0,duration:1}]};
 }
 const qualities=Object.keys(EAR_QUALITIES).slice(0,expanded?7:4),id=pick(qualities,random),quality=EAR_QUALITIES[id],root=48+Math.floor(random()*12);
 return {kind:'quality',prompt:'Which seventh-chord quality do you hear?',answer:id,explanation:quality.label,choices:qualities.map(id=>({id,label:EAR_QUALITIES[id].label})),events:quality.intervals.map(interval=>({midi:root+interval,start:0,duration:1.5}))};
}
export function earAnswer(question,id){
 const choice=question.choices.find(c=>c.id===id);return !!choice&&(question.kind==='fretboard'?choice.midi===question.events[0].midi:id===question.answer);
}

export const EAR_PROGRESS_KEY='mehtronome-ear-progress-v1';
export function readEarProgress(raw){
 try{const parsed=JSON.parse(raw||'{}'),result={};for(const level of ['foundation','extended'])for(const kind of ['quality','movement','fretboard']){const key=level+':'+kind,value=parsed[key];if(value&&Number.isInteger(value.total)&&Number.isInteger(value.correct)&&Number.isInteger(value.revealed)&&value.total>=0&&value.total<=1000000&&value.correct>=0&&value.correct<=value.total&&value.revealed>=0&&value.revealed<=1000000)result[key]={total:value.total,correct:value.correct,revealed:value.revealed};}return result;}catch{return {};}
}
export function earProgressAttempt(progress,key,right=null){const old=progress[key]||{total:0,correct:0,revealed:0};return {...progress,[key]:{total:old.total+(right===null?0:1),correct:old.correct+(right===true?1:0),revealed:old.revealed+(right===null?1:0)}};}
