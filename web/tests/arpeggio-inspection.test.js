import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt,MODES} from '../src/audio/music.js';import {fretboardFor} from '../src/guitar/fretboard.js';import {fretboardCollection,collectionBoard,inspectedCollection,arpeggioDiagramsMarkup} from '../src/guitar/fretboard-study.js';
test('every triad and seventh can be inspected without changing source membership, fingering or exercise material',()=>{
 for(let key=0;key<12;key++)for(const mode of ['major','dorian','phrygian','lydian','mixolydian','minor','locrian'])for(const material of ['triad','seventh'])for(const source of ['diatonic','chordRoots']){
 const h=harmonyAt({key,mode,chord:MODES[mode].chord}),v={study:'harmonized',material,arpeggioSource:source,fingering:'caged'},whole=fretboardCollection(h,v),original=JSON.stringify(whole.pcs);
 for(const arp of whole.arpeggios){const view={...v,inspectedArpeggio:String(arp.chordPcs[0])},c=fretboardCollection(h,view,true),selected=inspectedCollection(c);assert.deepEqual(selected.pcs,arp.chordPcs);assert.deepEqual(fretboardCollection(h,view).pcs,whole.pcs);assert.equal(c.arpeggios.length,whole.arpeggios.length);
 for(const shape of ['C','A','G','E','D']){const base=fretboardFor(h,shape),b=collectionBoard(base,c);assert.deepEqual(b.notes.map(n=>[n.string,n.fret,n.midi]),base.notes.filter(n=>arp.chordPcs.includes(n.pc)).map(n=>[n.string,n.fret,n.midi]));assert.ok(b.notes.every(n=>n.root===(n.pc===arp.chordPcs[0])&&n.chromaticDegree===arp.intervals[arp.chordPcs.indexOf(n.pc)]));const chord=collectionBoard(base,{...c,degreeReference:'chord'});assert.deepEqual(chord.notes.map(n=>[n.string,n.fret,n.root]),b.notes.map(n=>[n.string,n.fret,n.root]));assert.ok(chord.notes.every(n=>n.chromaticDegree&&!String(n.chromaticDegree).includes('undefined')));}
 }assert.equal(JSON.stringify(whole.pcs),original);
 }
});
test('a dedicated arpeggio retains current-chord reference when its own root differs',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),v={study:'harmonized',material:'seventh',arpeggioSource:'diatonic'},cm=fretboardCollection(h,v).arpeggios.find(a=>a.chordPcs[0]===0),c=fretboardCollection(cm,{...v,study:'positional',arpeggioSource:'selectedChord',degreeReference:'chord'},true,h),b=collectionBoard(fretboardFor(h,'E'),c);assert.ok(b.notes.filter(n=>n.pc===0).every(n=>n.chromaticDegree==='♭3'&&n.root));
});
test('source selection renders accessible member buttons and one enlarged arpeggio with matching inversion',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),c=fretboardCollection(h,{study:'harmonized',material:'seventh',arpeggioSource:'chordRoots',inspectedArpeggio:'0'},true),html=arpeggioDiagramsMarkup(fretboardFor(h,'E'),c,true,MODES.dorian.degrees);assert.equal((html.match(/data-inspect-arpeggio=/g)||[]).length,4);assert.equal((html.match(/class="arpeggio-selected-detail"/g)||[]).length,1);assert.match(html,/data-inspect-arpeggio="0"[^>]*aria-pressed="true"/);assert.doesNotMatch(html,/undefined/);
});
test('triad-pair inspection keeps both source triads available with functional degree references',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),v={study:'triadpairs',material:'triad',arpeggioSource:'triadPair'},source=fretboardCollection(h,v,true);assert.equal(source.arpeggios.length,2);for(const arp of source.arpeggios){const c=fretboardCollection(h,{...v,inspectedArpeggio:String(arp.chordPcs[0])},true),b=collectionBoard(fretboardFor(h,'E'),c);assert.ok(b.notes.every(n=>arp.chordPcs.includes(n.pc)&&n.scaleIndex===-1));assert.ok(b.notes.filter(n=>n.pc===arp.chordPcs[0]).every(n=>n.chromaticDegree==='1'));}
});
test('modal pentatonic references preserve the scale spelling of altered degrees',()=>{
 const h=harmonyAt({key:0,mode:'locrian',chord:MODES.locrian.chord}),v={study:'pentatonic',fingering:'caged',scaleCollection:'pentatonic',source:'pent-modal'},c=fretboardCollection(h,v,true),choice=c.choices.find(p=>p.id==='pent-modal'),b=collectionBoard(fretboardFor(h,'E'),c);for(const note of b.notes)assert.equal(note.chromaticDegree,choice.degrees[choice.pcs.indexOf(note.pc)]);
});
