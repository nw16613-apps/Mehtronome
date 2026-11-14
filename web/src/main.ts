import {neckExerciseGroups,neckExerciseCells,neckCellHarmony,neckRouteChoice} from './practice/neck-exercises.js';
import {acrossNeck,hasRouteTurnOptions,normalizeTraversal,neckRouteBoard,traversalControls,traversalLabel,routeMapSvg} from './guitar/neck-traversal.js';
import {GUITAR_TUNINGS,GUITAR_TUNING_KEY,normalizeGuitarTuning,guitarTuningRatio} from './audio/guitar-tuning.js';
import {linkExerciseFingering} from './practice/linked-fingering.js';
import {musicalSettingsKey,liveSettingsPatch} from './audio/live-settings.js';
import {organizeExerciseCatalogue} from './practice/exercise-catalogue-view';
import {CONTENT_MATERIALS,contentMaterial,contentSource,contentSources,contentFamily,contentFamilies,changeContentMaterial,changeContentSource,changeContentFamily,groupPatternLabel} from './practice/exercise-catalogue.js';
import {sequenceEntryChoices,sequenceEntryState,savedEntryLabel} from './practice/sequence-entry.js';
import {exerciseArpeggioHarmony} from './guitar/arpeggio-harmony.js';
import {orderedScaleCell,hasExerciseCellOrder,hasChromaticSide} from './guitar/scale-sequences.js';
import {passagePlaybackPlan,passageBackingSettings} from './practice/cell-playback.js';
import {SCALE_SEQUENCE_FAMILY_LABELS,scaleCellOrders} from './guitar/scale-sequences.js';
import {orderedArpeggioRootCell,arpeggioSequenceGroups,ARPEGGIO_ROOT_SEQUENCES} from './guitar/arpeggio-sequences.js';
import {SCALE_SEQUENCE_FAMILIES,SCALE_SEQUENCE_STUDIES,scaleSequenceFamily,scaleSequenceLabel,libraryExerciseValue,resolveLibraryExercise} from './practice/exercise-library.js';
import {readExerciseFavourites,exerciseFavouriteKey,toggleExerciseFavourite} from './practice/exercise-favourites.js';
import {ARPEGGIO_PATTERN_STUDIES,arpeggioPatternGroups,arpeggioFamilies,arpeggioPatternFamily,normalizeArpeggioPattern,arpeggioPatternLabel} from './guitar/arpeggio-patterns.js';
import {ENCLOSURE_PATTERNS,enclosurePatternLabel,enclosureFamily,enclosurePatternGroups} from './guitar/enclosures.js';
import {standardMelodyStatus,playbackLeadInBeats} from './audio/standard-melodies.js';
import {REFERENCE_PERFORMANCES} from './audio/reference-performances.js';
import {installStudyPath} from './practice/study-path-view';
import {createReferencePreparation} from './audio/reference-plan-preparation.js';
import {createGuitarChannel,loadGuitarCabinet,needsGuitarCabinet} from './audio/guitar-processing.js';
import {shapeColor,emphasizeFullNeck,perStringMapRegions} from './guitar/shape-emphasis.js';
import {PER_STRING_STUDIES,perStringExerciseChoice,perStringExerciseGroups} from './practice/per-string-exercises.js';
import {arpeggioFingeringControls} from './practice/per-string-exercise-view.js';
import {installPerStringView} from './guitar/per-string-view.js';
import {checklistCards} from './practice/checklist-view.js';
import {highlightChordPlayback} from './practice/chord-playback.js';
import {installProgressionGenerator} from './practice/progression-generator-view.js';
import {chordStepsInRange} from './practice/chart-edit-selection.js';
import {patternStartRoute,patternStartRouteValue,cardStartLabel} from './practice/pattern-start-route.js';
import {createMasterOutput,MASTER_VOLUME_KEY,DEFAULT_MASTER_VOLUME,masterVolumePercent} from './audio/master-output.js';
import {BUS_GAINS} from './audio/mix-balance.js';
import {installBackingStyles} from './practice/backing-styles-view.js';
import {BACKING_STYLES,backingStyleId,backingStyleInstruments,backingStyleForControls,resolveDrumKit} from './practice/backing-styles.js';
import {withExerciseResolution,resolutionBackingSettings,singleChordExercisePlan} from './practice/exercise-resolution.js';
import {scaleStartingState} from './practice/scale-start.js';
import {arpeggioStartingChoices} from './practice/arpeggio-start.js';
import {createPlaybackContext} from './audio/context-options.js';
import {ExerciseBufferCache,ExerciseAudioQueue,exerciseNoteDuration} from './audio/exercise-playback.js';
import {ARPEGGIO_STUDIES,arpeggioHarmony} from './guitar/arpeggio-harmony.js';
import {MODE_FAMILIES} from './audio/music.js';
import {chordOptionGroups} from './practice/chord-options.js';
import {normalizeExerciseOptions,exerciseMenuOptions,exerciseCollectionLabels} from './practice/exercise-options.js';
import {organizeWorkspaces} from './practice/workspace-layout.js';
import {installRepertoire} from './practice/repertoire-view.js';
import {rehearsalSections,REPERTOIRE_KEY,normalizeRepertoire} from './practice/repertoire.js';
import {manualPositionPath,manualPositionRoute} from './guitar/position-path.js';
import {positionRouteCards} from './practice/position-route.js';
import {progressionExerciseGroups} from './practice/progression-exercises.js';
import {reserveChordBands,updateBackingSymbols} from './practice/notation-backing.js';
import {installChartTools} from './practice/chart-tools.js';
import {chordSheet} from './practice/chord-sheet.js';
import {progressionStudyPlan,planPosition} from './practice/progression-timing.js';
import {progressionNotationSvg} from './practice/progression-notation.js';
import {GOALS,gripStudy,positionalArpeggio,gripFacts,shortCell,guideToneExamples} from './practice/learning.js';
import {learningView,highlightLearningNote,updateProgressionMap} from './practice/learning-view.js';
import {musicalContext,spellingHelp,scaleCompatibility} from './practice/context.js';
import './beta.css';
import {harmonizedSevenths} from './practice/harmonized-sevenths.js';
import {MIX_CHANNELS,BACKING_CHANNELS,backingMutesForPreset} from './practice/mixer.js';
import {extensionChoices} from './audio/extensions.js';
import {tapBpm, beatStrength, formatTime} from './practice/pulse.js';
import {createFxBuses,FX_PRESET_CONTROLS} from './audio/fx-buses.js';
import {installFxControls} from './practice/fx-view.js';
import { theoryOptions } from './guitar/superimposition.js';
import { recommendedGrip } from './guitar/grips.js';
import { PRESET_KEY, PRESET_CONTROLS, readPresets, writePresets, exportPresets, importPresets, MAX_PRESET_FILE_BYTES } from './practice/presets.js';
import {sampleNamesForSettings} from './audio/sample-requirements.js';
import { loadDrumKit } from './audio/load-kit.js';
import './style.css';
import './themes.css';
import './practice.css';
import './practice/study-path.css';
import './interface.css';
import './console.css';
import './studio.css';
import './icons.css';
import './workspace-layout.css';
import {applyStudioIcons} from './practice/icons.js';
import {consoleChannel, syncConsole, installConsole, receiveConsoleMeters} from './practice/console.js';
import { POSITIONS, cagedPositionFor, fretboardFor, diagramSvg, fullFretboardFor, fullFretboardSvg, occupiedFretRange, parentMajorFor } from './guitar/fretboard.js';
import { cagedStudy, alignedProgressionGroups, exerciseNotationSvg, flattenExercise, PENTATONIC_PATTERNS } from './guitar/exercises.js';
import { FRET_REGIONS, progressionPositionPath } from './guitar/position-path.js';
import workletUrl from './audio/worklet.js?worker&url';
import { DEFAULTS } from './audio/engine.js';
import { MAX_CHART_STEPS, CUSTOM_PROGRESSION_KEY, customPitchName, cloneTemplate, normalizeCustomProgression, progressionText, recommendedMode, romanForStep } from './practice/custom-progression.js';
import { PRACTICE_TASKS, curriculumKey, completedCount, modeProgress } from './practice/curriculum.js';
import { compatibleScaleGroups,compatibleModeForChord,chordChoicesForMode,compatibleChordForMode,modeChordGroups } from './practice/scale-explorer.js';
import { barAlignedDuration,retimeExercise } from './practice/exercise-timing.js';
import { MODES, CHORDS, SOUNDS, compatibleChords, PROGRESSIONS, progressionDefinition, progressionDurations, progressionBeatDurations, progressionPlaybackBeatDurations, progressionTimeline, progressionPositionAtBeat, progressionStepAtBeat, progressionOrder, progressionStep, characteristicNotes, harmonyAt } from './audio/music.js';

const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
let customProgression:any;
try{const stored=localStorage.getItem(CUSTOM_PROGRESSION_KEY);customProgression=normalizeCustomProgression(JSON.parse(stored||'null'));}
catch{customProgression=normalizeCustomProgression(null);}
(PROGRESSIONS as any).custom=customProgression;
function modeOptions() {
  return MODE_FAMILIES.map(family =>
    `<optgroup label="${family}">${Object.entries(MODES).filter(([, mode]) => ('family' in mode ? mode.family : 'Major scale') === family).map(([id, mode]) => `<option value="${id}" ${id === 'dorian' ? 'selected' : ''}>${mode.name}</option>`).join('')}</optgroup>`
  ).join('');
}
function chordTypeOptions(ids=Object.keys(CHORDS),suggested=''){
  return chordOptionGroups(ids).map((group:any)=>`<optgroup label="${escapeHtml(group.family)}">${group.ids.map((id:string)=>`<option value="${id}">${escapeHtml(CHORDS[id as keyof typeof CHORDS].name)}${id===suggested?' · suggested':''}</option>`).join('')}</optgroup>`).join('');
}

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Mehtronome home"><span class="brand-mark">m<span>·</span></span>Mehtronome</a><span class="header-note">A little rhythm. A little harmony.</span><div class="theme-controls"><button id="focus-view" class="practice-button" aria-pressed="false">Focus view</button><label class="theme-picker">Theme<select id="palette" aria-label="Page theme"><option value="midnight">Refined Midnight</option><option value="plum">Plum Ink</option><option value="evergreen">Evergreen</option><option value="soft-stone">Soft Stone</option></select></label></div></header>
<nav class="workspace-nav" aria-label="Workspace navigation">
  <div class="workspace-nav-inner">
    <span class="workspace-nav-label">Workspace</span>
    <button type="button" class="workspace-tab selected" data-workspace-target="study-path-title" aria-current="page"><span>01</span>Study</button>
    <button type="button" class="workspace-tab" data-workspace-target="pulse-title"><span>02</span>Metronome &amp; Mixer</button>
    <button type="button" class="workspace-tab" data-workspace-target="harmony-title"><span>03</span>Harmony</button>
    <button type="button" class="workspace-tab" data-workspace-target="guitar-title"><span>04</span>Fretboard</button>
    <button type="button" class="workspace-tab" data-workspace-target="caged-exercise"><span>05</span>Exercises</button>
    <button type="button" class="workspace-tab" data-workspace-target="progress-title"><span>06</span>Progress</button>
    <button type="button" class="workspace-tab" data-workspace-target="sound-settings-title"><span>07</span>Sound Settings</button>
  </div>
