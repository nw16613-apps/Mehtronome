import {DROP_STRING_SETS} from '../guitar/drop-voicings.js';
import {MODES} from '../audio/music.js';
import {PER_STRING_STUDIES,perStringExerciseChoice,exerciseFingeringCatalogue} from './per-string-exercises.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function arpeggioFingeringControls(panel:HTMLElement,view:any,harmony:any,active:boolean,locked:boolean){
 panel.classList.toggle('per-string-exercise',active);
 if(!PER_STRING_STUDIES.has(view.study))return;
 const choices=exerciseFingeringCatalogue(harmony,{...view,fingering:active?view.fingering:'oneTwo'}),choice=active?perStringExerciseChoice(harmony,view):null,drop=view.fingering.startsWith('drop'),scale=view.fingering==='three';
 const controls=document.createElement('div');controls.className='arpeggio-position-choices';
 const disabled=(extra=false)=>locked||extra?'disabled':'';
 controls.innerHTML=`<label>Fingering<select id="exercise-fingering" ${disabled()}>${[['caged','CAGED'],...(view.study==='positionalscale'?[['three','3 notes per string']]:[['oneTwo','1–2–1–2–1–2'],['twoOne','2–1–2–1–2–1'],['drop2','Drop 2'],['drop3','Drop 3']])].map(([id,name])=>`<option value="${id}" ${view.fingering===id?'selected':''}>${name}</option>`).join('')}</select></label>${active?`${drop?`<label>String set<select id="exercise-fingering-set" ${disabled()}>${(DROP_STRING_SETS as any)[view.fingering].map((strings:number[],i:number)=>`<option value="${i}" ${i===view.fingeringStringSet?'selected':''}>Strings ${strings.map(s=>6-s).join('–')}</option>`).join('')}</select></label>`:''}<label>${scale?'Starting degree':'Inversion'}<select id="exercise-inversion" ${disabled(!choices.length)}>${choices.length?choices.map((entry:any,i:number)=>`<option value="${i}" ${i===choice!.index?'selected':''}>${scale?'Degree '+(MODES as any)[harmony.mode].degrees[entry.degree]:i===0?'Root position':['','First','Second','Third','Fourth','Fifth','Sixth'][i]+' inversion'} · ${esc(scale?harmony.scaleNames[entry.degree]:harmony.tones[entry.degree])}</option>`).join(''):'<option>No four-tone voicing</option>'}</select></label><label>${drop?'Bass fret':'Starting fret · low E'}<select id="exercise-fingering-fret" ${disabled(choice!.entry.choices.length<2)}>${choice!.entry.choices.map((b:any)=>`<option value="${b.firstFret}" ${b.firstFret===choice!.board.firstFret?'selected':''}>${b.firstFret} · frets ${b.start}–${b.end}</option>`).join('')}</select></label>`:''}`;
 panel.querySelector('.exercise-navigation')!.append(controls);
 if(!active)return;
 for(const id of ['exercise-start-note','exercise-chord-diagrams']){const label=panel.querySelector('#'+id)?.closest('label');if(label)(label as HTMLElement).hidden=true;}
 const svg=panel.querySelector<SVGElement>('.exercise-map-diagram svg');if(svg)svg.style.minWidth=Math.max(480,(choice!.board.end-choice!.board.start+1)*48)+'px';
 const help=panel.querySelector('.exercise-lesson p');if(help)help.textContent=drop?'Arpeggiate the four notes of the selected drop voicing through each chord. The string set, inversion and register match the fretboard shape.':'Follow the selected fingering through each chord. Direction chooses the opening end; turning notes are not repeated.';
 const key=panel.querySelector('.exercise-active-key');if(key)key.textContent=drop?'Ring: chord voicing · square: current note':'Dashed ring: modal colour · square: current note';
 panel.querySelector('.exercise-navigation>h4')!.textContent='Chord & fingering';
 panel.querySelector('.exercise-map-heading strong')!.textContent=harmony.name+harmony.suffix+' · '+choice!.label;
}
