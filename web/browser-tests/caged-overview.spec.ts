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
  await expect(exercise.locator('.exercise-notation').first()).toBeVisible();
  expect(await exercise.locator('.exercise-notation').count()).toBeGreaterThan(1);
  await expect(exercise.locator('.treble-clef')).toHaveCount(await exercise.locator('.exercise-notation').count());
  await expect(exercise.locator('.tab-clef')).toHaveCount(await exercise.locator('.exercise-notation').count());
  await expect(exercise.locator('.chord-symbol').first()).toHaveText('Am7');
  expect(await exercise.locator('.chord-symbol').count()).toBeGreaterThanOrEqual(8);
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

  await exercise.locator('#exercise-study').selectOption('chordtones');
  await expect(exercise.locator('h3')).toContainText('Tetrads from each chord tone');
  await expect(exercise.locator('#exercise-material')).toBeEnabled();
  await expect(exercise.locator('.chord-symbol').first()).toContainText('From ');
  const chordToneLabels=await exercise.locator('.chord-symbol').allTextContents();
  for(const degree of ['1','♭3','5','♭7'])expect(chordToneLabels.some(label=>label.includes(`From ${degree}`))).toBe(true);
  await exercise.locator('#exercise-study').selectOption('chordtonesalternating');
  await exercise.locator('#exercise-motion').selectOption('ascending');
  await expect(exercise.locator('#exercise-motion option')).toHaveText(['Up/down · low to high','Down/up · high to low']);
  await expect(exercise.locator('h3')).toContainText('Up/down tetrads from each chord tone');
  await expect(exercise.locator('#exercise-motion')).toBeEnabled();
  await expect(exercise.locator('#exercise-preview')).toContainText('Hear jazz guitar');
  await exercise.locator('#exercise-motion').selectOption('descending');
  await expect(exercise.locator('h3')).toContainText('Down/up tetrads from each chord tone');
  await exercise.locator('#exercise-material').selectOption('triad');
  await expect(exercise.locator('h3')).toContainText('Down/up triads');
  await exercise.locator('#exercise-study').selectOption('alternating');
  await exercise.locator('#exercise-motion').selectOption('descending');
  await expect(exercise.locator('h3')).toContainText('Down/up diatonic triads');
  await expect(exercise.locator('#exercise-study option')).toHaveCount(19);
  await expect(exercise.locator('#exercise-backing')).toBeChecked();
  await expect(exercise.locator('.exercise-notation').first()).toBeVisible();
  const notationFits=await exercise.locator('.notation-scroll').evaluate(element=>element.scrollWidth<=element.clientWidth+1);
  expect(notationFits).toBe(true);
  await exercise.locator('#exercise-focus').click();
  await expect(exercise).toHaveClass(/notation-focused/);
  await expect(exercise.locator('#exercise-focus')).toHaveText('Exit notation focus');
  await page.keyboard.press('Escape');
  await expect(exercise).not.toHaveClass(/notation-focused/);
});

test('jazz language and superimposition studies render synchronized notation and TAB',async({page})=>{
  await openReference(page);
  for(const study of ['enclosures','approach','upperstructure','guidetones','connections','triadpairs','pentatonic']){
    await page.locator('#exercise-study').selectOption(study);
    await expect(page.locator('#caged-exercise-title')).not.toBeEmpty();
    await expect(page.locator('#caged-exercise .note-head').first()).toBeVisible();
    await expect(page.locator('#caged-exercise .tab-fret').first()).toBeVisible();
  }
  await page.locator('#exercise-study').selectOption('triadpairs');
  await expect(page.locator('#exercise-source')).toBeVisible();
  await expect(page.locator('#caged-exercise .exercise-source').first()).toContainText(/A|B/);
  await page.locator('#exercise-study').selectOption('pentatonic');
  await expect(page.locator('#caged-exercise .exercise-source').first()).toContainText(/pentatonic/i);
});

test('looped TAB playback stays on absolute audio-clock boundaries',async({page})=>{
  await page.addInitScript(()=>{
    const starts:number[]=[];
    Object.defineProperty(window,'__exerciseStarts',{value:starts});
    const original=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(when?:number,offset?:number,duration?:number){
      starts.push(when??0);return original.call(this,when,offset,duration);
    };
  });
  await page.goto('/');
  await page.locator('#bpm').fill('240');
  await page.locator('#bpm').dispatchEvent('input');
  const exercise=page.locator('#caged-exercise');
  await exercise.locator('#exercise-study').selectOption('inversions');
  await exercise.locator('#exercise-material').selectOption('triad');
  await exercise.locator('#exercise-rhythm').selectOption('sixteenths');
  await exercise.locator('#exercise-backing').uncheck();
  await exercise.locator('#exercise-loop').check();
  await exercise.locator('#exercise-preview').click();
  await expect.poll(async()=>page.evaluate(()=>(window as any).__exerciseStarts.length),{timeout:5000}).toBeGreaterThanOrEqual(18);
  const starts=await page.evaluate(()=>(window as any).__exerciseStarts as number[]);
  expect(starts[9]-starts[0]).toBeCloseTo(.5625,6);
  expect(starts[10]-starts[9]).toBeCloseTo(.0625,6);
  await exercise.locator('#exercise-preview').click();
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

  await page.locator('#mini-count-in').check();
  await expect(page.locator('#count-in')).toBeChecked();
  await page.locator('#accent').evaluate((element:HTMLInputElement)=>{element.checked=false;element.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#mini-accent')).not.toBeChecked();
  await page.locator('#mini-accent').check();
  await expect(page.locator('#accent')).toBeChecked();
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
