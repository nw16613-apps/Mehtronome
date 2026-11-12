import {test,expect} from '@playwright/test';
test('sequence brackets survive bar/system boundaries and all notation displays',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-bars').selectOption('4');await page.locator('#study-load').click();
 for(const study of ['scaleSequences','arpeggioSequences']){
  await page.locator('#exercise-content-material').selectOption(study==='arpeggioSequences'?'seventh':'scale');if(study==='arpeggioSequences')await page.locator('#exercise-content-source').selectOption('selectedChord');await page.locator('#exercise-content-family').selectOption('groups');await page.locator('#exercise-scale-pattern').selectOption((study==='arpeggioSequences'?'arpseq_':'')+'groups5');await page.locator('#exercise-rhythm').selectOption('sixteenths');
  const brackets=page.locator('.aligned-notation .pattern-bracket');expect(await brackets.count()).toBeGreaterThan(3);expect(await page.locator('.notation-cell[data-continued-right=true]').count()).toBeGreaterThan(0);expect(await page.locator('.notation-cell[data-continued-left=true]').count()).toBeGreaterThan(0);
  for(const display of ['tab','notation','both']){await page.locator('#exercise-display').selectOption(display);await expect(page.locator('.pattern-bracket').first()).toBeVisible();}
  const separated=await page.locator('.aligned-notation').first().locator('.pattern-bracket').evaluateAll(nodes=>nodes.every((n,i)=>!i||(nodes[i-1] as SVGGraphicsElement).getBBox().x+(nodes[i-1] as SVGGraphicsElement).getBBox().width<(n as SVGGraphicsElement).getBBox().x));expect(separated).toBe(true);
  const labels=await page.locator('.exercise-degree').allTextContents();expect(labels.some(s=>/\d+ cell/.test(s))).toBe(false);
 }
 await page.locator('.aligned-notation').first().screenshot({path:'/workspace/restored-cell-brackets.png'});await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
