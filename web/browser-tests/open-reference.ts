import type {Page} from '@playwright/test';
// Stable C-major reference for geometry, progression and audio regression cases.
export async function openReference(page:Page) {
  await page.goto('/');
  await page.locator('#key').selectOption('0');
  await page.locator('#quality').selectOption('major');
  await page.locator('#chord').selectOption('maj9');
  await page.locator('#count-in').check();
  await page.locator('#fret-labels').selectOption('notes');
}
