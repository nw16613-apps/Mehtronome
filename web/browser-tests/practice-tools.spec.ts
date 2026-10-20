import {test,expect} from '@playwright/test';
import {PRESET_CONTROLS} from '../src/practice/presets.js';

test('practice presets restore the complete setup, stop playback, persist, update and delete',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.locator('#preset-save').click();
  await expect(page.locator('#preset-status')).toContainText('name first');
  await page.locator('#quality').selectOption('lydian');await page.locator('#key').selectOption('7');
  await page.locator('#sound').selectOption('strings');
  await page.locator('#bpm').fill('126');await page.locator('#bpm').blur();
  await page.locator('#count-in').uncheck();await page.locator('#accent').uncheck();
  await page.locator('#beats').selectOption('5');await page.locator('#subdivision').selectOption('3');
  await page.locator('#click').fill('29');await page.locator('#harmony').fill('22');await page.locator('#space').fill('31');
  await page.locator('#sequence').check();await page.locator('#sequence-pattern').selectOption('updown');
  await page.locator('#sequence-rate').selectOption('4');await page.locator('#sequence-swing').fill('30');
  await page.locator('#drums').check();await page.locator('#drum-groove').selectOption('bossa');
  await page.locator('#bass').check();await page.locator('#bass-pattern').selectOption('funk');
  await page.locator('#gap-enabled').check();await page.locator('#gap-play').selectOption('2');await page.locator('#gap-mute').selectOption('2');await page.locator('#gap-target').selectOption('click');
  await page.locator('#progression').click();await page.locator('#template').selectOption('parallel2');
  await page.locator('#loop-enabled').check();await page.locator('#loop-start').selectOption('3');await page.locator('#loop-end').selectOption('1');
  await page.locator('#exercise').selectOption('arpeggio');await page.locator('#fret-labels').selectOption('degrees');
  await page.locator('#voicing-type').selectOption('drop24');
  const stringSet=await page.locator('#voicing-strings option').last().getAttribute('value');
  await page.locator('#voicing-strings').selectOption(stringSet!);await page.locator('#voicing-labels').selectOption('intervals');
  await page.locator('#highlight-mode').uncheck();await page.locator('#audition').uncheck();
  const values=()=>page.evaluate(ids=>Object.fromEntries(ids.map(id=>{
    const c=document.getElementById(id) as HTMLInputElement|HTMLSelectElement;
    return [id,c instanceof HTMLInputElement&&c.type==='checkbox'?c.checked:c.value];
  })),PRESET_CONTROLS);
  const original=await values();
  await page.locator('#preset-name').fill('Lydian <practice>');await page.locator('#preset-save').click();
  await expect(page.locator('#preset-status')).toContainText('Saved');
  const id=await page.locator('#preset-list').inputValue();
  await page.reload();await expect(page.locator('#preset-list option')).toHaveCount(2);
  await expect(page.locator('#bpm')).toHaveValue('90'); // explicit load, never surprise playback
  await page.locator('#count-in').uncheck();await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  await page.locator('#preset-list').selectOption(id);await page.locator('#preset-load').click();
  await expect(page.locator('#preset-status')).toContainText('Ready to practice');
  await expect(page.locator('#play')).toHaveAttribute('aria-pressed','false');
  expect(await values()).toEqual(original);
  await expect(page.locator('#progression')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#loop-summary')).toContainText('Wraps across');
  await expect(page.locator('#tempo')).toHaveValue('126');
  await expect(page.locator('.fret-note.characteristic')).toHaveCount(0);
  await page.locator('#preset-name').fill('Evening session');await page.locator('#bpm').fill('114');await page.locator('#bpm').blur();
  await page.locator('#preset-update').click();await page.reload();
  await page.locator('#preset-list').selectOption(id);await expect(page.locator('#preset-name')).toHaveValue('Evening session');
  await page.locator('#preset-load').click();await expect(page.locator('#bpm')).toHaveValue('114');
  await page.locator('#preset-delete').click();await page.reload();
  await expect(page.locator('#preset-list option')).toHaveCount(1);await expect(page.locator('#preset-load')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('preset storage failures are visible and do not pretend a setup was saved',async({page})=>{
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('Unavailable');};});
  await page.goto('/');await page.locator('#preset-name').fill('Practice');await page.locator('#preset-save').click();
  await expect(page.locator('#preset-status')).toContainText('Could not save');
  await expect(page.locator('#preset-list option')).toHaveCount(1);
  await expect(page.locator('#preset-name')).toHaveValue('Practice');
});

