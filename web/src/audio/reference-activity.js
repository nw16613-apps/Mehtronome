// Activity changes scored phrases, rather than discarding unrelated individual
// notes. Source scores stay immutable so the complete line can be auditioned.
export function withReferenceActivity(score,def,activity){
 if(!['supporting','countermelody'].includes(activity))return {...score,activity:'featured'};
 const beats=score.beats||def.beats||4,rate=score.gridRate||score.rate,total=score.sequence.length/rate;
 const phrases=score.form?.phrases||Array.from({length:Math.ceil(total/(beats*4))},(_,i)=>({start:i*beats*4,end:Math.min(total,(i+1)*beats*4),role:['opening','develop','contrast','return'][i%4]}));
 const windows=phrases.map(phrase=>{
  const span=phrase.end-phrase.start;
  const duration=activity==='countermelody'?Math.max(Math.min(span,beats),span*.75):Math.min(beats*(phrase.role==='contrast'?1:2),Math.max(Math.min(span,beats),span/2));
  const start=phrase.role==='opening'?phrase.start:phrase.end-duration;
  return {start,end:start+duration,role:phrase.role};
 });
 let cursor=0,previousKept=null;
 const sequence=score.sequence.map((events,grid)=>{
  const beat=grid/rate;while(cursor<windows.length-1&&beat>=windows[cursor].end)cursor++;
  const window=windows[cursor],inside=window&&beat>=window.start&&beat<window.end;
  const kept=[];
  for(const event of events){
   const cadenceAnswer=!inside&&event.cadenceRole==='arrival'&&previousKept?.cadenceRole==='lead-in'&&previousKept.cadence===event.cadence&&beat-previousKept.beat<=2.5;
   if(!inside&&!cadenceAnswer)continue;
   const duration=cadenceAnswer?Math.min(event.duration,.9):Math.min(event.duration,Math.max(.08,window.end-beat));
   kept.push({...event,duration,velocity:event.velocity*(activity==='supporting'?.9:.96),activity,phraseRole:window.role,...(cadenceAnswer?{cadenceAnswer:true}:{})});
   previousKept={...event,beat};
  }
  return kept;
 });
 return {...score,sequence,activity,melodyWindows:windows};
}
