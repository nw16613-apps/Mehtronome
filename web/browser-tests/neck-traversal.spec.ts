import {test,expect} from '@playwright/test';
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target="guitar-title"]').click();}
const coords=async(page:any)=>page.locator('.exercise-note:not(.resolution-note)').evaluateAll(nodes=>[...new Map(nodes.map(n=>[n.getAttribute('data-note-index'),n])).values()].map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return {string:Number(m[1]),fret:Number(m[2])};}));
test('horizontal routes synchronize both workspaces, notation, map and favourite restores',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 await page.locator('#guitar-neck-traversal').selectOption('horizontal');
 await expect(page.locator('#guitar-neck-strings')).toHaveValue('0,1');await expect(page.locator('#position-overview')).toBeHidden();await expect(page.locator('#full-fretboard .neck-route-map')).toHaveCount(1);
 await page.locator('[data-workspace-target="caged-exercise"]').click();await expect(page.locator('#exercise-neck-traversal')).toHaveValue('horizontal');
 await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('groups');await page.locator('#exercise-scale-pattern').selectOption('groups4');
 const notes=await coords(page);expect(notes.length).toBeGreaterThan(20);expect(notes.every(n=>[5,6].includes(n.string)&&n.fret>=5&&n.fret<=17)).toBeTruthy();await expect(page.locator('.exercise-map-diagram .neck-route-line')).toHaveCount(1);await expect(page.locator('#caged-exercise')).not.toContainText('undefined');
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-neck-strings').selectOption('2,3,4');
 await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-neck-strings')).toHaveValue('0,1');
 await page.locator('#exercise-neck-traversal').selectOption('position');await expect(page.locator('.exercise-map-diagram .neck-route-map')).toHaveCount(0);await expect(page.locator('#exercise-position-navigation')).toBeVisible();
 await page.locator('[data-workspace-target="guitar-title"]').click();await expect(page.locator('#position-overview')).toBeVisible();await expect(page.locator('#guitar-neck-traversal')).toHaveValue('position');expect(errors).toEqual([]);
});
test('diagonal routes cross strings and frets; map follows exercise playback',async({page})=>{
 await open(page);await page.locator('#guitar-neck-traversal').selectOption('diagonal');await expect(page.locator('#guitar-neck-strings')).toHaveValue('0,1,2,3,4,5');
 await page.locator('[data-workspace-target="caged-exercise"]').click();await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('groups');await page.locator('#exercise-scale-pattern').selectOption('groups4');
 const notes=await coords(page);expect(new Set(notes.map(n=>n.string)).size).toBeGreaterThan(3);expect(Math.max(...notes.map(n=>n.fret))-Math.min(...notes.map(n=>n.fret))).toBeGreaterThan(6);
 await page.locator('#exercise-neck-traversal').scrollIntoViewIfNeeded();await page.screenshot({path:'/workspace/neck-desktop.png'});
 await page.locator('#exercise-backing').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-linked-fretboard .exercise-current')).toHaveCount(1,{timeout:20000});await page.locator('#exercise-preview').click();
});
test('returning to position restores the actual 3NPS shape, and mobile controls fit',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);
 await page.locator('#fretboard-fingering').selectOption('three');await page.locator('#guitar-neck-traversal').selectOption('horizontal');await expect(page.locator('#per-string-diagram')).toBeHidden();
 await page.locator('#guitar-neck-start').fill('8');await page.locator('#guitar-neck-start').press('Tab');await expect(page.locator('#guitar-neck-start')).toHaveValue('8');
 const overflow=await page.locator('#guitar-neck-traversal-controls').evaluate(el=>el.scrollWidth>el.clientWidth+1);expect(overflow).toBeFalsy();await page.screenshot({path:'/workspace/neck-mobile.png'});
 await page.locator('#guitar-neck-traversal').selectOption('position');await expect(page.locator('#per-string-diagram')).toBeVisible();await expect(page.locator('#fretboard-fingering')).toHaveValue('three');
 await page.locator('[data-workspace-target="caged-exercise"]').click();await expect(page.locator('#exercise-fingering')).toHaveValue('three');
});
