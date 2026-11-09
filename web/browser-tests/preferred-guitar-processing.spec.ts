import {test,expect} from '@playwright/test';import {readFileSync} from 'node:fs';
const moduleText=(file:string)=>readFileSync(new URL('../src/audio/'+file,import.meta.url),'utf8').replace(/^import .*\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/\bexport /g,'');
const graphCode="function sourceFor(s,c){return s.soundSources?.[c]||s.soundLibrary;}\n"+moduleText('guitar-policy.js')+moduleText('guitar-processing.js');
test('native guitar amp/cab has stereo chorus, faders preserve drive and desktop/mobile rates agree',async({page})=>{
 await page.route('**/test-guitar-cabinet.wav',route=>route.fulfill({contentType:'audio/wav',body:readFileSync(new URL('../src/audio/samples/preferred/cabinet.wav',import.meta.url))}));await page.goto('/');
 const data=await page.evaluate(async code=>{
  const api=new Function('GUITAR_CABINET_URL',code+';return {createGuitarChannel,loadGuitarCabinet};')('/test-guitar-cabinet.wav');
  async function render(rate:number,level:number,tone='cleanGuitar'){
   const ctx=new OfflineAudioContext(2,rate*3,rate),s={soundLibrary:'expanded',comping:true,compingTone:tone,compingVolume:level},ir=await api.loadGuitarCabinet(ctx,s),source=ctx.createBufferSource(),buffer=ctx.createBuffer(1,rate*3,rate);
   const pcm=buffer.getChannelData(0);for(let n=0;n<pcm.length;n++)pcm[n]=Math.sin(2*Math.PI*220*n/rate)*.012*level/.25;source.buffer=buffer;
   const graph=api.createGuitarChannel(ctx,{node:source},ctx.destination);graph.set(s,'comping',ir);source.start();const result=await ctx.startRendering();let power=0,side=0,peak=0;
   for(let n=rate;n<result.length;n++){const a=result.getChannelData(0)[n],b=result.getChannelData(1)[n];power+=(a*a+b*b)/2;side+=(a-b)*(a-b)/4;peak=Math.max(peak,Math.abs(a),Math.abs(b));}
   return {rms:Math.sqrt(power/(result.length-rate)),side:Math.sqrt(side/(result.length-rate)),peak};
  }
  return {mobile:await render(32000,.25),desktop:await render(48000,.25),loud:await render(32000,1),blues:await render(32000,.25,'bluesGuitar'),fusion:await render(32000,.25,'swelledGuitar'),fusionFull:await render(32000,1,'swelledGuitar')};
 },graphCode);
 for(const value of Object.values(data)){expect(value.rms).toBeGreaterThan(.00001);expect(value.peak).toBeLessThan(1);expect(value.side).toBeGreaterThan(.000001);}
 expect(data.fusionFull.rms/data.fusion.rms).toBeGreaterThan(3.9);expect(data.fusionFull.rms/data.fusion.rms).toBeLessThan(4.1);
 expect(data.loud.rms/data.mobile.rms).toBeGreaterThan(3.9);expect(data.loud.rms/data.mobile.rms).toBeLessThan(4.1);
 expect(Math.abs(20*Math.log10(data.desktop.rms/data.mobile.rms))).toBeLessThan(.5);
});

test('playable mobile app uses Emily amp/chorus and Yamaha bass with working mutes',async({page})=>{
 test.setTimeout(90000);const errors:string[]=[],requests:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('.wav'))requests.push(r.url());});await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{
  (window as any).__preferred={settings:[],context:null,analyser:null};const originalConnect=AudioNode.prototype.connect;
  (AudioNode.prototype.connect as any)=function(to:any,...args:any[]){if(to===this.context.destination){const a=this.context.createAnalyser();(originalConnect as any).call(this,a);(window as any).__preferred.analyser=a;}return (originalConnect as any).call(this,to,...args);};
  const Original=window.AudioWorkletNode;window.AudioWorkletNode=class extends Original{constructor(c:BaseAudioContext,n:string,o?:AudioWorkletNodeOptions){super(c,n,o);const post=this.port.postMessage.bind(this.port);this.port.postMessage=(data:any,t?:Transferable[])=>{if(data.settings)(window as any).__preferred.settings.push(data.settings);if(t)post(data,t);else post(data);};}};
 });
 await page.goto('/');await page.locator('[data-workspace-target=sound-settings-title]').click();await page.locator('#backing-style').selectOption('popRock');
 const muteOnly=async(keep:string)=>page.evaluate(keep=>{for(const id of ['click','harmony','drums','bass','comping','sequence']){const checkbox=document.getElementById('mute-'+id)as HTMLInputElement;if(checkbox&&checkbox.checked!==(id!==keep))document.querySelector<HTMLButtonElement>(`[data-mute-channel="${id}"]`)!.click();}for(const input of document.querySelectorAll<HTMLInputElement>('input[id^="send-"]')){input.value='0';input.dispatchEvent(new Event('input',{bubbles:true}));}},keep);
 await muteOnly('comping');await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');
 const peak=()=>page.evaluate(()=>{const a=(window as any).__preferred.analyser;if(!a)return 0;const x=new Float32Array(a.fftSize);a.getFloatTimeDomainData(x);return Math.max(...x.map(Math.abs));});
 await expect.poll(peak,{timeout:12000}).toBeGreaterThan(.0001);expect(requests.some(x=>x.includes('qEmilyGuitar'))).toBe(true);
 for(const style of ['blues','legatoFusion']){await page.locator('#backing-style').selectOption(style);await expect.poll(()=>page.evaluate(()=>(window as any).__preferred.settings.at(-1)?.backingStyle)).toBe(style);await expect.poll(peak,{timeout:12000}).toBeGreaterThan(.0001);}
 await muteOnly('none');await expect.poll(peak,{timeout:3000}).toBeLessThan(.00001);
 await page.locator('#backing-style').selectOption('funk');await muteOnly('bass');await expect.poll(peak,{timeout:12000}).toBeGreaterThan(.0001);expect(requests.some(x=>x.includes('qYamahaBass'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>(window as any).__preferred.settings.at(-1)?.nativeGuitarProcessing)).toBe(true);await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