</nav>
<main><section id="guided-goals" class="panel guided-goals workspace-page workspace-practice"><div class="section-heading"><h2>Start with a musical goal</h2><button type="button" class="practice-button" data-learning-nav="progress">Learning path →</button></div><div class="goal-controls"><label>Today’s goal<select id="practice-goal">${GOALS.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select></label><label>Accompaniment<select id="practice-accompaniment"><option value="clear">Clear harmony study</option><option value="trio">Jazz trio</option><option value="modal">Modal exploration</option><option value="sparse">Sparse click / time</option></select></label><button type="button" class="practice-button" id="start-guided-goal">Set up this session</button></div><p id="goal-description" class="practice-help">${GOALS[0].tip}</p></section><section id="guided-session" class="guided-session" hidden><strong id="guided-session-title"></strong><div><button class="practice-button" data-learning-nav="harmony">1 · Hear the harmony</button><button class="practice-button" data-learning-nav="guitar">2 · Learn the shape</button><button class="practice-button" data-learning-nav="exercises">3 · Practise an idea</button><button class="practice-button" data-learning-nav="progress">Setups & progress</button><button id="dismiss-guided-session" class="practice-button">Dismiss guide</button></div></section><div class="studio-intro workspace-page workspace-practice"><div><p class="eyebrow">YOUR PRACTICE SPACE</p><h1>Metronome &amp; mixer</h1></div><p>Set your pulse. Shape your sound.</p></div>
  <div class="intro workspace-page workspace-progress"><div><p class="eyebrow">SAVED PRACTICE &amp; PROGRESS</p><h1 id="progress-title">Your practice.<br><em>Your progress.</em></h1></div><p class="intro-copy">Save your setups and pick up where you left off.<br>Follow your learning path, one session at a time.</p></div>
  <section class="presets panel workspace-page workspace-progress" aria-labelledby="presets-title">
    <div class="section-heading"><h2 id="presets-title">Practice presets</h2><span class="small-label">PICK UP WHERE YOU LEFT OFF</span></div>
    <div class="preset-fields"><label>Preset name<input id="preset-name" type="text" maxlength="60" placeholder="e.g. D Dorian · slow groove"></label><button id="preset-save" class="practice-button">Save new</button><label>Saved setups<select id="preset-list"><option value="">Choose a preset</option></select></label><div class="preset-actions"><button id="preset-load" class="practice-button" disabled>Load</button><button id="preset-update" class="practice-button" disabled>Update</button><button id="preset-delete" class="practice-button" disabled>Delete</button></div></div>
    <p id="preset-status" class="practice-help" role="status">Setups are saved in this browser.</p>
  <div class="preset-transfer"><button id="preset-export" class="practice-button">Export presets</button><button id="preset-import" class="practice-button">Import presets</button><input id="preset-file" type="file" accept=".json,application/json" hidden></div>
  </section>
  <div class="workspace">
    <section class="transport panel workspace-page workspace-practice" aria-labelledby="pulse-title">
      <div class="section-heading"><h2 id="pulse-title">Metronome</h2><span class="live-dot" id="live-dot"></span></div>
      <div class="tempo-controls"><button class="round" id="slower" aria-label="Decrease tempo">−</button><div><label class="sr-only" for="bpm">Tempo in beats per minute</label><input id="bpm" type="number" min="30" max="240" value="90"><span id="bpm-caption" class="bpm-label">BEATS PER MINUTE</span></div><button class="round" id="faster" aria-label="Increase tempo">+</button></div>
      <label class="sr-only" for="tempo">Tempo</label><input id="tempo" class="tempo-range" type="range" min="30" max="240" value="90"><div class="range-limits"><span>30 · LARGO</span><span>240 · PRESTISSIMO</span></div>
      <div class="beat-dots" id="beat-dots" role="group" aria-label="Editable beat accents"></div>
      <p class="play-status" id="play-status" role="status">Ready.</p>
      <button class="play-button" id="play" aria-pressed="false"><span id="play-icon">▶</span><span id="play-label">Play session</span><kbd>SPACE</kbd></button>
      <div class="pulse-options">
      <div class="transport-options"><label>Beats / bar <select id="beats" aria-label="Beats per bar"><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label><label class="check"><input type="checkbox" id="count-in">One-bar count-in</label></div>
      <div class="transport-options subdivision-options"><label>Subdivision <select id="subdivision"><option value="1" aria-label="Quarter notes" title="Quarter notes">♩</option><option value="2" aria-label="Eighth notes" title="Eighth notes">♪</option><option value="3" aria-label="Eighth-note triplets" title="Eighth-note triplets">♪³</option><option value="4" aria-label="Sixteenth notes" title="Sixteenth notes">♬</option><option value="5" aria-label="Quintuplets: five per beat" title="Quintuplets: five per beat">♬⁵</option><option value="6" aria-label="Sixteenth-note sextuplets" title="Sixteenth-note sextuplets">♬⁶</option><option value="7" aria-label="Septuplets: seven per beat" title="Septuplets: seven per beat">♬⁷</option></select></label><label class="check"><input id="accent" type="checkbox" checked>Accent beat one</label></div>
      </div>
      <div class="pulse-quick-tools"><button id="tap-tempo" type="button" class="practice-button">Tap tempo <kbd>T</kbd></button><span id="tap-status" class="practice-help" role="status">Tap at least twice to set the pulse.</span><button id="pulse-large-open" type="button" class="practice-button">Large beat display</button></div>

      <p class="practice-help pulse-accent-help">Click a beat above to cycle strong → soft → silent. <button id="pulse-accent-reset" type="button" class="pulse-text-button">Reset accents</button></p><input id="pulse-accents" type="hidden" value="">
    </section>
    <section class="harmony panel workspace-page workspace-harmony" aria-labelledby="harmony-title">
      <div class="section-heading"><h2 id="harmony-title">Harmony</h2><span class="small-label">YOUR MUSICAL CONTEXT</span></div>
      <div id="active-musical-context" class="active-musical-context"></div><div class="field-row"><label><span id="root-label">Root note</span><select id="key">${names.map((n, i) => `<option value="${i}" ${i === 9 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Mode<select id="quality">${modeOptions()}</select></label></div>
      <div class="field-row sound-row"><label><span id="chord-label">Pedal chord</span><select id="chord"></select></label></div>



      <div class="practice-block extension-morph"><label class="check"><input id="extension-morph" type="checkbox" checked>Evolving chord extensions</label><div id="extension-controls" hidden><label>Blend cycle<select id="extension-bars"><option value="4">4 bars</option><option value="8" selected>8 bars</option><option value="16">16 bars</option></select></label><p class="practice-help">Adds and releases scale extensions in the sustained Harmony track.</p></div><p id="extension-status" class="practice-help" hidden></p></div>

      <div class="mode-label">BACKING</div><div class="segmented" hidden aria-hidden="true"><button id="pedal" class="selected" aria-pressed="true">Pedal chord</button><button id="progression" aria-pressed="false">Chord progression</button></div>
      <button id="single-chord-chart" type="button" class="practice-button">New single-chord chart</button>
      <button id="mode-template" class="practice-button mode-template-button">Try a mode progression</button>
      <label id="template-field" class="template-field" hidden>Progression template<select id="template">${['Parallel movements','Jazz standards','Mode practice','Custom'].map(group=>`<optgroup label="${group}">${Object.entries(PROGRESSIONS).filter(([,template])=>group==='Custom'?['custom','single'].includes(template.kind):group==='Mode practice'?template.kind==='modal':group==='Jazz standards'?template.kind==='jazz':!['custom','single','modal','jazz'].includes(template.kind)).map(([id,template])=>`<option value="${id}">${template.name}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <section id="custom-progression-builder" class="custom-progression-builder" aria-labelledby="custom-progression-title" hidden>
        <div class="custom-builder-heading"><div><p class="eyebrow">PROGRESSION BUILDER</p><h3 id="custom-progression-title">My progression</h3></div><button id="customize-progression" type="button" class="practice-button custom-progression-open" hidden>Create from this progression</button><div class="custom-history-actions" role="group" aria-label="Progression editing"><button id="custom-undo" type="button" class="practice-button" disabled>Undo</button><button id="custom-redo" type="button" class="practice-button" disabled>Redo</button><button id="custom-add" type="button" class="practice-button">+ Add chord</button><button id="custom-delete" type="button" class="practice-button">Delete chord</button></div></div>
        <p id="chart-loop-status" class="practice-help" role="status">Click a chord to edit; hold to hear it. Drag across beats to select an inclusive loop.</p><div id="custom-beat-grid" class="custom-beat-grid" aria-label="Live progression chord sheet"></div><p id="custom-grid-help" class="practice-help"></p>      <div id="loop-controls" class="practice-block" hidden><label class="check"><input id="loop-enabled" type="checkbox">Loop selection</label><button id="chart-loop-clear" type="button" class="practice-button">Clear loop</button><div hidden data-loop-state><div id="loop-range" hidden><label>Selection unit<select id="loop-unit"><option value="chords">Whole chords</option><option value="beats">Beats</option></select></label><div id="loop-chord-fields" class="field-row"><label>Start chord<select id="loop-start"></select></label><label>End chord<select id="loop-end"></select></label></div><div id="loop-beat-fields" class="field-row" hidden><label>Start beat<input id="loop-beat-start" type="number" min="1" value="1" step="1"></label><label>End beat (included)<input id="loop-beat-end" type="number" min="1" value="1" step="1"></label></div><p id="loop-summary" class="practice-help"></p></div></div></div>

        <div class="custom-editor"><label>Chart title<input id="custom-name" maxlength="60"></label><label>Start a section at this chord<input id="custom-section" maxlength="32" placeholder="e.g. A, Bridge, Solo"></label>
          <label class="harmony-workflow-field">Choose first<select id="custom-harmony-workflow"><option value="chord">Chord → suggested modes</option><option value="mode">Mode → compatible chords</option></select></label>
          <label>Chord root<select id="custom-root">${names.map((name,index)=>`<option value="${index}">${name}</option>`).join('')}</select></label>
          <label>Chord type<select id="custom-chord">${chordTypeOptions()}</select></label>
          <label>Scale guide<select id="custom-mode" aria-describedby="custom-mode-help">${modeOptions()}</select></label><p id="custom-mode-help" class="practice-help"></p><p id="custom-edit-selection-status" class="practice-help" role="status" hidden></p>
          <label>Duration unit<select id="custom-duration-unit"><option value="bars">Bars</option><option value="beats">Beats</option></select></label><label id="custom-bars-label">Duration<select id="custom-bars"><option value="1">1 bar</option><option value="2">2 bars</option><option value="4">4 bars</option><option value="8">8 bars</option></select></label>
          <label id="custom-beats-label" hidden>Duration<select id="custom-beats">${Array.from({length:32},(_,i)=>`<option value="${i+1}">${i+1} beat${i?'s':''}</option>`).join('')}</select></label><label>Bass note<select id="custom-bass"><option value="">Chord root</option>${names.map((name,index)=>`<option value="${index}">${name} pedal / slash bass</option>`).join('')}</select></label>
        </div>
        <p id="custom-scale-check" class="context-check" hidden></p><button id="custom-compatible-mode" type="button" class="practice-button" hidden>Use compatible scale guide</button><div class="custom-actions"><button id="custom-left" type="button" class="practice-button" aria-label="Move chord left">← Move</button><button id="custom-right" type="button" class="practice-button" aria-label="Move chord right">Move →</button><button id="custom-duplicate" type="button" class="practice-button">Duplicate</button></div>
        <details class="custom-share"><summary>Share or copy progression</summary><textarea id="custom-text" rows="3" aria-label="Custom progression text" readonly></textarea><button id="custom-copy" type="button" class="practice-button">Copy progression</button></details>
        <p id="custom-status" class="practice-help" role="status">Edits are kept as a working draft in this browser.</p>
      </section>

    <section class="notes harmony-learning" aria-labelledby="notes-title">
      <div class="section-heading"><div><h2 id="notes-title">Under your fingers</h2><p id="seventh-chords-context" class="mode-map-context"></p></div><label class="exercise-label">Exercise <select id="exercise"><option value="scale">Scale</option><option value="arpeggio">Arpeggio</option></select></label></div>
      <div class="chord-stage"><span class="small-label" id="chord-caption">LET IT RING</span><p class="small-label current-chord-label">CURRENT CHORD</p><div id="chord-name">C<span>maj</span></div><p id="chord-notes">C · E · G</p></div>
      <label class="check characteristic-toggle"><input id="highlight-mode" type="checkbox" checked>Highlight modal colour notes</label><p id="characteristic-notes" class="practice-help"></p>

      <ol id="note-list" class="mode-harmony-map" aria-label="Scale degrees and their seventh chords"></ol>
      <p id="exercise-description">Play these notes on your instrument, at your own pace.</p>
    </section>

      <div id="preview-controls" hidden><p>While stopped, hold a chord to hear it. Release to stop; its diagrams stay selected.</p><span id="preview-status" role="status" hidden>Release to stop</span></div>

      <details class="learn-more"><summary>Learn more about this harmony</summary><p id="harmony-explanation" class="practice-help"></p></details>
    </section>

    <section id="mix-panel" class="mix panel workspace-page workspace-practice" aria-labelledby="mix-title"><div class="section-heading"><div><p class="eyebrow">SOUND DESK</p><h2 id="mix-title">Mixer</h2></div><button id="mix-collapse" class="panel-action" type="button" aria-controls="mix-sections" aria-expanded="true">Hide mixer</button></div>
      <p id="mixer-docked-note" class="practice-help" hidden>Mixer is open above the focus bar. <button id="mixer-return" type="button" class="panel-action">Return mixer here</button></p><div id="mix-sections" class="mix-sections">
        <section class="mix-levels mix-group" aria-labelledby="levels-title"><div class="levels-heading"><h3 id="levels-title">Levels &amp; effects</h3><button id="mixer-clear-solos" type="button" class="panel-action" disabled>Clear solos</button><button id="mixer-unmute-all" type="button" class="panel-action" disabled>Unmute all</button></div>
          <div class="master-output"><label for="master-volume">Master volume</label><input id="master-volume" type="range" min="0" max="100" value="100" aria-describedby="master-volume-help"><output id="master-volume-value" for="master-volume">100%</output><p id="master-volume-help" class="practice-help">Adjust overall loudness without changing the mix.</p></div>
          <div class="console-level-scroll" tabindex="0" aria-label="Scroll mixer channels"><div class="mix-level-grid">${MIX_CHANNELS.map(consoleChannel).join('')}</div></div>
        </section>
<div class="mixer-quick-switches" aria-label="Sound settings">${BACKING_CHANNELS.map(id=>`<input id="${id}" type="checkbox" hidden>`).join('')}<button type="button" id="open-sound-settings" class="panel-action">Sound settings →</button></div></div></section>
<section class="studio-tools panel workspace-page workspace-practice" aria-labelledby="practice-tools-title"><div class="section-heading"><h2 id="practice-tools-title">Practice tools</h2><span class="small-label">MAKE EACH SESSION COUNT</span></div>      <div class="pulse-shortcut-row"><span class="small-label">TEMPO SHORTCUTS</span><div id="tempo-shortcuts" class="tempo-shortcuts"></div><button id="tempo-save" type="button" class="practice-button">Save current tempo</button><span id="tempo-shortcut-status" class="practice-help" role="status"></span></div>      <div class="pulse-tool-grid">
        <details class="pulse-tool"><summary>Swing</summary><div class="pulse-tool-fields"><label>Eighth-note swing <output id="pulse-swing-value">Straight</output><input id="pulse-swing" type="range" min="0" max="100" value="0" aria-describedby="pulse-swing-help"></label><p id="pulse-swing-help" class="practice-help">Choose eighth notes to adjust swing. Backing grooves keep their own feel.</p></div></details>
        <details class="pulse-tool"><summary>Practice timer</summary><div class="pulse-tool-fields"><label>Session length (minutes; 0 = unlimited)<input id="pulse-minutes" type="number" min="0" max="180" step="1" value="0"></label><label class="check"><input id="pulse-finish-bar" type="checkbox" checked>Finish the current bar before stopping</label><output id="pulse-time" class="pulse-time" aria-live="off">0:00 elapsed</output><p class="practice-help">Timer starts after the count-in and resets for each session.</p></div></details>
        <details class="pulse-tool"><summary>Polyrhythm</summary><div class="pulse-tool-fields"><label>Overlay<select id="pulse-poly"><option value="0/2">Off</option><option value="3/2">3 against 2</option><option value="4/3">4 against 3</option><option value="5/4">5 against 4</option><option value="7/4">7 against 4</option><option value="2/3">2 against 3</option></select></label><div id="pulse-poly-beats" class="pulse-poly-beats" aria-label="Polyrhythm beats"></div><p class="practice-help">A higher click plays the overlay evenly over the selected main beats.</p></div></details>
      </div>
      <div class="practice-block tempo-training"><label class="check"><input id="trainer-enabled" type="checkbox">Tempo trainer</label><div id="trainer-controls" hidden><div class="trainer-fields"><label>Every <select id="trainer-bars"><option>1</option><option>2</option><option selected>4</option><option>8</option></select> bars</label><label>Increase <input id="trainer-increment" type="number" min="1" max="30" value="2"> BPM</label><label>Target <input id="trainer-target" type="number" min="30" max="240" value="120"> BPM</label></div><p id="trainer-status" class="practice-help" role="status">Starts at your selected tempo.</p></div></div>
      <div class="practice-block gap-training"><label class="check"><input id="gap-enabled" type="checkbox">Gap training</label><div id="gap-controls" hidden><div class="field-row"><label>Audible bars<select id="gap-play"><option>1</option><option>2</option><option selected>4</option><option>8</option></select></label><label>Gap bars<select id="gap-mute"><option>1</option><option>2</option><option>4</option></select></label></div><label class="check"><input id="gap-progressive" type="checkbox">Increase silence by one bar after each cycle</label><label class="template-field">Maximum silent bars<select id="gap-max"><option>2</option><option>4</option><option selected>8</option><option>16</option></select></label><label class="template-field">Mute during gaps<select id="gap-target"><option value="all">Click + backing</option><option value="click">Click only</option><option value="backing">Backing only</option></select></label><p class="practice-help">Keep time through the silent bars. Count-in remains audible.</p></div></div>
</section>
    <section class="sound-settings panel workspace-page workspace-settings" aria-labelledby="sound-settings-title"><div class="section-heading"><div><p class="eyebrow">SHAPE YOUR SOUND</p><h2 id="sound-settings-title">Sound Settings</h2></div></div><p class="practice-help">Choose a backing style, then unmute the instruments you want in the mixer.</p><section class="metronome-sound-settings workspace-group sound-instrument-card" id="sound-click"><div class="sound-section-heading"><h3>Metronome</h3><span class="sound-channel-state" data-sound-state="click"></span></div><label>Click sound<select id="pulse-sound"><option value="beep">Digital beep</option><option value="wood">Woodblock</option><option value="rim">Rim click</option><option value="soft">Soft click</option></select></label></section></section>
    <section class="practice-roadmap panel workspace-page workspace-progress" aria-labelledby="practice-roadmap-title">
      <div class="practice-roadmap-heading"><div><p class="eyebrow">METHODICAL PRACTICE</p><h2 id="practice-roadmap-title">Learning path</h2><p id="practice-roadmap-context" class="guitar-help"></p></div><div class="practice-roadmap-progress"><strong id="practice-roadmap-percent">0%</strong><span id="practice-roadmap-count">0 of 0 complete</span></div></div>
      <div class="practice-roadmap-bar" aria-hidden="true"><i id="practice-roadmap-fill"></i></div>
      <button id="practice-roadmap-reset" type="button" class="practice-button">Reset this checklist</button>
      <div id="practice-roadmap-list" class="practice-roadmap-list"></div>
      <details class="practice-library"><summary>Mode library progress</summary><p class="guitar-help">Highest checklist completion for each mode at this root.</p><div id="practice-mode-library" class="practice-mode-library"></div></details>
    </section>
    <section class="guitar panel workspace-page workspace-guitar" aria-labelledby="guitar-title">
      <div class="section-heading"><div><p class="eyebrow">TAKE IT TO THE FRETBOARD</p><h2 id="guitar-title">Fretboard explorer</h2></div><button class="practice-button" data-learning-focus>Focus on this position</button><span class="small-label">STANDARD-TUNING VIEW · E A D G B E</span></div>
      <section class="progression-reference compact-reference" aria-label="Fretboard progression reference"></section>
      <div class="guitar-guide guitar-overview">
        <p id="guitar-scale"></p><p id="guitar-parent" class="guitar-help"></p><p id="guitar-scale-check" class="context-check" hidden></p>
        <div class="guitar-controls"><label>Position navigation<select id="featured-position"><option value="path" selected>Automatic route</option><option value="all">Choose positions yourself</option></select></label><label>Diagram<select id="fret-view"><option value="scale">Scale + chord tones</option><option value="arpeggio">Chord tones only</option></select></label><label>Labels<select id="fret-labels"><option value="notes">Note names</option><option value="degrees" selected>Scale degrees</option></select></label></div>
        <input type="hidden" id="pattern-start-route" value=""><input type="hidden" id="manual-position-route" value=""><div id="position-path-guide" class="position-path-guide" hidden><div class="position-path-heading"><label>Fretboard region<select id="position-region">${Object.entries(FRET_REGIONS).map(([id,region])=>`<option value="${id}" ${id==='middle'?'selected':''}>${region.name}</option>`).join('')}</select></label><label hidden>Selected chord position<select id="guitar-chord-position">${POSITIONS.map(p=>`<option value="${p.numeral}">${p.numeral} · ${p.shape} framework</option>`).join('')}</select></label><p>Automatic CAGED route · choose a region</p></div><div id="position-path" class="position-path"></div></div>
        <label class="check grip-toggle"><input id="show-grip" type="checkbox">Show chord voicing</label><p id="grip-preview-status" class="guitar-help" role="status" hidden>Chord on · click the active button to stop.</p>
        <div class="theory-controls shared-theory-controls"><label>Melodic overlay<select id="theory-view" aria-label="Melodic overlay"><option value="none">Off</option><option value="pentatonic">Pentatonic superimposition</option><option value="triads">Triad pairs</option></select></label><label id="theory-choice-label" hidden>Pentatonic source<select id="theory-choice" aria-label="Pentatonic source"><option value="">None</option></select></label></div><div id="theory-description"></div>
        <div class="guitar-legend"><span><i class="root"></i>Current root</span><span><i class="chord"></i>Chord tone</span><span><i class="scale"></i>Scale tone</span><span id="grip-legend"><i class="grip"></i>Chord voicing</span><span id="characteristic-legend"><i class="characteristic"></i>Modal colour note</span></div>
      </div>
      <div id="full-fretboard-panel" class="full-fretboard-panel"><div class="full-fretboard-toolbar"><div><strong>Full-neck map</strong><span>Frets 1–17 · click a CAGED region to focus it</span></div><label class="check full-fretboard-option"><input id="show-regions" type="checkbox" checked>Show positions</label><button id="full-fretboard-expand" type="button" class="practice-button full-fretboard-option">Fullscreen</button><button id="full-fretboard-collapse" type="button" class="practice-button" aria-expanded="true" aria-controls="full-fretboard">Hide map</button></div><div id="full-fretboard" class="full-fretboard-scroll"></div></div>
      <div id="position-overview" class="position-overview" role="tablist" aria-label="CAGED positions"></div>
      <div id="guitar-diagrams" class="guitar-diagrams"></div>
      <div class="position-navigation" aria-label="Position navigation"><button id="position-previous" type="button" class="practice-button">← Previous</button><span id="position-indicator" aria-live="polite"></span><button id="position-next" type="button" class="practice-button">Next →</button></div>
      <details class="guitar-guide learn-more"><summary>Learn more about the diagrams</summary><p class="guitar-help">CAGED names follow the current modal root. Major-scale modes share their parent-major fingerings.</p>
        <p class="guitar-help">Open shapes are shown an octave higher so all positions use fretted notes.</p>
      </details>
    </section>
    <section id="caged-exercise" class="caged-exercise panel workspace-page workspace-exercises" aria-labelledby="caged-exercise-title"></section>
  </div>
  <p id="error" class="error" role="alert" hidden></p>
  <footer><span><span class="footer-dot">●</span> Made for listening, not rushing.</span><span><a class="theme-preview-link" href="./themes.html">Compare themes</a> · Headphones on. Distractions off.</span></footer>
</main>
<div id="mini-transport" class="mini-transport" aria-label="Practice controls" hidden><section id="floating-mixer" class="floating-mixer panel" aria-labelledby="floating-mixer-title" hidden><div class="floating-mixer-heading"><h2 id="floating-mixer-title">Your mix</h2><button id="floating-mixer-close" type="button" class="practice-button" aria-label="Close mixer">Close</button></div><div id="floating-mixer-content"></div></section><button id="mini-play" class="practice-button" aria-pressed="false">Play</button><label><span id="mini-tempo-label">BPM</span><input id="mini-bpm" type="number" min="30" max="240" value="90" aria-label="Practice tempo"></label><div class="mini-harmony"><strong id="mini-chord">Am13</strong><span id="mini-mode">A Dorian</span></div><button id="mini-mixer" type="button" class="practice-button" aria-expanded="false" aria-controls="floating-mixer">Mixer</button><button id="mini-more" type="button" class="practice-button mini-more" aria-expanded="false" aria-controls="mini-detail-controls">Controls</button><div id="mini-detail-controls" class="mini-detail-controls"><div class="mini-harmony-controls"><label><span id="mini-root-purpose">Root</span><select id="mini-key" aria-label="Root note">${names.map((name,index)=>`<option value="${index}">${name}</option>`).join('')}</select></label><label>Mode<select id="mini-mode-select" aria-label="Mode">${modeOptions()}</select></label><label>Chord<select id="mini-chord-select" aria-label="Chord type"></select></label><label>Progression<select id="mini-progression" aria-label="Progression"><option value="off">New single-chord chart</option>${Object.entries(PROGRESSIONS).map(([id,template])=>`<option value="${id}">${template.name}</option>`).join('')}</select></label></div><div class="mini-pulse-options"><label class="check"><input id="mini-count-in" type="checkbox">One-bar count-in</label><label class="check"><input id="mini-accent" type="checkbox">Accent beat one</label></div></div><span id="mini-beat" aria-hidden="true">●</span><button id="exit-focus" class="practice-button" hidden>Exit focus</button></div>`;

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
const select = (id: string) => el<HTMLSelectElement>(id);
document.body.insertAdjacentHTML('beforeend',`<dialog id="pulse-large" class="pulse-large" aria-labelledby="pulse-large-title"><div class="pulse-large-toolbar"><h2 id="pulse-large-title">The pulse</h2><button id="pulse-large-close" type="button" class="practice-button">Close</button></div><div id="pulse-large-number" class="pulse-large-number">Ready</div><p id="pulse-large-status">Ready to practice</p><button id="pulse-large-play" type="button" class="practice-button">Start practicing</button></dialog>`);
let backingStyleUi:ReturnType<typeof installBackingStyles>|undefined;
let studyPathUi:ReturnType<typeof installStudyPath>|undefined;
let studyAdvancing=false,studyAdvanceToken=0;
let settings = { ...DEFAULTS, liveChartRevision:0, automaticBacking:true, key:9, mode: 'dorian', chord: 'min7', countIn:false, customProgression };
try{settings.guitarTuning=normalizeGuitarTuning(localStorage.getItem(GUITAR_TUNING_KEY));}catch{}
el('sound-settings-title').closest('.section-heading')!.insertAdjacentHTML('afterend',`<section class="workspace-group sound-instrument-card" aria-labelledby="guitar-tuning-title"><div class="sound-section-heading"><h3 id="guitar-tuning-title">Guitar tuning</h3></div><label>Instrument tuning<select id="guitar-tuning" aria-describedby="guitar-tuning-description">${GUITAR_TUNINGS.map(([value,name])=>`<option value="${value}">${name}</option>`).join('')}</select></label><p id="guitar-tuning-description" class="practice-help">Notation, note names and TAB stay in standard tuning. E♭ tuning lowers pitched playback by one semitone.</p></section>`);
select('guitar-tuning').value=String(settings.guitarTuning);
let livePlaybackSettings:any=null,livePlaybackStep=0;
const liveChangeStatus=document.createElement('p');liveChangeStatus.id='live-change-status';liveChangeStatus.className='practice-help mini-live-change';liveChangeStatus.setAttribute('role','status');liveChangeStatus.hidden=true;el('mini-transport').append(liveChangeStatus);
// The editor owns requested settings; musical displays follow the snapshot
// acknowledged by audio, keeping queued chart changes away from the playhead.
function withPlaybackSettings<T>(render:()=>T):T{
  if(!playing||!livePlaybackSettings)return render();
  const edit=settings,draft=customProgression,editStep=step;
  settings=livePlaybackSettings;customProgression=livePlaybackSettings.customProgression||draft;step=livePlaybackStep;
  try{return render();}finally{settings=edit;customProgression=draft;step=editStep;}
}

let master: GainNode | undefined;
let masterOutput:ReturnType<typeof createMasterOutput>|undefined;
let masterVolume=DEFAULT_MASTER_VOLUME;
try{masterVolume=masterVolumePercent(localStorage.getItem(MASTER_VOLUME_KEY));}catch{}
let harmonyFxSource:GainNode|undefined;
let compingGuitar:ReturnType<typeof createGuitarChannel>|undefined,sequenceGuitar:ReturnType<typeof createGuitarChannel>|undefined,guitarCabinet:AudioBuffer|null=null;
let fxBuses: ReturnType<typeof createFxBuses> | undefined;
let fxUi: ReturnType<typeof installFxControls> | undefined;
let playing = false;
let playbackCounting=false;
let busy = false;
let step = 0;
let context: AudioContext | undefined;
let node: AudioWorkletNode | undefined;
let installedSampleNames=new Set<string>(),sampleSettingsGeneration=0;
let stopping = false;
let guitarDegrees = true;
let perStringView:ReturnType<typeof installPerStringView>|undefined;
let previewHold: string | null = null;
let chartPreviewTimer:ReturnType<typeof setTimeout>|undefined;
let gripRingTimer: ReturnType<typeof setTimeout> | undefined;
let previewPreparation: Promise<void> | undefined;
let previewing = false;
let previewGripShape: string | null = null;
type TheorySuggestion = {id:string; name:string; rootPc?:number; pcs:number[]; names:string[]; degrees:string[]; explanation:string; groups?:{name:string; rootPc?:number; pcs:number[]; names:string[]}[]};
type TheoryView = {kind:'none'|'pentatonic'|'triads'; choiceId:string};
const theoryView:TheoryView = {kind:'none',choiceId:''};
const positionGrips = new Map<string, ReturnType<typeof recommendedGrip>>();
let overviewPosition = 'I';
let cagedMapAll=false;
let fullFretboardCollapsed=matchMedia('(max-width:700px)').matches;
try { const stored=localStorage.getItem('mehtronome-full-fretboard-collapsed');if(stored!==null)fullFretboardCollapsed=stored==='true'; } catch { /* Keep the context map open. */ }
const PRACTICE_PROGRESS_KEY='mehtronome-mode-practice-progress';
let practiceProgress:Record<string,string[]>={};
try{practiceProgress=JSON.parse(localStorage.getItem(PRACTICE_PROGRESS_KEY)||'{}')||{};}catch{practiceProgress={};}
let neckTraversalPanel:HTMLDivElement|undefined;
const exerciseView={traversalShiftStrings:2,traversalPositionOrder:'follow',traversalTurn:'note',traversalCell:'first',traversal:'position',traversalStrings:'0,1',traversalStart:5,traversalEnd:17,exactFingering:false,patternVariationsOpen:false,entryTone:'default',sequenceAdvance:1,sequenceOrder:'normal',arpeggioSequence:'stepwise',arpeggioPattern:'straight',arpeggioRegister:'up',arpeggioClose:false,arpeggioSource:'diatonic',arpeggioRoutine:'repeat',arpeggioApproach:'none',enclosureTarget:'all',enclosurePattern:'upper',fingering:'caged',inversion:0,fingeringFret:5,spreadSource:'chord',fingeringStringSet:0,study:'positional',material:'seventh',motion:'ascending',rhythm:'sixteenths',loop:false,backing:true,source:'',pattern:'groups3',display:'both',zoom:'comfortable',tempo:90,tempoLinked:true,loopStart:0,loopEnd:-1,autoTempo:false,autoEvery:4,autoIncrement:2,ceiling:160,stage:'full',startTone:'default',fretboard:true,setupOpen:false,chordDiagrams:false};
exerciseView.chordDiagrams=localStorage.getItem('mehtronome-notation-chord-diagrams')==='true';
input('pattern-start-route').value=localStorage.getItem('mehtronome-pattern-start-route')||'';
exerciseView.display=localStorage.getItem('mehtronome-notation-display')||'both';exerciseView.zoom=localStorage.getItem('mehtronome-notation-zoom')||'comfortable';
let studyHarmony:any,studyBoard:any,studyPosition:any;
let exerciseBackingStep=0;
let exercisePlan:any=null;
let exerciseMapSlot=-1;
function isAlignedStudy(){return settings.progression&&['guidetones','connections'].includes(exerciseView.study);}
let activeGoal='';
let gripOnly=false;
let exerciseReferenceExpanded=false;
let currentExerciseGroups:any[]=[];
let currentExercise:any[]=[];
let exerciseTimer:ReturnType<typeof setTimeout>|undefined;
let exerciseSources:AudioScheduledSourceNode[]=[];
const guitarNoteSources=new Set<AudioBufferSourceNode>();
const exerciseSourceTimes=new WeakMap<AudioScheduledSourceNode,{at:number,end:number,gain:GainNode,level:number}>();
let exerciseGuitarVolume=100;
try{const saved=localStorage.getItem('mehtronome-exercise-guitar-volume');if(saved!==null&&Number.isFinite(Number(saved)))exerciseGuitarVolume=Math.max(0,Math.min(100,Number(saved)));}catch{}
let exerciseGuitarGain:GainNode|undefined;
function exerciseGuitarOutput(){
  if(!exerciseGuitarGain||exerciseGuitarGain.context!==context){
    exerciseGuitarGain=context!.createGain();exerciseGuitarGain.gain.value=exerciseGuitarVolume/100;
    exerciseGuitarGain.connect(master!);exerciseGuitarGain.connect(harmonyFxSource!);
  }
  return exerciseGuitarGain;
}
const exerciseBufferCache=new ExerciseBufferCache();
let exerciseBuffers=new Map<string,AudioBuffer>();
let exerciseNoteQueue:ExerciseAudioQueue|undefined;
let exerciseGuitarFilter:BiquadFilterNode|undefined;
let exercisePlaybackSequence:any[]=[];
let exercisePlaybackPlan:any=null;
let exerciseCursorKey='',exerciseCursorFrame=-Infinity,exerciseReferenceDirty=false,exerciseLegacyCycle=-1;
function exerciseGuitarInstrumentOutput(){
 if(!exerciseGuitarFilter||exerciseGuitarFilter.context!==context){exerciseGuitarFilter=context!.createBiquadFilter();exerciseGuitarFilter.type='lowpass';exerciseGuitarFilter.frequency.value=3100;exerciseGuitarFilter.Q.value=.45;exerciseGuitarFilter.connect(exerciseGuitarOutput());}
 return exerciseGuitarFilter;
}
function exerciseBufferRequests(tempo:number){
 const division=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;
 return exercisePlaybackPlan?exercisePlaybackPlan.events.map((e:any)=>({midi:e.note.midi,duration:exerciseNoteDuration(e.duration*60/tempo,e.resolution)})):exercisePlaybackSequence.map(note=>({midi:note.midi,duration:exerciseNoteDuration(60/tempo/division)}));
}
let exercisePlaying=false;
let exercisePreparing=false,exercisePrepareGeneration=0;
let noteAuditionGeneration=0;
let audioPreparation:Promise<void>|undefined;
let exerciseNextStart:number|undefined;
let exerciseTimelineStart:number|undefined;
let exerciseAnimationFrame=0;
let exerciseRepetitions=0;
let exerciseSymbolCycle=-1;
let exerciseSelectionStart:number|null=null,exerciseSelectionEnd:number|null=null;
let exerciseCellSelection:{cellId:number}|null=null;
let exerciseDragPointer:number|null=null,exerciseDragMoved=false,suppressExerciseNoteClick=false;
const EXERCISE_FAVOURITES_KEY='mehtronome-exercise-favourites';
let previewGeneration = 0;
let currentBpm = settings.bpm;
let focusView = false;

function escapeHtml(text:string) { return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }

function stopExercisePreview() {
  exercisePrepareGeneration++;exercisePreparing=false;
  const stopBacking=exercisePlaying&&exerciseView.backing&&!playing;
  clearTimeout(exerciseTimer);exerciseTimer=undefined;exerciseNoteQueue?.stop();exerciseBuffers.clear();exercisePlaybackSequence=[];exercisePlaybackPlan=null;exerciseCursorKey='';exerciseCursorFrame=-Infinity;exerciseLegacyCycle=-1;
  for(const source of exerciseSources){try{source.stop();}catch{}}
  exerciseSources=[];exercisePlaying=false;exerciseSymbolCycle=-1;exerciseNextStart=undefined;exerciseTimelineStart=undefined;exerciseRepetitions=0;cancelAnimationFrame(exerciseAnimationFrame);
  if(stopBacking){node?.port.postMessage({type:'stop'});renderProgressionReference();}
  const button=document.querySelector<HTMLButtonElement>('#exercise-preview');
  if(button){button.textContent='▶ Play exercise';button.setAttribute('aria-pressed','false');button.removeAttribute('aria-busy');}
  document.querySelectorAll('.exercise-note').forEach(note=>note.classList.remove('playing','played'));
  highlightExerciseCells(null);
  highlightLearningNote(null,currentExercise);syncMiniTransport();
  reflectExerciseSelection();if(exercisePlan&&currentExerciseGroups[0]?.harmony){exerciseMapSlot=Math.max(0,Math.min(currentExerciseGroups.length-1,exerciseMapSlot));updateProgressionMap(el('caged-exercise'),currentExerciseGroups[exerciseMapSlot],exerciseView.study);}refreshBackingSymbols();
}

function exerciseRange(){
  if(exerciseSelectionStart!==null){const other=exerciseSelectionEnd??exerciseSelectionStart;return {start:Math.min(exerciseSelectionStart,other),end:Math.max(exerciseSelectionStart,other),...(exerciseCellSelection||{})};}
  const end=exerciseView.loopEnd<0?currentExercise.length-1:Math.min(exerciseView.loopEnd,currentExercise.length-1);return {start:Math.min(exerciseView.loopStart,end),end};
}
function selectedExercise(){const range=exerciseRange();return currentExercise.slice(range.start,range.end+1);}
function reflectExerciseSelection(){
  const range=exerciseSelectionStart===null?null:exerciseRange();
  document.querySelectorAll<HTMLElement>('#caged-exercise .exercise-note').forEach(note=>{const index=Number(note.dataset.noteIndex);note.classList.toggle('range-selected',Boolean(range&&index>=range.start&&index<=range.end&&(!exerciseCellSelection||Number(note.dataset.cellIndex)===exerciseCellSelection.cellId)));});
  document.querySelectorAll<HTMLElement>('#caged-exercise .notation-cell').forEach(cell=>{const selected=Boolean(range&&Number(cell.dataset.rangeStart)>=range.start&&Number(cell.dataset.rangeEnd)<=range.end&&(!exerciseCellSelection||Number(cell.dataset.cellIndex)===exerciseCellSelection.cellId));cell.classList.toggle('cell-selected',selected);cell.setAttribute('aria-pressed',String(selected));});
  const playButton=document.querySelector<HTMLButtonElement>('#exercise-preview'),clearButton=document.querySelector<HTMLButtonElement>('#exercise-clear-range');
  if(playButton&&!exercisePreparing)playButton.textContent=exercisePlaying?(range?'■ Stop passage':'■ Stop exercise'):(range?'▶ Play selected passage':'▶ Play exercise');
  const description=document.querySelector<HTMLElement>('#exercise-range-description');if(description)description.textContent=range?`${range.end-range.start+1} notes selected. Play uses this passage${exerciseView.loop?' and repeats it':''}.`:'Drag across notes to select a passage.';
  if(clearButton){clearButton.disabled=!range;clearButton.hidden=!range;}
}
function updateExerciseCursor(frame=performance.now()){
  if(!exercisePlaying||!context||exerciseTimelineStart===undefined)return;
  if(frame-exerciseCursorFrame<33){exerciseAnimationFrame=requestAnimationFrame(updateExerciseCursor);return;}exerciseCursorFrame=frame;
  const sequence=exercisePlaybackSequence,divisions=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2,noteLength=60/exerciseView.tempo/divisions;
  const elapsed=context.currentTime-exerciseTimelineStart,countIn=settings.countIn?settings.beats*60/exerciseView.tempo:0;
  if(!exerciseView.backing&&playbackCounting&&elapsed>=countIn){playbackCounting=false;syncMiniTransport();}
  const status=document.querySelector<HTMLElement>('#exercise-playback-status'),progress=document.querySelector<HTMLElement>('#exercise-progress-fill');
  if(elapsed<countIn){const beat=Math.max(1,Math.ceil((countIn-elapsed)/(60/exerciseView.tempo)));if(status)status.textContent=`Count-in · ${settings.beats-beat+1} / ${settings.beats}`;}
  else if(sequence.length&&exercisePlan){
    const elapsedBeats=Math.max(0,elapsed-countIn)*exerciseView.tempo/60;
    const position=planPosition(exercisePlaybackPlan,elapsedBeats),scoreBeat=position.beat+(exercisePlaybackPlan.scoreStart||0);
    const index=position.event?.index??null;
    const changed=position.slot.slot!==exerciseMapSlot;
    if(changed&&currentExerciseGroups[position.slot.slot]?.harmony)showExerciseGroup(currentExerciseGroups[position.slot.slot]);
    const cursorKey=`${index}:${position.slot.slot}:${Math.floor(position.beat/settings.beats)}`;
    if(changed||cursorKey!==exerciseCursorKey){
     exerciseCursorKey=cursorKey;document.querySelectorAll('.exercise-note.playing').forEach(note=>note.classList.remove('playing'));
     if(index!==null)document.querySelectorAll<HTMLElement>(`.exercise-note[data-note-index="${index}"]`).forEach(note=>{const at=Number(note.dataset.startBeat),duration=Number(note.dataset.durationBeats);note.classList.toggle('playing',scoreBeat>=at-1e-6&&scoreBeat<at+duration-1e-6);});
     highlightExerciseCells(position.event);
     highlightLearningNote(index,currentExercise);
    }
    if(status)status.textContent=`${position.slot.chord} · ${index===null?'Rest':exerciseView.study==='guidetones'?'Hold guide tone':'Play '+exerciseView.study} · bar ${Math.floor(position.beat/settings.beats)+1} · ${exerciseView.tempo} BPM`;
    if(progress)progress.style.width=`${position.beat/exercisePlaybackPlan.duration*100}%`;
  }
  else if(sequence.length){
    const elapsedExercise=Math.max(0,elapsed-countIn),phraseDuration=sequence.length*noteLength;
    const cycleDuration=exerciseView.loop&&exerciseView.backing?barAlignedDuration(phraseDuration,60/exerciseView.tempo,settings.beats):phraseDuration;
    const cyclePosition=elapsedExercise%cycleDuration;const cycle=Math.floor(elapsedExercise/cycleDuration);if(cycle!==exerciseSymbolCycle){exerciseSymbolCycle=cycle;refreshBackingSymbols(cycle*cycleDuration*exerciseView.tempo/60);}
    const repetition=Math.floor(elapsedExercise/cycleDuration)+1;
    const resting=cyclePosition>=phraseDuration,index=resting?sequence.length-1:Math.min(sequence.length-1,Math.floor(cyclePosition/noteLength)),globalIndex=exerciseRange().start+index;
    const cursorKey=`${cycle}:${resting}:${globalIndex}`;
    if(cursorKey!==exerciseCursorKey){
     exerciseCursorKey=cursorKey;
     const sameCycle=cycle===exerciseLegacyCycle;
     if(!sameCycle){exerciseLegacyCycle=cycle;document.querySelectorAll('.exercise-note.played').forEach(note=>note.classList.remove('played'));}
     document.querySelectorAll('.exercise-note.playing').forEach(note=>{note.classList.remove('playing');if(sameCycle)note.classList.add('played');});
     document.querySelectorAll<HTMLElement>(`.exercise-note[data-note-index="${globalIndex}"]`).forEach(note=>note.classList.toggle('playing',!resting));
     highlightLearningNote(resting?null:globalIndex,currentExercise);
     if(!resting)document.querySelector(`[data-note-index="${globalIndex}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});
    }
    if(status)status.textContent=resting?`Rest · next repetition on beat 1 · ${exerciseView.tempo} BPM`:`Note ${index+1} / ${sequence.length} · repetition ${repetition} · ${exerciseView.tempo} BPM`;
    if(progress)progress.style.width=`${((index+1)/sequence.length)*100}%`;
  }
  const tempoControl=document.querySelector<HTMLInputElement>('#exercise-tempo');if(tempoControl&&document.activeElement!==tempoControl)tempoControl.value=String(exerciseView.tempo);
  exerciseAnimationFrame=requestAnimationFrame(updateExerciseCursor);
}

function renderCagedExercise(position:any,board:any,info:any,positionPath:any[]|undefined=undefined) {
  noteAuditionGeneration++;
  const oldVariations=el('caged-exercise').querySelector<HTMLDetailsElement>('.exercise-pattern-variations');if(oldVariations)exerciseView.patternVariationsOpen=oldVariations.open;
  const oldReference=el('caged-exercise').querySelector<HTMLDetailsElement>('.progression-reference details');if(oldReference)exerciseReferenceExpanded=oldReference.open;
  linkExerciseFingering(exerciseView,perStringView?.selection(),info);
  normalizeExerciseOptions(exerciseView);
  if(!['cell','full'].includes(exerciseView.stage))exerciseView.stage='full';
  const neck=acrossNeck(exerciseView);
  const perString=!neck&&exerciseView.fingering!=='caged';
  if(neck){board=neckRouteBoard(info,exerciseView);position={...position,neck:true};}
  if(perString){board=perStringExerciseChoice(info,exerciseView).board;position={...position,perString:true};}
  studyHarmony=info;studyBoard=board;studyPosition=position;
  if(exerciseView.tempoLinked)exerciseView.tempo=settings.bpm;
  if(!settings.progression&&['guidetones','connections'].includes(exerciseView.study))exerciseView.study='harmonized';
  const chartHarmonies=settings.progression?Array.from({length:progressionDefinition(settings).roman.length},(_,index)=>chordInfo(index)):[info];
  const startRoute=patternStartRoute(chartHarmonies,input('pattern-start-route').value);
  const exerciseProgression=settings.progression?progressionOrder(settings).map((index:number)=>chordInfo(index)):[info];
  const suggestions=theoryOptions(info);
  if(exerciseView.study==='triadpairs'&&!suggestions.triadPairs.length)exerciseView.study='harmonized';
  const sourceChoices=exerciseView.study==='triadpairs'?suggestions.triadPairs:exerciseView.study==='pentatonic'?suggestions.pentatonics:[];
  const sourceChoice=sourceChoices.find((choice:any)=>choice.id===exerciseView.source)||sourceChoices[0];
  if(sourceChoice)exerciseView.source=sourceChoice.id;
  currentExerciseGroups=settings.progression||perString?[]:cagedStudy(board,info,exerciseView.study,exerciseView.material,exerciseView.motion,{progression:exerciseProgression,traversalTurn:exerciseView.traversalTurn,source:sourceChoice?.id,pattern:exerciseView.pattern,sequenceAdvance:exerciseView.sequenceAdvance,sequenceOrder:hasChromaticSide(exerciseView.study)?exerciseView.sequenceOrder:'normal',arpeggioSequence:exerciseView.arpeggioSequence,arpeggioPattern:exerciseView.arpeggioPattern,arpeggioRegister:exerciseView.arpeggioRegister,arpeggioClose:exerciseView.arpeggioClose,arpeggioSource:exerciseView.arpeggioSource,arpeggioRoutine:exerciseView.arpeggioRoutine,arpeggioApproach:exerciseView.arpeggioApproach,enclosureTarget:exerciseView.enclosureTarget,enclosurePattern:exerciseView.enclosurePattern});
  if(!settings.progression&&!perString&&!['positional','positionalscale'].includes(exerciseView.study)&&currentExerciseGroups.length){const entry=sequenceEntryState(currentExerciseGroups,info,exerciseView);currentExerciseGroups=currentExerciseGroups.slice(entry.index);if(hasExerciseCellOrder(exerciseView)&&!hasChromaticSide(exerciseView.study))currentExerciseGroups=currentExerciseGroups.map((cell:any,i:number)=>exerciseView.study==='harmonized'?orderedArpeggioRootCell(cell,exerciseView.sequenceOrder,i):orderedScaleCell(cell,exerciseView.sequenceOrder,i));if(entry.warning)currentExerciseGroups[0].warning=entry.warning;}
  if(!perString&&!settings.progression&&exerciseView.study==='grip')currentExerciseGroups=gripStudy(board,info);
  if(!perString&&!settings.progression&&exerciseView.study==='positional')currentExerciseGroups=positionalArpeggio(board,exerciseArpeggioHarmony(info,exerciseView.material),exerciseView.motion);
  if(neck){
    const order=settings.progression?progressionOrder(settings):[0];
    currentExerciseGroups=neckExerciseGroups(exerciseProgression,settings.progression?order.map((i:number)=>progressionPlaybackBeatDurations(settings)[i]):null,{...exerciseView,source:sourceChoice?.id||''});
    exercisePlan=settings.progression?progressionStudyPlan(currentExerciseGroups,order,progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats),settings.beats,exerciseView.study,exerciseView.rhythm):null;
  }else if(perString){
    const order=settings.progression?progressionOrder(settings):[0],durations=settings.progression?order.map((i:number)=>progressionPlaybackBeatDurations(settings)[i]):null;
    const positions=positionPath||exerciseProgression.map(()=>position);
    if(PER_STRING_STUDIES.has(exerciseView.study))currentExerciseGroups=perStringExerciseGroups(exerciseProgression,durations,positions,exerciseView);
    else{
      const choices=exerciseProgression.map((h:any)=>perStringExerciseChoice(h,exerciseView));
      currentExerciseGroups=progressionExerciseGroups(exerciseProgression,durations||exerciseProgression.map(()=>settings.beats*4),board,{...exerciseView,source:sourceChoice?.id||'',positionPath:positions,boardFor:(_:any,i:number)=>choices[i].board,harmonyFor:(h:any,i:number)=>choices[i].entry.harmony||h});
      currentExerciseGroups=currentExerciseGroups.map((group:any,i:number)=>({...group,perString:true,position:{...group.position,perString:true},fingeringLabel:choices[i].label,applicationLabel:choices[i].label,warning:[group.warning,choices[i].warning].filter(Boolean).join(' ')}));
    }
    exercisePlan=settings.progression?progressionStudyPlan(currentExerciseGroups,order,progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats),settings.beats,exerciseView.study,exerciseView.rhythm):null;
  }else if(isAlignedStudy()){
    positionPath=positionPath||progressionPositionPath(exerciseProgression,{name:'Selected position',start:board.start,end:board.end});
    if(!['ascending','descending'].includes(exerciseView.motion))exerciseView.motion='ascending';
    currentExerciseGroups=alignedProgressionGroups(board,exerciseProgression,exerciseView.study,exerciseView.material,exerciseView.motion,positionPath?.map((choice:any,index:number)=>fretboardFor(exerciseProgression[index],choice.geometryShape)));
    if(exerciseView.stage==='cell')currentExerciseGroups=currentExerciseGroups.map((group:any,index:number)=>index?{...group,notes:[]}:group);
    let globalStart=0;currentExerciseGroups=currentExerciseGroups.map((group:any,slot:number)=>{const harmony=exerciseProgression[slot],current={...group,globalStart,harmony,board:positionPath?fretboardFor(harmony,positionPath[slot].geometryShape):fullFretboardFor(harmony,board.start,board.end),position:positionPath?.[slot]||position,fixedRegion:!positionPath};globalStart+=group.notes.length;return current;});
    exerciseView.autoTempo=false;
    exercisePlan=progressionStudyPlan(currentExerciseGroups,progressionOrder(settings),progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats),settings.beats,exerciseView.study,exerciseView.rhythm);
  }else if(settings.progression){
    currentExerciseGroups=progressionExerciseGroups(exerciseProgression,progressionOrder(settings).map((index:number)=>progressionPlaybackBeatDurations(settings)[index]),board,{...exerciseView,startTones:progressionOrder(settings).map((index:number)=>startRoute.choices[index]),rhythm:exerciseView.rhythm,source:sourceChoice?.id||'',positionPath});
    exercisePlan=progressionStudyPlan(currentExerciseGroups,progressionOrder(settings),progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats),settings.beats,exerciseView.study,exerciseView.rhythm);
  }else{exercisePlan=null;if(exerciseView.stage==='cell'&&exerciseView.study!=='positionalscale')currentExerciseGroups=shortCell(currentExerciseGroups);}
  if(settings.progression&&exerciseView.backing)exerciseView.autoTempo=false;
  if(!exercisePlan){
    const single=singleChordExercisePlan(currentExerciseGroups,info,board,position,exerciseView.study,exerciseView.rhythm,settings.beats);
    if(perString&&currentExerciseGroups.length){
      const group=currentExerciseGroups[0];
      Object.assign(single.groups[0],{perString:true,fingeringLabel:group.fingeringLabel,applicationLabel:group.applicationLabel,warning:group.warning});
      if(group.warning)single.plan.warnings.push(group.warning);
    }
    currentExerciseGroups=single.groups;exercisePlan=single.plan;
  }
  if(exercisePlan){const resolved=withExerciseResolution(currentExerciseGroups,exercisePlan,contentMaterial(exerciseView)==='triad'?'triad':'seventh');currentExerciseGroups=resolved.groups;exercisePlan=resolved.plan;}
  currentExerciseGroups.forEach((group:any)=>{const value=startRoute.choices[progressionOrder(settings)[group.slot]]||'inherit';group.startOverride=value;group.startBadge=value==='inherit'?'':cardStartLabel(group.harmony,value);});
  currentExercise=flattenExercise(currentExerciseGroups);
  const rhythmName={eighths:'Eighth notes',triplets:'Eighth-note triplets',sixteenths:'Sixteenth notes'}[exerciseView.rhythm] || 'Eighth notes';
  const nonDiatonic=exerciseProgression.some((h:any)=>h.scalePcs.length!==7);
  const materialName=nonDiatonic?(exerciseView.material==='triad'?'three-note stacks':exerciseView.material==='extensions'?'five-note stacks':'four-note stacks'):(exerciseView.material==='triad'?'triads':exerciseView.material==='extensions'?'ninth chords':'tetrads');
  const alternatingLabel={ascending:'Up/down',descending:'Down/up','up-down':'Up/down then down/up','down-up':'Down/up then up/down'}[exerciseView.motion] || 'Up/down';
  const materialTitle=materialName[0].toUpperCase()+materialName.slice(1);
  let studyName={enclosures4:'4-note enclosures',enclosures5:'5-note enclosures',positionalscale:'Positional scale',grip:'Exact grip notes',positional:'Positional arpeggio',arpgroups3:'Arpeggio groups of three',arpgroups4:'Arpeggio groups of four',harmonized:`${exerciseView.arpeggioSource==='selectedChord'?'Selected-chord':exerciseView.arpeggioSource==='chordRoots'?'Chord-tone-rooted':'Diatonic'} ${materialName}`,alternating:`${alternatingLabel} diatonic ${materialName}`,chordtones:`${materialTitle} from core chord tones`,chordtonesalternating:`${alternatingLabel} ${materialName} from core chord tones`,cells:'Diatonic 1–2–3–5 cells',thirds:'Scale in thirds',fourths:'Scale in fourths',sixths:'Scale in sixths',digital1324:'Diatonic 1–3–2–4 pattern',groups3:'Scale groups of three',groups4:'Scale groups of four',inversions:`${info.name}${info.suffix} inversion cycle`,enclosures:'Jazz enclosures · above then below',enclosuresbelowabove:'Jazz enclosures · below then above',enclosureschromatic:'Tight chromatic enclosures',enclosuresdouble:'Double jazz enclosures',enclosuresfiveone:'Five-note enclosure 1',enclosuresfivetwo:'Five-note enclosure 2',enclosuresfivethree:'Five-note enclosure 3',enclosuresfivefour:'Five-note enclosure 4',approach:`Chromatic approach-note ${materialName}`,doubleapproach:'Double chromatic approaches',chromaticneighbors:'Chromatic neighbour cells',approacheverytone:`Approach every ${materialName.slice(0,-1)} tone`,upperstructure:'3–5–7–9 upper structures',guidetones:'Guide-tone voice leading',connections:`Voice-led ${materialName} connections`,triadpairs:'Triad-pair lines',pentatonic:'Superimposed pentatonic sequences'}[exerciseView.study] || `Harmonized ${materialName}`;
  if(SCALE_SEQUENCE_STUDIES.has(exerciseView.study))studyName=(exerciseView.study.startsWith('arpseq_')?(exerciseView.material==='triad'?'Triad arpeggio sequences · ':'Seventh arpeggio sequences · '):'Scale sequences · ')+((nonDiatonic||exerciseView.study.startsWith('arpseq_'))&&scaleSequenceFamily(exerciseView.study)==='intervals'?'Note steps · '+scaleSequenceLabel(exerciseView.study).split(' · ')[1]:scaleSequenceLabel(exerciseView.study));
  if(exerciseView.study==='positional')studyName=(exerciseView.material==='triad'?'Triad arpeggio':'Seventh arpeggio')+' · Continuous traversal';
  if(ARPEGGIO_PATTERN_STUDIES.has(exerciseView.study)&&exerciseView.arpeggioPattern!=='straight')studyName+=' · '+arpeggioPatternLabel(exerciseView.arpeggioPattern,exerciseView.arpeggioClose);
  if(exerciseView.study==='harmonized'){const routine={alternate:'alternate cells',inversions:'cycle entry tones',connected:'nearest entry'}[exerciseView.arpeggioRoutine as 'alternate'];if(routine)studyName+=' · '+routine;if(exerciseView.arpeggioApproach!=='none')studyName+=' · approach '+exerciseView.arpeggioApproach;}
  if(exerciseView.study==='harmonized'&&exerciseView.arpeggioSequence!=='stepwise')studyName+=' · '+groupPatternLabel(exerciseView.arpeggioSequence,ARPEGGIO_ROOT_SEQUENCES[exerciseView.arpeggioSequence].label,'arpeggios');
  if(hasExerciseCellOrder(exerciseView)&&exerciseView.sequenceOrder!=='normal'){const order=scaleCellOrders(exerciseView.study==='harmonized'?exerciseView.arpeggioSequence:exerciseView.study).find(([id])=>id===exerciseView.sequenceOrder)?.[1];if(scaleSequenceFamily(exerciseView.study==='harmonized'?exerciseView.arpeggioSequence:exerciseView.study)==='intervals')studyName=studyName.replace(/1–\d+$/,order||'');else studyName+=' · '+(exerciseView.study==='harmonized'?'Arpeggio-root order · ':'')+order;}
  if((SCALE_SEQUENCE_STUDIES.has(exerciseView.study)||exerciseView.study==='harmonized')&&exerciseView.sequenceAdvance!==1)studyName+=' · advance '+exerciseView.sequenceAdvance;
  const enclosureOrder=(ENCLOSURE_PATTERNS as Record<string,Record<string,number[]>>)[exerciseView.study]?.[exerciseView.enclosurePattern];if(enclosureOrder)studyName+=' · '+enclosurePatternLabel(enclosureOrder);
  if(neck)studyName+=' · '+traversalLabel(exerciseView);
  if(perString)studyName+=' · '+perStringExerciseChoice(info,exerciseView).label;
  const scaleStepLabels:Record<string,string>={thirds:'Alternate-note pairs',fourths:'Scale-step pairs · 1–4',sixths:'Scale-step pairs · 1–6',harmonized:`Alternate-note ${materialName}`,alternating:`Alternating alternate-note ${materialName}`,upperstructure:'Scale-step arpeggios · 3–5–7–9'};
  if(nonDiatonic&&!SCALE_SEQUENCE_STUDIES.has(exerciseView.study)&&scaleStepLabels[exerciseView.study])studyName=scaleStepLabels[exerciseView.study];
  const menuOptions=exerciseMenuOptions(exerciseView.study);
  const directionOptions=menuOptions.directions.map(([value,label]:string[])=>`<option value="${value}">${label}</option>`).join('');
  const exerciseRoot=exerciseView.study==='pentatonic'&&sourceChoice?.rootPc!==undefined?info.scaleNames[info.scalePcs.indexOf(sourceChoice.rootPc)]:info.scaleNames[0];
  const notation=exercisePlan?progressionNotationSvg(exercisePlan,`${studyName} · progression`,{chordDiagrams:exerciseView.chordDiagrams&&!perString&&!neck}):exerciseNotationSvg(currentExerciseGroups,exerciseView.rhythm,`${studyName} · ${exerciseRoot}`,{backingChord:settings.progression?'':info.name+info.suffix,groupChords:false,beats:settings.beats,chordDiagram:exerciseView.chordDiagrams?{harmony:info,board,position}:null});
  const favouriteOptions=exerciseFavourites().map((item:any,index:number)=>`<option value="${index}">${escapeHtml(item.study)} · ${escapeHtml(item.pattern||item.material)}</option>`).join('');
  const sourceControl=sourceChoices.length?`<label>${exerciseView.study==='triadpairs'?'Triad pair':'Pentatonic source'}<select id="exercise-source">${sourceChoices.map((choice:any)=>`<option value="${escapeHtml(choice.id)}">${escapeHtml(choice.name)}</option>`).join('')}</select></label>`:'';
  const startGroup=currentExerciseGroups[settings.progression?Math.max(0,progressionOrder(settings).indexOf(step)):0];
  const startSpan=startGroup?.positionalSpan||[...new Map((startGroup?.board||board).notes.filter((note:any)=>(startGroup?.harmony||info).scalePcs.includes(note.pc)).map((note:any)=>[note.midi,note])).values()].sort((a:any,b:any)=>a.midi-b.midi),startHarmony=startGroup?.harmony||info;
  const scaleEntry=exerciseView.study==='positionalscale';
  const startAvailable=scaleEntry?startSpan.filter((note:any)=>arpeggioHarmony(startHarmony).chordPcs.includes(note.pc)):startSpan;
  const startChoices=scaleEntry?startHarmony.scalePcs.map((pc:number,i:number)=>{const degrees=MODES[startHarmony.mode as keyof typeof MODES].degrees,role=degrees[i].match(/\d+/)?.[0],value=degrees.filter((d:string)=>d.match(/\d+/)?.[0]===role).length===1?'degree:'+role:'scale:'+i,entry=scaleStartingState(startSpan,startHarmony,exerciseView.motion==='descending',value);return {value,interval:MODES[startHarmony.mode as keyof typeof MODES].degrees[i],note:entry.note,supported:entry.supported,reason:entry.warning};}).filter((c:any)=>c.note):arpeggioStartingChoices(startAvailable,startHarmony,exerciseView.motion==='descending').filter((choice:any)=>choice.occurrence===0).slice(0,4).map((c:any)=>({...c,supported:true,reason:''}));
  if(scaleEntry&&exerciseView.startTone!=='default'&&!exerciseView.startTone.startsWith('scale:')&&!exerciseView.startTone.startsWith('degree:')){const saved=arpeggioStartingChoices(startAvailable,startHarmony,exerciseView.motion==='descending').find((c:any)=>c.value===exerciseView.startTone);if(saved)startChoices.push({...saved,supported:true,reason:''});}
  const startLabel=(choice:any)=>`${choice.interval} · ${choice.note.name}${Math.floor(choice.note.midi/12)-1} · string ${6-choice.note.string}, fret ${choice.note.fret}`;
  const startControl=!perString&&exercisePlan&&['positional','positionalscale'].includes(exerciseView.study)?`<label>Starting note<select id="exercise-start-note"><option value="default" ${exerciseView.startTone==='default'?'selected':''}>Position boundary</option>${startChoices.map((choice:any)=>`<option value="${choice.value}" ${exerciseView.startTone===choice.value?'selected':''} ${choice.supported?'':'disabled'} title="${escapeHtml(choice.reason)}">${escapeHtml(startLabel(choice))}${choice.supported?'':' · unavailable for this phrase'}</option>`).join('')}${exerciseView.startTone!=='default'&&!startChoices.some((choice:any)=>choice.value===exerciseView.startTone)?`<option value="${exerciseView.startTone}" selected>Degree ${exerciseView.startTone.split(':')[0]} · using available substitute</option>`:''}</select>${exerciseView.rhythm==='triplets'?`<small class="practice-help">${escapeHtml(startGroup?.warning||'Each new chord or position starts on the chosen chord degree. Repeated bars continue the pattern; turns can cross bar lines.')}</small>`:''}</label>`:'';
  const initialGroup=currentExerciseGroups.find((g:any)=>!g.resolution)||startGroup,entryHarmony=initialGroup?.harmony||info,entryBoard=initialGroup?.board||board;
  const entryCells=!['positional','positionalscale'].includes(exerciseView.study)?cagedStudy(entryBoard,entryHarmony,exerciseView.study,exerciseView.material,exerciseView.motion,{...exerciseView,sequenceOrder:'normal',source:sourceChoice?.id}):[];
  const entryChoices=sequenceEntryChoices(entryCells,entryHarmony,exerciseView),entryLabel=exerciseView.study==='harmonized'?'First arpeggio root':(exerciseView.study.startsWith('enclosures')||exerciseView.study==='doubleapproach')?'First target':'Starting note';
  const sequenceStartControl=entryCells.length&&!(exerciseView.study==='harmonized'&&entryChoices.length<2&&exerciseView.entryTone==='default')?`<label>${entryLabel}<select id="exercise-entry-note"><option value="default">Position boundary</option>${entryChoices.map((c:any)=>`<option value="${c.value}">${escapeHtml(c.label)}</option>`).join('')}${exerciseView.entryTone!=='default'&&!entryChoices.some((c:any)=>c.value===exerciseView.entryTone)?`<option value="${exerciseView.entryTone}" disabled>Saved entry unavailable · using boundary</option>`:''}</select></label>`:'';
  const enclosurePatterns=ENCLOSURE_PATTERNS[exerciseView.study as keyof typeof ENCLOSURE_PATTERNS];
  const selectedEnclosureFamily=enclosurePatterns?enclosureFamily(enclosurePatterns[exerciseView.enclosurePattern as keyof typeof enclosurePatterns]||Object.values(enclosurePatterns)[0]):'unique';
  const enclosureControl=exerciseView.study.startsWith('enclosures')?`<label>Cell size<select id="exercise-enclosure-size"><option value="3">3 notes · including target</option><option value="4">4 notes · including target</option><option value="5">5 notes · including target</option></select></label>${!enclosurePatterns?`<label>Neighbour order<select id="exercise-enclosure-neighbours"><option value="enclosures">Diatonic above · chromatic below</option><option value="enclosuresbelowabove">Chromatic below · diatonic above</option><option value="enclosureschromatic">Chromatic above and below</option></select></label>`:''}<label>Target<select id="exercise-enclosure-target"><option value="all">All core chord tones</option>${exerciseArpeggioHarmony(entryHarmony,exerciseView.material).intervals.slice(0,4).map((degree:string,index:number)=>`<option value="${index}">${escapeHtml(degree)} · ${escapeHtml(exerciseArpeggioHarmony(entryHarmony,exerciseView.material).tones[index])}</option>`).join('')}</select></label>${enclosurePatterns?`<label>Pattern family<select id="exercise-enclosure-family">${['unique','repeated'].map(family=>`<option value="${family}">${family==='unique'?'Unique approaches':'Repeated approaches'} · ${Object.values(enclosurePatterns).filter(offsets=>enclosureFamily(offsets)===family).length}</option>`).join('')}</select></label><label>Approach order · target included<select id="exercise-enclosure-pattern">${enclosurePatternGroups(exerciseView.study,selectedEnclosureFamily).map(group=>`<optgroup label="${group.label}">${group.items.map(([id,offsets])=>`<option value="${id}">${enclosurePatternLabel(offsets)}</option>`).join('')}</optgroup>`).join('')}</select></label>`:''}`:'';
  const scaleFamily=scaleSequenceFamily(exerciseView.study);
  const libraryControls=['positional','positionalscale'].includes(exerciseView.study)?`<label>Material<select id="exercise-traversal-material"><option value="positionalscale">Scale notes</option><option value="positional">Core chord tones</option></select></label>`:SCALE_SEQUENCE_STUDIES.has(exerciseView.study)?`<label>Pattern family<select id="exercise-scale-family">${Object.entries(SCALE_SEQUENCE_FAMILY_LABELS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>${exerciseView.study.startsWith('arpseq_')?'Order of consecutive arpeggio tones':'Note order'}<select id="exercise-scale-pattern">${SCALE_SEQUENCE_FAMILIES[scaleFamily as keyof typeof SCALE_SEQUENCE_FAMILIES].map(([id,name])=>`<option value="${exerciseView.study.startsWith('arpseq_')?'arpseq_':''}${id}">${(nonDiatonic||exerciseView.study.startsWith('arpseq_'))&&scaleFamily==='intervals'?(exerciseView.study.startsWith('arpseq_')?'Arpeggio-tone steps · ':'Scale steps · ')+name.split(' · ')[1]:name}</option>`).join('')}</select></label>`:'';
  const advanceUnit=exerciseView.study==='harmonized'?'roots':exerciseView.study.startsWith('arpseq_')?'arpeggio steps':'scale steps';
  const sequenceControls=hasExerciseCellOrder(exerciseView)||SCALE_SEQUENCE_STUDIES.has(exerciseView.study)||exerciseView.study==='harmonized'?`${exerciseView.study==='pentatonic'||hasChromaticSide(exerciseView.study)?'':`<label>Cell advance<select id="exercise-sequence-advance"><option value="1">1 ${advanceUnit.slice(0,-1)}</option><option value="2">2 ${advanceUnit}</option><option value="3">3 ${advanceUnit}</option></select></label>`}${hasExerciseCellOrder(exerciseView)?`<label>Cell order<select id="exercise-sequence-order">${scaleCellOrders(exerciseView.study==='harmonized'?exerciseView.arpeggioSequence:exerciseView.study).filter(([id])=>id!=='cycle'||[3,4].includes(exerciseView.study==='harmonized'?entryCells[0]?.rootParts?.length:entryCells[0]?.notes?.length)).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>`:''}`:'';
  const arpeggioFamily=arpeggioPatternFamily(exerciseView.arpeggioPattern),arpeggioVariants=arpeggioPatternGroups(exerciseView.material,arpeggioFamily);
  const arpeggioPatternControl=ARPEGGIO_PATTERN_STUDIES.has(exerciseView.study)?`<label>Arpeggio source<select id="exercise-arpeggio-source"><option value="diatonic">All scale roots</option><option value="chordRoots">Chord-tone roots</option><option value="selectedChord">Selected chord</option></select></label><label>Root sequence<select id="exercise-arpeggio-sequence">${arpeggioSequenceGroups().map(group=>`<optgroup label="${group.label}">${group.items.map(([id,name])=>`<option value="${id}">${exerciseView.arpeggioSource!=='diatonic'&&['seconds','thirds','fourths','fifths','sixths','sevenths','octaves'].includes(id)?'Root steps · '+name.split(' · ')[1]:name}</option>`).join('')}</optgroup>`).join('')}</select></label><label>Pattern family<select id="exercise-arpeggio-family">${arpeggioFamilies(exerciseView.material).map(([id,name]:string[])=>`<option value="${id}">${name}</option>`).join('')}</select></label>${arpeggioVariants.length?`<label>Order within each arpeggio<select id="exercise-arpeggio-pattern">${arpeggioVariants.map((group:any)=>`<optgroup label="${group.label}">${group.items.map(([id,name]:string[])=>`<option value="${id}">${name}</option>`).join('')}</optgroup>`).join('')}</select></label>`:''}${exerciseView.arpeggioPattern!=='straight'?`<label>Cell register<select id="exercise-arpeggio-register"><option value="up">Above entry</option><option value="down">Below entry</option><option value="alternating">Alternate · above first</option><option value="alternatingDown">Alternate · below first</option></select></label>`:''}<label>Order routine<select id="exercise-arpeggio-routine"><option value="repeat">Repeat selected order</option><option value="alternate">Reverse alternate cells</option><option value="inversions">Cycle entry tones</option><option value="connected">Nearest entry to next arpeggio</option></select></label><label>Chromatic preparation<select id="exercise-arpeggio-approach"><option value="none">None</option><option value="below">Semitone below each tone</option><option value="above">Semitone above each tone</option><option value="directional">Follow cell direction</option></select></label>`:'';
  const patternControl=exerciseView.study==='pentatonic'?`<label>Pattern<select id="exercise-pattern">${Object.entries(PENTATONIC_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>`:'';

  el('caged-exercise').innerHTML=`<section class="progression-reference compact-reference" aria-label="Exercise progression reference"></section><div class="exercise-heading"><div><p class="eyebrow">POSITION PRACTICE</p><h3 id="caged-exercise-title">${escapeHtml(studyName)}${neck?'':' · '+(perString?escapeHtml(perStringExerciseChoice(info,exerciseView).label):'Position '+position.numeral)}</h3></div><span>${settings.progression?'Follows chord progression':escapeHtml(info.scaleNames[0])+' '+escapeHtml(MODES[info.mode as keyof typeof MODES].name)} · ${exercisePlan&&exerciseView.study==='guidetones'?'Sustain through each chord':rhythmName}</span></div><div class="exercise-controls"><label>Exercise<select id="exercise-study"><optgroup label="Traversal & sequences"><option value="continuous">Continuous traversal</option><option value="scaleSequences">Scale sequences</option></optgroup><optgroup label="Arpeggios"><option value="arpeggioSequences">Arpeggio sequences</option><option value="harmonized">Arpeggio patterns</option></optgroup><optgroup label="Chromatic language"><option value="enclosureLibrary">Enclosures</option><option value="approach">Approach-note arpeggios</option><option value="doubleapproach">Double chromatic approaches</option><option value="chromaticneighbors">Chromatic neighbour cells</option></optgroup><optgroup label="Superimpositions"><option value="triadpairs">Triad-pair lines</option><option value="pentatonic">Pentatonic sequences</option></optgroup></select></label><label>Material<select id="exercise-material"><option value="triad">Triads</option><option value="seventh">Tetrads</option></select></label>${libraryControls}${sourceControl}${patternControl}${arpeggioPatternControl}${sequenceControls}${enclosureControl}${startControl}${sequenceStartControl}<label>${menuOptions.directionLabel}<select id="exercise-motion">${directionOptions}</select></label><label>Rhythm<select id="exercise-rhythm"><option value="eighths">Eighth notes</option><option value="triplets">Eighth-note triplets</option><option value="sixteenths">Sixteenth notes</option></select></label><label class="check exercise-loop"><input id="exercise-loop" type="checkbox">Loop</label><label class="check exercise-backing"><input id="exercise-backing" type="checkbox">Use accompaniment</label></div><div class="exercise-practice-bar"><div class="exercise-tempo"><label>Exercise tempo <input id="exercise-tempo" type="number" min="30" max="240" value="${exerciseView.tempo}"></label><button type="button" class="practice-button" data-tempo-ratio=".5">½ speed</button><button type="button" class="practice-button" data-tempo-ratio=".75">¾ speed</button><button type="button" class="practice-button" data-tempo-ratio="1">Main tempo</button></div><div class="exercise-display"><label>Favourites<select id="exercise-favourites"><option value="">Saved exercises</option>${favouriteOptions}</select></label><label>Display<select id="exercise-display"><option value="both">Notation + TAB</option><option value="tab">TAB only</option><option value="notation">Notation only</option><option value="names">Note names + TAB</option><option value="degrees">Degrees + TAB</option></select></label><label>Size<select id="exercise-zoom"><option value="fit">Fit width</option><option value="comfortable">Comfortable</option><option value="large">Large</option></select></label><label class="check"><input id="exercise-chord-diagrams" title="Show the chord grip for each selected CAGED position" type="checkbox" ${exerciseView.chordDiagrams?'checked':''}>Chord diagrams</label></div><label class="check"><input id="exercise-auto-tempo" type="checkbox">Auto-increase tempo</label><label>Every <select id="exercise-auto-every"><option>2</option><option selected>4</option><option>8</option></select> repetitions</label><label>+ <input id="exercise-auto-increment" type="number" min="1" max="20" value="2"> BPM</label></div><div class="exercise-range-controls" aria-label="Notation selection"><button id="exercise-clear-range" type="button" class="practice-button" hidden disabled>Clear selection</button><span id="exercise-range-description" aria-live="polite">Drag across notation notes to select a passage.</span></div><div class="notation-scroll display-${exerciseView.display} zoom-${exerciseView.zoom}">${notation}</div><div class="exercise-footer"><div class="exercise-actions"><button id="exercise-history-back" type="button" class="practice-button" aria-label="Previous exercise">←</button><button id="exercise-history-forward" type="button" class="practice-button" aria-label="Next exercise">→</button><button id="exercise-favourite" type="button" class="practice-button">☆ Favourite</button><button id="exercise-export" type="button" class="practice-button">Export SVG</button><button id="exercise-print" type="button" class="practice-button">Print / PDF</button><button id="exercise-focus" type="button" class="practice-button" aria-pressed="false">Focus notation</button><button id="exercise-preview" type="button" class="practice-button" aria-pressed="false" ${playing||stopping||!currentExercise.length?'disabled':''}>▶ Play exercise</button></div></div>`;
  renderProgressionReference();
  select('exercise-study').querySelector<HTMLOptionElement>('option[value=triadpairs]')!.disabled=!suggestions.triadPairs.length;
  select('exercise-study').value=libraryExerciseValue(exerciseView.study);
  select('exercise-material').value=exerciseView.material;
  if(document.getElementById('exercise-entry-note'))select('exercise-entry-note').value=exerciseView.entryTone;
  const collectionLabels=exerciseCollectionLabels(exerciseView.study,nonDiatonic);
  for(const option of Array.from(select('exercise-study').options)){const name=collectionLabels.studies[option.value as keyof typeof collectionLabels.studies];if(name)option.textContent=name;}
  Array.from(select('exercise-material').options).forEach((option,index)=>option.textContent=collectionLabels.materials[index]);
  if(['positional','positionalscale'].includes(exerciseView.study))select('exercise-traversal-material').value=exerciseView.study;
  if(SCALE_SEQUENCE_STUDIES.has(exerciseView.study)||exerciseView.study==='harmonized')select('exercise-sequence-advance').value=String(exerciseView.sequenceAdvance);
  if(exerciseView.study==='harmonized')select('exercise-arpeggio-sequence').value=exerciseView.arpeggioSequence;
  if(hasExerciseCellOrder(exerciseView))select('exercise-sequence-order').value=exerciseView.sequenceOrder;
  if(SCALE_SEQUENCE_STUDIES.has(exerciseView.study)){select('exercise-scale-family').value=scaleFamily;select('exercise-scale-pattern').value=exerciseView.study;}
  if(exerciseView.study.startsWith('enclosures')){select('exercise-enclosure-size').value=enclosurePatterns?exerciseView.study.slice(-1):'3';if(!enclosurePatterns)select('exercise-enclosure-neighbours').value=exerciseView.study;}
  if(ARPEGGIO_PATTERN_STUDIES.has(exerciseView.study)){select('exercise-arpeggio-source').value=exerciseView.arpeggioSource;select('exercise-arpeggio-routine').value=exerciseView.arpeggioRoutine;select('exercise-arpeggio-approach').value=exerciseView.arpeggioApproach;select('exercise-arpeggio-family').value=arpeggioFamily;if(arpeggioVariants.length)select('exercise-arpeggio-pattern').value=exerciseView.arpeggioPattern;if(exerciseView.arpeggioPattern!=='straight'){select('exercise-arpeggio-register').value=exerciseView.arpeggioRegister;const label=select('exercise-motion').closest('label')!;label.firstChild!.textContent='Travel through position ';Array.from(select('exercise-motion').options).forEach(option=>option.textContent=option.value==='ascending'?'Low to high':'High to low');}}
  if(exerciseView.study.startsWith('enclosures'))select('exercise-enclosure-target').value=exerciseView.enclosureTarget;
  if(enclosurePatterns){select('exercise-enclosure-family').value=selectedEnclosureFamily;select('exercise-enclosure-pattern').value=Object.hasOwn(enclosurePatterns,exerciseView.enclosurePattern)?exerciseView.enclosurePattern:'upper';}
  if(sourceChoice)select('exercise-source').value=sourceChoice.id;
  if(exerciseView.study==='pentatonic')select('exercise-pattern').value=exerciseView.pattern;
  select('exercise-material').disabled=!menuOptions.material;
  select('exercise-material').closest('label')!.hidden=!menuOptions.material;
  select('exercise-motion').value=exerciseView.motion;
  select('exercise-motion').disabled=false;
  select('exercise-rhythm').value=exerciseView.rhythm;
  input('exercise-loop').checked=exerciseView.loop;
  input('exercise-backing').checked=exerciseView.backing;
  select('exercise-display').value=exerciseView.display;select('exercise-zoom').value=exerciseView.zoom;
  input('exercise-auto-tempo').checked=exerciseView.autoTempo;select('exercise-auto-every').value=String(exerciseView.autoEvery);input('exercise-auto-increment').value=String(exerciseView.autoIncrement);
  refreshExerciseFavourites();
  const focusButton=el<HTMLButtonElement>('exercise-focus'),notationFocused=el('caged-exercise').classList.contains('notation-focused');
  focusButton.textContent=notationFocused?'Exit notation focus':'Focus notation';focusButton.setAttribute('aria-pressed',String(notationFocused));
  const exerciseOptions=Array.from(select('exercise-study').options),exerciseIndex=exerciseOptions.findIndex(option=>option.value===libraryExerciseValue(exerciseView.study));
  const previousExercise=el<HTMLButtonElement>('exercise-history-back'),nextExercise=el<HTMLButtonElement>('exercise-history-forward');
  previousExercise.disabled=exerciseIndex<=0;nextExercise.disabled=exerciseIndex<0||exerciseIndex>=exerciseOptions.length-1;
  previousExercise.title=exerciseIndex>0?`Previous: ${exerciseOptions[exerciseIndex-1].text}`:'First exercise';
  nextExercise.title=exerciseIndex>=0&&exerciseIndex<exerciseOptions.length-1?`Next: ${exerciseOptions[exerciseIndex+1].text}`:'Last exercise';
  learningView(el('caged-exercise'),{perString,guitarVolume:exerciseGuitarVolume,locked:exercisePlaying||exercisePreparing,board,info,position,groups:currentExerciseGroups,notes:currentExercise,study:exerciseView.study,source:sourceChoice,stage:exerciseView.stage,rhythm:exerciseView.rhythm,backing:exerciseView.backing,fretboard:exerciseView.fretboard,ceiling:exerciseView.ceiling,setupOpen:exerciseView.setupOpen,aligned:!!exercisePlan&&isAlignedStudy(),adaptive:settings.progression&&!isAlignedStudy(),progressionSteps:progressionOrder(settings),inspectedStep:step,navigation:select('featured-position').value,region:select('position-region').value,progression:settings.progression,progressionBacking:settings.progression&&exerciseView.backing,timingWarnings:exercisePlan?.warnings,guidePaths:['guidetones','connections'].includes(exerciseView.study)?guideToneExamples(exerciseProgression):[]});
  if(!neck)arpeggioFingeringControls(el('caged-exercise'),exerciseView,info,perString,exercisePlaying||exercisePreparing);
  el('caged-exercise').querySelector('.exercise-heading')!.insertAdjacentHTML('afterend',traversalControls(exerciseView,'exercise',exercisePlaying||exercisePreparing));
  organizeExerciseCatalogue(el('caged-exercise'),exerciseView,!!suggestions.triadPairs.length,nonDiatonic);
  reflectExerciseSelection();
  exerciseMapSlot=-1;if(settings.progression&&currentExerciseGroups[0]?.harmony){exerciseMapSlot=Math.max(0,progressionOrder(settings).indexOf(step));updateProgressionMap(el('caged-exercise'),currentExerciseGroups[exerciseMapSlot],exerciseView.study);}
  refreshBackingSymbols();reserveChordBands(el('caged-exercise'));
  void document.fonts.ready.then(()=>reserveChordBands(el('caged-exercise')));
}

function backingChordAt(beat:number){const config=exerciseBackingConfig(),index=config.progression?progressionStepAtBeat(config,beat):0,info=harmonyAt(config,index);return info.name+info.suffix;}
function refreshBackingSymbols(baseBeat=0){if(exercisePlan)return;const division=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;updateBackingSymbols(el('caged-exercise'),backingChordAt,division,settings.beats,exercisePlaying?exerciseRange():{start:0,end:currentExercise.length-1},baseBeat);}

function exerciseBackingConfig(){
  if(settings.progression)return {...passageBackingSettings(resolutionBackingSettings(settings,exercisePlan),exercisePlaybackPlan),trainerEnabled:false,gapEnabled:false,extensionMorph:false};
  if(!studyHarmony)return settings;
  return {...settings,progression:false,key:studyHarmony.chordPcs[0],chord:studyHarmony.chordId,mode:studyHarmony.scalePcs[0]===studyHarmony.chordPcs[0]?studyHarmony.mode:recommendedMode(studyHarmony.chordId),extensionMorph:false};
}
function exerciseAudioSettings(){return {...exerciseBackingConfig(),bpm:exerciseView.tempo,sessionSeconds:exercisePlan&&!exerciseView.loop?(exercisePlaybackPlan||exercisePlan).duration*60/exerciseView.tempo:0,sessionFinishBar:false};}
function changeExerciseTempo(value:number,linked=false){
 const oldTempo=exerciseView.tempo,nextTempo=Math.max(30,Math.min(240,Math.round(value)||settings.bpm));
 exerciseView.tempoLinked=linked;exerciseView.tempo=nextTempo;
 if(exercisePlaying&&context&&exerciseTimelineStart!==undefined&&nextTempo!==oldTempo){
  const now=context.currentTime,division=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;
  const phraseBeats=exercisePlaybackPlan?.duration??exercisePlaybackSequence.length/division;
  const cycleBeats=exerciseView.loop&&exerciseView.backing?barAlignedDuration(phraseBeats,1,settings.beats):phraseBeats;
  const timing=retimeExercise(now,exerciseTimelineStart,oldTempo,nextTempo,settings.countIn?settings.beats:0,phraseBeats,cycleBeats);
  clearTimeout(exerciseTimer);exerciseTimer=undefined;exerciseNoteQueue?.stop();
  for(const source of exerciseSources){
   const voice=exerciseSourceTimes.get(source);if(!voice)continue;
   if(voice.at>now){try{source.stop();}catch{}continue;}
   // Keep the sounding attack; trim a faster note's tail rather than replay it.
   if(nextTempo>oldTempo&&voice.end>now){const end=now+(voice.end-now)*oldTempo/nextTempo;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(voice.level,now);voice.gain.gain.setValueAtTime(voice.level,Math.max(now,end-.015));voice.gain.gain.linearRampToValueAtTime(0,end);source.stop(end);voice.end=end;}
  }
  exerciseTimelineStart=timing.timelineStart;exerciseCursorKey='';
  if(exerciseView.backing)node?.port.postMessage({type:'exercise-tempo',bpm:nextTempo,remainingBeats:timing.remainingBeats});
  fxBuses?.setTempo(nextTempo);
  scheduleExercise(timing.cycleStart,undefined,now);
 }
 const control=document.querySelector<HTMLInputElement>('#exercise-tempo');if(control)control.value=String(nextTempo);
 syncMiniTransport();
}
function scheduleExercise(scheduledStart?:number,timelineOrigin?:number,resumeAfter?:number) {
  if(!context||!master||!currentExercise.length||!exercisePlaying)return;
  const divisions=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;
  const noteLength=60/exerciseView.tempo/divisions,sequence=exercisePlaybackSequence;
  const countIn=scheduledStart===undefined&&settings.countIn?settings.beats*60/exerciseView.tempo:0;
  const start=scheduledStart??context.currentTime+.12+countIn;
  if(exerciseTimelineStart===undefined){exerciseTimelineStart=timelineOrigin??start-countIn;updateExerciseCursor();}
  const events=exercisePlaybackPlan?exercisePlaybackPlan.events.map((e:any)=>({note:e.note,accent:e.accent,sustain:e.resolution,at:start+e.start*60/exerciseView.tempo,length:e.duration*60/exerciseView.tempo})):sequence.map((note,index)=>({note,at:start+index*noteLength,length:noteLength}));
  if(!exerciseNoteQueue||exerciseNoteQueue.context!==context)exerciseNoteQueue=new ExerciseAudioQueue(context,({note,at,length,accent,sustain}:any)=>{
    if(!exercisePlaying||!context)return;
    const duration=exerciseNoteDuration(length,sustain),release=Math.min(.045,duration*.3),key=exerciseBufferCache.key(context,note.midi,duration);
    const buffer=exerciseBuffers.get(key)||exerciseBufferCache.get(context,note.midi,duration);
    const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.playbackRate.value=guitarTuningRatio(settings.guitarTuning);guitarNoteSources.add(source);
    const offset=Math.max(0,context.currentTime+.005-at),begin=at+offset,end=at+duration;
    if(begin>=end)return;
    gain.gain.setValueAtTime(accent ? .42 : .3,begin);gain.gain.setValueAtTime(accent ? .42 : .3,Math.max(begin,end-release));gain.gain.exponentialRampToValueAtTime(.0001,end);
    source.connect(gain).connect(exerciseGuitarInstrumentOutput());source.start(begin,offset);source.stop(end);exerciseSources.push(source);exerciseSourceTimes.set(source,{at:begin,end,gain,level:accent ? .42 : .3});
    source.onended=()=>{guitarNoteSources.delete(source);source.disconnect();gain.disconnect();const index=exerciseSources.indexOf(source);if(index>=0)exerciseSources.splice(index,1);};
  });
  exerciseNoteQueue.enqueue(resumeAfter===undefined?events:events.filter((event:any)=>event.at>=resumeAfter));
  if(exerciseView.loop&&exerciseView.autoTempo&&(exerciseRepetitions+1)%exerciseView.autoEvery===0){
   const nextTempo=Math.min(Math.max(exerciseView.tempo,exerciseView.ceiling),exerciseView.tempo+exerciseView.autoIncrement),generation=exercisePrepareGeneration;
   void exerciseBufferCache.prepare(context,exerciseBufferRequests(nextTempo),()=>generation!==exercisePrepareGeneration);
  }
  const phraseDuration=exercisePlaybackPlan?exercisePlaybackPlan.duration*60/exerciseView.tempo:sequence.length*noteLength;
  const duration=exerciseView.loop&&exerciseView.backing?barAlignedDuration(phraseDuration,60/exerciseView.tempo,settings.beats):phraseDuration;
  const nextStart=start+duration;exerciseNextStart=nextStart;
  const lookahead=exerciseView.autoTempo||studyPathUi?.repeatEnabled()?0:Math.min(1,Math.max(.2,duration*.25));
  // A backed, timed one-shot ends on the engine's sample-counted completion
  // message. A wall timer can outrun the audio thread under CPU load.
  if(!exerciseView.loop&&exerciseView.backing&&exercisePlan)return;
  const complete=()=>{
    if(!exercisePlaying||!context)return;
    const remaining=nextStart-context.currentTime;
    if((!exerciseView.loop||studyPathUi?.repeatEnabled())&&remaining>0){exerciseTimer=setTimeout(complete,Math.max(10,remaining*1000+60));return;}

    if(exerciseView.loop&&studyPathUi?.repeatDue()){void advanceRandomStudy('exercise');return;}
    if(exerciseView.loop&&exercisePlaying){exerciseRepetitions++;if(exerciseView.autoTempo&&exerciseRepetitions%exerciseView.autoEvery===0){exerciseView.tempo=Math.min(Math.max(exerciseView.tempo,exerciseView.ceiling),exerciseView.tempo+exerciseView.autoIncrement);exerciseTimelineStart=nextStart-(settings.countIn?settings.beats*60/exerciseView.tempo:0);syncMiniTransport();queueAudioSettings({...exerciseBackingConfig(),bpm:exerciseView.tempo});}scheduleExercise(nextStart);}else stopExercisePreview();
  };
  exerciseTimer=setTimeout(complete,Math.max(0,(nextStart-context.currentTime-(exerciseView.loop?lookahead:-.06))*1000));
}

async function toggleExercisePreview() {
  if(studyAdvancing){studyAdvanceToken++;return;}

  if(exercisePlaying||exercisePreparing){stopExercisePreview();return;}
  if(playing||busy||stopping||!currentExercise.length)return;
  stopPreview();
  const generation=++exercisePrepareGeneration;exercisePreparing=true;el('exercise-preview').textContent='Loading… click to cancel';el('exercise-preview').setAttribute('aria-busy','true');syncMiniTransport();
  try{
    await prepareAudio();if(generation!==exercisePrepareGeneration)return;
    exercisePlaybackSequence=selectedExercise();exercisePlaybackPlan=exercisePlan?passagePlaybackPlan(exercisePlan,exerciseSelectionStart===null?null:exerciseRange(),exerciseView.backing):null;
    const prepared=await exerciseBufferCache.prepare(context!,exerciseBufferRequests(exerciseView.tempo),()=>generation!==exercisePrepareGeneration);
    if(!prepared||generation!==exercisePrepareGeneration)return;exerciseBuffers=prepared;
    exercisePreparing=false;el('exercise-preview').removeAttribute('aria-busy');playbackCounting=settings.countIn;exercisePlaying=true;exerciseBackingStep=0;if(exercisePlaybackPlan&&settings.progression)showExerciseGroup(currentExerciseGroups[exercisePlaybackPlan.slots[0].slot]);syncMiniTransport();refreshBackingSymbols();
    const backingStart=exerciseView.backing?context!.currentTime+.12:undefined;
    if(exerciseView.backing){const sampleNames=sampleNamesForSettings(exerciseAudioSettings());postPreparedAudio(node!,{type:'start',startTime:backingStart,sampleNames,settings:{...exerciseAudioSettings(),countIn:settings.countIn}});installedSampleNames=new Set(sampleNames);}
    const button=el<HTMLButtonElement>('exercise-preview');button.textContent='■ Stop exercise';button.setAttribute('aria-pressed','true');
    reflectExerciseSelection();
    if(backingStart!==undefined){const countIn=settings.countIn?settings.beats*60/exerciseView.tempo:0;scheduleExercise(backingStart+countIn,backingStart);}
    else scheduleExercise();
  }catch(error){stopExercisePreview();el('error').textContent=error instanceof Error?error.message:'Could not preview this exercise.';el('error').hidden=false;}
}

function chordInfo(index: number) { return harmonyAt(playing&&livePlaybackSettings?livePlaybackSettings:settings, index); }
function renderProgressionReference(activeStep=step,exerciseOnly=false){return withPlaybackSettings(()=>renderProgressionReferenceDisplay(activeStep,exerciseOnly));}
function renderProgressionReferenceDisplay(activeStep=step,exerciseOnly=false) {
  const template=progressionDefinition(settings),durations=progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats);
  const order=settings.progression?progressionOrder(settings):[0];
  const active=settings.progression?activeStep:0,info=chordInfo(active);
  const next=order[(Math.max(0,order.indexOf(active))+1)%order.length];
  const label=(index:number)=>{const chord=chordInfo(index);return chord.name+chord.suffix;};
  const scale=(chord:ReturnType<typeof chordInfo>)=>`${chord.scaleNames[0]} ${MODES[chord.mode as keyof typeof MODES].name}`;
  const title=settings.progression?`${template.name}${settings.loopEnabled?' · Selected loop':''}`:'Pedal chord · sustained harmony';
  const cards=order.map((index:number)=>{
    const chord=chordInfo(index),bars=durations[index],duration=settings.loopEnabled&&settings.loopUnit==='beats'?`${progressionPlaybackBeatDurations(settings)[index]} beats`:settings.template==='custom'?durationLabel(index):`${bars} bar${bars===1?'':'s'}`;
    return `<li><button type="button" class="reference-chord ${index===active?'current':''}" ${index===active?'aria-current="step"':''} data-reference-step="${index}" title="While stopped, hold to hear this chord" ${playing||exercisePlaying?'disabled':''}><strong>${escapeHtml(label(index))}</strong><span>${escapeHtml(chord.roman)}${settings.progression?` · ${duration}`:''}</span><small>${escapeHtml(scale(chord))}</small></button></li>`;
  }).join('');
  document.querySelectorAll<HTMLElement>(exerciseOnly?'#caged-exercise .progression-reference':'.progression-reference').forEach(element=>{
    const referenceExpanded=element.querySelector<HTMLDetailsElement>('details')?.open??(element.getAttribute('aria-label')==='Exercise progression reference'?exerciseReferenceExpanded:false);
    if(exercisePlaying&&exerciseView.backing&&!settings.progression&&element.getAttribute('aria-label')==='Exercise progression reference'){element.innerHTML=`<p><b>Static study backing:</b> ${escapeHtml(studyHarmony.name+studyHarmony.suffix)} · the main progression setup is retained.</p>`;return;}
    element.innerHTML=`<div class="reference-heading"><div><p class="eyebrow">HARMONY REFERENCE</p><h4>${escapeHtml(title)}</h4></div><span class="reference-meter">${settings.beats} beats / bar${settings.progression?` · ${settings.template==='custom'||settings.loopUnit==='beats'?order.reduce((sum:number,index:number)=>sum+progressionPlaybackBeatDurations(settings)[index],0)+'-beat loop':order.reduce((sum:number,index:number)=>sum+durations[index],0)+'-bar loop'}`:''}</span></div><ol class="reference-chords">${cards}</ol><p class="reference-preview-help">While stopped, hold a chord to hear it. Release to stop.</p><div class="reference-current"><span><b>Current:</b> ${escapeHtml(label(active))} · ${escapeHtml(info.tones.join(' · '))}</span><span><b>Scale guide:</b> ${escapeHtml(scale(info))}</span>${settings.progression?`<span><b>Next:</b> ${escapeHtml(label(next))}</span>`:''}</div>`;
    const compatibility=scaleCompatibility(info);if(compatibility&&element.getAttribute('aria-label')!=='Fretboard progression reference')element.insertAdjacentHTML('beforeend',`<p class="context-check">${escapeHtml(compatibility)}</p>`);
    const context=musicalContext(settings,activeStep);
    if(element.classList.contains('compact-reference')){element.querySelector('ol')?.remove();element.querySelector('.reference-preview-help')?.remove();element.querySelector('.reference-heading')?.remove();element.querySelector('.reference-current')?.insertAdjacentHTML('afterbegin',`<span><b>Modal tonic:</b> ${escapeHtml(context.current.scaleNames[0])}</span>`);}
    if(settings.progression&&settings.template==='custom')element.insertAdjacentHTML('beforeend',sectionControls());
    applyStudioIcons(element);
  });
}
function enrichProgressionCards(){
 document.querySelectorAll<HTMLButtonElement>('#position-path [data-route-step],.exercise-position-route [data-route-step]').forEach(button=>{
  const index=Number(button.dataset.routeStep),chord=chordInfo(index);
  const beats=progressionPlaybackBeatDurations(settings)[index],duration=`${beats} beat${beats===1?'':'s'}`;
  const segment=progressionTimeline(settings).find((item:any)=>item.step===index),start=segment?.start??0;
  const firstBar=Math.floor(start/settings.beats)+1,lastBar=Math.floor((start+beats-1)/settings.beats)+1;
  const barLabel=firstBar===lastBar?`Bar ${firstBar}`:`Bars ${firstBar}–${lastBar}`;
  button.setAttribute('aria-label',`${barLabel}: inspect ${chord.name}${chord.suffix}, Position ${button.dataset.position}`);
  button.querySelector('.route-harmony')?.remove();
  button.insertAdjacentHTML('beforeend',`<small class="route-harmony">${escapeHtml(barLabel)} · ${escapeHtml(chord.roman)} · ${escapeHtml(duration)}<br>${escapeHtml(chord.scaleNames[0]+' '+MODES[chord.mode as keyof typeof MODES].name)}</small>`);
  button.title='Click to inspect; hold to hear. Space also auditions the chord.';
 });
}

function renderMusic(skipExercise=false,positionOverride:any=null){return withPlaybackSettings(()=>renderMusicDisplay(skipExercise,positionOverride));}
function renderMusicDisplay(skipExercise=false,positionOverride:any=null) {
  const referenceFocus=(document.activeElement as HTMLElement)?.closest<HTMLButtonElement>('button[data-reference-step]');
  const focusedReference=referenceFocus?.closest('.progression-reference')?.getAttribute('aria-label');
  const focusedReferenceStep=referenceFocus?.dataset.referenceStep;
  const template = progressionDefinition(settings);
  step = settings.progression ? step % template.roman.length : 0;
  const info = chordInfo(step);
  const order = progressionOrder(settings);
  el('loop-controls').hidden = !settings.progression;
  el('loop-range').hidden = !settings.loopEnabled;
  el('loop-summary').textContent = `${order.map((i:number)=>{const c=chordInfo(i);return c.name+c.suffix;}).join(' → ')} · ${beatLength(progressionTimeline(settings).reduce((sum:number,segment:any)=>sum+segment.duration,0))}. ${settings.loopUnit==='beats'?'Beat selection clips the first and last chord to the chosen range.': 'Original chord durations are kept.'}`;
  el('chord-name').innerHTML = `${info.name}<span>${info.suffix}</span>`;
  el('chord-notes').textContent = info.tones.join(' · ');

  const jazz = template.kind === 'jazz';
  const modal = template.kind === 'modal';
  const custom = template.kind === 'custom';
  el('chord-caption').textContent = settings.progression && modal ? `${progressionDurations(settings).reduce((sum:number,bars:number)=>sum+bars,0)}-BAR MODAL LOOP` : !settings.progression ? 'LET IT RING' : settings.loopEnabled ? `${progressionTimeline(settings).reduce((sum:number,segment:any)=>sum+segment.duration,0)}-BEAT SELECTED LOOP` : custom ? `${progressionBeatDurations(settings).reduce((sum:number,beats:number)=>sum+beats,0)}-BEAT CUSTOM LOOP` : jazz ? `${progressionDurations(settings).reduce((sum: number, bars: number) => sum + bars, 0)}-BAR JAZZ LOOP` : template.bars === 2 ? 'TWO BARS PER CHORD' : 'ONE BAR PER CHORD';
  el('harmony-explanation').textContent = [scaleCompatibility(info),spellingHelp(info)].filter(Boolean).join(' ')+' '+(modal ? ('explanation' in template ? String(template.explanation) : '') : MODES[info.mode as keyof typeof MODES].tip);

  const colour = characteristicNotes(info);
  const highlight = input('highlight-mode').checked;
  el('characteristic-notes').hidden = !highlight;
  el('characteristic-notes').textContent = `${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name} colour notes: ${colour.map((n: any)=>`${n.name} (${n.degree})`).join(' · ')}. Listen to their character against the chord.`;
  el('characteristic-legend').hidden = !highlight;
  const arpeggio = select('exercise').value === 'arpeggio';
  const modeDegrees=MODES[info.mode as keyof typeof MODES].degrees;
  el('seventh-chords-context').textContent=`${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name}`;
  el('note-list').classList.toggle('arpeggio-view',arpeggio);
  el('note-list').classList.toggle('octatonic',info.scalePcs.length===8);
  el('note-list').classList.toggle('hexatonic',info.scalePcs.length===6);
  el('note-list').classList.toggle('pentatonic',info.scalePcs.length===5);
  el('note-list').innerHTML=harmonizedSevenths(info).map(chord=>{
    const current=chord.root===info.midi[0]%12;
    const chordTone=info.chordPcs.includes(chord.root);
    const characteristic=highlight&&colour.some((note:any)=>note.pc===chord.root)&&(!arpeggio||chordTone);
    const suffix=chord.symbol.slice(chord.rootName.length);
    return `<li class="mode-seventh degree-stack${current?' current-root':''}${arpeggio&&!chordTone?' outside-arpeggio':''}" data-scale-degree="${chord.degree}" ${current?'aria-current="true"':''}>
      <div class="note scale-note${chordTone?' chord-tone':''}${characteristic?' characteristic':''}"><strong>${escapeHtml(chord.rootName)}</strong><small>Degree ${escapeHtml(modeDegrees[chord.degree-1])}</small></div>
      <span class="degree-link" aria-hidden="true"></span>
      <div class="seventh-layer"><h4 title="${escapeHtml(chord.quality)}" aria-label="${escapeHtml(chord.rootName+' '+chord.quality)}"><span class="seventh-root">${escapeHtml(chord.rootName[0])}<span class="seventh-accidentals">${escapeHtml(chord.rootName.slice(1))}</span></span><span class="seventh-suffix">${escapeHtml(suffix)}</span></h4>
        <p class="seventh-tones" aria-label="Chord tones: ${escapeHtml(chord.notes.join(', '))}">${chord.notes.map(note=>`<span class="chord-tone-note">${escapeHtml(note)}</span>`).join('<span class="tone-separator" aria-hidden="true">·</span>')}</p>
      </div>
    </li>`;
  }).join('');
  el('exercise-description').textContent=arpeggio?'Highlighted notes: current chord tones.':'Filled notes: current chord · dashed rings: modal colour notes.';

  const extensions=extensionChoices(info);
  el('extension-status').textContent=extensions.length?`Available extensions: ${extensions.map(choice=>choice.label).join(' · ')}`:'This scale has no additional extensions for the selected chord.';
  renderGuitar(skipExercise,positionOverride);
  syncMiniTransport();
  if(focusedReference&&focusedReferenceStep!==undefined){
    Array.from(document.querySelectorAll('.progression-reference')).find(reference=>reference.getAttribute('aria-label')===focusedReference)?.querySelector<HTMLButtonElement>(`button[data-reference-step="${focusedReferenceStep}"]`)?.focus({preventScroll:true});
  }
}
function practiceContext(info:any){return {root:info.scaleNames[0],mode:info.mode,chord:`${info.name}${info.suffix}`};}
function savePracticeProgress(){try{localStorage.setItem(PRACTICE_PROGRESS_KEY,JSON.stringify(practiceProgress));}catch{/* Keep progress for this session. */}}
function renderPracticeRoadmap(info:any){
  const context=practiceContext(info),key=curriculumKey(context),completed=practiceProgress[key]||[],done=new Set(completed);
  const count=completedCount(completed),percent=Math.round(count/PRACTICE_TASKS.length*100);
  const mode=MODES[info.mode as keyof typeof MODES];
  el('practice-roadmap-context').textContent=`${context.root} ${mode.name} · ${context.chord} · ${'family' in mode?mode.family:'Major scale'}`;
  el('practice-roadmap-percent').textContent=`${percent}%`;
  el('practice-roadmap-count').textContent=`${count} of ${PRACTICE_TASKS.length} checked`;
  (el('practice-roadmap-fill') as HTMLElement).style.width=`${percent}%`;
  const list=el('practice-roadmap-list'),open=new Set(Array.from(list.querySelectorAll<HTMLDetailsElement>('details[open]')).map(node=>node.dataset.checklistGroup));
  const focused=(document.activeElement as HTMLInputElement)?.dataset.practiceTask;
  const position=(document.getElementById('checklist-position') as HTMLSelectElement|null)?.value||overviewPosition;
  const previousIdea=(document.getElementById('checklist-idea') as HTMLSelectElement|null)?.value||'arpeggio',ideas=checklistIdeas(info);
  const idea=ideas.some(item=>item.id===previousIdea)?previousIdea:'arpeggio',colour=characteristicNotes(info)[0];
  list.innerHTML=checklistCards({completed,chord:context.chord,mode:mode.name,colour:colour?`${colour.name} (${colour.degree})`:null,position,ideas,idea,open,locked:playing||exercisePlaying||exercisePreparing});
  if(focused)list.querySelector<HTMLInputElement>(`[data-practice-task="${focused}"]`)?.focus({preventScroll:true});
  const root=context.root;
  el('practice-mode-library').innerHTML=Object.entries(MODES).map(([id,item]:any)=>{
    const value=modeProgress(practiceProgress,root,id),modePercent=Math.round(value/PRACTICE_TASKS.length*100);
    return `<div class="practice-mode-status${id===info.mode?' current':''}"><span>${escapeHtml(item.name)}</span><i><b style="width:${modePercent}%"></b></i><strong>${modePercent}%</strong></div>`;
  }).join('');
  applyStudioIcons(document.querySelector('.practice-roadmap')!);
}

function modeFirstHarmony(){return select('custom-harmony-workflow').value==='mode';}
function fillHarmonyChoices(chordId:string,currentMode:string){
 const reverse=modeFirstHarmony(),chord=select('custom-chord'),mode=select('custom-mode');
 chord.closest('label')!.firstChild!.textContent=reverse?'Compatible chord ':'Chord type ';
 mode.closest('label')!.firstChild!.textContent=reverse?'Mode ':'Scale guide ';
 const root=select('custom-root').closest('label')!;root.after(...(reverse?[mode.closest('label')!,chord.closest('label')!]:[chord.closest('label')!,mode.closest('label')!]));
 chord.disabled=false;
 if(!reverse){chord.innerHTML=chordTypeOptions();chord.value=chordId;fillChordScaleOptions(chordId,currentMode);return;}
 mode.innerHTML=modeOptions();mode.value=currentMode;
 const choices=chordChoicesForMode(currentMode),suggested=choices.find((c:any)=>c.suggested)?.id||'',ids=choices.map((c:any)=>c.id);
 const legacy=!ids.includes(chordId)?`<option value="${chordId}" disabled>${escapeHtml(CHORDS[chordId as keyof typeof CHORDS].name)} · outside selected mode</option>`:'';
 chord.innerHTML=legacy+modeChordGroups(currentMode).map((group:any)=>`<optgroup label="${escapeHtml(group.label)}">${group.choices.map((choice:any)=>`<option value="${choice.id}">${escapeHtml(choice.name)}${choice.id===suggested?' · suggested':''}</option>`).join('')}</optgroup>`).join('');chord.value=chordId;
 for(const option of Array.from(chord.options)){const choice=choices.find((c:any)=>c.id===option.value);if(choice){if(!choice.strict)option.textContent+=' · reduced guide';option.title=choice.explanation;}}
 el('custom-mode-help').textContent=`Changing mode keeps compatible chord qualities and replaces incompatible ones. “Reduced guide” may omit chord tones.`;
}
function fillChordScaleOptions(chordId:string,currentMode:string){
  const groups=compatibleScaleGroups(chordId),choices=groups.flatMap((g:any)=>g.choices);
  const known=MODES[currentMode as keyof typeof MODES];
  // Imported charts retain their sounding guide until the user edits it.
  // An incompatible stored value is shown disabled, never offered as a choice.
  const legacy=known&&!choices.some((choice:any)=>choice.id===currentMode)?`<option value="${currentMode}" disabled>${known.name} · incompatible saved guide</option>`:'';
  select('custom-mode').innerHTML=legacy+groups.map((group:any)=>`<optgroup label="${group.family}">${group.choices.map((choice:any)=>`<option value="${choice.id}">${choice.name}</option>`).join('')}</optgroup>`).join('');
  select('custom-mode').value=currentMode;
  el('custom-mode-help').textContent=legacy?'This saved guide omits a written chord tone. Choose a compatible mode or use the compatible-guide button.':`Full scales include every chord tone. Pentatonic/blues guides may omit tones; blues notes add passing colour.`;
}

function renderGuitar(skipExercise:any=false,positionOverride:any=null){return withPlaybackSettings(()=>renderGuitarDisplay(skipExercise,positionOverride));}
function renderGuitarDisplay(skipExercise:any=false,positionOverride:any=null) {
  skipExercise=skipExercise===true;
  if(!skipExercise&&(exercisePlaying||exercisePreparing))stopExercisePreview();
  if (previewGripShape) stopPreview();
  positionGrips.clear();
  const requestedGrip = input('show-grip').checked;
  let requestedFeatured = select('featured-position').value;
  if(!['all','path'].includes(requestedFeatured)){
    select('featured-position').value='path';
    requestedFeatured='path';
  }
  const pathRegion=FRET_REGIONS[select('position-region').value as keyof typeof FRET_REGIONS] || FRET_REGIONS.middle;
  const harmonies=settings.progression?Array.from({length:progressionDefinition(settings).roman.length},(_,index)=>chordInfo(index)):[];
  const automatic=settings.progression?progressionPositionPath(harmonies,pathRegion):[];
  const following=settings.progression&&requestedFeatured==='path';
  let path=automatic;
  if(settings.progression&&!following){const manual=manualPositionPath(harmonies,automatic,input('manual-position-route').value);path=manual.path;input('manual-position-route').value=manual.value;}
  const featured=settings.progression?path[step]?.numeral||'I':'all';
  el('position-path-guide').hidden=!settings.progression;
  select('position-region').parentElement!.hidden=!following;
  el('position-path-guide').querySelector('p')!.textContent=following?'Use the closest shapes to this region throughout the chart. Choose a shape to set this chord manually.':'Choose a chord card, then its shape. Other cards keep their positions.';
  select('guitar-chord-position').parentElement!.hidden=!settings.progression||following;
  el('guitar-title').closest('section')!.classList.add('has-featured');
  const info = chordInfo(step);
  const chord = `${info.name}${info.suffix}`;
  const mode = MODES[info.mode as keyof typeof MODES];
  const suggestions = theoryOptions(info) as {pentatonics:TheorySuggestion[];triadPairs:TheorySuggestion[]};
  for(const [kind,choices] of [['pentatonic',suggestions.pentatonics],['triads',suggestions.triadPairs]] as const){select('theory-view').querySelector<HTMLOptionElement>(`option[value=${kind}]`)!.disabled=!choices.length;if(theoryView.kind===kind&&!choices.length)theoryView.kind='none';}
  const theoryOptionsForView = theoryView.kind === 'triads' ? suggestions.triadPairs : suggestions.pentatonics;
  const selectedTheory = theoryView.kind === 'none' ? null : theoryOptionsForView.find(option=>option.id===theoryView.choiceId) || theoryOptionsForView[0];
  const showGrip=requestedGrip&&!selectedTheory;
  input('show-grip').disabled=Boolean(selectedTheory);select('fret-view').disabled=Boolean(selectedTheory);
  el('grip-legend').hidden=!showGrip;
  el('characteristic-legend').hidden=Boolean(selectedTheory)||!input('highlight-mode').checked;
  const legend=document.querySelector('.guitar-legend');
  if(legend){(legend.querySelector('.chord')!.parentElement as HTMLElement).hidden=Boolean(selectedTheory);(legend.querySelector('.scale')!.parentElement as HTMLElement).hidden=Boolean(selectedTheory)||select('exercise').value==='arpeggio'||showGrip&&gripOnly;}
  const displayStatus=document.getElementById('fretboard-display-status');if(displayStatus){displayStatus.hidden=!selectedTheory;displayStatus.textContent=selectedTheory?'Turn the overlay off to edit Diagram or Show chord voicing.':'';}
  const sourceLabel=el('theory-choice-label');sourceLabel.firstChild!.textContent=theoryView.kind==='triads'?'Triad pair ':'Pentatonic source ';select('theory-choice').setAttribute('aria-label',theoryView.kind==='triads'?'Triad pair':'Pentatonic source');
  theoryView.choiceId = selectedTheory?.id || '';
  select('theory-view').value=theoryView.kind;
  select('theory-choice').replaceChildren(...(selectedTheory?theoryOptionsForView.map(option=>new Option(option.name,option.id,option.id===selectedTheory.id,option.id===selectedTheory.id)):[new Option('None','')]));
  el('theory-choice-label').hidden=!selectedTheory;
  const overlayKey=document.getElementById('fretboard-overlay-key'),overlaySummary=document.getElementById('fretboard-overlay-summary'),overlayDetails=document.getElementById('fretboard-overlay-details');
  const keyMarkup=!selectedTheory?'':selectedTheory.groups?selectedTheory.groups.map((group,i)=>`<span class="theory-group-${i===0?'a':'b'}"><i>${i===0?'A':'B'}</i>${escapeHtml(group.name)}</span>`).join(''):'<span><i class="theory-pentatonic-key"></i>Pentatonic notes</span><span><i class="theory-pentatonic-root-key"></i>Pentatonic root</span>';
  if(overlayKey)overlayKey.innerHTML=keyMarkup;
  if(overlaySummary){overlaySummary.hidden=!selectedTheory;overlaySummary.textContent=selectedTheory?`${selectedTheory.name} · ${selectedTheory.names.map((name,i)=>`${name} (${selectedTheory.degrees[i]})`).join(' · ')}`:'';}
  if(overlayDetails)overlayDetails.hidden=!selectedTheory;
  const omittedChord=selectedTheory?info.tones.filter((_:string,i:number)=>!selectedTheory.pcs.includes(info.chordPcs[i])):[];
  const omittedColour=selectedTheory?characteristicNotes(info).filter((n:any)=>!selectedTheory.pcs.includes(n.pc)).map((n:any)=>`${n.name} (${n.degree})`):[];
  el('theory-description').innerHTML=!selectedTheory?'':`<div class="theory-description"><p>${escapeHtml(selectedTheory.explanation)}</p>${omittedChord.length?`<p>Omitted chord tones: ${omittedChord.map(escapeHtml).join(' · ')}</p>`:''}${omittedColour.length?`<p>Omitted modal colours: ${omittedColour.map(escapeHtml).join(' · ')}</p>`:''}</div>`;
  const displayedPositions=POSITIONS.map(position=>{
    const board=fretboardFor(info,position.shape,select('exercise').value==='arpeggio');
    return {...cagedPositionFor(board),geometryShape:position.shape,board,range:occupiedFretRange(board)};
  });
  const selectedNumeral = positionOverride?.numeral || (featured === 'all' ? overviewPosition : featured);
  const selectedPosition = displayedPositions.find(position=>position.numeral===selectedNumeral) || displayedPositions[0]!;
  overviewPosition = selectedPosition.numeral || 'I';
  select('guitar-chord-position').value=overviewPosition;
  const overlay = selectedTheory ? {kind:theoryView.kind as 'pentatonic'|'triads',name:selectedTheory.name,pcs:selectedTheory.pcs,...(selectedTheory.rootPc===undefined?{}:{rootPc:selectedTheory.rootPc}),...(selectedTheory.groups ? {groups:selectedTheory.groups} : {})} : null;
  const orderedPreviews=displayedPositions.map(position=>{
    const source=selectedTheory?fretboardFor(info,position.geometryShape):position.board;
    return {...position,displayBoard:{...source,...occupiedFretRange(source)}};
  }).sort((a,b)=>a.displayBoard.start-b.displayBoard.start||a.displayBoard.end-b.displayBoard.end);
  el('position-overview').innerHTML = orderedPreviews.map(position=>{
    const board=position.displayBoard;
    const title=`${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    const thumbnailDiagram=diagramSvg(board,guitarDegrees,mode.degrees,title,input('highlight-mode').checked,null,overlay)
      .replace('viewBox="0 0 480 218"','viewBox="36 8 408 180"');
    return `<button type="button" role="tab" style="--shape-color:${shapeColor(POSITIONS.findIndex(p=>p.numeral===position.numeral))}" class="position-thumbnail${position.numeral===selectedPosition.numeral?' current':''}" data-overview-position="${position.numeral}" aria-selected="${position.numeral===selectedPosition.numeral}" tabindex="${position.numeral===selectedPosition.numeral?'0':'-1'}" ${exercisePlaying||exercisePreparing?'disabled':''}><span>Position ${position.numeral}</span><small>${position.shape} shape · ${board.start}–${board.end}</small>${thumbnailDiagram}</button>`;
  }).join('');
  el('position-indicator').textContent=`Position ${selectedPosition.numeral} of V · ${selectedPosition.shape} shape`;
  for(const id of ['position-previous','position-next']) (el(id) as HTMLButtonElement).disabled=exercisePlaying||exercisePreparing;
  el('guitar-diagrams').innerHTML = [selectedPosition].map(position => {
    const chordBoard = position.board;
    const source = selectedTheory ? fretboardFor(info,position.geometryShape) : chordBoard;
    const board = {...source,...occupiedFretRange(source)};
    const grip = showGrip ? recommendedGrip(info, chordBoard) : null;
    positionGrips.set(position.geometryShape,grip);
    const gripDetails=!showGrip?'':grip?`<div class="grip-details"><div class="fretboard-voicing-actions"><div class="grip-stage-buttons"><button class="practice-button" data-grip-display="grip" aria-pressed="${gripOnly}">Voicing only</button><button class="practice-button" data-grip-display="scale" aria-pressed="${!gripOnly}">Voicing + scale</button></div><button type="button" class="practice-button grip-preview" data-grip="${position.geometryShape}" data-preview-label="position ${position.numeral}" aria-label="Strum chord, position ${position.numeral}" aria-pressed="false" ${playing||exercisePlaying||exercisePreparing?'disabled':''}>Strum chord</button><button type="button" class="practice-button" data-practise-grip="${position.numeral}" ${exercisePlaying||exercisePreparing?'disabled':''}>Practise arpeggio →</button></div><details class="voicing-details"><summary>Voicing details</summary><p><b>Chord formula:</b> ${escapeHtml(info.intervals.join(' · '))}. <b>Voiced bass:</b> ${escapeHtml(gripFacts(grip,info)!.bass)}</p><p class="grip-tones">Voiced low to high: ${grip.notes.map((n:any,i:number)=>`${n.name} (${grip.intervals[i]})`).join(' · ')}</p><p>${grip.omitted.length?`Omitted: ${grip.omitted.join(' · ')}. `:''}Ringed notes form a variation of the standard ${grip.framework} chord shape; mute × strings.</p></details></div>`:'<p class="grip-help">No playable variation of this chord shape fits this position.</p>';
    const title = `${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    return `<article style="--shape-color:${shapeColor(POSITIONS.findIndex(p=>p.numeral===position.numeral))}" class="position-card featured-position" data-position="${position.numeral}" data-shape="${position.shape}" data-geometry="${position.geometryShape}"><div class="position-heading"><h4>${escapeHtml(chord)} · Position ${position.numeral} · ${position.shape} shape</h4><span>Frets ${board.start}–${board.end}</span></div>${diagramSvg(gripOnly&&grip&&!overlay?{...board,notes:grip.notes}:board, guitarDegrees, mode.degrees, title, input('highlight-mode').checked, grip, overlay)}<p class="position-anchor">Parent-shape anchor: ${board.anchorName} · ${['low E','A','D','G','B','high E'][board.rootString]} string, ${board.rootFret === 0 ? 'open' : `fret ${board.rootFret}`}.</p>${gripDetails}</article>`;
  }).join('');
  el('guitar-diagrams').querySelectorAll<SVGElement>('svg.fretboard').forEach(svg=>{svg.setAttribute('tabindex','0');svg.setAttribute('role','button');svg.setAttribute('aria-label',`Highlight Position ${selectedPosition.numeral} on full-neck map`);svg.setAttribute('aria-pressed',String(!cagedMapAll));});
  const fullBoard=fullFretboardFor(info,1,17,selectedTheory?false:select('exercise').value==='arpeggio');
  const fullFretboardGrips=showGrip&&!selectedTheory?displayedPositions.map(position=>{
    const grip=recommendedGrip(info,position.board);
    return grip?{numeral:position.numeral!,notes:grip.notes}:null;
  }).filter(Boolean) as Array<{numeral:string,notes:Array<{string:number,fret:number}>}>:[];
  el('full-fretboard').innerHTML=fullFretboardSvg(fullBoard,guitarDegrees,mode.degrees,`${chord}, full fretboard, frets 1 to 17`,displayedPositions.map(position=>({numeral:position.numeral!,shape:position.shape!,...position.range})),cagedMapAll?'all':selectedPosition.numeral!,input('highlight-mode').checked,overlay,input('show-regions').checked,fullFretboardGrips);
  emphasizeFullNeck(el('full-fretboard'),cagedMapAll?null:selectedPosition.board,POSITIONS.findIndex(p=>p.numeral===selectedPosition.numeral));
  reflectFullFretboard();
  perStringView?.refresh();
  if(!skipExercise)renderCagedExercise(selectedPosition,fretboardFor(info,selectedPosition.geometryShape),info,settings.progression?progressionOrder(settings).map((index:number)=>path[index]):undefined);
  reflectNeckTraversal(info);
  const guitarRouteGroups=progressionOrder(settings).map((i:number)=>({chord:harmonies[i]?.name+harmonies[i]?.suffix,position:path[i],board:harmonies[i]?fretboardFor(harmonies[i],path[i].geometryShape):null}));
  if(acrossNeck(exerciseView))guitarRouteGroups.forEach((g:any,i:number)=>{if(harmonies[progressionOrder(settings)[i]])g.board=neckRouteBoard(harmonies[progressionOrder(settings)[i]],exerciseView);});
  el('position-path').innerHTML=settings.progression?positionRouteCards(guitarRouteGroups,progressionOrder(settings),step,playing||exercisePlaying||exercisePreparing,true):'';enrichProgressionCards();
  const parentMajor = parentMajorFor(info);
  el('guitar-parent').hidden = !parentMajor;
  el('guitar-parent').textContent = parentMajor ? `Parent fingering: ${parentMajor.name} ${parentMajor.family.replace(' scale','').toLowerCase()}.` : '';
  el('guitar-scale-check').textContent=scaleCompatibility(info);el('guitar-scale-check').hidden=!scaleCompatibility(info);
  el('guitar-scale').textContent = `${info.scaleNames[0]} ${mode.name} · ${info.scaleNames.join(' · ')}`;
  renderPracticeRoadmap(info);
  select('fret-view').value = select('exercise').value;
  applyStudioIcons(document.querySelector('.guitar')!);
  applyStudioIcons(el('caged-exercise'));
}
function syncPulseToolsUI(){
 const custom=Boolean(settings.beatAccents?.trim());
 input('accent').disabled=custom;
 const accentStatus=document.getElementById('beat-accent-status');if(accentStatus){accentStatus.hidden=!custom;accentStatus.textContent=custom?'Custom accents active. Reset to use Accent beat one.':'';}
 const timer=document.getElementById('pulse-timer-mode') as HTMLSelectElement|null;
 if(timer){timer.value=settings.sessionSeconds>0?'timed':'unlimited';input('pulse-minutes').closest('label')!.hidden=settings.sessionSeconds===0;input('pulse-finish-bar').closest('label')!.hidden=settings.sessionSeconds===0;el('session-timer-summary').textContent=settings.sessionSeconds>0?`Session timer · ${settings.sessionSeconds/60} min`:'Session timer · Unlimited';}
}
function renderBeats(active = -1){return withPlaybackSettings(()=>renderBeatsDisplay(active));}
function renderBeatsDisplay(active = -1) {
  syncPulseToolsUI();
  if(active<0)document.querySelectorAll<HTMLElement>('[data-grid-beat]').forEach(cell=>{cell.classList.remove('playing');cell.removeAttribute('aria-current');});
  const dots=el('beat-dots');
  if(dots.children.length!==settings.beats)dots.innerHTML=Array.from({length:settings.beats},(_,i)=>`<button type="button" class="beat" data-pulse-beat="${i}">${i+1}</button>`).join('');
  Array.from(dots.children).forEach((element,i)=>{
    const strength=beatStrength(settings,i);
    element.className=`beat ${i===active?'active':''} ${strength===2?'downbeat strong':strength===0?'silent':'soft'}`;
    element.setAttribute('aria-label',`Beat ${i+1}: ${['silent','soft','strong'][strength]}. Click to change accent.`);
  });
  el('pulse-large-number').textContent=active<0?'Ready':String(active+1);
  el('pulse-large-number').classList.toggle('is-downbeat',active===0);
}
function fillLoopOptions(reset = false) {
  const count = progressionDefinition({...settings,template:select('template').value,customProgression}).roman.length;
  const start = reset ? 0 : Number(select('loop-start').value || 0);
  const end = reset ? count-1 : Number(select('loop-end').value || 0);
  const loopSettings = {...settings, key:Number(select('key').value), mode:select('quality').value, chord:select('chord').value, template:select('template').value, progression:true};
  for (const [id,value] of [['loop-start',start],['loop-end',end]] as const) {
    select(id).innerHTML = Array.from({length:count},(_,i)=>{const c=harmonyAt(loopSettings,i);return `<option value="${i}">${i+1}. ${c.name}${c.suffix} · ${c.roman}</option>`;}).join('');
    select(id).value = String(Math.min(count-1,value));
  }
}
let customStepIndex=0;
let chartEditSteps:number[]=[];
const chartView={tool:'select',barsPerLine:4,labels:'chords',annotations:false,repeatBars:true,read:false};
const customUndo:any[]=[],customRedo:any[]=[];
function rememberCustomEdit(){customUndo.push({progression:structuredClone(customProgression),index:customStepIndex,selection:[...chartEditSteps],positionRoute:input('manual-position-route').value,startRoute:input('pattern-start-route').value,key:settings.key,beats:settings.beats,featured:select('featured-position').value,region:select('position-region').value});if(customUndo.length>50)customUndo.shift();customRedo.length=0;}
async function restoreCustomEdit(undo:boolean){
 if(stopping)return;
 const source=undo?customUndo:customRedo,destination=undo?customRedo:customUndo;
 const previous=source.pop();if(!previous)return;
 el<HTMLButtonElement>('custom-undo').disabled=true;el<HTMLButtonElement>('custom-redo').disabled=true;
 stopPreview();stopExercisePreview();
 destination.push({progression:structuredClone(customProgression),index:customStepIndex,selection:[...chartEditSteps],positionRoute:input('manual-position-route').value,startRoute:input('pattern-start-route').value,key:settings.key,beats:settings.beats,featured:select('featured-position').value,region:select('position-region').value});
 input('manual-position-route').value=previous.positionRoute||'';input('pattern-start-route').value=previous.startRoute||'';localStorage.setItem('mehtronome-pattern-start-route',input('pattern-start-route').value);
 if(previous.key!==undefined){settings.key=previous.key;select('key').value=String(previous.key);}if(previous.beats!==undefined){settings.beats=previous.beats;select('beats').value=String(previous.beats);}if(previous.featured)select('featured-position').value=previous.featured;if(previous.region)select('position-region').value=previous.region;
 customProgression=previous.progression;chartEditSteps=previous.selection||[];customStepIndex=previous.index;step=customStepIndex;
 saveCustomProgression(undo?'Progression edit undone.':'Progression edit redone.');fillLoopOptions(true);update();
}

function actualCustomName(offset:number,letter?:number){return customPitchName(Number(select('key').value),offset,letter);}
function materializeWorkingChart(){
 if(settings.template==='custom')return;
 const definition=progressionDefinition(settings);
 customProgression={...cloneTemplate(definition,settings.chord,settings.mode,settings),name:definition.name};customStepIndex=0;
 select('template').value='custom';settings.customProgression=customProgression;
 saveCustomProgression('');fillLoopOptions(true);update();
}
function saveCustomProgression(message=''){
  customProgression=normalizeCustomProgression(customProgression);
  settings.customProgression=customProgression;
  (PROGRESSIONS as any).custom=customProgression;
  try{localStorage.setItem(CUSTOM_PROGRESSION_KEY,JSON.stringify(customProgression));}
  catch{message='The progression is ready for this session, but browser storage is unavailable.';}
  el('custom-status').textContent=message;
  document.dispatchEvent(new Event('chart-working-copy-change'));
}
function beatLength(total:number){const bars=Math.floor(total/settings.beats),remaining=total%settings.beats;return `${total} beats · ${bars} bar${bars===1?'':'s'}${remaining?` + ${remaining} beat${remaining===1?'':'s'}`:''}`;}
function durationLabel(index:number){const bars=progressionDurations(settings)[index];return settings.template==='custom'?`${progressionBeatDurations(settings)[index]} beats`:`${bars} bar${bars===1?'':'s'}`;}
function sectionControls(){
 if(!settings.progression||settings.template!=='custom')return '';
 const sections=rehearsalSections(customProgression,settings.beats);
 return `<div class="rehearsal-controls" aria-label="Practise a chart section"><span>Loop section:</span>${sections.map((r:any)=>`<button type="button" class="practice-button" data-section-start="${r.start}" data-section-end="${r.end-1}" ${exercisePlaying||exercisePreparing?'disabled':''}>${escapeHtml(r.name)} · beats ${r.start+1}–${r.end}</button>`).join('')}<button type="button" class="practice-button" data-section-full ${exercisePlaying||exercisePreparing?'disabled':''}>Full chart</button></div>`;
}
function renderCustomBeatGrid(){return withPlaybackSettings(()=>renderCustomBeatGridDisplay());}
function renderCustomBeatGridDisplay() {
 const durations=progressionBeatDurations(settings),total=durations.reduce((a:number,b:number)=>a+b,0),definition=progressionDefinition(settings),loopControls=el('loop-controls');
 const harmonies=definition.roman.map((_:any,index:number)=>chordInfo(index)),chords=harmonies.map((c:any)=>c.name+c.suffix);
 const auto=progressionPositionPath(harmonies,FRET_REGIONS[select('position-region').value as keyof typeof FRET_REGIONS]),route=manualPositionPath(harmonies,auto,input('manual-position-route').value);
 const annotations=chartView.annotations?harmonies.map((h:any,i:number)=>`${MODES[h.mode as keyof typeof MODES].name} · ${route.path[i].numeral} / ${route.path[i].shape}`):[];
 el<HTMLButtonElement>('chart-loop-clear').disabled=!settings.loopEnabled;
 el('chart-loop-status').textContent=chartView.tool==='loop'?'Drag across beats to set the loop.':'Click to edit; drag to select chords. Hold to hear.';
 el('custom-beat-grid').innerHTML=chordSheet(chords,durations,settings.beats,{title:definition.name,key:names[settings.key],marks:definition.steps?.map((s:any)=>s.section||'')||[],selected:settings.template==='custom'?customStepIndex:step,selectedSteps:settings.template==='custom'?chartEditSteps:[],loopSteps:settings.loopEnabled&&settings.loopUnit!=='beats'?progressionOrder(settings):[],loopBeats:settings.loopEnabled&&settings.loopUnit==='beats'?progressionTimeline(settings).flatMap((segment:any)=>Array.from({length:segment.duration},(_,i)=>segment.start+i)):[],barsPerLine:chartView.barsPerLine,labels:chartView.labels,romans:definition.roman,annotations,repeatBars:chartView.repeatBars});
 el('custom-beat-grid').insertAdjacentHTML('beforeend',sectionControls());
 if(el('custom-beat-grid').closest('.chart-sheet-panel'))(el('custom-beat-grid').querySelector('.rehearsal-controls')||el('custom-beat-grid')).append(loopControls);
 el('custom-grid-help').textContent=`${beatLength(total)} in ${settings.beats}/4.${total%settings.beats?' Final partial bar repeats immediately.':''}`;
 document.dispatchEvent(new Event('chart-view-rendered'));
}
function highlightCustomBeat(beat:number){return withPlaybackSettings(()=>highlightCustomBeatDisplay(beat));}
function highlightCustomBeatDisplay(beat:number) {const target=progressionPositionAtBeat(settings,beat).chartBeat;document.querySelectorAll<HTMLElement>('[data-grid-beat]').forEach(cell=>{const active=Number(cell.dataset.gridBeat)===target;cell.classList.toggle('playing',active);if(active)cell.setAttribute('aria-current','true');else cell.removeAttribute('aria-current');});}
type ChartDrag={pointer:number;start:number;end:number;x:number;y:number;moved:boolean};
let chartDrag:ChartDrag|null=null,chartSuppressClickUntil=0;
function paintChartLoop(start:number,end:number){if(chartView.tool==='select'){const selected=chordStepsInRange(progressionBeatDurations(settings),start,end);document.querySelectorAll<HTMLElement>('#custom-beat-grid [data-grid-step]').forEach(cell=>cell.classList.toggle('selected',selected.includes(Number(cell.dataset.gridStep))));return;}document.querySelectorAll<HTMLElement>('#custom-beat-grid [data-grid-step]').forEach(cell=>{const index=Number(cell.dataset.gridBeat);cell.classList.toggle('loop-selected',index>=Math.min(start,end)&&index<=Math.max(start,end));cell.classList.remove('loop-outside');});}
async function applyChartLoop(start:number,end:number){
 stopPreview();stopExercisePreview();const resume=playing;
 if(settings.template!=='custom')materializeWorkingChart();
 select('loop-unit').value='beats';input('loop-beat-start').value=String(Math.min(start,end)+1);input('loop-beat-end').value=String(Math.max(start,end)+1);input('loop-enabled').checked=true;update();
 el('chart-loop-status').textContent=`Loop selected: beats ${Math.min(start,end)+1}–${Math.max(start,end)+1} (included). ${resume?'':'Press Play to hear the loop.'}`;

}
el('custom-beat-grid').addEventListener('pointerdown',event=>{const button=(event.target as Element).closest<HTMLElement>('[data-grid-step]');if(!button||event.button!==0||!event.isPrimary||event.pointerType==='touch')return;chartDrag={pointer:event.pointerId,start:Number(button.dataset.gridBeat),end:Number(button.dataset.gridBeat),x:event.clientX,y:event.clientY,moved:false};});
window.addEventListener('pointermove',event=>{
 if(!chartDrag||chartDrag.pointer!==event.pointerId)return;
 if(!chartDrag.moved&&Math.hypot(event.clientX-chartDrag.x,event.clientY-chartDrag.y)<6)return;
 chartDrag.moved=true;stopPreview();const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('#custom-beat-grid [data-grid-step]');if(cell)chartDrag.end=Number(cell.dataset.gridBeat);paintChartLoop(chartDrag.start,chartDrag.end);event.preventDefault();
});
window.addEventListener('pointerup',event=>{if(!chartDrag||chartDrag.pointer!==event.pointerId)return;const drag=chartDrag;chartDrag=null;if(!drag.moved)return;chartSuppressClickUntil=performance.now()+350;void (chartView.tool==='loop'?applyChartLoop(drag.start,drag.end):applyChartSelection(drag.start,drag.end));});
function cancelChartDrag(){if(!chartDrag)return;const moved=chartDrag.moved;chartDrag=null;stopPreview();if(moved){chartSuppressClickUntil=performance.now()+350;renderCustomBeatGrid();}}
window.addEventListener('pointercancel',cancelChartDrag);window.addEventListener('blur',cancelChartDrag);
window.addEventListener('keydown',event=>{if(event.key==='Escape')cancelChartDrag();});
el('custom-beat-grid').addEventListener('click',event=>{if(event.detail&&performance.now()<chartSuppressClickUntil&&(event.target as Element).closest('[data-grid-step]')){event.preventDefault();event.stopImmediatePropagation();}},true);
el('chart-loop-clear').addEventListener('click',()=>{input('loop-enabled').checked=false;update();el('chart-loop-status').textContent='Loop cleared. Playback uses the full progression.';});
el('custom-beat-grid').addEventListener('click',async event=>{const button=(event.target as Element).closest<HTMLElement>('[data-grid-step]');if(button){if(stopping)return;if(chartView.tool==='loop'){void applyChartLoop(Number(button.dataset.gridBeat),Number(button.dataset.gridBeat));return;}const beat=button.dataset.gridBeat,chosen=Number(button.dataset.gridStep);stopPreview();stopExercisePreview();if(settings.template!=='custom')el('customize-progression').click();chartEditSteps=[];customStepIndex=chosen;if(!playing)step=customStepIndex;renderCustomBuilder();renderMusic();document.querySelector<HTMLElement>(`[data-grid-beat="${beat}"]`)?.focus({preventScroll:true});}});
function renderCustomBuilder(){
  const active=settings.progression&&settings.template==='custom';
  el('custom-progression-builder').hidden=!settings.progression;
  el('custom-scale-check').hidden=true;el('custom-compatible-mode').hidden=true;
  el('customize-progression').hidden=!settings.progression||active;
  el('customize-progression').textContent=settings.template==='single'?'Edit a copy':'Create from this progression';
  el('custom-progression-builder').querySelector<HTMLElement>('.custom-editor')!.hidden=!active;
  el('custom-progression-builder').querySelector<HTMLElement>('.custom-actions')!.hidden=!active;
  el('custom-progression-builder').querySelector<HTMLElement>('.custom-history-actions')!.hidden=!active&&settings.template!=='single';
  if(!active){el<HTMLButtonElement>('custom-delete').disabled=true;el<HTMLButtonElement>('custom-undo').disabled=true;el<HTMLButtonElement>('custom-redo').disabled=true;}
  el('custom-status').hidden=!active;el('custom-progression-builder').querySelector<HTMLElement>('.custom-share')!.hidden=!active;
  if(!active){if(settings.progression){el('custom-progression-title').textContent=progressionDefinition(settings).name;renderCustomBeatGrid();el('custom-grid-help').textContent+=' Select any chord to edit a personal copy; the original template stays available.';}return;}
  customStepIndex=Math.max(0,Math.min(customProgression.steps.length-1,customStepIndex));
  el<HTMLButtonElement>('custom-undo').disabled=!customUndo.length;el<HTMLButtonElement>('custom-redo').disabled=!customRedo.length;
  for(const id of ['custom-root','custom-chord','custom-mode','custom-bass'])select(id).querySelector('option[value="mixed"]')?.remove();
  const current=customProgression.steps[customStepIndex];
  const startBeat=progressionBeatDurations(settings).slice(0,customStepIndex).reduce((sum:number,n:number)=>sum+n,0);
  const bar=Math.floor(startBeat/settings.beats)+1,beat=startBeat%settings.beats+1;
  const selectedHeading=document.getElementById('selected-chord-heading');
  if(selectedHeading)selectedHeading.textContent=chartEditSteps.length>1?`Editing ${chartEditSteps.length} chord entries`:`Editing bar ${bar}${beat!==1?`, beat ${beat}`:''} · ${actualCustomName(current.root,current.letter)}${CHORDS[current.chord as keyof typeof CHORDS].symbol}`;

  el('mode-template').textContent=`Try ${MODES[current.mode as keyof typeof MODES].name} progression`;
  el('mode-template').hidden=!PROGRESSIONS[`modal_${current.mode}` as keyof typeof PROGRESSIONS];
  el('custom-progression-title').textContent=customProgression.name;
  for(const id of ['custom-root','custom-bass']){
    const control=select(id);
    Array.from(control.options).forEach(option=>{
      if(option.value==='')return;
      const offset=Number(option.value),letter=id==='custom-bass'?(offset===current.bass?current.bassLetter:undefined):(offset===current.root?current.letter:undefined),roman=romanForStep({root:offset,letter,chord:'major'});
      option.textContent=id==='custom-bass'?`${actualCustomName(offset,letter)} (${roman}) pedal / slash bass`:`${actualCustomName(offset,letter)} · ${roman}`;
    });
  }
  el('custom-compatible-mode').textContent=modeFirstHarmony()?'Use compatible chord':'Use compatible scale guide';
  const guideCheck=scaleCompatibility(harmonyAt({...settings,template:'custom',customProgression},customStepIndex));el('custom-scale-check').textContent=guideCheck;el('custom-scale-check').hidden=!guideCheck;el('custom-compatible-mode').hidden=!guideCheck;
  input('custom-name').value=customProgression.name;input('custom-section').value=current.section||'';
  select('custom-root').value=String(current.root);
  fillHarmonyChoices(current.chord,current.mode);
  select('custom-bars').value=String(current.bars||1);
  select('custom-duration-unit').value=current.beats!==undefined?'beats':'bars';
  select('custom-beats').value=String(current.beats??Math.min(32,(current.bars||1)*settings.beats));
  el('custom-bars-label').hidden=current.beats!==undefined;el('custom-beats-label').hidden=current.beats===undefined;
  renderCustomBeatGrid();
  select('custom-bass').value=current.bass===null?'':String(current.bass);
  reflectChartEditSelection();
  input('custom-text').value=progressionText(customProgression,(id:string)=>CHORDS[id as keyof typeof CHORDS]?.symbol||id);
  el<HTMLButtonElement>('custom-delete').disabled=customProgression.steps.length===1;
  for(const id of ['custom-add','custom-duplicate'])el<HTMLButtonElement>(id).disabled=customProgression.steps.length>=MAX_CHART_STEPS;
  el<HTMLButtonElement>('custom-left').disabled=customStepIndex===0;
  el<HTMLButtonElement>('custom-right').disabled=customStepIndex===customProgression.steps.length-1;
}
function reflectChartEditSelection(){
 const selected=chartEditSteps.map(i=>customProgression.steps[i]).filter(Boolean),multi=selected.length>1;
 const duration=progressionBeatDurations(settings),starts=duration.map((_:number,i:number)=>duration.slice(0,i).reduce((a:number,b:number)=>a+b,0)),from=chartEditSteps[0]??customStepIndex,to=chartEditSteps.at(-1)??customStepIndex;
 const status=el('custom-edit-selection-status');status.hidden=!multi;status.textContent=`Bars ${Math.floor(starts[from]/settings.beats)+1}–${Math.ceil((starts[to]+duration[to])/settings.beats)} selected. Chord changes apply to the whole selection.`;
 const durationHeading=el('custom-duration-unit').closest('.workspace-group')?.querySelector('h3');if(durationHeading)durationHeading.textContent=multi?'Duration · first selected chord':'Duration';
 if(!multi)return;
 for(const [id,key]of [['custom-root','root'],['custom-chord','chord'],['custom-mode','mode'],['custom-bass','bass']]){
  const control=select(id),values=new Set(selected.map((s:any)=>s[key]===null?'':String(s[key])));
  if(values.size>1){control.add(new Option('Mixed · choose to change all','mixed'));control.value='mixed';}
 }
 if(modeFirstHarmony()&&select('custom-mode').value==='mixed'){const menu=select('custom-chord');menu.replaceChildren(new Option('Choose a mode for the selected chords','mixed'));menu.disabled=true;el('custom-mode-help').textContent='Choose one mode to see compatible chord qualities for all selected chord roots.';}
}
function chartPracticeChoices(){
 const harmonies=customProgression.steps.map((_:any,i:number)=>chordInfo(i)),auto=progressionPositionPath(harmonies,FRET_REGIONS[select('position-region').value as keyof typeof FRET_REGIONS]);
 const positions=manualPositionPath(harmonies,auto,input('manual-position-route').value),starts=patternStartRoute(harmonies,input('pattern-start-route').value);
 return {positions:select('featured-position').value==='all'||positions.value===input('manual-position-route').value?positions.path.map((p:any)=>p.numeral):null,starts:starts.value===input('pattern-start-route').value?starts.choices:null};
}
function restoreChartPracticeChoices(choices:ReturnType<typeof chartPracticeChoices>){
 const harmonies=customProgression.steps.map((_:any,i:number)=>chordInfo(i));
 if(choices.positions)input('manual-position-route').value=manualPositionRoute(harmonies,choices.positions);
 if(choices.starts){input('pattern-start-route').value=patternStartRouteValue(harmonies,choices.starts);localStorage.setItem('mehtronome-pattern-start-route',input('pattern-start-route').value);}
}
function commitCustomEdit(field:string){
  const control=field?el<HTMLInputElement|HTMLSelectElement>(field):null;if(control?.value==='mixed')return;
  if(modeFirstHarmony()&&field==='custom-chord'&&!chordChoicesForMode(select('custom-mode').value).some((c:any)=>c.id===select('custom-chord').value))return;
  const practiceChoices=chartPracticeChoices();rememberCustomEdit();
  const harmonic=['custom-root','custom-chord','custom-mode','custom-bass'].includes(field);
  const targets=harmonic&&chartEditSteps.length?chartEditSteps:[customStepIndex];
  if(field==='custom-name')customProgression.name=input('custom-name').value.trim()||'My progression';
  if(field==='custom-section')customProgression.steps[customStepIndex].section=input('custom-section').value.trim();
  for(const index of targets){
   const item=customProgression.steps[index];if(!item)continue;
   if(field==='custom-root'){const root=Number(select('custom-root').value);if(item.root!==root)delete item.letter;item.root=root;}
   if(field==='custom-chord'){item.chord=select('custom-chord').value;item.mode=modeFirstHarmony()?select('custom-mode').value:compatibleModeForChord(item.chord,item.mode,recommendedMode(item.chord));}
   if(field==='custom-mode'){const mode=select('custom-mode').value;if(modeFirstHarmony()){item.chord=compatibleChordForMode(mode,item.chord);item.mode=mode;}else item.mode=compatibleModeForChord(item.chord,mode,recommendedMode(item.chord));}
   if(field==='custom-bass'){const bass=select('custom-bass').value===''?null:Number(select('custom-bass').value);if(item.bass!==bass)delete item.bassLetter;item.bass=bass;}
   if(['custom-duration-unit','custom-bars','custom-beats'].includes(field)){
    if(select('custom-duration-unit').value==='beats'){item.beats=Number(select('custom-beats').value);delete item.bars;}else{item.bars=Number(select('custom-bars').value);delete item.beats;}
   }
  }
  saveCustomProgression(harmonic&&targets.length>1?`Updated ${targets.length} selected chords.`:undefined);restoreChartPracticeChoices(practiceChoices);fillLoopOptions(true);step=customStepIndex;update();
}
function update() {
  fxUi?.sync();
  settings.automaticBacking=true;
  settings.backingStyle=backingStyleId(backingStyleUi?.sync()||settings.backingStyle);Object.assign(settings,BACKING_STYLES[settings.backingStyle as keyof typeof BACKING_STYLES].settings,backingStyleInstruments(settings.backingStyle));
  settings.soundLibrary='expanded';
  Object.assign(settings,{soundSources:{},drumKitChoice:'style'});settings.drumKit=resolveDrumKit(settings);
  settings.sequenceActivity=document.querySelector<HTMLSelectElement>('#sequence-activity')?.value||'supporting';
  for(const id of BACKING_CHANNELS)input(id).checked=true;
  if (previewGripShape) stopPreview();
  const previousLoop = [settings.loopEnabled,settings.loopStart,settings.loopEnd,settings.loopUnit,settings.loopBeatStart,settings.loopBeatEnd].join('|');
  const previous = [settings.key, settings.mode, settings.chord, settings.template].join('|');
  settings.beats = Number(select('beats').value);
  settings.key = Number(select('key').value);
  settings.mode = select('quality').value;
  settings.minor = settings.mode === 'minor';
  settings.chord = select('chord').value;
  // Legacy static setups use the same tonic chart.
  if(!settings.progression){settings.progression=true;select('template').value='single';step=0;input('loop-enabled').checked=false;}
  settings.extensionMorph=input('extension-morph').checked;
  settings.extensionBars=Number(select('extension-bars').value);
  el('extension-controls').hidden=!settings.extensionMorph;
  el('extension-status').hidden=!settings.extensionMorph;
  settings.drums=input('drums').checked;settings.bass=input('bass').checked;settings.comping=input('comping').checked;settings.sequence=input('sequence').checked;
  for(const name of ['drums','bass','comping','sequence'] as const){settings[`${name}Volume`]=Number(input(`${name}-volume`).value)/100;el(`${name}-volume-value`).textContent=`${input(`${name}-volume`).value}%`;}
  const newTemplate = settings.template !== select('template').value;
  fillLoopOptions(newTemplate || !select('loop-start').options.length);
  settings.template = select('template').value;
  settings.customProgression=customProgression;
  if (newTemplate){chartEditSteps=[];input('loop-enabled').checked=false;select('loop-unit').value='chords';}
  settings.loopEnabled = input('loop-enabled').checked;
  settings.loopStart = Number(select('loop-start').value);
  settings.loopEnd = Number(select('loop-end').value);
  settings.loopUnit=select('loop-unit').value;
  const totalLoopBeats=progressionBeatDurations(settings).reduce((a:number,b:number)=>a+b,0);
  for(const id of ['loop-beat-start','loop-beat-end']){input(id).max=String(totalLoopBeats);input(id).value=String(Math.max(1,Math.min(totalLoopBeats,Math.floor(Number(input(id).value)||1))));}
  const loopA=Number(input('loop-beat-start').value)-1,loopB=Number(input('loop-beat-end').value)-1;settings.loopBeatStart=Math.min(loopA,loopB);settings.loopBeatEnd=Math.max(loopA,loopB);
  el('loop-beat-fields').hidden=settings.loopUnit!=='beats';el('loop-chord-fields').hidden=settings.loopUnit==='beats';

  settings.trainerEnabled = input('trainer-enabled').checked;
  settings.trainerBars = Number(select('trainer-bars').value);
  settings.trainerIncrement = Math.max(1,Math.min(30,Number(input('trainer-increment').value)||2));
  settings.trainerTarget = Math.max(30,Math.min(240,Number(input('trainer-target').value)||120));
  el('trainer-controls').hidden = !settings.trainerEnabled;
  syncTrainerStatus();
  settings.gapEnabled = input('gap-enabled').checked;
  settings.gapPlayBars = Number(select('gap-play').value);
  settings.gapMuteBars = Number(select('gap-mute').value);
  settings.gapTarget = select('gap-target').value;
  settings.gapProgressive=input('gap-progressive').checked;
  settings.gapMaxBars=Math.max(settings.gapMuteBars,Number(select('gap-max').value));
  select('gap-max').value=String(settings.gapMaxBars);
  select('gap-max').disabled=!settings.gapProgressive;
  el('gap-controls').hidden = !settings.gapEnabled;
  el('template-field').hidden = !settings.progression;
  const diatonic = settings.progression && settings.template === 'diatonic';
  const selectedTemplate = progressionDefinition(settings);
  const jazz = settings.progression && selectedTemplate.kind === 'jazz';
  const modal = settings.progression && selectedTemplate.kind === 'modal';
  const custom = settings.progression && settings.template === 'custom';
  select('quality').parentElement!.hidden = jazz || custom;
  select('chord').parentElement!.hidden = jazz || diatonic || modal || custom;
  select('chord').disabled = jazz || diatonic || modal || custom;
  el('root-label').textContent = settings.progression ? 'Chart key' : 'Root note';
  el('chord-label').textContent = settings.progression ? 'Chord type' : 'Pedal chord';
  renderCustomBuilder();
  settings.subdivision = Number(select('subdivision').value);
  settings.accent = input('accent').checked;
  settings.beatAccents=input('pulse-accents').value;
  settings.clickSound=select('pulse-sound').value;
  settings.clickSwing=Number(input('pulse-swing').value)/100;
  input('pulse-swing').disabled=settings.subdivision!==2;
  el('pulse-swing-value').textContent=settings.clickSwing?`${Math.round(50+settings.clickSwing*100/6)}% offbeat`:'Straight';
  settings.sessionSeconds=Math.max(0,Math.min(180,Number(input('pulse-minutes').value)||0))*60;
  settings.sessionFinishBar=input('pulse-finish-bar').checked;
  syncPulseToolsUI();
  const [polyBeats,polyBase]=select('pulse-poly').value.split('/').map(Number);
  settings.polyBeats=polyBeats;settings.polyBase=polyBase;
  if(el('pulse-poly-beats').children.length!==polyBeats)el('pulse-poly-beats').innerHTML=Array.from({length:polyBeats},(_,i)=>`<span>${i+1}</span>`).join('');
  settings.countIn = input('count-in').checked;
  settings.click = Number(input('click').value) / 100;
  settings.harmony = Number(input('harmony').value) / 100;
  el('click-value').textContent = `${Math.round(settings.click * 100)}%`;
  el('harmony-value').textContent = `${Math.round(settings.harmony * 100)}%`;
  if (!playing && previous !== [settings.key, settings.mode, settings.chord, settings.template].join('|')) { stopPreview(); step = 0; }
  if (!playing && settings.progression && settings.loopEnabled && previousLoop !== [settings.loopEnabled,settings.loopStart,settings.loopEnd,settings.loopUnit,settings.loopBeatStart,settings.loopBeatEnd].join('|')) { stopPreview(); step = progressionStep(settings,0); }
  settings.mutedChannels=mixerMuteMask();
  reflectMixerChannels();
  queueAudioSettings(settings);


  renderMusic();
  const melody=standardMelodyStatus(settings);
  backingStyleUi?.setMelody(melody?.name||'',!melody&&settings.progression&&settings.template==='custom'&&settings.customProgression?.standardMelody?'Written melody paused: the chart’s length or metre has changed.':'');
  if (!playing) renderBeats();
}
function tempo(value: number) {
  settings.bpm = Math.max(30, Math.min(240, Math.round(value) || 90));
  input('tempo').style.setProperty('--tempo-fill',`${(settings.bpm-30)/210*100}%`);
  currentBpm = settings.bpm;
  input('bpm').value = input('tempo').value = String(settings.bpm);
  syncMiniTransport();
  syncTrainerStatus();
  if(exercisePlaying){if(exerciseView.tempoLinked)changeExerciseTempo(settings.bpm,true);return;}
  queueAudioSettings(settings);
}
function reflectPlayback() {
  document.querySelectorAll<HTMLButtonElement>('#guitar-diagrams button').forEach(button=>{button.disabled=button.hasAttribute('data-grip')?playing||exercisePlaying||exercisePreparing:exercisePlaying||exercisePreparing;});
  el('position-path').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing||exercisePlaying||exercisePreparing; });
  const exercisePreview=document.querySelector<HTMLButtonElement>('#exercise-preview');
  if(exercisePreview)exercisePreview.disabled=playing||stopping||!currentExercise.length;
  el('play-label').textContent = playing ? 'Stop session' : 'Play session';
  el('play-icon').textContent = playing ? '■' : '▶';
  el('play').setAttribute('aria-pressed', String(playing));
  el('pulse-large-play').textContent=playing?'Stop practicing':'Start practicing';
  el('pulse-large-play').setAttribute('aria-pressed',String(playing));
  if(!playing){el('pulse-large-status').textContent='Ready to practice';el('pulse-poly-beats').querySelectorAll('.active').forEach(beat=>beat.classList.remove('active'));}
  el('live-dot').classList.toggle('on', playing);
  select('beats').disabled=exercisePlaying||exercisePreparing||stopping;input('count-in').disabled=playing;
  if (!playing) { renderBeats(); el('play-status').textContent = 'Stopped.'; }
  if (!playing) currentBpm = settings.bpm;
  syncMiniTransport();
  syncTrainerStatus();
  reflectPresetButtons();
}
async function stop() {
  if (!playing || stopping) return;
  stopping = true;
  node?.port.postMessage({ type: 'stop' });
  if (master && context) master.gain.setTargetAtTime(0, context.currentTime, .035);
  playing = false;livePlaybackSettings=null;liveChangeStatus.hidden=true;
  reflectPlayback();renderMusic();
  await new Promise(resolve => setTimeout(resolve, 250));
  await context?.suspend();
  stopping = false;
  reflectPlayback();reflectPresetButtons();syncMiniTransport();
}
function reflectChordPreviews() {
  document.querySelectorAll<HTMLButtonElement>('button[data-grip]').forEach(button => {
    const active = button.dataset.grip === previewGripShape;
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Stop chord' : 'Strum chord';
    button.setAttribute('aria-label', `${active ? 'Stop' : 'Strum'} chord, ${button.dataset.previewLabel}`);
  });
}
function stopPreview() {
  clearTimeout(chartPreviewTimer);chartPreviewTimer=undefined;
  noteAuditionGeneration++;
  stopExercisePreview();
  clearTimeout(gripRingTimer);
  gripRingTimer = undefined;
  previewGeneration++;
  previewHold = null;
  previewing = false;
  previewGripShape = null;
  reflectChordPreviews();
  el('grip-preview-status').hidden = true;
  el('preview-status').hidden = true;
  if (!playing) {
    node?.port.postMessage({type: 'stop'});
    if (master && context) master.gain.setTargetAtTime(0, context.currentTime, .035);
  }
}
const referencePreparation=createReferencePreparation();let deliveredReferenceKey='';
function postPreparedAudio(target:AudioWorkletNode,message:any){
 message={...message,settings:{...message.settings,guitarTuning:settings.guitarTuning}};
 const referencePlan=referencePreparation.message(message.settings,deliveredReferenceKey);
 if(message.type==='settings'&&playing&&!liveChangeStatus.hidden)liveChangeStatus.textContent='Change queued · next bar';
 if(!playing||message.type!=='settings'){compingGuitar?.set(message.settings,'comping',guitarCabinet);sequenceGuitar?.set(message.settings,'sequence',guitarCabinet);}
 target.port.postMessage({...message,live:message.type==='settings'&&playing,id:sampleSettingsGeneration,settings:{...message.settings,nativeGuitarProcessing:true,studyRepeatBeats:!exercisePlaying&&!exercisePreparing?(studyPathUi?.repeatBeats()||0):0},referencePlan});deliveredReferenceKey=referencePlan.key;
}
async function prepareAudio(requested:any=exercisePreparing?exerciseAudioSettings():settings){
  audioPreparation??=initialiseAudio(requested).finally(()=>{audioPreparation=undefined;});
  await audioPreparation;await ensureSamples(requested);referencePreparation.get(requested);
}
async function ensureSamples(requested:any){
 const audio=context,target=node;if(!audio||!target||audio.state==='closed')return;
 const cabinet=await loadGuitarCabinet(audio,requested);if(audio===context&&cabinet)guitarCabinet=cabinet;
 const names=sampleNamesForSettings(requested).filter(name=>!installedSampleNames.has(name));if(!names.length)return;
 const bank:Record<string,Float32Array>=await loadDrumKit(audio,names);if(audio!==context||target!==node||String(audio.state)==='closed')return;
 const fresh:Record<string,Float32Array>=Object.fromEntries(Object.entries(bank).filter(([name])=>!installedSampleNames.has(name)));
 if(Object.keys(fresh).length){target.port.postMessage({type:'drum-kit',kit:fresh,merge:true},Object.values(fresh).map(pcm=>pcm.buffer));for(const name of Object.keys(fresh))installedSampleNames.add(name);}
}
function queueAudioSettings(requested:any){
 if(playing&&livePlaybackSettings){const changing=musicalSettingsKey({...livePlaybackSettings,...requested})!==musicalSettingsKey(livePlaybackSettings);liveChangeStatus.hidden=!changing;liveChangeStatus.textContent=changing?'Change queued · next bar':'';Object.assign(livePlaybackSettings,liveSettingsPatch(requested));}
 const names=sampleNamesForSettings(requested),generation=++sampleSettingsGeneration,target=node;referencePreparation.get(requested);
 if(!target||!context||context.state==='closed'){void loadDrumKit.prefetch(names).catch(()=>{});return;}
 if(names.every(name=>installedSampleNames.has(name))&&(!needsGuitarCabinet(requested)||guitarCabinet)){postPreparedAudio(target,{type:'settings',settings:requested,sampleNames:names});installedSampleNames=new Set(names);return;}
 if(playing&&!liveChangeStatus.hidden)liveChangeStatus.textContent='Preparing sounds · change will follow on a bar';
 if(playing){target.port.postMessage({type:'live-controls',settings:liveSettingsPatch(requested),cancelPending:true});deliveredReferenceKey='';}
 const snapshot=structuredClone(requested);
 void ensureSamples(snapshot).then(()=>{if(generation===sampleSettingsGeneration&&target===node){postPreparedAudio(target,{type:'settings',settings:snapshot,sampleNames:names});installedSampleNames=new Set(names);}}).catch(error=>{if(generation!==sampleSettingsGeneration)return;el('error').textContent=error instanceof Error?error.message:'Could not load the selected sounds. Try again.';el('error').hidden=false;});
}
async function initialiseAudio(requested:any=settings) {
  if (!window.isSecureContext || !window.AudioWorkletNode) throw new Error('Audio needs a secure HTTPS page and a current Safari, Chrome, or Firefox browser.');
  if (!context || context.state === 'closed') {
    context = createPlaybackContext(AudioContext,navigator.userAgent,matchMedia('(pointer:coarse)').matches) as AudioContext;
    harmonyFxSource=undefined;fxBuses=undefined;compingGuitar=undefined;sequenceGuitar=undefined;guitarCabinet=null;
    installedSampleNames=new Set();deliveredReferenceKey='';
    let kit: Record<string, Float32Array>;
    try { [,kit,guitarCabinet]=await Promise.all([context.audioWorklet.addModule(workletUrl),loadDrumKit(context,sampleNamesForSettings(requested)),loadGuitarCabinet(context,requested)]); }
    catch (error) { await context.close(); throw error; }
    node = new AudioWorkletNode(context, 'mehtronome', { numberOfInputs: 0, numberOfOutputs: 9, outputChannelCount: [2, 2, 2, 1, 1, 1, 1, 2, 2] });
    node.port.postMessage({type:'drum-kit', kit}, Object.values(kit).map(pcm => pcm.buffer));installedSampleNames=new Set(Object.keys(kit));
    master = context.createGain();
    master.gain.value = 0;
    masterOutput=createMasterOutput(context,masterVolume);
    master.connect(masterOutput.input);
    compingGuitar=createGuitarChannel(context,{node,output:6},master);sequenceGuitar=createGuitarChannel(context,{node,output:7},master);
    node.connect(master, 0); // Click stays dry and rhythmically clear.
    node.connect(master, 1);
    node.connect(master, 2); // Drums and bass bypass pad reverb and echoes.
    harmonyFxSource=context.createGain();
    node.connect(harmonyFxSource,8);
    node.port.onmessage = ({ data }) => {
      if(data.type==='settings-applied'){if(playing){livePlaybackSettings=data.settings;livePlaybackStep=step=data.step;compingGuitar?.set(data.settings,'comping',guitarCabinet);sequenceGuitar?.set(data.settings,'sequence',guitarCabinet);renderCustomBeatGrid();renderMusic();if(data.id===sampleSettingsGeneration)liveChangeStatus.hidden=true;}return;}
      if(data.type==='study-repeat'&&playing){void advanceRandomStudy('transport');return;}
      if(data.type==='meters'){receiveConsoleMeters(data.peaks);return;}
      if((playing||exercisePlaying)&&typeof data.counting==='boolean'&&playbackCounting!==data.counting){playbackCounting=data.counting;syncMiniTransport();}
      if(Number.isFinite(data.bpm))fxBuses?.setTempo(data.bpm);
      if(!playing&&exercisePlaying&&data.type==='session-complete'){stopExercisePreview();return;}
      if(!playing&&exercisePlaying&&exerciseView.backing&&typeof data.step==='number'&&exerciseBackingStep!==data.step){exerciseBackingStep=data.step;syncMiniTransport();}
      if (!playing) return;
      if(data.type==='session-complete'){
        void stop().then(()=>{el('play-status').textContent='Session complete. Nice work.';el('pulse-time').textContent=`${formatTime(data.elapsed)} elapsed · Session complete`;el('pulse-large-status').textContent='Session complete';});return;
      }
      if(data.type==='session-time'){
        el('pulse-time').textContent=settings.sessionSeconds>0?(data.finishing?'Finishing the current bar…':`${formatTime(settings.sessionSeconds-data.elapsed)} remaining`):`${formatTime(data.elapsed)} elapsed`;return;
      }
      if(data.type==='polyrhythm'){
        Array.from(el('pulse-poly-beats').children).forEach((beat,i)=>beat.classList.toggle('active',i===data.beat));return;
      }
      if (data.type === 'harmony') { livePlaybackStep=step = data.step; renderMusic(); return; }
      // Instrument note notifications are not transport beat messages.
      if(!Number.isInteger(data.beat)||!Number.isFinite(data.bpm))return;
      currentBpm = data.bpm;fxBuses?.setTempo(currentBpm);
      syncMiniTransport();
      syncTrainerStatus();
      if(settings.extensionMorph&&Array.isArray(data.extensions))el('extension-status').textContent=`Blending: ${data.extensions.length?data.extensions.join(' · '):'between colours'}`;
      el('mini-beat').textContent = `${data.beat + 1} / ${livePlaybackSettings?.beats||settings.beats}`;
      renderBeats(data.beat);
      el('play-status').textContent = data.counting ? `${data.pickup?'Pickup':'Count-in'} · ${data.beat + 1} of ${data.countLength||settings.beats}` : `${data.gap ? 'Gap' : 'Playing'} · Bar ${data.bar} · Beat ${data.beat + 1}`;
      el('pulse-large-status').textContent=el('play-status').textContent;
      if (livePlaybackStep !== data.step) { livePlaybackStep=step = data.step; renderMusic(); }
      if(settings.progression&&!data.counting)highlightCustomBeat(Number.isFinite(data.musicalBeat)?data.musicalBeat:(data.bar-1)*settings.beats+data.beat);
    };
    node.onprocessorerror = () => {
      stopPreview();
      playing = false;livePlaybackSettings=null;liveChangeStatus.hidden=true;
      reflectPlayback();
      el('error').textContent = 'Audio stopped unexpectedly. Press Start to try again.';
      el('error').hidden = false;
      void context?.close();
    };
    context.onstatechange = () => {
      if (playing && context?.state === 'suspended') {
        el('play-status').textContent = document.hidden
          ? 'Playing in the background · audio will resume if your browser pauses it.'
          : 'Audio paused by your browser · resuming…';
        if (!document.hidden) void resumeBackgroundAudio();
      }
    };
  }
  await context.resume();
  if (context.state !== 'running') throw new Error('Your browser could not enable audio. Check site sound permissions, then try Start again.');
  if(!fxBuses)fxBuses=createFxBuses(context,master!,{click:{node:node!,output:0},harmony:{node:harmonyFxSource!},drums:{node:node!,output:4},bass:{node:node!,output:5},comping:{node:compingGuitar!.output},sequence:{node:sequenceGuitar!.output}},fxUi?.read());
  node!.port.postMessage({type:'fx-sends',channels:activeFxChannels(fxUi!.read())});
  fxBuses.set(fxUi!.read());fxBuses.setTempo(exercisePlaying?exerciseView.tempo:settings.bpm);fxBuses.reset();
  master!.gain.setTargetAtTime(1, context.currentTime, .04);
}
async function previewChord(index: number, hold: string, retainExercise=false) {

  if (playing || exercisePlaying || busy || stopping) return;
  stopPreview();
  const generation = previewGeneration;
  previewHold = hold;
  step = index;
  renderMusic(retainExercise);
  el('error').hidden = true;
  try {
    previewPreparation ??= prepareAudio().finally(() => { previewPreparation = undefined; });
    await previewPreparation;
    if (generation !== previewGeneration || document.hidden) {
      if (!previewHold || document.hidden) stopPreview();
      return;
    }
    previewing = true;
    postPreparedAudio(node!,{type: 'audition', settings, step});
    el('preview-status').hidden = false;
  } catch (error) {
    el('error').textContent = error instanceof Error ? error.message : 'Could not preview chord.';
    el('error').hidden = false;
    stopPreview();
    await context?.close().catch(() => {});
    context = undefined;
    node = undefined;
  }
}
async function previewGrip(shape: string) {

  if (playing || exercisePlaying || exercisePreparing || busy || stopping) return;
  if (previewGripShape === shape) { stopPreview(); return; }
  const grip = positionGrips.get(shape);
  if (!grip) return;
  const replacing = previewing || previewGripShape !== null;
  stopPreview();
  const generation = previewGeneration;
  previewGripShape = shape;
  reflectChordPreviews();
  el('error').hidden = true;
  try {
    if (replacing && master && context?.state === 'running') {
      // Finish fading the previous waveform before resetting strings and effect tails.
      const now = context.currentTime;
      master.gain.cancelAndHoldAtTime(now);
      master.gain.linearRampToValueAtTime(0, now + .012);
      await new Promise(resolve => setTimeout(resolve, 25));
      if (generation !== previewGeneration || document.hidden) return;
    }
    previewPreparation ??= prepareAudio().finally(()=>{previewPreparation=undefined;});
    await previewPreparation;
    if (generation !== previewGeneration || document.hidden) {
      if ((!previewGripShape && !previewHold) || document.hidden) stopPreview();
      return;
    }
    previewing = true;
    postPreparedAudio(node!,{type:'audition',settings,step,acoustic:true,notes:grip.notes.map((note: any)=>note.midi)});
    el('grip-preview-status').hidden = false;
    gripRingTimer = setTimeout(() => { if (generation === previewGeneration) stopPreview(); }, 8000);
  } catch (error) {
    el('error').textContent = error instanceof Error ? error.message : 'Could not preview this chord.';
    el('error').hidden = false;
    stopPreview();
    await context?.close().catch(()=>{});
    context=undefined;node=undefined;
  }
}
const guitarDiagrams = el('guitar-diagrams');
const positionOverview = el('position-overview');
function selectFeaturedDiagram(event:Event){
 const target=event.target instanceof Element?event.target:null;if(!target||target.closest('button,select,input,a,label,summary'))return;
 const svg=target.closest<SVGElement>('svg.fretboard'),card=svg?.closest<HTMLElement>('.featured-position');if(!card)return;
 const keyboard=event instanceof KeyboardEvent;if(keyboard){if(!['Enter',' '].includes(event.key))return;event.preventDefault();}
 chooseOverviewPosition(card.dataset.position!);
 if(keyboard)guitarDiagrams.querySelector<SVGElement>('svg.fretboard')?.focus({preventScroll:true});
}
guitarDiagrams.addEventListener('click',selectFeaturedDiagram);guitarDiagrams.addEventListener('keydown',selectFeaturedDiagram);
const fullFretboardPanel = el('full-fretboard-panel');
let perStringMapContext:any=null,perStringMapShape='0',neckMapShape='first';
const perStringMapMenu=document.createElement('label');perStringMapMenu.className='per-string-neck-option';perStringMapMenu.hidden=true;perStringMapMenu.innerHTML='<span>Highlight shape</span><select id="per-string-neck-shape"></select>';
fullFretboardPanel.querySelector('.full-fretboard-toolbar')!.insertBefore(perStringMapMenu,el('full-fretboard-expand'));
select('per-string-neck-shape').addEventListener('change',()=>{if(acrossNeck(exerciseView)){exerciseView.traversalCell=select('per-string-neck-shape').value==='all'?'first':select('per-string-neck-shape').value;neckMapShape=select('per-string-neck-shape').value;renderGuitar();return;}if(!perStringMapContext){const value=select('per-string-neck-shape').value;if(value==='all'){cagedMapAll=true;renderGuitar(true);}else{cagedMapAll=false;chooseOverviewPosition(value);}return;}perStringMapShape=select('per-string-neck-shape').value;renderPerStringMap(perStringMapContext);});
function renderPerStringMap(context:any){
 if(acrossNeck(exerciseView)){renderNeckTraversalMap(chordInfo(playing?livePlaybackStep:step));return;}
 const previous=perStringMapContext;perStringMapContext=context;perStringMapMenu.querySelector('span')!.textContent='Highlight shape';perStringMapMenu.hidden=false;input('show-regions').closest('label')!.hidden=false;
 const range=fullFretboardPanel.querySelector('.full-fretboard-toolbar>div>span')!;
 if(!context){range.textContent='Frets 1–17 · click a CAGED region to focus it';const menu=select('per-string-neck-shape');menu.innerHTML='<option value="all">All notes</option>'+Array.from(positionOverview.querySelectorAll<HTMLElement>('[data-overview-position]')).map(button=>{const numeral=button.dataset.overviewPosition!,p=POSITIONS.find(p=>p.numeral===numeral)!;return `<option value="${p.numeral}">Position ${p.numeral} · ${p.shape} shape</option>`;}).join('');menu.value=cagedMapAll?'all':overviewPosition;perStringMapMenu.style.setProperty('--shape-color',shapeColor(POSITIONS.findIndex(p=>p.numeral===overviewPosition)));menu.disabled=exercisePlaying||exercisePreparing;if(previous)renderGuitar(true);return;}
 const {harmony,arp,degrees,labels,title,shapes}=context;select('per-string-neck-shape').disabled=false;
 const legend=document.querySelector('.guitar-legend');if(legend){(legend.querySelector('.chord')!.parentElement as HTMLElement).hidden=false;(legend.querySelector('.scale')!.parentElement as HTMLElement).hidden=arp;}el('grip-legend').hidden=true;el('characteristic-legend').hidden=!input('highlight-mode').checked;
 if(!shapes.length)perStringMapShape='all';
 if(perStringMapShape!=='all'&&!shapes.some((s:any)=>String(s.degree)===perStringMapShape))perStringMapShape=String(shapes[0]?.degree);
 const menu=select('per-string-neck-shape');menu.innerHTML='<option value="all">All notes</option>'+shapes.map((s:any)=>`<option value="${s.degree}">${escapeHtml(s.label)}</option>`).join('');menu.value=perStringMapShape;
 const shape=shapes.find((s:any)=>String(s.degree)===perStringMapShape),base=fullFretboardFor(shape?.harmony||harmony,1,17,arp);
 const board={...base,notes:arp?base.notes.map((n:any)=>({...n,scaleIndex:-1})):base.notes.filter((n:any)=>n.scale)};
 const target=el('full-fretboard'),scroll=target.scrollLeft;target.innerHTML=fullFretboardSvg(board,labels,degrees,title+' · full fretboard, frets 1 to 17',[], 'I',input('highlight-mode').checked,null,false);
 emphasizeFullNeck(target,shape?.board,(shape?.index??0));
 if(input('show-regions').checked)perStringMapRegions(target,shapes,perStringMapShape);
 document.querySelectorAll<HTMLElement>('.per-string-shape').forEach(card=>{const current=!!shape&&Number(card.dataset.startDegree)===shape.degree;card.classList.toggle('map-current',current);card.querySelector('.per-string-scroll')?.setAttribute('aria-pressed',String(current));});
 context.selectShape?.(shape?.degree);
 perStringMapMenu.style.setProperty('--shape-color',shapeColor((shape?.index??0)));
 target.scrollLeft=scroll;
 range.textContent=`Frets 1–17${shape?' · '+shape.label:''}${shape&&(shape.board.end>17||shape.board.start<1)?' · see the reference diagram for the complete shape':''}`;
}
const positionNumerals=['I','II','III','IV','V'];
function chooseOverviewPosition(numeral:string, focus=false){return withPlaybackSettings(()=>chooseOverviewPositionDisplay(numeral,focus));}
function chooseOverviewPositionDisplay(numeral:string, focus=false) {
  if(!positionNumerals.includes(numeral))return;
  if(exercisePlaying||exercisePreparing)return;
  overviewPosition=numeral;cagedMapAll=false;
  if(settings.progression){
    const harmonies=Array.from({length:progressionDefinition(settings).roman.length},(_,i)=>chordInfo(i));
    const region=FRET_REGIONS[select('position-region').value as keyof typeof FRET_REGIONS]||FRET_REGIONS.middle;
    const manual=manualPositionPath(harmonies,progressionPositionPath(harmonies,region),input('manual-position-route').value,{step,numeral});
    input('manual-position-route').value=manual.value;select('featured-position').value='all';
  }
  renderGuitar();
  if(focus)positionOverview.querySelector<HTMLButtonElement>(`[data-overview-position="${numeral}"]`)?.focus({preventScroll:true});
}
function moveOverviewPosition(direction:number) {
  const order=Array.from(positionOverview.querySelectorAll<HTMLElement>('[data-overview-position]'),button=>button.dataset.overviewPosition!);
  if(!order.length)return;
  const index=order.indexOf(overviewPosition);
  chooseOverviewPosition(order[(index+direction+order.length)%order.length]!,true);
}
positionOverview.addEventListener('click',event=>{
  const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('[data-overview-position]'):null;
  if(button)chooseOverviewPosition(button.dataset.overviewPosition||'I',true);
});
positionOverview.addEventListener('keydown',event=>{
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();moveOverviewPosition(event.key==='ArrowLeft'?-1:1);
});
function reflectFullFretboard(){
  fullFretboardPanel.classList.toggle('is-collapsed',fullFretboardCollapsed);
  el('full-fretboard-collapse').setAttribute('aria-expanded',String(!fullFretboardCollapsed));
  el('full-fretboard-collapse').textContent=fullFretboardCollapsed?'Show map':'Hide map';
}
el('full-fretboard-collapse').addEventListener('click',()=>{
  fullFretboardCollapsed=!fullFretboardCollapsed;
  try{localStorage.setItem('mehtronome-full-fretboard-collapsed',String(fullFretboardCollapsed));}catch{/* Session-only. */}
  reflectFullFretboard();
});
input('show-regions').addEventListener('input',renderGuitar);
el('practice-roadmap-list').addEventListener('input',event=>{
  const checkbox=event.target instanceof HTMLInputElement?event.target:null,task=checkbox?.dataset.practiceTask;
  if(!task)return;
  const info=chordInfo(step),key=curriculumKey(practiceContext(info)),completed=new Set(practiceProgress[key]||[]);
  if(checkbox.checked)completed.add(task);else completed.delete(task);
  practiceProgress[key]=[...completed];savePracticeProgress();renderPracticeRoadmap(info);
});
function checklistIdeas(info:any){
 const options=theoryOptions(info),pentatonic=options.pentatonics.find((item:any)=>item.id===exerciseView.source)||options.pentatonics[0],pair=options.triadPairs.find((item:any)=>item.id===exerciseView.source)||options.triadPairs[0];
 const ideas=[{id:'arpeggio',label:`Arpeggio · ${info.name}${info.suffix}`,source:''}];
 if(pentatonic)ideas.push({id:'pentatonic',label:`Pentatonic · ${pentatonic.name}`,source:pentatonic.id});
 if(pair)ideas.push({id:'triads',label:`Triad pair · ${pair.name}`,source:pair.id});
 if(!['positional','pentatonic','triadpairs'].includes(exerciseView.study))ideas.push({id:'exercise',label:'Current notation exercise',source:''});
 ideas.push({id:'gaps',label:'Improvisation with gaps',source:''});return ideas;
}
el('practice-roadmap-list').addEventListener('click',event=>{
 const action=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-checklist-action]')?.dataset.checklistAction;
 if(!action||playing||exercisePlaying||exercisePreparing||busy||stopping)return;
 if(focusView)setFocusView(false);
 if(action==='hear'){showWorkspace('harmony','harmony-title');return;}
 if(action==='positions'){const position=select('checklist-position').value;if(position!==overviewPosition)chooseOverviewPosition(position);showWorkspace('guitar','position-overview');return;}
 if(action==='connect'){showWorkspace('guitar','position-path-guide');select('featured-position').focus({preventScroll:true});return;}
 const idea=checklistIdeas(chordInfo(step)).find(item=>item.id===select('checklist-idea').value);if(!idea)return;
 if(idea.id==='gaps'){showWorkspace('practice','gap-enabled');input('gap-enabled').focus({preventScroll:true});return;}
 stopPreview();if(idea.id!=='exercise'){exerciseView.study=idea.id==='arpeggio'?'positional':idea.id==='triads'?'triadpairs':'pentatonic';if(idea.source)exerciseView.source=idea.source;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;renderGuitar();}
 showWorkspace('exercises','caged-exercise');
});
el('practice-roadmap-reset').addEventListener('click',()=>{
  const info=chordInfo(step),key=curriculumKey(practiceContext(info));
  delete practiceProgress[key];savePracticeProgress();renderPracticeRoadmap(info);
});
function selectFullFretboardRegion(target:EventTarget|null){
  const stringShape=target instanceof Element?target.closest<SVGGElement>('[data-full-string-position]'):null;
  if(stringShape&&acrossNeck(exerciseView)){const focused=document.activeElement===stringShape;if(exercisePlaying||exercisePreparing)return;neckMapShape=stringShape.dataset.fullStringPosition!;exerciseView.traversalCell=neckMapShape;renderGuitar();if(focused)el('full-fretboard').querySelector<SVGGElement>(`.per-string-region-label[data-full-string-position="${neckMapShape}"]`)?.focus();return;}
  if(stringShape&&perStringMapContext){const focused=document.activeElement===stringShape;perStringMapShape=stringShape.dataset.fullStringPosition!;renderPerStringMap(perStringMapContext);if(focused)el('full-fretboard').querySelector<SVGGElement>(`.per-string-region-label[data-full-string-position="${perStringMapShape}"]`)?.focus();return;}
  const region=target instanceof Element?target.closest<SVGGElement>('[data-full-position]'):null;
  if(region)chooseOverviewPosition(region.dataset.fullPosition||'I');
}
el('full-fretboard').addEventListener('click',event=>selectFullFretboardRegion(event.target));
el('full-fretboard').addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const region=event.target instanceof Element?event.target.closest('[data-full-position],[data-full-string-position]'):null;
  if(region){event.preventDefault();selectFullFretboardRegion(region);}
});
el('full-fretboard-expand').addEventListener('click',async()=>{
  try{
    if(document.fullscreenElement)await document.exitFullscreen();else await fullFretboardPanel.requestFullscreen();
  }catch{/* Fullscreen is optional; the wide, scrollable view remains available. */}
});
document.addEventListener('fullscreenchange',()=>{el('full-fretboard-expand').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';applyStudioIcons(document.querySelector('.guitar')!);});
el('position-previous').addEventListener('click',()=>moveOverviewPosition(-1));
el('position-next').addEventListener('click',()=>moveOverviewPosition(1));
function syncExerciseRouteCards(){
 el('caged-exercise').querySelectorAll<HTMLButtonElement>('.exercise-position-route [data-inspect-slot]').forEach(button=>{
  const activeSlot=currentExerciseGroups[exerciseMapSlot]?.resolution?exercisePlan?.slots[0]?.slot:exerciseMapSlot;
  const current=Number(button.dataset.inspectSlot)===activeSlot;
  button.classList.toggle('current',current);button.setAttribute('aria-pressed',String(current));
  if(current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
  button.disabled=playing||exercisePlaying||exercisePreparing;
 });
}
function inspectExerciseChord(slot:number){
 if(playing||exercisePlaying||exercisePreparing||!Number.isInteger(slot))return;
 const group=currentExerciseGroups[slot];if(!group?.harmony)return;
 stopExercisePreview();showExerciseGroup(group);
}
el('caged-exercise').addEventListener('click',event=>{
 const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('.exercise-position-route [data-inspect-slot]'):null;
 if(button&&!button.disabled)inspectExerciseChord(Number(button.dataset.inspectSlot));
});
function handleExerciseControl(event:Event){
  const target=event.target;
  if(!(target instanceof HTMLInputElement||target instanceof HTMLSelectElement))return;
  if(target.dataset.neckField)return;
  if(target.id==='exercise-guitar-volume'){
    exerciseGuitarVolume=Math.max(0,Math.min(100,Number(target.value)||0));
    el('exercise-guitar-volume-value').textContent=exerciseGuitarVolume+'%';
    if(exerciseGuitarGain&&exerciseGuitarGain.context===context)exerciseGuitarGain.gain.setTargetAtTime(exerciseGuitarVolume/100,context!.currentTime,.015);
    try{localStorage.setItem('mehtronome-exercise-guitar-volume',String(exerciseGuitarVolume));}catch{}
    return;
  }
  const deferredNumber=target instanceof HTMLInputElement&&target.type==='number'&&['exercise-tempo','exercise-auto-increment','exercise-auto-target'].includes(target.id);
  // Rebuilding the panel on each keystroke dismisses mobile number keyboards and
  // makes multi-digit values effectively impossible to enter. Commit those fields
  // when the edit is complete; all other controls remain immediate.
  if(event.type==='input'&&deferredNumber)return;
  if(event.type==='change'&&!deferredNumber)return;
  if(target.id==='exercise-favourites'&&target.value!==''){restoreExercise(exerciseFavourites()[Number(target.value)]);return;}
  if(target.id==='exercise-tempo'){changeExerciseTempo(Number(target.value));return;}
  if(target.id==='exercise-position-navigation'){stopExercisePreview();select('featured-position').value=target.value;renderMusic();return;}
  if(target.id==='exercise-position-region'){stopExercisePreview();select('position-region').value=target.value;renderMusic();return;}
  if(target.id==='exercise-position'){const numeral=target.value;stopExercisePreview();chooseOverviewPosition(numeral);el('exercise-position').focus({preventScroll:true});return;}
  const cardStartValue=target.value;
  exerciseView.setupOpen=el('caged-exercise').querySelector<HTMLDetailsElement>('.exercise-setup')?.open||false;
  stopExercisePreview();
  if(target.id==='exercise-auto-target')exerciseView.ceiling=Math.max(30,Math.min(240,Number(target.value)||160));
  if(['exercise-content-material','exercise-content-source','exercise-content-family','exercise-entry-note','exercise-sequence-advance','exercise-sequence-order','exercise-arpeggio-sequence','exercise-rhythm','exercise-material','exercise-study','exercise-motion','exercise-source','exercise-pattern','exercise-enclosure-target','exercise-enclosure-pattern','exercise-enclosure-family','exercise-arpeggio-pattern','exercise-arpeggio-register','exercise-arpeggio-family','exercise-arpeggio-source','exercise-arpeggio-routine','exercise-arpeggio-approach','exercise-traversal-material','exercise-scale-family','exercise-scale-pattern','exercise-enclosure-size','exercise-enclosure-neighbours'].includes(target.id)){exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(target.id==='exercise-fingering'){exerciseView.fingering=target.value;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(target.id==='exercise-inversion'){exerciseView.inversion=Number(target.value);exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(target.id==='exercise-spread-source'){exerciseView.spreadSource=target.value;exerciseView.inversion=0;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(target.id==='exercise-fingering-set'){exerciseView.fingeringStringSet=Number(target.value);exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(target.id==='exercise-fingering-fret'){exerciseView.fingeringFret=Number(target.value);exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(['exercise-fingering','exercise-inversion','exercise-spread-source','exercise-fingering-set','exercise-fingering-fret'].includes(target.id))perStringView?.setSelection({...exerciseView,kind:exerciseView.fingering});
  if(target.id==='exercise-content-material')changeContentMaterial(exerciseView,target.value);
  if(target.id==='exercise-content-source')changeContentSource(exerciseView,target.value);
  if(target.id==='exercise-content-family')changeContentFamily(exerciseView,target.value);
  if(target.id==='exercise-entry-note')exerciseView.entryTone=target.value;
  if(target.id==='exercise-material'){exerciseView.material=target.value;exerciseView.arpeggioPattern=normalizeArpeggioPattern(exerciseView.arpeggioPattern,target.value);}
  if(target.id==='exercise-study')exerciseView.study=resolveLibraryExercise(target.value,exerciseView.study);
  if(target.id==='exercise-motion')exerciseView.motion=target.value;
  if(target.id==='exercise-rhythm')exerciseView.rhythm=target.value;
  if(target.id==='exercise-card-start'){
    const harmonies=Array.from({length:progressionDefinition(settings).roman.length},(_,index)=>chordInfo(index));
    input('pattern-start-route').value=patternStartRoute(harmonies,input('pattern-start-route').value,{step,value:cardStartValue}).value;
    localStorage.setItem('mehtronome-pattern-start-route',input('pattern-start-route').value);
    exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;
  }
  if(target.id==='exercise-start-note'){exerciseView.startTone=target.value;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;}
  if(target.id==='exercise-traversal-material')exerciseView.study=target.value;
  if(target.id==='exercise-scale-family')exerciseView.study=(exerciseView.study.startsWith('arpseq_')?'arpseq_':'')+SCALE_SEQUENCE_FAMILIES[target.value as keyof typeof SCALE_SEQUENCE_FAMILIES][0][0];
  if(target.id==='exercise-sequence-advance')exerciseView.sequenceAdvance=Number(target.value);
  if(target.id==='exercise-sequence-order')exerciseView.sequenceOrder=target.value;
  if(target.id==='exercise-arpeggio-sequence')exerciseView.arpeggioSequence=target.value;
  if(target.id==='exercise-scale-pattern')exerciseView.study=target.value;
  if(target.id==='exercise-enclosure-size')exerciseView.study=target.value==='3'?'enclosures':'enclosures'+target.value;
  if(target.id==='exercise-enclosure-neighbours')exerciseView.study=target.value;
  if(target.id==='exercise-arpeggio-source')exerciseView.arpeggioSource=target.value;
  if(target.id==='exercise-arpeggio-routine')exerciseView.arpeggioRoutine=target.value;
  if(target.id==='exercise-arpeggio-approach')exerciseView.arpeggioApproach=target.value;
  if(target.id==='exercise-arpeggio-family'){const groups=arpeggioPatternGroups(exerciseView.material,target.value);exerciseView.arpeggioPattern=groups.length?groups[0].items[0][0]:target.value;}
  if(target.id==='exercise-arpeggio-pattern')exerciseView.arpeggioPattern=target.value;
  if(target.id==='exercise-arpeggio-register')exerciseView.arpeggioRegister=target.value;
  if(target.id==='exercise-enclosure-target')exerciseView.enclosureTarget=target.value;
  if(target.id==='exercise-enclosure-family'){const groups=enclosurePatternGroups(exerciseView.study,target.value);exerciseView.enclosurePattern=groups.flatMap(g=>g.items)[0]?.[0]||'upper';}
  if(target.id==='exercise-enclosure-pattern')exerciseView.enclosurePattern=target.value;
  if(target.id==='exercise-source')exerciseView.source=target.value;
  if(target.id==='exercise-pattern')exerciseView.pattern=target.value;
  if(target.id==='exercise-display'){exerciseView.display=target.value;localStorage.setItem('mehtronome-notation-display',target.value);}
  if(target.id==='exercise-chord-diagrams'&&target instanceof HTMLInputElement){exerciseView.chordDiagrams=target.checked;localStorage.setItem('mehtronome-notation-chord-diagrams',String(target.checked));}
  if(target.id==='exercise-zoom'){exerciseView.zoom=target.value;localStorage.setItem('mehtronome-notation-zoom',target.value);}
  if(target.id==='exercise-auto-tempo'&&target instanceof HTMLInputElement)exerciseView.autoTempo=target.checked;
  if(target.id==='exercise-auto-every')exerciseView.autoEvery=Number(target.value);
  if(target.id==='exercise-auto-increment')exerciseView.autoIncrement=Math.max(1,Math.min(20,Number(target.value)||2));
  if(target.id==='exercise-loop'&&target instanceof HTMLInputElement)exerciseView.loop=target.checked;
  if(target.id==='exercise-backing'&&target instanceof HTMLInputElement)exerciseView.backing=target.checked;
  renderGuitar();
  document.getElementById(target.id)?.focus({preventScroll:true});
}
el('caged-exercise').addEventListener('input',handleExerciseControl);
el('caged-exercise').addEventListener('change',handleExerciseControl);
function setNotationFocus(value:boolean) {
  el('caged-exercise').classList.toggle('notation-focused',value);
  document.body.classList.toggle('notation-focus-open',value);
  const button=document.querySelector<HTMLButtonElement>('#exercise-focus');
  if(button){button.textContent=value?'Exit notation focus':'Focus notation';button.setAttribute('aria-pressed',String(value));applyStudioIcons(el('caged-exercise'));}
}
async function auditionExerciseNote(index:number){
  if(playing||exercisePlaying||exercisePreparing||!currentExercise[index])return;const note={...currentExercise[index]},generation=++noteAuditionGeneration;await prepareAudio();if(generation!==noteAuditionGeneration||playing||exercisePlaying||exercisePreparing)return;const duration=.9,buffer=exerciseBufferCache.get(context!,note.midi,duration);const source=context!.createBufferSource(),gain=context!.createGain();source.buffer=buffer;source.playbackRate.value=guitarTuningRatio(settings.guitarTuning);guitarNoteSources.add(source);gain.gain.value=.26;source.connect(gain).connect(exerciseGuitarOutput());source.start();source.stop(context!.currentTime+duration);source.onended=()=>{guitarNoteSources.delete(source);source.disconnect();gain.disconnect();};
}
function showExerciseGroup(group:any){
 if(!group?.harmony)return;
 if(settings.progression){const actualStep=group.resolution?exercisePlan?.slots.at(-1)?.step:progressionOrder(settings)[group.slot];if(actualStep===undefined)return;step=actualStep;if(exercisePlaying&&document.body.dataset.workspace==='exercises'){exerciseReferenceDirty=true;renderProgressionReference(step,true);}else{renderMusic(true,group.position);renderProgressionReference(step);}}
 exerciseMapSlot=group.slot;updateProgressionMap(el('caged-exercise'),group,exerciseView.study);syncMiniTransport();
}
function chooseOrAuditionExerciseNote(index:number){if(playing||exercisePlaying||exercisePreparing)return;
 const group=currentExerciseGroups.find((g:any)=>index>=g.globalStart&&index<g.globalStart+g.notes.length);
 if(group?.harmony)showExerciseGroup(group);
 highlightLearningNote(index,currentExercise,true);void auditionExerciseNote(index);
}
function exerciseSnapshot(){return {traversalShiftStrings:exerciseView.traversalShiftStrings,traversalPositionOrder:exerciseView.traversalPositionOrder,traversalTurn:exerciseView.traversalTurn,traversalCell:exerciseView.traversalCell,traversal:exerciseView.traversal,traversalStrings:exerciseView.traversalStrings,traversalStart:exerciseView.traversalStart,traversalEnd:exerciseView.traversalEnd,linkedFingering:true,exactFingering:exerciseView.exactFingering,entryTone:exerciseView.entryTone,sequenceAdvance:exerciseView.sequenceAdvance,sequenceOrder:exerciseView.sequenceOrder,arpeggioSequence:exerciseView.arpeggioSequence,arpeggioPattern:exerciseView.arpeggioPattern,arpeggioRegister:exerciseView.arpeggioRegister,arpeggioClose:exerciseView.arpeggioClose,arpeggioSource:exerciseView.arpeggioSource,arpeggioRoutine:exerciseView.arpeggioRoutine,arpeggioApproach:exerciseView.arpeggioApproach,enclosureTarget:exerciseView.enclosureTarget,enclosurePattern:exerciseView.enclosurePattern,fingering:exerciseView.fingering,inversion:exerciseView.inversion,fingeringFret:exerciseView.fingeringFret,fingeringStringSet:exerciseView.fingeringStringSet,spreadSource:exerciseView.spreadSource,patternStartRoute:input('pattern-start-route').value,study:exerciseView.study,material:exerciseView.material,motion:exerciseView.motion,rhythm:exerciseView.rhythm,source:exerciseView.source,pattern:exerciseView.pattern,display:exerciseView.display,zoom:exerciseView.zoom,chordDiagrams:exerciseView.chordDiagrams,stage:exerciseView.stage,startTone:exerciseView.startTone,tempo:exerciseView.tempo,tempoLinked:exerciseView.tempoLinked};}
function restoreExercise(snapshot:any){if(!snapshot)return;stopExercisePreview();Object.assign(exerciseView,{traversalShiftStrings:2,traversalPositionOrder:'follow',traversalTurn:'note',traversalCell:'first',traversal:'position',traversalStrings:'0,1',traversalStart:5,traversalEnd:17,exactFingering:false,entryTone:'default',sequenceAdvance:1,sequenceOrder:'normal',arpeggioSequence:'stepwise',arpeggioPattern:'straight',arpeggioRegister:'up',arpeggioClose:false,arpeggioSource:'diatonic',arpeggioRoutine:'repeat',arpeggioApproach:'none',fingering:'caged',inversion:0,fingeringFret:5,spreadSource:'chord',fingeringStringSet:0});input('pattern-start-route').value=typeof snapshot.patternStartRoute==='string'?snapshot.patternStartRoute:'';localStorage.setItem('mehtronome-pattern-start-route',input('pattern-start-route').value);exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;Object.assign(exerciseView,{stage:'full',startTone:'default',application:'cell-space',response:'demo'},snapshot);if(!acrossNeck(exerciseView))perStringView?.setSelection({...exerciseView,kind:exerciseView.fingering});renderGuitar();}
function moveExercise(direction:number){
 const families=contentFamilies(contentMaterial(exerciseView),contentSource(exerciseView),exerciseView),index=families.findIndex(([id])=>id===contentFamily(exerciseView)),next=families[index+direction];if(!next)return;
 stopExercisePreview();exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;changeContentFamily(exerciseView,next[0]);renderGuitar();select('exercise-content-family').focus({preventScroll:true});
}
function exerciseFavourites(){return readExerciseFavourites(localStorage.getItem(EXERCISE_FAVOURITES_KEY));}
function exerciseFavouriteLabel(item:any){
 const normal=normalizeExerciseOptions({...item}),name=CONTENT_MATERIALS.find(([id])=>id===contentMaterial(normal))?.[1]||(normal.exactFingering?'Fretboard chord shape':'Exercise');
 const labels=[name,contentSources(contentMaterial(normal)).find(([id])=>id===contentSource(normal))?.[1]||'',contentFamilies(contentMaterial(normal),contentSource(normal),normal).find(([id])=>id===contentFamily(normal))?.[1]||'',SCALE_SEQUENCE_STUDIES.has(normal.study)?groupPatternLabel(normal.study.replace(/^arpseq_/,''),scaleSequenceLabel(normal.study)):''];
 if(['positional','positionalscale'].includes(normal.study))labels.push(savedEntryLabel(normal.startTone));else labels.push(savedEntryLabel(normal.entryTone));
 if(normal.study==='harmonized')labels.push(arpeggioPatternLabel(normal.arpeggioPattern,normal.arpeggioClose),normal.arpeggioRoutine!=='repeat'?{alternate:'Alternate order',inversions:'Cycle entry tones',connected:'Nearest entry'}[normal.arpeggioRoutine as 'alternate']||'':'',normal.arpeggioApproach!=='none'?'Approach '+normal.arpeggioApproach:'');
 if(normal.study==='harmonized'&&normal.arpeggioSequence!=='stepwise')labels.push(groupPatternLabel(normal.arpeggioSequence,ARPEGGIO_ROOT_SEQUENCES[normal.arpeggioSequence].label,'arpeggios'));
 if(hasExerciseCellOrder(normal))labels.push(scaleCellOrders(normal.study==='harmonized'?normal.arpeggioSequence:normal.study).find(([id])=>id===normal.sequenceOrder)?.[1]||'');
 if(SCALE_SEQUENCE_STUDIES.has(normal.study)||normal.study==='harmonized')labels.push('Advance '+normal.sequenceAdvance);
 if(normal.study.startsWith('enclosures')){labels.push((normal.study==='enclosures4'?'4':normal.study==='enclosures5'?'5':'3')+' notes');if(!['enclosures4','enclosures5'].includes(normal.study))labels.push(normal.study==='enclosuresbelowabove'?'Below–above':normal.study==='enclosureschromatic'?'Chromatic neighbours':'Above–below');const offsets=(ENCLOSURE_PATTERNS as Record<string,Record<string,number[]>>)[normal.study]?.[normal.enclosurePattern];if(offsets)labels.push(enclosurePatternLabel(offsets));}
 if(normal.study==='harmonized')labels.push({up:'Above entry',down:'Below entry',alternating:'Alternate register',alternatingDown:'Alternate register · below first'}[normal.arpeggioRegister as 'up']||'');
 labels.push(normal.motion==='descending'?'Downward first':'Upward first',{eighths:'Eighths',triplets:'Triplets',sixteenths:'Sixteenths'}[normal.rhythm as 'eighths']||'');
 if(acrossNeck(normal)){labels.push(traversalLabel(normal));if(hasRouteTurnOptions(normal))labels.push(normal.traversalTurn==='position'?'Turn on entering end position':'Repeat boundary note at turn');if(normal.traversalCell!=='first')labels.push('Starting cell '+(Number(normal.traversalCell.split(':')[0])+1)+' · fret '+normal.traversalCell.split(':')[1]);}
 return labels.filter(Boolean).join(' · ');
}
function refreshExerciseFavourites(){
 const menu=document.getElementById('exercise-favourites') as HTMLSelectElement|null;if(!menu)return;
 const items=exerciseFavourites(),key=exerciseFavouriteKey(exerciseSnapshot());
 menu.replaceChildren(new Option(items.length?`Choose a favourite (${items.length})`:'Your favourites',''),...items.map((item:any,index:number)=>{const label=exerciseFavouriteLabel(item),option=new Option(label,String(index));option.title=label;return option;}));
 const index=items.findIndex((item:any)=>exerciseFavouriteKey(item)===key);menu.value=index<0?'':String(index);
 const button=document.getElementById('exercise-favourite') as HTMLButtonElement|null;if(button){button.textContent=index<0?'☆ Favourite':'★ Favourited';button.disabled=false;button.setAttribute('aria-pressed',String(index>=0));button.title=index<0?'Add this exercise to favourites':'Remove this exercise from favourites';}
}
function favouriteExercise(){
 const items=toggleExerciseFavourite(exerciseFavourites(),exerciseSnapshot());
 localStorage.setItem(EXERCISE_FAVOURITES_KEY,JSON.stringify(items));refreshExerciseFavourites();applyStudioIcons(el('caged-exercise'));
}

function exportExerciseSvg(){
  const svgs=Array.from(document.querySelectorAll<SVGSVGElement>('#caged-exercise .exercise-notation'));if(!svgs.length)return;const width=1200,heights=svgs.map(svg=>Number(svg.viewBox.baseVal.height)||280),height=heights.reduce((a,b)=>a+b,0);let y=0;
  const body=svgs.map((svg,index)=>{const viewWidth=Number(svg.viewBox.baseVal.width)||760,result=`<svg x="0" y="${y}" width="${width}" height="${heights[index]}" viewBox="0 0 ${viewWidth} ${heights[index]}">${svg.innerHTML}</svg>`;y+=heights[index];return result;}).join('');
  const file=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>text{fill:#17201d}.notation-paper,.tab-fret-bg{fill:#fffdf8}.notation-line,.ledger-line,.bar-line,.note-stem{stroke:#26302c}.notation-chord-symbol{font-family:Georgia,serif;fill:#17201d}.score-chord-root{font-size:19px;font-weight:600}.score-chord-quality{font-size:13px;font-style:italic}.score-chord-bass{font-size:15px}.notation-backing{font:10px sans-serif}.note-accent{fill:#17201d;font:bold 18px Georgia,serif}.note-head{fill:#17201d}.note-hole{fill:#fffdf8}.note-flag,.note-tie{fill:none;stroke:#17201d;stroke-width:1.5}.duration-dot{fill:#17201d}.note-beam{stroke:#17201d;stroke-width:5}</style>${body}</svg>`,url=URL.createObjectURL(new Blob([file],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download=`mehtronome-${exerciseView.study}.svg`;link.click();URL.revokeObjectURL(url);
}
function highlightExerciseCells(event:any){document.querySelectorAll<HTMLElement>('#caged-exercise .notation-cell').forEach(cell=>cell.classList.toggle('cell-playing',Boolean(event&&Number(cell.dataset.cellIndex)===event.cellId)));}
function selectExerciseCell(cell:SVGElement){if(exercisePlaying||exercisePreparing)stopExercisePreview();exerciseCellSelection={cellId:Number(cell.dataset.cellIndex)};exerciseSelectionStart=Number(cell.dataset.rangeStart);exerciseSelectionEnd=Number(cell.dataset.rangeEnd);exerciseView.loop=true;input('exercise-loop').checked=true;reflectExerciseSelection();}
function exerciseNoteAtPoint(x:number,y:number){
  const direct=document.elementFromPoint(x,y)?.closest<SVGElement>('#caged-exercise .exercise-note');if(direct)return direct;
  let nearest:SVGElement|null=null,distance=Infinity;
  document.querySelectorAll<SVGElement>('#caged-exercise .exercise-note').forEach(note=>{const box=note.getBoundingClientRect(),dx=x-(box.left+box.width/2),dy=y-(box.top+box.height/2),candidate=dx*dx+dy*dy;if(candidate<distance){distance=candidate;nearest=note;}});
  return distance<1600?nearest:null;
}
function updateExerciseDrag(x:number,y:number){
  const note=exerciseNoteAtPoint(x,y);if(!note)return;
  const index=Number(note.dataset.noteIndex);if(index===exerciseSelectionEnd)return;
  exerciseSelectionEnd=index;exerciseDragMoved=index!==exerciseSelectionStart;reflectExerciseSelection();
}
el('caged-exercise').addEventListener('pointerdown',event=>{
  if(event.button!==0||!(event.target instanceof Element))return;
  const note=event.target.closest<SVGElement>('.exercise-note');if(!note)return;
  if(exercisePlaying)stopExercisePreview();
  exerciseCellSelection=null;
  exerciseDragPointer=event.pointerId;exerciseDragMoved=false;
  exerciseSelectionStart=Number(note.dataset.noteIndex);exerciseSelectionEnd=exerciseSelectionStart;
  el('caged-exercise').setPointerCapture(event.pointerId);reflectExerciseSelection();
});
el('caged-exercise').addEventListener('pointermove',event=>{
  if(exerciseDragPointer!==event.pointerId)return;
  updateExerciseDrag(event.clientX,event.clientY);if(exerciseDragMoved)event.preventDefault();
});
el('caged-exercise').addEventListener('pointerup',event=>{
  if(exerciseDragPointer!==event.pointerId)return;
  updateExerciseDrag(event.clientX,event.clientY);
  exerciseDragPointer=null;
  if(!exerciseDragMoved){const index=exerciseSelectionStart;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;reflectExerciseSelection();suppressExerciseNoteClick=true;setTimeout(()=>{suppressExerciseNoteClick=false;},0);if(index!==null)chooseOrAuditionExerciseNote(index);return;}
  suppressExerciseNoteClick=true;setTimeout(()=>{suppressExerciseNoteClick=false;},0);reflectExerciseSelection();
});
el('caged-exercise').addEventListener('pointercancel',event=>{
  if(exerciseDragPointer!==event.pointerId)return;
  exerciseDragPointer=null;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;reflectExerciseSelection();
});
el('caged-exercise').addEventListener('click',event=>{
  if(event.target instanceof Element){exerciseView.setupOpen=el('caged-exercise').querySelector<HTMLDetailsElement>('.exercise-setup')?.open||false;const button=event.target.closest<HTMLElement>('[data-learning-study]');if(button){stopExercisePreview();exerciseView.study=button.dataset.learningStudy!;exerciseView.backing=true;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;renderGuitar();return;}if(event.target.closest('#exercise-map-toggle')){exerciseView.fretboard=!exerciseView.fretboard;el('exercise-map-body').hidden=!exerciseView.fretboard;document.querySelector<HTMLElement>('.exercise-linked-fretboard')!.hidden=!exerciseView.fretboard;el('exercise-map-toggle').textContent=exerciseView.fretboard?'Hide diagram':'Show diagram';el('exercise-map-toggle').setAttribute('aria-expanded',String(exerciseView.fretboard));document.querySelector('.exercise-material-layout')!.classList.toggle('map-hidden',!exerciseView.fretboard);return;}const linked=event.target.closest<SVGElement>('[data-exercise-index]');if(linked){chooseOrAuditionExerciseNote(Number(linked.dataset.exerciseIndex));return;}}
  if(!(event.target instanceof Element))return;
  const cell=event.target.closest<SVGElement>('.notation-cell');if(cell){selectExerciseCell(cell);return;}
  if(event.target.closest('#exercise-clear-range')){if(exercisePlaying)stopExercisePreview();exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;reflectExerciseSelection();return;}
  if(event.target.closest('#exercise-preview'))void toggleExercisePreview();
  if(event.target.closest('#exercise-focus'))setNotationFocus(!el('caged-exercise').classList.contains('notation-focused'));
  const note=event.target.closest<SVGElement>('.exercise-note');if(note){if(suppressExerciseNoteClick)suppressExerciseNoteClick=false;else chooseOrAuditionExerciseNote(Number(note.dataset.noteIndex));}
  const ratio=event.target.closest<HTMLElement>('[data-tempo-ratio]');if(ratio)changeExerciseTempo(settings.bpm*Number(ratio.dataset.tempoRatio),ratio.dataset.tempoRatio==='1');
  if(event.target.closest('#exercise-history-back'))moveExercise(-1);
  if(event.target.closest('#exercise-history-forward'))moveExercise(1);
  if(event.target.closest('#exercise-favourite'))favouriteExercise();
  if(event.target.closest('#exercise-export'))exportExerciseSvg();
  if(event.target.closest('#exercise-print'))window.print();
});
el('caged-exercise').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof SVGElement&&event.target.matches('.notation-cell')){event.preventDefault();selectExerciseCell(event.target);return;}if((event.key==='Enter'||event.key===' ')&&event.target instanceof SVGElement&&event.target.hasAttribute('data-exercise-index')){event.preventDefault();chooseOrAuditionExerciseNote(Number(event.target.dataset.exerciseIndex));return;}if((event.key==='Enter'||event.key===' ')&&event.target instanceof SVGElement&&event.target.matches('.exercise-note')){event.preventDefault();chooseOrAuditionExerciseNote(Number(event.target.dataset.noteIndex));}});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&el('caged-exercise').classList.contains('notation-focused'))setNotationFocus(false);});
for(const id of ['theory-view','theory-choice'])select(id).addEventListener('input',()=>{
  if(id==='theory-view'){
    const value=select(id).value;
    theoryView.kind=['pentatonic','triads'].includes(value)?value as 'pentatonic'|'triads':'none';
    theoryView.choiceId='';
  }else theoryView.choiceId=select(id).value;
  renderGuitar();
  el(id).focus({preventScroll:true});
});
function restoreTheoryViews(controls:Record<string,string|boolean>) {
  const legacyKind=controls['theory-view-I'];
  const legacyChoice=controls['theory-choice-I'];
  const kind=controls['theory-view'] ?? legacyKind;
  const choice=controls['theory-choice'] ?? legacyChoice;
  theoryView.kind=kind==='pentatonic'||kind==='triads'?kind:'none';
  theoryView.choiceId=typeof choice==='string'?choice:'';
}

const gripButton = (target: EventTarget | null) => target instanceof HTMLElement ? target.closest<HTMLButtonElement>('button[data-grip]') : null;
for (const diagrams of [guitarDiagrams,el('caged-exercise')]) {
diagrams.addEventListener('click',event=>{
  const button=gripButton(event.target);
  if (!button || button.disabled) return;
  void previewGrip(button.dataset.grip!);
});
// Native buttons activate on mouse click, touch tap, Space and Enter.
diagrams.addEventListener('keydown',event=>{
  if (gripButton(event.target) && event.repeat && ['Space','Enter'].includes(event.code)) event.preventDefault();
});
}
function auditionRouteCard(button:HTMLButtonElement,hold:string){
 const slot=Number(button.dataset.inspectSlot),index=Number(button.dataset.routeStep),restoreFocus=document.activeElement===button,guitar=!!button.closest('#position-path');inspectExerciseChord(slot);
 void previewChord(index,hold,true);
 if(restoreFocus)(guitar?el('position-path'):el('caged-exercise')).querySelector<HTMLButtonElement>(`[data-route-step="${index}"]`)?.focus({preventScroll:true});
}
let routeHoldTimer:ReturnType<typeof setTimeout>|undefined;
let routeHoldOrigin:{x:number,y:number}|undefined;
document.addEventListener('pointerdown',event=>{
 const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('[data-route-step]'):null;
 if(!button||button.disabled||event.button!==0||!event.isPrimary)return;
 routeHoldOrigin={x:event.clientX,y:event.clientY};routeHoldTimer=setTimeout(()=>{auditionRouteCard(button,`pointer:${event.pointerId}`);},180);
});
window.addEventListener('pointermove',event=>{if(routeHoldOrigin&&Math.hypot(event.clientX-routeHoldOrigin.x,event.clientY-routeHoldOrigin.y)>8){clearTimeout(routeHoldTimer);routeHoldTimer=undefined;}});
for(const type of ['pointerup','pointercancel'] as const)window.addEventListener(type,()=>{clearTimeout(routeHoldTimer);routeHoldTimer=undefined;routeHoldOrigin=undefined;});
window.addEventListener('blur',()=>{clearTimeout(routeHoldTimer);routeHoldTimer=undefined;});
document.addEventListener('keydown',event=>{
 const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('[data-route-step]'):null;
 if(button&&!button.disabled&&event.code==='Space'){event.preventDefault();if(!event.repeat)auditionRouteCard(button,'key:Space');}
});
// Delegate on the stable document: selecting a chord redraws both reference panels.
const chordButton=(target:EventTarget|null)=>target instanceof HTMLElement?target.closest<HTMLButtonElement>('#custom-beat-grid button[data-grid-step], .progression-reference button[data-reference-step]'):null;
const chordIndex=(button:HTMLButtonElement)=>Number(button.dataset.referenceStep??button.dataset.gridStep??button.dataset.step);
document.addEventListener('pointerdown',event=>{
  const button=chordButton(event.target);
  if(!button||button.disabled||event.button!==0||!event.isPrimary)return;
  if(button.dataset.gridStep===undefined)event.preventDefault();button.focus();
  if(button.dataset.gridStep!==undefined){clearTimeout(chartPreviewTimer);chartPreviewTimer=setTimeout(()=>{void previewChord(chordIndex(button),`pointer:${event.pointerId}`);},180);}
  else void previewChord(chordIndex(button),`pointer:${event.pointerId}`);
  if(button.dataset.gridStep===undefined)document.documentElement.setPointerCapture(event.pointerId);
});
for(const type of ['pointerup','pointercancel','lostpointercapture'] as const){
  window.addEventListener(type,event=>{clearTimeout(chartPreviewTimer);chartPreviewTimer=undefined;if(previewHold===`pointer:${event.pointerId}`)stopPreview();});
}
document.addEventListener('keydown',event=>{
  const button=chordButton(event.target);
  if(!button||button.disabled||!['Space','Enter'].includes(event.code)||(button.dataset.gridStep!==undefined&&event.code==='Enter'))return;
  event.preventDefault();
  if(!event.repeat)void previewChord(chordIndex(button),`key:${event.code}`);
});
window.addEventListener('keyup',event=>{
  if(previewHold===`key:${event.code}`){event.preventDefault();stopPreview();}
});
window.addEventListener('blur',stopPreview);
document.addEventListener('focusout',()=>{
  queueMicrotask(()=>{
    const focused=chordButton(document.activeElement);
    if(!previewGripShape&&previewHold?.startsWith('key:')&&(!focused||chordIndex(focused)!==step))stopPreview();
  });
});
document.addEventListener('contextmenu',event=>{if(chordButton(event.target)&&previewHold)event.preventDefault();});
// Assistive technology can select a chord without synthesizing a held press.
document.addEventListener('click',event=>{
  const button=chordButton(event.target);
  if(button&&!button.disabled&&!playing&&!exercisePlaying){step=chordIndex(button);renderMusic();}
});
async function toggle() {
  if(studyAdvancing){studyAdvanceToken++;return;}
  if(exercisePlaying||exercisePreparing){stopExercisePreview();return;}
  if (busy || stopping || previewPreparation) return;
  if (playing) { await stop(); return; }
  busy = true;
  reflectPresetButtons();syncMiniTransport();
  el<HTMLButtonElement>('play').disabled = true;
  el('error').hidden = true;
  try {
    stopPreview();
    el('play-status').textContent='Preparing sounds…';
    await prepareAudio();
    currentBpm = settings.bpm;
    step = settings.progression ? progressionStep(settings,0) : 0;
    livePlaybackSettings=structuredClone(settings);livePlaybackStep=step;liveChangeStatus.hidden=true;playbackCounting=playbackLeadInBeats(settings)>0;playing = true;
    el('pulse-time').textContent=settings.sessionSeconds?`${formatTime(settings.sessionSeconds)} remaining`:'0:00 elapsed';
    postPreparedAudio(node!,{ type: 'start', settings, sampleNames:sampleNamesForSettings(settings) });installedSampleNames=new Set(sampleNamesForSettings(settings));
    renderMusic();
    reflectPlayback();
    el('play-status').textContent = playbackCounting?(settings.countIn?'Counting you in…':'Pickup…'):'Playing…';
  } catch (error) {
    playing = false;livePlaybackSettings=null;liveChangeStatus.hidden=true;
    reflectPlayback();
    el('error').textContent = error instanceof Error ? error.message : 'Could not start audio. Please try again.';
    el('error').hidden = false;
    el('play-status').textContent='Playback stopped. Try Play again.';
    await context?.close().catch(() => {});
    context = undefined;
    node = undefined;
  } finally { busy = false; el<HTMLButtonElement>('play').disabled = false; reflectPresetButtons();syncMiniTransport(); }
}

select('fret-labels').addEventListener('input', () => { guitarDegrees = select('fret-labels').value === 'degrees'; renderGuitar(); });
select('fret-view').addEventListener('input', () => { select('exercise').value = select('fret-view').value; renderMusic(); });

const soloChannels=new Set<string>();
function mixerMuteMask(){return MIX_CHANNELS.filter(channel=>input('mute-'+channel.id).checked||(soloChannels.size>0&&!soloChannels.has(channel.id))).map(channel=>channel.id).join(',');}
function reflectMixerChannels(){
  let mutedCount=0;
  for(const channel of MIX_CHANNELS){
    const muted=input('mute-'+channel.id).checked;
    const card=document.querySelector<HTMLElement>(`[data-mix-channel="${channel.id}"]`)!;
    const solo=soloChannels.has(channel.id), excluded=soloChannels.size>0&&!solo;
    card.classList.toggle('is-solo',solo);card.classList.toggle('is-excluded',excluded);
    card.querySelector('.channel-solo')?.setAttribute('aria-pressed',String(solo));
    card.classList.toggle('is-muted',muted);card.classList.remove('is-inactive');
    const button=card.querySelector<HTMLButtonElement>('.channel-mute')!;
    button.setAttribute('aria-pressed',String(muted));button.setAttribute('aria-label',`${muted?'Unmute':'Mute'} ${channel.label}`);
    button.textContent='M';button.dataset.label=muted?'Unmute':'Mute';button.title=`${muted?'Unmute':'Mute'} ${channel.label}`;
    el('mix-state-'+channel.id).textContent=muted?'Muted':excluded?'Solo muted':solo?'Solo':'On';
    if(muted)mutedCount++;
  }
  syncConsole();syncWorkspaceStates();
  el<HTMLButtonElement>('mixer-unmute-all').disabled=mutedCount===0;
  el<HTMLButtonElement>('mixer-clear-solos').disabled=soloChannels.size===0;
}
function sendMixerSettings(){
  queueAudioSettings(exercisePlaying?exerciseAudioSettings():settings);
}
function updateMixerLevels(){
  settings.soundLibrary='expanded';
  Object.assign(settings,{soundSources:{},drumKitChoice:'style'});settings.drumKit=resolveDrumKit(settings);
  settings.sequenceActivity=document.querySelector<HTMLSelectElement>('#sequence-activity')?.value||'supporting';
  for(const id of BACKING_CHANNELS)input(id).checked=true;
  settings.click=Number(input('click').value)/100;
  settings.harmony=Number(input('harmony').value)/100;
  el('click-value').textContent=`${input('click').value}%`;
  el('harmony-value').textContent=`${input('harmony').value}%`;
  for(const id of ['drums','bass','comping','sequence'] as const){
    settings[id]=input(id).checked;
    settings[`${id}Volume`]=Number(input(`${id}-volume`).value)/100;
    el(`${id}-volume-value`).textContent=`${input(`${id}-volume`).value}%`;
  }
  sendMixerSettings();reflectMixerChannels();
}
function applyMixerMutes(){
  settings.mutedChannels=mixerMuteMask();
  sendMixerSettings();reflectMixerChannels();
}
el('mix-sections').addEventListener('click',event=>{
  const solo=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-solo-channel]');
  if(solo){const id=solo.dataset.soloChannel!;if(soloChannels.has(id))soloChannels.delete(id);else soloChannels.add(id);applyMixerMutes();return;}
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-mute-channel]');if(!button)return;
  const control=input('mute-'+button.dataset.muteChannel);control.checked=!control.checked;applyMixerMutes();
});
el('mixer-clear-solos').addEventListener('click',()=>{soloChannels.clear();applyMixerMutes();});
el('mixer-unmute-all').addEventListener('click',()=>{for(const channel of MIX_CHANNELS)input('mute-'+channel.id).checked=false;applyMixerMutes();});
let pulseTaps:number[]=[];
function tapTempo(){
  const now=performance.now();
  if(pulseTaps.length&&now-pulseTaps.at(-1)!>2000)pulseTaps=[];
  pulseTaps=[...pulseTaps,now].slice(-8);
  const bpm=tapBpm(pulseTaps);
  if(bpm){tempo(bpm);el('tap-status').textContent=`${bpm} BPM · ${pulseTaps.length} taps`;}else el('tap-status').textContent='Tap again to set the tempo.';
}
el('tap-tempo').addEventListener('click',tapTempo);
el('pulse-large-open').addEventListener('click',()=>el<HTMLDialogElement>('pulse-large').showModal());
el('pulse-large-close').addEventListener('click',()=>el<HTMLDialogElement>('pulse-large').close());
el('pulse-large-play').addEventListener('click',()=>void toggle());
el('beat-dots').addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-pulse-beat]');if(!button)return;
  const beat=Number(button.dataset.pulseBeat);
  const accents=Array.from({length:settings.beats},(_,i)=>String(beatStrength(settings,i)));
  accents[beat]=String((Number(accents[beat])+2)%3);
  input('pulse-accents').value=accents.join('');
  if(beat===0)input('accent').checked=accents[0]==='2';
  update();renderBeats();
});
input('accent').addEventListener('input',()=>{if(input('pulse-accents').value)input('pulse-accents').value=(input('accent').checked?'2':'1')+input('pulse-accents').value.slice(1);});
el('pulse-accent-reset').addEventListener('click',()=>{input('pulse-accents').value='';input('accent').checked=true;update();renderBeats();});
let tempoShortcuts:number[]=[60,90,120];
try{const saved=JSON.parse(localStorage.getItem('mehtronome-tempo-shortcuts')||'null');if(Array.isArray(saved))tempoShortcuts=[...new Set(saved.filter((value:unknown)=>typeof value==='number'&&Number.isInteger(value)&&value>=30&&value<=240))].slice(0,8) as number[];}catch{/* Use defaults when storage is unavailable. */}
function renderTempoShortcuts(){
  el('tempo-shortcuts').innerHTML=tempoShortcuts.map(bpm=>`<span><button type="button" class="practice-button" data-tempo="${bpm}" aria-label="Set tempo to ${bpm} BPM">${bpm}</button><button type="button" class="pulse-remove" data-remove-tempo="${bpm}" aria-label="Remove ${bpm} BPM shortcut">×</button></span>`).join('');
}
function saveTempoShortcuts(){try{localStorage.setItem('mehtronome-tempo-shortcuts',JSON.stringify(tempoShortcuts));el('tempo-shortcut-status').textContent='Tempo shortcuts saved.';}catch{el('tempo-shortcut-status').textContent='Available for this session. Browser storage is unavailable.';}renderTempoShortcuts();}
renderTempoShortcuts();
el('tempo-shortcuts').addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
  if(button.dataset.tempo)tempo(Number(button.dataset.tempo));
  else if(button.dataset.removeTempo){tempoShortcuts=tempoShortcuts.filter(bpm=>bpm!==Number(button.dataset.removeTempo));saveTempoShortcuts();}
});
el('tempo-save').addEventListener('click',()=>{
  const bpm=playing?Math.round(currentBpm):settings.bpm;
  if(tempoShortcuts.includes(bpm)){el('tempo-shortcut-status').textContent='This tempo is already saved.';return;}
  if(tempoShortcuts.length>=8){el('tempo-shortcut-status').textContent='Eight shortcuts saved. Remove one to make room.';return;}
  tempoShortcuts.push(bpm);tempoShortcuts.sort((a,b)=>a-b);saveTempoShortcuts();
});
el('play').addEventListener('click', () => void toggle());
input('bpm').addEventListener('change', () => tempo(Number(input('bpm').value)));
input('tempo').addEventListener('input', () => tempo(Number(input('tempo').value)));
el('slower').addEventListener('click', () => tempo(settings.bpm - 1));
el('faster').addEventListener('click', () => tempo(settings.bpm + 1));
for (const id of ['extension-morph','extension-bars','pulse-sound','pulse-swing','pulse-minutes','pulse-finish-bar','pulse-poly','gap-progressive','gap-max','trainer-enabled','trainer-bars','trainer-increment','trainer-target','show-grip','highlight-mode','gap-enabled','gap-play','gap-mute','gap-target','loop-enabled','loop-start','loop-end','loop-unit','loop-beat-start','loop-beat-end','drums','bass','comping','drums-volume','bass-volume','comping-volume','sequence','sequence-volume','key', 'chord', 'template', 'subdivision', 'accent', 'beats', 'count-in', 'exercise', 'click', 'harmony']) el(id).addEventListener('input',()=>{if(el('mix-sections').contains(el(id))||['drums','bass','comping','sequence'].includes(id))updateMixerLevels();else update();});
for (const mode of ['pedal', 'progression']) {
  el(mode).addEventListener('click', () => {
    settings.progression = mode === 'progression';
    stopPreview();
    step = 0;
    for (const id of ['pedal', 'progression']) {
      el(id).classList.toggle('selected', mode === id);
      el(id).setAttribute('aria-pressed', String(mode === id));
    }
    const selectedTemplate = progressionDefinition({...settings,template:select('template').value,customProgression});
    if (settings.progression && selectedTemplate.kind === 'modal' && 'mode' in selectedTemplate) select('quality').value = String(selectedTemplate.mode);
    fillChords(true);
    update();
  });
}
function fillChords(preserve = false) {
  const previousChord = select('chord').value;
  const mode = select('quality').value as keyof typeof MODES;
  select('chord').innerHTML=chordTypeOptions(settings.progression?Object.keys(CHORDS):compatibleChords(mode),MODES[mode].chord);
  select('chord').value = preserve && Array.from(select('chord').options).some(option => option.value === previousChord) ? previousChord : MODES[mode].chord;
  el('mode-template').textContent = `Try ${MODES[mode].name} progression`;
  el('mode-template').hidden = !PROGRESSIONS[`modal_${mode}` as keyof typeof PROGRESSIONS] || settings.progression && select('template').value === `modal_${mode}`;
  select('template').querySelector<HTMLOptionElement>('[value=diatonic]')!.textContent=mode==='major'||mode==='minor'?progressionDefinition({mode,template:'diatonic'}).name:'Diatonic seventh chords · major/minor only';
  const modal = mode !== 'major' && mode !== 'minor';
  select('template').querySelector<HTMLOptionElement>('[value=diatonic]')!.disabled = modal;
  if (modal && select('template').value === 'diatonic') select('template').value = 'parallel1';

}
el('mode-template').addEventListener('click',()=>{
  if(settings.template==='custom'){
    const current=chordInfo(step);select('quality').value=current.mode;select('key').value=String(current.chordPcs[0]);
  }
  if(!PROGRESSIONS[`modal_${select('quality').value}` as keyof typeof PROGRESSIONS])return;
  stopPreview();settings.progression=true;step=0;
  select('template').value=`modal_${select('quality').value}`;
  for(const id of ['pedal','progression']){const selected=id==='progression';el(id).classList.toggle('selected',selected);el(id).setAttribute('aria-pressed',String(selected));}
  fillChords();update();
});
select('quality').addEventListener('input', () => {
  if (select('template').value.startsWith('modal_')) select('template').value = `modal_${select('quality').value}`;
  fillChords(); update();
});
select('template').addEventListener('input', () => {
  const template = progressionDefinition({...settings,template:select('template').value,customProgression});
  if (template.kind === 'modal' && 'mode' in template) { select('quality').value = String(template.mode); fillChords(); update(); }
});
el('single-chord-chart').addEventListener('click',async()=>{
  const chartChoice=document.querySelector<HTMLSelectElement>('#progression-choice');if(chartChoice){chartChoice.value='single';chartChoice.dispatchEvent(new Event('change'));return;}
  if(busy||stopping)return;
  const current=chordInfo(step);
  stopPreview();stopExercisePreview();if(playing)await stop();
  select('quality').value=current.mode;settings.progression=true;fillChords(true);select('chord').value=current.chordId;
  select('template').value='single';step=0;input('loop-enabled').checked=false;fillLoopOptions(true);update();
});
el('customize-progression').addEventListener('click',()=>{
  stopPreview();
  rememberCustomEdit();
  customProgression=cloneTemplate(progressionDefinition(settings),settings.chord,settings.mode,settings);
  customProgression.name='My progression';chartEditSteps=[];customStepIndex=0;
  saveCustomProgression('Template copied to a working draft. Named saved charts change only when you choose Update saved chart.');
  select('template').value='custom';settings.progression=true;input('loop-enabled').checked=false;step=0;
  fillChords(true);fillLoopOptions(true);update();
});
try{if(localStorage.getItem('mehtronome-harmony-workflow')==='mode')select('custom-harmony-workflow').value='mode';}catch{}
el('custom-harmony-workflow').addEventListener('input',()=>{stopPreview();localStorage.setItem('mehtronome-harmony-workflow',select('custom-harmony-workflow').value);renderCustomBuilder();applyStudioIcons(el('custom-progression-builder'));});
for(const id of ['custom-root','custom-mode','custom-bars','custom-beats','custom-duration-unit','custom-bass'])el(id).addEventListener('input',()=>commitCustomEdit(id));
el('custom-compatible-mode').addEventListener('click',()=>{stopPreview();stopExercisePreview();if(!modeFirstHarmony())select('custom-mode').value=recommendedMode(customProgression.steps[customStepIndex].chord);commitCustomEdit('custom-mode');});
el('custom-chord').addEventListener('input',()=>commitCustomEdit('custom-chord'));
for(const id of ['custom-name','custom-section'])el(id).addEventListener('change',()=>{const value=input(id).value.trim(),previous=id==='custom-name'?customProgression.name:customProgression.steps[customStepIndex].section||'';if((id==='custom-name'?value||'My progression':value)!==previous)commitCustomEdit(id);});
el('custom-undo').addEventListener('click',()=>restoreCustomEdit(true));
el('custom-redo').addEventListener('click',()=>restoreCustomEdit(false));
function changeChartStructure(ids:number[],selected:number,message:string,clearSection=false){
 if(ids.length>MAX_CHART_STEPS||!ids.length||exercisePlaying||exercisePreparing)return;
 const choices=chartPracticeChoices();rememberCustomEdit();const old=customProgression.steps;
 customProgression.steps=ids.map((i,j)=>({...old[i],...(clearSection&&j===selected?{section:''}:{})}));customStepIndex=selected;step=selected;chartEditSteps=[];
 if(customProgression.name.startsWith('Single-chord chart'))customProgression.name='My progression';saveCustomProgression(message);
 restoreChartPracticeChoices({positions:choices.positions?ids.map(i=>choices.positions![i]):null,starts:choices.starts?ids.map(i=>choices.starts![i]):null});input('loop-enabled').checked=false;fillLoopOptions(true);update();
}
for(const id of ['custom-add','custom-duplicate'])el(id).addEventListener('click',()=>{
 if(settings.template==='single')el('customize-progression').click();const ids=customProgression.steps.map((_:any,i:number)=>i);ids.splice(customStepIndex+1,0,customStepIndex);changeChartStructure(ids,customStepIndex+1,id==='custom-add'?'Inserted after the selected chord.':'Chord duplicated.',true);
});
el('custom-delete').addEventListener('click',()=>{if(customProgression.steps.length===1)return;const ids=customProgression.steps.map((_:any,i:number)=>i).filter((i:number)=>i!==customStepIndex);changeChartStructure(ids,Math.min(customStepIndex,ids.length-1),'Chord removed.');});
for(const [id,direction]of [['custom-left',-1],['custom-right',1]] as const)el(id).addEventListener('click',()=>{
 const destination=customStepIndex+direction;if(destination<0||destination>=customProgression.steps.length)return;const ids=customProgression.steps.map((_:any,i:number)=>i);[ids[customStepIndex],ids[destination]]=[ids[destination],ids[customStepIndex]];changeChartStructure(ids,destination,'Chord reordered.');
});
el('custom-copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(input('custom-text').value);el('custom-status').textContent='Progression copied to the clipboard.';}
  catch{input('custom-text').focus();input('custom-text').select();el('custom-status').textContent='The progression text is selected. Copy it with your keyboard.';}
});

document.addEventListener('keydown', event => {
  if(event.defaultPrevented)return;
  if(event.code==='KeyT'&&!event.repeat&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!(event.target instanceof HTMLElement&&event.target.closest('input,select,textarea,[contenteditable]'))){event.preventDefault();tapTempo();}
  if (event.code === 'Space' && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest('input, select, button, a, textarea, summary, [contenteditable]'))) {
    event.preventDefault(); void toggle();
  }
});
async function resumeBackgroundAudio() {
  if (!playing || !context || context.state !== 'suspended') return;
  try { await context.resume(); }
  catch { el('play-status').textContent = 'Playback is still active. Return to this tab to resume audio.'; }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!playing) stopPreview();
    return;
  }
  void resumeBackgroundAudio();
});
window.addEventListener('pageshow',()=>void resumeBackgroundAudio());
function syncTrainerStatus() {
  el('bpm-caption').textContent=settings.trainerEnabled?'STARTING BPM':'BEATS PER MINUTE';
  el('trainer-status').textContent = playing?`${currentBpm} BPM${currentBpm>=Math.max(settings.bpm,settings.trainerTarget)?' · Target reached':''}`:`Starts at ${settings.bpm} BPM.`;
}
function syncWorkspaceStates(){
 studyPathUi?.sync();
 const context=document.getElementById('setup-current-context');if(context)context.textContent=`Current setup: ${names[settings.key]} · ${settings.bpm} BPM · ${progressionDefinition(settings).name}`;
 const locked=playing||exercisePlaying||exercisePreparing;
 document.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement>('[data-practice-task],[data-checklist-action],#checklist-position,#checklist-idea').forEach(control=>control.disabled=locked);el<HTMLButtonElement>('practice-roadmap-reset').disabled=locked;
 const checklist=document.getElementById('practice-checklist-help');if(checklist)checklist.textContent=locked?'Stop playback before updating the checklist.':'Tick completed items for the current root, scale and chord.';
 for(const channel of MIX_CHANNELS){const badge=document.querySelector<HTMLElement>(`[data-sound-state=${channel.id}]`);if(!badge)continue;const muted=input('mute-'+channel.id).checked,excluded=soloChannels.size>0&&!soloChannels.has(channel.id);badge.textContent=muted?'Muted in mixer':excluded?'Excluded by solo':Number(input(channel.control).value)===0?'Level at 0%':'In mix';badge.classList.toggle('is-muted',muted||excluded);}
}
function syncMiniTransport(){return withPlaybackSettings(()=>syncMiniTransportDisplay());}
function syncMiniTransportDisplay() {
  document.dispatchEvent(new Event('mehtronome-playback-state'));
  syncExerciseRouteCards();
  el('position-path').querySelectorAll<HTMLButtonElement>('button').forEach(button=>{button.disabled=playing||exercisePlaying||exercisePreparing;});
  el('position-overview').querySelectorAll<HTMLButtonElement>('button').forEach(button=>{button.disabled=exercisePlaying||exercisePreparing;});
  for(const id of ['position-previous','position-next'])el<HTMLButtonElement>(id).disabled=exercisePlaying||exercisePreparing;
  for(const id of ['exercise-position-navigation','exercise-position-region','featured-position','position-region','guitar-chord-position']){const control=document.getElementById(id) as HTMLSelectElement|null;if(control)control.disabled=exercisePlaying||exercisePreparing;}
  const positionControl=document.getElementById('exercise-position') as HTMLSelectElement|null;if(positionControl)positionControl.disabled=playing||exercisePlaying||exercisePreparing||(settings.progression&&select('featured-position').value==='path');
  el('caged-exercise').querySelectorAll<HTMLButtonElement>('button[data-grip]').forEach(b=>b.disabled=playing||exercisePlaying||exercisePreparing);
  document.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-neck-field]').forEach(control=>control.disabled=exercisePlaying||exercisePreparing);
  document.querySelectorAll<HTMLButtonElement>('[data-section-start],[data-section-full]').forEach(b=>b.disabled=exercisePlaying||exercisePreparing);
  const mini = el('mini-transport');
  mini.hidden = false;
  if (document.activeElement !== input('mini-bpm')) input('mini-bpm').value = String(exercisePlaying?exerciseView.tempo:playing ? currentBpm : settings.bpm);
  el('mini-tempo-label').textContent = exercisePlaying?'STUDY BPM':playing && settings.trainerEnabled ? 'LIVE BPM' : 'BPM';
  input('mini-bpm').readOnly=false;input('mini-bpm').setAttribute('aria-label',exercisePlaying?'Exercise tempo':'Practice tempo');
  el('mini-play').textContent = studyAdvancing?'Cancel new study':playing||exercisePlaying||exercisePreparing ? 'Stop' : 'Play';
  el('mini-play').setAttribute('aria-pressed',String(playing||exercisePlaying||exercisePreparing));
  el('play').setAttribute('aria-pressed',String(playing||exercisePlaying||exercisePreparing));
  el('play-label').textContent=exercisePlaying||exercisePreparing?'Stop exercise':playing?'Stop session':'Play session';
  document.querySelector<HTMLElement>('.mini-harmony-controls')!.hidden=exercisePlaying;
  el<HTMLButtonElement>('mini-play').disabled = busy || stopping;
  const transportSettings=exercisePlaying&&exerciseView.backing?exerciseBackingConfig():settings;
  const transportStep=exercisePlaying?exerciseBackingStep:step;
  const outlineStep=exercisePlaying&&exerciseView.backing?(exercisePlaybackPlan?.slots[exerciseBackingStep]?.step??exerciseBackingStep):step;
  highlightChordPlayback(settings,outlineStep,(playing||exercisePlaying)&&!playbackCounting);
  const info = harmonyAt(transportSettings,transportStep);
  const active=musicalContext(transportSettings,transportStep);
  el('active-musical-context').innerHTML=`<div><small>Modal tonic</small><strong>${escapeHtml(info.scaleNames[0])}</strong></div><div><small>Current chord</small><strong>${escapeHtml(active.chord)}</strong></div><div><small>Current scale guide</small><strong>${escapeHtml(active.scale)}</strong></div><div><small>Next chord</small><strong>${escapeHtml(active.nextChord)}</strong></div>${exercisePlaying||transportSettings.extensionMorph?`<p>${exercisePlaying?'Exercise playback. ':''}${transportSettings.extensionMorph?'Evolving extensions on (Sound Settings).':''}</p>`:''}`;
  select('mini-key').setAttribute('aria-label',settings.progression?'Selected chord root':'Pedal root');
  select('mini-key').disabled=exercisePlaying||exercisePreparing||busy||stopping;
  select('mini-mode-select').parentElement!.hidden=select('quality').parentElement!.hidden;
  select('mini-chord-select').parentElement!.hidden=select('chord').parentElement!.hidden;
  const parent=parentMajorFor(info);el('mini-mode').title=`Modal tonic ${info.scaleNames[0]}${parent?.family==='Major scale'?' · Parent major: '+parent.name+' major':''} · next ${active.nextChord}`;
  el('mini-chord').textContent = info.name+info.suffix;
  syncWorkspaceStates();
  const sessionChord=document.getElementById('session-chord'),sessionMode=document.getElementById('session-mode');
  if(sessionChord)sessionChord.textContent=info.name+info.suffix;
  if(sessionMode)sessionMode.textContent=active.scale;
  el('mini-mode').textContent = `${exercisePlaying?'Study · ':''}${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name}${settings.guitarTuning===-1?' · E♭ guitar':''}`;
  el('mini-root-purpose').textContent=settings.progression?'Chord root':'Root';
  const rootMenu=select('mini-key');rootMenu.querySelector('option[value="mixed"]')?.remove();
  const mixedRoots=settings.progression&&settings.template==='custom'&&!playing&&!exercisePlaying&&step===customStepIndex&&new Set(chartEditSteps.map(i=>customProgression.steps[i]?.root)).size>1;
  if(mixedRoots)rootMenu.add(new Option('Mixed','mixed'));
  rootMenu.value=mixedRoots?'mixed':String(settings.progression?info.chordPcs[0]:settings.key);
  rootMenu.title=settings.progression?`Edits the selected chord${chartEditSteps.length>1?'s':''}. Chart key: ${names[settings.key]} (change it in Harmony).`:'Root of the repeating chord';
  select('mini-mode-select').value=select('quality').value;
  select('mini-chord-select').innerHTML=select('chord').innerHTML;
  select('mini-chord-select').value=select('chord').value;
  select('mini-chord-select').disabled=select('chord').disabled;
  const chartChoice=document.querySelector<HTMLSelectElement>('#progression-choice');
  if(chartChoice){select('mini-progression').innerHTML=chartChoice.innerHTML;select('mini-progression').value=chartChoice.value;select('mini-progression').disabled=chartChoice.disabled;}
  else select('mini-progression').value=settings.progression?select('template').value:'off';
  input('mini-count-in').checked=input('count-in').checked;
  input('mini-count-in').disabled=input('count-in').disabled;
  input('mini-accent').checked=input('accent').checked;
  input('mini-accent').disabled=input('accent').disabled;
}
function setFloatingMixer(open:boolean,restoreFocus=false){
  const sections=el('mix-sections'),dock=el('floating-mixer');
  if(open){
    el('floating-mixer-content').append(sections);
    dock.hidden=false;
    el('mini-transport').classList.remove('mobile-expanded');
    el('mini-more').setAttribute('aria-expanded','false');el('mini-more').textContent='Controls';
    el('floating-mixer-close').focus();
  }else{
    el('mix-panel').append(sections);
    dock.hidden=true;
  }
  el('mini-mixer').setAttribute('aria-expanded',String(open));
  el('mixer-docked-note').hidden=!open;
  el<HTMLButtonElement>('mix-collapse').disabled=open;
  if(restoreFocus)el('mini-mixer').focus();
}
el('mini-mixer').addEventListener('keydown',event=>{if(event.key==='Escape')setFloatingMixer(false,true);});
el('mini-mixer').addEventListener('click',()=>setFloatingMixer(el('floating-mixer').hidden));
el('floating-mixer-close').addEventListener('click',()=>setFloatingMixer(false,true));
el('mixer-return').addEventListener('click',()=>{setFloatingMixer(false);setMixerCollapsed(false);el('mix-collapse').focus();});
el('floating-mixer').addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();setFloatingMixer(false,true);}});
el('mini-play').addEventListener('click',()=>{if(studyAdvancing){studyAdvanceToken++;return;}if(exercisePlaying||exercisePreparing)stopExercisePreview();else void toggle();});
el('mini-more').addEventListener('click',()=>{
  if(!el('floating-mixer').hidden)setFloatingMixer(false);
  const expanded=el('mini-transport').classList.toggle('mobile-expanded');
  el('mini-more').setAttribute('aria-expanded',String(expanded));
  el('mini-more').textContent=expanded?'Done':'Controls';
});
input('mini-bpm').addEventListener('change',()=>{if(exercisePlaying)changeExerciseTempo(Number(input('mini-bpm').value));else tempo(Number(input('mini-bpm').value));input('mini-bpm').value=String(exercisePlaying?exerciseView.tempo:settings.bpm);});
select('mini-key').addEventListener('input',()=>{
 const value=select('mini-key').value;if(value==='mixed')return;
 if(settings.progression){
  if(exercisePlaying||exercisePreparing||busy||stopping)return;
  const selectedStep=playing?livePlaybackStep:step;if(settings.template!=='custom')el<HTMLButtonElement>('customize-progression').click();
  if(customStepIndex!==selectedStep){customStepIndex=selectedStep;chartEditSteps=[];renderCustomBuilder();}
  select('custom-root').value=String((Number(value)-settings.key+12)%12);commitCustomEdit('custom-root');
 }else{select('key').value=value;update();}
});
select('mini-mode-select').addEventListener('input',()=>{
  select('quality').value=select('mini-mode-select').value;
  if(select('template').value.startsWith('modal_'))select('template').value=`modal_${select('quality').value}`;
  fillChords();update();
});
select('mini-chord-select').addEventListener('input',()=>{select('chord').value=select('mini-chord-select').value;update();});
input('mini-count-in').addEventListener('input',()=>{input('count-in').checked=input('mini-count-in').checked;update();});
input('mini-accent').addEventListener('input',()=>{input('accent').checked=input('mini-accent').checked;input('accent').dispatchEvent(new Event('input'));});
select('mini-progression').addEventListener('input',()=>{
  const value=select('mini-progression').value;
  const chartChoice=document.querySelector<HTMLSelectElement>('#progression-choice');if(chartChoice){chartChoice.value=value;chartChoice.dispatchEvent(new Event('change'));return;}
  if(value==='off'){
    el<HTMLButtonElement>('single-chord-chart').click();
    return;
  }
  select('template').value=value;
  if(!settings.progression)el<HTMLButtonElement>('progression').click();
  else select('template').dispatchEvent(new Event('input',{bubbles:true}));
});
function setFocusView(value:boolean) {
  focusView=value;document.documentElement.classList.toggle('focus-view',value);
  el('focus-view').setAttribute('aria-pressed',String(value));el('focus-view').textContent=value?'Exit focus':'Focus view';
  el('exit-focus').hidden=!value;
  applyStudioIcons(document.querySelector('header')!);
  syncMiniTransport();
  if(value&&!['harmony','guitar','exercises'].includes(document.body.dataset.workspace||''))showWorkspace('guitar','guitar-title');
}
el('focus-view').addEventListener('click',()=>setFocusView(!focusView));
el('exit-focus').addEventListener('click',()=>setFocusView(false));