test('selected loops drive playback and diagrams, keep tonic holds and reset safely with templates',async({page})=>{
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;(window as any).__practiceBeats=[];
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);this.port.addEventListener('message',({data})=>{if(data.beat===0&&!data.counting)(window as any).__practiceBeats.push(data);});
      }
    };
  });
  await page.goto('/');await page.locator('#progression').click();await page.locator('#template').selectOption('major251');
  await page.locator('#loop-enabled').check();await page.locator('#loop-start').selectOption('1');await page.locator('#loop-end').selectOption('2');
  await expect(page.locator('#loop-summary')).toContainText('3 bars');
  await expect(page.locator('#chord-caption')).toHaveText('3-BAR SELECTED LOOP');
  await expect(page.locator('#progression-strip>button').nth(0)).toHaveClass(/outside-loop/);
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();await page.locator('#beats').selectOption('3');await page.locator('#count-in').uncheck();
  await page.locator('#play').click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__practiceBeats.length)).toBeGreaterThanOrEqual(4);
  expect(await page.evaluate(()=>(window as any).__practiceBeats.slice(0,4).map((b:any)=>b.step))).toEqual([1,2,2,1]);
  await page.locator('#play').click();await page.locator('#template').selectOption('fourths1');
  await expect(page.locator('#loop-enabled')).not.toBeChecked();await expect(page.locator('#loop-start option')).toHaveCount(12);
  await page.locator('#loop-enabled').check();await page.locator('#loop-start').selectOption('11');await page.locator('#loop-end').selectOption('0');
  await expect(page.locator('#loop-summary')).toContainText('2 bars');await expect(page.locator('#loop-summary')).toContainText('Wraps across');
});

