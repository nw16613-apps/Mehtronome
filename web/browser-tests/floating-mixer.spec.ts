import {expect,test} from '@playwright/test';
for(const width of [1440,900,390])test(`shared mixer docks above focus bar at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.locator('#palette').selectOption('midnight');await page.locator('#mix-collapse').click();await page.locator('#mini-mixer').click();
  await expect(page.locator('#floating-mixer #mix-sections')).toBeVisible();await expect(page.locator('#floating-mixer-close')).toBeFocused();
  await expect(page.locator('#floating-mixer .mix-channel')).toHaveCount(7);
  await page.locator('#harmony').fill('61');await page.locator('#harmony').dispatchEvent('input');await page.locator('#drums').check();await page.locator('[data-solo-channel="drums"]').click();
  await expect(page.locator('[data-mix-channel="harmony"] .mix-channel-state')).toHaveText('Solo muted');
  for(const target of ['harmony-title','guitar-title','caged-exercise','progress-title','sound-settings-title']){await page.locator(`[data-workspace-target="${target}"]`).click();await expect(page.locator('#floating-mixer')).toBeVisible();await expect(page.locator('#harmony')).toHaveValue('61');}
  const geometry=await page.locator('#floating-mixer').evaluate(dock=>{const box=dock.getBoundingClientRect(),bar=document.querySelector('#mini-transport')!.getBoundingClientRect();return {above:box.bottom<=bar.top,onscreen:box.top>=0&&box.left>=0&&box.right<=innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1};});
  expect(geometry).toEqual({above:true,onscreen:true,overflow:false});
  await page.locator('#floating-mixer-close').click();await expect(page.locator('#mini-mixer')).toBeFocused();await page.locator('[data-workspace-target="pulse-title"]').click();await page.locator('#mix-collapse').click();
  await expect(page.locator('#mix-panel #harmony')).toHaveValue('61');await expect(page.locator('#drums')).toBeChecked();await expect(page.locator('[data-solo-channel="drums"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#mini-mixer').click();await page.locator('#harmony').focus();await page.keyboard.press('Escape');await expect(page.locator('#floating-mixer')).toBeHidden();await expect(page.locator('#mini-mixer')).toBeFocused();
  await page.locator('#focus-view').click();await page.locator('#mini-mixer').click();await expect(page.locator('#floating-mixer')).toBeVisible();await page.locator('#open-sound-settings').click();await expect(page.locator('#sound-settings-title')).toBeVisible();await expect(page.locator('#floating-mixer')).toBeHidden();
});
test('mix changes preserve a running exercise and its tempo',async({page})=>{
  await page.goto('/');await page.locator('[data-workspace-target="caged-exercise"]').click();await page.locator('#exercise-loop').check();await page.locator('#exercise-tempo').fill('73');await page.locator('#exercise-tempo').dispatchEvent('change');
  await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
  await page.locator('#mini-mixer').click();await page.locator('#harmony').fill('54');await page.locator('#harmony').dispatchEvent('input');await page.locator('[data-mute-channel="click"]').click();await page.locator('#drums').check();
  await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#exercise-tempo')).toHaveValue('73');await page.locator('#floating-mixer-close').click();await page.locator('#exercise-preview').click();
});
