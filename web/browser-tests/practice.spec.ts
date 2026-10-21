import {SAMPLE_FILES} from '../src/audio/sample-manifest.js';
import {openReference} from './open-reference';
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
  await openReference(page);
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
  await openReference(page);
  await page.locator('#quality').selectOption('lydian');
  await expect(page.locator('#chord')).toHaveValue('maj7sharp11');
  await expect(page.locator('#note-list')).toContainText('F♯');
  await expect(page.locator('#chord-notes')).toContainText('F♯');
  await expect(page.getByRole('button', { name: 'Chord progression' })).toBeEnabled();
  await page.locator('#exercise').selectOption('arpeggio');
  await expect(page.locator('.note')).toHaveCount(5);
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
  await openReference(page);
  await expect(page.getByRole('button', { name: 'Start practicing' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', {name:'Chord progression'}).click();
  await page.locator('#chord').selectOption('halfDim11');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('minor mode families, simple chords, rhythm options and persisted dark mode', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openReference(page);
  await expect(page.locator('#quality option')).toHaveCount(21);
  await page.locator('#quality').selectOption('melodic_minor');
  await expect(page.locator('#chord')).toHaveValue('minMaj7');
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

test('melodic-minor A and G parent shapes place the flat third on the intended strings',async({page})=>{
  await page.goto('/');await page.locator('#key').selectOption('0');await page.locator('#quality').selectOption('melodic_minor');
  const position=(numeral:string)=>page.locator(`#guitar-diagrams [data-position="${numeral}"]`);
  await expect(position('IV').locator('.fret-note[data-string="1"][data-pc="3"]')).not.toHaveCount(0);
  await expect(position('IV').locator('.fret-note[data-string="2"][data-pc="3"]')).toHaveCount(0);
  await expect(position('V').locator('.fret-note[data-string="3"][data-pc="3"]')).not.toHaveCount(0);
});


test('parallel chord templates offer every chord type and both bar lengths', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openReference(page);
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
  await expect(page.locator('#note-list')).toHaveText('E♭1G3B♭5D7');
  await page.getByRole('button', {name:'Stop practicing'}).click();
  await page.locator('#template').selectOption('parallel1');
  await expect(page.locator('#chord-caption')).toHaveText('ONE BAR PER CHORD');
  await page.getByRole('button', {name:'Pedal chord'}).click();
  await expect(page.locator('#template')).toBeHidden();
  await expect(page.locator('#chord')).toHaveValue('min13');
  expect(errors).toEqual([]);
});

test('pulse dropdowns and checkboxes share columns at every layout size', async ({page}) => {
  await openReference(page);
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
  await openReference(page);
  await page.getByRole('button',{name:'Chord progression'}).click();
  await page.locator('#chord').selectOption('min9');
  await page.locator('#template').selectOption('oneFour2');
  await expect(page.locator('#progression-strip>button')).toHaveCount(2);
  await expect(page.locator('#progression-strip>button').nth(0)).toContainText('Cm9');
  await expect(page.locator('#progression-strip>button').nth(1)).toContainText('Fm9');
  await expect(page.locator('#chord-caption')).toHaveText('TWO BARS PER CHORD');
  await page.locator('#template').selectOption('major251');
  await expect(page.locator('#chord')).toBeHidden();
  await expect(page.locator('#quality')).toBeHidden();
  await expect(page.locator('#chord-name')).toHaveText('Dm7');
  await expect(page.locator('#exercise-description')).toContainText('D Dorian');
  await expect(page.locator('#progression-strip>button').nth(2)).toContainText('2 bars');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();
  await page.locator('#count-in').uncheck();
  await page.getByRole('button',{name:'Start practicing'}).click();
  await expect(page.locator('#chord-name')).toHaveText('G7alt',{timeout:5000});
  await expect(page.locator('#exercise-description')).toContainText('G Altered');
  await expect(page.locator('#chord-name')).toHaveText('Cmaj7♯11',{timeout:5000});
  await page.locator('#template').selectOption('oneFour1');
  await expect(page.locator('#progression-strip>button')).toHaveCount(2);
  await expect(page.locator('#error')).toBeHidden();
  await page.locator('#template').selectOption('minor251');
  await expect(page.locator('#progression-strip>button').nth(0)).toContainText('Dm7♭5');
  await expect(page.locator('#progression-strip>button').nth(1)).toContainText('G7♭9');
  await page.locator('#template').selectOption('turnaround');
  await expect(page.locator('#progression-strip>button').nth(3)).toContainText('A7');
  await page.locator('#template').selectOption('jazzBlues');
  await expect(page.locator('#progression-strip>button')).toHaveCount(12);
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
  await openReference(page);
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
  await expect(page.locator('#guitar-diagrams button[data-grip]')).toHaveCount(5);
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
  await expect(page.locator('[data-position=III] .position-anchor')).toContainText('A string, fret 15');
  await expect(page.locator('#guitar-parent')).toContainText('CAGED shapes: C major');
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
  await openReference(page);
  await page.getByRole('button',{name:'Chord progression'}).click();
  await page.locator('#template').selectOption('fourths2');
  await page.locator('#chord').selectOption('maj7');
  await expect(page.locator('#progression-strip>button')).toHaveCount(12);
  await expect(page.locator('#progression-strip>button').nth(6)).toContainText('G♭maj7');
  await expect(page.locator('#progression-strip>button').nth(7)).toContainText('Bmaj7');
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

test('stopped progression selection updates all diagrams, previews harmony only, and supports silent inspection', async ({page}) => {
  await page.addInitScript(() => {
    const Original = window.AudioWorkletNode;
    window.AudioWorkletNode = class extends Original {
      constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions) {
        super(context, name, options);
        const analysers = [context.createAnalyser(), context.createAnalyser()];
        analysers.forEach((a, i) => this.connect(a, i));
        (window as any).__previewAnalysers = analysers;
      }
    };
  });
  await openReference(page);
  await page.locator('#theme').click();
  await expect(page.locator('.fret-note.chord circle').first()).toHaveCSS('fill', 'rgb(101, 216, 207)');
  await expect(page.locator('.note.chord-tone').first()).toHaveCSS('border-top-color', 'rgb(101, 216, 207)');
  await page.locator('#progression').click();
  await page.locator('#template').selectOption('major251');
  await page.locator('#exercise').selectOption('arpeggio');
  await page.locator('#progression-strip>button').nth(1).hover();
  await page.mouse.down();
  await expect(page.locator('#chord-name')).toHaveText('G7alt');
  await expect(page.locator('#note-list small')).toHaveText(['1','3','♭5','♭7','♭9','♯9']);
  await expect(page.locator('#guitar-diagrams .position-card svg')).toHaveCount(5);
  for (const diagram of await page.locator('#guitar-diagrams .position-card svg').all()) await expect(diagram).toHaveAttribute('aria-label', /G7alt/);
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.beat.active')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const a = (window as any).__previewAnalysers?.[1] as AnalyserNode;
    if (!a) return 0;
    const samples = new Float32Array(a.fftSize); a.getFloatTimeDomainData(samples);
    return Math.max(...samples.map(Math.abs));
  })).toBeGreaterThan(.005);
  expect(await page.evaluate(() => {
    const a = (window as any).__previewAnalysers[0] as AnalyserNode;
    const samples = new Float32Array(a.fftSize); a.getFloatTimeDomainData(samples);
    return Math.max(...samples.map(Math.abs));
  })).toBe(0);
  await page.locator('#sound').selectOption('glass');
  await expect(page.locator('#chord-name')).toHaveText('G7alt');
  await page.waitForTimeout(4200); // A held chord must outlast the former four-second timeout.
  await expect(page.locator('#preview-status')).toBeVisible();
  await page.mouse.move(5,5); // Releasing outside the button must still stop it.
  await page.mouse.up();
  await expect(page.locator('#preview-status')).toBeHidden();
  await expect.poll(() => page.evaluate(() => {
    const a = (window as any).__previewAnalysers[1] as AnalyserNode;
    const samples = new Float32Array(a.fftSize); a.getFloatTimeDomainData(samples);
    return Math.max(...samples.map(Math.abs));
  })).toBeLessThan(.0001);
  await page.locator('#audition').uncheck();
  await page.locator('#progression-strip>button').nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#chord-name')).toHaveText('Cmaj7♯11');
  await expect(page.locator('#guitar-scale')).toContainText('Lydian');
  await expect(page.locator('#note-list small')).toHaveText(['1','3','5','7','♯11']);
  await expect(page.locator('#progression-strip>button').nth(2)).toBeFocused();
  await page.locator('#audition').check();
  await page.locator('#progression-strip>button').nth(0).focus();
  await page.keyboard.down('Space');
  await expect(page.locator('#preview-status')).toBeVisible();
  await page.keyboard.up('Space');
  await expect(page.locator('#preview-status')).toBeHidden();
  await page.keyboard.down('Enter');
  await expect(page.locator('#preview-status')).toBeVisible();
  await page.locator('#sound').focus();
  await expect(page.locator('#preview-status')).toBeHidden();
  await page.keyboard.up('Enter');
  await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Count-in');
  await expect(page.locator('#chord-name')).toHaveText('Dm7');
  await expect(page.locator('#progression-strip>button').first()).toBeDisabled();
  await page.locator('#play').click();
  await expect(page.locator('#progression-strip>button').nth(2)).toBeEnabled();
  await page.waitForTimeout(300);
  await page.locator('#audition').uncheck();
  await page.locator('#progression-strip>button').nth(2).click();
  await expect(page.locator('#chord-name')).toHaveText('Cmaj7♯11');
});

test('fretted diagrams and alternative themes work across reloads and mobile layouts', async ({page}) => {
  await openReference(page);
  await expect(page.locator('.fret-note[data-fret="0"]')).toHaveCount(0);
  await expect(page.locator('[data-position=III] .position-anchor')).toContainText('fret 15');
  for (const key of ['2','4','7']) {
    await page.locator('#key').selectOption(key);
    await expect(page.locator('.fret-note[data-fret="0"]')).toHaveCount(0);
  }
  const themes = [
    ['midnight','dark','rgb(12, 20, 37)','rgb(105, 214, 245)'],
    ['paper','light','rgb(244, 236, 223)','rgb(168, 70, 45)'],
    ['plum','dark','rgb(29, 20, 37)','rgb(209, 184, 255)'],
    ['slate','light','rgb(237, 241, 245)','rgb(35, 92, 181)'],
  ];
  for (const [theme, mode, background, chord] of themes) {
    await page.locator('#palette').selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-palette',theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme',mode);
    await expect(page.locator('html')).toHaveCSS('background-color',background);
    await expect(page.locator('.fret-note.chord circle').first()).toHaveCSS('fill',chord);
    await page.reload();
    await expect(page.locator('#palette')).toHaveValue(theme);
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('#palette')).toBeVisible();
    await page.setViewportSize({width:1280,height:900});
  }
  await page.goto('/?theme=midnight');
  await expect(page.locator('#palette')).toHaveValue('midnight');
  await page.locator('#palette').selectOption('paper');
  await expect(page).not.toHaveURL(/theme=/);
  await page.reload();
  await expect(page.locator('#palette')).toHaveValue('paper');
  await page.locator('#theme').click();
  await expect(page.locator('#palette')).toHaveValue('dark');
});

