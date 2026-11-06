import {fullFretboardFor,fullFretboardSvg} from './fretboard.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** A persistent map: changing a shape/label does not lose the open state or
 * horizontal scroll, and highlighted notes follow the actual diagonal path. */
export function perStringNeckView(){
 const element=document.createElement('section');element.id='per-string-full-neck';element.className='full-fretboard-panel per-string-full-neck';element.setAttribute('aria-label','Per-string full-neck map');
 element.innerHTML=`<div class="full-fretboard-toolbar"><div><strong>Full-neck map</strong><span class="per-string-neck-range"></span></div><label>Highlight shape<select id="per-string-neck-shape"><option value="all">All notes</option></select></label><button type="button" class="practice-button" data-neck-fullscreen>Fullscreen</button><button type="button" class="practice-button" data-neck-toggle aria-expanded="true" aria-controls="per-string-neck-notes">Hide map</button></div><div id="per-string-neck-notes" class="full-fretboard-scroll per-string-neck-scroll" tabindex="0" aria-label="Scrollable full-neck map"></div>`;
 const menu=element.querySelector<HTMLSelectElement>('select')!,scroll=element.querySelector<HTMLElement>('.per-string-neck-scroll')!;
 let current:any=null,selected='all',open=true;
 function draw(){
  if(!current)return;const {harmony:h,arp,degrees,labels,title,shapes}=current;
  const shape=shapes.find((s:any)=>String(s.degree)===selected),end=Math.max(24,shape?.board?.end??24);
  const base=fullFretboardFor(h,0,end,arp),board={...base,notes:arp?base.notes.map((n:any)=>({...n,scaleIndex:-1})):base.notes.filter((n:any)=>n.scale)};
  const previousScroll=scroll.scrollLeft;
  scroll.innerHTML=fullFretboardSvg(board,labels,degrees,title+' · full neck, frets 0–'+end,[], 'I',true,null,false);
  const keys=new Set(shape?.board?.notes.map((n:any)=>`${n.string}:${n.fret}`)||[]);
  scroll.classList.toggle('has-highlighted-shape',!!shape);
  scroll.querySelectorAll<SVGGElement>('.fret-note').forEach(note=>{
   if(!keys.has(`${note.dataset.string}:${note.dataset.fret}`))return;
   note.classList.add('per-string-map-selected');
   const ring=note.querySelector('circle')!.cloneNode() as SVGCircleElement;ring.setAttribute('r','14');ring.setAttribute('class','per-string-map-ring');note.append(ring);
  });
  scroll.scrollLeft=previousScroll;
  element.querySelector('.per-string-neck-range')!.textContent=`Frets 0–${end}${end>24?' · extends beyond fret 24':''}${shape?' · '+shape.label:''}`;
 }
 menu.addEventListener('change',()=>{selected=menu.value;draw();});
 const toggle=element.querySelector<HTMLButtonElement>('[data-neck-toggle]')!;
 toggle.onclick=()=>{open=!open;scroll.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Hide map':'Show map';};
 const fullscreen=element.querySelector<HTMLButtonElement>('[data-neck-fullscreen]')!;
 fullscreen.hidden=!element.requestFullscreen;
 fullscreen.onclick=async()=>{try{if(document.fullscreenElement===element)await document.exitFullscreen();else{if(!open)toggle.click();await element.requestFullscreen();}}catch{/* The embedding browser may disallow fullscreen. */}};
 document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement===element?'Exit fullscreen':'Fullscreen';});
 return {element,update(context:any){
  current=context;if(selected!=='all'&&!context.shapes.some((s:any)=>String(s.degree)===selected))selected='all';
  menu.innerHTML='<option value="all">All notes</option>'+context.shapes.map((s:any)=>`<option value="${s.degree}">${esc(s.label)}</option>`).join('');menu.value=selected;draw();
 }};
}
