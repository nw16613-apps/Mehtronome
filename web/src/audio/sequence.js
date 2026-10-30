import { SEQUENCE_WAVE, SINE, readWave } from './waves.js';

export const SEQUENCE_SOURCES = {
  chord:{name:'Chord tones',help:'Uses the notes in the sounding chord, including its extensions.'},
  mode:{name:'Current mode',help:'Uses all seven notes of the current mode.'},
  pentatonic:{name:'Modal pentatonic',help:'Uses the mode-specific pentatonic shown in Guitar reference, retaining its tonic and defining colour notes.'},
  guide:{name:'Guide tones',help:'Concentrates on the third and seventh of the harmony.'},
};

export const SEQUENCE_ROLES={
  modalHook:{name:'Modal hook',help:'Repeats a compact motif built around the modal tonic and characteristic colour note.'},
  chordResponse:{name:'Chord response',help:'Answers the harmony with chord tones and resolves toward the next change.'},
  counterline:{name:'Counterline',help:'Moves through the mode in a narrow, singable register.'},
  guideLine:{name:'Guide-tone line',help:'Connects thirds and sevenths through the progression.'},
  ambientPulse:{name:'Ambient pulse',help:'Uses a restrained tonic-and-colour ostinato with plenty of space.'},
  pattern:{name:'Pattern library',help:'Uses the selected note source and pattern exactly as shown below.'},
};
export const SEQUENCE_DEVELOPMENTS={stable:'Stable',subtle:'Subtle variation',evolving:'Evolving'};
export const SEQUENCE_INTERACTIONS={independent:'Independent',answerDrums:'Answer the drums',lockBass:'Lock with the bass'};

export const SEQUENCE_PATTERNS = {
  sparse:{name:'Sparse melody',category:'Musical phrases',help:'A few widely spaced notes with room to breathe.'},
  wander:{name:'Wandering line',category:'Musical phrases',help:'A repeatable, gently varied line with occasional rests and softer answers.'},
  motif:{name:'Motif & answer',category:'Musical phrases',help:'A short rising idea, a breath, then a softer answer.'},
  motifSequence:{name:'Sequenced motif',category:'Musical phrases',help:'Repeats one compact motif from successively higher starting notes.'},
  syncopated:{name:'Syncopated answers',category:'Musical phrases',help:'Places short answers around the beat, with a clear breath at the cadence.'},
  voiceLead:{name:'Lead into next chord',category:'Musical phrases',help:'Shapes a compact phrase and targets the nearest note of the next chord.'},
  pulse:{name:'Root pulse',category:'Arpeggios',help:'A steady repeated root.'},
  up:{name:'Ascending arpeggio',category:'Arpeggios',help:'Climb through the available notes.'},
  down:{name:'Descending arpeggio',category:'Arpeggios',help:'Descend through the available notes.'},
  updown:{name:'Up & down arpeggio',category:'Arpeggios',help:'Rise and fall without repeating the end notes.'},
  rootColours:{name:'Root & colours',category:'Arpeggios',help:'Alternate the root with the other available notes.'},
  alberti:{name:'Alberti figure',category:'Arpeggios',help:'Low–high–middle–high: a flowing accompaniment figure.'},
  skips:{name:'Skipping arpeggio',category:'Arpeggios',help:'Leap ahead, then step back through pairs of notes.'},
  cascade:{name:'Descending cascade',category:'Arpeggios',help:'Four-note descending phrases, starting one note lower each time.'},
  formula1235:{name:'1–2–3–5 cells',category:'Formula patterns',help:'Moves a 1–2–3–5 cell through the selected note source.'},
  formula1324:{name:'1–3–2–4 cells',category:'Formula patterns',help:'A digital 1–3–2–4 pattern with a more angular contour.'},
  groups3:{name:'Groups of 3',category:'Formula patterns',help:'Overlapping three-note cells rise through the note source.'},
  groups4:{name:'Groups of 4',category:'Formula patterns',help:'Overlapping four-note cells rise through the note source.'},
  thirds:{name:'Diatonic thirds',category:'Formula patterns',help:'Alternates each note with the note a third above.'},
  upper3579:{name:'3–5–7–9 colours',category:'Formula patterns',help:'Starts above the root to bring out upper chord colours.'},
  spread1537:{name:'1–5–3–7 spread',category:'Formula patterns',help:'A wide, modern arpeggio contour.'},
  chord1357:{name:'1–3–5–7 cells',category:'Formula patterns',help:'Stacks alternating notes into clear seventh-chord cells.'},
  offbeat:{name:'Offbeat answers',category:'Rhythmic patterns',help:'Leaves the start of each beat open, then answers.'},
  tresillo:{name:'3–3–2 ostinato',category:'Rhythmic patterns',help:'Three accents spaced 3–3–2 subdivision steps apart.'},
  clave:{name:'3–2 clave melody',category:'Rhythmic patterns',help:'A five-note, 16-step phrase with a 3–2 son-clave rhythm.'},
  displaced3:{name:'Displaced 3-note cell',category:'Rhythmic patterns',help:'Repeats a three-note idea across the beat line.'},
  charleston:{name:'Charleston figure',category:'Rhythmic patterns',help:'A strong beat followed by a syncopated answer.'},
  tripletPhrase:{name:'Triplet phrase',category:'Rhythmic patterns',help:'A lilting three-note idea with a breath between answers; pair it with triplet timing.'},
};

