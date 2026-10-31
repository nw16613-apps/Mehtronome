import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
import {voicingTones} from '../guitar/voicings.js';
import {backingSubdivision} from './groove-time.js';
export const COMPING_PATTERNS={
  popRock:'Pop / rock stabs', fusion:'Fusion accents', blues:'Blues shuffle responses', motown:'Motown offbeats', funk:'Funk stabs', latin:'Latin chord accents',
  sparse:'Electric piano · spacious', jazz:'Electric piano · jazz syncopation', neoSoul:'Electric piano · neo-soul pocket',
  bossa:'Electric piano · bossa', ballad:'Electric piano · ambient ballad',
};
export const COMPING_MOVEMENTS={
  still:'Still chords', modal:'Modal chord colours', inner:'Chord inversions',
  response:'Chord responses', voiceLead:'Voice-led chords',
};
export const COMPING_TONES={
  acousticPiano:'Acoustic piano',softPiano:'Soft acoustic piano',cleanGuitar:'Clean electric guitar',bluesGuitar:'Blues electric guitar',nylonGuitar:'Nylon-string guitar',
  brightKeys:'Bright percussive keys', brightTine:'Bright electric tine', clav:'Dry clav-style keys',
  warmTine:'Warm tine', felt:'Dark felt electric', suitcase:'Suitcase shimmer', reed:'Reed electric',
};

// Enumerate compact keyboard inversions, not isolated moving upper notes.
function inversions(pcs){
 const tones=[...new Set(pcs)],out=[];
 for(const bass of tones)for(let midi=55;midi<=76;midi++){
  if(midi%12!==bass)continue;
  const chord=[midi];
  while(chord.length<Math.max(3,tones.length)){
   let next=chord.at(-1)+1;while(!tones.includes(next%12))next++;
   chord.push(next);
  }
  if(chord.at(-1)<=84&&chord.at(-1)-chord[0]<=19)out.push(chord);
 }
 return out.sort((a,b)=>Math.abs(a.reduce((s,n)=>s+n,0)/a.length-67)-Math.abs(b.reduce((s,n)=>s+n,0)/b.length-67)||a[0]-b[0]);
}

/** A small cached vocabulary of complete chords. Modal alternatives are
 * diatonic triads sharing a third/seventh guide tone with the backing chord.
 * Non-seven-note collections use actual chord inversions rather than assuming
 * ordinary tertian triads. Future harmony never sounds ahead of its change. */
export function compingChordVoicings(harmony,nextHarmony,movement='inner',length=4){
 if(!harmony?.chordPcs?.length)return [];
 const pcs=[...new Set(voicingTones(harmony).map(index=>harmony.chordPcs[index]))],base=inversions(pcs);
 if(!base.length)return [];
 if(movement==='still')return [base[0]];
 const count=Math.max(2,Math.min(4,Number(length)||4)),variants=[base[0]];
 const add=chord=>{if(chord&&!variants.some(v=>v.join(',')===chord.join(',')))variants.push(chord);};
 const sameChord=base.filter(chord=>chord[0]%12!==base[0][0]%12);
 if(movement==='voiceLead'&&nextHarmony?.chordPcs?.length){
  const target=nextHarmony.chordPcs[0];
  sameChord.sort((a,b)=>Math.min((a.at(-1)%12-target+12)%12,(target-a.at(-1)%12+12)%12)-Math.min((b.at(-1)%12-target+12)%12,(target-b.at(-1)%12+12)%12));
 }
 if(movement==='modal'&&harmony.scalePcs?.length===7){
  const guides=harmony.chordPcs.filter((_,i)=>['3','7'].includes(harmony.intervals[i]?.match(/\d+/)?.[0]));
  for(let root=0;root<7;root++){
   const tones=[0,2,4].map(step=>harmony.scalePcs[(root+step)%7]);
   if(tones[0]===harmony.chordPcs[0]||!tones.some(pc=>guides.includes(pc))||tones.length===pcs.length&&tones.every(pc=>pcs.includes(pc)))continue;
   add(inversions(tones)[0]);if(variants.length>=Math.max(2,count-1))break;
  }
 }
 for(const chord of sameChord)add(chord);
 for(const chord of base)add(chord);
 return variants.slice(0,count);
}

