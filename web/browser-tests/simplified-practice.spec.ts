import {test,expect} from '@playwright/test';
test('removed tools stay absent while CAGED, charts, guidance and progress remain usable',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 for(const target of ['guitar-title','caged-exercise','progress-title','harmony-title']){
  await page.locator(`[data-workspace-target="${target}"]`).click();
  await expect(page.locator('[data-open-shells],[data-open-drops],[data-open-ear],[data-open-recording],#ear-title,#recording-title,.practice-journal')).toHaveCount(0);
 }
 await page.locator('#repertoire-study').selectOption('minorjazz');await page.locator('#repertoire-practise').click();
 await expect(page.locator('#exercise-study')).toHaveValue('harmonized');
 await expect(page.locator('#exercise-study option[value="shells"],#exercise-study option[value="shellphrases"],#exercise-study option[value="drops"]')).toHaveCount(0);
 await expect(page.locator('.exercise-map-diagram')).toBeVisible();await expect(page.locator('.exercise-lesson')).toBeVisible();
 await page.locator('#exercise-stage').selectOption('cell');await expect(page.locator('#exercise-study')).toHaveValue('harmonized');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
