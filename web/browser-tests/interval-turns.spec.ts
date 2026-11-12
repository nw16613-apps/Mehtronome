import {test,expect} from '@playwright/test';
test('interval turns retain the first inward pair in notation and exercise playback',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-bars').selectOption('4');await page.locator('#study-load').click();
 await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('intervals');await page.locator('#exercise-rhythm').selectOption('sixteenths');
 for(const study of ['seconds','thirds','fourths','fifths','sixths','sevenths','octaves'])for(const motion of ['ascending','descending']){
  await page.locator('#exercise-scale-pattern').selectOption(study);await page.locator('#exercise-motion').selectOption(motion);
  const pitches=await page.locator('.exercise-note:not(.resolution-note)').evaluateAll(nodes=>[...new Map(nodes.map(n=>[n.getAttribute('data-note-index'),n])).values()].map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));
  const pairs=Array.from({length:Math.floor(pitches.length/2)},(_,i)=>pitches.slice(i*2,i*2+2));let turns=0;
  for(let i=1;i<pairs.length;i++){
   const direction=Math.sign(pairs[i][1]-pairs[i][0]),previous=Math.sign(pairs[i-1][1]-pairs[i-1][0]);if(direction===previous)continue;turns++;
   const boundary=previous>0?Math.max(...pairs[i-1]):Math.min(...pairs[i-1]);let entry=boundary+direction;while(![9,11,0,2,4,6,7].includes((entry%12+12)%12))entry+=direction;
   expect(pairs[i][0],`${study} ${motion} turn ${i}`).toBe(entry);
  }
  expect(turns,`${study} ${motion}`).toBeGreaterThan(0);
 }
 await page.locator('#exercise-backing').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing').first()).toBeVisible({timeout:10000});await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
