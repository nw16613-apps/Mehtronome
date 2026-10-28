import {test,expect} from '@playwright/test';
const tab=async(page:any,target:string)=>page.locator(`[data-workspace-target=${target}]`).click();
const names=async(page:any,slot:number)=>page.locator(`.exercise-score .exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')!.split(',')[0]));
test('rendered alternating notation retains up/down rules and advances across repeated bars',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'caged-exercise');await page.locator('#exercise-study').selectOption('alternating');await page.locator('#exercise-stage').selectOption('full');await page.locator('#exercise-material').selectOption('seventh');await page.locator('#exercise-rhythm').selectOption('eighths');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('IV');}
 await page.locator('#exercise-motion').selectOption('ascending');
 expect(await names(page,0)).toEqual(['E','G','B','D','E','C','A','F♯']);expect(await names(page,1)).toEqual(['G','B','D','F♯','G','E','C','A']);
 await page.locator('#exercise-motion').selectOption('descending');expect(await names(page,0)).toEqual(['G','E','C','A','G','B','D','F♯']);expect(await names(page,1)).toEqual(['E','C','A','F♯','E','G','B','D']);
 await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:4000});await page.locator('#exercise-preview').click();
 await page.locator('.exercise-position-route [data-inspect-slot="1"]').click();await page.locator('#exercise-position').selectOption('II');expect(await names(page,0)).toEqual(['E','G','B','D','E','C','A','F♯']);expect(await names(page,1)).toEqual(['G','B','D','F♯','G','E','C','A']);expect(errors).toEqual([]);
});
test('pattern families render and audition through jazz, altered, modal and fourths progressions',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1']){
  await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption(template);await tab(page,'caged-exercise');
  for(const study of ['alternating','harmonized','thirds','upperstructure','enclosures','approacheverytone','inversions','pentatonic','connections']){
   await page.locator('#exercise-study').selectOption(study);await expect(page.locator('.exercise-score svg').first()).toBeVisible();await expect(page.locator('.exercise-position-route [data-inspect-slot]')).toHaveCount(template==='fourths1'?12:template==='modal_dorian'?2:3);
   const notes=page.locator('.exercise-score .exercise-note');expect(await notes.count()).toBeGreaterThan(0);
  }
 }
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
