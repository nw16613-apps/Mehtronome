// Authored phrase-library audition. All pitches are harmonic roles/scale steps;
// the existing instruments, clock, humanisation, mix and FX remain unchanged.
export const AUDITION_STYLES={
 legatoFusion:{name:'Legato Fusion',bars:16,description:'A 16-bar arc: connected melodic questions, held spread chords, bass responses and restrained drum answers.'},
 blues:{name:'Blues',bars:12,description:'A 12-bar call-and-response arc: shuffle riff, organ answers, walking chord tones and a turnaround. Follows your chart’s actual chords.'},
};
export const auditionStyle=settings=>Object.hasOwn(AUDITION_STYLES,settings.backingStyle)?settings.backingStyle:null;
export const trialEnabled=settings=>settings.backingArrangement==='trial'&&!!auditionStyle(settings)&&(settings.beats||4)===4;
// Comping: [sixteenth slot, harmonic role, duration in beats, velocity].
const legatoComp=[
 [[0,'chord',3.7,.35]],[],[[6,'chord',2.4,.34]],[[2,'upperColour',2.7,.32]],
 [[0,'chord',3.7,.35]],[[10,'upperInversion',1.3,.3]],[],[[4,'chord',2.8,.34]],
 [[0,'chord',3.6,.35]],[],[[2,'chord',3.2,.34]],[[10,'top',1.3,.26]],
 [[0,'chord',3.8,.35]],[[6,'upperColour',2.3,.32]],[[2,'chord',3.1,.34]],[[0,'chord',2.4,.34]],
];
const bluesComp=[
 [[0,'lowDyad',.8,.44],[8,'upper',.7,.35]],[[0,'root',1,.35],[10,'third',.5,.29]],
 [[0,'lowDyad',.7,.43],[6,'upper',.45,.34],[8,'lowDyad',.7,.41]],[[2,'shell',1.2,.36],[12,'fifth',.65,.29]],
 [[0,'lowDyad',.85,.43],[8,'upper',.7,.35]],[[0,'root',1.3,.35],[10,'seventh',.6,.29]],
 [[0,'lowDyad',.7,.43],[6,'thirdDown',.4,.29],[8,'upper',.7,.35]],[[0,'shell',1.6,.37]],
 [[0,'lowDyad',.8,.43],[8,'upper',.7,.35]],[[2,'shell',1.4,.36],[12,'third',.5,.29]],
 [[0,'lowDyad',1,.43],[8,'upper',.75,.35]],[[0,'shell',1.3,.36],[8,'seventh',.4,.28],[10,'fifth',.4,.28],[14,'root',.4,.33]],
];
// Bass: [sixteenth slot, chord-member index (-1 fifth, -2 seventh), octave, beats, velocity].
const legatoBass=[
 [[0,0,0,2.5,.65],[12,-1,0,.75,.51]],[[0,0,0,1.4,.64],[7,1,0,.8,.52],[12,-2,0,.8,.51]],
 [[0,0,0,2.1,.64],[10,-1,0,.9,.52]],[[0,0,0,1.5,.64],[8,1,0,.7,.51],[14,-1,0,.4,.49]],
 [[0,0,0,2.7,.65],[14,-1,0,.4,.49]],[[0,0,0,1.4,.64],[6,-1,0,.65,.52],[10,-2,0,1.1,.51]],
 [[0,0,0,1.2,.64],[6,1,0,.6,.52],[9,-1,0,.6,.51],[13,-2,0,.6,.5]],[[0,0,0,2.2,.64],[12,-1,0,.7,.51]],
];
const bluesBass=[
 [[0,0,0,.85,.68],[4,1,0,.8,.56],[8,-1,0,.85,.62],[12,-2,0,.8,.57]],
 [[0,0,0,1.4,.68],[6,-1,0,.4,.52],[8,1,0,.8,.57],[12,-1,0,.8,.6]],
 [[0,0,0,.85,.68],[4,-1,0,.8,.6],[8,-2,0,.85,.58],[12,1,0,.8,.56]],
 [[0,0,0,1.6,.68],[8,-1,0,.7,.6],[12,1,0,.4,.55],[14,-2,0,.4,.52]],
];
// Melody cells: [slot, diatonic offset from the current guide tone, held beats].
// Two-bar questions and answers leave intentional space for the comping replies.
const legatoMelody=[
 [[2,0,.55],[4,3,.55],[6,1,1.1],[10,4,.55],[12,2,.9]],[[0,1,1.1],[4,0,1.7]],
 [],[[6,0,.55],[8,-2,.55],[10,1,.55],[12,-1,.9]],
 [[0,0,.55],[2,3,.55],[4,1,.55],[6,5,.55],[8,2,1.2]],[],
 [[2,0,.55],[4,2,1.1],[8,4,.55],[10,1,.55],[12,0,.9]],[[0,-1,2.3]],
 [[4,0,.55],[6,3,.55],[8,1,.55],[10,4,.55],[12,2,.9]],[[0,1,.55],[2,0,1.8]],
 [],[[2,0,.55],[4,-2,.55],[6,1,1.1],[10,-1,1.3]],
 [[2,0,.55],[4,3,.55],[6,1,.55],[8,5,.55],[10,2,1.3]],[],
 [[0,0,.55],[2,2,.55],[4,1,1.1],[8,-1,1.5]],[[0,0,2.7]],
];
const bluesMelody=[
 [[4,0,.55],[6,2,.45],[8,1,.85]],[[0,0,1.35],[8,2,.45],[10,1,.45],[12,0,.8]],
 [],[[4,0,.45],[6,-1,.45],[8,1,.55],[10,0,1]],
 [[2,0,.45],[4,2,.55],[6,1,1.1]],[[2,1,.45],[4,0,1.1],[10,-1,.55]],
 [],[[4,0,.45],[6,1,.45],[8,2,.55],[10,1,1.1]],
 [[2,0,.45],[4,2,.45],[6,1,.55],[8,3,1.1]],[[0,1,1.25],[8,0,1.3]],
 [[4,0,.45],[6,-1,.45],[8,-2,.55],[10,0,1.1]],[],
];
const scaled=(cell,beats)=>beats===4?cell:cell.map(([at,role,duration,velocity,group])=>[Math.round(at*beats/4),role,duration*beats/4,velocity,group]);
export function trialComping(settings,bar){if(!trialEnabled(settings))return null;const cells=auditionStyle(settings)==='blues'?bluesComp:legatoComp;return {variant:'trial',cell:scaled(cells[bar%cells.length],settings.beats||4)};}
export function trialBass(settings,bar){if(!trialEnabled(settings))return null;const cells=auditionStyle(settings)==='blues'?bluesBass:legatoBass;return cells[bar%cells.length];}
function drums(style,bar){
 const blues=style==='blues',end=bar%(blues?12:16)===(blues?11:15),answer=blues?[3,7].includes(bar%12):[3,7,11].includes(bar%16);
 const cell=[];
 if(blues){for(let i=0;i<16;i+=2)cell.push([i,'hat',i%4===0?.24:.12]);cell.push([0,'kick',.58],[8,'kick',.47],[4,'snare',.51],[12,'snare',.55]);if(bar%3===1)cell.push([6,'kick',.29]);}
 else {for(let i=0;i<16;i+=2)cell.push([i,i===8&&bar%4===2?'rideBell':'ride',i%4===0?.22:.11]);cell.push([0,'kick',.35],[bar%2?10:7,'kick',.23],[bar%2?6:5,'snare',.21],[12,'snare',.28]);}
 if(answer||end){const pickup=end?[[10,'snare',.16],[13,'tomHigh',.21],[14,'tomLow',.24]]:[[14,'snare',.15]];cell.push(...pickup);}
 return cell;
}
const drumForms=Object.fromEntries(Object.entries(AUDITION_STYLES).map(([id,s])=>[id,Array.from({length:s.bars},(_,bar)=>drums(id,bar))]));
export function trialDrums(settings,bar){return trialEnabled(settings)?drumForms[auditionStyle(settings)][bar%AUDITION_STYLES[auditionStyle(settings)].bars]:null;}
export function trialSequenceStep(settings,grid,length){
 if(!trialEnabled(settings)||!length||!(Number(settings.sequenceDensity)>0))return null;
 const style=auditionStyle(settings),cells=style==='blues'?bluesMelody:legatoMelody,rate=Number(settings.sequenceRate)||2,beats=settings.beats||4,barGrid=rate*beats,bar=Math.floor(grid/barGrid),slot=grid%barGrid;
 const activity=settings.sequenceActivity||'countermelody',source=cells[bar%cells.length];
 const notes=activity==='supporting'?source.filter((_,i)=>i%2===0||i===source.length-1):source;
 // Featured adds an answer only in a written breathing bar; other voices keep their space.
 const cell=activity==='featured'&&!notes.length?[[4,0,.6],[8,2,.6],[12,1,.8]]:notes;
 const occupied=new Set();let event=null;
 for(let i=0;i<cell.length;i++){
  const [at,degree,duration]=cell[i],local=Math.min(barGrid-1,Math.round(at*beats/4*rate/4));if(occupied.has(local))continue;occupied.add(local);if(local!==slot)continue;
  event={local,degree,index:((degree%length)+length)%length,semitones:0,duration:Math.min(duration*beats/4,beats-local/rate+.08),velocity:activity==='featured'?.58:activity==='supporting'?.48:.54,target:i===0?'guide':i===cell.length-1?'resolve':null,targetIndex:Math.floor(bar/4)%2,phraseStart:i===0,phraseEnd:i===cell.length-1,phraseBar:bar%4,phraseId:bar,section:style==='blues'?['call','response','turnaround'][Math.floor(bar%12/4)]:['theme','development','answer','return'][Math.floor(bar%16/4)]};
 }
 return event;
}
