import {test,expect} from '@playwright/test';
const draft=()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!);
async function chart(page:any){
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'mode-choice',name:'Mode choices',key:9,beats:4,progression:{version:2,name:'Mode choices',steps:[{root:0,chord:'min7',mode:'dorian',bars:1,bass:null},{root:5,chord:'dom7',mode:'mixolydian',bars:1,bass:null},{root:10,chord:'maj7',mode:'major',bars:1,bass:null}]}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:mode-choice');
}
test('mode-first fixes the mode, suggests chord qualities, preserves positions and supports Undo',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await chart(page);
 await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');await page.locator('#exercise-position').selectOption('III');await page.locator('[data-workspace-target=harmony-title]').click();
 const before=await page.evaluate(draft),positions=(await page.locator('#manual-position-route').inputValue()).split(':').at(-1);
 await page.locator('[data-chart-workflow=mode]').click();expect(await page.evaluate(draft)).toEqual(before);
 const order=await page.locator('.chart-chord-group select').evaluateAll(nodes=>nodes.map(n=>n.id));expect(order.indexOf('custom-mode')).toBeLessThan(order.indexOf('custom-chord'));
 await page.locator('#custom-mode').selectOption('lydian');await expect(page.locator('#custom-chord')).toHaveValue('maj9sharp11');await page.locator('#custom-chord').selectOption('maj13sharp11');await expect(page.locator('#custom-mode')).toHaveValue('lydian');let c=await page.evaluate(draft);expect(c.steps[0].chord).toBe('maj13sharp11');expect(c.steps[0].mode).toBe('lydian');expect(c.steps.map((s:any)=>s.root)).toEqual([0,5,10]);expect(c.steps[1]).toEqual(before.steps[1]);expect(c.steps[2]).toEqual(before.steps[2]);expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe(positions);
 await page.locator('#custom-undo').click();await expect(page.locator('#custom-chord')).toHaveValue('maj9sharp11');await page.locator('#custom-undo').click();await expect(page.locator('#custom-chord')).toHaveValue('min7');await expect(page.locator('#custom-mode')).toHaveValue('dorian');
 await page.locator('[data-chart-workflow=chord]').click();await page.locator('#custom-chord').selectOption('min11');await expect(page.locator('#custom-mode')).toHaveValue('dorian');await expect(page.locator('#custom-mode option[value=major]')).toHaveCount(0);expect(errors).toEqual([]);
});
test('mixed drag-selected chords choose one mode then retain it while applying compatible qualities',async({page})=>{
 await chart(page);await page.locator('[data-grid-beat="0"]').scrollIntoViewIfNeeded();const a=(await page.locator('[data-grid-beat="0"]').boundingBox())!,b=(await page.locator('[data-grid-beat="7"]').boundingBox())!;await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5});await page.mouse.up();await expect(page.locator('#custom-edit-selection-status')).toContainText('all 2 selected');
 await page.locator('[data-chart-workflow=mode]').click();await expect(page.locator('#custom-mode')).toHaveValue('mixed');await expect(page.locator('#custom-chord')).toBeDisabled();await page.locator('#custom-mode').selectOption('dorian');await expect(page.locator('#custom-chord')).toBeEnabled();await page.locator('#custom-chord').selectOption('min9');const c=await page.evaluate(draft);expect(c.steps.map((s:any)=>s.chord)).toEqual(['min9','min9','maj7']);expect(c.steps.map((s:any)=>s.mode)).toEqual(['dorian','dorian','major']);expect(c.steps.map((s:any)=>s.root)).toEqual([0,5,10]);
 await page.locator('#custom-mode').selectOption('altered');await expect(page.locator('#custom-chord')).toHaveValue('dom7alt');await expect(page.locator('#custom-chord option[value=dom7]')).toHaveCount(0);
});
test('reduced guides are labelled and workflow preference survives reload on phone width',async({page})=>{
 await page.setViewportSize({width:390,height:844});await chart(page);await page.locator('[data-chart-workflow=mode]').click();await page.locator('#custom-mode').selectOption('major_pentatonic');await expect(page.locator('#custom-chord option[value=maj7]')).toContainText('reduced guide');await page.locator('#custom-chord').selectOption('maj7');await expect(page.locator('#custom-mode')).toHaveValue('major_pentatonic');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.locator('#custom-progression-builder').screenshot({path:'/workspace/mode-first-mobile.png'});
 await page.reload();await page.locator('[data-workspace-target=harmony-title]').click();await expect(page.locator('#custom-harmony-workflow')).toHaveValue('mode');
});
test('mode-first groups chord structures and offers added modal colours without changing roots',async({page})=>{
 await chart(page);await page.locator('[data-chart-workflow=mode]').click();await page.locator('#custom-mode').selectOption('lydian');
 for(const label of ['Triads','Sevenths','Sixths & added tones','Extensions & alterations'])await expect(page.locator(`#custom-chord optgroup[label="${label}"]`)).toHaveCount(1);
 await expect(page.locator('#custom-chord optgroup[label="Sixths & added tones"] option[value=addSharp11]')).toHaveCount(1);
 await page.locator('#custom-chord').selectOption('addSharp11');await expect(page.locator('#custom-mode')).toHaveValue('lydian');expect((await page.evaluate(draft)).steps.map((s:any)=>s.root)).toEqual([0,5,10]);
 await page.locator('#custom-mode').selectOption('minor');await page.locator('#custom-chord').selectOption('min7b13');await expect(page.locator('#custom-mode')).toHaveValue('minor');
 await page.locator('#custom-mode').selectOption('major_pentatonic');await expect(page.locator('#custom-chord optgroup[label="Reduced guides · sevenths"] option[value=maj7]')).toHaveCount(1);
});
