import { characteristicNotes, MODES } from '../audio/music.js';
// Standard guitar tuning, low E to high E, in MIDI pitches.
export const TUNING = [40,45,50,55,59,64];
export const SHAPES = {
  C: { tonic: 0, rootString: 1, rootOffset: 3, leadIn: 0 },
  A: { tonic: 9, rootString: 1, rootOffset: 0, leadIn: 1 },
  G: { tonic: 7, rootString: 0, rootOffset: 3, leadIn: 1 },
  E: { tonic: 4, rootString: 0, rootOffset: 0, leadIn: 1 },
  D: { tonic: 2, rootString: 2, rootOffset: 0, leadIn: 1 },
};
// Position numbering follows the CAGED sequence starting from the E form.
export const POSITIONS = [
  { numeral: 'I', shape: 'E' }, { numeral: 'II', shape: 'D' },
  { numeral: 'III', shape: 'C' }, { numeral: 'IV', shape: 'A' },
  { numeral: 'V', shape: 'G' },
];
const ROOT_STRING_SHAPES = {E:[0,2,5],D:[2,4],C:[1,4],A:[1,3],G:[0,3,5]};
export function cagedPositionFor(board) {
  if(board.positionIdentity)return POSITIONS.find(position=>position.shape===board.positionIdentity);
  const strings=[...new Set(board.notes.filter(note=>note.root).map(note=>note.string))];
  const matches=Object.entries(ROOT_STRING_SHAPES).filter(([,roots])=>roots.every(string=>strings.includes(string)));
  const shape=(matches.sort((a,b)=>(strings.length-a[1].length)-(strings.length-b[1].length))[0]?.[0]) || board.shape;
  return POSITIONS.find(position=>position.shape===shape);
}
const CHROMATIC_DEGREES = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const MODE_ROTATIONS = {
  major:0,dorian:1,phrygian:2,lydian:3,mixolydian:4,minor:5,locrian:6,
  melodic_minor:0,dorian_b2:1,lydian_augmented:2,lydian_dominant:3,mixolydian_b6:4,locrian_natural2:5,altered:6,
  harmonic_major:0,dorian_b5:1,phrygian_b4:2,lydian_b3:3,mixolydian_b2:4,lydian_augmented_sharp2:5,locrian_bb7:6,
  harmonic_minor:0,locrian_natural6:1,ionian_sharp5:2,dorian_sharp4:3,phrygian_dominant:4,lydian_sharp2:5,ultralocrian:6,
};
export function parentMajorFor(harmony) {
  const rotation = MODE_ROTATIONS[harmony.mode];
  if (rotation === undefined) return null;
  const index = (7 - rotation) % 7;
  const family=MODES[harmony.mode]?.family || 'Major scale';
  return {pc:harmony.scalePcs[index],name:harmony.scaleNames[index],family};
}
export function positionFor(rootPc, shape, intervals = [0,2,4,5,7,9,11], family = 'Major scale') {
  const definition = SHAPES[shape];
  const [,second,third,,,sixth,seventh] = intervals;
  const melodicMinor = family === 'Melodic minor';
  // Boundaries follow degrees rather than fixed frets: a flattened seventh
  // moves to the next string just as the natural seventh does in Ionian.
  const windows = intervals.length!==7?null:shape === 'A'
    ? [[0,seventh-8],[seventh-12,melodicMinor?third:third-1],[melodicMinor?Math.max(third-5,-1):third-5,sixth-6],[sixth-10,second+1],[0,4],[0,4]]
    : shape === 'G'
      ? [[-3,1],[-3,1],[-3,seventh-11],[seventh-15,melodicMinor?Math.max(third-4,0):third-4],[-3,1],[-3,1]]
      : null;
  let rootFret = (rootPc - definition.tonic + 12) % 12 + definition.rootOffset;
  let start = windows ? rootFret + Math.min(...windows.map(window=>window[0])) : rootFret - definition.rootOffset - definition.leadIn;
  // Move the whole fingering up an octave if any string would use open frets.
  if (start < 1) { rootFret += 12; start += 12; }
  const end = windows ? rootFret + Math.max(...windows.map(window=>window[1])) : start + 4;
  return {shape,start,end,rootString:definition.rootString,rootFret,windows};
}
// Five root frameworks form a cycle around the neck. Assign the whole cycle,
// rather than naming each box independently: altered parent-scale boundaries
// can omit a root and otherwise give two different boxes the same identity.
const identityCache=new Map();
function positionIdentities(rootPc,anchorPc,intervals,family){
  const key=[rootPc,anchorPc,intervals.join(','),family].join(':');
  if(identityCache.has(key))return identityCache.get(key);
  const roots=POSITIONS.map(({shape})=>{
    const p=positionFor(anchorPc,shape,intervals,family);
    return TUNING.flatMap((open,string)=>{
      const from=p.windows?p.rootFret+p.windows[string][0]:p.start;
      const to=p.windows?p.rootFret+p.windows[string][1]:p.end;
      for(let fret=from;fret<=to;fret++)if((open+fret)%12===rootPc)return [string];
      return [];
    });
  });
  let best=0,cost=Infinity;
  for(let rotation=0;rotation<5;rotation++){
    const next=roots.reduce((sum,strings,i)=>{
      const expected=ROOT_STRING_SHAPES[POSITIONS[(i+rotation)%5].shape];
      return sum+expected.filter(string=>!strings.includes(string)).length*4+strings.filter(string=>!expected.includes(string)).length;
    },0);
    if(next<cost){cost=next;best=rotation;}
  }
  const identities=Object.fromEntries(POSITIONS.map((p,i)=>[p.shape,POSITIONS[(i+best)%5].shape]));
  identityCache.set(key,identities);return identities;
}
export function fretboardFor(harmony, shape = 'C', chordOnly = false) {
  const rootPc = harmony.midi[0] % 12;
  // Related major-scale modes share the parent's exact fingering. Chord roots,
  // interval labels and colour notes still refer to the selected modal harmony.
  const parentMajor = parentMajorFor(harmony);
  const anchorPc = parentMajor ? parentMajor.pc : rootPc;
  const anchorName = parentMajor ? parentMajor.name : harmony.name;
  const intervals = harmony.scalePcs.map(pc=>(pc-anchorPc+12)%12).sort((a,b)=>a-b);
  const position = positionFor(anchorPc, shape, intervals, parentMajor?.family);
  const notes = [];
  const colourPcs = characteristicNotes(harmony).map(note => note.pc);
  for (let string = 0; string < TUNING.length; string++) {
    const window = position.windows?.[string];
    const from = window ? position.rootFret + window[0] : position.start;
    // The C-form parent fingering ends one fret earlier on G. Its upper
    // edge is an alternate-string duplicate, outside this position's grip.
    const to = window ? position.rootFret + window[1] : position.end - (intervals.length===7 && shape === 'C' && string === 3 ? 1 : 0);
    for (let fret = from; fret <= to; fret++) {
      const midi = TUNING[string] + fret;
      const pc = midi % 12;
      const scaleIndex = harmony.scalePcs.indexOf(pc);
      const chordIndex = harmony.chordPcs.indexOf(pc);
      if (chordOnly ? chordIndex < 0 : scaleIndex < 0 && chordIndex < 0) continue;
      notes.push({ string, fret, midi, pc, root: pc === rootPc, chord: chordIndex >= 0, scale: scaleIndex >= 0,
        name: chordIndex >= 0 ? harmony.tones[chordIndex] : harmony.scaleNames[scaleIndex],
        characteristic: colourPcs.includes(pc), scaleIndex, chromaticDegree: chordIndex>=0?harmony.intervals[chordIndex]:CHROMATIC_DEGREES[(pc - harmony.scalePcs[0] + 12) % 12] });
    }
  }
  const board={ ...position, rootPc, anchorPc, anchorName, parentMajor, positionIdentity:positionIdentities(rootPc,anchorPc,intervals,parentMajor?.family)[shape], notes };
  if(harmony.scalePcs.length===5){
    const box=pentatonicShapeFor(board,{kind:'pentatonic',pcs:harmony.scalePcs,primaryGuide:true});
    if(box)return {...box.board,notes:box.board.notes.filter(note=>box.keys.has(`${note.string}:${note.fret}`))};
  }
  return board;
}

