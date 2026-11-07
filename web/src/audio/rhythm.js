import {TAMA_DRUM_GROUPS,LIVE_DYNAMIC_GROUPS} from './tama-groups.js';
import {EXPANDED_DRUM_GROUPS,sourceFor} from './sound-library.js';
import {ensembleDrums,ensembleBass} from './ensemble-arrangements.js';
import {CYMBAL_TRIM_DB} from './mix-balance.js';
import {ADDITIONAL_STYLES,additionalDrumCell} from './additional-styles.js';
const additionalGrooves=Object.fromEntries(Object.entries(ADDITIONAL_STYLES).map(([id,s])=>[s.groove,id]));
import {latinDrumCell,SON_BELL} from './latin-grooves.js';
import {DRUM_KITS} from './instrumentation.js';
import {backingSubdivision,performanceTouch} from './groove-time.js';
import { SampledBass } from './bass.js';
import { DRUM_SAMPLE_GROUPS, JAZZ_DRUM_GROUPS, LIVE_DRUM_GROUPS, LATIN_DRUM_GROUPS } from './sample-map.js';

export const DRUM_GROOVES = {
  straight: 'Pop / rock', shuffle: 'Blues shuffle', swing: 'Jazz swing', halftime: 'Neo-soul half-time', bossa: 'Bossa nova',
  fusionRide:'Fusion jazz ride pocket', fusion: 'Funk / fusion sixteenths', neoSoul: 'Neo-soul pocket', motown: 'Motown drive', tumbao: 'Afro-Cuban son · 2–3 clave',
  modernJazz: 'Modern jazz comping', ballad: 'Ambient ballad',
};
export const BASS_PATTERNS = {
  blues:'Blues · shuffle figure',
  roots: 'Ambient · sustained roots', fifths: 'Pop / rock · root & fifth', walk: 'Jazz · walking chord tones',
  bossa: 'Bossa nova · syncopated fifths', funk: 'Funk · syncopated chord tones',
  fusion: 'Fusion · displaced sixteenths', neoSoul: 'Neo-soul · spacious pocket', modal: 'Modal · pedal syncopation',
  motown: 'Motown · melodic eighths', tumbao: 'Latin · anticipated tumbao', jazzOstinato: 'Modern jazz · asymmetric ostinato',
  ballad: 'Ballad · sparse counterline',
};
for(const [id,s] of Object.entries(ADDITIONAL_STYLES)){DRUM_GROOVES[s.groove]=s.name;BASS_PATTERNS[id]=s.name;}
// The first bar states the groove; the following bars answer it. Fills have
// their own space at the end of a phrase instead of accumulating extra hits.
// Offsets use sixteenths in a four-beat cell; other meters end at their barline.
const GROOVES = {
  straight: [
    [[0,'kick',.74],[8,'kick',.68],[4,'snare',.66],[12,'snare',.7]],
    [[0,'kick',.75],[6,'kick',.44],[8,'kick',.67],[4,'snare',.65],[12,'snare',.69]],
    [[0,'kick',.74],[8,'kick',.69],[10,'kick',.4],[4,'snare',.66],[12,'snare',.7]],
    [[0,'kick',.75],[8,'kick',.68],[14,'kick',.42],[4,'snare',.65],[12,'snare',.7],[11,'snare',.11]],
  ],
  shuffle: [
    [[0,'kick',.58],[4,'kick',.4],[8,'kick',.52],[12,'kick',.39],[4,'snare',.57],[12,'snare',.62],[3,'snare',.1]],
    [[0,'kick',.58],[4,'kick',.39],[8,'kick',.52],[12,'kick',.4],[4,'snare',.58],[12,'snare',.62],[11,'snare',.1]],
    [[0,'kick',.6],[4,'kick',.4],[8,'kick',.53],[12,'kick',.39],[4,'snare',.57],[12,'snare',.63],[7,'snare',.1]],
    [[0,'kick',.58],[4,'kick',.39],[8,'kick',.52],[12,'kick',.4],[4,'snare',.58],[12,'snare',.62]],
  ],
  fusionRide: [
    [[0,'kick',.66],[7,'kick',.44],[10,'kick',.54],[4,'snare',.59],[12,'snare',.64],[11,'snare',.11]],
    [[0,'kick',.66],[6,'kick',.43],[8,'kick',.54],[14,'kick',.37],[4,'snare',.58],[12,'snare',.64]],
    [[0,'kick',.67],[3,'kick',.36],[10,'kick',.53],[4,'snare',.59],[12,'snare',.63],[15,'snare',.1]],
    [[0,'kick',.66],[6,'kick',.42],[11,'kick',.47],[4,'snare',.58],[12,'snare',.64]],
  ],
  swing: [
    [[0,'kick',.35],[10,'kick',.22],[6,'snare',.22],[12,'snare',.28],[15,'snare',.1]],
    [[0,'kick',.3],[8,'kick',.2],[2,'snare',.14],[10,'snare',.2],[14,'snare',.16]],
    [[0,'kick',.32],[12,'kick',.2],[6,'snare',.2],[11,'snare',.11]],
    [[0,'kick',.3],[8,'kick',.19],[4,'snare',.16],[10,'snare',.22],[14,'snare',.14]],
  ],
  halftime: [
    [[0,'kick',.78],[3,'kick',.48],[10,'kick',.6],[14,'kick',.4],[7,'snare',.12],[11,'snare',.1]],
    [[0,'kick',.79],[6,'kick',.45],[11,'kick',.5],[15,'kick',.35],[3,'snare',.1],[13,'snare',.13]],
    [[0,'kick',.8],[3,'kick',.4],[10,'kick',.56],[12,'kick',.35],[7,'snare',.13]],
    [[0,'kick',.79],[6,'kick',.44],[10,'kick',.56],[3,'snare',.11],[11,'snare',.12]],
  ],
  fusion: [
    [[0,'kick',.78],[3,'kick',.4],[7,'kick',.5],[10,'kick',.62],[14,'kick',.44],[4,'snare',.63],[12,'snare',.69],[6,'snare',.1],[15,'snare',.12]],
    [[0,'kick',.79],[5,'kick',.43],[8,'kick',.66],[11,'kick',.47],[15,'kick',.36],[4,'snare',.64],[12,'snare',.7],[10,'snare',.11]],
    [[0,'kick',.8],[3,'kick',.38],[6,'kick',.48],[10,'kick',.64],[13,'kick',.4],[4,'snare',.64],[12,'snare',.69],[7,'snare',.11]],
    [[0,'kick',.79],[5,'kick',.44],[8,'kick',.65],[11,'kick',.46],[14,'kick',.42],[4,'snare',.64],[12,'snare',.71],[15,'snare',.14]],
  ],
  neoSoul: [
    [[0,'kick',.76],[3,'kick',.38],[7,'kick',.5],[10,'kick',.57],[12,'snare',.68],[6,'snare',.1],[15,'snare',.12]],
    [[0,'kick',.77],[5,'kick',.42],[8,'kick',.54],[11,'kick',.48],[12,'snare',.69],[3,'snare',.09],[14,'snare',.11]],
    [[0,'kick',.78],[3,'kick',.35],[8,'kick',.56],[10,'kick',.5],[15,'kick',.34],[12,'snare',.68],[7,'snare',.1]],
    [[0,'kick',.77],[6,'kick',.43],[9,'kick',.52],[11,'kick',.45],[12,'snare',.7],[3,'snare',.09],[15,'snare',.14]],
  ],
  motown: [
    [[0,'kick',.63],[4,'kick',.5],[8,'kick',.59],[12,'kick',.51],[4,'snare',.64],[12,'snare',.68]],
    [[0,'kick',.64],[4,'kick',.49],[8,'kick',.59],[12,'kick',.5],[14,'kick',.32],[4,'snare',.64],[12,'snare',.68]],
    [[0,'kick',.63],[4,'kick',.5],[8,'kick',.6],[12,'kick',.51],[4,'snare',.65],[12,'snare',.69],[11,'snare',.09]],
    [[0,'kick',.64],[4,'kick',.49],[8,'kick',.59],[12,'kick',.5],[4,'snare',.64],[12,'snare',.68]],
  ],
  modernJazz: [
    [[0,'kick',.27],[7,'kick',.2],[14,'kick',.24],[5,'snare',.16],[10,'snare',.23],[15,'snare',.12]],
    [[0,'kick',.25],[6,'kick',.19],[11,'kick',.23],[3,'snare',.13],[9,'snare',.21],[14,'snare',.17]],
    [[0,'kick',.27],[8,'kick',.2],[13,'kick',.22],[5,'snare',.15],[10,'snare',.22],[15,'snare',.13]],
    [[0,'kick',.25],[7,'kick',.2],[12,'kick',.23],[2,'snare',.12],[9,'snare',.2],[14,'snare',.18]],
  ],
  ballad: [
    [[0,'kick',.61],[8,'kick',.42],[12,'rim',.48],[7,'rim',.08]],
    [[0,'kick',.6],[10,'kick',.4],[12,'rim',.49],[15,'rim',.09]],
    [[0,'kick',.62],[8,'kick',.43],[12,'rim',.48],[6,'rim',.08]],
    [[0,'kick',.6],[10,'kick',.4],[12,'rim',.5],[14,'rim',.11]],
  ],
};
// [sixteenth, chord-tone index (-1 = fifth, -2 = seventh), octave,
//  duration in beats, velocity]. Bass cells answer the drums without copying
// their swing: steady ostinatos can be combined with any drum style.
const BASS_LINES = {
  blues:[
    [[0,0,0,.48,.85],[2,-1,0,.23,.62],[4,0,1,.48,.78],[6,-1,0,.23,.6],[8,0,0,.48,.83],[10,1,0,.23,.61],[12,-1,0,.48,.76],[14,-2,0,.23,.62]],
    [[0,0,0,.48,.84],[2,-1,0,.23,.62],[4,0,1,.48,.78],[6,-1,0,.23,.61],[8,0,0,.48,.82],[10,-1,0,.23,.63],[12,1,0,.48,.75],[14,-1,0,.23,.61]],
    [[0,0,0,.48,.86],[2,-1,0,.23,.63],[4,0,1,.48,.8],[6,-1,0,.23,.61],[8,0,0,.48,.83],[10,1,0,.23,.62],[12,-1,0,.48,.77],[14,-2,0,.23,.63]],
    [[0,0,0,.48,.85],[2,-1,0,.23,.62],[4,0,1,.48,.79],[6,-1,0,.23,.6],[8,0,0,.48,.83],[10,1,0,.23,.62],[12,-1,0,.35,.75],[14,0,0,.23,.65]],
  ],
  roots: [
    [[0,0,0,2.05,.9],[8,0,0,1.85,.76]],
    [[0,0,0,3.3,.87],[14,-1,0,.38,.49]],
    [[0,0,0,2.05,.9],[8,0,0,1.85,.75]],
    [[0,0,0,2.7,.87],[12,-1,0,.85,.56]],
  ],
  fifths: [
    [[0,0,0,1.65,.9],[8,-1,0,1.4,.76]],
    [[0,0,0,1.65,.9],[8,0,0,1.05,.8],[14,-1,0,.4,.64]],
    [[0,0,0,1.65,.91],[8,-1,0,1.4,.76]],
    [[0,0,0,1.65,.9],[8,0,1,1.05,.78],[14,-1,0,.4,.65]],
  ],
  walk: [
    [[0,0,0,.94,.88],[4,1,0,.91,.76],[8,2,0,.93,.81],[12,-2,0,.89,.73]],
    [[0,0,0,.94,.88],[4,-2,0,.91,.75],[8,-1,0,.93,.81],[12,1,0,.89,.73]],
    [[0,0,0,.94,.89],[4,1,0,.91,.76],[8,-2,0,.93,.8],[12,-1,0,.89,.74]],
    [[0,0,0,.94,.88],[4,-1,0,.91,.77],[8,1,0,.93,.8],[12,-2,0,.89,.74]],
  ],
  bossa: [
    [[0,0,0,1.4,.84],[6,-1,0,.42,.64],[8,0,0,1.4,.80],[14,-1,0,.42,.65]],
    [[0,0,0,1.4,.84],[6,-1,0,.42,.64],[8,0,0,1.4,.80],[14,-1,0,.42,.65]],
    [[0,0,0,1.4,.85],[6,-1,0,.42,.64],[8,0,0,1.4,.80],[14,-1,0,.42,.65]],
    [[0,0,0,1.4,.84],[6,-1,0,.42,.64],[8,0,0,1.4,.80],[14,-1,0,.42,.65]],
  ],
  funk: [
    [[0,0,0,.35,.96],[3,0,1,.2,.6],[6,-1,0,.3,.79],[9,0,0,.22,.68],[11,2,0,.2,.56],[14,0,1,.3,.82],[15,-1,0,.16,.5]],
    [[0,0,0,.4,.94],[3,0,1,.18,.52],[5,0,0,.12,.24],[6,-1,0,.3,.79],[10,-2,0,.28,.65],[12,0,0,.2,.75],[15,-1,0,.17,.54]],
    [[0,0,0,.35,.95],[3,0,1,.2,.58],[6,-1,0,.32,.78],[8,1,0,.25,.71],[11,-1,0,.22,.61],[14,0,1,.3,.8]],
    [[0,0,0,.4,.94],[3,0,1,.18,.55],[6,-1,0,.3,.8],[9,0,0,.2,.67],[11,-2,0,.22,.6],[13,0,0,.1,.22],[14,-1,0,.32,.74]],
  ],
  fusion: [
    [[0,0,0,.32,.96],[2,0,0,.16,.34],[5,-1,0,.26,.72],[7,1,0,.18,.56],[10,2,0,.3,.78],[13,0,1,.2,.68],[15,-2,0,.13,.48]],
    [[0,0,0,.35,.94],[3,0,1,.18,.58],[6,1,0,.24,.72],[8,0,0,.2,.63],[11,-1,0,.3,.8],[14,2,0,.24,.66]],
    [[0,0,0,.3,.95],[4,-2,0,.22,.64],[6,0,1,.18,.59],[9,-1,0,.3,.79],[12,1,0,.25,.7],[15,0,0,.14,.47]],
    [[0,0,0,.36,.96],[3,1,0,.2,.62],[5,-1,0,.22,.71],[8,0,1,.25,.78],[10,2,0,.18,.56],[13,-2,0,.24,.68],[15,-1,0,.14,.48]],
  ],
  neoSoul: [
    [[0,0,0,.78,.91],[7,1,0,.3,.61],[10,-2,0,.55,.74],[15,0,1,.18,.45]],
    [[0,0,0,.68,.89],[6,-1,0,.26,.58],[9,2,0,.42,.7],[13,1,0,.24,.54]],
    [[0,0,0,.85,.92],[5,0,1,.2,.47],[8,-2,0,.62,.75],[14,-1,0,.24,.55]],
    [[0,0,0,.72,.9],[7,2,0,.28,.6],[11,1,0,.42,.7],[15,-2,0,.16,.48]],
  ],
  modal: [
    [[0,0,0,.7,.92],[5,0,1,.25,.6],[8,-1,0,.52,.76],[11,0,0,.22,.48],[14,1,0,.28,.64]],
    [[0,0,0,.72,.91],[6,2,0,.3,.66],[10,0,1,.38,.73],[15,-2,0,.16,.45]],
    [[0,0,0,.68,.93],[3,0,0,.18,.38],[7,-1,0,.3,.66],[9,1,0,.4,.73],[14,0,1,.25,.61]],
    [[0,0,0,.74,.92],[5,2,0,.24,.59],[8,0,1,.46,.76],[13,-2,0,.26,.62],[15,-1,0,.15,.47]],
  ],
  motown: [
    [[0,0,0,.7,.9],[6,1,0,.4,.63],[8,2,0,.7,.78],[12,-2,0,.4,.66],[14,0,1,.4,.72]],
    [[0,0,0,.7,.9],[4,1,0,.4,.62],[6,2,0,.4,.68],[8,-1,0,.7,.76],[14,-2,0,.4,.66]],
    [[0,0,0,.7,.91],[6,-1,0,.4,.64],[8,1,0,.7,.77],[12,2,0,.4,.68],[14,0,1,.4,.72]],
    [[0,0,0,.7,.9],[4,1,0,.4,.62],[6,-1,0,.4,.68],[8,2,0,.7,.77],[12,1,0,.4,.64],[14,-2,0,.4,.68]],
  ],
  tumbao: [
    [[6,-1,0,1.15,.68],[12,0,0,2.35,.83]],
    [[6,-1,0,1.15,.67],[12,0,0,2.35,.82]],
    [[6,-1,0,1.15,.68],[12,0,0,2.35,.83]],
    [[6,-1,0,1.15,.67],[12,0,0,2.35,.82]],
  ],
  jazzOstinato: [
    [[0,0,0,.42,.9],[3,-2,0,.24,.59],[7,1,0,.36,.7],[10,-1,0,.28,.65],[13,2,0,.38,.74]],
    [[0,0,0,.4,.89],[4,1,0,.32,.66],[7,-2,0,.25,.59],[11,2,0,.36,.72],[14,-1,0,.3,.67]],
    [[0,0,0,.42,.91],[3,2,0,.22,.57],[6,-1,0,.34,.69],[10,1,0,.3,.67],[13,-2,0,.38,.73]],
    [[0,0,0,.4,.9],[4,-2,0,.3,.64],[8,1,0,.35,.71],[11,-1,0,.25,.61],[15,2,0,.16,.5]],
  ],
  ballad: [
    [[0,0,0,2.2,.86],[11,1,0,.65,.58]],
    [[0,0,0,1.65,.85],[8,-2,0,1.25,.66],[15,-1,0,.18,.42]],
    [[0,0,0,2.35,.87],[10,2,0,.8,.6]],
    [[0,0,0,1.8,.85],[9,1,0,.9,.64],[14,-2,0,.38,.51]],
  ],
};
const FILLS={
 blues:[[[6,'snare',.18]],[[4,'snare',.2],[7,'snare',.13]],[[3,'snare',.14],[6,'tomLow',.22]],[[6,'snare',.2],[7,'snare',.12]]],
 soul:[[[7,'snare',.17]],[[6,'snare',.2],[7,'snare',.12]],[[3,'snare',.12],[7,'snare',.21]],[[6,'tomLow',.22]]],
 rock:[[[4,'snare',.26],[6,'tomHigh',.29],[7,'tomLow',.34]],[[2,'snare',.2],[4,'tomHigh',.3],[6,'tomLow',.35]],[[4,'snare',.3],[5,'snare',.18],[7,'tomLow',.34]],[[0,'snare',.25],[3,'tomHigh',.27],[6,'tomLow',.33],[7,'snare',.2]]],
 jazz:[[[3,'snare',.13],[6,'snare',.21]],[[2,'snare',.17],[7,'snare',.14]],[[0,'tomHigh',.18],[6,'snare',.22]],[[3,'snare',.12],[5,'snare',.2],[7,'tomLow',.17]]],
 latin:[[[2,'rim',.2],[6,'tomHigh',.22]],[[3,'rim',.16],[7,'tomLow',.23]],[[0,'rim',.19],[6,'rim',.25]],[[2,'tomHigh',.19],[7,'rim',.24]]],
 soft:[[[6,'rim',.12]],[[7,'rim',.15]],[[4,'snare',.12]],[[6,'rim',.14]]]
};
const KITS = new Map();
// Close-miked hats carry much more sustained energy than the shell recordings.
// Balance them here so musical pattern velocities can stay readable as written.
const DRUM_BALANCE = {hat:.55,hatOpen:.58,hatPedal:.55};
function drumSamples(rate) {
  if (KITS.has(rate)) return KITS.get(rate);
  const kit = {};
  for (const [name, duration] of [['kick', .45], ['snare', .24], ['hat', .09], ['ride', .55],['tambourine',.2]]) {
    const samples = new Float32Array(Math.ceil(rate * duration));
    let seed = 27, low = 0, phase = 0, peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / rate;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      low += .3 * (noise - low);
      const high = noise - low;
      let value;
      if (name === 'kick') {
        phase += 2 * Math.PI * (46 + 100 * Math.exp(-t / .025)) / rate;
        value = Math.sin(phase) * Math.exp(-t / .105);
      } else if (name === 'snare') {
        value = .8 * high * Math.exp(-t / .055) + .25 * Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t / .04);
      } else {
        const decay = name === 'ride' ? .16 :name==='tambourine'?.07:.023;
        value = (.7 * high + .15 * Math.sin(2 * Math.PI * Math.min(4200, rate * .38) * t)) * Math.exp(-t / decay);
      }
      samples[i] = value * Math.min(1, t / .0015);
      peak = Math.max(peak, Math.abs(samples[i]));
    }
    for (let i = 0; i < samples.length; i++) samples[i] *= .85 / (peak || 1);
    kit[name] = samples;
  }
  kit.rim = kit.snare;
  KITS.set(rate, kit);
  return kit;
}