select('guitar-tuning').addEventListener('input',()=>{
 const tuning=normalizeGuitarTuning(select('guitar-tuning').value);settings.guitarTuning=tuning;if(livePlaybackSettings)livePlaybackSettings.guitarTuning=tuning;
 try{localStorage.setItem(GUITAR_TUNING_KEY,String(tuning));}catch{}
 for(const source of guitarNoteSources)source.playbackRate.setValueAtTime(guitarTuningRatio(tuning),source.context.currentTime);
 if(previewing&&!playing&&!exercisePlaying)stopPreview();
 node?.port.postMessage({type:'live-controls',settings:{guitarTuning:tuning}});syncMiniTransport();
});
el('open-sound-settings').addEventListener('click',()=>{setFloatingMixer(false);if(focusView)setFocusView(false);showWorkspace('settings','sound-settings-title');});
const workspaceTabs=Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-tab'));
const workspaceNames:Record<string,string>={'study-path-title':'study','pulse-title':'practice','harmony-title':'harmony','guitar-title':'guitar','caged-exercise':'exercises','progress-title':'progress','sound-settings-title':'settings'};
function selectWorkspaceTab(target:string) {
  for(const tab of workspaceTabs){
    const selected=tab.dataset.workspaceTarget===target;
    tab.classList.toggle('selected',selected);
    if(selected)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');
  }
}
for(const tab of workspaceTabs)tab.addEventListener('click',()=>{
  const target=tab.dataset.workspaceTarget!;
  showWorkspace(workspaceNames[target]||'practice',target);
});
function showWorkspace(name:string,target?:string) {
  document.body.dataset.workspace=name;
  if(name==='exercises'&&!exercisePlaying&&!exercisePreparing){renderGuitar();}
  if(name==='exercises')reserveChordBands(el('caged-exercise'));
  if(name==='harmony'&&settings.template==='custom'&&!playing&&!exercisePlaying){if(step!==customStepIndex){customStepIndex=step;chartEditSteps=[];}renderCustomBuilder();}
  if(exerciseReferenceDirty&&name!=='exercises'){exerciseReferenceDirty=false;renderMusic(true,currentExerciseGroups[exerciseMapSlot]?.position);}
  selectWorkspaceTab(Object.entries(workspaceNames).find(([,value])=>value===name)?.[0]||'pulse-title');
  if(target)requestAnimationFrame(()=>el(target).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
}
// The study organiser is the landing page; saved charts and study choices
// remain intact when the app opens.
showWorkspace('study');

const mixPanel=el('mix-panel');
function setMixerCollapsed(collapsed:boolean){
  mixPanel.classList.toggle('is-collapsed',collapsed);
  el('mix-collapse').setAttribute('aria-expanded',String(!collapsed));
  el('mix-collapse').textContent=collapsed?'Show mixer':'Hide mixer';
  try{localStorage.setItem('mehtronome-mixer-collapsed',String(collapsed));}catch{/* Session-only. */}
}
let mixerCollapsed=false;
try{mixerCollapsed=localStorage.getItem('mehtronome-mixer-collapsed')==='true';}catch{/* Use expanded mixer. */}
setMixerCollapsed(mixerCollapsed);
el('mix-collapse').addEventListener('click',()=>setMixerCollapsed(!mixPanel.classList.contains('is-collapsed')));

select('featured-position').addEventListener('input',renderGuitar);
select('position-region').addEventListener('input',renderGuitar);
el('position-path').addEventListener('click',event=>{
  const button=event.target instanceof HTMLElement?event.target.closest<HTMLButtonElement>('button[data-inspect-slot]'):null;
  if(!button||button.disabled)return;
  inspectExerciseChord(Number(button.dataset.inspectSlot));
  el('position-path').querySelector<HTMLButtonElement>(`[data-inspect-slot="${button.dataset.inspectSlot}"]`)?.focus({preventScroll:true});
});
fillChords();select('chord').value=settings.chord;
settings.progression=true;select('template').value='single';

update();

function reflectTheme() {
  select('palette').value = document.documentElement.dataset.palette || 'midnight';
  const colour=getComputedStyle(document.documentElement).getPropertyValue('--page').trim();
  if(colour)document.querySelector('meta[name="theme-color"]')?.setAttribute('content',colour);
}
function applyTheme(palette: string) {
  if(!['midnight','plum','evergreen','soft-stone'].includes(palette))palette='midnight';
  document.documentElement.dataset.palette = palette;
  document.documentElement.dataset.theme = palette === 'soft-stone' ? 'light' : 'dark';
  try { localStorage.setItem('mehtronome-theme', palette); } catch { /* Session-only if storage is unavailable. */ }
  // Clear the link parameter so the saved choice controls future visits.
  const url = new URL(location.href);
  url.searchParams.delete('theme');
  history.replaceState(null, '', url);
  reflectTheme();
}
select('palette').addEventListener('input', () => applyTheme(select('palette').value));
reflectTheme();

type PracticePreset = {id:string; name:string; progression:boolean; controls:Record<string,string | boolean>; customProgression?:any};
let presets: PracticePreset[] = [];
try { presets = readPresets(localStorage.getItem(PRESET_KEY)); }
catch { el('preset-status').textContent = 'Saved setups are unavailable. Browser storage may be disabled or the saved data could not be read.'; }
function renderPresets(selected = '') {
  select('preset-list').replaceChildren(new Option('Choose a saved setup',''),...presets.map(p => new Option(p.name,p.id)));
  select('preset-list').value = selected;
  reflectPresetButtons();
}
function reflectPresetButtons() {
  const selected = presets.some(p => p.id === select('preset-list').value);
  el<HTMLButtonElement>('preset-export').disabled = !presets.length || busy || stopping;
  for (const id of ['preset-load','preset-update','preset-delete']) el<HTMLButtonElement>(id).disabled = !selected || busy || stopping;
  syncMiniTransport();
}
function snapshotPreset(id: string = crypto.randomUUID()) {
  const name = input('preset-name').value.trim().slice(0,60);
  if (!name) throw new Error('Give your setup a name first.');
  const controls = Object.fromEntries(PRESET_CONTROLS.flatMap(key => {
    const control = el<HTMLInputElement | HTMLSelectElement>(key);
    return control instanceof HTMLInputElement || control instanceof HTMLSelectElement
      ? [[key,control instanceof HTMLInputElement && control.type === 'checkbox' ? control.checked : control.value]]
      : [];
  }));
  return {id,name,controls,progression:settings.progression,...(settings.template==='custom'?{customProgression:normalizeCustomProgression(customProgression)}:{})};
}
function persistPresets(next: typeof presets, selected: string, message: string) {
  try {
    writePresets(localStorage,next);
    presets = next;
    renderPresets(selected);
    el('preset-status').textContent = message;
  } catch (error) {
    el('preset-status').textContent = error instanceof Error && error.message.includes('50 presets') ? error.message : 'Could not save changes. Browser storage may be full or disabled.';
  }
}
select('preset-list').addEventListener('change',()=>{
  const preset = presets.find(p => p.id === select('preset-list').value);
  if (preset) input('preset-name').value = preset.name;
  reflectPresetButtons();
});
for (const action of ['save','update']) el(`preset-${action}`).addEventListener('click',()=>{
  try {
    const id = action === 'update' ? select('preset-list').value : crypto.randomUUID();
    const preset = snapshotPreset(id);
    const next = action === 'update' ? presets.map(p => p.id === id ? preset : p) : [...presets,preset];
    persistPresets(next,id,`Saved “${preset.name}” on this browser.`);
  } catch (error) { el('preset-status').textContent = (error as Error).message; input('preset-name').focus(); }
});
el('preset-delete').addEventListener('click',()=>{
  const id = select('preset-list').value;
  persistPresets(presets.filter(p => p.id !== id),'','Saved setup deleted.');
});
function restoreControl(id: string, value: unknown) {
  const control = el<HTMLInputElement | HTMLSelectElement>(id);
  if(!control)return;
  if (control instanceof HTMLSelectElement) {
    if (typeof value === 'string' && Array.from(control.options).some(option => option.value === value && !option.disabled)) control.value = value;
  } else if(id==='pattern-start-route'){
    if(typeof value==='string'&&(value===''||/^v1:[a-z0-9]+:[0-8]{1,128}$/.test(value)))control.value=value;
  } else if(id==='manual-position-route'){
    if(typeof value==='string'&&(value===''||/^v1:[a-z0-9]+:[0-4]{1,128}$/.test(value)))control.value=value;
  } else if(id==='pulse-accents'){
    if(typeof value==='string'&&/^[012]{0,12}$/.test(value))control.value=value;
  } else if (control.type === 'checkbox') {
    if (typeof value === 'boolean') control.checked = value;
  } else if (typeof value === 'string' && Number.isFinite(Number(value))) {
    const number = Number(value);
    control.value = String(Math.max(Number(control.min),Math.min(Number(control.max),number)));
  }
}
async function loadPracticePreset(preset:PracticePreset|undefined){
  if (!preset || busy || stopping) return;
  chartEditSteps=[];
  busy = true;
  reflectPresetButtons();
  try {
    stopPreview();
    soloChannels.clear();
    if (playing) await stop();
    // Presets saved before these features existed keep their original behavior.
    for (const [id,value] of Object.entries({...Object.fromEntries(MIX_CHANNELS.map(channel=>['mute-'+channel.id,false])),'sequence-activity':'supporting','extension-morph':false,'extension-bars':'8','pulse-accents':'','pulse-sound':'beep','pulse-swing':'0','pulse-minutes':'0','pulse-finish-bar':true,'pulse-poly':'0/2','gap-progressive':false,'gap-max':'8','trainer-enabled':false,'trainer-bars':'4','trainer-increment':'2','trainer-target':'120','featured-position':'path','manual-position-route':'','pattern-start-route':'','loop-unit':'chords','loop-beat-start':'1','loop-beat-end':'1'})) {
      if (!(id in preset.controls)) restoreControl(id,value);
    }
    restoreControl('quality',preset.controls.quality);
    restoreControl('key',preset.controls.key);
    if(preset.customProgression){customUndo.length=0;customRedo.length=0;customProgression=normalizeCustomProgression(preset.customProgression);chartEditSteps=[];saveCustomProgression(`Loaded custom progression from “${preset.name}”.`);}
    settings.progression = preset.progression;
    fillChords(); // Refresh mode-dependent template availability before restoring it.
    restoreControl('template',preset.controls.template);
    const restoredTemplate = progressionDefinition({...settings,template:select('template').value,customProgression});
    if (settings.progression && restoredTemplate.kind === 'modal' && 'mode' in restoredTemplate) select('quality').value = String(restoredTemplate.mode);
    for (const id of ['pedal','progression']) {
      const selected = (id === 'progression') === settings.progression;
      el(id).classList.toggle('selected',selected);
      el(id).setAttribute('aria-pressed',String(selected));
    }
    fillChords();
    for(const id of FX_PRESET_CONTROLS)if(preset.controls[id]===undefined)restoreControl(id,id==='fx-reverb-type'?'room':id==='fx-reverb-b-type'?'plate':id==='fx-delay-division'?'eighth':'0');
    for (const id of PRESET_CONTROLS) if (!id.startsWith('theory-') && !['quality','key','template','loop-enabled','loop-start','loop-end','loop-unit','loop-beat-start','loop-beat-end'].includes(id)) restoreControl(id,preset.controls[id]);
    localStorage.setItem('mehtronome-pattern-start-route',input('pattern-start-route').value);
    select('backing-style').value=backingStyleForControls(preset.controls);
    for(const [id,muted] of Object.entries(backingMutesForPreset(preset.controls)))input(id).checked=muted;
    tempo(Number(input('bpm').value));
    guitarDegrees = select('fret-labels').value === 'degrees';
    restoreTheoryViews(preset.controls);
    step = 0;
    update();
    materializeWorkingChart();
    for (const id of ['loop-enabled','loop-start','loop-end','loop-unit','loop-beat-start','loop-beat-end']) restoreControl(id,preset.controls[id]);
    update();
    input('preset-name').value = preset.name;
    el('preset-status').textContent = `Loaded “${preset.name}”. Ready to practice.`;
    document.dispatchEvent(new Event('chart-context-restored'));
  } finally { busy = false; reflectPresetButtons(); }
}
el('preset-load').addEventListener('click',()=>void loadPracticePreset(presets.find(p=>p.id===select('preset-list').value)));
renderPresets();

el('preset-export').addEventListener('click',()=>{
  try{
    const blob=new Blob([exportPresets(presets)],{type:'application/json'}),url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='mehtronome-presets.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);el('preset-status').textContent=`Exported ${presets.length} setups.`;
  }catch(error){el('preset-status').textContent=(error as Error).message;}
});
el('preset-import').addEventListener('click',()=>input('preset-file').click());
input('preset-file').addEventListener('change',async()=>{
  const file=input('preset-file').files?.[0];if(!file)return;
  try{
    if(file.size>MAX_PRESET_FILE_BYTES)throw new Error('Setup files must be smaller than 512 KB.');
    const result=importPresets(await file.text(),presets);
    persistPresets(result.items,result.items.at(-1)?.id||'',`Imported ${result.imported} setup${result.imported===1?'':'s'}. Existing setups kept.`);
  }catch(error){el('preset-status').textContent=(error as Error).message;}
  finally{input('preset-file').value='';}
});

installConsole();

function activeFxChannels(value:any){return [...new Set(['comping','sequence',...Object.keys(value.sends).filter(id=>value.sends[id].reverb>0||value.sends[id].reverbB>0||value.sends[id].delay>0)])];}
fxUi=installFxControls(value=>{node?.port.postMessage({type:'fx-sends',channels:activeFxChannels(value)});fxBuses?.set(value);fxBuses?.setTempo(exercisePlaying?exerciseView.tempo:settings.bpm);});

input('master-volume').value=String(masterVolume);
el('master-volume-value').textContent=masterVolume+'%';
input('master-volume').addEventListener('input',()=>{
 masterVolume=masterVolumePercent(input('master-volume').value);
 el('master-volume-value').textContent=masterVolume+'%';
 masterOutput?.setVolume(masterVolume);
 try{localStorage.setItem(MASTER_VOLUME_KEY,String(masterVolume));}catch{}
});

applyStudioIcons();

const learningTargets:Record<string,string>={study:'study-path-title',practice:'pulse-title',harmony:'harmony-title',guitar:'guitar-title',exercises:'caged-exercise',progress:'progress-title',settings:'sound-settings-title'};
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return;
 const focus=event.target.closest('[data-learning-focus]');if(focus){setFocusView(true);document.querySelector('.featured-position')?.scrollIntoView({block:'start'});return;}
 const view=event.target.closest<HTMLElement>('[data-grip-display]');if(view){gripOnly=view.dataset.gripDisplay==='grip';renderGuitar();return;}
 const nav=event.target.closest<HTMLElement>('[data-learning-nav]');if(nav){if(focusView)setFocusView(false);showWorkspace(nav.dataset.learningNav!,learningTargets[nav.dataset.learningNav!]);return;}
 const sectionButton=event.target.closest<HTMLElement>('[data-section-start],[data-section-full]');if(sectionButton){if(exercisePlaying||exercisePreparing||stopping)return;stopPreview();if(sectionButton.hasAttribute('data-section-full')){input('loop-enabled').checked=false;step=0;update();}else{step=customProgression.steps.findIndex((_:any,i:number)=>progressionBeatDurations(settings).slice(0,i).reduce((a:number,b:number)=>a+b,0)===Number(sectionButton.dataset.sectionStart));void applyChartLoop(Number(sectionButton.dataset.sectionStart),Number(sectionButton.dataset.sectionEnd));}return;}
 const grip=event.target.closest<HTMLElement>('[data-practise-grip]');if(grip){stopPreview();overviewPosition=grip.dataset.practiseGrip!;if(settings.progression)chooseOverviewPosition(overviewPosition);exerciseView.fingering='caged';exerciseView.study='positional';exerciseView.stage='full';exerciseView.fretboard=true;exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;renderGuitar();showWorkspace('exercises','caged-exercise');}
});
select('practice-goal').addEventListener('input',()=>{const goal=GOALS.find(g=>g.id===select('practice-goal').value)!;el('goal-description').textContent=goal.tip+'';});
el('dismiss-guided-session').addEventListener('click',()=>{el('guided-session').hidden=true;activeGoal='';});
el('start-guided-goal').addEventListener('click',()=>void startGuidedGoal());
async function startGuidedGoal(){
 if(playing)await stop();stopPreview();
 const goal=GOALS.find(g=>g.id===select('practice-goal').value)!;activeGoal=goal.id;
 settings.progression=Boolean(goal.template);gripOnly=goal.id==='shape';step=0;overviewPosition='I';input('manual-position-route').value='';select('featured-position').value='path';select('quality').value=goal.mode;select('template').value=goal.template||'parallel1';settings.template=select('template').value;fillChords();select('chord').value=goal.chord;
 for(const id of ['pedal','progression']){const chosen=id===(settings.progression?'progression':'pedal');el(id).classList.toggle('selected',chosen);el(id).setAttribute('aria-pressed',String(chosen));}
 for(const id of ['trainer-enabled','gap-enabled','loop-enabled','extension-morph'])input(id).checked=false;
 for(const id of BACKING_CHANNELS)input(id).checked=true;
 for(const channel of MIX_CHANNELS)input('mute-'+channel.id).checked=BACKING_CHANNELS.includes(channel.id);soloChannels.clear();
 input('show-grip').checked=true;input('highlight-mode').checked=true;input('count-in').checked=true;select('beats').value='4';select('subdivision').value='1';input('bpm').value='80';input('click').value='40';input('harmony').value='35';input('send-reverb-harmony').value='20';input('send-reverb-sequence').value='20';
 const accompaniment=select('practice-accompaniment').value;
 if(accompaniment==='trio'){for(const id of ['drums','bass','comping'])input('mute-'+id).checked=false;select('backing-style').value='traditionalJazz';}
 if(accompaniment==='modal'){input('extension-morph').checked=true;input('send-reverb-harmony').value='60';input('send-reverb-sequence').value='60';}
 if(accompaniment==='sparse'||goal.id==='time'){input('gap-enabled').checked=true;input('gap-play').value='2';input('gap-mute').value='1';select('gap-target').value='click';input('harmony').value='20';}
 theoryView.kind='none';theoryView.choiceId='';select('theory-view').value='none';
 Object.assign(exerciseView,{study:goal.study,stage:'full',fretboard:true,tempo:80,tempoLinked:true,loop:false,autoTempo:false,motion:'ascending',setupOpen:false,backing:true});exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;
 fillLoopOptions(true);tempo(80);update();
 if(goal.id==='pentatonic'){const choices=theoryOptions(chordInfo(0)).pentatonics;exerciseView.source=choices[0]?.id||'';renderGuitar();}
 el('guided-session-title').textContent=goal.name;el('guided-session').hidden=false;input('preset-name').value=goal.name;
 materializeWorkingChart();
 document.dispatchEvent(new Event('chart-context-restored'));
 showWorkspace(goal.workspace,learningTargets[goal.workspace]);
}

