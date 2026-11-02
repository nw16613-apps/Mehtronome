import {test} from 'node:test';import assert from 'node:assert/strict';
import {CHORDS,MODES} from '../src/audio/music.js';import {chordChoicesForMode,compatibleChordForMode,scaleChoicesForChord} from '../src/practice/scale-explorer.js';
test('mode-first suggestions are the reciprocal of every supported chord-first pairing',()=>{
 for(const mode of Object.keys(MODES)){
  const choices=chordChoicesForMode(mode),ids=choices.map(c=>c.id);assert.equal(new Set(ids).size,ids.length);
  for(const chord of Object.keys(CHORDS)){const forward=scaleChoicesForChord(chord).some(c=>c.id===mode&&c.compatible);assert.equal(ids.includes(chord),forward,`${mode} ${chord}`);}
  for(const choice of choices)if(choice.strict){const pcs=new Set(MODES[mode].intervals.map(n=>n%12));assert.ok(CHORDS[choice.id].intervals.every(n=>pcs.has(n%12)));}
 }
});
test('mode changes retain compatible qualities and choose a valid default for incompatible ones',()=>{
 assert.equal(compatibleChordForMode('dorian','min7'),'min7');assert.equal(compatibleChordForMode('dorian','dom7'),MODES.dorian.chord);
 const major=compatibleChordForMode('major','min7');assert.equal(major,MODES.major.chord);assert.ok(chordChoicesForMode('major').some(c=>c.id===major));
 assert.ok(chordChoicesForMode('lydian').some(c=>c.id==='maj13sharp11'));assert.ok(!chordChoicesForMode('major').some(c=>c.id==='maj13sharp11'));
 assert.ok(chordChoicesForMode('altered').some(c=>c.id==='dom7alt'));assert.ok(!chordChoicesForMode('altered').some(c=>c.id==='dom7'));
});
test('reduced collections explicitly distinguish omitted chord tones and invalid modes are rejected',()=>{
 const choice=chordChoicesForMode('major_pentatonic').find(c=>c.id==='maj7');assert.ok(choice);assert.equal(choice.strict,false);assert.match(choice.explanation,/omits/);
 assert.deepEqual(chordChoicesForMode('not-a-mode'),[]);assert.equal(compatibleChordForMode('not-a-mode','min7'),'');
});

test('mode-first structure groups retain every match exactly once and separate reduced guides',async()=>{
 const {modeChordGroups}=await import('../src/practice/scale-explorer.js');
 for(const mode of Object.keys(MODES)){
  const groups=modeChordGroups(mode),all=groups.flatMap(g=>g.choices);
  assert.deepEqual(all.map(c=>c.id).sort(),chordChoicesForMode(mode).map(c=>c.id).sort());
  for(const group of groups)assert.ok(group.choices.every(c=>c.strict===!group.label.startsWith('Reduced guides')));
 }
 const groups=modeChordGroups('major');
 assert.ok(groups.find(g=>g.label==='Triads').choices.some(c=>c.id==='major'));
 assert.ok(groups.find(g=>g.label==='Sevenths').choices.some(c=>c.id==='maj7'));
 assert.ok(groups.find(g=>g.label==='Sixths & added tones').choices.some(c=>c.id==='sixNine'));
 assert.ok(groups.find(g=>g.label==='Extensions & alterations').choices.some(c=>c.id==='maj13'));
});

test('added modal colours retain their defining pitch and work in charts and playback',async()=>{
 const {recommendedMode,normalizeCustomProgression}=await import('../src/practice/custom-progression.js');
 const {harmonyAt}=await import('../src/audio/music.js');const {Engine}=await import('../src/audio/engine.js');
 for(const [chord,mode,colour] of [['addSharp11','lydian',6],['min7b13','minor',8],['min7sharp11','dorian_sharp4',6],['dom7add11','mixolydian',5]]){
  assert.equal(recommendedMode(chord),mode);assert.ok(chordChoicesForMode(mode).some(c=>c.id===chord&&c.strict));
  assert.ok(!chordChoicesForMode('major').some(c=>c.id===chord));
  const settings={key:0,chord,mode,progression:false,countIn:false,click:0,harmony:1};
  const harmony=harmonyAt(settings);assert.ok(harmony.chordPcs.includes(colour));assert.ok(harmony.tones.every(n=>/^[A-G][♯♭]*$/.test(n)));
  const engine=new Engine(8000);engine.configure(settings);engine.reset();assert.ok(engine.chordMidi.every(Number.isFinite));assert.ok(engine.padVoicing.length);
  assert.equal(normalizeCustomProgression({steps:[{root:0,chord,bars:1}]}).steps[0].mode,mode);
 }
});
