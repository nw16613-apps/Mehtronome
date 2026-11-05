// Small accompaniment phrases, not continuous solo generators. Each entry is
// [sixteenth, note-pool index, held beats, velocity]. Silence is part of the part.
const PHRASES={
 popRock:[[[0,0,.75,.65],[8,2,.5,.54]],[[10,1,.4,.52]],[[0,0,.75,.65],[8,2,.5,.54]],[[10,1,.4,.50],[14,0,.4,.57]]],
 traditionalJazz:[[[6,0,.55,.62],[10,1,.7,.53]],[[14,0,.4,.49]],[[2,1,.7,.56],[10,0,.5,.60]],[[8,1,.65,.52],[14,0,.45,.58]]],
 fusionJazz:[[[3,0,.28,.66],[7,1,.3,.54],[10,2,.6,.61]],[[6,1,.55,.53]],[[3,0,.28,.64],[7,1,.3,.52],[10,2,.6,.60]],[[5,2,.35,.55],[11,1,.45,.58],[14,0,.6,.63]]],
 blues:[[[8,2,.42,.66],[10,1,.42,.56],[14,0,.65,.60]],[[6,1,.42,.54],[12,0,.85,.60]],[[8,2,.42,.64],[10,1,.42,.54],[14,0,.65,.58]],[[8,2,.42,.58],[10,1,.42,.52],[12,0,.85,.62]]],
 motown:[[[2,2,.24,.58],[6,1,.24,.50],[10,2,.24,.56]],[[10,1,.25,.50],[14,0,.35,.55]],[[2,2,.24,.58],[6,1,.24,.50],[10,2,.24,.56]],[[6,1,.24,.50],[10,2,.24,.55],[14,0,.35,.59]]],
 funk:[[[3,0,.16,.61],[6,2,.2,.67],[11,0,.16,.48]],[[6,1,.2,.55],[14,2,.18,.61]],[[3,0,.16,.60],[6,2,.2,.66],[11,0,.16,.47]],[[6,2,.2,.60],[13,1,.16,.48],[14,0,.22,.61]]],
 neoSoul:[[[6,2,.9,.55],[10,3,.65,.48]],[[14,2,.7,.49]],[[6,2,.9,.55],[10,3,.65,.48]],[[6,2,.75,.52],[12,1,1.05,.48]]],
 bossa:[[[2,1,.55,.53],[8,2,.7,.50]],[[6,1,.6,.50],[14,0,.65,.55]],[[2,1,.55,.53],[8,2,.7,.50]],[[6,1,.6,.50],[14,0,.65,.55]]],
 latin:[[[0,0,.3,.58],[6,2,.3,.53],[10,1,.3,.55],[14,2,.3,.51]],[[2,1,.3,.52],[6,2,.3,.55],[8,0,.3,.59],[12,1,.3,.53]],[[0,0,.3,.58],[6,2,.3,.53],[10,1,.3,.55],[14,2,.3,.51]],[[2,1,.3,.52],[6,2,.3,.55],[8,0,.3,.59],[12,1,.3,.53]]],
 ballad:[[[0,1,2.5,.48]],[[8,0,2,.44]],[[0,1,2.5,.48]],[[8,0,2,.44]]],
};
export function styleSequenceStep(settings,grid,length){
 const phrase=PHRASES[settings.sequenceStyle];if(!phrase||!length)return null;
 const density=Math.max(0,Math.min(1,Number(settings.sequenceDensity)||0));if(!density)return null;
 const rate=Number(settings.sequenceRate)||2,beats=settings.beats||4,barGrid=rate*beats;
 const bar=Math.floor(grid/barGrid),phraseBar=bar%4,local=grid%barGrid;
 // Brazilian and Cuban answers keep their two-bar halves together.
 const pair=settings.sequenceStyle==='latin'||settings.sequenceStyle==='bossa';
 const order=pair?[0,1,2,3]:[0,3,2,1],active=pair?Math.max(2,Math.ceil(density*2)*2):Math.max(1,Math.ceil(density*4));
 if(!order.slice(0,active).includes(phraseBar))return null;
 const events=phrase[phraseBar],event=events.find(([position])=>position<beats*4&&Math.round(position*rate/4)===local);
 if(!event)return null;
 const [,index,duration,velocity]=event;
 return {index:index%length,semitones:0,duration,velocity,target:phraseBar===3&&event===events.at(-1)?'resolve':null,phraseBar,local};
}
