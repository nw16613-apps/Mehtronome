import {COMPING_TRIMS} from './mix-balance.js';
import {extensionChoices} from './extensions.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
import {voicingTones} from '../guitar/voicings.js';
import {backingSubdivision,performanceTouch} from './groove-time.js';
export const COMPING_PATTERNS={
  popRock:'Pop / rock stabs', fusion:'Fusion accents', blues:'Blues shuffle responses', motown:'Motown offbeats', funk:'Funk stabs', latin:'Latin chord accents',
  sparse:'Electric piano · spacious', jazz:'Electric piano · jazz syncopation', neoSoul:'Electric piano · neo-soul pocket',
  bossa:'Electric piano · bossa', ballad:'Electric piano · ambient ballad',
};
export const COMPING_MOVEMENTS={
  still:'Still chords', extensions:'Chord extensions & inversions', modal:'Modal chord colours', inner:'Chord inversions',
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

// Add modal tensions as whole chord voicings. Seventh chords can omit the root
// (the bass supplies it), but retain their third/suspension, seventh and altered
// fifth. Triads keep their original quality; no seventh is invented for them.
export function compingExtensionVoicings(harmony){
 const root=harmony.chordPcs?.[0];if(!Number.isFinite(root))return [];
 const intervals=harmony.chordPcs.map(pc=>(pc-root+12)%12),pcs=harmony.chordPcs;
 const third=intervals.findIndex(i=>[3,4].includes(i)),suspension=third<0?intervals.findIndex(i=>[2,5].includes(i)):-1;
 const seventh=intervals.findIndex(i=>[10,11].includes(i)),sixth=seventh<0?intervals.findIndex(i=>i===9):-1;
 const altered=intervals.includes(7)?-1:intervals.findIndex(i=>[6,8].includes(i));
 const shell=[third>=0?third:suspension,seventh>=0?seventh:sixth,altered].filter(i=>i>=0).map(i=>pcs[i]);
 const extensions=extensionChoices(harmony,Infinity).map(note=>note.midi%12).filter(pc=>pc!==root&&!shell.includes(pc));
 if(!extensions.length||shell.length<1)return [];
 const colourSets=extensions.map(pc=>[pc]);
 if(seventh>=0||sixth>=0)for(let a=0;a<extensions.length;a++)for(let b=a+1;b<extensions.length;b++)colourSets.push([extensions[a],extensions[b]]);
 const result=[];
 for(const colours of colourSets){
  const required=seventh>=0||sixth>=0?shell:pcs;
  const tones=[...new Set([...required,...colours])];if(tones.length>4)continue;
  if(tones.length<4&&!tones.includes(root))tones.unshift(root);
  const options=inversions(tones);if(options[0])result.push(options[0]);
 }
 return result;
}

/** A small cached vocabulary of complete chords. Modal alternatives are
 * diatonic triads sharing a third/seventh guide tone with the backing chord.
 * Extensions retain defining chord tones and use the current scale.
 * Non-seven-note collections use actual chord inversions rather than assuming
 * ordinary tertian triads. Future harmony never sounds ahead of its change. */
export function compingChordVoicings(harmony,nextHarmony,movement='inner',length=4){
 if(!harmony?.chordPcs?.length)return [];
 const pcs=[...new Set(voicingTones(harmony).map(index=>harmony.chordPcs[index]))],base=inversions(pcs);
 if(!base.length)return [];
 if(movement==='still')return [base[0]];
 const extended=movement==='extensions'||movement==='modal';
 const count=extended?12:Math.max(2,Math.min(4,Number(length)||4)),variants=[base[0]];
 const add=chord=>{if(chord&&!variants.some(v=>v.join(',')===chord.join(',')))variants.push(chord);};
 const sameChord=base.filter(chord=>chord[0]%12!==base[0][0]%12);
 if(movement==='voiceLead'&&nextHarmony?.chordPcs?.length){
  const target=nextHarmony.chordPcs[0];
  sameChord.sort((a,b)=>Math.min((a.at(-1)%12-target+12)%12,(target-a.at(-1)%12+12)%12)-Math.min((b.at(-1)%12-target+12)%12,(target-b.at(-1)%12+12)%12));
 }
 if(extended)for(const chord of compingExtensionVoicings(harmony))add(chord);
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
// a phrase with one or two supportive attacks per bar and room for a soloist.
const CELLS={
  popRock:[[[0,1.35,.72],[8,1.1,.7]],[[0,1.7,.7]],[[0,1.35,.73],[10,.7,.57]],[[6,.8,.5]]],
  fusion:[[[0,.32,.7],[10,.38,.68]],[[1,.24,.52]],[[0,.34,.7],[13,.22,.5]],[[7,.27,.6]]],
  blues:[[[0,.36,.67],[8,.36,.65]],[[6,.27,.56]],[[0,.35,.68],[10,.26,.57]],[[8,.34,.65]]],
  motown:[[[2,.23,.57],[10,.23,.57]],[[6,.22,.62],[14,.22,.65]],[[0,.3,.65]],[[6,.23,.62]]],
  funk:[[[4,.21,.66],[10,.19,.6]],[[0,.23,.68],[14,.18,.6]],[[4,.2,.65]],[[6,.18,.58],[12,.2,.65]]],
  latin:[[[2,.3,.62],[10,.3,.59]],[[6,.35,.56]],[[2,.3,.62],[10,.3,.59]],[[6,.35,.56]]],
  sparse:[[[0,1.45,.72]],[[12,1.2,.7]],[[0,1.1,.7]],[[5,.65,.52]]],
  jazz:[[[2,.55,.62],[11,.68,.65]],[[6,.4,.48]],[[3,.5,.58],[13,.48,.52]],[[6,.62,.62]]],
  neoSoul:[[[0,.85,.68],[10,.75,.64]],[[9,.72,.65]],[[0,.9,.7]],[[5,.55,.54]]],
  bossa:[[[0,.6,.60],[6,.4,.55]],[[10,.55,.59]],[[0,.6,.60],[6,.4,.55]],[[10,.55,.59]]],
  ballad:[[[0,2.6,.65]],[[0,1.8,.62]],[[0,2.4,.66]],[[4,1.35,.54]]],
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
  constructor(rate,voiceCount=32){this.rate=rate;this.banks={};this.shapes=Object.fromEntries(Object.entries(TONE_SHAPES).map(([id,shape])=>[id,{...shape,attackFrames:rate*shape.attack,releaseFrames:rate*shape.release,releaseFactor:Math.exp(-1/(rate*shape.release)),bodyFactor:Math.exp(-shape.decay/rate),bellFactor:Math.exp(-(id==='felt'?4.8:3.2)/rate)}]));this.lastGrid=-1;this.hits=0;this.lastChord='';this.cursor=0;this.output=0;this.voices=Array.from({length:voiceCount},()=>({active:false,phase:0,modPhase:0,midi:0,age:0,hold:0,gain:0,pan:0,tone:'warmTine'}));}
  installKit(kit,clear=true){if(clear)this.clear();this.banks=Object.fromEntries(Object.entries(INSTRUMENT_SAMPLE_ZONES).map(([bank,zones])=>[bank,zones.filter(zone=>kit?.[zone.id]?.length).map(zone=>({...zone,pcm:kit[zone.id]}))]));}
  clear(){for(const voice of this.voices)voice.active=false;this.output=0;this.lastGrid=-1;this.hits=0;this.lastChord='';}
  tick(settings,beat,phase,notes,voicings,sample,step,onEvent,audible=true){
    const grid=beat*4+backingSubdivision(phase,settings.drumGroove,settings.bpm);
    if(grid===this.lastGrid)return;this.lastGrid=grid;if(!audible)return;
    const bar=Math.floor(beat/settings.beats),offset=(beat%settings.beats%4)*4+grid%4;
    // Leave the last beat of larger drum answers clear; existing chords can ring.
    if(settings.backingVariation>0&&(settings.backingTurnaround||bar%8===7)&&beat%settings.beats===settings.beats-1)return;

    const pattern=CELLS[settings.compingPattern]||CELLS.sparse,cell=pattern[!['latin','bossa'].includes(settings.compingPattern)&&settings.backingVariation>0&&Math.floor(bar/4)%2?[0,2,1,3][bar%pattern.length]:bar%pattern.length];
    for(const [position,duration,velocity]of cell)if(position===offset){
      const chordSignature=notes.join(','),firstChord=chordSignature!==this.lastChord;
      const amount=Math.max(0,Math.min(1,Number(settings.compingMovementAmount)||0));
      const vary=settings.compingMovement!=='still'&&voicings.length>1&&amount>0&&!firstChord&&(position!==cell[0][0]||bar%2===1)&&this.hits%4<amount*4;
      const index=vary?1+Math.floor(this.hits/4)%(voicings.length-1):0;
      const chord=Array.isArray(voicings[index])?voicings[index]:notes;
      // All comping attacks are full chords on the style's existing rhythm.
      if(chord.length>=3){const touch=performanceTouch(settings,'comping',bar,offset,this.rate);this.strike(chord,duration*touch.length,velocity*touch.velocity,settings.bpm,sample,step,onEvent,'comping',settings.compingTone,touch.delayFrames);}
      this.lastChord=chordSignature;this.hits++;
    }
  }
  strike(notes,duration,velocity,bpm,sample,step,onEvent,type='comping',tone='brightKeys',delayFrames=0){
    const pitches=[...new Set(notes)].filter(Number.isFinite).slice(-6);
    for(const [index,midi] of pitches.entries()){
      const voice=this.voices[this.cursor++%this.voices.length];
      const shape=this.shapes[tone]||this.shapes.warmTine;
      Object.assign(voice,{delay:delayFrames,shape,increment:440*2**((midi-69)/12)/this.rate,body:1,bell:1,release:1,active:true,phase:0,modPhase:0,midi,age:0,hold:Math.max(.08,duration)*60/Math.max(30,bpm)*this.rate,gain:velocity/Math.sqrt(pitches.length)*(shape.level??1)*(COMPING_TRIMS[tone]??1),pan:pitches.length===1?0:index/(pitches.length-1)*2-1,tone});
      const zones=this.banks[shape.bank]||[],zone=zones.reduce((best,item)=>!best||Math.abs(item.rootMidi-midi)<Math.abs(best.rootMidi-midi)?item:best,null);
      voice.pcm=zone?.pcm;voice.samplePosition=0;voice.sampleIncrement=zone?2**((midi-zone.rootMidi)/12):0;voice.filtered=0;voice.filterAlpha=1-Math.exp(-2*Math.PI*Math.min(shape.cutoff||11000,this.rate*.45)/this.rate);
      voice.releaseAt=Math.floor(voice.hold)+1;voice.firstRelease=Math.exp(-(voice.releaseAt-voice.hold)/shape.releaseFrames);
    }
    onEvent?.({type,sample:sample+delayFrames,gridSample:sample,delayFrames,step,notes:pitches,duration,velocity});
  }
  render(audible=true){
    let output=0;
    for(const voice of this.voices){
      if(!voice.active)continue;
      if(voice.delay>0){voice.delay--;continue;}
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
