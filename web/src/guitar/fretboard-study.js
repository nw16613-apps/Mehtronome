import {MODES} from '../audio/music.js';
import {materialKind,MATERIAL_KINDS,noteMaterialOptions} from '../practice/material-hierarchy.js';
import {isScaleFingering} from './fingering-types.js';
import {contentMaterial,contentSource,contentSources} from '../practice/exercise-catalogue.js';
import {arpeggioCollection,arpeggioInversion} from './arpeggio-collection.js';
import {exerciseArpeggioHarmony} from './arpeggio-harmony.js';
import {theoryOptions} from './superimposition.js';
import {diagramSvg} from './fretboard.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const select=(id,title,items,value,locked)=>`<label>${title}<select id="${id}" ${locked?'disabled':''}>${items.map(([v,label])=>`<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
/** @param {*} harmony @param {*} view @param {boolean} presentation @param {*} backingHarmony */
export function fretboardCollection(harmony,view,presentation=false,backingHarmony=null){
 harmony=harmony.geometryHarmony||harmony;
 const backing=backingHarmony||harmony;
 const reference={arpeggios:undefined,degreeReference:view.degreeReference==='chord'?'chord':'collection',backingRootPc:backing.chordPcs[0],backingPcs:backing.chordPcs,backingIntervals:backing.intervals,backingScalePcs:backing.scalePcs,backingScaleDegrees:backing.scalePcs[0]===backing.chordPcs[0]?MODES[backing.mode]?.degrees:null,presentation,inspectedArpeggio:view.inspectedArpeggio};
 const material=contentMaterial(view),source=contentSource(view),theory=theoryOptions(harmony),choices=source==='pentatonic'?theory.pentatonics:source==='triadPair'?theory.triadPairs:[];
 if(choices.length){const choice=choices.find(c=>c.id===view.source)||choices[0];if(source==='triadPair'){const arpeggios=arpeggioCollection(harmony,'triad',source,choice.id);return {...reference,material,source,pcs:choice.pcs,names:choice.names,title:choice.name,choices,choice:choice.id,scale:false,arpeggios,intervals:arpeggios[0].intervals,rootPc:arpeggios[0].chordPcs[0]};}return {...reference,material,source,pcs:choice.pcs,names:choice.names,title:choice.name,choices,choice:choice.id,scale:true,intervals:source==='pentatonic'&&choice.rootPc!==harmony.scalePcs[0]?choice.pcs.map(pc=>chromaticDegrees[(pc-(choice.rootPc??choice.pcs[0])+12)%12]):choice.degrees,rootPc:choice.rootPc??choice.pcs[0]};}
 if(material==='scale')return {...reference,material,source,pcs:harmony.scalePcs,names:harmony.scaleNames,title:harmony.scaleNames[0]+' '+harmony.mode.replaceAll('_',' '),choices:[],scale:true,rootPc:harmony.scalePcs[0]};
 const members=arpeggioCollection(harmony,material,materialKind(view)==='chords'?'selectedChord':source),arpeggios=materialKind(view)!=='chords'?members:[];
 const chord=members[0],multiple=arpeggios.length>1;
 const pcs=[...new Set(members.flatMap(h=>h.chordPcs))],names=pcs.map(pc=>members.find(h=>h.chordPcs.includes(pc)).tones[members.find(h=>h.chordPcs.includes(pc)).chordPcs.indexOf(pc)]);
 return {...reference,material,source,pcs,names,title:multiple?arpeggios.map(h=>h.name+h.suffix).join(' · '):chord.name+chord.suffix,intervals:chord.intervals,rootPc:chord.chordPcs[0],choices:[],arpeggios,scale:false};
}
export function fretboardStudyControls(harmony,view,locked=false){
 const material=contentMaterial(view),source=contentSource(view),stacks=harmony.scalePcs.length!==7&&['diatonic','chordRoots'].includes(source),sparse=!isScaleFingering(view.fingering),c=fretboardCollection(harmony,view),theory=theoryOptions(harmony);
 const materials=[...noteMaterialOptions(view),...(material==='shape'?[['shape','Fretboard chord shape']]:[])].filter(([id])=>!sparse||id!=='scale').map(([id,label])=>[id,stacks&&id!=='scale'?(id==='triad'?'3-note scale stacks':'4-note scale stacks'):label]);
 const sources=contentSources(material).filter(([id])=>!sparse||materialKind(view)==='arpeggios'&&['selectedChord','diatonic','chordRoots','triadPair'].includes(id)||materialKind(view)==='chords'&&['selectedChord','diatonic'].includes(id)).filter(([id])=>id!=='triadPair'||theory.triadPairs.length).filter(([id])=>id!=='pentatonic'||theory.pentatonics.length).map(([id,label])=>[id,materialKind(view)==='chords'&&id==='diatonic'?'All scale-degree chords':harmony.scalePcs.length!==7?label.replace('All scale-degree arpeggios','All scale-degree stacks').replace('Arpeggios from chord-tone roots','Stacks from chord-tone roots'):label]);
 return select('guitar-material-kind','Material',MATERIAL_KINDS,materialKind(view),locked)+`<span ${materialKind(view)==='scales'?'hidden':''}>`+select('guitar-content-material',materialKind(view)==='chords'?'Chord type':'Arpeggio type',materials.map(([id,name])=>[id,stacks?name:id==='triad'?'Triads':id==='seventh'?(materialKind(view)==='chords'?'Seventh chords':'Sevenths'):name]),material,locked)+`</span>`+select('guitar-content-source',materialKind(view)==='scales'?'Collection':'Source',sources,source,locked)+(c.choices.length?select('guitar-content-collection',source==='triadPair'?'Triad pair':'Pentatonic collection',c.choices.map(c=>[c.id,c.name]),c.choice,locked):'');
}
/** Inspection chooses one member for display, without changing the exercise source. */
export function inspectedCollection(collection){
 if(!collection.presentation||!collection.arpeggios?.length)return collection;
 const h=collection.arpeggios.find(h=>String(h.chordPcs[0])===String(collection.inspectedArpeggio))||collection.arpeggios[0];
 return {...collection,pcs:h.chordPcs,names:h.tones,intervals:h.intervals,rootPc:h.chordPcs[0],title:h.name+h.suffix};
}
const chromaticDegrees=['1','♭2','2','♭3','3','4','♯4','5','♭6','6','♭7','7'];
export function collectionBoard(board,collection){
 const c=inspectedCollection(collection),pitched=!c.scale||c.source==='pentatonic';
 return {...board,notes:board.notes.filter(n=>c.pcs.includes(n.pc)).map(n=>{
  const i=c.pcs.indexOf(n.pc),relative=c.degreeReference==='chord'?(c.backingIntervals?.[c.backingPcs?.indexOf(n.pc)]||c.backingScaleDegrees?.[c.backingScalePcs?.indexOf(n.pc)]||chromaticDegrees[(n.pc-c.backingRootPc+12)%12]):c.intervals?.[i];
  return {...n,...(pitched?{scaleIndex:-1,chromaticDegree:relative||n.chromaticDegree||n.name}:{}),
   ...(c.source==='pentatonic'?{collectionStyle:'pentatonic',collectionRoot:n.pc===c.rootPc}:{}),
   ...(!c.scale?{root:n.pc===c.rootPc,chord:true,characteristic:false,name:c.names[i]}:{})};
 })};
}
/** Material map regions follow visible occupied frets, without changing parent geometry. */
export function collectionMapShapes(shapes,collection,range={start:1,end:17}){
 return shapes.map(shape=>{const board=collectionBoard(shape.board,collection);return {...shape,board:{...board,notes:board.notes.filter(n=>n.fret>=range.start&&n.fret<=range.end)}};}).filter(shape=>shape.board.notes.length);
}
export function arpeggioDiagramsMarkup(board,collection,degrees,modeDegrees,highlight=true){
 if(!collection.arpeggios?.length)return diagramSvg(collectionBoard(board,collection),degrees,modeDegrees,collection.title,highlight);
 const selected=inspectedCollection({...collection,presentation:true}),multiple=collection.arpeggios.length>1;
 const members=collection.arpeggios.map(h=>{
  const member={...collection,arpeggios:[],pcs:h.chordPcs,names:h.tones,intervals:h.intervals,rootPc:h.chordPcs[0],title:h.name+h.suffix},filtered=collectionBoard(board,member),active=h.chordPcs[0]===selected.rootPc;
  return {h,member,filtered,active};
 });
 const chosen=members.find(m=>m.active)||members[0];
 if(!collection.presentation)return `<div class="arpeggio-source-gallery">${members.map(({h,member,filtered})=>`<section class="arpeggio-source-shape" data-arpeggio-root="${h.chordPcs[0]}" data-arpeggio-pcs="${h.chordPcs.join(',')}"><h5>${esc(member.title)} · ${esc(arpeggioInversion(filtered,h))}</h5>${diagramSvg(filtered,degrees,modeDegrees,member.title,highlight)}</section>`).join('')}</div>`;
 return `${multiple?`<div class="arpeggio-inspection-row" role="group" aria-label="Arpeggios in this position">${members.map(({h,member,filtered,active})=>`<button type="button" class="position-thumbnail arpeggio-source-shape${active?' current':''}" data-inspect-arpeggio="${h.chordPcs[0]}" data-arpeggio-pcs="${h.chordPcs.join(',')}" aria-pressed="${active}"><span>${esc(member.title)}</span><small>${esc(arpeggioInversion(filtered,h))}</small>${diagramSvg(filtered,degrees,modeDegrees,member.title,highlight)}</button>`).join('')}</div>`:''}<section class="arpeggio-selected-detail" data-arpeggio-root="${chosen.h.chordPcs[0]}" data-arpeggio-pcs="${chosen.h.chordPcs.join(',')}"><h5>${esc(chosen.member.title)} · ${esc(arpeggioInversion(chosen.filtered,chosen.h))}</h5>${chosen.filtered.notes.length&&!chosen.h.chordPcs.every(pc=>chosen.filtered.notes.some(n=>n.pc===pc))?'<p class="practice-help">Partial arpeggio in this position</p>':''}${chosen.filtered.notes.length?diagramSvg(chosen.filtered,degrees,modeDegrees,chosen.member.title,highlight):'<p>No tones from this arpeggio occur in this position.</p>'}</section>`;
}
export function routePreviewMarkup(shape,collection,degrees,modeDegrees,parents=[],highlight=true){
 if(!shape)return '<p class="exercise-notice">No complete position or route fits these settings. Choose a wider fret range or another string set.</p>';
 const board=shape.board,diagram=(b,title)=>b.notes.length?arpeggioDiagramsMarkup(b,collection,degrees,modeDegrees,highlight):'<p class="exercise-notice">No notes from this collection occur in this shape.</p>';
 const components=shape.blocks?.map((block,i)=>{const parent=parents.find(p=>p.degree===block.parentId),source=parent||block;return `<article class="position-card neck-component" data-block-index="${i}"><h4>Block ${i+1} · strings ${block.strings.map(s=>6-s).join('–')}</h4><p>${esc(parent?.label||block.label)}</p>${diagramSvg(collectionBoard(source.board,collection),degrees,modeDegrees,collection.title+' · '+source.label,highlight)}</article>`;}).join('');
 return `<article class="position-card neck-selected-shape" data-route-id="${esc(shape.degree)}"><div class="position-heading"><h4>${esc(collection.title)}</h4><span>${esc(shape.label)}</span></div><div class="neck-selected-diagram">${diagram(board,collection.title+' · '+shape.label)}</div></article>${components?`<div class="neck-block-key">${shape.blocks.map((b,i)=>`<span data-block-index="${i}">Block ${i+1} · strings ${b.strings.map(s=>6-s).join('–')} · ${esc(parents.find(p=>p.degree===b.parentId)?.label.split(' · frets')[0]||b.parentId)}</span>`).join('')}</div><details class="neck-route-components"><summary>Source positions</summary><div class="neck-component-grid">${components}</div></details>`:''}`;
}
