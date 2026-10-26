import {test,expect} from '@playwright/test';
async function tab(page:any,target:string){await page.locator(`[data-workspace-target="${target}"]`).click();}
test('altered parent scales retain five selectable position frameworks in both workspaces',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'harmony-title');
 for(const mode of ['ionian_sharp5','lydian_sharp2']){
  await page.locator('#quality').selectOption(mode);await tab(page,'guitar-title');
  const ids=await page.locator('#position-overview button').evaluateAll(nodes=>nodes.map(n=>(n as HTMLElement).dataset.overviewPosition));expect(new Set(ids).size).toBe(5);
  for(const id of ['I','II','III','IV','V']){await page.locator(`#position-overview [data-overview-position="${id}"]`).click();await expect(page.locator('.featured-position')).toHaveAttribute('data-position',id);}
  await tab(page,'caged-exercise');await page.locator('#exercise-position').selectOption('II');await expect(page.locator('.exercise-map-heading strong')).toContainText('Position II');await tab(page,'harmony-title');
 }
 expect(errors).toEqual([]);
});
test('teaching identifies actual study cells, current chord degrees and minor-key Roman labels',async({page})=>{
 await page.goto('/');await tab(page,'harmony-title');await page.locator('#key').selectOption('11');await page.locator('#chord').selectOption('min7');await tab(page,'caged-exercise');await page.locator('#exercise-study').selectOption('chordtones');await page.locator('.exercise-lesson > summary').click();
 await expect(page.locator('.exercise-lesson')).toContainText('Bm7, Dmaj7, F♯m7 and Amaj7');await expect(page.locator('.lesson-cell-examples')).toContainText('First study cells');await expect(page.locator('.exercise-lesson')).toContainText('First written note');
 await tab(page,'harmony-title');await page.locator('#quality').selectOption('minor');await page.locator('#progression').click();await page.locator('#template').selectOption('diatonic');await expect(page.locator('#backing-description')).toContainText('seventh chords');await expect(page.locator('#template option:checked')).toContainText('♭VImaj7');
});
for(const width of [1440,640,390])test(`all workspaces remain usable at ${width}px, including a desktop zoom equivalent`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const target of ['pulse-title','harmony-title','guitar-title','caged-exercise','progress-title','sound-settings-title']){
  await tab(page,target);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await expect(page.locator('#mini-transport')).toBeVisible();
  const bar=await page.locator('#mini-transport').boundingBox();expect(bar!.y+bar!.height).toBeLessThanOrEqual(901);
 }
 await tab(page,'caged-exercise');await page.locator('#exercise-position').selectOption('III');await expect(page.locator('.exercise-map-heading')).toContainText('Position III');await page.locator('#exercise-focus').click();await expect(page.locator('.notation-scroll')).toBeVisible();await page.locator('#exercise-focus').click();
 if(width===1440)await page.screenshot({path:'/workspace/beta-final-exercises.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('editable diatonic and modal copies retain the heard harmony and pitch collection',async({page})=>{
 await page.goto('/');await tab(page,'harmony-title');await page.locator('#quality').selectOption('major');await page.locator('#key').selectOption('0');await page.locator('#progression').click();await page.locator('#template').selectOption('diatonic');
 await page.locator('#customize-progression').click();await expect(page.locator('#template')).toHaveValue('custom');await expect(page.locator('#custom-chord')).toHaveValue('maj7');await page.locator('#custom-beat-grid [data-grid-step="1"]').first().click();await expect(page.locator('#custom-root')).toHaveValue('9');await expect(page.locator('#custom-chord')).toHaveValue('min7');await expect(page.locator('#custom-mode')).toHaveValue('minor');
 await page.locator('#template').selectOption('modal_dorian');await page.locator('#customize-progression').click();await page.locator('#custom-beat-grid [data-grid-step="1"]').first().click();await expect(page.locator('#custom-root')).toHaveValue('5');await expect(page.locator('#custom-chord')).toHaveValue('dom13');await expect(page.locator('#custom-mode')).toHaveValue('mixolydian');
});
