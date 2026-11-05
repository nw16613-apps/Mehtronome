import {CHORDS,MODES,ROOT_NAMES} from '../audio/music.js';
import {normalizeCustomProgression,recommendedMode} from './custom-progression.js';
import {scaleChoicesForChord} from './scale-explorer.js';
export const ROOT_ORDERS={random:'Random',chromatic:'Chromatic · semitones',whole:'Whole steps',minorThird:'Minor thirds · ♭3',majorThird:'Major thirds',fourths:'Perfect fourths',fifths:'Perfect fifths',tritone:'Tritones',alternating:'Alternating ♭3 up / whole step down'};
const INTERVALS={chromatic:[1],whole:[2],minorThird:[3],majorThird:[4],fourths:[5],fifths:[7],tritone:[6],alternating:[3,-2]};
export const GENERATOR_VOCABULARIES={triads:['major','minor','diminished','sus2','sus4','augmented'],sevenths:['maj7','min7','dom7','halfDim','dim7','minMaj7'],extensions:['maj9','maj9sharp11','min9','min11','min13','dom9','dom13','dom7b9','dom13sharp11','halfDim9','minMaj9']};
const mod=n=>(n%12+12)%12;
export function seededRandom(seed){let state=Number(seed)>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
function shuffle(values,random){const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function generatorModes(chord){return scaleChoicesForChord(chord).filter(c=>c.compatible&&c.strict);}
/** A deck covers each selected pitch class before starting another pass. Interval
 * groups restart when their next root would repeat or leave the selected set. */
export function orderedRoots({roots=Array.from({length:12},(_,i)=>i),start=0,order='random',direction=1,coverage=true,count=12,seed=1}={}){
 if(!Object.hasOwn(ROOT_ORDERS,order))order='random';
 const selected=[...new Set(roots.map(Number))].filter(n=>Number.isInteger(n)&&n>=0&&n<12);if(!selected.length)throw new Error('Select at least one root.');
 const random=seededRandom(seed),first=selected.includes(Number(start))?Number(start):selected[0],sign=Number(direction)<0?-1:1,steps=INTERVALS[order]||[1],result=[];
 const limit=Math.max(1,Math.min(128,Number(count)||12));
 while(result.length<limit){
  if(order==='random'){
   const deck=shuffle(selected,random),preferred=result.length?null:first;
   if(preferred!==null){const at=deck.indexOf(preferred);[deck[0],deck[at]]=[deck[at],deck[0]];}
   if(deck.length>1&&deck[0]===result.at(-1))[deck[0],deck[1]]=[deck[1],deck[0]];
   result.push(...deck.slice(0,limit-result.length));continue;
  }
  if(!coverage){
   let current=result.length?result.at(-1):first,phase=0;
   if(!result.length)result.push(current);
   while(result.length<limit){const next=mod(current+sign*steps[phase%steps.length]);if(!selected.includes(next))break;result.push(next);current=next;phase++;}
   if(result.length<limit)throw new Error('This interval cycle leaves your selected roots. Enable full coverage or select the complete cycle.');
   break;
  }
  const remaining=new Set(selected);let group=first;
  while(remaining.size&&result.length<limit){
   if(!remaining.has(group))group=Array.from({length:12},(_,i)=>mod(first+sign*i)).find(pc=>remaining.has(pc));
   let current=group,phase=0;
   while(remaining.has(current)&&result.length<limit){result.push(current);remaining.delete(current);current=mod(current+sign*steps[phase++%steps.length]);}
  }
 }
 return result.slice(0,limit);
}
export function generatorRootLetter(key,root,flats){const names=flats?['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B']:ROOT_NAMES,letters='CDEFGAB';return root===key?0:(letters.indexOf(names[root][0])-letters.indexOf(ROOT_NAMES[key][0])+7)%7;}
function chooseMode(chord,preferred){const modes=generatorModes(chord);return modes.find(m=>m.id===preferred)?.id||modes.find(m=>m.id===recommendedMode(chord))?.id||modes[0]?.id||recommendedMode(chord);}
function diatonicStep(modeId,degree,vocabulary){
 const scale=MODES[modeId].intervals,root=scale[degree],offsets=vocabulary==='triads'?[0,2,4]:[0,2,4,6],intervals=offsets.map(i=>mod(scale[(degree+i)%7]-root));
 const rotation=scale.map((_,i)=>mod(scale[(degree+i)%7]-root)),local=Object.entries(MODES).find(([,m])=>m.intervals.length===7&&m.intervals.every((n,i)=>n===rotation[i]))?.[0];
 let chord=Object.keys(CHORDS).find(id=>CHORDS[id].intervals.length===intervals.length&&CHORDS[id].intervals.every((n,i)=>mod(n)===intervals[i]));
 if(!chord)throw new Error('This mode does not support the selected chord vocabulary.');
 if(vocabulary==='extensions'&&local){const suggested=MODES[local].chord;if(generatorModes(suggested).some(m=>m.id===local))chord=suggested;}
 return {root,chord,mode:chooseMode(chord,local),letter:degree};
}
export function generatorPositions({position='keep',positionSet=['I','II','III','IV','V']}={},count,existing=null,seed=1){
 const names=['I','II','III','IV','V'];if(position==='keep')return existing?.length?Array.from({length:count},(_,i)=>existing[i%existing.length]):null;
 if(names.includes(position))return Array(count).fill(position);
 const selected=position==='selected'?names.filter(n=>positionSet.includes(n)):names;if(!selected.length)throw new Error('Select at least one CAGED position.');
 const random=seededRandom(seed^0x9e3779b9),out=[];while(out.length<count){const deck=shuffle(selected,random);if(deck.length>1&&out.at(-1)===deck[0])[deck[0],deck[1]]=[deck[1],deck[0]];out.push(...deck);}return out.slice(0,count);
}
export function generateProgression(config={},seed=1){
 const random=seededRandom(seed),approach=['musical','random','fixed'].includes(config.approach)?config.approach:'fixed';
 const roots=config.roots||Array.from({length:12},(_,i)=>i),keyRoots=approach==='musical'?Array.from({length:12},(_,i)=>i):roots,key=config.key==='random'?keyRoots[Math.floor(random()*keyRoots.length)]:Number(config.key??9);
 if(!Number.isInteger(key)||key<0||key>11)throw new Error('Choose a valid starting root.');
 if(approach!=='musical'&&!roots.includes(key))throw new Error('Include the starting root in the selected roots.');
 const slots=config.count==='all'?(approach==='musical'?8:roots.length):Math.max(4,Math.min(64,Number(config.count)||8)),count=approach!=='musical'&&config.coverage!==false?Math.max(slots,roots.length):slots;
 const bars=[1,2,4,8].includes(Number(config.bars))?Number(config.bars):1,vocabulary=Object.hasOwn(GENERATOR_VOCABULARIES,config.vocabulary)?config.vocabulary:'sevenths';let steps=[],name;
 if(approach==='musical'){
  const modeId=config.tonality==='minor'?'minor':config.tonality==='modal'?(config.modalMode||'dorian'):'major';
  if(MODES[modeId]?.intervals.length!==7)throw new Error('Choose a seven-note mode for a musical progression.');
  const phrases=config.tonality==='modal'?[[0,3,6,0],[0,1,3,0],[0,6,3,0]]:[[0,1,4,0],[5,1,4,0],[3,1,4,0],[2,5,4,0]],complexity=['borrowed','secondary','substitutions'].includes(config.complexity)?config.complexity:'diatonic';
  while(steps.length<count){const phrase=phrases[Math.floor(random()*phrases.length)];let chunk=phrase.map(degree=>({...diatonicStep(modeId,degree,vocabulary),bars}));
   if(complexity!=='diatonic'&&modeId==='major'&&random()<.5)chunk=[{...diatonicStep('major',0,vocabulary),bars},{root:5,letter:3,chord:vocabulary==='triads'?'minor':'min6',mode:'dorian',bars},{root:10,letter:6,chord:vocabulary==='triads'?'major':vocabulary==='extensions'?'dom13':'dom7',mode:'mixolydian',bars},{...diatonicStep('major',0,vocabulary),bars}];
   if(complexity!=='diatonic'&&modeId==='minor')chunk=chunk.map(s=>s.root===7?{...s,chord:vocabulary==='triads'?'major':vocabulary==='extensions'?'dom7b9':'dom7',mode:'phrygian_dominant'}:s);
   if(['secondary','substitutions'].includes(complexity)&&modeId==='major'&&random()<.65)chunk=[{root:9,letter:5,chord:vocabulary==='triads'?'major':'dom7',mode:'mixolydian',bars},{...diatonicStep('major',1,vocabulary),bars},{...diatonicStep('major',4,vocabulary),bars},{...diatonicStep('major',0,vocabulary),bars}];
   if(['secondary','substitutions'].includes(complexity)&&modeId==='minor'&&random()<.65)chunk=[{root:0,letter:0,chord:vocabulary==='triads'?'major':'dom7',mode:'mixolydian',bars},{...diatonicStep('minor',3,vocabulary),bars},{root:7,letter:4,chord:vocabulary==='triads'?'major':vocabulary==='extensions'?'dom7b9':'dom7',mode:'phrygian_dominant',bars},{...diatonicStep('minor',0,vocabulary),bars}];
   if(complexity==='substitutions'&&['major','minor'].includes(modeId)&&chunk[2].root===7)chunk[2]={root:1,letter:1,chord:vocabulary==='triads'?'major':vocabulary==='extensions'?'dom13sharp11':'dom7',mode:'lydian_dominant',bars};
   steps.push(...chunk);
  }
  steps=steps.slice(0,count);steps[steps.length-1]={...diatonicStep(modeId,0,vocabulary),bars};name=`Generated ${MODES[modeId].name} progression`;
 }else{
  const chord=CHORDS[config.chord]?config.chord:'min7',mode=config.mode||chooseMode(chord,'dorian');
  if(approach==='fixed'&&!generatorModes(chord).some(m=>m.id===mode))throw new Error('Choose a mode containing every tone of the fixed chord quality.');
  const qualities=(config.qualities||GENERATOR_VOCABULARIES[vocabulary]).filter(id=>CHORDS[id]);if(approach==='random'&&!qualities.length)throw new Error('Select at least one chord quality.');
  const ordered=orderedRoots({roots,start:key,order:config.order||'random',direction:config.direction,coverage:config.coverage!==false,count,seed});
  steps=ordered.map(root=>{const quality=approach==='fixed'?chord:qualities[Math.floor(random()*qualities.length)];return {root:mod(root-key),letter:generatorRootLetter(key,root,['minorThird','majorThird','fourths','tritone'].includes(config.order)||Number(config.direction)<0),chord:quality,mode:approach==='fixed'?mode:chooseMode(quality),bars};});
  name=approach==='fixed'?`${CHORDS[chord].name} · ${MODES[mode].name} · ${ROOT_ORDERS[config.order]||'Random roots'}`:'Random chord drill';
 }
 const progression=normalizeCustomProgression({name,steps});return {key,beats:Math.max(1,Math.min(12,Number(config.beats)||4)),progression,seed:Number(seed)>>>0,positions:generatorPositions(config,steps.length,config.existingPositions,seed),positionStrategy:config.position||'keep',flatRoots:['minorThird','majorThird','fourths','tritone'].includes(config.order)||Number(config.direction)<0,approach};
}