const mod=(value,length)=>((value%length)+length)%length;

export function sequenceStep(pattern, grid, length, rate) {
  if (!length) return null;
  let index=grid%length,velocity=grid%4===0?1:.82,semitones=0;
  const cycle=Math.max(1,length*2-2);
  if(pattern==='sparse' && ![0,3,6].includes(grid%8))return null;
  if(pattern==='pulse')index=0;
  else if(pattern==='down')index=length-1-grid%length;
  else if(pattern==='updown')index=Math.min(grid%cycle,cycle-grid%cycle);
  else if(pattern==='rootColours')index=grid%2 ? 1+Math.floor(grid/2)%Math.max(1,length-1) : 0;
  else if(pattern==='alberti')index=[0,length-1,Math.min(1,length-1),length-1][grid%4];
  else if(pattern==='skips')index=(Math.floor(grid/2)+(grid%2 ? 2 : 0))%length;
  else if(pattern==='cascade')index=mod(length-1-Math.floor(grid/4)-grid%4,length);
  else if(pattern==='formula1235')index=Math.floor(grid/4)+[0,1,2,4][grid%4];
  else if(pattern==='formula1324')index=Math.floor(grid/4)+[0,2,1,3][grid%4];
  else if(pattern==='groups3')index=Math.floor(grid/3)+grid%3;
  else if(pattern==='groups4')index=Math.floor(grid/4)+grid%4;
  else if(pattern==='thirds')index=Math.floor(grid/2)+(grid%2?2:0);
  else if(pattern==='upper3579')index=[1,2,3,4][grid%4];
  else if(pattern==='spread1537')index=[0,4,2,6][grid%4];
  else if(pattern==='chord1357')index=Math.floor(grid/4)+[0,2,4,6][grid%4];
  else if(pattern==='motif'){
    const cell=[0,1,2,1,null,2,1,0];index=cell[grid%8];
    if(index===null)return null;if(grid%8>4)velocity=.68;
  } else if(pattern==='syncopated'){
    const cell=[null,0,1,null,2,null,1,null];index=cell[grid%8];
    if(index===null)return null;velocity=grid%8===1?1:.72;
  } else if(pattern==='motifSequence'){
    const cell=[0,1,2,1];index=Math.floor(grid/4)+cell[grid%4];velocity=grid%4===0?1:.72;
  } else if(pattern==='voiceLead'){
    const cell=[0,2,1,null,2,3,1,0];index=cell[grid%8];
    if(index===null)return null;
  } else if(pattern==='displaced3'){
    if(grid%8===7)return null;index=grid%3;velocity=grid%3===0?1:.72;
  } else if(pattern==='charleston'){
    const hit=[0,3].indexOf(grid%8);if(hit<0)return null;index=Math.floor(grid/8)+hit;velocity=hit===0?1:.72;
  } else if(pattern==='tripletPhrase'){
    const cell=[0,1,2,null,2,1];index=cell[grid%6];if(index===null)return null;velocity=grid%6===0?1:.72;
  } else if(pattern==='offbeat'){
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
    index=((hash>>>8)%length);velocity=.6+(hash%31)/100;
  }
  return {index:mod(index,length),velocity,semitones};
}

export function musicalSequenceStep(settings,grid,length){
  if(!length)return null;
  const rate=Math.max(1,Number(settings.sequenceRate)||2),beats=Math.max(1,settings.beats||4),barGrid=rate*beats;
  const phraseBars=[2,4,8].includes(Number(settings.sequencePhraseBars))?Number(settings.sequencePhraseBars):4;
  const phraseBar=Math.floor(grid/barGrid)%phraseBars,local=grid%barGrid;
  const activity=Math.max(0,Math.min(1,Number(settings.sequenceDensity)||0));
  if(activity===0)return null;
  const midpoint=Math.floor(phraseBars/2),last=phraseBars-1;
  const barOrder=[0,last,midpoint,...Array.from({length:phraseBars},(_,index)=>index).filter(index=>index!==0&&index!==last&&index!==midpoint)];
  if(!barOrder.slice(0,Math.max(1,Math.ceil(activity*phraseBars))).includes(phraseBar))return null;
  const scaled=fractions=>[...new Set(fractions.map(value=>Math.min(barGrid-1,Math.round(value*(barGrid-1)))))];
  const interaction=settings.sequenceInteraction||'independent';
  let positions=interaction==='answerDrums'?scaled([.16,.43,.7,.94]):interaction==='lockBass'?scaled([0,.38,.58,.9]):scaled([0,.29,.48,.76]);
  if(settings.sequenceRole==='ambientPulse')positions=scaled([0,.58]);
  positions=positions.slice(0,Math.min(positions.length,Math.max(2,Math.round(2+activity*2))));
  const hit=positions.indexOf(local);if(hit<0)return null;
  const contours={modalHook:[0,1,2,1],chordResponse:[0,2,1,3],counterline:[0,1,2,3],guideLine:[0,1,0,1],ambientPulse:[0,1]};
  const contour=contours[settings.sequenceRole]||contours.modalHook;
  let index=contour[hit%contour.length],semitones=0;
  const development=settings.sequenceDevelopment||'subtle',lastBar=phraseBar===phraseBars-1,lastHit=hit===positions.length-1;
  if(development==='subtle'&&lastBar&&lastHit)index=0;
  if(development==='evolving'){
    index+=phraseBar%Math.max(1,Math.min(length,3));
    if(phraseBar===midpoint&&hit===Math.floor(positions.length/2))semitones=12;
    if(lastBar&&lastHit){index=0;semitones=0;}
  }
  return {index:mod(index,length),velocity:hit===0?.9:.62+(hit%2)*.1,semitones,
    target:hit===0?'chord':lastBar&&lastHit?'next':null,phraseBar,local};
}