test('theme gallery loads four real previews and links to the matching live themes', async ({page}) => {
  await page.goto('/themes.html');
  await expect(page.locator('.card')).toHaveCount(4);
  for (const theme of ['midnight','paper','plum','slate']) {
    await expect(page.locator(`a.picture[href="./?theme=${theme}"]`)).toBeVisible();
  }
  await expect.poll(() => page.locator('.card img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth === 1280))).toBe(true);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link',{name:'Try Warm Paper'}).click();
  await expect(page.locator('#palette')).toHaveValue('paper');
});

test('touch release and cancellation stop held previews', async ({page}) => {
  await openReference(page);
  await page.locator('#progression').click();
  const session = await page.context().newCDPSession(page);
  await page.locator('#progression-strip>button').nth(1).scrollIntoViewIfNeeded();
  const box = await page.locator('#progression-strip>button').nth(1).boundingBox();
  const point = {x: box!.x + box!.width / 2, y: box!.y + box!.height / 2};
  for (const ending of ['touchEnd', 'touchCancel']) {
    await session.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[point]});
    await expect(page.locator('#preview-status')).toBeVisible();
    await session.send('Input.dispatchTouchEvent', {type:ending, touchPoints:[]});
    await expect(page.locator('#preview-status')).toBeHidden();
    await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
  }
});

