import {test,expect} from '@playwright/test';
import {MODES,CHORDS,compatibleChords} from '../src/audio/music.js';

test('fresh sessions start in A Dorian with degree labels and no count-in',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#key')).toHaveValue('9');
  await expect(page.locator('#quality')).toHaveValue('dorian');
  await expect(page.locator('#chord')).toHaveValue('min13');
  await expect(page.locator('#chord-name')).toHaveText('Am13');
  await expect(page.locator('#count-in')).not.toBeChecked();
  await expect(page.locator('#fret-labels')).toHaveValue('degrees');
  await expect(page.locator('#voicing-labels')).toHaveValue('intervals');
  await expect(page.locator('.fret-note.root text').first()).toHaveText('1');
  for(const [id,mode] of Object.entries(MODES)){
    await page.locator('#quality').selectOption(id);
    await expect(page.locator('#chord')).toHaveValue(mode.chord);
    const intervals=CHORDS[mode.chord as keyof typeof CHORDS].intervals;
    expect(intervals.some(n=>[9,10,11].includes(n))).toBe(true);
    expect(compatibleChords(id)).toContain(mode.chord);
  }
  await page.reload();await expect(page.locator('#quality')).toHaveValue('dorian');
  await expect(page.locator('#count-in')).not.toBeChecked();
  await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Playing',{timeout:1000});
  await page.locator('#play').click();
});
