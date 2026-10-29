import {test,expect} from '@playwright/test';
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
test('expanded chord families have compatible guides and survive saving a chart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'harmony-title');
 await expect(page.locator('#custom-chord optgroup')).toHaveCount(7);
 for(const chord of ['add9','maj13','maj13sharp11','minAdd9','minSixNine','minMaj13','dom11','dom7flat5','dom7sharp9sharp5','thirteenSus','sevenSusB9','diminished']){
  await page.locator('#custom-chord').selectOption(chord);expect(await page.locator('#custom-mode option:not([disabled])').count()).toBeGreaterThan(0);await expect(page.locator('#custom-scale-check')).toBeHidden();
 }
 await page.locator('#custom-chord').selectOption('maj13sharp11');await page.locator('#custom-name').fill('Expanded harmony');await page.locator('#repertoire-save').click();
 await page.reload();await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption({label:'Expanded harmony'});await expect(page.locator('#custom-chord')).toHaveValue('maj13sharp11');await expect(page.locator('#custom-mode')).toHaveValue('lydian');
 await tab(page,'guitar-title');await expect(page.locator('#guitar-diagrams .fretboard').first()).toBeVisible();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('harmony movement lives in sustained harmony and retains preset values',async({page})=>{
 await page.goto('/');await expect(page.locator('.harmony #extension-morph')).toHaveCount(0);
 await tab(page,'sound-settings-title');await expect(page.locator('.pad-settings .harmony-movement #extension-morph')).toBeVisible();await expect(page.locator('#extension-morph')).toHaveCount(1);
 await page.locator('#extension-morph').check();await page.locator('#extension-bars').selectOption('16');
 await tab(page,'progress-title');await page.locator('#preset-name').fill('Harmony movement');await page.locator('#preset-save').click();
 await tab(page,'sound-settings-title');await page.locator('#extension-morph').uncheck();
 await tab(page,'progress-title');await page.locator('#preset-load').click();await tab(page,'sound-settings-title');await expect(page.locator('#extension-morph')).toBeChecked();await expect(page.locator('#extension-bars')).toHaveValue('16');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
