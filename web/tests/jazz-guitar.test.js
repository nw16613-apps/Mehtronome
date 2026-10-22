import test from 'node:test';
import assert from 'node:assert/strict';
import {renderJazzGuitarNote} from '../src/audio/jazz-guitar.js';

test('jazz guitar exercise notes are audible, bounded and decay naturally',()=>{
  const note=renderJazzGuitarNote(48000,57,.8);
  const peak=Math.max(...note.map(Math.abs));
  const early=note.slice(2400,7200).reduce((sum,value)=>sum+value*value,0);
  const late=note.slice(-4800).reduce((sum,value)=>sum+value*value,0);
  assert.equal(note.length,38400);
  assert.ok(note.every(Number.isFinite));
  assert.ok(peak>.2&&peak<1);
  assert.ok(early>late*3);
  assert.notDeepEqual(note,renderJazzGuitarNote(48000,64,.8));
});

test('jazz guitar feedback string stays in tune',()=>{
  const rate=48000,midi=57,expected=440*2**((midi-69)/12),note=renderJazzGuitarNote(rate,midi,.7);
  const start=Math.round(rate*.08),end=Math.round(rate*.45),ideal=rate/expected;
  let bestLag=0,best=-Infinity;
  for(let lag=Math.floor(ideal-4);lag<=Math.ceil(ideal+4);lag++){
    let correlation=0,energyA=0,energyB=0;
    for(let index=start;index<end;index++){const a=note[index],b=note[index-lag];correlation+=a*b;energyA+=a*a;energyB+=b*b;}
    const normalized=correlation/Math.sqrt(energyA*energyB);if(normalized>best){best=normalized;bestLag=lag;}
  }
  const measured=rate/bestLag,cents=1200*Math.log2(measured/expected);
  assert.ok(Math.abs(cents)<12,`pitch error was ${cents.toFixed(1)} cents`);
});
