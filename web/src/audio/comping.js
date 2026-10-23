export const COMPING_PATTERNS={
  sparse:'Electric piano · spacious', jazz:'Electric piano · jazz syncopation', neoSoul:'Electric piano · neo-soul pocket',
  bossa:'Electric piano · bossa', ballad:'Electric piano · ambient ballad',
};

// [sixteenth position, duration in beats, velocity]. Four related bars create
// a phrase instead of repeating a single mechanical rhythm indefinitely.
const CELLS={
  sparse:[[[0,1.45,.72],[10,.65,.52]],[[3,.55,.48],[12,1.2,.7]],[[0,1.1,.7],[7,.45,.46],[14,.4,.5]],[[5,.65,.52],[11,1.05,.66]]],
  jazz:[[[2,.55,.62],[7,.42,.48],[11,.68,.65],[15,.28,.42]],[[0,.72,.68],[6,.4,.48],[10,.56,.62],[14,.34,.46]],[[3,.5,.58],[8,.7,.66],[13,.48,.52]],[[1,.4,.48],[6,.62,.62],[12,.72,.68],[15,.25,.4]]],
  neoSoul:[[[0,.85,.68],[7,.42,.48],[10,.75,.64]],[[3,.6,.54],[9,.72,.65],[15,.25,.42]],[[0,.9,.7],[6,.4,.46],[12,.65,.62]],[[5,.55,.54],[11,.85,.66]]],
  bossa:[[[0,.62,.62],[6,.5,.56],[10,.62,.64],[14,.4,.5]],[[2,.52,.54],[6,.55,.6],[10,.52,.56],[14,.55,.62]],[[0,.6,.64],[6,.48,.54],[10,.62,.63],[15,.24,.4]],[[2,.5,.52],[8,.64,.62],[14,.48,.58]]],
  ballad:[[[0,2.6,.65],[12,.78,.46]],[[0,1.8,.62],[10,1.2,.54]],[[0,2.4,.66],[14,.42,.42]],[[4,1.35,.54],[12,1.45,.62]]],
};

export class CompingInstrument{
  constructor(rate){this.rate=rate;this.lastGrid=-1;this.cursor=0;this.output=0;this.voices=Array.from({length:32},()=>({active:false,phase:0,modPhase:0,midi:0,age:0,hold:0,gain:0,pan:0}));}
  clear(){for(const voice of this.voices)voice.active=false;this.output=0;this.lastGrid=-1;}
  tick(settings,beat,phase,notes,sample,step,onEvent){
    const grid=beat*4+Math.min(3,Math.floor(phase*4));
    if(grid===this.lastGrid)return;this.lastGrid=grid;
    const bar=Math.floor(beat/settings.beats),offset=(beat%settings.beats%4)*4+grid%4;
    const pattern=CELLS[settings.compingPattern]||CELLS.sparse;
    for(const [position,duration,velocity] of pattern[bar%pattern.length])if(position===offset)this.strike(notes,duration,velocity,settings.bpm,sample,step,onEvent);
  }
  strike(notes,duration,velocity,bpm,sample,step,onEvent){
    const pitches=[...new Set(notes)].filter(Number.isFinite).slice(-6);
    for(const [index,midi] of pitches.entries()){
      const voice=this.voices[this.cursor++%this.voices.length];
      Object.assign(voice,{active:true,phase:0,modPhase:0,midi,age:0,hold:Math.max(.08,duration)*60/Math.max(30,bpm)*this.rate,gain:velocity/Math.sqrt(pitches.length),pan:pitches.length===1?0:index/(pitches.length-1)*2-1});
    }
    onEvent?.({type:'comping',sample,step,notes:pitches,duration,velocity});
  }
  render(){
    let output=0;
    for(const voice of this.voices){
      if(!voice.active)continue;
      const frequency=440*2**((voice.midi-69)/12),increment=frequency/this.rate;
      voice.phase=(voice.phase+increment)%1;voice.modPhase=(voice.modPhase+increment*2.01)%1;voice.age++;
      const seconds=voice.age/this.rate,attack=Math.min(1,seconds/.007);
      const release=voice.age<=voice.hold?1:Math.exp(-(voice.age-voice.hold)/(this.rate*.2));
      const body=Math.exp(-seconds*.55),bell=Math.exp(-seconds*3.4);
      const wave=Math.sin(2*Math.PI*voice.phase+.32*bell*Math.sin(2*Math.PI*voice.modPhase))*.82+Math.sin(4*Math.PI*voice.phase)*.12*bell+Math.sin(6*Math.PI*voice.phase)*.04*bell;
      output+=wave*voice.gain*attack*release*body;
      if(release<.0005)voice.active=false;
    }
    this.output=output;return output;
  }
}
