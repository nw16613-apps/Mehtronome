import {CHORDS,MODES} from '../audio/music.js';

const DEGREE_NAMES=['I','♭II','II','♭III','III','IV','♭V','V','♭VI','VI','♭VII','VII'];
const LETTERS=[0,0,1,2,2,3,3,4,5,5,6,6];
const ALLOWED_BARS=new Set([1,2,4,8]);

export const CUSTOM_PROGRESSION_KEY='mehtronome-custom-progression-v1';

export function recommendedMode(chord){
  if(chord==='dom7alt')return 'altered';
  if(chord==='dom7b9')return 'phrygian_dominant';
  if(chord==='halfDim')return 'locrian_natural2';
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
    return {root,letter:LETTERS[root],chord,mode,...(raw.beats!==undefined?{beats}:{bars}),bass,bassLetter:bass===null?null:LETTERS[bass]};
  });
  if(!steps.length)steps.push({root:0,letter:0,chord:'min7',mode:'dorian',bars:1,bass:null,bassLetter:null});
  return {version:2,name:String(value?.name||'My progression').slice(0,60),kind:'custom',bars:1,steps,roman:steps.map(romanForStep)};
}

export function progressionText(progression,chordSymbol=id=>id){
  const clean=normalizeCustomProgression(progression);
  return clean.steps.map((step,index)=>{
    const bass=step.bass===null?'':`/${DEGREE_NAMES[step.bass]}`;
    return `${clean.roman[index]} [${DEGREE_NAMES[step.root]} ${chordSymbol(step.chord)}${bass}; ${step.mode}; ${step.beats!==undefined?step.beats+' beat'+(step.beats===1?'':'s'):step.bars+' bar'+(step.bars===1?'':'s')}]`;
  }).join(' | ');
}

export function cloneTemplate(template,fallbackChord='min7',fallbackMode='dorian'){
  return normalizeCustomProgression({name:`Custom ${template.name||'progression'}`,steps:(template.steps||template.roman.map((_,index)=>({root:template.roots?.[index]||0,chord:fallbackChord,mode:fallbackMode,bars:template.bars||1}))).map(step=>({...step,bass:null}))});
}
