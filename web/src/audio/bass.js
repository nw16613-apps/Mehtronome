import {EXPANDED_SAMPLE_ZONES,STUDIO_BANKS,recordedZone} from './sound-library.js';
import {BASS_TRIMS,VSCO_UPRIGHT_GAIN} from './mix-balance.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
import { BASS_WAVE, readWave } from './waves.js';
import { BASS_SAMPLE_ZONES } from './sample-map.js';

// Articulation is chosen once per note. The recordings retain their attack and
// body; these gentle tone/gate differences give each rhythmic style its own touch.
const ARTICULATIONS = {
  blues:{attack:.003,release:.065,cutoff:2700,dry:.55,decay:1.1},
  roots:  {attack:.007, release:.14, cutoff:1700, dry:.38, decay:1.8},
  fifths: {attack:.004, release:.07, cutoff:3000, dry:.58, decay:1.15},
  walk:   {attack:.005, release:.085,cutoff:2200, dry:.46, decay:1.3},
  bossa:  {attack:.004, release:.055,cutoff:1900, dry:.42, decay:1.05},
  funk:   {attack:.002, release:.045,cutoff:4500, dry:.72, decay:.9},
  fusion: {attack:.002, release:.05, cutoff:3900, dry:.68, decay:.92},
  neoSoul:{attack:.006, release:.09, cutoff:2100, dry:.43, decay:1.18},
  modal:  {attack:.004, release:.075,cutoff:2600, dry:.5,  decay:1.08},
  motown: {attack:.003, release:.065,cutoff:2400, dry:.54, decay:1.02},
  tumbao: {attack:.003, release:.055,cutoff:2300, dry:.5,  decay:.98},
  jazzOstinato:{attack:.003,release:.065,cutoff:2850,dry:.56,decay:1.02},
  ballad: {attack:.008, release:.13, cutoff:1600, dry:.34, decay:1.55},
};
const SILENCE = .00001;

/**
 * A small monophonic bass sampler with overlapping releases. Samples have
 * already been decoded at `rate`; pitch changes use interpolated reads from the
 * nearest recorded note. The wavetable is only a standalone/offline fallback.
 */
export class SampledBass {
  constructor(rate, kit = null) {
    this.rate = rate;
    this.cursor = 0;
    this.roundRobin = new Map();
    this.voices = Array.from({length:3},()=>({
      sample:null, position:0, increment:0, phase:0, age:Infinity,
      envelope:0, releasing:false, decay:1, gain:1, gate:0,
      attackFrames:1, releaseDecay:1, coefficient:1, filter:0, dry:1,
      rootMidi:null, midi:null,
    }));
    this.installKit(kit);
  }

  installKit(kit,clear=true) {
    this.kit = kit;
    // Replacing samples stops existing voices rather than reading old buffers
    // at a different rate. Grouping is setup work, never part of render().
    this.zones = [];
    for (const zone of BASS_SAMPLE_ZONES) {
      const sample=kit?.[zone.id];
      if (!(sample instanceof Float32Array) || sample.length<2) continue;
      let group=this.zones.find(item=>item.rootMidi===zone.rootMidi);
      if (!group) { group={rootMidi:zone.rootMidi,samples:[]}; this.zones.push(group); }
      group.samples.push(sample);
    }
    this.zones.sort((a,b)=>a.rootMidi-b.rootMidi);
    this.banks={electric:this.zones,upright:INSTRUMENT_SAMPLE_ZONES.upright.flatMap(zone=>kit?.[zone.id]?.length?[{rootMidi:zone.rootMidi,samples:[kit[zone.id]]}]:[])};
    this.expandedBanks=Object.fromEntries(['electricBass','upright'].map(bank=>[bank,(EXPANDED_SAMPLE_ZONES[bank]||[]).filter(z=>kit?.[z.id]?.length).map(z=>({...z,samples:[kit[z.id]]}))]));
    if(clear)this.clear();
  }

  clear() {
    for (const voice of this.voices) {
      voice.sample=null; voice.age=Infinity; voice.envelope=0;
      voice.position=0; voice.phase=0; voice.filter=0; voice.releasing=false;
    }
    this.cursor=0;
    this.roundRobin.clear();
  }

