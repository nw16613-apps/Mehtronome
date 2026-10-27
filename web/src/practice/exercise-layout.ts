/** Group existing controls by purpose without duplicating state or event handlers. */
export function organizeExercisePanel(panel:HTMLElement){
 const find=(selector:string)=>panel.querySelector<HTMLElement>(selector)!;
 const section=(className:string,title:string)=>{const node=document.createElement('section');node.className=className;node.setAttribute('aria-label',title);const heading=document.createElement('h4');heading.textContent=title;node.append(heading);return node;};
 const label=(id:string)=>find('#'+id).closest('label')!;
 const heading=find('.exercise-heading'),toolbar=find('.exercise-learning-toolbar'),controls=find('.exercise-controls');
 const definition=section('exercise-definition','Exercise');
 controls.prepend(label('exercise-study'));controls.append(label('exercise-stage'));label('exercise-stage').firstChild!.textContent='Scope ';
 for(const option of Array.from(find('#exercise-stage').querySelectorAll('option')))option.textContent=option.value==='cell'?'Short cell':'Full position';
 definition.append(controls);heading.after(definition);
 const playback=section('exercise-playback-panel','Playback'),playControls=document.createElement('div');playControls.className='exercise-playback-controls';
 playControls.append(find('#exercise-preview'),find('.exercise-tempo'),label('exercise-loop'),label('exercise-backing'));playback.append(playControls);
 const trainer=find('.exercise-setup'),practiceBar=find('.exercise-practice-bar');
 const trainerLabels=['exercise-auto-tempo','exercise-auto-every','exercise-auto-increment','exercise-auto-target'].map(label);
 trainer.before(practiceBar);
 const trainerGrid=document.createElement('div');trainerGrid.className='exercise-trainer-controls';trainerGrid.append(...trainerLabels);
 trainer.replaceChildren(Object.assign(document.createElement('summary'),{textContent:'Tempo trainer'}),trainerGrid);
 if(find('#exercise-auto-tempo').hasAttribute('disabled')){const note=document.createElement('p');note.textContent='Tempo trainer is unavailable for chord-aligned studies. Playback stays at the exercise tempo.';trainer.append(note);}
 playback.append(trainer,find('.exercise-status-row'),find('.exercise-range-controls'));definition.after(playback);
 const navigation=find('.exercise-navigation');navigation.prepend(Object.assign(document.createElement('h4'),{textContent:'Chord & position'}));playback.after(navigation);
 const view=section('exercise-viewbar','View');view.append(label('exercise-display'),label('exercise-zoom'),find('#exercise-map-toggle'),find('#exercise-focus'));navigation.after(view);
 const material=find('.exercise-material-layout');view.after(material);
 const reference=find('.exercise-lesson');reference.querySelector('summary')!.textContent='Reference & guidance';
 for(const selector of ['.progression-timing-help','.exercise-voice-leading','.notation-chord-help','.exercise-diagram-reference','.exercise-grip-information','.exercise-footer>p']){
  for(const node of Array.from(panel.querySelectorAll(selector)))reference.append(node);
 }
 material.after(reference);
 const footer=find('.exercise-footer');footer.prepend(Object.assign(document.createElement('h4'),{textContent:'Save & export'}));footer.insertBefore(label('exercise-favourites'),footer.querySelector('.exercise-actions'));reference.after(footer);
 // Back/forward browse the same exercise menu, so keep them beside its choices.
 const browse=document.createElement('div');browse.className='exercise-browse';browse.append(find('#exercise-history-back'),find('#exercise-history-forward'));definition.append(browse);
 toolbar.remove();practiceBar.remove();
}
