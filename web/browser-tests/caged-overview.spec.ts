import {expect,test} from '@playwright/test';
import {openReference} from './open-reference';

test('five-position overview selects one full-size CAGED diagram',async({page})=>{
  await openReference(page);
  const overview=page.locator('#position-overview');
  await expect(overview.locator('.position-thumbnail')).toHaveCount(5);
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveCount(1);
  await expect(overview.locator('[aria-selected="true"]')).toHaveAttribute('data-overview-position','I');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','I');

  await overview.locator('[data-overview-position="III"]').click();
  await expect(overview.locator('[aria-selected="true"]')).toHaveAttribute('data-overview-position','III');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','III');
  await expect(page.locator('#position-indicator')).toContainText('Position III of V');

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','IV');
  await page.locator('#position-previous').click();
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','III');
});

test('focused CAGED position generates a configurable notation and TAB library',async({page})=>{
  await page.goto('/');
  const exercise=page.locator('#caged-exercise');
  await expect(exercise.locator('.exercise-notation')).toBeVisible();
  await expect(exercise.locator('.treble-clef')).toHaveCount(1);
  await expect(exercise.locator('.tab-clef')).toHaveCount(1);
  await expect(exercise.locator('.chord-symbol').first()).toHaveText('Am7');
  await expect(exercise.locator('.chord-symbol')).toHaveCount(8);
  const ascending=await exercise.locator('.tab-fret').allTextContents();
  await exercise.locator('#exercise-motion').selectOption('descending');
  const descending=await exercise.locator('.tab-fret').allTextContents();
  expect(descending).not.toEqual(ascending);
  await exercise.locator('#exercise-study').selectOption('cells');
  await expect(exercise.locator('h3')).toContainText('1–2–3–5 cells');
  await expect(exercise.locator('#exercise-material')).toBeDisabled();
  await page.locator('[data-overview-position="III"]').click();
  await expect(exercise.locator('h3')).toContainText('Position III');
  await expect(exercise.locator('#exercise-study')).toHaveValue('cells');
  await exercise.locator('#exercise-preview').click();
  await expect(exercise.locator('#exercise-preview')).toHaveAttribute('aria-pressed','true');
  await exercise.locator('#exercise-preview').click();
  await expect(exercise.locator('#exercise-preview')).toHaveAttribute('aria-pressed','false');
});

test('manual navigation and progression route drive the detailed diagram',async({page})=>{
  await openReference(page);
  await expect(page.locator('#featured-position')).toHaveValue('all');
  await expect(page.locator('#featured-position option')).toHaveText(['Manual selection','Follow nearest positions']);
  await page.locator('[data-overview-position="V"]').click();
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position','V');
  await expect(page.locator('#position-overview [aria-selected="true"]')).toHaveAttribute('data-overview-position','V');

  await page.locator('#progression').click();
  await page.locator('#featured-position').selectOption('path');
  const recommended=await page.locator('#position-path>button').first().getAttribute('data-position');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveAttribute('data-position',recommended!);
  await expect(page.locator('#position-previous')).toBeDisabled();
  await expect(page.locator('#position-next')).toBeDisabled();
});

test('focus bar changes the root, chord and progression',async({page})=>{
  await openReference(page);
  await page.locator('#focus-view').click();
  await expect(page.locator('#mini-transport')).toBeVisible();

  await page.locator('#mini-key').selectOption('0');
  await expect(page.locator('#key')).toHaveValue('0');
  await expect(page.locator('#guitar-context')).toContainText('C');

  await page.locator('#mini-mode-select').selectOption('mixolydian');
  await expect(page.locator('#quality')).toHaveValue('mixolydian');
  await expect(page.locator('#mini-chord-select')).toHaveValue('dom7');

  await page.locator('#mini-chord-select').selectOption('dom9');
  await expect(page.locator('#chord')).toHaveValue('dom9');
  await expect(page.locator('#guitar-context')).toHaveText('C9');

  await page.locator('#mini-progression').selectOption('major251');
  await expect(page.locator('#template')).toHaveValue('major251');
  await expect(page.locator('#progression')).toHaveAttribute('aria-pressed','true');
  await page.locator('#mini-progression').selectOption('off');
  await expect(page.locator('#pedal')).toHaveAttribute('aria-pressed','true');
});

test('pentatonic overlay preserves modal-root colour and marks its own root',async({page})=>{
  await openReference(page);
  const modalRoot=page.locator('#guitar-diagrams .fret-note.root>circle').first();
  const normalFill=await modalRoot.evaluate(element=>getComputedStyle(element).fill);
  await page.locator('#theory-view').selectOption('pentatonic');
  await expect(page.locator('#guitar-diagrams .pentatonic-root .theory-ring').first()).toBeVisible();
  await expect(modalRoot).toHaveCSS('fill',normalFill);
  const colours=await page.locator('#guitar-diagrams').evaluate(element=>{
    const pentatonic=getComputedStyle(element.querySelector('.theory-ring')!).stroke;
    const root=getComputedStyle(element.querySelector('.pentatonic-root .theory-ring')!).stroke;
    return {pentatonic,root};
  });
  expect(colours.root).not.toBe(colours.pentatonic);
});

test('triad pairs use the original uncluttered A and B treatment',async({page})=>{
  await openReference(page);
  await page.locator('#theory-view').selectOption('triads');
  await expect(page.locator('#guitar-diagrams .theory-a .theory-ring').first()).not.toHaveAttribute('stroke-dasharray');
  await expect(page.locator('#guitar-diagrams .theory-b .theory-ring').first()).toHaveAttribute('stroke-dasharray','3 2');
  await expect(page.locator('#guitar-diagrams .triad-root')).toHaveCount(0);
  await expect(page.locator('.triad-root-guide')).toHaveCount(0);
});
