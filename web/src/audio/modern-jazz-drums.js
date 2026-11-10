// A spacious straight-eighth half-time pocket. Ride phrasing changes over four
// bars while the main snare stays on beat three; feet keep the longer pulse.
const bodies=[
 [[0,'kick',.32],[7,'kick',.22],[10,'kick',.2],[8,'snare',.39],[3,'snare',.1],[13,'snare',.13]],
 [[0,'kick',.3],[6,'kick',.2],[14,'kick',.23],[8,'snare',.37],[5,'snare',.12],[11,'snare',.1]],
 [[0,'kick',.33],[3,'kick',.19],[11,'kick',.23],[8,'snare',.4],[6,'snare',.1],[15,'snare',.12]],
 [[0,'kick',.3],[7,'kick',.23],[12,'kick',.19],[8,'snare',.38],[2,'snare',.1],[13,'snare',.12]],
];
const rides=[[0,2,4,6,8,11,12,14],[0,3,4,6,8,10,12,15],[0,2,4,7,8,10,12,14],[0,2,4,6,8,11,12,14]];
export function modernJazzDrumCell(bar,fill=false){
 const phase=((bar%4)+4)%4,cell=bodies[phase].map(e=>[...e]);
 for(const slot of rides[phase])if(!fill||slot<=12)cell.push([slot,phase===2&&slot===0?'rideBell':'ride',slot===0||slot===8?.23:slot%4===0?.18:.1]);
 cell.push([4,'hatPedal',.1],[12,'hatPedal',.11]);
 if(fill)cell.push([14,'tomHigh',.21],[15,'tomLow',.24]);
 return cell;
}
