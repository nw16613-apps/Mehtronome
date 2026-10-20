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
  bloom: { name: 'Bloom pad', harmonics: [.22,.09], detune: .003, speed: .075, depth: .24, evolve: 1, echo: .12, brightness: .65 },
  strings: { name: 'Velvet strings', harmonics: [.36,.16], detune: .0017, speed: .045, depth: .16, evolve: 1, echo: .07, brightness: .4 },
  atmosphere: { name: 'Glass atmosphere', harmonics: [.06,.22], detune: .004, speed: .11, depth: .21, evolve: 1, echo: .24, brightness: 1 },
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
export function modeNotes(key, mode, rootName = null) {
  const letters = ['C','D','E','F','G','A','B'];
  const naturals = [0,2,4,5,7,9,11];
  const roots = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const start = letters.indexOf((rootName || roots[key])[0]);
  return MODES[mode].intervals.map((interval, i) => {
    const letter = (start + i) % 7;
    const delta = ((key + interval - naturals[letter] + 18) % 12) - 6;
    return letters[letter] + (delta > 0 ? '♯'.repeat(delta) : '♭'.repeat(-delta));
  });
}
export function pedalNotes(settings) {
  const id = settings.chord || (settings.mode ? MODES[modeId(settings)].chord : settings.minor ? 'minor' : 'major');
  return CHORDS[id].intervals.map(i => 48 + settings.key + i);
}
export function pedalLabels(settings) {
  const mode = modeId(settings);
  const pitches = MODES[mode].intervals;
  const labels = modeNotes(settings.key, mode);
  return pedalNotes(settings).map(note => labels[pitches.indexOf((note - 48 - settings.key + 24) % 12)]);
}


