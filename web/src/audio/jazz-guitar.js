// A clean neck-pickup jazz guitar note. A strong fundamental, gently rolled-off
// harmonics and short pick transient keep single-note studies warm and articulate.
export function renderJazzGuitarNote(rate,midi,seconds=.6) {
  const length=Math.max(1,Math.ceil(rate*seconds));
  const output=new Float32Array(length),frequency=440*2**((midi-69)/12);
  let seed=(midi*2654435761)>>>0,lowpass=0;
  for(let index=0;index<length;index++){
    const time=index/rate,attack=Math.min(1,time/.009),release=Math.exp(-time*1.65);
    const vibrato=time>.16?.0017*Math.sin(2*Math.PI*5.1*(time-.16)):0;
    const phase=2*Math.PI*frequency*time+vibrato*Math.sin(2*Math.PI*frequency*time);
    const tone=Math.sin(phase)+.31*Math.sin(phase*2+.08)+.12*Math.sin(phase*3+.16)+.045*Math.sin(phase*4);
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const pick=(seed/2147483648-1)*Math.exp(-time*62)*.18;
    const raw=(tone*.58+pick)*attack*release;
    lowpass+=.24*(raw-lowpass);
    output[index]=lowpass;
  }
  return output;
}
