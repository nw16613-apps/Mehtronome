// Deliberate phrase dynamics and articulation, separate from timing jitter.
// No new samples, effects or random decisions in the per-sample render path.
const ARC=[.97,1,.99,.93,1.02,1,.96,.89];
const SHORT_STYLES=new Set(['funk','motown','reggae','boogaloo']);
const CONNECTED_STYLES=new Set(['legatoFusion','ballad','neoSoul']);
export function performanceExpression(style,track,tone,duration,bar=0,role=''){
 const guitar=/Guitar$/.test(tone),soft=tone==='fluteLead'||tone==='legatoGuitar'||tone==='swelledGuitar';
 const velocity=ARC[((bar%8)+8)%8]*(track==='sequence'&&bar%2===1 ? .94 : 1);
 let articulation=null;
 if(track==='comping'){
  if(tone==='swelledGuitar')articulation='swell';
  else if(duration<=.45||SHORT_STYLES.has(style)&&duration<.8)articulation='damped';
  else if(duration>=1.25&&(guitar||/Piano$/.test(tone)))articulation='ringing';
 }else if(track==='sequence'){
  if(soft||CONNECTED_STYLES.has(style)&&!['clav','brightKeys'].includes(tone))articulation='legato';
  else if(duration<.4)articulation='damped';
 }
 return {velocity:velocity*(role==='top' ? .96 : 1),articulation};
}
