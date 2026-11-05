import {BACKING_STYLES,backingStyleId} from './backing-styles.js';
export function installBackingStyles(changed:()=>void){
 const page=document.querySelector<HTMLElement>('.sound-settings')!;
 const movement=page.querySelector<HTMLElement>('.harmony-movement');
 const section=document.createElement('section');section.className='workspace-group backing-style-settings';section.id='backing-styles';
 section.innerHTML='<h3>Backing style</h3><label>Style<select id="backing-style" aria-describedby="backing-style-description">'+Object.entries(BACKING_STYLES).map(([id,style])=>`<option value="${id}">${style.name}</option>`).join('')+'</select></label><p id="backing-style-description" class="practice-help"></p><dl class="backing-style-parts"></dl><p class="practice-help">Comping supplies chords, riffs or ostinatos; Melodic movement adds occasional answers. Style changes keep your chart, tempo and mixer levels.</p><p class="practice-help"><a href="/audio-credits.html" target="_blank" rel="noopener">Audio sources &amp; licences</a></p>';
 page.append(section);if(movement){page.append(movement);movement.classList.add('workspace-group');}
 page.querySelector(':scope>p')!.textContent='Choose a backing style, then unmute the instruments you want in the mixer.';
 const link=document.getElementById('open-sound-settings')!;link.textContent='Backing styles →';
 const menu=section.querySelector<HTMLSelectElement>('select')!;
 let saved='popRock';try{saved=backingStyleId(localStorage.getItem('mehtronome-backing-style'));}catch{}
 menu.value=saved;
 let reflected='';
 const sync=()=>{
  const id=backingStyleId(menu.value);menu.value=id;const style=BACKING_STYLES[id as keyof typeof BACKING_STYLES];
  if(reflected!==id){
   section.querySelector('#backing-style-description')!.textContent=style.description;
   section.querySelector('dl')!.innerHTML=Object.entries(style.parts).map(([name,part])=>`<div><dt>${name}<span class="sound-channel-state" data-sound-state="${({Drums:'drums',Bass:'bass',Comping:'comping','Melodic movement':'sequence'} as Record<string,string>)[name]}"></span></dt><dd>${part}</dd></div>`).join('');
   try{localStorage.setItem('mehtronome-backing-style',id);}catch{}
   reflected=id;
  }
  return id;
 };
 menu.addEventListener('input',()=>{sync();changed();});sync();return {sync};
}
