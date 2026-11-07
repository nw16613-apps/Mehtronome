import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();}
test('each per-string shape is selectable on the original map by label, area, dropdown and keyboard',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 for(const kind of ['three','oneTwo','twoOne']){await page.locator('#fretboard-fingering').selectOption(kind);const labels=page.locator('#full-fretboard .per-string-region-label');const count=await page.locator('.per-string-shape').count();await expect(labels).toHaveCount(count);
  for(let i=0;i<count;i++){const label=labels.nth(i),degree=await label.getAttribute('data-full-string-position');await label.click();await expect(page.locator('#per-string-neck-shape')).toHaveValue(degree!);await expect(page.locator('.per-string-shape.map-current')).toHaveAttribute('data-start-degree',degree!);await expect(page.locator('#full-fretboard .per-string-region-label[aria-pressed=true]')).toHaveCount(1);}
  const first=labels.first(),firstDegree=await first.getAttribute('data-full-string-position');await first.focus();await page.keyboard.press('Enter');await expect(first).toBeFocused();await page.keyboard.press('Space');await expect(first).toBeFocused();await expect(page.locator('#per-string-neck-shape')).toHaveValue(firstDegree!);
  await page.locator('#per-string-neck-shape').selectOption('1');await expect(page.locator('.map-current')).toHaveAttribute('data-start-degree','1');await page.locator('#show-regions').uncheck();await expect(labels).toHaveCount(0);await expect(page.locator('#full-fretboard .shape-selected-ring').first()).toBeVisible();await page.locator('#show-regions').check();
  await page.locator('#per-string-neck-shape').selectOption('all');await expect(page.locator('.map-current')).toHaveCount(0);await expect(labels).toHaveCount(count);
 }
 expect(errors).toEqual([]);
});
test('CAGED uses the same full-map controls and its dropdown agrees with clicked regions',async({page})=>{
 await open(page);await expect(page.locator('#per-string-neck-shape')).toBeVisible();await expect(page.getByLabel('Show positions',{exact:true})).toBeVisible();
 await page.locator('#per-string-neck-shape').selectOption('IV');await expect(page.locator('#position-overview [data-overview-position=IV]')).toHaveAttribute('aria-selected','true');await expect(page.locator('#full-fretboard [data-full-position=IV]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#full-fretboard [data-full-position=I] text').click();await expect(page.locator('#per-string-neck-shape')).toHaveValue('I');await page.locator('#per-string-neck-shape').selectOption('all');await expect(page.locator('#full-fretboard .shape-selected-ring')).toHaveCount(0);
 const mapControls=await page.locator('#full-fretboard-panel .full-fretboard-toolbar').innerText();await page.locator('#fretboard-fingering').selectOption('twoOne');await expect(page.getByLabel('Show positions',{exact:true})).toBeVisible();await expect(page.locator('#full-fretboard-panel')).toBeVisible();expect(mapControls).toContain('Highlight shape');expect(await page.locator('#full-fretboard-panel .full-fretboard-toolbar').innerText()).toContain('Highlight shape');
 await page.setViewportSize({width:390,height:844});await page.locator('#full-fretboard .per-string-region-label[data-full-string-position="1"]').scrollIntoViewIfNeeded();await page.locator('#full-fretboard .per-string-region-label[data-full-string-position="1"]').tap();await expect(page.locator('#per-string-neck-shape')).toHaveValue('1');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
