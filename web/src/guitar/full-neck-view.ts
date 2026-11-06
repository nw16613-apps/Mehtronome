import {fullFretboardFor,fullFretboardSvg} from './fretboard.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const views=new Set<()=>void>();
let collapsed=false,labels=true;
try{collapsed=localStorage.getItem('mehtronome-full-fretboard-collapsed')==='true';labels=localStorage.getItem('mehtronome-neck-labels')!=='notes';}catch{}
const notify=()=>views.forEach(draw=>draw());
let listening=false;
export function fullNeckView(options:any={}){
 const {id='per-string-full-neck',notesId='per-string-neck-notes',shapeId='per-string-neck-shape',toggleId,fullscreenId,onSelect}=options;
 const element=document.createElement('section');element.id=id;element.className='full-fretboard-panel unified-neck-map';element.setAttribute('aria-label','Full-neck map');
 element.innerHTML=`<div class="full-fretboard-toolbar"><div><strong>Full-neck map</strong><span class="neck-range per-string-neck-range">Frets 0–24</span></div><label>Highlight shape<select id="${shapeId}"></select></label><label>Labels<select data-neck-labels><option value="degrees">Degrees</option><option value="notes">Note names</option></select></label><label class="check"><input type="checkbox" data-neck-colour>Modal colour</label><button type="button" ${fullscreenId?`id="${fullscreenId}"`:''} class="practice-button" data-neck-fullscreen>Fullscreen</button><button type="button" ${toggleId?`id="${toggleId}"`:''} class="practice-button" data-neck-toggle aria-controls="${notesId}">Hide map</button></div><p class="neck-range-note" hidden></p><div id="${notesId}" class="full-fretboard-scroll unified-neck-scroll" tabindex="0" aria-label="Scrollable full-neck map"></div><div class="neck-legend" aria-label="Map legend"><span><i class="root"></i>Root</span><span><i class="chord"></i>Chord tone</span><span data-scale-key><i class="scale"></i>Scale tone</span><span><i class="shape"></i>Selected shape</span><span data-colour-key><i class="colour"></i>Modal colour</span><span data-overlay-key hidden></span><span data-voicing-key hidden><i class="voicing"></i>Chord voicing</span><span data-playing-key hidden><i class="playing"></i>Current note</span></div>`;
 const menu=element.querySelector<HTMLSelectElement>('#'+shapeId)!,scroll=element.querySelector<HTMLElement>('.unified-neck-scroll')!,labelMenu=element.querySelector<HTMLSelectElement>('[data-neck-labels]')!,colour=element.querySelector<HTMLInputElement>('[data-neck-colour]')!,toggle=element.querySelector<HTMLButtonElement>('[data-neck-toggle]')!;
 let current:any=null,selected='current',lastLabels:any,lastShape='',pendingFocus=false;
 function focusShape(){
  if(!pendingFocus||collapsed||scroll.clientWidth===0)return;
  const first=scroll.querySelector<SVGGElement>('.per-string-map-selected');if(!first)return;
  const a=first.getBoundingClientRect(),b=scroll.getBoundingClientRect();scroll.scrollLeft+=a.left-b.left-scroll.clientWidth*.25;pendingFocus=false;
 }
 new ResizeObserver(focusShape).observe(scroll);
 function draw(){
  if(!current)return;
  const {harmony:h,arp,degrees,title,shapes,overlay,grips=[]}=current;
  const chosen=selected==='current'?String(current.activeId??shapes[0]?.degree):selected,shape=selected==='all'?null:shapes.find((s:any)=>String(s.degree)===chosen);
  const base=fullFretboardFor(h,0,24,arp),board={...base,notes:arp?base.notes.map((n:any)=>({...n,scaleIndex:-1})):base.notes.filter((n:any)=>n.scale||current.includeChordTones&&n.chord)};
  const highlight=(document.getElementById('highlight-mode') as HTMLInputElement|null)?.checked??true;
  const previousScroll=scroll.scrollLeft,playingNote=scroll.querySelector<SVGGElement>('.exercise-current');
  const playingKey=playingNote?`${playingNote.dataset.string}:${playingNote.dataset.fret}`:'';
  scroll.innerHTML=fullFretboardSvg(board,labels,degrees,title+' · full neck, frets 0–24',[],chosen,highlight,overlay||null,false,grips);
  const keys=new Set(shape?.board?.notes.map((n:any)=>`${n.string}:${n.fret}`)||[]);
  const shapeKey=JSON.stringify([chosen,[...keys]]);if(shapeKey!==lastShape){lastShape=shapeKey;pendingFocus=!!shape;}
  scroll.classList.toggle('has-highlighted-shape',!!shape);
  scroll.querySelectorAll<SVGGElement>('.fret-note').forEach(note=>{
   if(playingKey===`${note.dataset.string}:${note.dataset.fret}`)note.classList.add('exercise-current');
   if(current.isExercise){const circle=note.querySelector('circle')!,square=document.createElementNS('http://www.w3.org/2000/svg','rect');square.setAttribute('x',String(Number(circle.getAttribute('cx'))-14));square.setAttribute('y',String(Number(circle.getAttribute('cy'))-14));square.setAttribute('width','28');square.setAttribute('height','28');square.setAttribute('class','exercise-current-box');note.append(square);}
   if(!keys.has(`${note.dataset.string}:${note.dataset.fret}`))return;
   note.classList.add('per-string-map-selected');
   const ring=note.querySelector('circle')!.cloneNode() as SVGCircleElement;ring.setAttribute('r','14');ring.setAttribute('class','per-string-map-ring');note.append(ring);
  });
  scroll.scrollLeft=previousScroll;labelMenu.value=labels?'degrees':'notes';colour.checked=highlight;
  scroll.hidden=collapsed;focusShape();element.classList.toggle('is-collapsed',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));toggle.textContent=collapsed?'Show map':'Hide map';
  element.querySelector('.neck-range')!.textContent=`Frets 0–24${shape?' · '+shape.label:''}`;
  const note=element.querySelector<HTMLElement>('.neck-range-note')!;note.hidden=!shape||shape.board.end<=24;note.textContent=note.hidden?'':'This shape continues beyond fret 24; its complete pattern is shown in the reference diagram.';
  (element.querySelector('[data-scale-key]') as HTMLElement).hidden=arp;
  (element.querySelector('[data-colour-key]') as HTMLElement).hidden=!highlight||!!overlay;
  (element.querySelector('[data-voicing-key]') as HTMLElement).hidden=!grips.length;
  (element.querySelector('[data-playing-key]') as HTMLElement).hidden=!current.isExercise;
  const overlayKey=element.querySelector<HTMLElement>('[data-overlay-key]')!;overlayKey.hidden=!overlay;overlayKey.innerHTML=!overlay?'':overlay.groups?overlay.groups.map((g:any,i:number)=>`<span><i style="background:var(--theory-${i===0?'a':'b'})"></i>${esc(g.name)}</span>`).join(''):`<i style="background:var(--theory-pentatonic)"></i>${esc(overlay.name)}`;
 }
 views.add(draw);
 if(!listening){document.getElementById('highlight-mode')?.addEventListener('input',notify);listening=true;}
 menu.addEventListener('change',()=>{selected=menu.value;if(selected!=='all'&&selected!=='current')onSelect?.(selected);draw();});
 labelMenu.onchange=()=>{labels=labelMenu.value==='degrees';try{localStorage.setItem('mehtronome-neck-labels',labels?'degrees':'notes');}catch{}notify();};
 colour.onchange=()=>{const source=document.getElementById('highlight-mode') as HTMLInputElement|null;if(source)source.checked=colour.checked;notify();};
 toggle.onclick=()=>{collapsed=!collapsed;try{localStorage.setItem('mehtronome-full-fretboard-collapsed',String(collapsed));}catch{}notify();};
 const fullscreen=element.querySelector<HTMLButtonElement>('[data-neck-fullscreen]')!;fullscreen.hidden=!element.requestFullscreen;
 fullscreen.onclick=async()=>{try{if(document.fullscreenElement===element)await document.exitFullscreen();else{if(collapsed)toggle.click();await element.requestFullscreen();}}catch{}};
 document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement===element?'Exit fullscreen':'Fullscreen';});
 return {element,update(context:any){
  let labelsChanged=false;
  if(lastLabels!==undefined&&context.labels!==undefined&&lastLabels!==context.labels){labelsChanged=true;labels=context.labels;try{localStorage.setItem('mehtronome-neck-labels',labels?'degrees':'notes');}catch{}}
  lastLabels=context.labels;current=context;
  if(selected!=='all'&&selected!=='current'&&!context.shapes.some((s:any)=>String(s.degree)===selected))selected='current';
  menu.innerHTML='<option value="current">Current shape</option><option value="all">All notes</option>'+context.shapes.map((s:any)=>`<option value="${esc(s.degree)}">${esc(s.label)}</option>`).join('');menu.value=selected;
  menu.disabled=!!context.locked&&!!onSelect;draw();if(labelsChanged)notify();
 }};
}