// All scheduling uses the metronome's sample clock. The browser installs decoded
// samples before playback; cached synthesis is the standalone/test fallback.
for(const [id,s] of Object.entries(ADDITIONAL_STYLES))BASS_LINES[id]=s.bass;
export class Rhythm {
  constructor(rate, kit = null) {
    this.rate = rate;
    this.kit = kit || drumSamples(rate);
    this.prepareGroups();
    this.lastGrid = -1;
    this.lastBassGrid = -1;
    this.drumCursor = 0;
    this.activeDrums = 0;
    this.bassCursor = 0;
    this.sampleCursors = Object.create(null);
    this.chokeDecay = Math.exp(-1 / (rate * .006));
    this.kitProfiles=Object.fromEntries(Object.entries(DRUM_KITS).map(([id,profile])=>[id,{...profile,cymbalGains:Object.fromEntries(Object.entries(CYMBAL_TRIM_DB[profile.bank]||CYMBAL_TRIM_DB.default).map(([name,db])=>[name,10**(db/20)])),decayFactor:profile.decay?Math.exp(-1/(rate*profile.decay)):1}]));
    this.drumVoices = Array.from({length:24}, () => ({sample:null, position:0, increment:1, gain:0, filter:0, tone:1, choke:1, choking:false, kind:''}));
    this.bassInstrument = new SampledBass(rate,kit);
    this.bassVoices = this.bassInstrument.voices;
    this.lastBassMidi = null;this.lastBassChord='';
    this.drums = 0;
    this.bass = 0;
  }
  installKit(kit,clear=true) {
    this.kit = kit || drumSamples(this.rate);
    this.prepareGroups();
    if(clear){this.clearDrums();this.sampleCursors=Object.create(null);}
    this.bassInstrument.installKit(kit,clear);
  }
  prepareGroups(){
    const available=groups=>Object.fromEntries(Object.entries(groups).map(([name,ids])=>[name,ids.filter(id=>this.kit[id]?.length)]));
    this.groups=available(DRUM_SAMPLE_GROUPS);this.jazzGroups=available(JAZZ_DRUM_GROUPS);this.liveGroups=available(LIVE_DRUM_GROUPS);this.latinGroups=available(LATIN_DRUM_GROUPS);this.expandedGroups=available(EXPANDED_DRUM_GROUPS);this.tamaGroups=available(TAMA_DRUM_GROUPS);this.liveDynamics=available(LIVE_DYNAMIC_GROUPS);this.expandedLiveGroups={...this.liveGroups,...this.liveDynamics,hatSoft:this.expandedGroups.hatSoft,rideSoft:this.expandedGroups.rideSoft};
  }
  gridAt(settings, beat, phase) {
    return beat*4+backingSubdivision(phase,settings.drumGroove,settings.bpm);
  }
  bassGridAt(beat,phase,groove='straight',bpm=120){return beat*4+backingSubdivision(phase,groove,bpm);}
  clearDrums() { for (const voice of this.drumVoices) voice.sample = null; this.activeDrums=0; }
  clearBass() { this.bassInstrument.clear();this.bassCursor=0;this.lastBassMidi=null;this.lastBassChord=''; }
  tick(settings, beat, phase, notes, sample, step, onEvent, nextNotes = notes,drumsAudible=true,bassAudible=true) {
    this.expandedSounds=sourceFor(settings,'drums')==='expanded';
    const grid = this.gridAt(settings, beat, phase);
    const bassGrid = this.bassGridAt(beat, phase,settings.drumGroove,settings.bpm);
    const inBar = beat % settings.beats;
    const bar = Math.floor(beat / settings.beats);
    if (grid !== this.lastGrid) {
      this.lastGrid = grid;
      if (settings.drums&&drumsAudible) this.playDrums(settings, grid % 4, inBar, bar, sample, step, onEvent);
    }
    if (bassGrid !== this.lastBassGrid) {
      this.lastBassGrid = bassGrid;
      if (settings.bass&&bassAudible) this.playBass(settings, bassGrid % 4, inBar, bar, notes, sample, step, onEvent,nextNotes);
    }
  }
  hitDrum(name,gain,sample,step,beat,sub,onEvent,kitName='rock',delayFrames=0) {
    const profile=this.kitProfiles[kitName]||this.kitProfiles.rock;
    const fallback = name==='flatRide'?'ride':name==='hatOpen'||name==='hatPedal'?'hat':name.startsWith('tom')?'snare':name;
    const jazz=profile.bank==='jazz'&&(this.jazzGroups.kick.length||this.jazzGroups.kickSoft.length);
    const live=profile.bank==='live'&&this.liveGroups.kick.length,tama=profile.bank==='tama'&&this.tamaGroups.kick.length,layered=jazz||live||tama;
    const groups=tama?this.tamaGroups:jazz?this.jazzGroups:live?this.liveGroups:this.groups,dynamic=this.expandedSounds||tama;
    const candidates=tama?groups:live&&dynamic?this.expandedLiveGroups:groups;
    let group=name;
    if(name==='snare')group=gain<(jazz?.17:.2)?'snareGhost':layered&&gain<.4?'snareSoft':'snare';
    if(layered&&name==='kick'&&gain<.4)group='kickSoft';
    if(jazz&&name==='ride'&&gain>=.29)group='rideAccent';
    if(dynamic){
      const alternative=name==='snare'&&gain>=.68?'snareAccent':name==='snare'&&gain>=.4&&gain<.56?'snareMid':name==='kick'&&gain<.23?'kickGhost':name==='kick'&&gain>.73?'kickAccent':name==='hat'&&gain<.17?'hatSoft':name==='hat'&&gain>.26?'hatAccent':name==='ride'&&gain<.18?'rideSoft':name==='ride'&&gain>=.29?'rideAccent':name==='rideBell'&&gain<.2?'rideBellSoft':name==='crash'&&gain<.22?'crashSoft':name==='tomHigh'&&gain<.24?'tomHighSoft':name==='tomLow'&&gain<.24?'tomLowSoft':null;
      if(alternative&&candidates[alternative]?.length)group=alternative;
    }
    const ids=this.latinGroups[name]||candidates[group]||groups[name]||this.groups[group]||this.groups[name]||[];
    const cursorKey=(this.latinGroups[name]?'latin:':tama?'tama:':jazz?'jazz:':live?'live:':'rock:')+group,cursor=this.sampleCursors[cursorKey]||0;
    const id=ids.length?ids[cursor%ids.length]:fallback;
    const pcm=this.kit[id];
    if(!pcm?.length)return;
    this.sampleCursors[cursorKey]=cursor+1;
    if(name==='hat'||name==='hatPedal')for(const voice of this.drumVoices)if(voice.kind==='hatOpen')voice.choking=true;
    const voice=this.drumVoices[this.drumCursor++%this.drumVoices.length];
    if(!voice.sample)this.activeDrums++;
    // Different recorded takes remove repeated-hit artifacts. Tiny, repeatable
    // tuning changes and softer ghost-note brightness add touch, without moving
    // any kick, backbeat or grid onset away from the shared sample clock.
    const tuning=[1,.997,1.003,.999][cursor%4];
    const tone=name==='kick'?.85:name==='snare'||name==='rim'?.48+.42*Math.min(1,gain/.7):.94;
    const balancedGain=gain*(DRUM_BALANCE[name]??1)*(profile.cymbalGains[name]??1);
    Object.assign(voice,{sample:pcm,position:0,increment:tuning,gain:balancedGain,filter:0,tone:Math.min(.98,tone*profile.brightness),envelope:1,decayFactor:profile.decayFactor,choke:1,choking:false,kind:name,delay:delayFrames});
    onEvent({type:name,sample:sample+delayFrames,gridSample:sample,delayFrames,step,beat,sub,gain,sampleId:id});
  }
  playDrums(settings, sub, beat, bar, sample, step, onEvent) {
    const added=ensembleDrums(settings,bar)||additionalDrumCell(additionalGrooves[settings.drumGroove],bar,settings.backingVariation>0,settings.backingTurnaround);
    if(added){const cell=beat*4+sub;for(const [offset,name,gain]of added)if(offset===cell){const touch=performanceTouch(settings,name,bar,cell,this.rate);this.hitDrum(name,Math.min(.85,gain*touch.velocity),sample,step,beat,sub,onEvent,settings.drumKit,touch.delayFrames);}return;}
    if(settings.drumGroove==='bossa'||settings.drumGroove==='tumbao'){
      this.playLatinDrums(settings,sub,beat,bar,sample,step,onEvent);return;
    }
    const groove=GROOVES[settings.drumGroove]?settings.drumGroove:'straight';
    const cell=(beat*4+sub)%16,varied=settings.backingVariation>0,chapter=Math.floor(bar/4),phrase=varied&&chapter%2?[0,2,1,3][bar%4]:bar%4;
    const lastBeat=beat===settings.beats-1;
    const phraseEnd=varied?(settings.backingTurnaround||bar%8===7||bar%8===3&&chapter%3!==2):bar%4===3;
    const fillBeats=varied&&phraseEnd&&(settings.backingTurnaround||bar%8===7)?Math.min(2,settings.beats):1;
    const filling=phraseEnd&&beat>=settings.beats-fillBeats,turn=phraseEnd&&lastBeat;
    const jazzRide=groove==='swing'||groove==='modernJazz';
    const latin=groove==='bossa'||groove==='tumbao';
    const hit=(name,gain)=>{
      const touch=performanceTouch(settings,name,bar,beat*4+sub,this.rate);
      this.hitDrum(name,Math.min(.85,gain*touch.velocity),sample,step,beat,sub,onEvent,settings.drumKit,touch.delayFrames);
    };
    if(this.kitProfiles[settings.drumKit]?.tambourine&&sub%2===0)hit('tambourine',sub===0?(beat%2?.22:.12):.085);
    for(const [offset,name,gain]of GROOVES[groove][phrase]){
      const mainBackbeat=name==='snare'&&gain>.5;
      if(offset===cell&&(!varied||!filling||name==='kick'||mainBackbeat)){
        if(varied&&gain<.2&&(bar+offset)%3===1)continue;
        hit(name,gain);
      }
    }
    // In odd meters, an extra partial cell still starts from the groove's root.
    if(groove==='halftime'&&beat===Math.floor(settings.beats/2)&&sub===0)hit('snare',.72);
    if(varied&&filling){
      const family=latin?'latin':jazzRide||groove==='fusionRide'?'jazz':groove==='shuffle'?'blues':groove==='motown'?'soul':groove==='ballad'?'soft':'rock';
      const answer=Math.floor(bar/4)%4,fillCell=(beat-settings.beats+2)*4+sub;
      for(const [position,name,gain]of FILLS[family][answer])if(position===fillCell&&!GROOVES[groove][phrase].some(([offset,kind,velocity])=>offset===cell&&kind===name&&velocity>.5))hit(name,gain);
      this.lastFillBar=bar;
    }
    if(!varied&&turn&&sub%2===1){
      if(latin)hit('rim',sub===1?.12:.21);
      else if(jazzRide)hit('snare',sub===1?.14:.2);
      else if(groove==='ballad')hit('rim',sub===1?.1:.16);
      else hit(sub===1?'tomHigh':'tomLow',sub===1?.29:.37);
    }
    // An eight-bar phrase has a slightly stronger final answer, then resolves
    // straight back to the downbeat. It stays quieter than the main backbeat.
    if(!varied&&bar%8===7&&lastBeat&&sub===2&&!latin&&!jazzRide&&groove!=='ballad')hit('snare',.24);
    if(bar>0&&(varied?this.lastFillBar===bar-1&&bar%8===0:bar%8===0)&&beat===0&&sub===0&&['straight','shuffle','halftime','fusion','motown'].includes(groove))hit('crash',.2);
    if(groove==='fusionRide'){
      if(sub%2===0&&(!filling||sub===0))hit(bar%4===2&&beat%2===1&&sub===0?'rideBell':'ride',sub===0?(beat%2?.25:.23):.13);
      if(sub===0&&beat%2===1)hit('hatPedal',.1);
    }else if(jazzRide){
      if(sub===0||sub===2&&beat%2===1&&(!varied||!filling)&&(!varied||bar%8!==5||beat!==1))hit(bar%8===6&&beat===2&&sub===0?'rideBell':varied&&bar%16>=8?'flatRide':'ride',sub===0?(beat%2?.31:.24):.16+(phrase===2?.025:0));
      if(sub===0&&beat%2===1)hit('hatPedal',.13);
    }else if(groove==='ballad'){
      if(sub===0)hit(varied?'flatRide':'ride',beat===0?.18:.11);
      if(sub===2&&beat===settings.beats-1&&bar%2===1)hit('hatPedal',.08);
    }else if(sub%2===0&&(!varied||!filling||sub===0)){
      const opening=lastBeat&&sub===2&&bar%2===1&&!latin&&!['shuffle','motown'].includes(groove)&&!turn;
      hit(opening?'hatOpen':'hat',sub===0?(beat%2?.22:.28):opening?.17:.15);
    }else if((!varied||!filling)&&groove==='halftime'&&(cell===5||cell===13||phrase===1&&cell===15))hit('hat',cell===5?.1:.075);
    else if((!varied||!filling)&&groove==='neoSoul'&&[3,7,11,15].includes(cell))hit('hat',cell===15?.09:.065);
    else if((!varied||!filling)&&groove==='fusion'&&[3,7,11,15].includes(cell))hit('hat',cell===7||cell===15?.1:.075);

  }
  playLatinDrums(settings,sub,beat,bar,sample,step,onEvent){
    const cell=(beat*4+sub)%16,son=settings.drumGroove==='tumbao',varied=settings.backingVariation>0;
    const hit=(name,gain)=>{
      const touch=performanceTouch(settings,name,bar,beat*4+sub,this.rate);
      this.hitDrum(name,gain*touch.velocity,sample,step,beat,sub,onEvent,settings.drumKit,name==='clave'?0:touch.delayFrames);
    };
    for(const [offset,name,gain]of latinDrumCell(settings.drumGroove,bar))if(offset===cell)hit(name,gain);
    if(son&&varied&&Math.floor(bar/8)%2===1)for(const [offset,name,gain]of SON_BELL)if(offset===cell)hit(name,gain);
    // A small hand-percussion pickup leaves the clave and open tones intact.
    // Bossa keeps its quiet ostinato instead of acquiring a rock/tom fill.
    if(son&&varied&&(settings.backingTurnaround||bar%8===7)&&beat===settings.beats-1&&sub===1)hit('congaMute',.13);
  }
  playBass(settings, sub, beat, bar, notes, sample, step, onEvent,nextNotes = notes) {
    if(!notes?.length)return;
    const pattern=BASS_LINES[settings.bassPattern]?settings.bassPattern:'roots';
    const cell=beat*4+sub;
    const bassBars=BASS_LINES[pattern],bassBar=additionalGrooves[settings.drumGroove]?(bar%bassBars.length):(settings.backingVariation>0&&Math.floor(bar/4)%2?[0,2,1,3][bar%4]:bar%4);
    const arranged=ensembleBass(settings,bar);
    let note=(arranged||bassBars[bassBar%bassBars.length]).find(event=>event[0]===cell);
    if(pattern==='tumbao'&&cell===0&&notes.join(',')!==this.lastBassChord)note=[cell,0,0,1.4,.76];
    if(pattern==='roots'&&bar%2===1&&beat===settings.beats-1&&sub===2)note=[cell,-1,0,.38,.48];
    if(!note)return;
    let [,index,octave,length,gain]=note;
    const root=notes[0]%12;
    const pcs=[...new Set(notes.map(midi=>midi%12))];
    const fifth=pcs.findIndex(pc=>[6,7,8].includes((pc-root+12)%12));
    const seventh=pcs.findIndex(pc=>[9,10,11].includes((pc-root+12)%12));
    if(index===-1)index=Math.max(0,fifth);
    else if(index===-2)index=seventh>=0?seventh:Math.max(0,fifth);
    index=((index%pcs.length)+pcs.length)%pcs.length;
    // State the current root at the start of every bar and first-beat pickup.
    if(beat===0)index=0;
    const rootMidi=28+(root-4+12)%12;
    const degree=(pcs[index]-root+12)%12;
    let midi=rootMidi+degree+octave*12;
    if(pattern==='walk'&&this.lastBassMidi!==null){
      const candidates=[midi-12,midi,midi+12].filter(value=>value>=28&&value<=55);
      candidates.sort((a,b)=>Math.abs(a-this.lastBassMidi)-Math.abs(b-this.lastBassMidi)||a-b);
      midi=candidates[0]??midi;
    }
    // At a phrase ending, approach the next root using a note from the current
    // chord. This makes actual changes connect without adding chromatic notes
    // that would conflict with the mode being practised.
    const nextRoot=nextNotes?.[0]%12;
    const approaching=!['bossa','tumbao'].includes(pattern)&&Number.isFinite(nextRoot)&&nextRoot!==root&&beat===settings.beats-1&&(pattern==='walk'||sub>=2);
    if(approaching){
      const target=28+(nextRoot-4+12)%12;
      const candidates=pcs.flatMap(pc=>[28+(pc-4+12)%12,40+(pc-4+12)%12]);
      candidates.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)||Math.abs(a-(this.lastBassMidi??rootMidi))-Math.abs(b-(this.lastBassMidi??rootMidi))||a-b);
      midi=candidates[0];
    }
    while(midi>59)midi-=12;
    this.lastBassMidi=midi;this.lastBassChord=notes.join(',');
    const touch=performanceTouch(settings,'bass',bar,beat*4+sub,this.rate);
    gain*=touch.velocity;length*=touch.length;
    const seconds=length*60/settings.bpm;
    this.bassInstrument.noteOn(midi,seconds,gain,pattern,settings.bassInstrument,sourceFor(settings,'bass'));
    this.bassCursor=this.bassInstrument.cursor;
    onEvent({type:'bass',sample,step,beat,sub,midi,root,offbeat:sub!==0,gain,approaching,durationBeats:length});
  }
  render(drumsActive, bassActive) {
    let drums=0;
    if(this.activeDrums)for(const voice of this.drumVoices){
      if(!voice.sample)continue;
      if(voice.delay>0){voice.delay--;continue;}
      if(!drumsActive){voice.position+=voice.increment;voice.envelope*=voice.decayFactor;if(voice.choking)voice.choke*=this.chokeDecay;if(voice.position>=voice.sample.length-1||voice.choke<.0001){voice.sample=null;this.activeDrums--;}continue;}
      const index=voice.position|0,fraction=voice.position-index;
      const raw=voice.sample[index]+((voice.sample[index+1]??0)-voice.sample[index])*fraction;
      voice.filter+=voice.tone*(raw-voice.filter);
      drums+=voice.filter*voice.gain*voice.choke*voice.envelope;
      voice.envelope*=voice.decayFactor;
      voice.position+=voice.increment;
      if(voice.choking)voice.choke*=this.chokeDecay;
      if(voice.position>=voice.sample.length-1||voice.choke<.0001){voice.sample=null;this.activeDrums--;}
    }
    this.drums=drumsActive?drums:0;
    // Muted voices still age, so restoring a mixer fader never replays a pile
    // of frozen attacks or an old bass note.
    const bass=this.bassInstrument.render(bassActive);
    this.bass=bassActive?bass:0;
  }
}
