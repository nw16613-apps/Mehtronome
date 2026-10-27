import {CHORDS,MODES,harmonyAt,ROOT_NAMES,spellPitch} from '../audio/music.js';

const DEGREE_NAMES=['I','♭II','II','♭III','III','IV','♭V','V','♭VI','VI','♭VII','VII'];
const LETTERS=[0,1,1,2,2,3,4,4,5,5,6,6];
const ALLOWED_BARS=new Set([1,2,4,8]);

export const CUSTOM_PROGRESSION_KEY='mehtronome-custom-progression-v1';

export function customPitchName(key,offset,letter=LETTERS[offset]){return spellPitch(key,letter,offset,ROOT_NAMES[key]);}

export function recommendedMode(chord){
  if(chord==='sevenSus'||chord==='nineSus')return 'mixolydian';
  if(chord==='dom7alt')return 'altered';
  if(chord==='dom7b9')return 'phrygian_dominant';
  if(chord==='halfDim13')return 'locrian_natural6';
  if(chord==='halfDim'||chord==='halfDim9')return 'locrian_natural2';
  if(chord==='halfDim11')return 'locrian';
  if(chord==='augmented'||chord==='augMaj7'||chord==='augMaj9')return 'lydian_augmented';
  if(chord==='dom9sharp11')return 'lydian_dominant';
  if(chord==='dom9b13')return 'mixolydian_b6';
  if(chord==='dom7b9b13')return 'phrygian_dominant';
  if(chord==='maj7sharp9sharp11')return 'lydian_sharp2';
  if(chord==='min13sharp11')return 'dorian_sharp4';
  if(chord==='min11b9')return 'phrygian';
  if(chord==='min13b9')return 'dorian_b2';
  if(chord==='min11b13')return 'minor';
  if(chord==='dim7')return 'ultralocrian';
  if(chord.includes('minMaj'))return 'melodic_minor';
  if(chord.startsWith('min')||chord==='minor')return 'dorian';
  if(chord.startsWith('dom'))return 'mixolydian';
  if(chord.includes('sharp11'))return 'lydian';
  return 'major';
}

function qualitySuffix(chord){
  if(chord==='halfDim')return 'ø7';
  if(chord==='halfDim9')return 'ø9';
  if(chord==='halfDim11')return 'ø7(add11)';
  if(chord==='halfDim13')return 'ø7(add11,13)';
  if(chord==='dim7')return '°7';
  if(chord==='minor')return '';
  if(chord.startsWith('min'))return (CHORDS[chord]?.symbol||'m').replace(/^m/,'');
  if(chord==='major')return '';
  return CHORDS[chord]?.symbol||'';
}

export function romanForStep(step){
  const root=((Number(step.root)||0)%12+12)%12;
  let numeral=DEGREE_NAMES[root];
  if(Number.isInteger(step.letter)&&step.letter>=0&&step.letter<7){
    const delta=((root-[0,2,4,5,7,9,11][step.letter]+18)%12)-6;
    numeral=(delta<0?'♭'.repeat(-delta):'♯'.repeat(delta))+['I','II','III','IV','V','VI','VII'][step.letter];
  }
  if(step.chord?.startsWith('min')||step.chord==='minor'||step.chord?.startsWith('halfDim')||step.chord==='dim7')numeral=numeral.toLowerCase();
  return numeral+qualitySuffix(step.chord||'major');
}

export function normalizeCustomProgression(value){
  if(value?.version!==undefined&&![1,2].includes(value.version))throw new Error('Unsupported custom progression version.');
  const source=Array.isArray(value?.steps)?value.steps:[];
  const steps=source.slice(0,32).map(raw=>{
    const root=Math.max(0,Math.min(11,Math.floor(Number(raw.root)||0)));
    const chord=typeof raw.chord==='string'&&CHORDS[raw.chord]?raw.chord:'min7';
    const mode=typeof raw.mode==='string'&&MODES[raw.mode]?raw.mode:recommendedMode(chord);
    const bars=ALLOWED_BARS.has(Number(raw.bars))?Number(raw.bars):1;
    const beats=Number(raw.beats);
    if(raw.beats!==undefined&&(!Number.isInteger(beats)||beats<1||beats>32))throw new Error('Chord durations must be 1–32 beats.');
    const bass=raw.bass===null||raw.bass===''||raw.bass===undefined?null:Math.max(0,Math.min(11,Math.floor(Number(raw.bass)||0)));
    return {...(typeof raw.section==='string'&&raw.section.trim()?{section:raw.section.trim().slice(0,32)}:{}),root,letter:Number.isInteger(raw.letter)&&raw.letter>=0&&raw.letter<7?raw.letter:LETTERS[root],chord,mode,...(raw.beats!==undefined?{beats}:{bars}),bass,bassLetter:bass===null?null:Number.isInteger(raw.bassLetter)&&raw.bassLetter>=0&&raw.bassLetter<7?raw.bassLetter:LETTERS[bass]};
  });
  if(!steps.length)steps.push({root:0,letter:0,chord:'min7',mode:'dorian',bars:1,bass:null,bassLetter:null});
  return {version:2,name:String(value?.name||'My progression').slice(0,60),kind:'custom',bars:1,steps,roman:steps.map(romanForStep)};
}

export function progressionText(progression,chordSymbol=id=>id){
  const clean=normalizeCustomProgression(progression);
  return clean.steps.map((step,index)=>{
    const degree=romanForStep({...step,chord:'major'});
    const bass=step.bass===null?'':`/${romanForStep({root:step.bass,letter:step.bassLetter,chord:'major'})}`;
    return `${step.section?'['+step.section+'] ':''}${clean.roman[index]} [${degree} ${chordSymbol(step.chord)}${bass}; ${step.mode}; ${step.beats!==undefined?step.beats+' beat'+(step.beats===1?'':'s'):step.bars+' bar'+(step.bars===1?'':'s')}]`;
  }).join(' | ');
}

export function cloneTemplate(template,fallbackChord='min7',fallbackMode='dorian',settings=/** @type {any} */ (null)){
  if(settings){
    const tonicName=harmonyAt({...settings,progression:false}).name,letters='CDEFGAB';
    const steps=template.roman.map((_,index)=>{
      const h=harmonyAt(settings,index),root=(h.chordPcs[0]-settings.key+12)%12;
      const relative=h.scalePcs.map(pc=>(pc-h.chordPcs[0]+12)%12).sort((a,b)=>a-b);
      const mode=Object.keys(MODES).find(id=>MODES[id].intervals.every((value,i)=>value===relative[i]))||h.mode;
      const source=template.steps?.[index];
      return {...(typeof source?.section==='string'&&source.section.trim()?{section:source.section.trim().slice(0,32)}:{}),root,letter:(letters.indexOf(h.name[0])-letters.indexOf(tonicName[0])+7)%7,chord:h.chordId,mode,...(source?.beats!==undefined?{beats:source.beats}:{bars:source?.bars||template.bars||1}),bass:source?.bass??null,bassLetter:source?.bassLetter};
    });
    return normalizeCustomProgression({name:`Custom ${template.name||'progression'}`,steps});
  }
  return normalizeCustomProgression({name:`Custom ${template.name||'progression'}`,steps:(template.steps||template.roman.map((_,index)=>({root:template.roots?.[index]||0,chord:fallbackChord,mode:fallbackMode,bars:template.bars||1}))).map(step=>({...step,bass:null}))});
}
