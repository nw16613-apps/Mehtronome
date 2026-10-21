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
const MAJOR_MODE_ROTATIONS = {major:0,dorian:1,phrygian:2,lydian:3,mixolydian:4,minor:5,locrian:6};
export function parentMajorFor(harmony) {
  const rotation = MAJOR_MODE_ROTATIONS[harmony.mode];
  if (rotation === undefined) return null;
  const index = (7 - rotation) % 7;
  return {pc:harmony.scalePcs[index],name:harmony.scaleNames[index]};
}
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
  // Related major-scale modes share the parent's exact fingering. Chord roots,
  // interval labels and colour notes still refer to the selected modal harmony.
  const parentMajor = parentMajorFor(harmony);
  const anchorPc = parentMajor ? parentMajor.pc : rootPc;
  const anchorName = parentMajor ? parentMajor.name : harmony.name;
  const intervals = harmony.scalePcs.map(pc=>(pc-anchorPc+12)%12).sort((a,b)=>a-b);
  const position = positionFor(anchorPc, shape, intervals);
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
 * @param {{name:string,notes:Array<{string:number,fret:number,midi:number,pc:number,name:string,root:boolean,chord:boolean,scaleIndex:number,chromaticDegree:string}>,movements?:Array<{string:number,delta:number|null,common:boolean}>} | null} [mappedChord]
 */
