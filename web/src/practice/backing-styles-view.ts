import {AUDITION_STYLES} from '../audio/audition-arrangements.js';
import {BACKING_STYLES,backingStyleId} from './backing-styles.js';
export function installBackingStyles(changed:()=>void,restart:()=>Promise<void>,isPlaying:()=>boolean){
 const page=document.querySelector<HTMLElement>('.sound-settings')!;
 const movement=page.querySelector<HTMLElement>('.harmony-movement');
 const section=document.createElement('section');section.className='workspace-group backing-style-settings';section.id='backing-styles';
 section.innerHTML='<h3>Backing style</h3><label>Style<select id="backing-style" aria-describedby="backing-style-description">'+Object.entries(BACKING_STYLES).map(([id,style])=>`<option value="${id}">${style.name}</option>`).join('')+'</select></label><p id="backing-style-description" class="practice-help"></p><label>Melodic movement<select id="sequence-activity" aria-describedby="sequence-activity-help"><option value="supporting">Supporting</option><option value="countermelody" selected>Countermelody</option><option value="featured">Featured</option></select></label><p id="sequence-activity-help" class="practice-help">Developed phrases with room for your playing. Unmute Melodic movement in the mixer to hear them.</p><section class="backing-audition" hidden aria-labelledby="backing-audition-title"><h4 id="backing-audition-title">Compare arrangements</h4><div class="backing-audition-controls"><label>Arrangement<select id="backing-arrangement"><option value="current">A · Current backing</option><option value="trial">B · New phrase arrangement</option></select></label><button type="button" class="practice-button" id="backing-audition-restart">Restart from beginning</button></div><p id="backing-audition-status" class="practice-help" role="status" aria-live="polite"></p><p id="backing-audition-description" class="practice-help"></p><p class="practice-help">Same sounds, chords, tempo, mixer and FX. Switches on the next bar during playback. Solo instruments in the mixer to compare their parts. Trial phrases composed for this app; no external AI service.</p></section><dl class="backing-style-parts"></dl><p class="practice-help">Style changes keep your chords, tempo and mixer levels. New styles select their usual beats per bar; you can change this in the metronome.</p><p class="practice-help"><a href="/audio-credits.html" target="_blank" rel="noopener">Audio sources &amp; licences</a></p>';
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
 const audition=section.querySelector<HTMLElement>('.backing-audition')!,arrangement=section.querySelector<HTMLSelectElement>('#backing-arrangement')!,status=section.querySelector<HTMLElement>('#backing-audition-status')!,restartButton=section.querySelector<HTMLButtonElement>('#backing-audition-restart')!;
 let active='current';
 const reflectAudition=()=>{status.textContent=isPlaying()&&active!==arrangement.value?'Switching to '+(arrangement.value==='trial'?'B':'A')+' on the next bar…':(arrangement.value==='trial'?'B · New phrase arrangement':'A · Current backing')+(isPlaying()?' playing.':' ready.');};
 arrangement.addEventListener('input',()=>{changed();reflectAudition();});
 restartButton.addEventListener('click',async()=>{restartButton.disabled=true;try{await restart();}finally{restartButton.disabled=false;reflectAudition();}});
 let reflected='',lastMeterStyle=saved;
 const sync=()=>{
  reflectActivity();const id=backingStyleId(menu.value);menu.value=id;const style=BACKING_STYLES[id as keyof typeof BACKING_STYLES];
  const trial=AUDITION_STYLES[id as keyof typeof AUDITION_STYLES];audition.hidden=!trial;
  const fourBeats=document.querySelector<HTMLSelectElement>('#beats')!.value==='4';arrangement.options[1].disabled=!fourBeats;if(!fourBeats)arrangement.value='current';
  if(reflected!==id){
   arrangement.value='current';active='current';
   section.querySelector('#backing-audition-description')!.textContent=trial?.description||'';
   section.querySelector('#backing-style-description')!.textContent=style.description;
   section.querySelector('dl')!.innerHTML=Object.entries(style.parts).map(([name,part])=>`<div><dt>${name}<span class="sound-channel-state" data-sound-state="${({Drums:'drums',Bass:'bass',Comping:'comping','Melodic movement':'sequence'} as Record<string,string>)[name]}"></span></dt><dd>${part}</dd></div>`).join('');
   try{localStorage.setItem('mehtronome-backing-style',id);}catch{}
   reflected=id;
  }
  section.querySelector('#backing-audition-description')!.textContent=trial?(fourBeats?trial.description:'These trial arrangements use four beats per bar. Select 4 beats in the metronome to audition B.'):'';
  reflectAudition();return id;
 };
 menu.addEventListener('input',()=>{const id=sync(),style=BACKING_STYLES[id as keyof typeof BACKING_STYLES] as any;const beats=document.querySelector<HTMLSelectElement>('#beats')!;if(style.suggestedBeats)beats.value=String(style.suggestedBeats);else if(Number(beats.value)===3&&['jazzWaltz','afroCuban68'].includes(lastMeterStyle))beats.value='4';lastMeterStyle=id;changed();});sync();return {sync,playback:(value:string)=>{active=value;reflectAudition();},reflectPlayback:reflectAudition};
}
