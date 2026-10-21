import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FAVORITES_KEY,readVoicingFavorites,writeVoicingFavorites,toggleVoicingFavorite,matchingVoicingFavorites,voicingFavoriteId} from '../src/guitar/favorites.js';

function storage(initial=null) {
  const values=new Map(initial===null?[]:[[FAVORITES_KEY,initial]]);
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}
const item=(overrides={})=>({rootPc:9,suffix:'m13',position:'IV',approach:'shell',board:{
  id:'shell:3-2.4-1.5-3',name:'Shell',formula:'1–♭3–♭7',intervals:['1','♭3','♭7'],
  notes:[{string:3,fret:2,midi:57,pc:9,name:'A',root:true,chord:true,scaleIndex:0},
    {string:4,fret:1,midi:60,pc:0,name:'C',root:false,chord:true,scaleIndex:1},
    {string:5,fret:3,midi:67,pc:7,name:'G',root:false,chord:true,scaleIndex:2}],
  added:[],omitted:['E','B','F♯'],bass:'A',bassInterval:'1',contained:true,shiftFrets:0,
},...overrides});

test('voicing favorites roundtrip physical notes, chord labels and useful metadata',()=>{
  const saved=storage(),original=item();
  assert.equal(writeVoicingFavorites(saved,[original]),true);
  const [restored]=readVoicingFavorites(saved);
  assert.equal(restored.id,voicingFavoriteId(original,original.board));
  assert.deepEqual(restored.board.notes,original.board.notes);
  assert.deepEqual(restored.board.intervals,original.board.intervals);
  assert.equal(restored.board.formula,'1–♭3–♭7');
  assert.deepEqual(restored.board.omitted,['E','B','F♯']);
  assert.equal(restored.board.minFret,1);
  assert.equal(restored.board.maxFret,3);
  assert.deepEqual(restored.board.strings,[3,2,1]);
});

test('favorite identity is stable across note order and ignores display-only board identifiers',()=>{
  const original=item(),reordered={...original.board,id:'renamed',notes:[...original.board.notes].reverse()};
  assert.equal(voicingFavoriteId(original,original.board),voicingFavoriteId(original,reordered));
  assert.notEqual(voicingFavoriteId({...original,position:'I'},original.board),voicingFavoriteId(original,original.board));
  assert.notEqual(voicingFavoriteId({...original,rootPc:0},original.board),voicingFavoriteId(original,original.board));
  assert.notEqual(voicingFavoriteId({...original,suffix:'m7'},original.board),voicingFavoriteId(original,original.board));
});

test('toggle pins/removes without mutating input and matching uses exact chord context',()=>{
  const original=item(),list=[];
  const pinned=toggleVoicingFavorite(list,original);
  assert.deepEqual(list,[]);
  assert.equal(pinned.length,1);
  assert.deepEqual(toggleVoicingFavorite(pinned,original),[]);
  const all=[...pinned,item({position:'I'}),item({rootPc:0}),item({suffix:'m7'}),item({approach:'triad'})];
  assert.equal(matchingVoicingFavorites(all,{rootPc:9,suffix:'m13'}).length,3);
  assert.equal(matchingVoicingFavorites(all,{rootPc:9,suffix:'m13',position:'IV',approach:'shell'}).length,1);
  assert.equal(matchingVoicingFavorites(all,{rootPc:9,suffix:'m13',position:'all'}).length,3);
  assert.equal(matchingVoicingFavorites(all,{rootPc:0,suffix:'m'}).length,0);
});

test('invalid and hostile storage stays harmless while valid records survive',()=>{
  for (const raw of ['broken','null','[]','{"version":2,"items":[]}',JSON.stringify({version:1,items:{}})]) assert.deepEqual(readVoicingFavorites(storage(raw)),[]);
  const invalid=[null,{},item({rootPc:12}),item({board:{...item().board,notes:[{string:3,fret:0,midi:55,pc:7,name:'G'}]}}),
    item({board:{...item().board,notes:item().board.notes.map((note,index)=>({...note,midi:index===0?88:note.midi}))}})];
  const valid=item();valid.board.untrusted={nested:'discard'};
  const [restored]=readVoicingFavorites(storage(JSON.stringify({version:1,items:[...invalid,valid]})));
  assert.equal(restored.rootPc,9);
  assert.equal(restored.board.untrusted,undefined);
  assert.equal(restored.board.notes.length,3);
  const throwing={getItem(){throw new Error('blocked');},setItem(){throw new Error('full');}};
  assert.deepEqual(readVoicingFavorites(throwing),[]);
  assert.equal(writeVoicingFavorites(throwing,[valid]),false);
  assert.equal(writeVoicingFavorites(null,[valid]),false);
  assert.deepEqual(toggleVoicingFavorite([],null),[]);
});

test('storage deduplicates and caps favorites while toggling can remove at capacity',()=>{
  const many=Array.from({length:110},(_,index)=>item({suffix:`m13-${index}`}));
  const saved=storage();
  writeVoicingFavorites(saved,[many[0],...many]);
  const capped=readVoicingFavorites(saved);
  assert.equal(capped.length,100);
  assert.equal(new Set(capped.map(favorite=>favorite.id)).size,100);
  assert.equal(toggleVoicingFavorite(capped,many[109]).length,100);
  assert.equal(toggleVoicingFavorite(capped,many[0]).length,99);
});

test('pins retain modal context so a colour or parent CAGED position is not reused for another mode',()=>{
  const dorian=item({mode:'dorian'}),aeolian=item({mode:'minor'});
  assert.notEqual(voicingFavoriteId(dorian,dorian.board),voicingFavoriteId(aeolian,aeolian.board));
  const saved=storage();writeVoicingFavorites(saved,[dorian,aeolian]);
  const items=readVoicingFavorites(saved);
  assert.equal(matchingVoicingFavorites(items,{rootPc:9,suffix:'m13',mode:'dorian'}).length,1);
  assert.equal(matchingVoicingFavorites(items,{rootPc:9,suffix:'m13',mode:'phrygian'}).length,0);
});
