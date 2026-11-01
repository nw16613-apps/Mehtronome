import {test,expect} from '@playwright/test';
const pitch=async(page:any,slot:number)=>{const label=await page.locator(`.exercise-note[data-group-index="${slot}"]`).first().getAttribute('aria-label');const m=label.match(/string (\d), fret (\d+)/)!;return ([0,64,59,55,50,45,40][+m[1]]+ +m[2])%12;};
test('independent card starts follow position and rhythm changes and restore after reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await page.locator('#exercise-start-note').selectOption('1:0');
 await page.locator('.exercise-position-route [data-inspect-slot="1"]').click();await page.locator('#exercise-card-start').selectOption('3:0');
 await expect(page.locator('#exercise-card-start')).toHaveValue('3:0');await expect(page.locator('.exercise-position-route [data-inspect-slot="1"]')).toContainText('Start: ♭3');
 await page.locator('.exercise-position-route [data-inspect-slot="2"]').click();await expect(page.locator('#exercise-card-start')).toHaveValue('inherit');await page.locator('#exercise-card-start').selectOption('5:0');
 for(const study of ['positional','positionalscale']){
  await page.locator('#exercise-study').selectOption(study);
  for(const rhythm of ['eighths','triplets','sixteenths']){await page.locator('#exercise-rhythm').selectOption(rhythm);expect(await pitch(page,1)).toBe(0);expect(await pitch(page,2)).toBe(4);}
 }
 await page.locator('#exercise-position-navigation').selectOption('all');await page.locator('#exercise-position').selectOption('III');expect(await pitch(page,2)).toBe(4);
 await page.locator('.exercise-position-route [data-inspect-slot="1"]').click();await expect(page.locator('#exercise-card-start')).toHaveValue('3:0');
 await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('.exercise-position-route [data-inspect-slot="1"]')).toContainText('Start: ♭3');
 await page.locator('.exercise-position-route [data-inspect-slot="1"]').click();await page.locator('#exercise-card-start').selectOption('inherit');await expect(page.locator('.exercise-position-route [data-inspect-slot="1"]')).not.toContainText('Start:');expect(errors).toEqual([]);
});
