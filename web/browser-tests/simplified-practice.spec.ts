import {test,expect} from '@playwright/test';
test('removed tools stay absent while CAGED, charts, guidance and progress remain usable',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 for(const target of ['guitar-title','caged-exercise','progress-title','harmony-title']){
  await page.locator(`[data-workspace-target="${target}"]`).click();
  await expect(page.locator('[data-open-shells],[data-open-drops],[data-open-ear],[data-open-recording],#ear-title,#recording-title,.practice-journal,.fret-recall,#exercise-recall,#exercise-recall-prompt,#exercise-application,#exercise-response,#exercise-stage option[value="apply"]')).toHaveCount(0);
 }
 await page.locator('#repertoire-study').selectOption('minorjazz');await page.locator('#repertoire-practise').click();
 await expect(page.locator('#exercise-study')).toHaveValue('harmonized');
 await expect(page.locator('#exercise-study option[value="shells"],#exercise-study option[value="shellphrases"],#exercise-study option[value="drops"]')).toHaveCount(0);
 await expect(page.locator('.exercise-map-diagram')).toBeVisible();await expect(page.locator('.exercise-lesson')).toBeVisible();
 await page.locator('#exercise-stage').selectOption('cell');await expect(page.locator('#exercise-study')).toHaveValue('harmonized');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});

test('shape exploration is visible without opening settings and manual loop UI is absent',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();
 await expect(page.locator('.guitar-setup')).not.toHaveAttribute('open','');
 await expect(page.locator('.guitar-shape-controls #show-grip')).toBeVisible();await page.locator('#show-grip').check();
 await expect(page.locator('.guitar-shape-controls #theory-view')).toBeVisible();await page.locator('#theory-view').selectOption('pentatonic');await expect(page.locator('#theory-choice')).toBeVisible();
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#show-grip')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('[data-workspace-target=harmony-title]').click();await expect(page.getByText('Choose loop with controls',{exact:true})).toHaveCount(0);await expect(page.locator('#loop-start')).toBeHidden();
});

test('older application favourites open as ordinary full-position studies',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mehtronome-exercise-favourites',JSON.stringify([{study:'thirds',material:'seventh',motion:'ascending',rhythm:'eighths',stage:'apply',application:'cell-space',response:'respond',recall:true}])));
 await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-favourites').selectOption('0');
 await expect(page.locator('#exercise-stage')).toHaveValue('full');await expect(page.locator('.exercise-map-diagram')).toBeVisible();await expect(page.locator('#exercise-response,#exercise-recall')).toHaveCount(0);await expect(page.locator('.exercise-note')).not.toHaveCount(0);
});

test('exercise diagram and score share a row on desktop and stack on mobile',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 await expect(page.locator('.exercise-viewbar #exercise-map-toggle')).toBeVisible();await expect(page.locator('.exercise-linked-fretboard .exercise-map-heading')).toHaveCount(1);const [navigation,diagram,score]=await page.evaluate(()=>['.exercise-navigation','.exercise-linked-fretboard','.exercise-score'].map(s=>{const b=document.querySelector(s)!.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};}));expect(navigation.y+navigation.height).toBeLessThanOrEqual(score.y);expect(score.x).toBeGreaterThanOrEqual(diagram.x+diagram.width);expect(Math.abs(score.y-diagram.y)).toBeLessThan(2);
 await page.setViewportSize({width:390,height:844});const [mobileDiagram,mobileScore]=await page.evaluate(()=>['.exercise-linked-fretboard','.exercise-score'].map(s=>{const b=document.querySelector(s)!.getBoundingClientRect();return {y:b.y,height:b.height};}));expect(mobileScore.y).toBeGreaterThanOrEqual(mobileDiagram.y+mobileDiagram.height);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('compact sidebar stays visible while reading and can give the score full width',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await page.locator('#practice-goal').selectOption('jazz');await page.locator('#start-guided-goal').click();await page.locator('#exercise-study').selectOption('thirds');
 await expect(page.locator('.exercise-navigation #exercise-position-navigation')).toBeVisible();await expect(page.locator('.exercise-navigation .position-path-heading > p')).toBeHidden();
 expect(await page.locator('.exercise-linked-fretboard').evaluate(e=>getComputedStyle(e).position)).toBe('sticky');await page.locator('.exercise-material-layout').scrollIntoViewIfNeeded();
 await page.locator('#caged-exercise').screenshot({path:'/workspace/compact-exercises.png'});
 const before=await page.locator('.exercise-score').evaluate(e=>e.getBoundingClientRect().width);await page.locator('#exercise-map-toggle').click();await expect(page.locator('.exercise-linked-fretboard')).toBeHidden();expect(await page.locator('.exercise-score').evaluate(e=>e.getBoundingClientRect().width)).toBeGreaterThan(before);await page.locator('#exercise-map-toggle').click();await expect(page.locator('.exercise-linked-fretboard')).toBeVisible();
});

test('exercise-shaping controls are visible above a shared practice panel',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();
 for(const id of ['exercise-material','exercise-motion','exercise-rhythm','exercise-loop','exercise-backing']){const group=['exercise-loop','exercise-backing'].includes(id)?'.exercise-playback-panel':'.exercise-definition';await expect(page.locator(`${group} #${id}`)).toBeVisible();await expect(page.locator(`.exercise-setup #${id}`)).toHaveCount(0);}
 await page.locator('#exercise-motion').selectOption('descending');await page.locator('#exercise-rhythm').selectOption('triplets');await expect(page.locator('#exercise-motion')).toHaveValue('descending');await expect(page.locator('#exercise-rhythm')).toHaveValue('triplets');
 const result=await page.evaluate(()=>{const diagram=document.querySelector('.exercise-linked-fretboard')!,map=document.querySelector('.exercise-map-diagram')!,key=document.querySelector('.exercise-diagram-reference')!,panel=document.querySelector('.exercise-material-layout')!;return {border:getComputedStyle(diagram).borderTopWidth,shared:panel.contains(diagram)&&panel.contains(document.querySelector('.exercise-score')),below:!!(map.compareDocumentPosition(key)&Node.DOCUMENT_POSITION_FOLLOWING)};});expect(result).toEqual({border:'0px',shared:true,below:true});
 await page.locator('#caged-exercise').screenshot({path:'/workspace/shared-practice-panel.png'});await page.setViewportSize({width:390,height:844});await expect(page.locator('#exercise-rhythm')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
