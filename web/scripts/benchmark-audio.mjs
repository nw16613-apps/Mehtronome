import { Engine } from '../src/audio/engine.js';

// Measures the synth only; browser/device scheduling and reverb have their own
// costs. Run on the same machine when comparing changes, outside other builds.
const noop = () => {};
const rows = [];
for (const rate of [44100, 48000, 96000]) {
  for (const sound of ['bloom', 'strings', 'atmosphere']) {
    const engine = new Engine(rate);
    engine.configure({sound, mode:'lydian', chord:'maj9sharp11', countIn:false,
      sequence:true, sequenceRate:4, sequenceDensity:1, sequenceVolume:1});
    engine.reset();
    const click = new Float32Array(128);
    const left = new Float32Array(128), right = new Float32Array(128);
    for (let i = 0; i < 300; i++) engine.render(click, noop, left, right);
    const timings = [];
    for (let i = 0; i < 2000; i++) {
      const start = performance.now();
      engine.render(click, noop, left, right);
      timings.push(performance.now() - start);
    }
    timings.sort((a,b) => a-b);
    const mean = timings.reduce((sum,n) => sum+n,0) / timings.length;
    const budget = 128 / rate * 1000;
    rows.push({rate,sound,'mean ms':mean.toFixed(3),'p95 ms':timings[1900].toFixed(3),
      'p99 ms':timings[1980].toFixed(3),'block budget ms':budget.toFixed(3),
      'mean % budget':(mean/budget*100).toFixed(1)});
  }
}
console.table(rows);
