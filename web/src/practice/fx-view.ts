import {FX_CHANNELS,FX_BUSES,FX_PRESET_CONTROLS,REVERB_TYPES,DELAY_DIVISIONS,normalizeFxSettings} from '../audio/fx-buses.js';
const KEY='mehtronome-fx-v1';
const busLabels:Record<string,string>={reverb:'Reverb A',reverbB:'Reverb B',delay:'Delay'};
export function installFxControls(changed:(value:any)=>void){
 for(const id of FX_CHANNELS){
  const card=document.querySelector<HTMLElement>(`[data-mix-channel="${id}"]`)!;const title=card.querySelector('.console-channel-name')!.textContent;
  const sends=document.createElement('div');sends.className='channel-fx-sends';sends.setAttribute('aria-label',title+' FX sends');
  sends.innerHTML=FX_BUSES.map(bus=>`<label class="fx-send-label"><span class="fx-send-name">${busLabels[bus]}</span><span class="fx-knob" style="--knob-angle:-135deg"><span class="fx-knob-dial" aria-hidden="true"><i></i></span><input class="fx-send-input" type="range" id="send-${bus}-${id}" min="0" max="100" step="1" value="0" aria-label="${title} ${busLabels[bus]} send" title="Drag up or down; arrow keys adjust; double-click resets to zero"></span><output for="send-${bus}-${id}">0%</output></label>`).join('');
  card.querySelector('.console-fader-bay')!.before(sends);
 }
 const options=(values:Record<string,string>)=>Object.entries(values).map(([value,name])=>`<option value="${value}">${name}</option>`).join('');
 const panel=document.createElement('section');panel.className='mixer-fx-buses';
 panel.innerHTML=`<h3>FX buses</h3><div><label>Reverb A<select id="fx-reverb-type">${options(REVERB_TYPES)}</select></label><label>Reverb B<select id="fx-reverb-b-type">${options(REVERB_TYPES)}</select></label><label>Modulated delay<select id="fx-delay-division">${options(DELAY_DIVISIONS)}</select></label></div><p class="practice-help">Three independent, fully wet buses. Returns stay at 100%; use the send knobs above each fader to set the effect amount. Sends follow track volume and mute. The Harmony sends also add effects to the exercise guitar.</p>`;
 document.querySelector('.console-level-scroll')!.before(panel);
 const field=(id:string)=>document.getElementById(id) as HTMLInputElement|HTMLSelectElement;
 function read(){return normalizeFxSettings({reverbType:field('fx-reverb-type').value,reverbBType:field('fx-reverb-b-type').value,delayDivision:field('fx-delay-division').value,sends:Object.fromEntries(FX_CHANNELS.map(id=>[id,Object.fromEntries(FX_BUSES.map(bus=>[bus,field('send-'+bus+'-'+id).value]))]))});}
 function sync(){const value=read();for(const id of FX_PRESET_CONTROLS){const control=field(id);if(control instanceof HTMLInputElement){control.setAttribute('aria-valuetext',control.value+' percent');control.closest<HTMLElement>('.fx-knob')?.style.setProperty('--knob-angle',`${-135+Number(control.value)*2.7}deg`);const out=document.querySelector(`output[for="${id}"]`);if(out)out.textContent=control.value+'%';}}try{localStorage.setItem(KEY,JSON.stringify(value));}catch{}changed(value);return value;}
 const defaults=normalizeFxSettings();let saved=defaults;try{const raw=localStorage.getItem(KEY);if(raw)saved=normalizeFxSettings(JSON.parse(raw));}catch{}
 field('fx-reverb-type').value=saved.reverbType;field('fx-reverb-b-type').value=saved.reverbBType;field('fx-delay-division').value=saved.delayDivision;
 for(const id of FX_CHANNELS)for(const bus of FX_BUSES)field('send-'+bus+'-'+id).value=String(saved.sends[id][bus]);
 for(const id of FX_PRESET_CONTROLS)field(id).addEventListener('input',sync);
 for(const input of Array.from(panel.parentElement!.querySelectorAll<HTMLInputElement>('.fx-send-input'))){
  let drag:{pointer:number;y:number;x:number;value:number}|null=null;
  input.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();input.focus({preventScroll:true});drag={pointer:event.pointerId,y:event.clientY,x:event.clientX,value:Number(input.value)};input.setPointerCapture(event.pointerId);});
  input.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;const delta=drag.y-event.clientY+(event.clientX-drag.x)*.35;drag.value=Math.max(0,Math.min(100,drag.value+delta*(event.shiftKey ? .1 : .7)));drag.y=event.clientY;drag.x=event.clientX;input.value=String(Math.round(drag.value));input.dispatchEvent(new Event('input',{bubbles:true}));});
  const end=(event:PointerEvent)=>{if(drag?.pointer!==event.pointerId)return;drag=null;if(input.hasPointerCapture(event.pointerId))input.releasePointerCapture(event.pointerId);};
  input.addEventListener('pointerup',end);input.addEventListener('pointercancel',end);input.addEventListener('lostpointercapture',()=>{drag=null;});
  input.addEventListener('dblclick',()=>{input.value='0';input.dispatchEvent(new Event('input',{bubbles:true}));});
 }
 sync();return {sync,read};
}
