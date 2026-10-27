import { POSITIONS, cagedPositionFor, fretboardFor } from './fretboard.js';

export const FRET_REGIONS = {
  low: {name:'Low · frets 1–5',start:1,end:5},
  lowerMiddle: {name:'Lower middle · frets 4–8',start:4,end:8},
  middle: {name:'Middle · frets 7–11',start:7,end:11},
  upperMiddle: {name:'Upper middle · frets 10–14',start:10,end:14},
  high: {name:'High · frets 13–17',start:13,end:17},
};

function candidates(harmony) {
  return POSITIONS.map(position => {
    const board=fretboardFor(harmony,position.shape);
    return {...cagedPositionFor(board),geometryShape:position.shape,start:board.start,end:board.end,center:(board.start+board.end)/2};
  });
}

function regionCost(candidate,region) {
  const target=(region.start+region.end)/2;
  const gap=candidate.end<region.start?region.start-candidate.end
    :candidate.start>region.end?candidate.start-region.end:0;
  const overlap=Math.max(0,Math.min(candidate.end,region.end)-Math.max(candidate.start,region.start)+1);
  return gap*12+Math.abs(candidate.center-target)-overlap*.35;
}

/**
 * Choose one of the five displayed CAGED positions for every harmony while
 * keeping the route inside the requested region and avoiding needless jumps.
 */
export function progressionPositionPath(harmonies,region=FRET_REGIONS.middle) {
  if(!harmonies.length)return [];
  const rows=harmonies.map(candidates);
  let costs=rows[0].map(candidate=>regionCost(candidate,region));
  const previous=rows.map(()=>Array(POSITIONS.length).fill(-1));
  for(let row=1;row<rows.length;row++){
    const next=rows[row].map((candidate,index)=>{
      let best=Infinity,bestIndex=0;
      for(let from=0;from<rows[row-1].length;from++){
        const movement=Math.abs(candidate.center-rows[row-1][from].center)*.45;
        const cost=costs[from]+movement+regionCost(candidate,region);
        if(cost<best){best=cost;bestIndex=from;}
      }
      previous[row][index]=bestIndex;
      return best;
    });
    costs=next;
  }
  let index=costs.indexOf(Math.min(...costs));
  const result=Array(rows.length);
  for(let row=rows.length-1;row>=0;row--){
    result[row]=rows[row][index];
    index=previous[row][index];
  }
  return result;
}

// Compact optional preset control. The context fingerprint prevents a route
// from silently attaching to a different/reordered harmonic progression.
function routeContext(harmonies){
  const text=JSON.stringify(harmonies.map(h=>[h.name,h.chordId,h.mode,h.scalePcs]));
  let hash=2166136261;for(const char of text)hash=Math.imul(hash^char.charCodeAt(0),16777619);
  return (hash>>>0).toString(36);
}
export function manualPositionPath(harmonies,automatic,stored='',edit=/** @type {any} */ (null)){
  const prefix=`v1:${routeContext(harmonies)}:`,digits=String(stored).startsWith(prefix)?String(stored).slice(prefix.length):'';
  const valid=digits.length===harmonies.length&&/^[0-4]+$/.test(digits);
  const choices=valid?[...digits].map(n=>POSITIONS[Number(n)].numeral):automatic.map(p=>p.numeral);
  if(edit&&Number.isInteger(edit.step)&&edit.step>=0&&edit.step<choices.length&&POSITIONS.some(p=>p.numeral===edit.numeral))choices[edit.step]=edit.numeral;
  const path=harmonies.map((h,i)=>candidates(h).find(p=>p.numeral===choices[i]));
  return {path,value:prefix+choices.map(n=>POSITIONS.findIndex(p=>p.numeral===n)).join('')};
}
