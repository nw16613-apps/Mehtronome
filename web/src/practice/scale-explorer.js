import {CHORDS,MODES} from '../audio/music.js';

const pcSet=intervals=>new Set(intervals.map(interval=>(interval%12+12)%12));
const DEGREE_NAMES={0:'1',1:'♭9',2:'9',3:'♯9',4:'3',5:'11',6:'♯11/♭5',7:'5',8:'♭13/♯5',9:'13',10:'♭7',11:'7'};

export function scaleChoicesForChord(chordId){
  const chord=CHORDS[chordId];if(!chord)return [];
  const chordPcs=pcSet(chord.intervals),choices=[];
  for(const [id,mode] of Object.entries(MODES)){
    const modePcs=pcSet(mode.intervals),missing=[...chordPcs].filter(pc=>!modePcs.has(pc));
    if(!missing.length){
      const exact=mode.chord===chordId;
      const colours=mode.intervals.filter(pc=>!chordPcs.has(pc)).map(pc=>DEGREE_NAMES[pc]);
      choices.push({id,name:mode.name,family:mode.family||'Major scale',category:exact?'Core':'Colour',strict:true,targetChord:chordId,
        explanation:exact?'The mode’s suggested harmony is this exact chord.':`Contains every written chord tone; available colours: ${colours.join(', ')}.`,score:exact?100:50});
    }
  }
  // A plain dominant may be reinterpreted as an altered V chord when it is
  // resolving. Keep this out of strict compatibility because altered omits 5.
  if(chordId==='dom7')choices.push({id:'altered',name:MODES.altered.name,family:'Melodic minor',category:'Contextual',strict:false,targetChord:'dom7alt',
    explanation:'Resolution choice only: reinterpret 7 as 7alt. The altered scale omits the natural 5 and adds ♭9, ♯9, ♭5 and ♯5.',score:5});
  return choices.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}
