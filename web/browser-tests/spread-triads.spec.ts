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
for(const kind of ['oneTwo','twoOne','drop2','drop3'])test(`${kind}: mode-degree source, map and exercise handoff agree`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption(kind);await expect(page.locator('#spread-triad-source')).toBeVisible();await page.locator('#spread-triad-source').selectOption('mode');
 const cards=page.locator('.per-string-gallery .per-string-shape');expect(await cards.count()).toBeGreaterThan(4);const ids=await cards.evaluateAll(nodes=>nodes.map(n=>Number((n as HTMLElement).dataset.startDegree)));const id=ids.find(i=>i>23)!;expect(id).toBeGreaterThan(23);
 await page.locator(`.per-string-shape[data-start-degree="${id}"]`).click();await expect(page.locator('#per-string-neck-shape')).toHaveValue(String(id));
 const expected=await page.locator('.per-string-selected .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));const heading=await page.locator('.per-string-selected h4').textContent();
 await page.locator('[data-practise-per-string]').click();await expect(page.locator('#exercise-fingering')).toHaveValue(kind);await expect(page.locator('#exercise-spread-source')).toHaveValue('mode');await expect(page.locator('#exercise-inversion')).toHaveValue(String(id));await expect(page.locator('.exercise-map-heading strong')).toContainText(heading!);
 const actual=await page.locator('.exercise-map-diagram .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));expect(actual).toEqual(expected);
 await page.locator('#exercise-spread-source').selectOption('chord');await expect(page.locator('#exercise-inversion option')).toHaveCount(4);expect(errors).toEqual([]);
});
for(const kind of ['spread','oneTwo','twoOne','drop2','drop3'])test(`${kind}: mode inversion filter keeps original shape identities and practice selection`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption(kind);await expect(page.locator('#fretboard-mode-inversion')).toBeHidden();await page.locator('#spread-triad-source').selectOption('mode');
 const size=kind==='spread'?3:4;await expect(page.locator('#fretboard-mode-inversion option')).toHaveCount(size+1);
 for(let inversion=0;inversion<size;inversion++){
  await page.locator('#fretboard-mode-inversion').selectOption(String(inversion));
  const cards=page.locator('.per-string-gallery .per-string-shape'),ids=await cards.evaluateAll(nodes=>nodes.map(n=>Number((n as HTMLElement).dataset.startDegree)));expect(ids.length).toBeGreaterThan(0);expect(ids.every(id=>id%size===inversion)).toBe(true);
  await expect(page.locator('#per-string-neck-shape option')).toHaveCount(ids.length+1);
 }
 const card=page.locator('.per-string-gallery .per-string-shape').last(),id=await card.getAttribute('data-start-degree');await card.click();await expect(page.locator('#per-string-neck-shape')).toHaveValue(id!);await expect(page.locator('.per-string-selected h4')).toContainText(kind==='spread'?'Second inversion':'Third inversion');
 await page.locator('#fretboard-mode-inversion').selectOption('all');expect(await page.locator('.per-string-gallery .per-string-shape').count()).toBeGreaterThan(7);
 await page.locator('#fretboard-mode-inversion').selectOption(String(size-1));await page.locator(`.per-string-shape[data-start-degree="${id}"]`).click();await page.locator('[data-practise-per-string]').click();await expect(page.locator('#exercise-inversion')).toHaveValue(id!);await expect(page.locator('#exercise-spread-source')).toHaveValue('mode');expect(errors).toEqual([]);
});
for(const kind of ['spread','oneTwo','twoOne','drop2','drop3'])test(`${kind}: mode degree and inversion menus combine without changing shape identity`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption(kind);await expect(page.locator('#fretboard-mode-degree')).toBeHidden();await page.locator('#spread-triad-source').selectOption('mode');await expect(page.locator('#fretboard-mode-degree option')).toHaveCount(8);
 const size=kind==='spread'?3:4;
 for(let degree=0;degree<7;degree++){
  await page.locator('#fretboard-mode-degree').selectOption(String(degree));const ids=await page.locator('.per-string-gallery .per-string-shape').evaluateAll(nodes=>nodes.map(n=>Number((n as HTMLElement).dataset.startDegree)));expect(ids.length).toBeGreaterThan(0);expect(ids.every(id=>Math.floor(id/size)===degree)).toBe(true);
 }
 await page.locator('#fretboard-mode-inversion').selectOption('1');await expect(page.locator('.per-string-gallery .per-string-shape')).toHaveCount(1);const id=6*size+1;await page.locator(`.per-string-shape[data-start-degree="${id}"]`).click();await expect(page.locator('#per-string-neck-shape')).toHaveValue(String(id));await expect(page.locator('.per-string-selected h4')).toContainText('Degree ♭7');await expect(page.locator('.per-string-selected h4')).toContainText('First inversion');
 await page.locator('#fretboard-mode-degree').selectOption('all');expect(await page.locator('.per-string-gallery .per-string-shape').count()).toBeGreaterThan(1);await page.locator('#fretboard-mode-degree').selectOption('6');await page.locator('[data-practise-per-string]').click();await expect(page.locator('#exercise-inversion')).toHaveValue(String(id));expect(errors).toEqual([]);
});
