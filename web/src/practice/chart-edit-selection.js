/** A beat drag edits whole chord entries touched by the inclusive range. */
export function chordStepsInRange(durations,start,end){
 const low=Math.min(start,end),high=Math.max(start,end)+1,result=[];let at=0;
 durations.forEach((duration,index)=>{if(at<high&&at+duration>low)result.push(index);at+=duration;});
 return result;
}
