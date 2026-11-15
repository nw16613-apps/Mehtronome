import {theoryOptions} from './superimposition.js';
import {SCALE_SEQUENCES} from './scale-sequences.js';
import {isPentatonicFingering} from './fingering-types.js';
export const usesPentatonicCollection=v=>v.study==='pentatonic'||isPentatonicFingering(v.fingering)||v.scaleCollection==='pentatonic'&&(v.study==='positionalscale'||!!SCALE_SEQUENCES[v.study]);
export function pentatonicChoice(h,v){const choices=theoryOptions(h).pentatonics;return choices.find(c=>c.id===v.source)||choices[0];}
export function scaleCollectionHarmony(h,v){
 if(!usesPentatonicCollection(v)||h.pentatonicCollection||v.study==='pentatonic'&&!isPentatonicFingering(v.fingering))return h;
 const c=pentatonicChoice(h,v);if(!c)return h;
 return {...h,collectionWarning:v.source&&c.id!==v.source?`The selected pentatonic is unavailable over ${h.name}${h.suffix}; using ${c.name}.`:'',geometryHarmony:h,scalePcs:c.pcs,scaleNames:c.names,pentatonicCollection:c.id,collectionRootPc:c.rootPc??c.pcs[0],collectionDegrees:c.degrees};
}
export function exerciseCollectionBoard(board,h,v){
 const c=scaleCollectionHarmony(h,v);if(c===h&&!h.pentatonicCollection)return board;
 return {...board,notes:board.notes.filter(n=>c.scalePcs.includes(n.pc)).map(n=>({...n,name:c.scaleNames[c.scalePcs.indexOf(n.pc)],scaleIndex:-1,scale:true,collectionStyle:'pentatonic',collectionRoot:n.pc===c.collectionRootPc,chromaticDegree:c.collectionDegrees?.[c.scalePcs.indexOf(n.pc)]||n.chromaticDegree}))};
}

// Retired modal-3NPS pentatonic subsets open in the retained CAGED layout.
export function normalizePentatonicLayout(v){
 if(v.fingering==='three'&&usesPentatonicCollection(v)){v.fingering='caged';v.inversion=0;v.traversalCell='first';}
 return v;
}
