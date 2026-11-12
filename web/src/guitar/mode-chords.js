// Stack alternate scale degrees, preserving the mode's written note names.
// Non-heptatonic collections are labelled as stacks rather than jazz triads.
export function modeChordHarmonies(harmony,size=4){
 return harmony.scalePcs.map((_,degree)=>{
  const indices=Array.from({length:size},(_,i)=>(degree+i*2)%harmony.scalePcs.length),pcs=indices.map(i=>harmony.scalePcs[i]),semitones=pcs.map(pc=>(pc-pcs[0]+12)%12);
  const symbols=size===3?{'0,4,7':'','0,3,7':'m','0,3,6':'dim','0,4,8':'aug'}:{'0,4,7,11':'maj7','0,4,7,10':'7','0,3,7,10':'m7','0,3,7,11':'m(maj7)','0,3,6,10':'m7♭5','0,3,6,9':'dim7','0,4,8,11':'maj7♯5','0,4,8,10':'7♯5'};
  const suffix=symbols[semitones.join(',')]??' stack';
  const degreeNames=[{0:'1'},{2:'♭♭3',3:'♭3',4:'3',5:'♯3'},{5:'♭♭5',6:'♭5',7:'5',8:'♯5',9:'♯♯5'},{9:'♭♭7',10:'♭7',11:'7'}];
  return {...harmony,name:harmony.scaleNames[degree],suffix,chordPcs:pcs,tones:indices.map(i=>harmony.scaleNames[i]),intervals:semitones.map((n,i)=>degreeNames[i][n]||String(n)+' st'),modeDegree:degree};
 });
}
