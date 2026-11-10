import {test,expect} from '@playwright/test';
test('normal style selection sends advanced comping to playback without extra controls',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Original=window.AudioWorkletNode;(window as any).__harmonicScores=[];window.AudioWorkletNode=class extends Original{constructor(c:BaseAudioContext,n:string,o?:AudioWorkletNodeOptions){super(c,n,o);const post=this.port.postMessage.bind(this.port);this.port.postMessage=(data:any,t?:Transferable[])=>{const score=data.referencePlan?.plan?.score;if(score)(window as any).__harmonicScores.push({style:score.id,techniques:[...new Set(score.comping.flat().map((e:any)=>e.compingTechnique))]});if(t)post(data,t);else post(data);};}};});
 await page.goto('/');await page.locator('[data-workspace-target=sound-settings-title]').click();
 for(const id of ['traditionalJazz','fusionJazz','legatoFusion']){
  await page.locator('#backing-style').selectOption(id);await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');
  const score=await page.evaluate((id)=>(window as any).__harmonicScores.findLast((s:any)=>s.style===id),id);expect(score).toBeTruthy();
  for(const family of ['quartal','pentatonic','triadPair'])expect(score.techniques).toContain(family);
  await page.locator('#mini-play').click();
 }
 expect(errors).toEqual([]);
});
