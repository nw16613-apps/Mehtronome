import {test,expect} from '@playwright/test';
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-load').click();}
test('scale and core-arpeggio sequences expose complete grouped menus and save the selected recipe',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 for(const study of ['scaleSequences','arpeggioSequences']){
  await page.locator('#exercise-study').selectOption(study);const prefix=study==='arpeggioSequences'?'arpseq_':'';
  await page.locator('#exercise-scale-family').selectOption('groups');await expect(page.locator('#exercise-scale-pattern option')).toHaveCount(6);if(prefix){await page.locator('#exercise-material').selectOption('triad');}await page.locator('#exercise-scale-pattern').selectOption(prefix+'groups5');await expect(page.locator('#caged-exercise-title')).toContainText('Groups of 5');
  await page.locator('#exercise-scale-family').selectOption('permutations3');await expect(page.locator('#exercise-scale-pattern option')).toHaveCount(6);await page.locator('#exercise-scale-family').selectOption('permutations4');await expect(page.locator('#exercise-scale-pattern option')).toHaveCount(24);
  await page.locator('#exercise-scale-pattern').selectOption(prefix+'scaleperm_3142');await page.locator('#exercise-sequence-order').selectOption('alternate');await page.locator('#exercise-sequence-advance').selectOption('2');
  expect(await page.locator('.exercise-note').count()).toBeGreaterThan(5);await page.locator('#exercise-favourite').click();await expect(page.locator('#exercise-favourite')).toHaveAttribute('aria-pressed','true');
 }
 await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-favourites').selectOption('1');await expect(page.locator('#exercise-study')).toHaveValue('arpeggioSequences');await expect(page.locator('#exercise-scale-pattern')).toHaveValue('arpseq_scaleperm_3142');await expect(page.locator('#exercise-sequence-order')).toHaveValue('alternate');await expect(page.locator('#exercise-sequence-advance')).toHaveValue('2');
 await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await page.locator('#mini-play').click();
 await page.setViewportSize({width:390,height:844});await page.locator('#exercise-scale-family').scrollIntoViewIfNeeded();await page.screenshot({path:'/workspace/sequence-library-mobile.png'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('whole-arpeggio root sequences keep note order and source separate',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await page.locator('#exercise-material').selectOption('triad');await page.locator('#exercise-arpeggio-close').uncheck();await page.locator('#exercise-arpeggio-pattern').selectOption('perm3_135');
 await page.locator('#exercise-arpeggio-sequence').selectOption('thirds');await expect(page.locator('#exercise-arpeggio-pattern')).toHaveValue('perm3_135');await expect(page.locator('#caged-exercise-title')).toContainText('Root sequence Thirds');expect(await page.locator('.exercise-note').count()).toBeGreaterThan(5);
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-arpeggio-sequence').selectOption('stepwise');await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-arpeggio-sequence')).toHaveValue('thirds');
 const labels=await page.locator('.aligned-notation .exercise-degree').allTextContents();expect(labels.some(s=>/\d+ cell/.test(s))).toBe(false);expect(errors).toEqual([]);
});
