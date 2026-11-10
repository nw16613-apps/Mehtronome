import {test,expect} from '@playwright/test';
test('Blues delivers ride-led plans and recorded ride samples for ordinary charts and its reference study',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const Original=window.AudioWorkletNode;(window as any).__bluesPlans=[];(window as any).__drumSampleNames=[];
  window.AudioWorkletNode=class extends Original{constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){super(context,name,options);const post=this.port.postMessage.bind(this.port);this.port.postMessage=(data:any,transfer?:Transferable[])=>{
   if(data.referencePlan?.plan?.score?.id==='blues')(window as any).__bluesPlans.push(data.referencePlan.plan.score.drums.flat().map((e:any)=>e.name));
   if(data.type==='drum-kit')(window as any).__drumSampleNames.push(...Object.keys(data.kit||{}));
   if(transfer)post(data,transfer);else post(data);
  };}};
 });
 await page.goto('/');await page.locator('[data-workspace-target=sound-settings-title]').click();await page.locator('#backing-style').selectOption('blues');await expect(page.locator('#backing-style-description')).toContainText('ride-led');await page.locator('#mini-count-in').uncheck();await page.locator('#mini-mixer').click();const mute=page.locator('[data-mute-channel=drums]:visible');if(await mute.getAttribute('aria-pressed')==='true')await mute.click();await page.locator('#floating-mixer-close').click();await page.locator('#mini-play').click();
 await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');await expect.poll(()=>page.evaluate(()=>(window as any).__bluesPlans.length)).toBeGreaterThan(0);
 const check=async()=>{const names=await page.evaluate(()=>(window as any).__bluesPlans.at(-1));expect(names).toContain('ride');expect(names).not.toContain('hat');expect(names).not.toContain('hatOpen');expect(names).toContain('snare');};await check();
 expect(await page.evaluate(()=>(window as any).__drumSampleNames.some((name:string)=>/ride/i.test(name)))).toBe(true);await page.locator('#mini-play').click();
 await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('reference:blues');await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');await check();await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
