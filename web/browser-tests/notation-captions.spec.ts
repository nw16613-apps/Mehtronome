import {test,expect} from '@playwright/test';
test('arpeggio notation labels the position once without repeated cell counts',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=study-path-title]').click();await page.locator('#study-material').selectOption('harmonized');await page.locator('#study-load').click();
 await page.locator('#exercise-material').selectOption('triad');await page.locator('#exercise-arpeggio-pattern').selectOption('perm3_135');await page.locator('#exercise-rhythm').selectOption('sixteenths');
 const labels=await page.locator('.aligned-notation .exercise-degree').allTextContents();expect(labels.some(s=>/\d+ cell/.test(s))).toBe(false);expect(labels.filter(s=>s.startsWith('Position '))).toHaveLength(1);expect(labels).toContain('Resolution');
 await page.locator('.aligned-notation').first().screenshot({path:'/workspace/notation-captions.png'});
});
