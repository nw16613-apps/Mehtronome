import {test,expect} from '@playwright/test';
const tab=(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
test('all four standards carry written melody through loading, transposition, save and reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');
 for(const [id,name]of [['autumn-leaves','Autumn Leaves'],['all-the-things','All the Things You Are'],['another-you','There Will Never Be Another You'],['blue-bossa','Blue Bossa']]){
  await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption('standard:'+id);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!).standardMelody)).toBe(id);
  await tab(page,'sound-settings-title');await expect(page.locator('#sequence-activity')).toBeDisabled();await expect(page.locator('#sequence-activity-help')).toContainText('Written melody · '+name);
 }
 await tab(page,'harmony-title');await page.locator('#key').selectOption('5');await page.locator('#repertoire-save').click();const saved=await page.locator('#progression-choice').inputValue();await page.reload();await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption(saved);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!).standardMelody)).toBe('blue-bossa');await expect(page.locator('#key')).toHaveValue('5');
 await page.locator('#progression-choice').selectOption('reference:blues');await tab(page,'sound-settings-title');await expect(page.locator('#sequence-activity')).toBeEnabled();await expect(page.locator('#sequence-activity-help')).not.toContainText('Written melody');expect(errors).toEqual([]);
});
test('audible written melody has a pickup, and Tier 4 backed exercises retain its original form timing',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Original=window.AudioWorkletNode;(window as any).__melodySettings=[];window.AudioWorkletNode=class extends Original{constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){super(context,name,options);const post=this.port.postMessage.bind(this.port);this.port.postMessage=(data:any,transfer?:Transferable[])=>{if(data.settings)(window as any).__melodySettings.push(structuredClone(data.settings));if(transfer)post(data,transfer);else post(data);};}};});
 await page.goto('/');await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption('standard:autumn-leaves');await page.locator('#mini-count-in').uncheck();await page.locator('#mini-mixer').click();const mute=page.locator('[data-mute-channel=sequence]:visible');if(await mute.getAttribute('aria-pressed')==='true')await mute.click();await page.locator('#floating-mixer-close').click();await page.locator('#mini-play').click();
 await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#play-status')).toContainText('Pickup');await expect(page.locator('#play-status')).toContainText('Playing',{timeout:6000});await page.locator('#mini-play').click();
 await tab(page,'study-path-title');await page.locator('[data-study-tier="4"]').click();await page.locator('#study-form').selectOption('standard:blue-bossa');await page.locator('#study-load').click();await expect(page.locator('body')).toHaveAttribute('data-workspace','exercises');await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
 const sent=await page.evaluate(()=>(window as any).__melodySettings.filter((s:any)=>s.customProgression?.standardMelody==='blue-bossa').at(-1));expect(sent.standardMelodyOriginalBeats).toBe(64);expect(sent.standardMelodyTimeline.at(-1)).toEqual({start:64,duration:4});expect(sent.standardMelodyPickup).toBe(false);await page.locator('#exercise-preview').click();expect(errors).toEqual([]);
});
test('pickup and count-in clocks highlight the actual song beat from the first downbeat',async({page})=>{
 test.setTimeout(60000);
 await page.addInitScript(()=>{
  const Original=window.AudioWorkletNode;(window as any).__songPulses=[];
  window.AudioWorkletNode=class extends Original{
   constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
    super(context,name,options);this.port.addEventListener('message',({data}:MessageEvent)=>{
     if(typeof data.counting!=='boolean')return;
     setTimeout(()=>(window as any).__songPulses.push({counting:data.counting,beat:data.beat,musicalBeat:data.musicalBeat,highlighted:[...document.querySelectorAll<HTMLElement>('#custom-beat-grid [data-grid-beat].playing')].map(el=>Number(el.dataset.gridBeat))}),0);
    });
   }
  };
 });
 await page.goto('/');
 for(const [id,countIn]of [['autumn-leaves',false],['another-you',false],['blue-bossa',false],['all-the-things',false],['autumn-leaves',true]]as const){
  await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption('standard:'+id);
  await page.locator('#mini-count-in').setChecked(countIn);await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');
  await page.locator('#mini-mixer').click();const mute=page.locator('[data-mute-channel=sequence]:visible');if(await mute.getAttribute('aria-pressed')==='true')await mute.click();await page.locator('#floating-mixer-close').click();
  await page.evaluate(()=>(window as any).__songPulses=[]);await page.locator('#mini-play').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__songPulses.filter((p:any)=>!p.counting).length),{timeout:12000}).toBeGreaterThanOrEqual(8);
  const pulses=await page.evaluate(()=>(window as any).__songPulses);await page.locator('#mini-play').click();
  for(const p of pulses.filter((p:any)=>p.counting))expect(p.highlighted).toEqual([]);
  for(const [i,p]of pulses.filter((p:any)=>!p.counting).slice(0,8).entries()){expect(p.beat).toBe(i%4);expect(p.musicalBeat).toBe(i);expect(p.highlighted).toEqual([i]);}
 }
});
