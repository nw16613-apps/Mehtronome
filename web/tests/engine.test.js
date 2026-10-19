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

test('all subdivision grids produce clicks at exact sample positions', () => {
  for (const subdivision of [1,2,3,4,6]) {
    const engine = new Engine(12000);
    engine.configure({bpm:120, subdivision, harmony:0, accent:false});
    engine.reset();
    const output = new Float32Array(24000);
    engine.render(output);
    const spacing = 6000 / subdivision;
    for (let onset = 6000; onset < output.length; onset += spacing) {
      const window = output.subarray(onset + 1, onset + 100);
      assert.ok(window.some(sample => Math.abs(sample) > .03), `missing subdivision ${subdivision} at ${onset}`);
      assert.equal(output[onset - 100], 0);
    }
    assert.equal(engine.beat, 3); // Subdivisions never advance the bar clock.
  }
});

test('unaccented downbeats have exactly the same click as other beats', () => {
  const engine = new Engine(12000);
  engine.configure({bpm:120, harmony:0, accent:false});
  engine.reset();
  const output = new Float32Array(36000);
  engine.render(output);
  assert.deepEqual(output.slice(18000,18600), output.slice(24000,24600));
  const accented = new Engine(12000);
  accented.configure({bpm:120, harmony:0, accent:true});
  accented.reset();
  accented.render(output);
  assert.notDeepEqual(output.slice(18000,18600), output.slice(24000,24600));
});

test('sextuplets stay synchronized across callback boundaries at awkward tempos', () => {
  const whole = new Engine();
  const chunked = new Engine();
  for (const engine of [whole, chunked]) { engine.configure({bpm:137, subdivision:6}); engine.reset(); }
  const expected = new Float32Array(150000);
  const actual = new Float32Array(150000);
  whole.render(expected);
  for (let i = 0; i < actual.length; i += 128) chunked.render(actual.subarray(i, i + 128));
  assert.deepEqual(actual, expected);
});

test('one- and two-bar templates keep the selected chord for the exact bar count after count-in', () => {
  for (const [template, bars] of [['parallel1',1],['parallel2',2]]) {
    for (const beats of [3,4,7]) {
      const engine = new Engine(1200);
      engine.configure({progression:true, template, chord:'maj7', bpm:240, beats, countIn:true});
      engine.reset();
      const events = [];
      engine.render(new Float32Array(300 * beats * (bars * 4 + 2)), event => {
        if (!event.counting && event.beat === 0) events.push({step:event.step, frequencies:[...engine.frequencies]});
      });
      const expected = Array.from({length:bars*4+1},(_,i)=>Math.floor(i/bars)%4);
      assert.deepEqual(events.map(e=>e.step), expected);
      for (const event of events) {
        const root = [0,3,6,9][event.step];
        assert.deepEqual(event.frequencies, [48,52,55,59].map(note=>440*2**((note+root-69)/12)));
      }
    }
  }
});

test('two-bar progression remains sample-identical across callback boundaries and tempo changes', () => {
  const a = new Engine(1200), b = new Engine(1200);
  for (const engine of [a,b]) {engine.configure({progression:true, template:'parallel2', chord:'min13',bpm:137}); engine.reset();}
  for (const bpm of [137,211]) {
    a.configure({bpm}); b.configure({bpm});
    const whole = new Float32Array(30000), blocks = new Float32Array(30000);
    a.render(whole);
    for (let i=0;i<blocks.length;i+=128) b.render(blocks.subarray(i,i+128));
    assert.deepEqual(blocks,whole);
  }
});

test('two-chord and jazz loops play each chord for the specified bars, including tonic holds and full blues cycles', async () => {
  const {harmonyAt}=await import('../src/audio/music.js');
  const cases={oneFour1:[0,1],oneFour2:[0,0,1,1],major251:[0,1,2,2],minor251:[0,1,2,2],turnaround:[0,1,2,3],jazzBlues:[0,1,2,3,4,5,6,7,8,9,10,11]};
  for(const [template,cycle] of Object.entries(cases)) for(const beats of [3,4,7]) {
    const engine=new Engine(1200);
    engine.configure({template,progression:true,key:2,chord:'min9',bpm:240,beats,countIn:true});
    engine.reset();
    const events=[];
    engine.render(new Float32Array(300*beats*(cycle.length*2+1)),event=>{
      if(!event.counting&&event.beat===0)events.push({step:event.step,frequencies:[...engine.frequencies]});
    });
    assert.deepEqual(events.map(e=>e.step),[...cycle,...cycle],template);
    for(const event of events)assert.deepEqual(event.frequencies,harmonyAt(engine.settings,event.step).midi.map(n=>440*2**((n-69)/12)));
  }
});