test('releasing before audio finishes loading never starts a late preview', async ({page}) => {
  await page.addInitScript(() => {
    (window as any).__audioMessages = [];
    const OriginalContext = window.AudioContext;
    window.AudioContext = class extends OriginalContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        const addModule = this.audioWorklet.addModule.bind(this.audioWorklet);
        this.audioWorklet.addModule = async (...args) => {
          await new Promise<void>(resolve => { (window as any).__releaseModule = resolve; });
          return addModule(...args);
        };
      }
    };
    const Original = window.AudioWorkletNode;
    window.AudioWorkletNode = class extends Original {
      constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions) {
        super(context,name,options);
        const originalPost = this.port.postMessage.bind(this.port);
        this.port.postMessage = (data: any) => { (window as any).__audioMessages.push(data.type); originalPost(data); };
      }
    };
  });
  await openReference(page);
  await page.locator('#progression').click();
  await page.locator('#progression-strip>button').nth(1).hover();
  await page.mouse.down();
  await expect.poll(() => page.evaluate(() => typeof (window as any).__releaseModule)).toBe('function');
  await page.mouse.up();
  await page.evaluate(() => (window as any).__releaseModule());
  await expect.poll(() => page.evaluate(() => (window as any).__audioMessages.includes('stop'))).toBe(true);
  expect(await page.evaluate(() => (window as any).__audioMessages.includes('audition'))).toBe(false);
  await expect(page.locator('#preview-status')).toBeHidden();
  await expect(page.locator('#chord-name')).toContainText('E♭');
  await page.locator('#progression-strip>button').nth(2).hover();
  await page.mouse.down();
  await expect(page.locator('#preview-status')).toBeVisible();
  await page.mouse.up();
  await expect(page.locator('#preview-status')).toBeHidden();
});

