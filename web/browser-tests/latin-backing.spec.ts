import {test,expect} from '@playwright/test';
test('Latin percussion and melodic-only banks reach the worklet and switch to bossa without losing the mix',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Original=window.AudioWorkletNode;(window as any).__kits=[];(window as any).__band=[];window.AudioWorkletNode=class extends Original{constructor(c:BaseAudioContext,n:string,o?:AudioWorkletNodeOptions){super(c,n,o);const post=this.port.postMessage.bind(this.port);this.port.postMessage=(d:any,t?:Transferable[])=>{if(d.type==='drum-kit')(window as any).__kits.push(...Object.keys(d.kit));if(d.settings)(window as any).__band.push(structuredClone(d.settings));if(t)post(d,t);else post(d);};}};});
 await page.goto('/');await page.locator('[data-workspace-target=sound-settings-title]').click();await page.locator('#backing-style').selectOption('latin');
 await page.locator('#mini-mixer').click();for(const id of ['drums','sequence'])await page.locator(`[data-mute-channel=${id}]:visible`).click();await page.locator('#floating-mixer-close').click();
 await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');
 const installed=await page.evaluate(()=>(window as any).__kits);
 expect(installed).toEqual(expect.arrayContaining(['latinClave1','latinCongaOpen1','latinTumbaOpen1','latinGuiroLong1','piano55','jazzKickSoft1']));
 expect(installed.some((id:string)=>id.startsWith('bass')||id.startsWith('upright'))).toBe(false);
 expect(await page.evaluate(()=>(window as any).__band.at(-1).sequenceTone)).toBe('acousticPiano');
 await page.locator('#backing-style').selectOption('bossa');
 await expect.poll(()=>page.evaluate(()=>(window as any).__band.at(-1).sequenceTone)).toBe('nylonGuitar');
 expect(await page.evaluate(()=>(window as any).__kits.some((id:string)=>id.startsWith('nylon')))).toBe(true);
 await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
