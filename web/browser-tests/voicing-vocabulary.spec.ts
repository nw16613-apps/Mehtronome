import {test,expect,type Locator,type Page} from '@playwright/test';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor} from '../src/guitar/fretboard.js';
import {voiceLeadingFor} from '../src/guitar/voicings.js';

const cards=(page:Page)=>page.locator('#voicing-diagrams .voicing-card');
const guitarPosition=(page:Page,position:string)=>page.locator(`#guitar-diagrams [data-position="${position}"]`);

async function notesIn(card:Locator) {
  return card.locator('.fret-note').evaluateAll(notes=>notes.map(note=>{
    const string=Number(note.getAttribute('data-string'));
    const fret=Number(note.getAttribute('data-fret'));
    return {string,fret,midi:[40,45,50,55,59,64][string]+fret,pc:Number(note.getAttribute('data-pc'))};
  }));
}

async function noteCoordinates(notes:Locator) {
  return notes.evaluateAll(nodes=>nodes.map(note=>`${note.getAttribute('data-string')}:${note.getAttribute('data-fret')}:${note.getAttribute('data-pc')}`).sort());
}

async function useApproach(page:Page,approach:string) {
  await page.locator('#voicing-approach').selectOption(approach);
  if(approach!=='drop')await page.locator('#voicing-strings').selectOption('all');
  await expect(cards(page)).not.toHaveCount(0);
  await page.locator('.voicing-study').evaluate((node:HTMLDetailsElement)=>node.open=true);
}

async function captureAuditions(page:Page) {
  await page.addInitScript(()=>{
    const Original=window.AudioWorkletNode;
    (window as any).__vocabularyAuditions=[];
    window.AudioWorkletNode=class extends Original{
      constructor(context:BaseAudioContext,name:string,options?:AudioWorkletNodeOptions){
        super(context,name,options);
        const post=this.port.postMessage.bind(this.port);
        this.port.postMessage=(data:any,transfer?:Transferable[])=>{
          if(data.type==='audition')(window as any).__vocabularyAuditions.push(data);
          if(transfer)post(data,transfer);else post(data);
        };
      }
    };
  });
}

function containsTriad(pcs:number[]) {
  return pcs.some(root=>[[0,4,7],[0,3,7],[0,3,6],[0,4,8]].some(intervals=>intervals.every(interval=>pcs.includes((root+interval)%12))));
}

test('vocabulary approaches show their real chord formulas and strum the exact displayed pitches',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await captureAuditions(page);await page.goto('/');
  await expect(page.locator('#voicing-approach')).toHaveValue('drop');
  await expect(page.locator('#voicing-type')).toBeVisible();
  await expect(cards(page)).toHaveCount(4);
  for(const approach of ['shell','rootless','triad','quartal']){
    await useApproach(page,approach);
    await expect(page.locator('#voicing-type')).toBeHidden();
    for(const card of await cards(page).all()){
      const notes=await notesIn(card),pcs=notes.map(note=>note.pc);
      expect(notes.length).toBeGreaterThanOrEqual(3);expect(notes.length).toBeLessThanOrEqual(4);
      expect(new Set(notes.map(note=>note.string)).size).toBe(notes.length);
      expect(new Set(pcs).size).toBe(notes.length);
      expect(notes.every(note=>note.fret>=1&&note.fret<=24)).toBe(true);
      expect(Math.max(...notes.map(note=>note.fret))-Math.min(...notes.map(note=>note.fret))).toBeLessThanOrEqual(4);
      if(approach==='shell')expect(pcs).toEqual(expect.arrayContaining([9,0,7]));
      if(approach==='rootless'){
        expect(pcs).not.toContain(9);expect(pcs).toEqual(expect.arrayContaining([0,7]));
      }
      if(approach==='triad')expect(containsTriad(pcs)).toBe(true);
      if(approach==='quartal'){
        const pitches=notes.map(note=>note.midi).sort((a,b)=>a-b);
        expect(pitches.slice(1).every((midi,index)=>[5,6].includes(midi-pitches[index]))).toBe(true);
      }
    }
    const card=cards(page).first(),expected=(await notesIn(card)).map(note=>note.midi);
    await card.locator('.voicing-preview').click();
    await expect(page.locator('#voicing-preview-status')).toBeVisible();
    const message=await page.evaluate(()=>(window as any).__vocabularyAuditions.at(-1));
    expect(message.notes).toEqual(expected);expect(message.acoustic).toBe(true);
    await card.locator('.voicing-preview').click();
    await expect(page.locator('#voicing-preview-status')).toBeHidden();
  }
  await useApproach(page,'drop');await expect(page.locator('#voicing-type')).toBeVisible();
  expect(errors).toEqual([]);
});

