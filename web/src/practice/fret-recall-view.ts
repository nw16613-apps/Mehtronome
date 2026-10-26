import {chordToneQuestion} from './fret-recall.js';
const controllers=new WeakMap<HTMLElement,any>();
const kinds=['third','seventh','root','fifth'];
function restore(state:any){
 const diagram=state.panel.querySelector('.exercise-map-diagram');diagram?.classList.remove('recall-masked');
 for(const [node,original] of state.originals){for(const key of ['tabindex','role','aria-label']){if(original[key]===null)node.removeAttribute(key);else node.setAttribute(key,original[key]);}const title=node.querySelector('title');if(title)title.textContent=original.title;}
 state.originals.clear();diagram?.querySelectorAll('.recall-answer,.recall-wrong').forEach((node:Element)=>node.classList.remove('recall-answer','recall-wrong'));
}
function message(state:any,value:string){const target=state.panel.querySelector('#fret-recall-feedback');if(target)target.textContent=value;}
function reset(state:any,value='Choose a tone, then find it without note labels or colour cues. This checks your selection, not your playing or mastery.'){
 restore(state);state.question=null;state.phase='idle';message(state,value);const button=state.panel.querySelector('#fret-recall-start');if(button)button.textContent='Find this tone';const reveal=state.panel.querySelector('#fret-recall-reveal');if(reveal)reveal.disabled=true;
}
function syncRouteChoices(state:any){
 const panel=state.panel as HTMLElement;
 panel.querySelectorAll<HTMLButtonElement>('.exercise-position-route [data-inspect-slot]').forEach(button=>{const current=Number(button.dataset.inspectSlot)===(state.slot??0);button.classList.toggle('current',current);button.setAttribute('aria-pressed',String(current));if(current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');button.disabled=state.playing;});
}
function chooseChord(state:any,slot:number){
 if(state.playing)return;
 const fromGuitar=document.activeElement?.closest('#position-path');const continueQuestion=state.phase!=='idle';state.panel.dispatchEvent(new CustomEvent('exercise-inspect-chord',{detail:{slot},bubbles:true}));if(continueQuestion)begin(state);if(fromGuitar)document.querySelector<HTMLButtonElement>(`#position-path [data-inspect-slot="${slot}"]`)?.focus({preventScroll:true});
}
export function selectRecallChord(panel:HTMLElement,slot:number){const state=controllers.get(panel);if(state)chooseChord(state,slot);}
function begin(state:any){
 if(state.playing)return;
 if(state.phase==='correct'||state.phase==='revealed'){
  const control=state.panel.querySelector('#fret-recall-tone');let index=kinds.indexOf(control.value);
  for(let attempt=0;attempt<kinds.length;attempt++){index=(index+1)%kinds.length;if(!chordToneQuestion(state.harmony,state.board,kinds[index]).unavailable){control.value=kinds[index];break;}}
 }
 reset(state);const kind=state.panel.querySelector('#fret-recall-tone').value,question=chordToneQuestion(state.harmony,state.board,kind);if(question.prompt===undefined){message(state,question.unavailable!);return;}
 const hiddenButton=state.panel.querySelector('#exercise-recall');if(hiddenButton?.getAttribute('aria-pressed')==='true')hiddenButton.click();
 state.question=question;state.phase='asking';const diagram=state.panel.querySelector('.exercise-map-diagram');diagram.classList.add('recall-masked');
 diagram.querySelectorAll('.fret-note').forEach((node:SVGGElement)=>{const location=`String ${6-Number(node.dataset.string)}, fret ${node.dataset.fret}`;state.originals.set(node,{tabindex:node.getAttribute('tabindex'),role:node.getAttribute('role'),'aria-label':node.getAttribute('aria-label'),title:node.querySelector('title')?.textContent||''});node.setAttribute('tabindex','0');node.setAttribute('role','button');node.setAttribute('aria-label',location);const title=node.querySelector('title');if(title)title.textContent=location;});
 state.panel.querySelector('#fret-recall-reveal').disabled=false;message(state,question.prompt);state.panel.querySelector('#fret-recall-start').textContent='Restart target';
}
function reveal(state:any,correct=false){
 const question=state.question;if(!question)return;restore(state);state.phase=correct?'correct':'revealed';
 state.panel.querySelectorAll('.exercise-map-diagram .fret-note').forEach((node:SVGGElement)=>{if(Number(node.dataset.pc)===question.pc)node.classList.add('recall-answer');});
 message(state,`${correct?'Correct.':'Answer revealed.'} ${question.name} is the ${question.interval} of ${question.chord}. Ringed notes show its available locations. This is a note-selection self-check.`);
 state.panel.querySelector('#fret-recall-start').textContent='Next tone';state.panel.querySelector('#fret-recall-start').focus({preventScroll:true});state.panel.querySelector('#fret-recall-reveal').disabled=true;
}
function answer(state:any,node:SVGGElement){
 if(Number(node.dataset.pc)===state.question.pc){reveal(state,true);return;}
 state.panel.querySelectorAll('.recall-wrong').forEach((n:Element)=>n.classList.remove('recall-wrong'));node.classList.add('recall-wrong');message(state,`Try again. Look for the ${state.question.interval} of ${state.question.chord}.`);
}
export function installFretRecall(panel:HTMLElement,board:any,harmony:any){
 let state=controllers.get(panel);
 if(!state){state={panel,board,harmony,question:null,phase:'idle',playing:false,originals:new Map()};controllers.set(panel,state);
  panel.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;
   const node=target.closest<SVGGElement>('.exercise-map-diagram .fret-note');if(node&&state.phase==='asking'){event.preventDefault();event.stopImmediatePropagation();answer(state,node);return;}
   const chord=target.closest<HTMLElement>('.exercise-position-route [data-inspect-slot]');if(chord){event.preventDefault();event.stopImmediatePropagation();chooseChord(state,Number(chord.dataset.inspectSlot));return;}
   if(target.closest('#fret-recall-start'))begin(state);
   if(target.closest('#fret-recall-reveal'))reveal(state);
   if(target.closest('#fret-recall-end')||target.closest('#exercise-recall')||target.closest('#exercise-map-toggle'))reset(state);
  },true);
  panel.addEventListener('keydown',event=>{const target=event.target instanceof Element?event.target.closest<SVGGElement>('.exercise-map-diagram .fret-note'):null;if(state.phase==='asking'&&target&&['Enter',' '].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();answer(state,target);}} ,true);
  panel.addEventListener('input',event=>{if((event.target as HTMLElement).id==='fret-recall-tone')reset(state);});
 }
 state.board=board;state.harmony=harmony;state.slot=0;
 const control=document.createElement('details');control.className='fret-recall';control.innerHTML='<summary>Find a chord tone · self-check</summary><div class="fret-recall-controls"><label>Tone<select id="fret-recall-tone"><option value="third">Third</option><option value="seventh">Seventh</option><option value="root">Root</option><option value="fifth">Fifth</option></select></label><button id="fret-recall-start" type="button" class="practice-button">Find this tone</button><button id="fret-recall-reveal" type="button" class="practice-button" disabled>Reveal answer</button><button id="fret-recall-end" type="button" class="practice-button">End self-check</button></div><p id="fret-recall-feedback" class="practice-help" role="status"></p>';
 panel.querySelector('.exercise-map-diagram')!.before(control);reset(state);syncRouteChoices(state);for(const id of ['fret-recall-tone','fret-recall-start'])(panel.querySelector('#'+id) as HTMLInputElement).disabled=state.playing;if(state.playing)message(state,'Self-check paused during playback. Stop playback to try a target.');
}
export function updateFretRecall(panel:HTMLElement,board:any,harmony:any,slot=0){const state=controllers.get(panel);if(!state)return;state.board=board;state.harmony=harmony;state.slot=slot;reset(state,'Chord or position updated. Start a new self-check for this view.');syncRouteChoices(state);}
export function setFretRecallPlaying(panel:HTMLElement,playing:boolean){const state=controllers.get(panel);if(!state||state.playing===playing)return;state.playing=playing;if(playing)reset(state,'Self-check paused during playback. Stop playback to try a target.');syncRouteChoices(state);for(const id of ['fret-recall-tone','fret-recall-start']){const control=panel.querySelector<HTMLInputElement>('#'+id);if(control)control.disabled=playing;}}
