import {ROOT_NAMES} from '../audio/music.js';
import {POSITIONS} from '../guitar/fretboard.js';
import {FRET_REGIONS} from '../guitar/position-path.js';
import {STUDY_PATH_KEY,STUDY_TIERS,STUDY_MATERIALS,STUDY_ROOT_ORDERS,STUDY_TURNAROUNDS,normalizeStudyPath,readStudyPath,studyPathPlan,studyPathId} from './study-path.js';
const esc=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function installStudyPath(context:{locked:()=>boolean;fingerprint:()=>string;load:(plan:any)=>Promise<void>;navigate:(workspace:string,target:string)=>void}){
 let saved;try{saved=readStudyPath(localStorage.getItem(STUDY_PATH_KEY));}catch{saved=readStudyPath(null);}
 let selection=saved.selection,marked=new Set<string>(saved.marked),active:any=null,activeFingerprint='',loading=false,notice='',barSignature='';
 const panel=document.createElement('section');panel.id='study-path';panel.className='panel study-path workspace-page workspace-study';panel.setAttribute('aria-labelledby','study-path-title');
 document.querySelector('.presets')!.before(panel);
 // Retain older tools without placing their beginner prompts in this pathway.
 const previous=document.createElement('details');previous.className='previous-practice-tools workspace-page workspace-progress';previous.innerHTML='<summary>Other practice tools</summary>';
 const oldGoals=document.getElementById('guided-goals')!,checklist=document.querySelector('.practice-roadmap')!;checklist.before(previous);previous.append(oldGoals,checklist);
 const bar=document.createElement('section');bar.className='study-session';bar.hidden=true;bar.setAttribute('aria-label','Loaded study');document.querySelector('main')!.prepend(bar);
 const persist=()=>{try{localStorage.setItem(STUDY_PATH_KEY,JSON.stringify({selection,marked:[...marked]}));return true;}catch{return false;}};
 const options=(items:any[],value:string|number)=>items.map(([id,label])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(label)}</option>`).join('');
 function render(){
  const plan=studyPathPlan(selection),tier=STUDY_TIERS[selection.tier-1],fixed=plan.navigation==='all';
  const materials=[...new Set(STUDY_MATERIALS.map((m:any)=>m[2]))].map(group=>`<optgroup label="${esc(group)}">${options(STUDY_MATERIALS.filter((m:any)=>m[2]===group),selection.material)}</optgroup>`).join('');
  panel.innerHTML=`<div class="section-heading"><div><p class="eyebrow">CAGED STUDY PATHWAY</p><h2 id="study-path-title">Dorian · minor 7</h2></div><span class="small-label">FIRST PATHWAY</span></div>
   <div class="study-tiers" role="group" aria-label="Study tier">${STUDY_TIERS.map(t=>`<button type="button" class="study-tier" data-study-tier="${t.id}" aria-pressed="${selection.tier===t.id}"><span class="study-tier-number">${t.id}</span><strong>${esc(t.name)}</strong><small>${esc(t.scope)}</small></button>`).join('')}</div>
   <div class="study-path-fields"><label>Minor-7 root<select id="study-root">${options(ROOT_NAMES.map((n,i)=>[i,n]),selection.root)}</select></label>
   <label>Material<select id="study-material">${materials}</select></label>
   <label>${selection.tier===1?'Vamp length':'Bars per chord'}<select id="study-bars">${options([1,2,4,8].map(n=>[n,n+' bar'+(n===1?'':'s')]),selection.bars)}</select></label>
   ${selection.tier===2?`<label>Root order<select id="study-order">${options(Object.entries(STUDY_ROOT_ORDERS),selection.order)}</select></label><label>Root coverage<select id="study-coverage">${options([['cycle','One interval cycle'],['all','All 12 roots']],selection.coverage?'all':'cycle')}</select></label><label>Position approach<select id="study-route">${options([['framework','Same CAGED framework'],['region','Stay in one fretboard region']],selection.route)}</select></label>`:''}
   ${selection.tier===3?`<label>Progression<select id="study-turnaround">${options(Object.entries(STUDY_TURNAROUNDS),selection.turnaround)}</select></label>`:''}
   ${fixed?`<label>CAGED position<select id="study-position">${options(POSITIONS.map(p=>[p.numeral,p.numeral+' · '+p.shape+' framework']),selection.position)}</select></label>`:`<label>Fretboard region<select id="study-region">${options(Object.entries(FRET_REGIONS).map(([id,r])=>[id,r.name]),selection.region)}</select></label>`}</div>
   <div class="study-chart-preview" aria-label="Study chart preview">${plan.chords.map((chord:string,i:number)=>`<span><small>${i+1}</small>${esc(chord)}</span>`).join('')}</div>
   <div class="study-load-row"><button type="button" class="practice-button" id="study-load">Load study</button><span>${plan.chords.length} chord${plan.chords.length===1?'':'s'} · ${selection.bars} bar${selection.bars===1?'':'s'} ${selection.tier===1?'in loop':'each'}</span><label class="check"><input type="checkbox" id="study-marked" ${marked.has(plan.id)?'checked':''}>Studied</label></div>
   <p class="study-path-status" id="study-path-status" role="status">${esc(notice)}</p>`;
  panel.dataset.tier=String(tier.id);sync();
 }
 function sync(){
  const locked=loading||context.locked();panel.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement>('input,button,select').forEach(e=>e.disabled=locked);
  const button=panel.querySelector('#study-load');if(button)button.textContent=loading?'Loading…':'Load study';
  if(!active)return;
  const changed=context.fingerprint()!==activeFingerprint;
  bar.hidden=false;const signature=active.id+':'+changed;
  if(signature===barSignature){bar.querySelectorAll<HTMLButtonElement>('[data-study-reload]').forEach(b=>b.disabled=locked);return;}
  barSignature=signature;bar.innerHTML=`<div><span class="eyebrow">TIER ${active.selection.tier} · DORIAN PATHWAY</span><strong>${esc(STUDY_MATERIALS.find((m:any)=>m[0]===active.study)?.[1])} · ${esc(active.navigation==='all'?'Position '+active.selection.position:FRET_REGIONS[active.selection.region as keyof typeof FRET_REGIONS].name)}</strong>${changed?'<small>Setup modified</small>':''}</div><div class="study-session-actions">${changed?'<button type="button" class="practice-button" data-study-reload>Reload study</button>':''}<button type="button" class="practice-button" data-study-nav="harmony">Chart</button><button type="button" class="practice-button" data-study-nav="guitar">Fretboard</button><button type="button" class="practice-button" data-study-nav="exercises">Exercises</button><button type="button" class="practice-button" data-study-nav="study">Study</button><button type="button" class="study-dismiss" data-study-dismiss aria-label="End study navigation">×</button></div>`;
  bar.querySelectorAll<HTMLButtonElement>('[data-study-reload]').forEach(b=>b.disabled=locked);
 }
 async function load(value=selection){
  if(loading||context.locked())return;loading=true;notice='';sync();
  try{const plan=studyPathPlan(value);await context.load(plan);active=plan;activeFingerprint=context.fingerprint();notice='Study loaded · previous chart available with Undo.';}
  catch(error){notice=error instanceof Error?error.message:'Could not load this study.';}
  finally{loading=false;render();}
 }
 panel.addEventListener('change',event=>{
  const input=event.target as HTMLInputElement;if(loading||context.locked())return;
  if(input.id==='study-marked'){const id=studyPathId(selection);if(input.checked)marked.add(id);else marked.delete(id);notice=persist()?'Marked manually · saved in this browser.':'Marked for this session; browser storage is unavailable.';panel.querySelector('#study-path-status')!.textContent=notice;return;}
  const fields:Record<string,string>={'study-root':'root','study-material':'material','study-bars':'bars','study-order':'order','study-route':'route','study-position':'position','study-region':'region','study-turnaround':'turnaround'};
  const field=fields[input.id];if(field)selection=normalizeStudyPath({...selection,[field]:input.value});
  if(input.id==='study-coverage')selection={...selection,coverage:input.value==='all'};
  notice='';persist();render();const replacement=panel.querySelector<HTMLElement>('#'+input.id);replacement?.focus({preventScroll:true});
 });
 panel.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
  if(button.dataset.studyTier){selection=normalizeStudyPath({...selection,tier:Number(button.dataset.studyTier)});notice='';persist();render();panel.querySelector<HTMLButtonElement>(`[data-study-tier="${selection.tier}"]`)?.focus({preventScroll:true});}
  if(button.id==='study-load')void load();
 });
 bar.addEventListener('click',event=>{
  const target=(event.target as Element).closest<HTMLElement>('button');if(!target)return;
  if(target.hasAttribute('data-study-dismiss')){active=null;barSignature='';bar.hidden=true;return;}
  if(target.hasAttribute('data-study-reload')){void load(active.selection);return;}
  const name=target.dataset.studyNav;if(name)context.navigate(name,{harmony:'harmony-title',guitar:'guitar-title',exercises:'caged-exercise',study:'study-path-title'}[name]||'study-path-title');
 });
 document.addEventListener('input',()=>queueMicrotask(sync));document.addEventListener('change',()=>queueMicrotask(sync));
 render();return {sync};
}
