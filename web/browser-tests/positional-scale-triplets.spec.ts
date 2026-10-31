import {test,expect} from '@playwright/test';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor} from '../src/guitar/fretboard.js';
const pitches=async(page:any,slot:number)=>page.locator(`.exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));

test('positional triplets follow uninterrupted scale and arpeggio cycles for every starting degree and direction',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('II');}
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C');
 for(const study of ['positional','positionalscale']){
  await page.locator('#exercise-study').selectOption(study);await page.locator('#exercise-rhythm').selectOption('triplets');
  await expect(page.locator('#exercise-phrase')).toHaveCount(0);await expect(page.locator('#exercise-start-note option')).toHaveCount(5);
  for(const motion of ['ascending','descending']){
   await page.locator('#exercise-motion').selectOption(motion);
   const available=[...new Set(board.notes.filter(n=>study==='positional'?h.chordPcs.includes(n.pc):h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
   const span=study==='positionalscale'?available:motion==='ascending'?available.slice(0,9):available.slice(-9),ordered=motion==='ascending'?span:span.toReversed(),cycle=[...ordered,...ordered.slice(1,-1).toReversed()];
   for(const start of ['default','1:0','3:0','5:0','7:0']){
    expect(await page.locator(`#exercise-start-note option[value="${start}"]`).evaluate((n:HTMLOptionElement)=>n.disabled)).toBe(false);
    await page.locator('#exercise-start-note').selectOption(start);
    const offset=start==='default'?0:ordered.findIndex(midi=>h.intervals[h.chordPcs.indexOf(midi%12)]?.match(/\d+/)?.[0]===start.split(':')[0]);
    const written=(await Promise.all([0,1,2,3].map(slot=>pitches(page,slot)))).flat();
    expect(written).toEqual(Array.from({length:48},(_,i)=>cycle[(offset+i)%cycle.length]));
    await expect(page.locator('.notation-rest')).toHaveCount(0);
   }
  }
 }
 const times=await page.locator('.exercise-note').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('data-start-beat'))));times.forEach((time,i)=>expect(time).toBeCloseTo(i/3,8));
 await page.locator('#exercise-favourite').click();await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-favourites').selectOption('0');
 await expect(page.locator('#exercise-start-note')).toHaveValue('7:0');await expect(page.locator('#exercise-rhythm')).toHaveValue('triplets');await expect(page.locator('#exercise-phrase')).toHaveCount(0);
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('180');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:6000});await page.locator('#exercise-preview').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});

test('legacy triplet phrases restore as continuous traversals while preserving an explicit starting degree',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-exercise-favourites',JSON.stringify([{study:'positional',rhythm:'triplets',motion:'ascending',phrase:'turnaround',startTone:'5:0',material:'seventh'},{study:'positionalscale',rhythm:'triplets',motion:'ascending',phrase:'balancedcycle',startTone:'3:0',material:'seventh'}])));
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('II');}
 for(const [index,start,first]of [[0,'5:0',52],[1,'3:0',48]] as const){
  await page.locator('#exercise-favourites').selectOption(String(index));await expect(page.locator('#exercise-start-note')).toHaveValue(start);await expect(page.locator('#exercise-phrase')).toHaveCount(0);expect((await pitches(page,0))[0]).toBe(first);await expect(page.locator('.exercise-note')).toHaveCount(48);
 }
 expect((await pitches(page,1)).slice(0,5)).toEqual([69,71,72,74,72]);
});
