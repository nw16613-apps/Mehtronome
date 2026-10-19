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

test('small screen fits without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start practicing' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
