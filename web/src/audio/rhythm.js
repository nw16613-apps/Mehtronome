import { SampledBass } from './bass.js';
import { DRUM_SAMPLE_GROUPS } from './sample-map.js';

export const DRUM_GROOVES = {
  straight: 'Pop / rock', shuffle: 'Blues shuffle', swing: 'Jazz swing', halftime: 'Neo-soul half-time', bossa: 'Bossa nova',
};
export const BASS_PATTERNS = {
  roots: 'Ambient · sustained roots', fifths: 'Pop / rock · root & fifth', walk: 'Jazz · walking chord tones',
  bossa: 'Bossa nova · syncopated fifths', funk: 'Funk · syncopated chord tones',
};
// The first bar states the groove; the following bars answer it. Fills have
// their own space at the end of a phrase instead of accumulating extra hits.
// Offsets use sixteenths in a four-beat cell; other meters end at their barline.
const GROOVES = {
  straight: [
    [[0,'kick',.8],[6,'kick',.58],[8,'kick',.72],[11,'kick',.48],[4,'snare',.65],[12,'snare',.7],[7,'snare',.12],[15,'snare',.1]],
    [[0,'kick',.8],[6,'kick',.54],[8,'kick',.74],[14,'kick',.48],[4,'snare',.66],[12,'snare',.72],[11,'snare',.12]],
    [[0,'kick',.82],[3,'kick',.43],[8,'kick',.72],[10,'kick',.48],[4,'snare',.66],[12,'snare',.7],[7,'snare',.13]],
    [[0,'kick',.8],[6,'kick',.56],[8,'kick',.72],[4,'snare',.67],[12,'snare',.7],[11,'snare',.11]],
  ],
  shuffle: [
    [[0,'kick',.75],[8,'kick',.65],[10,'kick',.45],[4,'snare',.62],[12,'snare',.68],[3,'snare',.12],[11,'snare',.1]],
    [[0,'kick',.76],[6,'kick',.38],[8,'kick',.66],[4,'snare',.63],[12,'snare',.67],[7,'snare',.13]],
    [[0,'kick',.76],[8,'kick',.65],[14,'kick',.42],[4,'snare',.63],[12,'snare',.7],[3,'snare',.11],[11,'snare',.12]],
    [[0,'kick',.76],[8,'kick',.65],[10,'kick',.4],[4,'snare',.63],[12,'snare',.67],[7,'snare',.13]],
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
  bossa: [
    [[0,'kick',.55],[6,'kick',.4],[8,'kick',.5],[14,'kick',.38],[0,'rim',.52],[6,'rim',.62],[12,'rim',.55]],
    [[0,'kick',.54],[6,'kick',.38],[8,'kick',.5],[14,'kick',.36],[2,'rim',.48],[8,'rim',.56],[14,'rim',.5]],
    [[0,'kick',.56],[6,'kick',.4],[8,'kick',.5],[14,'kick',.37],[0,'rim',.52],[6,'rim',.59],[12,'rim',.54],[15,'rim',.1]],
    [[0,'kick',.54],[6,'kick',.39],[8,'kick',.5],[14,'kick',.35],[2,'rim',.49],[8,'rim',.56],[14,'rim',.5]],
  ],
};
// [sixteenth, chord-tone index (-1 = fifth, -2 = seventh), octave,
//  duration in beats, velocity]. Bass cells answer the drums without copying
// their swing: steady ostinatos can be combined with any drum style.
const BASS_LINES = {
  roots: [
    [[0,0,0,2.05,.9],[8,0,0,1.85,.76]],
    [[0,0,0,3.3,.87],[14,-1,0,.38,.49]],
    [[0,0,0,2.05,.9],[8,0,0,1.85,.75]],
    [[0,0,0,2.7,.87],[12,-1,0,.85,.56]],
  ],
  fifths: [
    [[0,0,0,.85,.94],[6,-1,0,.4,.74],[8,0,1,.6,.82],[11,-1,0,.25,.55],[14,-1,0,.4,.76]],
    [[0,0,0,.85,.94],[3,0,0,.2,.39],[6,-1,0,.38,.7],[8,0,1,.7,.81],[12,1,0,.4,.68],[14,-1,0,.35,.72]],
    [[0,0,0,.85,.94],[6,-1,0,.4,.71],[8,0,0,.65,.84],[10,1,0,.35,.66],[14,-1,0,.4,.75]],
    [[0,0,0,.85,.95],[6,-1,0,.4,.71],[8,0,1,.55,.82],[11,-2,0,.3,.61],[14,-1,0,.4,.73]],
  ],
  walk: [
    [[0,0,0,.94,.88],[4,1,0,.91,.76],[8,2,0,.93,.81],[12,-2,0,.89,.73]],
    [[0,0,0,.94,.88],[4,-2,0,.91,.75],[8,-1,0,.93,.81],[12,1,0,.89,.73]],
    [[0,0,0,.94,.89],[4,1,0,.91,.76],[8,-2,0,.93,.8],[12,-1,0,.89,.74]],
    [[0,0,0,.94,.88],[4,-1,0,.91,.77],[8,1,0,.93,.8],[12,-2,0,.89,.74]],
  ],
  bossa: [
    [[0,0,0,1.1,.88],[6,-1,0,.4,.68],[8,0,0,1,.81],[14,-1,0,.4,.69]],
    [[0,0,0,1.1,.87],[6,-1,0,.38,.66],[8,1,0,.95,.74],[14,-1,0,.4,.68]],
    [[0,0,0,1.1,.89],[6,-1,0,.4,.68],[8,0,0,1,.81],[14,-1,0,.4,.69]],
    [[0,0,0,1.1,.87],[6,-1,0,.38,.66],[8,0,1,.9,.76],[14,1,0,.4,.65]],
  ],
  funk: [
    [[0,0,0,.35,.96],[3,0,1,.2,.6],[6,-1,0,.3,.79],[9,0,0,.22,.68],[11,2,0,.2,.56],[14,0,1,.3,.82],[15,-1,0,.16,.5]],
    [[0,0,0,.4,.94],[3,0,1,.18,.52],[5,0,0,.12,.24],[6,-1,0,.3,.79],[10,-2,0,.28,.65],[12,0,0,.2,.75],[15,-1,0,.17,.54]],
    [[0,0,0,.35,.95],[3,0,1,.2,.58],[6,-1,0,.32,.78],[8,1,0,.25,.71],[11,-1,0,.22,.61],[14,0,1,.3,.8]],
    [[0,0,0,.4,.94],[3,0,1,.18,.55],[6,-1,0,.3,.8],[9,0,0,.2,.67],[11,-2,0,.22,.6],[13,0,0,.1,.22],[14,-1,0,.32,.74]],
  ],
};
const KITS = new Map();
function drumSamples(rate) {
  if (KITS.has(rate)) return KITS.get(rate);
  const kit = {};
  for (const [name, duration] of [['kick', .45], ['snare', .24], ['hat', .09], ['ride', .55]]) {
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
        const decay = name === 'ride' ? .16 : .023;
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
export class Rhythm {
  constructor(rate, kit = null) {
    this.rate = rate;
    this.kit = kit || drumSamples(rate);
    this.lastGrid = -1;
    this.lastBassGrid = -1;
    this.drumCursor = 0;
    this.activeDrums = 0;
    this.bassCursor = 0;
    this.sampleCursors = Object.create(null);
    this.chokeDecay = Math.exp(-1 / (rate * .006));
    this.drumVoices = Array.from({length:24}, () => ({sample:null, position:0, increment:1, gain:0, filter:0, tone:1, choke:1, choking:false, kind:''}));
    this.bassInstrument = new SampledBass(rate,kit);
    this.bassVoices = this.bassInstrument.voices;
    this.lastBassMidi = null;
    this.drums = 0;
    this.bass = 0;
  }
  installKit(kit) {
    this.kit = kit || drumSamples(this.rate);
    this.clearDrums();
    this.sampleCursors = Object.create(null);
    this.bassInstrument.installKit(kit);
  }
  gridAt(settings, beat, phase) {
    const shuffled = settings.drumGroove === 'shuffle' || settings.drumGroove === 'swing';
    const sub = shuffled ? (phase >= 5/6 ? 3 : phase >= 2/3 ? 2 : phase >= 1/3 ? 1 : 0) : Math.min(3, Math.floor(phase * 4));
    return beat * 4 + sub;
  }
  bassGridAt(beat, phase) { return beat * 4 + Math.min(3, Math.floor(phase * 4)); }
  clearDrums() { for (const voice of this.drumVoices) voice.sample = null; this.activeDrums=0; }
  clearBass() { this.bassInstrument.clear();this.bassCursor=0;this.lastBassMidi=null; }
  tick(settings, beat, phase, notes, sample, step, onEvent, nextNotes = notes) {
    const grid = this.gridAt(settings, beat, phase);
    const bassGrid = this.bassGridAt(beat, phase);
    const inBar = beat % settings.beats;
    const bar = Math.floor(beat / settings.beats);
    if (grid !== this.lastGrid) {
      this.lastGrid = grid;
      if (settings.drums) this.playDrums(settings, grid % 4, inBar, bar, sample, step, onEvent);
    }
    if (bassGrid !== this.lastBassGrid) {
      this.lastBassGrid = bassGrid;
      if (settings.bass) this.playBass(settings, bassGrid % 4, inBar, bar, notes, sample, step, onEvent,nextNotes);
    }
  }
  hitDrum(name,gain,sample,step,beat,sub,onEvent) {
    const fallback = name==='hatOpen'||name==='hatPedal'?'hat':name.startsWith('tom')?'snare':name;
    const group=name==='snare'&&gain<.25&&DRUM_SAMPLE_GROUPS.snareGhost?.some(id=>this.kit[id]?.length)?'snareGhost':name;
    const ids=(DRUM_SAMPLE_GROUPS[group]||[name]).filter(id=>this.kit[id]?.length);
    const cursor=this.sampleCursors[group]||0;
    const id=ids.length?ids[cursor%ids.length]:fallback;
    const pcm=this.kit[id];
    if(!pcm?.length)return;
    this.sampleCursors[group]=cursor+1;
    if(name==='hat'||name==='hatPedal')for(const voice of this.drumVoices)if(voice.kind==='hatOpen')voice.choking=true;
    const voice=this.drumVoices[this.drumCursor++%this.drumVoices.length];
    if(!voice.sample)this.activeDrums++;
    // Different recorded takes remove repeated-hit artifacts. Tiny, repeatable
    // tuning changes and softer ghost-note brightness add touch, without moving
    // any kick, backbeat or grid onset away from the shared sample clock.
    const tuning=[1,.997,1.003,.999][cursor%4];
    const tone=name==='kick'?.85:name==='snare'||name==='rim'?.48+.42*Math.min(1,gain/.7):.94;
    Object.assign(voice,{sample:pcm,position:0,increment:tuning,gain,filter:0,tone,choke:1,choking:false,kind:name});
    onEvent({type:name,sample,step,beat,sub,gain,sampleId:id});
  }
  playDrums(settings, sub, beat, bar, sample, step, onEvent) {
    const groove=GROOVES[settings.drumGroove]?settings.drumGroove:'straight';
    const cell=(beat*4+sub)%16,phrase=bar%4;
    const lastBeat=beat===settings.beats-1;
    const turn=bar%4===3&&lastBeat;
    const hit=(name,gain)=>this.hitDrum(name,gain,sample,step,beat,sub,onEvent);
    for(const [offset,name,gain]of GROOVES[groove][phrase]){
      if(offset===cell)hit(name,gain);
    }
    // In odd meters, an extra partial cell still starts from the groove's root.
    if(groove==='halftime'&&beat===Math.floor(settings.beats/2)&&sub===0)hit('snare',.72);
    if(turn&&sub%2===1){
      if(groove==='bossa')hit('rim',sub===1?.12:.21);
      else if(groove==='swing')hit('snare',sub===1?.14:.2);
      else hit(sub===1?'tomHigh':'tomLow',sub===1?.29:.37);
    }
    // An eight-bar phrase has a slightly stronger final answer, then resolves
    // straight back to the downbeat. It stays quieter than the main backbeat.
    if(bar%8===7&&lastBeat&&sub===2&&groove!=='bossa'&&groove!=='swing')hit('snare',.24);
    if(bar>0&&bar%8===0&&beat===0&&sub===0&&['straight','shuffle','halftime'].includes(groove))hit('crash',.2);
    if(groove==='swing'){
      if(sub===0||sub===2&&beat%2===1)hit(bar%8===6&&beat===2&&sub===0?'rideBell':'ride',sub===0?(beat%2?.31:.24):.16+(phrase===2?.025:0));
      if(sub===0&&beat%2===1)hit('hatPedal',.13);
    }else if(sub%2===0){
      const opening=lastBeat&&sub===2&&bar%2===1&&groove!=='bossa'&&groove!=='shuffle'&&!turn;
      hit(opening?'hatOpen':'hat',sub===0?(beat%2?.22:.28):opening?.17:.15);
    }else if(groove==='halftime'&&(cell===5||cell===13||phrase===1&&cell===15)){
      hit('hat',cell===5?.1:.075);
    }
  }
  playBass(settings, sub, beat, bar, notes, sample, step, onEvent,nextNotes = notes) {
    if(!notes?.length)return;
    const pattern=BASS_LINES[settings.bassPattern]?settings.bassPattern:'roots';
    const cell=(beat*4+sub)%16;
    let note=BASS_LINES[pattern][bar%4].find(event=>event[0]===cell);
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
    const approaching=Number.isFinite(nextRoot)&&nextRoot!==root&&beat===settings.beats-1&&(pattern==='walk'||sub>=2);
    if(approaching){
      const target=28+(nextRoot-4+12)%12;
      const candidates=pcs.flatMap(pc=>[28+(pc-4+12)%12,40+(pc-4+12)%12]);
      candidates.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)||Math.abs(a-(this.lastBassMidi??rootMidi))-Math.abs(b-(this.lastBassMidi??rootMidi))||a-b);
      midi=candidates[0];
    }
    while(midi>59)midi-=12;
    this.lastBassMidi=midi;
    const seconds=length*60/settings.bpm;
    this.bassInstrument.noteOn(midi,seconds,gain,pattern);
    this.bassCursor=this.bassInstrument.cursor;
    onEvent({type:'bass',sample,step,beat,sub,midi,root,offbeat:sub!==0,gain,approaching,durationBeats:length});
  }
  render(drumsActive, bassActive) {
    let drums=0;
    if(this.activeDrums)for(const voice of this.drumVoices){
      if(!voice.sample)continue;
      const index=voice.position|0,fraction=voice.position-index;
      const raw=voice.sample[index]+((voice.sample[index+1]??0)-voice.sample[index])*fraction;
      voice.filter+=voice.tone*(raw-voice.filter);
      drums+=voice.filter*voice.gain*voice.choke;
      voice.position+=voice.increment;
      if(voice.choking)voice.choke*=this.chokeDecay;
      if(voice.position>=voice.sample.length-1||voice.choke<.0001){voice.sample=null;this.activeDrums--;}
    }
    this.drums=drumsActive?drums:0;
    // Muted voices still age, so restoring a mixer fader never replays a pile
    // of frozen attacks or an old bass note.
    const bass=this.bassInstrument.render();
    this.bass=bassActive?bass:0;
  }
}
