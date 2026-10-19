import { TUNING, diagramSvg } from './fretboard.js';

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

export function guitarVoicings(harmony, type = 'drop2') {
  const indices = voicingTones(harmony);
  const root = harmony.midi[0] % 12;
  const pcs = [...new Set(indices.map(i => (harmony.midi[i] - root + 120) % 12))].sort((a,b) => a-b);
  const fifths = pcs.length === 2;
  const sets = type === 'drop3' ? [[0,2,3,4],[1,3,4,5]] : [[0,1,2,3],[1,2,3,4],[2,3,4,5]];
  const candidates = [];
  for (const close of fifths ? [[0,7,12,19]] : closedPositions(pcs)) {
    const dropped = [...close];
    if (!fifths) dropped[dropped.length - (type === 'drop3' ? 3 : 2)] -= 12;
    dropped.sort((a,b) => a-b);
    for (let octave = 2; octave <= 6; octave++) for (const strings of sets) {
      const pitches = dropped.map(note => root + octave * 12 + note);
      const frets = pitches.map((midi,i) => midi - TUNING[strings[i]]);
      const start = Math.min(...frets), end = Math.max(...frets);
      if (start < 1 || end > 17 || end-start > 4) continue;
      const notes = pitches.map((midi,i) => {
        const chordIndex = harmony.chordPcs.indexOf(midi % 12);
        return {string:strings[i],fret:frets[i],midi,pc:midi%12,root:midi%12===root,
          chord:true,name:harmony.tones[chordIndex],scaleIndex:chordIndex};
      });
      candidates.push({start,end:start+4,notes,rootPc:root,
        bass:notes[0].name,bassInterval:harmony.intervals[notes[0].scaleIndex],
        strings:strings.map(i=>6-i),type:fifths?'spread':type,
        score:start+(end-start)*2});
    }
  }
  candidates.sort((a,b)=>a.score-b.score || a.start-b.start);
  const selected = [];
  // Prefer different inversions, then fill remaining slots with other string sets.
  for (const candidate of candidates) {
    if (!selected.some(v=>v.bassInterval===candidate.bassInterval)) selected.push(candidate);
    if (selected.length === 4) break;
  }
  for (const candidate of candidates) {
    if (selected.length === 4) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }
  return {voicings:selected,indices,omitted:harmony.tones.filter((_,i)=>!indices.includes(i)),
    doubled:pcs.length<4,fifths};
}

export function voicingSvg(board, intervals, degrees, title) {
  const muted = TUNING.map((_,string)=>string).filter(string=>!board.notes.some(note=>note.string===string));
  const markers = muted.map(string=>`<g class="muted-string" data-string="${string}"><title>Mute string ${6-string}</title><circle cx="54" cy="${30+(5-string)*28}" r="9"/><text x="54" y="${34+(5-string)*28}" text-anchor="middle">×</text></g>`).join('');
  return diagramSvg(board,degrees,intervals,title).replace('</svg>',markers+'</svg>');
}
