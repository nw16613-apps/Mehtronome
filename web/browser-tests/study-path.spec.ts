import {test,expect} from '@playwright/test';
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
const working=async(page:any)=>page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!));
test('three-tier pathway configures existing charts/exercises without changing tempo, style or mix',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'sound-settings-title');await page.locator('#backing-style').selectOption('blues');await page.locator('#mini-bpm').fill('137');await page.locator('#mini-bpm').dispatchEvent('change');
 const mixer=await page.locator('#comping-volume').inputValue();await tab(page,'progress-title');await expect(page.locator('#study-path')).toBeVisible();await expect(page.locator('.previous-practice-tools')).not.toHaveAttribute('open');
 await page.locator('#study-position').selectOption('IV');await page.locator('#study-material').selectOption('arpgroups4');await page.locator('#study-load').click();
 await expect(page.locator('body')).toHaveAttribute('data-workspace','exercises');await expect(page.locator('#exercise-study')).toHaveValue('arpgroups4');await expect(page.locator('#exercise-loop')).toBeChecked();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','false');
 expect((await working(page)).steps).toHaveLength(1);expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe('3');
 await expect(page.locator('#mini-bpm')).toHaveValue('137');await expect(page.locator('#comping-volume')).toHaveValue(mixer);await expect(page.locator('#backing-style')).toHaveValue('blues');
 await page.locator('.study-session [data-study-nav=progress]').click();await page.locator('[data-study-tier="2"]').click();await page.locator('#study-order').selectOption('majorThird');expect(await page.locator('.study-chart-preview>span').count()).toBe(3);
 await page.locator('#study-load').click();expect((await working(page)).steps).toHaveLength(3);expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe('333');
 await page.locator('.study-session [data-study-nav=progress]').click();await page.locator('#study-route').selectOption('region');await page.locator('#study-region').selectOption('high');await page.locator('#study-load').click();await expect(page.locator('#featured-position')).toHaveValue('path');await expect(page.locator('#position-region')).toHaveValue('high');
 await page.locator('.study-session [data-study-nav=progress]').click();await page.locator('[data-study-tier="3"]').click();await expect(page.locator('.study-chart-preview')).toContainText('Am7');await expect(page.locator('.study-chart-preview')).toContainText('Gmaj7');await page.locator('#study-load').click();
 expect((await working(page)).steps.map((s:any)=>s.mode)).toEqual(['dorian','mixolydian','major']);await expect(page.locator('#key')).toHaveValue('7');await expect(page.locator('#exercise-study')).toHaveValue('arpgroups4');await expect(page.locator('.exercise-note').first()).toBeVisible();
 await page.locator('.study-session [data-study-nav=harmony]').click();await expect(page.locator('#custom-undo')).toBeEnabled();await page.locator('#custom-undo').click();expect((await working(page)).steps.every((s:any)=>s.mode==='dorian')).toBe(true);await expect(page.locator('.study-session')).toContainText('Setup modified');expect(errors).toEqual([]);
});
test('pathway marks and choices persist, browsing is non-destructive and mobile controls fit',async({page})=>{
 await page.goto('/');const before=await working(page);await tab(page,'progress-title');await page.locator('#study-material').selectOption('positional');await page.locator('#study-position').selectOption('II');await page.locator('#study-marked').check();
 await page.reload();await expect(page.locator('#study-material')).toHaveValue('positional');await expect(page.locator('#study-position')).toHaveValue('II');await expect(page.locator('#study-marked')).toBeChecked();expect(await working(page)).toEqual(before);
 await page.locator('#study-position').selectOption('III');await expect(page.locator('#study-marked')).not.toBeChecked();await page.locator('#study-position').selectOption('II');await expect(page.locator('#study-marked')).toBeChecked();
 for(const tier of ['1','2','3']){await page.locator(`[data-study-tier="${tier}"]`).click();await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 await page.locator('#study-path').screenshot({path:'/workspace/study-path-mobile.png'});await page.setViewportSize({width:1440,height:1000});await page.locator('#study-path').screenshot({path:'/workspace/study-path-desktop.png'});
});

test('a loaded turnaround plays through its chord changes and locks study replacement during playback',async({page})=>{
 await page.goto('/');await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');await tab(page,'progress-title');
 await page.locator('[data-study-tier="3"]').click();await page.locator('#study-bars').selectOption('1');await page.locator('#study-load').click();
 await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#mini-chord')).toHaveText('D7',{timeout:5000});
 await page.locator('.study-session [data-study-nav=progress]').click();await expect(page.locator('#study-load')).toBeDisabled();await expect(page.locator('#study-root')).toBeDisabled();
 await page.locator('#mini-play').click();await expect(page.locator('#study-load')).toBeEnabled();
});
