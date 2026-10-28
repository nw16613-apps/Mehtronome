import {test,expect} from '@playwright/test';
test('one progression strip per workspace combines harmony and CAGED facts',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('#practice-goal').selectOption('jazz');await page.locator('#start-guided-goal').click();
 for(const target of ['guitar-title','caged-exercise']){
  await page.locator(`[data-workspace-target="${target}"]`).click();const workspace=target==='guitar-title'?'.workspace-guitar':'.workspace-exercises';
  await expect(page.locator(`${workspace} .reference-chords,${workspace} [data-reference-step]`)).toHaveCount(0);await expect(page.locator(`${workspace} [data-route-step]`)).toHaveCount(3);
  const card=page.locator(`${workspace} [data-route-step="1"]`);await expect(card).toContainText('E7');await expect(card).toContainText('Position');await expect(card).toContainText('beats');await expect(card).toContainText('Mixolydian');await card.click();await expect(page.locator('#mini-chord')).toHaveText('E7');
 }
 const order=await page.evaluate(()=>['.exercise-navigation','.exercise-linked-fretboard','.exercise-viewbar','.exercise-material-layout'].map(s=>document.querySelector(s)!.getBoundingClientRect().top));expect(order).toEqual([...order].sort((a,b)=>a-b));
 await page.locator('.notation-scroll').evaluate(e=>(e as HTMLElement).dataset.retained='yes');const card=page.locator('.exercise-position-route [data-route-step="0"]');await card.focus();await card.press('Space');await expect(page.locator('#mini-chord')).toHaveText('Bm7');await expect(page.locator('.notation-scroll')).toHaveAttribute('data-retained','yes');await card.scrollIntoViewIfNeeded();const point=(await card.boundingBox())!;await page.mouse.move(point.x+point.width/2,point.y+point.height/2);await page.mouse.down();await expect.poll(()=>page.locator('#preview-status').evaluate(e=>(e as HTMLElement).hidden)).toBe(false);await page.mouse.up();await expect.poll(()=>page.locator('#preview-status').evaluate(e=>(e as HTMLElement).hidden)).toBe(true);await expect(page.locator('.notation-scroll')).toHaveAttribute('data-retained','yes');
 await page.locator('.exercise-navigation').screenshot({path:'/workspace/combined-exercise-progression.png'});await page.locator('#caged-exercise').screenshot({path:'/workspace/combined-exercise-layout.png'});
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
