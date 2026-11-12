import {test,expect} from '@playwright/test';
async function open(page:any,backing:boolean,countIn=false){
 await page.addInitScript(()=>{const original=MessagePort.prototype.postMessage;(window as any).audioMessages=[];MessagePort.prototype.postMessage=function(message:any,...args:any[]){if(['start','stop','exercise-tempo'].includes(message?.type))(window as any).audioMessages.push(structuredClone(message));return (original as any).call(this,message,...args);};});
 await page.goto('/');await page.locator('#mini-count-in').setChecked(countIn);await page.locator('#mini-bpm').fill('120');await page.locator('#mini-bpm').dispatchEvent('change');
 await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-bars').selectOption('4');await page.locator('#study-load').click();
 await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('intervals');await page.locator('#exercise-scale-pattern').selectOption('thirds');await page.locator('#exercise-backing').setChecked(backing);
 await page.locator('#exercise-tempo').fill('120');await page.locator('#exercise-tempo').dispatchEvent('change');
}
const index=async(page:any)=>Number(await page.locator('.exercise-note.playing').first().getAttribute('data-note-index'));
for(const backing of [false,true])test(`tempo and speed shortcuts preserve the playing position, backing=${backing}`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page,backing);await page.locator('#exercise-loop').check();await page.locator('#exercise-preview').click();await expect.poll(()=>index(page)).toBeGreaterThanOrEqual(4);
 const score=await page.locator('.aligned-notation').first().elementHandle();
 for(const [control,bpm]of [['.5',60],['.75',90],['1',120],['number',100]] as const){
  const before=await index(page);
  if(control==='number'){await page.locator('#exercise-tempo').fill(String(bpm));await page.locator('#exercise-tempo').dispatchEvent('change');}else await page.locator(`[data-tempo-ratio="${control}"]`).click();
  await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#exercise-tempo')).toHaveValue(String(bpm));expect(await score!.evaluate((node:any)=>node.isConnected)).toBe(true);
  expect(await index(page)).toBeGreaterThanOrEqual(before);await expect.poll(()=>index(page)).toBeGreaterThan(before);
 }
 // The floating transport can also edit the exercise tempo directly.
 await page.locator('[data-tempo-ratio="1"]').click();await page.locator('#mini-bpm').fill('140');await page.locator('#mini-bpm').dispatchEvent('change');await expect(page.locator('#exercise-tempo')).toHaveValue('140');await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
 const messages=await page.evaluate(()=>(window as any).audioMessages);expect(messages.filter((m:any)=>m.type==='stop')).toHaveLength(0);expect(messages.filter((m:any)=>m.type==='start')).toHaveLength(backing?1:0);if(backing)expect(messages.filter((m:any)=>m.type==='exercise-tempo').map((m:any)=>m.bpm)).toEqual([60,90,120,100,120,140]);
 await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
test('changing tempo during count-in keeps the original start, and a backed passage completes after slowing down',async({page})=>{
 await open(page,true,true);await page.locator('#exercise-content-family').selectOption('groups');await page.locator('#exercise-scale-pattern').selectOption('groups8');await page.locator('.notation-cell').first().click();await page.locator('#exercise-loop').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-tempo-ratio=".5"]').click();await expect(page.locator('.exercise-note.playing')).toHaveCount(0);await expect(page.locator('.exercise-note.playing').first()).toBeVisible({timeout:10000});
 await page.locator('[data-tempo-ratio=".75"]').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','false',{timeout:10000});
 const messages=await page.evaluate(()=>(window as any).audioMessages);expect(messages.filter((m:any)=>m.type==='start')).toHaveLength(1);expect(messages.filter((m:any)=>m.type==='exercise-tempo')).toHaveLength(2);
});