test('CAGED position, fixed fret range and top-note filters constrain every suggested shape',async({page})=>{
  await page.goto('/');await useApproach(page,'shell');
  await page.locator('#featured-position').selectOption('IV');
  await expect(page.locator('#voicing-region')).toHaveValue('position');
  await expect(page.locator('#voicing-position')).toHaveValue('IV');
  const position=fretboardFor(harmonyAt({key:9,mode:'dorian',chord:'min13'}),'A');
  await expect(cards(page)).not.toHaveCount(0);
  for(const card of await cards(page).all()){
    const notes=await notesIn(card);
    expect(notes.every(note=>note.fret>=Math.max(1,position.start-2)&&note.fret<=Math.min(24,position.end+2))).toBe(true);
  }
  await page.locator('#voicing-position').selectOption('II');
  await expect(page.locator('#featured-position')).toHaveValue('II');
  await page.locator('#voicing-region').selectOption('fixed');
  await expect(page.locator('#voicing-fret-start')).toBeVisible();
  await page.locator('#voicing-fret-start').fill('8');await page.locator('#voicing-fret-end').fill('12');await page.locator('#voicing-fret-end').blur();
  await expect(cards(page)).not.toHaveCount(0);
  for(const card of await cards(page).all())expect((await notesIn(card)).every(note=>note.fret>=6&&note.fret<=14)).toBe(true);
  const first=await notesIn(cards(page).first());
  const top=first.reduce((highest,note)=>note.midi>highest.midi?note:highest);
  const relative=String((top.pc-9+12)%12);
  await page.locator('#voicing-top').selectOption(relative);
  await expect(cards(page)).not.toHaveCount(0);
  for(const card of await cards(page).all()){
    const notes=await notesIn(card),highest=notes.reduce((a,b)=>a.midi>b.midi?a:b);
    expect(highest.pc).toBe(top.pc);
    expect(notes.every(note=>note.fret>=6&&note.fret<=14)).toBe(true);
  }
  await page.locator('#voicing-region').selectOption('any');
  await page.locator('#voicing-approach').selectOption('rootless');
  await page.locator('#voicing-top').selectOption('0');
  await expect(cards(page)).toHaveCount(0);
  await expect(page.locator('#voicing-empty')).toBeVisible();
  await expect(page.locator('#voicing-empty')).toContainText(/no|choose|try/i);
});

test('mapping a vocabulary chord highlights its exact string and fret locations in one CAGED position',async({page})=>{
  await captureAuditions(page);await page.goto('/');await useApproach(page,'shell');
  await page.locator('#voicing-region').selectOption('position');
  await page.locator('#voicing-position').selectOption('IV');
  await expect(cards(page)).not.toHaveCount(0);
  const selected=cards(page).first();
  const expected=await noteCoordinates(selected.locator('.fret-note'));
  const untouched=await noteCoordinates(guitarPosition(page,'I').locator('.fret-note'));
  const original=await noteCoordinates(guitarPosition(page,'IV').locator('.fret-note'));
  const expectedPitches=(await notesIn(selected)).map(note=>note.midi);
  await selected.locator('[data-map-voicing]').click();
  const mapped=guitarPosition(page,'IV');
  expect(await noteCoordinates(mapped.locator('.mapped-chord-note'))).toEqual(expected);
  await expect(mapped.locator('.mapped-chord-ring')).toHaveCount(expected.length);
  await expect(mapped.locator('svg')).toHaveClass(/mapped-chord-active/);
  await expect(mapped.locator('.grip-finger')).toHaveCount(0);
  expect(await noteCoordinates(guitarPosition(page,'I').locator('.fret-note'))).toEqual(untouched);
  await expect(page.locator('#guitar-diagrams [data-position]:not([data-position="IV"]) .mapped-chord-note')).toHaveCount(0);
  await mapped.locator('.grip-preview').click();
  await expect(page.locator('#grip-preview-status')).toBeVisible();
  expect((await page.evaluate(()=>(window as any).__vocabularyAuditions.at(-1))).notes).toEqual(expectedPitches);
  await mapped.locator('.grip-preview').click();
  await page.locator('#clear-mapped-chord').click();
  expect(await noteCoordinates(guitarPosition(page,'IV').locator('.fret-note'))).toEqual(original);
  await cards(page).first().locator('[data-map-voicing]').click();
  await page.locator('#voicing-approach').selectOption('rootless');
  await expect(page.locator('#guitar-diagrams .mapped-chord-note')).toHaveCount(0);
});