function nearest(reference, notes) {
  let result=notes[0];
  for(const note of notes)for(const candidate of [note-12,note,note+12])if(Math.abs(candidate-reference)<Math.abs(result-reference))result=candidate;
  return result;
}

export class Sequence {
  constructor(rate) {
    this.rate=rate;this.decay=Math.exp(-1/(rate*.14));this.attackFrames=Math.max(1,Math.round(rate*.008));this.maxAge=Math.round(rate*.8);this.reset();
  }
  reset() {
    this.lastGrid=-1;this.cursor=0;this.lastMidi=60;
    this.voices=Array.from({length:8},()=>({phase:0,frequency:0,age:Infinity,pan:0,envelope:0,increment:0,table:SEQUENCE_WAVE}));
  }
  gridAt(settings, beat, phase) {
    const rate=Number(settings.sequenceRate)||2;let offset=0;
    for(let i=1;i<rate;i++){
      const swing=rate===3?0:(i%2 ? settings.sequenceSwing*.5 : 0);
      if(phase >= (i+swing)/rate) offset=i;
    }
    return beat*rate+offset;
  }
  tick(settings, beat, phase, notes, sample, step, onNote, nextNotes=notes,context=null) {
    const grid=this.gridAt(settings,beat,phase);
    if(grid===this.lastGrid) return;
    this.lastGrid=grid;
    const musical=settings.sequenceRole&&settings.sequenceRole!=='pattern';
    const roleNotes=musical?(context?.[settings.sequenceRole]||notes):notes;
    const density=Math.max(0,Math.min(1,settings.sequenceDensity));
    if(!musical&&(grid*37+17)%100 >= density*100)return;
    const note=musical?musicalSequenceStep(settings,grid,roleNotes.length):sequenceStep(settings.sequencePattern,grid,notes.length,Number(settings.sequenceRate)||2);
    if(!note)return;
    const register=Number(settings.sequenceRegister);
    const offset=Number.isFinite(register)?register:12;
    let midi=roleNotes[note.index]+offset+note.semitones;
    const rate=Number(settings.sequenceRate)||2;
    const leads=!musical && settings.sequencePattern==='voiceLead' && settings.progression && beat%settings.beats===settings.beats-1 && grid%rate===rate-1;
    if(leads&&nextNotes.length)midi=nearest(this.lastMidi,nextNotes.map(value=>value+(Number.isFinite(register)?register:12)));
    if(musical&&note.target==='chord'&&context?.chordResponse?.length)midi=nearest(midi,context.chordResponse.map(value=>value+offset));
    if(musical&&note.target==='next'&&context?.nextChord?.length)midi=nearest(this.lastMidi,context.nextChord.map(value=>value+offset));
    this.lastMidi=midi;
    const voice=this.voices[this.cursor++%this.voices.length];
    const frequency=440*2**((midi-69)/12);
    Object.assign(voice,{phase:0,frequency,increment:frequency/this.rate,age:0,envelope:note.velocity,pan:grid%2?.35:-.35,table:frequency*3<this.rate*.45?SEQUENCE_WAVE:SINE});
    onNote({sample,grid,midi,step,role:settings.sequenceRole,phraseBar:note.phraseBar});
  }
  render(audible=true) {
    let left=0,right=0;
    for(const voice of this.voices){
      if(voice.age>this.maxAge) continue;
      const envelope=Math.min(1,voice.age/this.attackFrames)*voice.envelope;
      const signal=audible?readWave(voice.table,voice.phase)*envelope:0;
      left+=signal*(1-voice.pan);right+=signal*(1+voice.pan);
      voice.phase+=voice.increment;if(voice.phase>=1) voice.phase-=1;
      voice.envelope*=this.decay;voice.age++;
    }
    this.left=left;this.right=right;
  }
}
