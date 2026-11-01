import {test,expect} from '@playwright/test';
test('automatic low route follows nearby A and C shapes and is shared with Exercises',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'smooth',name:'Smooth route',key:7,beats:4,progression:{version:2,name:'Smooth route',steps:[{root:0,letter:0},{root:3,letter:2},{root:6,letter:4},{root:9,letter:5}].map(step=>({...step,chord:'min7',mode:'dorian',bars:2,bass:null}))}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:smooth');await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#position-region').selectOption('low');
 const positions=page.locator('#position-path [data-inspect-slot]');await expect(positions).toHaveCount(4);
 for(const [index,numeral]of ['I','V','IV','III'].entries())await expect(positions.nth(index)).toHaveAttribute('data-position',numeral);
 await expect(positions.nth(2)).toContainText('A shape');await expect(positions.nth(3)).toContainText('C shape');
 await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('#exercise-position-region')).toHaveValue('low');const route=page.locator('.exercise-position-route [data-inspect-slot]');
 for(const [index,numeral]of ['I','V','IV','III'].entries())await expect(route.nth(index)).toHaveAttribute('data-position',numeral);
 await route.nth(2).click();await expect(page.locator('.exercise-map-heading')).toContainText('Position IV');await route.nth(3).click();await expect(page.locator('.exercise-map-heading')).toContainText('Position III');expect(errors).toEqual([]);
});