export const PROGRESSIONS = {
  parallel1: { name: 'I–♭III–♭V–VI · 1 bar per chord', bars: 1, kind: 'parallel', roots: [0,3,6,9], letters: [0,2,4,5], roman: ['I','♭III','♭V','VI'] },
  parallel2: { name: 'I–♭III–♭V–VI · 2 bars per chord', bars: 2, kind: 'parallel', roots: [0,3,6,9], letters: [0,2,4,5], roman: ['I','♭III','♭V','VI'] },
  oneFour1: { name: 'I–IV · 1 bar per chord', bars: 1, kind: 'parallel', roots: [0,5], letters: [0,3], roman: ['I','IV'] },
  oneFour2: { name: 'I–IV · 2 bars per chord', bars: 2, kind: 'parallel', roots: [0,5], letters: [0,3], roman: ['I','IV'] },
  fourths1: { name: 'Cycle of fourths · 1 bar per chord', bars: 1, kind: 'parallel', cycle: true, roots: [0,5,10,3,8,1,6,11,4,9,2,7], roman: ['I','IV','♭VII','♭III','♭VI','♭II','♭V','VII','III','VI','II','V'] },
  fourths2: { name: 'Cycle of fourths · 2 bars per chord', bars: 2, kind: 'parallel', cycle: true, roots: [0,5,10,3,8,1,6,11,4,9,2,7], roman: ['I','IV','♭VII','♭III','♭VI','♭II','♭V','VII','III','VI','II','V'] },
  major251: { name: 'Jazz major ii–V–I · 4 bars', bars: 1, kind: 'jazz', roman: ['ii7','V7alt','Imaj7♯11'], steps: [
    { root: 2, letter: 1, chord: 'min7', mode: 'dorian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7alt', mode: 'altered', bars: 1 },
    { root: 0, letter: 0, chord: 'maj7sharp11', mode: 'lydian', bars: 2 },
  ] },
  minor251: { name: 'Jazz minor iiø–V–i · 4 bars', bars: 1, kind: 'jazz', roman: ['iiø7','V7♭9','i6'], steps: [
    { root: 2, letter: 1, chord: 'halfDim', mode: 'locrian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7b9', mode: 'phrygian_dominant', bars: 1 },
    { root: 0, letter: 0, chord: 'min6', mode: 'melodic_minor', bars: 2 },
  ] },
  turnaround: { name: 'Jazz ii–V–I–VI turnaround · 4 bars', bars: 1, kind: 'jazz', roman: ['ii7','V7','Imaj7','VI7'], steps: [
    { root: 2, letter: 1, chord: 'min7', mode: 'dorian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'maj7', mode: 'major', bars: 1 },
    { root: 9, letter: 5, chord: 'dom7', mode: 'phrygian_dominant', bars: 1 },
  ] },
  jazzBlues: { name: '12-bar jazz blues', bars: 1, kind: 'jazz', roman: ['I7','IV7','I7','I7','IV7','♯iv°7','I7','VI7','ii7','V7','I7','V7'], steps: [
    { root: 0, letter: 0, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 5, letter: 3, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 5, letter: 3, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 6, letter: 3, chord: 'dim7', mode: 'ultralocrian', bars: 1 },
    { root: 0, letter: 0, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 9, letter: 5, chord: 'dom7', mode: 'phrygian_dominant', bars: 1 },
    { root: 2, letter: 1, chord: 'min7', mode: 'dorian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'dom7', mode: 'mixolydian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7', mode: 'mixolydian', bars: 1 },
  ] },
  diatonic: { name: 'Diatonic I–vi–IV–V · 1 bar per chord', bars: 1, kind: 'diatonic', roman: ['I','vi','IV','V'] },
};
export function progressionDurations(settings) {
  const template = PROGRESSIONS[settings.template || 'parallel1'];
  return template.kind === 'jazz' ? template.steps.map(step => step.bars) : template.roman.map(() => template.bars);
}
export function progressionStep(settings, bar) {
  const durations = progressionDurations(settings);
  let position = bar % durations.reduce((sum, duration) => sum + duration, 0);
  for (let step = 0; step < durations.length; step++) {
    if (position < durations[step]) return step;
    position -= durations[step];
  }
  return 0;
}
const ROOT_NAMES = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
function spellPitch(key, letterSteps, semitones, rootName = ROOT_NAMES[key]) {
  const letters = ['C','D','E','F','G','A','B'];
  const letter = (letters.indexOf(rootName[0]) + letterSteps) % 7;
  const accidental = ((key + semitones - [0,2,4,5,7,9,11][letter] + 18) % 12) - 6;
  return letters[letter] + (accidental < 0 ? '♭'.repeat(-accidental) : '♯'.repeat(accidental));
}
export function harmonyAt(settings, step = 0) {
  const template = settings.template || 'parallel1';
  const definition = PROGRESSIONS[template];
  step = ((step % definition.roman.length) + definition.roman.length) % definition.roman.length;
  const jazz = settings.progression && definition.kind === 'jazz' ? definition.steps[step] : null;
  const mode = jazz ? jazz.mode : modeId(settings);
  if (settings.progression && template === 'diatonic') {
    const scale = MODES[mode].intervals;
    const degree = [0,5,3,4][step];
    const degrees = [degree, degree + 2, degree + 4];
    const midi = degrees.map(i => 48 + settings.key + scale[i % 7] + 12 * Math.floor(i / 7));
    const scaleNames = modeNotes(settings.key, mode);
    const third = midi[1] - midi[0];
    return { name: scaleNames[degree], suffix: third === 3 ? 'm' : 'maj', tones: degrees.map(i => scaleNames[i % 7]), intervals: ['1', third === 3 ? '♭3' : '3', '5'], midi,
      scaleNames, scalePcs: scale.map(i => (settings.key + i) % 12), chordPcs: midi.map(i => i % 12),
      mode, roman: mode === 'minor' ? ['i','VI','iv','v'][step] : PROGRESSIONS.diatonic.roman[step] };
  }
  const offset = jazz ? jazz.root : settings.progression ? definition.roots[step] : 0;
  const key = (settings.key + offset) % 12;
  const cycleNames = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
  const name = settings.progression ? definition.cycle ? (step === 0 ? ROOT_NAMES[key] : cycleNames[key]) : spellPitch(settings.key, jazz ? jazz.letter : definition.letters[step], offset) : ROOT_NAMES[key];
  const chordId = jazz ? jazz.chord : settings.chord || (settings.mode ? MODES[mode].chord : settings.minor ? 'minor' : 'major');
  const chord = CHORDS[chordId];
  const scaleNames = modeNotes(key, mode, name);
  const scalePcs = MODES[mode].intervals.map(i => (key + i) % 12);
  const midi = chord.intervals.map(i => 48 + key + i);
  const chordDegrees = {0:0,2:1,3:2,4:2,5:3,6:4,7:4,8:4,9:5,10:6,11:6,12:7,13:8,14:8,15:8,17:10,18:10,20:12,21:12};
  const tones = chord.intervals.map(interval => spellPitch(key, chordId === 'dim7' && interval === 9 ? 6 : chordDegrees[interval], interval, name));

  const labels = {0:'1',2:'2',3:'♭3',4:'3',5:'4',6:'♭5',7:'5',8:'♯5',9:'6',10:'♭7',11:'7',12:'8',13:'♭9',14:'9',15:'♯9',17:'11',18:'♯11',20:'♭13',21:'13'};
  const intervals = chord.intervals.map(i => chordId === 'dim7' && i === 9 ? '♭♭7' : labels[i]);
  return { name, suffix: chord.symbol, tones, intervals, midi, scaleNames, scalePcs, chordPcs: midi.map(i => i % 12),
    mode, roman: settings.progression ? definition.roman[step] : 'I' };
}
