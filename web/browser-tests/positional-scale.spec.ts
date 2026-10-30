import {test,expect} from '@playwright/test';
import {harmonyAt,MODES} from '../src/audio/music.js';
import {fretboardFor} from '../src/guitar/fretboard.js';
const geometry={I:'D',II:'C',III:'A',IV:'G',V:'E'};
const pitches=async(page:any,slot:number)=>page.locator(`.exercise-note[data-group-index="${slot}"]`).evaluateAll(nodes=>nodes.map(n=>{const m=n.getAttribute('aria-label')!.match(/^(.+), string (\d), fret (\d+)/)!;return [0,64,59,55,50,45,40][Number(m[2])]+Number(m[3]);}));
test('positional scale uses the whole shape, both directions and all rhythms without changing menu order',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await expect(page.locator('#exercise-study optgroup[label="Scale sequences"] option').first()).toHaveText('Positional scale');await expect(page.locator('#exercise-material')).toBeHidden();await expect(page.locator('#exercise-phrase')).toHaveCount(0);await expect(page.locator('#exercise-stage option[value=cell]')).toHaveText('One run per chord');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const position of ['I','II','III','IV','V'])for(const motion of ['ascending','descending']){
  for(const slot of [0,1,2,3]){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
  await page.locator('#exercise-motion').selectOption(motion);
  const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),available=[...new Set(fretboardFor(h,geometry[position]).notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),ordered=motion==='ascending'?available:available.toReversed(),cycle=[...ordered,...ordered.slice(1,-1).toReversed()];
  const written=(await Promise.all([0,1,2,3].map(slot=>pitches(page,slot)))).flat();expect(written).toEqual(Array.from({length:64},(_,i)=>cycle[i%cycle.length]));
  for(const caption of await page.locator('.exercise-score .exercise-degree').allTextContents())expect(caption).toContain('Position '+position);
 }
 for(const [rhythm,count]of [['eighths',32],['triplets',48],['sixteenths',64]] as const){await page.locator('#exercise-rhythm').selectOption(rhythm);await expect(page.locator('.exercise-note')).toHaveCount(count);}
 await page.locator('#exercise-favourite').click();await page.locator('#exercise-study').selectOption('thirds');await page.locator('#exercise-favourites').selectOption('0');await expect(page.locator('#exercise-study')).toHaveValue('positionalscale');
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:4000});await page.locator('#exercise-preview').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('positional scale adapts across a mixed-mode chart and exposes pentatonic and symmetric scales',async({page})=>{
 const modes=['dorian','mixolydian','major','minor_pentatonic','whole_tone'].filter(mode=>mode in MODES),items=modes.map((mode,i)=>({id:mode,name:mode,key:9,beats:4,progression:{version:2,name:mode,steps:[{root:0,chord:MODES[mode].chord,mode,bars:1,bass:null},{root:2,chord:MODES[mode].chord,mode,bars:1,bass:null}]}}));
 items.push({id:'mixed',name:'Minor to dominant to major',key:9,beats:4,progression:{version:2,name:'Minor to dominant to major',steps:[{root:0,chord:'min7',mode:'dorian',bars:1,bass:null},{root:5,chord:'dom7',mode:'mixolydian',bars:1,bass:null},{root:10,chord:'maj7',mode:'major',bars:1,bass:null}]}});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(items=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items})),items);await page.goto('/');
 for(const item of items){await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:'+item.id);await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await expect(page.locator('#caged-exercise-title')).toContainText('Positional scale');await expect(page.locator('.exercise-note[data-group-index="1"]').first()).toBeVisible();for(const [slot,step]of item.progression.steps.entries()){const written=await pitches(page,slot),h=harmonyAt({key:(item.key+step.root)%12,mode:step.mode,chord:step.chord});expect(written).toHaveLength(16);expect(written.every(midi=>h.scalePcs.includes(midi%12))).toBe(true);}}
 expect(errors).toEqual([]);
});