export function diagramSvg(board, degrees, modeDegrees, title, highlight = false, grip = null, theory = null, mappedChord = null) {
  const mappedNotes = new Map((mappedChord?.notes || [])
    .filter(note => Number.isInteger(note.string) && note.string >= 0 && note.string < TUNING.length && Number.isInteger(note.fret) && note.fret >= 1 && note.fret <= 24)
    .map(note => [`${note.string}:${note.fret}`,note]));
  const mapped = mappedNotes.size > 0;
  if (mapped) {
    // A chosen chord is a physical string/fret overlay, rather than a pitch-class
    // selection. Expand only this rendered copy, retaining the CAGED fingering.
    const notes = new Map(board.notes.map(note => [`${note.string}:${note.fret}`,note]));
    for (const [key,note] of mappedNotes) notes.set(key,{...notes.get(key),...note});
    board = {...board, notes:[...notes.values()],
      start:Math.min(board.start,...[...mappedNotes.values()].map(note => note.fret)),
      end:Math.max(board.end,...[...mappedNotes.values()].map(note => note.fret))};
  }
  const columns = board.end - board.start + 1;
  const spacing = 400 / columns;
  const x = fret => 40 + spacing / 2 + (fret - board.start) * spacing;
  const y = string => 30 + (5 - string) * 28;
  const nut = board.start === 0 ? 120 : 40;
  // Theory is a pitch-class overlay on the established fingering, never a new
  // position. Give it its own layer so finger badges and modal rings do not
  // obscure the pentatonic or triad-pair markers.
  const shownTheory = mapped ? null : theory;
  const shownGrip = mapped || shownTheory ? null : grip;
  const shownTitle = mapped ? `${title}, selected chord: ${mappedChord.name}` : shownTheory ? `${title}, ${shownTheory.kind === 'pentatonic' ? 'pentatonic' : 'triad-pair'} overlay: ${shownTheory.name}` : title;
  let svg = `<svg class="fretboard${shownGrip ? ' grip-active' : ''}${shownTheory ? ` theory-active theory-${shownTheory.kind}` : ''}${mapped ? ' mapped-chord-active' : ''}" viewBox="0 0 480 218" role="img" aria-label="${escape(shownTitle)}"><title>${escape(shownTitle)}</title>`;
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
    const colour = !mapped && !shownTheory && highlight && note.characteristic;
    const finger = shownGrip?.notes.find(n=>n.string===note.string && n.fret===note.fret)?.finger;
    const selected = shownTheory?.pcs.includes(note.pc);
    const groupIndex = selected && shownTheory?.kind === 'triads' ? shownTheory.groups?.findIndex(group=>group.pcs.includes(note.pc)) ?? -1 : -1;
    const group = groupIndex === 0 ? 'a' : groupIndex === 1 ? 'b' : null;
    const groupName = group ? shownTheory.groups[groupIndex].name : null;
    const theoryTitle = !shownTheory ? '' : selected ? group ? `, triad ${group.toUpperCase()}: ${groupName}` : `, ${shownTheory.name}` : ', outside the selected overlay';
    const theoryClass = selected ? ` theory-note${group ? ` theory-${group}` : ''}` : '';
    const theoryData = selected ? ` data-theory-group="${group || 'pentatonic'}"` : '';
    const ring = selected ? `<circle class="theory-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="16" fill="none"${group === 'b' ? ' stroke-dasharray="3 2"' : ''}/>` : '';
    const badge = group ? `<g class="theory-badge" aria-hidden="true"><circle cx="${x(note.fret)+17}" cy="${y(note.string)-13}" r="7"/><text x="${x(note.fret)+17}" y="${y(note.string)-10}" text-anchor="middle">${group.toUpperCase()}</text></g>` : '';
    const mappedNote = mappedNotes.has(`${note.string}:${note.fret}`);
    const movement = mappedNote ? mappedChord.movements?.find(move => move.string === note.string) : null;
    const held = movement && movement.common === true;
    const moving = movement && !held && Number.isFinite(movement.delta) && movement.delta !== 0;
    const motion = held ? 'held' : moving ? `${movement.delta > 0 ? '+' : ''}${movement.delta}` : '';
    const motionTitle = held ? ', held note, 0 semitones' : moving ? `, voice moves ${movement.delta > 0 ? 'up' : 'down'} ${Math.abs(movement.delta)} semitone${Math.abs(movement.delta) === 1 ? '' : 's'}` : '';
    const mappedClass = mappedNote ? ` mapped-chord-note${held ? ' voice-held' : moving ? ' voice-moving' : ''}` : '';
    const mappedRing = mappedNote ? `<circle class="mapped-chord-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="16" fill="none"/>` : '';
    const motionBadge = motion ? `<text class="voice-motion" x="${x(note.fret)+16}" y="${y(note.string)-12}" text-anchor="start" aria-hidden="true">${motion}</text>` : '';
    const kind = note.root ? 'root' : note.chord ? 'chord' : 'scale';
    svg += `<g class="fret-note ${kind}${colour ? ' characteristic' : ''}${finger ? ' grip-note' : ''}${theoryClass}${mappedClass}" data-string="${note.string}" data-fret="${note.fret}" data-pc="${note.pc}"${theoryData}><title>${escape(`${note.name}, string ${6-note.string}, ${note.fret === 0 ? 'open' : `fret ${note.fret}`}${note.root ? ', chord root' : note.chord ? ', chord tone' : ', scale tone'}${colour ? ', characteristic mode note' : ''}${finger ? `, recommended chord, finger ${finger}` : ''}${theoryTitle}${mappedNote ? `, selected chord: ${mappedChord.name}${motionTitle}` : ''}`)}</title><circle cx="${x(note.fret)}" cy="${y(note.string)}" r="13"/>${colour ? `<circle class="characteristic-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="${finger ? 19 : 17}"/>` : ''}${finger ? `<circle class="grip-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="15"/>` : ''}${ring}${mappedRing}<text x="${x(note.fret)}" y="${y(note.string)+4}" text-anchor="middle">${escape(label)}</text>${finger ? `<g class="grip-finger"><circle cx="${x(note.fret)+18}" cy="${y(note.string)-12}" r="7"/><text x="${x(note.fret)+18}" y="${y(note.string)-9}" text-anchor="middle">${finger}</text></g>` : ''}${badge}${motionBadge}</g>`;
  }
  if (shownGrip) for (const string of shownGrip.muted) svg += `<text class="grip-mute" data-string="${string}" x="29" y="${y(string)+4}" text-anchor="middle"><title>Mute string ${6-string} when playing the chord</title>×</text>`;
  return svg + '</svg>';
}