export function fullFretboardFor(harmony, start = 1, end = 17, chordOnly = false) {
  const rootPc=harmony.midi[0]%12;
  const colourPcs=characteristicNotes(harmony).map(note=>note.pc);
  const notes=[];
  for(let string=0;string<TUNING.length;string++)for(let fret=start;fret<=end;fret++){
    const midi=TUNING[string]+fret,pc=midi%12;
    const scaleIndex=harmony.scalePcs.indexOf(pc),chordIndex=harmony.chordPcs.indexOf(pc);
    if(chordOnly?chordIndex<0:scaleIndex<0&&chordIndex<0)continue;
    notes.push({string,fret,midi,pc,root:pc===rootPc,chord:chordIndex>=0,scale:scaleIndex>=0,
      name:chordIndex>=0?harmony.tones[chordIndex]:harmony.scaleNames[scaleIndex],characteristic:colourPcs.includes(pc),
      scaleIndex,chromaticDegree:chordIndex>=0?harmony.intervals[chordIndex]:CHROMATIC_DEGREES[(pc-harmony.scalePcs[0]+12)%12]});
  }
  return {start,end,rootPc,notes};
}
function escape(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

// A pitch-class filter can produce one or three highlighted notes on a string
// inside a CAGED window. Build the nearest conventional pentatonic box instead:
// two adjacent pentatonic tones per string, centred on the current position.
export function pentatonicShapeFor(board,theory){
  if(theory?.kind!=='pentatonic'||!Array.isArray(theory.pcs))return null;
  const centre=(board.start+board.end)/2,candidatesByString=[];
  for(let string=0;string<TUNING.length;string++){
    const candidates=[];
    for(let fret=1;fret<=24;fret++)if(theory.pcs.includes((TUNING[string]+fret)%12))candidates.push(fret);
    candidatesByString.push(candidates);
  }
  let best=null;
  for(let width=3;width<=8;width++)for(let start=1;start+width-1<=24;start++){
    const end=start+width-1,chosen=[];
    for(const candidates of candidatesByString){
      const inside=candidates.filter(fret=>fret>=start&&fret<=end);
      if(inside.length<2){chosen.length=0;break;}
      let pair=[inside[0],inside[1]];
      for(let index=1;index<inside.length-1;index++)if(Math.abs((inside[index]+inside[index+1])/2-centre)<Math.abs((pair[0]+pair[1])/2-centre))pair=[inside[index],inside[index+1]];
      chosen.push(pair);
    }
    if(chosen.length!==6)continue;
    const frets=chosen.flat(),outside=frets.filter(fret=>fret<board.start||fret>board.end).length;
    const score=width*(theory.primaryGuide?10:100)+Math.abs((start+end)/2-centre)*(theory.primaryGuide?100:10)+outside*2+chosen.reduce((sum,pair)=>sum+pair[1]-pair[0],0)*.1;
    if(!best||score<best.score)best={chosen,score};
  }
  const selected=(best?.chosen||[]).flatMap((pair,string)=>pair.map(fret=>({string,fret,pc:(TUNING[string]+fret)%12})));
  const keys=new Set(selected.map(note=>`${note.string}:${note.fret}`));
  const templates=new Map(board.notes.map(note=>[note.pc,note]));
  const additions=selected.filter(note=>!board.notes.some(existing=>existing.string===note.string&&existing.fret===note.fret)).map(note=>{
    const source=templates.get(note.pc);
    return {...source,...note,midi:TUNING[note.string]+note.fret};
  });
  const frets=selected.map(note=>note.fret);
  return {keys,board:{...board,start:Math.min(board.start,...frets),end:Math.max(board.end,...frets),notes:[...board.notes,...additions].sort((a,b)=>a.string-b.string||a.fret-b.fret)}};
}
/**
 * @param {{notes:Array<{string:number,fret:number,finger?:number}>,muted:number[]} | null} [grip]
 * @param {{kind:'pentatonic'|'triads',name:string,pcs:number[],rootPc?:number,groups?:Array<{name:string,rootPc?:number,pcs:number[]}>} | null} [theory]
 */
export function diagramSvg(board, degrees, modeDegrees, title, highlight = false, grip = null, theory = null) {
  const pentatonicShape=pentatonicShapeFor(board,theory);
  if(pentatonicShape)board=pentatonicShape.board;
  const columns = board.end - board.start + 1;
  const spacing = 400 / columns;
  const x = fret => 40 + spacing / 2 + (fret - board.start) * spacing;
  const y = string => 30 + (5 - string) * 28;
  const nut = board.start === 0 ? 120 : 40;
  // Theory is a pitch-class overlay on the established fingering, never a new
  // position. Give it its own layer so finger badges and modal rings do not
  // obscure the pentatonic or triad-pair markers.
  const shownGrip = theory ? null : grip;
  const shownTitle = theory ? `${title}, ${theory.kind === 'pentatonic' ? 'pentatonic' : 'triad-pair'} overlay: ${theory.name}` : title;
  let svg = `<svg class="fretboard${shownGrip ? ' grip-active' : ''}${theory ? ` theory-active theory-${theory.kind}` : ''}" viewBox="0 0 480 218" role="img" aria-label="${escape(shownTitle)}"><title>${escape(shownTitle)}</title>`;
  for (let fret = board.start; fret <= board.end; fret++) {
    svg += `<text class="fret-number" x="${x(fret)}" y="205" text-anchor="middle">${fret === 0 ? 'open' : fret}</text>`;
  }
  for (let column = board.start === 0 ? 1 : 0; column <= columns; column++) {
    const boundary = 40 + column * spacing;
    svg += `<line class="fret-wire ${boundary === nut && board.start === 0 ? 'nut' : ''}" x1="${boundary}" x2="${boundary}" y1="30" y2="170"/>`;
  }
  TUNING.forEach((_, string) => {
    svg += `<line class="guitar-string" style="stroke-width:${2.2-string*.25}" x1="${nut}" x2="440" y1="${y(string)}" y2="${y(string)}"/><text class="string-name" x="15" y="${y(string)+4}" text-anchor="middle">${['E','A','D','G','B','E'][string]}</text>`;
  });
  // Chord-shape alterations may sit outside a scale's per-string fingering.
  // Display them only with the grip; never change the underlying scale board.
  const diagramNotes=shownGrip?[...board.notes,...shownGrip.notes.filter(g=>!board.notes.some(n=>n.string===g.string&&n.fret===g.fret))]:board.notes;
  for (const note of diagramNotes) {
    const label = degrees ? note.scaleIndex >= 0 ? modeDegrees[note.scaleIndex] : note.chromaticDegree : note.name;
    const colour = !theory && highlight && note.characteristic;
    const finger = shownGrip?.notes.some(n=>n.string===note.string && n.fret===note.fret);
    const selected = theory?.kind==='pentatonic' ? pentatonicShape?.keys.has(`${note.string}:${note.fret}`) : theory?.pcs.includes(note.pc);
    const pentatonicRoot = selected && theory?.kind === 'pentatonic' && note.pc === theory.rootPc;
    const groupIndex = selected && theory?.kind === 'triads' ? theory.groups?.findIndex(group=>group.pcs.includes(note.pc)) ?? -1 : -1;
    const group = groupIndex === 0 ? 'a' : groupIndex === 1 ? 'b' : null;
    const groupName = group ? theory.groups[groupIndex].name : null;
    const theoryTitle = !theory ? '' : selected ? group ? `, triad ${group.toUpperCase()}: ${groupName}` : `, ${theory.name}` : ', outside the selected overlay';
    const theoryClass = selected ? ` theory-note${group ? ` theory-${group}` : ''}${pentatonicRoot ? ' pentatonic-root' : ''}` : '';
    const theoryData = selected ? ` data-theory-group="${group || 'pentatonic'}"` : '';
    const ring = selected ? `<circle class="theory-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="12" fill="none"${group === 'b' ? ' stroke-dasharray="3 2"' : ''}/>` : '';
    const badge = group ? `<g class="theory-badge" aria-hidden="true"><circle cx="${x(note.fret)+17}" cy="${y(note.string)-13}" r="7"/><text x="${x(note.fret)+17}" y="${y(note.string)-10}" text-anchor="middle">${group.toUpperCase()}</text></g>` : '';
    const kind = note.root ? 'root' : note.chord ? 'chord' : 'scale';
    svg += `<g class="fret-note ${kind}${colour ? ' characteristic' : ''}${finger ? ' grip-note' : ''}${theoryClass}" data-string="${note.string}" data-fret="${note.fret}" data-pc="${note.pc}"${theoryData}><title>${escape(`${note.name}, string ${6-note.string}, ${note.fret === 0 ? 'open' : `fret ${note.fret}`}${note.root ? ', chord root' : note.chord ? ', chord tone' : ', scale tone'}${colour ? ', characteristic mode note' : ''}${finger ? ', recommended chord tone' : ''}${theoryTitle}${pentatonicRoot ? ', pentatonic root' : ''}`)}</title><circle cx="${x(note.fret)}" cy="${y(note.string)}" r="10"/>${colour ? `<circle class="characteristic-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="${finger ? 15 : 14}"/>` : ''}${finger ? `<circle class="grip-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="13"/>` : ''}${ring}<text x="${x(note.fret)}" y="${y(note.string)+4}" text-anchor="middle">${escape(label)}</text>${badge}</g>`;
  }
  if (shownGrip) for (const string of shownGrip.muted) svg += `<text class="grip-mute" data-string="${string}" x="29" y="${y(string)+4}" text-anchor="middle"><title>Mute string ${6-string} when playing the chord</title>×</text>`;
  return svg + '</svg>';
}

/**
 * A continuous neck map. Region bands describe the current CAGED geometry.
 * @param {Array<{numeral:string,shape:string,start:number,end:number}>} regions
 * @param {{kind:'pentatonic'|'triads',name:string,pcs:number[],rootPc?:number,groups?:Array<{name:string,rootPc?:number,pcs:number[]}>} | null} theory
 * @param {Array<{numeral:string,notes:Array<{string:number,fret:number}>}>} grips
 */
export function fullFretboardSvg(board, degrees, modeDegrees, title, regions = [], selectedPosition = 'I', highlight = false, theory = null, showRegions = true, grips = []) {
  const width=1320,left=62,right=18,top=54,bottom=48,neckWidth=width-left-right;
  const columns=board.end-board.start+1,spacing=neckWidth/columns;
  const x=fret=>left+spacing/2+(fret-board.start)*spacing;
  const boundary=fret=>left+(fret-board.start)*spacing;
  const y=string=>top+(5-string)*34;
  const shownTitle=theory?`${title}, ${theory.kind==='pentatonic'?'pentatonic':'triad-pair'} overlay: ${theory.name}`:title;
  const shownGrips=theory?[]:grips;
  const gripNotes=new Map();
  for(const grip of shownGrips)for(const note of grip.notes){
    const key=`${note.string}:${note.fret}`,positions=gripNotes.get(key)||new Set();
    positions.add(grip.numeral);gripNotes.set(key,positions);
  }
  let svg=`<svg class="fretboard full-fretboard${shownGrips.length?' grip-active':''}${theory?` theory-active theory-${theory.kind}`:''}" viewBox="0 0 ${width} ${top+5*34+bottom}" role="img" aria-label="${escape(shownTitle)}"><title>${escape(shownTitle)}</title>`;
  if(showRegions)for(const region of regions){
    const start=Math.max(board.start,region.start),end=Math.min(board.end,region.end);
    if(start>end)continue;
    const rx=boundary(start),rw=boundary(end+1)-rx,selected=region.numeral===selectedPosition;
    svg+=`<g class="caged-region${selected?' selected':''}" data-full-position="${region.numeral}" role="button" tabindex="0" aria-label="Select position ${region.numeral}, ${region.shape} shape"><rect x="${rx}" y="22" width="${rw}" height="${top+5*34-8}" rx="9"/><text x="${rx+10}" y="39">${region.numeral} · ${region.shape}</text></g>`;
  }
  for(let fret=board.start;fret<=board.end;fret++)svg+=`<text class="fret-number" x="${x(fret)}" y="${top+5*34+30}" text-anchor="middle">${fret}</text>`;
  for(let column=0;column<=columns;column++){const bx=left+column*spacing;svg+=`<line class="fret-wire" x1="${bx}" x2="${bx}" y1="${top}" y2="${top+5*34}"/>`;}
  TUNING.forEach((_,string)=>{svg+=`<line class="guitar-string" style="stroke-width:${2.2-string*.25}" x1="${left}" x2="${width-right}" y1="${y(string)}" y2="${y(string)}"/><text class="string-name" x="28" y="${y(string)+5}" text-anchor="middle">${['E','A','D','G','B','E'][string]}</text>`;});
  for(const note of board.notes){
    const label=degrees?(note.scaleIndex>=0?modeDegrees[note.scaleIndex]:note.chromaticDegree):note.name;
    const colour=!theory&&highlight&&note.characteristic,selected=theory?.pcs.includes(note.pc);
    const gripPositions=gripNotes.get(`${note.string}:${note.fret}`),gripNote=Boolean(gripPositions),selectedGrip=gripPositions?.has(selectedPosition);
    const pentatonicRoot=selected&&theory?.kind==='pentatonic'&&note.pc===theory.rootPc;
    const groupIndex=selected&&theory?.kind==='triads'?(theory.groups?.findIndex(group=>group.pcs.includes(note.pc))??-1):-1;
    const group=groupIndex===0?'a':groupIndex===1?'b':null;
    const kind=note.root?'root':note.chord?'chord':'scale';
    svg+=`<g class="fret-note ${kind}${colour?' characteristic':''}${gripNote?` grip-note${selectedGrip?' selected-grip-note':''}`:''}${selected?` theory-note${group?` theory-${group}`:''}${pentatonicRoot?' pentatonic-root':''}`:''}" data-string="${note.string}" data-fret="${note.fret}" data-pc="${note.pc}"><title>${escape(`${note.name}, string ${6-note.string}, fret ${note.fret}${note.root?', chord root':note.chord?', chord tone':', scale tone'}${gripNote?`, recommended chord shape${gripPositions.size>1?'s':''}: position ${[...gripPositions].join(', ')}`:''}`)}</title><circle cx="${x(note.fret)}" cy="${y(note.string)}" r="10"/>${colour?`<circle class="characteristic-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="14"/>`:''}${gripNote?`<circle class="grip-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="13"/>`:''}${selected?`<circle class="theory-ring" cx="${x(note.fret)}" cy="${y(note.string)}" r="12" fill="none"${group==='b'?' stroke-dasharray="3 2"':''}/>`:''}<text x="${x(note.fret)}" y="${y(note.string)+4}" text-anchor="middle">${escape(label)}</text></g>`;
  }
  return svg+'</svg>';
}
