import {normalizeCustomProgression,recommendedMode} from './custom-progression.js';
export const REPERTOIRE_KEY='mehtronome-repertoire-v1';
const step=(root,chord,section='')=>({root,chord,mode:recommendedMode(chord),bars:1,...(section?{section}:{})});
export const REPERTOIRE_STUDIES=[
 {id:'blues',name:'Original study · 12-bar dominant blues',progression:normalizeCustomProgression({name:'12-bar dominant blues study',steps:[step(0,'dom7','A · Home'),step(5,'dom7'),step(0,'dom7'),step(0,'dom7'),step(5,'dom7','B · Subdominant'),step(5,'dom7'),step(0,'dom7'),step(0,'dom7'),step(7,'dom7','C · Turnaround'),step(5,'dom7'),step(0,'dom7'),step(7,'dom7')]})},
 {id:'ab',name:'Original study · A/B turnaround form',progression:normalizeCustomProgression({name:'A/B turnaround study',steps:[step(0,'maj7','A'),step(9,'min7'),step(2,'min7'),step(7,'dom7'),step(0,'maj7'),step(9,'min7'),step(2,'min7'),step(7,'dom7'),step(4,'min7','B'),step(9,'dom7'),step(2,'min7'),step(7,'dom7'),step(0,'maj7'),step(9,'min7'),step(2,'min7'),step(7,'dom7')]})},
];
/** Marks travel with their chord on reorder; duration is always derived. */
export function rehearsalSections(progression,beats){
 let offset=0;const sections=[];
 for(const [index,s]of progression.steps.entries()){
  if(index===0||s.section)sections.push({name:s.section||'Opening',step:index,start:offset,end:offset});
  offset+=s.beats??s.bars*beats;sections.at(-1).end=offset;
 }
 return sections;
}
export function normalizeRepertoire(value){
 if(value?.version!==1||!Array.isArray(value.items)||value.items.length>50)throw new Error('Choose a Mehtronome repertoire file with up to 50 charts.');
 const ids=new Set();
 return value.items.map(item=>{
  if(!item||typeof item.id!=='string'||!item.id||item.id.length>80||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||!Number.isInteger(item.key)||item.key<0||item.key>11||!Number.isInteger(item.beats)||item.beats<1||item.beats>12||!Array.isArray(item.progression?.steps)||!item.progression.steps.length||item.progression.steps.length>32)throw new Error('A saved chart is invalid. No charts were imported.');
  ids.add(item.id);const progression=normalizeCustomProgression(item.progression);return {id:item.id,name:item.name.trim().slice(0,60),key:item.key,beats:item.beats,progression};
 });
}
