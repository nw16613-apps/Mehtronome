import {test,expect} from '@playwright/test';
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target="guitar-title"]').click();await page.locator('#fretboard-fingering').selectOption('three');await page.locator('#guitar-neck-traversal').selectOption('horizontal');await page.locator('#guitar-neck-strings').selectOption('4,5');await page.locator('#guitar-neck-start').fill('5');await page.locator('#guitar-neck-start').press('Tab');await page.locator('#guitar-neck-end').fill('17');await page.locator('#guitar-neck-end').press('Tab');await page.locator('[data-workspace-target="caged-exercise"]').click();await page.locator('#exercise-content-material').selectOption('triad');}
test('arpeggio interval options retain unique step numbers and update the score',async({page})=>{
 await open(page);await page.locator('#exercise-content-source').selectOption('selectedChord');await page.locator('#exercise-content-family').selectOption('intervals');
 const labels=await page.locator('#exercise-scale-pattern option').allTextContents();expect(new Set(labels).size).toBe(labels.length);expect(labels[0]).toContain('1–2');expect(labels[1]).toContain('1–3');
 await page.locator('#exercise-scale-pattern').selectOption('arpseq_thirds');await expect(page.locator('.notation-scroll')).toContainText('1–3');
});
test('a root motif that cannot fit the string cell shows a reason without an empty playable score',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await page.locator('#exercise-content-source').selectOption('diatonic');await page.locator('#exercise-arpeggio-sequence').selectOption('groups3');
 await expect(page.locator('.exercise-notice')).toContainText('no complete pattern');await expect(page.locator('.notation-scroll svg')).toHaveCount(0);await expect(page.locator('#exercise-preview')).toBeDisabled();await expect(page.locator('#exercise-export')).toBeDisabled();
 await page.locator('#exercise-arpeggio-sequence').selectOption('seconds');await expect(page.locator('.notation-scroll svg').first()).toBeVisible();await expect(page.locator('.exercise-note').first()).toBeVisible();await expect(page.locator('#exercise-preview')).toBeEnabled();await expect(page.locator('#exercise-export')).toBeEnabled();expect(errors).toEqual([]);
});
