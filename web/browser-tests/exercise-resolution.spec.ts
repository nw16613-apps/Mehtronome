import {test,expect} from '@playwright/test';
const pitch=(label:string)=>{const m=label.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);};
test('every rhythm appends one nearest-different-chord-tone whole-note bar and keeps the pattern prefix',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 for(const study of ['positional','positionalscale','groups3','harmonized']){
  await page.locator('#exercise-study').selectOption(study);
  for(const [rhythm,count]of [['eighths',32],['triplets',48],['sixteenths',64]] as const){
   await page.locator('#exercise-rhythm').selectOption(rhythm);
   const tail=page.locator('.exercise-note.resolution-note');await expect(tail).toHaveCount(1);await expect(page.locator('.exercise-note')).toHaveCount(count+1);
   await expect(tail).toHaveAttribute('data-start-beat','16');await expect(tail).toHaveAttribute('data-duration-beats','4');await expect(tail.locator('.note-hole')).toHaveCount(1);
   const endingPitch=pitch((await tail.getAttribute('aria-label'))!);expect([9,0,4,7]).toContain(endingPitch%12);expect(endingPitch).not.toBe(pitch((await page.locator('.exercise-note:not(.resolution-note)').last().getAttribute('aria-label'))!));
   const bar=page.locator('.bar-line[data-bar]');await expect(bar).toHaveCount(5);
  }
 }
 await page.locator('#exercise-chord-diagrams').check();await expect(page.locator('.resolution-note')).toHaveCount(1);
 const downloadPromise=page.waitForEvent('download');await page.locator('#exercise-export').click();const stream=await (await downloadPromise).createReadStream();let svg='';if(stream)for await(const chunk of stream)svg+=chunk.toString();expect(svg).toContain('resolution-note');expect(svg).toContain('Resolution');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('mixed-chord playback returns to the opening harmony throughout the resolution and stops after the full bar',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'resolve',name:'Resolve test',key:9,beats:4,progression:{version:2,name:'Resolve test',steps:[{root:0,chord:'min7',mode:'dorian',bars:1,bass:null},{root:3,chord:'maj7',mode:'major',bars:1,bass:null}]}}]})));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:resolve');
 await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-rhythm').selectOption('triplets');
 await expect(page.locator('.exercise-note')).toHaveCount(25);await expect(page.locator('.resolution-note')).toHaveAttribute('data-start-beat','8');
 expect([9,0,4,7]).toContain(pitch((await page.locator('.resolution-note').getAttribute('aria-label'))!)%12);
 await page.locator('#exercise-chord-diagrams').check();await expect(page.locator('.notation-chord-symbol').last()).toHaveAttribute('data-chord','Am7');await expect(page.locator('.notation-chord-diagram').last()).toHaveAttribute('aria-label',/^Am7/);
 await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-loop').uncheck();
 await page.locator('#exercise-preview').click();await expect(page.locator('.resolution-note.playing')).toBeVisible({timeout:7000});await expect(page.locator('#mini-chord')).toHaveText(/^A/);
 await page.waitForTimeout(250);await expect(page.locator('.resolution-note.playing')).toBeVisible();await expect(page.locator('#mini-chord')).toHaveText(/^A/);
 await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','false',{timeout:4000});
 await expect(page.locator('.exercise-position-route [data-inspect-slot]')).toHaveCount(2);expect(errors).toEqual([]);
});
