import {expect,test} from '@playwright/test';
import {openReference} from './open-reference';

test('notation workspace controls remain usable on a phone viewport',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  await page.goto('/');
  const exercise=page.locator('#caged-exercise');
  await exercise.scrollIntoViewIfNeeded();

  await exercise.locator('#exercise-study').selectOption('groups3');
  await expect(exercise.locator('#caged-exercise-title')).toContainText(/groups of three/i);
  await exercise.locator('#exercise-display').selectOption('names');
  await expect(exercise.locator('.notation-scroll')).toHaveClass(/display-names/);
  await exercise.locator('#exercise-zoom').selectOption('large');
  await expect(exercise.locator('.notation-scroll')).toHaveClass(/zoom-large/);
  await exercise.locator('#exercise-tempo').fill('135');
  await exercise.locator('#exercise-tempo').dispatchEvent('change');
  await expect(exercise.locator('#exercise-tempo')).toHaveValue('135');
  await exercise.locator('#exercise-loop').check();
  await expect(exercise.locator('#exercise-loop')).toBeChecked();
  await exercise.locator('#exercise-focus').tap();
  await expect(exercise).toHaveClass(/notation-focused/);
  await exercise.locator('#exercise-focus').tap();
  await expect(exercise).not.toHaveClass(/notation-focused/);

  const layout=await exercise.evaluate(element=>{
    const actions=element.querySelector('.exercise-actions')!;
    const controls=Array.from(element.querySelectorAll<HTMLElement>('.exercise-actions button,.exercise-practice-bar button,.exercise-practice-bar select,.exercise-practice-bar input:not([type="checkbox"])'));
    return {
      pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
      actionOverflow:actions.scrollWidth>actions.clientWidth+1,
      shortTargets:controls.filter(control=>control.getBoundingClientRect().height<40).map(control=>control.id||control.textContent?.trim())
    };
  });
  expect(layout.pageOverflow).toBe(false);
  expect(layout.actionOverflow).toBe(false);
  expect(layout.shortTargets).toEqual([]);
  await context.close();
});

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
  await expect(exercise.locator('.exercise-title')).toHaveCount(1);
  await expect(exercise.locator('.exercise-title')).toHaveText('Harmonized tetrads · A');
  await expect(exercise.locator('.phrase-cell')).toHaveCount(0);
  await expect(exercise.locator('.exercise-cell-strip')).toHaveCount(0);
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
  await expect(exercise.locator('.exercise-title')).toHaveText('Tetrads from each chord tone · A');
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
  await expect(exercise.locator('#exercise-study option')).toHaveCount(30);
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
  for(const study of ['enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','approach','doubleapproach','chromaticneighbors','passingtones','approacheverytone','upperstructure','guidetones','connections','triadpairs','pentatonic']){
    await page.locator('#exercise-study').selectOption(study);
    await expect(page.locator('#caged-exercise-title')).not.toBeEmpty();
    await expect(page.locator('#caged-exercise .note-head').first()).toBeVisible();
    await expect(page.locator('#caged-exercise .tab-fret').first()).toBeVisible();
  }
  await page.locator('#exercise-study').selectOption('triadpairs');
  await expect(page.locator('#exercise-source')).toBeVisible();
  await expect(page.locator('#caged-exercise .exercise-source').first()).toContainText(/A|B/);
  await page.locator('#exercise-study').selectOption('pentatonic');
  await expect(page.locator('#caged-exercise .exercise-source')).toHaveCount(0);
  await expect(page.locator('#caged-exercise .exercise-title')).toHaveCount(1);
  await expect(page.locator('#caged-exercise .exercise-title')).toHaveText(/pentatonic sequences · [A-G](?:♯|♭)?/i);
  await expect(page.locator('#exercise-pattern')).toBeVisible();
  await expect(page.locator('#exercise-pattern option')).toHaveCount(9);
  for(const pattern of ['groups3','groups4','groups5','thirds','digital1324','rolling','alternating3','alternating4','alternating5']){
    await page.locator('#exercise-pattern').selectOption(pattern);
    await expect(page.locator('#caged-exercise .note-head').first()).toBeVisible();
    await expect(page.locator('#caged-exercise .tab-fret').first()).toBeVisible();
  }
});

