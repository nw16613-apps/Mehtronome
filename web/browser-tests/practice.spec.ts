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
  await expect(page.getByRole('button', { name: 'Chord progression' })).toBeDisabled();
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
  for (const voicing of ['shell', 'open', 'color', 'upper']) {
    await page.locator('#voicing').selectOption(voicing);
    await expect(page.locator('#voicing-notes')).toContainText('C3');
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
  await page.locator('#voicing').selectOption('custom');
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
});

test('minor mode families, piano voicings, rhythm options and persisted dark mode', async ({page}) => {
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
  await expect(page.locator('#voicing')).toHaveValue('open');
  await expect(page.locator('#chord')).toBeHidden();
  await expect(page.locator('#voicing-notes')).toHaveText('C3 · G3 · B3 · E4 · D5');
  await page.locator('#voicing').selectOption('shell');
  await expect(page.locator('#voicing-notes')).toHaveText('C3 · B3 · E4 · D5');
  await page.locator('#voicing').selectOption('upper');
  await expect(page.locator('#voicing-notes')).toHaveText('C3 · E4 · G4 · B4 · D5');
  await page.locator('#voicing').selectOption('color');
  await expect(page.locator('#chord-name')).toHaveText('Cmaj13');
  await page.locator('#key').selectOption('1');
  await expect(page.locator('#voicing-notes')).toContainText('B♯3');
  await page.locator('#key').selectOption('0');
  await page.locator('#voicing').selectOption('custom');
  await expect(page.locator('#chord')).toBeVisible();
  await page.locator('#chord').selectOption('major');
  await expect(page.locator('#voicing-notes')).toHaveText('C3 · E3 · G3');
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
