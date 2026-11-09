import {test,expect} from '@playwright/test';

test('phrasing studies show targets, rests and mixed rhythm in the existing mobile exercise layout',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('major251essential');await page.locator('[data-workspace-target=caged-exercise]').click();
 for(const study of ['motifspace','changetargets','questionanswer']){
  await page.locator('#exercise-study').selectOption(study);
  await expect(page.locator('.exercise-note').first()).toBeVisible();
  expect(await page.locator('.notation-rest').count()).toBeGreaterThan(0);
  expect(await page.locator('.target-note').count()).toBeGreaterThan(2);
  await expect(page.locator('#exercise-material').locator('..')).toBeHidden();
  await expect(page.locator('#exercise-rhythm').locator('..')).toContainText('Phrase subdivision');
  const groups=await page.locator('.exercise-note').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('data-group-index')))]);expect(groups.length).toBeGreaterThan(2);
 }
 await page.locator('#exercise-rhythm').selectOption('triplets');expect(await page.locator('.tuplet-number').count()).toBeGreaterThan(0);
 await page.locator('#exercise-rhythm').selectOption('sixteenths');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 await page.locator('.exercise-score').screenshot({path:'/workspace/musical-phrases-mobile.png'});
 expect(errors).toEqual([]);
});

test('a held-chord phrase plays its written notes and leaves written rests silent',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await page.locator('#exercise-study').selectOption('motifspace');
 await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');
 await page.locator('#exercise-loop').check();await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();
 await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>page.locator('.exercise-note.playing').count()).toBeGreaterThan(0);
 await expect.poll(()=>page.locator('.exercise-note.playing').count()).toBe(0);
 await page.locator('#mini-play').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','false');
});
