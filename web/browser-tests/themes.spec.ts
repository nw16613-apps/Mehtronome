import {expect,test} from '@playwright/test';
const themes=[
  {id:'midnight',name:'Refined Midnight',page:'rgb(10, 17, 27)',panel:'rgb(17, 30, 44)',accent:'rgb(137, 194, 242)',modal:'rgb(215, 173, 243)',grid:'rgb(109, 135, 158)'},
  {id:'plum',name:'Plum Ink',page:'rgb(24, 19, 31)',panel:'rgb(36, 28, 45)',accent:'rgb(207, 185, 232)',modal:'rgb(221, 185, 244)',grid:'rgb(154, 133, 167)'},
  {id:'evergreen',name:'Evergreen',page:'rgb(12, 23, 21)',panel:'rgb(20, 38, 33)',accent:'rgb(161, 213, 186)',modal:'rgb(215, 173, 243)',grid:'rgb(117, 157, 137)'},
];
for(const theme of themes)test(`${theme.name} applies everywhere and survives reload`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('#palette option')).toHaveText(themes.map(item=>item.name));await expect(page.locator('#theme')).toHaveCount(0);
  await page.locator('#bpm').fill('123');await page.locator('#bpm').dispatchEvent('change');await page.locator('#palette').selectOption(theme.id);
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.locator('html')).toHaveCSS('background-color',theme.page);
  await expect(page.locator('#mix-panel')).toHaveCSS('background-color',theme.panel);await expect(page.locator('#play')).toHaveCSS('background-color',theme.accent);await expect(page.locator('#bpm')).toHaveValue('123');
  await page.locator('[data-workspace-target="guitar-title"]').click();await expect(page.locator('.position-card .guitar-string').first()).toHaveCSS('stroke',theme.grid);await expect(page.locator('.position-card .characteristic-ring').first()).toHaveCSS('stroke',theme.modal);await expect(page.locator('.position-card .fret-note.chord > circle').first()).toHaveCSS('fill','rgb(104, 201, 192)');
  const overlayColours=await page.evaluate(()=>{const style=getComputedStyle(document.documentElement);return ['--theory-a','--theory-b','--theory-pentatonic','--chord'].map(name=>style.getPropertyValue(name).trim());});expect(new Set(overlayColours).size).toBe(4);
  await page.locator('#mini-mixer').click();await expect(page.locator('#floating-mixer')).toHaveCSS('background-color',theme.panel);await page.locator('#floating-mixer-close').click();
  await page.reload();await expect(page.locator('#palette')).toHaveValue(theme.id);await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.locator('html')).toHaveCSS('background-color',theme.page);expect(await page.evaluate(()=>localStorage.getItem('mehtronome-theme'))).toBe(theme.id);
  await page.setViewportSize({width:390,height:844});for(const target of ['pulse-title','harmony-title','guitar-title','caged-exercise','progress-title','sound-settings-title']){await page.locator(`[data-workspace-target="${target}"]`).click();await expect(page.locator('#palette')).toHaveValue(theme.id);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
});
for(const oldTheme of ['light','dark','paper','slate','unknown'])test(`old ${oldTheme} preference becomes Refined Midnight`,async({page})=>{
  await page.addInitScript(theme=>localStorage.setItem('mehtronome-theme',theme),oldTheme);await page.goto('/');await expect(page.locator('#palette')).toHaveValue('midnight');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');expect(await page.evaluate(()=>localStorage.getItem('mehtronome-theme'))).toBe('midnight');
});
test('gallery has exactly the three approved themes and choosing one persists',async({page})=>{
  await page.goto('/themes.html');await expect(page.locator('.card')).toHaveCount(3);await expect.poll(()=>page.locator('.card img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0))).toBe(true);await page.getByRole('link',{name:'Choose Evergreen →'}).click();await expect(page.locator('#palette')).toHaveValue('evergreen');await page.goto('/');await expect(page.locator('#palette')).toHaveValue('evergreen');
  await page.locator('#play').click();await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');for(const theme of themes){await page.locator('#palette').selectOption(theme.id);await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');}await page.locator('#play').click();
});
