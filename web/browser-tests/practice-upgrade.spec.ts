import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {harmonyAt} from '../src/audio/music.js';

test('sticky transport keeps tempo, playback and current harmony available beside the guitar',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.locator('#guitar-title').scrollIntoViewIfNeeded();
  await expect(page.locator('#mini-transport')).toBeVisible();
  const position=await page.locator('#mini-transport').boundingBox();
  expect(position!.y).toBeGreaterThanOrEqual(0);
  expect(position!.y+position!.height).toBeLessThanOrEqual(await page.evaluate(()=>innerHeight));
  await page.locator('#mini-bpm').fill('1');await page.locator('#mini-bpm').blur();
  await expect(page.locator('#mini-bpm')).toHaveValue('30');
  await page.locator('#mini-bpm').fill('112');await page.locator('#mini-bpm').blur();
  await expect(page.locator('#bpm')).toHaveValue('112');
  await expect(page.locator('#tempo')).toHaveValue('112');
  await expect(page.locator('#mini-chord')).toContainText('Am13');
  await expect(page.locator('#exercise-preview')).toBeEnabled();
  await page.locator('#mini-play').click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#exercise-preview')).toBeDisabled();
  const beatBeforeEditing=(await page.locator('#mini-beat').textContent())!;
  await page.locator('#mini-bpm').fill('118');
  await expect(page.locator('#mini-beat')).not.toHaveText(beatBeforeEditing);
  await expect(page.locator('#mini-bpm')).toHaveValue('118');
  await expect(page.locator('#bpm')).toHaveValue('112');
  await page.locator('#mini-bpm').blur();
  await expect(page.locator('#bpm')).toHaveValue('118');
  await page.locator('#mini-play').click();
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#mini-play')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#exercise-preview')).toBeEnabled();
  await page.locator('#exercise-loop').check();
  await expect(page.locator('#exercise-preview')).toBeEnabled();
  await page.locator('#exercise-loop').uncheck();
  await expect(page.locator('#exercise-preview')).toBeEnabled();
  expect(errors).toEqual([]);
});

test('Focus view and a featured CAGED position remain usable on desktop and mobile',async({page})=>{
  await page.goto('/');
  await page.locator('#featured-position').selectOption('IV');
  await expect(page.locator('#guitar-diagrams .position-card')).toHaveCount(5);
  await expect(page.locator('#guitar-diagrams .featured-position')).toHaveAttribute('data-position','IV');
  await page.locator('#focus-view').click();
  await expect(page.locator('#focus-view')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('section.presets')).toBeHidden();
  await expect(page.locator('section.mix')).toBeHidden();
  await expect(page.locator('#mini-transport')).toBeVisible();
  await expect(page.locator('#guitar-title')).toBeVisible();
  for(const width of [1440,900,390]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('#featured-position')).toHaveValue('IV');
    await expect(page.locator('#guitar-diagrams .featured-position')).toHaveAttribute('data-position','IV');
  }
  await page.locator('#featured-position').selectOption('all');
  await expect(page.locator('#guitar-diagrams .featured-position')).toHaveCount(0);
  await page.locator('#exit-focus').click();
  await expect(page.locator('section.mix')).toBeVisible();
  await expect(page.locator('section.presets')).toBeVisible();
  await expect(page.locator('#focus-view')).toHaveAttribute('aria-pressed','false');
});

test('mixer exposes switches and volume while advanced groups can collapse independently',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#rhythm-details')).not.toHaveAttribute('open','');
  await expect(page.locator('#sequence-details')).not.toHaveAttribute('open','');
  for(const id of ['drums','bass','sequence','click','harmony','space'])await expect(page.locator('#'+id)).toBeVisible();
  await page.locator('#drums').check();
  await expect(page.locator('#rhythm-details')).toHaveAttribute('open','');
  await expect(page.locator('#drum-groove')).toBeVisible();
  await page.locator('#comping').check();
  await expect(page.locator('#comping-tone')).toBeVisible();
  await expect(page.locator('#comping-tone option')).toHaveCount(4);
  await page.locator('#comping-tone').selectOption('reed');
  await expect(page.locator('#comping-tone')).toHaveValue('reed');
  await page.locator('#sequence').check();
  await expect(page.locator('#sequence-details')).toHaveAttribute('open','');
  await page.locator('#sequence-role').selectOption('pattern');
  await page.locator('#sequence-pattern').selectOption('clave');
  await page.locator('#sequence-details>summary').focus();await page.keyboard.press('Space');
  await expect(page.locator('#sequence-pattern')).toBeHidden();
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#sequence')).toBeChecked();
  await expect(page.locator('#rhythm-details')).toHaveAttribute('open','');
  await page.keyboard.press('Space');
  await expect(page.locator('#sequence-pattern')).toHaveValue('clave');
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
});

