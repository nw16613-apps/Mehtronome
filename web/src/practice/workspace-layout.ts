/** Reuse the existing controls and listeners; group by the task each workspace serves. */
export function organizeWorkspaces(navigate:(workspace:string,target:string)=>void){
 const get=(id:string)=>document.getElementById(id)!;
 const query=(selector:string)=>document.querySelector<HTMLElement>(selector)!;
 const label=(id:string)=>get(id).closest('label')!;
 const group=(name:string,className='')=>{const node=document.createElement('section');node.className='workspace-group '+className;node.setAttribute('aria-label',name);const title=document.createElement('h3');title.textContent=name;node.append(title);return node;};
 const move=(target:Element,...nodes:(Element|null)[])=>nodes.forEach(node=>{if(node)target.append(node);});
 const link=(text:string,workspace:string,target:string)=>{const button=document.createElement('button');button.type='button';button.className='practice-button';button.textContent=text;button.onclick=()=>navigate(workspace,target);return button;};
 // Metronome: pulse first; rhythm belongs with metre/subdivision, not session training.
 const transport=query('.transport'),tools=query('.studio-tools'),pulseGrid=query('.pulse-tool-grid');
 const rhythm=group('Rhythm','metronome-rhythm');move(rhythm,query('.pulse-options'));
 const rhythmTools=document.createElement('div');rhythmTools.className='rhythm-tools';
 move(rhythmTools,label('pulse-swing').closest('details'),label('pulse-poly').closest('details'));rhythm.append(rhythmTools);transport.append(rhythm);
 query('.beat-dots').after(query('.pulse-accent-help'));
 move(transport,query('.pulse-shortcut-row'));
 get('practice-tools-title').textContent='Session & training';
 const session=group('Session length','session-length');move(session,label('pulse-minutes').closest('details'));session.querySelector('details')!.open=true;
 const training=group('Training','metronome-training');move(training,query('.tempo-training'),query('.gap-training'));move(tools,session,training);pulseGrid.remove();
 const goals=get('guided-goals');tools.after(goals);goals.querySelector('h2')!.textContent='Guided session setup';
 // Harmony: chart setup, sheet and selected-chord editor, then optional reference.
 const harmony=query('.harmony'),heading=harmony.querySelector('.section-heading')!;
 harmony.querySelector('.segmented')!.setAttribute('hidden','');harmony.querySelector('.mode-label')?.remove();
 const progression=group('Chart setup','harmony-progression chart-title-group');
 const setupFields=document.createElement('div');setupFields.className='chart-setup-fields';
 const tonality=document.createElement('div');tonality.className='harmony-tonality';
 move(tonality,label('key'),label('quality'),label('chord'));
 move(setupFields,query('.progression-chooser'),label('custom-name'),tonality,get('single-chord-chart'));
 move(progression,setupFields,query('.chart-save-actions'),get('repertoire-status'));
 const draftHelp=document.createElement('p');draftHelp.className='practice-help';draftHelp.textContent='Edits are kept as a working draft in this browser. Save chart creates a named copy; Update saved chart replaces the selected saved copy.';progression.append(draftHelp);
 const keyHelp=document.createElement('p');keyHelp.className='practice-help';keyHelp.textContent='Chart key transposes the whole chart; chord root edits one chord.';keyHelp.classList.add('chart-key-help');progression.insertBefore(keyHelp,progression.querySelector('.chart-save-actions'));
 const hiddenTemplates=document.createElement('div');hiddenTemplates.hidden=true;move(hiddenTemplates,get('mode-template'),label('template'));progression.append(hiddenTemplates);
 heading.after(get('active-musical-context'));get('active-musical-context').after(progression);
 for(const row of Array.from(harmony.querySelectorAll(':scope>.field-row')))if(!row.children.length)row.remove();
 const builder=get('custom-progression-builder');progression.after(builder);
 const sheet=document.createElement('section');sheet.className='chart-sheet-panel';sheet.setAttribute('aria-label','Chord sheet');
 move(sheet,query('.custom-builder-heading'),get('chart-loop-status'),get('custom-beat-grid'),get('custom-grid-help'),get('loop-controls'),get('custom-timeline'));
 sheet.querySelector('.eyebrow')!.textContent='CHORD SHEET';
 const editor=query('.custom-editor'),chordGroup=group('Selected chord','chart-chord-group'),timeGroup=group('Duration','chart-time-group');
 chordGroup.querySelector('h3')!.id='selected-chord-heading';editor.setAttribute('aria-labelledby','selected-chord-heading');
 move(chordGroup,label('custom-root'),label('custom-chord'),label('custom-mode'),label('custom-bass'),get('custom-mode-help'),get('custom-scale-check'),get('custom-compatible-mode'));
 move(timeGroup,label('custom-duration-unit'),get('custom-bars-label'),get('custom-beats-label'));
 const mark=document.createElement('details');mark.className='chart-rehearsal-option';mark.innerHTML='<summary>Rehearsal mark</summary>';move(mark,label('custom-section'));timeGroup.append(mark);
 const actions=query('.custom-actions');actions.setAttribute('role','group');actions.setAttribute('aria-label','Selected chord actions');
 actions.prepend(sheet.querySelector('#custom-add')!,get('custom-duplicate'),sheet.querySelector('#custom-delete')!);
 editor.append(chordGroup,timeGroup,actions);
 const workspace=document.createElement('div');workspace.className='chart-editing-workspace';move(workspace,sheet,editor);builder.prepend(workspace);
 query('.custom-share summary').textContent='Copy progression as text';
 get('custom-status').textContent='Working draft ready.';
 const map=query('.harmony-learning');get('notes-title').textContent='Chord & scale reference';
 const reference=document.createElement('details');reference.className='harmony-reference';reference.innerHTML='<summary>Chord & scale reference</summary>';builder.after(reference);reference.append(map);
 const highlightLabel=label('exercise');highlightLabel.firstChild!.textContent='Highlight ';
 const referenceHighlight=get('exercise') as HTMLSelectElement;referenceHighlight.options[0].textContent='Scale';referenceHighlight.options[1].textContent='Chord tones';
 const help=harmony.querySelector('.learn-more')!;move(help,get('mode-tip'),get('backing-description'));reference.append(help);
 get('preview-controls').hidden=true;
 const movement=group('Harmony movement','harmony-movement');move(movement,query('.extension-morph'));query('.pad-settings').append(movement);
 // Guitar: musical choices and view controls before diagrams; theory explanations afterward.
 const guitar=query('.guitar'),overview=query('.guitar-overview'),guitarHelp=guitar.querySelector('.learn-more')!;
 guitarHelp.querySelector('summary')!.textContent='Diagram reference & guidance';
 move(guitarHelp,get('guitar-context'),get('guitar-scale'),get('guitar-parent'),get('grip-toggle-help'),query('.guitar-legend'));
 const guitarProgression=query('.guitar-progression-panel');guitarProgression.classList.add('workspace-group');guitarProgression.prepend(Object.assign(document.createElement('h3'),{textContent:'Chord & position'}));guitarProgression.append(get('guitar-scale-check'));
 const shapes=query('.guitar-shape-controls'),diagramControls=query('#position-path-guide .position-path-controls');
 diagramControls.classList.add('caged-diagram-controls');diagramControls.setAttribute('aria-label','CAGED diagram choices');diagramControls.append(shapes);
 const guitarView=group('View','guitar-viewbar');move(guitarView,query('.guitar-controls'),guitar.querySelector('[data-learning-focus]'));overview.append(guitarView);
 const oldSetup=query('.guitar-setup');oldSetup.remove();
 // Saved setups: loading and saving should not share an ambiguous row.
 get('progress-title').innerHTML='Your practice';query('.workspace-progress .intro-copy').textContent='Save your setups and track your practice.';
 const presets=query('.presets'),presetFields=query('.preset-fields'),loadSetup=group('Load a saved setup','preset-load-group'),saveSetup=group('Save current setup','preset-save-group');
 move(loadSetup,label('preset-list'),query('.preset-actions'));move(saveSetup,label('preset-name'),get('preset-save'));presetFields.append(loadSetup,saveSetup);
 const presetBackup=group('Backup','preset-backup');move(presetBackup,query('.preset-transfer'));presets.append(presetBackup);
 const roadmap=query('.practice-roadmap'),plan=group('Plan a session','roadmap-plan');move(plan,query('.practice-roadmap-tools'),get('practice-roadmap-today'));get('practice-roadmap-list').before(plan);get('practice-roadmap-list').before(Object.assign(document.createElement('h3'),{textContent:'Practice checklist'}));
 const reset=document.createElement('div');reset.className='roadmap-reset';reset.append(get('practice-roadmap-reset'));roadmap.append(reset);
 // Sound Settings: each instrument owns its sound controls and enable switch.
 const settings=query('.sound-settings');settings.querySelector(':scope>p')!.textContent='Choose sounds and patterns by instrument. Unmute backing tracks in the mixer to hear them; balance levels and solo there too.';
 const mixerLink=link('Open mixer','practice','mix-title');settings.querySelector('.section-heading')!.append(mixerLink);
 const instrumentGrid=document.createElement('div');instrumentGrid.className='instrument-settings';
 for(const [id,title] of [['drums','Drums'],['bass','Bass'],['comping','Electric piano']] as const){
  const instrument=group(title,'instrument-setting instrument-'+id),toggle=label(id);get(id).hidden=true;instrument.append(get(id));toggle.remove();move(instrument,get(id+'-controls'));instrumentGrid.append(instrument);
 }
 const sequence=query('.sound-settings .sequence'),sequenceToggle=label('sequence');get('sequence').hidden=true;sequence.append(get('sequence'));sequenceToggle.remove();sequence.classList.add('workspace-group','instrument-setting','instrument-sequence');
 const oldRhythm=query('.sound-settings .rhythm');oldRhythm.remove();query('.sound-settings-grid').before(instrumentGrid);settings.append(sequence);query('.sound-settings-grid').remove();
 // Keep every settings option expanded by default, as requested.
 settings.querySelectorAll('details').forEach(node=>node.open=true);
 get('open-sound-settings').textContent='Instrument sounds & patterns →';
}
