import {test,expect} from '@playwright/test';
test('boundary control stays beside Material across families, cell orders and traversal choices',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target="caged-exercise"]').click();
 const turn=page.locator('.exercise-definition #exercise-neck-turn');await expect(turn).toBeVisible();await expect(page.locator('.neck-traversal-controls #exercise-neck-turn')).toHaveCount(0);
 await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('groups');await page.locator('#exercise-scale-pattern').selectOption('groups3');
 for(const order of ['normal','reverse','alternate','directional']){await page.locator('#exercise-sequence-order').selectOption(order);await expect(turn).toBeVisible();}
 for(const traversal of ['position','horizontal','diagonal']){await page.locator('#exercise-neck-traversal').selectOption(traversal);await expect(turn).toBeVisible();await turn.selectOption('position');await expect(turn).toHaveValue('position');await turn.selectOption('note');}
 await page.locator('#exercise-neck-position-order').selectOption('alternate');await expect(turn).toBeVisible();await turn.selectOption('position');await page.locator('#exercise-neck-traversal').selectOption('position');
 await page.locator('#exercise-favourite').click();await turn.selectOption('note');await page.locator('#exercise-favourites').selectOption('0');await expect(turn).toHaveValue('position');
 await page.locator('#exercise-content-material').selectOption('triad');await page.locator('#exercise-content-family').selectOption('enclosures');await expect(turn).toBeVisible();
 await page.locator('[data-workspace-target="guitar-title"]').click();await expect(page.locator('#guitar-neck-turn')).toHaveCount(0);expect(errors).toEqual([]);
});
