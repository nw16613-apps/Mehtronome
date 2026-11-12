import {test,expect} from '@playwright/test';
import {exerciseNotationSvg} from '../src/guitar/exercises.js';
const crowding=async(page:any)=>page.locator('.exercise-notation').evaluateAll(svgs=>{
 const overlaps:any[]=[];const intersects=(a:DOMRect,b:DOMRect)=>a.left<b.right-.2&&b.left<a.right-.2&&a.top<b.bottom-.2&&b.top<a.bottom-.2;
 for(const svg of svgs){
  const tabs=[...svg.querySelectorAll<SVGGraphicsElement>('.tab-fret')].filter(n=>getComputedStyle(n).display!=='none').map(n=>({text:n.textContent,box:n.getBoundingClientRect()}));
  for(let i=0;i<tabs.length;i++)for(let j=i+1;j<tabs.length;j++)if(intersects(tabs[i].box,tabs[j].box))overlaps.push(['TAB',tabs[i].text,tabs[j].text]);
  const heads=[...svg.querySelectorAll('.note-head')].map(n=>n.getBoundingClientRect());for(const accidental of svg.querySelectorAll('.accidental'))for(const head of heads)if(intersects(accidental.getBoundingClientRect(),head))overlaps.push(['accidental',accidental.textContent]);
  for(const n of svg.querySelectorAll<SVGGraphicsElement>('.tab-fret')){const mask=n.parentElement!.querySelector('.tab-fret-bg')!;if(n.getBBox().width>Number(mask.getAttribute('width')))overlaps.push(['mask too narrow',n.textContent]);}
 }
 return overlaps;
});
test('dense altered-key notation and double-digit TAB remain separated at every display size',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('mehtronome-repertoire-v1',JSON.stringify({version:1,items:[{id:'spacing',name:'Spacing',key:3,beats:4,progression:{version:2,name:'Spacing',steps:[{root:0,chord:'dom9sharp11',mode:'lydian_dominant',bars:4,bass:null}]}}]})));
 await page.goto('/');await page.locator('[data-workspace-target=harmony-title]').click();await page.locator('#progression-choice').selectOption('saved:spacing');await page.locator('[data-workspace-target=caged-exercise]').click();await page.locator('#exercise-content-material').selectOption('scale');await page.locator('#exercise-content-family').selectOption('intervals');await page.locator('#exercise-scale-pattern').selectOption('thirds');
 for(const rhythm of ['eighths','triplets','sixteenths']){await page.locator('#exercise-rhythm').selectOption(rhythm);await page.evaluate(()=>document.fonts.ready);expect(await crowding(page)).toEqual([]);}
 for(const display of ['both','tab','names','degrees'])for(const size of ['fit','comfortable','large']){
  await page.locator('#exercise-display').selectOption(display);await page.locator('#exercise-zoom').selectOption(size);expect(await crowding(page),`${display} ${size}`).toEqual([]);
 }
 await page.locator('#exercise-display').selectOption('both');await page.locator('#exercise-zoom').selectOption('comfortable');await page.locator('.notation-scroll').screenshot({path:'/workspace/notation-spacing-desktop.png'});
 await page.setViewportSize({width:390,height:844});expect(await crowding(page)).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(await page.locator('.notation-scroll').evaluate(n=>n.scrollWidth>n.clientWidth)).toBe(true);
 await page.locator('.notation-scroll').screenshot({path:'/workspace/notation-spacing-mobile.png'});expect(errors).toEqual([]);
});
test('the standalone renderer also separates repeated double-digit frets and double accidentals',async({page})=>{
 await page.goto('/');const notes=Array.from({length:32},(_,i)=>({name:i%2?'C♯♯':'C',midi:i%2?62:60,string:0,fret:i%2?22:20})),svg=exerciseNotationSvg([{notes}],'sixteenths','Spacing');
 await page.evaluate(html=>{const panel=document.createElement('div');panel.className='notation-scroll zoom-comfortable';panel.style.width='360px';panel.innerHTML=html;document.body.replaceChildren(panel);},svg);await page.evaluate(()=>document.fonts.ready);expect(await crowding(page)).toEqual([]);expect(await page.locator('.notation-scroll').evaluate(n=>n.scrollWidth>n.clientWidth)).toBe(true);
});
