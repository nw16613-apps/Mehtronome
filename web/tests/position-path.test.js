import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt,PROGRESSIONS} from '../src/audio/music.js';
import {FRET_REGIONS,progressionPositionPath} from '../src/guitar/position-path.js';
import {POSITIONS,fretboardFor} from '../src/guitar/fretboard.js';

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
        const board=fretboardFor(chords[index],choice.shape);
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
