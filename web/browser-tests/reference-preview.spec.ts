import {expect,test} from '@playwright/test';
async function setup(page:any){
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){super(context,name,options);const analyser=context.createAnalyser();this.connect(analyser,1);(window as any).__referenceAudio=analyser;}
    };
  });
  await page.goto('/');await page.locator('[data-workspace-target="harmony-title"]').click();await page.locator('#key').selectOption('0');await page.locator('#progression').click();await page.locator('#template').selectOption('major251');
}
const peak=(page:any)=>page.evaluate(()=>{const analyser=(window as any).__referenceAudio as AnalyserNode;if(!analyser)return 0;const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);return Math.max(...data.map(Math.abs));});
for(const [target,label] of [['harmony-title','Harmony'],['guitar-title','Guitar'],['caged-exercise','Exercises']])test(`${label} chords sound while held and stop on release`,async({page})=>{
  await setup(page);await expect(page.locator('#audition')).toHaveCount(0);await page.locator(`[data-workspace-target="${target}"]`).click();
  if(target!=='harmony-title')await page.locator(`${target==='guitar-title'?'.workspace-guitar':'#caged-exercise'} .compact-reference details>summary`).click();
  const selector=target==='harmony-title'?'#progression-strip button[data-step="1"]':target==='guitar-title'?'.workspace-guitar button[data-reference-step="1"]':'#caged-exercise button[data-reference-step="1"]';
  await page.locator(selector).hover();await page.mouse.down();await expect.poll(()=>peak(page)).toBeGreaterThan(.005);await expect(page.locator('#chord-name')).toHaveText('G7alt');
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
  await page.mouse.move(4,4);await page.mouse.up();await expect.poll(()=>peak(page)).toBeLessThan(.0001);await expect(page.locator('#chord-name')).toHaveText('G7alt');
  await page.locator(selector).focus();await page.keyboard.down('Space');await expect.poll(()=>peak(page)).toBeGreaterThan(.005);await expect(page.locator(selector)).toBeFocused();
  await page.keyboard.up('Space');await expect.poll(()=>peak(page)).toBeLessThan(.0001);
  await page.keyboard.down('Enter');await expect.poll(()=>peak(page)).toBeGreaterThan(.005);await page.locator('#mini-bpm').focus();await expect.poll(()=>peak(page)).toBeLessThan(.0001);await page.keyboard.up('Enter');
});
test('pedal reference preview, cancellation and old disabled-preview presets',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'old',name:'Muted preview',progression:false,controls:{bpm:'90',audition:false}}]})));
  await setup(page);await page.locator('[data-workspace-target="progress-title"]').click();await page.locator('#preset-list').selectOption('old');await page.locator('#preset-load').click();
  await page.locator('[data-workspace-target="guitar-title"]').click();await page.locator('.workspace-guitar .compact-reference details>summary').click();const button=page.locator('.workspace-guitar button[data-reference-step="0"]');await button.hover();await page.mouse.down();await expect.poll(()=>peak(page)).toBeGreaterThan(.005);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect.poll(()=>peak(page)).toBeLessThan(.0001);await page.mouse.up();
});
test('release during loading never leaves a late reference preview sounding',async({page})=>{
  await page.route('**/assets/worklet-*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,700));await route.continue();});
  await setup(page);await page.locator('[data-workspace-target="guitar-title"]').click();await page.locator('.workspace-guitar .compact-reference details>summary').click();const button=page.locator('.workspace-guitar button[data-reference-step="1"]');await button.click();
  await expect.poll(()=>page.evaluate(()=>!!(window as any).__referenceAudio)).toBe(true);await expect.poll(()=>peak(page)).toBeLessThan(.0001);
  await button.hover();await page.mouse.down();await expect.poll(()=>peak(page)).toBeGreaterThan(.005);await page.mouse.up();await expect.poll(()=>peak(page)).toBeLessThan(.0001);
});

test('touch release and cancellation stop reference previews',async({page})=>{
  await setup(page);await page.locator('[data-workspace-target="guitar-title"]').click();await page.locator('.workspace-guitar .compact-reference details>summary').click();const session=await page.context().newCDPSession(page);
  for(const type of ['touchEnd','touchCancel']){
    const button=page.locator('.workspace-guitar button[data-reference-step="1"]');await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box!.x+box!.width/2,y:box!.y+box!.height/2}]});
    await expect.poll(()=>peak(page)).toBeGreaterThan(.005);
    await session.send('Input.dispatchTouchEvent',{type,touchPoints:[]});await expect.poll(()=>peak(page)).toBeLessThan(.0001);
  }
});