test('exported presets import safely and malformed files leave saved setups intact',async({page})=>{
  await page.goto('/');
  await page.locator('#featured-position').selectOption('III');
  await page.locator('#trainer-enabled').check();
  await page.locator('#trainer-bars').selectOption('2');
  await page.locator('#trainer-increment').fill('3');
  await page.locator('#trainer-target').fill('138');
  await page.locator('#preset-name').fill('Dorian travel setup');await page.locator('#preset-save').click();
  await expect(page.locator('#preset-status')).toContainText('Saved');
  const downloadPromise=page.waitForEvent('download');await page.locator('#preset-export').click();
  const download=await downloadPromise;const raw=await readFile((await download.path())!,'utf8');
  const exported=JSON.parse(raw);expect(exported.version).toBe(1);expect(exported.items).toHaveLength(1);
  expect(exported.items[0].name).toBe('Dorian travel setup');
  await page.locator('#preset-delete').click();await expect(page.locator('#preset-list option')).toHaveCount(1);
  const chooserPromise=page.waitForEvent('filechooser');await page.locator('#preset-import').click();
  const chooser=await chooserPromise;
  await chooser.setFiles({name:'practice-presets.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await expect(page.locator('#preset-status')).toContainText(/imported/i);
  await expect(page.locator('#preset-list option')).toHaveCount(2);
  const id=await page.locator('#preset-list option').last().getAttribute('value');
  await page.locator('#preset-list').selectOption(id!);await page.locator('#preset-load').click();
  await expect(page.locator('#featured-position')).toHaveValue('III');
  await expect(page.locator('#trainer-enabled')).toBeChecked();
  await expect(page.locator('#trainer-bars')).toHaveValue('2');
  await expect(page.locator('#trainer-increment')).toHaveValue('3');
  await expect(page.locator('#trainer-target')).toHaveValue('138');
  await page.locator('#preset-file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{bad json')});
  await expect(page.locator('#preset-status')).toContainText(/could not|valid|read|JSON|format/i);
  await expect(page.locator('#preset-list option')).toHaveCount(2);
  await page.reload();await expect(page.locator('#preset-list option')).toHaveCount(2);
});

test('tempo trainer reaches its target on bar boundaries and restarts at the saved starting tempo',async({page})=>{
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;(window as any).__trainerBeats=[];
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);
        this.port.addEventListener('message',({data})=>{if(data.type!=='harmony'&&data.beat===0&&!data.counting)(window as any).__trainerBeats.push(data);});
      }
    };
  });
  await page.goto('/');
  await page.locator('#bpm').fill('236');await page.locator('#bpm').blur();await page.locator('#beats').selectOption('3');
  await page.locator('#trainer-enabled').check();await page.locator('#trainer-bars').selectOption('1');
  await page.locator('#trainer-increment').fill('2');await page.locator('#trainer-increment').blur();
  await page.locator('#trainer-target').fill('240');await page.locator('#trainer-target').blur();
  await page.locator('#play').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__trainerBeats.length)).toBeGreaterThanOrEqual(3);
  const beats=await page.evaluate(()=>(window as any).__trainerBeats.slice(0,3));
  expect(beats.map((b:any)=>b.bpm)).toEqual([236,238,240]);
  await expect(page.locator('#bpm')).toHaveValue('236');
  await expect(page.locator('#trainer-status')).toContainText('240');
  await page.locator('#guitar-title').scrollIntoViewIfNeeded();await expect(page.locator('#mini-bpm')).toHaveValue('240');
  await page.locator('#mini-play').click();
  await expect(page.locator('#mini-play')).toBeEnabled();
  const startsBefore=await page.evaluate(()=>(window as any).__trainerBeats.filter((beat:any)=>beat.bar===1).length);
  await page.locator('#mini-play').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__trainerBeats.filter((beat:any)=>beat.bar===1).length)).toBeGreaterThan(startsBefore);
  expect(await page.evaluate(()=>(window as any).__trainerBeats.filter((beat:any)=>beat.bar===1).at(-1).bpm)).toBe(236);
  await page.locator('#mini-play').click();
});

