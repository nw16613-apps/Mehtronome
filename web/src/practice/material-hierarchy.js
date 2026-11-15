import {isExactVoicing} from '../guitar/fingering-rules.js';
import {isScaleFingering,isPentatonicFingering,PENTATONIC_FINGERING_LABELS} from '../guitar/fingering-types.js';
import {usesPentatonicCollection} from '../guitar/scale-collection.js';
import {contentMaterial,changeContentMaterial} from './exercise-catalogue.js';
export const MATERIAL_KINDS=[['scales','Scales'],['arpeggios','Arpeggios'],['chords','Chords']];
export const materialKind=v=>isExactVoicing(v.fingering)?'chords':contentMaterial(v)==='scale'?'scales':'arpeggios';
export function changeMaterialKind(v,kind){
 if(materialKind(v)===kind)return v;
 if(['caged','three'].includes(v.fingering))v.scaleFingering=v.fingering;
 if(kind==='chords'){v.fingering=isExactVoicing(v.chordFingering)?v.chordFingering:'drop2';v.material=v.fingering==='spread'?'triad':'seventh';v.study='positional';v.arpeggioSource='selectedChord';v.scaleCollection='mode';v.traversal='position';}
 else{v.fingering=['caged','three'].includes(v.fingering)||kind==='arpeggios'&&['oneTwo','twoOne'].includes(v.fingering)?v.fingering:v.scaleFingering||'caged';if(kind==='arpeggios')v.scaleCollection='mode';changeContentMaterial(v,kind==='scales'?'scale':v.material==='triad'?'triad':'seventh');}
 v.linkedFingering=true;v.exactFingering=false;return v;
}
export function noteMaterialOptions(v){return materialKind(v)==='scales'?[['scale','Scale notes']]:[['triad','Triads'],['seventh',materialKind(v)==='chords'?'Seventh chords':'Sevenths']];}
export function changeNoteMaterial(v,value){if(!noteMaterialOptions(v).some(([id])=>id===value))return v;if(materialKind(v)==='chords'){v.inversion=0;v.fingering=value==='triad'?'spread':v.fingering==='spread'?'drop2':v.fingering;v.chordFingering=v.fingering;}return changeContentMaterial(v,value);}
export function fingeringOptions(v,across=false){
 const kind=materialKind(v),pent=usesPentatonicCollection(v);
 if(kind==='chords')return [['spread','Spread triads'],['drop2','Drop 2'],['drop3','Drop 3']];
 const result=[['caged',pent?'CAGED · pentatonic subset':'CAGED'],...(!pent?[['three','3 notes per string']]:[])];
 if(kind==='arpeggios'&&!across)result.push(['oneTwo','1–2–1–2–1–2'],['twoOne','2–1–2–1–2–1']);
 if(kind==='scales'&&pent)result.push(...Object.entries(PENTATONIC_FINGERING_LABELS));
 return result;
}
