import {test,expect} from '@playwright/test';
test('interval pair order stays independent of cell direction in notation, favourites and playback',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-bars').selectOption('4');await page.locator('#study-load').click();
 await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('intervals');await page.locator('#exercise-rhythm').selectOption('sixteenths');
 for(const study of ['seconds','thirds','fourths','fifths','sixths','sevenths','octaves'])for(const motion of ['ascending','descending'])for(const order of ['normal','reverse','directional','directionalReverse']){
  await page.locator('#exercise-scale-pattern').selectOption(study);await page.locator('#exercise-motion').selectOption(motion);await page.locator('#exercise-sequence-order').selectOption(order);
  await expect(page.locator('#exercise-sequence-order')).toBeVisible();
  const pitches=await page.locator('.exercise-note:not(.resolution-note)').evaluateAll(nodes=>[...new Map(nodes.map(n=>[n.getAttribute('data-note-index'),n])).values()].map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));
  const pairs=Array.from({length:Math.floor(pitches.length/2)},(_,i)=>pitches.slice(i*2,i*2+2)),anchors=pairs.map(p=>Math.min(...p)),library=[...new Set(anchors)].sort((a,b)=>a-b);let direction=motion==='ascending'?1:-1,turns=0;
  for(let i=0;i<pairs.length;i++){
   if(i){const previous=library.indexOf(anchors[i-1]);if(previous+direction<0||previous+direction>=library.length){direction=-direction;turns++;}
   expect(anchors[i],`${study} ${motion} ${order} cell ${i}`).toBe(library[previous+direction]);}
   expect(Math.sign(pairs[i][1]-pairs[i][0])).toBe(order==='normal'?1:order==='reverse'?-1:order==='directional'?direction:-direction);
  }
  expect(turns,`${study} ${motion} ${order}`).toBeGreaterThan(0);
 }
 await page.locator('#exercise-scale-pattern').selectOption('thirds');await expect(page.locator('#exercise-scale-pattern option:checked')).toHaveText('Thirds');await expect(page.locator('#exercise-sequence-order option[value=normal]')).toHaveText('1–3');await expect(page.locator('#exercise-sequence-order option[value=reverse]')).toHaveText('3–1');await expect(page.locator('#caged-exercise-title')).toContainText('3–1');
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-sequence-order').selectOption('normal');await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-sequence-order')).toHaveValue('directionalReverse');
 await page.locator('#exercise-backing').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing').first()).toBeVisible({timeout:10000});await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
