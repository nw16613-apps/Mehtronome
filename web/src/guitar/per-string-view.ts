import {fingeringCatalogue,playableFingeringStringSets} from './fingering-catalogue.js';
import {shapeColor} from './shape-emphasis.js';
import {MODES} from '../audio/music.js';
import {diagramSvg} from './fretboard.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const inversionNames=['Root position','First inversion','Second inversion','Third inversion','Fourth inversion','Fifth inversion','Sixth inversion'];
export function installPerStringView(getContext:()=>any,practise?:((choice:any)=>void),updateMap?:((context:any)=>void)){
 const guitar=document.querySelector<HTMLElement>('.guitar')!,controls=document.createElement('div');controls.className='per-string-controls';
 controls.innerHTML=`<label>Fingering<select id="fretboard-fingering"><option value="caged">CAGED</option><option value="three">Scales · 3 notes per string</option><option value="oneTwo">Arpeggios · 1–2–1–2–1–2</option><option value="twoOne">Arpeggios · 2–1–2–1–2–1</option><option value="spread">Chords · Spread triads</option><option value="drop2">Chords · Drop 2</option><option value="drop3">Chords · Drop 3</option></select></label><label data-spread-control hidden>Build from<select id="spread-triad-source"><option value="chord">Current chord</option><option value="mode">All degrees of the mode</option></select></label><label data-mode-inversion-control hidden>Inversion<select id="fretboard-mode-inversion"><option value="all">All inversions</option></select></label><label data-drop-control hidden>String set<select id="drop-string-set"></select></label><label data-per-string-control hidden>Labels<select id="per-string-labels"><option value="degrees">Degrees</option><option value="notes">Note names</option></select></label>`;
 guitar.querySelector('.guitar-progression-panel')!.before(controls);
 const panel=document.createElement('section');panel.id='per-string-diagram';panel.className='per-string-diagram';panel.hidden=true;guitar.querySelector('#position-overview')!.before(panel);
 const field=(id:string)=>controls.querySelector<HTMLSelectElement>('#'+id)!;
 const registers=new Map<string,number>();let lastRender='';let lastMap:any=null,selectedDegree:number|undefined;
 panel.innerHTML='<h4></h4><p class="practice-help"></p><div class="per-string-gallery"></div><div class="per-string-navigation"><button type="button" class="practice-button" data-shape-move="-1">← Previous</button><span></span><button type="button" class="practice-button" data-shape-move="1">Next →</button></div><div class="per-string-featured"></div>';
 function refresh(){
  const {harmony:h,locked}=getContext(),kind=field('fretboard-fingering').value,active=kind!=='caged',arp=kind!=='three',drop=kind==='drop2'||kind==='drop3'||kind==='spread';
  guitar.classList.toggle('per-string-active',active);panel.hidden=!active;
  guitar.querySelector('.guitar-progression-panel>h3')!.textContent=active?'Chord progression':'Chord & position';
  controls.querySelectorAll<HTMLElement>('[data-per-string-control]').forEach(e=>e.hidden=!active);
  controls.querySelectorAll<HTMLElement>('[data-drop-control]').forEach(e=>e.hidden=!drop);
  controls.querySelectorAll<HTMLElement>('[data-spread-control]').forEach(e=>e.hidden=!active||!arp);
  const modeInversions=active&&arp&&field('spread-triad-source').value==='mode';
  controls.querySelectorAll<HTMLElement>('[data-mode-inversion-control]').forEach(e=>e.hidden=!modeInversions);
  if(modeInversions){const menu=field('fretboard-mode-inversion'),previous=menu.value;menu.innerHTML='<option value="all">All inversions</option>'+inversionNames.slice(0,kind==='spread'?3:4).map((name,i)=>`<option value="${i}">${name}</option>`).join('');menu.value=Array.from(menu.options).some(o=>o.value===previous)?previous:'all';}
  const inversionFilter=modeInversions?field('fretboard-mode-inversion').value:'all';
  if(drop){const menu=field('drop-string-set'),previous=menu.value;menu.innerHTML=playableFingeringStringSets(h,kind,field('spread-triad-source').value,inversionFilter).map(({strings,index}:any)=>`<option value="${index}">Strings ${strings.map((s:number)=>6-s).join('–')}</option>`).join('');if(Array.from(menu.options).some(o=>o.value===previous))menu.value=previous;}
  controls.querySelectorAll<HTMLSelectElement>('select').forEach(e=>e.disabled=locked);
  panel.querySelectorAll<HTMLSelectElement>('select').forEach(e=>e.disabled=locked||e.options.length===1);
  panel.querySelectorAll<HTMLButtonElement>('[data-practise-per-string]').forEach(e=>e.disabled=locked);
  if(!active){lastRender='';updateMap?.(null);return;}
  const renderKey=JSON.stringify([kind,inversionFilter,field('spread-triad-source').value,field('drop-string-set').value,[...registers],field('per-string-labels').value,h.name,h.suffix,h.mode,h.scalePcs,h.chordPcs]);
  if(renderKey===lastRender){updateMap?.(lastMap);return;}lastRender=renderKey;
  const names=arp?h.tones:h.scaleNames,degrees=arp?h.intervals:(MODES as any)[h.mode].degrees;
  const material=arp&&field('spread-triad-source').value==='mode'?h.scaleNames[0]+' '+(MODES as any)[h.mode].name:arp?h.name+h.suffix:h.scaleNames[0]+' '+(MODES as any)[h.mode].name,title=material+' · '+(drop?(kind==='spread'?'Spread triads':kind==='drop2'?'Drop 2':'Drop 3'):arp?(kind==='oneTwo'?'1–2–1–2–1–2':'2–1–2–1–2–1'):'3 notes per string');
  const catalogue=fingeringCatalogue(h,kind,Number(field('drop-string-set').value),field('spread-triad-source').value),mapShapes:any[]=[];
  panel.querySelector('h4')!.textContent=title;
  panel.querySelector('.practice-help')!.textContent=kind==='spread'?'Playable open voicings · frets 1–24 · maximum five-fret span. × marks muted strings.':drop?(catalogue.length?'Playable inversions · four core chord tones. × marks muted strings.'+(h.chordPcs.length>4?' Extensions remain in the backing chord.':''):'Choose a seventh or sixth chord with four core tones to study drop voicings.'):`${arp?'Playable inversions':'All starting degrees'} · low E → high E · consecutive ascending ${arp?'chord':'scale'} tones.`;
  panel.querySelector('.per-string-gallery')!.innerHTML=catalogue.map((entry:any,i:number)=>{
   if(inversionFilter!=='all'&&entry.inversion!==Number(inversionFilter))return '';
   const shapeHarmony=entry.harmony||h;
   const degree=entry.degree,preferred=registers.get(kind+':'+degree)??5;
   const board=entry.choices.reduce((best:any,b:any)=>!best||Math.abs(b.firstFret-preferred)<Math.abs(best.firstFret-preferred)?b:best,null);
   const label=arp?(inversionNames[i]||'Starting tone '+(i+1)):'Starting degree '+degrees[degree];
   const heading=entry.label||label+' · '+names[degree]+(arp?' ('+degrees[degree]+')':'');
   if(!board&&arp)return '';
   if(!board)return `<article style="--shape-color:${shapeColor(i)}" class="position-card per-string-shape" data-start-degree="${degree}"><h5>${esc(heading)}</h5><p>${drop?'No playable voicing fits this string set within frets 1–24.':'No complete pattern fits within frets 0–36.'}</p></article>`;
   mapShapes.push({degree,board,harmony:shapeHarmony,label:heading,tag:entry.tag|| (arp?(i===0?'R':['','1st','2nd','3rd','4th','5th','6th'][i]):degrees[degree])});
   const svg=diagramSvg(board,field('per-string-labels').value==='degrees',arp?shapeHarmony.intervals:degrees,title+', '+heading,true,drop?{notes:board.notes,muted:board.muted}:null);
   Object.assign(mapShapes[mapShapes.length-1],{index:i,entry,heading,svg,drop});
   return `<article style="--shape-color:${shapeColor(i)}" class="position-card per-string-shape" data-start-degree="${degree}"><div class="position-heading"><h5>${esc(heading)}</h5><span>Frets ${board.start}–${board.end}</span></div><div class="per-string-scroll" tabindex="0" role="button" aria-pressed="false" aria-label="Highlight ${esc(heading)} on full-neck map">${svg}</div></article>`;
  }).join('');
  mapShapes.sort((a:any,b:any)=>a.board.start-b.board.start||a.board.end-b.board.end||a.index-b.index);
  const gallery=panel.querySelector('.per-string-gallery')!;
  mapShapes.forEach((shape:any)=>gallery.append(gallery.querySelector(`[data-start-degree="${shape.degree}"]`)!));
  lastMap={harmony:arp&&field('spread-triad-source').value==='mode'?{...h,chordPcs:h.scalePcs,tones:h.scaleNames,intervals:(MODES as any)[h.mode].degrees}:h,arp,degrees,labels:field('per-string-labels').value==='degrees',title,shapes:mapShapes,selectShape};selectShape(selectedDegree);updateMap?.(lastMap);
 }
 function selectShape(degree:number|undefined){
  const shapes=lastMap?.shapes||[],shape=shapes.find((s:any)=>s.degree===degree)||shapes.find((s:any)=>s.degree===selectedDegree)||shapes[0];
  const featured=panel.querySelector<HTMLElement>('.per-string-featured')!,nav=panel.querySelector<HTMLElement>('.per-string-navigation')!;
  featured.hidden=!shape;nav.hidden=!shape;if(!shape){featured.innerHTML='';return;}
  selectedDegree=shape.degree;
  const {board,entry,index,heading,svg,drop}=shape,{locked}=getContext();
  nav.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.disabled=locked);
  nav.querySelector('span')!.textContent=`${shapes.indexOf(shape)+1} of ${shapes.length} · ${shape.label}`;
  featured.innerHTML=`<article class="position-card per-string-selected" style="--shape-color:${shapeColor(index)}"><div class="position-heading"><h4>${esc(heading)}</h4><span>Frets ${board.start}–${board.end}</span></div><div class="per-string-selected-controls"><label class="per-string-register-label">${drop?'Bass fret · string '+(6-board.notes[0].string):'Starting fret · low E'}<select data-string-register="${shape.degree}" aria-label="Starting fret for ${esc(shape.label)}" ${locked||entry.choices.length===1?'disabled':''}>${entry.choices.map((b:any)=>`<option value="${b.firstFret}" ${b.firstFret===board.firstFret?'selected':''}>${b.firstFret} · frets ${b.start}–${b.end}</option>`).join('')}</select></label><button type="button" class="practice-button" data-practise-per-string="${index}" data-practice-fret="${board.firstFret}" ${locked?'disabled':''}>Practise this shape →</button></div>${entry.extended?'<p class="per-string-range-note">Extends beyond fret 24 · full pattern shown for reference.</p>':''}<div class="per-string-selected-diagram">${svg.replace('<svg ',`<svg style="min-width:${drop?0:Math.max(480,(board.end-board.start+1)*48)}px" `)}</div></article>`;
 }
 function selectCard(card:HTMLElement|null){
  if(!card||!lastMap?.shapes.some((s:any)=>String(s.degree)===card.dataset.startDegree))return;
  const menu=document.querySelector<HTMLSelectElement>('#per-string-neck-shape');if(!menu)return;
  menu.value=card.dataset.startDegree!;menu.dispatchEvent(new Event('change',{bubbles:true}));
 }
 panel.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-practise-per-string]');
  if(button){if(!button.disabled)practise?.({kind:field('fretboard-fingering').value,inversion:Number(button.dataset.practisePerString),fret:Number(button.dataset.practiceFret),stringSet:Number(field('drop-string-set').value)||0,spreadSource:field('spread-triad-source').value});return;}
  const move=target.closest<HTMLElement>('[data-shape-move]');if(move){const shapes=lastMap.shapes,index=shapes.findIndex((s:any)=>s.degree===selectedDegree);const next=shapes[(index+Number(move.dataset.shapeMove)+shapes.length)%shapes.length];selectCard(panel.querySelector(`[data-start-degree="${next.degree}"]`));return;}
  if(target.closest('button,select,option,label,input,a'))return;
  selectCard(target.closest<HTMLElement>('.per-string-shape'));
 });
 panel.addEventListener('keydown',event=>{
  if(!['Enter',' '].includes(event.key)||!(event.target instanceof HTMLElement)||!event.target.matches('.per-string-scroll'))return;
  event.preventDefault();selectCard(event.target.closest<HTMLElement>('.per-string-shape'));
 });
 controls.addEventListener('change',refresh);
 panel.addEventListener('change',e=>{const target=e.target as HTMLSelectElement;if(target.dataset.stringRegister===undefined)return;registers.set(field('fretboard-fingering').value+':'+target.dataset.stringRegister,Number(target.value));refresh();});
 document.addEventListener('mehtronome-playback-state',refresh);
 refresh();return {refresh};
}
