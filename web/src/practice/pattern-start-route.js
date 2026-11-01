import {arpeggioHarmony} from '../guitar/arpeggio-harmony.js';
// Bind choices to original chart slots, independently of position and rhythm.
export function patternStartRoute(harmonies,stored='',edit=/** @type {any} */ (null)){
 const text=JSON.stringify(harmonies.map(h=>[h.name,h.chordId,h.mode,h.scalePcs]));
 let hash=2166136261;for(const char of text)hash=Math.imul(hash^char.charCodeAt(0),16777619);
 const prefix=`v1:${(hash>>>0).toString(36)}:`,digits=String(stored).startsWith(prefix)?String(stored).slice(prefix.length):'';
 const choices=digits.length===harmonies.length&&/^[0-8]+$/.test(digits)?[...digits].map(n=>Number(n)===0?'inherit':Number(n)===1?'default':`${Number(n)-1}:0`):harmonies.map(()=>'inherit');
 if(edit&&Number.isInteger(edit.step)&&edit.step>=0&&edit.step<choices.length&&/^(inherit|default|[1-7]:0)$/.test(edit.value))choices[edit.step]=edit.value;
 return {choices,value:prefix+choices.map(v=>v==='inherit'?0:v==='default'?1:Number(v[0])+1).join('')};
}
export function cardStartChoices(harmony){
 return arpeggioHarmony(harmony).intervals.map(interval=>({value:`${interval.match(/\d+/)[0]}:0`,label:interval}));
}
export function cardStartLabel(harmony,value){return value==='default'?'Shape default':cardStartChoices(harmony).find(c=>c.value===value)?.label||`Degree ${value[0]}`;}
