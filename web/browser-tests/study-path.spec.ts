import {test,expect} from '@playwright/test';
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
const working=async(page:any)=>page.evaluate(()=>JSON.parse(localStorage.getItem('mehtronome-custom-progression-v1')!));
const study=async(page:any)=>tab(page,'study-path-title');
test('global chord/mode workflows load matching exercises while preserving tempo and sound setup',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'sound-settings-title');await page.locator('#backing-style').selectOption('blues');await page.locator('#mini-bpm').fill('137');await page.locator('#mini-bpm').dispatchEvent('change');
 const mixer=await page.locator('#comping-volume').inputValue();await study(page);await expect(page.locator('.study-tier')).toHaveCount(4);
 await page.locator('#study-mode').selectOption('lydian');await page.locator('#study-chord').selectOption('maj7');await page.locator('#study-route').selectOption('manual');await page.locator('#study-passes').selectOption('3');
 for(const [i,p]of ['I','IV','V'].entries())await page.locator(`[data-study-position="${i}"]`).selectOption(p);
 await page.locator('#study-material').selectOption('arpgroups4');await page.locator('#study-load').click();
 await expect(page.locator('body')).toHaveAttribute('data-workspace','exercises');await expect(page.locator('#exercise-study')).toHaveValue('arpgroups4');await expect(page.locator('#exercise-loop')).toBeChecked();await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','false');
 expect((await working(page)).steps.map((s:any)=>[s.mode,s.chord])).toEqual(Array(3).fill(['lydian','maj7']));expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe('034');
 await expect(page.locator('#mini-bpm')).toHaveValue('137');await expect(page.locator('#comping-volume')).toHaveValue(mixer);await expect(page.locator('#backing-style')).toHaveValue('blues');
 await study(page);await page.locator('[data-study-workflow=chord]').click();await page.locator('#study-chord').selectOption('dom7alt');await expect(page.locator('#study-mode')).toHaveValue('altered');await page.locator('#study-load').click();expect((await working(page)).steps.every((s:any)=>s.chord==='dom7alt'&&s.mode==='altered')).toBe(true);expect(errors).toEqual([]);
});
test('Tier 2 keeps one quality across keys; mixed patterns and selected-chord edits belong to Tier 3',async({page})=>{
 await page.goto('/');await page.locator('[data-study-tier="2"]').click();await page.locator('#study-order').selectOption('majorThird');await expect(page.locator('[data-study-step]')).toHaveCount(3);
 await page.locator('#study-order').selectOption('minorThird');await expect(page.locator('[data-study-step]')).toHaveCount(4);await page.locator('#study-coverage').selectOption('all');await expect(page.locator('[data-study-step]')).toHaveCount(12);
 await page.locator('#study-coverage').selectOption('cycle');await page.locator('#study-order').selectOption('majorThird');await expect(page.locator('#study-variation')).toHaveCount(0);await expect(page.locator('#study-turnaround')).toHaveCount(0);await page.locator('#study-mode').selectOption('lydian');await page.locator('#study-chord').selectOption('maj7');await page.locator('#study-load').click();expect((await working(page)).steps.every((s:any)=>s.chord==='maj7'&&s.mode==='lydian')).toBe(true);
 await study(page);await page.locator('[data-study-tier="3"]').click();for(const value of ['major251altered','minor251','backdoor','tritone251','turnaround'])await expect(page.locator(`#study-turnaround option[value="${value}"]`)).toHaveCount(1);await page.locator('#study-turnaround').selectOption('minor251');await page.locator('#study-load').click();expect(new Set((await working(page)).steps.map((s:any)=>s.chord)).size).toBeGreaterThan(1);await study(page);await page.locator('#study-turnaround').selectOption('three');await page.locator('#study-root').selectOption('9');await expect(page.locator('.study-chart-preview')).toContainText('Bm7');await expect(page.locator('.study-chart-preview')).toContainText('Amaj7');
 await page.locator('#study-route').selectOption('manual');await page.locator('[data-study-position="0"]').selectOption('V');await page.locator('[data-study-position="1"]').selectOption('I');
 await page.locator('#study-card').selectOption('1');await page.locator('#study-mode').selectOption('altered');await expect(page.locator('#study-chord')).toHaveValue('dom7alt');await page.locator('#study-load').click();
 const steps=(await working(page)).steps;expect(steps.map((s:any)=>s.mode)).toEqual(['dorian','altered','major']);expect(steps.map((s:any)=>s.root)).toEqual([2,7,0]);expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)).toBe('400');
 await tab(page,'harmony-title');await page.locator('#custom-undo').click();expect((await working(page)).steps.some((s:any)=>s.chord.startsWith('halfDim'))).toBe(true);
});
test('complete forms retain split bars and sections; current/saved charts are available; chord material opens the fretboard',async({page})=>{
 const saved={version:1,items:[{id:'waltz',name:'My waltz',key:2,beats:3,progression:{name:'My waltz',steps:[{root:0,chord:'min7',mode:'dorian',beats:3,section:'A'},{root:7,chord:'dom7',mode:'mixolydian',beats:2}]}}]};
 await page.addInitScript(data=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify(data)),saved);await page.goto('/');await page.locator('[data-study-tier="4"]').click();
 await expect(page.locator('#study-form option[value="saved:waltz"]')).toHaveCount(1);await page.locator('#study-form').selectOption('standard:autumn-leaves');await page.locator('#study-load').click();let chart=await working(page);expect(chart.steps).toHaveLength(34);expect(chart.steps.some((s:any)=>s.beats===2)).toBe(true);expect(chart.sourceNotes).toBeTruthy();expect(chart.steps.some((s:any)=>s.section)).toBe(true);
 await study(page);await page.locator('#study-form').selectOption('saved:waltz');await page.locator('#study-route').selectOption('manual');await page.locator('#study-material').selectOption('voicings');await page.locator('#study-load').click();await expect(page.locator('body')).toHaveAttribute('data-workspace','guitar');await expect(page.locator('#key')).toHaveValue('2');chart=await working(page);expect(chart.steps.map((s:any)=>s.beats)).toEqual([3,2]);
 await study(page);await page.locator('#study-current-chart').click();await expect(page.locator('#study-form')).toHaveValue('current');await expect(page.locator('[data-study-step]')).toHaveCount(2);
});
test('pathway marks/routes persist, previews are non-destructive and all tiers fit on mobile',async({page})=>{
 await page.goto('/');const before=await working(page);await page.locator('#study-route').selectOption('manual');await page.locator('#study-material').selectOption('positional');await page.locator('#study-position').selectOption('II');await page.locator('#study-marked').check();
 await page.reload();await expect(page.locator('#study-material')).toHaveValue('positional');await expect(page.locator('[data-study-position="0"]')).toHaveValue('II');await expect(page.locator('#study-marked')).toBeChecked();expect(await working(page)).toEqual(before);
 await page.locator('[data-study-position="0"]').selectOption('III');await expect(page.locator('#study-marked')).not.toBeChecked();await page.locator('[data-study-position="0"]').selectOption('II');await expect(page.locator('#study-marked')).toBeChecked();
 await page.setViewportSize({width:390,height:844});for(const tier of ['1','2','3','4']){await page.locator(`[data-study-tier="${tier}"]`).click();await expect(page.locator('#study-route')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 await page.locator('#study-path').screenshot({path:'/workspace/full-study-mobile.png'});await page.setViewportSize({width:1440,height:1000});await page.locator('#study-path').screenshot({path:'/workspace/full-study-desktop.png'});
});
test('loaded study cards follow the current chord one at a time and controls lock during playback',async({page})=>{
 await page.goto('/');await page.locator('#mini-bpm').fill('240');await page.locator('#mini-bpm').dispatchEvent('change');await page.locator('[data-study-tier="3"]').click();await page.locator('#study-bars').selectOption('1');await page.locator('#study-load').click();
 await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-preview').click();await expect(page.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#mini-chord')).toHaveText('E7',{timeout:8000});await study(page);await expect(page.locator('#study-load')).toBeDisabled();await expect(page.locator('#study-root')).toBeDisabled();await expect(page.locator('.study-chart-preview .chord-playing')).toHaveCount(1);
 await page.locator('#mini-play').click();await expect(page.locator('#study-load')).toBeEnabled();await expect(page.locator('.study-chart-preview .chord-playing')).toHaveCount(0);
});
test('Study opens first and Progress retains saved setups',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-workspace','progress'));await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-workspace','study');await expect(page.locator('.workspace-tab').first()).toContainText('Study');
 await tab(page,'progress-title');await expect(page.locator('.presets')).toBeVisible();await expect(page.locator('#study-path')).toBeHidden();await page.reload();await expect(page.locator('#study-path')).toBeVisible();await expect(page.locator('.workspace-tab>.studio-icon')).toHaveCount(7);
});

