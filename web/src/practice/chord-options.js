import {CHORDS} from '../audio/music.js';
export function chordFamily(id){
 const pcs=CHORDS[id].intervals.map(n=>n%12);
 if(id==='fifth')return 'Open fifth';
 if(!pcs.includes(3)&&!pcs.includes(4))return 'Suspended';
 if(pcs.includes(3)&&!pcs.includes(4)&&pcs.includes(6)&&!pcs.includes(7))return 'Diminished & half-diminished';
 if(pcs.includes(3)&&!pcs.includes(4))return 'Minor';
 if(pcs.includes(10))return 'Dominant';
 if(pcs.includes(8)&&!pcs.includes(7))return 'Augmented';
 return 'Major';
}
export function chordOptionGroups(ids=Object.keys(CHORDS)){
 return ['Major','Minor','Dominant','Suspended','Diminished & half-diminished','Augmented','Open fifth'].map(family=>({family,ids:ids.filter(id=>chordFamily(id)===family)})).filter(group=>group.ids.length);
}
