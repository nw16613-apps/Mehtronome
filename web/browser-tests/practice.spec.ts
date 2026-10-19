import { test, expect } from '@playwright/test';

test('real worklet generates audio, controls respond, and playback restarts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const Original = window.AudioWorkletNode;
    window.AudioWorkletNode = class extends Original {
      constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions) {
        super(context, name, options);
        const analyser = context.createAnalyser();
        this.connect(analyser);
        this.connect(analyser, 1);
        (window as any).__analyser = analyser;
      }
    };
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The pulse' })).toBeVisible();
  await page.locator('#count-in').uncheck();
  await page.getByRole('button', { name: 'Start practicing' }).click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  await expect.poll(() => page.evaluate(() => {
    const analyser = (window as any).__analyser as AnalyserNode;
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    return Math.max(...buffer.map(Math.abs));
  })).toBeGreaterThan(.01);
  await page.locator('#key').selectOption('5');
  await expect(page.locator('#note-list')).toContainText('B♭');
  await page.locator('#quality').selectOption('minor');
  await page.getByRole('button', { name: 'Chord progression' }).click();
  await expect(page.locator('#progression-strip')).toBeVisible();
  await page.locator('#template').selectOption('diatonic');
  await page.locator('#exercise').selectOption('arpeggio');
  await expect(page.locator('.note')).toHaveCount(3);
  await page.locator('#bpm').fill('240');
  await page.locator('#bpm').blur();
  await expect(page.locator('#tempo')).toHaveValue('240');
  await expect(page.locator('#progression-strip .current')).toContainText('D♭', { timeout: 8000 });
  await page.getByRole('button', { name: 'Stop practicing' }).click();
  await expect(page.locator('#beats')).toBeEnabled();
  await page.waitForTimeout(350);
  await page.locator('#count-in').check();
  await page.getByRole('button', { name: 'Start practicing' }).click();
  await expect(page.locator('#play-status')).toContainText('Count-in');
  await page.getByRole('button', { name: 'Stop practicing' }).click();
  expect(errors).toEqual([]);
});

test('ambient sounds and modal chord palette work during playback', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const Original = window.AudioWorkletNode;
    window.AudioWorkletNode = class extends Original {
      constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions) {
        super(context, name, options);
        const analyser = context.createAnalyser();
        this.connect(analyser, 1);
        (window as any).__analyser = analyser;
      }
    };
  });
  await page.goto('/');
  await page.locator('#quality').selectOption('lydian');
  await expect(page.locator('#chord')).toHaveValue('maj9sharp11');
  await expect(page.locator('#note-list')).toContainText('F♯');
  await expect(page.locator('#chord-notes')).toContainText('F♯');
  await expect(page.getByRole('button', { name: 'Chord progression' })).toBeEnabled();
  await page.locator('#exercise').selectOption('arpeggio');
  await expect(page.locator('.note')).toHaveCount(6);
  await page.locator('#count-in').uncheck();
  await page.getByRole('button', { name: 'Start practicing' }).click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  for (const sound of ['glass', 'velvet', 'air', 'warm']) {
    await page.locator('#sound').selectOption(sound);
    await page.waitForTimeout(150);
    await expect.poll(() => page.evaluate(() => {
      const analyser = (window as any).__analyser as AnalyserNode;
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      return Math.max(...samples.map(Math.abs));
    })).toBeGreaterThan(.005);
    await expect(page.locator('#error')).toBeHidden();
  }
  await page.locator('#quality').selectOption('dorian');
  await expect(page.locator('#chord')).toHaveValue('min13');
  await expect(page.locator('#chord-notes')).toContainText('A');
  await page.locator('#chord').selectOption('min6');
  await expect(page.locator('#chord-name')).toHaveText('Cm6');
  await page.locator('#quality').selectOption('locrian');
  await expect(page.locator('#chord')).toHaveValue('halfDim');
  await expect(page.locator('#chord-notes')).toHaveText('C · E♭ · G♭ · B♭');
  await expect(page.locator('#chord option[value="major"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Stop practicing' }).click();
  await page.waitForTimeout(350);
  await page.getByRole('button', { name: 'Start practicing' }).click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  await page.getByRole('button', { name: 'Stop practicing' }).click();
  expect(errors).toEqual([]);
});

