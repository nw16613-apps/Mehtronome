import {test,expect} from '@playwright/test';
test.use({userAgent:'Mozilla/5.0 (Android 13; OnePlus 9 Pro) Gecko/20100101 Firefox/143.0',viewport:{width:390,height:844},hasTouch:true});
async function observeAudio(page:any){await page.addInitScript(()=>{
 const Native=window.AudioContext;(window as any).__audio={options:[],convolvers:[],links:[],context:null,analyser:null};
 const connect=AudioNode.prototype.connect;(AudioNode.prototype.connect as any)=function(to:any,...args:any[]){if(to instanceof AudioNode)(window as any).__audio.links.push({source:this,target:to});return (connect as any).call(this,to,...args);};
 window.AudioContext=new Proxy(Native,{construct(target,args){const ctx=Reflect.construct(target,args) as AudioContext,m=(window as any).__audio;m.options.push(args[0]);m.context=ctx;const createGain=ctx.createGain.bind(ctx);ctx.createGain=()=>{const gain=createGain();if(!m.analyser){m.analyser=ctx.createAnalyser();gain.connect(m.analyser);}return gain;};const create=ctx.createConvolver.bind(ctx);ctx.createConvolver=()=>{const node=create();m.convolvers.push(node);return node;};return ctx;}});
 const Worklet=window.AudioWorkletNode;window.AudioWorkletNode=new Proxy(Worklet,{construct(target,args){const node=Reflect.construct(target,args);(window as any).__audio.worklet=node;return node;}});
 });}
test('phone click-only playback uses bounded-rate output buffering and creates no unused reverbs',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await observeAudio(page);await page.goto('/');
 await page.evaluate(()=>{for(const channel of ['harmony','drums','bass','comping','sequence']){const input=document.getElementById('mute-'+channel)as HTMLInputElement;if(!input.checked)document.querySelector<HTMLButtonElement>(`[data-mute-channel="${channel}"]`)!.click();}});
 await page.locator('#play').click();await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');
 const config=await page.evaluate(()=>(window as any).__audio.options[0]);expect(config.latencyHint).toBe('playback');expect(config.sampleRate).toBe(32000);expect(await page.evaluate(()=>(window as any).__audio.convolvers.length)).toBe(0);
 await expect.poll(()=>page.evaluate(()=>{const a=(window as any).__audio.analyser,data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);return Math.max(...data.map(Math.abs));}),{timeout:4000,intervals:[20]}).toBeGreaterThan(.001);
 const status=await page.evaluate(()=>{const before=document.getElementById('play-status')!.textContent;for(const type of ['comping','sequence','drum'])(window as any).__audio.worklet.port.dispatchEvent(new MessageEvent('message',{data:{type,step:0,sample:100,notes:[60],duration:.5}}));return {before,after:document.getElementById('play-status')!.textContent};});expect(status.after).toBe(status.before);
 await page.locator('#mini-mixer').click();await page.locator('#send-reverb-click').fill('25');await page.locator('#send-reverb-click').dispatchEvent('input');
 await expect.poll(()=>page.evaluate(()=>(window as any).__audio.convolvers.at(-1)?.buffer?.length||0)).toBeGreaterThan(0);
 await page.locator('#send-reverb-click').fill('0');await page.locator('#send-reverb-click').dispatchEvent('input');await expect.poll(()=>page.evaluate(()=>(window as any).__audio.convolvers.at(-1).buffer===null)).toBe(true);
 await page.locator('#floating-mixer-close').click();await page.locator('#play').click();expect(errors).toEqual([]);
});
test('repeated exercise starts reconnect the guitar send to the current reverb',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await observeAudio(page);await page.goto('/');await page.locator('#send-reverb-harmony').fill('30');await page.locator('#send-reverb-harmony').dispatchEvent('input');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-guitar-volume').fill('37');await page.locator('#exercise-guitar-volume').dispatchEvent('input');
 for(let i=0;i<2;i++){await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await expect.poll(()=>page.evaluate(()=>{const m=(window as any).__audio,current=m.convolvers.at(-1);const guitar=m.links.find((link:any)=>link.source instanceof GainNode&&Math.abs(link.source.gain.value-.37)<.001)?.source;const seen=new Set();function reaches(node:any):boolean{if(node===current)return true;if(seen.has(node))return false;seen.add(node);return m.links.filter((link:any)=>link.source===node).some((link:any)=>reaches(link.target));}return !!guitar&&reaches(guitar);})).toBe(true);await page.locator('#exercise-preview').click();}
 expect(errors).toEqual([]);
});
