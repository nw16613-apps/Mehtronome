import {test,expect} from '@playwright/test';
test('normal playback sends musical fill variations to the drummer, including on a one-chord chart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Original=window.AudioWorkletNode;(window as any).__fillPlans=[];window.AudioWorkletNode=class extends Original{constructor(c:BaseAudioContext,n:string,o?:AudioWorkletNodeOptions){super(c,n,o);const post=this.port.postMessage.bind(this.port);this.port.postMessage=(data:any,transfer?:Transferable[])=>{const score=data.referencePlan?.plan?.score;if(score)(window as any).__fillPlans.push({style:score.id,cycles:score.sessionPerformance?.variants.map((v:any)=>Object.values(v?.drums||{}).flat().filter((e:any)=>e.sessionFill).map((e:any)=>[e.at,e.name,e.velocity]))});if(transfer)post(data,transfer);else post(data);};}};});
 await page.goto('/');await page.locator('[data-workspace-target=sound-settings-title]').click();
 for(const style of ['popRock','funk','slowSoul128','ballad']){
  await page.locator('#backing-style').selectOption(style);await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.evaluate((id)=>(window as any).__fillPlans.findLast((s:any)=>s.style===id)?.cycles?.[0]?.length,style)).toBeGreaterThan(0);
  const plan=await page.evaluate((id)=>(window as any).__fillPlans.findLast((s:any)=>s.style===id),style);expect(plan.cycles).toHaveLength(3);expect(new Set(plan.cycles.map(JSON.stringify)).size).toBeGreaterThan(1);expect(plan.cycles.flat().every(([,name,v]:any)=>name!=='kick'&&name!=='crash'&&v>0&&v<=.42)).toBe(true);
  await page.locator('#mini-play').click();
 }
 expect(errors).toEqual([]);
});
