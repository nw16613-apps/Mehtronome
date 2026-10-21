import { TUNING, diagramSvg } from './fretboard.js';

export const DROP_TYPES = {drop2:{name:'Drop 2',voices:[2]},drop3:{name:'Drop 3',voices:[3]},drop24:{name:'Drop 2 & 4',voices:[2,4]},drop4:{name:'Drop 4',voices:[4]}};
export const STRING_SETS = {
  drop2: [
    {id:'4321',strings:[2,3,4,5],label:'4–3–2–1 · D–G–B–E'},
    {id:'5432',strings:[1,2,3,4],label:'5–4–3–2 · A–D–G–B'},
    {id:'6543',strings:[0,1,2,3],label:'6–5–4–3 · E–A–D–G'},
  ],
  drop24: [
    {id:'5421',strings:[1,2,4,5],label:'5–4–2–1 · A–D–B–E'},
    {id:'6532',strings:[0,1,3,4],label:'6–5–3–2 · E–A–G–B'},
  ],
  drop4: [{id:'6321',strings:[0,3,4,5],label:'6–3–2–1 · E–G–B–E'}],
  drop3: [
    {id:'5321',strings:[1,3,4,5],label:'5–3–2–1 · A–G–B–E'},
    {id:'6432',strings:[0,2,3,4],label:'6–4–3–2 · E–D–G–B'},
  ],
};
const INVERSION_NAMES = ['Root position','1st inversion','2nd inversion','3rd inversion'];

// Four voices retain the root, the quality-defining third/suspension and seventh
// (or sixth), plus an altered fifth when present or the highest available colour. Every reduction is disclosed.
export function voicingTones(harmony) {
  const intervals = harmony.midi.map(note => note - harmony.midi[0]);
  if (intervals.length <= 4) return intervals.map((_, index) => index);
  const third = intervals.findIndex(i => [3,4,5,2].includes(i));
  const seventh = intervals.findIndex(i => [10,11].includes(i));
  const sixth = intervals.findIndex(i => i === 9);
  const alteredFifth = intervals.findIndex(i => i === 6 || i === 8);
  return [...new Set([0, third, seventh >= 0 ? seventh : sixth, alteredFifth >= 0 ? alteredFifth : intervals.length - 1])]
    .filter(i => i >= 0).sort((a,b) => a-b);
}

function closedPositions(pcs) {
  if (pcs.length === 3) {
    // Four-part triads double one tone an octave above itself, never a unison.
    return pcs.map((_, inversion) => {
      const notes = pcs.slice(inversion).concat(pcs.slice(0,inversion).map(pc => pc+12));
      return [...notes, notes[0]+12];
    });
  }
  return pcs.map((_, inversion) => pcs.slice(inversion).concat(pcs.slice(0,inversion).map(pc => pc+12)));
}

/**
 * Compare physical voices on their current strings before matching voices that
 * change string sets. Distances are semitones, with small position-change costs.
 * A shared pitch class is not necessarily a held note: `notes.common` requires
 * the same sounding pitch on the same string.
 */
export function voiceLeadingFor(previous, next) {
  if (!previous?.notes?.length || !next?.notes?.length) return {distance:0,commonPcs:[],stringChanges:0,notes:[]};
  const before=[...previous.notes],after=[...next.notes];
  const commonPcs=[...new Set(after.map(note=>note.pc??((note.midi%12+12)%12)))].filter(pc=>before.some(note=>(note.pc??((note.midi%12+12)%12))===pc));
  const movements=[];
  let distance=0,stringChanges=0;
  const add=(from,to)=>{
    const changed=!!from&&!!to&&from.string!==to.string;
    const delta=from&&to?to.midi-from.midi:null;
    distance+=delta===null?12:Math.abs(delta)+(changed?3:0);
    if(changed||!from||!to)stringChanges++;
    movements.push({string:to?.string??from.string,from:from?.midi??null,to:to?.midi??null,
      delta,common:delta===0&&!changed,fromString:from?.string??null,stringChanged:changed});
  };
  for(let index=after.length-1;index>=0;index--){
    const match=before.findIndex(note=>note.string===after[index].string);
    if(match>=0){add(before[match],after[index]);before.splice(match,1);after.splice(index,1);}
  }
  // Up to four remaining voices make exhaustive matching small and deterministic.
  // This also chooses sensibly when a shell gains an extension or loses a root.
  let bestCost=Infinity,best=[];
  const match=(index,remaining,pairs,cost)=>{
    if(index===after.length){
      const total=cost+remaining.length*12;
      if(total<bestCost){bestCost=total;best=[...pairs,...remaining.map(note=>[note,null])];}
      return;
    }
    if(remaining.length){
      for(let old=0;old<remaining.length;old++)match(index+1,remaining.filter((_,i)=>i!==old),[...pairs,[remaining[old],after[index]]],cost+Math.abs(remaining[old].midi-after[index].midi)+3);
    }
    // A genuinely new voice can be preferable to moving an unrelated old one.
    match(index+1,remaining,[...pairs,[null,after[index]]],cost+12);
  };
  match(0,before,[],0);
  for(const [from,to] of best)add(from,to);
  movements.sort((a,b)=>a.string-b.string);
  return {distance,commonPcs,stringChanges,notes:movements};
}

