// Shared by the display and the audio worklet: the chord you see is what sounds.
const DIATONIC = {
  major: { name: 'Ionian (major)', intervals: [0,2,4,5,7,9,11], degrees: ['1','2','3','4','5','6','7'], chord: 'maj7', tip: 'Listen to the natural 7 resolving to the root.' },
  dorian: { name: 'Dorian', intervals: [0,2,3,5,7,9,10], degrees: ['1','2','♭3','4','5','6','♭7'], chord: 'min13', tip: 'The natural 6 gives this minor mode its open, bright color.' },
  phrygian: { name: 'Phrygian', intervals: [0,1,3,5,7,8,10], degrees: ['1','♭2','♭3','4','5','♭6','♭7'], chord: 'min7', tip: 'Explore the tension of the ♭2 against the root.' },
  lydian: { name: 'Lydian', intervals: [0,2,4,6,7,9,11], degrees: ['1','2','3','♯4','5','6','7'], chord: 'maj7sharp11', tip: 'Let the ♯4 float above the major harmony.' },
  mixolydian: { name: 'Mixolydian', intervals: [0,2,4,5,7,9,10], degrees: ['1','2','3','4','5','6','♭7'], chord: 'dom7', tip: 'The ♭7 softens the pull of the major third.' },
  minor: { name: 'Aeolian (natural minor)', intervals: [0,2,3,5,7,8,10], degrees: ['1','2','♭3','4','5','♭6','♭7'], chord: 'min7', tip: 'Listen to the darker ♭6 against the minor chord.' },
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
    ['melodic_minor', 'Melodic minor', 'minMaj7', 'Jazz melodic minor uses the same notes ascending and descending. Listen to the natural 6 and 7.'],
    ['dorian_b2', 'Dorian ♭2', 'min7', 'Try the ♭2 and natural 6 against a minor seventh chord.'],
    ['lydian_augmented', 'Lydian augmented', 'augMaj7', 'Explore the raised 4 and raised 5 over augmented major harmony.'],
    ['lydian_dominant', 'Lydian dominant', 'dom9sharp11', 'Combine the floating ♯4 with a dominant ♭7.'],
    ['mixolydian_b6', 'Mixolydian ♭6', 'dom7', 'Listen to the ♭6 against a dominant chord.'],
    ['locrian_natural2', 'Locrian ♮2', 'halfDim9', 'The natural 2 opens up a half-diminished chord.'],
    ['altered', 'Altered (super Locrian)', 'dom7alt', 'Explore altered dominant tensions. The written ♭4 sounds as a major 3rd.'],
  ]),
  ...familyModes([0,2,3,5,7,8,11], 'Harmonic minor', [
    ['harmonic_minor', 'Harmonic minor', 'minMaj7', 'Explore the pull between ♭6 and natural 7.'],
    ['locrian_natural6', 'Locrian ♮6', 'halfDim', 'Listen to natural 6 over the half-diminished chord.'],
    ['ionian_sharp5', 'Ionian ♯5', 'augMaj7', 'Hear the raised 5 against major 7 harmony.'],
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
  bloom: { name: 'Bloom pad', harmonics: [.22,.09], detune: .003, speed: .075, depth: .24, evolve: 1, echo: .08, brightness: .32, partials: [1,0,.18,0,.07,0,.03], filterBase: 550, filterSweep: 1100 },
  strings: { name: 'Velvet strings', harmonics: [.36,.16], detune: .0017, speed: .045, depth: .16, evolve: 1, echo: .035, brightness: .9, partials: [1,.6,.38,.28,.18,.14,.11,.08,.06,.04], filterBase: 1800, filterSweep: 3200 },
  atmosphere: { name: 'Glass atmosphere', harmonics: [.06,.22], detune: .004, speed: .11, depth: .21, evolve: 1, echo: .16, brightness: 1, partials: [.7,.12,.3,.02,.25,0,.13], filterBase: 2200, filterSweep: 2200 },
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


// Modal vamps keep a single tonic pitch collection while the backing changes.
// Tonic chords retain the mode's suggested colour; supporting seventh chords
// are built from that same scale instead of transposing the mode to each root.
const MODAL_PLANS = {
  major:{degrees:[0,3,4,0],explanation:'Return to the major tonic through IV and V. Listen for the natural 7 resolving to the root.'},
  dorian:{degrees:[0,3],explanation:'The minor tonic and major IV share Dorian’s natural 6. Keep the minor tonic as your point of rest.'},
  phrygian:{degrees:[0,1],explanation:'Alternate the minor tonic with the major chord a semitone above it to hear Phrygian’s flat 2.'},
  lydian:{degrees:[0,1],explanation:'The tonic’s sharp 11 and the II chord’s major third reveal Lydian’s raised 4 without a V–I cadence.'},
  mixolydian:{degrees:[0,6,3,0],explanation:'Move through flat VII and IV, then return to the dominant tonic. The flat 7 gives this loop its Mixolydian colour.'},
  minor:{degrees:[0,5,6,0],explanation:'Flat VI brings out Aeolian’s flat 6, then flat VII leads back to the minor tonic without a raised leading note.'},
  locrian:{degrees:[0,1],explanation:'Hold the half-diminished tonic against flat II. The tonic’s flat 5 and its neighbour’s flat 2 keep Locrian unsettled.'},
  melodic_minor:{degrees:[0,3,4,0],explanation:'The minor-major tonic supplies the natural 7; the major IV supplies the natural 6. All chords stay inside jazz melodic minor.'},
  dorian_b2:{degrees:[0,1],explanation:'The augmented flat-II chord combines the flat 2 and natural 6, then returns to the minor tonic.'},
  lydian_augmented:{degrees:[0,1],explanation:'The augmented tonic exposes the sharp 5, while II brings out the raised 4. Hear both against the same modal tonic.'},
  lydian_dominant:{degrees:[0,1],explanation:'Alternate dominant chords a whole step apart. The tonic’s flat 7 and sharp 11 distinguish this sound from ordinary Lydian.'},
  mixolydian_b6:{degrees:[0,5],explanation:'The dominant tonic moves to an augmented flat-VI chord. Its root makes the lowered 6 especially clear.'},
  locrian_natural2:{degrees:[0,1],explanation:'Two half-diminished chords a whole step apart bring the natural 2 into focus while preserving the tonic’s flat 5.'},
  altered:{degrees:[0,4],explanation:'The altered tonic alternates with its tritone-related dominant. Both chords share the altered pitch collection; let the tensions remain unresolved.'},
  harmonic_minor:{degrees:[0,3,4,0],overrides:{2:'dom7b9'},explanation:'Minor iv and V7 flat 9 frame the minor-major tonic. Listen for the contrast between flat 6 and the raised leading note.'},
  locrian_natural6:{degrees:[0,1],explanation:'The half-diminished tonic moves to augmented flat II, whose raised fifth supplies this mode’s unusual natural 6.'},
  ionian_sharp5:{degrees:[0,3],explanation:'An augmented major-seventh tonic alternates with IV. Keep returning to the tonic’s raised 5 to distinguish this from ordinary major.'},
  dorian_sharp4:{degrees:[0,3],explanation:'The sharp-IV diminished chord brings the raised 4 into focus, while the tonic minor 13 keeps Dorian’s natural 6 audible.'},
  phrygian_dominant:{degrees:[0,1],explanation:'The dominant tonic and flat-II major seventh emphasise the flat 2 and flat 6 against the tonic’s major third.'},
  lydian_sharp2:{degrees:[0,1],explanation:'The sharp-II diminished chord contains both the raised 2 and raised 4. Resolve your phrases back to the major tonic.'},
  ultralocrian:{degrees:[0,1],explanation:'The diminished tonic alternates with flat-II minor-major seventh. Hear the diminished seventh as flat-flat 7 against the tonic.'},
};
function modalSeventh(mode, degree) {
  const scale=MODES[mode].intervals;
  const tones=[0,2,4,6].map(skip=>scale[(degree+skip)%7]+12*Math.floor((degree+skip)/7)-scale[degree]);
  return Object.keys(CHORDS).find(id=>CHORDS[id].intervals.length===4 && CHORDS[id].intervals.every((interval,i)=>interval===tones[i]));
}
function modalRoman(mode,degree,chord) {
  const roman=['I','II','III','IV','V','VI','VII'][degree];
  const accidental=MODES[mode].degrees[degree].replace(/[1-7]/g,'');
  const minor=['min7','min13','minMaj7','halfDim','halfDim9','dim7'].includes(chord);
  const suffix={min7:'7',min13:'13',minMaj7:'(maj7)',halfDim:'ø7',halfDim9:'ø9',dim7:'°7'}[chord] || CHORDS[chord].symbol;
  return accidental+(minor?roman.toLowerCase():roman)+suffix;
}
export const MODAL_PROGRESSIONS = Object.fromEntries(Object.entries(MODAL_PLANS).map(([mode,plan])=>{
  const steps=plan.degrees.map((degree,index)=>({
    root:MODES[mode].intervals[degree],letter:degree,mode,
    chord:plan.overrides?.[index] || (degree===0?MODES[mode].chord:modalSeventh(mode,degree)),
    bars:plan.degrees.length===2?2:index===0||index===plan.degrees.length-1?2:1,
  }));
  const roman=steps.map((step,index)=>modalRoman(mode,plan.degrees[index],step.chord));
  return [`modal_${mode}`,{name:`${MODES[mode].name} · ${roman.join('–')} · ${steps.reduce((sum,step)=>sum+step.bars,0)} bars`,
    kind:'modal',mode,bars:1,roman,steps,explanation:plan.explanation}];
}));

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
  ...MODAL_PROGRESSIONS,
};
export function progressionDurations(settings) {
  const template = PROGRESSIONS[settings.template || 'parallel1'];
  return template.steps ? template.steps.map(step => step.bars) : template.roman.map(() => template.bars);
}
// Inclusive ranges may cross the end of a template (for example V back to ii).
export function progressionOrder(settings) {
  const count = progressionDurations(settings).length;
  if (!settings.loopEnabled) return Array.from({length:count}, (_, i) => i);
  const bound = value => Math.max(0, Math.min(count - 1, Math.floor(Number(value) || 0)));
  const start = bound(settings.loopStart), end = bound(settings.loopEnd);
  return Array.from({length:(end - start + count) % count + 1}, (_, i) => (start + i) % count);
}
export function progressionStep(settings, bar) {
  const durations = progressionDurations(settings);
  const order = progressionOrder(settings);
  let position = bar % order.reduce((sum, index) => sum + durations[index], 0);
  for (const index of order) {
    if (position < durations[index]) return index;
    position -= durations[index];
  }
  return order[0];
}
export const CHARACTERISTIC_DEGREES = {
  major:['3','7'], dorian:['6'], phrygian:['♭2'], lydian:['♯4'], mixolydian:['♭7'], minor:['♭6'], locrian:['♭2','♭5'],
  melodic_minor:['6','7'], dorian_b2:['♭2','6'], lydian_augmented:['♯4','♯5'], lydian_dominant:['♯4','♭7'],
  mixolydian_b6:['♭6','♭7'], locrian_natural2:['2','♭5'], altered:['♭2','♭3','♭5','♭6'],
  harmonic_minor:['♭6','7'], locrian_natural6:['♭5','6'], ionian_sharp5:['♯5','7'], dorian_sharp4:['♯4','6'],
  phrygian_dominant:['♭2','3','♭6'], lydian_sharp2:['♯2','♯4'], ultralocrian:['♭5','♭♭7'],
};
export function characteristicNotes(harmony) {
  const mode = MODES[harmony.mode];
  return CHARACTERISTIC_DEGREES[harmony.mode].map(degree => {
    const index = mode.degrees.indexOf(degree);
    return {degree, pc:harmony.scalePcs[index], name:harmony.scaleNames[index]};
  });
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
  const modal = settings.progression && definition.kind === 'modal' ? definition.steps[step] : null;
  const change = jazz || modal;
  const mode = modal ? definition.mode : jazz ? jazz.mode : modeId(settings);
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
  const offset = change ? change.root : settings.progression ? definition.roots[step] : 0;
  const key = (settings.key + offset) % 12;
  const cycleNames = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
  const name = settings.progression ? definition.cycle ? (step === 0 ? ROOT_NAMES[key] : cycleNames[key]) : spellPitch(settings.key, change ? change.letter : definition.letters[step], offset) : ROOT_NAMES[key];
  const chordId = change ? change.chord : settings.chord || (settings.mode ? MODES[mode].chord : settings.minor ? 'minor' : 'major');
  const chord = CHORDS[chordId];
  const scaleNames = modal ? modeNotes(settings.key, mode) : modeNotes(key, mode, name);
  const scalePcs = MODES[mode].intervals.map(i => ((modal ? settings.key : key) + i) % 12);
  const midi = chord.intervals.map(i => 48 + key + i);
  const chordDegrees = {0:0,2:1,3:2,4:2,5:3,6:4,7:4,8:4,9:5,10:6,11:6,12:7,13:8,14:8,15:8,17:10,18:10,20:12,21:12};
  const tones = chord.intervals.map(interval => spellPitch(key, chordId === 'dim7' && interval === 9 ? 6 : chordDegrees[interval], interval, name));

  const labels = {0:'1',2:'2',3:'♭3',4:'3',5:'4',6:'♭5',7:'5',8:'♯5',9:'6',10:'♭7',11:'7',12:'8',13:'♭9',14:'9',15:'♯9',17:'11',18:'♯11',20:'♭13',21:'13'};
  const intervals = chord.intervals.map(i => chordId === 'dim7' && i === 9 ? '♭♭7' : labels[i]);
  return { name, suffix: chord.symbol, tones, intervals, midi, scaleNames, scalePcs, chordPcs: midi.map(i => i % 12),
    mode, roman: settings.progression ? definition.roman[step] : 'I' };
}
