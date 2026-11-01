import {test,expect} from '@playwright/test';
test('Shape default keeps the lowest nine-note span at changes without skipping a root or flat seventh',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'boundaries',name:'Boundary starts',key:7,beats:4,progression:{version:2,name:'Boundary starts',steps:[{root:0,letter:0},{root:3,letter:2},{root:6,letter:4},{root:9,letter:5}].map(s=>({...s,chord:'min7',mode:'dorian',bars:2,bass:null}))}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:boundaries');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-position-region').selectOption('lowerMiddle');await page.locator('#exercise-study').selectOption('positional');await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-rhythm').selectOption('sixteenths');
 for(const [slot,fret]of [6,6,7,7].entries()){
  const notes=page.locator(`.exercise-note[data-group-index="${slot}"]`);await expect(notes).toHaveCount(32);await expect(notes.first()).toHaveAttribute('aria-label',new RegExp(`string 6, fret ${fret},`));await expect(notes.nth(16)).toHaveAttribute('aria-label',new RegExp(`string 6, fret ${fret},`));
 }
 await page.locator('#exercise-rhythm').selectOption('eighths');for(const [slot,fret]of [6,6,7,7].entries())await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`).first()).toHaveAttribute('aria-label',new RegExp(`string 6, fret ${fret},`));expect(errors).toEqual([]);
});
