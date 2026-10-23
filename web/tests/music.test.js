import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, CHORDS, SOUNDS, compatibleChords, harmonyAt, modeNotes, pedalNotes, pedalLabels } from '../src/audio/music.js';
import { Engine } from '../src/audio/engine.js';

test('suggested chords and all selectable chord tones fit each mode in every key', () => {
  for (const [mode, definition] of Object.entries(MODES)) {
    const chords = compatibleChords(mode);
    assert.ok(chords.includes(definition.chord), `${mode} default must be available`);
    for (let key = 0; key < 12; key++) {
      const scale = modeNotes(key, mode);
      assert.equal(new Set(scale).size, 7);
      for (const chord of chords) {
        const settings = { key, mode, chord };
        const pitches = pedalNotes(settings);
        const labels = pedalLabels(settings);
        assert.equal(pitches.length, CHORDS[chord].intervals.length);
        assert.ok(labels.every(note => scale.includes(note)));
        assert.ok(pitches.every(note => definition.intervals.includes((note - 48 - key) % 12)));
      }
    }
  }
});

test('characteristic modal notes are spelled by scale degree', () => {
  assert.deepEqual(modeNotes(0, 'lydian'), ['C','D','E','F♯','G','A','B']);
  assert.deepEqual(modeNotes(0, 'dorian'), ['C','D','E♭','F','G','A','B♭']);
  assert.deepEqual(modeNotes(0, 'phrygian'), ['C','D♭','E♭','F','G','A♭','B♭']);
  assert.deepEqual(modeNotes(0, 'locrian'), ['C','D♭','E♭','F','G♭','A♭','B♭']);
  assert.deepEqual(modeNotes(8, 'locrian'), ['A♭','B♭♭','C♭','D♭','E♭♭','F♭','G♭']);
  assert.deepEqual(pedalNotes({ key: 0, chord: 'maj9sharp11' }), [48,52,55,59,62,66]);
});

test('each ambient sound generates a distinct, bounded signal with six chord voices', () => {
  const outputs = [];
  for (const sound of Object.keys(SOUNDS)) {
    const engine = new Engine();
    engine.configure({ mode: 'lydian', chord: 'maj9sharp11', sound, click: 0, harmony: 1, countIn: false });
    engine.reset();
    const output = new Float32Array(48000);
    engine.render(output);
    assert.equal(engine.frequencies.length, 6);
    assert.ok(output.every(sample => Number.isFinite(sample) && Math.abs(sample) < .5));
    assert.ok(output.some(sample => Math.abs(sample) > .02));
    outputs.push(output);
  }
  for (let i = 0; i < outputs.length; i++) for (let j = i + 1; j < outputs.length; j++) assert.notDeepEqual(outputs[i], outputs[j]);
});

test('click and harmony are separate so ambient processing cannot blur the click', () => {
  const engine = new Engine();
  engine.configure({ countIn: false, click: 0, harmony: 1, chord: 'min13' });
  engine.reset();
  const click = new Float32Array(48000);
  const harmony = new Float32Array(48000);
  engine.render(click, () => {}, harmony);
  assert.ok(click.every(sample => sample === 0));
  assert.ok(harmony.some(sample => Math.abs(sample) > .02));
});

test('switching chord sizes and sounds keeps audio finite and fades fully on stop', () => {
  const engine = new Engine();
  engine.configure({ countIn: false, click: 0 });
  engine.reset();
  const output = new Float32Array(8000);
  for (const chord of ['maj9sharp11', 'major', 'min13', 'halfDim', 'nineSus']) {
    engine.configure({ chord, sound: 'air' });
    engine.render(output);
    assert.ok(output.every(x => Number.isFinite(x) && Math.abs(x) < .7));
  }
  engine.running = false;
  engine.render(new Float32Array(48000));
  engine.render(output);
  assert.ok(output.every(x => Math.abs(x) < 1e-8));
});

test('minor families are exact rotations, including raised and double-flat degrees', () => {
  const melodic = Object.values(MODES).filter(mode => mode.family === 'Melodic minor');
  const harmonic = Object.values(MODES).filter(mode => mode.family === 'Harmonic minor');
  assert.equal(Object.keys(MODES).length, 21);
  for (const [family, parent] of [[melodic, [0,2,3,5,7,9,11]], [harmonic, [0,2,3,5,7,8,11]]]) {
    assert.equal(family.length, 7);
    family.forEach((mode, degree) => assert.deepEqual(mode.intervals, parent.map((_, i) => (parent[(degree + i) % 7] - parent[degree] + 12) % 12)));
  }
  assert.deepEqual(modeNotes(0, 'melodic_minor'), ['C','D','E♭','F','G','A','B']);
  assert.deepEqual(modeNotes(0, 'harmonic_minor'), ['C','D','E♭','F','G','A♭','B']);
  assert.deepEqual(MODES.ultralocrian.degrees, ['1','♭2','♭3','♭4','♭5','♭6','♭♭7']);
});

