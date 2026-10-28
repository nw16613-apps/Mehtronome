import {test,expect} from '@playwright/test';
test('progression edits undo and redo with duration, order, storage and mobile controls',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('major251essential');
 await page.locator('#custom-duration-unit').selectOption('beats');await page.locator('#custom-beats').selectOption('2');
 await page.locator('#custom-undo').click();await expect(page.locator('#custom-beats')).toHaveValue('4');
 await page.locator('#custom-redo').click();await expect(page.locator('#custom-beats')).toHaveValue('2');
 const before=await page.locator('#custom-text').inputValue();await page.locator('#custom-duplicate').click();await expect(page.locator('[data-custom-step]')).toHaveCount(4);
 await page.locator('#custom-right').click();await page.locator('#custom-delete').click();await expect(page.locator('[data-custom-step]')).toHaveCount(3);
 await page.locator('#custom-undo').click();await expect(page.locator('[data-custom-step]')).toHaveCount(4);await page.locator('#custom-undo').click();await page.locator('#custom-undo').click();await expect(page.locator('#custom-text')).toHaveValue(before);
 await page.locator('#custom-add').click();await expect(page.locator('#custom-redo')).toBeDisabled();await page.locator('#custom-undo').click();await expect(page.locator('#custom-text')).toHaveValue(before);
 await page.locator('#mini-count-in').uncheck();await page.locator('#mini-play').click();await expect(page.locator('#mini-play')).toContainText('Stop');await page.locator('#custom-undo').click();await expect(page.locator('#mini-play')).toContainText('Play');await page.locator('#custom-redo').click();await expect(page.locator('#custom-text')).toHaveValue(before);
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#custom-undo')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#custom-progression-builder').screenshot({path:'/workspace/checkpoint8-mobile.png'});
 await page.reload();await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('custom');await expect(page.locator('#custom-text')).toHaveValue(before);await expect(page.locator('#custom-undo')).toBeEnabled();await expect(page.locator('#custom-redo')).toBeDisabled();
});
