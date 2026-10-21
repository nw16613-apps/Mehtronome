import { MODES, characteristicNotes } from '../audio/music.js';

// Forms are named for their own root. Every candidate must be a strict subset
// of the displayed modal scale; no out-of-scale substitution is implied.
export const PENTATONIC_FORMS = {
  major:{name:'major pentatonic',intervals:[0,2,4,7,9]},
  minor:{name:'minor pentatonic',intervals:[0,3,5,7,10]},
  minor6:{name:'minor-6 pentatonic',intervals:[0,3,5,7,9]},
  dominant:{name:'dominant pentatonic',intervals:[0,2,4,7,10]},
  hirajoshi:{name:'Hirajoshi pentatonic',intervals:[0,2,3,7,8]},
};
export const TRIAD_FORMS = {
  major:[0,4,7],minor:[0,3,7],diminished:[0,3,6],augmented:[0,4,8],
};

// Relative roots make the recommendations identical in every key. The first
// entries are familiar modal upper structures, not simply the nearest shape.
const PENTATONIC_PREFERENCES = {
  major:[[4,'minor'],[0,'major'],[7,'dominant']],
  dorian:[[2,'minor'],[0,'minor6'],[0,'minor']],
  phrygian:[[1,'major'],[0,'minor'],[3,'dominant']],
  lydian:[[2,'major'],[9,'minor6'],[0,'major']],
  mixolydian:[[0,'dominant'],[7,'minor'],[0,'major']],
  minor:[[5,'minor'],[0,'minor'],[10,'dominant']],
  locrian:[[6,'major'],[3,'minor6'],[1,'major']],
  melodic_minor:[[0,'minor6'],[7,'dominant'],[5,'major']],
  dorian_b2:[[0,'minor6'],[3,'dominant'],[10,'minor6']],
  lydian_augmented:[[11,'minor6'],[2,'major'],[4,'dominant']],
  lydian_dominant:[[2,'dominant'],[7,'minor6'],[0,'dominant']],
  mixolydian_b6:[[5,'minor6'],[0,'dominant'],[7,'minor']],
  locrian_natural2:[[3,'minor6'],[5,'minor6'],[8,'dominant']],
  altered:[[3,'minor'],[1,'minor6'],[6,'dominant']],
};
const TRIAD_PREFERENCES = {
  major:[[5,'major',7,'major'],[0,'major',2,'minor']],
  dorian:[[3,'major',5,'major'],[0,'minor',2,'minor']],
  phrygian:[[1,'major',3,'major'],[0,'minor',10,'minor']],
  lydian:[[0,'major',2,'major'],[2,'major',4,'minor']],
  mixolydian:[[0,'major',10,'major'],[0,'major',2,'minor']],
  minor:[[8,'major',10,'major'],[0,'minor',2,'diminished']],
  locrian:[[6,'major',8,'major'],[0,'diminished',1,'major']],
  melodic_minor:[[5,'major',7,'major'],[0,'minor',2,'minor']],
  dorian_b2:[[0,'minor',1,'augmented'],[3,'major',5,'major']],
  lydian_augmented:[[0,'augmented',2,'major'],[2,'major',4,'major']],
  lydian_dominant:[[0,'major',2,'major'],[2,'major',4,'diminished']],
  mixolydian_b6:[[0,'augmented',10,'major'],[0,'major',10,'major']],
  locrian_natural2:[[0,'diminished',10,'major'],[8,'major',10,'major']],
  altered:[[6,'major',8,'major'],[1,'minor',3,'minor']],
  harmonic_minor:[[7,'major',8,'major'],[0,'minor',11,'diminished']],
  locrian_natural6:[[5,'major',6,'major'],[0,'diminished',10,'minor']],
  ionian_sharp5:[[5,'major',8,'diminished'],[0,'augmented',2,'minor']],
  dorian_sharp4:[[0,'minor',2,'major'],[2,'major',3,'major']],
  phrygian_dominant:[[0,'major',1,'major'],[0,'major',10,'minor']],
  lydian_sharp2:[[0,'major',11,'major'],[11,'major',9,'minor']],
  ultralocrian:[[0,'diminished',9,'major'],[8,'major',9,'major']],
};
const pitchKey = pcs => [...pcs].sort((a,b)=>a-b).join(',');
const fits = (pcs,scale) => pcs.every(pc=>scale.includes(pc));
function details(pcs,harmony) {
  const mode=MODES[harmony.mode];
  return {pcs:[...pcs],names:pcs.map(pc=>harmony.scaleNames[harmony.scalePcs.indexOf(pc)]),
    degrees:pcs.map(pc=>mode.degrees[harmony.scalePcs.indexOf(pc)])};
}
function colourDescription(pcs,harmony) {
  const colours=characteristicNotes(harmony).filter(note=>pcs.includes(note.pc));
  return colours.length ? ` Highlights ${colours.map(note=>`${note.name} (${note.degree})`).join(', ')}.` : '';
}
function uniqueChoices(candidates, limit=3) {
  const used=new Set();
  return candidates.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id)).filter(candidate=>{
    const key=pitchKey(candidate.pcs);
    if(used.has(key))return false;
    used.add(key);return true;
  }).slice(0,limit).map(({score,...option})=>option);
}
function pentatonicsFor(harmony) {
  const mode=MODES[harmony.mode],tonic=harmony.scalePcs[0],tonicName=harmony.scaleNames[0];
  const preferred=PENTATONIC_PREFERENCES[harmony.mode] || [];
  const colourPcs=characteristicNotes(harmony).map(note=>note.pc);
  const candidates=[];
  for(const [type,form] of Object.entries(PENTATONIC_FORMS))for(let degree=0;degree<7;degree++){
    const root=harmony.scalePcs[degree],relative=(root-tonic+12)%12;
    const pcs=form.intervals.map(interval=>(root+interval)%12);
    if(!fits(pcs,harmony.scalePcs))continue;
    const rank=preferred.findIndex(([pc,quality])=>pc===relative&&quality===type);
    const colourCount=colourPcs.filter(pc=>pcs.includes(pc)).length;
    candidates.push({id:`pent-${relative}-${type}`,type,rootPc:root,intervals:[...form.intervals],
      name:`${harmony.scaleNames[degree]} ${form.name}`,...details(pcs,harmony),
      explanation:`Use ${harmony.scaleNames[degree]} ${form.name} within ${tonicName} ${mode.name}. The five notes give modal degrees ${details(pcs,harmony).degrees.join('–')}.${colourDescription(pcs,harmony)}`,
      score:(rank>=0?100-rank*8:0)+colourCount*3+(pcs.includes(tonic)?1:0)+(type==='hirajoshi'?-10:0),
    });
  }
  // The harmonic-minor family has no embedded major/minor/minor-6/dominant
  // pentatonic. Hirajoshi is a conventional contained choice. Offer a second,
  // explicitly labelled selection retaining the tonic and characteristic notes.
  if(mode.family==='Harmonic minor'){
    const indices=[...new Set([0,...characteristicNotes(harmony).map(note=>harmony.scalePcs.indexOf(note.pc)),2,4,6,1,3,5])].slice(0,5).sort((a,b)=>a-b);
    const pcs=indices.map(index=>harmony.scalePcs[index]);
    candidates.push({id:'pent-mode-selection',type:'selection',rootPc:tonic,intervals:pcs.map(pc=>(pc-tonic+12)%12),
      name:`${tonicName} five-note mode selection`,...details(pcs,harmony),
      explanation:`A selected five-note subset of ${tonicName} ${mode.name}, rather than a standard major or minor pentatonic. Keep the modal degrees ${details(pcs,harmony).degrees.join('–')} in focus.${colourDescription(pcs,harmony)}`,
      score:-20,
    });
  }
  return uniqueChoices(candidates);
}

