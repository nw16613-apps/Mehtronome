import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,TUNING,cagedPositionFor} from '../src/guitar/fretboard.js';
import {dropVoices,chordMaterial,chordVoicings,scaleChord,voiceLeadingCost} from '../src/guitar/chord-library.js';
import {chordStudyPlan,chordAttacks} from '../src/practice/chord-studies.js';import {chordAudioEvents} from '../src/practice/chord-audio.js';import {chordNotationSvg} from '../src/practice/chord-notation.js';
const harmony=(key=9,chord='min7',mode='dorian')=>harmonyAt({key,chord,mode}),position=h=>({...cagedPositionFor(fretboardFor(h,'C')),geometryShape:'C'});
test('drop transformations lower exactly the named close-position voices',()=>{const close=[60,64,67,71];assert.deepEqual(dropVoices(close,'close'),close);assert.deepEqual(dropVoices(close,'drop2'),[55,60,64,71]);assert.deepEqual(dropVoices(close,'drop3'),[52,60,67,71]);assert.deepEqual(dropVoices(close,'drop24'),[48,55,64,71]);assert.deepEqual(dropVoices([60,64,67],'spread'),[52,60,67]);});
test('generated drop voicings sound the exact transformed pitches on distinct strings and playable frets',()=>{
 for(let key=0;key<12;key++)for(const [id,mode]of [['maj7','major'],['min7','dorian'],['dom7','mixolydian'],['halfDim','locrian']])for(const family of ['drop2','drop3','drop24']){
  const h=harmony(key,id,mode),material=chordMaterial(h),voicings=chordVoicings(material,fretboardFor(h,'C'),{family,region:'neck'});assert.ok(voicings.length,`${key} ${id} ${family}`);
  for(const g of voicings){assert.equal(g.notes.length,4);assert.equal(new Set(g.notes.map(n=>n.string)).size,4);assert.deepEqual(new Set(g.notes.map(n=>n.pc)),new Set(h.chordPcs));assert.equal(material.chordPcs[g.inversion],g.notes[0].pc);for(const n of g.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>=0&&n.fret<=20);}const frets=g.notes.filter(n=>n.fret>0).map(n=>n.fret);assert.ok(Math.max(...frets)-Math.min(...frets)<=4);}
 }
});
test('bass inversion and string-set filters are exact; impossible requests produce no invented shapes',()=>{
 const h=harmony(),m=chordMaterial(h),b=fretboardFor(h,'C');for(let inversion=0;inversion<4;inversion++){const gs=chordVoicings(m,b,{family:'drop2',strings:'4321',inversion:String(inversion),region:'neck'});assert.ok(gs.length);assert.ok(gs.every(g=>g.inversion===inversion&&g.stringSet==='4321'));}
 assert.deepEqual(chordVoicings(chordMaterial(h,'triad'),b,{family:'drop2'}),[]);assert.deepEqual(chordVoicings(m,b,{family:'drop3',strings:'321'}),[]);
});
test('material preserves triads, suspended tones, diminished fifths and real rootless colours',()=>{
 const h=harmony();assert.deepEqual(chordMaterial(h,'triad').intervals,['1','♭3','5']);assert.deepEqual(chordMaterial(h,'shell').intervals,['1','♭3','♭7']);assert.equal(chordMaterial(harmony(9,'minor','minor'),'shell'),null);
 const rootless=chordMaterial(harmony(9,'halfDim','locrian'),'rootless');assert.ok(rootless.intervals.includes('♭5'));assert.ok(rootless.intervals.includes('♭9'));assert.equal(rootless.chordPcs.length,4);
 assert.ok(chordMaterial(harmony(9,'min7','minor'),'rootless').intervals.includes('♭13'));
 const guides=chordMaterial(h,'guide');assert.deepEqual(guides.intervals,['♭3','♭7']);assert.ok(chordVoicings(guides,fretboardFor(h,'C'),{family:'close',region:'neck'}).length);
});
test('diatonic chord scales have correct degree spelling and distinguish construction from root movement',()=>{
 const h=harmony(0,'maj7','major'),names=['Cmaj7','Dm7','Em7','Fmaj7','G7','Am7','Bø7'];for(let degree=0;degree<7;degree++){const c=scaleChord(h,degree);assert.deepEqual(c.chordPcs,[0,2,4,5,7,9,11].filter(pc=>c.chordPcs.includes(pc)).sort((a,b)=>(a-c.chordPcs[0]+12)%12-(b-c.chordPcs[0]+12)%12));assert.equal(c.name,names[degree][0]);assert.equal(c.chordPcs.length,4);}
 assert.deepEqual(scaleChord(h,0,'seventh','fourths').tones,['C','E','F','B']);assert.deepEqual(new Set(scaleChord(h,0,'seventh','fifths').tones),new Set(['C','G','D','A']));
 const ninth=scaleChord(h,0,'extensions');assert.ok(ninth.intervals.includes('9'));assert.ok(chordMaterial(ninth,'extensions').intervals.includes('9'));
});
test('inversion cycles cover all four bass voices on one string set without rests',()=>{
 const h=harmony(),p=position(h),b=chordStudyPlan(Array(4).fill(h),[4,4,4,4],Array(4).fill(p),{study:'inversions',family:'drop2',region:'neck',rhythm:'quarter'});assert.equal(b.plan.events.length,16);assert.deepEqual(b.plan.warnings,[]);assert.deepEqual(b.plan.events.slice(0,4).map(e=>e.note.grip.inversion),[0,1,2,3]);assert.equal(new Set(b.plan.events.map(e=>e.note.grip.stringSet)).size,1);
});
test('voice-leading prefers a common-tone grip and chord rhythms retain rests and chart duration',()=>{
 const a={notes:[{string:2,midi:60},{string:3,midi:64}],score:0};assert.equal(voiceLeadingCost(a,a),0);assert.ok(voiceLeadingCost(a,{notes:[{string:2,midi:61},{string:3,midi:65}],score:0})>0);
 assert.deepEqual(chordAttacks(4,4,'offbeats').map(e=>e.at),[.5,1.5,2.5,3.5]);assert.deepEqual(chordAttacks(4,4,'syncopated').map(e=>e.at),[0,1.5,2.5]);assert.deepEqual(chordAttacks(3,4,'held'),[{at:0,duration:3}]);
});
test('one chord event produces four simultaneous audio voices and one selectable notation attack',()=>{
 const h=harmony(),p=position(h),{plan}=chordStudyPlan([h],[4],[p],{family:'drop2',region:'neck',rhythm:'held'}),audio=chordAudioEvents(plan.events,10,120);assert.equal(audio.length,4);assert.ok(audio.every(e=>e.at===10&&e.length===2));assert.ok(audio.every(e=>e.gainScale===.5));const strum=chordAudioEvents(plan.events,10,120,true);assert.ok(strum[3].at>strum[0].at);assert.ok(strum.every(e=>Math.abs(e.at+e.length-12)<1e-8));const svg=chordNotationSvg(plan,'Chord study',{chordDiagrams:true});assert.equal((svg.match(/class="exercise-note"/g)||[]).length,1);assert.equal((svg.match(/data-voice-midi/g)||[]).length,4);assert.equal((svg.match(/class="tab-fret"/g)||[]).length,4);assert.ok(svg.includes('notation-chord-diagram'));
});
test('third-stacked chord scales preserve every diatonic seventh quality and usable written ninth',async()=>{
 const {CHORDS}=await import('../src/audio/music.js');const h=harmony(0,'maj7','major'),qualities=['maj7','min7','min7','maj7','dom7','min7','halfDim'];
 for(let degree=0;degree<7;degree++){const c=scaleChord(h,degree),root=c.chordPcs[0];assert.deepEqual(new Set(c.chordPcs.map(pc=>(pc-root+12)%12)),new Set(CHORDS[qualities[degree]].intervals));const ninth=chordMaterial(scaleChord(h,degree,'extensions'),'extensions');assert.ok(ninth);assert.equal(ninth.chordPcs.length,4);}
});
test('voice-leading route chooses minimum movement on the requested strings through ii–V–I',()=>{
 const hs=[harmony(2,'min7','dorian'),harmony(7,'dom7','mixolydian'),harmony(0,'maj7','major')],path=hs.map(position),{plan}=chordStudyPlan(hs,[4,4,4],path,{study:'voiceleading',family:'drop2',strings:'4321',region:'neck',rhythm:'held'});assert.equal(plan.events.length,3);assert.deepEqual(plan.warnings,[]);
 for(let i=1;i<3;i++){const before=plan.events[i-1].note.grip,selected=plan.events[i].note.grip,candidates=chordVoicings(chordMaterial(hs[i]),fretboardFor(hs[i],'C'),{family:'drop2',strings:'4321',region:'neck'});assert.equal(voiceLeadingCost(before,selected),Math.min(...candidates.map(g=>voiceLeadingCost(before,g))));}
});
test('offbeat notation prints the rests before each chord and held three-beat chords print a dot',()=>{
 const h=harmony(),p=position(h),offbeat=chordStudyPlan([h],[4],[p],{family:'drop2',strings:'4321',region:'neck',rhythm:'offbeats'}),held=chordStudyPlan([h],[3],[p],{family:'drop2',region:'neck',rhythm:'held'});
 const svg=chordNotationSvg(offbeat.plan,'Offbeats');assert.equal((svg.match(/class="notation-rest"/g)||[]).length,4);assert.ok(svg.includes('time-signature'));assert.ok(chordNotationSvg(held.plan,'Hold').includes('duration-dot'));
});
test('automatic string sets cover complete major, minor and Dorian chord scales in every key',()=>{
 for(const [chord,mode]of [['maj7','major'],['min7','minor'],['min7','dorian']])for(let key=0;key<12;key++){const h=harmony(key,chord,mode),b=chordStudyPlan([h],[8],[position(h)],{study:'scale',family:'drop2',region:'neck',rhythm:'quarter'});assert.equal(b.plan.events.length,8);assert.deepEqual(b.plan.warnings,[]);assert.equal(new Set(b.plan.events.map(e=>e.note.grip.stringSet)).size,1);}
});
test('rootless voicings do not mark their lowest colour tone as the chord root',()=>{
 const h=harmony(),m=chordMaterial(h,'rootless'),gs=chordVoicings(m,fretboardFor(h,'C'),{family:'drop2',region:'neck'});assert.ok(gs.length);assert.ok(gs.every(g=>g.notes.every(n=>!n.root)));
});
test('extended voicings retain the named highest and altered extensions',()=>{
 for(const [chord,mode,required]of [['minSixNine','dorian',['6','9']],['dom13','mixolydian',['13']],['min11','dorian',['11']],['maj13sharp11','lydian',['♯11','13']],['dom7b9b13','phrygian_dominant',['♭9','♭13']]]){const m=chordMaterial(harmony(9,chord,mode),'extensions');assert.ok(m,chord);for(const interval of required)assert.ok(m.intervals.includes(interval),`${chord} must retain ${interval}`);assert.ok(m.intervals.some(i=>['3','♭3'].includes(i)));assert.ok(m.intervals.some(i=>['6','7','♭7'].includes(i)));}
 const add=chordMaterial(harmony(9,'add9','major'),'extensions');assert.equal(add.chordPcs.length,4);assert.ok(add.intervals.includes('9'));
});
test('inversion cycles ascend or descend in sounding register even with a low CAGED reference',()=>{
 const h=harmony(),p={...cagedPositionFor(fretboardFor(h,'D')),geometryShape:'D'};
 for(const motion of ['ascending','descending']){const {plan}=chordStudyPlan([h],[4],[p],{study:'inversions',family:'drop2',strings:'4321',region:'neck',rhythm:'quarter',motion});assert.equal(plan.events.length,4);const bass=plan.events.map(e=>e.note.midi);for(let i=1;i<4;i++)assert.ok(motion==='ascending'?bass[i]>bass[i-1]:bass[i]<bass[i-1]);}
});
test('custom chord scales transpose interval formulas through every mode degree',async()=>{
 const {parseChordFormula,referenceChord}=await import('../src/guitar/chord-library.js');const {normalizedChordOptions}=await import('../src/practice/chord-controls.js');
 const h=harmony(0,'maj7','major');
 for(let degree=0;degree<7;degree++){
  const c=scaleChord(h,degree,'triad','root95');assert.deepEqual(new Set(c.chordPcs),new Set([0,1,4].map(i=>h.scalePcs[(degree+i)%7])));assert.ok(c.intervals.some(i=>i.endsWith('9')));
  const custom=scaleChord(h,degree,'triad','custom','1,9,5');assert.deepEqual(custom.chordPcs,c.chordPcs);
  assert.ok(chordVoicings(custom,fretboardFor(h,'C'),{family:'spread',region:'neck'}).length);
  assert.deepEqual(referenceChord(h,{explore:'scale',construction:'root95',degree,material:'triad'}).chordPcs,c.chordPcs);
 }
 assert.deepEqual(parseChordFormula('1, 9, 5'),[1,9,5]);for(const bad of ['1,1,5','1,2,9','1,0,5','1,14,5','1','1,3,5,7,9','oops'])assert.equal(parseChordFormula(bad),null,bad);
 assert.equal(normalizedChordOptions({construction:'custom',formula:'3,7',family:'drop2'}).family,'close');assert.equal(normalizedChordOptions({construction:'root95',family:'drop3'}).family,'spread');
});
