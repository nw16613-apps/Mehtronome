import {test,expect} from '@playwright/test';
test('CAGED outlines have stable matching colours and selected notes stand out without changing note fills',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();const thumbnail=page.locator('#position-overview [data-overview-position=IV]');await thumbnail.click();
 const colour=await thumbnail.evaluate(e=>getComputedStyle(e).getPropertyValue('--shape-color').trim());expect(colour).not.toBe('');expect(await page.locator('#full-fretboard').evaluate(e=>getComputedStyle(e).getPropertyValue('--shape-color').trim())).toBe(colour);await expect(page.locator('#full-fretboard .shape-selected-ring').first()).toBeVisible();
 expect(await page.locator('#full-fretboard .shape-selected-note').first().evaluate(e=>getComputedStyle(e).opacity)).toBe('1');expect(await page.locator('#full-fretboard .fret-note:not(.shape-selected-note)').first().evaluate(e=>Number(getComputedStyle(e).opacity))).toBeLessThan(.5);
 expect(await page.locator('#full-fretboard .shape-selected-ring').first().evaluate(e=>getComputedStyle(e).fill)).toBe('none');
 const fills=await page.locator('#full-fretboard .fret-note.root>circle:first-of-type').evaluateAll(es=>es.map(e=>getComputedStyle(e).fill));await page.locator('#position-overview [data-overview-position=III]').click();expect(await page.locator('#full-fretboard .fret-note.root>circle:first-of-type').evaluateAll(es=>es.map(e=>getComputedStyle(e).fill))).toEqual(fills);expect(errors).toEqual([]);
});
test('diagonal shape outlines match their cards in every theme and keep the existing layout',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();
 for(const palette of ['midnight','plum','evergreen','soft-stone']){await page.locator('#palette').selectOption(palette);for(const kind of ['three','oneTwo','twoOne']){
  await page.locator('#fretboard-fingering').selectOption(kind);await page.locator('#per-string-neck-shape').selectOption('1');const selected=page.locator('.per-string-shape.map-current');await expect(selected).toHaveAttribute('data-start-degree','1');const color=await selected.evaluate(e=>getComputedStyle(e).getPropertyValue('--shape-color').trim());expect(await page.locator('#full-fretboard').evaluate(e=>getComputedStyle(e).getPropertyValue('--shape-color').trim())).toBe(color);await expect(page.locator('#full-fretboard .shape-boundary')).toHaveCount(1);expect(await page.locator('#full-fretboard .shape-selected-ring').first().evaluate(e=>getComputedStyle(e).fill)).toBe('none');await expect(page.locator('.full-fretboard-panel')).toHaveCount(1);
 }}
 await page.locator('#palette').selectOption('midnight');await page.locator('#full-fretboard-panel').screenshot({path:'/workspace/shape-emphasis-desktop.png'});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.locator('#per-string-neck-shape').selectOption('all');await expect(page.locator('#full-fretboard .shape-boundary,#full-fretboard .shape-selected-ring')).toHaveCount(0);await expect(page.locator('.map-current')).toHaveCount(0);
});

test('CAGED regions and displayed ranges exclude the unused edge fret in the reported Dorian shapes',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();
 for(const [numeral,start,end] of [['V',2,5],['II',7,10],['IV',11,15]] as const){
  await page.locator(`[data-overview-position=${numeral}]`).click();await expect(page.locator('.featured-position .position-heading>span')).toHaveText(`Frets ${start}–${end}`);await expect(page.locator(`[data-overview-position=${numeral}] small`)).toContainText(`${start}–${end}`);
  const rect=page.locator(`#full-fretboard [data-full-position=${numeral}] rect`);expect(Number(await rect.getAttribute('x'))).toBeCloseTo(62+(start-1)*1240/17);expect(Number(await rect.getAttribute('width'))).toBeCloseTo((end-start+1)*1240/17);
  const frets=await page.locator('#full-fretboard .shape-selected-note').evaluateAll((nodes:SVGGElement[])=>nodes.map(n=>Number(n.dataset.fret)));expect(Math.min(...frets)).toBe(start);expect(Math.max(...frets)).toBe(end);expect(await page.locator('.featured-position .fret-number').allTextContents()).toEqual(Array.from({length:end-start+1},(_,i)=>String(start+i)));
 }
});
