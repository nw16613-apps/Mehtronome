import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Engine, chordNotes } from '../src/audio/engine.js';

test('sample-clock output is independent of callback block size', () => {
  for (const bpm of [90, 137, 240]) {
    const a = new Engine();
    const b = new Engine();
    a.configure({ bpm }); b.configure({ bpm });
    const expected = new Float32Array(150000);
    const actual = new Float32Array(150000);
    a.render(expected);
    for (let offset = 0; offset < actual.length; offset += 128) b.render(actual.subarray(offset, offset + 128));
    assert.deepEqual(actual, expected);
  }
});

test('one-bar count-in is silent without click, then backing starts', () => {
  const engine = new Engine();
  engine.configure({ bpm: 120, click: 0 });
  engine.reset();
  const samples = new Float32Array(120000);
  const events = [];
  engine.render(samples, event => events.push(event));
  assert.ok(samples.subarray(0, 96000).every(x => x === 0));
  assert.ok(samples.subarray(97000).some(x => Math.abs(x) > .01));
  assert.equal(events.filter(e => e.counting).length, 4);
  assert.equal(events[4].counting, false);
});

test('progression changes exactly once per bar after count-in', () => {
  const engine = new Engine(8000);
  engine.configure({ bpm: 120, progression: true });
  engine.reset();
  const events = [];
  engine.render(new Float32Array(8000 * 12), event => events.push(event));
  assert.deepEqual(events.filter(e => !e.counting && e.beat === 0).map(e => e.step), [0, 1, 2, 3, 0]);
});

test('major and natural minor harmony uses diatonic thirds', () => {
  assert.deepEqual(chordNotes(0, false), [48, 52, 55]);
  assert.deepEqual(chordNotes(9, true), [57, 60, 64]);
  assert.deepEqual(chordNotes(0, false, 5), [57, 60, 64]);
  assert.deepEqual(chordNotes(0, true, 4), [55, 58, 62]);
});

test('stop fades to silence and output remains bounded', () => {
  const engine = new Engine();
  engine.configure({ countIn: false, click: 1, harmony: 1 });
  engine.reset();
  const samples = new Float32Array(48000);
  engine.render(samples);
  assert.ok(samples.every(x => Number.isFinite(x) && Math.abs(x) <= .7));
  engine.running = false;
  engine.render(samples);
  assert.ok(samples.subarray(24000).every(x => Math.abs(x) < 1e-8));
});

test('tempo changes preserve beat position and reset restores count-in', () => {
  const engine = new Engine();
  engine.render(new Float32Array(16000));
  assert.equal(engine.phase, 1440000);
  engine.configure({ bpm: 120 });
  const events = [];
  engine.render(new Float32Array(12001), event => events.push(event));
  assert.equal(events.length, 1);
  engine.reset();
  assert.equal(engine.phase, 0);
  assert.equal(engine.remainingCount, 4);
});
