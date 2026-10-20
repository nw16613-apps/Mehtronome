import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {WAVES,bandFor} from '../src/audio/waves.js';

function magnitude(samples,frequency,rate){
  let real=0,imaginary=0;
  for(let i=0;i<samples.length;i++){
    const phase=2*Math.PI*frequency*i/rate;
    real+=samples[i]*Math.cos(phase);imaginary-=samples[i]*Math.sin(phase);
  }
  return Math.hypot(real,imaginary)/samples.length;
}
test('rendered presets have contrasting spectra: round pad, rich strings and glass overtones',()=>{
  const spectra={};
  for(const sound of ['bloom','strings','atmosphere']){
    const engine=new Engine(16000);
    engine.configure({sound,key:9,chord:'major',countIn:false,click:0,harmony:1});engine.reset();
    const samples=new Float32Array(48000);engine.render(samples);
    const steady=samples.subarray(32000);
    const fundamental=magnitude(steady,220,16000);
    spectra[sound]=[440,1100].map(frequency=>magnitude(steady,frequency,16000)/fundamental);
  }
  assert.ok(spectra.strings[0]>spectra.bloom[0]*8);
  assert.ok(spectra.strings[0]>spectra.atmosphere[0]*1.5);
  assert.ok(spectra.atmosphere[1]>spectra.bloom[1]*2);
});

test('wave tables are finite, seamless and reduce harmonics near Nyquist',()=>{
  for(const bands of Object.values(WAVES))for(const table of bands){
    assert.ok(table.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));
    assert.equal(table[0],table.at(-1));
  }
  assert.ok(bandFor(1800,8000)<bandFor(1800,48000));
});

test('sequence does not replay frozen tails after being switched off and back on',()=>{
  const engine=new Engine(8000);
  engine.configure({countIn:false,click:0,harmony:0,sequence:true,sequenceDensity:1,sequenceVolume:1});engine.reset();
  engine.render(new Float32Array(1000));
  engine.configure({sequence:false});engine.render(new Float32Array(24000));
  engine.configure({sequence:true,sequenceDensity:0});
  const output=new Float32Array(8000);engine.render(output);
  assert.ok(output.every(x=>x===0));
});