// [sixteenth position, duration in beats, velocity]. Four related bars create
// a phrase instead of repeating a single mechanical rhythm indefinitely.
const CELLS={
  popRock:[[[0,.45,.72],[4,.32,.64],[8,.45,.7],[12,.32,.66]],[[0,.4,.7],[6,.3,.53],[12,.4,.68]],[[0,.45,.73],[4,.3,.6],[10,.3,.57],[12,.42,.68]],[[0,.4,.72],[6,.28,.5],[12,.38,.68],[14,.2,.48]]],
  fusion:[[[0,.32,.7],[3,.22,.5],[7,.3,.61],[10,.38,.68],[14,.22,.53]],[[1,.24,.52],[6,.3,.6],[11,.28,.64],[15,.2,.47]],[[0,.34,.7],[5,.2,.48],[10,.35,.65],[13,.22,.5]],[[2,.24,.53],[7,.27,.6],[12,.36,.7],[15,.18,.45]]],
  blues:[[[0,.36,.67],[6,.25,.54],[8,.36,.65],[14,.24,.55]],[[2,.26,.5],[6,.27,.56],[12,.36,.65]],[[0,.35,.68],[6,.24,.52],[10,.26,.57],[14,.24,.54]],[[2,.26,.52],[8,.34,.65],[14,.25,.56]]],
  motown:[[[2,.23,.57],[6,.23,.63],[10,.23,.57],[14,.23,.65]],[[2,.22,.56],[6,.22,.62],[10,.22,.56],[14,.22,.65]],[[0,.3,.65],[6,.23,.61],[10,.22,.56],[14,.23,.64]],[[2,.22,.56],[6,.23,.62],[10,.22,.56],[14,.22,.64],[15,.14,.4]]],
  funk:[[[1,.16,.5],[4,.21,.66],[7,.16,.49],[10,.19,.6],[14,.18,.59]],[[0,.23,.68],[3,.16,.48],[6,.18,.59],[11,.16,.52],[14,.18,.6]],[[1,.16,.5],[4,.2,.65],[9,.16,.48],[12,.2,.65],[15,.14,.43]],[[0,.22,.66],[6,.18,.58],[9,.16,.48],[12,.2,.65],[14,.16,.52]]],
  latin:[[[0,.3,.62],[6,.28,.65],[10,.28,.59]],[[2,.28,.56],[8,.32,.65],[12,.26,.58]],[[0,.3,.63],[6,.28,.64],[10,.28,.58],[14,.24,.55]],[[2,.28,.56],[8,.32,.64],[12,.26,.58],[15,.16,.43]]],
  sparse:[[[0,1.45,.72],[10,.65,.52]],[[3,.55,.48],[12,1.2,.7]],[[0,1.1,.7],[7,.45,.46],[14,.4,.5]],[[5,.65,.52],[11,1.05,.66]]],
  jazz:[[[2,.55,.62],[7,.42,.48],[11,.68,.65],[15,.28,.42]],[[0,.72,.68],[6,.4,.48],[10,.56,.62],[14,.34,.46]],[[3,.5,.58],[8,.7,.66],[13,.48,.52]],[[1,.4,.48],[6,.62,.62],[12,.72,.68],[15,.25,.4]]],
  neoSoul:[[[0,.85,.68],[7,.42,.48],[10,.75,.64]],[[3,.6,.54],[9,.72,.65],[15,.25,.42]],[[0,.9,.7],[6,.4,.46],[12,.65,.62]],[[5,.55,.54],[11,.85,.66]]],
  bossa:[[[0,.62,.62],[6,.5,.56],[10,.62,.64],[14,.4,.5]],[[2,.52,.54],[6,.55,.6],[10,.52,.56],[14,.55,.62]],[[0,.6,.64],[6,.48,.54],[10,.62,.63],[15,.24,.4]],[[2,.5,.52],[8,.64,.62],[14,.48,.58]]],
  ballad:[[[0,2.6,.65],[12,.78,.46]],[[0,1.8,.62],[10,1.2,.54]],[[0,2.4,.66],[14,.42,.42]],[[4,1.35,.54],[12,1.45,.62]]],
};

const TONE_SHAPES={
 brightKeys:{level:.7,attack:.0015,release:.085,decay:1.15,fm:.65,second:.3,third:.18,tremolo:0},
 brightTine:{level:.7,attack:.0025,release:.12,decay:.9,fm:1.05,second:.23,third:.09,tremolo:.008},
 clav:{level:.7,attack:.001,release:.055,decay:1.8,fm:.22,second:.43,third:.3,tremolo:0},
 warmTine:{attack:.012,release:.28,decay:.42,fm:.24,second:.09,third:.025,tremolo:.018},
 felt:{attack:.02,release:.34,decay:.34,fm:.1,second:.035,third:.012,tremolo:.012},
 suitcase:{attack:.006,release:.24,decay:.52,fm:.4,second:.15,third:.045,tremolo:.055},
 reed:{attack:.009,release:.2,decay:.62,fm:.12,second:.06,third:.13,tremolo:.025},
};

for(const [id,bank,cutoff,release,drive] of [['acousticPiano','piano',11000,.1,0],['softPiano','piano',4500,.25,0],['cleanGuitar','electricGuitar',7800,.08,0],['bluesGuitar','electricGuitar',6500,.12,1.5],['nylonGuitar','nylonGuitar',6500,.12,0]])TONE_SHAPES[id]={...TONE_SHAPES.brightKeys,bank,cutoff,release,drive,level:.65};

