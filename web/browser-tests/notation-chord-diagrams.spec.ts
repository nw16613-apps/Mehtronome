import {test,expect} from '@playwright/test';
async function clearance(page:any){
 return page.locator('.exercise-notation').evaluateAll((svgs:any[])=>svgs.map(svg=>{
  const diagrams=[...svg.querySelectorAll('.notation-chord-diagram')].map(n=>n.getBoundingClientRect());
  const notes=[...svg.querySelectorAll('.note-head,.note-stem,.note-beam,.tuplet-number')].map(n=>n.getBoundingClientRect());
  return !diagrams.length||!notes.length?999:Math.min(...notes.map(b=>b.top))-Math.max(...diagrams.map(b=>b.bottom));
 }));
}
test('optional chord diagrams follow per-slot CAGED positions and survive display, export and reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await expect(page.locator('.notation-chord-symbol')).toHaveCount(1);await expect(page.locator('.notation-chord-diagram')).toHaveCount(0);
 await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(slot<2?'II':'III');}
 await page.locator('#exercise-chord-diagrams').check();await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.notation-chord-symbol')).toHaveCount(1);await expect(page.locator('.notation-chord-diagram')).toHaveCount(2);
 await expect(page.locator('.notation-chord-diagram[data-position="II"]')).toHaveAttribute('data-grip-available','true');await expect(page.locator('.notation-chord-diagram[data-position="III"]')).toHaveAttribute('data-grip-available','true');
 const coordinates=await page.locator('.notation-chord-diagram').evaluateAll(nodes=>nodes.map(n=>[...n.querySelectorAll('.notation-grip-dot')].map(dot=>[dot.getAttribute('data-string'),dot.getAttribute('data-fret')])));
 for(const [index,slot]of [0,2].entries()){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();const linked=await page.locator('.exercise-map-diagram .grip-note').evaluateAll(nodes=>nodes.map(n=>[n.getAttribute('data-string'),n.getAttribute('data-fret')]));expect(coordinates[index]).toEqual(linked);}
 for(const rhythm of ['eighths','triplets','sixteenths']){await page.locator('#exercise-rhythm').selectOption(rhythm);expect((await clearance(page)).every(gap=>gap>=10)).toBe(true);}
 await page.locator('#exercise-display').selectOption('tab');await expect(page.locator('.notation-chord-diagram').first()).toBeVisible();await page.locator('#exercise-display').selectOption('names');
 const downloadPromise=page.waitForEvent('download');await page.locator('#exercise-export').click();const download=await downloadPromise,stream=await download.createReadStream();let raw='';if(stream)for await(const chunk of stream)raw+=chunk.toString();expect(raw).toContain('notation-chord-diagram');expect(raw).toContain('data-position="II"');expect(raw).toContain('data-position="III"');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.locator('.notation-scroll').screenshot({path:'/workspace/notation-chord-diagrams-mobile.png'});
 await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('#exercise-chord-diagrams')).toBeChecked();await expect(page.locator('.notation-chord-diagram').first()).toBeVisible();await page.locator('#exercise-chord-diagrams').uncheck();await expect(page.locator('.notation-chord-diagram')).toHaveCount(0);expect(errors).toEqual([]);
});
