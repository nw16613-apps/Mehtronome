import {test,expect} from '@playwright/test';
const tab=async(page:any,target:string)=>page.locator(`[data-workspace-target="${target}"]`).click();
test('metronome groups rhythm with pulse and keeps session/training separate from mixer',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('.transport .metronome-rhythm #subdivision')).toBeVisible();await expect(page.locator('.transport .metronome-rhythm #pulse-poly')).toHaveCount(1);await expect(page.locator('.studio-tools #pulse-minutes')).toBeVisible();await expect(page.locator('.studio-tools #trainer-enabled')).toBeVisible();await expect(page.locator('.transport #tempo-save')).toBeVisible();
 await page.locator('#bpm').fill('101');await page.locator('#bpm').dispatchEvent('change');await page.locator('#tempo-save').click();await expect(page.locator('[data-tempo="101"]')).toBeVisible();await page.locator('#trainer-enabled').check();await expect(page.locator('#trainer-controls')).toBeVisible();await page.locator('#trainer-enabled').uncheck();
 await page.locator('[data-mute-channel="drums"]').click();await expect(page.locator('#drums')).toBeChecked();await page.locator('#mini-mixer').click();await expect(page.locator('#floating-mixer #mix-sections')).toBeVisible();await page.locator('#floating-mixer-close').click();expect(errors).toEqual([]);
});
test('Harmony separates source, chart editing, reference and chart library',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'harmony-title');await expect(page.locator('.harmony-progression #single-chord-chart')).toBeVisible();await expect(page.locator('.harmony-tonality #key')).toBeVisible();await page.locator('#progression-choice').selectOption('major251essential');await expect(page.locator('.chart-sheet-panel #custom-beat-grid')).toBeVisible();await expect(page.locator('.chart-title-group #custom-name')).toBeVisible();await expect(page.locator('.chart-chord-group #custom-chord')).toBeVisible();await expect(page.locator('.chart-time-group #custom-bars')).toBeVisible();await page.locator('#custom-name').fill('Clean chart');await page.locator('#custom-name').dispatchEvent('change');await expect(page.locator('#custom-progression-title')).toHaveText('Clean chart');
 await page.locator('#custom-name').fill('Saved chart');await page.locator('#repertoire-save').click();await expect(page.locator('#progression-choice optgroup[label="My saved charts"] option')).toHaveCount(1);await expect(page.locator('.repertoire-library')).toHaveCount(0);expect(errors).toEqual([]);
});
test('Guitar exposes material and view before diagrams; Progress separates load/save/backup',async({page})=>{
 await page.goto('/');await tab(page,'guitar-title');await expect(page.locator('.guitar-viewbar #fret-labels')).toBeVisible();await expect(page.locator('.guitar-viewbar #fret-view')).toBeVisible();await expect(page.locator('.caged-diagram-controls #show-grip')).toBeVisible();await expect(page.locator('.caged-diagram-controls #theory-view')).toBeVisible();await page.locator('#fret-labels').selectOption('notes');await page.locator('#show-grip').check();await expect(page.locator('#guitar-diagrams .fretboard')).not.toHaveCount(0);await tab(page,'progress-title');await expect(page.locator('.preset-load-group #preset-list')).toBeVisible();await expect(page.locator('.preset-save-group #preset-save')).toBeVisible();await expect(page.locator('.preset-backup #preset-export')).toBeVisible();await expect(page.locator('.roadmap-plan #practice-roadmap-duration')).toBeVisible();await page.locator('#preset-name').fill('Layout check');await page.locator('#preset-save').click();await expect(page.locator('#preset-list option')).toHaveCount(2);
});
test('Sound Settings groups each instrument with its switch and editable sound controls',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'sound-settings-title');
 for(const [group,id,setting] of [['drums','drums','drum-groove'],['bass','bass','bass-pattern'],['comping','comping','comping-tone'],['sequence','sequence','sequence-role']]){await expect(page.locator(`.instrument-${group} #${id}`)).toBeHidden();await expect(page.locator(`.instrument-${group} #${setting}`)).toBeVisible();}
 await page.locator('#mini-mixer').click();await page.locator('[data-mute-channel=drums]').click();await page.locator('#floating-mixer-close').click();await page.locator('#drum-groove').selectOption('swing');await expect(page.locator('#drum-groove')).toHaveValue('swing');await tab(page,'pulse-title');await expect(page.getByRole('button',{name:'Mute Drums',exact:true})).toBeVisible();await expect(page.locator('.mixer-quick-switches #drums')).toHaveCount(0);expect(errors).toEqual([]);
});
for(const width of [1440,900,390])test(`all revised workspaces fit at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');for(const target of ['pulse-title','harmony-title','guitar-title','progress-title','sound-settings-title']){await tab(page,target);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);if(width===1440)await page.screenshot({path:`/workspace/cleanup-${target}.png`,fullPage:true});}expect(errors).toEqual([]);
});

test('reorganized groups remain readable and fit in all four palettes',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 for(const palette of ['midnight','plum','evergreen','soft-stone']){
  await page.locator('#palette').selectOption(palette);await expect(page.locator('html')).toHaveAttribute('data-palette',palette);
  for(const target of ['pulse-title','harmony-title','guitar-title','progress-title','sound-settings-title']){await tab(page,target);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
  await tab(page,'guitar-title');await expect(page.locator('.guitar-viewbar>h3')).toHaveCSS('font-size','12px');await expect(page.locator('.guitar-progression-panel>h3')).toHaveCSS('font-size','12px');
 }
 const duplicates=await page.evaluate(()=>{const ids=Array.from(document.querySelectorAll('[id]')).map(node=>node.id);return ids.filter((id,index)=>ids.indexOf(id)!==index);});expect(duplicates).toEqual([]);
});
