import {escapeChordText as esc} from './chord-symbol.js';
/** Shared visible progression navigation; values refer to the existing inspection slots. */
export function positionRouteCards(groups,steps,activeStep,disabled=false,guitar=false){
 return groups.map((group,slot)=>{const step=steps[slot],current=step===activeStep;
 return `<button type="button" ${guitar?`data-position-step="${step}"`:""} data-route-step="${step}" data-inspect-slot="${slot}" data-position="${esc(group.position.numeral)}" data-shape="${esc(group.position.shape)}" class="${current?'current':''}" aria-pressed="${current}" ${current?'aria-current="true"':''} aria-label="Inspect ${esc(group.chord)}, Position ${esc(group.position.numeral)}, frets ${group.board.start}–${group.board.end}" ${disabled?'disabled':''}><strong>${esc(group.chord)}</strong><span>Position ${esc(group.position.numeral)} · ${esc(group.position.shape)} shape</span><small>Frets ${group.board.start}–${group.board.end}</small></button>`;
 }).join('');
}
