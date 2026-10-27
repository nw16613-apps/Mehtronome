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

export function guitarVoicings(harmony, type = 'drop2', stringSet = STRING_SETS[type][0].id, allCandidates = false) {
  const indices = voicingTones(harmony);
  const root = harmony.midi[0] % 12;
  const pcs = [...new Set(indices.map(i => (harmony.midi[i] - root + 120) % 12))].sort((a,b) => a-b);
  const fifths = pcs.length === 2;
  const set = STRING_SETS[type].find(set => set.id === stringSet) || STRING_SETS[type][0];
  const strings = set.strings;
  const bassPcs = [...new Set(indices.map(i => harmony.chordPcs[i]))];
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
      const notes = pitches.map((midi,i) => {
        const chordIndex = harmony.chordPcs.indexOf(midi % 12);
        return {string:strings[i],fret:frets[i],midi,pc:midi%12,root:midi%12===root,
          chord:true,name:harmony.tones[chordIndex],scaleIndex:chordIndex};
      });
      const inversion = bassPcs.indexOf(notes[0].pc);
      candidates.push({start,end:Math.max(start+4,end),notes,rootPc:root,
        inversion,inversionName:INVERSION_NAMES[inversion],wide:end-start>4,
        bass:notes[0].name,bassInterval:harmony.intervals[notes[0].scaleIndex],
        strings:strings.map(i=>6-i),type:fifths?'spread':type,
        score:start+(end-start)*2});
    }
  }
  candidates.sort((a,b)=>a.score-b.score || a.start-b.start);
  const selected = bassPcs.map((_, inversion) => candidates.find(board => board.inversion === inversion)).filter(Boolean);
  return {voicings:allCandidates?candidates:selected,indices,stringSet:set.id,omitted:harmony.tones.filter((_,i)=>!indices.includes(i)),
    doubled:pcs.length<4,fifths};
}

export function voicingSvg(board, intervals, degrees, title) {
  const muted = TUNING.map((_,string)=>string).filter(string=>!board.notes.some(note=>note.string===string));
  const markers = muted.map(string=>`<g class="muted-string" data-string="${string}"><title>Mute string ${6-string}</title><circle cx="54" cy="${30+(5-string)*28}" r="9"/><text x="54" y="${34+(5-string)*28}" text-anchor="middle">×</text></g>`).join('');
  return diagramSvg(board,degrees,intervals,title).replace('</svg>',markers+'</svg>');
}
