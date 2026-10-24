const QUALITIES={
  '0,4,7,11':{symbol:'maj7',name:'Major seventh'},
  '0,3,7,10':{symbol:'m7',name:'Minor seventh'},
  '0,4,7,10':{symbol:'7',name:'Dominant seventh'},
  '0,3,6,10':{symbol:'m7♭5',name:'Half-diminished seventh'},
  '0,3,7,11':{symbol:'m(maj7)',name:'Minor major seventh'},
  '0,4,8,11':{symbol:'maj7♯5',name:'Augmented major seventh'},
  '0,3,6,9':{symbol:'°7',name:'Diminished seventh'},
};

/**
 * Stack scale degrees 1–3–5–7 above each root, preserving the mode's spelling.
 * @param {{scalePcs:number[],scaleNames:string[]}} harmony
 */
export function harmonizedSevenths(harmony){
  return harmony.scalePcs.map((root,degree)=>{
    const indices=[0,2,4,6].map(offset=>(degree+offset)%7);
    const pcs=indices.map(index=>harmony.scalePcs[index]);
    const intervals=pcs.map(pc=>(pc-root+12)%12);
    const quality=QUALITIES[intervals.join(',')];
    if(!quality)throw new Error(`Unsupported diatonic seventh: ${intervals.join(',')}`);
    const rootName=harmony.scaleNames[degree];
    return {degree:degree+1,root,rootName,pcs,intervals,notes:indices.map(index=>harmony.scaleNames[index]),symbol:rootName+quality.symbol,quality:quality.name};
  });
}
