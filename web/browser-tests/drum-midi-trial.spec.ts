import {test,expect} from '@playwright/test';
test('drum trial compares all styles, preserves switching position and plays one clip at a time',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/drum-midi-trial.html');await expect(page.locator('.card')).toHaveCount(3);await expect(page.locator('header')).toContainText('Round 2');await expect(page.locator('button[data-variant=midi]')).toHaveText(['Alternative A','Alternative A','Alternative A']);
 for(const style of ['fusionJazz','funk','popRock']){
  const card=page.locator(`[data-style=${style}]`),audio=card.locator('audio');await card.locator('button[data-variant=midi]').click();
  await expect.poll(()=>audio.evaluate((a:HTMLAudioElement)=>!a.paused&&a.currentTime>0)).toBe(true);
  await audio.evaluate((a:HTMLAudioElement)=>{a.currentTime=6;});await card.locator('button[data-variant=fill]').click();
  await expect(card.locator('button[data-variant=fill]')).toHaveAttribute('aria-pressed','true');expect(await audio.evaluate((a:HTMLAudioElement)=>a.currentTime)).toBeGreaterThanOrEqual(5.8);
  expect(await page.locator('audio').evaluateAll(as=>as.filter((a:any)=>!a.paused).length)).toBe(1);
  await card.locator('button[data-variant=current]').click();await expect(card.locator('button[data-variant=current]')).toHaveAttribute('aria-pressed','true');
 }
 await page.screenshot({path:'/workspace/midi-trial-desktop.png',fullPage:true});await page.locator('audio').evaluateAll(as=>as.forEach((a:any)=>a.pause()));await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await expect(page.locator('details')).toContainText('No quantization');await page.screenshot({path:'/workspace/midi-trial-mobile.png',fullPage:true});expect(errors).toEqual([]);
});
test('normal Sound Settings links to the comparison and original MIDI is downloadable',async({page,request})=>{
 await page.goto('/');await page.locator('[data-workspace-target=sound-settings-title]').click();await page.getByRole('link',{name:'Compare MIDI drum performances'}).click();await expect(page).toHaveURL(/drum-midi-trial.html/);
 const source=await (await request.get('/drum-midi-trial/performances.json')).json();for(const p of source.performances)for(const s of p.sources){const response=await request.get('/drum-midi-trial/'+s.file);expect(response.ok()).toBe(true);expect((await response.body()).subarray(0,4).toString()).toBe('MThd');}
});
