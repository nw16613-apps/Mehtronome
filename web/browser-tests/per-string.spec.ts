import {test,expect} from '@playwright/test';
const counts=(page:any)=>page.locator('#per-string-diagram').evaluate((el:HTMLElement)=>[0,1,2,3,4,5].map(s=>el.querySelectorAll(`.fret-note[data-string="${s}"]`).length));
async function open(page:any){await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();}
test('three-note fingerings support mode degrees, pentatonic diagonals, register changes and restore CAGED choices',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await expect(page.locator('#per-string-start')).toBeHidden();const route=await page.locator('#manual-position-route').inputValue();const original=await page.locator('#guitar-diagrams h4').textContent();
 await page.locator('#fretboard-fingering').selectOption('three');await expect(page.locator('#per-string-diagram')).toBeVisible();await expect(page.locator('#position-overview')).toBeHidden();await expect(page.locator('.fretboard-toolbar')).toBeHidden();await expect(page.locator('.position-navigation')).toBeHidden();expect(await counts(page)).toEqual([3,3,3,3,3,3]);
 await expect(page.locator('#per-string-start option')).toHaveCount(7);await page.locator('#per-string-register').selectOption('17');await expect(page.locator('#per-string-diagram .position-heading>span')).toContainText('17');await page.locator('#per-string-start').selectOption('1');await expect(page.locator('#per-string-diagram .practice-help')).toContainText('(2)');
 await page.locator('#per-string-labels').selectOption('notes');await expect(page.locator('#per-string-diagram .fret-note text').first()).toHaveText('B');
 await page.locator('#fretboard-fingering').selectOption('caged');await expect(page.locator('#guitar-diagrams')).toBeVisible();await expect(page.locator('#guitar-diagrams h4')).toHaveText(original!);await expect(page.locator('#manual-position-route')).toHaveValue(route);await expect(page.locator('#per-string-start')).toBeHidden();
 // A single-chord chart lets the user change the active scale directly.
 await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#single-chord-chart').click();await page.locator('#custom-mode').selectOption('minor_pentatonic');
 await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption('three');await expect(page.locator('#per-string-start option')).toHaveCount(5);await expect(page.locator('#per-string-diagram h4')).toContainText('pentatonic');expect(await counts(page)).toEqual([3,3,3,3,3,3]);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const scroll=page.locator('.per-string-scroll');expect(await scroll.evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(true);await page.locator('#per-string-diagram').screenshot({path:'/workspace/per-string-pentatonic-mobile.png'});expect(errors).toEqual([]);
});
test('both arpeggio approaches show the actual chord tones and follow playback without resetting diagram scroll',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 await page.locator('#fretboard-fingering').selectOption('oneTwo');expect(await counts(page)).toEqual([1,2,1,2,1,2]);await page.locator('#fretboard-fingering').selectOption('twoOne');expect(await counts(page)).toEqual([2,1,2,1,2,1]);
 await expect(page.locator('#per-string-diagram .fret-note.scale')).toHaveCount(0);await page.locator('#per-string-start').selectOption('1');await expect(page.locator('#per-string-diagram .practice-help')).toContainText('(♭3)');
 await page.setViewportSize({width:390,height:844});await page.locator('.per-string-scroll').evaluate(e=>e.scrollLeft=80);const scroll=await page.locator('.per-string-scroll').evaluate(e=>e.scrollLeft);await page.locator('#mini-count-in').uncheck();await page.locator('#mini-play').click();await expect(page.locator('#fretboard-fingering')).toBeDisabled();await expect(page.locator('#per-string-diagram')).toBeVisible();await page.waitForTimeout(750);expect(await page.locator('.per-string-scroll').evaluate(e=>e.scrollLeft)).toBe(scroll);
 await page.locator('#mini-play').click();await expect(page.locator('#fretboard-fingering')).toBeEnabled();expect(errors).toEqual([]);
});

test('generated chord playback changes the alternate fingering without changing its chosen pattern',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-generator>summary').click();await page.locator('#generator-order').selectOption('minorThird');await page.locator('#generator-coverage').uncheck();await page.locator('#generator-bars').selectOption('1');await page.locator('#generator-generate').click();await page.locator('#generator-apply').click();
 await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption('three');const first=await page.locator('#per-string-diagram h4').textContent();
 await page.locator('#mini-count-in').uncheck();await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');await page.locator('#mini-play').click();
 await expect.poll(()=>page.locator('#per-string-diagram h4').textContent()).not.toBe(first);await expect(page.locator('#fretboard-fingering')).toHaveValue('three');expect(await counts(page)).toEqual([3,3,3,3,3,3]);await page.locator('#mini-play').click();
});