test('parallel root movement preserves all 33 chord types in every starting key', async () => {
  const { harmonyAt } = await import('../src/audio/music.js');
  for (const chord of Object.keys(CHORDS)) for (let key = 0; key < 12; key++) {
    for (let step = 0; step < 4; step++) {
      const harmony = harmonyAt({key, mode:'dorian', chord, progression:true, template:'parallel1'}, step);
      const root = (key + [0,3,6,9][step]) % 12;
      assert.deepEqual(harmony.midi, CHORDS[chord].intervals.map(interval => 48 + root + interval));
      assert.equal(harmony.suffix, CHORDS[chord].symbol);
      assert.equal(harmony.tones.length, harmony.midi.length);
      assert.ok(harmony.tones.every(label => typeof label === 'string' && label.length > 0));
    }
  }
  const settings = {key:0, mode:'major', chord:'maj7', progression:true};
  assert.deepEqual([0,1,2,3].map(step => harmonyAt(settings,step).name), ['C','E♭','G♭','A']);
  assert.deepEqual(harmonyAt(settings,2).tones, ['G♭','B♭','D♭','F']);
  assert.deepEqual(harmonyAt({...settings,chord:'minor'},2).tones, ['G♭','B♭♭','D♭']);
});

test('I–IV templates preserve all chord types and transpose to the fourth in every key', async () => {
  const { harmonyAt, progressionStep } = await import('../src/audio/music.js');
  for (const template of ['oneFour1','oneFour2']) for (const chord of Object.keys(CHORDS)) for (let key=0;key<12;key++) {
    const settings = { key, chord, mode:'major', progression:true, template };
    assert.deepEqual(harmonyAt(settings,0).midi, CHORDS[chord].intervals.map(n=>48+key+n));
    assert.deepEqual(harmonyAt(settings,1).midi, CHORDS[chord].intervals.map(n=>48+(key+5)%12+n));
    assert.equal(harmonyAt(settings,1).suffix,CHORDS[chord].symbol);
  }
  assert.equal(harmonyAt({key:8,chord:'maj7',progression:true,template:'oneFour1'},1).name,'D♭');
  assert.deepEqual([0,1,2,3,4].map(bar=>progressionStep({template:'oneFour2'},bar)),[0,0,1,1,0]);
});

test('jazz changes use conventional chord qualities, tonal roots, and compatible scale guides', async () => {
  const { PROGRESSIONS, harmonyAt, progressionDurations } = await import('../src/audio/music.js');
  for (const template of ['major251','minor251','turnaround','jazzBlues']) {
    const definition = PROGRESSIONS[template];
    assert.equal(progressionDurations({template}).reduce((a,b)=>a+b),template==='jazzBlues'?12:4);
    for (let key=0;key<12;key++) for(let step=0;step<definition.steps.length;step++) {
      const harmony=harmonyAt({key,mode:'altered',chord:'fifth',progression:true,template},step);
      const entry=definition.steps[step];
      assert.deepEqual(harmony.midi,CHORDS[entry.chord].intervals.map(n=>48+(key+entry.root)%12+n));
      assert.ok(harmony.chordPcs.every(pc=>harmony.scalePcs.includes(pc)));
      assert.equal(harmony.mode,entry.mode);
      assert.equal(harmony.tones.length,harmony.midi.length);
    }
  }
  const settings={key:0,progression:true};
  const names=template=>PROGRESSIONS[template].roman.map((_,step)=>{
    const h=harmonyAt({...settings,template},step);return h.name+h.suffix;
  });
  assert.deepEqual(names('major251'),['Dm9','G7alt','Cmaj9♯11']);
  assert.deepEqual(names('minor251'),['Dm7♭5(add11)','G7♭9','Cm6']);
  assert.deepEqual(names('turnaround'),['Dm9','G13','Cmaj9','A7alt']);
  assert.deepEqual(names('jazzBlues'),['C13','F13','C13','C13','F13','F♯dim7','C6/9','A7alt','Dm9','G13','C6/9','G7alt']);
});

test('cycle of fourths visits all twelve roots, retains every chord type and uses readable enharmonic names',async()=>{
  const {harmonyAt,progressionStep}=await import('../src/audio/music.js');
  for(const template of ['fourths1','fourths2'])for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++){
    const settings={key,chord,mode:'major',progression:true,template};
    const roots=[];
    for(let step=0;step<12;step++){
      const h=harmonyAt(settings,step);
      roots.push(h.midi[0]%12);
      assert.deepEqual(h.midi,CHORDS[chord].intervals.map(n=>48+(key+step*5)%12+n));
      assert.equal(h.suffix,CHORDS[chord].symbol);
    }
    assert.equal(new Set(roots).size,12);
    for(let i=0;i<12;i++)assert.equal((roots[(i+1)%12]-roots[i]+12)%12,5);
    assert.equal(progressionStep(settings,template==='fourths2'?24:12),0);
  }
  assert.deepEqual(Array.from({length:12},(_,step)=>harmonyAt({key:0,chord:'maj7',progression:true,template:'fourths1'},step).name),['C','F','B♭','E♭','A♭','D♭','G♭','B','E','A','D','G']);
});

test('arpeggio intervals retain extensions and altered chord spelling', () => {
  const settings = { key: 0, mode: 'major', progression: true, template: 'major251' };
  assert.deepEqual(harmonyAt(settings, 1).intervals, ['1','3','♭5','♭7','♭9','♯9']);
  assert.equal(harmonyAt(settings, 1).mode, 'altered');
  assert.deepEqual(harmonyAt(settings, 2).intervals, ['1','3','5','7','9','♯11']);
  assert.equal(harmonyAt(settings, 2).mode, 'lydian');
  assert.deepEqual(harmonyAt({...settings, progression:false, chord:'dim7'}).intervals, ['1','♭3','♭5','♭♭7']);
  assert.deepEqual(harmonyAt({...settings, template:'diatonic'}, 1).intervals, ['1','♭3','5']);
});
