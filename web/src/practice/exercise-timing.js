export function barAlignedDuration(phraseDuration,beatDuration,beats){
  const bar=Math.max(0,beatDuration)*Math.max(1,beats);
  if(!bar||!phraseDuration)return phraseDuration;
  return Math.ceil((phraseDuration-1e-9)/bar)*bar;
}
