import {perStringCatalogue} from '../guitar/per-string.js';
import {PER_STRING_STUDIES,perStringExerciseChoice} from './per-string-exercises.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function arpeggioFingeringControls(panel:HTMLElement,view:any,harmony:any,active:boolean,locked:boolean){
 panel.classList.toggle('per-string-exercise',active);
 if(!PER_STRING_STUDIES.has(view.study))return;
 const choices=perStringCatalogue(harmony,active?view.fingering:'oneTwo'),choice=active?perStringExerciseChoice(harmony,view):null;
 const controls=document.createElement('div');controls.className='arpeggio-position-choices';
 controls.innerHTML=`<label>Fingering<select id="exercise-fingering" ${locked?'disabled':''}>${[['caged','CAGED'],['oneTwo','1–2–1–2–1–2'],['twoOne','2–1–2–1–2–1']].map(([id,name])=>`<option value="${id}" ${view.fingering===id?'selected':''}>${name}</option>`).join('')}</select></label>${active?`<label>Inversion<select id="exercise-inversion" ${locked?'disabled':''}>${choices.map((entry:any,i:number)=>`<option value="${i}" ${i===choice!.index?'selected':''}>${i===0?'Root position':['','First','Second','Third','Fourth','Fifth','Sixth'][i]+' inversion'} · ${esc(harmony.tones[entry.degree])} (${esc(harmony.intervals[entry.degree])})</option>`).join('')}</select></label><label>Starting fret · low E<select id="exercise-fingering-fret" ${locked?'disabled':''}>${choice!.entry.choices.map((b:any)=>`<option value="${b.firstFret}" ${b.firstFret===choice!.board.firstFret?'selected':''}>${b.firstFret===0?'Open':b.firstFret} · frets ${b.start}–${b.end}</option>`).join('')}</select></label>`:''}`;
 panel.querySelector('.exercise-navigation')!.append(controls);
 if(!active)return;
 for(const id of ['exercise-start-note','exercise-chord-diagrams']){const label=panel.querySelector('#'+id)?.closest('label');if(label)(label as HTMLElement).hidden=true;}
 const svg=panel.querySelector<SVGElement>('.exercise-map-diagram svg');if(svg)svg.style.minWidth=Math.max(480,(choice!.board.end-choice!.board.start+1)*48)+'px';
 const help=panel.querySelector('.exercise-lesson p');if(help)help.textContent='Follow the selected per-string fingering and inversion through each chord. Direction chooses the opening end; turning notes are not repeated. Extensions remain part of the selected chord.';
 const key=panel.querySelector('.exercise-active-key');if(key)key.textContent='Dashed ring: modal colour · square: current note';
 panel.querySelector('.exercise-navigation>h4')!.textContent='Chord & fingering';
 panel.querySelector('.exercise-map-heading strong')!.textContent=harmony.name+harmony.suffix+' · '+choice!.label;
}
