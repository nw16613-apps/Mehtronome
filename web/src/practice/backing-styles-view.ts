import {BACKING_STYLES,STYLE_CONTROLS,STYLE_PERCENT_FIELDS,backingStyleId} from './backing-styles.js';
export function installBackingStyles(changed:()=>void){
 const page=document.querySelector<HTMLElement>('.sound-settings')!;
 const legacy=document.createElement('div');legacy.hidden=true;legacy.id='legacy-backing-controls';
 const movement=page.querySelector<HTMLElement>('.harmony-movement');
 for(const selector of ['.sound-jump-nav','.pad-settings','.instrument-settings','.instrument-sequence']){const node=page.querySelector(selector);if(node)legacy.append(node);}
 page.append(legacy);
 const section=document.createElement('section');section.className='workspace-group backing-style-settings';section.id='backing-styles';
 section.innerHTML='<h3>Backing style</h3><label>Style<select id="backing-style" aria-describedby="backing-style-description">'+Object.entries(BACKING_STYLES).map(([id,style])=>`<option value="${id}">${style.name}</option>`).join('')+'</select></label><p id="backing-style-description" class="practice-help"></p><dl class="backing-style-parts"></dl><p class="practice-help">Style sets the backing sounds, grooves and musical phrases. Your tempo and chord chart stay the same. Unmute tracks in the mixer to build the band; levels, mute and solo stay as you set them.</p><p class="practice-help"><a href="/audio-credits.html" target="_blank" rel="noopener">Audio sources &amp; licences</a></p>';
 page.append(section);if(movement){page.append(movement);movement.classList.add('workspace-group');}
 page.querySelector(':scope>p')!.textContent='Choose one backing style for the band. Balance and unmute tracks in the mixer.';
 const link=document.getElementById('open-sound-settings')!;link.textContent='Backing styles →';
 const menu=section.querySelector<HTMLSelectElement>('select')!;
 let saved='popRock';try{saved=backingStyleId(localStorage.getItem('mehtronome-backing-style'));}catch{}
 menu.value=saved;
 let reflected='';
 const sync=()=>{
  const id=backingStyleId(menu.value);menu.value=id;const style=BACKING_STYLES[id as keyof typeof BACKING_STYLES];
  for(const [field,control]of Object.entries(STYLE_CONTROLS)){
   const input=document.getElementById(control) as HTMLInputElement|HTMLSelectElement;
   input.value=String(STYLE_PERCENT_FIELDS.has(field)?Math.round(style.settings[field]*100):style.settings[field]);
  }
  if(reflected!==id){
   section.querySelector('#backing-style-description')!.textContent=style.description;
   section.querySelector('dl')!.innerHTML=Object.entries(style.parts).map(([name,part])=>`<div><dt>${name}</dt><dd>${part}</dd></div>`).join('');
   try{localStorage.setItem('mehtronome-backing-style',id);}catch{}
   reflected=id;
  }
  return id;
 };
 menu.addEventListener('input',()=>{sync();changed();});sync();return {sync};
}
