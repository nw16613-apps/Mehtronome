import {randomizeStudy,normalizeStudyRandomizer} from './study-randomizer.js';
import {GENERATOR_VOCABULARIES} from './progression-generator.js';
import {ROOT_NAMES,MODES,CHORDS} from '../audio/music.js';
import {POSITIONS} from '../guitar/fretboard.js';
import {FRET_REGIONS} from '../guitar/position-path.js';
import {playbackChartKey} from './chord-playback.js';
import {STUDY_PATH_KEY,STUDY_TIERS,STUDY_MATERIALS,STUDY_ROOT_ORDERS,STUDY_TURNAROUNDS,STUDY_FORMS,studyChordChoices,studyModeChoices,studyPair,normalizeStudyPath,readStudyPath,studyPathPlan} from './study-path.js';
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function installStudyPath(context:{locked:()=>boolean;fingerprint:()=>string;load:(plan:any)=>Promise<void>;navigate:(workspace:string,target:string)=>void;sources?:()=>any[];randomizerChanged?:()=>void}){
 let saved;try{saved=readStudyPath(localStorage.getItem(STUDY_PATH_KEY));}catch{saved=readStudyPath(null);}
 const randomHistory:any[]=[];let repeatCounter=0;
 let selection=saved.selection,marked=new Set<string>(saved.marked),active:any=null,activeFingerprint='',loading=false,notice='',barSignature='';
 let sources=[...STUDY_FORMS,...(context.sources?.()||[])],plan=studyPathPlan(selection,sources);
 const panel=document.createElement('section');panel.id='study-path';panel.className='panel study-path workspace-page workspace-study';panel.setAttribute('aria-labelledby','study-path-title');document.querySelector('.presets')!.before(panel);
 const previous=document.createElement('details');previous.className='previous-practice-tools workspace-page workspace-progress';previous.innerHTML='<summary>Other practice tools</summary>';
 const oldGoals=document.getElementById('guided-goals')!,checklist=document.querySelector('.practice-roadmap')!;checklist.before(previous);previous.append(oldGoals,checklist);
 const bar=document.createElement('section');bar.className='study-session';bar.hidden=true;bar.setAttribute('aria-label','Loaded study');document.querySelector('main')!.prepend(bar);
 const persist=()=>{try{localStorage.setItem(STUDY_PATH_KEY,JSON.stringify({version:2,selection,marked:[...marked]}));return true;}catch{return false;}};
 const options=(items:any[],value:string|number)=>items.map(([id,label])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(label)}</option>`).join('');
 const refreshSources=()=>{sources=[...STUDY_FORMS,...(context.sources?.()||[])];};
 function render(){
  const randomOpen=panel.querySelector<HTMLDetailsElement>('#study-randomizer')?.open||false;
  const scroll=panel.querySelector('.study-chart-preview')?.scrollTop||0;
  plan=studyPathPlan(selection,sources);selection=plan.selection;selection.card=Math.min(selection.card,plan.chords.length-1);
  const manual=plan.navigation==='all',h=plan.harmonies[selection.card],pair={mode:h.mode,chord:h.chordId};
  if(plan.singleQuality)Object.assign(pair,{mode:selection.mode,chord:selection.chord});
  const modeChoices:any[]=selection.workflow==='mode'?Object.entries(MODES).map(([id,m])=>[id,m.name]):studyModeChoices(pair.chord||h.chordId).map(m=>[m.id,m.name]);
  const chordId=plan.singleQuality?selection.chord:h.chordId;
  const chords:any[]=selection.workflow==='chord'?Object.entries(CHORDS).map(([id,c])=>[id,c.name]):studyChordChoices(pair.mode).map((c:any)=>[c.id,c.name]);
  if(!modeChoices.some(([id])=>id===pair.mode))modeChoices.unshift([pair.mode,MODES[pair.mode as keyof typeof MODES].name+' · stored guide']);
  if(!chords.some(([id])=>id===chordId))chords.unshift([chordId,CHORDS[chordId as keyof typeof CHORDS].name+' · stored chord']);
  const mode=`<label>Mode / scale<select id="study-mode">${options(modeChoices,pair.mode)}</select></label>`,chord=`<label>Chord quality<select id="study-chord">${options(chords,chordId)}</select></label>`;
  const materials=[...new Set(STUDY_MATERIALS.map(m=>m[2]))].map(group=>`<optgroup label="${esc(group)}">${options(STUDY_MATERIALS.filter(m=>m[2]===group),selection.material)}</optgroup>`).join('');
  const forms=[...new Set(sources.map(f=>f.group))].map(group=>`<optgroup label="${esc(group)}">${options(sources.filter(f=>f.group===group).map(f=>[f.id,f.label||f.name]),selection.form)}</optgroup>`).join('');
  panel.innerHTML=`<div class="section-heading"><div><p class="eyebrow">ACROSS THE FRETBOARD</p><h2 id="study-path-title">Study pathway</h2></div></div>
   <div class="study-tiers" role="group" aria-label="Study tier">${STUDY_TIERS.map(t=>`<button type="button" class="study-tier" data-study-tier="${t.id}" aria-pressed="${selection.tier===t.id}"><span class="study-tier-number">${t.id}</span><strong>${esc(t.name)}</strong><small>${esc(t.scope)}</small></button>`).join('')}</div>
   <div class="study-path-fields"><label>${plan.singleQuality?'Modal tonic':'Chart key'}<select id="study-root">${options(ROOT_NAMES.map((n,i)=>[i,n]),selection.root)}</select></label>
   <label>Material<select id="study-material">${materials}</select></label>
   ${selection.tier<4?`<label>${selection.tier===1?'Bars per pass':plan.singleQuality||selection.randomChart?'Bars per chord':'Chord duration multiplier'}<select id="study-bars">${options([1,2,4,8].map(n=>[n,selection.tier<3&&plan.singleQuality?n+' bar'+(n===1?'':'s'):n+'×']),selection.bars)}</select></label>`:''}
   ${selection.tier===2&&!selection.randomChart?`<label>Root order<select id="study-order">${options(Object.entries(STUDY_ROOT_ORDERS),selection.order)}</select></label><label>Root coverage<select id="study-coverage">${options([['cycle','One interval cycle'],['all','All 12 roots']],selection.coverage?'all':'cycle')}</select></label>`:''}
   ${selection.tier===3&&!selection.randomChart?`<label>Progression<select id="study-turnaround">${options(Object.entries(STUDY_TURNAROUNDS),selection.turnaround)}</select></label><label>Key movement<select id="study-key-cycle">${options([['single','Single key'],['fourths','Circle of fourths · all 12 keys']],selection.keyCycle)}</select></label>`:''}
   ${selection.tier===4?`<label class="study-form-choice">Song / form<select id="study-form">${forms}</select></label><button type="button" class="practice-button" id="study-current-chart">Use current chart</button>`:''}
   <label>Position approach<select id="study-route">${options([['region','Fixed region'],['manual','Manual positions']],selection.route)}</select></label>
   ${manual?`<label>Set every position to<select id="study-position"><option value="">Choose a shape</option>${options(POSITIONS.map(p=>[p.numeral,p.numeral+' · '+p.shape+' shape']),'')}</select></label>`:`<label>Fretboard region<select id="study-region">${options(Object.entries(FRET_REGIONS).map(([id,r])=>[id,r.name]),selection.region)}</select></label>`}
   <label>Passes<select id="study-passes">${options(Array.from({length:plan.maxPasses},(_,i)=>[i+1,i+1]),selection.passes)}</select></label></div>
   <section class="study-harmony" aria-label="Study harmony"><div class="study-workflow" role="group" aria-label="Harmony selection">${[['chord','Chord first'],['mode','Mode first']].map(([id,label])=>`<button type="button" class="practice-button" data-study-workflow="${id}" aria-pressed="${selection.workflow===id}">${label}</button>`).join('')}</div>
   <div class="study-path-fields">${!plan.singleQuality?`<label>Selected chord<select id="study-card">${options(plan.chords.map((c:string,i:number)=>[i,`${i+1}. ${c}`]),selection.card)}</select></label>`:''}${selection.workflow==='mode'?mode+chord:chord+mode}</div></section>
   <details id="study-randomizer" class="study-randomizer" ${randomOpen?'open':''}><summary>Randomiser settings</summary>
    <div class="study-path-fields">
     ${selection.tier===3?`<label>Changes<select id="study-random-approach">${options([['independent','Independent chords'],['related','Related changes']],selection.randomizer.approach)}</select></label>`:''}
     ${selection.tier===2||selection.tier===3?`<label>Chord slots<select id="study-random-count">${options([...new Set([1,4,8,12,16,24,32,48,64,selection.randomizer.count])].sort((a,b)=>a-b).filter(n=>selection.tier!==3||selection.randomizer.approach!=='related'||n>=4).map(n=>[n,n]),selection.randomizer.count)}</select></label>`:''}
     ${selection.tier===3&&selection.randomizer.approach==='related'?`<label>Chord vocabulary<select id="study-random-vocabulary">${options([['triads','Triads'],['sevenths','Sevenths'],['extensions','Extensions']],selection.randomizer.vocabulary)}</select></label><label>Tonality<select id="study-random-tonality">${options([['major','Major'],['minor','Minor'],['modal','Selected mode']],selection.randomizer.tonality)}</select></label><label>Harmonic variety<select id="study-random-complexity">${options([['diatonic','Diatonic'],['borrowed','Borrowed chords'],['secondary','Secondary dominants'],['substitutions','Substitutions']],selection.randomizer.complexity)}</select></label>`:''}
     ${selection.tier===3&&selection.randomizer.approach==='independent'?`<label>Eligible chord qualities<select multiple size="6" id="study-random-qualities">${Object.entries(CHORDS).map(([id,c])=>`<option value="${id}" ${selection.randomizer.qualities.includes(id)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>`:''}
     ${selection.tier===3?`<label>Mode guides · none selected = all compatible<select multiple size="6" id="study-random-modes">${Object.entries(MODES).map(([id,m])=>`<option value="${id}" ${selection.randomizer.modes.includes(id)?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label>`:''}
    </div>
    <fieldset class="study-random-roots"><legend>${selection.tier===4||selection.tier===3&&selection.randomizer.approach==='related'?'Eligible keys':'Eligible roots'}</legend><div>${ROOT_NAMES.map((name,i)=>`<label><input type="checkbox" data-study-random-root="${i}" ${selection.randomizer.roots.includes(i)?'checked':''}>${esc(name)}</label>`).join('')}</div><button type="button" class="practice-button" id="study-random-all">All 12</button></fieldset>
    ${selection.tier===2||selection.tier===3&&selection.randomizer.approach==='independent'?`<label class="check"><input type="checkbox" id="study-random-coverage" ${selection.randomizer.coverage?'checked':''}>Visit selected roots before repeating</label>`:''}
    <div class="study-random-repeat"><label class="check"><input type="checkbox" id="study-random-auto" ${selection.randomizer.auto?'checked':''}>New chart between repetitions</label><label>Every<select id="study-random-every">${options(Array.from({length:16},(_,i)=>[i+1,(i+1)+' repetition'+(i?'s':'')]),selection.randomizer.every)}</select></label></div>
   </details>
   <div class="study-random-actions"><button type="button" class="practice-button" id="study-randomize">${selection.tier===1||selection.tier===4?'Random key':'Randomise chords'}</button><button type="button" class="practice-button" id="study-random-undo" ${randomHistory.length?'':'disabled'}>Undo randomisation</button>${selection.randomChart?'<button type="button" class="practice-button" id="study-random-reset">Use tier template</button>':''}</div>
   <div class="study-chart-preview ${manual?'study-manual-route':''}" aria-label="Study chart and position route">${plan.chords.map((c:string,i:number)=>`<article data-study-step="${i}" class="${selection.card===i?'study-card-selected':''}"><button type="button" data-study-card="${i}" aria-pressed="${selection.card===i}"><small>${i+1}${selection.passes>1?' · Pass '+(Math.floor(i/plan.baseCount)+1):''}</small><strong>${esc(c)}</strong><small>${esc(MODES[plan.harmonies[i].mode as keyof typeof MODES].name)}</small></button>${manual?`<label>Position<select data-study-position="${i}" aria-label="Position for chord ${i+1}, ${esc(c)}">${options(POSITIONS.map(p=>[p.numeral,p.numeral+' · '+p.shape]),plan.positions?.[i]||selection.position)}</select></label>`:''}</article>`).join('')}</div>
   <div class="study-load-row"><button type="button" class="practice-button" id="study-load">Load study</button><span>${plan.chords.length} chord slots · ${selection.passes} pass${selection.passes===1?'':'es'}</span><label class="check"><input type="checkbox" id="study-marked" ${marked.has(plan.id)?'checked':''}>Studied</label></div>
   <p class="study-path-status" id="study-path-status" role="status">${esc(notice)}</p>`;
  const preview=panel.querySelector<HTMLElement>('.study-chart-preview')!;preview.scrollTop=scroll;preview.dataset.playbackChart=playbackChartKey({key:plan.chart.key,beats:plan.chart.beats,progression:true,template:'custom',customProgression:plan.chart.progression,mode:selection.mode,chord:selection.chord});
  panel.dataset.tier=String(selection.tier);sync();
 }
 function sync(){
  const autoOff=bar.querySelector<HTMLButtonElement>('[data-study-auto-off]');if(autoOff)autoOff.disabled=loading;
  const locked=loading||context.locked();panel.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement>('input,button,select').forEach(e=>e.disabled=locked);
  const undo=panel.querySelector<HTMLButtonElement>('#study-random-undo');if(undo)undo.disabled=locked||!randomHistory.length;
  const button=panel.querySelector('#study-load');if(button)button.textContent=loading?'Loading…':'Load study';
  if(!active)return;const changed=context.fingerprint()!==activeFingerprint;bar.hidden=false;const signature=active.id+':'+changed+':'+active.selection.randomizer.auto;
  if(signature===barSignature){bar.querySelectorAll<HTMLButtonElement>('[data-study-reload]').forEach(b=>b.disabled=locked);return;}barSignature=signature;
  const location=active.navigation==='all'?'Manual positions':FRET_REGIONS[active.selection.region as keyof typeof FRET_REGIONS].name;
  bar.innerHTML=`<div><span class="eyebrow">TIER ${active.selection.tier} · ${esc(active.chart.progression.name)}</span><strong>${esc(STUDY_MATERIALS.find(m=>m[0]===active.selection.material)?.[1])} · ${esc(location)}</strong>${changed?'<small>Setup modified</small>':''}</div><div class="study-session-actions">${active.selection.randomizer.auto?'<button type="button" class="practice-button" data-study-auto-off>Stop random changes</button>':''}${changed?'<button type="button" class="practice-button" data-study-reload>Reload study</button>':''}<button type="button" class="practice-button" data-study-nav="harmony">Chart</button><button type="button" class="practice-button" data-study-nav="guitar">Fretboard</button><button type="button" class="practice-button" data-study-nav="exercises">Exercises</button><button type="button" class="practice-button" data-study-nav="study">Study</button><button type="button" class="study-dismiss" data-study-dismiss aria-label="End study navigation">×</button></div>`;
  bar.querySelectorAll<HTMLButtonElement>('[data-study-reload]').forEach(b=>b.disabled=locked);
 }
 async function load(value=selection,sourceSet=sources){
  if(loading||context.locked())return;loading=true;notice='';sync();
  try{const prepared=studyPathPlan(value,sourceSet);await context.load(prepared);active=prepared;selection=normalizeStudyPath(prepared.selection);repeatCounter=0;activeFingerprint=context.fingerprint();persist();notice='Study loaded · previous chart available with Undo.';return true;}
  catch(error){notice=error instanceof Error?error.message:'Could not load this study.';return false;}finally{loading=false;render();}
 }
 const changed=()=>{notice='';persist();render();};
 panel.addEventListener('change',event=>{
  const input=event.target as HTMLInputElement;if(loading||context.locked())return;
  if(input.dataset.studyRandomRoot!==undefined){const root=Number(input.dataset.studyRandomRoot);selection.randomizer.roots=input.checked?[...selection.randomizer.roots,root]:selection.randomizer.roots.filter((n:number)=>n!==root);changed();panel.querySelector<HTMLElement>(`[data-study-random-root="${root}"]`)?.focus({preventScroll:true});return;}
  if(input.id.startsWith('study-random-')){
   const fields:Record<string,string>={'study-random-approach':'approach','study-random-count':'count','study-random-vocabulary':'vocabulary','study-random-tonality':'tonality','study-random-complexity':'complexity','study-random-qualities':'qualities','study-random-modes':'modes','study-random-coverage':'coverage','study-random-auto':'auto','study-random-every':'every'};
   const field=fields[input.id];if(field){const value=input.type==='checkbox'?input.checked:(input as unknown as HTMLSelectElement).multiple?Array.from((input as unknown as HTMLSelectElement).selectedOptions,o=>o.value):input.value;selection.randomizer=normalizeStudyRandomizer({...selection.randomizer,[field]:value});if(field==='approach'&&value==='related')selection.randomizer.count=Math.max(4,selection.randomizer.count);const id=input.id;changed();panel.querySelector<HTMLElement>('#'+id)?.focus({preventScroll:true});}return;
  }
  if(input.id==='study-marked'){if(input.checked)marked.add(plan.id);else marked.delete(plan.id);notice=persist()?'Marked manually · saved in this browser.':'Marked for this session; browser storage is unavailable.';panel.querySelector('#study-path-status')!.textContent=notice;return;}
  if(input.dataset.studyPosition!==undefined){const n=Number(input.dataset.studyPosition);selection.manualPositions[n]=input.value;selection.card=n;}
  else if(input.id==='study-position'){selection.position=input.value;selection.manualPositions=plan.chords.map(()=>input.value);}
  else if(input.id==='study-mode'||input.id==='study-chord'){
   const h=plan.harmonies[selection.card],current=plan.singleQuality?selection:{mode:h.mode,chord:h.chordId};
   const pair=studyPair(input.id==='study-mode'?input.value:current.mode,input.id==='study-chord'?input.value:current.chord,input.id==='study-mode'?'mode':'chord');
   if(plan.singleQuality)selection={...selection,...pair};else{selection.editContext=plan.editContext;(selection.harmonyEdits as Record<number,any>)[selection.card]=pair;}
  }else{
   const fields:Record<string,string>={'study-root':'root','study-material':'material','study-bars':'bars','study-order':'order','study-route':'route','study-region':'region','study-turnaround':'turnaround','study-key-cycle':'keyCycle','study-passes':'passes','study-card':'card','study-form':'form'};
   const field=fields[input.id];if(field){
    if(['order','turnaround','keyCycle','form'].includes(field)){selection.randomChart=null;selection.harmonyEdits={};selection.manualPositions=[];selection.card=0;}
    selection=normalizeStudyPath({...selection,[field]:input.value});
   }
   if(input.id==='study-coverage')selection={...selection,coverage:input.value==='all',manualPositions:[],harmonyEdits:{},card:0};
   if(input.id==='study-form'){refreshSources();const source=sources.find(f=>f.id===selection.form);if(source)selection.root=source.key;}
  }
  const id=input.id;changed();if(id)panel.querySelector<HTMLElement>('#'+id)?.focus({preventScroll:true});
 });
 panel.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
  if(button.dataset.studyTier){const tier=Number(button.dataset.studyTier);if(tier===4)refreshSources();selection=normalizeStudyPath({...selection,tier,randomChart:null,card:0,harmonyEdits:{},manualPositions:[]});changed();panel.querySelector<HTMLButtonElement>(`[data-study-tier="${tier}"]`)?.focus({preventScroll:true});}
  if(button.dataset.studyWorkflow){selection.workflow=button.dataset.studyWorkflow;changed();}
  if(button.dataset.studyCard!==undefined){selection.card=Number(button.dataset.studyCard);changed();}
  if(button.id==='study-current-chart'){refreshSources();const source=sources.find(f=>f.id==='current');if(source){selection={...selection,form:'current',root:source.key,randomChart:null,harmonyEdits:{},manualPositions:[],card:0};changed();}}
  if(button.id==='study-random-all'){selection.randomizer.roots=Array.from({length:12},(_,i)=>i);changed();}
  if(button.id==='study-randomize'){
   try{const next=randomizeStudy(selection,plan,newSeed());randomHistory.push(structuredClone(selection));if(randomHistory.length>20)randomHistory.shift();selection=normalizeStudyPath(next);notice='Random study preview · load when ready.';persist();render();}catch(error){notice=(error as Error).message;render();}
  }
  if(button.id==='study-random-undo'&&randomHistory.length){selection=randomHistory.pop();notice='Previous study preview restored.';persist();render();}
  if(button.id==='study-random-reset'){randomHistory.push(structuredClone(selection));selection={...selection,randomChart:null,harmonyEdits:{},editContext:''};changed();}
  if(button.id==='study-load')void load();
 });
 bar.addEventListener('click',event=>{
  const target=(event.target as Element).closest<HTMLElement>('button');if(!target)return;
  if(target.hasAttribute('data-study-auto-off')){active.selection.randomizer.auto=false;selection.randomizer.auto=false;persist();render();context.randomizerChanged?.();return;}
  if(target.hasAttribute('data-study-dismiss')){active=null;context.randomizerChanged?.();barSignature='';bar.hidden=true;return;}
  if(target.hasAttribute('data-study-reload')){void load(active.selection,active.sources);return;}
  const name=target.dataset.studyNav;if(name)context.navigate(name,{harmony:'harmony-title',guitar:'guitar-title',exercises:'caged-exercise',study:'study-path-title'}[name]||'study-path-title');
 });
 document.addEventListener('input',()=>queueMicrotask(sync));document.addEventListener('change',()=>queueMicrotask(sync));
 function newSeed(){const values=new Uint32Array(1);crypto.getRandomValues(values);return values[0];}
 const repeatEnabled=()=>!!active&&active.selection.randomizer.auto&&context.fingerprint()===activeFingerprint;
 async function nextRepetition(){
  if(!repeatEnabled())return false;
  try{const next=randomizeStudy(active.selection,active,newSeed());randomHistory.push(structuredClone(selection));if(randomHistory.length>20)randomHistory.shift();selection=normalizeStudyPath(next);return !!await load(selection,active.sources);}
  catch(error){notice=(error as Error).message;active.selection.randomizer.auto=false;selection.randomizer.auto=false;persist();render();return false;}
 }
 render();return {sync,repeatEnabled,repeatDue:()=>repeatEnabled()&&++repeatCounter%active.selection.randomizer.every===0,
  repeatBeats:()=>repeatEnabled()?active.chart.progression.steps.reduce((n:number,s:any)=>n+(s.beats??s.bars*active.chart.beats),0)*active.selection.randomizer.every:0,nextRepetition};
}
