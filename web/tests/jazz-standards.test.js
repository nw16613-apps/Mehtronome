import {test} from 'node:test';import assert from 'node:assert/strict';
import {JAZZ_STANDARDS} from '../src/practice/jazz-standards.js';import{normalizeRepertoire,rehearsalSections}from'../src/practice/repertoire.js';import{harmonyAt,progressionBeatDurations}from'../src/audio/music.js';import{chordSheet}from'../src/practice/chord-sheet.js';import{readPresets}from'../src/practice/presets.js';
test('standard forms, split bars, references and harmonic detail survive storage and transposition',()=>{
 for(const s of JAZZ_STANDARDS){
  const p=s.progression,total=p.steps.reduce((n,s)=>n+(s.beats??s.bars*4),0);assert.equal(total,s.barCount*4);assert.equal(rehearsalSections(p,4).length,s.id.startsWith('blue-bossa')?2:4);
  assert.ok(p.sourceNotes.includes('Practice arrangement: extensions'));assert.ok(p.sources[0].url.startsWith('https://'));
  const restored=normalizeRepertoire({version:1,items:[{...s,progression:p} ]})[0];assert.deepEqual(restored.progression,p);
  const preset=readPresets(JSON.stringify({version:1,items:[{id:s.id,name:s.name,controls:{},customProgression:p}]}))[0];assert.deepEqual(preset.customProgression,p);
  for(const key of [0,s.key,11]){const settings={key,beats:4,progression:true,template:'custom',customProgression:p};assert.equal(progressionBeatDurations(settings).reduce((a,b)=>a+b),total);for(let i=0;i<p.steps.length;i++){const h=harmonyAt(settings,i);assert.equal(h.chordPcs[0],(key+p.steps[i].root)%12);assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));}}
  const settings={key:s.key,beats:4,progression:true,template:'custom',customProgression:p},names=p.steps.map((_,i)=>{const h=harmonyAt(settings,i);return h.name+h.suffix;});const html=chordSheet(names,progressionBeatDurations(settings),4,{marks:p.steps.map(s=>s.section||'')});assert.equal((html.match(/class="chart-measure"/g)||[]).length,s.barCount);
 }
 const all=JAZZ_STANDARDS.find(s=>s.id==='all-the-things');assert.ok(all.progression.steps.length>32);assert.equal(all.progression.steps.at(-1).chord,'dom13');
 const another=JAZZ_STANDARDS.find(s=>s.id==='another-you');assert.equal(another.progression.steps.filter(s=>s.beats===2).length,10);assert.equal(another.progression.steps[9].chord,'dom13sharp11');
});

test('one practice chart per tune retains foundations and mode-defining extensions',()=>{
 assert.equal(JAZZ_STANDARDS.length,4);assert.equal(new Set(JAZZ_STANDARDS.map(s=>s.name)).size,4);
 const get=id=>JAZZ_STANDARDS.find(s=>s.id===id);
 const all=get('all-the-things');assert.equal(all.progression.steps[20].chord,'min13');assert.equal(all.progression.steps[23].chord,'dom9sharp5');assert.equal(all.progression.steps[4].chord,'maj9sharp11');
 const baker=get('another-you');assert.equal(baker.key,5);assert.equal(baker.progression.steps[3].chord,'dom7b9');assert.equal(baker.progression.steps[9].chord,'dom13sharp11');assert.equal(baker.progression.steps.at(-2).chord,'maj9');
 assert.equal(get('blue-bossa').progression.steps[3].chord,'dom13');assert.equal(get('autumn-leaves').progression.steps[5].chord,'dom7b9b13');
});
