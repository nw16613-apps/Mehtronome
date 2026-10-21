export const FAVORITES_KEY = 'mehtronome.voicing-favorites.v1';
const LIMIT = 100;
const TUNING = [40,45,50,55,59,64];
const POSITIONS = new Set(['I','II','III','IV','V']);
const APPROACHES = new Set(['drop','shell','rootless','triad','quartal']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const cleanText = (value, limit = 160) => typeof value === 'string' ? value.slice(0,limit) : undefined;

function cleanContext(context) {
  if (!isObject(context) || !integer(context.rootPc,0,11) || typeof context.suffix !== 'string' || context.suffix.length > 80) return null;
  const position = POSITIONS.has(context.position) ? context.position : 'any';
  const approach = APPROACHES.has(context.approach) ? context.approach : 'drop';
  return {rootPc:context.rootPc,suffix:context.suffix,position,approach,...(typeof context.mode==='string'?{mode:context.mode.slice(0,80)}:{})};
}

function cleanBoard(board) {
  if (!isObject(board) || !Array.isArray(board.notes) || ![3,4].includes(board.notes.length)
    || !Array.isArray(board.intervals) || !board.intervals.length || board.intervals.length > 16
    || board.intervals.some(interval=>typeof interval !== 'string' || interval.length > 20)) return null;
  const notes=[];
  for (const note of board.notes) {
    if (!isObject(note) || !integer(note.string,0,5) || !integer(note.fret,1,24)
      || !integer(note.midi,40,88) || note.midi !== TUNING[note.string]+note.fret
      || !integer(note.pc,0,11) || note.pc !== note.midi%12 || typeof note.name !== 'string' || note.name.length > 32
      || notes.some(other=>other.string===note.string)) return null;
    notes.push({string:note.string,fret:note.fret,midi:note.midi,pc:note.pc,name:note.name,
      root:note.root===true,chord:note.chord!==false,
      scaleIndex:integer(note.scaleIndex,-1,15)?note.scaleIndex:-1,
      ...(typeof note.chromaticDegree==='string'?{chromaticDegree:note.chromaticDegree.slice(0,20)}:{})});
  }
  notes.sort((a,b)=>a.string-b.string);
  if (notes.some((note,index)=>index>0 && note.midi<=notes[index-1].midi)) return null;
  const minFret=Math.min(...notes.map(note=>note.fret)),maxFret=Math.max(...notes.map(note=>note.fret));
  const clean={notes,intervals:[...board.intervals],minFret,maxFret,start:Math.min(minFret,20),end:Math.max(Math.min(minFret,20)+4,maxFret),strings:notes.map(note=>6-note.string)};
  for (const key of ['id','name','title','formula','bass','bassInterval','inversionName','type','approach','kind','relation','description','topName','topInterval','recipeId']) {
    const value=cleanText(board[key],key==='description'?600:160);
    if (value!==undefined) clean[key]=value;
  }
  for (const key of ['inversion','rootPc','topPc']) if (integer(board[key],0,key==='inversion'?3:11)) clean[key]=board[key];
  for (const key of ['contained','inRange','wide']) if (typeof board[key]==='boolean') clean[key]=board[key];
  for (const key of ['shiftFrets','regionDistance','score']) if (typeof board[key]==='number' && Number.isFinite(board[key]) && Math.abs(board[key])<=1000) clean[key]=board[key];
  for (const key of ['added','omitted','addedIntervals','omittedIntervals']) if (Array.isArray(board[key])) {
    clean[key]=board[key].filter(value=>typeof value==='string').slice(0,16).map(value=>value.slice(0,32));
  }
  if (Array.isArray(board.quartalSteps) && board.quartalSteps.length<=3 && board.quartalSteps.every(step=>step===5||step===6)) clean.quartalSteps=[...board.quartalSteps];
  if (isObject(board.triad) && integer(board.triad.rootPc,0,11) && typeof board.triad.name==='string'
    && ['major','minor','diminished','augmented'].includes(board.triad.quality)
    && Array.isArray(board.triad.pcs) && board.triad.pcs.length===3 && board.triad.pcs.every(pc=>integer(pc,0,11))) {
    clean.triad={rootPc:board.triad.rootPc,name:board.triad.name.slice(0,80),quality:board.triad.quality,pcs:[...board.triad.pcs]};
  }
  return clean;
}

/** Identity follows the physical shape and its harmonic/position context. */
export function voicingFavoriteId(context,board) {
  const clean=cleanContext(context);
  if (!clean || !Array.isArray(board?.notes)) return '';
  const frets=[...board.notes].sort((a,b)=>a.string-b.string).map(note=>`${note.string}-${note.fret}`).join('.');
  return JSON.stringify([clean.rootPc,clean.suffix,clean.position,clean.approach,clean.mode||'',frets]);
}

function cleanItem(item) {
  const context=cleanContext(item),board=cleanBoard(item?.board);
  if (!context || !board) return null;
  return {...context,id:voicingFavoriteId(context,board),board};
}

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  const result=[],seen=new Set();
  for (const item of items) {
    const clean=cleanItem(item);
    if (!clean || seen.has(clean.id)) continue;
    result.push(clean);seen.add(clean.id);
    if (result.length===LIMIT) break;
  }
  return result;
}

export function readVoicingFavorites(storage) {
  try {
    const raw=storage?.getItem(FAVORITES_KEY);
    if (!raw || raw.length>1024*1024) return [];
    const data=JSON.parse(raw);
    return data?.version===1 ? cleanItems(data.items) : [];
  } catch { return []; }
}

export function writeVoicingFavorites(storage,items) {
  try {
    if (!storage || typeof storage.setItem!=='function' || !Array.isArray(items)) return false;
    storage.setItem(FAVORITES_KEY,JSON.stringify({version:1,items:cleanItems(items)}));
    return true;
  } catch { return false; }
}

/** Return a new list. Removing remains available when the 100-shape limit is reached. */
export function toggleVoicingFavorite(items,item) {
  const list=cleanItems(items),clean=cleanItem(item);
  if (!clean) return list;
  if (list.some(existing=>existing.id===clean.id)) return list.filter(existing=>existing.id!==clean.id);
  return list.length<LIMIT ? [...list,clean] : list;
}

export function matchingVoicingFavorites(items,context) {
  if (!isObject(context) || !integer(context.rootPc,0,11) || typeof context.suffix!=='string') return [];
  return cleanItems(items).filter(item=>item.rootPc===context.rootPc && item.suffix===context.suffix
    && (typeof context.mode!=='string' || item.mode===context.mode)
    && (!POSITIONS.has(context.position) || item.position===context.position)
    && (!APPROACHES.has(context.approach) || item.approach===context.approach));
}