export function voiceLeadingDistance(previous, next) {
  return voiceLeadingFor(previous,next).distance;
}

export function guitarVoicings(harmony, type = 'drop2', stringSet = STRING_SETS[type][0].id, options = {}) {
  const indices = voicingTones(harmony);
  const root = harmony.midi[0] % 12;
  const pcs = [...new Set(indices.map(i => (harmony.midi[i] - root + 120) % 12))].sort((a,b) => a-b);
  const fifths = pcs.length === 2;
  const set = STRING_SETS[type].find(set => set.id === stringSet) || STRING_SETS[type][0];
  const strings = set.strings;
  const bassPcs = [...new Set(indices.map(i => harmony.chordPcs[i]))];
  const range=options.fretRange;
  const invalidRange=range!=null&&(!Number.isFinite(range.start)||!Number.isFinite(range.end)||range.start<1||range.end>24||range.start>range.end);
  const hasTop=options.topPc!==null&&options.topPc!==undefined;
  const invalidTop=hasTop&&(!Number.isInteger(options.topPc)||options.topPc<0||options.topPc>11);
  const candidates = [];
  for (const close of fifths ? [[0,7,12,19],[7,12,19,24]] : closedPositions(pcs)) {
    const dropped = [...close];
    if (!fifths) for(const voice of DROP_TYPES[type].voices) dropped[dropped.length-voice]-=12;
    dropped.sort((a,b) => a-b);
    for (let octave = 2; octave <= 7; octave++) {
      const pitches = dropped.map(note => root + octave * 12 + note);
      const frets = pitches.map((midi,i) => midi - TUNING[strings[i]]);
      const start = Math.min(...frets), end = Math.max(...frets);
      if (start < 1 || end > 24) continue;
      if(invalidRange||invalidTop)continue;
      if(hasTop&&pitches[pitches.length-1]%12!==options.topPc)continue;
      const lower=range?Math.max(0,range.start-start):0,upper=range?Math.max(0,end-range.end):0;
      const shiftFrets=Math.max(lower,upper),regionDistance=lower+upper;
      if(range&&shiftFrets>2)continue;
      const notes = pitches.map((midi,i) => {
        const chordIndex = harmony.chordPcs.indexOf(midi % 12);
        return {string:strings[i],fret:frets[i],midi,pc:midi%12,root:midi%12===root,
          chord:true,name:harmony.tones[chordIndex],scaleIndex:chordIndex};
      });
      const inversion = bassPcs.indexOf(notes[0].pc);
      const board={id:`${type}:${set.id}:${notes.map(note=>`${note.string}-${note.fret}`).join('.')}`,
        start,end:Math.max(start+4,end),minFret:start,maxFret:end,notes,rootPc:root,
        inversion,inversionName:INVERSION_NAMES[inversion],wide:end-start>4,
        bass:notes[0].name,bassInterval:harmony.intervals[notes[0].scaleIndex],
        topPc:notes.at(-1).pc,topName:notes.at(-1).name,topInterval:harmony.intervals[notes.at(-1).scaleIndex],
        strings:strings.map(i=>6-i),type:fifths?'spread':type,
        contained:!range||regionDistance===0,shiftFrets,regionDistance,
        score:start+(end-start)*2};
      board.voiceLeading=voiceLeadingFor(options.previous,board);
      candidates.push(board);
    }
  }
  const compare=(a,b)=>(range?(a.regionDistance>0)-(b.regionDistance>0)||a.shiftFrets-b.shiftFrets||a.regionDistance-b.regionDistance:0)
    ||(options.previous?a.voiceLeading.distance-b.voiceLeading.distance:0)
    ||(range?Math.abs((a.minFret+a.maxFret-range.start-range.end)/2)-Math.abs((b.minFret+b.maxFret-range.start-range.end)/2):0)
    ||a.score-b.score||a.start-b.start;
  candidates.sort(compare);
  const selected = bassPcs.map((_, inversion) => candidates.find(board => board.inversion === inversion)).filter(Boolean);
  const recommended=options.previous?[...selected].sort(compare)[0]:null;
  const reason=invalidRange?'Choose a fret range between 1 and 24.':invalidTop?'Choose a valid top note.':!selected.length
    ?'No voicing matches this string set, top note and fret range. Try another string set or widen the range.':'';
  return {voicings:selected,indices,stringSet:set.id,omitted:harmony.tones.filter((_,i)=>!indices.includes(i)),
    doubled:pcs.length<4,fifths,reason,recommendedId:recommended?.id??null};
}

export function voicingSvg(board, intervals, degrees, title) {
  const muted = TUNING.map((_,string)=>string).filter(string=>!board.notes.some(note=>note.string===string));
  const markers = muted.map(string=>`<g class="muted-string" data-string="${string}"><title>Mute string ${6-string}</title><circle cx="54" cy="${30+(5-string)*28}" r="9"/><text x="54" y="${34+(5-string)*28}" text-anchor="middle">×</text></g>`).join('');
  return diagramSvg(board,degrees,intervals,title).replace('</svg>',markers+'</svg>');
}
