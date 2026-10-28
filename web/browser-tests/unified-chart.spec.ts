import {test,expect} from '@playwright/test';
const harmony=async(page:any)=>page.locator('[data-workspace-target=harmony-title]').click();
test('single chord uses the editable chart, expands, loops and saves like any progression',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await harmony(page);
 await expect(page.locator('#pedal')).toBeHidden();await expect(page.locator('#progression')).toBeHidden();await expect(page.locator('#custom-progression-builder')).toBeVisible();await expect(page.locator('#template')).toHaveValue('custom');await expect(page.locator('[data-custom-step]')).toHaveCount(1);
 await page.locator('#custom-mode').selectOption('lydian');await page.locator('#custom-chord').selectOption('maj7');await page.locator('#custom-mode').selectOption('lydian');await page.locator('#custom-duration-unit').selectOption('beats');await page.locator('#custom-beats').selectOption('3');
 await expect(page.locator('#mini-chord')).toContainText('Amaj7');await expect(page.locator('#mini-mode')).toContainText('Lydian');
 await page.locator('#custom-add').click();await expect(page.locator('[data-custom-step]')).toHaveCount(2);await page.locator('#custom-delete').click();await expect(page.locator('[data-custom-step]')).toHaveCount(1);await expect(page.locator('#custom-delete')).toBeDisabled();
 await page.locator('#mini-count-in').uncheck();await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toContainText('Stop');await page.waitForTimeout(2500);await expect(page.locator('#mini-chord')).toContainText('Amaj7');await page.locator('#mini-play').click();
 await page.locator('[data-workspace-target=progress-title]').click();await page.locator('#preset-name').fill('One chord');await page.locator('#preset-save').click();
 const preset=await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-practice-presets-v1')!).items[0]);expect(preset.progression).toBe(true);expect(preset.customProgression.steps).toHaveLength(1);expect(preset.customProgression.steps[0]).toMatchObject({chord:'maj7',mode:'lydian',beats:3});
 await page.reload();await harmony(page);await expect(page.locator('#custom-mode')).toHaveValue('lydian');await expect(page.locator('#custom-beats')).toHaveValue('3');expect(errors).toEqual([]);
});
test('templates and a new single-chord chart share the same editor and undo',async({page})=>{
 await page.goto('/');await harmony(page);await page.locator('#template').selectOption('major251essential');await expect(page.locator('#custom-beat-grid')).toContainText('Bm7');await page.locator('#single-chord-chart').click();await expect(page.locator('[data-custom-step]')).toHaveCount(1);await expect(page.locator('#mini-chord')).toContainText('Bm7');await page.locator('#custom-undo').click();await expect(page.locator('[data-custom-step]')).toHaveCount(3);await page.locator('#custom-redo').click();await expect(page.locator('[data-custom-step]')).toHaveCount(1);
 await page.locator('#mini-progression').selectOption('off');await expect(page.locator('#template')).toHaveValue('custom');await expect(page.locator('[data-custom-step]')).toHaveCount(1);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('legacy pedal preset loads as an equivalent one-chord chart',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'old',name:'Old pedal',progression:false,controls:{key:'7',quality:'lydian',chord:'maj7',template:'parallel1'}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=progress-title]').click();await page.locator('#preset-list').selectOption('old');await page.locator('#preset-load').click();await harmony(page);await expect(page.locator('#template')).toHaveValue('custom');await expect(page.locator('[data-custom-step]')).toHaveCount(1);await expect(page.locator('#custom-mode')).toHaveValue('lydian');await expect(page.locator('#custom-chord')).toHaveValue('maj7');await expect(page.locator('#mini-chord')).toContainText('Gmaj7');
 await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('.exercise-map-heading')).toContainText('Gmaj7');await expect(page.locator('.exercise-score svg')).not.toHaveCount(0);
});

test('adding chords spells fourths correctly and exposes deletion beside Add chord',async({page})=>{
 await page.goto('/');await harmony(page);await page.locator('#custom-chord').selectOption('maj9sharp11');await page.locator('#custom-mode').selectOption('lydian');
 await page.locator('#custom-add').click();await expect(page.locator('#mini-chord')).toHaveText('Dmaj9♯11');await expect(page.locator('#custom-mode')).toHaveValue('lydian');
 await page.locator('#custom-add').click();await expect(page.locator('#mini-chord')).toHaveText('Gmaj9♯11');await expect(page.locator('.custom-history-actions #custom-delete')).toBeEnabled();
 await page.locator('#custom-delete').click();await expect(page.locator('[data-custom-step]')).toHaveCount(2);await expect(page.locator('#mini-chord')).toHaveText('Dmaj9♯11');await page.locator('#custom-undo').click();await expect(page.locator('[data-custom-step]')).toHaveCount(3);
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#custom-delete')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
