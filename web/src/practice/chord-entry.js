import {CHORDS,ROOT_NAMES} from '../audio/music.js';
import {recommendedMode,MAX_CHART_STEPS} from './custom-progression.js';
const pitches={C:0,D:2,E:4,F:5,G:7,A:9,B:11},letters='CDEFGAB';
const normal=s=>s.replaceAll('♭','b').replaceAll('♯','#').replaceAll('Δ','maj').replaceAll('−','-').replace(/^M(?=\d)/,'maj').replace(/^mM(?:aj)?/,'mmaj').replace(/^-/, 'm').replace(/ø7?/g,'m7b5').replaceAll('°','dim').replace(/[()\s]/g,'');
const qualities=new Map(Object.entries(CHORDS).map(([id,c])=>[normal(c.symbol),id]));
for(const [symbol,id]of Object.entries({'':'major',m:'minor',min:'minor',maj:'major','6':'maj6','m6':'min6','7':'dom7',maj7:'maj7',m7:'min7',min7:'min7',m7b5:'halfDim',dim:'diminished',dim7:'dim7',aug:'augmented','+':'augmented',sus:'sus4','7sus':'sevenSus','mmaj7':'minMaj7','6/9':'maj69'}))if(CHORDS[id])qualities.set(symbol,id);
function pitch(s){const m=/^([A-Ga-g])([b#♭♯]?)$/.exec(s);if(!m)throw new Error(`Invalid pitch: ${s}`);return {pc:(pitches[m[1].toUpperCase()]+(['b','♭'].includes(m[2])?-1:['#','♯'].includes(m[2])?1:0)+12)%12,letter:letters.indexOf(m[1].toUpperCase())};}
/** Parse completely before mutating the chart. Pipes delimit bars; :2 holds a lone chord for two bars. */
export function parseChordEntry(text,key=0,beats=4){
 if(!Number.isInteger(key)||key<0||key>11||!Number.isInteger(beats)||beats<1)throw new Error('Choose a valid chart key and meter first.');
 const input=String(text).trim();if(!input)throw new Error('Enter at least one chord symbol.');if(input.length>6000)throw new Error('Chord entry is too long.');
 const groups=input.includes('|')?input.split('|').filter(s=>s.trim()).map(s=>s.trim().split(/\s+/)):input.split(/[\s,;]+/).map(s=>[s]);
 const tonicLetter=letters.indexOf(ROOT_NAMES[key][0]),steps=[],preview=[];
 for(const group of groups){if(group.length>beats||beats%group.length)throw new Error(`Chords within a bar must divide its ${beats} beats evenly.`);
  for(const token of group){const match=/^([A-Ga-g][b#♭♯]?)([^:]*?)(?::([1-8]))?$/.exec(token);if(!match)throw new Error(`Cannot read “${token}”. Use a chord such as Dm7, G7/B or Cmaj7:2.`);
   const root=pitch(match[1]),slash=/\/([A-Ga-g][b#♭♯]?)$/.exec(match[2]),quality=slash?match[2].slice(0,slash.index):match[2],id=qualities.get(normal(quality));if(!id)throw new Error(`Unknown chord quality in “${token}”.`);
   if(match[3]&&group.length>1)throw new Error('A held chord (:2, :4, etc.) needs its own bar.');
   const bars=Number(match[3]||1),duration=group.length>1?{beats:beats/group.length}:[1,2,4,8].includes(bars)?{bars}:{beats:bars*beats};if(duration.beats&&duration.beats>32)throw new Error('A held chord can contain at most 32 beats.');
   const bass=slash?pitch(slash[1]):null;steps.push({root:(root.pc-key+12)%12,letter:(root.letter-tonicLetter+7)%7,chord:id,mode:recommendedMode(id),...duration,bass:bass?(bass.pc-key+12)%12:null,...(bass?{bassLetter:(bass.letter-tonicLetter+7)%7}:{})});
   preview.push({symbol:match[1][0].toUpperCase()+match[1].slice(1)+CHORDS[id].symbol+(slash?'/'+slash[1]:''),beats:duration.beats??bars*beats});
  }
 }
 if(steps.length>MAX_CHART_STEPS)throw new Error(`A chart can contain at most ${MAX_CHART_STEPS} chords.`);
 return {steps,preview,totalBeats:preview.reduce((n,c)=>n+c.beats,0),key,beats};
}
