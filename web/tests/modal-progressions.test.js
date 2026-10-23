import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,CHORDS,MODAL_PROGRESSIONS,PROGRESSIONS,harmonyAt,modeNotes,characteristicNotes,progressionDurations,progressionOrder,progressionStep} from '../src/audio/music.js';
import {fretboardFor,parentMajorFor,POSITIONS} from '../src/guitar/fretboard.js';

function pitchClass(name){
  const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[name[0]];
  const shift=Array.from(name.slice(1)).reduce((sum,accidental)=>sum+(accidental==='♯'?1:accidental==='♭'?-1:0),0);
  return (natural+shift+24)%12;
}

test('every mode has a fixed modal template whose chords and spellings share its tonic scale in all keys',()=>{
  assert.deepEqual(Object.keys(MODAL_PROGRESSIONS).sort(),Object.keys(MODES).map(mode=>`modal_${mode}`).sort());
  for(const [template,definition] of Object.entries(MODAL_PROGRESSIONS)){
    assert.equal(PROGRESSIONS[template],definition);
    assert.ok(definition.explanation.length>40);
    assert.equal(definition.kind,'modal');
    assert.equal(definition.steps.length,definition.roman.length);
    assert.equal(definition.steps[0].root,0);
    const tonic=CHORDS[definition.steps[0].chord],suggested=CHORDS[MODES[definition.mode].chord];
    assert.ok(suggested.intervals.every(interval=>tonic.intervals.some(note=>note%12===interval%12)),`${template} retains its suggested tonic colour`);
    assert.ok(definition.steps.some(step=>step.root!==0),`${template} must move away from the tonic`);
    for(let key=0;key<12;key++){
      const settings={key,progression:true,template,mode:'altered',chord:'fifth'};
      const scaleNames=modeNotes(key,definition.mode),scalePcs=MODES[definition.mode].intervals.map(n=>(key+n)%12);
      const colour=characteristicNotes(harmonyAt(settings,0));
      for(let step=0;step<definition.steps.length;step++){
        const entry=definition.steps[step],harmony=harmonyAt(settings,step);
        assert.equal(entry.mode,definition.mode);
        assert.equal(harmony.mode,definition.mode);
        assert.deepEqual(harmony.scaleNames,scaleNames);
        assert.deepEqual(harmony.scalePcs,scalePcs);
        assert.equal(harmony.name,scaleNames[entry.letter]);
        assert.deepEqual(harmony.midi,CHORDS[entry.chord].intervals.map(n=>48+(key+entry.root)%12+n));
        assert.ok(harmony.chordPcs.every(pc=>scalePcs.includes(pc)),`${template}, key ${key}, chord ${step}`);
        assert.deepEqual(harmony.tones.map(pitchClass),harmony.chordPcs);
        assert.deepEqual(characteristicNotes(harmony),colour,'modal colour notes must stay relative to the tonic');
      }
    }
  }
});

test('modal vamps expose their defining colour with conventional chord qualities and scale-aware names',()=>{
  const names=(template,key=0)=>PROGRESSIONS[template].steps.map((_,step)=>{
    const harmony=harmonyAt({key,template,progression:true},step);
    return harmony.name+harmony.suffix;
  });
  assert.deepEqual(names('modal_dorian',9),['Am13','D13']);
  assert.deepEqual(names('modal_phrygian',4),['Em11♭9','Fmaj9']);
  assert.deepEqual(names('modal_lydian'),['Cmaj9♯11','D13']);
  assert.deepEqual(names('modal_minor'),['Cm11♭13','A♭maj9','B♭13','Cm11♭13']);
  assert.deepEqual(names('modal_altered'),['C7alt','G♭9♯11']);
  assert.deepEqual(names('modal_harmonic_minor'),['Cm(maj9)','Fm9','G7♭9','Cm(maj9)']);
  assert.deepEqual(names('modal_dorian_sharp4'),['Cm13♯11','F♯dim7']);
  assert.deepEqual(names('modal_lydian_sharp2',11),['Bmaj7♯9♯11','C♯♯dim7']);
  assert.deepEqual(names('modal_ultralocrian'),['Cdim7','D♭m(maj7)']);
  assert.deepEqual(PROGRESSIONS.modal_locrian_natural2.roman,['iø9','iiø7']);
  assert.deepEqual(harmonyAt({key:0,template:'modal_altered',progression:true},1).tones,['G♭','B♭','D♭','F♭','A♭','C']);
});

test('modal chord changes retain their parent-major CAGED positions and move only the highlighted chord root',()=>{
  for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian'])for(const key of [0,5,9]){
    const settings={key,template:`modal_${mode}`,mode,progression:true};
    const first=harmonyAt(settings,0),parent=parentMajorFor(first);
    for(let step=1;step<PROGRESSIONS[settings.template].steps.length;step++){
      const harmony=harmonyAt(settings,step);
      assert.deepEqual(parentMajorFor(harmony),parent);
      for(const position of POSITIONS){
        const original=fretboardFor(first,position.shape),current=fretboardFor(harmony,position.shape);
        const coordinates=board=>board.notes.map(note=>[note.string,note.fret,note.pc]);
        assert.deepEqual(coordinates(current),coordinates(original));
        assert.ok(current.notes.filter(note=>note.root).every(note=>note.pc===harmony.midi[0]%12));
      }
    }
  }
});

test('modal durations and wraparound chord loops retain the original bar lengths',()=>{
  const settings={template:'modal_harmonic_minor'};
  assert.deepEqual(progressionDurations(settings),[2,1,1,2]);
  assert.deepEqual(Array.from({length:12},(_,bar)=>progressionStep(settings,bar)),[0,0,1,2,3,3,0,0,1,2,3,3]);
  const loop={...settings,loopEnabled:true,loopStart:3,loopEnd:1};
  assert.deepEqual(progressionOrder(loop),[3,0,1]);
  assert.deepEqual(Array.from({length:10},(_,bar)=>progressionStep(loop,bar)),[3,3,0,0,1,3,3,0,0,1]);
  for(const template of Object.keys(MODAL_PROGRESSIONS)){
    const durations=progressionDurations({template});
    assert.ok(durations.every(duration=>Number.isInteger(duration)&&duration>0));
    assert.equal(progressionStep({template},durations.reduce((sum,duration)=>sum+duration,0)),0);
  }
});
