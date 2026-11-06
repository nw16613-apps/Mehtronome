import {test,expect} from '@playwright/test';
test('Drop 2 and Drop 3 show all inversions on standard string sets and use the same interactive full map',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();const route=await page.locator('#manual-position-route').inputValue();
 for(const kind of ['drop2','drop3']){
  await page.locator('#fretboard-fingering').selectOption(kind);await expect(page.locator('#drop-string-set')).toBeVisible();await expect(page.locator('.per-string-shape')).toHaveCount(4);await expect(page.locator('[data-practise-per-string]')).toHaveCount(1);await expect(page.locator('.per-string-region-label')).toHaveCount(4);
  const optionCount=await page.locator('#drop-string-set option').count();expect(optionCount).toBe(kind==='drop2'?3:2);
  for(let set=0;set<optionCount;set++){
   await page.locator('#drop-string-set').selectOption(String(set));expect(await page.locator('.per-string-shape').evaluateAll(cards=>cards.map(c=>c.querySelectorAll('.fret-note').length))).toEqual([4,4,4,4]);expect(await page.locator('.per-string-shape').evaluateAll(cards=>cards.map(c=>c.querySelectorAll('.grip-mute').length))).toEqual([2,2,2,2]);
   await page.locator('#per-string-neck-shape').selectOption('1');await expect(page.locator('.map-current')).toHaveAttribute('data-start-degree','1');expect(await page.locator('#full-fretboard .shape-boundary').getAttribute('points')).not.toMatch(/NaN|Infinity/);
   await page.locator('#full-fretboard .per-string-region-label').nth(2).click();await expect(page.locator('#per-string-neck-shape')).toHaveValue('2');
  }
 }
 await expect(page.locator('#manual-position-route')).toHaveValue(route);await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','false');await page.setViewportSize({width:390,height:844});expect(await page.locator('.per-string-scroll').first().evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.locator('#per-string-diagram').screenshot({path:'/workspace/drop-voicings-mobile.png'});await page.locator('#fretboard-fingering').selectOption('caged');await expect(page.locator('#drop-string-set')).toBeHidden();await expect(page.locator('#guitar-diagrams')).toBeVisible();expect(errors).toEqual([]);
});
test('drop options explain triads and extended qualities without changing the selected chord',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#single-chord-chart').click();await page.locator('#custom-chord').selectOption('major');await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption('drop2');await expect(page.locator('#per-string-diagram>.practice-help')).toContainText('four core tones');await expect(page.locator('.per-string-shape')).toHaveCount(0);await expect(page.locator('#per-string-neck-shape')).toHaveValue('all');
 await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#custom-chord').selectOption('maj9');await page.locator('[data-workspace-target=guitar-title]').click();await expect(page.locator('.per-string-shape')).toHaveCount(4);await expect(page.locator('#per-string-diagram>.practice-help')).toContainText('Extensions remain');await expect(page.locator('#custom-chord')).toHaveValue('maj9');
});
