// Shared by the display and the audio worklet: the chord you see is what sounds.
export const MODES = {
  major: { name: 'Ionian (major)', intervals: [0,2,4,5,7,9,11], degrees: ['1','2','3','4','5','6','7'], chord: 'maj9', tip: 'Listen to the natural 7 resolving to the root.' },
  dorian: { name: 'Dorian', intervals: [0,2,3,5,7,9,10], degrees: ['1','2','♭3','4','5','6','♭7'], chord: 'min13', tip: 'The natural 6 gives this minor mode its open, bright color.' },
  phrygian: { name: 'Phrygian', intervals: [0,1,3,5,7,8,10], degrees: ['1','♭2','♭3','4','5','♭6','♭7'], chord: 'min7', tip: 'Explore the tension of the ♭2 against the root.' },
  lydian: { name: 'Lydian', intervals: [0,2,4,6,7,9,11], degrees: ['1','2','3','♯4','5','6','7'], chord: 'maj9sharp11', tip: 'Let the ♯4 float above the major harmony.' },
  mixolydian: { name: 'Mixolydian', intervals: [0,2,4,5,7,9,10], degrees: ['1','2','3','4','5','6','♭7'], chord: 'dom13', tip: 'The ♭7 softens the pull of the major third.' },
  minor: { name: 'Aeolian (natural minor)', intervals: [0,2,3,5,7,8,10], degrees: ['1','2','♭3','4','5','♭6','♭7'], chord: 'min9', tip: 'Listen to the darker ♭6 against the minor chord.' },
  locrian: { name: 'Locrian', intervals: [0,1,3,5,6,8,10], degrees: ['1','♭2','♭3','4','♭5','♭6','♭7'], chord: 'halfDim', tip: 'The ♭5 and ♭2 create an intentionally unsettled sound.' },
};
export const CHORDS = {
  major: { name: 'Major', symbol: 'maj', intervals: [0,4,7] },
  maj7: { name: 'Major 7', symbol: 'maj7', intervals: [0,4,7,11] },
  maj9: { name: 'Major 9', symbol: 'maj9', intervals: [0,4,7,11,14] },
  six: { name: 'Major 6', symbol: '6', intervals: [0,4,7,9] },
  sixNine: { name: '6/9', symbol: '6/9', intervals: [0,4,7,9,14] },
  maj7sharp11: { name: 'Major 7 ♯11', symbol: 'maj7♯11', intervals: [0,4,7,11,18] },
  maj9sharp11: { name: 'Major 9 ♯11', symbol: 'maj9♯11', intervals: [0,4,7,11,14,18] },
  minor: { name: 'Minor', symbol: 'm', intervals: [0,3,7] },
  min7: { name: 'Minor 7', symbol: 'm7', intervals: [0,3,7,10] },
  min9: { name: 'Minor 9', symbol: 'm9', intervals: [0,3,7,10,14] },
  min11: { name: 'Minor 11', symbol: 'm11', intervals: [0,3,7,10,14,17] },
  min6: { name: 'Minor 6', symbol: 'm6', intervals: [0,3,7,9] },
  min13: { name: 'Minor 13', symbol: 'm13', intervals: [0,3,7,10,14,21] },
  dom7: { name: 'Dominant 7', symbol: '7', intervals: [0,4,7,10] },
  dom9: { name: 'Dominant 9', symbol: '9', intervals: [0,4,7,10,14] },
  dom13: { name: 'Dominant 13', symbol: '13', intervals: [0,4,7,10,14,21] },
  sus2: { name: 'Suspended 2', symbol: 'sus2', intervals: [0,2,7] },
  sus4: { name: 'Suspended 4', symbol: 'sus4', intervals: [0,5,7] },
  sevenSus: { name: '7 suspended 4', symbol: '7sus4', intervals: [0,5,7,10] },
  nineSus: { name: '9 suspended 4', symbol: '9sus4', intervals: [0,5,7,10,14] },
  halfDim: { name: 'Half-diminished 7', symbol: 'm7♭5', intervals: [0,3,6,10] },
  halfDim11: { name: 'Half-diminished 11 (no 9)', symbol: 'm7♭5(add11)', intervals: [0,3,6,10,17] },
  fifth: { name: 'Open fifth', symbol: '5', intervals: [0,7,12] },
};
export const SOUNDS = {
  warm: { name: 'Warm pad', harmonics: [.14,.035], detune: .002, speed: .12, depth: .12 },
  glass: { name: 'Glass cloud', harmonics: [.025,.12], detune: .003, speed: .18, depth: .18 },
  velvet: { name: 'Velvet drone', harmonics: [.24,.07], detune: .001, speed: .07, depth: .08 },
  air: { name: 'Air choir', harmonics: [.04,.2], detune: .004, speed: .23, depth: .2 },
};
export function modeId(settings) { return settings.mode || (settings.minor ? 'minor' : 'major'); }
export function compatibleChords(mode) {
  const notes = MODES[mode].intervals;
  return Object.entries(CHORDS).filter(([, chord]) => chord.intervals.every(i => notes.includes(i % 12))).map(([id]) => id);
}
export function modeNotes(key, mode) {
  const letters = ['C','D','E','F','G','A','B'];
  const naturals = [0,2,4,5,7,9,11];
  const roots = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const start = letters.indexOf(roots[key][0]);
  return MODES[mode].intervals.map((interval, i) => {
    const letter = (start + i) % 7;
    const delta = ((key + interval - naturals[letter] + 18) % 12) - 6;
    return letters[letter] + (delta > 0 ? '♯'.repeat(delta) : '♭'.repeat(-delta));
  });
}
export function pedalNotes(settings) {
  const id = settings.chord || (settings.minor ? 'minor' : 'major');
  return CHORDS[id].intervals.map(i => 48 + settings.key + i);
}
export function pedalLabels(settings) {
  const mode = modeId(settings);
  const pitches = MODES[mode].intervals;
  const labels = modeNotes(settings.key, mode);
  return CHORDS[settings.chord || MODES[mode].chord].intervals.map(i => labels[pitches.indexOf(i % 12)]);
}
