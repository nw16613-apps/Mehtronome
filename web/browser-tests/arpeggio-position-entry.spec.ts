import {test,expect} from '@playwright/test';
test('Aadd9 bar three enters the bottom of Position III and honours explicit starts',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'triad-entry',name:'Triad entry',key:9,beats:4,progression:{version:2,name:'Triad entry',steps:Array.from({length:4},()=>({root:0,chord:'add9',mode:'major',bars:1,bass:null}))}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:triad-entry');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,numeral]of ['I','II','III','IV'].entries()){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(numeral);}
 for(const motion of ['ascending','descending']){
  await page.locator('#exercise-motion').selectOption(motion);
  for(const rhythm of ['triplets','eighths','sixteenths']){
   await page.locator('#exercise-rhythm').selectOption(rhythm);
   const frets=motion==='ascending'?[5,9,9,12]:[5,9,12,12],string=motion==='ascending'?6:1;
   for(let slot=0;slot<4;slot++)await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`).first()).toHaveAttribute('aria-label',new RegExp(`string ${string}, fret ${frets[slot]},`));
  }
 }
 await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-start-note').selectOption('1:0');await expect(page.locator('.exercise-note[data-group-index="2"]').first()).toHaveAttribute('aria-label',/^A,/);
 await page.locator('.exercise-position-route [data-inspect-slot="2"]').click();await page.locator('#exercise-card-start').selectOption('default');await expect(page.locator('.exercise-note[data-group-index="2"]').first()).toHaveAttribute('aria-label',/^C♯, string 6, fret 9,/);
 expect(errors).toEqual([]);
});
