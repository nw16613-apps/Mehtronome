import {MIX_CHANNELS} from './mixer.js';
const details:Record<string,{role:string;color:string;icon:string}>={
 click:{role:'RHYTHM',color:'#86bfe6',icon:'M4 15 8 3h4l4 12ZM10 6l3 5M7 18h6'},
 harmony:{role:'SUSTAINED CHORDS',color:'#b3a4d1',icon:'M3 14c2-8 4 8 6 0s4 8 6 0 3-4 3-4'},
 drums:{role:'BACKING ENSEMBLE',color:'#d3aa76',icon:'M3 8c0-3 14-3 14 0v7c0 3-14 3-14 0ZM3 8c0 3 14 3 14 0M4 2l11 5M17 2 6 7'},
 bass:{role:'BACKING ENSEMBLE',color:'#85b79d',icon:'M13 2v11a3 3 0 1 1-2-3V4l6-2v9'},
 comping:{role:'BACKING ENSEMBLE',color:'#96abc9',icon:'M2 5h16v12H2ZM6 5v12M10 5v12M14 5v12M5 5v7h2V5M9 5v7h2V5M13 5v7h2V5'},
 sequence:{role:'SEQUENCE',color:'#c699b0',icon:'M2 14h3V8h4V4h4v7h5M3 18h14'},
 space:{role:'FX RETURN',color:'#83bfc0',icon:'M2 10h2m2-4v8m3-11v14m3-11v8m3-6v4m3-2h1'},
};
export function consoleChannel(channel:typeof MIX_CHANNELS[number],index:number){
 const d=details[channel.id];
 return `<div class="mix-channel" data-mix-channel="${channel.id}" style="--channel-color:${d.color}"><div class="console-channel-top"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="${d.icon}"/></svg><span class="console-number">${String(index+1).padStart(2,'0')}</span></div><div class="mix-channel-header"><label class="console-channel-name" for="${channel.control}">${channel.label}</label><div class="console-channel-role">${d.role}</div><div class="console-gain"><output id="gain-${channel.id}" aria-hidden="true"></output><small aria-hidden="true">dB</small></div><input id="mute-${channel.id}" type="checkbox" hidden><div class="console-switches"><button type="button" class="channel-mute" data-mute-channel="${channel.id}" aria-label="Mute ${channel.label}" aria-pressed="false" title="Mute ${channel.label}">M</button>${channel.id!=='space'?`<button type="button" class="channel-solo" data-solo-channel="${channel.id}" aria-label="Solo ${channel.label}" aria-pressed="false" title="Solo ${channel.label}">S</button>`:''}</div></div><div class="console-fader-bay"><div class="console-fader-scale" aria-hidden="true">${[0,-6,-12,-18,-24,-36,-48].map(db=>`<span class="console-tick ${db===0?'unity':''}" style="bottom:${(db+48)/48*100}%">${db===-48?'−∞':db}</span>`).join('')}</div><div class="console-fader-rail" aria-hidden="true"></div><span class="console-fader-cap" aria-hidden="true"></span><input id="${channel.control}" class="console-fader-input" type="range" min="0" max="100" value="${channel.value}" aria-describedby="mix-state-${channel.id}" title="${channel.label} volume"><div class="console-meter" aria-hidden="true"><div class="console-meter-lane"><i class="console-meter-fill"></i><i class="console-meter-peak"></i></div><div class="console-meter-lane"><i class="console-meter-fill"></i><i class="console-meter-peak"></i></div></div></div><div class="console-strip-footer">${['drums','bass','comping','sequence'].includes(channel.id)?`<button class="console-enable" type="button" data-console-enable="${channel.id}" aria-label="Enable ${channel.label}" aria-pressed="false"><i></i><span>Off</span></button>`:'<span class="console-enable console-status"><i></i><span>On</span></span>'}<output class="console-percent" id="${channel.output}" for="${channel.control}">${channel.value}%</output></div><span id="mix-state-${channel.id}" class="mix-channel-state">On</span></div>`;
}
const control=(id:string)=>document.getElementById(id) as HTMLInputElement;
export function syncConsole(){
 for(const channel of MIX_CHANNELS){
  const card=document.querySelector<HTMLElement>(`[data-mix-channel="${channel.id}"]`);if(!card)continue;
  const percent=Number(control(channel.control).value),db=percent>0?20*Math.log10(percent/100):-Infinity;
  card.style.setProperty('--fader-travel',String(Math.max(0,(db+48)/48)));
  card.querySelector('output')!.textContent=percent?db.toFixed(1):'−∞';
  control(channel.control).setAttribute('aria-valuetext',`${percent} percent`);
  const status=card.querySelector<HTMLElement>('.console-status span');if(status)status.textContent=card.classList.contains('is-muted')?'Muted':card.classList.contains('is-excluded')?'Solo muted':card.classList.contains('is-solo')?'Solo':'On';
  const button=card.querySelector<HTMLButtonElement>('button.console-enable');if(button){const enabled=control(channel.id).checked;button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',`${enabled?'Disable':'Enable'} ${channel.label}`);button.querySelector('span')!.textContent=enabled?'On':'Off';}
 }
}
let recentPeaks:number[]=[];let receivedAt=0;
export function receiveConsoleMeters(peaks:number[]){if(!Array.isArray(peaks)||peaks.length!==12)return;recentPeaks=peaks;receivedAt=performance.now();}
export function installConsole(ambient:()=>number[]){
 syncConsole();
 document.getElementById('mix-sections')!.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-console-enable]');if(!button)return;
  const input=control(button.dataset.consoleEnable!);input.checked=!input.checked;input.dispatchEvent(new Event('input',{bubbles:true}));
 });
 for(const channel of MIX_CHANNELS){
  const input=control(channel.control);let pointer:number|null=null;
  const move=(event:PointerEvent)=>{const rect=input.getBoundingClientRect();const travel=Math.max(0,Math.min(1,(rect.bottom-event.clientY-13.5)/(rect.height-27)));input.value=String(travel===0?0:Math.round(100*10**((-48+travel*48)/20)));input.dispatchEvent(new Event('input',{bubbles:true}));};
  input.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();input.focus();pointer=event.pointerId;input.setPointerCapture(pointer);move(event);});
  input.addEventListener('pointermove',event=>{if(pointer===event.pointerId){event.preventDefault();move(event);}});
  input.addEventListener('pointerup',event=>{if(pointer!==event.pointerId)return;pointer=null;if(input.hasPointerCapture(event.pointerId))input.releasePointerCapture(event.pointerId);});
  input.addEventListener('pointercancel',()=>pointer=null);
  input.addEventListener('dblclick',()=>{input.value=String(channel.value);input.dispatchEvent(new Event('input',{bubbles:true}));});
 }
 const lanes=Array.from(document.querySelectorAll<HTMLElement>('.console-meter-lane'));const shown=new Float32Array(14),held=new Float32Array(14);let previous=performance.now();
 function frame(now:number){
  const dt=Math.min(.1,(now-previous)/1000);previous=now;
  const visible=document.getElementById('mix-sections')!.getClientRects().length>0&&!document.hidden;
  if(visible){const tail=ambient();for(let i=0;i<14;i++){
   const raw=i<12?(now-receivedAt<180?recentPeaks[i]||0:0):tail[i-12]||0;
   const target=Number.isFinite(raw)&&raw>0?Math.max(0,Math.min(100,(20*Math.log10(raw)+60)/60*100)):0;
   shown[i]=Math.max(target,shown[i]-dt*85);held[i]=Math.max(target,held[i]-dt*18);
   lanes[i].style.setProperty('--level',`${shown[i]}%`);lanes[i].style.setProperty('--peak',`${held[i]}%`);lanes[i].style.setProperty('--visible',held[i]>0?'1':'0');
  }}requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}
