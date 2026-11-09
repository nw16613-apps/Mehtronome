import {normalizeCustomProgression} from './custom-progression.js';
import {orderedRoots,generatorRootLetter} from './progression-generator.js';
import {harmonyAt} from '../audio/music.js';

export const STUDY_PATH_KEY='mehtronome-dorian-study-path-v1';
export const STUDY_TIERS=[
 {id:1,name:'Single-chord vamp',scope:'One quality · one key'},
 {id:2,name:'Same sound, different keys',scope:'Minor 7 · Dorian throughout'},
 {id:3,name:'Progressions & turnarounds',scope:'Different qualities & modes'},
];
export const STUDY_MATERIALS=[
 ['positionalscale','Scale','Scale'],['positional','Core arpeggio','Arpeggio'],
 ['thirds','Scale in thirds','Scale sequences'],['fourths','Scale in fourths','Scale sequences'],['sixths','Scale in sixths','Scale sequences'],
 ['groups3','Scale groups of three','Scale sequences'],['groups4','Scale groups of four','Scale sequences'],
 ['digital1324','1–3–2–4','Scale sequences'],['cells','1–2–3–5','Scale sequences'],
 ['arpgroups3','Arpeggio groups of three','Arpeggio sequences'],['arpgroups4','Arpeggio groups of four','Arpeggio sequences'],
 ['harmonized','Diatonic seventh arpeggios','Arpeggio sequences'],['alternating','Alternating diatonic arpeggios','Arpeggio sequences'],
];
export const STUDY_ROOT_ORDERS={fourths:'Perfect fourths',fifths:'Perfect fifths',minorThird:'Minor thirds · ♭3',majorThird:'Major thirds',whole:'Whole steps',chromatic:'Semitones',tritone:'Tritones'};
export const STUDY_TURNAROUNDS={two:'ii–V',three:'ii–V–I',four:'vi–ii–V–I'};
const positions=['I','II','III','IV','V'],regions=['low','lowerMiddle','middle','upperMiddle','high'];
export function normalizeStudyPath(value={}){
 value=value&&typeof value==='object'?value:{};
 const root=Number(value.root);
 return {tier:[1,2,3].includes(Number(value.tier))?Number(value.tier):1,root:Number.isInteger(root)&&root>=0&&root<12?root:9,
  material:STUDY_MATERIALS.some(([id])=>id===value.material)?value.material:'positionalscale',
  position:positions.includes(value.position)?value.position:'I',region:regions.includes(value.region)?value.region:'middle',
  route:value.route==='region'?'region':'framework',order:Object.hasOwn(STUDY_ROOT_ORDERS,value.order)?value.order:'fourths',
  coverage:value.coverage===true,turnaround:Object.hasOwn(STUDY_TURNAROUNDS,value.turnaround)?value.turnaround:'three',bars:[1,2,4,8].includes(Number(value.bars))?Number(value.bars):2};
}
export function studyPathId(value){
 const s=normalizeStudyPath(value),route=s.tier===1?['framework',s.position]:s.tier===2&&s.route==='framework'?['framework',s.position]:['region',s.region];
 return JSON.stringify([s.tier,s.root,s.material,s.bars,...route,...(s.tier===2?[s.order,s.coverage]:s.tier===3?[s.turnaround]:[])]);
}
export function readStudyPath(raw){
 try{const data=JSON.parse(raw||'{}');return {selection:normalizeStudyPath(data.selection),marked:Array.isArray(data.marked)?[...new Set(data.marked.filter(id=>typeof id==='string'&&id.length<200&&/^\[[123],/.test(id)))].slice(0,3000):[]};}
 catch{return {selection:normalizeStudyPath(),marked:[]};}
}
export function studyPathPlan(value){
 const s=normalizeStudyPath(value),navigation=s.tier===1||s.tier===2&&s.route==='framework'?'all':'path';
 let key=s.root,steps;
 if(s.tier===3){
  // The selected minor-7 root is ii; the chart reference is its major tonic.
  key=(s.root+10)%12;
  const ii={root:2,letter:1,chord:'min7',mode:'dorian',bars:s.bars};
  const v={root:7,letter:4,chord:'dom7',mode:'mixolydian',bars:s.bars};
  const i={root:0,letter:0,chord:'maj7',mode:'major',bars:s.bars};
  steps=s.turnaround==='two'?[ii,v]:s.turnaround==='three'?[ii,v,i]:[{root:9,letter:5,chord:'min7',mode:'minor',bars:s.bars},ii,v,i];
 }else{
  const cycle={fourths:12,fifths:12,minorThird:4,majorThird:3,whole:6,chromatic:12,tritone:2};
  const roots=s.tier===1?[s.root]:orderedRoots({start:s.root,order:s.order,coverage:s.coverage,count:s.coverage?12:cycle[s.order]});
  steps=roots.map(root=>({root:(root-key+12)%12,letter:generatorRootLetter(key,root,['fourths','minorThird','majorThird','tritone'].includes(s.order)),chord:'min7',mode:'dorian',bars:s.bars}));
 }
 const name=s.tier===1?'Dorian · minor 7 vamp':s.tier===2?'Dorian · '+STUDY_ROOT_ORDERS[s.order]:STUDY_TURNAROUNDS[s.turnaround]+' · Dorian ii';
 const progression=normalizeCustomProgression({name,steps}),chart={key,beats:4,progression};
 const settings={key,mode:'dorian',chord:'min7',template:'custom',progression:true,customProgression:progression};
 const chords=steps.map((_,i)=>{const h=harmonyAt(settings,i);return h.name+h.suffix;});
 return {selection:s,chart,navigation,positions:navigation==='all'?steps.map(()=>s.position):null,study:s.material,chords,id:studyPathId(s)};
}
