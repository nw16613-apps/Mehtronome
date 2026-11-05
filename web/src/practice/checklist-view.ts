import {PRACTICE_GROUPS} from './curriculum.js';
const esc=(value:any)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function checklistCards({completed,chord,mode,colour,position,ideas,idea,open,locked}:any){
 const done=new Set(completed),descriptions:Record<string,string>={
  hear:`Listen to ${chord}. Sing the root${colour?' and '+colour:''}.`,
  positions:`Play ${mode} in each shape, resolving to a tone of ${chord}.`,
  connect:'Repeat one short phrase in neighbouring shapes. Use the position controls to move between them.',
  apply:'Develop a short phrase over the current chart.',
 };
 return PRACTICE_GROUPS.map((group:any,index:number)=>{
  const checked=group.items.filter((item:any)=>done.has(item.id)).length;
  const control=group.id==='positions'?`<label class="checklist-choice">Position<select id="checklist-position" ${locked?'disabled':''}>${['I','II','III','IV','V'].map(n=>`<option ${n===position?'selected':''}>${n}</option>`).join('')}</select></label>`:group.id==='apply'?`<label class="checklist-choice">Idea<select id="checklist-idea" ${locked?'disabled':''}>${ideas.map((item:any)=>`<option value="${esc(item.id)}" ${item.id===idea?'selected':''}>${esc(item.label)}</option>`).join('')}</select></label>`:'';
  const action={hear:'Open harmony',positions:'Open fretboard',connect:'Choose positions',apply:'Open practice'}[group.id as 'hear'|'positions'|'connect'|'apply'];
  return `<section class="practice-step" aria-labelledby="checklist-${group.id}-title"><div class="practice-step-heading"><span class="checklist-number" aria-hidden="true">${index+1}</span><h3 id="checklist-${group.id}-title">${esc(group.title)}</h3></div><p>${esc(descriptions[group.id])}</p><div class="checklist-actions">${control}<button type="button" class="practice-button" data-checklist-action="${group.id}" ${locked?'disabled':''}>${action}</button></div><details class="checklist-completion" data-checklist-group="${group.id}" ${open.has(group.id)?'open':''}><summary>Mark progress <span>${checked}/${group.items.length}</span></summary><div class="checklist-options ${group.id==='positions'||group.id==='connect'?'checklist-chips':''}" role="group" aria-label="${esc(group.title)} completion">${group.items.map((item:any)=>`<label class="practice-roadmap-task${done.has(item.id)?' complete':''}"><input type="checkbox" data-practice-task="${item.id}" ${done.has(item.id)?'checked':''} ${locked?'disabled':''}><span>${esc(item.label)}</span></label>`).join('')}</div></details></section>`;
 }).join('');
}
