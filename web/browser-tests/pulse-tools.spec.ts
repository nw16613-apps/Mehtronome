import {expect,test} from '@playwright/test';

test('tap tempo, shortcuts and beat accents work without losing keyboard focus',async({page})=>{
  const clockStart=new Date(2026,9,24,12);
  await page.clock.install({time:clockStart});
  await page.goto('/');
  await page.clock.pauseAt(new Date(clockStart.getTime()+10000));
  await page.locator('#tap-tempo').click();await page.clock.runFor(500);
  await page.locator('#tap-tempo').click();await expect(page.locator('#bpm')).toHaveValue('120');
  await page.locator('#bpm').fill('137');await page.locator('#bpm').dispatchEvent('change');
  await page.locator('#tempo-save').click();
  await page.locator('[data-tempo="60"]').click();await expect(page.locator('#bpm')).toHaveValue('60');
  await page.locator('[data-tempo="137"]').click();await expect(page.locator('#bpm')).toHaveValue('137');
  const beat=page.locator('[data-pulse-beat="0"]');
  await beat.focus();await page.keyboard.press('Enter');await expect(beat).toHaveClass(/soft/);await expect(beat).toBeFocused();
  await page.keyboard.press('Enter');await expect(beat).toHaveClass(/silent/);
  await page.locator('#pulse-accent-reset').click();await expect(beat).toHaveClass(/strong/);
  await page.locator('#accent').check();await expect(beat).toHaveClass(/strong/);
  await page.reload();await expect(page.locator('[data-tempo="137"]')).toBeVisible();
});

for(const subdivision of [5,7])test(`pulse tools and ${subdivision}-note subdivisions round-trip through presets`,async({page})=>{
  await page.goto('/');
  await page.getByText('Swing',{exact:true}).click();
  await page.locator('[data-workspace-target="sound-settings-title"]').click();
  await expect(page.locator('#pulse-sound')).toBeVisible();await page.locator('#pulse-sound').selectOption('wood');
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await expect(page.locator('#pulse-swing')).toBeDisabled();
  await page.locator('#subdivision').selectOption('2');
  await page.locator('#pulse-swing').fill('100');await page.locator('#pulse-swing').dispatchEvent('input');
  await page.locator('#click').fill('32');await page.locator('#click').dispatchEvent('input');
  await expect(page.locator('#click')).toHaveValue('32');

  await page.locator('#pulse-timer-mode').selectOption('timed');
  await page.locator('#pulse-minutes').fill('10');await page.locator('#pulse-minutes').dispatchEvent('input');
  await page.locator('.pulse-tool summary').filter({hasText:'Polyrhythm'}).click();await page.locator('#pulse-poly').selectOption('3/2');
  await page.locator('#gap-enabled').check();await page.locator('#gap-progressive').check();await page.locator('#gap-max').selectOption('4');
  await page.locator('[data-pulse-beat="1"]').click();
  await page.locator('#subdivision').selectOption(String(subdivision));
  await expect(page.locator('#pulse-swing')).toBeDisabled();
  await page.locator('[data-workspace-target="progress-title"]').click();
  await page.locator('#preset-name').fill('Pulse tools');await page.locator('#preset-save').click();
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await page.locator('#subdivision').selectOption('1');
  await page.locator('[data-workspace-target="sound-settings-title"]').click();await page.locator('#pulse-sound').selectOption('beep');
  await page.locator('[data-workspace-target="pulse-title"]').click();await page.locator('#pulse-poly').selectOption('0/2');
  await page.locator('#pulse-accent-reset').click();
  await page.locator('[data-workspace-target="progress-title"]').click();
  await page.locator('#preset-load').click();
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await expect(page.locator('#pulse-sound')).toHaveValue('wood');
  await expect(page.locator('#subdivision')).toHaveValue(String(subdivision));
  await expect(page.locator('#pulse-swing')).toHaveValue('100');
  await expect(page.locator('#pulse-poly')).toHaveValue('3/2');
  await expect(page.locator('#pulse-minutes')).toHaveValue('10');
  await expect(page.locator('#gap-progressive')).toBeChecked();
  await expect(page.locator('[data-pulse-beat="1"]')).toHaveClass(/silent/);
  await expect(page.locator('#click')).toHaveValue('32');
});

