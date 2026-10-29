import {CHORDS,MODES,MODE_FAMILIES} from '../audio/music.js';

const pcSet=intervals=>new Set(intervals.map(interval=>(interval%12+12)%12));
const DEGREE_NAMES={0:'1',1:'♭9',2:'9',3:'♯9',4:'3',5:'11',6:'♯11/♭5',7:'5',8:'♭13/♯5',9:'13',10:'♭7',11:'7'};

// Pentatonics may omit chord tones when their notes fit a complete guide
// containing the written chord. Blues scales use their underlying pentatonic;
// the added blue note is a passing inflection, not a replacement chord tone.
function reducedGuideParent(id,chordPcs){
 const mode=MODES[id];
 if(!['Pentatonic scales','Blues scales'].includes(mode.family))return null;
 const blueNote=id==='major_blues'?3:id==='minor_blues'?6:null;
 const structural=mode.intervals.filter(pc=>pc!==blueNote);
 return Object.values(MODES).find(parent=>parent.intervals.length===7&&
   [...chordPcs,...structural].every(pc=>parent.intervals.includes(pc)))||null;
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
      const parent=reducedGuideParent(id,chordPcs);
      if(parent)choices.push({id,name:mode.name,family:mode.family||'Major scale',category:'Colour',strict:false,compatible:true,targetChord:chordId,
        explanation:`Fits ${parent.name}, which contains every written chord tone. This reduced collection omits ${missing.map(pc=>DEGREE_NAMES[pc]).join(', ')}.${id.endsWith('_blues')?' The added blue note is a passing colour.':''}`,score:30});
    }
  }
  if(chordId==='dom7')choices.push({id:'altered',name:MODES.altered.name,family:'Melodic minor',category:'Contextual',strict:false,compatible:false,targetChord:'dom7alt',
    explanation:'Resolution choice only: reinterpret 7 as 7alt. The altered scale omits the natural 5 and adds altered tensions.',score:5});
  return choices.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}

// Both complete chord spellings and supported reduced collections belong in the menu.
export function compatibleScaleGroups(chordId){
 const choices=scaleChoicesForChord(chordId).filter(choice=>choice.compatible);
 return MODE_FAMILIES.map(family=>({family,choices:choices.filter(choice=>choice.family===family)})).filter(group=>group.choices.length);
}
export function compatibleModeForChord(chordId,preferred,fallback){
 const choices=compatibleScaleGroups(chordId).flatMap(group=>group.choices);
 return choices.find(c=>c.id===preferred)?.id||choices.find(c=>c.id===fallback)?.id||choices[0]?.id||'';
}
