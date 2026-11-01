import {test} from 'node:test';import assert from 'node:assert/strict';import {chordStepsInRange} from '../src/practice/chart-edit-selection.js';import {chordSheet} from '../src/practice/chord-sheet.js';
test('inclusive drags select whole chord entries touched, including partial and reversed ranges',()=>{
 const durations=[4,8,4,4];assert.deepEqual(chordStepsInRange(durations,5,12),[1,2]);assert.deepEqual(chordStepsInRange(durations,12,5),[1,2]);assert.deepEqual(chordStepsInRange(durations,4,11),[1]);assert.deepEqual(chordStepsInRange(durations,11,12),[1,2]);assert.deepEqual(chordStepsInRange(durations,0,19),[0,1,2,3]);
});
test('sheet editing highlights all selected entries without changing the chord or timing data',()=>{
 const html=chordSheet(['Am7','D7','Gm7'],[4,8,4],4,{selected:1,selectedSteps:[1,2],loopBeats:[5,6,7,8,9,10,11,12]});assert.equal((html.match(/aria-pressed="true"/g)||[]).length,12);assert.equal((html.match(/class="chart-beat/g)||[]).length,16);assert.ok(html.includes('Editing chords'));
});
test('manual CAGED identities and entry degrees can be retained across edited harmony',async()=>{
 const {harmonyAt}=await import('../src/audio/music.js'),{manualPositionPath,manualPositionRoute,progressionPositionPath}=await import('../src/guitar/position-path.js'),{patternStartRoute,patternStartRouteValue}=await import('../src/practice/pattern-start-route.js');
 const before=[harmonyAt({key:9,chord:'min7',mode:'dorian'}),harmonyAt({key:2,chord:'dom7',mode:'mixolydian'})],after=[harmonyAt({key:11,chord:'maj7',mode:'major'}),harmonyAt({key:5,chord:'min7',mode:'dorian'})];
 const choices=['III','V'],stored=manualPositionRoute(after,choices),path=manualPositionPath(after,progressionPositionPath(after),stored);assert.deepEqual(path.path.map(p=>p.numeral),choices);assert.notEqual(manualPositionRoute(before,choices),stored);
 assert.deepEqual(patternStartRoute(after,patternStartRouteValue(after,['3:0','5:0'])).choices,['3:0','5:0']);
});
