import {test,expect} from '@playwright/test';
const tab=async(page:any,id:string)=>page.locator(`[data-workspace-target=${id}]`).click();
test('whole tone, augmented, pentatonic and blues guides use grouped compatible choices and their own references',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await tab(page,'harmony-title');
 for(const [chord,mode,family,count] of [['dom9sharp5','whole_tone','Symmetric scales',6],['augMaj7','augmented_scale','Symmetric scales',6],['sixNine','major_pentatonic','Pentatonic scales',5],['min7','minor_pentatonic','Pentatonic scales',5],['sixNine','major_blues','Blues scales',6],['min7','minor_blues','Blues scales',6]] as const){
  await page.locator('#custom-chord').selectOption(chord);await expect(page.locator(`#custom-mode optgroup[label="${family}"] option[value="${mode}"]`)).toHaveCount(1);await page.locator('#custom-mode').selectOption(mode);await expect(page.locator('#custom-scale-check')).toBeHidden();await expect(page.locator('#note-list > li')).toHaveCount(count);await expect(page.locator('#mode-template')).toBeHidden();
  await tab(page,'guitar-title');await expect(page.locator('#guitar-diagrams .fretboard').first()).toBeVisible();await tab(page,'caged-exercise');await page.locator('#exercise-study').selectOption('harmonized');await expect(page.locator('.exercise-score svg').first()).toBeVisible();
  if(mode.includes('pentatonic'))await expect(page.locator('#exercise-study option[value=triadpairs]')).toHaveJSProperty('disabled',true);
  await tab(page,'harmony-title');
 }
 await page.locator('#custom-chord').selectOption('dom7');await expect(page.locator('#custom-mode option[value=whole_tone]')).toHaveCount(1);await expect(page.locator('#custom-mode option[value=minor_blues]')).toHaveCount(1);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('mixed five/six-note charts preserve notation, playback and saved guides',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(!localStorage.getItem('mehtronome-repertoire-v1'))localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'five-six',name:'Five and six notes',key:0,beats:4,progression:{version:2,name:'Five and six notes',steps:[{root:0,chord:'min7',mode:'minor_pentatonic',bars:1},{root:5,chord:'dom9sharp5',mode:'whole_tone',bars:1},{root:8,chord:'augMaj7',mode:'augmented_scale',bars:1},{root:0,chord:'min7',mode:'minor_blues',bars:1}]}}]}));});
 await page.goto('/');await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption('saved:five-six');await tab(page,'caged-exercise');await page.locator('#exercise-study').selectOption('groups4');await page.locator('#exercise-rhythm').selectOption('sixteenths');
 for(let slot=0;slot<4;slot++)await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`).first()).toBeVisible();
 await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:10000});await page.locator('#exercise-preview').click();
 await page.reload();await tab(page,'harmony-title');await page.locator('#progression-choice').selectOption('saved:five-six');await page.locator('[data-grid-step="1"]').first().click();await expect(page.locator('#custom-mode')).toHaveValue('whole_tone');expect(errors).toEqual([]);
});
