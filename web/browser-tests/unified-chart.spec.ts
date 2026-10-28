import {test,expect} from '@playwright/test';
const harmony=async(page:any)=>page.locator('[data-workspace-target=harmony-title]').click();
test('app starts with a four-bar A Dorian tonic vamp and keeps the chart on its tonal centre',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await harmony(page);
 await expect(page.locator('#pedal')).toBeHidden();await expect(page.locator('#template')).toHaveValue('single');await expect(page.locator('#mini-chord')).toHaveText('Am13');await expect(page.locator('#mini-mode')).toContainText('Dorian');await expect(page.locator('#custom-beat-grid [data-grid-beat]')).toHaveCount(16);await expect(page.locator('#custom-grid-help')).toContainText('4 bars');
 await page.locator('#key').selectOption('7');await page.locator('#quality').selectOption('lydian');await expect(page.locator('#mini-chord')).toHaveText('Gmaj9♯11');await expect(page.locator('#custom-beat-grid')).not.toContainText('Dmaj');
 await page.locator('#mini-count-in').uncheck();await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');await page.locator('#mini-play').click();await page.waitForTimeout(4500);await expect(page.locator('#mini-chord')).toHaveText('Gmaj9♯11');await page.locator('#mini-play').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('Add chord copies root, spelling, chord type, scale, duration and bass; delete and undo remain available',async({page})=>{
 await page.goto('/');await harmony(page);await page.locator('#customize-progression').click();await expect(page.locator('#custom-name')).toHaveValue('My progression');await expect(page.locator('#custom-bars')).toHaveValue('4');
 await page.locator('#custom-root').selectOption('5');await page.locator('#custom-chord').selectOption('maj9sharp11');await page.locator('#custom-mode').selectOption('lydian');await page.locator('#custom-duration-unit').selectOption('beats');await page.locator('#custom-beats').selectOption('3');await page.locator('#custom-bass').selectOption('7');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!).steps[0]);
 await page.locator('#custom-add').click();await expect(page.locator('[data-custom-step]')).toHaveCount(2);const steps=await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!).steps);expect(steps[1]).toEqual(saved);await expect(page.locator('#custom-mode')).toHaveValue('lydian');
 await page.locator('#custom-add').click();await expect(page.locator('[data-custom-step]')).toHaveCount(3);await page.locator('#custom-delete').click();await expect(page.locator('[data-custom-step]')).toHaveCount(2);await page.locator('#custom-undo').click();await expect(page.locator('[data-custom-step]')).toHaveCount(3);
 await page.locator('#single-chord-chart').click();await expect(page.locator('#template')).toHaveValue('single');await expect(page.locator('#mini-chord')).toHaveText('Amaj9♯11');await expect(page.locator('#custom-beat-grid [data-grid-beat]')).toHaveCount(16);
 await page.reload();await harmony(page);await expect(page.locator('#mini-chord')).toHaveText('Am13');await page.locator('#template').selectOption('custom');await expect(page.locator('[data-custom-step]')).toHaveCount(3);await expect(page.locator('#custom-root')).toHaveValue('5');
});
test('legacy pedal preset loads as a four-bar chord chart at its original tonal centre',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'old',name:'Old pedal',progression:false,controls:{key:'7',quality:'lydian',chord:'maj7',template:'parallel1'}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=progress-title]').click();await page.locator('#preset-list').selectOption('old');await page.locator('#preset-load').click();await harmony(page);await expect(page.locator('#template')).toHaveValue('single');await expect(page.locator('#quality')).toHaveValue('lydian');await expect(page.locator('#chord')).toHaveValue('maj7');await expect(page.locator('#mini-chord')).toHaveText('Gmaj7');await expect(page.locator('#custom-beat-grid [data-grid-beat]')).toHaveCount(16);
 await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('.exercise-map-heading')).toContainText('Gmaj7');await expect(page.locator('.exercise-score svg')).not.toHaveCount(0);
});

test('Add chord on the tonic vamp opens an editable progression with identical chords',async({page})=>{
 await page.goto('/');await harmony(page);await page.locator('#custom-add').click();await expect(page.locator('#template')).toHaveValue('custom');await expect(page.locator('#custom-name')).toHaveValue('My progression');
 const steps=await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!).steps);expect(steps).toHaveLength(2);expect(steps[0]).toEqual(steps[1]);expect(steps[0]).toMatchObject({root:0,chord:'min13',mode:'dorian',bars:4});await expect(page.locator('#mini-chord')).toHaveText('Am13');await page.locator('#custom-delete').click();await expect(page.locator('[data-custom-step]')).toHaveCount(1);
});
