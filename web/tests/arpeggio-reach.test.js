import test from 'node:test';import assert from 'node:assert/strict';import {harmonyAt,MODES} from '../src/audio/music.js';import {fingeringCatalogue,arpeggioFretReach,ARPEGGIO_MAX_FRET_REACH} from '../src/guitar/fingering-catalogue.js';
test('alternating-string triads retain every inversion through a six-fret per-string reach',()=>{
 assert.equal(ARPEGGIO_MAX_FRET_REACH,6);for(let key=0;key<12;key++)for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian'])for(const kind of ['oneTwo','twoOne']){const h=harmonyAt({key,mode,chord:MODES[mode].chord}),entries=fingeringCatalogue(h,kind,0,'chord',4,{material:'triad',arpeggioSource:'selectedChord'});assert.equal(entries.length,3);assert.ok(entries.every(e=>e.choices.length));assert.ok(entries.every(e=>e.choices.every(b=>b.end<=24&&arpeggioFretReach(b)<=6)));}
});
test('five- and six-fret reaches are retained for minor and diminished triads',()=>{
 for(const [mode,reach]of [['dorian',5],['locrian',6]]){const h=harmonyAt({key:9,mode,chord:MODES[mode].chord});for(const kind of ['oneTwo','twoOne'])assert.ok(fingeringCatalogue(h,kind,0,'chord',4,{material:'triad',arpeggioSource:'selectedChord'}).some(e=>e.choices.some(b=>arpeggioFretReach(b)===reach)));}
});
test('unavailable inversions retain their catalogue identity and explanation',()=>{
 const h={...harmonyAt({key:9,mode:'dorian',chord:'min7'}),chordPcs:[9,10,11],tones:['A','Bb','B'],intervals:['1','♭2','2']},entries=fingeringCatalogue(h,'oneTwo',0,'chord',4,{material:'triad',arpeggioSource:'selectedChord'});assert.equal(entries.length,3);assert.ok(entries.some(e=>!e.choices.length));for(const e of entries.filter(e=>!e.choices.length))assert.match(e.unavailableReason,/six-fret reach/);
});
