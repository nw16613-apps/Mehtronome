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
  // Paired harmonic layers share a tuned fundamental. Slow, independent motion
  // changes their blend, colour and stereo position without changing harmony.
  bloom: { name:'Bloom pad', harmonics:[.22,.09], partials:[1,0,.18,0,.055,0,.018], layerPartials:[1,0,.44,0,.15,0,.045], detune:.0024, speed:.037, depth:.15, evolve:1, echo:.065, brightness:.35, filterBase:650, filterSweep:1550, morph:.29, morphDepth:.19, width:.48, halo:.018, attack:.26, release:.24 },
  strings: { name:'Velvet strings', harmonics:[.36,.16], partials:[1,.6,.32,.19,.12,.075,.045,.026,.016,.009], layerPartials:[1,.45,.28,.17,.18,.09,.06,.035,.02,.012], detune:.0015, speed:.026, depth:.1, evolve:1, echo:.035, brightness:.9, filterBase:1700, filterSweep:2800, morph:.34, morphDepth:.13, width:.58, halo:.012, attack:.2, release:.21 },
  atmosphere: { name:'Glass atmosphere', harmonics:[.06,.22], partials:[1,.035,.3,0,.32,0,.14,0,.045], layerPartials:[1,0,.17,0,.56,0,.16,0,.07], detune:.0011, speed:.051, depth:.2, evolve:1, echo:.14, brightness:1, filterBase:2300, filterSweep:2600, morph:.3, morphDepth:.22, width:.68, halo:.045, attack:.09, release:.28 },
  warm: { name:'Warm pad', harmonics:[.14,.035], partials:[1,.085,.026], layerPartials:[1,.15,.035,0,.012], detune:.0014, speed:.019, depth:.09, evolve:1, echo:0, brightness:.2, filterBase:450, filterSweep:620, morph:.25, morphDepth:.1, width:.28, halo:0, attack:.32, release:.22 },
  glass: { name:'Glass cloud', harmonics:[.025,.12], partials:[1,0,.14,0,.06,0,.024], layerPartials:[1,.02,.24,0,.12,0,.035], detune:.0018, speed:.043, depth:.13, evolve:1, echo:.1, brightness:.65, filterBase:1300, filterSweep:1600, morph:.28, morphDepth:.18, width:.6, halo:.075, attack:.36, release:.28 },
  velvet: { name:'Velvet drone', harmonics:[.24,.07], partials:[1,0,.3,0,.13,0,.04], layerPartials:[1,.055,.2,0,.065,0,.018], detune:.00085, speed:.013, depth:.06, evolve:1, echo:.04, brightness:.25, filterBase:360, filterSweep:760, morph:.22, morphDepth:.12, width:.32, halo:0, attack:.6, release:.26 },
  air: { name:'Air choir', harmonics:[.04,.2], partials:[1,.03,.14,.25,.24,.085,.024,0,.008], layerPartials:[1,.12,.35,.13,.055,.18,.06,.035,.015], detune:.0022, speed:.029, depth:.15, evolve:1, echo:.085, brightness:.75, filterBase:1700, filterSweep:2400, morph:.38, morphDepth:.25, width:.62, halo:.022, attack:.43, release:.24 },
  horizon: { name:'Cinematic Horizon', partials:[1,.2,.28,.08,.13,.035,.045,.012], layerPartials:[1,.42,.2,.22,.08,.075,.025,.018,.008], detune:.0017, speed:.018, depth:.18, echo:.075, filterBase:720, filterSweep:2100, morph:.3, morphDepth:.2, width:.62, halo:.026, foundation:.075, arc:.1, attack:.48, release:.38 },
  aurora: { name:'Evolving Aurora', partials:[1,.035,.22,0,.16,.02,.075,0,.028], layerPartials:[1,.08,.12,.04,.34,0,.13,.015,.05], detune:.0021, speed:.032, depth:.24, echo:.12, filterBase:1050, filterSweep:3000, morph:.36, morphDepth:.3, width:.76, halo:.052, foundation:.025, arc:.14, attack:.62, release:.44 },
  cathedral: { name:'Cathedral Air', partials:[1,.12,.08,.24,.18,.055,.035,.025,.016], layerPartials:[1,.04,.31,.17,.08,.2,.045,.065,.018,.025], detune:.00125, speed:.014, depth:.14, echo:.11, filterBase:880, filterSweep:1900, morph:.44, morphDepth:.16, width:.68, halo:.045, foundation:.09, arc:.08, attack:.78, release:.52 },
  constellation: { name:'Analog Constellation', partials:[1,.48,.25,.14,.09,.052,.029,.016], layerPartials:[1,.24,.42,.09,.15,.035,.055,.012], detune:.0028, speed:.046, depth:.2, echo:.095, filterBase:1250, filterSweep:3300, morph:.32, morphDepth:.24, width:.7, halo:.032, foundation:.045, arc:.12, attack:.3, release:.3 },
  deepSpace: { name:'Deep Space Drone', partials:[1,.025,.3,0,.17,0,.07,0,.025], layerPartials:[1,.015,.16,0,.38,0,.11,0,.04], detune:.00075, speed:.009, depth:.1, echo:.14, filterBase:300, filterSweep:1050, morph:.27, morphDepth:.17, width:.5, halo:.065, foundation:.14, arc:.16, attack:1.05, release:.68 },
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
  major:{degrees:[0,3,4,0],overrides:{0:'maj9',1:'maj9',2:'dom13',3:'maj9'},explanation:'Return to the major tonic through IV and V. Listen for the natural 7 resolving to the root.'},
  dorian:{degrees:[0,3],overrides:{1:'dom13'},explanation:'The minor tonic and major IV share Dorian’s natural 6. Keep the minor tonic as your point of rest.'},
  phrygian:{degrees:[0,1],overrides:{1:'maj9'},explanation:'Alternate the minor tonic with the major chord a semitone above it to hear Phrygian’s flat 2.'},
  lydian:{degrees:[0,1],overrides:{0:'maj9sharp11',1:'dom13'},explanation:'The tonic’s sharp 11 and the II chord’s major third reveal Lydian’s raised 4 without a V–I cadence.'},
  mixolydian:{degrees:[0,6,3,0],overrides:{0:'dom13',1:'maj9',2:'maj9',3:'dom13'},explanation:'Move through flat VII and IV, then return to the dominant tonic. The flat 7 gives this loop its Mixolydian colour.'},
  minor:{degrees:[0,5,6,0],overrides:{0:'min11',1:'maj9',2:'dom13',3:'min11'},explanation:'Flat VI brings out Aeolian’s flat 6, then flat VII leads back to the minor tonic without a raised leading note.'},
  locrian:{degrees:[0,1],overrides:{0:'halfDim11',1:'maj9'},explanation:'Hold the half-diminished tonic against flat II. The tonic’s flat 5 and its neighbour’s flat 2 keep Locrian unsettled.'},
  melodic_minor:{degrees:[0,3,4,0],overrides:{0:'minMaj9',1:'dom13',2:'dom9',3:'minMaj9'},explanation:'The minor-major tonic supplies the natural 7; the major IV supplies the natural 6. All chords stay inside jazz melodic minor.'},
  dorian_b2:{degrees:[0,1],overrides:{1:'augMaj9'},explanation:'The augmented flat-II chord combines the flat 2 and natural 6, then returns to the minor tonic.'},
  lydian_augmented:{degrees:[0,1],overrides:{0:'augMaj9',1:'dom13'},explanation:'The augmented tonic exposes the sharp 5, while II brings out the raised 4. Hear both against the same modal tonic.'},
  lydian_dominant:{degrees:[0,1],overrides:{1:'dom9'},explanation:'Alternate dominant chords a whole step apart. The tonic’s flat 7 and sharp 11 distinguish this sound from ordinary Lydian.'},
  mixolydian_b6:{degrees:[0,5],overrides:{0:'dom9',1:'augMaj9'},explanation:'The dominant tonic moves to an augmented flat-VI chord. Its root makes the lowered 6 especially clear.'},
  locrian_natural2:{degrees:[0,1],explanation:'Two half-diminished chords a whole step apart bring the natural 2 into focus while preserving the tonic’s flat 5.'},
  altered:{degrees:[0,4],overrides:{1:'dom9sharp11'},explanation:'The altered tonic alternates with its tritone-related dominant. Both chords share the altered pitch collection; let the tensions remain unresolved.'},
  harmonic_minor:{degrees:[0,3,4,0],overrides:{0:'minMaj9',1:'min9',2:'dom7b9',3:'minMaj9'},explanation:'Minor iv and V7 flat 9 frame the minor-major tonic. Listen for the contrast between flat 6 and the raised leading note.'},
  locrian_natural6:{degrees:[0,1],overrides:{0:'halfDim11',1:'augMaj9'},explanation:'The half-diminished tonic moves to augmented flat II, whose raised fifth supplies this mode’s unusual natural 6.'},
  ionian_sharp5:{degrees:[0,3],overrides:{0:'augMaj9'},explanation:'An augmented major-seventh tonic alternates with IV. Keep returning to the tonic’s raised 5 to distinguish this from ordinary major.'},
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
  const minor=['minor','min7','min9','min11','min13','min6','minMaj7','minMaj9','halfDim','halfDim9','halfDim11','dim7'].includes(chord);
  const suffix={minor:'',min7:'7',min9:'9',min11:'11',min13:'13',minMaj7:'(maj7)',minMaj9:'(maj9)',halfDim:'ø7',halfDim9:'ø9',halfDim11:'ø11',dim7:'°7'}[chord] || CHORDS[chord].symbol;
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
  custom: { name: 'Custom progression', bars: 1, kind: 'custom', roman: ['i13','IV13'], steps: [
    { root: 0, letter: 0, chord: 'min13', mode: 'dorian', bars: 1, bass: null },
    { root: 5, letter: 3, chord: 'dom13', mode: 'mixolydian', bars: 1, bass: null },
  ] },
  parallel1: { name: 'I–♭III–♭V–VI · 1 bar per chord', bars: 1, kind: 'parallel', roots: [0,3,6,9], letters: [0,2,4,5], roman: ['I','♭III','♭V','VI'] },
  parallel2: { name: 'I–♭III–♭V–VI · 2 bars per chord', bars: 2, kind: 'parallel', roots: [0,3,6,9], letters: [0,2,4,5], roman: ['I','♭III','♭V','VI'] },
  oneFour1: { name: 'I–IV · 1 bar per chord', bars: 1, kind: 'parallel', roots: [0,5], letters: [0,3], roman: ['I','IV'] },
  oneFour2: { name: 'I–IV · 2 bars per chord', bars: 2, kind: 'parallel', roots: [0,5], letters: [0,3], roman: ['I','IV'] },
  fourths1: { name: 'Cycle of fourths · 1 bar per chord', bars: 1, kind: 'parallel', cycle: true, roots: [0,5,10,3,8,1,6,11,4,9,2,7], roman: ['I','IV','♭VII','♭III','♭VI','♭II','♭V','VII','III','VI','II','V'] },
  fourths2: { name: 'Cycle of fourths · 2 bars per chord', bars: 2, kind: 'parallel', cycle: true, roots: [0,5,10,3,8,1,6,11,4,9,2,7], roman: ['I','IV','♭VII','♭III','♭VI','♭II','♭V','VII','III','VI','II','V'] },
  major251: { name: 'Jazz major ii–V–I · 4 bars', bars: 1, kind: 'jazz', roman: ['ii9','V7alt','Imaj9♯11'], steps: [
    { root: 2, letter: 1, chord: 'min9', mode: 'dorian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7alt', mode: 'altered', bars: 1 },
    { root: 0, letter: 0, chord: 'maj9sharp11', mode: 'lydian', bars: 2 },
  ] },
  minor251: { name: 'Jazz minor iiø–V–i · 4 bars', bars: 1, kind: 'jazz', roman: ['iiø11','V7♭9','i6'], steps: [
    { root: 2, letter: 1, chord: 'halfDim11', mode: 'locrian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7b9', mode: 'phrygian_dominant', bars: 1 },
    { root: 0, letter: 0, chord: 'min6', mode: 'melodic_minor', bars: 2 },
  ] },
  turnaround: { name: 'Jazz ii–V–I–VI turnaround · 4 bars', bars: 1, kind: 'jazz', roman: ['ii9','V13','Imaj9','VI7alt'], steps: [
    { root: 2, letter: 1, chord: 'min9', mode: 'dorian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'maj9', mode: 'major', bars: 1 },
    { root: 9, letter: 5, chord: 'dom7alt', mode: 'altered', bars: 1 },
  ] },
  jazzBlues: { name: '12-bar jazz blues', bars: 1, kind: 'jazz', roman: ['I13','IV13','I13','I13','IV13','♯iv°7','I6/9','VI7alt','ii9','V13','I6/9','V7alt'], steps: [
    { root: 0, letter: 0, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 5, letter: 3, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 5, letter: 3, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 6, letter: 3, chord: 'dim7', mode: 'ultralocrian', bars: 1 },
    { root: 0, letter: 0, chord: 'sixNine', mode: 'major', bars: 1 },
    { root: 9, letter: 5, chord: 'dom7alt', mode: 'altered', bars: 1 },
    { root: 2, letter: 1, chord: 'min9', mode: 'dorian', bars: 1 },
    { root: 7, letter: 4, chord: 'dom13', mode: 'mixolydian', bars: 1 },
    { root: 0, letter: 0, chord: 'sixNine', mode: 'major', bars: 1 },
    { root: 7, letter: 4, chord: 'dom7alt', mode: 'altered', bars: 1 },
  ] },
  diatonic: { name: 'Diatonic seventh I–vi–IV–V · 1 bar per chord', bars: 1, kind: 'diatonic', roman: ['Imaj7','vi7','IVmaj7','V7'] },
  ...MODAL_PROGRESSIONS,
};
export function progressionDefinition(settings) {
  if(settings.template==='custom'&&settings.customProgression?.steps?.length)return settings.customProgression;
  return PROGRESSIONS[settings.template || 'parallel1'];
}
export function progressionDurations(settings) {
  const template = progressionDefinition(settings);
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
  const definition = progressionDefinition(settings);
  step = ((step % definition.roman.length) + definition.roman.length) % definition.roman.length;
  const jazz = settings.progression && definition.kind === 'jazz' ? definition.steps[step] : null;
  const modal = settings.progression && definition.kind === 'modal' ? definition.steps[step] : null;
  const custom = settings.progression && definition.kind === 'custom' ? definition.steps[step] : null;
  const change = jazz || modal || custom;
  const mode = modal ? definition.mode : change?.mode || modeId(settings);
  if (settings.progression && template === 'diatonic') {
    const scale = MODES[mode].intervals;
    const degree = [0,5,3,4][step];
    const degrees = [degree, degree + 2, degree + 4, degree + 6];
    const midi = degrees.map(i => 48 + settings.key + scale[i % 7] + 12 * Math.floor(i / 7));
    const scaleNames = modeNotes(settings.key, mode);
    const chordId=modalSeventh(mode,degree),chord=CHORDS[chordId];
    const intervalNames={0:'1',3:'♭3',4:'3',6:'♭5',7:'5',8:'♯5',9:'6',10:'♭7',11:'7'};
    return { name: scaleNames[degree], suffix: chord.symbol, tones: degrees.map(i => scaleNames[i % 7]), intervals: chord.intervals.map(i=>chordId==='dim7'&&i===9?'♭♭7':intervalNames[i]), midi,
      scaleNames, scalePcs: scale.map(i => (settings.key + i) % 12), chordPcs: midi.map(i => i % 12),
      mode, chordId, roman: mode === 'minor' ? ['i7','VImaj7','iv7','v7'][step] : PROGRESSIONS.diatonic.roman[step] };
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
  const bassPc=custom&&Number.isInteger(custom.bass)?(settings.key+custom.bass)%12:null;
  const bassName=bassPc===null?'':spellPitch(settings.key,custom.bassLetter??0,custom.bass,ROOT_NAMES[settings.key]);
  const suffix=chord.symbol+(bassPc!==null&&bassPc!==key?`/${bassName}`:'');
  return { name, suffix, tones, intervals, midi, bassMidi:bassPc===null||bassPc===key?null:36+bassPc, scaleNames, scalePcs, chordPcs: midi.map(i => i % 12),
    mode, chordId, roman: settings.progression ? definition.roman[step] : 'I' };
}
