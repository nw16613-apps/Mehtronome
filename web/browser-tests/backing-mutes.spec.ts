import {test,expect} from '@playwright/test';
const channels=['drums','bass','comping','sequence'];
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
test('backing tracks start muted, play on unmute, and retain mute choices in presets',async({page})=>{
 await page.addInitScript(()=>{const Original=window.AudioWorkletNode;window.AudioWorkletNode=class extends Original{constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){super(context,name,options);const a=context.createAnalyser();this.connect(a,0);this.connect(a,1);this.connect(a,2);(window as any).__backingAnalyser=a;}};});
 await page.goto('/');await expect(page.locator('button[data-console-enable]')).toHaveCount(0);
 for(const id of channels){await expect(page.locator('#'+id)).toBeHidden();await expect(page.locator('#'+id)).toBeChecked();await expect(page.locator(`[data-mute-channel=${id}]`)).toHaveAttribute('aria-pressed','true');}
 await page.locator('[data-mute-channel=click]').click();await page.locator('[data-mute-channel=harmony]').click();await page.locator('#mini-count-in').uncheck();
 await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');await page.locator('#mini-play').click();await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');
 const peak=()=>page.evaluate(()=>new Promise<number>(resolve=>{const a=(window as any).__backingAnalyser as AnalyserNode,buffer=new Float32Array(a.fftSize),start=performance.now();let peak=0;const sample=()=>{a.getFloatTimeDomainData(buffer);for(const v of buffer)peak=Math.max(peak,Math.abs(v));if(performance.now()-start>550)resolve(peak);else requestAnimationFrame(sample);};sample();}));
 await expect.poll(peak).toBeLessThan(.00001);
 for(const id of channels){await page.locator(`[data-mute-channel=${id}]`).click();await expect.poll(peak,{timeout:10000}).toBeGreaterThan(.0001);await page.locator(`[data-mute-channel=${id}]`).click();await expect.poll(peak,{timeout:10000}).toBeLessThan(.00001);}
 await page.locator('#mini-play').click();await page.locator('[data-mute-channel=bass]').click();
 await tab(page,'progress-title');await page.locator('#preset-name').fill('Bass only backing');await page.locator('#preset-save').click();await tab(page,'pulse-title');await page.locator('[data-mute-channel=bass]').click();await tab(page,'progress-title');await page.locator('#preset-load').click();await tab(page,'pulse-title');await expect(page.locator('[data-mute-channel=bass]')).toHaveAttribute('aria-pressed','false');
 await tab(page,'sound-settings-title');for(const id of channels)await expect(page.locator('#'+id)).toBeHidden();await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('old off switches migrate to mute without bringing unwanted instruments into a saved mix',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'old-off',name:'Old off',progression:false,controls:{bpm:'100',drums:false,'mute-drums':false,bass:true,'mute-bass':false,comping:false,sequence:false}}]})));
 await page.goto('/');await tab(page,'progress-title');await page.locator('#preset-list').selectOption('old-off');await page.locator('#preset-load').click();await tab(page,'pulse-title');
 await expect(page.locator('[data-mute-channel=drums]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-mute-channel=bass]')).toHaveAttribute('aria-pressed','false');for(const id of channels)await expect(page.locator('#'+id)).toBeChecked();
});
