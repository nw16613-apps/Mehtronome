/** Group existing controls by purpose without duplicating state or event handlers. */
export function organizeExercisePanel(panel:HTMLElement,guitarVolume=100){
 const find=(selector:string)=>panel.querySelector<HTMLElement>(selector)!;
 const section=(className:string,title:string)=>{const node=document.createElement('section');node.className=className;node.setAttribute('aria-label',title);const heading=document.createElement('h4');heading.textContent=title;node.append(heading);return node;};
 const label=(id:string)=>find('#'+id).closest('label')!;
 const heading=find('.exercise-heading'),toolbar=find('.exercise-learning-toolbar'),controls=find('.exercise-controls');
 const definition=section('exercise-definition','Exercise');
 controls.prepend(label('exercise-study'));if(find('#exercise-phrase'))controls.append(label('exercise-phrase'));if(find('#exercise-start-note'))controls.append(label('exercise-start-note'));
 definition.append(controls);heading.after(definition);
 const playback=section('exercise-playback-panel','Playback'),playControls=document.createElement('div');playControls.className='exercise-playback-controls';
 playControls.append(find('#exercise-preview'),find('#exercise-clear-range'),find('.exercise-tempo'),label('exercise-loop'),label('exercise-backing'));const volume=document.createElement('label');volume.className='exercise-guitar-volume';volume.htmlFor='exercise-guitar-volume';volume.innerHTML=`<span>Guitar volume <output id="exercise-guitar-volume-value" for="exercise-guitar-volume">${guitarVolume}%</output></span><input id="exercise-guitar-volume" type="range" min="0" max="100" value="${guitarVolume}">`;playControls.append(volume);playback.append(playControls);
 const trainer=find('.exercise-setup'),practiceBar=find('.exercise-practice-bar');
 const trainerLabels=['exercise-auto-tempo','exercise-auto-every','exercise-auto-increment','exercise-auto-target'].map(label);
 trainer.before(practiceBar);
 const trainerGrid=document.createElement('div');trainerGrid.className='exercise-trainer-controls';trainerGrid.append(...trainerLabels);
 trainer.replaceChildren(Object.assign(document.createElement('summary'),{textContent:'Tempo trainer'}),trainerGrid);
 if((find('#exercise-auto-tempo') as HTMLInputElement).disabled){for(const id of ['exercise-auto-every','exercise-auto-increment','exercise-auto-target'])(find('#'+id) as HTMLInputElement).disabled=true;const note=document.createElement('p');note.textContent='Tempo trainer is unavailable for chord-aligned studies. Playback stays at the exercise tempo.';trainer.append(note);}
 const trainerHelp=document.createElement('p');trainerHelp.className='practice-help';trainerHelp.textContent='Automatic increases require Loop. Progression accompaniment keeps a fixed tempo.';trainer.append(trainerHelp);playback.append(find('.exercise-range-controls'),trainer);definition.after(playback);
 const navigation=find('.exercise-navigation');navigation.prepend(Object.assign(document.createElement('h4'),{textContent:'Chord & position'}));definition.after(navigation);navigation.querySelector('h4')!.after(find('.progression-reference'));
 const view=section('exercise-viewbar','View');view.append(label('exercise-display'),label('exercise-zoom'),label('exercise-chord-diagrams'),find('#exercise-map-toggle'),find('#exercise-focus'));const diagram=find('.exercise-linked-fretboard');heading.after(navigation);navigation.after(diagram);diagram.after(definition);definition.after(view);
 const material=find('.exercise-material-layout');view.after(material);
 const reference=find('.exercise-lesson');reference.querySelector('summary')!.textContent='Reference & guidance';
 for(const selector of ['.progression-timing-help','.exercise-voice-leading','.notation-chord-help','.exercise-diagram-reference','.exercise-grip-information','.exercise-footer>p']){
  for(const node of Array.from(panel.querySelectorAll(selector)))reference.append(node);
 }
 material.after(playback);playback.after(reference);
 const footer=find('.exercise-footer');footer.prepend(Object.assign(document.createElement('h4'),{textContent:'Export notation'}));reference.after(footer);
 const saved=document.createElement('div');saved.className='exercise-saved-controls';label('exercise-favourites').firstChild!.textContent='Saved exercise options ';saved.append(label('exercise-favourites'),find('#exercise-favourite'));definition.querySelector('h4')!.after(saved);
 const savedHelp=document.createElement('p');savedHelp.className='practice-help';savedHelp.textContent='Saved options apply to the current chart and positions; they do not load another chart.';saved.after(savedHelp);
 const key=document.createElement('p');key.className='exercise-active-key';key.textContent='Ring: chord voicing · dashed ring: resolution target · square: current note';diagram.querySelector('#exercise-map-body')!.append(key);
 // Back/forward browse the same exercise menu, so keep them beside its choices.
 const browse=document.createElement('div');browse.className='exercise-browse';browse.append(find('#exercise-history-back'),find('#exercise-history-forward'));definition.append(browse);
 toolbar.remove();practiceBar.remove();
}