test('circle of fourths is available in both changing-key and progression studies',async({page})=>{
 await page.goto('/');await page.locator('[data-study-tier="2"]').click();
 await expect(page.locator('#study-order option[value=fourths]')).toHaveText('Circle of fourths');await page.locator('#study-root').selectOption('0');await page.locator('#study-order').selectOption('fourths');await expect(page.locator('[data-study-step]')).toHaveCount(12);
 await page.locator('[data-study-tier="3"]').click();await page.locator('#study-turnaround').selectOption('three');await page.locator('#study-key-cycle').selectOption('fourths');await expect(page.locator('[data-study-step]')).toHaveCount(36);
 await expect(page.locator('[data-study-step="5"]')).toContainText('Fmaj7');await expect(page.locator('[data-study-step="8"]')).toContainText('B♭maj7');await page.locator('#study-route').selectOption('manual');await page.locator('[data-study-position="3"]').selectOption('V');await page.locator('#study-load').click();
 expect((await working(page)).steps).toHaveLength(36);expect((await page.locator('#manual-position-route').inputValue()).split(':').at(-1)?.[3]).toBe('4');await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','false');
 await page.reload();await expect(page.locator('#study-key-cycle')).toHaveValue('fourths');await expect(page.locator('[data-study-step]')).toHaveCount(36);await page.locator('#study-key-cycle').selectOption('single');await expect(page.locator('[data-study-step]')).toHaveCount(3);expect((await working(page)).steps).toHaveLength(36);
});
