// Pure timing helpers shared by the audio engine and metronome controls.
export function tapBpm(taps) {
  if(taps.length<2)return null;
  const intervals=taps.slice(1).map((time,index)=>time-taps[index]).filter(ms=>ms>=250&&ms<=2000);
  if(!intervals.length)return null;
  const sorted=[...intervals].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)];
  const stable=intervals.filter(ms=>Math.abs(ms-median)<=median*.25);
  return Math.max(30,Math.min(240,Math.round(60000/(stable.reduce((a,b)=>a+b,0)/stable.length))));
}
export function subdivisionAt(phase,division,swing=0) {
  if(division!==2)return Math.min(division-1,Math.floor(phase*division));
  return phase>=.5+Math.max(0,Math.min(1,swing))/6?1:0;
}
export function beatStrength(settings,beat,counting=false) {
  if(counting)return beat===0?2:1;
  const value=settings.beatAccents?.[beat];
  return value==='0'?0:value==='2'?2:value==='1'?1:beat===0&&settings.accent?2:1;
}
export function progressiveGap(settings,bar) {
  const audible=Math.max(1,Math.min(16,Math.floor(Number(settings.gapPlayBars)||4)));
  let silent=Math.max(1,Math.min(16,Math.floor(Number(settings.gapMuteBars)||1)));
  if(settings.gapProgressive){
    const cap=Math.max(silent,Math.min(16,Math.floor(Number(settings.gapMaxBars)||8)));
    // At most 15 growing cycles, then a constant-length cycle.
    while(silent<cap){
      if(bar<audible+silent)return {muted:bar>=audible,silent};
      bar-=audible+silent;silent++;
    }
  }
  return {muted:bar%(audible+silent)>=audible,silent};
}
export function formatTime(seconds) {
  const value=Math.max(0,Math.ceil(seconds));
  return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;
}
