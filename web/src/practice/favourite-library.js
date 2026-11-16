import {contentMaterial} from './exercise-catalogue.js';
export const FAVOURITE_LIBRARY_META_KEY='mehtronome-favourite-library-details-v1';
export function normalizeFavouriteDetails(source){
 const entries=Array.isArray(source)?source:[];
 return Object.fromEntries(entries.slice(0,1200).filter(e=>Array.isArray(e)&&typeof e[0]==='string'&&e[0].length<4000&&e[1]&&typeof e[1]==='object').map(([key,value])=>[key,{name:typeof value.name==='string'?value.name.trim().slice(0,60):'',tags:[...new Set((Array.isArray(value.tags)?value.tags:[]).filter(t=>typeof t==='string').map(t=>t.trim().slice(0,24)).filter(Boolean))].slice(0,6),pinned:value.pinned===true,lastPractisedAt:typeof value.lastPractisedAt==='string'&&Number.isFinite(Date.parse(value.lastPractisedAt))?value.lastPractisedAt:''}]));
}
export function readFavouriteDetails(raw){try{return normalizeFavouriteDetails(JSON.parse(raw||'[]'));}catch{return {};}}
export function favouriteMaterial(view){return contentMaterial(view)==='scale'?'scales':contentMaterial(view)==='triad'||contentMaterial(view)==='shape'&&view.material==='triad'?'triads':'sevenths';}
export function filterFavouriteCards(cards,{query='',kind='all',material='all',traversal='all',tag='',sort='pinned'}={}){
 const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return cards.filter(c=>(kind==='all'||c.kind===kind)&&(material==='all'||favouriteMaterial(c.exercise)===material)&&(traversal==='all'||(c.exercise.traversal||'position')===traversal)&&(!tag||c.tags.includes(tag))&&words.every(w=>[c.name,c.summary,...c.tags].join(' ').toLocaleLowerCase().includes(w))).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='recent'?(Date.parse(b.lastPractisedAt)||0)-(Date.parse(a.lastPractisedAt)||0)||a.name.localeCompare(b.name):Number(b.pinned)-Number(a.pinned)||(Date.parse(b.lastPractisedAt)||0)-(Date.parse(a.lastPractisedAt)||0)||a.name.localeCompare(b.name));
}

export function favouriteLibraryBackup(items,recipes,details){return {version:2,items,recipes:recipes.map(r=>({exercise:r.exercise,details:details['recipe:'+r.id]||{}})),exactDetails:items.map(i=>[i.id,details['exact:'+i.id]||{}])};}
