import {accompanimentPhrase} from './accompaniment.js';
// Six-note themes, expressed as diatonic offsets and sixteenth-note positions.
// A phrase keeps its identity as it is developed and answered over sixteen bars.
const vocabulary={
 popRock:{at:[2,4,6,10,12,14],steps:[0,2,1,3,2,0],gate:.72},
 traditionalJazz:{at:[2,4,6,10,12,14],steps:[0,1,3,2,1,0],gate:.87},
 fusionJazz:{at:[1,3,6,9,11,14],steps:[0,3,1,4,2,0],gate:.86},
 blues:{at:[2,4,6,8,10,14],steps:[0,2,1,3,1,0],gate:.88},
 motown:{at:[2,4,6,10,12,14],steps:[0,2,3,2,1,0],gate:.65},
 funk:{at:[1,3,6,9,11,14],steps:[0,2,0,3,1,0],gate:.46},
 neoSoul:{at:[2,4,7,10,12,14],steps:[0,1,3,2,1,0],gate:.96},
 bossa:{at:[2,4,6,10,12,14],steps:[0,2,1,3,2,0],gate:.87},
 latin:{at:[0,2,6,8,10,14],steps:[0,2,3,1,2,0],gate:.63},
 ballad:{at:[0,3,6,9,12,14],steps:[0,2,1,3,2,0],gate:1.05,quiet:true},
 jazzWaltz:{at:[0,2,4,6,8,10],steps:[0,1,3,2,1,0],gate:.88,native:3},
 afroCuban68:{at:[0,2,4,6,8,10],steps:[0,2,3,1,2,0],gate:.8,native:3},
 samba:{at:[2,4,6,9,12,14],steps:[0,2,1,3,2,0],gate:.72},
 secondLine:{at:[2,4,6,8,10,14],steps:[0,2,1,3,2,0],gate:.8},
 reggae:{at:[2,4,6,10,12,14],steps:[0,0,2,1,2,0],gate:.8},
 slowSoul128:{at:[1,2,4,6,8,10],steps:[0,1,3,2,1,0],gate:1.05,quiet:true},
 boogaloo:{at:[0,2,6,8,10,14],steps:[0,2,1,3,2,0],gate:.79},
 modernStraightJazz:{at:[1,4,6,9,11,14],steps:[0,2,3,1,4,2],gate:.92},
 hardRock:{at:[0,2,6,8,10,14],steps:[0,2,0,3,2,0],gate:.72},
 legatoFusion:{at:[2,4,6,8,10,12],steps:[0,4,2,5,3,1],gate:1.12,quiet:true},
};
const activities={supporting:{bars:[0,3],notes:3},countermelody:{bars:[0,2,3],notes:4},featured:{bars:[0,1,2,3],notes:6}};
const cache=new Map();
function build(settings){
 const style=settings.sequenceStyle,v=vocabulary[style];if(!v)return null;
 const mode=Object.hasOwn(activities,settings.sequenceActivity)?settings.sequenceActivity:'countermelody',activity=activities[mode];
 const rate=Math.max(1,Number(settings.sequenceRate)||2),beats=Math.max(1,settings.beats||4),barGrid=rate*beats;
 const stable=settings.sequenceDevelopment==='stable'||settings.backingVariation===0;
 const comping=!!settings.comping&&(settings.compingVolume??.25)>0&&!String(settings.mutedChannels||'').split(',').includes('comping');
 const key=[style,mode,rate,beats,stable,settings.sequenceDevelopment,comping,settings.backingVariation>0,!!settings.backingTurnaround].join(':');
 if(cache.has(key))return cache.get(key);
 const bars=Array.from({length:32},(_,bar)=>{
  const phraseSlot=bar%4,section=stable?0:Math.floor(bar/4)%4;
  const active=mode==='countermelody'&&v.quiet?[0,2]:activity.bars;
  if(!active.includes(phraseSlot))return [];
  const count=mode==='countermelody'&&style==='legatoFusion'?5:activity.notes;
  const rhythm=v.at.slice(0,count),contour=v.steps.slice(0,count);
  const positions=rhythm.map(at=>Math.min(barGrid-1,Math.round(at*beats/(v.native||4)*rate/4)));
  // Development changes the middle of the theme; the answer reverses it.
  const degrees=contour.map((degree,i)=>section===1&&i>0&&i<count-1?degree+1:section===2?contour[count-1-i]-contour[count-1]:degree);
  if(section===3&&count>2)degrees[count-2]=degrees[count-2]-1;
  if(style==='reggae'&&section<2)for(let i=0;i<count;i++)degrees[i]=contour[i];
  const rhythmicShift=section===1&&settings.sequenceDevelopment==='evolving'?1:0;
  let shifted=positions.map(p=>p+rhythmicShift);
  const phrase=comping?accompanimentPhrase(settings.accompanimentStyle,bar,settings.backingVariation>0,settings.backingTurnaround):null;
  const attacks=(phrase?.cell||[]).filter(([,role,,velocity,group])=>velocity>=.3&&group!=='inner'&&!['third','fifth','seventh','top','root'].includes(role)).map(([at])=>Math.round(at*rate/4));
  // Place the whole idea around attacks, rather than deleting most of its bars.
  const candidates=[0,1,-1,2,-2].filter(shift=>shifted[0]+shift>=0&&shifted.at(-1)+shift<barGrid);
  const cost=shift=>shifted.reduce((sum,p)=>sum+(attacks.includes(p+shift)?1:0),0)+Math.abs(shift)*.15;
  const shift=comping?(candidates.sort((a,b)=>cost(a)-cost(b))[0]??0):0;
  shifted=shifted.map(p=>p+shift);
  const events=[];
  for(let i=0;i<count;i++){
   const local=shifted[i];if(local<0||local>=barGrid||events.some(e=>e.local===local))continue;
   const next=shifted[i+1],gap=next===undefined?Math.min(1.25,beats-local/rate):(next-local)/rate;
   const duration=Math.min(beats-local/rate+.08,Math.max(.12,gap*v.gate));
   events.push({local,degree:degrees[i],duration,velocity:(mode==='featured'?.6:mode==='supporting'?.49:.55)*(i===0?1:i===count-1?.95:.86),target:i===0?'guide':i===count-1?'resolve':null,targetIndex:stable?phraseSlot:(phraseSlot+Math.floor(bar/4))%4,phraseStart:i===0,phraseEnd:i===count-1,phraseBar:phraseSlot,section:['theme','development','answer','return'][section],expression:style==='blues'&&i===count-1?'bend':null});
  }
  return events;
 });
 const result={bars,barGrid};if(cache.size>=96)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
}
export function styleSequenceStep(settings,grid,length){
 if(!length||!(Number(settings.sequenceDensity)>0))return null;
 const plan=build(settings);if(!plan)return null;
 const bar=Math.floor(grid/plan.barGrid),event=plan.bars[bar%32].find(n=>n.local===grid%plan.barGrid);
 if(!event)return null;
 return {...event,index:((event.degree%length)+length)%length,semitones:0,phraseId:bar};
}
