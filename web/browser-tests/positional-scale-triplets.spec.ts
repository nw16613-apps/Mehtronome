import {test,expect} from '@playwright/test';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
const pitches=async(page:any,slot:number)=>page.locator(`.exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/^(.+), string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[2])]+Number(m[3]);}));
const line=(h:any,position:string)=>{const board=['C','A','G','E','D'].map(shape=>fretboardFor(h,shape)).find(board=>cagedPositionFor(board).numeral===position)!;return [...new Set(board.notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);};
const form=(ordered:number[])=>{if(ordered.length>=12)return [...ordered.slice(0,12),...ordered.slice(-12)];const run=[...Array(12-ordered.length).fill(ordered[0]),...ordered];return [...run,...run];};
test('full-range scale triplets use two-bar forms and descend in the new position at bar three',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-stage').selectOption('full');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(slot<2?'II':'III');}
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const motion of ['ascending','descending']){
  await page.locator('#exercise-motion').selectOption(motion);
  for(let half=0;half<2;half++){
   const available=line(h,half?'III':'II'),down=(motion==='descending')!==(half===1),ordered=down?available.toReversed():available;
   expect([...(await pitches(page,half*2)),...(await pitches(page,half*2+1))]).toEqual(form(ordered));
  }
  await expect(page.locator('.exercise-note')).toHaveCount(48);await expect(page.locator('.notation-rest')).toHaveCount(0);
 }
 await expect(page.locator('.progression-timing-help')).toContainText('24 triplet notes');await expect(page.locator('#exercise-span-status')).toContainText('17 pitches · 16 beats per phrase');
 const times=await page.locator('.exercise-note').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('data-start-beat'))));times.forEach((time,i)=>expect(time).toBeCloseTo(i/3,8));
 await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="2"]').first()).toBeVisible({timeout:5000});await expect(page.locator('.exercise-map-heading')).toContainText('Position III');await page.locator('#exercise-preview').click();
 await page.locator('#exercise-stage').selectOption('cell');expect(await page.locator('.notation-rest').count()).toBeGreaterThan(0);await expect(page.locator('#exercise-span-status')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('two-bar triplet forms adapt to minor, dominant, major and pentatonic harmony with different positions',async({page})=>{
 const steps=[{root:0,chord:'min13',mode:'dorian',bars:2,bass:null},{root:5,chord:'dom13',mode:'mixolydian',bars:2,bass:null},{root:10,chord:'maj9',mode:'major',bars:2,bass:null},{root:3,chord:'min7',mode:'minor_pentatonic',bars:2,bass:null}];
 await page.addInitScript(steps=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'scale-triplets',name:'Scale triplets',key:9,beats:4,progression:{version:2,name:'Scale triplets',steps}}]})),steps);
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:scale-triplets');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-stage').selectOption('full');await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-position-navigation').selectOption('all');
 const positions=['II','III','IV','V'];for(let slot=0;slot<4;slot++){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(positions[slot]);}
 for(const [slot,step]of steps.entries()){
  const h=harmonyAt({key:(9+step.root)%12,mode:step.mode,chord:step.chord}),available=line(h,positions[slot]),ordered=slot%2?available.toReversed():available,written=await pitches(page,slot);
  expect(written).toHaveLength(24);expect(written).toEqual(form(ordered));expect(written.every(midi=>available.includes(midi))).toBe(true);
  for(const run of [written.slice(0,12),written.slice(12)])for(let i=1;i<run.length;i++)expect(slot%2?run[i]<=run[i-1]:run[i]>=run[i-1]).toBe(true);
 }
 await expect(page.locator('.exercise-note')).toHaveCount(96);await expect(page.locator('.notation-rest')).toHaveCount(0);await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});


test('reported bar two starts from lower F-sharp and ascends to the top before bar three descends',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('I');}
 expect(await pitches(page,1)).toEqual([54,55,57,59,60,62,64,66,67,69,71,72]);expect(await pitches(page,2)).toEqual([72,71,69,67,66,64,62,60,59,57,55,54]);
 await expect(page.locator('.exercise-note[data-note-index="12"]')).toHaveAttribute('aria-label',/^F♯, string 4, fret 4,/);await expect(page.locator('.exercise-note[data-note-index="23"]')).toHaveAttribute('aria-label',/^C, string 1, fret 8,/);
 await expect(page.locator('.notation-rest')).toHaveCount(0);
});

test('four successive assigned positions enter Position III at its upper boundary in bar three',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of ['I','II','III','IV'].entries()){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),top=line(h,'III').toReversed();expect((await pitches(page,2)).slice(0,3)).toEqual(top.slice(0,3));
 await expect(page.locator('.exercise-note[data-note-index="24"]')).toHaveAttribute('data-start-beat','8');await expect(page.locator('.exercise-note[data-note-index="24"]')).toHaveAttribute('aria-label',/^F♯, string 1, fret 14,/);
});
