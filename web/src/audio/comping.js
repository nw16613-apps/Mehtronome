import {referenceEvents,referenceGrid,sessionEventGain} from './reference-performances.js';
import {EXPANDED_SAMPLE_ZONES,expandedBankForTone,recordedZone,sourceFor,STUDIO_BANKS} from './sound-library.js';
import {ensembleComping} from './ensemble-arrangements.js';
import {ADDITIONAL_STYLES} from './additional-styles.js';
import {accompanimentPhrase} from './accompaniment.js';
import {COMPING_TRIMS} from './mix-balance.js';
import {extensionChoices} from './extensions.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
import {voicingTones} from '../guitar/voicings.js';
import {backingSubdivision,performanceTouch} from './groove-time.js';
export const COMPING_PATTERNS={
  popRock:'Pop / rock chord part', fusion:'Fusion chord vamp', blues:'Blues shuffle chord riff', motown:'Motown piano figure', funk:'Funk clav ostinato', latin:'Son piano ostinato',
  sparse:'Electric piano · spacious', jazz:'Electric piano · jazz syncopation', neoSoul:'Electric piano · neo-soul pocket',
  bossa:'Bossa guitar pattern', ballad:'Sustained ballad chords',
};
for(const [id,s]of Object.entries(ADDITIONAL_STYLES))COMPING_PATTERNS[id]=s.part;
export const COMPING_MOVEMENTS={
  spread:'Spread chord colours',still:'Still chords', extensions:'Chord extensions & inversions', modal:'Modal chord colours', inner:'Chord inversions',
  response:'Chord responses', voiceLead:'Voice-led chords',
};
export const COMPING_TONES={
  fluteLead:'Modeled flute-like lead',jazzGuitar:'Mellow jazz guitar',legatoGuitar:'Modeled legato guitar',swelledGuitar:'Soft-attack electric guitar',drawbarOrgan:'Drawbar-style organ',drivenGuitar:'Driven electric guitar',acousticPiano:'Acoustic piano',softPiano:'Soft acoustic piano',cleanGuitar:'Clean electric guitar',bluesGuitar:'Blues electric guitar',nylonGuitar:'Nylon-string guitar',
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
 if(movement==='spread')return spreadCompingVoicings(harmony);
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

/** Spread complete voicings across registers; preserve each selected pitch class. */
export function spreadCompingVoicings(harmony){
 const close=compingChordVoicings(harmony,harmony,'extensions',4),result=[];
 for(const chord of close){
  const pcs=[...new Set(chord.map(n=>n%12))],candidates=[];
  const visit=(notes,index)=>{
   if(index===pcs.length){const ordered=notes.slice().sort((a,b)=>a-b),span=ordered.at(-1)-ordered[0];
    if(span>=19&&span<=29&&ordered.every((n,i)=>!i||n-ordered[i-1]>=3))candidates.push(ordered);return;}
   for(let midi=48;midi<=84;midi++)if(midi%12===pcs[index])visit([...notes,midi],index+1);
  };visit([],0);
  candidates.sort((a,b)=>Math.abs((a[0]+a.at(-1))/2-66)-Math.abs((b[0]+b.at(-1))/2-66)||Math.abs(a.at(-1)-a[0]-23)-Math.abs(b.at(-1)-b[0]-23));
  const spread=candidates[0]||chord;
  if(!result.some(v=>v.join(',')===spread.join(',')))result.push(spread);
 }
 return result;
}

// [sixteenth position, duration in beats, velocity]. Four related bars create
// a phrase with one or two supportive attacks per bar and room for a soloist.
const CELLS={
  popRock:[[[0,1.35,.72],[8,1.1,.7]],[[0,1.7,.7]],[[0,1.35,.73],[10,.7,.57]],[[6,.8,.5]]],
  fusion:[[[0,.85,.7],[10,.65,.68]],[[7,.9,.6]],[[0,.85,.7],[10,.65,.68]],[[7,.9,.6]]],
  blues:[[[0,.6,.67],[8,.5,.65]],[[6,.6,.56]],[[0,.6,.67],[8,.5,.65]],[[6,.6,.56]]],
  motown:[[[2,.3,.57],[10,.3,.57]],[[6,.3,.62]],[[2,.3,.57],[10,.3,.57]],[[6,.3,.62]]],
  funk:[[[4,.3,.66],[10,.25,.6]],[[6,.28,.6]],[[4,.3,.66],[10,.25,.6]],[[6,.28,.6]]],
  latin:[[[2,1.1,.62],[10,.8,.59]],[[6,1.2,.56]],[[2,1.1,.62],[10,.8,.59]],[[6,1.2,.56]]],
  sparse:[[[0,1.45,.72]],[[12,1.2,.7]],[[0,1.1,.7]],[[5,.65,.52]]],
  jazz:[[[2,.9,.62],[11,1.1,.65]],[[6,1.2,.48]],[[3,1.1,.58],[13,.7,.52]],[[6,1.3,.62]]],
  neoSoul:[[[0,2,.68],[10,1.2,.64]],[[9,1.5,.65]],[[0,2.4,.7]],[[5,2.2,.54]]],
  bossa:[[[0,1.15,.60],[6,.6,.55]],[[10,1.4,.59]],[[0,1.15,.60],[6,.6,.55]],[[10,1.4,.59]]],
  ballad:[[[0,3.2,.65]],[[0,2.8,.62]],[[0,3.2,.66]],[[4,2.8,.54]]],
};

for(const [id,s]of Object.entries(ADDITIONAL_STYLES))CELLS[id]=s.base.map(bar=>bar.map(([position,,duration,velocity])=>[position,duration,velocity]));
const ORGAN_RATIOS=[.5,1.5,1,2,3,4,5,6,8];
const TONE_SHAPES={
 fluteLead:{level:.55,attack:.025,release:.18,decay:.09,fm:.025,second:.10,third:.025,tremolo:.008,breath:.018},
 legatoGuitar:{level:.55,attack:.018,release:.22,decay:.085,fm:.14,second:.18,third:.065,tremolo:.006},
 drawbarOrgan:{level:.6,attack:.004,release:.085,decay:.03,fm:0,second:.28,third:.16,tremolo:.018},
 brightKeys:{level:.7,attack:.0015,release:.085,decay:1.15,fm:.65,second:.3,third:.18,tremolo:0},
 brightTine:{level:.7,attack:.0025,release:.12,decay:.9,fm:1.05,second:.23,third:.09,tremolo:.008},
 clav:{level:.7,attack:.001,release:.055,decay:1.8,fm:.22,second:.43,third:.3,tremolo:0},
 warmTine:{attack:.012,release:.28,decay:.42,fm:.24,second:.09,third:.025,tremolo:.018},
 felt:{attack:.02,release:.34,decay:.34,fm:.1,second:.035,third:.012,tremolo:.012},
 suitcase:{attack:.006,release:.24,decay:.52,fm:.4,second:.15,third:.045,tremolo:.055},
 reed:{attack:.009,release:.2,decay:.62,fm:.12,second:.06,third:.13,tremolo:.025},
};

for(const [id,bank,cutoff,release,drive] of [['acousticPiano','piano',11000,.1,0],['softPiano','piano',4500,.25,0],['cleanGuitar','electricGuitar',7800,.08,0],['bluesGuitar','electricGuitar',6500,.12,1.5],['drivenGuitar','electricGuitar',5600,.11,3.2],['swelledGuitar','electricGuitar',4800,.38,.35],['jazzGuitar','electricGuitar',4200,.13,.2],['nylonGuitar','nylonGuitar',6500,.12,0]])TONE_SHAPES[id]={...TONE_SHAPES.brightKeys,bank,cutoff,release,drive,level:.65};

TONE_SHAPES.swelledGuitar.attack=.045;TONE_SHAPES.jazzGuitar.attack=.006;
export class CompingInstrument{
  constructor(rate,voiceCount=32){this.rate=rate;this.soundLibrary='original';this.sampleCursors=new Map();this.transitionFactor=Math.exp(-1/(rate*.025));this.banks={};this.shapes=Object.fromEntries(Object.entries(TONE_SHAPES).map(([id,shape])=>[id,{...shape,attackFrames:rate*shape.attack,releaseFrames:rate*shape.release,releaseFactor:Math.exp(-1/(rate*shape.release)),bodyFactor:Math.exp(-shape.decay/rate),bellFactor:Math.exp(-(id==='felt'?4.8:3.2)/rate)}]));this.lastGrid=-1;this.hits=0;this.lastChord='';this.partSignature='';this.partOption=0;this.partLastVoicing=null;this.cursor=0;this.strumCount=0;this.output=0;this.voices=Array.from({length:voiceCount},()=>({active:false,phase:0,modPhase:0,midi:0,age:0,hold:0,gain:0,pan:0,tone:'warmTine'}));}
  installKit(kit,clear=true){if(clear)this.clear();this.banks=Object.fromEntries(Object.entries(INSTRUMENT_SAMPLE_ZONES).map(([bank,zones])=>[bank,zones.filter(zone=>kit?.[zone.id]?.length).map(zone=>({...zone,pcm:kit[zone.id]}))]));
   for(const [bank,zones]of Object.entries(EXPANDED_SAMPLE_ZONES)){const loaded=zones.filter(z=>kit?.[z.id]?.length).map(z=>({...z,pcm:kit[z.id]}));this.banks['expanded:'+bank]=!STUDIO_BANKS.has(bank)&&(bank==='piano'||bank==='nylonGuitar'||bank==='upright')?[...(this.banks[bank]||[]),...loaded]:loaded;}
  }
  clear(){this.strumCount=0;this.sampleCursors.clear();for(const voice of this.voices)voice.pendingLegato=null;for(const voice of this.voices)voice.active=false;this.output=0;this.lastGrid=-1;this.hits=0;this.lastChord='';this.partSignature='';this.partOption=0;this.partLastVoicing=null;}
  tick(settings,beat,phase,notes,voicings,sample,step,onEvent,audible=true,part=null){
    this.soundLibrary=sourceFor(settings,'comping');
    const grid=settings.referencePlan?.score.gridRate?referenceGrid(settings.referencePlan,'comping',beat,phase,settings):beat*4+backingSubdivision(phase,settings.drumGroove,settings.bpm);
    if(grid===this.lastGrid)return;this.lastGrid=grid;if(!audible)return;
    const bar=Math.floor(beat/settings.beats),offset=(beat%settings.beats)*4+grid%4;
    if(settings.referencePlan){
      const plan=settings.referencePlan;
      for(const event of referenceEvents(plan,'comping',grid)){
        const pitches=event.notes.map(midi=>midi+plan.transpose);
        const velocity=event.velocity*sessionEventGain(plan,'comping',grid);
        this.strike(pitches,event.duration,velocity,settings.bpm,sample,step,undefined,'comping',settings.compingTone,0,null,event.articulation);
        onEvent?.({type:'comping',sample,step,notes:pitches,duration:event.duration,velocity,reference:plan.score.id,bar:event.bar});
      }
      return;
    }
    if(part){this.playPart(settings,beat,bar,offset,part,sample,step,onEvent);return;}
    // Leave the last beat of larger drum answers clear; existing chords can ring.
    if(settings.backingVariation>0&&(settings.backingTurnaround||bar%8===7)&&beat%settings.beats===settings.beats-1)return;

    const pattern=CELLS[settings.compingPattern]||CELLS.sparse,cell=pattern[!['latin','bossa','funk','motown','fusion','blues'].includes(settings.compingPattern)&&settings.backingVariation>0&&Math.floor(bar/4)%2?[0,2,1,3][bar%pattern.length]:bar%pattern.length];
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
  playPart(settings,beat,bar,offset,part,sample,step,onEvent){
    const changed=this.partSignature!==part.signature,amount=Math.max(0,Math.min(1,Number(settings.compingMovementAmount)||0)),moving=settings.compingMovement!=='still'&&amount>0;
    if(changed){
      const newStyle=this.partSignature&&!this.partSignature.startsWith(part.style+':');
      for(const voice of this.voices)if(voice.active&&(newStyle||!part.allowed.has(voice.midi%12)))this.releaseVoice(voice);
      this.partSignature=part.signature;this.partOption=0;
      if(moving&&this.partLastVoicing){let best=Infinity;for(let index=0;index<part.options.length;index++){const chord=part.options[index].chord,score=chord.reduce((sum,note,i)=>sum+Math.abs(note-this.partLastVoicing[Math.min(i,this.partLastVoicing.length-1)]),0)/chord.length;if(score<best){best=score;this.partOption=index;}}}
    }
    const phrase=ensembleComping(settings,bar)||accompanimentPhrase(part.style,bar,settings.backingVariation>0,settings.backingTurnaround),cell=phrase.cell;
    // Pitch colours change between two-bar phrases, never halfway through the riff.
    if(offset===0&&!changed&&moving&&bar%2===0)this.partOption=Math.floor(bar/2)%Math.max(1,Math.ceil(part.options.length*amount));
    const option=part.options[(moving?this.partOption:0)%part.options.length];
    for(const [position,role,duration,velocity,group]of cell)if(position===offset){
      const pitches=option[role];if(!pitches?.length)continue;
      const touch=performanceTouch(settings,'comping',bar,offset,this.rate);
      const tone=part.style==='reggae'&&['third','seventh'].includes(role)?'drawbarOrgan':settings.compingTone;
      this.strike(pitches,duration*touch.length,velocity*touch.velocity,settings.bpm,sample,step,undefined,'comping',tone,touch.delayFrames,group||role);
      onEvent?.({type:'comping',sample:sample+touch.delayFrames,gridSample:sample,delayFrames:touch.delayFrames,step,notes:pitches,duration:duration*touch.length,velocity:velocity*touch.velocity,part:part.style,variant:phrase.variant,role,tone});
      this.partLastVoicing=option.chord;this.hits++;
    }
  }
  releaseVoice(voice){voice.pendingLegato=null;if(voice.delay>0){voice.active=false;return;}voice.releaseAt=voice.age+1;voice.firstRelease=voice.release;voice.releaseFactor=this.transitionFactor;}
  strike(notes,duration,velocity,bpm,sample,step,onEvent,type='comping',tone='brightKeys',delayFrames=0,group=null,expression=null){
    const pitches=[...new Set(notes)].filter(Number.isFinite).slice(-6);
    const guitar=this.soundLibrary==='expanded'&&STUDIO_BANKS.has('electricGuitar')&&['cleanGuitar','bluesGuitar','drivenGuitar','swelledGuitar','jazzGuitar','nylonGuitar','legatoGuitar'].includes(tone),strum=guitar&&type==='comping'&&pitches.length>1,strumDown=this.strumCount%2===0;this.strumCount++;if(strum)pitches.sort((a,b)=>a-b);
    const continuation=this.soundLibrary==='expanded'&&type==='sequence'&&pitches.length===1&&this.voices.some(v=>v.active&&v.pcm&&v.tone===tone&&v.age<v.hold&&!v.delay);
    if(['legatoGuitar','fluteLead'].includes(tone)&&type==='sequence'&&pitches.length===1){
      const held=this.voices.find(v=>v.active&&v.tone===tone&&v.age<v.hold&&v.releaseAt>v.age+1&&!v.delay);
      if(held&&!held.pcm){const transition={midi:pitches[0],duration,velocity,bpm,delay:delayFrames};if(delayFrames>0)held.pendingLegato=transition;else this.connectLegato(held,transition);onEvent?.({type,sample:sample+delayFrames,step,notes:pitches,duration,velocity,legato:true});return;}
    }
    if(this.soundLibrary==='expanded'&&type==='sequence')for(const voice of this.voices)if(voice.active&&voice.pcm&&voice.tone===tone)this.releaseVoice(voice);
    if(group)for(const voice of this.voices)if(voice.active&&(group==='inner'?voice.group==='inner':pitches.includes(voice.midi)))this.releaseVoice(voice);
    for(const [index,midi] of pitches.entries()){
      const voice=this.voices[this.cursor++%this.voices.length];
      const originalShape=this.shapes[tone]||this.shapes.warmTine,expanded=this.soundLibrary==='expanded',bank=expanded?expandedBankForTone(tone):null;
      let shape=expanded&&bank?{...originalShape,bank:'expanded:'+bank,cutoff:bank==='flute'?9000:bank==='wurlitzer'?9000:tone==='legatoGuitar'?6500:originalShape.cutoff}:originalShape;
      if(expression==='damped'){const seconds=.035;shape={...shape,releaseFrames:this.rate*seconds,releaseFactor:Math.exp(-1/(this.rate*seconds))};}else if(expression==='ringing'){const seconds=.18;shape={...shape,releaseFrames:this.rate*seconds,releaseFactor:Math.exp(-1/(this.rate*seconds))};}else if(expression==='swell')shape={...shape,attackFrames:Math.max(shape.attackFrames,this.rate*.065)};
      Object.assign(voice,{pendingLegato:null,glideRemaining:0,noiseState:Math.imul(midi+1,1664525),breathFiltered:0,group,releaseFactor:shape.releaseFactor,delay:delayFrames+(strum?Math.round((strumDown?index:pitches.length-1-index)*this.rate*.006):0),shape,increment:440*2**((midi-69)/12)/this.rate,body:1,bell:1,release:1,active:true,phase:0,modPhase:0,midi,age:0,hold:Math.max(.08,duration)*60/Math.max(30,bpm)*this.rate,gain:velocity/Math.sqrt(pitches.length)*(shape.level??1)*(COMPING_TRIMS[tone]??1),pan:pitches.length===1?0:index/(pitches.length-1)*2-1,tone});
      const muted=expanded&&!STUDIO_BANKS.has(bank)&&['cleanGuitar','bluesGuitar','drivenGuitar'].includes(tone)&&duration<.42&&this.banks['expanded:guitarMuted']?.length;
      const zones=this.banks[muted?'expanded:guitarMuted':shape.bank]?.length?this.banks[muted?'expanded:guitarMuted':shape.bank]:this.banks[originalShape.bank]||[];
      const zone=expanded?recordedZone(zones,midi,velocity,this.sampleCursors):zones.reduce((best,item)=>!best||Math.abs(item.rootMidi-midi)<Math.abs(best.rootMidi-midi)?item:best,null);
      voice.sourceGain=expanded&&zone?(bank==='electricGuitar'?(tone==='legatoGuitar'?1.25:.9):bank==='flute'?1.05:bank==='wurlitzer'?1:bank==='nylonGuitar'?1.15:bank==='clav'?1.35:1.05):1;voice.sourceId=zone?.id;voice.articulation=muted?'recorded staccato':zone?.layer||'normal';voice.expanded=expanded;
      voice.organPartials=expanded&&tone==='drawbarOrgan'&&!zone?.pcm?ORGAN_RATIOS.map((ratio,i)=>440*2**((midi-69)/12)*ratio<this.rate*.45?[.17,.1,1,.24,.1,.07,.035,.02,.01][i]:0):null;
      voice.pcm=zone?.pcm;voice.samplePosition=continuation&&zone?.legatoStart?zone.legatoStart*this.rate:0;voice.loopStart=(zone?.loopStartSeconds||0)*this.rate;voice.loopEnd=zone?.loopEndSeconds?Math.min(zone.loopEndSeconds*this.rate,(zone.pcm?.length||1)-2):0;voice.sampleIncrement=zone?2**((midi-zone.rootMidi)/12):0;voice.bendRemaining=0;
      if(expression==='bend'){voice.bendRemaining=Math.round(this.rate*.06);voice.bendTarget=voice.pcm?voice.sampleIncrement:voice.increment;const start=voice.bendTarget*2**(-.5/12);voice.bendStep=(voice.bendTarget-start)/voice.bendRemaining;if(voice.pcm)voice.sampleIncrement=start;else voice.increment=start;}voice.filtered=0;voice.filterAlpha=1-Math.exp(-2*Math.PI*Math.min((shape.cutoff||11000)*(expanded?.65+.7*Math.min(1,velocity):1),this.rate*.45)/this.rate);
      voice.releaseAt=Math.floor(voice.hold)+1;voice.firstRelease=Math.exp(-(voice.releaseAt-voice.hold)/shape.releaseFrames);
    }
    onEvent?.({type,sample:sample+delayFrames,gridSample:sample,delayFrames,step,notes:pitches,duration,velocity});
  }
  connectLegato(voice,note){
    voice.midi=note.midi;voice.targetIncrement=440*2**((note.midi-69)/12)/this.rate;
    voice.glideRemaining=Math.max(1,Math.round(this.rate*.015));voice.glideStep=(voice.targetIncrement-voice.increment)/voice.glideRemaining;
    voice.hold=voice.age+Math.max(.08,note.duration)*60/Math.max(30,note.bpm)*this.rate;voice.releaseAt=Math.floor(voice.hold)+1;voice.firstRelease=1;voice.release=1;
  }
  render(audible=true){
    let output=0;
    for(const voice of this.voices){
      if(!voice.active)continue;
      if(voice.delay>0){voice.delay--;continue;}
      if(voice.pendingLegato&&voice.pendingLegato.delay--<=0){this.connectLegato(voice,voice.pendingLegato);voice.pendingLegato=null;}
      if(voice.glideRemaining>0){voice.increment+=voice.glideStep;if(--voice.glideRemaining===0)voice.increment=voice.targetIncrement;}
      if(voice.bendRemaining>0){if(voice.pcm)voice.sampleIncrement+=voice.bendStep;else voice.increment+=voice.bendStep;if(--voice.bendRemaining===0){if(voice.pcm)voice.sampleIncrement=voice.bendTarget;else voice.increment=voice.bendTarget;}}
      const increment=voice.increment,shape=voice.shape;
      voice.phase=(voice.phase+increment)%1;voice.modPhase=(voice.modPhase+increment*2.01)%1;voice.age++;
      voice.body*=shape.bodyFactor;voice.bell*=shape.bellFactor;
      if(voice.age===voice.releaseAt)voice.release=voice.firstRelease;else if(voice.age>voice.releaseAt)voice.release*=voice.releaseFactor;
      const release=voice.release;if(release<.0005)voice.active=false;
      if(voice.pcm){
        if(voice.loopEnd>voice.loopStart&&voice.samplePosition>=voice.loopEnd)voice.samplePosition=voice.loopStart+(voice.samplePosition-voice.loopEnd)%(voice.loopEnd-voice.loopStart);
        const position=voice.samplePosition,index=Math.floor(position),pcm=voice.pcm;
        voice.samplePosition+=voice.sampleIncrement;
        if(index>=pcm.length-1){voice.active=false;continue;}
        if(!audible)continue;
        const value=pcm[index]+(pcm[index+1]-pcm[index])*(position-index);
        voice.filtered+=voice.filterAlpha*(value-voice.filtered);
        const wave=shape.drive?Math.tanh(voice.filtered*shape.drive)/Math.tanh(shape.drive):voice.filtered;
        output+=wave*voice.gain*voice.sourceGain*Math.min(1,voice.age/shape.attackFrames)*release;
        continue;
      }
      // Muted voices retain their age, envelope and oscillator phase without
      // allocating tone objects or evaluating inaudible FM oscillators.
      if(!audible)continue;
      const seconds=voice.age/this.rate,tone=voice.tone||'warmTine',attack=Math.min(1,voice.age/shape.attackFrames),body=voice.body,bell=voice.bell;
      const phase=2*Math.PI*voice.phase,mod=shape.fm*bell*Math.sin(2*Math.PI*voice.modPhase);
      const fundamental=Math.sin(phase+mod),second=Math.sin(phase*2+.12),third=Math.sin(phase*3+.24);
      const tremolo=1-shape.tremolo+shape.tremolo*Math.sin(2*Math.PI*seconds*4.7+voice.pan);
      let wave=fundamental*(tone==='reed'?.74:.86)+second*shape.second*bell+third*shape.third*(tone==='reed'?.75:bell);
      if(voice.organPartials){wave=0;for(let i=0;i<9;i++)if(voice.organPartials[i])wave+=Math.sin(phase*ORGAN_RATIOS[i])*voice.organPartials[i];wave*=.78*(.96+.04*Math.sin(seconds*2*Math.PI*5.2));wave+=Math.sin(phase*3)*.08*Math.exp(-seconds*12);}
      let air=0;if(shape.breath){voice.noiseState=(Math.imul(voice.noiseState,1664525)+1013904223)|0;voice.breathFiltered+=.15*((voice.noiseState>>>0)/2147483648-1-voice.breathFiltered);air=voice.breathFiltered*shape.breath;}
      output+=(wave+air)*voice.gain*attack*release*body*tremolo*.82;
      if(release<.0005)voice.active=false;
    }
    this.output=output;return output;
  }
}
