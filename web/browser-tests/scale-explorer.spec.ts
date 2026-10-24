import {test,expect} from '@playwright/test';

test('chord-first explorer separates strict modes from contextual altered harmony',async({page})=>{
  await page.goto('/');
  await page.locator('.chord-scale-explorer').evaluate((details:HTMLDetailsElement)=>details.open=true);
  await page.locator('#scale-explorer-chord').selectOption('dom7');
  await expect(page.getByRole('heading',{name:'A Mixolydian',exact:true})).toBeVisible();
  const altered=page.locator('.scale-choice.contextual',{hasText:'A Altered'});
  await expect(altered).toContainText('omits the natural 5');
  await altered.locator('button').click();
  await expect(page.locator('#quality')).toHaveValue('altered');
  await expect(page.locator('#chord')).toHaveValue('dom7alt');
  await page.locator('#scale-explorer-chord').selectOption('dom7');
  await page.locator('[data-scale-choice="mixolydian"]').click();
  await expect(page.locator('#quality')).toHaveValue('mixolydian');
  await expect(page.locator('#chord')).toHaveValue('dom7');
});
