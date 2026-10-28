import {REPERTOIRE_KEY,REPERTOIRE_STUDIES,normalizeRepertoire} from './repertoire.js';
const esc=(s:any)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** One source menu and explicit save actions for the chart already on screen. */
export function installRepertoire({capture,load,makeTemplate,draft,templates,reflect}:any){
 const builder=document.getElementById('custom-progression-builder')!;
 const chooserRow=document.createElement('div');chooserRow.className='progression-chooser';chooserRow.innerHTML='<label>Choose a progression<select id="progression-choice"></select></label><p id="repertoire-brief" class="practice-help" hidden></p>';
 builder.before(chooserRow);
 const actions=document.createElement('div');actions.className='chart-save-actions';actions.innerHTML='<button type="button" id="repertoire-save" class="practice-button">Save chart</button><button type="button" id="repertoire-update" class="practice-button" disabled>Update saved chart</button>';
 const title=document.getElementById('custom-name')!.closest('label')!;title.after(actions);
 const manage=document.createElement('details');manage.className='chart-management';manage.innerHTML='<summary>Manage charts</summary><div class="chart-management-actions"><button type="button" id="repertoire-delete" class="practice-button" disabled>Delete saved chart</button><button type="button" id="repertoire-export" class="practice-button">Export charts</button><button type="button" id="repertoire-import" class="practice-button">Import charts</button><input id="repertoire-file" type="file" accept=".json,application/json" hidden></div><p class="practice-help">Saved in this browser. Export a backup to move charts to another device.</p>';
 builder.after(manage);const status=document.createElement('p');status.id='repertoire-status';status.className='practice-help';status.setAttribute('role','status');manage.after(status);
 const byId=(id:string)=>document.getElementById(id)!,choice=byId('progression-choice') as HTMLSelectElement,name=byId('custom-name') as HTMLInputElement,brief=byId('repertoire-brief');
 let items:any[]=[],selectedSaved='',selectedSource='single',loading=false,workingDraft=draft();
 const report=(e:any)=>status.textContent=e.message||String(e);
 const render=()=>{
  choice.innerHTML=templates.map((group:any)=>`<optgroup label="${esc(group.name)}">${group.options.map((o:any)=>`<option value="${esc(o.id)}">${esc(o.name)}</option>`).join('')}</optgroup>`).join('')+`<optgroup label="Original studies">${REPERTOIRE_STUDIES.map(s=>`<option value="study:${s.id}">${esc(s.name.replace(/^Original study · /,''))}</option>`).join('')}</optgroup><optgroup label="My saved charts">${items.length?items.map(i=>`<option value="saved:${esc(i.id)}">${esc(i.name)}</option>`).join(''):'<option disabled>No saved charts yet</option>'}</optgroup><optgroup label="Working copy"><option value="custom">Current working chart</option></optgroup>`;
  choice.value=selectedSource;
  for(const id of ['repertoire-update','repertoire-delete'])(byId(id) as HTMLButtonElement).disabled=!selectedSaved||loading;
  choice.disabled=loading;(byId('repertoire-save') as HTMLButtonElement).disabled=loading;reflect();
 };
 try{const raw=localStorage.getItem(REPERTOIRE_KEY);if(raw)items=normalizeRepertoire(JSON.parse(raw));}catch(e){report(e);}
 const persist=(next:any[])=>{const validated=normalizeRepertoire({version:1,items:next});localStorage.setItem(REPERTOIRE_KEY,JSON.stringify({version:1,items:validated}));items=validated;render();};
 const choose=async(source:string,initial=false)=>{
  if(loading)return;
  const previous=selectedSource,previousSaved=selectedSaved,focused=document.activeElement?.id;loading=true;render();
  try{
   let chart:any;selectedSaved='';brief.hidden=true;
   if(source.startsWith('saved:')){const item=items.find(i=>i.id===source.slice(6));if(!item)throw new Error('That saved chart is no longer available.');chart=structuredClone(item);chart.progression.name=chart.name;selectedSaved=item.id;}
   else if(source.startsWith('study:')){const study=REPERTOIRE_STUDIES.find(s=>s.id===source.slice(6));if(!study)throw new Error('That study is unavailable.');chart=structuredClone(study);brief.textContent=(study as any).brief||'Edit this working copy or loop its rehearsal sections. The original study stays available in this menu.';brief.hidden=false;}
   else if(source==='custom')chart=structuredClone(workingDraft);
   else chart=makeTemplate(source);
   // Initial default is transient: preserve the previous draft until an edit.
   await load({...chart,persist:!initial});selectedSource=source;
   status.textContent=initial?'':selectedSaved?'Saved chart loaded. Changes remain a working copy until you choose Update saved chart.':'Editable working copy ready. The original stays available in the menu.';
  }catch(e){selectedSource=previous;selectedSaved=previousSaved;report(e);}finally{loading=false;render();if(focused==='progression-choice'||focused==='mini-progression')document.getElementById(focused)?.focus({preventScroll:true});}
 };
 choice.onchange=()=>void choose(choice.value);
 byId('repertoire-save').onclick=()=>{try{if(items.length>=50)throw new Error('Up to 50 charts can be saved.');if(!name.value.trim())throw new Error('Give this chart a title first.');const item={...capture(),name:name.value.trim(),id:crypto.randomUUID()};persist([...items,item]);selectedSaved=item.id;selectedSource='saved:'+item.id;render();status.textContent='Chart saved.';}catch(e){report(e);}};
 byId('repertoire-update').onclick=()=>{try{if(!selectedSaved)return;if(!name.value.trim())throw new Error('Give this chart a title first.');persist(items.map(i=>i.id===selectedSaved?{...capture(),id:i.id,name:name.value.trim()}:i));status.textContent='Saved chart updated.';}catch(e){report(e);}};
 byId('repertoire-delete').onclick=()=>{try{const id=selectedSaved;if(!id)return;persist(items.filter(i=>i.id!==id));selectedSaved='';selectedSource='custom';render();status.textContent='Saved chart deleted; the working chart stays available.';}catch(e){report(e);}};
 byId('repertoire-export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,items},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='mehtronome-repertoire.json';a.click();URL.revokeObjectURL(url);};
 byId('repertoire-import').onclick=()=>byId('repertoire-file').click();
 (byId('repertoire-file') as HTMLInputElement).onchange=async e=>{const input=e.target as HTMLInputElement,file=input.files?.[0];if(!file)return;try{if(file.size>512*1024)throw new Error('Chart files must be under 512 KB.');const incoming=normalizeRepertoire(JSON.parse(await file.text()));if(items.length+incoming.length>50)throw new Error('Import would exceed 50 charts.');persist([...items,...incoming.map((i:any)=>({...i,id:crypto.randomUUID()}))]);status.textContent=`Imported ${incoming.length} charts as new copies.`;}catch(e){report(e);}finally{input.value='';}};
 document.addEventListener('chart-working-copy-change',()=>{workingDraft=capture();if(!loading&&!selectedSaved){selectedSource='custom';brief.hidden=true;render();}});
 document.addEventListener('chart-context-restored',()=>{selectedSaved='';selectedSource='custom';workingDraft=capture();brief.hidden=true;render();});
 render();void choose('single',true);
}
