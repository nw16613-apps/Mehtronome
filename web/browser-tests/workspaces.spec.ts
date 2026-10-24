import {expect,test} from '@playwright/test';

test('workspace navigation preserves state and keeps all fretboard views together',async({page})=>{
  await page.goto('/');
  await page.locator('#bpm').fill('123');
  await page.locator('[data-workspace-target="harmony-title"]').click();
  await page.locator('#quality').selectOption('lydian');

  await page.locator('[data-workspace-target="guitar-title"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-workspace','guitar');
  await expect(page.locator('#full-fretboard')).toBeVisible();
  await expect(page.locator('#position-overview .position-thumbnail')).toHaveCount(5);
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveCount(1);
  await expect(page.locator('.fretboard-control-rail')).toBeVisible();
  await expect(page.locator('#caged-exercise')).toBeHidden();

  await page.locator('[data-workspace-target="caged-exercise"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-workspace','exercises');
  await expect(page.locator('#caged-exercise')).toBeVisible();
  await expect(page.locator('.workspace-guitar')).toBeHidden();

  await page.locator('[data-workspace-target="pulse-title"]').click();
  await expect(page.locator('#bpm')).toHaveValue('123');
  await expect(page.locator('#quality')).toHaveValue('lydian');
  await expect(page.locator('#practice-roadmap-title')).toBeVisible();
});

test('fretboard workspace stacks its control rail below the focused view on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('[data-workspace-target="guitar-title"]').click();
  const order=await page.locator('.fretboard-focus-row').evaluate(element=>{
    const rail=element.querySelector('.fretboard-control-rail')!;
    const stage=element.querySelector('.focused-position-stage')!;
    return {rail:getComputedStyle(rail).order,stage:getComputedStyle(stage).order,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(order).toEqual({rail:'2',stage:'1',overflow:false});
});
