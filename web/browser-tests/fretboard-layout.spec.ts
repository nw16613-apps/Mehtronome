import {test,expect} from '@playwright/test';
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
const positions=async(page:any)=>page.locator('#position-path [data-route-step]').evaluateAll(nodes=>nodes.map(n=>(n as HTMLElement).dataset.position));
const open=async(page:any)=>{await page.goto('/');await tab(page,'guitar-title');};
test('position arrows and tabs consistently switch to independent manual chart positions',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 await expect(page.locator('[data-workspace-target=guitar-title]')).toContainText('Fretboard');await expect(page.locator('#guitar-title')).toContainText('Fretboard explorer');await expect(page.locator('#featured-position')).toHaveValue('path');
 const original=await positions(page);await page.locator('#position-next').click();await expect(page.locator('#featured-position')).toHaveValue('all');const changed=await positions(page);expect(changed[0]).not.toBe(original[0]);expect(changed[1]).toBe(original[1]);
 await page.locator('#position-path [data-inspect-slot="1"]').click();await page.locator('[data-overview-position=V]').click();expect(await positions(page)).toEqual([changed[0],'V']);
 await page.locator('[data-overview-position=V]').press('ArrowRight');expect(await positions(page)).toEqual([changed[0],'I']);
 await tab(page,'caged-exercise');await expect(page.locator('.exercise-position-route [data-inspect-slot="0"]')).toHaveAttribute('data-position',changed[0]!);await expect(page.locator('.exercise-position-route [data-inspect-slot="1"]')).toHaveAttribute('data-position','I');expect(errors).toEqual([]);
});
test('voicing display and overlay are explicit, restore settings and keep strum/practice actions useful',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await expect(page.locator('#fretboard-overlay-details')).toBeHidden();
 await page.locator('#show-grip').check();await page.locator('[data-grip-display=grip]').click();const gripCount=await page.locator('#guitar-diagrams .fret-note').count();expect(gripCount).toBeGreaterThanOrEqual(3);expect(gripCount).toBeLessThanOrEqual(4);
 await page.locator('#theory-view').selectOption('pentatonic');await expect(page.locator('#show-grip')).toBeDisabled();await expect(page.locator('#fret-view')).toBeDisabled();await expect(page.locator('#guitar-diagrams .grip-stage-buttons')).toHaveCount(0);await expect(page.locator('#guitar-diagrams .grip-ring')).toHaveCount(0);await expect(page.locator('#fretboard-display-status')).toContainText('Overlay active');await expect(page.locator('#fretboard-overlay-summary')).toBeVisible();await expect(page.locator('#fretboard-overlay-details')).not.toHaveAttribute('open','');
 await page.locator('#theory-view').selectOption('triads');await expect(page.locator('#theory-choice-label')).toContainText('Triad pair');await expect(page.locator('#fretboard-overlay-key .theory-group-a')).toBeVisible();
 await page.locator('#theory-view').selectOption('none');await expect(page.locator('#show-grip')).toBeEnabled();await expect(page.locator('#show-grip')).toBeChecked();expect(await page.locator('#guitar-diagrams .fret-note').count()).toBe(gripCount);
 await page.locator('.grip-preview').click();await expect(page.locator('.grip-preview')).toHaveAttribute('aria-pressed','true');await page.locator('.grip-preview').click();await expect(page.locator('.grip-preview')).toHaveAttribute('aria-pressed','false');
 await page.locator('[data-practise-grip]').click();await expect(page.locator('#exercise-study')).toHaveValue('positional');expect(errors).toEqual([]);
});
test('mobile tabs remain readable and the full-neck map honours the saved visibility choice',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await expect(page.locator('#full-fretboard-collapse')).toHaveText('Show map');await expect(page.locator('[data-overview-position=II] small')).toBeVisible();await expect(page.locator('[data-overview-position=II] svg')).toBeHidden();
 const width=await page.locator('[data-overview-position=II]').evaluate(n=>n.getBoundingClientRect().width);expect(width).toBeGreaterThanOrEqual(100);
 await page.locator('#full-fretboard-collapse').click();await expect(page.locator('#full-fretboard-collapse')).toHaveText('Hide map');await page.reload();await expect(page.locator('#full-fretboard-collapse')).toHaveText('Hide map');
 await page.locator('#full-fretboard [data-full-position=I]').first().click();await expect(page.locator('#featured-position')).toHaveValue('all');await expect(page.locator('.featured-position')).toHaveAttribute('data-position','I');
 await page.locator('[data-learning-focus]').click();await expect(page.locator('.fretboard-toolbar')).toBeHidden();await expect(page.locator('.featured-position')).toBeVisible();await page.locator('#exit-focus').click();await expect(page.locator('.fretboard-toolbar')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('unavailable overlays and navigation during playback do not present ineffective choices',async({page})=>{
 await open(page);await page.locator('#mini-count-in').uncheck();await page.locator('#mini-play').click();await expect(page.locator('#position-next')).toBeDisabled();await expect(page.locator('[data-overview-position=II]')).toBeDisabled();await page.locator('#mini-play').click();await expect(page.locator('#position-next')).toBeEnabled();
 await tab(page,'harmony-title');await page.locator('#custom-chord').selectOption('min7');await page.locator('#custom-mode').selectOption('minor_pentatonic');await tab(page,'guitar-title');await expect(page.locator('#theory-view option[value=triads]')).toHaveJSProperty('disabled',true);
});
