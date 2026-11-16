import {practiceRecipe} from './recipe-controls.js';
import {readPresets} from './presets.js';
import {normalizeExerciseOptions,migrateTraversalSnapshot} from './exercise-options.js';
export const PRACTICE_LIBRARY_KEY='mehtronome-exact-practice-v1';
export function normalizePracticeLibrary(data){
 if(data?.version!==1||!Array.isArray(data.items)||data.items.length>50)throw new Error('Choose a practice library with at most 50 items.');
 const ids=new Set();return data.items.map(item=>{
  if(!item||typeof item.id!=='string'||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||!item.setup||!item.exercise||typeof item.exercise.study!=='string')throw new Error('This practice item is incomplete.');ids.add(item.id);
  const setup=readPresets(JSON.stringify({version:1,items:[{...item.setup,id:item.id,name:item.name}]}))[0];if(!setup)throw new Error('This practice setup is invalid.');
  const extras=['autoTempo','autoEvery','autoIncrement','ceiling','tempo','tempoLinked','display','zoom','chordDiagrams','backing','loop','fretboard','linkedFingering','exactFingering','inspectedArpeggio','degreeReference','patternStartRoute','traversalGeometryVersion','traversalLegacyCore'];
  const raw={...practiceRecipe(item.exercise),...Object.fromEntries(extras.filter(k=>['string','boolean','number'].includes(typeof item.exercise[k])).map(k=>[k,item.exercise[k]]))};
  if(Object.values(raw).some(v=>typeof v==='object'||typeof v==='string'&&(v.length>240||/[<>&"']/.test(v))||typeof v==='number'&&!Number.isFinite(v)))throw new Error('This practice recipe contains invalid values.');
  for(const [field,fallback,min,max] of [['tempo',90,30,240],['ceiling',160,30,240],['autoEvery',4,1,100],['autoIncrement',2,1,20]])if(raw[field]!==undefined)raw[field]=Math.max(min,Math.min(max,Number(raw[field])||fallback));
  if(!['caged','three','oneTwo','twoOne','pentThree','pent31','pent13','spread','drop2','drop3'].includes(raw.fingering))throw new Error('This practice fingering is not supported.');
  const exercise=normalizeExerciseOptions(migrateTraversalSnapshot(raw));
  return {id:item.id,name:item.name.trim().slice(0,60),setup,exercise,position:['I','II','III','IV','V'].includes(item.position)?item.position:'II',parentPosition:String(item.parentPosition||'').slice(0,30),inspectedStep:Math.max(0,Math.min(127,Number(item.inspectedStep)||0)),summary:String(item.summary||'').slice(0,300),updatedAt:typeof item.updatedAt==='string'?item.updatedAt:''};
 });
}
export function readPracticeLibrary(raw){if(!raw)return [];return normalizePracticeLibrary(JSON.parse(raw));}
export function savePracticeItem(items,item){const next=items.some(i=>i.id===item.id)?items.map(i=>i.id===item.id?item:i):[...items,item];return normalizePracticeLibrary({version:1,items:next});}
