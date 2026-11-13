import {test,expect} from '@playwright/test';
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target="study-path-title"]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-bars').selectOption('4');await page.locator('#study-load').click();await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('groups');await page.locator('#exercise-scale-pattern').selectOption('groups4');}
const pitches=(page:any)=>page.locator('.exercise-note:not(.resolution-note)').evaluateAll(nodes=>[...new Map(nodes.map(n=>[n.getAttribute('data-note-index'),n])).values()].map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));
test('Group order is visible beside the pattern and controls both travel legs independently',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await expect(page.locator('#exercise-sequence-order')).toBeVisible();await expect(page.locator('#exercise-sequence-order').locator('..')).toContainText('Group order');
 for(const order of ['normal','reverse','directional','directionalReverse']){
  await page.locator('#exercise-sequence-order').selectOption(order);const notes=await pitches(page),groups=Array.from({length:Math.floor(notes.length/4)},(_,i)=>notes.slice(i*4,i*4+4));let direction=1,lastAnchor:number|undefined,turns=0;
  for(const group of groups){const anchor=Math.min(...group);if(lastAnchor!==undefined&&anchor<lastAnchor&&direction===1){direction=-1;turns++;}else if(lastAnchor!==undefined&&anchor>lastAnchor&&direction===-1){direction=1;turns++;}const expected=order==='normal'?1:order==='reverse'?-1:order==='directional'?direction:-direction;expect(Math.sign(group[1]-group[0])).toBe(expected);lastAnchor=anchor;}expect(turns).toBeGreaterThan(0);
 }
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-sequence-order').selectOption('normal');await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-sequence-order')).toHaveValue('directionalReverse');expect(errors).toEqual([]);
});
test('direction-aware ordering is available for arpeggio groups, permutations and digital families',async({page})=>{
 await open(page);
 for(const material of ['scale','triad','seventh']){
  await page.locator('#exercise-content-material').selectOption(material);if(material!=='scale')await page.locator('#exercise-content-source').selectOption('selectedChord');
  for(const family of ['groups','permutations3','digital','returns','skips']){await page.locator('#exercise-content-family').selectOption(family);await expect(page.locator('#exercise-sequence-order')).toBeVisible();await page.locator('#exercise-sequence-order').selectOption('directional');await expect(page.locator('#exercise-sequence-order')).toHaveValue('directional');await page.locator('#exercise-motion').selectOption('descending');await expect(page.locator('#exercise-sequence-order')).toHaveValue('directional');}
 }
});
