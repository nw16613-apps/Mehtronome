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
  await expect(page.locator('#practice-roadmap-title')).toBeHidden();
  await page.locator('[data-workspace-target="progress-title"]').click();
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

for(const width of [1440,390])test(`six workspaces keep each panel in its assigned tab at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.workspace-tab')).toHaveText(['01Metronome & Mixer','02Harmony','03Guitar','04Exercises','05Progress','06Sound Settings']);
  await expect(page.locator('.transport')).toBeVisible();await expect(page.locator('#mix-panel')).toBeVisible();
  await expect(page.locator('.presets')).toBeHidden();await expect(page.locator('.practice-roadmap')).toBeHidden();await expect(page.locator('.notes')).toBeHidden();
  await page.locator('#mix-collapse').click();await expect(page.locator('#mix-sections')).toBeHidden();
  await page.locator('#mix-collapse').click();await expect(page.locator('#mix-sections')).toBeVisible();
  await page.locator('[data-workspace-target="harmony-title"]').click();
  await expect(page.locator('.harmony')).toBeVisible();await expect(page.locator('.notes')).toBeVisible();
  await expect(page.locator('#mix-panel')).toBeHidden();await expect(page.locator('.transport')).toBeHidden();
  await page.locator('#quality').selectOption('lydian');
  await page.locator('[data-workspace-target="progress-title"]').click();
  await expect(page.locator('.presets')).toBeVisible();await expect(page.locator('.practice-roadmap')).toBeVisible();
  await expect(page.locator('.notes')).toBeHidden();await expect(page.locator('#mix-panel')).toBeHidden();
  await page.locator('#preset-name').fill('Workspace layout');await page.locator('#preset-save').click();
  await page.reload();await expect(page.locator('body')).toHaveAttribute('data-workspace','progress');
  await expect(page.locator('#preset-list option')).toContainText(['Choose a preset','Workspace layout']);
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await expect(page.locator('.transport')).toBeVisible();await expect(page.locator('#quality')).toHaveValue('dorian');
  await expect(page.locator('.presets')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
});

for(const width of [1440,390])test(`focus bar remains visible while scrolling and switching tabs at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const bar=page.locator('#mini-transport');
  await expect(bar).toBeVisible();
  await page.locator('#mix-panel').scrollIntoViewIfNeeded();await expect(bar).toBeVisible();
  await page.locator('.transport').scrollIntoViewIfNeeded();await page.evaluate(()=>window.scrollTo(0,0));await expect(bar).toBeVisible();
  await page.locator('#mini-bpm').fill('111');await page.locator('#mini-bpm').dispatchEvent('change');await expect(page.locator('#bpm')).toHaveValue('111');
  for(const target of ['harmony-title','guitar-title','caged-exercise','progress-title','pulse-title']){
    await page.locator(`[data-workspace-target="${target}"]`).click();await expect(bar).toBeVisible();
  }
  await page.evaluate(()=>window.scrollTo(0,0));await page.locator('#focus-view').click();
  await expect(page.locator('body')).toHaveAttribute('data-workspace','guitar');
  await expect(page.locator('.workspace-guitar')).toBeVisible();await expect(bar).toBeVisible();
  await page.locator('#exit-focus').click();await expect(page.locator('.workspace-nav')).toBeVisible();await expect(bar).toBeVisible();
});
