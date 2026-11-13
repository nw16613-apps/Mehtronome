import {test,expect} from '@playwright/test';
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target="guitar-title"]').click();await page.locator('#fretboard-fingering').selectOption('three');await page.locator('#guitar-neck-traversal').selectOption('horizontal');}
async function strings(page:any){return page.locator('#full-fretboard .fret-note').evaluateAll(nodes=>[...new Set(nodes.map(n=>Number(n.getAttribute('data-string'))))].sort());}
test('show positions retains controls and the chosen string set through every playback-state refresh',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 for(const [set,expected] of [['0,1',[0,1]],['1,2',[1,2]],['4,5',[4,5]]] as const){
  await page.locator('#guitar-neck-strings').selectOption(set);expect(await strings(page)).toEqual(expected);
  for(const show of [false,true,false]){
   await page.locator('#show-regions').setChecked(show);await page.evaluate(()=>document.dispatchEvent(new Event('mehtronome-playback-state')));
   await expect(page.locator('#show-regions')).toBeVisible();await expect(page.locator('#per-string-neck-shape')).toBeVisible();expect(await strings(page)).toEqual(expected);await expect(page.locator('#per-string-diagram')).toBeHidden();
   expect(await page.locator('#full-fretboard .per-string-region-label').count()>0).toEqual(show);
  }
 }
 expect(errors).toEqual([]);
});
test('each degree selects a six-note 3NPS cell via menu or map, with range-aware boundaries',async({page})=>{
 await open(page);await page.locator('#guitar-neck-start').fill('1');await page.locator('#guitar-neck-start').press('Tab');await page.locator('#guitar-neck-end').fill('24');await page.locator('#guitar-neck-end').press('Tab');
 const menu=page.locator('#per-string-neck-shape'),options=await menu.locator('option[value]:not([value=all])').evaluateAll(nodes=>nodes.map(n=>(n as HTMLOptionElement).value));expect(new Set(options.map(s=>s.split(':')[0])).size).toBe(7);
 for(const value of options){await menu.selectOption(value);const notes=page.locator('#full-fretboard .shape-selected-note');await expect(notes).toHaveCount(6);const row=await notes.evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('data-string'))));expect(row.filter(n=>n===0).length).toBe(3);expect(row.filter(n=>n===1).length).toBe(3);}
 const label=page.locator('#full-fretboard .per-string-region-label').first(),value=await label.getAttribute('data-full-string-position');await label.click();await expect(menu).toHaveValue(value!);await expect(page.locator('#full-fretboard .shape-selected-note')).toHaveCount(6);
 await page.locator('#show-regions').uncheck();await menu.selectOption(options[1]);await expect(page.locator('#full-fretboard .shape-selected-note')).toHaveCount(6);
 await menu.selectOption('all');await expect(page.locator('#full-fretboard')).not.toHaveClass(/has-selected-shape/);await expect(page.locator('#full-fretboard .shape-selected-note')).toHaveCount(0);
 await page.locator('#show-regions').check();await page.locator('#full-fretboard .per-string-region-label').last().focus();await page.keyboard.press('Enter');await expect(page.locator('#full-fretboard .shape-selected-note')).toHaveCount(6);
 await page.screenshot({path:'/workspace/neck-cells-desktop.png',fullPage:true});
});
test('returning to selected-position restores the 3NPS map controls and shape',async({page})=>{
 await open(page);await page.locator('#show-regions').uncheck();await page.locator('#guitar-neck-traversal').selectOption('position');await expect(page.locator('#per-string-neck-shape')).toBeVisible();await expect(page.locator('#show-regions')).toBeVisible();await expect(page.locator('#per-string-diagram')).toBeVisible();await page.locator('#per-string-neck-shape').selectOption('2');await expect(page.locator('#full-fretboard .shape-selected-note')).toHaveCount(18);
});