test('notation workspace supports display modes, ordered exercise navigation, favourites and export',async({page})=>{
  await openReference(page);
  const exercise=page.locator('#caged-exercise');
  await exercise.locator('#exercise-display').selectOption('names');
  await expect(exercise.locator('.notation-scroll')).toHaveClass(/display-names/);
  await expect(exercise.locator('.note-name-label').first()).toBeVisible();
  await exercise.locator('#exercise-zoom').selectOption('large');
  await expect(exercise.locator('.notation-scroll')).toHaveClass(/zoom-large/);
  await exercise.locator('[data-tempo-ratio=".5"]').click();
  await expect(exercise.locator('#exercise-tempo')).toHaveValue('45');
  await expect(exercise.locator('#exercise-study')).toHaveValue('harmonized');
  await exercise.locator('#exercise-history-back').click();
  await expect(exercise.locator('#exercise-study')).toHaveValue('cells');
  await exercise.locator('#exercise-history-forward').click();
  await expect(exercise.locator('#exercise-study')).toHaveValue('harmonized');
  await expect(exercise.locator('.pattern-bracket').first()).toBeVisible();
  await exercise.locator('#exercise-favourite').click();
  await expect(exercise.locator('#exercise-favourite')).toHaveText('★ Saved');
  await exercise.locator('#exercise-display').selectOption('both');
  await expect(exercise.locator('#exercise-favourites option')).toHaveCount(2);
  const download=page.waitForEvent('download');await exercise.locator('#exercise-export').click();
  expect((await download).suggestedFilename()).toMatch(/\.svg$/);
  await page.evaluate(()=>{(window as any).__printed=false;window.print=()=>{(window as any).__printed=true;};});
  await exercise.locator('#exercise-print').click();expect(await page.evaluate(()=>(window as any).__printed)).toBe(true);
});

test('a user can select and play an arbitrary notation range',async({page})=>{
  await openReference(page);
  const exercise=page.locator('#caged-exercise');
  await exercise.locator('[data-note-index="2"] .note-head').scrollIntoViewIfNeeded();
  const first=await exercise.locator('[data-note-index="2"] .note-head').boundingBox();
  const last=await exercise.locator('[data-note-index="6"] .note-head').boundingBox();
  expect(first).not.toBeNull();expect(last).not.toBeNull();
  await page.mouse.move(first!.x+first!.width/2,first!.y+first!.height/2);
  await page.mouse.down();
  await page.mouse.move(last!.x+last!.width/2,last!.y+last!.height/2,{steps:12});
  await page.mouse.up();
  await expect(exercise.locator('.exercise-note.range-selected')).toHaveCount(5);
  await expect(exercise.locator('#exercise-play-range')).toBeEnabled();
  await expect(exercise.locator('#exercise-play-range')).toHaveText('■ Stop selection');
  await exercise.locator('#exercise-play-range').click();
  await expect(exercise.locator('.exercise-note.range-selected')).toHaveCount(5);
  await exercise.locator('#exercise-clear-range').click();
  await expect(exercise.locator('.exercise-note.range-selected')).toHaveCount(0);
  await expect(exercise.locator('#exercise-play-range')).toBeDisabled();
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
  await expect(exercise.locator('.exercise-note.playing')).toHaveCount(1);
  await expect(exercise.locator('#exercise-playback-status')).toContainText(/Note \d+ \/ 9/);
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
  const focusLayout=await page.locator('#mini-transport').evaluate(element=>{
    const progression=element.querySelector('#mini-progression')!.getBoundingClientRect();
    const pulse=element.querySelector('.mini-pulse-options')!.getBoundingClientRect();
    const bar=element.getBoundingClientRect();
    return {progressionRight:progression.right,pulseLeft:pulse.left,pulseRight:pulse.right,barRight:bar.right};
  });
  expect(focusLayout.progressionRight).toBeLessThanOrEqual(focusLayout.pulseLeft);
  expect(focusLayout.pulseRight).toBeLessThanOrEqual(focusLayout.barRight);

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
