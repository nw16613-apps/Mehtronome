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
