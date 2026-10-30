import {test,expect} from '@playwright/test';
const pitches=async(page:any,slot=0)=>page.locator(`.exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[1])]+Number(m[2]);}));
test('balanced variations use the reported E and G starts, mirror downward and save distinctly',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-rhythm').selectOption('triplets');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption('II');}
 for(const [phrase,line,fret]of [['balanced2',[52,55,57,60,64,67,69],7],['balanced3',[55,57,60,64,67,69,72],10]] as const){
  await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-phrase').selectOption(phrase);
  expect(await pitches(page)).toEqual([...line,...line.slice(1,-1).toReversed()]);await expect(page.locator('.exercise-note[data-note-index="0"]')).toHaveAttribute('aria-label',new RegExp(`string 5, fret ${fret},`));await expect(page.locator('.exercise-note')).toHaveCount(48);await expect(page.locator('.notation-rest')).toHaveCount(0);
  expect(Number(await page.locator('.exercise-note[data-note-index="6"]').getAttribute('data-start-beat'))).toBeCloseTo(2,10);await page.locator('#exercise-favourite').click();
 }
 await expect(page.locator('#exercise-favourites option').nth(1)).toContainText('variation 2');await expect(page.locator('#exercise-favourites option').nth(2)).toContainText('variation 3');
 await page.locator('#exercise-motion').selectOption('descending');await page.locator('#exercise-phrase').selectOption('balanced2');expect(await pitches(page)).toEqual([69,67,64,60,57,55,52,55,57,60,64,67]);await page.locator('#exercise-phrase').selectOption('balanced3');expect(await pitches(page)).toEqual([67,64,60,57,55,52,48,52,55,57,60,64]);
 await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-phrase')).toHaveValue('balanced2');await page.reload();await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-favourites').selectOption('1');await expect(page.locator('#exercise-phrase')).toHaveValue('balanced3');
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:5000});await page.locator('#exercise-preview').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
