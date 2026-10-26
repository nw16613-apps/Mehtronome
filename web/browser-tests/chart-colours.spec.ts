import {test,expect} from '@playwright/test';
test('selected loop and live beat have distinct visible colours in every theme',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression').click();await page.locator('#template').selectOption('major251essential');
 await page.locator('#loop-controls summary').click();await page.locator('#loop-enabled').check();await page.locator('#loop-end').selectOption('1');
 for(const theme of ['midnight','plum','evergreen','soft-stone']){
  await page.locator('#palette').selectOption(theme);await expect(page.locator('.loop-selected').first()).toHaveCSS('background-color','rgb(215, 232, 242)');await expect(page.locator('.loop-selected').first()).toHaveCSS('box-shadow',/39, 93, 125/);
 }
 await page.locator('#mini-count-in').uncheck();await page.locator('#mini-play').click();const beat=page.locator('#custom-beat-grid .chart-beat.playing');await expect(beat).toHaveCount(1);await expect(beat).toHaveCSS('background-color','rgb(242, 205, 128)');await expect(beat.locator('.chart-slash')).toHaveCSS('color','rgb(74, 46, 5)');await expect(page.locator('.loop-selected:not(.playing)').first()).toHaveCSS('background-color','rgb(215, 232, 242)');
 await page.locator('#custom-beat-grid').screenshot({path:'/workspace/chart-loop-colours.png'});await page.locator('#mini-play').click();await expect(page.locator('.loop-selected').first()).toHaveCSS('background-color','rgb(215, 232, 242)');await page.locator('#chart-loop-clear').click();await expect(page.locator('.loop-selected')).toHaveCount(0);
});
