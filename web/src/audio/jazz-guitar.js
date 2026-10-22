// A deterministic plucked-string model voiced like a clean hollow-body electric.
// The delay loop supplies real string motion and pick noise; pickup-position
// cancellation and gentle body filtering keep it from sounding like an oscillator.
export function renderJazzGuitarNote(rate,midi,seconds=.6) {
  const length=Math.max(1,Math.ceil(rate*seconds));
  const output=new Float32Array(length),frequency=440*2**((midi-69)/12);
  const period=Math.max(2,rate/frequency),delayLength=Math.ceil(period)+2;
  const string=new Float32Array(delayLength),pickOffset=Math.max(1,Math.round(period*.19));
  let seed=(midi*2654435761)>>>0,noiseState=0;
  for(let index=0;index<delayLength;index++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const noise=seed/2147483648-1;noiseState+=.58*(noise-noiseState);string[index]=noiseState;
  }
  for(let index=delayLength-1;index>=0;index--)string[index]-=.72*string[(index-pickOffset+delayLength)%delayLength];
  let write=0,previous=0,bodyLow=0,bodyHigh=0,pickLow=0,peak=0;
  const fraction=delayLength-2-period,damping=Math.min(.9987,.9968+frequency/220000);
  for(let index=0;index<length;index++){
    const a=string[write],b=string[(write+1)%delayLength],c=string[(write+2)%delayLength];
    const averaged=(a+b)*.5,interpolated=averaged+(c-averaged)*fraction*.16;
    string[write]=(interpolated*.985+previous*.015)*damping;previous=a;write=(write+1)%delayLength;
    const time=index/rate;
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const pickNoise=(seed/2147483648-1)*Math.exp(-time*105);pickLow+=.46*(pickNoise-pickLow);
    const pickup=a-.38*string[(write+Math.round(period*.57))%delayLength];
    bodyLow+=.055*(pickup-bodyLow);bodyHigh+=.21*((pickup-bodyLow)-bodyHigh);
    const attack=Math.min(1,time/.0025),release=Math.exp(-time*(1.15+frequency/2100));
    const sample=(pickup*.72+bodyLow*.3+bodyHigh*.22+pickLow*.2)*attack*release;
    output[index]=sample;peak=Math.max(peak,Math.abs(sample));
  }
  const gain=peak>0?.68/peak:0;
  for(let index=0;index<length;index++)output[index]*=gain;
  return output;
}