test('colour-note rings follow modal harmony and remain optional in scale and arpeggio views',async({page})=>{
  await page.goto('/');await page.locator('#quality').selectOption('dorian');
  await expect(page.locator('#characteristic-notes')).toContainText('A (6)');
  await expect(page.locator('#note-list .characteristic strong')).toHaveText('A');
  expect(await page.locator('.fret-note.characteristic').count()).toBeGreaterThan(5);
  expect(await page.locator('.fret-note.characteristic').evaluateAll(notes=>notes.every(n=>n.getAttribute('data-pc')==='9'))).toBe(true);
  await page.locator('#exercise').selectOption('arpeggio');await expect(page.locator('#note-list .characteristic strong')).toHaveText('A');
  await page.locator('#quality').selectOption('harmonic_minor');await expect(page.locator('#characteristic-notes')).toContainText('A♭ (♭6)');await expect(page.locator('#characteristic-notes')).toContainText('B (7)');
  await page.locator('#progression').click();await page.locator('#template').selectOption('major251');await page.locator('#audition').uncheck();
  await page.locator('#progression-strip>button').nth(1).click();await expect(page.locator('#characteristic-notes')).toContainText('G Altered');await expect(page.locator('#characteristic-notes')).toContainText('A♭ (♭2)');
  await page.locator('#progression-strip>button').nth(2).click();await expect(page.locator('#characteristic-notes')).toContainText('F♯ (♯4)');
  for(const palette of ['dark','midnight','paper','plum','slate','light']){
    await page.locator('#palette').selectOption(palette);
    expect(await page.locator('.characteristic-ring').first().evaluate(n=>getComputedStyle(n).stroke)).not.toBe('none');
  }
  await page.locator('#highlight-mode').uncheck();await expect(page.locator('.fret-note.characteristic')).toHaveCount(0);await expect(page.locator('#characteristic-notes')).toBeHidden();
  for(const width of [1440,760,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('all-sound gaps silence the actual master including long reverb tails, then resume',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);const createGain=context.createGain.bind(context);let count=0;
        context.createGain=()=>{const gain=createGain();if(count++===0){const analyser=context.createAnalyser();analyser.fftSize=512;gain.connect(analyser);(window as any).__practiceMaster=analyser;}return gain;};
      }
    };
  });
  await page.goto('/');await page.locator('#gap-enabled').check();await page.locator('#gap-play').selectOption('1');
  await page.locator('#bpm').fill('240');await page.locator('#bpm').blur();await page.locator('#beats').selectOption('3');await page.locator('#count-in').uncheck();
  await page.locator('#sound').selectOption('atmosphere');await page.locator('#space').fill('100');
  await page.locator('#drums').check();await page.locator('#bass').check();await page.locator('#sequence').check();
  await page.locator('#play').click();
  await expect(page.locator('#play-status')).toContainText('Playing');
  const peak=()=>page.evaluate(()=>{const a=(window as any).__practiceMaster as AnalyserNode;const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);return Math.max(...data.map(Math.abs));});
  await expect.poll(peak).toBeGreaterThan(.005);
  await expect(page.locator('#play-status')).toContainText('Gap');
  await expect.poll(peak,{intervals:[25,50,50],timeout:600}).toBeLessThan(1e-7);
  await expect(page.locator('#play-status')).toContainText('Playing · Bar 3');await expect.poll(peak).toBeGreaterThan(.005);
  await page.locator('#play').click();expect(errors).toEqual([]);
});

test('related modes use identical parent-major fingerings with modal root colours and labels',async({page})=>{
  await page.goto('/');
  const readBoards=()=>page.locator('#guitar-diagrams .position-card').evaluateAll(cards=>cards.map(card=>({
    position:(card as HTMLElement).dataset.position,
    notes:Array.from(card.querySelectorAll('.fret-note')).map(note=>[note.getAttribute('data-string'),note.getAttribute('data-fret'),note.getAttribute('data-pc')]),
  })));
  const baseline=await readBoards();
  for(const [mode,key] of [['major','0'],['dorian','2'],['phrygian','4'],['lydian','5'],['mixolydian','7'],['minor','9'],['locrian','11']]){
    await page.locator('#quality').selectOption(mode);await page.locator('#key').selectOption(key);
    expect(await readBoards()).toEqual(baseline);
    await expect(page.locator('#guitar-parent')).toContainText('CAGED shapes: C major');
    expect(await page.locator('#guitar-diagrams .fret-note.root').evaluateAll((notes,key)=>notes.length>0&&notes.every(n=>n.getAttribute('data-pc')===key),key)).toBe(true);
  }
  await page.locator('#quality').selectOption('major');await page.locator('#key').selectOption('5');
  const fMajor=await readBoards();
  await page.locator('#quality').selectOption('mixolydian');await page.locator('#key').selectOption('0');
  expect(await readBoards()).toEqual(fMajor);
  await expect(page.locator('#guitar-parent')).toHaveText('CAGED shapes: F major · chord/modal root: C.');
  await expect(page.locator('[data-position="IV"] .position-anchor')).toContainText('Shape anchor: F · A string, fret 8');
  await expect(page.locator('#characteristic-notes')).toContainText('B♭ (♭7)');
  await page.locator('#fret-labels').selectOption('degrees');
  await expect(page.locator('.fret-note.characteristic text').first()).toHaveText('♭7');
  await page.locator('#fret-view').selectOption('arpeggio');
  await expect(page.locator('#guitar-diagrams .fret-note.scale')).toHaveCount(0);
  await expect(page.locator('#guitar-parent')).toContainText('F major');
  for(const width of [1440,760,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