test('timer completes on the audio clock and large display follows playback',async({page})=>{
  // Keep the real worklet and UI path; shorten a one-minute session for the test.
  await page.addInitScript(()=>{
    const original=MessagePort.prototype.postMessage;
    MessagePort.prototype.postMessage=function(data:any,...args:any[]){
      if(data?.type==='start'&&data.settings?.sessionSeconds===60)data={...data,settings:{...data.settings,sessionSeconds:2.6}};
      return (original as any).call(this,data,...args);
    };
  });
  await page.goto('/');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').dispatchEvent('change');
  await page.locator('#beats').selectOption('4');

  await page.locator('#pulse-timer-mode').selectOption('timed');
  await page.locator('#pulse-minutes').fill('1');await page.locator('#pulse-minutes').dispatchEvent('input');
  await page.locator('.pulse-tool summary').filter({hasText:'Polyrhythm'}).click();await page.locator('#pulse-poly').selectOption('3/2');
  await page.locator('#pulse-large-open').click();
  await page.locator('#pulse-large-play').click();
  await expect(page.locator('#pulse-large-number')).toHaveText(/^[1-4]$/);
  await expect(page.locator('#pulse-large-status')).toHaveText('Session complete',{timeout:10000});
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#pulse-time')).toContainText('Session complete');
  await page.keyboard.press('Escape');await expect(page.locator('#pulse-large')).not.toBeVisible();
});

for(const width of [1440,390])test(`pulse tools fit at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.goto('/');
  for(const summary of ['Swing','Polyrhythm'])await page.locator('.pulse-tool summary').filter({hasText:summary}).click();
  await page.locator('#gap-enabled').check();await page.locator('#gap-progressive').check();
  const geometry=await page.evaluate(()=>{
    const pulse=document.querySelector('.transport')!.getBoundingClientRect(),mix=document.querySelector('#mix-panel')!.getBoundingClientRect(),tools=document.querySelector('.studio-tools')!.getBoundingClientRect();
    return {layout:innerWidth>760?pulse.right<=mix.left:pulse.bottom<=mix.top,toolsBelow:tools.top>=mix.bottom,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(geometry).toEqual({layout:true,toolsBelow:true,overflow:false});
});

test('Guitar and Exercises show the selected loop, chord scales and current playback chord',async({page})=>{
  await page.goto('/');
  await page.locator('[data-workspace-target="harmony-title"]').click();
  await page.locator('#progression-choice').selectOption('major251');
  await page.locator('[data-grid-beat="4"]').scrollIntoViewIfNeeded();const [a,b]=await page.evaluate(()=>[4,15].map(i=>{const r=document.querySelector(`[data-grid-beat="${i}"]`)!.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}));await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:10});await page.mouse.up();
  await page.locator('[data-workspace-target="guitar-title"]').click();await expect(page.locator('#position-path [data-route-step]')).toHaveCount(2);const guitar=page.locator('.workspace-guitar .progression-reference');await expect(guitar).toContainText('Scale guide:');await expect(guitar).toContainText('Next:');const summary=await guitar.textContent();
  await page.locator('[data-workspace-target="caged-exercise"]').click();const exercise=page.locator('#caged-exercise .progression-reference');await expect(exercise).toHaveText(summary!);await expect(page.locator('.exercise-position-route [data-route-step]')).toHaveCount(2);
  await page.locator('[data-workspace-target="pulse-title"]').click();await page.locator('#bpm').fill('240');await page.locator('#bpm').dispatchEvent('change');await page.locator('#play').click();await page.locator('[data-workspace-target="caged-exercise"]').click();const active=page.locator('.exercise-position-route [data-route-step][aria-pressed="true"]');const first=await active.getAttribute('data-route-step');await expect.poll(()=>active.getAttribute('data-route-step'),{timeout:6000}).not.toBe(first);
  await page.locator('#mini-play').click();
});

test('older presets reset new pulse tools to their original behavior',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'legacy',name:'Earlier practice',progression:false,controls:{bpm:'96',beats:'4',accent:true}}]})));
  await page.goto('/');
  await page.locator('[data-workspace-target="sound-settings-title"]').click();await page.locator('#pulse-sound').selectOption('rim');
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await page.locator('#pulse-timer-mode').selectOption('timed');
  await page.locator('#pulse-minutes').fill('5');await page.locator('#pulse-minutes').dispatchEvent('input');
  await page.locator('.pulse-tool summary').filter({hasText:'Polyrhythm'}).click();await page.locator('#pulse-poly').selectOption('5/4');
  await page.locator('[data-pulse-beat="0"]').click();
  await page.locator('[data-workspace-target="progress-title"]').click();
  await page.locator('#preset-list').selectOption('legacy');await page.locator('#preset-load').click();
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await expect(page.locator('#bpm')).toHaveValue('96');
  await expect(page.locator('#pulse-sound')).toHaveValue('beep');
  await expect(page.locator('#pulse-poly')).toHaveValue('0/2');
  await expect(page.locator('#pulse-minutes')).toHaveValue('0');
  await expect(page.locator('[data-pulse-beat="0"]')).toHaveClass(/strong/);
});
