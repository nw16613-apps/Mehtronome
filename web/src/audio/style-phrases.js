import {trialEnabled,trialSequenceStep} from './audition-arrangements.js';
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
// Written rhythmic alternatives: anticipations, late entries, internal rests,
// sustained answers and shorter cadences. These change the phrase, not its clock.
const rhythms={
 straight:[[2,4,6,10,12,14],[0,2,6,8,12,14],[4,6,8,10,12,14],[0,4,6,10,12,14],[2,6,8,12,14],[4,8,10,14]],
 swing:[[2,4,6,10,12,14],[0,2,4,8,10,14],[4,6,8,10,12,14],[0,4,6,8,12,14],[2,6,10,12,14],[0,6,8,12]],
 syncopated:[[1,3,6,9,11,14],[0,3,5,8,11,15],[2,5,7,10,12,15],[1,4,7,9,12,14],[0,6,7,11,14],[3,7,10,14]],
 spacious:[[2,4,7,10,12,14],[0,2,6,8,12,14],[4,6,8,12,14],[0,4,6,10,14],[2,6,10,12],[0,6,8,14]],
 latin:[[0,2,6,8,10,14],[2,4,6,8,12,14],[0,4,6,10,12,14],[2,6,8,10,12,14],[0,2,8,10,14],[2,6,10,14]],
 brazilian:[[2,4,6,9,12,14],[0,3,6,8,11,14],[2,5,7,10,12,15],[0,4,7,10,13,15],[3,6,8,11,14],[2,6,10,14]],
 offbeat:[[2,4,6,10,12,14],[2,6,8,10,14],[0,2,6,10,12,14],[4,6,10,12,14],[2,4,8,12],[2,6,12,14]],
 three:[[0,2,4,6,8,10],[0,2,6,8,10],[2,4,6,8,10],[0,4,6,8,10],[0,2,4,8,10],[2,4,8,10]],
 triplet:[[0,4/3,8/3,4,8,32/3],[4/3,4,16/3,8,12,40/3],[0,8/3,4,20/3,28/3,12],[8/3,4,8,32/3,40/3],[0,4,20/3,12],[4/3,16/3,8,40/3]],
 legato:[[2,4,6,8,10,12],[0,1,4,6,9,12],[4,6,7,10,12,14],[1,4,6,8,11,14],[0,3,6,10,14],[2,4,8,11]],
};
const rhythmFamilies={traditionalJazz:'swing',blues:'swing',secondLine:'swing',fusionJazz:'syncopated',funk:'syncopated',modernStraightJazz:'syncopated',neoSoul:'spacious',ballad:'spacious',bossa:'latin',latin:'latin',samba:'brazilian',reggae:'offbeat',jazzWaltz:'three',afroCuban68:'three',slowSoul128:'triplet',legatoFusion:'legato'};
const activities={supporting:{bars:[[0,3],[0,2],[1,3],[0,3]],notes:3},countermelody:{bars:[[0,2,3],[0,1,3],[1,2,3],[0,1,2]],notes:4},featured:{bars:[[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3]],notes:6}};
const quietBars=[[0,2],[0,3],[1,2],[0,2]];
const cache=new Map();
function build(settings){
 const style=settings.sequenceStyle,v=vocabulary[style];if(!v)return null;
 const mode=Object.hasOwn(activities,settings.sequenceActivity)?settings.sequenceActivity:'countermelody',activity=activities[mode];
 const rate=Math.max(1,Number(settings.sequenceRate)||2),beats=Math.max(1,settings.beats||4),barGrid=rate*beats;
 const stable=settings.sequenceDevelopment==='stable'||settings.backingVariation===0;
 const comping=!!settings.comping&&(settings.compingVolume??.25)>0&&!String(settings.mutedChannels||'').split(',').includes('comping');
 const key=[style,mode,rate,beats,stable,settings.sequenceDevelopment,comping,settings.backingVariation>0,!!settings.backingTurnaround].join(':');
 if(cache.has(key))return cache.get(key);
 const family=rhythmFamilies[style]||'straight',cells=rhythms[family],colour=[...style].reduce((sum,c)=>sum+c.charCodeAt(0),0);
 const recentRhythms=[];
 const spacing=positions=>positions.slice(1).map((p,i)=>p-positions[i]).join(',');
 const place=(cell,wanted)=>{const slots=[...new Set(cell.map(at=>Math.min(barGrid-1,Math.round(at*beats/(v.native||4)*rate/4))))].sort((a,b)=>a-b),count=Math.min(wanted,slots.length);return Array.from({length:count},(_,i)=>slots[Math.round(i*(slots.length-1)/Math.max(1,count-1))]);};
 const bars=Array.from({length:64},(_,bar)=>{
  const phraseSlot=bar%4,section=stable?0:Math.floor(bar/4)%4,cycle=stable?0:Math.floor(bar/16);
  const active=mode==='countermelody'&&v.quiet?quietBars[section]:activity.bars[section];
  if(!active.includes(phraseSlot))return [];
  const baseCount=mode==='countermelody'&&style==='legatoFusion'?5:activity.notes;
  let choice=stable?0:phraseSlot===0&&section===0&&cycle%2===0?0:(bar+Math.floor(bar/4)*2+cycle*3+colour)%cells.length;
  const cell=stable?v.at:cells[choice];
  // Activity governs overall density; answers and cadences vary in length.
  const minimum=mode==='featured'||mode==='countermelody'&&v.quiet?4:3;
  const variation=stable||mode==='supporting'?0:[0,1,0,-1][(bar+cycle)%4];
  let wanted=Math.max(minimum,Math.min(6,baseCount+variation));
  if(!stable&&bar%8===7)wanted=Math.max(minimum,wanted-1);
  let positions=place(cell,wanted);
  if(!stable&&recentRhythms.length>=2&&spacing(positions)===recentRhythms.at(-1)&&recentRhythms.at(-1)===recentRhythms.at(-2)){
   for(let n=1;n<cells.length;n++){const next=(choice+n)%cells.length,candidate=place(cells[next],wanted);if(spacing(candidate)!==recentRhythms.at(-1)){choice=next;positions=candidate;break;}}
  }
  recentRhythms.push(spacing(positions));
  const count=positions.length;
  const contour=v.steps.slice(0,count);
  const degrees=contour.map((degree,i)=>section===1&&i>0&&i<count-1?degree+1:section===2?contour[count-1-i]-contour[count-1]:degree);
  if(section===3&&count>2)degrees[count-2]=degrees[count-2]-1;
  if(style==='reggae'&&section<2)for(let i=0;i<count;i++)degrees[i]=contour[i];
  let shifted=positions;
  const phrase=comping?accompanimentPhrase(settings.accompanimentStyle,bar,settings.backingVariation>0,settings.backingTurnaround):null;
  const attacks=(phrase?.cell||[]).filter(([,role,,velocity,group])=>velocity>=.3&&group!=='inner'&&!['third','fifth','seventh','top','root'].includes(role)).map(([at])=>Math.round(at*rate/4));
  const candidates=[0,1,-1,2,-2].filter(shift=>shifted[0]+shift>=0&&shifted.at(-1)+shift<barGrid);
  const cost=shift=>shifted.reduce((sum,p)=>sum+(attacks.includes(p+shift)?1:0),0)+Math.abs(shift)*.15;
  const shift=comping?(candidates.sort((a,b)=>cost(a)-cost(b))[0]??0):0;
  shifted=shifted.map(p=>p+shift);
  const events=[];
  for(let i=0;i<count;i++){
   const local=shifted[i];if(local<0||local>=barGrid)continue;
   const next=shifted[i+1],gap=next===undefined?Math.min(1.5,beats-local/rate):(next-local)/rate;
   const articulation=stable?1:style==='legatoFusion'?(choice===4&&i===2?.65:1):[1.08,.72,.94,1.12,.8,.98][(i+choice+section)%6];
   const duration=Math.min(beats-local/rate+.08,Math.max(.12,gap*v.gate*articulation));
   events.push({local,degree:degrees[i],duration,velocity:(mode==='featured'?.6:mode==='supporting'?.49:.55)*(i===0?1:i===count-1?.95:.86),target:i===0?'guide':i===count-1?'resolve':null,targetIndex:stable?phraseSlot:(phraseSlot+Math.floor(bar/4))%4,phraseStart:i===0,phraseEnd:i===count-1,phraseBar:phraseSlot,section:['theme','development','answer','return'][section],expression:style==='blues'&&i===count-1?'bend':null});
  }
  return events;
 });
 const result={bars,barGrid};if(cache.size>=64)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
}
export function styleSequenceStep(settings,grid,length){
 if(trialEnabled(settings))return trialSequenceStep(settings,grid,length);
 if(!length||!(Number(settings.sequenceDensity)>0))return null;
 const plan=build(settings);if(!plan)return null;
 const bar=Math.floor(grid/plan.barGrid),event=plan.bars[bar%plan.bars.length].find(n=>n.local===grid%plan.barGrid);
 if(!event)return null;
 return {...event,index:((event.degree%length)+length)%length,semitones:0,phraseId:bar};
}
