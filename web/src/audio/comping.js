export const COMPING_PATTERNS={
  sparse:'Electric piano · spacious', jazz:'Electric piano · jazz syncopation', neoSoul:'Electric piano · neo-soul pocket',
  bossa:'Electric piano · bossa', ballad:'Electric piano · ambient ballad',
};
export const COMPING_MOVEMENTS={
  still:'Still chords', modal:'Modal hook', inner:'Inner-voice hook',
  response:'Call and response', voiceLead:'Voice-led hook',
};
export const COMPING_TONES={
  warmTine:'Warm tine', felt:'Dark felt electric', suitcase:'Suitcase shimmer', reed:'Reed electric',
};

const nearestMidi=(pc,target=72)=>{
  let midi=pc+12*Math.round((target-pc)/12);
  while(midi<60)midi+=12;while(midi>84)midi-=12;
  return midi;
};
const closestPc=(pcs,targetPc)=>pcs.reduce((best,pc)=>{
  const distance=Math.min((pc-targetPc+12)%12,(targetPc-pc+12)%12);
  const bestDistance=Math.min((best-targetPc+12)%12,(targetPc-best+12)%12);
  return distance<bestDistance?pc:best;
},pcs[0]);

/** Build a repeatable upper-voice cell from modal colour and chord-guide tones. */
export function compingHook(harmony,nextHarmony,movement='modal',length=3){
  if(movement==='still'||!harmony?.scalePcs?.length)return [];
  const count=Math.max(2,Math.min(4,Number(length)||3));
  const colourPc=harmony.characteristicPcs?.[0]??harmony.scalePcs[3];
  const colourIndex=Math.max(0,harmony.scalePcs.indexOf(colourPc));
  const below=harmony.scalePcs[(colourIndex+6)%7],above=harmony.scalePcs[(colourIndex+1)%7];
  const guidePcs=harmony.chordPcs.filter(pc=>pc!==harmony.scalePcs[0]);
  const guide=closestPc(guidePcs.length?guidePcs:harmony.chordPcs,colourPc);
  const resolution=movement==='voiceLead'
    ?closestPc(nextHarmony?.chordPcs?.length?nextHarmony.chordPcs:harmony.chordPcs,above)
    :closestPc(harmony.chordPcs,above);
  const shapes={
    modal:[guide,colourPc,resolution,guide],
    inner:[below,colourPc,above,resolution],
    response:[colourPc,above,guide,below],
    voiceLead:[guide,below,above,resolution],
  };
  const full=shapes[movement]||shapes.modal;
  const pcs=full.slice(0,count);
  const notes=[];
  for(const pc of pcs)notes.push(nearestMidi(pc,notes.length?notes.at(-1):74));
  return notes;
}

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
  constructor(rate){this.rate=rate;this.lastGrid=-1;this.cursor=0;this.output=0;this.voices=Array.from({length:32},()=>({active:false,phase:0,modPhase:0,midi:0,age:0,hold:0,gain:0,pan:0,tone:'warmTine'}));}
  clear(){for(const voice of this.voices)voice.active=false;this.output=0;this.lastGrid=-1;}
  tick(settings,beat,phase,notes,hook,sample,step,onEvent){
    const grid=beat*4+Math.min(3,Math.floor(phase*4));
    if(grid===this.lastGrid)return;this.lastGrid=grid;
    const bar=Math.floor(beat/settings.beats),offset=(beat%settings.beats%4)*4+grid%4;
    const pattern=CELLS[settings.compingPattern]||CELLS.sparse;
    for(const [position,duration,velocity] of pattern[bar%pattern.length])if(position===offset)this.strike(notes,duration,velocity,settings.bpm,sample,step,onEvent,'comping',settings.compingTone);
    if(hook.length&&settings.compingMovement!=='still'){
      const amount=Math.max(0,Math.min(1,Number(settings.compingMovementAmount)||0));
      const activeBars=Math.ceil(amount*4),phraseBar=bar%4;
      if([0,2,1,3].slice(0,activeBars).includes(phraseBar)){
        const span=Math.min(4,settings.beats)*4;
        const start=Math.max(1,span-hook.length*2);
        const index=Math.round((offset-start)/2);
        if(index>=0&&index<hook.length&&start+index*2===offset){
          const ending=phraseBar===3&&hook.length>2;
          const note=ending&&index===hook.length-1?hook[0]:hook[index];
          this.strike([note],.34,.34+.18*amount,settings.bpm,sample,step,onEvent,'comping-hook',settings.compingTone);
        }
      }
    }
  }
  strike(notes,duration,velocity,bpm,sample,step,onEvent,type='comping',tone='warmTine'){
    const pitches=[...new Set(notes)].filter(Number.isFinite).slice(-6);
    for(const [index,midi] of pitches.entries()){
      const voice=this.voices[this.cursor++%this.voices.length];
      Object.assign(voice,{active:true,phase:0,modPhase:0,midi,age:0,hold:Math.max(.08,duration)*60/Math.max(30,bpm)*this.rate,gain:velocity/Math.sqrt(pitches.length),pan:pitches.length===1?0:index/(pitches.length-1)*2-1,tone});
    }
    onEvent?.({type,sample,step,notes:pitches,duration,velocity});
  }
  render(){
    let output=0;
    for(const voice of this.voices){
      if(!voice.active)continue;
      const frequency=440*2**((voice.midi-69)/12),increment=frequency/this.rate;
      voice.phase=(voice.phase+increment)%1;voice.modPhase=(voice.modPhase+increment*2.01)%1;voice.age++;
      const seconds=voice.age/this.rate,tone=voice.tone||'warmTine';
      const shape={
        warmTine:{attack:.012,release:.28,decay:.42,fm:.24,second:.09,third:.025,tremolo:.018},
        felt:{attack:.02,release:.34,decay:.34,fm:.1,second:.035,third:.012,tremolo:.012},
        suitcase:{attack:.006,release:.24,decay:.52,fm:.4,second:.15,third:.045,tremolo:.055},
        reed:{attack:.009,release:.2,decay:.62,fm:.12,second:.06,third:.13,tremolo:.025},
      }[tone]||{attack:.012,release:.28,decay:.42,fm:.24,second:.09,third:.025,tremolo:.018};
      const attack=Math.min(1,seconds/shape.attack);
      const release=voice.age<=voice.hold?1:Math.exp(-(voice.age-voice.hold)/(this.rate*shape.release));
      const body=Math.exp(-seconds*shape.decay),bell=Math.exp(-seconds*(tone==='felt'?4.8:3.2));
      const phase=2*Math.PI*voice.phase,mod=shape.fm*bell*Math.sin(2*Math.PI*voice.modPhase);
      const fundamental=Math.sin(phase+mod),second=Math.sin(phase*2+.12),third=Math.sin(phase*3+.24);
      const tremolo=1-shape.tremolo+shape.tremolo*Math.sin(2*Math.PI*seconds*4.7+voice.pan);
      const wave=fundamental*(tone==='reed'?.74:.86)+second*shape.second*bell+third*shape.third*(tone==='reed'?.75:bell);
      output+=wave*voice.gain*attack*release*body*tremolo*.82;
      if(release<.0005)voice.active=false;
    }
    this.output=output;return output;
  }
}