const guitarProgressionReference=document.querySelector<HTMLElement>('.guitar .progression-reference')!;
const guitarProgressionPanel=document.createElement('section');guitarProgressionPanel.className='guitar-progression-panel';guitarProgressionPanel.setAttribute('aria-label','Chord progression and positions');
guitarProgressionReference.before(guitarProgressionPanel);guitarProgressionPanel.append(guitarProgressionReference,el('position-path-guide'));
// Move the existing setup and context map below the principal practice material.
const guitarSetup=document.createElement('details');guitarSetup.className='guitar-setup';guitarSetup.innerHTML='<summary>Diagram display settings</summary>';
const guitarOverview=document.querySelector('.guitar-overview')!;
const guitarRouteControls=document.createElement('div');guitarRouteControls.className='position-path-controls';const guitarRouteHeading=el('position-path-guide').querySelector('.position-path-heading')!;guitarRouteHeading.prepend(guitarRouteControls);guitarRouteControls.append(select('featured-position').closest('label')!,select('position-region').closest('label')!);
guitarRouteControls.append(select('guitar-chord-position').closest('label')!);select('guitar-chord-position').addEventListener('input',()=>{chooseOverviewPosition(select('guitar-chord-position').value);select('guitar-chord-position').focus({preventScroll:true});});
const guitarShapeControls=document.createElement('div');guitarShapeControls.className='guitar-shape-controls';guitarShapeControls.setAttribute('aria-label','Chord shapes and position exploration');
for(const selector of ['.grip-toggle','.shared-theory-controls','#theory-description']){const element=guitarOverview.querySelector(selector);if(element)guitarShapeControls.append(element);}
guitarOverview.append(guitarShapeControls);
for(const selector of ['.guitar-controls','.guitar-legend']){const element=guitarOverview.querySelector(selector);if(element)guitarSetup.append(element);}
guitarOverview.append(guitarSetup);
const guitarPanel=document.querySelector('.guitar')!;const contextMap=el('full-fretboard-panel');for(const element of [el('position-overview'),el('guitar-diagrams'),document.querySelector('.position-navigation')!])guitarPanel.insertBefore(element,contextMap);

