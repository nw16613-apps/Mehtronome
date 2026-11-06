import {test,expect} from '@playwright/test';
async function generated(page:any){
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-generator>summary').click();
 await page.locator('#generator-count').selectOption('4');await page.locator('#generator-order').selectOption('minorThird');await page.locator('#generator-coverage').uncheck();await page.locator('#generator-bars').selectOption('1');await page.locator('#generator-generate').click();await page.locator('#generator-apply').click();await page.locator('#mini-count-in').uncheck();
}
test('one sounding chord is highlighted in every outline, follows changes and loops, and clears on stop',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await generated(page);
 await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');
 await expect(page.locator('.chord-playing')).toHaveCount(0);await page.locator('#mini-play').click();
 await expect(page.locator('#generator-preview-chords .chord-playing')).toHaveCount(1);
 const check=async()=>page.evaluate(()=>['#generator-preview-chords','#position-path','.exercise-position-route .position-path'].map(selector=>[...document.querySelectorAll(selector+' .chord-playing')].map(c=>Number((c as HTMLElement).dataset.generatorStep??(c as HTMLElement).dataset.routeStep))));
 await expect.poll(check,{timeout:10000}).toEqual([[1],[1],[1]]);
 await page.locator('[data-workspace-target=guitar-title]').click();await expect(page.locator('#position-path .chord-playing')).toBeVisible();
 await expect.poll(()=>page.locator('#generator-preview-chords .chord-playing').getAttribute('data-generator-step'),{timeout:8000}).toBe('0');
 await page.locator('#mini-play').click();await expect(page.locator('.chord-playing')).toHaveCount(0);
 await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#generator-key').selectOption('2');await page.locator('#generator-generate').click();await page.locator('#mini-play').click();
 await expect(page.locator('#position-path .chord-playing')).toHaveCount(1);await expect(page.locator('#generator-preview-chords .chord-playing')).toHaveCount(0);
 await page.locator('#mini-play').click();expect(errors).toEqual([]);
});
test('exercise playback without backing follows its current chord and clears on stop on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await generated(page);await page.locator('[data-workspace-target=caged-exercise]').click();
 await page.locator('#exercise-backing').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');
 await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-position-route .chord-playing')).toHaveCount(1);
 await expect.poll(()=>page.locator('.exercise-position-route .chord-playing').getAttribute('data-route-step'),{timeout:12000}).toBe('1');
 await expect(page.locator('#generator-preview-chords .chord-playing')).toHaveAttribute('data-generator-step','1');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#exercise-preview').click();await expect(page.locator('.chord-playing')).toHaveCount(0);
});

test('backed exercise maps its private resolution bar onto the original opening chord',async({page})=>{
 await generated(page);await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positional');
 await page.locator('#exercise-backing').check();await page.locator('#exercise-loop').check();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();
 await expect.poll(()=>page.locator('#generator-preview-chords .chord-playing').getAttribute('data-generator-step'),{timeout:12000}).toBe('1');
 await expect.poll(()=>page.locator('#generator-preview-chords .chord-playing').getAttribute('data-generator-step'),{timeout:12000}).toBe('3');
 await expect.poll(()=>page.locator('#generator-preview-chords .chord-playing').getAttribute('data-generator-step'),{timeout:12000}).toBe('0');
 await expect(page.locator('#position-path .chord-playing')).toHaveAttribute('data-route-step','0');
 await page.locator('#exercise-preview').click();await expect(page.locator('.chord-playing')).toHaveCount(0);
});

test('count-in stays unlit until the chord starts, then shows a stable visible marker',async({page})=>{
 await generated(page);await page.locator('#mini-count-in').check();await page.locator('#mini-bpm').fill('120');await page.locator('#mini-bpm').dispatchEvent('change');await page.locator('#mini-play').click();
 await expect(page.locator('#play-status')).toContainText('Count');await expect(page.locator('.chord-playing')).toHaveCount(0);
 await expect(page.locator('#generator-preview-chords .chord-playing')).toHaveCount(1);
 const marker=page.locator('#generator-preview-chords .chord-playing');expect(await marker.evaluate(el=>getComputedStyle(el,':after').visibility)).toBe('visible');
 await page.setViewportSize({width:390,height:844});await page.locator('#generator-preview-chords').screenshot({path:'/workspace/chord-playback-mobile.png'});await page.locator('#mini-play').click();await expect(page.locator('.chord-playing')).toHaveCount(0);
 for(const backing of [false,true]){
  await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-backing').setChecked(backing);await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.chord-playing')).toHaveCount(0);await expect(page.locator('.exercise-position-route .chord-playing')).toHaveCount(1);await page.locator('#exercise-preview').click();await expect(page.locator('.chord-playing')).toHaveCount(0);
 }
});
