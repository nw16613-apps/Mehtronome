import {test,expect} from '@playwright/test';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
const pitches=async(page:any,slot=0)=>page.locator(`.exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));
test('balanced variations use the reported E and G starts, mirror downward and save distinctly',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('II');}
 for(const [phrase,line,fret]of [['balanced2',[52,55,57,60,64,67,69],7],['balanced3',[55,57,60,64,67,69,72],10]] as const){
  await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-phrase').selectOption(phrase);
  expect(await pitches(page)).toEqual([...line,...line.slice(1,-1).toReversed()]);await expect(page.locator('.exercise-note[data-note-index="0"]')).toHaveAttribute('aria-label',new RegExp(`string 5, fret ${fret},`));await expect(page.locator('.exercise-note')).toHaveCount(48);await expect(page.locator('.notation-rest')).toHaveCount(0);
  expect(Number(await page.locator('.exercise-note[data-note-index="6"]').getAttribute('data-start-beat'))).toBeCloseTo(2,10);await page.locator('#exercise-favourite').click();
 }
 await expect(page.locator('#exercise-favourites option').nth(1)).toContainText('variation 2');await expect(page.locator('#exercise-favourites option').nth(2)).toContainText('variation 3');
 await page.locator('#exercise-motion').selectOption('descending');await page.locator('#exercise-phrase').selectOption('balanced2');expect(await pitches(page)).toEqual([69,67,64,60,57,55,52,55,57,60,64,67]);await page.locator('#exercise-phrase').selectOption('balanced3');expect(await pitches(page)).toEqual([67,64,60,57,55,52,48,52,55,57,60,64]);
 await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-phrase')).toHaveValue('balanced2');await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-favourites').selectOption('1');await expect(page.locator('#exercise-phrase')).toHaveValue('balanced3');
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:5000});await page.locator('#exercise-preview').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});

test('cycling balanced rotates every two beats, keeps shared attacks and saves the phrase choice',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('II');}
 await page.locator('#exercise-phrase').selectOption('balancedcycle');
 const cycle=[48,52,55,57,60,64,69,67,64,60,57,55,55,57,60,64,67,69,72,69,67,64,60,57,52,55,57,60,64,67,67,64,60,57,55,52];
 const written=(await Promise.all([0,1,2,3].map(slot=>pitches(page,slot)))).flat();expect(written).toEqual([...cycle,...cycle.slice(0,12)]);
 await expect(page.locator('#exercise-span-status')).toContainText('Cycling balanced · 7-note windows · 2 beats per leg');await expect(page.locator('.notation-rest')).toHaveCount(0);
 const joins=await page.locator('.exercise-note').evaluateAll(nodes=>[11,12,29,30].map(i=>({label:nodes[i].getAttribute('aria-label')!.split(',').slice(0,3).join(','),time:Number(nodes[i].getAttribute('data-start-beat'))})));expect(joins[0].label).toEqual(joins[1].label);expect(joins[2].label).toEqual(joins[3].label);expect(joins[1].time-joins[0].time).toBeCloseTo(1/3,10);
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-motion').selectOption('descending');expect(await pitches(page)).toEqual([72,69,67,64,60,57,52,55,57,60,64,67]);
 await page.locator('#exercise-phrase').selectOption('balanced');await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-phrase')).toHaveValue('balancedcycle');await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-phrase')).toHaveValue('balancedcycle');
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:5000});await page.locator('#exercise-preview').click();
 await page.locator('#exercise-stage').selectOption('cell');expect(await page.locator('.notation-rest').count()).toBeGreaterThan(0);await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});

test('cycling variations follow mixed harmony and assigned positions without restarting their phase',async({page})=>{
 const steps=[{root:0,chord:'min7',mode:'dorian',bars:1,bass:null},{root:5,chord:'dom13',mode:'mixolydian',bars:1,bass:null},{root:10,chord:'maj9',mode:'lydian',bars:1,bass:null},{root:3,chord:'min7',mode:'minor_pentatonic',bars:1,bass:null}];
 await page.addInitScript(steps=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'cycling-test',name:'Cycling test',key:9,beats:4,progression:{version:2,name:'Cycling test',steps}}]})),steps);
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:cycling-test');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-phrase').selectOption('balancedcycle');await page.locator('#exercise-position-navigation').selectOption('all');
 const positions=['II','III','IV','V'];for(const [slot,position]of positions.entries()){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 for(const motion of ['ascending','descending']){
  await page.locator('#exercise-motion').selectOption(motion);
  for(const [slot,step]of steps.entries()){
   const h=harmonyAt({key:(9+step.root)%12,mode:step.mode,chord:step.chord}),board=['C','A','G','E','D'].map(shape=>fretboardFor(h,shape)).find(b=>cagedPositionFor(b).numeral===positions[slot])!,line=[...new Set(board.notes.filter(n=>arpeggioHarmony(h).chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),size=Math.min(7,line.length),last=line.length-size;
   const cycle=Array.from({length:6},(_,leg)=>{const down=(motion==='descending')!==(leg%2===1),offset=Math.min(leg%3,last),start=down?last-offset:offset,span=line.slice(start,start+size);return (down?span.toReversed():span).slice(0,size-1);}).flat();expect(await pitches(page,slot)).toEqual(Array.from({length:12},(_,i)=>cycle[(slot*12+i)%cycle.length]));
  }
 }
 await expect(page.locator('.exercise-note')).toHaveCount(48);await expect(page.locator('.notation-rest')).toHaveCount(0);
});
