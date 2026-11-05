import {test,expect} from '@playwright/test';
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
test('each page keeps contextual help without duplicate narrative blocks',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('#beat-accent-status')).toBeHidden();await expect(page.locator('.mixer-instructions')).not.toContainText('Reverb');await expect(page.locator('.mixer-fx-buses>p')).not.toContainText('Returns');
 await tab(page,'harmony-title');await expect(page.locator('#mode-tip,#backing-description,.mode-map-guide')).toHaveCount(0);await page.locator('.harmony-reference>summary').click();await expect(page.locator('#harmony-explanation')).toContainText('Extensions 9, 11 and 13');
 await tab(page,'guitar-title');await page.locator('.guitar .learn-more>summary').click();await expect(page.locator('#guitar-context,#grip-toggle-help')).toHaveCount(0);expect((await page.locator('.guitar .learn-more').innerText()).split(/\s+/).length).toBeLessThan(95);
 await page.locator('#theory-view').selectOption('pentatonic');await page.locator('#fretboard-overlay-details>summary').click();await expect(page.locator('#fretboard-overlay-summary')).not.toBeEmpty();await expect(page.locator('#theory-description')).not.toContainText('Notes:');
 await page.locator('#theory-view').selectOption('triads');await expect(page.locator('#fretboard-overlay-summary')).not.toBeEmpty();await page.locator('#theory-view').selectOption('none');await page.locator('#show-grip').check();await expect(page.locator('.voicing-details')).toHaveCount(1);
 await tab(page,'progress-title');await expect(page.locator('#preset-selection-help')).toHaveCount(0);const task=await page.locator('.practice-roadmap-task>span').first().innerText();await expect(page.locator('#practice-roadmap-today')).not.toContainText(task);await expect(page.locator('#practice-roadmap-today')).toContainText('unchecked items below');
 await page.locator('#practice-goal').selectOption('jazz');await page.locator('#start-guided-goal').click();await expect(page.locator('#guided-session')).toBeVisible();await expect(page.locator('#guided-session-tip')).toHaveCount(0);expect(errors).toEqual([]);
});
test('all expandable page text remains readable at phone width',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.goto('/');
 for(const id of ['pulse-title','harmony-title','guitar-title','caged-exercise','progress-title','sound-settings-title']){
  await tab(page,id);await page.evaluate(()=>{for(const d of document.querySelectorAll('details'))if(d.getClientRects().length&&!d.classList.contains('chart-display-options'))d.open=true;});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 expect(errors).toEqual([]);
});
