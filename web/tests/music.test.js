import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, CHORDS, SOUNDS, compatibleChords, modeNotes, pedalNotes, pedalLabels } from '../src/audio/music.js';
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

test('piano voicings retain a stable root, fit every mode, and offer four distinct choices', async () => {
  const { PIANO_STYLES, pianoPreset } = await import('../src/audio/music.js');
  for (const mode of Object.keys(MODES)) {
    for (let key = 0; key < 12; key++) {
      const versions = [];
      for (const voicing of Object.keys(PIANO_STYLES)) {
        const settings = { key, mode, voicing };
        const preset = pianoPreset(settings);
        const notes = pedalNotes(settings);
        assert.deepEqual(notes, preset.notes);
        assert.equal(notes[0], 48 + key);
        assert.ok(notes.length >= 3 && notes.length <= 6);
        assert.equal(new Set(notes).size, notes.length);
        assert.ok(notes.every(note => note >= 48 + key && note <= 48 + key + 27));
        assert.ok(notes.every(note => MODES[mode].intervals.includes((note - 48 - key) % 12)), mode);
        assert.ok(pedalLabels(settings).every(label => modeNotes(key, mode).includes(label)));
        versions.push(JSON.stringify(notes));
      }
      assert.equal(new Set(versions).size, 4, mode);
    }
  }
  assert.deepEqual(pedalNotes({key:0, mode:'major', voicing:'shell'}), [48,59,64,74]);
  assert.deepEqual(pedalNotes({key:0, mode:'major', voicing:'open'}), [48,55,59,64,74]);
  assert.deepEqual(pedalNotes({key:0, mode:'major', voicing:'upper'}), [48,64,67,71,74]);
  assert.deepEqual(pedalNotes({key:0, mode:'dorian', voicing:'color'}), [48,58,63,65,69,74]);
});

test('worklet synthesis follows the selected piano preset and switches cleanly', () => {
  const engine = new Engine();
  engine.configure({mode:'dorian', voicing:'color', countIn:false, click:0});
  engine.reset();
  assert.deepEqual(engine.frequencies, [48,58,63,65,69,74].map(note => 440 * 2 ** ((note - 69) / 12)));
  const output = new Float32Array(12000);
  for (const voicing of ['shell','open','color','upper','custom']) {
    engine.configure({voicing});
    engine.render(output);
    assert.ok(output.every(sample => Number.isFinite(sample) && Math.abs(sample) < .7));
    assert.ok(output.some(sample => Math.abs(sample) > .005));
  }
});
