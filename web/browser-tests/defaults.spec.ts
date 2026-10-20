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

test('voicings start on the highest strings and all backing controls share the mixer',async({page})=>{
  await page.goto('/');
  for(const [type,set] of [['drop2','4321'],['drop3','5321'],['drop24','5421'],['drop4','6321'],['drop2','4321']]){
    await page.locator('#voicing-type').selectOption(type);
    await expect(page.locator('#voicing-strings')).toHaveValue(set);
    const strings=await page.locator('#voicing-diagrams svg').evaluateAll(svgs=>svgs.map(svg=>Array.from(svg.querySelectorAll('.fret-note')).map(n=>6-Number(n.getAttribute('data-string'))).join('')));
    expect(strings).toEqual([set,set,set,set]);
  }
  await page.locator('#voicing-strings').selectOption('6543');
  await page.locator('#key').selectOption('0');await expect(page.locator('#voicing-strings')).toHaveValue('6543');
  const mixer=page.locator('section.mix');
  for(const id of ['click','harmony','space','drums','bass','sequence'])await expect(mixer.locator('#'+id)).toHaveCount(1);
  await mixer.locator('#drums').check();await mixer.locator('#bass').check();await mixer.locator('#sequence').check();
  for(const palette of ['light','dark','midnight']){
    await page.locator('#palette').selectOption(palette);
    for(const width of [1440,900,390]){
      await page.setViewportSize({width,height:1000});
      for(const id of ['drum-groove','bass-pattern','sequence-pattern','sequence-volume'])await expect(mixer.locator('#'+id)).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      const boxes=await mixer.locator('.mix-group').evaluateAll(groups=>groups.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
        const a=boxes[i],b=boxes[j];expect(a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1).toBe(true);
      }
    }
  }
});
