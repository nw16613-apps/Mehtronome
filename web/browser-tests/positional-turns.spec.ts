import {test,expect} from '@playwright/test';
test('II to III keeps the reported two-beat halves in notation, TAB and playback',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of [[0,'II'],[1,'II'],[2,'III'],[3,'III']] as const){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 const groups=await page.locator('.exercise-note').evaluateAll(nodes=>[0,1,2,3].map(slot=>nodes.filter(n=>Number(n.getAttribute('data-group-index'))===slot).map(n=>n.getAttribute('aria-label')!.split(',')[0])));
 expect(groups[0]).toEqual(groups[1]);expect(groups[2]).toEqual(['E','G','A','C','E','G','A','C','E','C','A','G','E','C','A','G']);expect(groups[3]).toEqual(groups[2]);
 await expect(page.locator('.exercise-note[data-note-index="32"]')).toHaveAttribute('aria-label',/^E, string 6, fret 12,/);await expect(page.locator('.exercise-note[data-note-index="32"]')).toHaveAttribute('data-start-beat','8');await expect(page.locator('.exercise-note[data-note-index="40"]')).toHaveAttribute('aria-label',/^E, string 1, fret 12,/);await expect(page.locator('.exercise-note[data-note-index="40"]')).toHaveAttribute('data-start-beat','10');
 const captions=await page.locator('.exercise-score .exercise-degree').allTextContents();expect(captions).toEqual(['Position II · D shape','Position II · D shape','Position III · C shape','Position III · C shape']);
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="2"]').first()).toBeVisible({timeout:8000});await expect(page.locator('.exercise-map-heading')).toContainText('Position III');await page.locator('#exercise-preview').click();await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('all five Am7 positions use the same nine-note phrase and show the selected span',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');
 for(const position of ['I','II','III','IV','V'])for(const motion of ['ascending','descending']){
  await page.locator('.exercise-position-route [data-inspect-slot="0"]').click();await page.locator('#exercise-position').selectOption(position);await page.locator('#exercise-motion').selectOption(motion);
  const notes=await page.locator('.exercise-note[data-group-index="0"]').evaluateAll(nodes=>nodes.map(n=>{const text=n.getAttribute('aria-label')!,match=text.match(/^(.+), string (\d), fret (\d+)/)!;const tuning=[0,64,59,55,50,45,40];return {midi:tuning[Number(match[2])]+Number(match[3]),name:match[1]};}));
  expect(notes).toHaveLength(16);expect(new Set(notes.map(n=>n.midi)).size).toBe(9);const first=notes.slice(0,9).map(n=>n.midi),second=notes.slice(8).map(n=>n.midi);expect(first.every((n,i)=>!i||(n-first[i-1])*(motion==='ascending'?1:-1)>0)).toBe(true);expect(second.every((n,i)=>!i||(n-second[i-1])*(motion==='ascending'?-1:1)>0)).toBe(true);
  await expect(page.locator('#exercise-span-status')).toContainText('9-note span');await expect(page.locator('#exercise-span-status')).toContainText('2 beats each way');
  if(['I','IV','V'].includes(position))await expect(page.locator('.exercise-map-diagram .exercise-outside-span').first()).toHaveCSS('opacity','0.25');
 }
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('a shorter triad span is disclosed without leaving the chosen position',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#custom-chord').selectOption('minor');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('.exercise-position-route [data-inspect-slot="0"]').click();await expect(page.locator('#exercise-span-status')).toContainText('fewer than nine pitches available');await expect(page.locator('.exercise-note[data-group-index="0"]').first()).toBeVisible();
});