test('Am7 to Cm7 rearticulates C at fret eight in notation and playback',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'shared-boundary',name:'Shared C boundary',key:9,beats:4,progression:{version:2,name:'Shared C boundary',steps:[{root:0,chord:'min7',mode:'dorian',bars:2,bass:null},{root:3,chord:'min7',mode:'dorian',bars:2,bass:null}]}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:shared-boundary');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of [[0,'II'],[1,'I']]as const){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 expect((await pitches(page,0)).at(-1)).toBe(48);expect((await pitches(page,1)).slice(0,5)).toEqual([48,50,51,53,55]);
 const entry=page.locator('.exercise-note[data-group-index="1"]').first();await expect(entry).toHaveAttribute('aria-label',/^C, string 6, fret 8,/);await expect(entry).toHaveAttribute('data-start-beat','8');
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="1"]').first()).toBeVisible({timeout:5000});await page.locator('#exercise-preview').click();expect(errors).toEqual([]);
});

test('the whole eight-bar modal chart preserves its turns without short dips at harmonic entries',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'whole-modal-chart',name:'Eight-bar modal turns',key:9,beats:4,progression:{version:2,name:'Eight-bar modal turns',steps:[0,3,6,9].map(root=>({root,chord:'min7',mode:'dorian',bars:2,bass:null}))}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:whole-modal-chart');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of [[0,'II'],[1,'I'],[2,'V'],[3,'III']]as const){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 for(const [slot,shape]of ['C','D','E','A'].entries()){
  const h=harmonyAt({key:(9+slot*3)%12,mode:'dorian',chord:'min7'}),line=[...new Set(fretboardFor(h,shape).notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),expected=[...line,...line.slice(1,-1).toReversed()];
  expect(await pitches(page,slot)).toEqual(expected);await expect(page.locator(`.exercise-note[data-group-index="${slot}"]`).nth(16)).toHaveAttribute('data-start-beat',String(slot*8+4));
 }
 await expect(page.locator('.exercise-note[data-group-index="2"]').first()).toHaveAttribute('aria-label',/^C, string 6, fret 8,/);await expect(page.locator('.exercise-note[data-group-index="3"]').first()).toHaveAttribute('aria-label',/^B, string 6, fret 7,/);expect(errors).toEqual([]);
});

test('reported eighth-note I-II-III-IV route begins bar three on high-E fret fourteen and descends',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-study').selectOption('positionalscale');await page.locator('#exercise-rhythm').selectOption('eighths');await page.locator('#exercise-stage').selectOption('full');await page.locator('#exercise-motion').selectOption('ascending');await page.locator('#exercise-position-navigation').selectOption('all');
 for(const [slot,position]of ['I','II','III','IV'].entries()){await page.locator(`.exercise-position-route [data-inspect-slot="${slot}"]`).click();await page.locator('#exercise-position').selectOption(position);}
 expect(await pitches(page,0)).toEqual([45,47,48,50,52,54,55,57]);expect(await pitches(page,1)).toEqual([59,60,62,64,66,67,69,71]);expect(await pitches(page,2)).toEqual([78,76,74,72,71,69,67,66]);
 await expect(page.locator('.exercise-note[data-note-index="16"]')).toHaveAttribute('aria-label',/^F♯, string 1, fret 14,/);await expect(page.locator('.exercise-note[data-note-index="16"]')).toHaveAttribute('data-start-beat','8');
 await page.locator('#exercise-backing').uncheck();await page.locator('#mini-count-in').uncheck();await page.locator('#exercise-tempo').fill('240');await page.locator('#exercise-tempo').dispatchEvent('change');await page.locator('#exercise-preview').click();await expect(page.locator('.exercise-note.playing[data-group-index="2"]').first()).toBeVisible({timeout:5000});await expect(page.locator('.exercise-map-heading')).toContainText('Position III');await page.locator('#exercise-preview').click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
