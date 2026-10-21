import {test,expect,type Page} from '@playwright/test';
import {harmonyAt,MODES} from '../src/audio/music.js';
import {theoryOptions} from '../src/guitar/superimposition.js';
import {fretboardFor,POSITIONS} from '../src/guitar/fretboard.js';

const card=(page:Page,position:string)=>page.locator(`#guitar-diagrams [data-position="${position}"]`);
const coordinates=(page:Page)=>page.locator('#guitar-diagrams .fret-note').evaluateAll(notes=>notes.map(n=>[n.getAttribute('data-string'),n.getAttribute('data-fret'),n.getAttribute('data-pc')]));

async function expectOverlay(page:Page,position:string,kind:'pentatonic'|'triads',harmony:ReturnType<typeof harmonyAt>){
  const options=theoryOptions(harmony);
  const selected=await page.locator('#theory-choice-'+position).inputValue();
  const suggestions=kind==='pentatonic'?options.pentatonics:options.triadPairs;
  const suggestion=suggestions.find((option:any)=>option.id===selected)!;
  expect(suggestion).toBeTruthy();
  const geometry=await card(page,position).getAttribute('data-geometry');
  const board=fretboardFor(harmony,geometry!);
  const expected=board.notes.filter(n=>suggestion.pcs.includes(n.pc)).map(n=>`${n.string}:${n.fret}:${n.pc}`).sort();
  const actual=await card(page,position).locator('.theory-note').evaluateAll(notes=>notes.map(n=>`${n.getAttribute('data-string')}:${n.getAttribute('data-fret')}:${n.getAttribute('data-pc')}`).sort());
  expect(actual).toEqual(expected);
  await expect(card(page,position).locator('svg')).toHaveClass(new RegExp(`theory-${kind}`));
  await expect(card(page,position).locator('svg')).toHaveAttribute('aria-label',new RegExp(kind==='pentatonic'?'pentatonic|five-note':'triad','i'));
  if(kind==='triads'){
    const pair=suggestion as typeof options.triadPairs[number];
    for(const [group,label] of pair.groups.map((group:any,index:number)=>[group,index===0?'a':'b']) as [any,string][]){
      const expectedGroup=board.notes.filter(n=>group.pcs.includes(n.pc)).map(n=>`${n.string}:${n.fret}:${n.pc}`).sort();
      const actualGroup=await card(page,position).locator(`[data-theory-group="${label}"]`).evaluateAll(notes=>notes.map(n=>`${n.getAttribute('data-string')}:${n.getAttribute('data-fret')}:${n.getAttribute('data-pc')}`).sort());
      expect(actualGroup).toEqual(expectedGroup);
    }
    expect(pair.groups[0].pcs.filter((pc:number)=>pair.groups[1].pcs.includes(pc))).toEqual([]);
    await expect(card(page,position).locator('.theory-badge')).not.toHaveCount(0);
  }
}

test('each CAGED position independently overlays its suggested pentatonic or triad pair without changing fingerings',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  const before=await coordinates(page);
  for(const position of ['I','II','III','IV','V'])await expect(page.locator('#theory-view-'+position)).toHaveValue('none');
  await page.locator('#theory-view-I').selectOption('pentatonic');
  await page.locator('#theory-view-IV').selectOption('triads');
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'});
  await expectOverlay(page,'I','pentatonic',harmony);await expectOverlay(page,'IV','triads',harmony);
  await expect(page.locator('#theory-view-II')).toHaveValue('none');
  await expect(card(page,'II').locator('.theory-note')).toHaveCount(0);
  expect(await coordinates(page)).toEqual(before);
  await expect(card(page,'I').locator('.grip-ring')).toHaveCount(0);
  await expect(card(page,'IV').locator('.characteristic-ring')).toHaveCount(0);
  await page.locator('#theory-view-I').selectOption('none');await page.locator('#theory-view-IV').selectOption('none');
  expect(await coordinates(page)).toEqual(before);
  await expect(card(page,'I').locator('.grip-ring')).not.toHaveCount(0);
  expect(errors).toEqual([]);
});

