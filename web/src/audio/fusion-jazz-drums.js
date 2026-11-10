// Straight-eighth jazz-fusion pocket, in sixteenth-note slots. A four-bar
// kick/ghost-note conversation sits beneath a stable 2-and-4 backbeat.
const cores=[
 [[0,'kick',.57],[7,'kick',.36],[10,'kick',.46],[4,'snare',.51],[12,'snare',.55],[3,'snare',.10],[11,'snare',.12]],
 [[0,'kick',.56],[6,'kick',.4],[9,'kick',.32],[14,'kick',.4],[4,'snare',.5],[12,'snare',.54],[7,'snare',.11]],
 [[0,'kick',.58],[3,'kick',.31],[10,'kick',.45],[4,'snare',.51],[12,'snare',.56],[9,'snare',.1]],
 [[0,'kick',.56],[6,'kick',.37],[11,'kick',.41],[4,'snare',.5],[12,'snare',.55],[5,'snare',.1]],
];
export function fusionJazzDrumCell(bar,fill=false){
 const phase=((bar%4)+4)%4,cell=cores[phase].map(e=>[...e]);
 for(let slot=0;slot<16;slot+=2){
  const open=slot===14&&phase===1&&!fill;
  cell.push([slot,open?'hatOpen':'hat',open?.14:slot%4===0?.19:.1]);
 }
 // A light extra sixteenth changes the hand pattern without a solid 16th wash.
 if(!fill)cell.push([[15,5,7,9][phase],'hat',.065]);
 if(fill){
  cell.push([13,'snare',.18],[14,'tomHigh',.25],[15,'tomLow',.29]);
  return cell.filter(([slot,name])=>!['hat','hatOpen'].includes(name)||slot<=12);
 }
 return cell;
}
