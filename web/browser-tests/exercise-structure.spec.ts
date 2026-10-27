import {test,expect} from '@playwright/test';
test('exercise, playback, position, view and saving have separate control groups',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:1000});await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 for(const id of ['exercise-study','exercise-material','exercise-motion','exercise-rhythm','exercise-stage'])await expect(page.locator(`.exercise-definition #${id}`)).toBeVisible();
 for(const id of ['exercise-preview','exercise-tempo','exercise-loop','exercise-backing','exercise-play-range','exercise-clear-range'])await expect(page.locator(`.exercise-playback-panel #${id}`)).toBeVisible();
 for(const id of ['exercise-display','exercise-zoom','exercise-map-toggle','exercise-focus'])await expect(page.locator(`.exercise-viewbar #${id}`)).toBeVisible();
 for(const id of ['exercise-favourites','exercise-favourite','exercise-export','exercise-print'])await expect(page.locator(`.exercise-footer #${id}`)).toBeVisible();
 await expect(page.locator('[data-learning-study],.exercise-practice-bar,.exercise-tempo #exercise-display')).toHaveCount(0);
 await page.locator('#exercise-tempo').fill('73');await page.locator('#exercise-tempo').dispatchEvent('change');await expect(page.locator('#exercise-tempo')).toHaveValue('73');
 await page.locator('.exercise-setup summary').click();await expect(page.locator('.exercise-setup #exercise-auto-tempo')).toBeVisible();await expect(page.locator('.exercise-setup #exercise-auto-target')).toBeVisible();await expect(page.locator('.exercise-setup #exercise-display')).toHaveCount(0);
 await page.locator('#exercise-rhythm').selectOption('triplets');await expect(page.locator('#exercise-rhythm')).toHaveValue('triplets');await expect(page.locator('#exercise-tempo')).toHaveValue('73');
 await page.locator('#exercise-display').selectOption('tab');await expect(page.locator('.notation-scroll')).toHaveClass(/display-tab/);await page.locator('#exercise-display').selectOption('both');
 await page.locator('#exercise-study').selectOption('grip');await expect(page.locator('#exercise-study')).toHaveValue('grip');await expect(page.locator('.exercise-note')).not.toHaveCount(0);
 await page.locator('#exercise-favourite').click();await expect(page.locator('#exercise-favourites option')).toHaveCount(2);
 await page.locator('.exercise-definition').screenshot({path:'/workspace/exercise-definition.png'});await page.locator('#caged-exercise').screenshot({path:'/workspace/exercise-restructured.png'});
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await expect(page.locator('#exercise-tempo')).toBeVisible();expect(errors).toEqual([]);
});