test('small screen fits without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start practicing' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', {name:'Chord progression'}).click();
  await page.locator('#chord').selectOption('halfDim11');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('minor mode families, simple chords, rhythm options and persisted dark mode', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#quality option')).toHaveCount(21);
  await page.locator('#quality').selectOption('melodic_minor');
  await expect(page.locator('#chord')).toHaveValue('minMaj9');
  await expect(page.locator('#note-list')).toContainText('B');
  await page.locator('#quality').selectOption('phrygian_dominant');
  await expect(page.locator('#chord')).toHaveValue('dom7b9');
  await expect(page.locator('#note-list')).toContainText('D♭');
  await page.locator('#quality').selectOption('major');
  await expect(page.locator('#voicing')).toHaveCount(0);
  await expect(page.locator('#chord')).toBeVisible();
  await page.locator('#chord').selectOption('major');
  await expect(page.locator('#chord-notes')).toHaveText('C · E · G');
  await expect(page.locator('#space')).toHaveValue('75');
  await expect(page.locator('#space-value')).toHaveText('75%');
  await page.locator('#subdivision').selectOption('6');
  await page.locator('#accent').uncheck();
  await expect(page.locator('.beat.downbeat')).toHaveCount(0);
  await page.locator('#count-in').uncheck();
  await page.getByRole('button', {name:'Start practicing'}).click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  await page.locator('#subdivision').selectOption('3');
  await page.locator('#accent').check();
  await page.getByRole('button', {name:'Stop practicing'}).click();
  await page.locator('#theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(16, 26, 27)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  expect(errors).toEqual([]);
});


test('parallel chord templates offer every chord type and both bar lengths', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#quality').selectOption('dorian');
  await page.getByRole('button', {name: 'Chord progression'}).click();
  await expect(page.locator('#chord option')).toHaveCount(33);
  await page.locator('#chord').selectOption('maj7');
  await expect(page.locator('#progression-strip')).toHaveText('Cmaj7IE♭maj7♭IIIG♭maj7♭VAmaj7VI');
  await expect(page.locator('#chord-name')).toHaveText('Cmaj7');
  await page.locator('#template').selectOption('parallel2');
  await expect(page.locator('#chord-caption')).toHaveText('TWO BARS PER CHORD');
  await page.locator('#bpm').fill('240');
  await page.locator('#bpm').blur();
  await page.locator('#beats').selectOption('3');
  await page.locator('#count-in').uncheck();
  await page.getByRole('button', {name: 'Start practicing'}).click();
  await expect(page.locator('#play-status')).toContainText('Bar 2');
  await expect(page.locator('#chord-name')).toHaveText('Cmaj7');
  await expect(page.locator('#play-status')).toContainText('Bar 3', {timeout:5000});
  await expect(page.locator('#chord-name')).toHaveText('E♭maj7');
  await expect(page.locator('#progression-strip .current')).toContainText('E♭maj7');
  await expect(page.locator('#note-list')).toContainText('E♭');
  await page.locator('#exercise').selectOption('arpeggio');
  await expect(page.locator('#note-list')).toHaveText('E♭chord toneGchord toneB♭chord toneDchord tone');
  await page.getByRole('button', {name:'Stop practicing'}).click();
  await page.locator('#template').selectOption('parallel1');
  await expect(page.locator('#chord-caption')).toHaveText('ONE BAR PER CHORD');
  await page.getByRole('button', {name:'Pedal chord'}).click();
  await expect(page.locator('#template')).toBeHidden();
  await expect(page.locator('#chord')).toHaveValue('min13');
  expect(errors).toEqual([]);
});

