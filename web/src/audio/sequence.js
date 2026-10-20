// The engine supplies its sample clock, beat position and current chord.
export class Sequence {
  constructor(rate) { this.rate=rate; this.reset(); }
  reset() {
    this.lastGrid=-1;
    this.cursor=0;
    this.voices=Array.from({length:8},()=>({phase:0,frequency:0,age:10,pan:0}));
  }
  gridAt(settings, beat, phase) {
    const rate=Number(settings.sequenceRate)||2;
    let offset=0;
    for(let i=1;i<rate;i++){
      const swing=rate===3?0:(i%2 ? settings.sequenceSwing*.5 : 0);
      if(phase >= (i+swing)/rate) offset=i;
    }
    return beat*rate+offset;
  }
  tick(settings, beat, phase, notes, sample, step, onNote) {
    const grid=this.gridAt(settings,beat,phase);
    if(grid===this.lastGrid) return;
    this.lastGrid=grid;
    const pattern=settings.sequencePattern;
    const density=Math.max(0,Math.min(1,settings.sequenceDensity));
    if((grid*37+17)%100 >= density*100 || pattern==='sparse' && ![0,3,6].includes(grid%8)) return;
    const length=notes.length;
    const cycle=Math.max(1,length*2-2);
    const index=pattern==='pulse'?0:pattern==='down'?length-1-grid%length:pattern==='updown'?Math.min(grid%cycle,cycle-grid%cycle):grid%length;
    const midi=notes[index]+12;
    const voice=this.voices[this.cursor++%this.voices.length];
    Object.assign(voice,{phase:0,frequency:440*2**((midi-69)/12),age:0,pan:grid%2?.35:-.35});
    onNote({sample,grid,midi,step});
  }
  render() {
    let left=0,right=0;
    for(const voice of this.voices){
      if(voice.age>.8) continue;
      const envelope=Math.min(1,voice.age/.008)*Math.exp(-voice.age/.14);
      const signal=(Math.sin(voice.phase)+.18*Math.sin(2*voice.phase)+.05*Math.sin(3*voice.phase))*envelope;
      left+=signal*(1-voice.pan);right+=signal*(1+voice.pan);
      voice.phase=(voice.phase+2*Math.PI*voice.frequency/this.rate)%(2*Math.PI);
      voice.age+=1/this.rate;
    }
    this.left=left;this.right=right;
  }
}
