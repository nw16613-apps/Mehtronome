import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,MODAL_PROGRESSIONS,harmonyAt,characteristicNotes} from '../src/audio/music.js';
import {theoryOptions,PENTATONIC_FORMS,TRIAD_FORMS} from '../src/guitar/superimposition.js';

function namedPc(name){
  const naturals={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  let pc=naturals[name[0]];
  for(const symbol of name.slice(1))pc+=symbol==='♯'?1:symbol==='♭'?-1:0;
  return (pc+24)%12;
}
function checkOption(option,info,count){
  assert.equal(option.pcs.length,count);
  assert.equal(new Set(option.pcs).size,count);
  assert.ok(option.pcs.every(pc=>info.scalePcs.includes(pc)));
  assert.deepEqual(option.names,option.pcs.map(pc=>info.scaleNames[info.scalePcs.indexOf(pc)]));
  assert.deepEqual(option.degrees,option.pcs.map(pc=>MODES[info.mode].degrees[info.scalePcs.indexOf(pc)]));
  assert.deepEqual(option.names.map(namedPc),option.pcs);
  assert.ok(option.id && option.name && option.explanation);
}

test('pentatonics and disjoint true triad pairs fit all supported scales in all twelve keys',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++){
    const info=harmonyAt({key,mode,chord:definition.chord}),before=JSON.stringify(info);
    const options=theoryOptions(info);
    assert.equal(JSON.stringify(info),before);
    for(const [category,choices] of Object.entries(options)){
      assert.ok((choices.length>=1||category==='triadPairs'&&info.scalePcs.length<=6)&&(category==='pentatonics'||choices.length<=3),mode);
      assert.equal(new Set(choices.map(c=>[...c.pcs].sort((a,b)=>a-b).join(','))).size,choices.length);
    }
    for(const pent of options.pentatonics){
      checkOption(pent,info,5);
      assert.ok(['parent-minor','modal'].includes(pent.category));
      if(pent.category==='parent-minor')assert.equal(pent.type,'minor');
      else {
        assert.equal(pent.type,'modal');
        assert.ok(pent.pcs.includes(info.scalePcs[0]));
        for(const note of characteristicNotes(info))assert.ok(pent.pcs.includes(note.pc));
      }
      assert.deepEqual(pent.pcs,pent.intervals.map(interval=>(pent.rootPc+interval)%12));
    }
    for(const pair of options.triadPairs){
      checkOption(pair,info,6);
      assert.equal(pair.groups.length,2);
      assert.deepEqual(pair.pcs,pair.groups.flatMap(group=>group.pcs));
      assert.ok(pair.groups[0].pcs.every(pc=>!pair.groups[1].pcs.includes(pc)));
      assert.match(pair.explanation,/melodic arpeggios/);
      for(const triad of pair.groups){
        assert.deepEqual(triad.intervals,TRIAD_FORMS[triad.quality]);
        assert.deepEqual(triad.pcs,triad.intervals.map(interval=>(triad.rootPc+interval)%12));
        assert.deepEqual(triad.names.map(namedPc),triad.pcs);
        const letters=['C','D','E','F','G','A','B'],root=letters.indexOf(triad.names[0][0]);
        assert.deepEqual(triad.names.map(name=>name[0]),[0,2,4].map(skip=>letters[(root+skip)%7]));
      }
    }
    const colour=characteristicNotes(info).map(note=>note.pc);
    assert.ok(options.pentatonics.at(-1).pcs.some(pc=>colour.includes(pc)),`${mode} modal pentatonic should reveal its character`);
    if(options.triadPairs.length)assert.ok(options.triadPairs[0].pcs.some(pc=>colour.includes(pc)),`${mode} primary triad pair should reveal its character`);
  }
});

test('Dorian and Lydian expose every parent-scale minor pentatonic plus a modal pentatonic',()=>{
  const dorian=theoryOptions(harmonyAt({key:9,mode:'dorian',chord:'min13'}));
  assert.deepEqual(dorian.pentatonics.map(option=>option.name),['A minor pentatonic','B minor pentatonic','E minor pentatonic','A Dorian modal pentatonic']);
  assert.deepEqual(dorian.pentatonics[1].names,['B','D','E','F♯','A']);
  assert.deepEqual(dorian.pentatonics[1].degrees,['2','4','5','6','1']);
  assert.match(dorian.pentatonics.at(-1).explanation,/F♯ \(6\)/);
  assert.equal(dorian.triadPairs[0].name,'C major + D major');
  assert.deepEqual(dorian.triadPairs[0].groups.map(group=>group.names),[['C','E','G'],['D','F♯','A']]);
  const lydian=theoryOptions(harmonyAt({key:0,mode:'lydian',chord:'maj7sharp11'}));
  assert.deepEqual(lydian.pentatonics.map(option=>option.name),['E minor pentatonic','A minor pentatonic','B minor pentatonic','C Lydian modal pentatonic']);
  assert.deepEqual(lydian.pentatonics.at(-1).degrees,['1','3','♯4','5','7']);
  assert.equal(lydian.triadPairs[0].name,'C major + D major');
});

test('harmonic-minor modes report no unavailable minor pentatonics and include a modal pentatonic',()=>{
  for(const [mode,definition]of Object.entries(MODES)){
    if(definition.family!=='Harmonic minor')continue;
    const info=harmonyAt({key:0,mode,chord:definition.chord}),choices=theoryOptions(info).pentatonics;
    assert.equal(choices.filter(choice=>choice.type==='minor').length,0);
    const selected=choices.find(choice=>choice.type==='modal');assert.ok(selected);
    for(const note of characteristicNotes(info))assert.ok(selected.pcs.includes(note.pc),`${mode} selection retains ${note.degree}`);
    assert.ok(selected.pcs.includes(info.scalePcs[0]));
  }
  const harmonic=theoryOptions(harmonyAt({key:0,mode:'harmonic_minor',chord:'minMaj7'}));
  assert.equal(harmonic.pentatonics[0].name,'C Harmonic minor modal pentatonic');
});

test('modal superimpositions stay tonic-relative across every modal progression',()=>{
  for(const [template,definition]of Object.entries(MODAL_PROGRESSIONS))for(const key of [0,6,9]){
    const settings={key,mode:definition.mode,progression:true,template};
    const expected=theoryOptions(harmonyAt(settings));
    for(let step=1;step<definition.steps.length;step++)assert.deepEqual(theoryOptions(harmonyAt(settings,step)),expected,`${template}/${key}/${step}`);
  }
});

test('recommendation identity and pitch relationships transpose without changing choice order',()=>{
  for(const [mode,definition]of Object.entries(MODES)){
    const reference=theoryOptions(harmonyAt({key:0,mode,chord:definition.chord}));
    for(let key=1;key<12;key++){
      const transposed=theoryOptions(harmonyAt({key,mode,chord:definition.chord}));
      for(const category of ['pentatonics','triadPairs']){
        assert.deepEqual(transposed[category].map(option=>option.id),reference[category].map(option=>option.id));
        for(let i=0;i<reference[category].length;i++){
          assert.deepEqual(transposed[category][i].pcs,reference[category][i].pcs.map(pc=>(pc+key)%12));
          assert.deepEqual(transposed[category][i].degrees,reference[category][i].degrees);
        }
      }
    }
  }
});
