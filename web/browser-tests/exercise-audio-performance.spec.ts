import {test,expect} from '@playwright/test';
test('exercise audio keeps scheduling ahead and reuses samples while the UI follows chords',async({page})=>{
 test.setTimeout(45000);
 await page.addInitScript(()=>{
  const metrics={buffers:0,starts:[] as {when:number,now:number}[],active:0,maxActive:0,hiddenRebuilds:0};(window as any).__exerciseAudioMetrics=metrics;
  const create=AudioContext.prototype.createBuffer;AudioContext.prototype.createBuffer=function(...args:Parameters<typeof create>){metrics.buffers++;return create.apply(this,args);};
  const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(when=0,...args:any[]){metrics.starts.push({when,now:this.context.currentTime});metrics.active++;metrics.maxActive=Math.max(metrics.maxActive,metrics.active);this.addEventListener('ended',()=>metrics.active--);return (start as any).call(this,when,...args);};
  localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'audio-load',name:'Audio performance',key:9,beats:4,progression:{version:2,name:'Audio performance',steps:[0,3,6,9].map(root=>({root,chord:'min7',mode:'dorian',bars:1,bass:null}))}}]}));
 });
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:audio-load');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-loop').check();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');
 await page.evaluate(()=>{const metrics=(window as any).__exerciseAudioMetrics;for(const id of ['position-overview','note-list','full-fretboard']){const target=document.getElementById(id);if(target)new MutationObserver(changes=>{metrics.hiddenRebuilds+=changes.filter(c=>c.type==='childList').length;}).observe(target,{subtree:true,childList:true});}});
 const client=await page.context().newCDPSession(page);await client.send('Emulation.setCPUThrottlingRate',{rate:6});
 await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true',{timeout:20000});
 await expect.poll(()=>page.evaluate(()=>(window as any).__exerciseAudioMetrics.starts.length),{timeout:10000}).toBeGreaterThan(75);
 const result=await page.evaluate(()=>{const m=(window as any).__exerciseAudioMetrics;return {hiddenRebuilds:m.hiddenRebuilds,buffers:m.buffers,maxActive:m.maxActive,late:m.starts.filter((s:any)=>s.when>0&&s.when<s.now-.005).length,starts:m.starts.length,cadence:Math.max(0,...m.starts.slice(1).map((s:any,i:number)=>Math.abs(s.when-m.starts[i].when-.0625)))};});console.log(JSON.stringify(result));
 await page.locator('#exercise-preview').click();await client.send('Emulation.setCPUThrottlingRate',{rate:1});
 expect(result.hiddenRebuilds).toBe(0);expect(result.late).toBe(0);expect(result.maxActive).toBeLessThan(40);expect(result.buffers).toBeLessThan(48);expect(result.cadence).toBeLessThan(.002);
});

test('cancelling preparation cannot start stale exercise audio later',async({page})=>{
 await page.addInitScript(()=>{(window as any).__noteStarts=0;const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args:any[]){(window as any).__noteStarts++;return (start as any).apply(this,args);};});
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.evaluate(()=>{document.querySelector<HTMLButtonElement>('#exercise-preview')!.click();document.querySelector<HTMLButtonElement>('#mini-play')!.click();});
 await page.waitForTimeout(1000);await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','false');expect(await page.evaluate(()=>(window as any).__noteStarts)).toBe(0);
});
