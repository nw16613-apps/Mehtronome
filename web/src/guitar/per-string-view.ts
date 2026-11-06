import {perStringNeckView} from './per-string-neck-view.js';
import {MODES} from '../audio/music.js';
import {diagramSvg} from './fretboard.js';
import {perStringCatalogue} from './per-string.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const inversionNames=['Root position','First inversion','Second inversion','Third inversion','Fourth inversion','Fifth inversion','Sixth inversion'];
export function installPerStringView(getContext:()=>any,practise?:(choice:any)=>void){
 const guitar=document.querySelector<HTMLElement>('.guitar')!,controls=document.createElement('div');controls.className='per-string-controls';
 controls.innerHTML=`<label>Fingering<select id="fretboard-fingering"><option value="caged">CAGED</option><option value="three">Scales · 3 notes per string</option><option value="oneTwo">Arpeggios · 1–2–1–2–1–2</option><option value="twoOne">Arpeggios · 2–1–2–1–2–1</option></select></label><label data-per-string-control hidden>Labels<select id="per-string-labels"><option value="degrees">Degrees</option><option value="notes">Note names</option></select></label>`;
 guitar.querySelector('.guitar-progression-panel')!.before(controls);
 const panel=document.createElement('section');panel.id='per-string-diagram';panel.className='per-string-diagram';panel.hidden=true;guitar.querySelector('#position-overview')!.before(panel);
 const field=(id:string)=>controls.querySelector<HTMLSelectElement>('#'+id)!;
 const registers=new Map<string,number>();let lastRender='';
 const neck=perStringNeckView();
 panel.innerHTML='<h4></h4><p class="practice-help"></p><div class="per-string-gallery"></div>';
 panel.append(neck.element);
 function refresh(){
  const {harmony:h,locked}=getContext(),kind=field('fretboard-fingering').value,active=kind!=='caged',arp=kind!=='three';
  guitar.classList.toggle('per-string-active',active);panel.hidden=!active;
  guitar.querySelector('.guitar-progression-panel>h3')!.textContent=active?'Chord progression':'Chord & position';
  controls.querySelectorAll<HTMLElement>('[data-per-string-control]').forEach(e=>e.hidden=!active);
  controls.querySelectorAll<HTMLSelectElement>('select').forEach(e=>e.disabled=locked);
  panel.querySelectorAll<HTMLSelectElement>('select').forEach(e=>e.disabled=locked);
  panel.querySelectorAll<HTMLButtonElement>('[data-practise-per-string]').forEach(e=>e.disabled=locked);
  if(!active){lastRender='';return;}
  const renderKey=JSON.stringify([kind,[...registers],field('per-string-labels').value,h.name,h.suffix,h.mode,h.scalePcs,h.chordPcs]);
  if(renderKey===lastRender)return;lastRender=renderKey;
  const names=arp?h.tones:h.scaleNames,degrees=arp?h.intervals:(MODES as any)[h.mode].degrees;
  const material=arp?h.name+h.suffix:h.scaleNames[0]+' '+(MODES as any)[h.mode].name,title=material+' · '+(arp?(kind==='oneTwo'?'1–2–1–2–1–2':'2–1–2–1–2–1'):'3 notes per string');
  const catalogue=perStringCatalogue(h,kind),mapShapes:any[]=[];
  panel.querySelector('h4')!.textContent=title;
  panel.querySelector('.practice-help')!.textContent=`${arp?'All inversions':'All starting degrees'} · low E → high E · consecutive ascending ${arp?'chord':'scale'} tones.`;
  panel.querySelector('.per-string-gallery')!.innerHTML=catalogue.map((entry:any,i:number)=>{
   const degree=entry.degree,preferred=registers.get(kind+':'+degree)??5;
   const board=entry.choices.reduce((best:any,b:any)=>!best||Math.abs(b.firstFret-preferred)<Math.abs(best.firstFret-preferred)?b:best,null);
   const label=arp?(inversionNames[i]||'Starting tone '+(i+1)):'Starting degree '+degrees[degree];
   const heading=label+' · '+names[degree]+(arp?' ('+degrees[degree]+')':'');
   if(!board)return `<article class="position-card per-string-shape" data-start-degree="${degree}"><h5>${esc(heading)}</h5><p>No complete pattern fits within frets 0–36.</p></article>`;
   mapShapes.push({degree,board,label:heading});
   return `<article class="position-card per-string-shape" data-start-degree="${degree}"><div class="position-heading"><h5>${esc(heading)}</h5><span>Frets ${board.start}–${board.end}</span></div>${arp?`<button type="button" class="practice-button" data-practise-per-string="${i}" data-practice-fret="${board.firstFret}" ${locked?'disabled':''}>Practise this shape →</button>`:''}${entry.extended?'<p class="per-string-range-note">Extends beyond fret 24 · full pattern shown for reference.</p>':''}${entry.choices.length>1?`<label class="per-string-register-label">Starting fret · low E<select data-string-register="${degree}" aria-label="Starting fret for ${esc(label)}" ${locked?'disabled':''}>${entry.choices.map((b:any)=>`<option value="${b.firstFret}" ${b.firstFret===board.firstFret?'selected':''}>${b.firstFret===0?'Open':b.firstFret} · frets ${b.start}–${b.end}</option>`).join('')}</select></label>`:''}<div class="per-string-scroll" tabindex="0" aria-label="Scrollable fingering: ${esc(heading)}">${diagramSvg(board,field('per-string-labels').value==='degrees',degrees,title+', '+heading,true).replace('<svg ',`<svg style="min-width:${Math.max(480,(board.end-board.start+1)*48)}px" `)}</div></article>`;
  }).join('');
  neck.update({harmony:h,arp,degrees,labels:field('per-string-labels').value==='degrees',title,shapes:mapShapes});
 }
 panel.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-practise-per-string]');if(button&&!button.disabled)practise?.({kind:field('fretboard-fingering').value,inversion:Number(button.dataset.practisePerString),fret:Number(button.dataset.practiceFret)});});
 controls.addEventListener('change',refresh);
 panel.addEventListener('change',e=>{const target=e.target as HTMLSelectElement;if(target.dataset.stringRegister===undefined)return;registers.set(field('fretboard-fingering').value+':'+target.dataset.stringRegister,Number(target.value));refresh();});
 document.addEventListener('mehtronome-playback-state',refresh);
 refresh();return {refresh};
}
