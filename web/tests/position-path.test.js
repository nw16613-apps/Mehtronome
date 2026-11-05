import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt,PROGRESSIONS} from '../src/audio/music.js';
import {FRET_REGIONS,progressionPositionPath} from '../src/guitar/position-path.js';
import {POSITIONS,cagedPositionFor,fretboardFor} from '../src/guitar/fretboard.js';

const harmonies=settings=>Array.from(
  {length:PROGRESSIONS[settings.template].roman.length},
  (_,step)=>harmonyAt({...settings,progression:true},step),
);

test('position paths select a real displayed CAGED diagram for every progression chord',()=>{
  for(const template of ['major251','jazzBlues','fourths1','modal_dorian']){
    const chords=harmonies({key:9,mode:'dorian',chord:'min7',template});
    for(const region of Object.values(FRET_REGIONS)){
      const path=progressionPositionPath(chords,region);
      assert.equal(path.length,chords.length);
      path.forEach((choice,index)=>{
        assert.ok(POSITIONS.some(position=>position.shape===choice.shape&&position.numeral===choice.numeral));
        const board=fretboardFor(chords[index],choice.geometryShape);
        assert.deepEqual([choice.start,choice.end],[board.start,board.end]);
      });
    }
  }
});

test('changing fretboard region moves the progression route and nearby chords avoid large jumps',()=>{
  const chords=harmonies({key:0,mode:'major',chord:'maj7',template:'fourths1'});
  const low=progressionPositionPath(chords,FRET_REGIONS.low);
  const high=progressionPositionPath(chords,FRET_REGIONS.high);
  assert.ok(high.reduce((sum,item)=>sum+item.center,0)>low.reduce((sum,item)=>sum+item.center,0)+chords.length*4);
  for(const path of [low,high])for(let i=1;i<path.length;i++){
    assert.ok(Math.abs(path[i].center-path[i-1].center)<=6);
  }
});

test('empty progressions produce an empty route',()=>{
  assert.deepEqual(progressionPositionPath([],FRET_REGIONS.middle),[]);
});

test('position numerals always retain the E D C A G shape mapping',()=>{
  assert.deepEqual(POSITIONS.map(({numeral,shape})=>`${numeral}:${shape}`),['I:E','II:D','III:C','IV:A','V:G']);
  const path=progressionPositionPath(harmonies({key:0,mode:'major',chord:'maj7',template:'major251'}));
  const shapeFor=Object.fromEntries(POSITIONS.map(position=>[position.numeral,position.shape]));
  for(const choice of path)assert.equal(choice.shape,shapeFor[choice.numeral]);
});

test('CAGED identities follow the modal-root strings in every major-scale mode',()=>{
  const expected={E:[0,2,5],D:[2,4],C:[1,4],A:[1,3],G:[0,3,5]};
  for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian']){
    const boardHarmony=harmonyAt({key:9,mode,chord:'min7'});
    for(const geometry of POSITIONS){
      const board=fretboardFor(boardHarmony,geometry.shape),position=cagedPositionFor(board);
      const strings=[...new Set(board.notes.filter(note=>note.root).map(note=>note.string))];
      assert.ok(expected[position.shape].every(string=>strings.includes(string)),`${mode} ${position.shape} shape roots`);
    }
  }
});

test('G Lydian rotates parent-major geometry to IV A, V G, I E, II D, III C',()=>{
  const harmony=harmonyAt({key:7,mode:'lydian',chord:'maj7sharp11'});
  assert.deepEqual(POSITIONS.map(geometry=>{
    const position=cagedPositionFor(fretboardFor(harmony,geometry.shape));
    return `${position.numeral}:${position.shape}`;
  }),['IV:A','V:G','I:E','II:D','III:C']);
});

test('the low Gm7 to Bbm7 to Dbm7 to Em7 route keeps every chord near frets 1–5',()=>{
 const hs=[7,10,1,4].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'})),path=progressionPositionPath(hs,FRET_REGIONS.low);
 assert.deepEqual(path.map(p=>p.shape),['E','G','C','D']);assert.deepEqual(path.map(p=>[p.start,p.end]),[[2,6],[3,7],[1,6],[2,6]]);
});
test('every chord retains its independently preferred region fit across keys and modes',()=>{
 for(let key=0;key<12;key++)for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian','harmonic_minor','melodic_minor'])for(const region of Object.values(FRET_REGIONS)){
  const hs=[0,3,6,9,2,5].map(offset=>harmonyAt({key:(key+offset)%12,mode,chord:['major','lydian'].includes(mode)?'maj7':mode==='mixolydian'?'dom7':mode==='locrian'?'halfDim':['harmonic_minor','melodic_minor'].includes(mode)?'minMaj7':'min7'}));
  const first=progressionPositionPath([hs[0]],region)[0],route=progressionPositionPath(hs,region);assert.deepEqual(route[0],first);
  for(const [i,position]of route.entries()){const board=fretboardFor(hs[i],position.geometryShape);assert.equal(cagedPositionFor(board).shape,position.shape);assert.equal(position.start,board.start);assert.equal(position.end,board.end);const local=progressionPositionPath([hs[i]],region)[0],target=(region.start+region.end)/2,overlap=p=>Math.max(0,Math.min(p.end,region.end)-Math.max(p.start,region.start)+1);assert.equal(Math.abs(position.center-target),Math.abs(local.center-target));assert.equal(overlap(position),overlap(local));}
 }
});
test('unchanged harmony remains in its opening position throughout a long route',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const region of Object.values(FRET_REGIONS)){const path=progressionPositionPath(Array(32).fill(h),region);for(const position of path)assert.deepEqual(position,path[0]);}
});

test('repeated A Db F Lydian changes stay around frets 7–11 instead of drifting to higher shapes',()=>{
 const hs=Array.from({length:12},(_,i)=>harmonyAt({key:[9,1,5][i%3],mode:'lydian',chord:'maj7'}));
 const expected=Array.from({length:12},(_,i)=>[{shape:'D',numeral:'II',start:6,end:11},{shape:'E',numeral:'I',start:8,end:12},{shape:'A',numeral:'IV',start:7,end:11}][i%3]);
 for(const count of [3,6,12])assert.deepEqual(progressionPositionPath(hs.slice(0,count),FRET_REGIONS.middle).map(({shape,numeral,start,end})=>({shape,numeral,start,end})),expected.slice(0,count));
});

test('equally suitable shapes use the smoother continuation inside the selected region',()=>{
 const hs=[0,3,6,9,2,5].map(key=>harmonyAt({key,mode:'harmonic_minor',chord:'minMaj7'}));
 const region=FRET_REGIONS.upperMiddle,independent=progressionPositionPath([hs[4]],region)[0],route=progressionPositionPath(hs,region);
 assert.deepEqual([independent.shape,independent.start,independent.end],['E',9,13]);
 assert.deepEqual([route[4].shape,route[4].start,route[4].end],['D',11,15]);
 assert.equal(route[3].center,route[4].center);
});
