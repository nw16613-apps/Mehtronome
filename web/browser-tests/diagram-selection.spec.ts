import {test,expect} from '@playwright/test';
const open=async(page:any)=>{await page.goto('/');await page.locator('[data-workspace-target=guitar-title]').click();};
test('every fingering has compact selectable previews, one featured diagram, navigation and a synced full map',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 for(const kind of ['three','oneTwo','twoOne','drop2','drop3']){
  await page.locator('#fretboard-fingering').selectOption(kind);const cards=page.locator('.per-string-shape'),count=await cards.count();expect(count).toBe(kind==='three'?7:4);
  for(let i=0;i<count;i++){
   await cards.nth(i).locator('.fret-note').first().click();const degree=await cards.nth(i).getAttribute('data-start-degree');await expect(page.locator('#per-string-neck-shape')).toHaveValue(degree!);await expect(cards.nth(i)).toHaveClass(/map-current/);await expect(cards.nth(i).locator('[role=button]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.per-string-selected h4')).toHaveText(await cards.nth(i).locator('h5').innerText());
  }
  await page.locator('[data-shape-move="1"]').click();await expect(page.locator('#per-string-neck-shape')).toHaveValue((await cards.first().getAttribute('data-start-degree'))!);
  await cards.nth(1).locator('[role=button]').focus();await page.keyboard.press('Enter');await expect(page.locator('#per-string-neck-shape')).toHaveValue((await cards.nth(1).getAttribute('data-start-degree'))!);
  await page.locator('#per-string-neck-shape').selectOption('2');await expect(page.locator('.per-string-featured [data-practise-per-string]')).toHaveAttribute('data-practise-per-string','2');
  await expect(page.locator('.per-string-selected')).toHaveCount(1);await expect(page.locator('.per-string-selected [data-string-register]')).toBeVisible();await expect(page.locator('.per-string-gallery select')).toHaveCount(0);
 }
 for(const width of [1440,640,390]){await page.setViewportSize({width,height:900});const box=await page.locator('.per-string-neck-option').evaluate(e=>{const label=e.querySelector('span')!.getBoundingClientRect(),select=e.querySelector('select')!.getBoundingClientRect();return select.top-label.bottom;});expect(box).toBeGreaterThanOrEqual(5);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 await page.locator('#per-string-diagram').screenshot({path:'/workspace/shape-layout-mobile.png'});expect(errors).toEqual([]);
});
test('scale and drop practice transfer exact selected notes, register and string set',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 for(const kind of ['three','oneTwo','twoOne','drop2','drop3']){
  await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption(kind);
  if(kind.startsWith('drop'))await page.locator('#drop-string-set').selectOption('1');
  await page.locator('.per-string-shape[data-start-degree="2"]').click();
  const expected=await page.locator('.per-string-selected .fret-note').evaluateAll(nodes=>nodes.map(n=>n.querySelector('title')!.textContent!.match(/^(.+), string (\d+), fret (\d+)/)!.slice(1)));
  const fret=await page.locator('.per-string-selected select').inputValue();await page.locator('.per-string-selected [data-practise-per-string]').click();
  await expect(page.locator('#exercise-fingering')).toHaveValue(kind);await expect(page.locator('#exercise-inversion')).toHaveValue('2');await expect(page.locator('#exercise-fingering-fret')).toHaveValue(fret);if(kind.startsWith('drop')){await expect(page.locator('#exercise-fingering-set')).toHaveValue('1');await expect(page.locator('.exercise-map-diagram .grip-mute')).toHaveCount(2);}
  const actual=await page.locator('.exercise-note:not(.resolution-note)').evaluateAll((nodes,count)=>[...new Map(nodes.map(n=>[n.getAttribute('data-note-index'),n])).values()].slice(0,count).map(n=>n.getAttribute('aria-label')!.match(/^(.+), string (\d+), fret (\d+)/)!.slice(1)),expected.length);expect(actual).toEqual(expected);
  const captions=await page.locator('.aligned-notation .exercise-degree').allTextContents();expect(captions.filter(x=>x!=='Resolution')).toHaveLength(1);
 }
 expect(errors).toEqual([]);
});
test('all scale, arpeggio and drop suggestions use closed positions',async({page})=>{
 await open(page);for(const kind of ['three','oneTwo','twoOne','drop2','drop3']){await page.locator('#fretboard-fingering').selectOption(kind);expect(await page.locator('.per-string-gallery .fret-note').evaluateAll(notes=>notes.every(n=>Number(n.getAttribute('data-fret'))>0))).toBe(true);}
});
test('previews and Previous/Next follow ascending fret ranges while preserving inversion identity',async({page})=>{
 await open(page);
 for(const kind of ['three','oneTwo','twoOne','drop2','drop3']){
  await page.locator('#fretboard-fingering').selectOption(kind);
  const check=async()=>{const cards=page.locator('.per-string-shape');const ranges=await cards.locator('.position-heading>span').allTextContents();const lows=ranges.map(x=>Number(x.match(/\d+/)![0]));expect(lows).toEqual([...lows].sort((a,b)=>a-b));
   await cards.first().click();for(let i=0;i<await cards.count();i++){await expect(page.locator('.per-string-selected h4')).toHaveText(await cards.nth(i).locator('h5').innerText());await expect(page.locator('#per-string-neck-shape')).toHaveValue((await cards.nth(i).getAttribute('data-start-degree'))!);await page.locator('[data-shape-move="1"]').click();}
   await page.locator('[data-shape-move="-1"]').click();await expect(page.locator('.per-string-selected h4')).toHaveText(await cards.last().locator('h5').innerText());
  };await check();
  if(kind.startsWith('drop')){await page.locator('#drop-string-set').selectOption('1');await check();}
  const register=page.locator('.per-string-selected select');if(await register.locator('option').count()>1){await register.selectOption({index:(await register.locator('option').count())-1});await check();}
 }
});
test('CAGED previews and navigation follow fret order for changing chords and guides',async({page})=>{
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#single-chord-chart').click();
 for(const [root,mode,chord] of [['9','lydian_dominant','dom7'],['1','lydian','maj7'],['5','dorian','min7']]){
  await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#custom-root').selectOption(root);await page.locator('[data-chart-workflow=mode]').click();await page.locator('#custom-mode').selectOption(mode);await page.locator('#custom-chord').selectOption(chord);await page.locator('[data-workspace-target=guitar-title]').click();await page.locator('#fretboard-fingering').selectOption('caged');
  const previews=page.locator('#position-overview [data-overview-position]'),order=await previews.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-overview-position')!));const starts=(await previews.locator('small').allTextContents()).map(s=>Number(s.match(/(\d+)–/)![1]));expect(starts).toEqual([...starts].sort((a,b)=>a-b));
  const menuOrder=await page.locator('#per-string-neck-shape option').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('value')).filter(v=>v!=='all'));expect(menuOrder).toEqual(order);
  await previews.first().click();for(let i=0;i<order.length;i++){await expect(page.locator('#position-overview [aria-selected=true]')).toHaveAttribute('data-overview-position',order[i]);await page.locator('#position-next').click();}await page.locator('#position-previous').click();await expect(page.locator('#position-overview [aria-selected=true]')).toHaveAttribute('data-overview-position',order.at(-1)!);
  await previews.first().click();await page.keyboard.press('ArrowRight');await expect(page.locator('#position-overview [aria-selected=true]')).toHaveAttribute('data-overview-position',order[1]);
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#position-overview').screenshot({path:'/workspace/caged-fret-order-mobile.png'});
});
