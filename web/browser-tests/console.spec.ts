import {expect,test} from '@playwright/test';
test('console faders use a gain taper, preserve percent controls, and reset on double click',async({page})=>{
 await page.goto('/');const fader=page.locator('#click');await expect(page.locator('.console-meter-lane')).toHaveCount(14);
 await fader.click({position:{x:22,y:122}});await expect(fader).toHaveValue('6');await expect(page.locator('#click-value')).toHaveText('6%');await expect(page.locator('#gain-click')).toHaveText('-24.4');
 await fader.press('ArrowUp');await expect(fader).toHaveValue('7');await fader.dblclick();await expect(fader).toHaveValue('50');await expect(page.locator('#gain-click')).toHaveText('-6.0');
 await page.getByRole('button',{name:'Enable Drums',exact:true}).click();await expect(page.locator('#drums')).toBeChecked();await expect(page.getByRole('button',{name:'Disable Drums',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('#mini-mixer').click();await expect(page.locator('#floating-mixer #click')).toHaveValue('50');await expect(page.locator('#floating-mixer .console-meter-lane')).toHaveCount(14);
});
test('real channel meters are idle before audio, respond to sound, and decay after mute',async({page})=>{
 await page.goto('/');const meter=page.locator('[data-mix-channel=click] .console-meter-lane').first();
 const level=()=>meter.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--level'))||0);
 expect(await level()).toBe(0);await expect(meter.locator('.console-meter-fill')).toHaveCSS('height','0px');await page.locator('#harmony').fill('0');await page.locator('#harmony').dispatchEvent('input');await page.locator('#bpm').fill('240');await page.locator('#bpm').dispatchEvent('change');await page.locator('#play').click();
 await expect.poll(level).toBeGreaterThan(1);await page.locator('[data-mute-channel=click]').click();await expect.poll(level,{timeout:5000}).toBe(0);await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');await page.locator('[data-mute-channel=click]').click();await expect.poll(level).toBeGreaterThan(1);await page.locator('#play').click();await expect.poll(level,{timeout:5000}).toBe(0);
});
