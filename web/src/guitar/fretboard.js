import { characteristicNotes } from '../audio/music.js';
// Standard guitar tuning, low E to high E, in MIDI pitches.
export const TUNING = [40,45,50,55,59,64];
export const SHAPES = {
  C: { tonic: 0, rootString: 1, rootOffset: 3, leadIn: 0 },
  A: { tonic: 9, rootString: 1, rootOffset: 0, leadIn: 1 },
  G: { tonic: 7, rootString: 0, rootOffset: 3, leadIn: 1 },
  E: { tonic: 4, rootString: 0, rootOffset: 0, leadIn: 1 },
  D: { tonic: 2, rootString: 2, rootOffset: 0, leadIn: 1 },
};
// Position numbering follows the CAGED sequence starting from the E form.
export const POSITIONS = [
  { numeral: 'I', shape: 'E' }, { numeral: 'II', shape: 'D' },
  { numeral: 'III', shape: 'C' }, { numeral: 'IV', shape: 'A' },
  { numeral: 'V', shape: 'G' },
];
const CHROMATIC_DEGREES = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
export function positionFor(rootPc, shape, intervals = [0,2,4,5,7,9,11]) {
  const definition = SHAPES[shape];
  const [,second,third,,,sixth,seventh] = intervals;
  // Boundaries follow degrees rather than fixed frets: a flattened seventh
  // moves to the next string just as the natural seventh does in Ionian.
  const windows = shape === 'A'
    ? [[0,seventh-8],[seventh-12,third-1],[third-5,sixth-6],[sixth-10,second+1],[0,4],[0,4]]
    : shape === 'G'
      ? [[-3,1],[-3,1],[-3,seventh-11],[seventh-15,third-4],[-3,1],[-3,1]]
      : null;
  let rootFret = (rootPc - definition.tonic + 12) % 12 + definition.rootOffset;
  let start = windows ? rootFret + Math.min(...windows.map(window=>window[0])) : rootFret - definition.rootOffset - definition.leadIn;
  // Move the whole fingering up an octave if any string would use open frets.
  if (start < 1) { rootFret += 12; start += 12; }
  const end = windows ? rootFret + Math.max(...windows.map(window=>window[1])) : start + 4;
  return {shape,start,end,rootString:definition.rootString,rootFret,windows};
}
export function fretboardFor(harmony, shape = 'C', chordOnly = false) {
  const rootPc = harmony.midi[0] % 12;
  const intervals = harmony.scalePcs.map(pc=>(pc-rootPc+12)%12).sort((a,b)=>a-b);
  const position = positionFor(rootPc, shape, intervals);
  const notes = [];
  const colourPcs = characteristicNotes(harmony).map(note => note.pc);
  for (let string = 0; string < TUNING.length; string++) {
    const window = position.windows?.[string];
    const from = window ? position.rootFret + window[0] : position.start;
    const to = window ? position.rootFret + window[1] : position.end;
    for (let fret = from; fret <= to; fret++) {
      const midi = TUNING[string] + fret;
      const pc = midi % 12;
      const scaleIndex = harmony.scalePcs.indexOf(pc);
      const chordIndex = harmony.chordPcs.indexOf(pc);
      if (chordOnly ? chordIndex < 0 : scaleIndex < 0 && chordIndex < 0) continue;
      notes.push({ string, fret, midi, pc, root: pc === rootPc, chord: chordIndex >= 0, scale: scaleIndex >= 0,
        name: chordIndex >= 0 ? harmony.tones[chordIndex] : harmony.scaleNames[scaleIndex],
        characteristic: colourPcs.includes(pc), scaleIndex, chromaticDegree: CHROMATIC_DEGREES[(pc - harmony.scalePcs[0] + 12) % 12] });
    }
  }
  return { ...position, rootPc, notes };
}
function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function diagramSvg(board, degrees, modeDegrees, title, highlight = false) {
  const columns = board.end - board.start + 1;
  const spacing = 400 / columns;
  const x = fret => 40 + spacing / 2 + (fret - board.start) * spacing;
  const y = string => 30 + (5 - string) * 28;
  const nut = board.start === 0 ? 120 : 40;
  let svg = `<svg class="fretboard" viewBox="0 0 480 218" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title>`;
  for (let fret = board.start; fret <= board.end; fret++) {
    svg += `<text class="fret-number" x="${x(fret)}" y="205" text-anchor="middle">${fret === 0 ? 'open' : fret}</text>`;
  }
  for (let column = board.start === 0 ? 1 : 0; column <= columns; column++) {
    const boundary = 40 + column * spacing;
    svg += `<line class="fret-wire ${boundary === nut && board.start === 0 ? 'nut' : ''}" x1="${boundary}" x2="${boundary}" y1="30" y2="170"/>`;
  }
  TUNING.forEach((_, string) => {
    svg += `<line class="guitar-string" style="stroke-width:${2.2-string*.25}" x1="${nut}" x2="440" y1="${y(string)}" y2="${y(string)}"/><text class="string-name" x="15" y="${y(string)+4}" text-anchor="middle">${['E','A','D','G','B','E'][string]}</text>`;
  });
  for (const note of board.notes) {
    const label = degrees ? note.scaleIndex >= 0 ? modeDegrees[note.scaleIndex] : note.chromaticDegree : note.name;
    const colour = highlight && note.characteristic;
    const kind = note.root ? 'root' : note.chord ? 'chord' : 'scale';
    svg += `<g class="fret-note ${kind}${highlight && note.characteristic ? ' characteristic' : ''}" data-string="${note.string}" data-fret="${note.fret}" data-pc="${note.pc}"><title>${escape(`${note.name}, string ${6-note.string}, ${note.fret === 0 ? 'open' : `fret ${note.fret}`}${note.root ? ', chord root' : note.chord ? ', chord tone' : ', scale tone'}${colour ? ', characteristic mode note' : ''}`)}</title><circle cx="${x(note.fret)}" cy="${y(note.string)}" r="13"/>${colour ? `<circle class="characteristic-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="17"/>` : ''}<text x="${x(note.fret)}" y="${y(note.string)+4}" text-anchor="middle">${escape(label)}</text></g>`;
  }
  return svg + '</svg>';
}
