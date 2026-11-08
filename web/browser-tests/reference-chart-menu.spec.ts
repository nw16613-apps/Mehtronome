import {test,expect} from '@playwright/test';
import {REFERENCE_PERFORMANCES} from '../src/audio/reference-performances.js';
test('reference study charts load from the normal progression menu without changing the backing style or tempo',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();
 const menu=page.locator('#progression-choice');await expect(menu.locator('optgroup[label="Backing reference studies"] option')).toHaveCount(20);
 const tempo=await page.locator('#mini-bpm').inputValue(),style=await page.locator('#backing-style').inputValue();
 for(const [id,def] of Object.entries(REFERENCE_PERFORMANCES)){
  await menu.selectOption('reference:'+id);await expect(page.locator('#custom-name')).toHaveValue(def.name);await expect(menu).toBeEnabled();await expect(menu).toHaveValue('reference:'+id);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')||'null'));
  expect(saved.steps.map((s:any)=>s.root)).toEqual(def.harmony.map((h:any)=>(h[0]-def.key+12)%12));
  expect(saved.steps.map((s:any)=>s.chord)).toEqual(def.harmony.map((h:any)=>h[1]));
  await expect(page.locator('#mini-bpm')).toHaveValue(tempo);await expect(page.locator('#backing-style')).toHaveValue(style);
 }
 await menu.selectOption('reference:blues');await expect(page.locator('#custom-name')).toHaveValue(REFERENCE_PERFORMANCES.blues.name);await page.locator('#repertoire-save').click();await expect(menu).toHaveValue(/^saved:/);await menu.selectOption('reference:legatoFusion');await expect(page.locator('#custom-name')).toHaveValue(REFERENCE_PERFORMANCES.legatoFusion.name);
});
