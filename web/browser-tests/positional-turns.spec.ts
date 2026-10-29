import {test,expect} from '@playwright/test';
test('II to III keeps the reported two-beat halves in notation, TAB and playback',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of [[0,'II'],[1,'II'],[2,'III'],[3,'III']] as const){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 const groups=await page.locator('.exercise-note').evaluateAll(nodes=>[0,1,2,3].map(slot=>nodes.filter(n=>Number(n.getAttribute('data-group-index'))===slot).map(n=>n.getAttribute('aria-label')!.split(',')[0])));
 expect(groups[0]).toEqual(groups[1]);expect(groups[2]).toEqual(['E','G','A','C','E','G','A','C','E','C','A','G','E','C','A','G']);expect(groups[3]).toEqual(groups[2]);
 await expect(page.locator('.exercise-note[data-note-index="32"]')).toHaveAttribute('aria-label',/^E, string 6, fret 12,/);await expect(page.locator('.exercise-note[data-note-index="32"]')).toHaveAttribute('data-start-beat','8');await expect(page.locator('.exercise-note[data-note-index="40"]')).toHaveAttribute('aria-label',/^E, string 1, fret 12,/);await expect(page.locator('.exercise-note[data-note-index="40"]')).toHaveAttribute('data-start-beat','10');
 const captions=await page.locator('.exercise-score .exercise-degree').allTextContents();expect(captions).toEqual(['Arpeggio','Arpeggio','Arpeggio','Arpeggio']);
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
