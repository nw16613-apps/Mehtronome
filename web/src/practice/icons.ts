/* Decorative studio icons. Keep visible labels and accessible names intact. */
const paths:Record<string,string>={
 metronome:'<path d="M4 15 8 3h4l4 12ZM10 6l3 5M7 18h6"/>',
 harmony:'<path d="M2 13c2-8 4 8 6 0s4 8 6 0 3-4 4-4"/>',
 guitar:'<path d="m13 2 5 1-1 5-3-1-3 4c2 5-3 8-7 5s-3-7 1-7l5-3 2-3Z"/><path d="m7 13 9-9M6 14l2 1"/><circle cx="8" cy="12" r="1.8"/>',
 notes:'<path d="M3 6h14M3 10h14M3 14h14M7 15V4m7 9V2L7 4"/><ellipse cx="5.5" cy="15" rx="1.5" ry="1"/><ellipse cx="12.5" cy="13" rx="1.5" ry="1"/>',
 listen:'<path d="M3 11V9a7 7 0 0 1 14 0v2M3 10H2v6h4v-6ZM17 10h1v6h-4v-6Z"/>',
 link:'<path d="m8 12 4-4M7 13l-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0m0 8a3 3 0 0 0 4 0l4-4a3 3 0 0 0-4-4l-1 1"/>',
 target:'<circle cx="10" cy="10" r="6"/><circle cx="10" cy="10" r="2"/><path d="M10 1v3m0 12v3M1 10h3m12 0h3"/>',
 route:'<path d="M3 17h4v-4h4V9h4V5h3M3 4h5M3 7h3"/>',
 settings:'<path d="M5 2v5m0 4v7M10 2v10m0 4v2M15 2v3m0 4v9M3 7h4v4H3ZM8 12h4v4H8ZM13 5h4v4h-4Z"/>',
 chord:'<path d="M4 6h12M4 10h12M4 14h12M6 4v12m4-12v12m4-12v12"/><circle cx="6" cy="10" r="1.7"/><circle cx="14" cy="6" r="1.7"/>',
 trash:'<path d="M3 5h14M7 5V2h6v3M5 5l1 13h8l1-13M8 8v7m4-7v7"/>',
 refresh:'<path d="M16 7a6 6 0 1 0 0 6M16 3v4h-4"/>',
 save:'<path d="M3 3h11l3 3v11H3ZM6 3v5h8V3M6 17v-6h8v6M11 4v2"/>',
 import:'<path d="M10 2v10m-4-4 4 4 4-4M3 12v5h14v-5"/>',
 export:'<path d="M10 13V3m-4 4 4-4 4 4M3 12v5h14v-5"/>',
 folder:'<path d="M2 6V4h6l2 2h8v11H2Zm0 3h16"/>',
 focus:'<path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/>',
 timer:'<circle cx="10" cy="11" r="6"/><path d="M8 2h4m-2 0v3m5 1 2-2m-7 4v4l2 1"/>',
 swing:'<path d="M5 14V4l10 2v10M5 7l10 2"/><ellipse cx="3.5" cy="14" rx="1.5" ry="1"/><ellipse cx="13.5" cy="16" rx="1.5" ry="1"/>',
 poly:'<circle cx="7" cy="10" r="5"/><circle cx="13" cy="10" r="5"/><path d="M7 3v2m6 10v2"/>',
 gap:'<path d="M2 10h3m3 0h4m3 0h3M5 7v6m10-6v6"/>',
 ensemble:'<path d="M2 5h16v12H2ZM6 5v12M10 5v12M14 5v12M5 5v7h2V5M9 5v7h2V5M13 5v7h2V5"/>',
 sequence:'<path d="M2 14h3V8h4V4h4v7h5M3 18h14"/>',
 print:'<path d="M5 7V2h10v5M5 14H2V7h16v7h-3M5 11h10v7H5Zm10-2h1"/>',
 star:'<path d="m10 2 2.5 5 5.5.8-4 4 1 5.5-5-2.6L5 17.3l1-5.5-4-4L7.5 7Z"/>',
 left:'<path d="m9 4-6 6 6 6M3 10h14"/>',
 right:'<path d="m11 4 6 6-6 6M17 10H3"/>',
 info:'<circle cx="10" cy="10" r="7"/><path d="M10 9v5m0-8v.5"/>',
 play:'<path d="m6 3 10 7-10 7Z"/>',
 tap:'<circle cx="10" cy="10" r="3"/><path d="M3 6a8 8 0 0 1 14 0M3 14a8 8 0 0 0 14 0"/>',
};
function svg(name:string,badge=false){return `<span class="studio-icon${badge?' studio-icon-badge':''}" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false">${paths[name]||paths.settings}</svg></span>`;}
function add(el:Element|null,name:string,badge=false){if(!el||el.querySelector(':scope>.studio-icon'))return;
 if(el.matches('button'))el.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE){const text=node.textContent||'';node.textContent=(name==='left'||name==='right'?text.replace(/[←→]/g,''):text).replace(/^[☆★▶]\s*/,'');}});
 el.insertAdjacentHTML('afterbegin',svg(name,badge));el.classList.add(badge?'studio-icon-heading':'studio-icon-label');}