test.skip('drop chord grips show real four-note fingerings and follow stopped and playing harmony',async({page})=>{
  await openReference(page);
  await expect(page.locator('.guitar .section-heading .small-label')).toHaveText('STANDARD TUNING · E A D G B E');
  await expect(page.locator('#voicings-chord')).toHaveText('Cmaj9');
  await expect(page.locator('#voicings-tones')).toContainText('Omitted: G');
  await expect(page.locator('#voicing-diagrams .voicing-card')).toHaveCount(4);
  for(const svg of await page.locator('#voicing-diagrams svg').all()){
    await expect(svg.locator('.fret-note')).toHaveCount(4);
    await expect(svg.locator('.muted-string')).toHaveCount(2);
    await expect(svg.locator('[data-fret="0"]')).toHaveCount(0);
  }
  await page.locator('#voicing-type').selectOption('drop3');
  await expect(page.locator('#voicing-diagrams svg').first()).toHaveAttribute('aria-label',/drop 3/);
  await page.locator('#voicing-labels').selectOption('intervals');
  await expect(page.locator('#voicing-diagrams .fret-note text')).toContainText(['9']);
  await page.locator('#progression').click();
  await page.locator('#template').selectOption('major251');
  await page.locator('#audition').uncheck();
  await page.locator('#progression-strip>button').nth(1).click();
  await expect(page.locator('#voicings-chord')).toHaveText('G7alt');
  await expect(page.locator('#voicings-tones')).toContainText('D♭ (♭5)');
  for(const svg of await page.locator('#voicing-diagrams svg').all())await expect(svg).toHaveAttribute('aria-label',/G7alt, drop 3/);
  await page.locator('#count-in').uncheck();
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();
  await page.locator('#play').click();
  await expect(page.locator('#voicings-chord')).toHaveText('Cmaj7♯11',{timeout:6000});
  await page.locator('#play').click();
  await page.locator('#pedal').click();
  await page.locator('#chord').selectOption('major');
  await expect(page.locator('#voicings-description')).toContainText('Triads use four voices');
  await page.locator('#quality').selectOption('major');
  await page.locator('#chord').selectOption('fifth');
  await expect(page.locator('#voicings-description')).toContainText('spread root/fifth chords');
  await page.locator('#palette').selectOption('midnight');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('#guitar-diagrams svg')).toHaveCount(5);
});