test('pulse dropdowns and checkboxes share columns at every layout size', async ({page}) => {
  await page.goto('/');
  for(const width of [1440,1000,760,640,390]) {
    await page.setViewportSize({width,height:1000});
    const beats=await page.locator('#beats').boundingBox();
    const subdivision=await page.locator('#subdivision').boundingBox();
    const count=await page.locator('#count-in').boundingBox();
    const accent=await page.locator('#accent').boundingBox();
    expect(Math.abs(beats!.x-subdivision!.x)).toBeLessThan(1);
    expect(Math.abs(beats!.width-subdivision!.width)).toBeLessThan(1);
    expect(Math.abs(count!.x-accent!.x)).toBeLessThan(1);
    expect(Math.abs((beats!.y+beats!.height/2)-(count!.y+count!.height/2))).toBeLessThan(1);
    expect(Math.abs((subdivision!.y+subdivision!.height/2)-(accent!.y+accent!.height/2))).toBeLessThan(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('I–IV and jazz presets display their complete changes and scale guides during playback', async ({page}) => {
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Chord progression'}).click();
  await page.locator('#chord').selectOption('min9');
  await page.locator('#template').selectOption('oneFour2');
  await expect(page.locator('#progression-strip>span')).toHaveCount(2);
  await expect(page.locator('#progression-strip>span').nth(0)).toContainText('Cm9');
  await expect(page.locator('#progression-strip>span').nth(1)).toContainText('Fm9');
  await expect(page.locator('#chord-caption')).toHaveText('TWO BARS PER CHORD');
  await page.locator('#template').selectOption('major251');
  await expect(page.locator('#chord')).toBeHidden();
  await expect(page.locator('#quality')).toBeHidden();
  await expect(page.locator('#chord-name')).toHaveText('Dm7');
  await expect(page.locator('#exercise-description')).toContainText('D Dorian');
  await expect(page.locator('#progression-strip>span').nth(2)).toContainText('2 bars');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();
  await page.locator('#count-in').uncheck();
  await page.getByRole('button',{name:'Start practicing'}).click();
  await expect(page.locator('#chord-name')).toHaveText('G7',{timeout:5000});
  await expect(page.locator('#exercise-description')).toContainText('G Mixolydian');
  await expect(page.locator('#chord-name')).toHaveText('Cmaj7',{timeout:5000});
  await page.locator('#template').selectOption('oneFour1');
  await expect(page.locator('#progression-strip>span')).toHaveCount(2);
  await expect(page.locator('#error')).toBeHidden();
  await page.locator('#template').selectOption('minor251');
  await expect(page.locator('#progression-strip>span').nth(0)).toContainText('Dm7♭5');
  await expect(page.locator('#progression-strip>span').nth(1)).toContainText('G7♭9');
  await page.locator('#template').selectOption('turnaround');
  await expect(page.locator('#progression-strip>span').nth(3)).toContainText('A7');
  await page.locator('#template').selectOption('jazzBlues');
  await expect(page.locator('#progression-strip>span')).toHaveCount(12);
  await page.getByRole('button',{name:'Stop practicing'}).click();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Pedal chord'}).click();
  await expect(page.locator('#quality')).toBeVisible();
  await expect(page.locator('#chord')).toBeVisible();
  expect(errors).toEqual([]);
});

test('CAGED positions, labels and chord-only view track the selected mode and chord',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Guitar reference'})).toBeVisible();
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveCount(5);
  await expect(page.locator('#guitar-diagrams svg')).toHaveCount(5);
  await expect(page.locator('#guitar-diagrams h4')).toHaveText(['Position I','Position II','Position III','Position IV','Position V']);
  await expect(page.locator('[data-position=I] svg')).toHaveAttribute('aria-label',/Cmaj9, position I/);
  await page.locator('#quality').selectOption('dorian');
  await expect(page.locator('#guitar-context')).toHaveText('Cm13');
  await expect(page.locator('#guitar-scale')).toContainText('C Dorian');
  for(const position of ['I','II','III','IV','V']) {
    await expect(page.locator(`[data-position=${position}] svg`)).toBeVisible();
    await expect(page.locator(`[data-position=${position}] svg`)).toHaveAttribute('aria-label',new RegExp(`Cm13, position ${position},`));
  }
  await expect(page.locator('#guitar-diagrams button')).toHaveCount(0);
  await page.locator('#fret-labels').selectOption('degrees');
  await expect(page.locator('#guitar-diagrams .fret-note text')).toContainText(['♭3']);
  await page.locator('#fret-view').selectOption('arpeggio');
  await expect(page.locator('#exercise')).toHaveValue('arpeggio');
  await expect(page.locator('#guitar-diagrams .fret-note.scale')).toHaveCount(0);
  await expect(page.locator('#guitar-diagrams .fret-note.root')).not.toHaveCount(0);
  await page.locator('#exercise').selectOption('scale');
  await expect(page.locator('#fret-view')).toHaveValue('scale');
  await page.locator('#key').selectOption('2');
  await expect(page.locator('#guitar-context')).toHaveText('Dm13');
  await expect(page.locator('[data-position=III] .position-anchor')).toContainText('A string, fret 5');
  for(const position of ['I','II','III','IV','V']) await expect(page.locator(`[data-position=${position}] svg`)).toHaveAttribute('aria-label',new RegExp(`Dm13, position ${position},`));
  await page.locator('#theme').click();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const position of ['I','II','III','IV','V']) {
    const svg = page.locator(`[data-position=${position}] svg`);
    await expect(svg).toBeVisible();
    const box = await svg.boundingBox();
    expect(box!.width).toBeGreaterThan(box!.height);
  }
  expect(errors).toEqual([]);
});

test('fourths progression and guitar diagrams update together in live playback, including jazz guides',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Chord progression'}).click();
  await page.locator('#template').selectOption('fourths2');
  await page.locator('#chord').selectOption('maj7');
  await expect(page.locator('#progression-strip>span')).toHaveCount(12);
  await expect(page.locator('#progression-strip>span').nth(6)).toContainText('G♭maj7');
  await expect(page.locator('#progression-strip>span').nth(7)).toContainText('Bmaj7');
  await page.locator('#template').selectOption('fourths1');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();
  await page.locator('#count-in').uncheck();
  await page.getByRole('button',{name:'Start practicing'}).click();
  await expect(page.locator('#chord-name')).toHaveText('Fmaj7',{timeout:5000});
  await expect(page.locator('#guitar-context')).toHaveText('Fmaj7');
  await expect(page.locator('#guitar-scale')).toContainText('F Ionian');
  await expect(page.locator('[data-position=III] .position-heading')).toContainText('Frets 5–9');
  for(const position of ['I','II','III','IV','V']) await expect(page.locator(`[data-position=${position}] svg`)).toHaveAttribute('aria-label',new RegExp(`Fmaj7, position ${position},`));
  await page.getByRole('button',{name:'Stop practicing'}).click();
  await page.locator('#template').selectOption('major251');
  await expect(page.locator('#guitar-context')).toHaveText('Dm7');
  await expect(page.locator('#guitar-scale')).toContainText('D Dorian');
  expect(errors).toEqual([]);
});
