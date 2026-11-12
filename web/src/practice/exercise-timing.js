export function barAlignedDuration(phraseDuration,beatDuration,beats){
  const bar=Math.max(0,beatDuration)*Math.max(1,beats);
  if(!bar||!phraseDuration)return phraseDuration;
  return Math.ceil((phraseDuration-1e-9)/bar)*bar;
}

// Re-anchor seconds around the same musical beat, including count-in and
// bar-aligned loop rests. Editing tempo never restarts a phrase or count-in.
export function retimeExercise(now,origin,oldTempo,newTempo,countInBeats,phraseBeats,cycleBeats){
 const elapsedBeats=Math.max(0,now-origin)*oldTempo/60;
 const timelineStart=now<origin?origin:now-elapsedBeats*60/newTempo;
 const playedBeats=Math.max(0,elapsedBeats-countInBeats);
 const cycle=Math.floor(playedBeats/cycleBeats);
 return {timelineStart,cycleStart:timelineStart+(countInBeats+cycle*cycleBeats)*60/newTempo,remainingBeats:Math.max(0,phraseBeats-playedBeats)};
}
