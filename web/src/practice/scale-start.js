import {arpeggioHarmony} from '../guitar/arpeggio-harmony.js';
/** Scale entries use structural chord degrees, never label passing scale tones as chord roots. */
export function scaleStartingState(span,harmony,descending,selected='default',_triplets=false){
 const ordered=descending?span.toReversed():span,core=arpeggioHarmony(harmony),role=note=>core.intervals[core.chordPcs.indexOf(note.pc)]?.match(/\d+/)?.[0];
 if(selected==='default'||!ordered.length)return {supported:true,index:0,note:ordered[0],warning:''};
 const degree=selected.split(':')[0],index=ordered.findIndex(note=>role(note)===degree);
 if(index<0)return {supported:false,index:0,note:ordered[0],warning:`Chord degree ${degree} is not available in this scale position. Using Shape default.`};

 return {supported:true,index,note:ordered[index],warning:''};
}
