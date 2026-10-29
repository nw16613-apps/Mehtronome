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
 // Harmony: choose the source, set tonality, work on the chart, then consult references.
 const harmony=query('.harmony'),heading=harmony.querySelector('.section-heading')!,source=group('Start a chart','harmony-source');move(source,get('single-chord-chart'));harmony.querySelector('.segmented')!.setAttribute('hidden','');harmony.querySelector('.mode-label')?.remove();heading.after(source);
 const tonality=group('Chart key & template settings','harmony-tonality'),tonalityFields=document.createElement('div');tonalityFields.className='workspace-fields';
 move(tonalityFields,label('key'),label('quality'),label('chord'));tonality.append(tonalityFields);source.after(tonality);
 for(const row of Array.from(harmony.querySelectorAll(':scope>.field-row')))if(!row.children.length)row.remove();
 const progression=group('Chord chart','harmony-progression');move(progression,query('.progression-chooser'),get('single-chord-chart'),get('mode-template'),label('template'),get('custom-progression-builder'),query('.chart-management'),get('repertoire-status'));source.remove();tonality.after(progression);
 const movement=group('Harmony movement','harmony-movement');move(movement,query('.extension-morph'));progression.after(movement);
 const map=query('.harmony-learning');get('notes-title').textContent='Chord & scale reference';movement.after(map);

 heading.after(get('active-musical-context'));get('active-musical-context').after(tonality);
 const help=harmony.querySelector('.learn-more')!;move(help,get('mode-tip'),get('backing-description'));map.after(help);progression.append(get('preview-controls'));
 // Editor keeps title, selected chord and time controls distinct without changing its hidden state.
 const editor=query('.custom-editor');const titleGroup=group('Chart','chart-title-group'),chordGroup=group('Selected chord','chart-chord-group'),timeGroup=group('Duration & rehearsal mark','chart-time-group');
 move(titleGroup,label('custom-name'),query('.chart-save-actions'));move(chordGroup,label('custom-root'),label('custom-chord'),label('custom-mode'),label('custom-bass'),get('custom-mode-help'),get('custom-scale-check'),get('custom-compatible-mode'));
 move(timeGroup,label('custom-duration-unit'),get('custom-bars-label'),get('custom-beats-label'),label('custom-section'));editor.append(titleGroup,chordGroup,timeGroup);
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
 const settings=query('.sound-settings');settings.querySelector(':scope>p')!.textContent='Choose sounds and patterns by instrument. Balance levels, mute and solo in the mixer.';
 const mixerLink=link('Open mixer','practice','mix-title');settings.querySelector('.section-heading')!.append(mixerLink);
 const instrumentGrid=document.createElement('div');instrumentGrid.className='instrument-settings';
 for(const [id,title] of [['drums','Drums'],['bass','Bass'],['comping','Electric piano']] as const){
  const instrument=group(title,'instrument-setting instrument-'+id),toggle=label(id);toggle.replaceChildren(get(id),document.createTextNode('Enabled'));instrument.querySelector('h3')!.after(toggle);move(instrument,get(id+'-controls'));instrumentGrid.append(instrument);
 }
 const sequence=query('.sound-settings .sequence'),sequenceToggle=label('sequence');sequenceToggle.replaceChildren(get('sequence'),document.createTextNode('Enabled'));sequence.querySelector('h3')!.after(sequenceToggle);sequence.classList.add('workspace-group','instrument-setting','instrument-sequence');
 const oldRhythm=query('.sound-settings .rhythm');oldRhythm.remove();query('.sound-settings-grid').before(instrumentGrid);settings.append(sequence);query('.sound-settings-grid').remove();
 // Keep every settings option expanded by default, as requested.
 settings.querySelectorAll('details').forEach(node=>node.open=true);
 get('open-sound-settings').textContent='Instrument sounds & patterns →';
}
