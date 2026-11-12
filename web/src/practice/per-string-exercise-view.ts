import {playableSpreadStringSets} from '../guitar/spread-triads.js';
import {DROP_STRING_SETS} from '../guitar/drop-voicings.js';
import {MODES} from '../audio/music.js';
import {PER_STRING_STUDIES,perStringExerciseChoice,exerciseFingeringCatalogue} from './per-string-exercises.js';
const esc=(v:any)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function arpeggioFingeringControls(panel:HTMLElement,view:any,harmony:any,active:boolean,locked:boolean){
 panel.classList.toggle('per-string-exercise',active);
 if(!PER_STRING_STUDIES.has(view.study))return;
 const spreadSets=view.fingering==='spread'?playableSpreadStringSets(harmony,view.spreadSource):[];
 if(view.fingering==='spread'&&!spreadSets.some(s=>s.index===view.fingeringStringSet))view.fingeringStringSet=spreadSets[0]?.index||0;
 const choices=exerciseFingeringCatalogue(harmony,{...view,fingering:active?view.fingering:'oneTwo'}),choice=active?perStringExerciseChoice(harmony,view):null,drop=view.fingering.startsWith('drop')||view.fingering==='spread',scale=view.fingering==='three';
 const controls=document.createElement('div');controls.className='arpeggio-position-choices';
 const disabled=(extra=false)=>locked||extra?'disabled':'';
 controls.innerHTML=`<label>Fingering<select id="exercise-fingering" ${disabled()}>${[['caged','CAGED'],...(view.study==='positionalscale'?[['three','3 notes per string']]:[['spread','Spread triads'],['oneTwo','1–2–1–2–1–2'],['twoOne','2–1–2–1–2–1'],...(view.material==='triad'?[]:[['drop2','Drop 2'],['drop3','Drop 3']])])].map(([id,name])=>`<option value="${id}" ${view.fingering===id?'selected':''}>${name}</option>`).join('')}</select></label>${active?`${view.fingering==='spread'?`<label>Build from<select id="exercise-spread-source" ${disabled()}><option value="chord" ${view.spreadSource!=='mode'?'selected':''}>Current chord</option><option value="mode" ${view.spreadSource==='mode'?'selected':''}>All degrees of the mode</option></select></label>`:''}${drop?`<label>String set<select id="exercise-fingering-set" ${disabled()}>${(view.fingering==='spread'?spreadSets:(DROP_STRING_SETS as any)[view.fingering].map((strings:number[],index:number)=>({strings,index}))).map(({strings,index:i}:any)=>`<option value="${i}" ${i===view.fingeringStringSet?'selected':''}>Strings ${strings.map((s:number)=>6-s).join('–')}</option>`).join('')}</select></label>`:''}<label>${scale?'Starting degree':'Inversion'}<select id="exercise-inversion" ${disabled(!choices.length)}>${choices.length?choices.map((entry:any,i:number)=>view.fingering==='spread'&&!entry.choices.length?'':`<option value="${i}" ${i===choice!.index?'selected':''}>${entry.label?esc(entry.label):scale?'Degree '+(MODES as any)[harmony.mode].degrees[entry.degree]:i===0?'Root position':['','First','Second','Third','Fourth','Fifth','Sixth'][i]+' inversion'}${entry.label?'':' · '+esc(scale?harmony.scaleNames[entry.degree]:harmony.tones[entry.degree])}</option>`).join(''):'<option>No playable voicing</option>'}</select></label><label>${drop?'Bass fret':'Starting fret · low E'}<select id="exercise-fingering-fret" ${disabled(choice!.entry.choices.length<2)}>${choice!.entry.choices.map((b:any)=>`<option value="${b.firstFret}" ${b.firstFret===choice!.board.firstFret?'selected':''}>${b.firstFret} · frets ${b.start}–${b.end}</option>`).join('')}</select></label>`:''}`;
 panel.querySelector('.exercise-navigation')!.append(controls);
 if(!active)return;
 for(const id of ['exercise-start-note','exercise-chord-diagrams']){const label=panel.querySelector('#'+id)?.closest('label');if(label)(label as HTMLElement).hidden=true;}
 const svg=panel.querySelector<SVGElement>('.exercise-map-diagram svg');if(svg)svg.style.minWidth=Math.max(480,(choice!.board.end-choice!.board.start+1)*48)+'px';
 const help=panel.querySelector('.exercise-lesson p');if(help)help.textContent=drop?'Arpeggiate the notes of the selected chord voicing through each chord. The string set, inversion and register match the fretboard shape.':'Follow the selected fingering through each chord. Direction chooses the opening end; turning notes are not repeated.';
 const key=panel.querySelector('.exercise-active-key');if(key)key.textContent=drop?'Ring: chord voicing · square: current note':'Dashed ring: modal colour · square: current note';
 panel.querySelector('.exercise-navigation>h4')!.textContent='Chord & fingering';
 panel.querySelector('.exercise-map-heading strong')!.textContent=harmony.name+harmony.suffix+' · '+choice!.label;
}
