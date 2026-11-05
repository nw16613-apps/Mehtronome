import {cardStartChoices,cardStartLabel} from './pattern-start-route.js';
import {organizeExercisePanel} from './exercise-layout.js';
import {positionRouteCards} from './position-route.js';
import {FRET_REGIONS} from '../guitar/position-path.js';
import {diagramSvg} from '../guitar/fretboard.js';
import {MODES} from '../audio/music.js';
import {exerciseGuidance} from './exercise-options.js';
import {recommendedGrip} from '../guitar/grips.js';
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function learningView(panel:HTMLElement,context:any){
 const {board,info,position,groups,notes,study,fretboard}=context;
 const grip=recommendedGrip(info,board);
 const toolbar=document.createElement('div');toolbar.className='exercise-learning-toolbar';toolbar.innerHTML=`<label>${context.progression?'Selected chord position':'Position'}<select id="exercise-position">${['I','II','III','IV','V'].map(n=>`<option ${n===position.numeral?'selected':''}>${n}</option>`).join('')}</select></label>`;
 const oldStudy=panel.querySelector('#exercise-study')?.closest('label');if(oldStudy)toolbar.prepend(oldStudy);
 const focusButton=panel.querySelector('#exercise-focus');if(focusButton)toolbar.append(focusButton);const previewButton=panel.querySelector('#exercise-preview');if(previewButton)toolbar.append(previewButton);
 panel.querySelector('.exercise-heading')!.after(toolbar);
 const details=document.createElement('details');details.className='exercise-lesson';details.innerHTML=`<summary>About this exercise</summary><p>${esc(exerciseGuidance(study))}</p>`;toolbar.after(details);
 if(context.progressionBacking)for(const id of ['exercise-auto-tempo','exercise-auto-every','exercise-auto-increment']){const control=panel.querySelector<HTMLInputElement>('#'+id);if(control)control.disabled=true;}
 if(context.progression&&context.navigation==='path'){const positionControl=toolbar.querySelector<HTMLSelectElement>('#exercise-position')!;positionControl.disabled=true;positionControl.parentElement!.firstChild!.textContent='CAGED position ';}
 const warnings=[...new Set<string>(context.timingWarnings||[])];
 if(!notes.length)warnings.unshift('No complete study fits this position. Choose another position or exercise.');
 if(warnings.length){const notice=document.createElement('p');notice.className='exercise-notice practice-help';notice.setAttribute('role','status');notice.textContent=warnings.join(' ');panel.querySelector('.exercise-controls')!.after(notice);}
 const notation=panel.querySelector('.notation-scroll')!,material=document.createElement('div');material.className='exercise-material-layout';notation.before(material);
 const diagram=document.createElement('section');diagram.className='exercise-linked-fretboard';diagram.innerHTML=`<div class="exercise-map-heading"><strong>Position ${esc(position.numeral)} · ${esc(position.shape)} framework</strong><button type="button" class="practice-button" id="exercise-map-toggle" aria-expanded="${fretboard}">${fretboard?'Hide':'Show'} diagram</button></div><div id="exercise-map-body" ${!fretboard?'hidden':''}><div class="exercise-map-diagram"></div></div>`;
 if(context.progression){
  const route=document.createElement('div');route.className='position-path-guide exercise-position-route';route.innerHTML=`<div class="position-path-heading"><div class="position-path-controls"><label>Position navigation<select id="exercise-position-navigation"><option value="all" ${context.navigation!=='path'?'selected':''}>Choose positions yourself</option><option value="path" ${context.navigation==='path'?'selected':''}>Automatic route</option></select></label>${context.navigation==='path'?`<label>Fretboard region<select id="exercise-position-region">${Object.entries(FRET_REGIONS).map(([id,region])=>`<option value="${id}" ${id===context.region?'selected':''}>${esc(region.name)}</option>`).join('')}</select></label>`:''}</div><p>${context.navigation==='path'?'The region sets the opening position; later chords follow nearby shapes.':'Choose a chord card, then its position · other chords stay unchanged'}</p></div><div class="position-path" aria-label="Choose progression chord">${positionRouteCards(groups.filter((g:any)=>!g.resolution),context.progressionSteps,context.inspectedStep)}</div>`;
  const positionLabel=toolbar.querySelector('#exercise-position')!.closest('label')!;positionLabel.hidden=context.navigation==='path';route.querySelector('.position-path-controls')!.append(positionLabel);
  if(['positional','positionalscale'].includes(study))route.querySelector('.position-path-controls')!.insertAdjacentHTML('beforeend','<label>Start for this card<select id="exercise-card-start"></select></label>');
  diagram.querySelector('.exercise-map-heading')!.after(route);
 }else{
  const controls=document.createElement('div');controls.className='position-path-controls exercise-diagram-position';
  const positionLabel=toolbar.querySelector('#exercise-position')!.closest('label')!;positionLabel.firstChild!.textContent='CAGED position ';controls.append(positionLabel);diagram.querySelector('.exercise-map-heading')!.after(controls);
 }
 const navigation=document.createElement('section');navigation.className='exercise-navigation';navigation.setAttribute('aria-label','Exercise chord and position navigation');
 for(const selector of ['.exercise-position-route','.exercise-diagram-position']){const control=diagram.querySelector(selector);if(control)navigation.append(control);}
 if(study==='positional'){const span=document.createElement('p');span.id='exercise-span-status';span.className='exercise-span-status';span.hidden=true;diagram.querySelector('#exercise-map-body')!.append(span);}
 const toggle=diagram.querySelector('#exercise-map-toggle')!;
 const controls=navigation.querySelector('.position-path-controls')!;controls.append(toggle);
 diagram.hidden=!fretboard;
 material.before(navigation);
 const augmented={...board,notes:[...board.notes]};for(const note of notes)if(!augmented.notes.some((n:any)=>n.string===note.string&&n.fret===note.fret))augmented.notes.push({...note,root:note.pc===info.chordPcs[0],chord:info.chordPcs.includes(note.pc),scaleIndex:info.scalePcs.indexOf(note.pc),chromaticDegree:note.chromaticDegree||['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'][(note.pc-info.scalePcs[0]+12)%12]});
 if(study==='grip'||study==='positional')augmented.notes=augmented.notes.map((n:any)=>{const i=info.chordPcs.indexOf(n.pc);return i<0?n:{...n,scaleIndex:-1,chromaticDegree:info.intervals[i]};});
 diagram.querySelector('.exercise-map-diagram')!.innerHTML=diagramSvg(augmented,true,MODES[info.mode as keyof typeof MODES].degrees,'Exercise fretboard',true,grip);
 diagram.querySelector('svg')!.setAttribute('role','group');
 const targets=new Set(groups.flatMap((g:any)=>(g.targetIndices|| (g.targetIndex===undefined?[]:[g.targetIndex])).map((i:number)=>`${g.notes[i]?.string}:${g.notes[i]?.fret}`)));
 diagram.querySelectorAll<SVGGElement>('.fret-note').forEach(el=>{const string=Number(el.dataset.string),fret=Number(el.dataset.fret),noteIndex=notes.findIndex((n:any)=>n.string===string&&n.fret===fret);el.classList.toggle('exercise-target',targets.has(`${string}:${fret}`));if(noteIndex<0)return;el.dataset.exerciseIndex=String(noteIndex);el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',`${notes[noteIndex].name}, string ${6-string}, fret ${fret}`);const circle=el.querySelector('circle')!;const square=document.createElementNS('http://www.w3.org/2000/svg','rect');square.setAttribute('x',String(Number(circle.getAttribute('cx'))-15));square.setAttribute('y',String(Number(circle.getAttribute('cy'))-15));square.setAttribute('width','30');square.setAttribute('height','30');square.setAttribute('rx','2');square.setAttribute('class','exercise-current-box');el.append(square);});
 const score=document.createElement('div');score.className='exercise-score';score.append(notation);material.append(diagram,score);material.classList.toggle('map-hidden',!fretboard);
 const exerciseControls=panel.querySelector('.exercise-controls');if(exerciseControls)toolbar.after(exerciseControls);
 const setup=document.createElement('details');setup.className='exercise-setup';setup.open=!!context.setupOpen;setup.innerHTML='<summary>Tempo, playback and display settings</summary>';for(const selector of ['.exercise-practice-bar']){const el=panel.querySelector(selector);if(el)setup.append(el);}material.after(setup);
 const ceiling=document.createElement('label');ceiling.textContent='Tempo ceiling ';ceiling.innerHTML+=`<input id="exercise-auto-target" type="number" min="30" max="240" value="${context.ceiling}"> BPM · self-set, not an accuracy score`;setup.append(ceiling);
 organizeExercisePanel(panel,context.guitarVolume);
}
export function highlightLearningNote(index:number|null,notes:any[],markNotation=false){
 document.querySelectorAll<HTMLElement>('.voice-leading-target[data-exercise-index]').forEach(el=>el.classList.toggle('target-active',Number(el.dataset.exerciseIndex)===index));
 document.querySelectorAll('.exercise-note.target-preview').forEach(el=>el.classList.remove('target-preview'));
 if(markNotation&&index!==null)document.querySelectorAll(`.exercise-note[data-note-index="${index}"]`).forEach(el=>el.classList.add('target-preview'));
 const selected=index===null?null:notes[index];document.querySelectorAll<SVGGElement>('.exercise-linked-fretboard .fret-note').forEach(el=>el.classList.toggle('exercise-current',!!selected&&Number(el.dataset.string)===selected.string&&Number(el.dataset.fret)===selected.fret));
}

/** Update only the linked diagram at a chord boundary; retain notation,
 * selection, focus and the hide/reveal state. */
export function updateProgressionMap(panel:HTMLElement,group:any,study:string){
 const localStart=panel.querySelector<HTMLSelectElement>('#exercise-card-start');
 if(localStart)localStart.disabled=!!group.resolution;
 if(localStart&&!group.resolution){
  const value=group.startOverride||'inherit',choices=cardStartChoices(group.harmony);
  localStart.innerHTML=`<option value="inherit">Use global default</option><option value="default">Shape default</option>${choices.map((c:any)=>`<option value="${esc(c.value)}">${esc(c.label)}</option>`).join('')}${!['inherit','default',...choices.map((c:any)=>c.value)].includes(value)?`<option value="${esc(value)}">${esc(cardStartLabel(group.harmony,value))} · unavailable; using shape default</option>`:''}`;
  localStart.value=value;
 }
 const {board,harmony,position,notes}=group,diagram=panel.querySelector<HTMLElement>('.exercise-map-diagram');if(!diagram)return;
 const augmented={...board,notes:[...board.notes]};
 for(const note of notes)if(!augmented.notes.some((n:any)=>n.string===note.string&&n.fret===note.fret))augmented.notes.push({...note,root:note.pc===harmony.chordPcs[0],chord:harmony.chordPcs.includes(note.pc),scaleIndex:harmony.scalePcs.indexOf(note.pc),chromaticDegree:note.chromaticDegree});
 if(['grip','positional'].includes(study))augmented.notes=augmented.notes.map((n:any)=>{const index=harmony.chordPcs.indexOf(n.pc);return index<0?n:{...n,scaleIndex:-1,chromaticDegree:harmony.intervals[index]};});
 const grip=recommendedGrip(harmony,board);
 diagram.innerHTML=diagramSvg(augmented,true,MODES[harmony.mode as keyof typeof MODES].degrees,`${group.chord} · ${group.annotation}`,true,grip);
 diagram.querySelector('svg')?.setAttribute('role','group');
 const span=group.positionalSpan as any[]|undefined,spanPitches=new Set(span?.map((n:any)=>n.midi)||[]);
 const spanStatus=panel.querySelector<HTMLElement>('#exercise-span-status');if(spanStatus)spanStatus.title='Faded chord-tone markers lie outside the selected exercise span.';
 if(spanStatus){spanStatus.hidden=!span?.length;if(span?.length){const pitch=(n:any)=>n.name+(Math.floor(n.midi/12)-1),beats=(span.length-1)/group.phraseDivision;spanStatus.textContent=`${span.length}-note span · ${pitch(span[0])}–${pitch(span.at(-1))} · ${Number.isInteger(beats)?beats+' beats':(span.length-1)+' notes'} each way${span.length<(group.phraseSpanSize||9)?' · fewer than nine pitches available':''}`;}}
 diagram.querySelectorAll<SVGGElement>('.fret-note').forEach(el=>{const note=board.notes.find((n:any)=>n.string===Number(el.dataset.string)&&n.fret===Number(el.dataset.fret));el.classList.toggle('exercise-outside-span',!!span&&!!note&&harmony.chordPcs.includes(note.pc)&&!spanPitches.has(note.midi));});
 const targets=new Set((group.targetIndices||[]).map((i:number)=>`${notes[i]?.string}:${notes[i]?.fret}`));
 diagram.querySelectorAll<SVGGElement>('.fret-note').forEach(el=>{
  const string=Number(el.dataset.string),fret=Number(el.dataset.fret),local=notes.findIndex((n:any)=>n.string===string&&n.fret===fret);el.classList.toggle('exercise-target',targets.has(`${string}:${fret}`));if(local<0)return;
  el.dataset.exerciseIndex=String(group.globalStart+local);el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',`${notes[local].name}, ${group.chord}, string ${6-string}, fret ${fret}`);
  const circle=el.querySelector('circle')!,square=document.createElementNS('http://www.w3.org/2000/svg','rect');square.setAttribute('x',String(Number(circle.getAttribute('cx'))-15));square.setAttribute('y',String(Number(circle.getAttribute('cy'))-15));square.setAttribute('width','30');square.setAttribute('height','30');square.setAttribute('rx','2');square.setAttribute('class','exercise-current-box');el.append(square);
 });
 panel.querySelector('.exercise-map-heading strong')!.textContent=group.fixedRegion?`${group.chord} · frets ${board.start}–${board.end}`:`${group.chord} · Position ${position.numeral} · ${position.shape} framework`;
 const positionSelect=panel.querySelector<HTMLSelectElement>('#exercise-position');if(positionSelect)positionSelect.value=position.numeral;
}
