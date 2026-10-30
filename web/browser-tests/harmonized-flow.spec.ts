import {test,expect} from '@playwright/test';
const tab=async(page:any,target:string)=>page.locator(`[data-workspace-target=${target}]`).click();
const names=async(page:any,slot:number)=>page.locator(`.exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')!.split(',')[0]));
test('harmonized triads continue through bars and chord changes without unplanned rests',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'harmonized-flow',name:'Flowing triads',key:9,beats:4,progression:{version:2,name:'Flowing triads',steps:[0,0,2,2].map(root=>({root,chord:'min7',mode:'dorian',bars:1,bass:null}))}}]})));
 await page.goto('/');await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption('saved:harmonized-flow');await tab(page,'caged-exercise');
 await page.locator('#exercise-study').selectOption('harmonized');await page.locator('#exercise-rhythm').selectOption('eighths');await page.locator('#exercise-material').selectOption('triad');await page.locator('#exercise-stage').selectOption('full');await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('II');}
 for(const slot of [0,1,2,3])await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`)).toHaveCount(8);
 await expect(page.locator('.notation-rest')).toHaveCount(0);
 await expect(page.locator('.aligned-notation .exercise-degree').first()).toHaveText('3 cell segments');
 // Bar 2 begins with A, completing the D-F-sharp-A cell from bar 1.
 expect(await names(page,0)).toEqual(['B','D','F♯','C','E','G','D','F♯']);
 expect((await names(page,1))[0]).toBe('A');
 await expect(page.locator('.progression-timing-help')).toContainText('same note ordinal');
 const starts=await page.locator('.exercise-note').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('data-start-beat'))));
 expect(starts).toEqual(Array.from({length:32},(_,i)=>i/2));
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="2"]').first()).toBeVisible({timeout:5000});await page.locator('#exercise-preview').click();
 await page.locator('#exercise-motion').selectOption('descending');for(const slot of [0,1,2,3])await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`)).toHaveCount(8);
 await page.locator('#exercise-stage').selectOption('cell');for(const slot of [0,1,2,3])await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`)).toHaveCount(3);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
