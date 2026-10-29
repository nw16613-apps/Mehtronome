import {test,expect} from '@playwright/test';
const harmony=async(page:any)=>page.locator('[data-workspace-target=harmony-title]').click();
test('selected chord offers compatible scale families without a separate explorer',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await harmony(page);
 await expect(page.locator('.chord-scale-explorer')).toHaveCount(0);
 await page.locator('#custom-chord').selectOption('min7');
 await expect(page.locator('#custom-mode')).toHaveValue('dorian');
 await expect(page.locator('#custom-mode option[value=phrygian_dominant]')).toHaveCount(0);
 await expect(page.locator('#custom-mode optgroup[label="Major scale"] option[value=phrygian]')).toHaveCount(1);
 await page.locator('#custom-mode').selectOption('phrygian');
 await page.locator('#custom-root').selectOption('2');await expect(page.locator('#custom-mode')).toHaveValue('phrygian');
 await page.locator('#custom-chord').selectOption('dom7');await expect(page.locator('#custom-mode')).toHaveValue('mixolydian');
 await expect(page.locator('#custom-mode option[value=altered]')).toHaveCount(0);
 await expect(page.locator('#custom-mode optgroup[label="Harmonic minor"] option[value=phrygian_dominant]')).toHaveCount(1);
 await expect(page.locator('#custom-mode optgroup[label="Melodic minor"] option[value=lydian_dominant]')).toHaveCount(1);
 await page.locator('#custom-chord').selectOption('dom7alt');await expect(page.locator('#custom-mode option[value=altered]')).toHaveCount(1);
 await page.locator('#custom-chord').selectOption('min13');await expect(page.locator('#custom-mode option[value=minor]')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('legacy incompatible guides are explicit and unchanged until the user repairs them',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'legacy-guide',name:'Legacy guide',key:9,beats:4,progression:{version:2,name:'Legacy guide',steps:[{root:0,chord:'min7',mode:'phrygian_dominant',bars:1,bass:null}]}}]})));
 await page.goto('/');await harmony(page);await page.locator('#progression-choice').selectOption('saved:legacy-guide');
 await expect(page.locator('#custom-mode')).toHaveValue('phrygian_dominant');await expect(page.locator('#custom-mode option[value=phrygian_dominant]')).toHaveJSProperty('disabled',true);await expect(page.locator('#custom-mode-help')).toContainText('omits a written chord tone');
 await page.locator('#custom-bars').selectOption('2');await expect(page.locator('#custom-mode')).toHaveValue('phrygian_dominant');
 await page.locator('#custom-mode').selectOption('dorian');await expect(page.locator('#custom-mode option[value=phrygian_dominant]')).toHaveCount(0);await expect(page.locator('#custom-mode-help')).toContainText('contain every written chord tone');
});

test('dominant thirteen offers melodic colours without false incompatibility warnings',async({page})=>{
 await page.goto('/');await harmony(page);
 await page.locator('#custom-chord').selectOption('dom13');
 for(const mode of ['major_pentatonic','major_blues']){
  await page.locator('#custom-mode').selectOption(mode);
  await expect(page.locator('#custom-scale-check')).toBeHidden();
  await expect(page.locator('#custom-compatible-mode')).toBeHidden();
 }
 await page.locator('#custom-chord').selectOption('dom7');
 await expect(page.locator('#custom-mode option[value=whole_tone]')).toHaveCount(0);
 await page.locator('#custom-chord').selectOption('dom9sharp5');
 await page.locator('#custom-mode').selectOption('whole_tone');
 await expect(page.locator('#custom-scale-check')).toBeHidden();
});
