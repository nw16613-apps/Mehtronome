import {test,expect} from '@playwright/test';
import {openReference} from './open-reference';

test('learning path saves progress independently for each mode and chord',async({page})=>{
  await openReference(page);
  await expect(page.locator('#practice-roadmap-context')).toContainText('C Ionian');
  await expect(page.locator('[data-practice-task]')).toHaveCount(17);
  await page.locator('[data-practice-task="listen"]').check();
  await expect(page.locator('#practice-roadmap-count')).toHaveText('1 of 17 complete');
  await page.locator('#quality').selectOption('mixolydian');
  await expect(page.locator('#practice-roadmap-context')).toContainText('C Mixolydian');
  await expect(page.locator('[data-practice-task="listen"]')).not.toBeChecked();
  await page.locator('#quality').selectOption('major');
  await expect(page.locator('[data-practice-task="listen"]')).toBeChecked();
  await page.reload();
  await page.locator('#key').selectOption('0');
  await page.locator('#quality').selectOption('major');
  await page.locator('#chord').selectOption('maj9');
  await expect(page.locator('[data-practice-task="listen"]')).toBeChecked();
});

test('learning path remains usable on a phone viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openReference(page);
  await expect(page.locator('#practice-roadmap-title')).toBeVisible();
  await page.locator('#practice-roadmap-duration').selectOption('15');
  await expect(page.locator('#practice-roadmap-today')).toContainText('15-minute session');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
