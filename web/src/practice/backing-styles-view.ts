import {BACKING_STYLES,backingStyleId} from './backing-styles.js';
export function installBackingStyles(changed:()=>void){
 const page=document.querySelector<HTMLElement>('.sound-settings')!;
 const movement=page.querySelector<HTMLElement>('.harmony-movement');
 const section=document.createElement('section');section.className='workspace-group backing-style-settings';section.id='backing-styles';
 section.innerHTML='<h3>Backing style</h3><label>Style<select id="backing-style" aria-describedby="backing-style-description">'+Object.entries(BACKING_STYLES).map(([id,style])=>`<option value="${id}">${style.name}</option>`).join('')+'</select></label><p id="backing-style-description" class="practice-help"></p><label>Melodic movement<select id="sequence-activity" aria-describedby="sequence-activity-help"><option value="supporting">Supporting</option><option value="countermelody" selected>Countermelody</option><option value="featured">Featured</option></select></label><p id="sequence-activity-help" class="practice-help">Developed phrases with room for your playing. Unmute Melodic movement in the mixer to hear them.</p><dl class="backing-style-parts"></dl><p class="practice-help">Style changes keep your chords, tempo and mixer levels. New styles select their usual beats per bar; you can change this in the metronome.</p><p class="practice-help"><a href="/audio-credits.html" target="_blank" rel="noopener">Audio sources &amp; licences</a></p>';
 page.append(section);if(movement){page.append(movement);movement.classList.add('workspace-group');}
 page.querySelector(':scope>p')!.textContent='Choose a backing style, then unmute the instruments you want in the mixer.';
 const link=document.getElementById('open-sound-settings')!;link.textContent='Backing styles →';
 const menu=section.querySelector<HTMLSelectElement>('#backing-style')!,activity=section.querySelector<HTMLSelectElement>('#sequence-activity')!;
 try{const saved=localStorage.getItem('mehtronome-sequence-activity');if(['supporting','countermelody','featured'].includes(saved||''))activity.value=saved!;}catch{}
 const reflectActivity=()=>{section.querySelector('#sequence-activity-help')!.textContent=({supporting:'Short phrases with longer rests.',countermelody:'Developed phrases with room for your playing.',featured:'Longer, more active lines with shorter rests.'} as Record<string,string>)[activity.value]+' Unmute Melodic movement in the mixer to hear them.';try{localStorage.setItem('mehtronome-sequence-activity',activity.value);}catch{}};
 activity.addEventListener('input',()=>{reflectActivity();changed();});
 let saved='popRock';try{saved=backingStyleId(localStorage.getItem('mehtronome-backing-style'));}catch{}
 menu.value=saved;
 const savedMeter=(BACKING_STYLES[saved as keyof typeof BACKING_STYLES] as any).suggestedBeats;if(savedMeter)document.querySelector<HTMLSelectElement>('#beats')!.value=String(savedMeter);
 let reflected='',lastMeterStyle=saved;
 const sync=()=>{
  reflectActivity();const id=backingStyleId(menu.value);menu.value=id;const style=BACKING_STYLES[id as keyof typeof BACKING_STYLES];
  if(reflected!==id){
   section.querySelector('#backing-style-description')!.textContent=style.description;
   section.querySelector('dl')!.innerHTML=Object.entries(style.parts).map(([name,part])=>`<div><dt>${name}<span class="sound-channel-state" data-sound-state="${({Drums:'drums',Bass:'bass',Comping:'comping','Melodic movement':'sequence'} as Record<string,string>)[name]}"></span></dt><dd>${part}</dd></div>`).join('');
   try{localStorage.setItem('mehtronome-backing-style',id);}catch{}
   reflected=id;
  }
  return id;
 };
 menu.addEventListener('input',()=>{const id=sync(),style=BACKING_STYLES[id as keyof typeof BACKING_STYLES] as any;const beats=document.querySelector<HTMLSelectElement>('#beats')!;if(style.suggestedBeats)beats.value=String(style.suggestedBeats);else if(Number(beats.value)===3&&['jazzWaltz','afroCuban68'].includes(lastMeterStyle))beats.value='4';lastMeterStyle=id;changed();});sync();return {sync};
}
