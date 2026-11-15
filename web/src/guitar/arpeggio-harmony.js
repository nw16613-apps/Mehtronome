import {modeChordHarmonies} from './mode-chords.js';
// Exercise material is independent of the accompaniment's extended voicing.
// Use written degrees, not pitch classes: a suspended 2/4 or diminished 7 is
// structural, while 9/11/13 (including alterations) remain backing colours.
export function arpeggioHarmony(harmony){
 const seen=new Set(),indices=[];
 for(const [index,pc]of harmony.chordPcs.entries()){
  const degree=Number(harmony.intervals?.[index]?.match(/\d+/)?.[0]);
  const core=Number.isFinite(degree)&&degree>0?degree<=7:index<4;
  if(core&&!seen.has(pc)){seen.add(pc);indices.push(index);}
 }
 return {...harmony,chordPcs:indices.map(i=>harmony.chordPcs[i]),tones:indices.map(i=>harmony.tones[i]),intervals:indices.map(i=>harmony.intervals?.[i]),...(harmony.midi?{midi:indices.map(i=>harmony.midi[i])}:{})};
}
export const ARPEGGIO_STUDIES=new Set(['arpgroups3','arpgroups4','positional','harmonized','alternating','chordtones','chordtonesalternating','inversions','approach','approacheverytone','connections','alternating7','alternating7down','alternating7combined','alternating3','alternating3down','alternating3combined','chordtones7','chordtones7turns','chordtones7turnsdown','chordtones7combined','chordtones3','chordtones3turns','chordtones3turnsdown','chordtones3combined']);

export function exerciseArpeggioHarmony(harmony,material='seventh'){
 let core=arpeggioHarmony(harmony);
 if(material==='seventh'&&core.chordPcs.length===3&&harmony.scalePcs?.length===7){
  const counterpart=modeChordHarmonies(harmony,4).find(h=>h.chordPcs[0]===core.chordPcs[0]&&core.chordPcs.every(pc=>h.chordPcs.includes(pc)));
  if(counterpart)core=counterpart;
 }
 const size=material==='triad'?3:core.chordPcs.length,pcs=core.chordPcs.slice(0,size),intervals=core.intervals.slice(0,size);
 const triadNames={'0,4,7':'','0,3,7':'m','0,3,6':'dim','0,4,8':'aug','0,2,7':'sus2','0,5,7':'sus4'},quality=pcs.map(pc=>(pc-pcs[0]+12)%12).join(',');
 const suffix=material==='triad'&&Object.hasOwn(triadNames,quality)?triadNames[quality]:core.suffix;
 return {...core,suffix,chordPcs:pcs,tones:core.tones.slice(0,size),intervals};
}
