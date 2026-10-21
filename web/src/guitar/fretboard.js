import { characteristicNotes, MODES } from '../audio/music.js';
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
const ROOT_STRING_SHAPES = {E:[0,2,5],D:[2,4],C:[1,4],A:[1,3],G:[0,3,5]};
export function cagedPositionFor(board) {
  const strings=[...new Set(board.notes.filter(note=>note.root).map(note=>note.string))];
  const matches=Object.entries(ROOT_STRING_SHAPES).filter(([,roots])=>roots.every(string=>strings.includes(string)));
  const shape=(matches.sort((a,b)=>(strings.length-a[1].length)-(strings.length-b[1].length))[0]?.[0]) || board.shape;
  return POSITIONS.find(position=>position.shape===shape);
}
const CHROMATIC_DEGREES = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const MODE_ROTATIONS = {
  major:0,dorian:1,phrygian:2,lydian:3,mixolydian:4,minor:5,locrian:6,
  melodic_minor:0,dorian_b2:1,lydian_augmented:2,lydian_dominant:3,mixolydian_b6:4,locrian_natural2:5,altered:6,
  harmonic_minor:0,locrian_natural6:1,ionian_sharp5:2,dorian_sharp4:3,phrygian_dominant:4,lydian_sharp2:5,ultralocrian:6,
};
export function parentMajorFor(harmony) {
  const rotation = MODE_ROTATIONS[harmony.mode];
  if (rotation === undefined) return null;
  const index = (7 - rotation) % 7;
  const family=MODES[harmony.mode]?.family || 'Major scale';
  return {pc:harmony.scalePcs[index],name:harmony.scaleNames[index],family};
}
export function positionFor(rootPc, shape, intervals = [0,2,4,5,7,9,11], family = 'Major scale') {
  const definition = SHAPES[shape];
  const [,second,third,,,sixth,seventh] = intervals;
  const melodicMinor = family === 'Melodic minor';
  // Boundaries follow degrees rather than fixed frets: a flattened seventh
  // moves to the next string just as the natural seventh does in Ionian.
  const windows = shape === 'A'
    ? [[0,seventh-8],[seventh-12,melodicMinor?third:third-1],[melodicMinor?Math.max(third-5,-1):third-5,sixth-6],[sixth-10,second+1],[0,4],[0,4]]
    : shape === 'G'
      ? [[-3,1],[-3,1],[-3,seventh-11],[seventh-15,melodicMinor?Math.max(third-4,0):third-4],[-3,1],[-3,1]]
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
  // Related major-scale modes share the parent's exact fingering. Chord roots,
  // interval labels and colour notes still refer to the selected modal harmony.
  const parentMajor = parentMajorFor(harmony);
  const anchorPc = parentMajor ? parentMajor.pc : rootPc;
  const anchorName = parentMajor ? parentMajor.name : harmony.name;
  const intervals = harmony.scalePcs.map(pc=>(pc-anchorPc+12)%12).sort((a,b)=>a-b);
  const position = positionFor(anchorPc, shape, intervals, parentMajor?.family);
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
  return { ...position, rootPc, anchorPc, anchorName, parentMajor, notes };
}
function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
/**
 * @param {{notes:Array<{string:number,fret:number,finger:number}>,muted:number[]} | null} [grip]
 * @param {{kind:'pentatonic'|'triads',name:string,pcs:number[],groups?:Array<{name:string,pcs:number[]}>} | null} [theory]
 */
export function diagramSvg(board, degrees, modeDegrees, title, highlight = false, grip = null, theory = null) {
  const columns = board.end - board.start + 1;
  const spacing = 400 / columns;
  const x = fret => 40 + spacing / 2 + (fret - board.start) * spacing;
  const y = string => 30 + (5 - string) * 28;
  const nut = board.start === 0 ? 120 : 40;
  // Theory is a pitch-class overlay on the established fingering, never a new
  // position. Give it its own layer so finger badges and modal rings do not
  // obscure the pentatonic or triad-pair markers.
  const shownGrip = theory ? null : grip;
  const shownTitle = theory ? `${title}, ${theory.kind === 'pentatonic' ? 'pentatonic' : 'triad-pair'} overlay: ${theory.name}` : title;
  let svg = `<svg class="fretboard${shownGrip ? ' grip-active' : ''}${theory ? ` theory-active theory-${theory.kind}` : ''}" viewBox="0 0 480 218" role="img" aria-label="${escape(shownTitle)}"><title>${escape(shownTitle)}</title>`;
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
    const colour = !theory && highlight && note.characteristic;
    const finger = shownGrip?.notes.find(n=>n.string===note.string && n.fret===note.fret)?.finger;
    const selected = theory?.pcs.includes(note.pc);
    const groupIndex = selected && theory?.kind === 'triads' ? theory.groups?.findIndex(group=>group.pcs.includes(note.pc)) ?? -1 : -1;
    const group = groupIndex === 0 ? 'a' : groupIndex === 1 ? 'b' : null;
    const groupName = group ? theory.groups[groupIndex].name : null;
    const theoryTitle = !theory ? '' : selected ? group ? `, triad ${group.toUpperCase()}: ${groupName}` : `, ${theory.name}` : ', outside the selected overlay';
    const theoryClass = selected ? ` theory-note${group ? ` theory-${group}` : ''}` : '';
    const theoryData = selected ? ` data-theory-group="${group || 'pentatonic'}"` : '';
    const ring = selected ? `<circle class="theory-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="16" fill="none"${group === 'b' ? ' stroke-dasharray="3 2"' : ''}/>` : '';
    const badge = group ? `<g class="theory-badge" aria-hidden="true"><circle cx="${x(note.fret)+17}" cy="${y(note.string)-13}" r="7"/><text x="${x(note.fret)+17}" y="${y(note.string)-10}" text-anchor="middle">${group.toUpperCase()}</text></g>` : '';
    const kind = note.root ? 'root' : note.chord ? 'chord' : 'scale';
    svg += `<g class="fret-note ${kind}${colour ? ' characteristic' : ''}${finger ? ' grip-note' : ''}${theoryClass}" data-string="${note.string}" data-fret="${note.fret}" data-pc="${note.pc}"${theoryData}><title>${escape(`${note.name}, string ${6-note.string}, ${note.fret === 0 ? 'open' : `fret ${note.fret}`}${note.root ? ', chord root' : note.chord ? ', chord tone' : ', scale tone'}${colour ? ', characteristic mode note' : ''}${finger ? ', recommended chord tone' : ''}${theoryTitle}`)}</title><circle cx="${x(note.fret)}" cy="${y(note.string)}" r="13"/>${colour ? `<circle class="characteristic-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="${finger ? 19 : 17}"/>` : ''}${finger ? `<circle class="grip-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="15"/>` : ''}${ring}<text x="${x(note.fret)}" y="${y(note.string)+4}" text-anchor="middle">${escape(label)}</text>${badge}</g>`;
  }
  if (shownGrip) for (const string of shownGrip.muted) svg += `<text class="grip-mute" data-string="${string}" x="29" y="${y(string)+4}" text-anchor="middle"><title>Mute string ${6-string} when playing the chord</title>×</text>`;
  return svg + '</svg>';
}