neckTraversalPanel=document.createElement('div');neckTraversalPanel.id='guitar-neck-traversal-controls';guitarPanel.insertBefore(neckTraversalPanel,el('position-overview'));
function reflectNeckTraversal(info:any){
 if(!neckTraversalPanel)return;
 neckTraversalPanel.innerHTML=traversalControls(exerciseView,'guitar',exercisePlaying||exercisePreparing);
 const active=acrossNeck(exerciseView);guitarPanel.classList.toggle('across-neck',active);
 for(const selector of ['#position-overview','#guitar-diagrams','.position-navigation','.per-string-controls']){const node=guitarPanel.querySelector<HTMLElement>(selector);if(node)node.hidden=active;}
 if(active)el('per-string-diagram').hidden=true;
 const routeChoices=guitarPanel.querySelector<HTMLElement>('.position-path-controls');if(routeChoices)routeChoices.hidden=active;
 if(!active)return;
 renderNeckTraversalMap(info);
}
function renderNeckTraversalMap(info:any){
 const board=neckRouteBoard(info,exerciseView),shapes=neckExerciseCells(info,exerciseView),cellHarmony=neckCellHarmony(info,exerciseView);
 const playingElement=document.querySelector('.exercise-note.playing'),playingCell=exercisePlaying&&playingElement?currentExercise[Number(playingElement.getAttribute('data-note-index'))]?.neckCell:null;
 if(neckMapShape!=='all')neckMapShape=shapes.some((s:any)=>s.degree===exerciseView.traversalCell)?exerciseView.traversalCell:neckRouteChoice(shapes,exerciseView)?.degree||'all';
 const activeRoute=playingCell?.routeId||playingCell?.id||neckMapShape;
 const shape:any=shapes.find((s:any)=>s.degree===activeRoute),menu=select('per-string-neck-shape');
 menu.innerHTML='<option value="all">All notes</option>'+shapes.map((s:any)=>`<option value="${s.degree}">${escapeHtml(s.label)}</option>`).join('')+cellHarmony.scalePcs.map((_:number,i:number)=>shapes.some((s:any)=>s.scaleDegree===i)?'':`<option disabled>Degree ${(cellHarmony.cellDegrees||MODES[info.mode as keyof typeof MODES].degrees)[i]} · ${escapeHtml(cellHarmony.scaleNames[i])} · no complete cell in this fret range</option>`).join('');
 menu.value=activeRoute;menu.disabled=exercisePlaying||exercisePreparing;
 perStringMapMenu.hidden=false;perStringMapMenu.querySelector('span')!.textContent=shape?.blocks?'Highlight route':'Highlight cell';perStringMapMenu.style.setProperty('--shape-color',shapeColor(shape?.index||0));input('show-regions').closest('label')!.hidden=false;
 const target=el('full-fretboard'),scroll=target.scrollLeft;
 target.innerHTML=routeMapSvg(board,guitarDegrees,MODES[info.mode as keyof typeof MODES].degrees,traversalLabel(exerciseView),shape?.board.notes||[],shape?.blocks||[]);
 emphasizeFullNeck(target,playingCell?{...shape?.board,notes:playingCell.notes}:shape?.board,shape?.index||0);
 if(input('show-regions').checked)perStringMapRegions(target,shapes,activeRoute,board);
 target.scrollLeft=scroll;
 fullFretboardPanel.querySelector('.full-fretboard-toolbar>div>span')!.textContent=traversalLabel(exerciseView)+(shape?' · '+shape.label:'');
}

