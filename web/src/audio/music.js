// Shared by the display and the audio worklet: the chord you see is what sounds.
const DIATONIC = {
  major: { name: 'Ionian (major)', intervals: [0,2,4,5,7,9,11], degrees: ['1','2','3','4','5','6','7'], chord: 'maj9', tip: 'Listen to the natural 7 resolving to the root.' },
  dorian: { name: 'Dorian', intervals: [0,2,3,5,7,9,10], degrees: ['1','2','♭3','4','5','6','♭7'], chord: 'min13', tip: 'The natural 6 gives this minor mode its open, bright color.' },
  phrygian: { name: 'Phrygian', intervals: [0,1,3,5,7,8,10], degrees: ['1','♭2','♭3','4','5','♭6','♭7'], chord: 'min7', tip: 'Explore the tension of the ♭2 against the root.' },
  lydian: { name: 'Lydian', intervals: [0,2,4,6,7,9,11], degrees: ['1','2','3','♯4','5','6','7'], chord: 'maj9sharp11', tip: 'Let the ♯4 float above the major harmony.' },
  mixolydian: { name: 'Mixolydian', intervals: [0,2,4,5,7,9,10], degrees: ['1','2','3','4','5','6','♭7'], chord: 'dom13', tip: 'The ♭7 softens the pull of the major third.' },
  minor: { name: 'Aeolian (natural minor)', intervals: [0,2,3,5,7,8,10], degrees: ['1','2','♭3','4','5','♭6','♭7'], chord: 'min9', tip: 'Listen to the darker ♭6 against the minor chord.' },
  locrian: { name: 'Locrian', intervals: [0,1,3,5,6,8,10], degrees: ['1','♭2','♭3','4','♭5','♭6','♭7'], chord: 'halfDim', tip: 'The ♭5 and ♭2 create an intentionally unsettled sound.' },
};
function familyModes(parent, family, entries) {
  const natural = [0,2,4,5,7,9,11];
  return Object.fromEntries(entries.map(([id, name, chord, tip], degree) => {
    const intervals = parent.map((_, i) => (parent[(degree + i) % 7] - parent[degree] + 12) % 12);
    const degrees = intervals.map((n, i) => {
      const delta = n - natural[i];
      return (delta < 0 ? '♭'.repeat(-delta) : '♯'.repeat(delta)) + (i + 1);
    });
    return [id, { name, intervals, degrees, chord, tip, family }];
  }));
}
export const MODES = {
  ...DIATONIC,
  ...familyModes([0,2,3,5,7,9,11], 'Melodic minor', [
    ['melodic_minor', 'Melodic minor', 'minMaj9', 'Jazz melodic minor uses the same notes ascending and descending. Listen to the natural 6 and 7.'],
    ['dorian_b2', 'Dorian ♭2', 'min6', 'Try the ♭2 against a minor sixth chord.'],
    ['lydian_augmented', 'Lydian augmented', 'augMaj9', 'Explore the raised 4 and raised 5 over augmented major harmony.'],
    ['lydian_dominant', 'Lydian dominant', 'dom9sharp11', 'Combine the floating ♯4 with a dominant ♭7.'],
    ['mixolydian_b6', 'Mixolydian ♭6', 'dom9', 'Listen to the ♭6 against a dominant chord.'],
    ['locrian_natural2', 'Locrian ♮2', 'halfDim9', 'The natural 2 opens up a half-diminished chord.'],
    ['altered', 'Altered (super Locrian)', 'dom7alt', 'Explore altered dominant tensions. The written ♭4 sounds as a major 3rd.'],
  ]),
  ...familyModes([0,2,3,5,7,8,11], 'Harmonic minor', [
    ['harmonic_minor', 'Harmonic minor', 'minMaj9', 'Explore the pull between ♭6 and natural 7.'],
    ['locrian_natural6', 'Locrian ♮6', 'halfDim', 'Listen to natural 6 over the half-diminished chord.'],
    ['ionian_sharp5', 'Ionian ♯5', 'augMaj9', 'Hear the raised 5 against major 7 harmony.'],
    ['dorian_sharp4', 'Dorian ♯4', 'min13', 'The raised 4 adds an unexpected lift to Dorian.'],
    ['phrygian_dominant', 'Phrygian dominant', 'dom7b9', 'Explore ♭2 and ♭6 around a major 3rd.'],
    ['lydian_sharp2', 'Lydian ♯2', 'maj7sharp11', 'Hear the raised 2 and 4 over major harmony.'],
    ['ultralocrian', 'Ultralocrian (super Locrian ♭♭7)', 'dim7', 'The diminished 7th is spelled ♭♭7; let its tension ring.'],
  ]),
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
  minMaj7: { name: 'Minor major 7', symbol: 'm(maj7)', intervals: [0,3,7,11] },
  minMaj9: { name: 'Minor major 9', symbol: 'm(maj9)', intervals: [0,3,7,11,14] },
  augmented: { name: 'Augmented', symbol: 'aug', intervals: [0,4,8] },
  augMaj7: { name: 'Augmented major 7', symbol: 'maj7♯5', intervals: [0,4,8,11] },
  augMaj9: { name: 'Augmented major 9', symbol: 'maj9♯5', intervals: [0,4,8,11,14] },
  dom9sharp11: { name: 'Dominant 9 ♯11', symbol: '9♯11', intervals: [0,4,7,10,14,18] },
  dom7b9: { name: 'Dominant 7 ♭9', symbol: '7♭9', intervals: [0,4,7,10,13] },
  dom7alt: { name: 'Altered dominant (♭5 ♭9 ♯9)', symbol: '7alt', intervals: [0,4,6,10,13,15] },
  halfDim9: { name: 'Half-diminished 9', symbol: 'm9♭5', intervals: [0,3,6,10,14] },
  dim7: { name: 'Diminished 7', symbol: 'dim7', intervals: [0,3,6,9] },
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
  const preset = pianoPreset(settings);
  if (preset) return preset.notes;
  const id = settings.chord || (settings.minor ? 'minor' : 'major');
  return applyVoicing(CHORDS[id].intervals.map(i => 48 + settings.key + i), settings.voicing);
}
export function pedalLabels(settings) {
  const mode = modeId(settings);
  const pitches = MODES[mode].intervals;
  const labels = modeNotes(settings.key, mode);
  return pedalNotes(settings).map(note => labels[pitches.indexOf((note - 48 - settings.key + 24) % 12)]);
}