test.skip('string-set dropdown shows all four inversions on exactly the chosen strings',async({page})=>{
  await openReference(page);
  await page.locator('#chord').selectOption('maj7');
  for(const [type,sets] of [['drop2',['6543','5432','4321']],['drop3',['6432','5321']],['drop24',['6532','5421']],['drop4',['6321']]] as const){
    await page.locator('#voicing-type').selectOption(type);
    await expect(page.locator('#voicing-strings option')).toHaveCount(sets.length);
    for(const set of sets){
      await page.locator('#voicing-strings').selectOption(set);
      await expect(page.locator('#voicing-diagrams .voicing-card')).toHaveCount(4);
      const headings=await page.locator('#voicing-diagrams h4').allTextContents();
      expect(headings).toEqual(['Root position · C bass','1st inversion · E bass','2nd inversion · G bass','3rd inversion · B bass']);
      const strings=await page.locator('#voicing-diagrams svg').evaluateAll(svgs=>svgs.map(svg=>Array.from(svg.querySelectorAll('.fret-note')).map(note=>6-Number(note.getAttribute('data-string'))).join('')));
      expect(strings).toEqual([set,set,set,set]);
    }
  }
  await page.locator('#voicing-type').selectOption('drop3');
  await page.locator('#voicing-strings').selectOption('5321');
  await page.locator('#key').selectOption('6');
  await expect(page.locator('#voicing-strings')).toHaveValue('5321');
  await expect(page.locator('#voicing-diagrams h4').first()).toHaveText('Root position · F♯ bass');
  await page.locator('#progression').click();
  await page.locator('#template').selectOption('major251');
  await page.locator('#audition').uncheck();
  await page.locator('#progression-strip>button').nth(1).click();
  await expect(page.locator('#voicing-strings')).toHaveValue('5321');
  await expect(page.locator('#voicing-diagrams .voicing-card')).toHaveCount(4);
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#voicing-strings')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('evolving sounds produce stereo audio and the optional sequencer works independently of the pad',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);
        const splitter=context.createChannelSplitter(2);this.connect(splitter,1);
        const analysers=[context.createAnalyser(),context.createAnalyser()];
        analysers.forEach((a,i)=>splitter.connect(a,i));
        (window as any).__stereo=analysers;
      }
    };
  });
  await openReference(page);
  await expect(page.locator('#sound')).toHaveValue('bloom');
  await expect(page.locator('#sequence')).not.toBeChecked();
  await expect(page.locator('#sequence-controls')).toBeHidden();
  await page.locator('#count-in').uncheck();
  await page.locator('#click').fill('0');
  await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  for(const sound of ['bloom','strings','atmosphere']){
    await page.locator('#sound').selectOption(sound);
    await expect.poll(()=>page.evaluate(()=>{
      const analysers=(window as any).__stereo as AnalyserNode[] | undefined;
      if(!analysers) return 0;
      const [a,b]=analysers;
      const left=new Float32Array(a.fftSize),right=new Float32Array(b.fftSize);
      a.getFloatTimeDomainData(left);b.getFloatTimeDomainData(right);
      return Math.max(...left.map((v,i)=>Math.abs(v-right[i])));
    })).toBeGreaterThan(.001);
  }
  await page.locator('#harmony').fill('0');
  await page.locator('#sequence').check();
  await expect(page.locator('#sequence-controls')).toBeVisible();
  await page.locator('#sequence-pattern').selectOption('pulse');
  await page.locator('#sequence-density').fill('100');
  await page.locator('#sequence-volume').fill('80');
  await expect.poll(()=>page.evaluate(()=>{
    const a=(window as any).__stereo[0] as AnalyserNode;
    const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);
    return Math.max(...data.map(Math.abs));
  })).toBeGreaterThan(.01);
  await page.locator('#sequence-rate').selectOption('3');
  await expect(page.locator('#sequence-swing')).toBeDisabled();
  await page.locator('#sequence-rate').selectOption('4');
  await expect(page.locator('#sequence-swing')).toBeEnabled();
  await page.locator('#sequence-swing').fill('40');
  await page.locator('#progression').click();
  await page.locator('#template').selectOption('major251');
  await page.locator('#sequence-pattern').selectOption('updown');
  await page.locator('#play').click();
  await page.waitForTimeout(300);
  await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  await page.locator('#play').click();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('drums and bass have independent controls and reach the speakers through their dry bus',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);
        const dry=context.createAnalyser(),pad=context.createAnalyser();
        this.connect(dry,2);this.connect(pad,1);
        (window as any).__bandAudio={dry,pad};
        const originalGain=context.createGain.bind(context);let count=0;
        context.createGain=()=>{
          const gain=originalGain();
          if(count++===0){const master=context.createAnalyser();gain.connect(master);(window as any).__bandAudio.master=master;}
          return gain;
        };
      }
    };
  });
  await openReference(page);
  await expect(page.locator('#drums')).not.toBeChecked();await expect(page.locator('#bass')).not.toBeChecked();
  await expect(page.locator('#drums-controls')).toBeHidden();await expect(page.locator('#bass-controls')).toBeHidden();
  await page.locator('#click').fill('0');await page.locator('#harmony').fill('0');await page.locator('#count-in').uncheck();
  await expect(page.locator('#drum-groove option')).toHaveCount(5);
  await expect(page.locator('#bass-pattern option')).toHaveCount(5);
  const sampleResponses:string[]=[];
  page.on('response',response=>{if(response.url().endsWith('.wav')&&response.ok())sampleResponses.push(response.url());});
  await page.locator('#drums').check();await expect(page.locator('#drums-controls')).toBeVisible();
  await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Playing');
  const peak=(bus:string)=>page.evaluate(bus=>{
    const analyser=(window as any).__bandAudio[bus] as AnalyserNode;
    const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);
    return Math.max(...samples.map(Math.abs));
  },bus);
  await expect.poll(()=>peak('master')).toBeGreaterThan(.005);
  await expect.poll(()=>peak('dry')).toBeGreaterThan(.005);
  expect(await peak('pad')).toBe(0);
  expect(new Set(sampleResponses).size).toBe(Object.keys(SAMPLE_FILES).length);
  await page.locator('#drums-volume').fill('0');await expect.poll(()=>peak('master')).toBeLessThan(.0001);
  await page.locator('#bass').check();await expect(page.locator('#bass-controls')).toBeVisible();
  await page.locator('#bass-volume').fill('70');
  await expect.poll(()=>peak('master')).toBeGreaterThan(.005);
  for(const pattern of ['fifths','walk','bossa','funk','roots'])await page.locator('#bass-pattern').selectOption(pattern);
  await page.locator('#drums-volume').fill('40');
  for(const groove of ['shuffle','swing','halftime','bossa','straight'])await page.locator('#drum-groove').selectOption(groove);
  await page.locator('#progression').click();await page.locator('#template').selectOption('major251');
  await page.locator('#play').click();await page.waitForTimeout(300);
  await page.locator('#progression-strip>button').nth(1).hover();await page.mouse.down();
  await expect(page.locator('#preview-status')).toBeVisible();
  await expect.poll(()=>peak('dry')).toBeLessThan(.0001);
  await page.mouse.up();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
