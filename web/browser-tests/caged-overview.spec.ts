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

  await page.locator('#mini-chord-select').selectOption('maj7');
  await expect(page.locator('#chord')).toHaveValue('maj7');
  await expect(page.locator('#guitar-context')).toHaveText('Cmaj7');

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

test('triad pairs preserve modal-root colour and mark both triad roots',async({page})=>{
  await openReference(page);
  const modalRoot=page.locator('#guitar-diagrams .fret-note.root>circle').first();
  const normalFill=await modalRoot.evaluate(element=>getComputedStyle(element).fill);
  await page.locator('#theory-view').selectOption('triads');
  await expect(page.locator('#guitar-diagrams .theory-a.triad-root .theory-ring').first()).toBeVisible();
  await expect(page.locator('#guitar-diagrams .theory-b.triad-root .theory-ring').first()).toBeVisible();
  await expect(modalRoot).toHaveCSS('fill',normalFill);
  const colours=await page.locator('#guitar-diagrams').evaluate(element=>({
    a:getComputedStyle(element.querySelector('.theory-a:not(.triad-root) .theory-ring')!).stroke,
    aRoot:getComputedStyle(element.querySelector('.theory-a.triad-root .theory-ring')!).stroke,
    b:getComputedStyle(element.querySelector('.theory-b:not(.triad-root) .theory-ring')!).stroke,
    bRoot:getComputedStyle(element.querySelector('.theory-b.triad-root .theory-ring')!).stroke,
  }));
  expect(colours.aRoot).not.toBe(colours.a);
  expect(colours.bRoot).not.toBe(colours.b);
});
