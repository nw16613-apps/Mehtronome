import {test,expect} from '@playwright/test';
test('exercise help is one short explanation without repeating the chart or diagram reference',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 for(const study of ['positional','positionalscale','harmonized','inversions','enclosures','triadpairs','pentatonic']){
  await page.locator('#exercise-study').selectOption(study);const help=page.locator('.exercise-lesson');await expect(help.locator('summary')).toHaveText('About this exercise');await expect(help).not.toHaveAttribute('open','');await help.locator('summary').click();await expect(help.locator(':scope>p')).toHaveCount(1);expect((await help.innerText()).split(/\s+/).length).toBeLessThan(65);await expect(help.locator('details,ol,ul')).toHaveCount(0);
  await expect(page.locator('.progression-materials,.progression-timing-help,.notation-chord-help,.exercise-diagram-reference,.exercise-grip-information,.lesson-cell-examples,.exercise-footer>p')).toHaveCount(0);await expect(page.locator('.exercise-active-key')).toHaveCount(1);
 }
 await page.locator('#exercise-study').selectOption('positional');await page.locator('.exercise-lesson>summary').click();await page.locator('.exercise-lesson').screenshot({path:'/workspace/concise-exercise-help.png'});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('exercise guidance does not duplicate the tempo trainer instructions',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('.exercise-setup>summary').click();await expect(page.locator('.exercise-setup>p')).toHaveCount(1);await expect(page.locator('.exercise-setup')).toContainText('Turn off Use accompaniment');await page.locator('#exercise-backing').uncheck();await page.locator('.exercise-setup>summary').click();await expect(page.locator('.exercise-setup>p')).toHaveCount(1);await expect(page.locator('.exercise-setup')).toContainText('Enable Loop');await expect(page.locator('#exercise-auto-tempo')).toBeEnabled();
});
