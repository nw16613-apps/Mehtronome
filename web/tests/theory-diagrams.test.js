import {test} from 'node:test';
import assert from 'node:assert/strict';
import {diagramSvg,fretboardFor,POSITIONS} from '../src/guitar/fretboard.js';
import {recommendedGrip} from '../src/guitar/grips.js';
import {harmonyAt,MODES} from '../src/audio/music.js';

function renderedNotes(svg) {
  const pattern=/<g class="fret-note ([^"]+)" data-string="(\d+)" data-fret="(\d+)" data-pc="(\d+)"([^>]*)><title>.*?<\/title><circle cx="([^"]+)" cy="([^"]+)" r="10"/g;
  return Array.from(svg.matchAll(pattern),match=>({
    classes:match[1].split(' '),string:Number(match[2]),fret:Number(match[3]),pc:Number(match[4]),
    group:/data-theory-group="([^"]+)"/.exec(match[5])?.[1],x:match[6],y:match[7],
  }));
}
const geometry=notes=>notes.map(({string,fret,pc,x,y})=>({string,fret,pc,x,y}));

test('pentatonic overlays highlight existing positions without moving or replacing their scale notes',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++)for(const {shape} of POSITIONS){
    const harmony=harmonyAt({key,mode,chord:definition.chord});
    const board=fretboardFor(harmony,shape),snapshot=structuredClone(board);
    const theory={kind:'pentatonic',name:'Five-note practice selection',pcs:harmony.scalePcs.slice(0,5)};
    const plain=diagramSvg(board,true,definition.degrees,'Position');
    const svg=diagramSvg(board,true,definition.degrees,'Position',false,null,theory);
    const notes=renderedNotes(svg);
    assert.deepEqual(geometry(notes),geometry(renderedNotes(plain)),`${key} ${mode} ${shape}`);
    assert.equal(notes.length,board.notes.length);
    assert.ok(notes.some(note=>note.classes.includes('theory-note')));
    for(const note of notes){
      assert.equal(note.classes.includes('theory-note'),theory.pcs.includes(note.pc));
      assert.equal(note.group,theory.pcs.includes(note.pc)?'pentatonic':undefined);
      assert.equal(note.classes.includes('root'),note.pc===board.rootPc);
      assert.equal(note.classes.includes('chord'),!note.classes.includes('root')&&harmony.chordPcs.includes(note.pc));
    }
    assert.match(svg,/class="fretboard theory-active theory-pentatonic"/);
    assert.match(svg,/pentatonic overlay: Five-note practice selection/);
    assert.deepEqual(board,snapshot);
  }
});

test('pentatonic roots receive their own ring without replacing the modal root',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'}),board=fretboardFor(harmony,'E');
  const theory={kind:'pentatonic',name:'B minor pentatonic',rootPc:11,pcs:[11,2,4,6,9]};
  const svg=diagramSvg(board,true,MODES.dorian.degrees,'A Dorian',false,null,theory);
  const pentatonicRoots=renderedNotes(svg).filter(note=>note.pc===theory.rootPc);
  const modalRoots=renderedNotes(svg).filter(note=>note.pc===harmony.scalePcs[0]);
  assert.ok(pentatonicRoots.length>0);
  assert.ok(modalRoots.length>0);
  assert.ok(pentatonicRoots.every(note=>note.classes.includes('pentatonic-root')));
  assert.ok(modalRoots.every(note=>note.classes.includes('root')));
  assert.ok(!svg.includes('pentatonic-root-ring'));
  assert.match(svg,/pentatonic root/);
});

test('triad pairs have distinct A/B badges, solid/dashed rings and descriptive note tooltips',()=>{
  const harmony=harmonyAt({key:0,mode:'lydian',chord:'maj7sharp11'});
  const theory={kind:'triads',name:'C major + D major',pcs:[0,4,7,2,6,9],groups:[
    {name:'C major',rootPc:0,pcs:[0,4,7]}, {name:'D major',rootPc:2,pcs:[2,6,9]},
  ]};
  for(const {shape} of POSITIONS){
    const board=fretboardFor(harmony,shape);
    const svg=diagramSvg(board,false,MODES.lydian.degrees,'C Lydian',false,null,theory);
    const notes=renderedNotes(svg),selected=notes.filter(note=>note.classes.includes('theory-note'));
    assert.deepEqual(geometry(notes),geometry(renderedNotes(diagramSvg(board,false,MODES.lydian.degrees,'C Lydian'))));
    assert.equal((svg.match(/class="theory-badge"/g)||[]).length,selected.length);
    assert.equal((svg.match(/class="theory-ring"/g)||[]).length,selected.length);
    for(const note of selected){
      const group=theory.groups[0].pcs.includes(note.pc)?'a':'b';
      assert.equal(note.group,group);
      assert.ok(note.classes.includes('theory-'+group));
    }
    assert.ok(notes.some(note=>note.classes.includes('theory-a')));
    assert.ok(notes.some(note=>note.classes.includes('theory-b')));
    assert.match(svg,/triad A: C major/);
    assert.match(svg,/triad B: D major/);
    assert.match(svg,/text-anchor="middle">A<\/text>/);
    assert.match(svg,/text-anchor="middle">B<\/text>/);
    assert.equal((svg.match(/stroke-dasharray="3 2"/g)||[]).length,selected.filter(note=>note.group==='b').length);
  }
});

test('theory overlays replace conflicting chord-finger and modal-colour annotations and escape labels',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'}),board=fretboardFor(harmony,'A');
  const grip=recommendedGrip(harmony,board);
  const theory={kind:'triads',name:'C major & D major <pair>',pcs:[0,4,7,2,6,9],groups:[
    {name:'C major & first',pcs:[0,4,7]},{name:'D major <second>',pcs:[2,6,9]},
  ]};
  const svg=diagramSvg(board,true,MODES.dorian.degrees,'A "Dorian"',true,grip,theory);
  assert.ok(!svg.includes('grip-active'));
  for(const className of ['grip-ring','grip-finger','grip-mute','characteristic-ring'])assert.ok(!svg.includes(`class="${className}"`));
  assert.match(svg,/C major &amp; D major &lt;pair&gt;/);
  assert.match(svg,/A &quot;Dorian&quot;/);
  assert.match(svg,/C major &amp; first/);
  assert.match(svg,/D major &lt;second&gt;/);
  assert.equal(diagramSvg(board,true,MODES.dorian.degrees,'A Dorian',true,grip),diagramSvg(board,true,MODES.dorian.degrees,'A Dorian',true,grip,null));
  const legacy=diagramSvg(board,true,MODES.dorian.degrees,'A Dorian',true,grip);
  assert.match(legacy,/grip-active/);
  assert.match(legacy,/characteristic-ring/);
  assert.ok(!legacy.includes('theory-'));
});
