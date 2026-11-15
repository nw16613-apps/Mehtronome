import {materialKind,MATERIAL_KINDS,noteMaterialOptions} from '../practice/material-hierarchy.js';
import {isScaleFingering} from './fingering-types.js';
import {contentMaterial,contentSource,contentSources} from '../practice/exercise-catalogue.js';
import {arpeggioCollection,arpeggioInversion} from './arpeggio-collection.js';
import {exerciseArpeggioHarmony} from './arpeggio-harmony.js';
import {theoryOptions} from './superimposition.js';
import {diagramSvg} from './fretboard.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const select=(id,title,items,value,locked)=>`<label>${title}<select id="${id}" ${locked?'disabled':''}>${items.map(([v,label])=>`<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
export function fretboardCollection(harmony,view){
 harmony=harmony.geometryHarmony||harmony;
 const material=contentMaterial(view),source=contentSource(view),theory=theoryOptions(harmony),choices=source==='pentatonic'?theory.pentatonics:source==='triadPair'?theory.triadPairs:[];
 if(choices.length){const choice=choices.find(c=>c.id===view.source)||choices[0];return {material,source,pcs:choice.pcs,names:choice.names,title:choice.name,choices,choice:choice.id,scale:true,intervals:choice.degrees,rootPc:choice.rootPc??choice.pcs[0]};}
 if(material==='scale')return {material,source,pcs:harmony.scalePcs,names:harmony.scaleNames,title:harmony.scaleNames[0]+' '+harmony.mode.replaceAll('_',' '),choices:[],scale:true,rootPc:harmony.scalePcs[0]};
 const members=arpeggioCollection(harmony,material,materialKind(view)==='chords'?'selectedChord':source),arpeggios=materialKind(view)!=='chords'?members:[];
 const chord=members[0],multiple=arpeggios.length>1;
 const pcs=[...new Set(members.flatMap(h=>h.chordPcs))],names=pcs.map(pc=>members.find(h=>h.chordPcs.includes(pc)).tones[members.find(h=>h.chordPcs.includes(pc)).chordPcs.indexOf(pc)]);
 return {material,source,pcs,names,title:multiple?arpeggios.map(h=>h.name+h.suffix).join(' · '):chord.name+chord.suffix,intervals:chord.intervals,rootPc:chord.chordPcs[0],choices:[],arpeggios,scale:false};
}
export function fretboardStudyControls(harmony,view,locked=false){
 const material=contentMaterial(view),source=contentSource(view),stacks=harmony.scalePcs.length!==7&&['diatonic','chordRoots'].includes(source),sparse=!isScaleFingering(view.fingering),c=fretboardCollection(harmony,view),theory=theoryOptions(harmony);
 const materials=[...noteMaterialOptions(view),...(material==='shape'?[['shape','Fretboard chord shape']]:[])].filter(([id])=>!sparse||id!=='scale').map(([id,label])=>[id,stacks&&id!=='scale'?(id==='triad'?'3-note scale stacks':'4-note scale stacks'):label]);
 const sources=contentSources(material).filter(([id])=>!sparse||materialKind(view)==='arpeggios'&&['selectedChord','diatonic','chordRoots','triadPair'].includes(id)||materialKind(view)==='chords'&&['selectedChord','diatonic'].includes(id)).filter(([id])=>id!=='triadPair'||theory.triadPairs.length).filter(([id])=>id!=='pentatonic'||theory.pentatonics.length).map(([id,label])=>[id,materialKind(view)==='chords'&&id==='diatonic'?'All scale-degree chords':harmony.scalePcs.length!==7?label.replace('All scale-degree arpeggios','All scale-degree stacks').replace('Arpeggios from chord-tone roots','Stacks from chord-tone roots'):label]);
 return select('guitar-material-kind','Material',MATERIAL_KINDS,materialKind(view),locked)+`<span ${materialKind(view)==='scales'?'hidden':''}>`+select('guitar-content-material',materialKind(view)==='chords'?'Chord type':'Arpeggio type',materials.map(([id,name])=>[id,stacks?name:id==='triad'?'Triads':id==='seventh'?(materialKind(view)==='chords'?'Seventh chords':'Sevenths'):name]),material,locked)+`</span>`+select('guitar-content-source',materialKind(view)==='scales'?'Collection':'Source',sources,source,locked)+(c.choices.length?select('guitar-content-collection',source==='triadPair'?'Triad pair':'Pentatonic collection',c.choices.map(c=>[c.id,c.name]),c.choice,locked):'');
}
export function collectionBoard(board,collection){
 return {...board,notes:board.notes.filter(n=>collection.pcs.includes(n.pc)).map(n=>({...n,...(collection.source==='pentatonic'?{scaleIndex:-1,chromaticDegree:collection.arpeggios?.length>1?undefined:collection.intervals?.[collection.pcs.indexOf(n.pc)]}:{}),...(!collection.scale?{root:collection.arpeggios?.length>1?collection.arpeggios.some(h=>h.chordPcs[0]===n.pc):n.pc===collection.rootPc,chord:true,characteristic:false,scaleIndex:collection.arpeggios?.length>1?n.scaleIndex:-1,chromaticDegree:collection.arpeggios?.length>1?n.chromaticDegree:collection.intervals?.[collection.pcs.indexOf(n.pc)],name:collection.names[collection.pcs.indexOf(n.pc)]}:{})}))};
}
export function arpeggioDiagramsMarkup(board,collection,degrees,modeDegrees,highlight=true){
 if(!collection.arpeggios?.length)return diagramSvg(collectionBoard(board,collection),degrees,modeDegrees,collection.title,highlight);
 return `<div class="arpeggio-source-gallery">${collection.arpeggios.map(h=>{
  const member={...collection,arpeggios:[],pcs:h.chordPcs,names:h.tones,intervals:h.intervals,rootPc:h.chordPcs[0],title:h.name+h.suffix},filtered=collectionBoard(board,member),complete=h.chordPcs.every(pc=>filtered.notes.some(n=>n.pc===pc));
  return `<section class="arpeggio-source-shape" data-arpeggio-root="${h.chordPcs[0]}" data-arpeggio-pcs="${h.chordPcs.join(',')}"><h5>${esc(member.title)} · ${esc(arpeggioInversion(filtered,h))}</h5>${complete?'':`<p class="practice-help">${filtered.notes.length?'Partial arpeggio in this shape':'No tones in this shape'}</p>`}${filtered.notes.length?diagramSvg(filtered,degrees,modeDegrees,member.title,highlight):''}</section>`;
 }).join('')}</div>`;
}
export function routePreviewMarkup(shape,collection,degrees,modeDegrees,parents=[],highlight=true){
 if(!shape)return '<p class="exercise-notice">No complete position or route fits these settings. Choose a wider fret range or another string set.</p>';
 const board=collectionBoard(shape.board,collection),diagram=(b,title)=>b.notes.length?arpeggioDiagramsMarkup(b,collection,degrees,modeDegrees,highlight):'<p class="exercise-notice">No notes from this collection occur in this shape.</p>';
 const components=shape.blocks?.map((block,i)=>{const parent=parents.find(p=>p.degree===block.parentId),source=parent||block;return `<article class="position-card neck-component" data-block-index="${i}"><h4>Block ${i+1} · strings ${block.strings.map(s=>6-s).join('–')}</h4><p>${esc(parent?.label||block.label)}</p>${diagram(collectionBoard(source.board,collection),collection.title+' · '+source.label)}</article>`;}).join('');
 return `<article class="position-card neck-selected-shape" data-route-id="${esc(shape.degree)}"><div class="position-heading"><h4>${esc(collection.title)}</h4><span>${esc(shape.label)}</span></div><div class="neck-selected-diagram">${diagram(board,collection.title+' · '+shape.label)}</div></article>${components?`<div class="neck-block-key">${shape.blocks.map((b,i)=>`<span data-block-index="${i}">Block ${i+1} · strings ${b.strings.map(s=>6-s).join('–')} · ${esc(parents.find(p=>p.degree===b.parentId)?.label.split(' · frets')[0]||b.parentId)}</span>`).join('')}</div><details class="neck-route-components"><summary>Source positions</summary><div class="neck-component-grid">${components}</div></details>`:''}`;
}