test('theory suggestions transpose and follow major, melodic-minor and harmonic-minor modes',async({page})=>{
  await page.goto('/');await page.locator('#theory-view-I').selectOption('pentatonic');await page.locator('#theory-view-II').selectOption('triads');
  for(const [mode,key] of [['major','0'],['dorian','2'],['lydian','6'],['melodic_minor','9'],['altered','7'],['harmonic_minor','0'],['ultralocrian','6']]){
    await page.locator('#quality').selectOption(mode);await page.locator('#key').selectOption(key);
    const harmony=harmonyAt({key:Number(key),mode,chord:MODES[mode as keyof typeof MODES].chord});
    await expectOverlay(page,'I','pentatonic',harmony);await expectOverlay(page,'II','triads',harmony);
    const pcs=await page.locator('#guitar-diagrams .theory-note').evaluateAll(notes=>notes.map(n=>Number(n.getAttribute('data-pc'))));
    expect(pcs.every(pc=>harmony.scalePcs.includes(pc))).toBe(true);
  }
});

test('pentatonic menu lists every parent-scale minor pentatonic and one modal choice',async({page})=>{
  await page.goto('/');
  await page.locator('#theory-view-I').selectOption('pentatonic');
  const names=()=>page.locator('#theory-choice-I option').allTextContents();
  expect(await names()).toEqual(['A minor pentatonic','B minor pentatonic','E minor pentatonic','A Dorian modal pentatonic']);

  await page.locator('#key').selectOption('0');await page.locator('#quality').selectOption('lydian');
  expect(await names()).toEqual(['E minor pentatonic','A minor pentatonic','B minor pentatonic','C Lydian modal pentatonic']);

  await page.locator('#quality').selectOption('harmonic_minor');
  expect(await names()).toEqual(['C Harmonic minor modal pentatonic']);
});

test('turning overlays off restores arpeggio view and related modes retain their parent-major geometry',async({page})=>{
  await page.goto('/');await page.locator('#key').selectOption('0');await page.locator('#quality').selectOption('major');
  const major=await coordinates(page);
  await page.locator('#quality').selectOption('dorian');await page.locator('#key').selectOption('2');
  expect(await coordinates(page)).toEqual(major);
  await page.locator('#exercise').selectOption('arpeggio');
  const arpeggio=await card(page,'I').locator('.fret-note').count();
  await page.locator('#theory-view-I').selectOption('pentatonic');
  expect(await card(page,'I').locator('.fret-note').count()).toBeGreaterThan(arpeggio);
  await page.locator('#theory-view-I').selectOption('none');
  await expect(card(page,'I').locator('.fret-note')).toHaveCount(arpeggio);
  await expect(page.locator('#exercise')).toHaveValue('arpeggio');
});

test('position theory choices survive presets and remain legible in featured Focus view on mobile',async({page})=>{
  await page.goto('/');await page.locator('#theory-view-I').selectOption('pentatonic');await page.locator('#theory-view-IV').selectOption('triads');
  for(const position of ['I','IV']){
    const choices=await page.locator('#theory-choice-'+position+' option').evaluateAll(options=>options.map(n=>(n as HTMLOptionElement).value));
    await page.locator('#theory-choice-'+position).selectOption(choices.at(-1)!);
  }
  const pent=await page.locator('#theory-choice-I').inputValue(),pair=await page.locator('#theory-choice-IV').inputValue();
  await page.locator('#preset-name').fill('Dorian theory');await page.locator('#preset-save').click();
  await page.locator('#theory-view-I').selectOption('none');await page.locator('#theory-view-IV').selectOption('none');
  await page.locator('#preset-load').click();
  await expect(page.locator('#theory-view-I')).toHaveValue('pentatonic');await expect(page.locator('#theory-choice-I')).toHaveValue(pent);
  await expect(page.locator('#theory-view-IV')).toHaveValue('triads');await expect(page.locator('#theory-choice-IV')).toHaveValue(pair);
  await page.locator('#fret-labels').selectOption('notes');
  await expect(card(page,'I').locator('.fret-note > text').first()).toHaveText(/^[A-G]/);
  await page.locator('#fret-labels').selectOption('degrees');
  await expect(card(page,'I').locator('.fret-note > text').first()).toHaveText(/[1-7]/);
  await page.locator('#featured-position').selectOption('IV');await page.locator('#focus-view').click();
  for(const palette of ['light','dark','midnight','plum']){
    await page.locator('#palette').selectOption(palette);
    for(const width of [1440,900,390]){
      await page.setViewportSize({width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await expect(card(page,'IV')).toHaveClass(/featured-position/);
      await expect(card(page,'IV').locator('.theory-a')).not.toHaveCount(0);await expect(card(page,'IV').locator('.theory-b')).not.toHaveCount(0);
    }
  }
  await page.locator('#exit-focus').click();
});
