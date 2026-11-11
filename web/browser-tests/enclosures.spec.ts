import {test,expect} from '@playwright/test';
test('Study enclosure controls change notation, retain favourites and work on mobile',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();
 await page.locator('#study-material').selectOption('enclosures4');await page.locator('#study-load').click();
 await expect(page.locator('#exercise-study')).toHaveValue('enclosures4');
 await expect(page.locator('#exercise-enclosure-pattern option')).toHaveCount(12);
 const notation=page.locator('.notation-scroll');await expect(notation.locator('svg').first()).toBeVisible();
 const before=await notation.innerHTML();await page.locator('#exercise-enclosure-pattern').selectOption('lower');expect(await notation.innerHTML()).not.toBe(before);
 await page.locator('#exercise-enclosure-target').selectOption('1');await expect(page.locator('#exercise-enclosure-target')).toHaveValue('1');
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-enclosure-target').selectOption('0');await page.locator('#exercise-favourites').selectOption('0');
 await expect(page.locator('#exercise-enclosure-target')).toHaveValue('1');await expect(page.locator('#exercise-enclosure-pattern')).toHaveValue('lower');
 await page.locator('#exercise-study').selectOption('enclosures5');await expect(page.locator('#exercise-enclosure-pattern option')).toHaveCount(12);
 await page.locator('#exercise-rhythm').selectOption('triplets');await expect(notation.locator('svg').first()).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.locator('#exercise-enclosure-pattern').scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:'/workspace/enclosures-mobile.png'});expect(errors).toEqual([]);
});
