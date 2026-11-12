import {test,expect} from '@playwright/test';
test('spread triads select every string combination, synchronize the map, and transfer exact inversions to practice',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();
 await page.locator('#fretboard-fingering').selectOption('spread');
 const sets=await page.locator('#drop-string-set option').evaluateAll(nodes=>nodes.map(n=>(n as HTMLOptionElement).value));expect(sets.length).toBeGreaterThan(0);expect(sets.length).toBeLessThan(20);
 for(const i of sets){
  await page.locator('#drop-string-set').selectOption(String(i));
  expect(await page.locator('.per-string-gallery .per-string-scroll').count()).toBeGreaterThan(0);
 }
 await page.locator('#drop-string-set').selectOption('4');await page.locator('.per-string-shape[data-start-degree="2"]').click();
 await expect(page.locator('#per-string-neck-shape')).toHaveValue('2');
 await expect(page.locator('.per-string-selected h4')).toContainText('Second inversion');
 const expected=await page.locator('.per-string-selected .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));
 await page.locator('[data-practise-per-string]').click();
 await expect(page.locator('#exercise-fingering')).toHaveValue('spread');
 await expect(page.locator('#exercise-fingering-set')).toHaveValue('4');
 await expect(page.locator('#exercise-inversion')).toHaveValue('2');
 await expect(page.locator('#exercise-content-material')).toHaveValue('triad');
 const actual=await page.locator('.exercise-map-diagram .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));
 expect(actual).toEqual(expected);
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#exercise-fingering')).toBeVisible();expect(errors).toEqual([]);
});

test('all mode degrees have distinct labels, synchronized map selection and exact practice handoff',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption('spread');await page.locator('#spread-triad-source').selectOption('mode');
 const cards=page.locator('.per-string-gallery .per-string-shape');expect(await cards.count()).toBeGreaterThan(3);
 const ids=await cards.evaluateAll(nodes=>nodes.map(n=>Number((n as HTMLElement).dataset.startDegree)));const id=ids.find(i=>i>8)!;expect(id).toBeGreaterThan(8);
 await page.locator(`.per-string-shape[data-start-degree="${id}"]`).click();await expect(page.locator('#per-string-neck-shape')).toHaveValue(String(id));await expect(page.locator('.per-string-selected h4')).toContainText('Degree');
 const expected=await page.locator('.per-string-selected .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));
 const heading=await page.locator('.per-string-selected h4').textContent();await page.locator('[data-practise-per-string]').click();await expect(page.locator('#exercise-spread-source')).toHaveValue('mode');await expect(page.locator('#exercise-inversion')).toHaveValue(String(id));await expect(page.locator('.exercise-map-heading strong')).toContainText(heading!);
 const actual=await page.locator('.exercise-map-diagram .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));expect(actual).toEqual(expected);
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-spread-source').selectOption('chord');await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-spread-source')).toHaveValue('mode');await expect(page.locator('#exercise-inversion')).toHaveValue(String(id));expect(errors).toEqual([]);
});
