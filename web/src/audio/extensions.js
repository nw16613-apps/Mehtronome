// Extension pitches are selected from the actual chord's current scale, so
// modal loops, transposition and per-chord jazz/custom scale guides all agree.
export function extensionChoices(harmony) {
  const root=harmony.midi[0],allowed=new Set(harmony.scalePcs);
  const choices=[[13,'♭9'],[14,'9'],[15,'♯9'],[17,'11'],[18,'♯11'],[20,'♭13'],[21,'13']];
  const result=[];
  for(const [interval,label] of choices){
    if(!allowed.has((root+interval)%12))continue;
    // Keep a stable third; avoid adding a natural 11 immediately above a major third.
    if(interval===17&&harmony.chordPcs.includes((root+4)%12))continue;
    if(interval===15&&harmony.chordPcs.includes((root+3)%12))continue;
    result.push({midi:root+interval,label});
  }
  return result.slice(0,3);
}
export function extensionBlend(index,count,musicalBeat,beats,bars) {
  const phase=musicalBeat/(Math.max(1,beats)*Math.max(1,bars));
  return .12+.88*(.5+.5*Math.cos(2*Math.PI*(phase-index/Math.max(1,count))));
}
