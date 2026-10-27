import {readPresets} from './presets.js';
export const JOURNAL_KEY='mehtronome-practice-journal-v1';
export const JOURNAL_FORMAT='mehtronome-practice-journal';
const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
export function cleanEntry(value){
 if(!value||typeof value!=='object'||typeof value.id!=='string'||!value.id||typeof value.name!=='string'||!value.name.trim())throw new Error('Invalid practice journal entry.');
 const preset=readPresets(JSON.stringify({version:1,items:[value.setup?.preset]}))[0];
 if(!preset)throw new Error('This entry has no valid practice setup.');
 const exercise={};
 const source=value.setup.exercise||{};
 const strings=['study','material','motion','rhythm','source','pattern','display','zoom','stage','application','response','shellStrings','shellPhrase','shellRegion'];
 const allowed={shellStrings:['auto','root6','root5'],shellPhrase:['motif','approach'],shellRegion:['low','lowerMiddle','middle','upperMiddle','high'],application:['cell-space','delayed','cell-answer'],response:['demo','respond'],"study": ["shells", "shellphrases", "grip", "positional", "thirds", "fourths", "sixths", "groups3", "groups4", "digital1324", "cells", "harmonized", "alternating", "chordtones", "chordtonesalternating", "inversions", "upperstructure", "enclosures", "enclosuresbelowabove", "enclosureschromatic", "enclosuresdouble", "enclosuresfiveone", "enclosuresfivetwo", "enclosuresfivethree", "enclosuresfivefour", "approach", "doubleapproach", "chromaticneighbors", "passingtones", "approacheverytone", "triadpairs", "pentatonic", "guidetones", "connections"], "material": ["triad", "seventh", "extensions"], "motion": ["ascending", "descending", "up-down", "down-up"], "rhythm": ["eighths", "triplets", "sixteenths"], "display": ["both", "tab", "notation", "names", "degrees"], "zoom": ["fit", "comfortable", "large"], "stage": ["cell", "full", "apply"]};
 for(const [key,options] of Object.entries(allowed))if(source[key]!==undefined&&!options.includes(source[key]))throw new Error('Unsupported exercise option in journal.');
 if(!allowed.study.includes(source.study))throw new Error('Journal entry needs an exercise.');
 const booleans=['loop','backing','tempoLinked','autoTempo','fretboard','recall','setupOpen'];
 const bounds={tempo:[30,240],autoEvery:[1,100],autoIncrement:[1,20],ceiling:[30,240],loopStart:[0,10000],loopEnd:[-1,10000]};
 for(const key of strings)if(typeof source[key]==='string')exercise[key]=source[key].slice(0,120);
 for(const key of booleans)if(typeof source[key]==='boolean')exercise[key]=source[key];
 for(const [key,[min,max]]of Object.entries(bounds))if(Number.isFinite(source[key]))exercise[key]=Math.max(min,Math.min(max,source[key]));
 return {id:text(value.id,80),name:value.name.trim().slice(0,60),date:text(value.date,40),rating:['exploring','developing','comfortable','review'].includes(value.rating)?value.rating:'exploring',comfortableTempo:Number.isFinite(value.comfortableTempo)?Math.max(30,Math.min(240,value.comfortableTempo)):null,notes:text(value.notes,3000),setup:{preset,exercise,position:['I','II','III','IV','V'].includes(value.setup.position)?value.setup.position:'I',step:Number.isInteger(value.setup.step)?Math.max(0,value.setup.step):0,goal:text(value.setup.goal,40),gripOnly:value.setup.gripOnly===true}};
}
export function readJournal(raw){
 if(!raw)return [];
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>2*1024*1024)throw new Error('Choose a journal file smaller than 2 MB.');
 let data;try{data=JSON.parse(raw.replace(/^\uFEFF/,''));}catch{throw new Error('Choose a valid Mehtronome journal JSON file.');}
 if(!data||typeof data!=='object'||data.version!==1||data.format!==JOURNAL_FORMAT||!Array.isArray(data.items)||data.items.length>100)throw new Error('Unsupported practice journal file.');
 const items=data.items.map(cleanEntry);if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Journal contains duplicate entries.');return items;
}
export function writeJournal(items){if(items.length>100)throw new Error('Save up to 100 journal entries. Delete one before saving another.');return JSON.stringify({format:JOURNAL_FORMAT,version:1,items:items.map(cleanEntry)},null,2);}
export function mergeJournal(existing,incoming,makeId=()=>crypto.randomUUID()){
 if(existing.length+incoming.length>100)throw new Error('Import would exceed 100 entries. Export a backup and delete some entries first.');
 const ids=new Set(existing.map(i=>i.id));return [...existing,...incoming.map(value=>{const entry=cleanEntry(value);if(ids.has(entry.id)){const base=makeId();let id=base,n=1;while(ids.has(id))id=`${base}-${n++}`;entry.id=id;}ids.add(entry.id);return entry;})];
}
