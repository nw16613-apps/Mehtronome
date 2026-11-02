import {test,expect} from '@playwright/test';
const working=()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!);
async function chart(page:any){
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'selection',name:'Mouse selection',key:9,beats:4,progression:{version:2,name:'Mouse selection',steps:[{root:0,chord:'min7',mode:'dorian',bars:1,bass:null},{root:5,chord:'dom7',mode:'mixolydian',bars:2,bass:null},{root:7,chord:'min7',mode:'dorian',bars:1,bass:null},{root:10,chord:'maj7',mode:'major',bars:1,bass:null}]}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:selection');
}
async function drag(page:any,from:number,to:number){
 const first=page.locator(`[data-grid-beat="${from}"]`),last=page.locator(`[data-grid-beat="${to}"]`);await first.scrollIntoViewIfNeeded();const a=(await first.boundingBox())!,b=(await last.boundingBox())!;await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5});await page.mouse.up();await expect(page.locator('#custom-edit-selection-status')).toContainText('all 2 selected');
}
test('mouse-drag selection edits exactly its chord entries and preserves all other fields with Undo',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await chart(page);await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');for(const [slot,position]of ['I','V','III','IV'].entries()){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}await page.locator('[data-workspace-target=harmony-title]').click();const before=await page.evaluate(working);await drag(page,5,12);
 await expect(page.locator('#custom-chord')).toHaveValue('mixed');await expect(page.locator('#custom-root')).toHaveValue('mixed');await expect(page.locator('#custom-beat-grid [aria-pressed="true"]')).toHaveCount(12);
 await page.locator('#custom-chord').selectOption('maj7');let c=await page.evaluate(working);expect(c.steps.map((s:any)=>s.chord)).toEqual(['min7','maj7','maj7','maj7']);expect(c.steps.map((s:any)=>s.root)).toEqual(before.steps.map((s:any)=>s.root));expect(c.steps.map((s:any)=>s.bars)).toEqual([1,2,1,1]);await expect(page.locator('#custom-edit-selection-status')).toContainText('all 2 selected');
 await page.locator('#custom-undo').click();expect((await page.evaluate(working)).steps.map((s:any)=>s.chord)).toEqual(before.steps.map((s:any)=>s.chord));await page.locator('#custom-redo').click();expect((await page.evaluate(working)).steps.map((s:any)=>s.chord)).toEqual(['min7','maj7','maj7','maj7']);
 await page.locator('#custom-root').selectOption('2');c=await page.evaluate(working);expect(c.steps.map((s:any)=>s.root)).toEqual([0,2,2,10]);expect(c.steps.map((s:any)=>s.bars)).toEqual([1,2,1,1]);expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe('0423');
 await page.locator('[data-workspace-target=guitar-title]').click();for(const [slot,position]of [[1,'V'],[2,'III']])await expect(page.locator(`#position-path [data-route-step="${slot}"]`)).toHaveAttribute('data-position',String(position));await page.locator('[data-workspace-target=harmony-title]').click();
 // A normal click leaves the playback loop intact and narrows editing to one chord.
 await page.locator('[data-grid-beat="16"]').click();await expect(page.locator('#custom-edit-selection-status')).toBeHidden();await page.locator('#custom-chord').selectOption('dom7');expect((await page.evaluate(working)).steps.map((s:any)=>s.chord)).toEqual(['min7','maj7','maj7','dom7']);expect(errors).toEqual([]);
});
test('backwards selection, single held chord, and clearing the selection use the expected edit scope',async({page})=>{
 await chart(page);await drag(page,12,5);await page.locator('#custom-chord').selectOption('minor');expect((await page.evaluate(working)).steps.map((s:any)=>s.chord)).toEqual(['min7','minor','minor','maj7']);
 await page.locator('#chart-clear-selection').click();await expect(page.locator('#custom-edit-selection-status')).toBeHidden();await page.locator('#custom-chord').selectOption('min7');expect((await page.evaluate(working)).steps.map((s:any)=>s.chord)).toEqual(['min7','min7','minor','maj7']);
});
