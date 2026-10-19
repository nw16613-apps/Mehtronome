// Standard guitar tuning, low E to high e, in MIDI pitches.
export const TUNING = [40,45,50,55,59,64];
export const SHAPES = {
  C: { tonic: 0, rootString: 1, rootOffset: 3, leadIn: 0 },
  A: { tonic: 9, rootString: 1, rootOffset: 0, leadIn: 0 },
  G: { tonic: 7, rootString: 0, rootOffset: 3, leadIn: 0 },
  E: { tonic: 4, rootString: 0, rootOffset: 0, leadIn: 1 },
  D: { tonic: 2, rootString: 2, rootOffset: 0, leadIn: 1 },
};
const CHROMATIC_DEGREES = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
export function positionFor(rootPc, shape) {
  const definition = SHAPES[shape];
  const transposition = (rootPc - definition.tonic + 12) % 12;
  const start = Math.max(0, transposition - definition.leadIn);
  return { shape, start, end: start + 4, rootString: definition.rootString, rootFret: transposition + definition.rootOffset };
}
export function fretboardFor(harmony, shape = 'C', chordOnly = false) {
  const rootPc = harmony.midi[0] % 12;
  const position = positionFor(rootPc, shape);
  const notes = [];
  for (let string = 0; string < TUNING.length; string++) {
    for (let fret = position.start; fret <= position.end; fret++) {
      const midi = TUNING[string] + fret;
      const pc = midi % 12;
      const scaleIndex = harmony.scalePcs.indexOf(pc);
      const chordIndex = harmony.chordPcs.indexOf(pc);
      if (chordOnly ? chordIndex < 0 : scaleIndex < 0 && chordIndex < 0) continue;
      notes.push({ string, fret, midi, pc, root: pc === rootPc, chord: chordIndex >= 0, scale: scaleIndex >= 0,
        name: chordIndex >= 0 ? harmony.tones[chordIndex] : harmony.scaleNames[scaleIndex],
        scaleIndex, chromaticDegree: CHROMATIC_DEGREES[(pc - harmony.scalePcs[0] + 12) % 12] });
    }
  }
  return { ...position, rootPc, notes };
}
function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function diagramSvg(board, degrees, modeDegrees, title) {
  const x = string => 60 + string * 48;
  const y = fret => 75 + (fret - board.start) * 50;
  const nut = board.start === 0 ? 100 : 50;
  let svg = `<svg class="fretboard" viewBox="0 0 360 330" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title>`;
  for (let fret = board.start; fret <= board.end; fret++) {
    svg += `<text class="fret-number" x="26" y="${y(fret)+4}" text-anchor="middle">${fret === 0 ? 'open' : fret}</text>`;
  }
  for (let row = board.start === 0 ? 1 : 0; row <= 5; row++) {
    const boundary = 50 + row * 50;
    svg += `<line class="fret-wire ${boundary === nut && board.start === 0 ? 'nut' : ''}" x1="60" x2="300" y1="${boundary}" y2="${boundary}"/>`;
  }
  TUNING.forEach((_, string) => {
    svg += `<line class="guitar-string" style="stroke-width:${2.2-string*.25}" x1="${x(string)}" x2="${x(string)}" y1="${nut}" y2="300"/><text class="string-name" x="${x(string)}" y="24" text-anchor="middle">${['E','A','D','G','B','e'][string]}</text>`;
  });
  for (const note of board.notes) {
    const label = degrees ? note.scaleIndex >= 0 ? modeDegrees[note.scaleIndex] : note.chromaticDegree : note.name;
    const kind = note.root ? 'root' : note.chord ? 'chord' : 'scale';
    svg += `<g class="fret-note ${kind}" data-string="${note.string}" data-fret="${note.fret}" data-pc="${note.pc}"><title>${escape(`${note.name}, string ${6-note.string}, ${note.fret === 0 ? 'open' : `fret ${note.fret}`}${note.root ? ', chord root' : note.chord ? ', chord tone' : ', scale tone'}`)}</title><circle cx="${x(note.string)}" cy="${y(note.fret)}" r="15"/><text x="${x(note.string)}" y="${y(note.fret)+4}" text-anchor="middle">${escape(label)}</text></g>`;
  }
  return svg + '</svg>';
}
