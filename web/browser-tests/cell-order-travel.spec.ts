import {test,expect} from '@playwright/test';
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-bars').selectOption('4');await page.locator('#study-load').click();await page.locator('#exercise-rhythm').selectOption('sixteenths');}
const pitches=async(page:any)=>page.locator('.exercise-note:not(.resolution-note)').evaluateAll(nodes=>[...new Map(nodes.map(n=>[n.getAttribute('data-note-index'),n])).values()].map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));
test('generated scale and chord-tone patterns retain written/reversed offsets while travelling in either direction',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 const cases:[string,string,number[]][]=[['groups','groups3',[0,1,2]],['groups','groups5',[0,1,2,3,4]],['permutations3','scaleperm_312',[2,0,1]],['digital','digital1324',[0,2,1,3]],['digital','cells',[0,1,2,4]],['returns','return4closed',[0,1,2,3,2,1,0]],['expanding','expand4',[0,1,0,2,0,3]],['skips','skip2',[0,2,1,3,2,4]]];
 // 1–3–2–4 belongs to the four-note permutation menu.
 cases[3][0]='permutations4';
 for(const material of ['scale','seventh']){
  await page.locator('#exercise-content-material').selectOption(material);if(material==='seventh')await page.locator('#exercise-content-source').selectOption('selectedChord');
  const pcs=material==='scale'?[9,11,0,2,4,6,7]:[9,0,4,7],line=Array.from({length:128},(_,i)=>i).filter(n=>pcs.includes(n%12));
  for(const [family,id,offsets]of cases)for(const motion of ['ascending','descending'])for(const order of ['normal','reverse']){
   await page.locator('#exercise-content-family').selectOption(family);await page.locator('#exercise-scale-pattern').selectOption((material==='scale'?'':'arpseq_')+id);await page.locator('#exercise-motion').selectOption(motion);await page.locator('.exercise-pattern-variations').evaluate((n:any)=>n.open=true);await page.locator('#exercise-sequence-order').selectOption(order);
   const notes=await pitches(page),written=order==='reverse'?[...offsets].reverse():offsets;
   for(let i=0;i+written.length<=notes.length;i+=written.length){const ordinal=line.indexOf(notes[i])-written[0];expect(notes.slice(i,i+written.length),`${material} ${id} ${motion} ${order}`).toEqual(written.map(n=>line[ordinal+n]));}
  }
 }
 expect(errors).toEqual([]);
});
test('pentatonic and whole-arpeggio root order controls restore independently from favourites',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-source').selectOption('pentatonic');await page.locator('#exercise-pattern').selectOption('groups3');await page.locator('#exercise-motion').selectOption('descending');
 await page.locator('.exercise-pattern-variations').evaluate((n:any)=>n.open=true);await page.locator('#exercise-sequence-order').selectOption('reverse');let notes=await pitches(page);expect(notes[1]).toBeLessThan(notes[0]);await page.locator('#exercise-favourite').click();
 await page.locator('#exercise-sequence-order').selectOption('normal');notes=await pitches(page);expect(notes[1]).toBeGreaterThan(notes[0]);await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-sequence-order')).toHaveValue('reverse');
 await page.locator('#exercise-pattern').selectOption('lesson64');await expect(page.locator('#exercise-sequence-order')).toHaveCount(0);
 await page.locator('#exercise-content-material').selectOption('triad');await page.locator('#exercise-content-source').selectOption('diatonic');await page.locator('#exercise-content-family').selectOption('arp_permutations');await page.locator('#exercise-arpeggio-pattern').selectOption('perm3_153');await page.locator('#exercise-arpeggio-sequence').selectOption('groups3');
 await page.locator('.exercise-pattern-variations').evaluate((n:any)=>n.open=true);await expect(page.locator('#exercise-sequence-order').locator('..')).toContainText('Arpeggio-root order');await page.locator('#exercise-sequence-order').selectOption('reverse');await expect(page.locator('#exercise-arpeggio-pattern')).toHaveValue('perm3_153');await page.locator('#exercise-favourite').click();await page.locator('#exercise-sequence-order').selectOption('normal');await page.locator('#exercise-favourites').selectOption('1');await expect(page.locator('#exercise-sequence-order')).toHaveValue('reverse');await expect(page.locator('#exercise-arpeggio-pattern')).toHaveValue('perm3_153');
 await page.locator('#exercise-backing').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing').first()).toBeVisible({timeout:10000});await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
test('chromatic order changes approach side without moving the resolution target',async({page})=>{
 await open(page);await page.locator('#exercise-content-material').selectOption('seventh');await page.locator('#exercise-content-source').selectOption('selectedChord');
 for(const family of ['doubleapproach','chromaticneighbors'])for(const motion of ['ascending','descending'])for(const order of ['normal','reverse']){
  await page.locator('#exercise-content-family').selectOption(family);await page.locator('#exercise-motion').selectOption(motion);await page.locator('.exercise-pattern-variations').evaluate((n:any)=>n.open=true);await page.locator('#exercise-sequence-order').selectOption(order);
  const ns=await pitches(page),size=family==='doubleapproach'?3:5,offsets=family==='doubleapproach'?(order==='reverse'?[2,1,0]:[-2,-1,0]):order==='reverse'?[0,-1,0,1,0]:[0,1,0,-1,0];
  for(let i=0;i+size<=ns.length;i+=size)expect(ns.slice(i,i+size).map(n=>n-ns[i+size-1])).toEqual(offsets);
 }
});
