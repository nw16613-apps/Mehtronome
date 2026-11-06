import {MODES} from '../audio/music.js';
import {diagramSvg} from './fretboard.js';
import {perStringFingerings} from './per-string.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function installPerStringView(getContext:()=>any){
 const guitar=document.querySelector<HTMLElement>('.guitar')!,controls=document.createElement('div');controls.className='per-string-controls';
 controls.innerHTML=`<label>Fingering<select id="fretboard-fingering"><option value="caged">CAGED</option><option value="three">Scales · 3 notes per string</option><option value="oneTwo">Arpeggios · 1–2–1–2–1–2</option><option value="twoOne">Arpeggios · 2–1–2–1–2–1</option></select></label><label data-per-string-control hidden>Starting note<select id="per-string-start"></select></label><label data-per-string-control hidden>Starting fret · low E<select id="per-string-register"></select></label><label data-per-string-control hidden>Labels<select id="per-string-labels"><option value="degrees">Degrees</option><option value="notes">Note names</option></select></label>`;
 guitar.querySelector('.guitar-progression-panel')!.before(controls);
 const panel=document.createElement('article');panel.id='per-string-diagram';panel.className='position-card per-string-diagram';panel.hidden=true;guitar.querySelector('#position-overview')!.before(panel);
 const field=(id:string)=>controls.querySelector<HTMLSelectElement>('#'+id)!;
 let degree=0,firstFret=5,lastRender='';
 function refresh(){
  const {harmony:h,locked}=getContext(),kind=field('fretboard-fingering').value,active=kind!=='caged',arp=kind!=='three';
  guitar.classList.toggle('per-string-active',active);panel.hidden=!active;
  guitar.querySelector('.guitar-progression-panel>h3')!.textContent=active?'Chord progression':'Chord & position';
  controls.querySelectorAll<HTMLElement>('[data-per-string-control]').forEach(e=>e.hidden=!active);
  controls.querySelectorAll<HTMLSelectElement>('select').forEach(e=>e.disabled=locked);
  if(!active){lastRender='';return;}
  const renderKey=JSON.stringify([kind,degree,firstFret,field('per-string-labels').value,h.name,h.suffix,h.mode,h.scalePcs,h.chordPcs]);
  if(renderKey===lastRender)return;lastRender=renderKey;
  const pcs=arp?h.chordPcs:h.scalePcs,names=arp?h.tones:h.scaleNames,degrees=arp?h.intervals:(MODES as any)[h.mode].degrees;
  if(degree>=pcs.length)degree=0;
  const available=pcs.map((_:number,i:number)=>perStringFingerings(h,kind,i));
  if(!available[degree].length)degree=available.findIndex((choices:any[])=>choices.length);
  if(degree<0)degree=0;
  field('per-string-start').innerHTML=pcs.map((_:number,i:number)=>`<option value="${i}" ${available[i].length?'':'disabled'}>${esc(degrees[i])} · ${esc(names[i])}${available[i].length?'':' · outside frets 0–24'}</option>`).join('');field('per-string-start').value=String(degree);
  const choices=perStringFingerings(h,kind,degree),board=choices.reduce((best:any,b:any)=>!best||Math.abs(b.firstFret-firstFret)<Math.abs(best.firstFret-firstFret)?b:best,null);
  field('per-string-register').innerHTML=choices.map((b:any)=>`<option value="${b.firstFret}">${b.firstFret===0?'Open':b.firstFret} · frets ${b.start}–${b.end}</option>`).join('');
  if(!board){panel.innerHTML='<p role="status">This starting note cannot complete the pattern within frets 0–24. Choose another starting note.</p>';return;}
  field('per-string-register').value=String(board.firstFret);
  const material=arp?h.name+h.suffix:h.scaleNames[0]+' '+(MODES as any)[h.mode].name,title=material+' · '+(arp?(kind==='oneTwo'?'1–2–1–2–1–2':'2–1–2–1–2–1'):'3 notes per string');
  panel.innerHTML=`<div class="position-heading"><h4>${esc(title)}</h4><span>Frets ${board.start}–${board.end}</span></div><p class="practice-help">Low E → high E · consecutive ascending ${arp?'chord':'scale'} tones. Start on ${esc(names[degree])} (${esc(degrees[degree])}).</p><div class="per-string-scroll" tabindex="0" aria-label="Scrollable per-string fingering">${diagramSvg(board,field('per-string-labels').value==='degrees',degrees,title,true)}</div>`;
  const svg=panel.querySelector<SVGElement>('svg')!;svg.style.minWidth=Math.max(480,(board.end-board.start+1)*48)+'px';
 }
 controls.addEventListener('change',e=>{const id=(e.target as HTMLElement).id;if(id==='per-string-start')degree=Number(field(id).value);if(id==='per-string-register')firstFret=Number(field(id).value);refresh();});
 document.addEventListener('mehtronome-playback-state',refresh);
 refresh();return {refresh};
}
