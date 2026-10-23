import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRESET_FILE_FORMAT,MAX_PRESET_FILE_BYTES,PRESET_CONTROLS,exportPresets,importPresets,readPresets} from '../src/practice/presets.js';

const preset = (id='one', name='A Dorian') => ({id,name,progression:false,controls:{key:'9',quality:'dorian',chord:'min13',bpm:'90','count-in':false,'trainer-enabled':true,'trainer-bars':'4','trainer-increment':'3','trainer-target':'144','featured-position':'IV'}});

test('preset transfer round trips all controls, including tempo trainer and featured position',()=>{
  const original=[preset()];
  const raw=exportPresets(original),file=JSON.parse(raw);
  assert.equal(file.format,PRESET_FILE_FORMAT);assert.equal(file.version,1);
  assert.deepEqual(importPresets(raw).items,original);
  assert.deepEqual(readPresets(raw),original);
  for(const id of ['trainer-enabled','trainer-bars','trainer-increment','trainer-target','featured-position','sequence-source','pad-movement','pad-depth','pad-brightness'])assert.ok(PRESET_CONTROLS.includes(id));
  const legacy=JSON.stringify({version:1,items:original});
  assert.deepEqual(importPresets('\uFEFF'+legacy).items,original);
  assert.deepEqual(original,[preset()]);
});

test('imports preserve existing setups and give duplicates fresh IDs without changing names',()=>{
  const existing=[preset()], incoming=[preset(),preset('two','Another setup'),preset('one','Third setup')];
  const copy=structuredClone(incoming);
  let sequence=0;
  const result=importPresets(JSON.stringify({version:1,items:incoming}),existing,()=>`new-${++sequence}`);
  assert.equal(result.imported,3);
  assert.deepEqual(result.items.map(p=>p.id),['one','new-1','two','new-2']);
  assert.deepEqual(result.items.map(p=>p.name),['A Dorian','A Dorian','Another setup','Third setup']);
  assert.equal(result.items[0],existing[0]);assert.deepEqual(incoming,copy);
  assert.deepEqual(existing,[preset()]);
  const fallback=importPresets(exportPresets([preset()]),existing,()=> 'one');
  assert.equal(fallback.items[1].id,'imported-preset-1');
});

test('malformed or oversized imports fail without partial merges or unsafe control values',()=>{
  const existing=[preset()];
  for(const raw of ['{','null','[]','{}',JSON.stringify({format:'another-app',version:1,items:[preset()]}),JSON.stringify({version:2,items:[preset()]})])assert.throws(()=>importPresets(raw,existing),/JSON|format/);
  for(const item of [null,{}, {...preset(),id:''},{...preset(),name:' '},{...preset(),name:'x'.repeat(61)}, {...preset(),controls:[]}, {...preset(),progression:'true'}, {...preset(),controls:{key:{value:'9'}}}, {...preset(),controls:{key:'x'.repeat(121)}}]){
    assert.throws(()=>importPresets(JSON.stringify({version:1,items:[preset('valid'),item]}),existing),/invalid/);
  }
  assert.throws(()=>importPresets(' '.repeat(MAX_PRESET_FILE_BYTES+1),existing),/512 KB/);
  assert.throws(()=>importPresets('é'.repeat(MAX_PRESET_FILE_BYTES/2+1),existing),/512 KB/);
  assert.deepEqual(existing,[preset()]);
  const polluted=JSON.parse('{"version":1,"items":[{"id":"safe","name":"Safe","controls":{"key":"9","__proto__":{"polluted":true},"unknown":"ignore"}}]}');
  const result=importPresets(JSON.stringify(polluted));
  assert.deepEqual(result.items[0].controls,{key:'9'});
  assert.equal({}.polluted,undefined);
});

test('file and merged preset limits fail explicitly rather than dropping setups',()=>{
  assert.throws(()=>exportPresets([]),/Save a practice preset/);
  assert.throws(()=>importPresets(JSON.stringify({version:1,items:[]})),/does not contain/);
  assert.throws(()=>exportPresets(Array.from({length:51},(_,i)=>preset(String(i)))),/50 presets/);
  const existing=Array.from({length:49},(_,i)=>preset(String(i)));
  const file=exportPresets([preset('first'),preset('second')]);
  assert.throws(()=>importPresets(file,existing),/Make room for 2/);
  assert.equal(existing.length,49);
  assert.equal(importPresets(exportPresets([preset('fiftieth')]),existing).items.length,50);
});
