import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt,MODES} from '../src/audio/music.js';import {fretboardFor,diagramSvg,fullFretboardFor,fullFretboardSvg} from '../src/guitar/fretboard.js';import {fretboardCollection,collectionBoard} from '../src/guitar/fretboard-study.js';import {theoryOptions} from '../src/guitar/superimposition.js';import {readPresets,PRESET_CONTROLS} from '../src/practice/presets.js';import {exerciseCollectionBoard} from '../src/guitar/scale-collection.js';
const coordinates=b=>b.notes.map(n=>[n.pc,n.midi,n.string,n.fret]);
test('primary pentatonic styling retains the exact selected notes and physical geometry in every key and diatonic mode',()=>{
 for(let key=0;key<12;key++)for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian']){
  const h=harmonyAt({key,mode,chord:MODES[mode].chord}),parent=fretboardFor(h,'E');
  for(const choice of theoryOptions(h).pentatonics){
   const v={study:'positionalscale',scaleCollection:'pentatonic',source:choice.id,fingering:'caged'},c=fretboardCollection(h,v),b=collectionBoard(parent,c),expected=parent.notes.filter(n=>choice.pcs.includes(n.pc));
   assert.deepEqual(coordinates(b),coordinates({notes:expected}));assert.ok(b.notes.every(n=>n.collectionStyle==='pentatonic'&&n.chromaticDegree));assert.ok(b.notes.every(n=>n.collectionRoot===(n.pc===choice.rootPc)));assert.deepEqual(b.notes.map(n=>n.root),expected.map(n=>n.root));
   const svg=diagramSvg(b,true,MODES[mode].degrees,'Selected pentatonic',true);assert.match(svg,/class="fretboard theory-pentatonic/);assert.doesNotMatch(svg,/undefined|outside the selected overlay/);assert.equal((svg.match(/class="fret-note/g)||[]).length,b.notes.length);
   const full=collectionBoard(fullFretboardFor(h,1,17),c),map=fullFretboardSvg(full,true,MODES[mode].degrees,'Full map');assert.match(map,/theory-pentatonic/);assert.doesNotMatch(map,/undefined/);
  }
 }
});
test('exercise diagram boards carry the same styling metadata without changing note coordinates',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),choice=theoryOptions(h).pentatonics.find(p=>p.rootPc===4),parent=fretboardFor(h,'D'),v={study:'groups3',scaleCollection:'pentatonic',source:choice.id,fingering:'caged'},b=exerciseCollectionBoard(parent,h,v);assert.deepEqual(coordinates(b),coordinates({notes:parent.notes.filter(n=>choice.pcs.includes(n.pc))}));assert.ok(b.notes.every(n=>n.collectionStyle==='pentatonic'&&n.collectionRoot===(n.pc===4)));
});
test('old saved overlay controls are retired while other setup choices remain intact',()=>{
 const controls={'theory-view':'pentatonic','theory-choice':'pent-7-minor','theory-view-I':'triads','theory-choice-I':'old-pair',bpm:'112'},items=readPresets(JSON.stringify({version:1,items:[{id:'old',name:'Legacy setup',controls}]}));assert.equal(items.length,1);assert.deepEqual(items[0].controls,{bpm:'112'});assert.ok(PRESET_CONTROLS.every(id=>!id.startsWith('theory-')));
});
