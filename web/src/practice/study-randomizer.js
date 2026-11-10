import {CHORDS,MODES} from '../audio/music.js';
import {normalizeCustomProgression} from './custom-progression.js';
import {generateProgression,orderedRoots,seededRandom,generatorRootLetter,generatorModes,GENERATOR_VOCABULARIES} from './progression-generator.js';
const allRoots=Array.from({length:12},(_,i)=>i),unique=(values,valid)=>[...new Set(values)].filter(valid);
export function normalizeStudyRandomizer(value={}){
 const v=value&&typeof value==='object'?value:{};
 return {roots:Array.isArray(v.roots)?unique(v.roots.slice(0,128).map(Number),n=>Number.isInteger(n)&&n>=0&&n<12):allRoots,
  qualities:Array.isArray(v.qualities)?unique(v.qualities.slice(0,256),id=>typeof id==='string'&&Object.hasOwn(CHORDS,id)):[...GENERATOR_VOCABULARIES.sevenths],
  modes:Array.isArray(v.modes)?unique(v.modes.slice(0,256),id=>typeof id==='string'&&Object.hasOwn(MODES,id)):[],count:Math.max(1,Math.min(64,Math.floor(Number(v.count)||12))),
  approach:v.approach==='related'?'related':'independent',coverage:v.coverage!==false,
  vocabulary:Object.hasOwn(GENERATOR_VOCABULARIES,v.vocabulary)?v.vocabulary:'sevenths',tonality:['major','minor','modal'].includes(v.tonality)?v.tonality:'major',complexity:['diatonic','borrowed','secondary','substitutions'].includes(v.complexity)?v.complexity:'diatonic',
  auto:v.auto===true,every:Math.max(1,Math.min(16,Math.floor(Number(v.every)||1))),seed:Number(v.seed)>>>0};
}
export function normalizeRandomStudyChart(value,tier){
 if(!value||value.tier!==tier||!value.progression?.steps?.length)return null;
 return {tier,beats:Math.max(1,Math.min(12,Math.floor(Number(value.beats)||4))),progression:normalizeCustomProgression(value.progression)};
}
export function randomizeStudy(selection,plan,seed){
 const config=normalizeStudyRandomizer(selection.randomizer),random=seededRandom(seed),pick=list=>list[Math.floor(random()*list.length)];
 if(!config.roots.length)throw new Error('Select at least one eligible root or key.');
 const alternatives=config.roots.filter(root=>root!==selection.root),key=pick(alternatives.length?alternatives:config.roots),bars=selection.bars;
 let progression,beats=4;
 if(selection.tier===4){
  const source=plan.sources.find(f=>f.id===plan.selection.form);beats=plan.chart.beats;
  progression=normalizeCustomProgression(source?.progression||{...plan.chart.progression,steps:plan.chart.progression.steps.slice(0,plan.baseCount)});
 }else if(selection.tier===3&&config.approach==='related'){
  const generated=generateProgression({approach:'musical',key,count:Math.max(4,config.count),bars,vocabulary:config.vocabulary,tonality:config.tonality,modalMode:selection.mode,complexity:config.complexity},seed);
  progression=generated.progression;
 }else{
  const count=selection.tier===1?1:config.count;
  const roots=config.coverage?orderedRoots({roots:config.roots,start:key,count,order:'random',seed}):Array.from({length:count},(_,i)=>i?pick(config.roots):key);
  const qualities=config.qualities.filter(chord=>generatorModes(chord).some(m=>!config.modes.length||config.modes.includes(m.id)));
  if(selection.tier===3&&!qualities.length)throw new Error('Select chord qualities and mode guides that are compatible.');
  let previous='';
  const steps=roots.map(root=>{
   let chord=selection.tier<=2?selection.chord:pick(qualities);
   if(selection.tier===3&&root+':'+chord===previous&&qualities.length>1)chord=pick(qualities.filter(c=>c!==chord));previous=root+':'+chord;
   const modes=generatorModes(chord).filter(m=>!config.modes.length||config.modes.includes(m.id)),mode=selection.tier<=2?selection.mode:pick(modes).id;
   return {root:(root-key+12)%12,letter:generatorRootLetter(key,root,true),chord,mode,bars};
  });
  progression=normalizeCustomProgression({name:selection.tier===1?'Random key · '+MODES[selection.mode].name:selection.tier===2?'Random keys · '+MODES[selection.mode].name:'Random chord drill',steps});
 }
 if(selection.tier===3&&config.approach==='related'&&config.modes.length){
  progression=normalizeCustomProgression({...progression,steps:progression.steps.map(step=>{const choices=generatorModes(step.chord).filter(m=>config.modes.includes(m.id));if(!choices.length)throw new Error('The selected mode guides do not cover every chord in these related changes.');return {...step,mode:choices.find(m=>m.id===step.mode)?.id||pick(choices).id};})});
 }
 const previous=plan.positions||selection.manualPositions;
 const count=progression.steps.length*Math.min(selection.passes,Math.max(1,Math.floor(128/progression.steps.length)));
 return {...selection,root:key,randomizer:{...config,seed:Number(seed)>>>0},randomChart:{tier:selection.tier,beats,progression},harmonyEdits:selection.tier===4?structuredClone(selection.harmonyEdits):{},editContext:selection.tier===4?'random:'+(Number(seed)>>>0):'',card:0,
  manualPositions:selection.route==='manual'&&previous?.length?Array.from({length:count},(_,i)=>previous[i%previous.length]):selection.manualPositions};
}
