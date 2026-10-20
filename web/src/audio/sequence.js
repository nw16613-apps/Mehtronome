import { SEQUENCE_WAVE, SINE, readWave } from './waves.js';

// The engine supplies its sample clock, beat position and current chord.
export class Sequence {
  constructor(rate) {
    this.rate=rate;
    this.decay=Math.exp(-1/(rate*.14));
    this.attackFrames=Math.max(1,Math.round(rate*.008));
    this.maxAge=Math.round(rate*.8);
    this.reset();
  }
  reset() {
    this.lastGrid=-1;
    this.cursor=0;
    this.voices=Array.from({length:8},()=>({phase:0,frequency:0,age:Infinity,pan:0,envelope:0,increment:0,table:SEQUENCE_WAVE}));
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
    const frequency=440*2**((midi-69)/12);
    Object.assign(voice,{phase:0,frequency,increment:frequency/this.rate,age:0,envelope:1,pan:grid%2?.35:-.35,table:frequency*3<this.rate*.45?SEQUENCE_WAVE:SINE});
    onNote({sample,grid,midi,step});
  }
  render() {
    let left=0,right=0;
    for(const voice of this.voices){
      if(voice.age>this.maxAge) continue;
      const envelope=Math.min(1,voice.age/this.attackFrames)*voice.envelope;
      const signal=readWave(voice.table,voice.phase)*envelope;
      left+=signal*(1-voice.pan);right+=signal*(1+voice.pan);
      voice.phase+=voice.increment;
      if(voice.phase>=1) voice.phase-=1;
      voice.envelope*=this.decay;
      voice.age++;
    }
    this.left=left;this.right=right;
  }
}