document.addEventListener('change',event=>{
 const target=event.target;if(!(target instanceof HTMLInputElement||target instanceof HTMLSelectElement)||!target.dataset.neckField)return;
 if(exercisePlaying||exercisePreparing)return;
 stopExercisePreview();const field=target.dataset.neckField;
 (exerciseView as any)[field]=target.type==='number'?Number(target.value):target.value;
 normalizeTraversal(exerciseView);exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;
 renderGuitar();document.getElementById(target.id)?.focus({preventScroll:true});
});
async function loadWorkingChart(chart:any){if(busy||stopping)throw new Error('Wait for playback to finish stopping.');stopPreview();stopExercisePreview();settings.liveChartRevision=(settings.liveChartRevision||0)+1;if(chart.persist!==false)rememberCustomEdit();customProgression=normalizeCustomProgression(chart.progression);const referenceId=customProgression.referencePerformance,reference=REFERENCE_PERFORMANCES[referenceId as keyof typeof REFERENCE_PERFORMANCES];if(reference){select('sequence-activity').value='supporting';backingStyleUi?.setStyle(reference.style);}chartEditSteps=[];customStepIndex=0;step=0;settings.progression=true;if(chart.key!==undefined){settings.key=chart.key;select('key').value=String(chart.key);}settings.beats=chart.beats??4;select('beats').value=String(settings.beats);select('template').value='custom';input('loop-enabled').checked=false;if(chart.persist!==false)input('extension-morph').checked=false;if(chart.persist===false){settings.customProgression=customProgression;(PROGRESSIONS as any).custom=customProgression;}else saveCustomProgression('');select('quality').value=customProgression.steps[0].mode;fillChords();select('chord').value=customProgression.steps[0].chord;fillLoopOptions(true);update();if(reference)tempo(chart.bpm??reference.bpm);el('guided-session').hidden=true;if(chart.practise){Object.assign(exerciseView,{study:'harmonized',stage:'full',backing:true,fretboard:true});exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;renderGuitar();showWorkspace('exercises','caged-exercise');}}

