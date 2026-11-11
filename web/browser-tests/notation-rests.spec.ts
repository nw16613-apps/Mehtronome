import {test,expect} from '@playwright/test';
test('exercise rests render as vector music symbols even without music fonts',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('enclosures4');await page.locator('#study-load').click();
 for(const rhythm of ['eighths','sixteenths','triplets']){
  await page.locator('#exercise-rhythm').selectOption(rhythm);const rests=page.locator('.aligned-notation g.notation-rest');expect(await rests.count()).toBeGreaterThan(0);
  expect(await page.locator('.notation-rest text,text.notation-rest').count()).toBe(0);
  expect(await rests.evaluateAll(nodes=>nodes.every(n=>(n as SVGGraphicsElement).getBBox().width>0&&n.getAttribute('aria-label')?.includes('rest')))).toBe(true);
 }
 await page.addStyleTag({content:'.exercise-notation {font-family: nonexistent-music-font !important;}'});
 await page.locator('.aligned-notation').first().screenshot({path:'/workspace/vector-rests.png'});
 await page.locator('#exercise-display').selectOption('tab');expect(await page.locator('.notation-rest').first().isVisible()).toBe(false);
 await page.locator('#exercise-display').selectOption('notation');await expect(page.locator('.notation-rest').first()).toBeVisible();expect(errors).toEqual([]);
});
