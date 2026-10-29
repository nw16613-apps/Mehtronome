import {CHORDS,MODES,MODE_FAMILIES} from '../audio/music.js';

const pcSet=intervals=>new Set(intervals.map(interval=>(interval%12+12)%12));
const DEGREE_NAMES={0:'1',1:'♭9',2:'9',3:'♯9',4:'3',5:'11',6:'♯11/♭5',7:'5',8:'♭13/♯5',9:'13',10:'♭7',11:'7'};

// Missing chord tones are allowed; opposing chord colours are filtered.
function usableGuide(id,chordPcs){
 const notes=pcSet(MODES[id].intervals),blues=id==='major_blues'||id==='minor_blues';
 if(chordPcs.has(4)&&!chordPcs.has(3)&&notes.has(3)&&!notes.has(4)&&!blues)return false;
 if(chordPcs.has(3)&&!chordPcs.has(4)&&notes.has(4))return false;
 if(chordPcs.has(10)&&!chordPcs.has(11)&&notes.has(11))return false;
 if(chordPcs.has(11)&&!chordPcs.has(10)&&notes.has(10))return false;
 for(const [written,conflicts] of [[1,[2]],[2,[1]],[8,[7,9]],[9,[8]],[6,[5]]]){
  if(chordPcs.has(written)&&conflicts.some(pc=>notes.has(pc)&&!chordPcs.has(pc)))return false;
 }
 if(!chordPcs.has(7)&&(chordPcs.has(6)||chordPcs.has(8))&&notes.has(7))return false;
 return true;
}

export function scaleChoicesForChord(chordId){
  const chord=CHORDS[chordId];if(!chord)return [];
  const chordPcs=pcSet(chord.intervals),choices=[];
  for(const [id,mode] of Object.entries(MODES)){
    const modePcs=pcSet(mode.intervals),missing=[...chordPcs].filter(pc=>!modePcs.has(pc));
    if(!missing.length){
      const exact=mode.chord===chordId;
      const colours=mode.intervals.filter(pc=>!chordPcs.has(pc)).map(pc=>DEGREE_NAMES[pc]);
      choices.push({id,name:mode.name,family:mode.family||'Major scale',category:exact?'Core':'Colour',strict:true,compatible:true,targetChord:chordId,
        explanation:exact?'The mode’s suggested harmony is this exact chord.':`Contains every written chord tone; available colours: ${colours.join(', ')}.`,score:exact?100:50});
    }else{
      if(usableGuide(id,chordPcs))choices.push({id,name:mode.name,family:mode.family||'Major scale',category:'Colour',strict:false,compatible:true,targetChord:chordId,
        explanation:`Omits chord tones ${missing.map(pc=>DEGREE_NAMES[pc]).join(', ')}; use as a melodic colour rather than a complete chord spelling.${id.endsWith('_blues')?' Blue notes are passing colours.':''}`,score:30});
    }
  }
  return choices.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}

// Both complete chord spellings and usable melodic colours belong in the menu.
export function compatibleScaleGroups(chordId){
 const choices=scaleChoicesForChord(chordId).filter(choice=>choice.compatible);
 return MODE_FAMILIES.map(family=>({family,choices:choices.filter(choice=>choice.family===family)})).filter(group=>group.choices.length);
}
export function compatibleModeForChord(chordId,preferred,fallback){
 const choices=compatibleScaleGroups(chordId).flatMap(group=>group.choices);
 return choices.find(c=>c.id===preferred)?.id||choices.find(c=>c.id===fallback)?.id||choices[0]?.id||'';
}