test('modal templates keep their tonic scale across supporting chords and explain the mode',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#pedal')).toHaveAttribute('aria-pressed','true');
  await page.locator('#mode-template').click();
  await expect(page.locator('#progression')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#template')).toHaveValue('modal_dorian');
  await page.locator('#quality').selectOption('major');await page.locator('#template').selectOption('modal_dorian');
  await expect(page.locator('#quality')).toHaveValue('dorian');
  await expect(page.locator('#chord')).toBeHidden();
  await expect(page.locator('#progression-strip>button')).toHaveCount(2);
  await expect(page.locator('#harmony-explanation')).toContainText('natural 6');
  const notes=await page.locator('#note-list strong').allTextContents();
  await page.locator('#audition').uncheck();await page.locator('#progression-strip>button').nth(1).click();
  await expect(page.locator('#guitar-context')).toHaveText('D7');
  await expect(page.locator('#guitar-scale')).toContainText('A Dorian');
  expect(await page.locator('#note-list strong').allTextContents()).toEqual(notes);
  await expect(page.locator('#characteristic-notes')).toContainText('F♯ (6)');
  await page.locator('#quality').selectOption('lydian');
  await expect(page.locator('#template')).toHaveValue('modal_lydian');
  await expect(page.locator('#harmony-explanation')).toContainText('raised 4');
});

test('a saved diatonic major preset restores from the default Dorian session before playback',async({page})=>{
  await page.goto('/');await page.locator('#quality').selectOption('major');await page.locator('#key').selectOption('0');
  await page.locator('#progression').click();await page.locator('#template').selectOption('diatonic');
  await page.locator('#preset-name').fill('C major diatonic');await page.locator('#preset-save').click();
  const id=await page.locator('#preset-list').inputValue();
  await page.reload();await expect(page.locator('#quality')).toHaveValue('dorian');
  await expect(page.locator('#key')).toHaveValue('9');
  expect(await page.locator('#template option[value=diatonic]').evaluate(option=>(option as HTMLOptionElement).disabled)).toBe(true);
  await page.locator('#preset-list').selectOption(id);await page.locator('#preset-load').click();
  await expect(page.locator('#quality')).toHaveValue('major');await expect(page.locator('#key')).toHaveValue('0');
  await expect(page.locator('#progression')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#template')).toHaveValue('diatonic');
  await expect(page.locator('#progression-strip>button')).toHaveCount(4);
  await expect(page.locator('#chord-notes')).toHaveText('C · E · G');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();await page.locator('#beats').selectOption('3');
  await page.locator('#play').click();await expect(page.locator('#play-status')).toContainText('Playing');
  await expect(page.locator('#guitar-context')).toHaveText('Am',{timeout:2000});
  await expect(page.locator('#template')).toHaveValue('diatonic');
  await page.locator('#play').click();
});

test('older presets load with tempo training off and all guitar positions',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mehtronome-practice-presets-v1',JSON.stringify({version:1,items:[{id:'legacy',name:'Earlier setup',progression:false,controls:{bpm:'80',quality:'major',key:'0',chord:'maj7'}}]})));
  await page.goto('/');await page.locator('#trainer-enabled').check();await page.locator('#featured-position').selectOption('IV');
  await page.locator('#preset-list').selectOption('legacy');await page.locator('#preset-load').click();
  await expect(page.locator('#trainer-enabled')).not.toBeChecked();await expect(page.locator('#featured-position')).toHaveValue('all');
  await expect(page.locator('#bpm')).toHaveValue('80');await expect(page.locator('#chord-name')).toHaveText('Cmaj7');
});
