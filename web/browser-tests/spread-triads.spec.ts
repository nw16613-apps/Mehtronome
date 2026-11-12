import {test,expect} from '@playwright/test';
test('spread triads select every string combination, synchronize the map, and transfer exact inversions to practice',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();
 await page.locator('#fretboard-fingering').selectOption('spread');
 await expect(page.locator('#drop-string-set option')).toHaveCount(20);
 for(let i=0;i<20;i++){
  await page.locator('#drop-string-set').selectOption(String(i));
  await expect(page.locator('.per-string-gallery .per-string-scroll')).toHaveCount(3);
 }
 await page.locator('.per-string-shape[data-start-degree="2"]').click();
 await expect(page.locator('#per-string-neck-shape')).toHaveValue('2');
 await expect(page.locator('.per-string-selected h4')).toContainText('Second inversion');
 const expected=await page.locator('.per-string-selected .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));
 await page.locator('[data-practise-per-string]').click();
 await expect(page.locator('#exercise-fingering')).toHaveValue('spread');
 await expect(page.locator('#exercise-fingering-set')).toHaveValue('19');
 await expect(page.locator('#exercise-inversion')).toHaveValue('2');
 await expect(page.locator('#exercise-content-material')).toHaveValue('triad');
 const actual=await page.locator('.exercise-map-diagram .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/string (\d+), fret (\d+)/)!.slice(1)));
 expect(actual).toEqual(expected);
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#exercise-fingering')).toBeVisible();expect(errors).toEqual([]);
});
