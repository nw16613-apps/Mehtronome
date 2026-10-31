import {test,expect} from '@playwright/test';
test('Pattern start keeps its place and dimensions across rhythms and help messages',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.evaluate(()=>document.fonts.ready);
 const position=()=>page.locator('#exercise-start-note').evaluate(el=>{const origin=el.closest('.exercise-controls')!.getBoundingClientRect(),box=el.getBoundingClientRect();return {x:box.x-origin.x,y:box.y-origin.y,width:box.width,height:box.height};});
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});for(const study of ['positional','positionalscale']){await page.locator('#exercise-study').selectOption(study);await page.locator('#exercise-rhythm').selectOption('eighths');const before=await position();for(const rhythm of ['sixteenths','triplets','eighths']){await page.locator('#exercise-rhythm').selectOption(rhythm);const after=await position();for(const key of ['x','y','width','height'] as const)expect(after[key]).toBeCloseTo(before[key],1);if(rhythm==='triplets'){expect(await page.locator('.exercise-controls small').count()).toBe(0);await expect(page.locator('#exercise-phrase')).toHaveCount(0);}} }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
});
