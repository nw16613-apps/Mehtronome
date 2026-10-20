import { SEQUENCE_WAVE, SINE, readWave } from './waves.js';

export const SEQUENCE_PATTERNS = {
  sparse:{name:'Sparse melody',help:'A few widely spaced chord tones with room to breathe.'},
  pulse:{name:'Root pulse',help:'A steady repeated root.'},
  up:{name:'Ascending arpeggio',help:'Climb through the chord tones.'},
  down:{name:'Descending arpeggio',help:'Descend through the chord tones.'},
  updown:{name:'Up & down arpeggio',help:'Rise and fall through the chord without repeating the end notes.'},
  rootColours:{name:'Root & colours',help:'Alternate the root with the other chord tones.'},
  alberti:{name:'Alberti figure',help:'Low–high–middle–high: a flowing accompaniment figure.'},
  skips:{name:'Skipping arpeggio',help:'Leap ahead, then step back through pairs of chord tones.'},
  cascade:{name:'Descending cascade',help:'Four-note descending phrases, starting one chord tone lower each time.'},
  offbeat:{name:'Offbeat answers',help:'Leave the start of each beat open, then answer with chord tones.'},
  tresillo:{name:'3–3–2 ostinato',help:'Three accents spaced 3–3–2 subdivision steps apart.'},
  clave:{name:'3–2 clave melody',help:'A five-note, 16-step phrase with a 3–2 son-clave rhythm.'},
  wander:{name:'Wandering chord tones',help:'A repeatable, gently varied melody with occasional rests.'},
};

// Indexed by the musical grid rather than render calls, so results remain
// deterministic through chord changes, gaps and different audio block sizes.
export function sequenceStep(pattern, grid, length, rate) {
  if (!length) return null;
  let index=grid%length,velocity=1;
  const cycle=Math.max(1,length*2-2);
  if(pattern==='sparse' && ![0,3,6].includes(grid%8))return null;
  if(pattern==='pulse')index=0;
  else if(pattern==='down')index=length-1-grid%length;
  else if(pattern==='updown')index=Math.min(grid%cycle,cycle-grid%cycle);
  else if(pattern==='rootColours')index=grid%2 ? 1+Math.floor(grid/2)%Math.max(1,length-1) : 0;
  else if(pattern==='alberti')index=[0,length-1,Math.min(1,length-1),length-1][grid%4];
  else if(pattern==='skips')index=(Math.floor(grid/2)+(grid%2 ? 2 : 0))%length;
  else if(pattern==='cascade')index=((length-1-Math.floor(grid/4)-grid%4)%length+length)%length;
  else if(pattern==='offbeat'){
    if(grid%rate===0)return null;
    index=Math.floor(grid/rate)%length;velocity=.8;
  } else if(pattern==='tresillo'){
    const hit=[0,3,6].indexOf(grid%8);if(hit<0)return null;
    index=[0,Math.min(1,length-1),length-1][hit];velocity=hit===0?1:.75;
  } else if(pattern==='clave'){
    const hit=[0,3,6,10,12].indexOf(grid%16);if(hit<0)return null;
    index=[0,2,1,3,1][hit]%length;velocity=hit===0||hit===3?1:.7;
  } else if(pattern==='wander'){
    const hash=(Math.imul(grid+1,1103515245)+12345)>>>0;
    if(hash%7===0)return null;
    index=((hash>>>8)%length);velocity=.65+(hash%31)/100;
  }
  return {index:index%length,velocity};
}

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
    if((grid*37+17)%100 >= density*100)return;
    const note=sequenceStep(pattern,grid,notes.length,Number(settings.sequenceRate)||2);
    if(!note)return;
    const index=note.index;
    const midi=notes[index]+12;
    const voice=this.voices[this.cursor++%this.voices.length];
    const frequency=440*2**((midi-69)/12);
    Object.assign(voice,{phase:0,frequency,increment:frequency/this.rate,age:0,envelope:note.velocity,pan:grid%2?.35:-.35,table:frequency*3<this.rate*.45?SEQUENCE_WAVE:SINE});
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
