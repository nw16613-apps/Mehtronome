import {expect,test} from '@playwright/test';
import {openReference} from './open-reference';

test('five-position overview selects one full-size CAGED diagram',async({page})=>{
  await openReference(page);
  const overview=page.locator('#position-overview');
  await expect(overview.locator('.position-thumbnail')).toHaveCount(5);
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveCount(1);
  await expect(overview.locator('[aria-selected="true"]')).toHaveAttribute('data-overview-position','I');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','I');

  await overview.locator('[data-overview-position="III"]').click();
  await expect(overview.locator('[aria-selected="true"]')).toHaveAttribute('data-overview-position','III');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','III');
  await expect(page.locator('#position-indicator')).toContainText('Position III of V');

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','IV');
  await page.locator('#position-previous').click();
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','III');
});

test('manual navigation and progression route drive the detailed diagram',async({page})=>{
  await openReference(page);
  await expect(page.locator('#featured-position')).toHaveValue('all');
  await expect(page.locator('#featured-position option')).toHaveText(['Manual selection','Follow nearest positions']);
  await page.locator('[data-overview-position="V"]').click();
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','V');
  await expect(page.locator('#position-overview [aria-selected="true"]')).toHaveAttribute('data-overview-position','V');

  await page.locator('#progression').click();
  await page.locator('#featured-position').selectOption('path');
  const recommended=await page.locator('#position-path>button').first().getAttribute('data-position');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position',recommended!);
  await expect(page.locator('#position-previous')).toBeDisabled();
  await expect(page.locator('#position-next')).toBeDisabled();
});