test('triplets show seven-note phrases with two-beat halves across positions and rhythm changes',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const position of ['I','II','III','IV','V'])for(const motion of ['ascending','descending']){
  await page.locator('.exercise-position-route [data-inspect-slot="0"]').click();await page.locator('#exercise-position').selectOption(position);await page.locator('#exercise-motion').selectOption(motion);
  const notes=await page.locator('.exercise-note[data-group-index="0"]').evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/^(.+), string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[2])]+Number(m[3]);}));
  expect(notes).toHaveLength(12);expect(new Set(notes).size).toBe(7);
  expect(notes.slice(0,7).every((n,i)=>!i||(n-notes[i-1])*(motion==='ascending'?1:-1)>0)).toBe(true);
  expect(notes.slice(6).every((n,i,ns)=>!i||(n-ns[i-1])*(motion==='ascending'?-1:1)>0)).toBe(true);
  await expect(page.locator('#exercise-span-status')).toContainText('7-note span');await expect(page.locator('#exercise-span-status')).toContainText('2 beats each way');await expect(page.locator('#exercise-span-status')).not.toContainText('fewer');
  expect(Number(await page.locator('.exercise-note[data-note-index="6"]').getAttribute('data-start-beat'))).toBeCloseTo(2,10);expect(Number(await page.locator('.exercise-note[data-note-index="12"]').getAttribute('data-start-beat'))).toBeCloseTo(4,10);
 }
 await page.locator('#exercise-rhythm').selectOption('eighths');await expect(page.locator('#exercise-span-status')).toContainText('9-note span');await expect(page.locator('#exercise-span-status')).toContainText('4 beats each way');
 await page.locator('#exercise-rhythm').selectOption('sixteenths');await expect(page.locator('#exercise-span-status')).toContainText('9-note span');await expect(page.locator('#exercise-span-status')).toContainText('2 beats each way');
});
test('full-position triplets cover the diagram and alternate directional forms every bar',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-phrase').selectOption('turnaround');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const position of ['I','II','III','IV','V'])for(const motion of ['ascending','descending']){
  for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
  await page.locator('#exercise-motion').selectOption(motion);
  const notes=await page.locator('.exercise-note').evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/^(.+), string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[2])]+Number(m[3]);}));
  expect(notes).toHaveLength(48);expect(notes.slice(0,24)).toEqual(notes.slice(24));
  const span=[...new Set(notes)].sort((a,b)=>a-b),ordered=motion==='ascending'?span:span.toReversed(),indices=span.length===9?[0,1,2,3,4,5,6,7,8,7,6,7]:[0,1,2,3,4,5,6,7,8,9,8,7];
  expect(notes.slice(0,12)).toEqual(indices.map(i=>ordered[i]));expect(notes.slice(12,24)).toEqual(indices.map(i=>ordered[ordered.length-1-i]));
  await expect(page.locator('#exercise-span-status')).toContainText('Full position');await expect(page.locator('#exercise-span-status')).toContainText('8 beats per phrase');expect(await page.locator('.exercise-map-diagram .exercise-outside-span').count()).toBe(0);
 }
 await page.locator('#exercise-rhythm').selectOption('eighths');await expect(page.locator('#exercise-phrase')).toHaveCount(0);await expect(page.locator('#exercise-span-status')).toContainText('9-note span');
 await page.locator('#exercise-rhythm').selectOption('triplets');await expect(page.locator('#exercise-phrase')).toHaveValue('turnaround');
 await page.locator('#exercise-phrase').selectOption('balanced');await expect(page.locator('#exercise-span-status')).toContainText('7-note span');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('triplet phrase control follows the existing menus without moving them',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>document.fonts.ready);const ids=['exercise-study','exercise-motion','exercise-rhythm','exercise-stage'];
 const geometry=()=>page.evaluate(ids=>{const origin=document.querySelector('.exercise-controls')!.getBoundingClientRect();return ids.map(id=>{const b=document.getElementById(id)!.getBoundingClientRect();return {x:b.x-origin.x,y:b.y-origin.y};});},ids);
 const before=await geometry();await page.locator('#exercise-rhythm').selectOption('triplets');
 const order=await page.locator('.exercise-definition .exercise-controls select:visible').evaluateAll(nodes=>nodes.map(n=>n.id));expect(order).toEqual([...ids,'exercise-phrase']);
 const after=await geometry();expect(after).toEqual(before);
});

test('triplet numerals follow their beams and stay below the chord headings',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-phrase').selectOption('turnaround');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of [[0,'II'],[1,'III'],[2,'IV'],[3,'V']] as const){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 const marks=await page.locator('.exercise-score .tuplet-number').evaluateAll(nodes=>nodes.map(n=>{
  const text=n as SVGTextElement,svg=text.closest('svg')!,beam=svg.querySelector<SVGLineElement>(`.note-beam[data-beam-beat="${text.dataset.tupletBeat}"]`)!,t=text.getBoundingClientRect(),b=beam.getBoundingClientRect(),paper=svg.getBoundingClientRect();
  return {above:t.bottom<b.top,centered:Math.abs((t.left+t.right)/2-(b.left+b.right)/2)<1,inside:t.top>=paper.top+paper.height*45/svg.viewBox.baseVal.height};
 }));
 expect(marks).toHaveLength(16);expect(marks.every(m=>m.above&&m.centered&&m.inside)).toBe(true);
 await page.screenshot({path:'/tmp/turnaround-corrected.png',fullPage:true});
 const second=await page.locator('.exercise-note[data-group-index="1"]').evaluateAll(nodes=>nodes.slice(0,3).map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));expect(second[0]).toBeGreaterThan(second[1]);expect(second[1]).toBeGreaterThan(second[2]);
});