export class CompingInstrument{
  constructor(rate){this.rate=rate;this.banks={};this.shapes=Object.fromEntries(Object.entries(TONE_SHAPES).map(([id,shape])=>[id,{...shape,attackFrames:rate*shape.attack,releaseFrames:rate*shape.release,releaseFactor:Math.exp(-1/(rate*shape.release)),bodyFactor:Math.exp(-shape.decay/rate),bellFactor:Math.exp(-(id==='felt'?4.8:3.2)/rate)}]));this.lastGrid=-1;this.hits=0;this.cursor=0;this.output=0;this.voices=Array.from({length:32},()=>({active:false,phase:0,modPhase:0,midi:0,age:0,hold:0,gain:0,pan:0,tone:'warmTine'}));}
  installKit(kit){this.clear();this.banks=Object.fromEntries(Object.entries(INSTRUMENT_SAMPLE_ZONES).map(([bank,zones])=>[bank,zones.filter(zone=>kit?.[zone.id]?.length).map(zone=>({...zone,pcm:kit[zone.id]}))]));}
  clear(){for(const voice of this.voices)voice.active=false;this.output=0;this.lastGrid=-1;this.hits=0;}
  tick(settings,beat,phase,notes,voicings,sample,step,onEvent){
    const grid=beat*4+backingSubdivision(phase,settings.drumGroove);
    if(grid===this.lastGrid)return;this.lastGrid=grid;
    const bar=Math.floor(beat/settings.beats),offset=(beat%settings.beats%4)*4+grid%4;
    const pattern=CELLS[settings.compingPattern]||CELLS.sparse,cell=pattern[bar%pattern.length];
    for(const [position,duration,velocity]of cell)if(position===offset){
      const amount=Math.max(0,Math.min(1,Number(settings.compingMovementAmount)||0));
      const vary=settings.compingMovement!=='still'&&voicings.length>1&&amount>0&&position!==cell[0][0]&&this.hits%4<amount*4;
      const index=vary?1+Math.floor(this.hits/4)%(voicings.length-1):0;
      const chord=Array.isArray(voicings[index])?voicings[index]:notes;
      // All comping attacks are full chords on the style's existing rhythm.
      if(chord.length>=3)this.strike(chord,duration,velocity,settings.bpm,sample,step,onEvent,'comping',settings.compingTone);
      this.hits++;
    }
  }
  strike(notes,duration,velocity,bpm,sample,step,onEvent,type='comping',tone='brightKeys'){
    const pitches=[...new Set(notes)].filter(Number.isFinite).slice(-6);
    for(const [index,midi] of pitches.entries()){
      const voice=this.voices[this.cursor++%this.voices.length];
      const shape=this.shapes[tone]||this.shapes.warmTine;
      Object.assign(voice,{shape,increment:440*2**((midi-69)/12)/this.rate,body:1,bell:1,release:1,active:true,phase:0,modPhase:0,midi,age:0,hold:Math.max(.08,duration)*60/Math.max(30,bpm)*this.rate,gain:velocity/Math.sqrt(pitches.length)*(shape.level??1),pan:pitches.length===1?0:index/(pitches.length-1)*2-1,tone});
      const zones=this.banks[shape.bank]||[],zone=zones.reduce((best,item)=>!best||Math.abs(item.rootMidi-midi)<Math.abs(best.rootMidi-midi)?item:best,null);
      voice.pcm=zone?.pcm;voice.samplePosition=0;voice.sampleIncrement=zone?2**((midi-zone.rootMidi)/12):0;voice.filtered=0;voice.filterAlpha=1-Math.exp(-2*Math.PI*Math.min(shape.cutoff||11000,this.rate*.45)/this.rate);
      voice.releaseAt=Math.floor(voice.hold)+1;voice.firstRelease=Math.exp(-(voice.releaseAt-voice.hold)/shape.releaseFrames);
    }
    onEvent?.({type,sample,step,notes:pitches,duration,velocity});
  }
  render(audible=true){
    let output=0;
    for(const voice of this.voices){
      if(!voice.active)continue;
      const increment=voice.increment,shape=voice.shape;
      voice.phase=(voice.phase+increment)%1;voice.modPhase=(voice.modPhase+increment*2.01)%1;voice.age++;
      voice.body*=shape.bodyFactor;voice.bell*=shape.bellFactor;
      if(voice.age===voice.releaseAt)voice.release=voice.firstRelease;else if(voice.age>voice.releaseAt)voice.release*=shape.releaseFactor;
      const release=voice.release;if(release<.0005)voice.active=false;
      if(voice.pcm){
        const position=voice.samplePosition,index=Math.floor(position),pcm=voice.pcm;
        voice.samplePosition+=voice.sampleIncrement;
        if(index>=pcm.length-1){voice.active=false;continue;}
        if(!audible)continue;
        const value=pcm[index]+(pcm[index+1]-pcm[index])*(position-index);
        voice.filtered+=voice.filterAlpha*(value-voice.filtered);
        const wave=shape.drive?Math.tanh(voice.filtered*shape.drive)/Math.tanh(shape.drive):voice.filtered;
        output+=wave*voice.gain*Math.min(1,voice.age/shape.attackFrames)*release;
        continue;
      }
      // Muted voices retain their age, envelope and oscillator phase without
      // allocating tone objects or evaluating inaudible FM oscillators.
      if(!audible)continue;
      const seconds=voice.age/this.rate,tone=voice.tone||'warmTine',attack=Math.min(1,voice.age/shape.attackFrames),body=voice.body,bell=voice.bell;
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
