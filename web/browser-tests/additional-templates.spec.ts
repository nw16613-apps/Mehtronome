import {test,expect} from '@playwright/test';
test('new templates load editable charts in both menus and feed the practice position route',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();
 const expected:any={major1625:4,minor1625:4,backdoor:3,tritone251:3,major1564:4,major6415:4,minor1637:4,andalusian:4};
 for(const [id,count]of Object.entries(expected)){
  await page.locator('#progression-choice').selectOption(id);await expect(page.locator('#custom-timeline [data-custom-step]')).toHaveCount(Number(count));await expect(page.locator('#mini-progression')).toHaveValue(id);
 }
 await expect(page.locator('#progression-choice optgroup[label="Common progressions"] option')).toHaveCount(4);
 await page.locator('#progression-choice').selectOption('tritone251');await page.locator('[data-workspace-target=caged-exercise]').click();await expect(page.locator('.exercise-position-route [data-inspect-slot]')).toHaveCount(3);await page.locator('#exercise-position-navigation').selectOption('all');await page.locator('.exercise-position-route [data-inspect-slot="1"]').click();await page.locator('#exercise-position').selectOption('IV');
 await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('[data-grid-beat="4"]').click();const route=(await page.locator('#manual-position-route').inputValue()).split(':').at(-1);await page.locator('#custom-chord').selectOption('dom9sharp11');expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe(route);await expect(page.locator('#mini-chord')).toContainText('9');
});
