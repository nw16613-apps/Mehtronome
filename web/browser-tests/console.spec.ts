import {expect,test} from '@playwright/test';
test('console faders use a gain taper, preserve percent controls, and reset on double click',async({page})=>{
 await page.goto('/');const fader=page.locator('#click');await expect(page.locator('.console-meter-lane')).toHaveCount(14);
 const bounds=await fader.boundingBox();await fader.click({position:{x:22,y:bounds!.height/2}});await expect(fader).toHaveValue('6');await expect(page.locator('#click-value')).toHaveText('6%');await expect(page.locator('#gain-click')).toHaveText('-24.4');
 await fader.press('ArrowUp');await expect(fader).toHaveValue('7');await fader.dblclick();await expect(fader).toHaveValue('50');await expect(page.locator('#gain-click')).toHaveText('-6.0');
 await page.getByRole('button',{name:'Unmute Drums',exact:true}).click();await expect(page.locator('#drums')).toBeChecked();await expect(page.getByRole('button',{name:'Mute Drums',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.locator('#mini-mixer').click();await expect(page.locator('#floating-mixer #click')).toHaveValue('50');await expect(page.locator('#floating-mixer .console-meter-lane')).toHaveCount(14);
});
test('real channel meters are idle before audio, respond to sound, and decay after mute',async({page})=>{
 await page.goto('/');const meter=page.locator('[data-mix-channel=click] .console-meter-lane').first();
 const level=()=>meter.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--level'))||0);
 expect(await level()).toBe(0);await expect(meter.locator('.console-meter-fill')).toHaveCSS('height','0px');await page.locator('#harmony').fill('0');await page.locator('#harmony').dispatchEvent('input');await page.locator('#bpm').fill('240');await page.locator('#bpm').dispatchEvent('change');await page.locator('#play').click();
 await expect.poll(level).toBeGreaterThan(1);await page.locator('[data-mute-channel=click]').click();await expect.poll(level,{timeout:5000}).toBe(0);await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');await page.locator('[data-mute-channel=click]').click();await expect.poll(level).toBeGreaterThan(1);await page.locator('#play').click();await expect.poll(level,{timeout:5000}).toBe(0);
});
for(const width of [900,1440])test(`fader indicator aligns with scale endpoints in both mixers at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/');
 for(const floating of [false,true]){
  if(floating)await page.locator('#mini-mixer').click();
  const input=page.locator('#click'),card=page.locator('[data-mix-channel=click]');
  for(const [value,tick] of [['100','.unity'],['0','.console-tick:last-child']]){
   await input.fill(value);await input.dispatchEvent('input');
   const delta=await card.evaluate((node,tick)=>{const cap=node.querySelector('.console-fader-cap')!.getBoundingClientRect(),mark=node.querySelector(tick)!.getBoundingClientRect();return Math.abs(cap.y+cap.height/2-mark.y-mark.height/2);},tick);
   expect(delta).toBeLessThan(1);
  }
  await input.scrollIntoViewIfNeeded();const mark=await card.locator('.unity').boundingBox(),box=await input.boundingBox();await page.mouse.click(box!.x+box!.width/2,mark!.y+mark!.height/2);await expect(input).toHaveValue('100');await expect(page.locator('#gain-click')).toHaveText('0.0');
 }
});