installRepertoire({
 templates:[
  {name:'Single chord',options:[{id:'single',name:'Single-chord chart · 4 bars'}]},
  ...[['Jazz','jazz'],['Common progressions','common'],['Modal','modal'],['Parallel movements','parallel']].map(([name,kind])=>({name,options:Object.entries(PROGRESSIONS).filter(([,p])=>('group' in p?p.group:p.kind)===kind).map(([id,p])=>({id,name:p.name}))})),
  {name:'Diatonic',options:[{id:'diatonic',name:'Diatonic seventh chords'}]}
 ],
 draft:()=>({key:settings.key,beats:settings.beats,progression:normalizeCustomProgression(customProgression)}),
 makeTemplate:(id:string)=>{const current=chordInfo(step),mode=id==='diatonic'?(current.mode==='minor'?'minor':'major'):current.mode;const source={...settings,template:id,mode,chord:current.chordId};const definition=progressionDefinition(source);return {key:settings.key,beats:settings.beats,progression:{...cloneTemplate(definition,current.chordId,mode,source),name:definition.name}};},
 reflect:syncMiniTransport,
 capture:()=>{if(!settings.progression)throw new Error('Choose a chord progression before saving a chart.');return {key:settings.key,beats:settings.beats,progression:settings.template==='custom'?normalizeCustomProgression(customProgression):cloneTemplate(progressionDefinition(settings),settings.chord,settings.mode,settings)};},
 load:loadWorkingChart
});

