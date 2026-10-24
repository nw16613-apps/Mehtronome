import {expect,test} from '@playwright/test';

for(const [width,columns] of [[1440,7],[900,4],[390,2]])test(`mixer levels use ${columns} columns at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.goto('/');
  await expect(page.locator('.mix-level-grid .mix-channel')).toHaveCount(7);
  const layout=await page.locator('.mix-level-grid').evaluate(element=>{
    const boxes=Array.from(element.children).map(child=>child.getBoundingClientRect());

    return {columns:new Set(boxes.map(box=>Math.round(box.left))).size,overflow:document.documentElement.scrollWidth>innerWidth+1,settingsBelow:!document.querySelector('#mix-panel #drum-groove')};
  });
  expect(layout).toEqual({columns,overflow:false,settingsBelow:true});
  const drums=page.locator('[data-mix-channel="drums"]');
  await expect(drums).toHaveClass(/is-inactive/);await expect(drums.locator('.mix-channel-state')).toHaveText('Off');
  await page.locator('#drums').check();await expect(drums).not.toHaveClass(/is-inactive/);
  await page.locator('[data-mute-channel="drums"]').click();await expect(drums.locator('.mix-channel-state')).toHaveText('Muted');
  await page.locator('#drums-volume').fill('63');await page.locator('#drums-volume').dispatchEvent('input');
  await expect(page.locator('#drums-volume-value')).toHaveText('63%');
  await page.locator('#mixer-unmute-all').click();await expect(page.locator('#drums-volume')).toHaveValue('63');
  await expect(page.locator('#drums')).toBeChecked();await expect(page.locator('#bass')).not.toBeChecked();
});

test('mute silences audio while preserving playback, volume and integrated polyrhythm',async({page})=>{
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);const analyser=context.createAnalyser();this.connect(analyser,0);(window as any).__muteAnalyser=analyser;
      }
    };
  });
  await page.goto('/');
  await page.locator('#harmony').fill('0');await page.locator('#harmony').dispatchEvent('input');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').dispatchEvent('change');await page.locator('#play').click();
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');
  const peak=()=>page.evaluate(()=>{const analyser=(window as any).__muteAnalyser as AnalyserNode;const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);return Math.max(...samples.map(Math.abs));});
  await expect.poll(peak).toBeGreaterThan(.005);
  await page.locator('[data-mute-channel="click"]').click();await expect.poll(peak).toBeLessThan(.00001);
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#click')).toHaveValue('50');
  await page.locator('.pulse-tool summary').filter({hasText:'Polyrhythm'}).click();await page.locator('#pulse-poly').selectOption('3/2');
  await expect.poll(peak).toBeLessThan(.00001);
  await expect(page.locator('[data-mix-channel="poly"]')).toHaveCount(0);
  await page.locator('#click').fill('67');await page.locator('#click').dispatchEvent('input');
  await page.locator('#mixer-unmute-all').click();await expect(page.locator('#click')).toHaveValue('67');
  await expect.poll(peak).toBeGreaterThan(.005);await expect(page.locator('#play')).toHaveAttribute('aria-pressed','true');
  await page.locator('#mini-play').click();
});

test('mutes and mode extension morph restore through presets',async({page})=>{
  await page.goto('/');await page.locator('[data-mute-channel="space"]').click();await page.locator('[data-mute-channel="harmony"]').click();
  await page.locator('#harmony').fill('46');await page.locator('#harmony').dispatchEvent('input');
  await page.locator('[data-workspace-target="harmony-title"]').click();
  await page.locator('#extension-morph').check();await page.locator('#extension-bars').selectOption('16');
  await expect(page.locator('#extension-status')).toContainText('16-bar blend cycle');
  await page.locator('[data-workspace-target="progress-title"]').click();await page.locator('#preset-name').fill('Evolving muted mix');await page.locator('#preset-save').click();
  await page.locator('[data-workspace-target="pulse-title"]').click();await page.locator('#mixer-unmute-all').click();
  await page.locator('[data-workspace-target="harmony-title"]').click();await page.locator('#extension-morph').uncheck();
  await page.locator('[data-workspace-target="progress-title"]').click();await page.locator('#preset-load').click();
  await page.locator('[data-workspace-target="harmony-title"]').click();await expect(page.locator('#extension-morph')).toBeChecked();await expect(page.locator('#extension-bars')).toHaveValue('16');
  await page.locator('[data-workspace-target="pulse-title"]').click();
  await expect(page.locator('[data-mute-channel="harmony"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-mute-channel="space"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#harmony')).toHaveValue('46');
  await page.locator('#mixer-unmute-all').click();await page.locator('[data-workspace-target="harmony-title"]').click();
  await page.locator('#mini-play').click();await expect(page.locator('#extension-status')).toContainText('Blending:',{timeout:10000});await page.locator('#mini-play').click();
});

test('old presets clear mutes and extension morph instead of inheriting a prior mix',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'old',name:'Old mix',progression:false,controls:{bpm:'100',harmony:'35'}}]})));
  await page.goto('/');await page.locator('[data-mute-channel="click"]').click();
  await page.locator('[data-workspace-target="harmony-title"]').click();await page.locator('#extension-morph').check();
  await page.locator('[data-workspace-target="progress-title"]').click();await page.locator('#preset-list').selectOption('old');await page.locator('#preset-load').click();
  await page.locator('[data-workspace-target="harmony-title"]').click();await expect(page.locator('#extension-morph')).not.toBeChecked();
  await page.locator('[data-workspace-target="pulse-title"]').click();await expect(page.locator('[data-mute-channel="click"]')).toHaveAttribute('aria-pressed','false');
});

test('solo preserves mutes and sound settings have their own workspace',async({page})=>{
 await page.goto('/');await page.locator('[data-mute-channel="bass"]').click();await page.locator('[data-solo-channel="click"]').click();
 await expect(page.locator('[data-mix-channel="harmony"] .mix-channel-state')).toHaveText('Solo muted');
 await page.locator('#open-sound-settings').click();await expect(page.locator('#sound-settings-title')).toBeVisible();await expect(page.locator('#mix-panel')).toBeHidden();
 await expect(page.locator('.sound-settings details:not([open])')).toHaveCount(0);await page.locator('#pad-brightness').selectOption('dark');
 await expect(page.locator('.harmony #sound')).toHaveCount(0);await page.locator('#sound').selectOption('glass');
 await page.locator('[data-workspace-target="pulse-title"]').click();await page.locator('#mixer-clear-solos').click();
 await expect(page.locator('[data-mute-channel="bass"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-workspace-target="sound-settings-title"]').click();await expect(page.locator('#pad-brightness')).toHaveValue('dark');await expect(page.locator('#sound')).toHaveValue('glass');
 await page.reload();await expect(page.locator('#sound-settings-title')).toBeVisible();
});

for(const palette of ['midnight','plum','slate'])test(`mixer follows ${palette} palette`,async({page})=>{
  await page.goto('/');await page.addStyleTag({content:'* { transition:none !important; }'});await page.locator('#palette').selectOption(palette);
  const colors=await page.locator('#mix-panel').evaluate(panel=>({panel:getComputedStyle(panel).backgroundColor,expected:getComputedStyle(document.documentElement).getPropertyValue('--panel').trim(),field:getComputedStyle(panel.querySelector('.mix-channel')!).backgroundColor,expectedField:getComputedStyle(document.documentElement).getPropertyValue('--field').trim()}));
  const rgb=(hex:string)=>{const value=hex.replace('#','');const full=value.length===3?value.split('').map(c=>c+c).join(''):value;return `rgb(${[0,2,4].map(i=>parseInt(full.slice(i,i+2),16)).join(', ')})`;};
  expect(colors.panel).toBe(rgb(colors.expected));expect(colors.field).toBe(rgb(colors.expectedField));
  await page.locator('#open-sound-settings').click();
  await expect(page.locator('.sound-settings')).toHaveCSS('background-color',rgb(colors.expected));
  await expect(page.locator('#comping-tone')).toHaveCSS('background-color',rgb(colors.expectedField));
  await expect(page.locator('.sound-settings details:not([open])')).toHaveCount(0);
});