  noteOn(midi, lengthSeconds, gain=1, style='roots',instrument='electric',soundLibrary='original') {
    if (!Number.isFinite(midi) || !Number.isFinite(lengthSeconds) || lengthSeconds<=0) return null;
    const baseArticulation=ARTICULATIONS[style] || ARTICULATIONS.roots;
    // Upright samples already contain the woody body. Preserve their pluck
    // rather than applying the dark electric-bass/root envelope on top.
    const articulation=instrument==='upright'?{...baseArticulation,attack:Math.min(baseArticulation.attack,.0025),cutoff:Math.max(baseArticulation.cutoff,5200),dry:.78}:baseArticulation;
    const pitch=Math.max(24,Math.min(72,midi));
    const level=Number.isFinite(gain)?Math.max(0,Math.min(1.2,gain)):0;
    // Every new pluck releases the previous one smoothly. Three slots preserve
    // the short overlap without stealing the immediately preceding attack.
    for (const old of this.voices) {
      old.releasing=true;
      // The next pluck damps the preceding low string without a hard cut.
      old.releaseDecay=Math.min(old.releaseDecay,Math.exp(-1/(this.rate*.025)));
    }
    const voice=this.voices[this.cursor++%this.voices.length];
    let zone=null;
    let zones=this.banks[instrument]?.length?this.banks[instrument]:this.zones;
    if(soundLibrary==='expanded'){
      const extra=this.expandedBanks[instrument==='upright'?'upright':'electricBass']||[];
      const bank=instrument==='upright'?'upright':'electricBass';
      if(STUDIO_BANKS.has(bank)&&extra.length){const selected=recordedZone(extra,pitch,level,this.roundRobin);zones=selected?[selected]:extra;}
      else if(instrument==='upright')zones=[...zones,...extra];
      else {const layer=level<.55?'p':level>.75?'f':null;if(layer&&extra.some(z=>z.layer===layer))zones=extra.filter(z=>z.layer===layer);}
    }
    for (const candidate of zones) {
      if (!zone || Math.abs(pitch-candidate.rootMidi)<Math.abs(pitch-zone.rootMidi)) zone=candidate;
    }
    let sample=null;
    if (zone) {
      const root=zone.nominalMidi??Math.round(zone.rootMidi),peers=zones.filter(z=>(z.nominalMidi??Math.round(z.rootMidi))===root),choices=peers.flatMap(z=>z.samples.map(pcm=>({zone:z,pcm}))),key=root+':'+(zone.layer||'base');
      const count=this.roundRobin.get(key)||0,chosen=choices[count%choices.length];zone=chosen.zone;sample=chosen.pcm;this.roundRobin.set(key,count+1);
    }
    const seconds=Math.max(.015,lengthSeconds);
    Object.assign(voice,{
      sample,position:0,phase:0,midi:pitch,rootMidi:zone?.rootMidi??null,sourceId:zone?.id??null,layer:zone?.layer??null,
      increment:sample?2**((pitch-zone.rootMidi)/12):440*2**((pitch-69)/12)/this.rate,
      age:0,envelope:1,releasing:false,gain:level*(BASS_TRIMS[instrument]??1)*(zone?.id?.startsWith('qVscoBass')?VSCO_UPRIGHT_GAIN:1),
      gate:Math.max(1,Math.round(seconds*this.rate)),
      attackFrames:Math.max(1,Math.round(articulation.attack*(1.25-.45*Math.min(1,level))*this.rate)),
      releaseDecay:Math.exp(-1/(this.rate*Math.min(articulation.release,Math.max(.025,seconds*.3)))),
      // Recorded decays supply the sustain shape. The fallback needs its own
      // plucked envelope and stays responsive to the same note articulation.
      decay:sample?1:Math.exp(-1/(this.rate*seconds*articulation.decay)),
      coefficient:1-Math.exp(-2*Math.PI*Math.min(articulation.cutoff,this.rate*.38)/this.rate),
      filter:0,dry:articulation.dry,
      upright:instrument==='upright',body:0,bodyCoefficient:1-Math.exp(-2*Math.PI*220/this.rate),
    });
    return voice;
  }

  render(audible=true,pitchRatio=1) {
    let output=0;
    for (const voice of this.voices) {
      if (!Number.isFinite(voice.age) || voice.envelope<SILENCE) continue;
      if(!audible){
        if(voice.sample){voice.position+=voice.increment*pitchRatio;if(voice.position>=voice.sample.length-1){voice.age=Infinity;voice.envelope=0;voice.sample=null;continue;}}
        else{voice.phase+=voice.increment*pitchRatio;voice.phase-=Math.floor(voice.phase);}
        if(voice.age>=voice.gate)voice.releasing=true;voice.envelope*=voice.releasing?voice.releaseDecay:voice.decay;voice.age++;continue;
      }
      let value;
      if (voice.sample) {
        const index=voice.position|0;
        if (index>=voice.sample.length-1) {
          voice.age=Infinity; voice.envelope=0; voice.sample=null; continue;
        }
        const fraction=voice.position-index;
        value=voice.sample[index]+(voice.sample[index+1]-voice.sample[index])*fraction;
        // Even a recording with an imperfect trim reaches zero before EOF.
        const remaining=(voice.sample.length-1-voice.position)/(voice.increment*pitchRatio);
        if (remaining<64) value*=Math.max(0,remaining/64);
        voice.position+=voice.increment*pitchRatio;
      } else {
        value=readWave(BASS_WAVE,voice.phase);
        voice.phase+=voice.increment*pitchRatio;
        voice.phase-=Math.floor(voice.phase);
      }
      voice.filter+=voice.coefficient*(value-voice.filter);
      let tone=value*voice.dry+voice.filter*(1-voice.dry);
      if(voice.upright){voice.body+=voice.bodyCoefficient*(tone-voice.body);tone-=voice.body*.16;}
      const attack=Math.min(1,voice.age/voice.attackFrames);
      output+=tone*attack*voice.envelope*voice.gain;
      if (voice.age>=voice.gate) voice.releasing=true;
      voice.envelope*=voice.releasing?voice.releaseDecay:voice.decay;
      voice.age++;
    }
    // Only overlapping peaks reach this gentle knee; normal note dynamics and
    // sample attacks remain linear, with headroom for the rhythm bus.
    if (output>.8) return .8+(output-.8)/(1+(output-.8)*5);
    if (output<-.8) return -.8+(output+.8)/(1-(output+.8)*5);
    return output;
  }
}
