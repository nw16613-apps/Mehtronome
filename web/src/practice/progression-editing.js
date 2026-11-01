import {normalizeCustomProgression,recommendedMode} from './custom-progression.js';
import {compatibleModeForChord} from './scale-explorer.js';
import {CHORDS} from '../audio/music.js';
export const CAGED_POSITIONS=['I','II','III','IV','V'];
/** Identity and practice choices travel with the card, including through moves. */
export function editableProgression(value){
 const chart=normalizeCustomProgression(value),seen=new Set();
 chart.id ||= crypto.randomUUID();
 for(const step of chart.steps){if(!step.id||seen.has(step.id))step.id=crypto.randomUUID();seen.add(step.id);}
 return chart;
}
export function duplicateProgressionStep(step){return {...step,id:crypto.randomUUID(),section:''};}
export function editProgressionCards(chart,ids,change){
 const selected=new Set(ids);
 for(const step of chart.steps){
  if(!selected.has(step.id))continue;
  if(change.chord&&CHORDS[change.chord]){step.chord=change.chord;step.mode=compatibleModeForChord(step.chord,step.mode,recommendedMode(step.chord));}
  if(change.position==='auto')delete step.position;
  else if(CAGED_POSITIONS.includes(change.position))step.position=change.position;
 }
 return chart;
}
