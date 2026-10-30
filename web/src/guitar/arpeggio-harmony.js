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
export const ARPEGGIO_STUDIES=new Set(['positional','harmonized','alternating','chordtones','chordtonesalternating','inversions','approach','approacheverytone','connections','alternating7','alternating7down','alternating7combined','alternating3','alternating3down','alternating3combined','chordtones7','chordtones7turns','chordtones7turnsdown','chordtones7combined','chordtones3','chordtones3turns','chordtones3turnsdown','chordtones3combined']);
