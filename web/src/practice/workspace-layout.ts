/** Reuse the existing controls and listeners; group by the task each workspace serves. */
export function organizeWorkspaces(navigate:(workspace:string,target:string)=>void){
 const get=(id:string)=>document.getElementById(id)!;
 const query=(selector:string)=>document.querySelector<HTMLElement>(selector)!;
 const label=(id:string)=>get(id).closest('label')!;
 const group=(name:string,className='')=>{const node=document.createElement('section');node.className='workspace-group '+className;node.setAttribute('aria-label',name);const title=document.createElement('h3');title.textContent=name;node.append(title);return node;};
 const move=(target:Element,...nodes:(Element|null)[])=>nodes.forEach(node=>{if(node)target.append(node);});
 const link=(text:string,workspace:string,target:string)=>{const button=document.createElement('button');button.type='button';button.className='practice-button';button.textContent=text;button.onclick=()=>navigate(workspace,target);return button;};
 // Pulse and shared playback, then rhythm; optional session tools stay below.
 const transport=query('.transport'),tools=query('.studio-tools'),pulseGrid=query('.pulse-tool-grid');
 get('pulse-title').textContent='Pulse & playback';
 const tempo=document.createElement('div');tempo.className='pulse-tempo-zone';
 move(tempo,query('.tempo-controls'),label('tempo'),get('tempo'),query('.range-limits'));
 const tempoActions=document.createElement('div');tempoActions.className='tempo-actions';move(tempoActions,get('tap-tempo'),get('tap-status'));tempo.append(tempoActions);move(tempo,query('.pulse-shortcut-row'));
 const playback=document.createElement('div');playback.className='session-playback';
 const now=document.createElement('div');now.className='session-harmony';now.innerHTML='<span class="small-label">CURRENT HARMONY</span><strong id="session-chord"></strong><span id="session-mode"></span>';
 move(playback,now,get('play'),label('count-in'),get('play-status'));
 const scope=document.createElement('p');scope.className='practice-help';scope.textContent='Play starts all unmuted tracks in the mixer.';playback.append(scope);
 const pulse=document.createElement('div');pulse.className='pulse-main-controls';move(pulse,tempo,playback);transport.querySelector('.section-heading')!.after(pulse);
 const rhythm=group('Rhythm','metronome-rhythm');move(rhythm,query('.pulse-options'));transport.append(rhythm);
 const accents=group('Beat accents','beat-accent-group');move(accents,get('beat-dots'),label('accent'),query('.pulse-accent-help'),get('pulse-large-open'));
 const accentStatus=document.createElement('p');accentStatus.id='beat-accent-status';accentStatus.className='practice-help';accents.append(accentStatus);rhythm.append(accents);
 const rhythmTools=document.createElement('div');rhythmTools.className='rhythm-tools';move(rhythmTools,label('pulse-swing').closest('details'),label('pulse-poly').closest('details'));rhythm.append(rhythmTools);transport.append(rhythm);query('.pulse-quick-tools').remove();
 get('practice-tools-title').textContent='Session & training';
 const session=group('Session timer','session-length');const timer=label('pulse-minutes').closest('details')!;move(session,timer);timer.open=false;timer.querySelector('summary')!.id='session-timer-summary';
 const timerMode=document.createElement('label');timerMode.innerHTML='Session duration<select id="pulse-timer-mode"><option value="unlimited">Unlimited</option><option value="timed">Fixed duration</option></select>';timer.querySelector('.pulse-tool-fields')!.prepend(timerMode);timer.querySelector('#pulse-minutes')!.closest('label')!.firstChild!.textContent='Minutes ';
 const training=group('Training','metronome-training');move(training,query('.tempo-training'),query('.gap-training'));move(tools,session,training);pulseGrid.remove();
 const goals=get('guided-goals');goals.classList.replace('workspace-practice','workspace-progress');query('.presets').before(goals);goals.querySelector('h2')!.textContent='Guided session setup';
 const mixHelp=document.createElement('p');mixHelp.className='practice-help mixer-instructions';mixHelp.textContent='Unmute a track to add it. Solo isolates tracks; Ambient space controls the reverb return.';query('.levels-heading').after(mixHelp);
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
 // Fretboard: chart slots first, then position, display and the active diagram.
 const guitar=query('.guitar'),overview=query('.guitar-overview'),guitarHelp=guitar.querySelector('.learn-more')!,legend=query('.guitar-legend');
 guitarHelp.querySelector('summary')!.textContent='Fretboard reference';
 move(guitarHelp,get('guitar-context'),get('guitar-scale'),get('guitar-parent'),get('grip-toggle-help'));
 const guitarProgression=query('.guitar-progression-panel');guitarProgression.classList.add('workspace-group');guitarProgression.prepend(Object.assign(document.createElement('h3'),{textContent:'Chord & position'}));guitarProgression.append(get('guitar-scale-check'),get('position-path'));
 const fretboardWorkspace=document.createElement('section');fretboardWorkspace.className='fretboard-workspace';fretboardWorkspace.setAttribute('aria-label','Fretboard explorer');overview.before(fretboardWorkspace);
 const diagramControls=query('#position-path-guide .position-path-controls');diagramControls.classList.add('caged-diagram-controls');diagramControls.setAttribute('aria-label','Position choices');
 move(fretboardWorkspace,get('position-path-guide'),get('position-overview'),query('.position-navigation'));
 const toolbar=group('Diagram','fretboard-toolbar'),guitarView=group('Display','guitar-viewbar');
 move(guitarView,query('.guitar-controls'),query('.grip-toggle'),guitar.querySelector('[data-learning-focus]'));
 const overlays=group('Overlay','fretboard-overlay-controls');move(overlays,query('.shared-theory-controls'));toolbar.append(guitarView,overlays);
 const displayStatus=document.createElement('p');displayStatus.id='fretboard-display-status';displayStatus.className='practice-help';toolbar.append(displayStatus);fretboardWorkspace.append(toolbar);
 move(fretboardWorkspace,get('guitar-diagrams'),legend,get('grip-preview-status'));
 const overlayKey=document.createElement('div');overlayKey.id='fretboard-overlay-key';overlayKey.className='theory-legend';legend.append(overlayKey);
 const overlaySummary=document.createElement('p');overlaySummary.id='fretboard-overlay-summary';overlaySummary.className='fretboard-overlay-summary';fretboardWorkspace.append(overlaySummary);
 const overlayDetails=document.createElement('details');overlayDetails.id='fretboard-overlay-details';overlayDetails.innerHTML='<summary>Overlay details</summary>';move(overlayDetails,get('theory-description'));fretboardWorkspace.append(overlayDetails);
 const oldSetup=query('.guitar-setup');oldSetup.remove();overview.hidden=true;
 // Progress prioritises recall; setup, manual checklist and backup have distinct scopes.
 get('progress-title').textContent='Setups & progress';query('.workspace-progress .intro-copy').textContent='Recall your sound and chart settings; keep a manual practice checklist.';
 const presets=query('.presets'),presetFields=query('.preset-fields'),loadSetup=group('Load a saved setup','preset-load-group'),saveSetup=group('Save current setup','preset-save-group');
 get('presets-title').textContent='Saved setups';presets.querySelector('.small-label')!.textContent='CHART · TEMPO · SOUND · MIX';
 move(loadSetup,label('preset-list'),query('.preset-actions'));move(saveSetup,label('preset-name'),get('preset-save'),loadSetup.querySelector('#preset-update'));presetFields.append(loadSetup,saveSetup);
 label('preset-name').firstChild!.textContent='Setup name ';get('preset-update').textContent='Update selected setup';get('preset-save').textContent='Save new setup';get('preset-delete').textContent='Delete selected setup';
 const selectionHelp=document.createElement('p');selectionHelp.id='preset-selection-help';selectionHelp.className='practice-help';loadSetup.append(selectionHelp);
 const setupContext=document.createElement('p');setupContext.id='setup-current-context';setupContext.className='practice-help';saveSetup.prepend(setupContext);
 const scopeHelp=document.createElement('p');scopeHelp.className='practice-help';scopeHelp.textContent='Setups save the chart, tempo, sound, mix and fretboard settings. Save exercise options in Exercises; save individual charts in Harmony.';presets.querySelector('.section-heading')!.after(scopeHelp);
 get('preset-export').textContent='Export setups';get('preset-import').textContent='Import setups';
 const presetBackup=group('Backup & transfer','preset-backup');move(presetBackup,query('.preset-transfer'));presets.append(presetBackup);
 presets.after(goals);const checklistLink=goals.querySelector<HTMLButtonElement>('[data-learning-nav]')!;checklistLink.removeAttribute('data-learning-nav');checklistLink.textContent='View checklist';checklistLink.onclick=()=>{get('practice-roadmap-title').focus({preventScroll:true});get('practice-roadmap-title').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 const roadmap=query('.practice-roadmap'),plan=group('Suggested session','roadmap-plan');get('practice-roadmap-title').textContent='Practice checklist';get('practice-roadmap-title').tabIndex=-1;roadmap.querySelector('.eyebrow')!.textContent='SELF-REPORTED PROGRESS';label('practice-roadmap-duration').firstChild!.textContent='Time budget ';
 const checklistHelp=document.createElement('p');checklistHelp.id='practice-checklist-help';checklistHelp.className='practice-help';checklistHelp.textContent='Mark items yourself for the selected root, scale and chord. Suggested times are estimates; this is not an accuracy score.';roadmap.querySelector('.practice-roadmap-bar')!.after(checklistHelp);
 move(plan,query('.practice-roadmap-tools'),get('practice-roadmap-today'));get('practice-roadmap-list').before(plan);get('practice-roadmap-list').before(Object.assign(document.createElement('h3'),{textContent:'Checklist items'}));
 get('practice-roadmap-reset').textContent='Reset this checklist';
 const reset=document.createElement('div');reset.className='roadmap-reset';reset.append(get('practice-roadmap-reset'));roadmap.append(reset);
 // Sound Settings: each instrument owns its sounds; audibility belongs to the shared mixer.
 const settings=query('.sound-settings');settings.querySelector(':scope>p')!.textContent='Choose sounds and patterns by instrument. Unmute backing tracks in the mixer to hear them; balance levels and solo there too.';
 const mixerLink=document.createElement('button');mixerLink.type='button';mixerLink.className='practice-button';mixerLink.textContent='Open mixer';mixerLink.onclick=()=>{if(get('floating-mixer').hidden)get('mini-mixer').click();else get('floating-mixer-close').focus();};settings.querySelector('.section-heading')!.append(mixerLink);
 const instrumentGrid=document.createElement('div');instrumentGrid.className='instrument-settings';
 for(const [id,title] of [['drums','Drums'],['bass','Bass'],['comping','Electric piano']] as const){
  const instrument=group(title,'instrument-setting instrument-'+id),toggle=label(id);get(id).hidden=true;instrument.append(get(id));toggle.remove();move(instrument,get(id+'-controls'));instrumentGrid.append(instrument);
 }
 const sequence=query('.sound-settings .sequence'),sequenceToggle=label('sequence');get('sequence').hidden=true;sequence.append(get('sequence'));sequenceToggle.remove();sequence.classList.add('workspace-group','instrument-setting','instrument-sequence');
 const oldRhythm=query('.sound-settings .rhythm');oldRhythm.remove();query('.sound-settings-grid').before(instrumentGrid);settings.append(sequence);query('.sound-settings-grid').remove();
 // Keep every settings option expanded by default, as requested.
 settings.querySelectorAll('details').forEach(node=>node.open=true);
 const soundSections=[['click',query('.metronome-sound-settings'),'Metronome'],['harmony',query('.pad-settings'),'Sustained harmony'],['drums',query('.instrument-drums'),'Drums'],['bass',query('.instrument-bass'),'Bass'],['comping',query('.instrument-comping'),'Electric piano'],['sequence',sequence,'Melodic movement']] as const;
 const jump=document.createElement('nav');jump.className='sound-jump-nav';jump.setAttribute('aria-label','Instrument settings');
 for(const [channel,card,title] of soundSections){card.id='sound-'+channel;card.classList.add('sound-instrument-card');const heading=card.querySelector<HTMLElement>(':scope>h3')!;heading.tabIndex=-1;
  const row=document.createElement('div');row.className='sound-section-heading';const badge=document.createElement('span');badge.dataset.soundState=channel;badge.className='sound-channel-state';row.append(heading,badge);card.prepend(row);
  const button=document.createElement('button');button.type='button';button.className='practice-button';button.dataset.soundTarget=channel;button.textContent=title;button.onclick=()=>{heading.focus({preventScroll:true});card.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};jump.append(button);
 }
 settings.querySelector(':scope>p')!.after(jump);
 label('pad-movement').firstChild!.textContent='Texture motion ';query('label[for=pad-depth-amount]').firstChild!.textContent='Depth motion amount ';
 label('comping-movement').firstChild!.textContent='Voicing movement ';query('label[for=comping-movement-amount]').firstChild!.textContent='Hook movement amount ';
 label('sequence-rate').firstChild!.textContent='Note rate ';query('label[for=sequence-swing]').firstChild!.textContent='Melodic swing ';
 query('.backing-shape>summary').textContent='Texture & voicing';query('.harmony-movement>h3').textContent='Chord extensions';
 const hookHelp=document.createElement('p');hookHelp.id='comping-hook-help';hookHelp.className='practice-help';hookHelp.textContent='Hook length and movement amount apply when a voicing hook is selected.';get('comping-controls').append(hookHelp);
 get('open-sound-settings').textContent='Instrument sounds & patterns →';
}
