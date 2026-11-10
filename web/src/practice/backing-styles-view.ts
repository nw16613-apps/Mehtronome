import {BACKING_STYLES,backingStyleId,resolveDrumKit} from './backing-styles.js';
import {DRUM_KITS} from '../audio/instrumentation.js';
const CHANNELS={drums:'Drums',bass:'Bass',comping:'Comping',sequence:'Melodic movement'};
export function installBackingStyles(changed:()=>void){
 const page=document.querySelector<HTMLElement>('.sound-settings')!,movement=page.querySelector<HTMLElement>('.harmony-movement');
 const section=document.createElement('section');section.className='workspace-group backing-style-settings';section.id='backing-styles';
 section.innerHTML=`<h3>Backing style</h3><label>Style<select id="backing-style" aria-describedby="backing-style-description">${Object.entries(BACKING_STYLES).map(([id,s])=>`<option value="${id}">${s.name}</option>`).join('')}</select></label><p id="backing-style-description" class="practice-help"></p><label>Melodic movement<select id="sequence-activity"><option value="supporting" selected>Supporting</option><option value="countermelody">Countermelody</option><option value="featured">Featured</option></select></label><p id="sequence-activity-help" class="practice-help"></p><dl class="backing-style-parts"></dl><p class="practice-help">The band follows your chart automatically. Style changes keep your tempo and mixer levels; each style uses its usual beats per bar.</p><p class="practice-help"><a href="/audio-credits.html" target="_blank" rel="noopener">Audio sources &amp; licences</a></p>`;
 page.append(section);if(movement){page.append(movement);movement.classList.add('workspace-group');}
 page.querySelector(':scope>p')!.textContent='Choose a backing style, then unmute the instruments you want in the mixer.';document.getElementById('open-sound-settings')!.textContent='Backing styles →';
 const menu=section.querySelector<HTMLSelectElement>('#backing-style')!,activity=section.querySelector<HTMLSelectElement>('#sequence-activity')!;
 try{menu.value=backingStyleId(localStorage.getItem('mehtronome-backing-style'));const migrated=localStorage.getItem('mehtronome-developed-backing-v1')==='1',a=localStorage.getItem('mehtronome-sequence-activity');if(migrated&&['supporting','countermelody','featured'].includes(a||''))activity.value=a!;else activity.value='supporting';localStorage.setItem('mehtronome-developed-backing-v1','1');}catch{}
 const persist=()=>{try{localStorage.setItem('mehtronome-sequence-activity',activity.value);localStorage.setItem('mehtronome-backing-style',menu.value);}catch{}};
 let reflected='',lastMeterStyle=menu.value;
 const sync=()=>{
  const id=backingStyleId(menu.value),style=BACKING_STYLES[id as keyof typeof BACKING_STYLES];menu.value=id;
  const drumKit=resolveDrumKit({...style.settings,backingStyle:id,soundLibrary:'expanded'}),key=id;
  section.querySelector('#sequence-activity-help')!.textContent=({supporting:'Short phrases with longer rests.',countermelody:'Developed phrases with room for your playing.',featured:'Longer lines and more frequent answers.'} as Record<string,string>)[activity.value]+' Unmute Melodic movement in the mixer to hear it.';
  if(reflected!==key){
   section.querySelector('#backing-style-description')!.textContent=style.description.replace('a modeled legato voice','an acoustic flute');
   section.querySelector('dl')!.innerHTML=Object.entries(style.parts).map(([name,part])=>{const channel=Object.entries(CHANNELS).find(([,label])=>label===name)![0],tone=channel==='comping'?style.settings.compingTone:channel==='sequence'?style.settings.sequenceTone:null,label=channel==='drums'?DRUM_KITS[drumKit as keyof typeof DRUM_KITS].name:({fluteLead:'Recorded acoustic flute',legatoGuitar:'Recorded electric-guitar lead',drawbarOrgan:'Sampled tonewheel organ',brightTine:'Recorded Wurlitzer electric piano',clav:'Recorded clav-style synth'} as Record<string,string>)[tone||''];return `<div><dt>${name}<span class="sound-channel-state" data-sound-state="${channel}"></span></dt><dd>${label?label+' · '+String(part).split(' · ').slice(1).join(' · '):part}</dd></div>`;}).join('');reflected=key;
  }
  persist();return id;
 };
 activity.addEventListener('input',()=>{sync();changed();});
 menu.addEventListener('input',()=>{const id=sync(),style=BACKING_STYLES[id as keyof typeof BACKING_STYLES] as any,beats=document.querySelector<HTMLSelectElement>('#beats')!;if(style.suggestedBeats)beats.value=String(style.suggestedBeats);else if(Number(beats.value)===3&&['jazzWaltz','afroCuban68'].includes(lastMeterStyle))beats.value='4';lastMeterStyle=id;changed();});
 const initial=(BACKING_STYLES[menu.value as keyof typeof BACKING_STYLES] as any).suggestedBeats;if(initial)document.querySelector<HTMLSelectElement>('#beats')!.value=String(initial);
 // Chart loads use their own metre; keep subsequent manual style changes in sync.
 const setStyle=(id:string)=>{menu.value=backingStyleId(id);lastMeterStyle=menu.value;sync();};
 sync();return {sync,setStyle};
}