export function applyStudioIcons(root:ParentNode=document){
 const navIcons=['metronome','harmony','guitar','notes','route','settings'];root.querySelectorAll('.workspace-tab').forEach((tab,i)=>{add(tab,navIcons[i]);});
 const headings={'#pulse-title':'metronome','#mix-title':'settings','#harmony-title':'harmony','#notes-title':'chord','#guitar-title':'guitar','#caged-exercise-title':'notes','#presets-title':'save','#practice-roadmap-title':'route','#sound-settings-title':'settings','#rhythm-title':'ensemble','#sequence-title':'sequence'};
 for(const [selector,name] of Object.entries(headings))add(root.querySelector(selector),name,true);
 root.querySelectorAll('.studio-tools .section-heading h2').forEach(el=>add(el,'timer',true));
 root.querySelectorAll('.metronome-sound-settings h3').forEach(el=>add(el,'metronome',true));root.querySelectorAll('.pad-settings h3').forEach(el=>add(el,'harmony',true));
 const actions={'#focus-view':'focus','#tap-tempo':'tap','#pulse-large-open':'focus','#tempo-save':'save','#open-sound-settings':'settings','#mini-mixer':'settings','#exit-focus':'focus','#position-previous':'left','#position-next':'right','#exercise-favourite':'star','#exercise-export':'export','#exercise-print':'print','#exercise-focus':'focus','#exercise-play-range':'play','#full-fretboard-expand':'focus'};
 for(const [selector,name] of Object.entries(actions))add(root.querySelector(selector),name);
 root.querySelectorAll('.preset-fields button,.preset-transfer button').forEach(el=>{const t=(el.textContent||'').toLowerCase();add(el,t.includes('export')?'export':t.includes('import')?'import':t.includes('load')?'folder':t.includes('delete')?'trash':t.includes('update')?'refresh':'save');});
 root.querySelectorAll('.progression-reference .eyebrow').forEach(el=>add(el,'harmony'));
 root.querySelectorAll('.full-fretboard-toolbar strong,.position-heading h4').forEach(el=>add(el,'chord'));
 root.querySelectorAll('.practice-roadmap fieldset legend').forEach(el=>{const text=(el.textContent||'').toLowerCase();add(el,text.includes('hear')?'listen':text.includes('map')?'chord':text.includes('connect')?'link':text.includes('apply')?'target':'notes');});
 root.querySelectorAll('.pulse-tool>summary').forEach(el=>{const t=(el.textContent||'').toLowerCase();add(el,t.includes('swing')?'swing':t.includes('timer')?'timer':'poly');});
 root.querySelectorAll('.learn-more>summary').forEach(el=>add(el,'info'));
};
