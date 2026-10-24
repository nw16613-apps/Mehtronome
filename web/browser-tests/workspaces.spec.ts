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
  await expect(page.locator('.guitar-overview .guitar-controls')).toBeVisible();
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

for(const width of [1280,390])test(`fretboard controls precede full-width diagrams at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  await page.locator('[data-workspace-target="guitar-title"]').click();
  const layout=await page.locator('.workspace-guitar').evaluate(element=>{
    const rect=(selector:string)=>element.querySelector(selector)!.getBoundingClientRect();
    const controls=rect('.guitar-overview');
    const map=rect('#full-fretboard-panel');
    const overview=rect('#position-overview');
    const diagram=rect('#guitar-diagrams');
    return {controlsAbove:controls.bottom<=map.top,mapAbove:map.bottom<=overview.top,overviewAbove:overview.bottom<=diagram.top,fullWidth:Math.abs(map.width-diagram.width)<2,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(layout).toEqual({controlsAbove:true,mapAbove:true,overviewAbove:true,fullWidth:true,overflow:false});
});
