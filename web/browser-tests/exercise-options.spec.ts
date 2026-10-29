import {test,expect} from '@playwright/test';
test('exercise menu groups and contextual choices match their current behavior',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 const studies=page.locator('#exercise-study');
 expect(await studies.locator('option').evaluateAll(ns=>ns.map(n=>(n as HTMLOptionElement).value))).not.toEqual(expect.arrayContaining(['grip','guidetones','connections']));
 await expect(studies.locator('optgroup[label="Voice leading"]')).toHaveCount(0);
 await expect(studies.locator('optgroup[label="Arpeggios"] option[value="positional"]')).toHaveCount(1);
 for(const study of ['harmonized','alternating','positional','enclosures','pentatonic']){
  await studies.selectOption(study);await expect(page.locator('#exercise-motion option')).toHaveCount(2);
  await expect(page.locator('#exercise-motion').locator('..')).toContainText('Starting direction');
  const material=page.locator('#exercise-material').locator('..');
  if(study==='harmonized'||study==='alternating')await expect(material).toBeVisible();else await expect(material).toBeHidden();
  await expect(page.locator('.exercise-note').first()).toBeVisible();
 }
 await studies.selectOption('triadpairs');await expect(page.locator('#exercise-motion option')).toHaveCount(4);
 await page.locator('#exercise-motion').selectOption('down-up');await studies.selectOption('harmonized');await expect(page.locator('#exercise-motion')).toHaveValue('descending');
 await expect(page.locator('#exercise-stage option[value=full]')).toHaveText('Continuous pattern');
 await expect(page.locator('#exercise-stage option[value=cell]')).toHaveText('One cell per chord');
 await studies.selectOption('positional');await expect(page.locator('#exercise-stage option[value=cell]')).toHaveText('One run per chord');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