// Piano-inspired register choices: one root in the tenor register, with upper
// voices placed above it. None of these presets lowers a voice below the root.
export const PIANO_STYLES = {
  shell: { name: 'Soft shell + color', description: 'Root, guide tones and an upper color; the fifth is usually omitted.' },
  open: { name: 'Open piano', description: 'A stable root with the chord tones spread between two hands.' },
  color: { name: 'Modal color', description: 'A mode-specific voicing that brings out the characteristic scale notes.' },
  upper: { name: 'Floating upper voices', description: 'An isolated root beneath a lighter, higher right-hand chord.' },
};
// Deliberate harmonic choices rather than mechanically lowered voices.
// Intervals are pitch content; register is assigned separately below.
export const MODAL_COLORS = {
  major: { symbol: 'maj13', intervals: [0,4,7,11,14,21] },
  dorian: { symbol: 'm13(add11, no5)', intervals: [0,3,10,14,17,21] },
  phrygian: { symbol: 'm7(♭9,♭13,no5)', intervals: [0,3,10,13,20] },
  lydian: { symbol: 'maj13♯11(no5)', intervals: [0,4,11,14,18,21] },
  mixolydian: { symbol: '13', intervals: [0,4,7,10,14,21] },
  minor: { symbol: 'm9(add♭13,no5)', intervals: [0,3,10,14,20] },
  locrian: { symbol: 'm7♭5(add11,♭9)', intervals: [0,3,6,10,13,17] },
  melodic_minor: { symbol: 'm(maj9,add13,no5)', intervals: [0,3,11,14,21] },
  dorian_b2: { symbol: 'm13(♭9,no5)', intervals: [0,3,10,13,21] },
  lydian_augmented: { symbol: 'maj9(♯5,♯11)', intervals: [0,4,8,11,14,18] },
  lydian_dominant: { symbol: '13♯11(no5)', intervals: [0,4,10,14,18,21] },
  mixolydian_b6: { symbol: '9(add♭13,no5)', intervals: [0,4,10,14,20] },
  locrian_natural2: { symbol: 'm9♭5(add11)', intervals: [0,3,6,10,14,17] },
  altered: { symbol: '7alt(♭9,♯9,♭13,no5)', intervals: [0,4,10,13,15,20] },
  harmonic_minor: { symbol: 'm(maj9,add♭13,no5)', intervals: [0,3,11,14,20] },
  locrian_natural6: { symbol: 'm7♭5(add13)', intervals: [0,3,6,10,21] },
  ionian_sharp5: { symbol: 'maj13♯5', intervals: [0,4,8,11,14,21] },
  dorian_sharp4: { symbol: 'm13♯11(no5)', intervals: [0,3,10,14,18,21] },
  phrygian_dominant: { symbol: '7(♭9,♭13,no5)', intervals: [0,4,10,13,20] },
  lydian_sharp2: { symbol: 'maj7(♯9,♯11,no5)', intervals: [0,4,11,15,18] },
  ultralocrian: { symbol: 'dim7(add♭9,♭13)', intervals: [0,3,6,9,13,20] },
};

export function applyVoicing(notes, voicing = 'custom') {
  if (!PIANO_STYLES[voicing]) return [...notes];
  const root = notes[0];
  const intervals = [...new Set(notes.slice(1).map(note => (note - root) % 12))];
  const chosen = voicing === 'shell' ? intervals.filter(interval => interval !== 7 || intervals.length < 3) : intervals;
  // Keep low thirds out of the bass; extensions live in the right hand.
  return [root, ...chosen.map(interval => {
    const original = notes.find(note => note !== root && (note - root) % 12 === interval);
    let distance = interval + 12;
    if (original - root >= 12) distance = interval + (interval <= 3 ? 24 : 12);
    else if (interval >= 9 && voicing !== 'upper') distance = interval;
    if (voicing === 'open' && (interval === 6 || interval === 7 || interval === 8)) distance = interval;
    return root + distance;
  })].sort((a, b) => a - b);
}

export function pianoPreset(settings) {
  const style = settings.voicing;
  if (!PIANO_STYLES[style]) return null;
  const mode = modeId(settings);
  const chord = CHORDS[MODES[mode].chord];
  const content = style === 'color' ? MODAL_COLORS[mode] : chord;
  return {
    name: PIANO_STYLES[style].name,
    symbol: content.symbol,
    description: PIANO_STYLES[style].description,
    notes: applyVoicing(content.intervals.map(interval => 48 + settings.key + interval), style),
  };
}