function spelledTone(rootName,letterSteps,pc) {
  const letters=['C','D','E','F','G','A','B'],naturals=[0,2,4,5,7,9,11];
  const letter=(letters.indexOf(rootName[0])+letterSteps)%7;
  const accidental=((pc-naturals[letter]+18)%12)-6;
  return letters[letter]+(accidental>0?'♯'.repeat(accidental):'♭'.repeat(-accidental));
}
function triadsFor(harmony) {
  const result=[],tonic=harmony.scalePcs[0];
  for(const [quality,intervals] of Object.entries(TRIAD_FORMS))for(let degree=0;degree<7;degree++){
    const root=harmony.scalePcs[degree],pcs=intervals.map(interval=>(root+interval)%12);
    if(!fits(pcs,harmony.scalePcs))continue;
    const rootName=harmony.scaleNames[degree];
    result.push({name:`${rootName} ${quality}`,rootPc:root,relative:(root-tonic+12)%12,quality,
      intervals:[...intervals],pcs,names:pcs.map((pc,index)=>spelledTone(rootName,index*2,pc))});
  }
  return result;
}
function triadPairsFor(harmony) {
  const triads=triadsFor(harmony),preferred=TRIAD_PREFERENCES[harmony.mode]||[],candidates=[];
  const colours=characteristicNotes(harmony),tonic=harmony.scalePcs[0],mode=MODES[harmony.mode];
  for(let a=0;a<triads.length;a++)for(let b=a+1;b<triads.length;b++){
    if(triads[a].pcs.some(pc=>triads[b].pcs.includes(pc)))continue;
    let groups=[triads[a],triads[b]];
    const matches=(pair,first,second)=>pair[0]===first.relative&&pair[1]===first.quality&&pair[2]===second.relative&&pair[3]===second.quality;
    const rank=preferred.findIndex(pair=>matches(pair,groups[0],groups[1])||matches(pair,groups[1],groups[0]));
    if(rank>=0&&!matches(preferred[rank],groups[0],groups[1]))groups.reverse();
    const pcs=groups.flatMap(group=>group.pcs),colourCount=colours.filter(note=>pcs.includes(note.pc)).length;
    const chromaticSpelling=groups.some(group=>group.names.some((name,index)=>name!==harmony.scaleNames[harmony.scalePcs.indexOf(group.pcs[index])]));
    const name=groups.map(group=>group.name).join(' + ');
    candidates.push({id:`triads-${groups.map(group=>`${group.relative}-${group.quality}`).join('-')}`,name,
      ...details(pcs,harmony),groups:groups.map(({relative,...group})=>group),
      explanation:`Alternate ${groups[0].name} and ${groups[1].name} as melodic arpeggios within ${harmony.scaleNames[0]} ${mode.name}. The triads share no notes.${colourDescription(pcs,harmony)}${chromaticSpelling?' Triad note spellings may be enharmonic to the mode labels.':''}`,
      score:(rank>=0?100-rank*8:0)+colourCount*3+(pcs.includes(tonic)?1:0)+groups.filter(group=>['major','minor'].includes(group.quality)).length,
    });
  }
  return uniqueChoices(candidates);
}

/** Suggestions are tied to the displayed mode, independently of chord voicing. */
export function theoryOptions(harmony) {
  return {pentatonics:pentatonicsFor(harmony),triadPairs:triadPairsFor(harmony)};
}
