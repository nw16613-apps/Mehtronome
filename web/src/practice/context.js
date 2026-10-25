import {MODES,ROOT_NAMES,harmonyAt,progressionOrder,progressionDefinition} from '../audio/music.js';
export function musicalContext(settings,step=0){
 const order=settings.progression?progressionOrder(settings):[0],active=order.includes(step)?step:order[0],current=harmonyAt(settings,active),next=settings.progression?harmonyAt(settings,order[(order.indexOf(active)+1)%order.length]):null;
 return {tonic:ROOT_NAMES[settings.key],current,scale:`${current.scaleNames[0]} ${MODES[current.mode].name}`,next,progression:settings.progression?progressionDefinition(settings).name:'Pedal chord',chord:`${current.name}${current.suffix}`,nextChord:next?`${next.name}${next.suffix}`:'Held chord'};
}
export function spellingHelp(harmony){
 const aliases=harmony.chordPcs.flatMap((pc,i)=>{const j=harmony.scalePcs.indexOf(pc);return j>=0&&harmony.tones[i]!==harmony.scaleNames[j]?[`${harmony.tones[i]} = ${harmony.scaleNames[j]}`]:[];});
 return `Chord labels describe the harmony; scale labels describe its guide. 2/9, 4/11 and 6/13 name the same pitch classes in different registers.${aliases.length?' Enharmonic equivalents here: '+aliases.join(', ')+'.':''} Scale guides are contextual choices, not rules for every use of a chord.`;
}