test('a voice-leading anchor survives a progression change and ranks the nearest physical connection first',async({page})=>{
  await page.goto('/');await useApproach(page,'shell');
  const anchor={notes:await notesIn(cards(page).first())};
  await cards(page).first().locator('[data-anchor-voicing]').click();
  await expect(page.locator('#voicing-anchor-status')).toContainText('Am13');
  await page.locator('#voicing-leading').check();
  await page.locator('#progression').click();await page.locator('#key').selectOption('0');
  await page.locator('#template').selectOption('major251');await page.locator('#audition').uncheck();
  await page.locator('#progression-strip > button').nth(1).click();
  await expect(page.locator('#voicings-chord')).toHaveText('G7alt');
  await expect(page.locator('#voicing-anchor-status')).toContainText('Am13');
  await expect(cards(page)).not.toHaveCount(0);
  const distances:number[]=[];
  for(const card of await cards(page).all())distances.push(voiceLeadingFor(anchor,{notes:await notesIn(card)}).distance);
  expect(distances[0]).toBe(Math.min(...distances));
  await cards(page).first().locator('[data-map-voicing]').click();
  await expect(page.locator('#guitar-diagrams .voice-motion')).not.toHaveCount(0);
  await page.locator('#voicing-clear-anchor').click();
  await expect(page.locator('#voicing-anchor-status')).not.toContainText('Am13');
});

test('pinned shapes persist after reload and filter by harmony before being removed',async({page})=>{
  await page.goto('/');
  const first=cards(page).first(),expected=await noteCoordinates(first.locator('.fret-note'));
  await first.locator('[data-pin-voicing]').click();
  await page.reload();
  await page.locator('#voicing-pinned-only').check();
  await expect(cards(page)).toHaveCount(1);
  expect(await noteCoordinates(cards(page).first().locator('.fret-note'))).toEqual(expected);
  await page.locator('#key').selectOption('0');
  await expect(cards(page)).toHaveCount(0);await expect(page.locator('#voicing-empty')).toBeVisible();
  await page.locator('#key').selectOption('9');await expect(cards(page)).toHaveCount(1);
  await cards(page).first().locator('[data-pin-voicing]').click();
  await expect(cards(page)).toHaveCount(0);await expect(page.locator('#voicing-empty')).toBeVisible();
  await page.reload();await page.locator('#voicing-pinned-only').check();await expect(cards(page)).toHaveCount(0);
});

test('study filters survive a preset, keep a fixed region through chord changes and fit a mobile screen',async({page})=>{
  await page.goto('/');await useApproach(page,'rootless');
  await page.locator('#voicing-region').selectOption('fixed');
  await page.locator('#voicing-fret-start').fill('8');await page.locator('#voicing-fret-start').blur();
  await page.locator('#voicing-fret-end').fill('12');await page.locator('#voicing-fret-end').blur();
  await page.locator('#voicing-top').selectOption('10');
  await page.locator('#preset-name').fill('Rootless area study');await page.locator('#preset-save').click();
  await useApproach(page,'quartal');await page.locator('#voicing-region').selectOption('any');
  await page.locator('#voicing-top').selectOption('any');await page.locator('#preset-load').click();
  await expect(page.locator('#voicing-approach')).toHaveValue('rootless');
  await expect(page.locator('#voicing-strings')).toHaveValue('all');
  await expect(page.locator('#voicing-region')).toHaveValue('fixed');
  await expect(page.locator('#voicing-fret-start')).toHaveValue('8');
  await expect(page.locator('#voicing-fret-end')).toHaveValue('12');
  await expect(page.locator('#voicing-top')).toHaveValue('10');
  await page.locator('#voicing-top').selectOption('any');
  await page.locator('#progression').click();await page.locator('#template').selectOption('major251');
  await page.locator('#audition').uncheck();
  for(const index of [0,1,2]){
    await page.locator('#progression-strip > button').nth(index).click();
    await expect(cards(page)).not.toHaveCount(0);
    await expect(page.locator('#voicing-fret-start')).toHaveValue('8');
    await expect(page.locator('#voicing-fret-end')).toHaveValue('12');
    for(const card of await cards(page).all())expect((await notesIn(card)).every(note=>note.fret>=6&&note.fret<=14)).toBe(true);
  }
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('#voicing-type')).toBeHidden();
  await page.locator('#voicing-region').selectOption('position');
  await page.locator('#voicing-position').selectOption('V');
  await expect(page.locator('#featured-position')).toHaveValue('V');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