organizeWorkspaces(showWorkspace);
async function advanceRandomStudy(kind:'exercise'|'transport'){
 if(studyAdvancing)return;
 if(!studyPathUi?.repeatEnabled()){if(kind==='transport')await stop();return;}
 const bpm=kind==='exercise'?exerciseView.tempo:currentBpm,exerciseOptions=structuredClone(exerciseView),workspace=document.body.dataset.workspace;
 const token=++studyAdvanceToken;studyAdvancing=true;
 try{
  if(kind==='exercise')stopExercisePreview();else await stop();
  if(token!==studyAdvanceToken)return;
  el('play-status').textContent='Preparing the next random study…';syncMiniTransport();
  const loaded=await studyPathUi.nextRepetition();if(token!==studyAdvanceToken)return;
  if(!loaded){el('play-status').textContent='Random study stopped. Check the Study settings.';showWorkspace('study','study-path-title');return;}
  tempo(bpm);
  if(kind==='exercise'){Object.assign(exerciseView,exerciseOptions,{tempo:bpm});renderGuitar();}
  if(workspace)showWorkspace(workspace);
  studyAdvancing=false;
  if(kind==='exercise')await toggleExercisePreview();else await toggle();
 }catch(error){el('error').textContent=error instanceof Error?error.message:'Could not prepare the next study.';el('error').hidden=false;}
 finally{studyAdvancing=false;syncMiniTransport();studyPathUi.sync();}
}
studyPathUi=installStudyPath({
 randomizerChanged:()=>{if(node)queueAudioSettings(exercisePlaying?exerciseAudioSettings():settings);},
 locked:()=>playing||exercisePlaying||exercisePreparing||busy||stopping,
 fingerprint:()=>JSON.stringify([settings.key,settings.beats,settings.progression,progressionDefinition(settings),select('featured-position').value,select('position-region').value,input('manual-position-route').value,exerciseView.study,exerciseView.fingering]),
 navigate:showWorkspace,
 sources:()=>{
  let saved:any[]=[];try{saved=normalizeRepertoire(JSON.parse(localStorage.getItem(REPERTOIRE_KEY)||'null'));}catch{}
  const current=settings.template==='custom'?normalizeCustomProgression(customProgression):cloneTemplate(progressionDefinition(settings),settings.chord,settings.mode,settings);
  return [{id:'current',name:current.name,key:settings.key,beats:settings.beats,progression:structuredClone(current),group:'Your charts'},...saved.map(chart=>({...chart,id:'saved:'+chart.id,group:'Your saved charts'}))];
 },
 load:async(plan:any)=>{
  if(playing||exercisePlaying||exercisePreparing||busy||stopping)throw new Error('Stop playback before loading a study.');
  stopPreview();stopExercisePreview();
  await loadWorkingChart(plan.chart);
  input('manual-position-route').value='';input('pattern-start-route').value='';
  try{localStorage.setItem('mehtronome-pattern-start-route','');}catch{}
  select('featured-position').value=plan.navigation;select('position-region').value=plan.selection.region;
  overviewPosition=plan.positions?.[0]||plan.selection.position;
  if(plan.positions)restoreChartPracticeChoices({positions:plan.positions,starts:null});
  theoryView.kind='none';theoryView.choiceId='';select('theory-view').value='none';gripOnly=plan.view==='guitar';if(gripOnly)input('show-grip').checked=true;
  select('fret-view').value=['positional','arpgroups3','arpgroups4','enclosures4','enclosures5'].includes(plan.study)?'arpeggio':'scale';
  select('exercise').value=select('fret-view').value;
  Object.assign(exerciseView,{study:plan.study,arpeggioSource:plan.study.startsWith('chordtones')?'chordRoots':plan.study==='arpgroups4'?'selectedChord':'diatonic',arpeggioPattern:'straight',arpeggioRoutine:'repeat',arpeggioApproach:'none',fingering:'caged',material:'seventh',stage:'full',startTone:'default',fretboard:true,backing:true,loop:true,autoTempo:false,tempoLinked:true});
  exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;step=0;
  input('loop-enabled').checked=false;fillLoopOptions(true);update();
  document.dispatchEvent(new Event('chart-context-restored'));
  showWorkspace(plan.view==='guitar'?'guitar':'exercises',plan.view==='guitar'?'guitar-title':'caged-exercise');
 }
});
installChartTools({view:chartView,render:renderCustomBeatGrid,getChart:()=>({progression:customProgression,sections:rehearsalSections(customProgression,settings.beats),locked:exercisePlaying||exercisePreparing||stopping}),clearSelection:()=>{chartEditSteps=[];renderCustomBuilder();renderCustomBeatGrid();},sectionAction:editChartSection});
installProgressionGenerator({
 getContext:()=>{const info=chordInfo(step);return {key:settings.key,beats:settings.beats,chord:info.chordId,mode:info.mode,positions:select('featured-position').value==='all'?chartPracticeChoices().positions:null};},
 isLocked:()=>playing||exercisePlaying||exercisePreparing||busy||stopping,
 load:async(chart:any)=>{
  if(playing||exercisePlaying||exercisePreparing||busy||stopping)throw new Error('Stop playback before using a generated chart.');
  materializeWorkingChart();const choices=chartPracticeChoices(),manual=select('featured-position').value==='all';
  const cycle=(values:any[]|null)=>values?.length?Array.from({length:chart.progression.steps.length},(_,index)=>values[index%values.length]):null;
  const positions=chart.positionStrategy==='keep'?(manual?cycle(choices.positions):null):chart.positions;
  await loadWorkingChart(chart);
  if(positions){select('featured-position').value='all';restoreChartPracticeChoices({positions,starts:cycle(choices.starts)});}
  else if(choices.starts)restoreChartPracticeChoices({positions:null,starts:cycle(choices.starts)});
  input('loop-enabled').checked=false;fillLoopOptions(true);update();document.dispatchEvent(new Event('chart-context-restored'));
 }
});
perStringView=installPerStringView(()=>({harmony:chordInfo(playing?livePlaybackStep:step),locked:exercisePlaying||exercisePreparing||busy||stopping}),({kind,inversion,fret,stringSet,spreadSource}:any)=>{if(exercisePlaying||exercisePreparing||busy||stopping)return;stopPreview();Object.assign(exerciseView,{study:kind==='three'?'positionalscale':'positional',material:kind==='spread'||(spreadSource!=='mode'&&chordInfo(playing?livePlaybackStep:step).chordPcs.length<=3)?'triad':'seventh',exactFingering:spreadSource!=='mode'&&kind!=='spread'&&kind!=='three'&&chordInfo(playing?livePlaybackStep:step).chordPcs.length>4,fingering:kind,inversion,fingeringFret:fret,fingeringStringSet:stringSet||0,spreadSource:spreadSource||'chord',motion:'ascending',fretboard:true});exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseCellSelection=null;renderGuitar();showWorkspace('exercises','caged-exercise');},renderPerStringMap,(choice:any)=>linkExerciseFingering(exerciseView,choice,chordInfo(playing?livePlaybackStep:step)));
backingStyleUi=installBackingStyles(update);
update();
applyStudioIcons();
renderCustomBuilder();
renderGuitar();

el('pulse-timer-mode').addEventListener('input',()=>{input('pulse-minutes').value=select('pulse-timer-mode').value==='unlimited'?'0':String(Number(input('pulse-minutes').value)||10);update();});
syncPulseToolsUI();syncMiniTransport();

async function applyChartSelection(start:number,end:number){
 stopPreview();stopExercisePreview();if(settings.template!=='custom')materializeWorkingChart();
 chartEditSteps=chordStepsInRange(progressionBeatDurations(settings),start,end);customStepIndex=chartEditSteps[0]??customStepIndex;step=customStepIndex;update();
}
function editChartSection(action:string,index:number){
 if(exercisePlaying||exercisePreparing||stopping)return;
 const sections=rehearsalSections(customProgression,settings.beats),section=sections[index];if(!section)return;
 if(action==='loop'){void applyChartLoop(section.start,section.end-1);return;}
 const groups=sections.map((s:any,i:number)=>Array.from({length:(sections[i+1]?.step??customProgression.steps.length)-s.step},(_,j)=>s.step+j));
 let ids=groups.flat();
 if(action==='duplicate'){if(ids.length+groups[index].length>MAX_CHART_STEPS)return;groups.splice(index+1,0,[...groups[index]]);ids=groups.flat();}
 else{const next=index+(action==='previous'?-1:1);if(next<0||next>=groups.length)return;[groups[index],groups[next]]=[groups[next],groups[index]];ids=groups.flat();}
 const choices=chartPracticeChoices();rememberCustomEdit();const old=customProgression.steps;
 customProgression.steps=ids.map(i=>({...old[i]}));customStepIndex=action==='duplicate'?sections[index].step+groups[index].length:ids.indexOf(section.step);chartEditSteps=[];step=customStepIndex;
 saveCustomProgression(action==='duplicate'?'Section duplicated.':'Section moved.');restoreChartPracticeChoices({positions:choices.positions?ids.map(i=>choices.positions![i]):null,starts:choices.starts?ids.map(i=>choices.starts![i]):null});input('loop-enabled').checked=false;fillLoopOptions(true);update();
}
document.addEventListener('keydown',event=>{
 if(event.defaultPrevented||document.body.dataset.workspace!=='harmony'||!(event.target instanceof Element)||event.target.closest('input,select,textarea,[contenteditable]'))return;
 const modifier=event.ctrlKey||event.metaKey;
 if(modifier&&['z','y','d'].includes(event.key.toLowerCase())){event.preventDefault();if(event.key.toLowerCase()==='d')el<HTMLButtonElement>('custom-duplicate').click();else void restoreCustomEdit(event.key.toLowerCase()==='z'&&!event.shiftKey);return;}
 if(!event.target.closest('#custom-beat-grid [data-grid-step]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||chartView.tool!=='select')return;
 event.preventDefault();const count=customProgression.steps.length,index=event.key==='Home'?0:event.key==='End'?count-1:Math.max(0,Math.min(count-1,customStepIndex+(event.key==='ArrowRight'?1:-1)));
 el('custom-beat-grid').querySelector<HTMLButtonElement>(`[data-grid-step="${index}"]`)?.click();
});

setTimeout(()=>{void loadDrumKit.prefetch(sampleNamesForSettings(settings)).catch(()=>{});},300);
