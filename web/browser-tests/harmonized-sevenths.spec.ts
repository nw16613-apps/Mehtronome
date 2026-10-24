import {expect,test} from '@playwright/test';

test('Harmony displays C Lydian augmented seventh chords and responds to root and mode changes',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await page.locator('[data-workspace-target="harmony-title"]').click();
  await page.locator('#key').selectOption('0');await page.locator('#quality').selectOption('lydian_augmented');
  const chords=page.locator('#note-list .mode-seventh');
  await expect(chords).toHaveCount(7);
  await expect(chords.locator('h4')).toHaveText(['Cmaj7♯5','D7','E7','F♯m7♭5','G♯m7♭5','Am(maj7)','Bm7']);
  await expect(chords.first().locator('.chord-tone-note')).toHaveText(['C','E','G♯','B']);
  await expect(chords.locator('.scale-note strong')).toHaveText(['C','D','E','F♯','G♯','A','B']);
  await expect(chords.locator('.scale-note.characteristic strong')).toHaveText(['F♯','G♯']);
  await expect(chords.locator('.scale-note.chord-tone strong')).toHaveText(['C','D','E','G♯','B']);
  await page.locator('#highlight-mode').uncheck();await expect(chords.locator('.characteristic')).toHaveCount(0);await page.locator('#highlight-mode').check();
  await page.locator('#exercise').selectOption('arpeggio');
  await expect(chords.locator('.scale-note.chord-tone strong')).toHaveText(['C','D','E','G♯','B']);
  await expect(chords.locator('.scale-note.characteristic strong')).toHaveText(['G♯']);
  await expect(page.locator('.outside-arpeggio')).toHaveCount(2);
  await page.locator('#exercise').selectOption('scale');await expect(page.locator('.outside-arpeggio')).toHaveCount(0);
  await expect(page.locator('#seventh-chords-context')).toHaveText('C Lydian augmented');
  await expect(page.locator('#chord')).toHaveValue('augMaj9');
  await page.locator('#key').selectOption('2');await expect(chords.first().locator('h4')).toHaveText('Dmaj7♯5');
  await page.locator('#key').selectOption('0');await page.locator('#quality').selectOption('major');
  await expect(chords.locator('h4')).toHaveText(['Cmaj7','Dm7','Em7','Fmaj7','G7','Am7','Bm7♭5']);
  await page.locator('#exercise').selectOption('arpeggio');await expect(chords).toHaveCount(7);
  await expect(chords.first().locator('h4')).toHaveText('Cmaj7');expect(errors).toEqual([]);
});

for(const width of [1440,900,390])test(`seventh chord graphics fit at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.goto('/');
  await page.locator('[data-workspace-target="harmony-title"]').click();
  await page.locator('#key').selectOption('8');await page.locator('#quality').selectOption('locrian');
  await expect(page.locator('#note-list .mode-seventh').first().locator('.chord-tone-note')).toHaveText(['A♭','C♭','E♭♭','G♭']);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
  const overlap=await page.locator('.mode-seventh').evaluateAll(elements=>{
    const boxes=elements.map(element=>element.getBoundingClientRect());
    return boxes.some((a,i)=>boxes.slice(i+1).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top));
  });
  expect(overlap).toBe(false);
  const tiers=await page.locator('.degree-stack').evaluateAll(elements=>elements.every(element=>{
    const note=element.querySelector('.scale-note')!.getBoundingClientRect();
    const chord=element.querySelector('h4')!.getBoundingClientRect();
    const tones=element.querySelector('.seventh-tones')!.getBoundingClientRect();
    return note.bottom<=chord.top&&chord.bottom<=tones.top;
  }));
  expect(tiers).toBe(true);
});

test('chord-scale graphics follow a playing progression while keeping seven chords visible',async({page})=>{
  await page.goto('/');await page.locator('#bpm').fill('240');await page.locator('#bpm').dispatchEvent('change');
  await page.locator('[data-workspace-target="harmony-title"]').click();await page.locator('#key').selectOption('0');
  await page.locator('#progression').click();await page.locator('#template').selectOption('major251');
  await expect(page.locator('#seventh-chords-context')).toHaveText('D Dorian');
  await page.locator('#mini-play').click();
  await expect(page.locator('#seventh-chords-context')).toHaveText('G Altered (super Locrian)',{timeout:8000});
  await expect(page.locator('.mode-seventh')).toHaveCount(7);await expect(page.locator('.mode-seventh.current-root')).toHaveCount(1);
  await page.locator('#mini-play').click();
});
