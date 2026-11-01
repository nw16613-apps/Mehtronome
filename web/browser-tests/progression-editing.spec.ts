import {test,expect} from '@playwright/test';
const draft=()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!);
async function open(page:any){
 await page.addInitScript(()=>{if(!localStorage.getItem('mehtronome-repertoire-v1'))localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'editing',name:'Editable chart',key:9,beats:4,progression:{version:2,name:'Editable chart',steps:[{root:0,chord:'min7',mode:'dorian',bars:1,bass:null},{root:5,chord:'dom7',mode:'mixolydian',bars:2,bass:null},{root:10,chord:'maj7',mode:'major',bars:1,bass:null}]}}]}));});
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:editing');
}
test('chord edits preserve positions and bulk quality/position changes have an explicit scope and Undo',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 await page.locator('#custom-position').selectOption('III');await page.locator('#custom-root').selectOption('2');await page.locator('#custom-chord').selectOption('maj7');await expect(page.locator('#custom-position')).toHaveValue('III');
 await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('.exercise-position-route [data-inspect-slot="0"]')).toHaveAttribute('data-position','III');await page.locator('#exercise-card-start').selectOption('3:0');await page.locator('#exercise-edit-chord').click();await expect(page.locator('#custom-position')).toHaveValue('III');
 await page.locator('#custom-bulk-editor>summary').click();await page.locator('#custom-bulk-quality').selectOption('min7');await page.locator('#custom-apply-quality').click();
 let c=await page.evaluate(draft);expect(c.steps.map((s:any)=>s.chord)).toEqual(['min7','min7','min7']);expect(c.steps[0].position).toBe('III');expect(c.steps[0].startTone).toBe('3:0');expect(c.steps.map((s:any)=>s.root)).toEqual([2,5,10]);expect(c.steps.map((s:any)=>s.bars)).toEqual([1,2,1]);
 await page.locator('#custom-bulk-position').selectOption('V');await page.locator('#custom-apply-position').click();c=await page.evaluate(draft);expect(c.steps.map((s:any)=>s.position)).toEqual(['V','V','V']);
 await page.locator('#custom-edit-scope').selectOption('selected');const checks=page.locator('[data-select-chord]');await checks.nth(0).check();await checks.nth(2).check();await page.locator('#custom-bulk-quality').selectOption('maj7');await page.locator('#custom-apply-quality').click();c=await page.evaluate(draft);expect(c.steps.map((s:any)=>s.chord)).toEqual(['maj7','min7','maj7']);
 await page.locator('#custom-undo').click();expect((await page.evaluate(draft)).steps.map((s:any)=>s.chord)).toEqual(['min7','min7','min7']);await page.locator('#custom-redo').click();expect((await page.evaluate(draft)).steps.map((s:any)=>s.chord)).toEqual(['maj7','min7','maj7']);
 await page.locator('#custom-progression-builder').screenshot({path:'/workspace/progression-editor-desktop.png'});
 await page.locator('[data-workspace-target=caged-exercise]').click();for(let i=0;i<3;i++)await expect(page.locator(`.exercise-position-route [data-inspect-slot="${i}"]`)).toHaveAttribute('data-position','V');expect(errors).toEqual([]);
});
test('insertion, duplicate, reorder, saved-chart reload and automatic unpin preserve card-owned choices on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await page.locator('#custom-position').selectOption('IV');
 await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-card-start').selectOption('5:0');await page.locator('#exercise-edit-chord').click();
 const original=(await page.evaluate(draft)).steps[0];await page.locator('[data-insert-chord="1"]').click();let c=await page.evaluate(draft);expect(c.steps).toHaveLength(4);expect(c.steps[1].position).toBe('IV');expect(c.steps[1].bars).toBe(original.bars);expect(c.steps[1].startTone).toBe('5:0');expect(c.steps[1].id).not.toBe(original.id);
 await page.locator('#custom-duplicate').click();c=await page.evaluate(draft);expect(c.steps).toHaveLength(5);const copy=c.steps[2];expect(copy.position).toBe('IV');expect(copy.startTone).toBe('5:0');expect(new Set(c.steps.map((s:any)=>s.id)).size).toBe(5);
 await page.locator('#custom-left').click();c=await page.evaluate(draft);expect(c.steps[1].id).toBe(copy.id);expect(c.steps[1].position).toBe('IV');await page.locator('#custom-chord').selectOption('maj7');await expect(page.locator('#custom-position')).toHaveValue('IV');
 await page.locator('#repertoire-save').click();const saved=await page.locator('#progression-choice').inputValue();await page.reload();await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption(saved);await page.locator('[data-edit-chord="1"]').click();await expect(page.locator('#custom-position')).toHaveValue('IV');
 await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('.exercise-position-route [data-inspect-slot="1"]').click();await expect(page.locator('#exercise-card-start')).toHaveValue('5:0');await expect(page.locator('.exercise-position-route [data-inspect-slot="1"]')).toHaveAttribute('data-position','IV');
 await page.locator('#exercise-edit-chord').click();await page.locator('#custom-position').selectOption('auto');c=await page.evaluate(draft);expect(c.steps[1].position).toBeUndefined();expect(c.steps[0].position).toBe('IV');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.locator('#custom-progression-builder').screenshot({path:'/workspace/progression-editor-mobile.png'});
});
test('charts with identical chords retain independent positions and start choices',async({page})=>{
 await open(page);
 await page.locator('#custom-position').selectOption('I');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-card-start').selectOption('3:0');await page.locator('#exercise-edit-chord').click();await page.locator('#repertoire-save').click();const saved=await page.locator('#progression-choice').inputValue();
 await page.locator('#progression-choice').selectOption('saved:editing');await expect(page.locator('#custom-position')).not.toHaveValue('I');await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('#exercise-card-start')).toHaveValue('inherit');
 await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption(saved);await expect(page.locator('#custom-position')).toHaveValue('I');await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('#exercise-card-start')).toHaveValue('3:0');
});
test('assigning a position to selected cards preserves the other automatically chosen positions',async({page})=>{
 await open(page);await page.locator('[data-workspace-target=caged-exercise]').click();const route=()=>page.locator('.exercise-position-route [data-inspect-slot]').evaluateAll(nodes=>nodes.map(n=>(n as HTMLElement).dataset.position));const before=await route();
 await page.locator('#exercise-edit-chord').click();await page.locator('#custom-bulk-editor>summary').click();await page.locator('#custom-edit-scope').selectOption('selected');await page.locator('[data-select-chord]').nth(0).check();await page.locator('#custom-bulk-position').selectOption('V');await page.locator('#custom-apply-position').click();await page.locator('[data-workspace-target=caged-exercise]').click();expect(await route()).toEqual(['V',...before.slice(1)]);
});
