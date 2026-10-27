import {manualPositionPath} from './guitar/position-path.js';
import {positionRouteCards} from './practice/position-route.js';
import {setFretRecallPlaying,selectRecallChord} from './practice/fret-recall-view.js';
import {applicationStudy} from './practice/applications.js';
import {progressionExerciseGroups} from './practice/progression-exercises.js';
import {reserveChordBands,updateBackingSymbols} from './practice/notation-backing.js';
import {chordSheet} from './practice/chord-sheet.js';
import {progressionStudyPlan,planPosition} from './practice/progression-timing.js';
import {progressionNotationSvg} from './practice/progression-notation.js';
import {installJournal} from './practice/journal-view.js';
import {GOALS,gripStudy,positionalArpeggio,gripFacts,shortCell,overlayPurpose,guideToneExamples} from './practice/learning.js';
import {learningView,highlightLearningNote,updateProgressionMap} from './practice/learning-view.js';
import {musicalContext,spellingHelp} from './practice/context.js';
import './beta.css';
import {harmonizedSevenths} from './practice/harmonized-sevenths.js';
import {MIX_CHANNELS} from './practice/mixer.js';
import {extensionChoices} from './audio/extensions.js';
import {tapBpm, beatStrength, formatTime} from './practice/pulse.js';
import { roomImpulse } from './audio/ambience.js';
import { theoryOptions } from './guitar/superimposition.js';
import { recommendedGrip } from './guitar/grips.js';
import { PRESET_KEY, PRESET_CONTROLS, readPresets, writePresets, exportPresets, importPresets, MAX_PRESET_FILE_BYTES } from './practice/presets.js';
import { SEQUENCE_PATTERNS, SEQUENCE_SOURCES, SEQUENCE_ROLES, SEQUENCE_DEVELOPMENTS, SEQUENCE_INTERACTIONS } from './audio/sequence.js';
import { loadDrumKit } from './audio/load-kit.js';
import './style.css';
import './themes.css';
import './practice.css';
import './interface.css';
import './console.css';
import './studio.css';
import './icons.css';
import {applyStudioIcons} from './practice/icons.js';
import {consoleChannel, syncConsole, installConsole, receiveConsoleMeters} from './practice/console.js';
import { POSITIONS, cagedPositionFor, fretboardFor, diagramSvg, fullFretboardFor, fullFretboardSvg, parentMajorFor } from './guitar/fretboard.js';
import { cagedStudy, alignedProgressionGroups, exerciseNotationSvg, flattenExercise, PENTATONIC_PATTERNS } from './guitar/exercises.js';
import { FRET_REGIONS, progressionPositionPath } from './guitar/position-path.js';
import { DRUM_GROOVES, BASS_PATTERNS } from './audio/rhythm.js';
import { COMPING_PATTERNS, COMPING_MOVEMENTS, COMPING_TONES } from './audio/comping.js';
import workletUrl from './audio/worklet.js?worker&url';
import { DEFAULTS } from './audio/engine.js';
import { renderJazzGuitarNote } from './audio/jazz-guitar.js';
import { CUSTOM_PROGRESSION_KEY, customPitchName, cloneTemplate, normalizeCustomProgression, progressionText, recommendedMode, romanForStep } from './practice/custom-progression.js';
import { PRACTICE_TASKS, curriculumKey, completedCount, practicePlan, modeProgress } from './practice/curriculum.js';
import { scaleChoicesForChord } from './practice/scale-explorer.js';
import { barAlignedDuration } from './practice/exercise-timing.js';
import { MODES, CHORDS, SOUNDS, compatibleChords, PROGRESSIONS, progressionDefinition, progressionDurations, progressionBeatDurations, progressionPlaybackBeatDurations, progressionTimeline, progressionPositionAtBeat, progressionStepAtBeat, progressionOrder, progressionStep, characteristicNotes, harmonyAt } from './audio/music.js';

const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
let customProgression:any;
try{customProgression=normalizeCustomProgression(JSON.parse(localStorage.getItem(CUSTOM_PROGRESSION_KEY)||'null'));}
catch{customProgression=normalizeCustomProgression(null);}
(PROGRESSIONS as any).custom=customProgression;
function modeOptions() {
  return ['Major scale', 'Melodic minor', 'Harmonic minor'].map(family =>
    `<optgroup label="${family}">${Object.entries(MODES).filter(([, mode]) => ('family' in mode ? mode.family : 'Major scale') === family).map(([id, mode]) => `<option value="${id}" ${id === 'dorian' ? 'selected' : ''}>${mode.name}</option>`).join('')}</optgroup>`
  ).join('');
}
function sequencePatternOptions() {
  const categories=[...new Set(Object.values(SEQUENCE_PATTERNS).map(pattern=>pattern.category))];
  return categories.map(category=>`<optgroup label="${category}">${Object.entries(SEQUENCE_PATTERNS).filter(([,pattern])=>pattern.category===category).map(([id,pattern])=>`<option value="${id}">${pattern.name}</option>`).join('')}</optgroup>`).join('');
}
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Mehtronome home"><span class="brand-mark">m<span>·</span></span>Mehtronome</a><span class="header-note">A little rhythm. A little harmony.</span><div class="theme-controls"><button id="focus-view" class="practice-button" aria-pressed="false">Focus view</button><label class="theme-picker">Theme<select id="palette" aria-label="Page theme"><option value="midnight">Refined Midnight</option><option value="plum">Plum Ink</option><option value="evergreen">Evergreen</option><option value="soft-stone">Soft Stone</option></select></label></div></header>
<nav class="workspace-nav" aria-label="Workspace navigation">
  <div class="workspace-nav-inner">
    <span class="workspace-nav-label">Workspace</span>
    <button type="button" class="workspace-tab selected" data-workspace-target="pulse-title" aria-current="page"><span>01</span>Metronome &amp; Mixer</button>
    <button type="button" class="workspace-tab" data-workspace-target="harmony-title"><span>02</span>Harmony</button>
    <button type="button" class="workspace-tab" data-workspace-target="guitar-title"><span>03</span>Guitar</button>
    <button type="button" class="workspace-tab" data-workspace-target="caged-exercise"><span>04</span>Exercises</button>
    <button type="button" class="workspace-tab" data-workspace-target="progress-title"><span>05</span>Progress</button>
    <button type="button" class="workspace-tab" data-workspace-target="sound-settings-title"><span>06</span>Sound Settings</button>
  </div>
</nav>
<main><section id="guided-goals" class="panel guided-goals workspace-page workspace-practice"><div class="section-heading"><h2>Start with a musical goal</h2><button type="button" class="practice-button" data-learning-nav="progress">Learning path →</button></div><div class="goal-controls"><label>Today’s goal<select id="practice-goal">${GOALS.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select></label><label>Accompaniment<select id="practice-accompaniment"><option value="clear">Clear harmony study</option><option value="trio">Jazz trio</option><option value="modal">Modal exploration</option><option value="sparse">Sparse click / time</option></select></label><button type="button" class="practice-button" id="start-guided-goal">Set up this session</button></div><p id="goal-description" class="practice-help">${GOALS[0].tip} Keeps your selected tonic. Configures tools without starting audio.</p></section><section id="guided-session" class="guided-session" hidden><strong id="guided-session-title"></strong><p id="guided-session-tip"></p><div><button class="practice-button" data-learning-nav="harmony">1 · Hear the harmony</button><button class="practice-button" data-learning-nav="guitar">2 · Learn the shape</button><button class="practice-button" data-learning-nav="exercises">3 · Practise an idea</button><button class="practice-button" data-learning-nav="progress">Learning path / save setup</button><button id="dismiss-guided-session" class="practice-button">Dismiss guide</button></div></section><div class="studio-intro workspace-page workspace-practice"><div><p class="eyebrow">YOUR PRACTICE SPACE</p><h1>Metronome &amp; mixer</h1></div><p>Set your pulse. Shape your sound.</p></div>
  <div class="intro workspace-page workspace-progress"><div><p class="eyebrow">SAVED PRACTICE &amp; PROGRESS</p><h1 id="progress-title">Your practice.<br><em>Your progress.</em></h1></div><p class="intro-copy">Save your setups and pick up where you left off.<br>Follow your learning path, one session at a time.</p></div>
  <section class="presets panel workspace-page workspace-progress" aria-labelledby="presets-title">
    <div class="section-heading"><h2 id="presets-title">Practice presets</h2><span class="small-label">PICK UP WHERE YOU LEFT OFF</span></div>
    <div class="preset-fields"><label>Preset name<input id="preset-name" type="text" maxlength="60" placeholder="e.g. D Dorian · slow groove"></label><button id="preset-save" class="practice-button">Save new</button><label>Saved setups<select id="preset-list"><option value="">Choose a preset</option></select></label><div class="preset-actions"><button id="preset-load" class="practice-button" disabled>Load</button><button id="preset-update" class="practice-button" disabled>Update</button><button id="preset-delete" class="practice-button" disabled>Delete</button></div></div>
    <p id="preset-status" class="practice-help" role="status">Saved on this browser. Loading a preset stops playback.</p>
  <div class="preset-transfer"><button id="preset-export" class="practice-button">Export presets</button><button id="preset-import" class="practice-button">Import presets</button><input id="preset-file" type="file" accept=".json,application/json" hidden></div>
  </section>
  <div class="workspace">
    <section class="transport panel workspace-page workspace-practice" aria-labelledby="pulse-title">
      <div class="section-heading"><h2 id="pulse-title">Metronome</h2><span class="live-dot" id="live-dot"></span></div>
      <div class="tempo-controls"><button class="round" id="slower" aria-label="Decrease tempo">−</button><div><label class="sr-only" for="bpm">Tempo in beats per minute</label><input id="bpm" type="number" min="30" max="240" value="90"><span id="bpm-caption" class="bpm-label">BEATS PER MINUTE</span></div><button class="round" id="faster" aria-label="Increase tempo">+</button></div>
      <label class="sr-only" for="tempo">Tempo</label><input id="tempo" class="tempo-range" type="range" min="30" max="240" value="90"><div class="range-limits"><span>30 · LARGO</span><span>240 · PRESTISSIMO</span></div>
      <div class="beat-dots" id="beat-dots" role="group" aria-label="Editable beat accents"></div>
      <p class="play-status" id="play-status" role="status">Your next good practice starts here.</p>
      <button class="play-button" id="play" aria-pressed="false"><span id="play-icon">▶</span><span id="play-label">Start practicing</span><kbd>SPACE</kbd></button>
      <div class="pulse-options">
      <div class="transport-options"><label>Beats / bar <select id="beats" aria-label="Beats per bar"><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label><label class="check"><input type="checkbox" id="count-in">One-bar count-in</label></div>
      <div class="transport-options subdivision-options"><label>Subdivision <select id="subdivision"><option value="1" aria-label="Quarter notes" title="Quarter notes">♩</option><option value="2" aria-label="Eighth notes" title="Eighth notes">♪</option><option value="3" aria-label="Eighth-note triplets" title="Eighth-note triplets">♪³</option><option value="4" aria-label="Sixteenth notes" title="Sixteenth notes">♬</option><option value="5" aria-label="Quintuplets: five per beat" title="Quintuplets: five per beat">♬⁵</option><option value="6" aria-label="Sixteenth-note sextuplets" title="Sixteenth-note sextuplets">♬⁶</option><option value="7" aria-label="Septuplets: seven per beat" title="Septuplets: seven per beat">♬⁷</option></select></label><label class="check"><input id="accent" type="checkbox" checked>Accent beat one</label></div>
      </div>
      <div class="pulse-quick-tools"><button id="tap-tempo" type="button" class="practice-button">Tap tempo <kbd>T</kbd></button><span id="tap-status" class="practice-help" role="status">Tap at least twice to set the pulse.</span><button id="pulse-large-open" type="button" class="practice-button">Large beat display</button></div>

      <p class="practice-help pulse-accent-help">Click a beat above to cycle strong → soft → silent. <button id="pulse-accent-reset" type="button" class="pulse-text-button">Reset accents</button></p><input id="pulse-accents" type="hidden" value="">
    </section>
    <section class="harmony panel workspace-page workspace-harmony" aria-labelledby="harmony-title">
      <div class="section-heading"><h2 id="harmony-title">The harmony</h2><span class="small-label">YOUR MUSICAL CONTEXT</span></div>
      <div id="active-musical-context" class="active-musical-context"></div><div class="field-row"><label><span id="root-label">Root note</span><select id="key">${names.map((n, i) => `<option value="${i}" ${i === 9 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Mode<select id="quality">${modeOptions()}</select></label></div>
      <div class="field-row sound-row"><label><span id="chord-label">Pedal chord</span><select id="chord"></select></label></div>
      <details class="chord-scale-explorer"><summary>Choose a chord first · find scales and modes</summary><div class="field-row chord-scale-controls"><label>Chord root<select id="scale-explorer-root">${names.map((name,index)=>`<option value="${index}" ${index===9?'selected':''}>${name}</option>`).join('')}</select></label><label>Chord quality<select id="scale-explorer-chord">${Object.entries(CHORDS).map(([id,chord])=>`<option value="${id}" ${id==='dom7'?'selected':''}>${chord.name}</option>`).join('')}</select></label></div><div class="scale-explorer-key"><span><i class="strict"></i>Contains every written chord tone</span><span><i class="contextual"></i>Contextual reinterpretation</span></div><div id="scale-explorer-results" class="scale-explorer-results"></div></details>


      <div class="practice-block extension-morph"><label class="check"><input id="extension-morph" type="checkbox" checked>Evolving chord extensions</label><div id="extension-controls" hidden><label>Blend cycle<select id="extension-bars"><option value="4">4 bars</option><option value="8" selected>8 bars</option><option value="16">16 bars</option></select></label><p class="practice-help">Slowly add and release extensions from the current scale. The root and progression stay in place; this shapes the sustained harmony.</p></div><p id="extension-status" class="practice-help" hidden></p></div>
      <p id="mode-tip" class="mode-tip"></p>
      <div class="mode-label">BACKING</div><div class="segmented" role="group" aria-label="Harmony backing"><button id="pedal" class="selected" aria-pressed="true">Pedal chord</button><button id="progression" aria-pressed="false">Chord progression</button></div>
      <button id="mode-template" class="practice-button mode-template-button">Try a mode progression</button>
      <label id="template-field" class="template-field" hidden>Progression template<select id="template">${['Parallel movements','Jazz standards','Mode practice','Custom'].map(group=>`<optgroup label="${group}">${Object.entries(PROGRESSIONS).filter(([,template])=>group==='Custom'?template.kind==='custom':group==='Mode practice'?template.kind==='modal':group==='Jazz standards'?template.kind==='jazz':!['custom','modal','jazz'].includes(template.kind)).map(([id,template])=>`<option value="${id}">${template.name}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <section id="custom-progression-builder" class="custom-progression-builder" aria-labelledby="custom-progression-title" hidden>
        <div class="custom-builder-heading"><div><p class="eyebrow">PROGRESSION BUILDER</p><h3 id="custom-progression-title">My progression</h3></div><button id="customize-progression" type="button" class="practice-button custom-progression-open" hidden>Create from this progression</button><div class="custom-history-actions" role="group" aria-label="Progression editing"><button id="custom-undo" type="button" class="practice-button" disabled>Undo</button><button id="custom-redo" type="button" class="practice-button" disabled>Redo</button><button id="custom-add" type="button" class="practice-button">+ Add chord</button></div></div>
        <p id="chart-loop-status" class="practice-help" role="status">Drag across beats to loop them. Click a chord to edit; hold to hear it. Selection includes both endpoint beats.</p><div id="custom-beat-grid" class="custom-beat-grid" aria-label="Live progression chord sheet"></div><p id="custom-grid-help" class="practice-help"></p>      <div id="loop-controls" class="practice-block" hidden><label class="check"><input id="loop-enabled" type="checkbox">Loop selection</label><button id="chart-loop-clear" type="button" class="practice-button">Clear loop</button><details><summary>Choose loop with controls</summary><div id="loop-range" hidden><label>Selection unit<select id="loop-unit"><option value="chords">Whole chords</option><option value="beats">Beats</option></select></label><div id="loop-chord-fields" class="field-row"><label>Start chord<select id="loop-start"></select></label><label>End chord<select id="loop-end"></select></label></div><div id="loop-beat-fields" class="field-row" hidden><label>Start beat<input id="loop-beat-start" type="number" min="1" value="1" step="1"></label><label>End beat (included)<input id="loop-beat-end" type="number" min="1" value="1" step="1"></label></div><p id="loop-summary" class="practice-help"></p></div></details></div>
<div id="custom-timeline" class="custom-timeline" role="tablist" aria-label="Custom progression chords"></div>
        <div class="custom-editor">
          <label>Chord root<select id="custom-root">${names.map((name,index)=>`<option value="${index}">${name}</option>`).join('')}</select></label>
          <label>Chord type<select id="custom-chord">${Object.entries(CHORDS).map(([id,chord])=>`<option value="${id}">${chord.name}</option>`).join('')}</select></label>
          <label>Scale guide<select id="custom-mode">${modeOptions()}</select></label>
          <label>Duration unit<select id="custom-duration-unit"><option value="bars">Bars</option><option value="beats">Beats</option></select></label><label id="custom-bars-label">Duration<select id="custom-bars"><option value="1">1 bar</option><option value="2">2 bars</option><option value="4">4 bars</option><option value="8">8 bars</option></select></label>
          <label id="custom-beats-label" hidden>Duration<select id="custom-beats">${Array.from({length:32},(_,i)=>`<option value="${i+1}">${i+1} beat${i?'s':''}</option>`).join('')}</select></label><label>Bass note<select id="custom-bass"><option value="">Chord root</option>${names.map((name,index)=>`<option value="${index}">${name} pedal / slash bass</option>`).join('')}</select></label>
        </div>
        <div class="custom-actions"><button id="custom-left" type="button" class="practice-button" aria-label="Move chord left">← Move</button><button id="custom-right" type="button" class="practice-button" aria-label="Move chord right">Move →</button><button id="custom-duplicate" type="button" class="practice-button">Duplicate</button><button id="custom-delete" type="button" class="practice-button">Delete</button></div>
        <details class="custom-share"><summary>Share or copy progression</summary><textarea id="custom-text" rows="3" aria-label="Custom progression text" readonly></textarea><button id="custom-copy" type="button" class="practice-button">Copy progression</button></details>
        <p id="custom-status" class="practice-help" role="status">Changes save automatically in this browser and transpose with the tonic key.</p>
      </section>
      <div class="progression-strip" id="progression-strip" hidden></div>
    <section class="notes harmony-learning" aria-labelledby="notes-title">
      <div class="section-heading"><div><h2 id="notes-title">Under your fingers</h2><p id="seventh-chords-context" class="mode-map-context"></p></div><label class="exercise-label">Exercise <select id="exercise"><option value="scale">Scale</option><option value="arpeggio">Arpeggio</option></select></label></div>
      <div class="chord-stage"><span class="small-label" id="chord-caption">LET IT RING</span><p class="small-label current-chord-label">CURRENT CHORD</p><div id="chord-name">C<span>maj</span></div><p id="chord-notes">C · E · G</p></div>
      <label class="check characteristic-toggle"><input id="highlight-mode" type="checkbox" checked>Highlight modal colour notes</label><p id="characteristic-notes" class="practice-help"></p>
      <p class="mode-map-guide">Read down: scale note &amp; degree → seventh chord → its four chord tones.</p>
      <ol id="note-list" class="mode-harmony-map" aria-label="Scale degrees and their seventh chords"></ol>
      <p id="exercise-description">Play these notes on your instrument, at your own pace.</p>
    </section>

      <div id="preview-controls" hidden><p>While stopped, hold a chord to hear it. Release to stop; its diagrams stay selected.</p><span id="preview-status" role="status" hidden>Release to stop</span></div>
      <p class="backing-description" id="backing-description">One sustained chord. Explore how every note feels against it.</p>
      <details class="learn-more"><summary>Learn more about this harmony</summary><p id="harmony-explanation" class="practice-help"></p></details>
    </section>

    <section id="mix-panel" class="mix panel workspace-page workspace-practice" aria-labelledby="mix-title"><div class="section-heading"><div><p class="eyebrow">SOUND DESK</p><h2 id="mix-title">Mixer</h2></div><button id="mix-collapse" class="panel-action" type="button" aria-controls="mix-sections" aria-expanded="true">Hide mixer</button></div>
      <p id="mixer-docked-note" class="practice-help" hidden>Mixer is open above the focus bar. <button id="mixer-return" type="button" class="panel-action">Return mixer here</button></p><div id="mix-sections" class="mix-sections">
        <section class="mix-levels mix-group" aria-labelledby="levels-title"><div class="levels-heading"><h3 id="levels-title">Levels &amp; ambience</h3><button id="mixer-clear-solos" type="button" class="panel-action" disabled>Clear solos</button><button id="mixer-unmute-all" type="button" class="panel-action" disabled>Unmute all</button></div>
          <div class="console-level-scroll" tabindex="0" aria-label="Scroll mixer channels"><div class="mix-level-grid">${MIX_CHANNELS.map(consoleChannel).join('')}</div></div>
        </section>
<div class="mixer-quick-switches" aria-label="Enable instruments"><label class="check"><input id="drums" type="checkbox">Drums</label><label class="check"><input id="bass" type="checkbox">Bass</label><label class="check"><input id="comping" type="checkbox">Electric piano</label><label class="check"><input id="sequence" type="checkbox">Melodic movement</label><button type="button" id="open-sound-settings" class="panel-action">Sound settings →</button></div></div></section>
<section class="studio-tools panel workspace-page workspace-practice" aria-labelledby="practice-tools-title"><div class="section-heading"><h2 id="practice-tools-title">Practice tools</h2><span class="small-label">MAKE EACH SESSION COUNT</span></div>      <div class="pulse-shortcut-row"><span class="small-label">TEMPO SHORTCUTS</span><div id="tempo-shortcuts" class="tempo-shortcuts"></div><button id="tempo-save" type="button" class="practice-button">Save current tempo</button><span id="tempo-shortcut-status" class="practice-help" role="status"></span></div>      <div class="pulse-tool-grid">
        <details class="pulse-tool"><summary>Swing</summary><div class="pulse-tool-fields"><label>Eighth-note swing <output id="pulse-swing-value">Straight</output><input id="pulse-swing" type="range" min="0" max="100" value="0" aria-describedby="pulse-swing-help"></label><p id="pulse-swing-help" class="practice-help">Select eighth notes above. Move from straight timing to a triplet feel; backing rhythms keep their own groove.</p></div></details>
        <details class="pulse-tool"><summary>Practice timer</summary><div class="pulse-tool-fields"><label>Session length (minutes; 0 = unlimited)<input id="pulse-minutes" type="number" min="0" max="180" step="1" value="0"></label><label class="check"><input id="pulse-finish-bar" type="checkbox" checked>Finish the current bar before stopping</label><output id="pulse-time" class="pulse-time" aria-live="off">0:00 elapsed</output><p class="practice-help">Starts after the count-in. Starting playback begins a new session.</p></div></details>
        <details class="pulse-tool"><summary>Polyrhythm</summary><div class="pulse-tool-fields"><label>Overlay<select id="pulse-poly"><option value="0/2">Off</option><option value="3/2">3 against 2</option><option value="4/3">4 against 3</option><option value="5/4">5 against 4</option><option value="7/4">7 against 4</option><option value="2/3">2 against 3</option></select></label><div id="pulse-poly-beats" class="pulse-poly-beats" aria-label="Polyrhythm beats"></div><p class="practice-help">A higher click plays the overlay evenly across the chosen number of main beats. Both layers follow the tempo trainer and gap training.</p></div></details>
      </div>
      <div class="practice-block tempo-training"><label class="check"><input id="trainer-enabled" type="checkbox">Tempo trainer</label><div id="trainer-controls" hidden><div class="trainer-fields"><label>Every <select id="trainer-bars"><option>1</option><option>2</option><option selected>4</option><option>8</option></select> bars</label><label>Increase <input id="trainer-increment" type="number" min="1" max="30" value="2"> BPM</label><label>Target <input id="trainer-target" type="number" min="30" max="240" value="120"> BPM</label></div><p id="trainer-status" class="practice-help" role="status">Starts at your selected tempo.</p></div></div>
      <div class="practice-block gap-training"><label class="check"><input id="gap-enabled" type="checkbox">Gap training</label><div id="gap-controls" hidden><div class="field-row"><label>Audible bars<select id="gap-play"><option>1</option><option>2</option><option selected>4</option><option>8</option></select></label><label>Gap bars<select id="gap-mute"><option>1</option><option>2</option><option>4</option></select></label></div><label class="check"><input id="gap-progressive" type="checkbox">Increase silence by one bar after each cycle</label><label class="template-field">Maximum silent bars<select id="gap-max"><option>2</option><option>4</option><option selected>8</option><option>16</option></select></label><label class="template-field">Mute during gaps<select id="gap-target"><option value="all">Click + backing</option><option value="click">Click only</option><option value="backing">Backing only</option></select></label><p class="practice-help">Keep playing through the gap. The harmony and pulse continue underneath; the count-in stays audible.</p></div></div>
</section>
    <section class="sound-settings panel workspace-page workspace-settings" aria-labelledby="sound-settings-title"><div class="section-heading"><div><p class="eyebrow">SHAPE YOUR SOUND</p><h2 id="sound-settings-title">Sound Settings</h2></div></div><p class="practice-help">Choose instrument styles and movement here. Enable instruments and balance their levels in Metronome &amp; Mixer.</p><section class="metronome-sound-settings"><h3>Metronome</h3><label>Click sound<select id="pulse-sound"><option value="beep">Digital beep</option><option value="wood">Woodblock</option><option value="rim">Rim click</option><option value="soft">Soft click</option></select></label><p class="practice-help">Swing stays beside the metronome’s rhythm controls.</p></section><section class="pad-settings"><h3>Sustained harmony</h3><label>Backing sound<select id="sound">${Object.entries(SOUNDS).map(([id, sound]) => `<option value="${id}" ${id==='horizon'?'selected':''}>${sound.name}</option>`).join('')}</select></label>      <details class="backing-shape" open><summary>Shape the backing</summary><div class="field-row"><label>Movement<select id="pad-movement"><option value="still">Still</option><option value="evolving" selected>Evolving</option><option value="expansive">Expansive</option></select></label><label>Depth centre<select id="pad-depth"><option value="intimate">Intimate</option><option value="wide" selected>Wide</option><option value="epic">Epic</option></select></label><label>Depth motion<select id="pad-depth-motion"><option value="fixed">Fixed</option><option value="expansion">Slow expansion</option><option value="breathing" selected>Phrase breathing</option><option value="bloom">Bass bloom</option><option value="drift">Register drift</option></select></label><label>Brightness<select id="pad-brightness"><option value="dark">Dark</option><option value="balanced" selected>Balanced</option><option value="luminous">Luminous</option></select></label></div><label class="volume-label" for="pad-depth-amount">Depth movement <output id="pad-depth-amount-value">65%</output></label><input id="pad-depth-amount" type="range" min="0" max="100" value="65"><p class="practice-help">Depth motion gradually redistributes the voicing between its bass foundation, middle register and upper air.</p></details></section><div class="sound-settings-grid"><section class="rhythm mix-group"><h3 id="rhythm-title">Backing ensemble</h3>      <details id="rhythm-details" class="mixer-details" open><summary>Styles & patterns</summary><div class="field-row"><div id="drums-controls" hidden><label>Drum style<select id="drum-groove">${Object.entries(DRUM_GROOVES).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label></div><div id="bass-controls" hidden><label>Bass style<select id="bass-pattern">${Object.entries(BASS_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label></div><div id="comping-controls" hidden><label>Instrument tone<select id="comping-tone">${Object.entries(COMPING_TONES).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Comping style<select id="comping-pattern">${Object.entries(COMPING_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Voice movement<select id="comping-movement">${Object.entries(COMPING_MOVEMENTS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Hook length<select id="comping-hook-length"><option value="2">2 notes</option><option value="3" selected>3 notes</option><option value="4">4 notes</option></select></label><label class="volume-label" for="comping-movement-amount">Movement <output id="comping-movement-amount-value">50%</output></label><input id="comping-movement-amount" type="range" min="0" max="100" value="50"></div></div><p class="practice-help">Drums, bass and electric piano follow the tempo and current harmony. Piano hooks repeat characteristic modal notes as deliberate ostinatos.</p></details>
</section><section class="sequence mix-group"><h3 id="sequence-title">Melodic movement</h3>      <details id="sequence-details" class="mixer-details" open><summary>Pattern & movement</summary><p id="sequence-help" class="sequence-help"></p><div id="sequence-controls" hidden>
        <div class="field-row"><label>Musical role<select id="sequence-role">${Object.entries(SEQUENCE_ROLES).map(([id,role])=>`<option value="${id}">${role.name}</option>`).join('')}</select></label><label>Phrase<select id="sequence-phrase"><option value="2">2 bars</option><option value="4" selected>4 bars</option><option value="8">8 bars</option></select></label><label>Development<select id="sequence-development">${Object.entries(SEQUENCE_DEVELOPMENTS).map(([id,name])=>`<option value="${id}"${id==='subtle'?' selected':''}>${name}</option>`).join('')}</select></label><label>Rhythmic relationship<select id="sequence-interaction">${Object.entries(SEQUENCE_INTERACTIONS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label></div>
        <div id="sequence-pattern-library" class="field-row" hidden><label>Note source<select id="sequence-source">${Object.entries(SEQUENCE_SOURCES).map(([id,source])=>`<option value="${id}">${source.name}</option>`).join('')}</select></label><label>Pattern<select id="sequence-pattern">${sequencePatternOptions()}</select></label></div><div class="field-row"><label>Timing<select id="sequence-rate"><option value="2">Eighth notes</option><option value="4">Sixteenth notes</option><option value="3">Eighth-note triplets</option></select></label><label>Register<select id="sequence-register"><option value="0">Low</option><option value="12" selected>Middle</option><option value="24">High</option></select></label></div>
        <div class="sequence-sliders"><label class="volume-label" for="sequence-density">Activity <output id="sequence-density-value">50%</output></label><input id="sequence-density" type="range" min="0" max="100" value="50"><label class="volume-label" for="sequence-swing">Swing <output id="sequence-swing-value">0%</output></label><input id="sequence-swing" type="range" min="0" max="60" value="0"></div>
      </div></details>
</section></div></section>
    <section class="practice-roadmap panel workspace-page workspace-progress" aria-labelledby="practice-roadmap-title">
      <div class="practice-roadmap-heading"><div><p class="eyebrow">METHODICAL PRACTICE</p><h2 id="practice-roadmap-title">Learning path</h2><p id="practice-roadmap-context" class="guitar-help"></p></div><div class="practice-roadmap-progress"><strong id="practice-roadmap-percent">0%</strong><span id="practice-roadmap-count">0 of 0 complete</span></div></div>
      <div class="practice-roadmap-bar" aria-hidden="true"><i id="practice-roadmap-fill"></i></div>
      <div class="practice-roadmap-tools"><label>Today’s session<select id="practice-roadmap-duration"><option value="15">15 minutes</option><option value="20" selected>20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option></select></label><button id="practice-roadmap-reset" type="button" class="practice-button">Reset this mode</button></div>
      <div id="practice-roadmap-today" class="practice-roadmap-today"></div>
      <div id="practice-roadmap-list" class="practice-roadmap-list"></div>
      <details class="practice-library"><summary>Mode library progress</summary><p class="guitar-help">Best completion for each mode at the current root, across the chord voicings you have studied.</p><div id="practice-mode-library" class="practice-mode-library"></div></details>
    </section>
    <section class="guitar panel workspace-page workspace-guitar" aria-labelledby="guitar-title">
      <div class="section-heading"><div><p class="eyebrow">TAKE IT TO THE FRETBOARD</p><h2 id="guitar-title">Guitar reference</h2></div><button class="practice-button" data-learning-focus>Focus on this position</button><span class="small-label">STANDARD TUNING · E A D G B E</span></div>
      <section class="progression-reference compact-reference" aria-label="Guitar progression reference"></section>
      <div class="guitar-guide guitar-overview">
        <h3 id="guitar-context"></h3><p id="guitar-scale"></p><p id="guitar-parent" class="guitar-help"></p>
        <div class="guitar-controls"><label>Position navigation<select id="featured-position"><option value="path" selected>Automatic route</option><option value="all">Choose positions yourself</option></select></label><label>Diagram<select id="fret-view"><option value="scale">Scale + chord tones</option><option value="arpeggio">Chord tones only</option></select></label><label>Labels<select id="fret-labels"><option value="notes">Note names</option><option value="degrees" selected>Scale degrees</option></select></label></div>
        <input type="hidden" id="manual-position-route" value=""><div id="position-path-guide" class="position-path-guide" hidden><div class="position-path-heading"><label>Fretboard region<select id="position-region">${Object.entries(FRET_REGIONS).map(([id,region])=>`<option value="${id}" ${id==='middle'?'selected':''}>${region.name}</option>`).join('')}</select></label><label hidden>Selected chord position<select id="guitar-chord-position">${POSITIONS.map(p=>`<option value="${p.numeral}">${p.numeral} · ${p.shape} framework</option>`).join('')}</select></label><p>Automatic CAGED route · choose a region</p></div><div id="position-path" class="position-path"></div></div>
        <label class="check grip-toggle"><input id="show-grip" type="checkbox" aria-describedby="grip-toggle-help">Highlight chord shapes</label><p id="grip-toggle-help" class="guitar-help">Show the suggested chord in every CAGED position and across the full fretboard.</p><p id="grip-preview-status" class="guitar-help" role="status" hidden>Chord on · click the active button to stop.</p>
        <div class="theory-controls shared-theory-controls"><label>Explore all positions<select id="theory-view" aria-label="Explore all CAGED positions"><option value="none">Off</option><option value="pentatonic">Pentatonic superimposition</option><option value="triads">Triad pairs</option></select></label><label id="theory-choice-label" hidden>Suggestion<select id="theory-choice" aria-label="Suggestion for all CAGED positions"><option value="">None</option></select></label></div><div id="theory-description"></div>
        <div class="guitar-legend"><span><i class="root"></i>Current root</span><span><i class="chord"></i>Chord tone</span><span><i class="scale"></i>Scale tone</span><span id="grip-legend"><i class="grip"></i>Suggested chord shape</span><span id="characteristic-legend"><i class="characteristic"></i>Modal colour note</span></div>
      </div>
      <div id="full-fretboard-panel" class="full-fretboard-panel"><div class="full-fretboard-toolbar"><div><strong>Full fretboard</strong><span>Frets 1–17 · click a CAGED region to focus it</span></div><label class="check full-fretboard-option"><input id="show-regions" type="checkbox" checked>Show CAGED regions</label><button id="full-fretboard-expand" type="button" class="practice-button full-fretboard-option">Fullscreen</button><button id="full-fretboard-collapse" type="button" class="practice-button" aria-expanded="true" aria-controls="full-fretboard">Hide map</button></div><div id="full-fretboard" class="full-fretboard-scroll"></div></div>
      <div id="position-overview" class="position-overview" role="tablist" aria-label="CAGED positions"></div>
      <div id="guitar-diagrams" class="guitar-diagrams"></div>
      <div class="position-navigation" aria-label="Position navigation"><button id="position-previous" type="button" class="practice-button">← Previous</button><span id="position-indicator" aria-live="polite"></span><button id="position-next" type="button" class="practice-button">Next →</button></div>
      <details class="guitar-guide learn-more"><summary>Learn more about the diagrams</summary><p class="guitar-help">Major-scale modes share their parent-major fretboard fingerings. Position numbers and CAGED names follow the current modal root within each fingering; gold dots mark that root. With the chord overlay on, play only the solid-ring notes together. Faded notes remain available for scale or arpeggio practice. Click Strum chord while stopped to hear a warm nylon-string guitar chord at your Harmony volume. Ambient space adds reverb. Click the same button again to stop the chord. The shared Explore selector applies a pentatonic superimposition or triad pair to all five positions at once. These highlight notes within the same CAGED fingerings, with modal degrees and A/B triad markers. Chord shapes and modal rings return when exploration is off.</p>
        <p class="guitar-help">High E is at the top, low E at the bottom. Frets increase from left to right. Open-position forms are moved up an octave so every position uses fretted notes.</p>
      </details>
    </section>
    <section id="caged-exercise" class="caged-exercise panel workspace-page workspace-exercises" aria-labelledby="caged-exercise-title"></section>
  </div>
  <p id="error" class="error" role="alert" hidden></p>
  <footer><span><span class="footer-dot">●</span> Made for listening, not rushing.</span><span><a class="theme-preview-link" href="./themes.html?v=studio-icons-20261025">Compare themes</a> · Headphones on. Distractions off.</span></footer>
</main>
<div id="mini-transport" class="mini-transport" aria-label="Practice controls" hidden><section id="floating-mixer" class="floating-mixer panel" aria-labelledby="floating-mixer-title" hidden><div class="floating-mixer-heading"><h2 id="floating-mixer-title">Your mix</h2><button id="floating-mixer-close" type="button" class="practice-button" aria-label="Close mixer">Close</button></div><div id="floating-mixer-content"></div></section><button id="mini-play" class="practice-button" aria-pressed="false">Play</button><label><span id="mini-tempo-label">BPM</span><input id="mini-bpm" type="number" min="30" max="240" value="90" aria-label="Practice tempo"></label><div class="mini-harmony"><strong id="mini-chord">Am13</strong><span id="mini-mode">A Dorian</span></div><button id="mini-mixer" type="button" class="practice-button" aria-expanded="false" aria-controls="floating-mixer">Mixer</button><button id="mini-more" type="button" class="practice-button mini-more" aria-expanded="false" aria-controls="mini-detail-controls">Controls</button><div id="mini-detail-controls" class="mini-detail-controls"><div class="mini-harmony-controls"><label><span id="mini-root-purpose">Root</span><select id="mini-key" aria-label="Root note">${names.map((name,index)=>`<option value="${index}">${name}</option>`).join('')}</select></label><label>Mode<select id="mini-mode-select" aria-label="Mode">${modeOptions()}</select></label><label>Chord<select id="mini-chord-select" aria-label="Chord type"></select></label><label>Progression<select id="mini-progression" aria-label="Progression"><option value="off">Pedal chord</option>${Object.entries(PROGRESSIONS).map(([id,template])=>`<option value="${id}">${template.name}</option>`).join('')}</select></label></div><div class="mini-pulse-options"><label class="check"><input id="mini-count-in" type="checkbox">One-bar count-in</label><label class="check"><input id="mini-accent" type="checkbox">Accent beat one</label></div></div><span id="mini-beat" aria-hidden="true">●</span><button id="exit-focus" class="practice-button" hidden>Exit focus</button></div>`;

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
const select = (id: string) => el<HTMLSelectElement>(id);
document.body.insertAdjacentHTML('beforeend',`<dialog id="pulse-large" class="pulse-large" aria-labelledby="pulse-large-title"><div class="pulse-large-toolbar"><h2 id="pulse-large-title">The pulse</h2><button id="pulse-large-close" type="button" class="practice-button">Close</button></div><div id="pulse-large-number" class="pulse-large-number">Ready</div><p id="pulse-large-status">Ready to practice</p><button id="pulse-large-play" type="button" class="practice-button">Start practicing</button></dialog>`);
let settings = { ...DEFAULTS, key:9, mode: 'dorian', chord: MODES.dorian.chord, countIn:false, customProgression };
let master: GainNode | undefined;
let wet: GainNode | undefined;
let reverbGate: GainNode | undefined;
let reverb: ConvolverNode | undefined;
let impulse: AudioBuffer | undefined;
let playing = false;
let busy = false;
let step = 0;
let context: AudioContext | undefined;
let ambientMeters:AnalyserNode[]=[];
const ambientSamples=new Float32Array(256);
let node: AudioWorkletNode | undefined;
let stopping = false;
let guitarDegrees = true;
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
let fullFretboardCollapsed=false;
try { fullFretboardCollapsed=localStorage.getItem('mehtronome-full-fretboard-collapsed')==='true'; } catch { /* Keep the context map open. */ }
const PRACTICE_PROGRESS_KEY='mehtronome-mode-practice-progress';
let practiceProgress:Record<string,string[]>={};
try{practiceProgress=JSON.parse(localStorage.getItem(PRACTICE_PROGRESS_KEY)||'{}')||{};}catch{practiceProgress={};}
const exerciseView={study:'harmonized',material:'seventh',motion:'ascending',rhythm:'eighths',loop:false,backing:true,source:'',pattern:'groups3',display:'both',zoom:'comfortable',tempo:90,tempoLinked:true,loopStart:0,loopEnd:-1,autoTempo:false,autoEvery:4,autoIncrement:2,ceiling:160,stage:'full',application:'cell-space',response:'demo',fretboard:true,recall:false,setupOpen:false};
exerciseView.display=localStorage.getItem('mehtronome-notation-display')||'both';exerciseView.zoom=localStorage.getItem('mehtronome-notation-zoom')||'comfortable';
let studyHarmony:any,studyBoard:any,studyPosition:any;
let exerciseBackingStep=0;
let exercisePlan:any=null;
let exerciseMapSlot=-1;
function isAlignedStudy(){return settings.progression&&['guidetones','connections'].includes(exerciseView.study);}
function selectedPlanEvents(){const range=exerciseRange();return exercisePlan.events.filter((e:any)=>e.index>=range.start&&e.index<=range.end);}
let activeGoal='';
let gripOnly=false;
let exerciseReferenceExpanded=false;
let currentExerciseGroups:any[]=[];
let currentExercise:any[]=[];
let exerciseTimer:ReturnType<typeof setTimeout>|undefined;
let exerciseSources:AudioScheduledSourceNode[]=[];
let exercisePlaying=false;
let exercisePreparing=false,exercisePrepareGeneration=0;
let noteAuditionGeneration=0;
let audioPreparation:Promise<void>|undefined;
let exerciseNextStart:number|undefined;
let exerciseTimelineStart:number|undefined;
let exerciseAnimationFrame=0;
let exerciseRepetitions=0;
let exerciseResponseActive=false;
let exerciseSymbolCycle=-1;
let exerciseSelectionStart:number|null=null,exerciseSelectionEnd:number|null=null;
let exerciseDragPointer:number|null=null,exerciseDragMoved=false,suppressExerciseNoteClick=false;
const EXERCISE_FAVOURITES_KEY='mehtronome-exercise-favourites';
let previewGeneration = 0;
let currentBpm = settings.bpm;
let focusView = false;
let mixerDrums = false, mixerBass = false, mixerComping = false, mixerSequence = false;

function escapeHtml(text:string) { return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }

function stopExercisePreview() {
  exercisePrepareGeneration++;exercisePreparing=false;
  const stopBacking=exercisePlaying&&exerciseView.backing&&!playing;
  clearTimeout(exerciseTimer);exerciseTimer=undefined;
  for(const source of exerciseSources){try{source.stop();}catch{}}
  exerciseSources=[];exerciseResponseActive=false;exercisePlaying=false;exerciseSymbolCycle=-1;exerciseNextStart=undefined;exerciseTimelineStart=undefined;exerciseRepetitions=0;cancelAnimationFrame(exerciseAnimationFrame);
  if(stopBacking){node?.port.postMessage({type:'stop'});renderProgressionReference();}
  const button=document.querySelector<HTMLButtonElement>('#exercise-preview');
  if(button){button.textContent='▶ Hear jazz guitar';button.setAttribute('aria-pressed','false');button.removeAttribute('aria-busy');}
  const rangeButton=document.querySelector<HTMLButtonElement>('#exercise-play-range');if(rangeButton)rangeButton.textContent='▶ Play selection';
  document.querySelectorAll('.exercise-note').forEach(note=>note.classList.remove('playing','played'));
  highlightLearningNote(null,currentExercise);syncMiniTransport();
  reflectExerciseSelection();if(exercisePlan&&currentExerciseGroups[0]?.harmony){exerciseMapSlot=Math.max(0,Math.min(currentExerciseGroups.length-1,exerciseMapSlot));updateProgressionMap(el('caged-exercise'),currentExerciseGroups[exerciseMapSlot],exerciseView.study);}refreshBackingSymbols();
}

function exerciseRange(){
  if(exerciseSelectionStart!==null){const other=exerciseSelectionEnd??exerciseSelectionStart;return {start:Math.min(exerciseSelectionStart,other),end:Math.max(exerciseSelectionStart,other)};}
  const end=exerciseView.loopEnd<0?currentExercise.length-1:Math.min(exerciseView.loopEnd,currentExercise.length-1);return {start:Math.min(exerciseView.loopStart,end),end};
}
function selectedExercise(){const range=exerciseRange();return currentExercise.slice(range.start,range.end+1);}
function reflectExerciseSelection(){
  const range=exerciseSelectionStart===null?null:exerciseRange();
  document.querySelectorAll<HTMLElement>('#caged-exercise .exercise-note').forEach(note=>{const index=Number(note.dataset.noteIndex);note.classList.toggle('range-selected',Boolean(range&&index>=range.start&&index<=range.end));});
  const playButton=document.querySelector<HTMLButtonElement>('#exercise-play-range'),clearButton=document.querySelector<HTMLButtonElement>('#exercise-clear-range');
  if(playButton){playButton.disabled=!range;playButton.textContent=exercisePlaying?'■ Stop selection':'▶ Play selection';}
  if(clearButton)clearButton.disabled=!range;
}
function updateExerciseCursor(){
  if(!exercisePlaying||!context||exerciseTimelineStart===undefined)return;
  const sequence=selectedExercise(),divisions=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2,noteLength=60/exerciseView.tempo/divisions;
  const elapsed=context.currentTime-exerciseTimelineStart,countIn=settings.countIn?settings.beats*60/exerciseView.tempo:0;
  const status=document.querySelector<HTMLElement>('#exercise-playback-status'),progress=document.querySelector<HTMLElement>('#exercise-progress-fill');
  if(elapsed<countIn){const beat=Math.max(1,Math.ceil((countIn-elapsed)/(60/exerciseView.tempo)));if(status)status.textContent=`Count-in · ${settings.beats-beat+1} / ${settings.beats}`;}
  else if(sequence.length&&exercisePlan){
    const elapsedBeats=Math.max(0,elapsed-countIn)*exerciseView.tempo/60;
    const position=planPosition({...exercisePlan,events:selectedPlanEvents()},elapsedBeats);
    const index=position.event?.index??null;
    if(exerciseResponseActive!==Boolean(position.slot.response)){exerciseResponseActive=Boolean(position.slot.response);syncMiniTransport();}
    document.querySelectorAll<HTMLElement>('.exercise-note').forEach(note=>{const at=Number(note.dataset.startBeat),duration=Number(note.dataset.durationBeats);note.classList.toggle('playing',index!==null&&Number(note.dataset.noteIndex)===index&&position.beat>=at-1e-6&&position.beat<at+duration-1e-6);});
    if(position.slot.slot!==exerciseMapSlot&&currentExerciseGroups[position.slot.slot]?.harmony){exerciseMapSlot=position.slot.slot;const group=currentExerciseGroups[exerciseMapSlot];step=position.slot.step;renderMusic(true,group.position);updateProgressionMap(el('caged-exercise'),group,exerciseView.study);}
    highlightLearningNote(index,currentExercise);
    if(status)status.textContent=`${position.slot.chord} · ${position.slot.response?'Your turn · play over the backing':index===null?'Rest':exerciseView.study==='guidetones'?'Hold guide tone':'Play '+exerciseView.study} · bar ${Math.floor(position.beat/settings.beats)+1} · ${exerciseView.tempo} BPM`;
    if(progress)progress.style.width=`${position.beat/exercisePlan.duration*100}%`;
  }
  else if(sequence.length){
    const elapsedExercise=Math.max(0,elapsed-countIn),phraseDuration=sequence.length*noteLength;
    const cycleDuration=exerciseView.loop&&exerciseView.backing?barAlignedDuration(phraseDuration,60/exerciseView.tempo,settings.beats):phraseDuration;
    const cyclePosition=elapsedExercise%cycleDuration;const cycle=Math.floor(elapsedExercise/cycleDuration);if(cycle!==exerciseSymbolCycle){exerciseSymbolCycle=cycle;refreshBackingSymbols(cycle*cycleDuration*exerciseView.tempo/60);}
    const repetition=Math.floor(elapsedExercise/cycleDuration)+1;
    const resting=cyclePosition>=phraseDuration,index=resting?sequence.length-1:Math.min(sequence.length-1,Math.floor(cyclePosition/noteLength)),globalIndex=exerciseRange().start+index;
    document.querySelectorAll<HTMLElement>('.exercise-note').forEach(note=>{const value=Number(note.dataset.noteIndex);note.classList.toggle('playing',value===globalIndex);note.classList.toggle('played',value<globalIndex&&value>=exerciseRange().start);});
    highlightLearningNote(resting?null:globalIndex,currentExercise);
    if(resting)document.querySelectorAll<HTMLElement>('.exercise-note').forEach(note=>note.classList.remove('playing'));
    document.querySelector(`[data-note-index="${globalIndex}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});
    if(status)status.textContent=resting?`Rest · next repetition on beat 1 · ${exerciseView.tempo} BPM`:`Note ${index+1} / ${sequence.length} · repetition ${repetition} · ${exerciseView.tempo} BPM`;
    const tempoControl=document.querySelector<HTMLInputElement>('#exercise-tempo');if(tempoControl&&document.activeElement!==tempoControl)tempoControl.value=String(exerciseView.tempo);
    if(progress)progress.style.width=`${((index+1)/sequence.length)*100}%`;
  }
  exerciseAnimationFrame=requestAnimationFrame(updateExerciseCursor);
}

function renderCagedExercise(position:any,board:any,info:any,positionPath:any[]|undefined=undefined) {
  noteAuditionGeneration++;
  const oldReference=el('caged-exercise').querySelector<HTMLDetailsElement>('.progression-reference details');if(oldReference)exerciseReferenceExpanded=oldReference.open;
  studyHarmony=info;studyBoard=board;studyPosition=position;
  if(exerciseView.tempoLinked)exerciseView.tempo=settings.bpm;
  if(!settings.progression&&['guidetones','connections'].includes(exerciseView.study))exerciseView.study='harmonized';
  const exerciseProgression=settings.progression?progressionOrder(settings).map((index:number)=>chordInfo(index)):[info];
  const suggestions=theoryOptions(info);
  const sourceChoices=exerciseView.study==='triadpairs'?suggestions.triadPairs:exerciseView.study==='pentatonic'?suggestions.pentatonics:[];
  const sourceChoice=sourceChoices.find((choice:any)=>choice.id===exerciseView.source)||sourceChoices[0];
  if(sourceChoice)exerciseView.source=sourceChoice.id;
  currentExerciseGroups=settings.progression?[]:cagedStudy(board,info,exerciseView.study,exerciseView.material,exerciseView.motion,{progression:exerciseProgression,source:sourceChoice?.id,pattern:exerciseView.pattern});
  if(!settings.progression&&exerciseView.study==='grip')currentExerciseGroups=gripStudy(board,info);
  if(!settings.progression&&exerciseView.study==='positional')currentExerciseGroups=positionalArpeggio(board,info,exerciseView.motion);
  if(isAlignedStudy()){
    positionPath=positionPath||progressionPositionPath(exerciseProgression,{name:'Selected position',start:board.start,end:board.end});
    if(!['ascending','descending'].includes(exerciseView.motion))exerciseView.motion='ascending';
    currentExerciseGroups=alignedProgressionGroups(board,exerciseProgression,exerciseView.study,exerciseView.material,exerciseView.motion,positionPath?.map((choice:any,index:number)=>fretboardFor(exerciseProgression[index],choice.geometryShape)));
    if(exerciseView.stage==='cell')currentExerciseGroups=currentExerciseGroups.map((group:any,index:number)=>index?{...group,notes:[]}:group);
    let globalStart=0;currentExerciseGroups=currentExerciseGroups.map((group:any,slot:number)=>{const harmony=exerciseProgression[slot],current={...group,globalStart,harmony,board:positionPath?fretboardFor(harmony,positionPath[slot].geometryShape):fullFretboardFor(harmony,board.start,board.end),position:positionPath?.[slot]||position,fixedRegion:!positionPath};globalStart+=group.notes.length;return current;});
    exerciseView.autoTempo=false;
    exercisePlan=progressionStudyPlan(currentExerciseGroups,progressionOrder(settings),progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats),settings.beats,exerciseView.study,exerciseView.rhythm);
  }else if(settings.progression){
    currentExerciseGroups=progressionExerciseGroups(exerciseProgression,progressionOrder(settings).map((index:number)=>progressionPlaybackBeatDurations(settings)[index]),board,{...exerciseView,rhythm:exerciseView.stage==='apply'&&settings.beats===4?'sixteenths':exerciseView.rhythm,source:sourceChoice?.id||'',positionPath});
    exerciseView.autoTempo=false;
    exercisePlan=progressionStudyPlan(currentExerciseGroups,progressionOrder(settings),progressionPlaybackBeatDurations(settings).map((duration:number)=>duration/settings.beats),settings.beats,exerciseView.study,exerciseView.rhythm);
  }else{exercisePlan=null;if(exerciseView.stage==='cell')currentExerciseGroups=shortCell(currentExerciseGroups);}
  if(exerciseView.stage==='apply'&&settings.beats===4){
    if(!exercisePlan){const source=currentExerciseGroups[0];currentExerciseGroups=[{...source,chord:info.name+info.suffix,slot:0,notes:source?.notes||[],harmony:info,board,position,globalStart:0,cellLengths:[source?.notes.length||0]}];exercisePlan=progressionStudyPlan(currentExerciseGroups,[0],[1],4,exerciseView.study,exerciseView.rhythm);}
    const application=applicationStudy(currentExerciseGroups,exercisePlan,exerciseView.application,exerciseView.response);currentExerciseGroups=application.groups;exercisePlan=application.plan;exerciseView.autoTempo=false;
  }
  if(settings.progression&&exerciseView.backing)exerciseView.autoTempo=false;
  currentExercise=flattenExercise(currentExerciseGroups);
  const rhythmName={eighths:'Eighth notes',triplets:'Eighth-note triplets',sixteenths:'Sixteenth notes'}[exerciseView.rhythm] || 'Eighth notes';
  const materialName=exerciseView.material==='triad'?'triads':exerciseView.material==='extensions'?'ninth chords':'tetrads';
  const alternatingLabel={ascending:'Up/down',descending:'Down/up','up-down':'Up/down then down/up','down-up':'Down/up then up/down'}[exerciseView.motion] || 'Up/down';
  const materialTitle=materialName[0].toUpperCase()+materialName.slice(1);
  const studyName={grip:'Exact grip notes',positional:'Full positional arpeggio',harmonized:`Harmonized ${materialName}`,alternating:`${alternatingLabel} diatonic ${materialName}`,chordtones:`${materialTitle} from each chord tone`,chordtonesalternating:`${alternatingLabel} ${materialName} from each chord tone`,cells:'Diatonic 1–2–3–5 cells',thirds:'Scale in thirds',fourths:'Scale in fourths',sixths:'Scale in sixths',digital1324:'Diatonic 1–3–2–4 pattern',groups3:'Ascending groups of three',groups4:'Ascending groups of four',inversions:`${info.name}${info.suffix} inversion cycle`,enclosures:'Jazz enclosures · above then below',enclosuresbelowabove:'Jazz enclosures · below then above',enclosureschromatic:'Tight chromatic enclosures',enclosuresdouble:'Double jazz enclosures',enclosuresfiveone:'Five-note enclosure 1',enclosuresfivetwo:'Five-note enclosure 2',enclosuresfivethree:'Five-note enclosure 3',enclosuresfivefour:'Five-note enclosure 4',approach:`Chromatic approach-note ${materialName}`,doubleapproach:'Double chromatic approaches',chromaticneighbors:'Chromatic neighbour cells',passingtones:'Chromatic passing-tone scale',approacheverytone:`Approach every ${materialName.slice(0,-1)} tone`,upperstructure:'3–5–7–9 upper structures',guidetones:'Guide-tone voice leading',connections:`Voice-led ${materialName} connections`,triadpairs:'Triad-pair lines',pentatonic:'Superimposed pentatonic sequences'}[exerciseView.study] || `Harmonized ${materialName}`;
  const alternatingStudy=['alternating','chordtonesalternating'].includes(exerciseView.study);
  const directionOptions=isAlignedStudy()?(exerciseView.study==='guidetones'?'<option value="ascending">Lower starting guide</option><option value="descending">Upper starting guide</option>':'<option value="ascending">Ascending arpeggios</option><option value="descending">Descending arpeggios</option>'):alternatingStudy?'<option value="ascending">Up/down · low to high</option><option value="descending">Down/up · high to low</option>':'<option value="ascending">Ascending</option><option value="descending">Descending</option><option value="up-down">Ascending and descending</option><option value="down-up">Descending and ascending</option>';
  const exerciseFooter=exercisePlan?'This study follows the progression in chord order. Direction changes the pitch path, not the chord order.':currentExercise[0]?`This study starts on ${currentExercise[0].name}, string ${6-currentExercise[0].string}, fret ${currentExercise[0].fret}, in the displayed ${position.shape} framework.`:'No complete study fits this position. Choose another position or exercise.';
  const exerciseRoot=exerciseView.study==='pentatonic'&&sourceChoice?.rootPc!==undefined?info.scaleNames[info.scalePcs.indexOf(sourceChoice.rootPc)]:info.scaleNames[0];
  const notation=exercisePlan?progressionNotationSvg(exercisePlan,`${studyName} · progression`):exerciseNotationSvg(currentExerciseGroups,exerciseView.rhythm,`${studyName} · ${exerciseRoot}`,{backingChord:settings.progression?'':info.name+info.suffix,groupChords:false,beats:settings.beats});
  const favouriteOptions=exerciseFavourites().map((item:any,index:number)=>`<option value="${index}">${escapeHtml(item.study)} · ${escapeHtml(item.pattern||item.material)}</option>`).join('');
  const sourceControl=sourceChoices.length?`<label>Source<select id="exercise-source">${sourceChoices.map((choice:any)=>`<option value="${escapeHtml(choice.id)}">${escapeHtml(choice.name)}</option>`).join('')}</select></label>`:'';
  const patternControl=exerciseView.study==='pentatonic'?`<label>Pattern<select id="exercise-pattern">${Object.entries(PENTATONIC_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>`:'';
  const voiceLeadingControl=settings.progression?'<optgroup label="Voice leading"><option value="guidetones">Guide-tone lines</option><option value="connections">Arpeggio connections</option></optgroup>':'';
  el('caged-exercise').innerHTML=`<section class="progression-reference compact-reference" aria-label="Exercise progression reference"></section><div class="exercise-heading"><div><p class="eyebrow">POSITION PRACTICE</p><h3 id="caged-exercise-title">${escapeHtml(studyName)} · Position ${position.numeral}</h3></div><span>${settings.progression?'Follows chord progression':escapeHtml(info.scaleNames[0])+' '+escapeHtml(MODES[info.mode as keyof typeof MODES].name)} · ${exercisePlan&&exerciseView.study==='guidetones'?'Sustain through each chord':rhythmName}</span></div><div class="exercise-controls"><label>Exercise<select id="exercise-study"><optgroup label="Selected chord"><option value="grip">Exact grip notes</option><option value="positional">Full positional arpeggio</option></optgroup><optgroup label="Scale sequences"><option value="thirds">Scale in thirds</option><option value="fourths">Scale in fourths</option><option value="sixths">Scale in sixths</option><option value="groups3">Groups of three</option><option value="groups4">Groups of four</option><option value="digital1324">Diatonic 1–3–2–4</option><option value="cells">Diatonic 1–2–3–5</option></optgroup><optgroup label="Diatonic triads & arpeggios"><option value="harmonized">Harmonized scale</option><option value="alternating">Alternating diatonic arpeggios</option><option value="chordtones">Arpeggios from each chord tone</option><option value="chordtonesalternating">Alternating arpeggios from each chord tone</option><option value="inversions">Selected-chord inversions</option><option value="upperstructure">3-to-9 arpeggios</option></optgroup>${voiceLeadingControl}<optgroup label="Chromatic language"><option value="enclosures">Enclosures · above then below</option><option value="enclosuresbelowabove">Enclosures · below then above</option><option value="enclosureschromatic">Tight chromatic enclosures</option><option value="enclosuresdouble">Double jazz enclosures</option><option value="enclosuresfiveone">Five-note enclosure 1 · −1 +2 +1 −1</option><option value="enclosuresfivetwo">Five-note enclosure 2 · +1 −2 −1 +1</option><option value="enclosuresfivethree">Five-note enclosure 3 · −2 +1 −2 −1</option><option value="enclosuresfivefour">Five-note enclosure 4 · +2 −1 +2 +1</option><option value="approach">Approach-note arpeggios</option><option value="doubleapproach">Double chromatic approaches</option><option value="chromaticneighbors">Chromatic neighbour cells</option><option value="passingtones">Chromatic passing-tone scale</option><option value="approacheverytone">Approach every arpeggio tone</option></optgroup><optgroup label="Superimpositions"><option value="triadpairs">Triad-pair lines</option><option value="pentatonic">Pentatonic sequences</option></optgroup></select></label><label>Material<select id="exercise-material"><option value="triad">Triads</option><option value="seventh">Tetrads</option><option value="extensions">Ninth chords</option></select></label>${sourceControl}${patternControl}<label>Direction<select id="exercise-motion">${directionOptions}</select></label><label>Rhythm<select id="exercise-rhythm"><option value="eighths">Eighth notes</option><option value="triplets">Triplets</option><option value="sixteenths">Sixteenth notes</option></select></label><label class="check exercise-loop"><input id="exercise-loop" type="checkbox">Loop</label><label class="check exercise-backing"><input id="exercise-backing" type="checkbox">Use accompaniment</label></div><div class="exercise-practice-bar"><div class="exercise-tempo"><label>Exercise tempo <input id="exercise-tempo" type="number" min="30" max="240" value="${exerciseView.tempo}"></label><button type="button" class="practice-button" data-tempo-ratio=".5">½ speed</button><button type="button" class="practice-button" data-tempo-ratio=".75">¾ speed</button><button type="button" class="practice-button" data-tempo-ratio="1">Main tempo</button></div><div class="exercise-display"><label>Favourites<select id="exercise-favourites"><option value="">Saved exercises</option>${favouriteOptions}</select></label><label>Display<select id="exercise-display"><option value="both">Notation + TAB</option><option value="tab">TAB only</option><option value="notation">Notation only</option><option value="names">Note names + TAB</option><option value="degrees">Degrees + TAB</option></select></label><label>Size<select id="exercise-zoom"><option value="fit">Fit width</option><option value="comfortable">Comfortable</option><option value="large">Large</option></select></label></div><label class="check"><input id="exercise-auto-tempo" type="checkbox">Auto-increase tempo</label><label>Every <select id="exercise-auto-every"><option>2</option><option selected>4</option><option>8</option></select> repetitions</label><label>+ <input id="exercise-auto-increment" type="number" min="1" max="20" value="2"> BPM</label></div><div class="exercise-status-row"><span id="exercise-playback-status" role="status">Ready · click a note to hear it.</span><div class="exercise-progress"><i id="exercise-progress-fill"></i></div><div class="notation-legend"><span><i class="legend-target"></i>Target</span><span><i class="legend-active"></i>Playing</span></div></div><div class="exercise-range-controls" aria-label="Notation selection"><button id="exercise-play-range" type="button" class="practice-button" disabled>▶ Play selection</button><button id="exercise-clear-range" type="button" class="practice-button" disabled>Clear selection</button><span>Drag across notation notes to select and hear a passage.</span></div><div class="notation-scroll display-${exerciseView.display} zoom-${exerciseView.zoom}">${notation}</div><div class="exercise-footer"><p>${escapeHtml(exerciseFooter)} Note names or degrees can be shown beneath the synchronized notation and TAB.</p><div class="exercise-actions"><button id="exercise-history-back" type="button" class="practice-button" aria-label="Previous exercise">←</button><button id="exercise-history-forward" type="button" class="practice-button" aria-label="Next exercise">→</button><button id="exercise-favourite" type="button" class="practice-button">☆ Favourite</button><button id="exercise-export" type="button" class="practice-button">Export SVG</button><button id="exercise-print" type="button" class="practice-button">Print / PDF</button><button id="exercise-focus" type="button" class="practice-button" aria-pressed="false">Focus notation</button><button id="exercise-preview" type="button" class="practice-button" aria-pressed="false" ${playing||!currentExercise.length?'disabled':''}>▶ Hear jazz guitar</button></div></div>`;
  renderProgressionReference();
  select('exercise-study').value=exerciseView.study;
  select('exercise-material').value=exerciseView.material;
  if(sourceChoice)select('exercise-source').value=sourceChoice.id;
  if(exerciseView.study==='pentatonic')select('exercise-pattern').value=exerciseView.pattern;
  select('exercise-material').disabled=['cells','thirds','fourths','sixths','digital1324','groups3','groups4','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','doubleapproach','chromaticneighbors','passingtones','upperstructure','guidetones','triadpairs','pentatonic'].includes(exerciseView.study);
  select('exercise-motion').value=exerciseView.motion;
  select('exercise-motion').disabled=false;
  select('exercise-rhythm').value=exerciseView.rhythm;
  input('exercise-loop').checked=exerciseView.loop;
  input('exercise-backing').checked=exerciseView.backing;
  select('exercise-display').value=exerciseView.display;select('exercise-zoom').value=exerciseView.zoom;
  input('exercise-auto-tempo').checked=exerciseView.autoTempo;select('exercise-auto-every').value=String(exerciseView.autoEvery);input('exercise-auto-increment').value=String(exerciseView.autoIncrement);
  const focusButton=el<HTMLButtonElement>('exercise-focus'),notationFocused=el('caged-exercise').classList.contains('notation-focused');
  focusButton.textContent=notationFocused?'Exit notation focus':'Focus notation';focusButton.setAttribute('aria-pressed',String(notationFocused));
  const exerciseOptions=Array.from(select('exercise-study').options),exerciseIndex=exerciseOptions.findIndex(option=>option.value===exerciseView.study);
  const previousExercise=el<HTMLButtonElement>('exercise-history-back'),nextExercise=el<HTMLButtonElement>('exercise-history-forward');
  previousExercise.disabled=exerciseIndex<=0;nextExercise.disabled=exerciseIndex<0||exerciseIndex>=exerciseOptions.length-1;
  previousExercise.title=exerciseIndex>0?`Previous: ${exerciseOptions[exerciseIndex-1].text}`:'First exercise';
  nextExercise.title=exerciseIndex>=0&&exerciseIndex<exerciseOptions.length-1?`Next: ${exerciseOptions[exerciseIndex+1].text}`:'Last exercise';
  learningView(el('caged-exercise'),{board,info,position,groups:currentExerciseGroups,notes:currentExercise,study:exerciseView.study,source:sourceChoice,stage:exerciseView.stage,backing:exerciseView.backing,application:exercisePlan?.application,response:exerciseView.response,applicationSupported:settings.beats===4,fretboard:exerciseView.fretboard,recall:exerciseView.recall,ceiling:exerciseView.ceiling,setupOpen:exerciseView.setupOpen,aligned:!!exercisePlan,adaptive:settings.progression&&!isAlignedStudy(),progressionSteps:progressionOrder(settings),inspectedStep:step,navigation:select('featured-position').value,region:select('position-region').value,progression:settings.progression,progressionBacking:settings.progression&&exerciseView.backing,timingWarnings:exercisePlan?.warnings,guidePaths:['guidetones','connections'].includes(exerciseView.study)?guideToneExamples(exerciseProgression):[]});
  reflectExerciseSelection();
  exerciseMapSlot=-1;if(settings.progression&&currentExerciseGroups[0]?.harmony){exerciseMapSlot=Math.max(0,progressionOrder(settings).indexOf(step));updateProgressionMap(el('caged-exercise'),currentExerciseGroups[exerciseMapSlot],exerciseView.study);}
  refreshBackingSymbols();reserveChordBands(el('caged-exercise'));
  void document.fonts.ready.then(()=>reserveChordBands(el('caged-exercise')));
}

function backingChordAt(beat:number){const config=exerciseBackingConfig(),index=config.progression?progressionStepAtBeat(config,beat):0,info=harmonyAt(config,index);return info.name+info.suffix;}
function refreshBackingSymbols(baseBeat=0){if(exercisePlan)return;const division=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;updateBackingSymbols(el('caged-exercise'),backingChordAt,division,settings.beats,exercisePlaying?exerciseRange():{start:0,end:currentExercise.length-1},baseBeat);}

function exerciseBackingConfig(){
  if(settings.progression)return {...settings,trainerEnabled:false,gapEnabled:false,extensionMorph:false};
  if(!studyHarmony)return settings;
  return {...settings,progression:false,key:studyHarmony.chordPcs[0],chord:studyHarmony.chordId,mode:studyHarmony.scalePcs[0]===studyHarmony.chordPcs[0]?studyHarmony.mode:recommendedMode(studyHarmony.chordId),extensionMorph:false};
}
function exerciseAudioSettings(){return {...exerciseBackingConfig(),bpm:exerciseView.tempo,sessionSeconds:exercisePlan&&!exerciseView.loop?exercisePlan.duration*60/exerciseView.tempo:0,sessionFinishBar:false};}
function scheduleExercise(scheduledStart?:number,timelineOrigin?:number) {
  if(!context||!master||!currentExercise.length||!exercisePlaying)return;
  const divisions=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;
  const noteLength=60/exerciseView.tempo/divisions,sequence=selectedExercise();
  const countIn=scheduledStart===undefined&&settings.countIn?settings.beats*60/exerciseView.tempo:0;
  const start=scheduledStart??context.currentTime+.03+countIn;
  if(exerciseTimelineStart===undefined){exerciseTimelineStart=timelineOrigin??start-countIn;updateExerciseCursor();}
  const events=exercisePlan?selectedPlanEvents().map((e:any)=>({note:e.note,accent:e.accent,at:start+e.start*60/exerciseView.tempo,length:e.duration*60/exerciseView.tempo})):sequence.map((note,index)=>({note,at:start+index*noteLength,length:noteLength}));
  events.forEach(({note,at,length,accent}:any)=>{
    const duration=Math.max(.045,Math.min(12,length*.96)),release=Math.min(.045,duration*.3);
    const samples=renderJazzGuitarNote(context!.sampleRate,note.midi,duration);
    const buffer=context!.createBuffer(1,samples.length,context!.sampleRate);buffer.copyToChannel(samples,0);
    const source=context!.createBufferSource(),gain=context!.createGain(),filter=context!.createBiquadFilter();source.buffer=buffer;
    filter.type='lowpass';filter.frequency.value=3100;filter.Q.value=.45;
    gain.gain.setValueAtTime(accent ? .42 : .3,at);gain.gain.setValueAtTime(accent ? .42 : .3,at+duration-release);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    source.connect(filter).connect(gain).connect(master!);
    if(reverb)gain.connect(reverb);
    source.start(at);source.stop(at+duration);exerciseSources.push(source);
    source.onended=()=>{const sourceIndex=exerciseSources.indexOf(source);if(sourceIndex>=0)exerciseSources.splice(sourceIndex,1);};
  });
  const phraseDuration=exercisePlan?exercisePlan.duration*60/exerciseView.tempo:sequence.length*noteLength;
  const duration=exerciseView.loop&&exerciseView.backing?barAlignedDuration(phraseDuration,60/exerciseView.tempo,settings.beats):phraseDuration;
  const nextStart=start+duration;exerciseNextStart=nextStart;
  const lookahead=Math.min(1,Math.max(.2,duration*.25));
  // A backed, timed one-shot ends on the engine's sample-counted completion
  // message. A wall timer can outrun the audio thread under CPU load.
  if(!exerciseView.loop&&exerciseView.backing&&exercisePlan)return;
  const complete=()=>{
    if(!exercisePlaying||!context)return;
    const remaining=nextStart-context.currentTime;
    if(!exerciseView.loop&&remaining>0){exerciseTimer=setTimeout(complete,Math.max(10,remaining*1000+60));return;}

    if(exerciseView.loop&&exercisePlaying){exerciseRepetitions++;if(exerciseView.autoTempo&&exerciseRepetitions%exerciseView.autoEvery===0){exerciseView.tempo=Math.min(Math.max(exerciseView.tempo,exerciseView.ceiling),exerciseView.tempo+exerciseView.autoIncrement);exerciseTimelineStart=nextStart;node?.port.postMessage({type:'settings',settings:{...exerciseBackingConfig(),bpm:exerciseView.tempo}});}scheduleExercise(nextStart);}else stopExercisePreview();
  };
  exerciseTimer=setTimeout(complete,Math.max(0,(nextStart-context.currentTime-(exerciseView.loop?lookahead:-.06))*1000));
}

async function toggleExercisePreview() {
  if(exercisePlaying||exercisePreparing){stopExercisePreview();return;}
  if(playing||busy||stopping||!currentExercise.length)return;
  stopPreview();
  const generation=++exercisePrepareGeneration;exercisePreparing=true;el('exercise-preview').textContent='Loading… click to cancel';el('exercise-preview').setAttribute('aria-busy','true');syncMiniTransport();
  try{
    await prepareAudio();if(generation!==exercisePrepareGeneration)return;exercisePreparing=false;el('exercise-preview').removeAttribute('aria-busy');exercisePlaying=true;exerciseBackingStep=exercisePlan?.slots[0]?.step??0;syncMiniTransport();refreshBackingSymbols();
    const backingStart=exerciseView.backing?context!.currentTime+.08:undefined;
    if(exerciseView.backing)node!.port.postMessage({type:'start',startTime:backingStart,settings:{...exerciseAudioSettings(),countIn:settings.countIn}});
    const button=el<HTMLButtonElement>('exercise-preview');button.textContent='■ Stop exercise';button.setAttribute('aria-pressed','true');
    reflectExerciseSelection();
    if(backingStart!==undefined){const countIn=settings.countIn?settings.beats*60/exerciseView.tempo:0;scheduleExercise(backingStart+countIn,backingStart);}
    else scheduleExercise();
  }catch(error){stopExercisePreview();el('error').textContent=error instanceof Error?error.message:'Could not preview this exercise.';el('error').hidden=false;}
}

function chordInfo(index: number) { return harmonyAt(settings, index); }
function renderProgressionReference(activeStep=step) {
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
  document.querySelectorAll<HTMLElement>('.progression-reference').forEach(element=>{
    const referenceExpanded=element.querySelector<HTMLDetailsElement>('details')?.open??(element.getAttribute('aria-label')==='Exercise progression reference'?exerciseReferenceExpanded:false);
    if(exercisePlaying&&exerciseView.backing&&!settings.progression&&element.getAttribute('aria-label')==='Exercise progression reference'){element.innerHTML=`<p><b>Static study backing:</b> ${escapeHtml(studyHarmony.name+studyHarmony.suffix)} · the main progression setup is retained.</p>`;return;}
    element.innerHTML=`<div class="reference-heading"><div><p class="eyebrow">HARMONY REFERENCE</p><h4>${escapeHtml(title)}</h4></div><span class="reference-meter">${settings.beats} beats / bar${settings.progression?` · ${settings.template==='custom'||settings.loopUnit==='beats'?order.reduce((sum:number,index:number)=>sum+progressionPlaybackBeatDurations(settings)[index],0)+'-beat loop':order.reduce((sum:number,index:number)=>sum+durations[index],0)+'-bar loop'}`:''}</span></div><ol class="reference-chords">${cards}</ol><p class="reference-preview-help">While stopped, hold a chord to hear it. Release to stop.</p><div class="reference-current"><span><b>Current:</b> ${escapeHtml(label(active))} · ${escapeHtml(info.tones.join(' · '))}</span><span><b>Scale guide:</b> ${escapeHtml(scale(info))}</span>${settings.progression?`<span><b>Next:</b> ${escapeHtml(label(next))}</span>`:''}</div>`;
    const context=musicalContext(settings,activeStep);
    if(element.classList.contains('compact-reference')){const list=element.querySelector('ol')!;const help=element.querySelector('.reference-preview-help')!;const details=document.createElement('details');details.open=referenceExpanded;details.innerHTML='<summary>Full progression · hold a chord to hear it</summary>';details.append(list,help);element.append(details);element.querySelector('.reference-heading')?.remove();element.querySelector('.reference-current')?.insertAdjacentHTML('afterbegin',`<span><b>Tonic:</b> ${escapeHtml(context.tonic)}</span>`);}
    applyStudioIcons(element);
  });
}
function renderMusic(skipExercise=false,positionOverride:any=null) {
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
  el('progression-strip').classList.toggle('blues', template.roman.length === 12);
  el('progression-strip').hidden = true;
  el('preview-controls').hidden = !settings.progression;el('preview-controls').querySelector('p')!.textContent='Click a chart chord or press Enter to edit. While stopped, hold it or hold Space to hear it; release to stop.';
  const focusedStep = (document.activeElement as HTMLElement)?.dataset.step;
  el('progression-strip').innerHTML = Array.from({ length: template.roman.length }, (_, i) => {
    const c = chordInfo(i);
    return `<button type="button" data-step="${i}" aria-pressed="${i === step}" ${playing ? 'disabled' : ''} class="${i === step ? 'current' : ''} ${settings.loopEnabled && !order.includes(i) ? 'outside-loop' : ''}">${c.name}${c.suffix === 'maj' ? '' : c.suffix}<small>${c.roman}</small>${jazz || modal || custom ? `<small>${durationLabel(i)}</small>` : ''}</button>`;
  }).join('');
  if (focusedStep !== undefined) el('progression-strip').querySelector<HTMLButtonElement>(`[data-step="${focusedStep}"]`)?.focus({preventScroll: true});
  el('harmony-explanation').textContent = spellingHelp(info)+' '+(modal ? ('explanation' in template ? String(template.explanation) : '') : MODES[info.mode as keyof typeof MODES].tip);
  el('backing-description').textContent = custom ? 'Your progression follows the chord, duration, bass-note and scale-guide choices in the builder.' : modal && settings.progression ? `A ${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name} practice loop.` : !settings.progression ? 'One sustained chord. Explore how every note feels against it.' : jazz ? 'Classic jazz changes with fixed chord types. The scale guide follows each chord.' : settings.template === 'diatonic' ? 'Diatonic seventh chords, one bar each.' : settings.template.startsWith('fourths') ? `All 12 roots by perfect fourths, keeping the selected chord type. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord.` : `The same chord type on ${template.roman.join('–')}. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord. Mode notes follow each root.`;

  const colour = characteristicNotes(info);
  const highlight = input('highlight-mode').checked;
  el('characteristic-notes').hidden = !highlight;
  el('characteristic-notes').textContent = `${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name} colour notes: ${colour.map((n: any)=>`${n.name} (${n.degree})`).join(' · ')}. Listen to their character against the chord.`;
  el('characteristic-legend').hidden = !highlight;
  const arpeggio = select('exercise').value === 'arpeggio';
  const modeDegrees=MODES[info.mode as keyof typeof MODES].degrees;
  el('seventh-chords-context').textContent=`${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name}`;
  el('note-list').classList.toggle('arpeggio-view',arpeggio);
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
  el('exercise-description').textContent=arpeggio?'Play the highlighted scale notes as the current arpeggio. Other scale notes are dimmed; the outlined chord marks the current root.':'Filled note boxes belong to the current chord; dashed rings mark modal colour notes. Each seventh chord stacks alternate notes of this mode; the outlined chord marks the current root.';

  const extensions=extensionChoices(info);
  el('extension-status').textContent=extensions.length?`Scale colours: ${extensions.map(choice=>choice.label).join(' · ')} · ${settings.extensionBars}-bar blend cycle`:'This scale has no additional extensions for the selected chord.';
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
  const count=completedCount(completed),percent=Math.round(count/PRACTICE_TASKS.length*100),duration=Number(select('practice-roadmap-duration').value),today=practicePlan(completed,duration);
  const mode=MODES[info.mode as keyof typeof MODES];
  el('practice-roadmap-context').textContent=`${context.root} ${mode.name} · ${context.chord} · ${'family' in mode?mode.family:'Major scale'}`;
  el('practice-roadmap-percent').textContent=`${percent}%`;
  el('practice-roadmap-count').textContent=`${count} of ${PRACTICE_TASKS.length} complete`;
  (el('practice-roadmap-fill') as HTMLElement).style.width=`${percent}%`;
  el('practice-roadmap-today').innerHTML=today.tasks.length?`<strong>Next ${duration}-minute session · ${today.minutes} min planned</strong><span>${today.tasks.map(task=>escapeHtml(task.label)).join(' · ')}</span>`:'<strong>Path complete</strong><span>Revisit weak areas or apply the mode over a new progression.</span>';
  const stages=[...new Set(PRACTICE_TASKS.map(task=>task.stage))];
  el('practice-roadmap-list').innerHTML=stages.map(stage=>`<fieldset><legend>${stage}</legend>${PRACTICE_TASKS.filter(task=>task.stage===stage).map(task=>`<label class="practice-roadmap-task${done.has(task.id)?' complete':''}"><input type="checkbox" data-practice-task="${task.id}" ${done.has(task.id)?'checked':''}><span>${escapeHtml(task.label)}</span><small>${task.minutes} min</small></label>`).join('')}</fieldset>`).join('');
  const root=context.root;
  el('practice-mode-library').innerHTML=Object.entries(MODES).map(([id,item]:any)=>{
    const value=modeProgress(practiceProgress,root,id),modePercent=Math.round(value/PRACTICE_TASKS.length*100);
    return `<div class="practice-mode-status${id===info.mode?' current':''}"><span>${escapeHtml(item.name)}</span><i><b style="width:${modePercent}%"></b></i><strong>${modePercent}%</strong></div>`;
  }).join('');
  applyStudioIcons(document.querySelector('.practice-roadmap')!);
}

function renderScaleExplorer(){
  const root=names[Number(select('scale-explorer-root').value)],chordId=select('scale-explorer-chord').value,chord=CHORDS[chordId as keyof typeof CHORDS];
  const choices=scaleChoicesForChord(chordId);
  el('scale-explorer-results').innerHTML=choices.length?choices.map((choice:any)=>`<article class="scale-choice ${choice.strict?'strict':'contextual'}"><div><span>${choice.category}</span><h4>${escapeHtml(root)} ${escapeHtml(choice.name)}</h4><small>${escapeHtml(choice.family)} · over ${escapeHtml(root)}${escapeHtml(chord.symbol)}</small></div><p>${escapeHtml(choice.explanation)}</p><button type="button" class="practice-button" data-scale-choice="${choice.id}" data-scale-chord="${choice.targetChord}">${choice.strict?'Use this mode':'Use as altered dominant'}</button></article>`).join(''):'<p class="practice-help">No mode in the current library contains every written chord tone.</p>';
}

function renderGuitar(skipExercise:any=false,positionOverride:any=null) {
  skipExercise=skipExercise===true;
  if(!skipExercise&&(exercisePlaying||exercisePreparing))stopExercisePreview();
  if (previewGripShape) stopPreview();
  positionGrips.clear();
  const showGrip = input('show-grip').checked;
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
  el('position-path-guide').querySelector('p')!.textContent=following?'Automatic CAGED route · choose a region':'Choose a chord card, then its position · other chords stay unchanged';
  select('guitar-chord-position').parentElement!.hidden=!settings.progression||following;
  el('guitar-title').closest('section')!.classList.add('has-featured');
  el('grip-legend').hidden = !showGrip;
  const info = chordInfo(step);
  const chord = `${info.name}${info.suffix}`;
  const mode = MODES[info.mode as keyof typeof MODES];
  const suggestions = theoryOptions(info) as {pentatonics:TheorySuggestion[];triadPairs:TheorySuggestion[]};
  const theoryOptionsForView = theoryView.kind === 'triads' ? suggestions.triadPairs : suggestions.pentatonics;
  const selectedTheory = theoryView.kind === 'none' ? null : theoryOptionsForView.find(option=>option.id===theoryView.choiceId) || theoryOptionsForView[0];
  theoryView.choiceId = selectedTheory?.id || '';
  select('theory-view').value=theoryView.kind;
  select('theory-choice').replaceChildren(...(selectedTheory?theoryOptionsForView.map(option=>new Option(option.name,option.id,option.id===selectedTheory.id,option.id===selectedTheory.id)):[new Option('None','')]));
  el('theory-choice-label').hidden=!selectedTheory;
  el('theory-description').innerHTML = !selectedTheory ? '' : `<div class="theory-description"><h5>${escapeHtml(selectedTheory.name)}</h5><p class="theory-tones">${selectedTheory.names.map((name,i)=>`${escapeHtml(name)} (${escapeHtml(selectedTheory.degrees[i])})`).join(' · ')}</p>${selectedTheory.groups?`<div class="theory-legend">${selectedTheory.groups.map((group,i)=>`<span class="theory-group-${i===0?'a':'b'}"><i>${i===0?'A':'B'}</i>${escapeHtml(group.name)} · ${group.names.map(escapeHtml).join(' – ')}</span>`).join('')}</div>`:'<div class="theory-legend"><span><i class="theory-pentatonic-key"></i>Coloured notes form the pentatonic.</span><span><i class="theory-pentatonic-root-key"></i>Plum ring marks its root; gold remains the modal root.</span></div>'}<p>${escapeHtml(overlayPurpose(selectedTheory,info))}</p><p class="theory-hint">${theoryView.kind==='triads'?'Alternate triad A and triad B as single-note lines. ':'Try short phrases from the coloured notes. '}Degrees are relative to ${escapeHtml(info.scaleNames[0])} ${escapeHtml(mode.name)}.${select('exercise').value==='arpeggio'?' Exploration shows the scale; switching off restores chord tones only.':''}</p></div>`;
  const displayedPositions=POSITIONS.map(position=>{
    const board=fretboardFor(info,position.shape,select('exercise').value==='arpeggio');
    return {...cagedPositionFor(board),geometryShape:position.shape,board};
  });
  const selectedNumeral = positionOverride?.numeral || (featured === 'all' ? overviewPosition : featured);
  const selectedPosition = displayedPositions.find(position=>position.numeral===selectedNumeral) || displayedPositions[0]!;
  overviewPosition = selectedPosition.numeral || 'I';
  select('guitar-chord-position').value=overviewPosition;
  const overlay = selectedTheory ? {kind:theoryView.kind as 'pentatonic'|'triads',name:selectedTheory.name,pcs:selectedTheory.pcs,...(selectedTheory.rootPc===undefined?{}:{rootPc:selectedTheory.rootPc}),...(selectedTheory.groups ? {groups:selectedTheory.groups} : {})} : null;
  el('position-overview').innerHTML = displayedPositions.map(position=>{
    const board=selectedTheory?fretboardFor(info,position.geometryShape):position.board;
    const title=`${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    const thumbnailDiagram=diagramSvg(board,guitarDegrees,mode.degrees,title,input('highlight-mode').checked,null,overlay)
      .replace('viewBox="0 0 480 218"','viewBox="36 8 408 180"');
    return `<button type="button" role="tab" class="position-thumbnail${position.numeral===selectedPosition.numeral?' current':''}" data-overview-position="${position.numeral}" aria-selected="${position.numeral===selectedPosition.numeral}" tabindex="${position.numeral===selectedPosition.numeral?'0':'-1'}"><span>Position ${position.numeral}</span><small>${position.shape} shape · ${board.start}–${board.end}</small>${thumbnailDiagram}</button>`;
  }).join('');
  el('position-indicator').textContent=`Position ${selectedPosition.numeral} of V · ${selectedPosition.shape} shape`;
  for(const id of ['position-previous','position-next']) (el(id) as HTMLButtonElement).disabled=following;
  el('guitar-diagrams').innerHTML = [selectedPosition].map(position => {
    const chordBoard = position.board;
    const board = selectedTheory ? fretboardFor(info,position.geometryShape) : chordBoard;
    const grip = showGrip ? recommendedGrip(info, chordBoard) : null;
    positionGrips.set(position.geometryShape,grip);
    const gripDetails = !showGrip ? '' : grip ? `<div class="grip-details"><div class="grip-stage-buttons"><button class="practice-button" data-grip-display="grip" aria-pressed="${gripOnly}">Learn grip only</button><button class="practice-button" data-grip-display="scale" aria-pressed="${!gripOnly}">Connect to scale</button></div><p><b>Formula:</b> ${escapeHtml(info.intervals.join(' · '))}. <b>Bass:</b> ${escapeHtml(gripFacts(grip,info)!.bass)}</p><p class="grip-tones">Voiced low to high: ${grip.notes.map((n: any,i: number)=>`${n.name} (${grip.intervals[i]})`).join(' · ')}</p><p class="grip-help">${selectedTheory ? 'Strum chord previews the accompanying harmony. Explore the highlighted notes melodically.' : `${grip.omitted.length ? `Omitted: ${grip.omitted.join(' · ')}. ` : ''}Ringed notes form the suggested chord; mute × strings.`}</p><button type="button" class="practice-button grip-preview" data-grip="${position.geometryShape}" data-preview-label="position ${position.numeral}" aria-label="Strum chord, position ${position.numeral}" aria-pressed="false" ${playing ? 'disabled' : ''}>Strum chord</button><button type="button" class="practice-button" data-practise-grip="${position.numeral}" ${playing?'disabled':''}>Practise this shape →</button><p class="practice-help">This is a suggested compact voicing inside the ${position.shape} CAGED framework, not a complete six-string CAGED chord. No inferred finger numbers are taught.</p></div>` : '<p class="grip-help">No compact chord shape fits this position.</p>';
    const title = `${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    return `<article class="position-card featured-position" data-position="${position.numeral}" data-shape="${position.shape}" data-geometry="${position.geometryShape}"><div class="position-heading"><h4>Position ${position.numeral} · ${position.shape} shape</h4><span>Frets ${board.start}–${board.end}</span></div>${diagramSvg(gripOnly&&grip&&!overlay?{...board,notes:board.notes.filter(n=>grip.notes.some(g=>g.string===n.string&&g.fret===n.fret))}:board, guitarDegrees, mode.degrees, title, input('highlight-mode').checked, grip, overlay)}<p class="position-anchor">Parent-shape anchor: ${board.anchorName} · ${['low E','A','D','G','B','high E'][board.rootString]} string, ${board.rootFret === 0 ? 'open' : `fret ${board.rootFret}`}.</p>${gripDetails}</article>`;
  }).join('');
  const fullBoard=fullFretboardFor(info,1,17,selectedTheory?false:select('exercise').value==='arpeggio');
  const fullFretboardGrips=showGrip&&!selectedTheory?displayedPositions.map(position=>{
    const grip=recommendedGrip(info,position.board);
    return grip?{numeral:position.numeral!,notes:grip.notes}:null;
  }).filter(Boolean) as Array<{numeral:string,notes:Array<{string:number,fret:number}>}>:[];
  el('full-fretboard').innerHTML=fullFretboardSvg(fullBoard,guitarDegrees,mode.degrees,`${chord}, full fretboard, frets 1 to 17`,displayedPositions.map(position=>({numeral:position.numeral!,shape:position.shape!,start:position.board.start,end:position.board.end})),selectedPosition.numeral!,input('highlight-mode').checked,overlay,input('show-regions').checked,fullFretboardGrips);
  reflectFullFretboard();
  if(!skipExercise)renderCagedExercise(selectedPosition,fretboardFor(info,selectedPosition.geometryShape),info,settings.progression?progressionOrder(settings).map((index:number)=>path[index]):undefined);
  el('position-path').innerHTML=settings.progression?positionRouteCards(currentExerciseGroups,progressionOrder(settings),step,playing||exercisePlaying||exercisePreparing,true):'';
  const parentMajor = parentMajorFor(info);
  el('guitar-parent').hidden = !parentMajor;
  el('guitar-parent').textContent = parentMajor ? `Parent fingering: ${parentMajor.name} ${parentMajor.family.replace(' scale','').toLowerCase()} · current root: ${info.name}.` : '';
  el('guitar-context').textContent = chord;
  el('guitar-scale').textContent = `${info.scaleNames[0]} ${mode.name} · ${info.scaleNames.join(' · ')}`;
  renderPracticeRoadmap(info);
  select('fret-view').value = select('exercise').value;
  applyStudioIcons(document.querySelector('.guitar')!);
  applyStudioIcons(el('caged-exercise'));
}
function renderBeats(active = -1) {
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
const customUndo:any[]=[],customRedo:any[]=[];
function rememberCustomEdit(){customUndo.push({progression:structuredClone(customProgression),index:customStepIndex});if(customUndo.length>50)customUndo.shift();customRedo.length=0;}
async function restoreCustomEdit(undo:boolean){
 if(stopping)return;
 const source=undo?customUndo:customRedo,destination=undo?customRedo:customUndo;
 const previous=source.pop();if(!previous)return;
 el<HTMLButtonElement>('custom-undo').disabled=true;el<HTMLButtonElement>('custom-redo').disabled=true;
 stopPreview();stopExercisePreview();if(playing)await stop();
 destination.push({progression:structuredClone(customProgression),index:customStepIndex});
 customProgression=previous.progression;customStepIndex=previous.index;step=customStepIndex;
 saveCustomProgression(undo?'Progression edit undone.':'Progression edit redone.');fillLoopOptions(true);update();
}

function actualCustomName(offset:number,letter?:number){return customPitchName(Number(select('key').value),offset,letter);}
function saveCustomProgression(message='Custom progression saved in this browser.'){
  customProgression=normalizeCustomProgression(customProgression);
  settings.customProgression=customProgression;
  (PROGRESSIONS as any).custom=customProgression;
  try{localStorage.setItem(CUSTOM_PROGRESSION_KEY,JSON.stringify(customProgression));}
  catch{message='The progression is ready for this session, but browser storage is unavailable.';}
  el('custom-status').textContent=message;
}
function beatLength(total:number){const bars=Math.floor(total/settings.beats),remaining=total%settings.beats;return `${total} beats · ${bars} bar${bars===1?'':'s'}${remaining?` + ${remaining} beat${remaining===1?'':'s'}`:''}`;}
function durationLabel(index:number){const bars=progressionDurations(settings)[index];return settings.template==='custom'?`${progressionBeatDurations(settings)[index]} beats`:`${bars} bar${bars===1?'':'s'}`;}
function renderCustomBeatGrid(){
 const durations=progressionBeatDurations(settings),total=durations.reduce((a:number,b:number)=>a+b,0);
 const definition=progressionDefinition(settings);
 const chords=definition.roman.map((_:any,index:number)=>{const c=chordInfo(index);return c.name+c.suffix;});
 el<HTMLButtonElement>('chart-loop-clear').disabled=!settings.loopEnabled;
 el('chart-loop-status').textContent=settings.loopEnabled?(settings.loopUnit==='beats'?`Loop selected: beats ${settings.loopBeatStart+1}–${settings.loopBeatEnd+1} (included). Drag to change it, or clear the loop.`:`Loop selected: chords ${settings.loopStart+1}–${settings.loopEnd+1}. Drag to select exact beats.`):'Drag across beats to loop them. Click a chord to edit; hold to hear it. Selection includes both endpoint beats.';
 el('custom-beat-grid').innerHTML=chordSheet(chords,durations,settings.beats,{title:definition.name,key:names[settings.key],selected:settings.template==='custom'?customStepIndex:step,loopSteps:settings.loopEnabled&&settings.loopUnit!=='beats'?progressionOrder(settings):[],loopBeats:settings.loopEnabled&&settings.loopUnit==='beats'?progressionTimeline(settings).flatMap((segment:any)=>Array.from({length:segment.duration},(_,i)=>segment.start+i)):[]});
 el('custom-grid-help').textContent=`${beatLength(total)} in ${settings.beats}/4. ${total%settings.beats?'This cycle repeats immediately, so the next cycle starts partway through a bar.':'The cycle ends on a bar boundary.'} Beat durations stay fixed when the metre changes; bar durations follow the metre.${total>128?' First 128 beats shown.':''}`;
}
function highlightCustomBeat(beat:number){const target=progressionPositionAtBeat(settings,beat).chartBeat;document.querySelectorAll<HTMLElement>('[data-grid-beat]').forEach(cell=>{const active=Number(cell.dataset.gridBeat)===target;cell.classList.toggle('playing',active);if(active)cell.setAttribute('aria-current','true');else cell.removeAttribute('aria-current');});}
type ChartDrag={pointer:number;start:number;end:number;x:number;y:number;moved:boolean};
let chartDrag:ChartDrag|null=null,chartSuppressClickUntil=0;
function paintChartLoop(start:number,end:number){document.querySelectorAll<HTMLElement>('#custom-beat-grid [data-grid-step]').forEach(cell=>{const index=Number(cell.dataset.gridBeat);cell.classList.toggle('loop-selected',index>=Math.min(start,end)&&index<=Math.max(start,end));cell.classList.remove('loop-outside');});}
async function applyChartLoop(start:number,end:number){
 stopPreview();stopExercisePreview();const resume=playing;if(playing)await stop();
 select('loop-unit').value='beats';input('loop-beat-start').value=String(Math.min(start,end)+1);input('loop-beat-end').value=String(Math.max(start,end)+1);input('loop-enabled').checked=true;update();
 el('chart-loop-status').textContent=`Loop selected: beats ${Math.min(start,end)+1}–${Math.max(start,end)+1} (included). ${resume?'':'Press Play to hear the loop.'}`;
 if(resume)await toggle();
}
el('custom-beat-grid').addEventListener('pointerdown',event=>{const button=(event.target as Element).closest<HTMLElement>('[data-grid-step]');if(!button||event.button!==0||!event.isPrimary||event.pointerType==='touch')return;chartDrag={pointer:event.pointerId,start:Number(button.dataset.gridBeat),end:Number(button.dataset.gridBeat),x:event.clientX,y:event.clientY,moved:false};});
window.addEventListener('pointermove',event=>{
 if(!chartDrag||chartDrag.pointer!==event.pointerId)return;
 if(!chartDrag.moved&&Math.hypot(event.clientX-chartDrag.x,event.clientY-chartDrag.y)<6)return;
 chartDrag.moved=true;stopPreview();const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('#custom-beat-grid [data-grid-step]');if(cell)chartDrag.end=Number(cell.dataset.gridBeat);paintChartLoop(chartDrag.start,chartDrag.end);event.preventDefault();
});
window.addEventListener('pointerup',event=>{if(!chartDrag||chartDrag.pointer!==event.pointerId)return;const drag=chartDrag;chartDrag=null;if(!drag.moved)return;chartSuppressClickUntil=performance.now()+350;void applyChartLoop(drag.start,drag.end);});
function cancelChartDrag(){if(!chartDrag)return;const moved=chartDrag.moved;chartDrag=null;stopPreview();if(moved){chartSuppressClickUntil=performance.now()+350;renderCustomBeatGrid();}}
window.addEventListener('pointercancel',cancelChartDrag);window.addEventListener('blur',cancelChartDrag);
window.addEventListener('keydown',event=>{if(event.key==='Escape')cancelChartDrag();});
el('custom-beat-grid').addEventListener('click',event=>{if(event.detail&&performance.now()<chartSuppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
el('chart-loop-clear').addEventListener('click',()=>{input('loop-enabled').checked=false;update();el('chart-loop-status').textContent='Loop cleared. Playback uses the full progression.';});
el('custom-beat-grid').addEventListener('click',async event=>{const button=(event.target as Element).closest<HTMLElement>('[data-grid-step]');if(button){if(stopping)return;const beat=button.dataset.gridBeat,chosen=Number(button.dataset.gridStep);stopPreview();stopExercisePreview();if(playing)await stop();if(settings.template!=='custom')el('customize-progression').click();customStepIndex=chosen;if(!playing)step=customStepIndex;renderCustomBuilder();renderMusic();document.querySelector<HTMLElement>(`[data-grid-beat="${beat}"]`)?.focus({preventScroll:true});}});
function renderCustomBuilder(){
  const active=settings.progression&&settings.template==='custom';
  el('custom-progression-builder').hidden=!settings.progression;
  el('customize-progression').hidden=!settings.progression||active;
  el('custom-timeline').hidden=true;
  el('custom-progression-builder').querySelector<HTMLElement>('.custom-editor')!.hidden=!active;
  el('custom-progression-builder').querySelector<HTMLElement>('.custom-actions')!.hidden=!active;
  el('custom-progression-builder').querySelector<HTMLElement>('.custom-history-actions')!.hidden=!active;
  el('custom-status').hidden=!active;el('custom-progression-builder').querySelector<HTMLElement>('.custom-share')!.hidden=!active;
  if(!active){if(settings.progression){el('custom-progression-title').textContent=progressionDefinition(settings).name;renderCustomBeatGrid();el('custom-grid-help').textContent+=' Select any chord to edit a personal copy; the original template stays available.';}return;}
  customStepIndex=Math.max(0,Math.min(customProgression.steps.length-1,customStepIndex));
  el<HTMLButtonElement>('custom-undo').disabled=!customUndo.length;el<HTMLButtonElement>('custom-redo').disabled=!customRedo.length;
  const current=customProgression.steps[customStepIndex];
  el('custom-progression-title').textContent=customProgression.name;
  for(const id of ['custom-root','custom-bass']){
    const control=select(id);
    Array.from(control.options).forEach(option=>{
      if(option.value==='')return;
      const offset=Number(option.value),letter=id==='custom-bass'?(offset===current.bass?current.bassLetter:undefined):(offset===current.root?current.letter:undefined),roman=romanForStep({root:offset,letter,chord:'major'});
      option.textContent=id==='custom-bass'?`${actualCustomName(offset,letter)} (${roman}) pedal / slash bass`:`${actualCustomName(offset,letter)} · ${roman}`;
    });
  }
  el('custom-timeline').innerHTML=customProgression.steps.map((item:any,index:number)=>{
    const chord=CHORDS[item.chord as keyof typeof CHORDS];
    const bass=item.bass===null?'':`/${actualCustomName(item.bass,item.bassLetter)}`;
    return `<button type="button" role="tab" draggable="true" data-custom-step="${index}" aria-selected="${index===customStepIndex}" class="${index===customStepIndex?'current':''}"><span>${index+1}</span><strong>${actualCustomName(item.root,item.letter)}${chord.symbol}${bass}</strong><small>${customProgression.roman[index]} · ${item.beats!==undefined?item.beats+' beat'+(item.beats===1?'':'s'):item.bars+' bar'+(item.bars===1?'':'s')}</small></button>`;
  }).join('');
  select('custom-root').value=String(current.root);
  select('custom-chord').value=current.chord;
  select('custom-mode').value=current.mode;
  select('custom-bars').value=String(current.bars||1);
  select('custom-duration-unit').value=current.beats!==undefined?'beats':'bars';
  select('custom-beats').value=String(current.beats??Math.min(32,(current.bars||1)*settings.beats));
  el('custom-bars-label').hidden=current.beats!==undefined;el('custom-beats-label').hidden=current.beats===undefined;
  renderCustomBeatGrid();
  select('custom-bass').value=current.bass===null?'':String(current.bass);
  input('custom-text').value=progressionText(customProgression,(id:string)=>CHORDS[id as keyof typeof CHORDS]?.symbol||id);
  el<HTMLButtonElement>('custom-delete').disabled=customProgression.steps.length===1;
  el<HTMLButtonElement>('custom-left').disabled=customStepIndex===0;
  el<HTMLButtonElement>('custom-right').disabled=customStepIndex===customProgression.steps.length-1;
}
function commitCustomEdit(autoMode=false){
  rememberCustomEdit();
  const item=customProgression.steps[customStepIndex];
  const nextRoot=Number(select('custom-root').value);if(item.root!==nextRoot)delete item.letter;item.root=nextRoot;
  item.chord=select('custom-chord').value;
  if(autoMode)select('custom-mode').value=recommendedMode(item.chord);
  item.mode=select('custom-mode').value;
  if(select('custom-duration-unit').value==='beats'){item.beats=Number(select('custom-beats').value);delete item.bars;}else{item.bars=Number(select('custom-bars').value);delete item.beats;}
  const nextBass=select('custom-bass').value===''?null:Number(select('custom-bass').value);if(item.bass!==nextBass)delete item.bassLetter;item.bass=nextBass;
  saveCustomProgression();fillLoopOptions(true);step=Math.min(step,customProgression.steps.length-1);update();
}
function updateSpace() {
  el('space-value').textContent = `${input('space').value}%`;
  syncConsole();
  if (wet && context) wet.gain.setTargetAtTime((input('mute-space').checked?0:Number(input('space').value) / 100 * .65), context.currentTime, .08);
}
function update() {
  if (previewGripShape) stopPreview();
  const previousLoop = [settings.loopEnabled,settings.loopStart,settings.loopEnd,settings.loopUnit,settings.loopBeatStart,settings.loopBeatEnd].join('|');
  const previous = [settings.key, settings.mode, settings.chord, settings.template].join('|');
  settings.beats = Number(select('beats').value);
  settings.key = Number(select('key').value);
  settings.mode = select('quality').value;
  settings.minor = settings.mode === 'minor';
  settings.chord = select('chord').value;
  settings.sound = select('sound').value;
  settings.padMovement = select('pad-movement').value;
  settings.extensionMorph=input('extension-morph').checked;
  settings.extensionBars=Number(select('extension-bars').value);
  el('extension-controls').hidden=!settings.extensionMorph;
  el('extension-status').hidden=!settings.extensionMorph;
  settings.padDepth = select('pad-depth').value;
  settings.padDepthMotion = select('pad-depth-motion').value;
  settings.padDepthAmount = Number(input('pad-depth-amount').value)/100;
  el('pad-depth-amount-value').textContent=`${input('pad-depth-amount').value}%`;
  settings.padBrightness = select('pad-brightness').value;
  settings.drums=input('drums').checked;
  settings.bass=input('bass').checked;
  settings.comping=input('comping').checked;
  settings.drumGroove=select('drum-groove').value;
  settings.bassPattern=select('bass-pattern').value;
  settings.compingPattern=select('comping-pattern').value;
  settings.compingTone=select('comping-tone').value;
  settings.compingMovement=select('comping-movement').value;
  settings.compingHookLength=Number(select('comping-hook-length').value);
  settings.compingMovementAmount=Number(input('comping-movement-amount').value)/100;
  settings.drumsVolume=Number(input('drums-volume').value)/100;
  settings.bassVolume=Number(input('bass-volume').value)/100;
  settings.compingVolume=Number(input('comping-volume').value)/100;
  el('comping-movement-amount-value').textContent=`${input('comping-movement-amount').value}%`;
  for(const name of ['drums','bass','comping']) {
    el(`${name}-controls`).hidden=false;
    el(`${name}-volume-value`).textContent=`${input(`${name}-volume`).value}%`;
  }
  settings.sequence = input('sequence').checked;
  settings.sequenceRole = select('sequence-role').value;
  settings.sequencePhraseBars = Number(select('sequence-phrase').value);
  settings.sequenceDevelopment = select('sequence-development').value;
  settings.sequenceInteraction = select('sequence-interaction').value;
  settings.sequenceSource = select('sequence-source').value;
  settings.sequenceRegister = Number(select('sequence-register').value);
  settings.sequencePattern = select('sequence-pattern').value;
  const library=settings.sequenceRole==='pattern';
  el('sequence-pattern-library').hidden=!library;
  const sourceHelp=settings.sequenceSource==='chord' ? 'Follows the current chord, including its extensions.' : SEQUENCE_SOURCES[settings.sequenceSource as keyof typeof SEQUENCE_SOURCES].help;
  el('sequence-help').textContent = library?`${SEQUENCE_PATTERNS[settings.sequencePattern as keyof typeof SEQUENCE_PATTERNS].help} ${sourceHelp}`:`${SEQUENCE_ROLES[settings.sequenceRole as keyof typeof SEQUENCE_ROLES].help} The motif develops across ${settings.sequencePhraseBars} bars.`;
  settings.sequenceRate = Number(select('sequence-rate').value);
  settings.sequenceSwing = Number(input('sequence-swing').value)/100;
  settings.sequenceDensity = Number(input('sequence-density').value)/100;
  settings.sequenceVolume = Number(input('sequence-volume').value)/100;
  el('sequence-controls').hidden = false;
  input('sequence-swing').disabled = settings.sequenceRate===3;
  for(const name of ['density','swing','volume']) el(`sequence-${name}-value`).textContent = `${input(`sequence-${name}`).value}%`;
  if(settings.sequenceRate===3) el('sequence-swing-value').textContent='Straight triplets';
  const newTemplate = settings.template !== select('template').value;
  fillLoopOptions(newTemplate || !select('loop-start').options.length);
  settings.template = select('template').value;
  settings.customProgression=customProgression;
  if (newTemplate){input('loop-enabled').checked=false;select('loop-unit').value='chords';}
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
  const custom = settings.progression && selectedTemplate.kind === 'custom';
  select('quality').parentElement!.hidden = jazz || custom;
  select('chord').parentElement!.hidden = jazz || diatonic || modal || custom;
  el('mode-tip').hidden = jazz || custom;
  select('chord').disabled = jazz || diatonic || modal || custom;
  el('root-label').textContent = jazz || custom ? 'Tonic key' : settings.progression ? 'Starting root' : 'Root note';
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
  node?.port.postMessage({ type: 'settings', settings });
  syncMixerDetails();
  updateSpace();
  renderMusic();
  if (!playing) renderBeats();
}
function tempo(value: number) {
  settings.bpm = Math.max(30, Math.min(240, Math.round(value) || 90));
  input('tempo').style.setProperty('--tempo-fill',`${(settings.bpm-30)/210*100}%`);
  currentBpm = settings.bpm;
  input('bpm').value = input('tempo').value = String(settings.bpm);
  syncMiniTransport();
  syncTrainerStatus();
  node?.port.postMessage({ type: 'settings', settings });
}
function reflectPlayback() {
  document.querySelectorAll<HTMLButtonElement>('#guitar-diagrams button').forEach(button => { button.disabled = playing; });
  el('progression-strip').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing; });
  el('position-path').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing||exercisePlaying||exercisePreparing; });
  const exercisePreview=document.querySelector<HTMLButtonElement>('#exercise-preview');
  if(exercisePreview)exercisePreview.disabled=playing||!currentExercise.length;
  el('play-label').textContent = playing ? 'Stop practicing' : 'Start practicing';
  el('play-icon').textContent = playing ? '■' : '▶';
  el('play').setAttribute('aria-pressed', String(playing));
  el('pulse-large-play').textContent=playing?'Stop practicing':'Start practicing';
  el('pulse-large-play').setAttribute('aria-pressed',String(playing));
  if(!playing){el('pulse-large-status').textContent='Ready to practice';el('pulse-poly-beats').querySelectorAll('.active').forEach(beat=>beat.classList.remove('active'));}
  el('live-dot').classList.toggle('on', playing);
  select('beats').disabled = input('count-in').disabled = playing;
  if (!playing) { renderBeats(); el('play-status').textContent = 'Take a breath. Start again when you’re ready.'; }
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
  playing = false;
  reflectPlayback();
  await new Promise(resolve => setTimeout(resolve, 250));
  await context?.suspend();
  stopping = false;
  reflectPresetButtons();
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
async function prepareAudio(){
  audioPreparation??=initialiseAudio().finally(()=>{audioPreparation=undefined;});
  return audioPreparation;
}
async function initialiseAudio() {
  if (!window.isSecureContext || !window.AudioWorkletNode) throw new Error('Audio needs a secure HTTPS page and a current Safari, Chrome, or Firefox browser.');
  if (!context || context.state === 'closed') {
    context = new AudioContext({ latencyHint: 'balanced', sampleRate: 48000 });
    reverb = undefined;
    await context.audioWorklet.addModule(workletUrl);
    let kit: Record<string, Float32Array>;
    try { kit = await loadDrumKit(context); }
    catch (error) { await context.close(); throw error; }
    node = new AudioWorkletNode(context, 'mehtronome', { numberOfInputs: 0, numberOfOutputs: 4, outputChannelCount: [2, 2, 2, 1] });
    node.port.postMessage({type:'drum-kit', kit}, Object.values(kit).map(pcm => pcm.buffer));
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    node.connect(master, 0); // Click stays dry and rhythmically clear.
    node.connect(master, 1);
    node.connect(master, 2); // Drums and bass bypass pad reverb and echoes.
    const room = roomImpulse(context.sampleRate);
    impulse = context.createBuffer(2, room[0].length, context.sampleRate);
    room.forEach((samples,channel)=>impulse!.getChannelData(channel).set(samples));
    wet = context.createGain();
    wet.gain.value = (input('mute-space').checked?0:Number(input('space').value) / 100 * .65);
    reverbGate = context.createGain();
    reverbGate.gain.value = 0;
    node.connect(reverbGate.gain,3);
    wet.connect(reverbGate).connect(master);
    const meterSplit=context.createChannelSplitter(2);reverbGate.connect(meterSplit);
    ambientMeters=[context.createAnalyser(),context.createAnalyser()];
    ambientMeters.forEach((meter,index)=>{meter.fftSize=256;meterSplit.connect(meter,index);});
    node.port.onmessage = ({ data }) => {
      if(data.type==='meters'){receiveConsoleMeters(data.peaks);return;}
      if(!playing&&exercisePlaying&&data.type==='session-complete'){stopExercisePreview();return;}
      if(!playing&&exercisePlaying&&exerciseView.backing&&typeof data.step==='number'){exerciseBackingStep=data.step;renderProgressionReference(data.step);syncMiniTransport();}
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
      if (data.type === 'harmony') { step = data.step; renderMusic(); return; }
      if (typeof data.bpm === 'number') currentBpm = data.bpm;
      syncMiniTransport();
      syncTrainerStatus();
      if(settings.extensionMorph&&Array.isArray(data.extensions))el('extension-status').textContent=`Blending: ${data.extensions.length?data.extensions.join(' · '):'passing between colours'} · ${settings.extensionBars}-bar cycle`;
      el('mini-beat').textContent = `${data.beat + 1} / ${settings.beats}`;
      renderBeats(data.beat);
      el('play-status').textContent = data.counting ? `Count-in · ${data.beat + 1} of ${settings.beats}` : `${data.gap ? 'Gap' : 'Playing'} · Bar ${data.bar} · Beat ${data.beat + 1}`;
      el('pulse-large-status').textContent=el('play-status').textContent;
      if (step !== data.step) { step = data.step; renderMusic(); }
      if(settings.progression&&!data.counting)highlightCustomBeat((data.bar-1)*settings.beats+data.beat);
    };
    node.onprocessorerror = () => {
      stopPreview();
      playing = false;
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
  // A new convolver discards the previous session's frozen reverb tail.
  if (reverb) { node!.disconnect(reverb, 1); reverb.disconnect(); }
  reverb = context.createConvolver();
  reverb.buffer = impulse!;
  node!.connect(reverb, 1);
  reverb.connect(wet!);
  master!.gain.setTargetAtTime(1, context.currentTime, .04);
}
async function previewChord(index: number, hold: string) {
  if (playing || exercisePlaying || busy || stopping) return;
  stopPreview();
  const generation = previewGeneration;
  previewHold = hold;
  step = index;
  renderMusic();
  el('error').hidden = true;
  try {
    previewPreparation ??= prepareAudio().finally(() => { previewPreparation = undefined; });
    await previewPreparation;
    if (generation !== previewGeneration || document.hidden) {
      if (!previewHold || document.hidden) stopPreview();
      return;
    }
    previewing = true;
    node!.port.postMessage({type: 'audition', settings, step});
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
  if (playing || busy || stopping) return;
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
      // Finish fading the previous waveform before resetting strings/reverb.
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
    node!.port.postMessage({type:'audition',settings,step,acoustic:true,notes:grip.notes.map((note: any)=>note.midi)});
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
const fullFretboardPanel = el('full-fretboard-panel');
const positionNumerals=['I','II','III','IV','V'];
function chooseOverviewPosition(numeral:string, focus=false) {
  if(!positionNumerals.includes(numeral))return;
  if(playing||exercisePlaying||exercisePreparing)return;
  overviewPosition=numeral;
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
  if(settings.progression&&select('featured-position').value==='path')return;
  const index=positionNumerals.indexOf(overviewPosition);
  chooseOverviewPosition(positionNumerals[(index+direction+positionNumerals.length)%positionNumerals.length]!,true);
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
select('practice-roadmap-duration').addEventListener('input',()=>renderPracticeRoadmap(chordInfo(step)));
el('practice-roadmap-reset').addEventListener('click',()=>{
  const info=chordInfo(step),key=curriculumKey(practiceContext(info));
  delete practiceProgress[key];savePracticeProgress();renderPracticeRoadmap(info);
});
for(const id of ['scale-explorer-root','scale-explorer-chord'])select(id).addEventListener('input',renderScaleExplorer);
el('scale-explorer-results').addEventListener('click',event=>{
  const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('[data-scale-choice]'):null;
  if(!button)return;
  stopPreview();settings.progression=false;step=0;
  select('key').value=select('scale-explorer-root').value;
  select('quality').value=button.dataset.scaleChoice||'major';
  for(const id of ['pedal','progression']){const selected=id==='pedal';el(id).classList.toggle('selected',selected);el(id).setAttribute('aria-pressed',String(selected));}
  fillChords();
  const target=button.dataset.scaleChord||'';
  if(Array.from(select('chord').options).some(option=>option.value===target))select('chord').value=target;
  update();
});
function selectFullFretboardRegion(target:EventTarget|null){
  const region=target instanceof Element?target.closest<SVGGElement>('[data-full-position]'):null;
  if(region)chooseOverviewPosition(region.dataset.fullPosition||'I');
}
el('full-fretboard').addEventListener('click',event=>selectFullFretboardRegion(event.target));
el('full-fretboard').addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const region=event.target instanceof Element?event.target.closest('[data-full-position]'):null;
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
el('caged-exercise').addEventListener('exercise-inspect-chord',event=>{
 if(playing||exercisePlaying||exercisePreparing)return;
 const chosen=Number((event as CustomEvent).detail?.slot);if(!Number.isInteger(chosen))return;
 const group=currentExerciseGroups[chosen];if(!group?.harmony)return;
 stopExercisePreview();step=progressionOrder(settings)[chosen];renderMusic(true,group.position);exerciseMapSlot=chosen;updateProgressionMap(el('caged-exercise'),group,exerciseView.study);
});
function handleExerciseControl(event:Event){
  const target=event.target;
  if(!(target instanceof HTMLInputElement||target instanceof HTMLSelectElement))return;
  if(target.id==='fret-recall-tone')return;
  const deferredNumber=target instanceof HTMLInputElement&&target.type==='number'&&['exercise-tempo','exercise-auto-increment','exercise-auto-target'].includes(target.id);
  // Rebuilding the panel on each keystroke dismisses mobile number keyboards and
  // makes multi-digit values effectively impossible to enter. Commit those fields
  // when the edit is complete; all other controls remain immediate.
  if(event.type==='input'&&deferredNumber)return;
  if(event.type==='change'&&!deferredNumber)return;
  if(target.id==='exercise-favourites'&&target.value!==''){restoreExercise(exerciseFavourites()[Number(target.value)]);return;}
  if(target.id==='exercise-position-navigation'){stopExercisePreview();select('featured-position').value=target.value;renderMusic();return;}
  if(target.id==='exercise-position-region'){stopExercisePreview();select('position-region').value=target.value;renderMusic();return;}
  if(target.id==='exercise-position'){const numeral=target.value;stopExercisePreview();chooseOverviewPosition(numeral);el('exercise-position').focus({preventScroll:true});return;}
  exerciseView.setupOpen=el('caged-exercise').querySelector<HTMLDetailsElement>('.exercise-setup')?.open||false;
  stopExercisePreview();
  if(target.id==='exercise-application')exerciseView.application=target.value;
  if(target.id==='exercise-response')exerciseView.response=target.value;
  if(target.id==='exercise-stage'){exerciseView.stage=target.value;exerciseSelectionStart=null;exerciseSelectionEnd=null;}
  if(target.id==='exercise-auto-target')exerciseView.ceiling=Math.max(30,Math.min(240,Number(target.value)||160));
  if(['exercise-material','exercise-study','exercise-motion','exercise-source','exercise-pattern'].includes(target.id)){exerciseSelectionStart=null;exerciseSelectionEnd=null;}
  if(target.id==='exercise-material')exerciseView.material=target.value;
  if(target.id==='exercise-study'){exerciseView.study=target.value;if(['alternating','chordtonesalternating'].includes(target.value)&&['up-down','down-up'].includes(exerciseView.motion))exerciseView.motion='ascending';}
  if(target.id==='exercise-motion')exerciseView.motion=target.value;
  if(target.id==='exercise-rhythm')exerciseView.rhythm=target.value;
  if(target.id==='exercise-source')exerciseView.source=target.value;
  if(target.id==='exercise-pattern')exerciseView.pattern=target.value;
  if(target.id==='exercise-display'){exerciseView.display=target.value;localStorage.setItem('mehtronome-notation-display',target.value);}
  if(target.id==='exercise-zoom'){exerciseView.zoom=target.value;localStorage.setItem('mehtronome-notation-zoom',target.value);}
  if(target.id==='exercise-tempo'){exerciseView.tempoLinked=false;exerciseView.tempo=Math.max(30,Math.min(240,Number(target.value)||settings.bpm));}
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
  if(playing||exercisePlaying||exercisePreparing||!currentExercise[index])return;const note={...currentExercise[index]},generation=++noteAuditionGeneration;await prepareAudio();if(generation!==noteAuditionGeneration||playing||exercisePlaying||exercisePreparing)return;const duration=.9,samples=renderJazzGuitarNote(context!.sampleRate,note.midi,duration),buffer=context!.createBuffer(1,samples.length,context!.sampleRate);buffer.copyToChannel(samples,0);const source=context!.createBufferSource(),gain=context!.createGain();source.buffer=buffer;gain.gain.value=.26;source.connect(gain).connect(master!);if(reverb)gain.connect(reverb);source.start();source.stop(context!.currentTime+duration);
}
function chooseOrAuditionExerciseNote(index:number){if(playing||exercisePlaying)return;
 const group=currentExerciseGroups.find((g:any)=>index>=g.globalStart&&index<g.globalStart+g.notes.length);
 if(group?.harmony){exerciseMapSlot=group.slot;updateProgressionMap(el('caged-exercise'),group,exerciseView.study);}
 highlightLearningNote(index,currentExercise,true);void auditionExerciseNote(index);
}
function exerciseSnapshot(){return {study:exerciseView.study,material:exerciseView.material,motion:exerciseView.motion,rhythm:exerciseView.rhythm,source:exerciseView.source,pattern:exerciseView.pattern,display:exerciseView.display,zoom:exerciseView.zoom,stage:exerciseView.stage,tempo:exerciseView.tempo,tempoLinked:exerciseView.tempoLinked,application:exerciseView.application,response:exerciseView.response};}
function restoreExercise(snapshot:any){if(!snapshot)return;Object.assign(exerciseView,{stage:'full',application:'cell-space',response:'demo'},snapshot);stopExercisePreview();renderGuitar();}
function moveExercise(direction:number){
  const options=Array.from(select('exercise-study').options),index=options.findIndex(option=>option.value===exerciseView.study),next=options[index+direction];if(!next)return;
  stopExercisePreview();exerciseSelectionStart=null;exerciseSelectionEnd=null;exerciseView.study=next.value;
  if(['alternating','chordtonesalternating'].includes(next.value)&&['up-down','down-up'].includes(exerciseView.motion))exerciseView.motion='ascending';
  renderGuitar();select('exercise-study').focus({preventScroll:true});
}
function exerciseFavourites(){try{return JSON.parse(localStorage.getItem(EXERCISE_FAVOURITES_KEY)||'[]');}catch{return [];}}
function favouriteExercise(){const favourites=exerciseFavourites(),snapshot=exerciseSnapshot(),key=JSON.stringify(snapshot);if(!favourites.some((item:any)=>JSON.stringify(item)===key))favourites.push(snapshot);localStorage.setItem(EXERCISE_FAVOURITES_KEY,JSON.stringify(favourites.slice(-30)));const button=document.querySelector<HTMLButtonElement>('#exercise-favourite');if(button){button.textContent='Saved';applyStudioIcons(el('caged-exercise'));}}
function exportExerciseSvg(){
  const svgs=Array.from(document.querySelectorAll<SVGSVGElement>('#caged-exercise .exercise-notation'));if(!svgs.length)return;const width=1200,heights=svgs.map(svg=>Number(svg.viewBox.baseVal.height)||280),height=heights.reduce((a,b)=>a+b,0);let y=0;
  const body=svgs.map((svg,index)=>{const viewWidth=Number(svg.viewBox.baseVal.width)||760,result=`<svg x="0" y="${y}" width="${width}" height="${heights[index]}" viewBox="0 0 ${viewWidth} ${heights[index]}">${svg.innerHTML}</svg>`;y+=heights[index];return result;}).join('');
  const file=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>text{fill:#17201d}.notation-paper,.tab-fret-bg{fill:#fffdf8}.notation-line,.ledger-line,.bar-line,.note-stem{stroke:#26302c}.notation-chord-symbol{font-family:Georgia,serif;fill:#17201d}.score-chord-root{font-size:19px;font-weight:600}.score-chord-quality{font-size:13px;font-style:italic}.score-chord-bass{font-size:15px}.notation-backing{font:10px sans-serif}.note-accent{fill:#17201d;font:bold 18px Georgia,serif}.note-head{fill:#17201d}.note-hole{fill:#fffdf8}.note-flag,.note-tie{fill:none;stroke:#17201d;stroke-width:1.5}.duration-dot{fill:#17201d}.note-beam{stroke:#17201d;stroke-width:5}</style>${body}</svg>`,url=URL.createObjectURL(new Blob([file],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download=`mehtronome-${exerciseView.study}.svg`;link.click();URL.revokeObjectURL(url);
}
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
  if(!exerciseDragMoved){const index=exerciseSelectionStart;exerciseSelectionStart=null;exerciseSelectionEnd=null;reflectExerciseSelection();suppressExerciseNoteClick=true;setTimeout(()=>{suppressExerciseNoteClick=false;},0);if(index!==null)chooseOrAuditionExerciseNote(index);return;}
  suppressExerciseNoteClick=true;setTimeout(()=>{suppressExerciseNoteClick=false;},0);void toggleExercisePreview();
});
el('caged-exercise').addEventListener('pointercancel',event=>{
  if(exerciseDragPointer!==event.pointerId)return;
  exerciseDragPointer=null;exerciseSelectionStart=null;exerciseSelectionEnd=null;reflectExerciseSelection();
});
el('caged-exercise').addEventListener('click',event=>{
  if(event.target instanceof Element){exerciseView.setupOpen=el('caged-exercise').querySelector<HTMLDetailsElement>('.exercise-setup')?.open||false;const button=event.target.closest<HTMLElement>('[data-learning-study]');if(button){stopExercisePreview();exerciseView.study=button.dataset.learningStudy!;exerciseView.backing=true;exerciseSelectionStart=null;exerciseSelectionEnd=null;renderGuitar();return;}if(event.target.closest('#exercise-map-toggle')){exerciseView.fretboard=!exerciseView.fretboard;el('exercise-map-body').hidden=!exerciseView.fretboard;el('exercise-map-toggle').textContent=exerciseView.fretboard?'Hide fretboard':'Show fretboard';el('exercise-map-toggle').setAttribute('aria-expanded',String(exerciseView.fretboard));document.querySelector('.exercise-material-layout')!.classList.toggle('map-hidden',!exerciseView.fretboard);return;}if(event.target.closest('#exercise-recall')){exerciseView.recall=!exerciseView.recall;document.querySelector<HTMLElement>('.exercise-map-diagram')!.hidden=exerciseView.recall;el('exercise-recall-prompt').hidden=!exerciseView.recall;el('exercise-recall').textContent=exerciseView.recall?'Reveal diagram':'Try without diagram';el('exercise-recall').setAttribute('aria-pressed',String(exerciseView.recall));return;}const linked=event.target.closest<SVGElement>('[data-exercise-index]');if(linked){chooseOrAuditionExerciseNote(Number(linked.dataset.exerciseIndex));return;}}
  if(!(event.target instanceof Element))return;
  if(event.target.closest('#exercise-play-range')){void toggleExercisePreview();return;}
  if(event.target.closest('#exercise-clear-range')){if(exercisePlaying)stopExercisePreview();exerciseSelectionStart=null;exerciseSelectionEnd=null;reflectExerciseSelection();return;}
  if(event.target.closest('#exercise-preview'))void toggleExercisePreview();
  if(event.target.closest('#exercise-focus'))setNotationFocus(!el('caged-exercise').classList.contains('notation-focused'));
  const note=event.target.closest<SVGElement>('.exercise-note');if(note){if(suppressExerciseNoteClick)suppressExerciseNoteClick=false;else chooseOrAuditionExerciseNote(Number(note.dataset.noteIndex));}
  const ratio=event.target.closest<HTMLElement>('[data-tempo-ratio]');if(ratio){exerciseView.tempoLinked=ratio.dataset.tempoRatio==='1';exerciseView.tempo=Math.round(settings.bpm*Number(ratio.dataset.tempoRatio));renderGuitar();}
  if(event.target.closest('#exercise-history-back'))moveExercise(-1);
  if(event.target.closest('#exercise-history-forward'))moveExercise(1);
  if(event.target.closest('#exercise-favourite'))favouriteExercise();
  if(event.target.closest('#exercise-export'))exportExerciseSvg();
  if(event.target.closest('#exercise-print'))window.print();
});
el('caged-exercise').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof SVGElement&&event.target.hasAttribute('data-exercise-index')){event.preventDefault();chooseOrAuditionExerciseNote(Number(event.target.dataset.exerciseIndex));return;}if((event.key==='Enter'||event.key===' ')&&event.target instanceof SVGElement&&event.target.matches('.exercise-note')){event.preventDefault();chooseOrAuditionExerciseNote(Number(event.target.dataset.noteIndex));}});
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
for (const diagrams of [guitarDiagrams]) {
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
// Delegate on the stable document: selecting a chord redraws both reference panels.
const chordButton=(target:EventTarget|null)=>target instanceof HTMLElement?target.closest<HTMLButtonElement>('#progression-strip button[data-step], #custom-beat-grid button[data-grid-step], .progression-reference button[data-reference-step]'):null;
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
input('space').addEventListener('input', updateSpace);
async function toggle() {
  if (busy || stopping || previewPreparation) return;
  if (playing) { await stop(); return; }
  busy = true;
  reflectPresetButtons();
  el<HTMLButtonElement>('play').disabled = true;
  el('error').hidden = true;
  try {
    stopPreview();
    el('play-status').textContent='Preparing sounds…';
    await prepareAudio();
    currentBpm = settings.bpm;
    step = settings.progression ? progressionStep(settings,0) : 0;
    playing = true;
    el('pulse-time').textContent=settings.sessionSeconds?`${formatTime(settings.sessionSeconds)} remaining`:'0:00 elapsed';
    node!.port.postMessage({ type: 'start', settings });
    renderMusic();
    reflectPlayback();
    el('play-status').textContent = settings.countIn ? 'Counting you in…' : 'Playing…';
  } catch (error) {
    playing = false;
    reflectPlayback();
    el('error').textContent = error instanceof Error ? error.message : 'Could not start audio. Please try again.';
    el('error').hidden = false;
    el('play-status').textContent='Playback stopped. Try Start again.';
    await context?.close().catch(() => {});
    context = undefined;
    node = undefined;
  } finally { busy = false; el<HTMLButtonElement>('play').disabled = false; reflectPresetButtons(); }
}

select('fret-labels').addEventListener('input', () => { guitarDegrees = select('fret-labels').value === 'degrees'; renderGuitar(); });
select('fret-view').addEventListener('input', () => { select('exercise').value = select('fret-view').value; renderMusic(); });

const soloChannels=new Set<string>();
function mixerMuteMask(){return MIX_CHANNELS.filter(channel=>input('mute-'+channel.id).checked||(soloChannels.size>0&&channel.id!=='space'&&!soloChannels.has(channel.id))).map(channel=>channel.id).join(',');}
function reflectMixerChannels(){
  let mutedCount=0;
  for(const channel of MIX_CHANNELS){
    const muted=input('mute-'+channel.id).checked;
    const enabled=['drums','bass','comping','sequence'].includes(channel.id)?input(channel.id).checked:true;
    const card=document.querySelector<HTMLElement>(`[data-mix-channel="${channel.id}"]`)!;
    const solo=soloChannels.has(channel.id), excluded=soloChannels.size>0&&channel.id!=='space'&&!solo;
    card.classList.toggle('is-solo',solo);card.classList.toggle('is-excluded',excluded);
    card.querySelector('.channel-solo')?.setAttribute('aria-pressed',String(solo));
    card.classList.toggle('is-muted',muted);card.classList.toggle('is-inactive',!enabled);
    const button=card.querySelector<HTMLButtonElement>('.channel-mute')!;
    button.setAttribute('aria-pressed',String(muted));button.setAttribute('aria-label',`${muted?'Unmute':'Mute'} ${channel.label}`);
    button.textContent='M';button.title=`${muted?'Unmute':'Mute'} ${channel.label}`;
    el('mix-state-'+channel.id).textContent=!enabled?(muted?'Off · muted':'Off'):muted?'Muted':excluded?'Solo muted':solo?'Solo':'On';
    if(muted)mutedCount++;
  }
  syncConsole();
  el<HTMLButtonElement>('mixer-unmute-all').disabled=mutedCount===0;
  el<HTMLButtonElement>('mixer-clear-solos').disabled=soloChannels.size===0;
}
function sendMixerSettings(){
  node?.port.postMessage({type:'settings',settings:exercisePlaying?exerciseAudioSettings():settings});
}
function updateMixerLevels(){
  settings.click=Number(input('click').value)/100;
  settings.harmony=Number(input('harmony').value)/100;
  el('click-value').textContent=`${input('click').value}%`;
  el('harmony-value').textContent=`${input('harmony').value}%`;
  for(const id of ['drums','bass','comping','sequence'] as const){
    settings[id]=input(id).checked;
    settings[`${id}Volume`]=Number(input(`${id}-volume`).value)/100;
    el(`${id}-volume-value`).textContent=`${input(`${id}-volume`).value}%`;
  }
  sendMixerSettings();updateSpace();reflectMixerChannels();syncMixerDetails();
}
function applyMixerMutes(){
  settings.mutedChannels=mixerMuteMask();
  sendMixerSettings();updateSpace();reflectMixerChannels();
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
for (const id of ['extension-morph','extension-bars','pulse-sound','pulse-swing','pulse-minutes','pulse-finish-bar','pulse-poly','gap-progressive','gap-max','trainer-enabled','trainer-bars','trainer-increment','trainer-target','show-grip','highlight-mode','gap-enabled','gap-play','gap-mute','gap-target','loop-enabled','loop-start','loop-end','loop-unit','loop-beat-start','loop-beat-end','drums','bass','comping','drum-groove','bass-pattern','comping-pattern','comping-tone','comping-movement','comping-hook-length','comping-movement-amount','drums-volume','bass-volume','comping-volume','sequence','sequence-role','sequence-phrase','sequence-development','sequence-interaction','sequence-source','sequence-register','sequence-pattern','sequence-rate','sequence-density','sequence-swing','sequence-volume','key', 'sound','pad-movement','pad-depth','pad-depth-motion','pad-depth-amount','pad-brightness', 'chord', 'template', 'subdivision', 'accent', 'beats', 'count-in', 'exercise', 'click', 'harmony']) el(id).addEventListener('input',()=>{if(el('mix-sections').contains(el(id)))updateMixerLevels();else update();});
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
  select('chord').innerHTML = (settings.progression ? Object.keys(CHORDS) : compatibleChords(mode)).map(id => {
    const chord = CHORDS[id as keyof typeof CHORDS];
    return `<option value="${id}">${chord.name}${id === MODES[mode].chord ? ' · suggested' : ''}</option>`;
  }).join('');
  select('chord').value = preserve && Array.from(select('chord').options).some(option => option.value === previousChord) ? previousChord : MODES[mode].chord;
  el('mode-tip').textContent = MODES[mode].tip;
  el('mode-template').textContent = `Try ${MODES[mode].name} progression`;
  el('mode-template').hidden = settings.progression && select('template').value === `modal_${mode}`;
  select('template').querySelector<HTMLOptionElement>('[value=diatonic]')!.textContent=progressionDefinition({mode,template:'diatonic'}).name;
  const modal = mode !== 'major' && mode !== 'minor';
  select('template').querySelector<HTMLOptionElement>('[value=diatonic]')!.disabled = modal;
  if (modal && select('template').value === 'diatonic') select('template').value = 'parallel1';

}
el('mode-template').addEventListener('click',()=>{
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
el('customize-progression').addEventListener('click',()=>{
  stopPreview();
  rememberCustomEdit();
  customProgression=cloneTemplate(progressionDefinition(settings),settings.chord,settings.mode,settings);
  customProgression.name='My progression';customStepIndex=0;
  saveCustomProgression('Template copied. Edit any chord below; changes save automatically.');
  select('template').value='custom';settings.progression=true;input('loop-enabled').checked=false;step=0;
  fillChords(true);fillLoopOptions(true);update();
});
el('custom-timeline').addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-custom-step]');
  if(!button)return;customStepIndex=Number(button.dataset.customStep);if(!playing)step=customStepIndex;renderCustomBuilder();renderMusic();
});
let draggedCustomStep:number|null=null;
el('custom-timeline').addEventListener('dragstart',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-custom-step]');
  if(!button)return;draggedCustomStep=Number(button.dataset.customStep);event.dataTransfer?.setData('text/plain',String(draggedCustomStep));
});
el('custom-timeline').addEventListener('dragover',event=>event.preventDefault());
el('custom-timeline').addEventListener('drop',event=>{
  event.preventDefault();const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-custom-step]');
  if(!button||draggedCustomStep===null)return;const destination=Number(button.dataset.customStep);
  if(destination===draggedCustomStep)return;rememberCustomEdit();
  const [item]=customProgression.steps.splice(draggedCustomStep,1);customProgression.steps.splice(destination,0,item);customStepIndex=destination;draggedCustomStep=null;
  saveCustomProgression('Chord reordered.');fillLoopOptions(true);update();
});
for(const id of ['custom-root','custom-mode','custom-bars','custom-beats','custom-duration-unit','custom-bass'])el(id).addEventListener('input',()=>commitCustomEdit(false));
el('custom-chord').addEventListener('input',()=>commitCustomEdit(true));
el('custom-undo').addEventListener('click',()=>restoreCustomEdit(true));
el('custom-redo').addEventListener('click',()=>restoreCustomEdit(false));
el('custom-add').addEventListener('click',()=>{
  rememberCustomEdit();
  const previous=customProgression.steps.at(customStepIndex)||customProgression.steps.at(-1);
  customProgression.steps.splice(customStepIndex+1,0,{...previous,root:(previous.root+5)%12,bass:null,mode:recommendedMode(previous.chord)});
  customStepIndex++;saveCustomProgression('Chord added.');fillLoopOptions(true);update();
});
el('custom-duplicate').addEventListener('click',()=>{
  rememberCustomEdit();
  customProgression.steps.splice(customStepIndex+1,0,{...customProgression.steps[customStepIndex]});customStepIndex++;
  saveCustomProgression('Chord duplicated.');fillLoopOptions(true);update();
});
el('custom-delete').addEventListener('click',()=>{
  if(customProgression.steps.length===1)return;rememberCustomEdit();customProgression.steps.splice(customStepIndex,1);customStepIndex=Math.min(customStepIndex,customProgression.steps.length-1);
  saveCustomProgression('Chord removed.');fillLoopOptions(true);update();
});
for(const [id,direction]of [['custom-left',-1],['custom-right',1]] as const)el(id).addEventListener('click',()=>{
  const destination=customStepIndex+direction;if(destination<0||destination>=customProgression.steps.length)return;rememberCustomEdit();
  [customProgression.steps[customStepIndex],customProgression.steps[destination]]=[customProgression.steps[destination],customProgression.steps[customStepIndex]];customStepIndex=destination;
  saveCustomProgression('Chord reordered.');fillLoopOptions(true);update();
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
function syncMixerDetails() {
  if ((settings.drums && !mixerDrums) || (settings.bass && !mixerBass) || (settings.comping && !mixerComping)) el<HTMLDetailsElement>('rhythm-details').open = true;
  if (settings.sequence && !mixerSequence) el<HTMLDetailsElement>('sequence-details').open = true;
  mixerDrums = settings.drums; mixerBass = settings.bass; mixerComping = settings.comping; mixerSequence = settings.sequence;
}
function syncTrainerStatus() {
  el('bpm-caption').textContent=settings.trainerEnabled?'STARTING BPM':'BEATS PER MINUTE';
  el('trainer-status').textContent = !settings.trainerEnabled ? 'Starts at your selected tempo.' : playing ? `${currentBpm} BPM · ${currentBpm >= Math.max(settings.bpm,settings.trainerTarget) ? 'Target reached' : `towards ${settings.trainerTarget} BPM`}. Starting tempo: ${settings.bpm} BPM.` : `Start at ${settings.bpm} BPM; add ${settings.trainerIncrement} every ${settings.trainerBars} bars, up to ${Math.max(settings.bpm,settings.trainerTarget)} BPM.`;
}
function syncMiniTransport() {
  setFretRecallPlaying(el('caged-exercise'),playing||exercisePlaying||exercisePreparing);
  el('position-path').querySelectorAll<HTMLButtonElement>('button').forEach(button=>{button.disabled=playing||exercisePlaying||exercisePreparing;});
  for(const id of ['exercise-position-navigation','exercise-position-region','featured-position','position-region','guitar-chord-position']){const control=document.getElementById(id) as HTMLSelectElement|null;if(control)control.disabled=playing||exercisePlaying||exercisePreparing;}
  const positionControl=document.getElementById('exercise-position') as HTMLSelectElement|null;if(positionControl)positionControl.disabled=playing||exercisePlaying||exercisePreparing||(settings.progression&&select('featured-position').value==='path');
  const mini = el('mini-transport');
  mini.hidden = false;
  if (document.activeElement !== input('mini-bpm')) input('mini-bpm').value = String(exercisePlaying?exerciseView.tempo:playing ? currentBpm : settings.bpm);
  el('mini-tempo-label').textContent = exercisePlaying?'STUDY BPM':playing && settings.trainerEnabled ? 'LIVE BPM' : 'BPM';
  input('mini-bpm').readOnly=exercisePlaying;input('mini-bpm').setAttribute('aria-label',exercisePlaying?'Exercise tempo (change in exercise settings)':'Practice tempo');
  el('mini-play').textContent = playing||exercisePlaying||exercisePreparing ? 'Stop' : 'Play';
  el('mini-play').setAttribute('aria-pressed',String(playing||exercisePlaying||exercisePreparing));
  document.querySelector<HTMLElement>('.mini-harmony-controls')!.hidden=exercisePlaying;
  el<HTMLButtonElement>('mini-play').disabled = busy || stopping;
  const transportSettings=exercisePlaying&&exerciseView.backing?exerciseBackingConfig():settings;
  const transportStep=exercisePlaying?exerciseBackingStep:step;
  const info = harmonyAt(transportSettings,transportStep);
  const active=musicalContext(transportSettings,transportStep);
  el('active-musical-context').innerHTML=`<div><small>${transportSettings.progression?'Progression tonic / key':'Study / pedal root'}</small><strong>${escapeHtml(active.tonic)}</strong></div><div><small>Current chord</small><strong>${escapeHtml(active.chord)}</strong></div><div><small>Current scale guide</small><strong>${escapeHtml(active.scale)}</strong></div><div><small>Next chord</small><strong>${escapeHtml(active.nextChord)}</strong></div><p>${exercisePlaying?'Exercise audition is shown here; the main transport setup below is retained. ':''}${transportSettings.progression?'Functional progressions use contextual scale choices; follow the chord resolution.':'Static modal study: listen to each scale note over this held chord.'} ${transportSettings.extensionMorph?'Extensions are evolving; switch them off for a stable listening reference.':''}</p>`;
  select('mini-key').setAttribute('aria-label',settings.progression?'Progression tonic':'Pedal root');
  select('mini-mode-select').parentElement!.hidden=select('quality').parentElement!.hidden;
  select('mini-chord-select').parentElement!.hidden=select('chord').parentElement!.hidden;
  el('mini-mode').title=`Tonic ${active.tonic} · next ${active.nextChord}`;
  el('mini-chord').textContent = info.name+info.suffix;
  el('mini-mode').textContent = `${exercisePlaying?(exercisePlan?.application?(exerciseResponseActive?'Your turn · ':'Listen · '):'Study · '):''}${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name}`;
  el('mini-root-purpose').textContent=settings.progression?'Tonic':'Root';
  select('mini-key').value=select('key').value;
  select('mini-mode-select').value=select('quality').value;
  select('mini-chord-select').innerHTML=select('chord').innerHTML;
  select('mini-chord-select').value=select('chord').value;
  select('mini-chord-select').disabled=select('chord').disabled;
  select('mini-progression').value=settings.progression?select('template').value:'off';
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
el('mini-play').addEventListener('click',()=>{if(exercisePlaying||exercisePreparing)stopExercisePreview();else void toggle();});
el('mini-more').addEventListener('click',()=>{
  if(!el('floating-mixer').hidden)setFloatingMixer(false);
  const expanded=el('mini-transport').classList.toggle('mobile-expanded');
  el('mini-more').setAttribute('aria-expanded',String(expanded));
  el('mini-more').textContent=expanded?'Done':'Controls';
});
input('mini-bpm').addEventListener('change',()=>{ tempo(Number(input('mini-bpm').value)); input('mini-bpm').value=String(settings.bpm); });
select('mini-key').addEventListener('input',()=>{select('key').value=select('mini-key').value;update();});
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
  if(value==='off'){
    if(settings.progression)el<HTMLButtonElement>('pedal').click();
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

el('open-sound-settings').addEventListener('click',()=>{setFloatingMixer(false);if(focusView)setFocusView(false);showWorkspace('settings','sound-settings-title');});
const workspaceTabs=Array.from(document.querySelectorAll<HTMLButtonElement>('.workspace-tab'));
const workspaceNames:Record<string,string>={'pulse-title':'practice','harmony-title':'harmony','guitar-title':'guitar','caged-exercise':'exercises','progress-title':'progress','sound-settings-title':'settings'};
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
  selectWorkspaceTab(Object.entries(workspaceNames).find(([,value])=>value===name)?.[0]||'pulse-title');
  try{localStorage.setItem('mehtronome-workspace',name);}catch{/* Session-only. */}
  if(target)requestAnimationFrame(()=>el(target).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
}
let initialWorkspace='practice';
try{const saved=localStorage.getItem('mehtronome-workspace');if(saved&&Object.values(workspaceNames).includes(saved))initialWorkspace=saved;}catch{/* Use Metronome & Mixer. */}
showWorkspace(initialWorkspace);

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
  selectRecallChord(el('caged-exercise'),Number(button.dataset.inspectSlot));
});
fillChords();
renderScaleExplorer();
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
catch { el('preset-status').textContent = 'Saved presets are unavailable. Browser storage may be disabled or the saved data could not be read.'; }
function renderPresets(selected = '') {
  select('preset-list').replaceChildren(new Option('Choose a preset',''),...presets.map(p => new Option(p.name,p.id)));
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
  if (!name) throw new Error('Give your preset a name first.');
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
  persistPresets(presets.filter(p => p.id !== id),'','Preset deleted.');
});
function restoreControl(id: string, value: unknown) {
  const control = el<HTMLInputElement | HTMLSelectElement>(id);
  if (control instanceof HTMLSelectElement) {
    if (typeof value === 'string' && Array.from(control.options).some(option => option.value === value && !option.disabled)) control.value = value;
  } else if(id==='manual-position-route'){
    if(typeof value==='string'&&(value===''||/^v1:[a-z0-9]+:[0-4]{1,32}$/.test(value)))control.value=value;
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
  busy = true;
  reflectPresetButtons();
  try {
    stopPreview();
    soloChannels.clear();
    if (playing) await stop();
    // Presets saved before these features existed keep their original behavior.
    for (const [id,value] of Object.entries({...Object.fromEntries(MIX_CHANNELS.map(channel=>['mute-'+channel.id,false])),'extension-morph':false,'extension-bars':'8','pulse-accents':'','pulse-sound':'beep','pulse-swing':'0','pulse-minutes':'0','pulse-finish-bar':true,'pulse-poly':'0/2','gap-progressive':false,'gap-max':'8','trainer-enabled':false,'trainer-bars':'4','trainer-increment':'2','trainer-target':'120','featured-position':'path','manual-position-route':'','loop-unit':'chords','loop-beat-start':'1','loop-beat-end':'1'})) {
      if (!(id in preset.controls)) restoreControl(id,value);
    }
    restoreControl('quality',preset.controls.quality);
    restoreControl('key',preset.controls.key);
    if(preset.customProgression){customUndo.length=0;customRedo.length=0;customProgression=normalizeCustomProgression(preset.customProgression);saveCustomProgression(`Loaded custom progression from “${preset.name}”.`);}
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
    for (const id of PRESET_CONTROLS) if (!id.startsWith('theory-') && !['quality','key','template','loop-enabled','loop-start','loop-end','loop-unit','loop-beat-start','loop-beat-end'].includes(id)) restoreControl(id,preset.controls[id]);
    tempo(Number(input('bpm').value));
    guitarDegrees = select('fret-labels').value === 'degrees';
    restoreTheoryViews(preset.controls);
    step = 0;
    update();
    for (const id of ['loop-enabled','loop-start','loop-end','loop-unit','loop-beat-start','loop-beat-end']) restoreControl(id,preset.controls[id]);
    update();
    input('preset-name').value = preset.name;
    el('preset-status').textContent = `Loaded “${preset.name}”. Ready to practice.`;
  } finally { busy = false; reflectPresetButtons(); }
}
el('preset-load').addEventListener('click',()=>void loadPracticePreset(presets.find(p=>p.id===select('preset-list').value)));
renderPresets();

el('preset-export').addEventListener('click',()=>{
  try{
    const blob=new Blob([exportPresets(presets)],{type:'application/json'}),url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='mehtronome-presets.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);el('preset-status').textContent=`Exported ${presets.length} practice presets.`;
  }catch(error){el('preset-status').textContent=(error as Error).message;}
});
el('preset-import').addEventListener('click',()=>input('preset-file').click());
input('preset-file').addEventListener('change',async()=>{
  const file=input('preset-file').files?.[0];if(!file)return;
  try{
    if(file.size>MAX_PRESET_FILE_BYTES)throw new Error('Preset files must be smaller than 512 KB.');
    const result=importPresets(await file.text(),presets);
    persistPresets(result.items,result.items.at(-1)?.id||'',`Imported ${result.imported} practice preset${result.imported===1?'':'s'}. Existing setups kept.`);
  }catch(error){el('preset-status').textContent=(error as Error).message;}
  finally{input('preset-file').value='';}
});

installConsole(()=>{
  if(!context||context.state!=='running'||!master||master.gain.value<.00001)return [0,0];
  return ambientMeters.map(meter=>{meter.getFloatTimeDomainData(ambientSamples);let peak=0;for(const value of ambientSamples)peak=Math.max(peak,Math.abs(value));return peak*master!.gain.value;});
});

applyStudioIcons();

const learningTargets:Record<string,string>={practice:'pulse-title',harmony:'harmony-title',guitar:'guitar-title',exercises:'caged-exercise',progress:'progress-title',settings:'sound-settings-title'};
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return;
 const focus=event.target.closest('[data-learning-focus]');if(focus){setFocusView(true);document.querySelector('.featured-position')?.scrollIntoView({block:'start'});return;}
 const view=event.target.closest<HTMLElement>('[data-grip-display]');if(view){gripOnly=view.dataset.gripDisplay==='grip';renderGuitar();return;}
 const nav=event.target.closest<HTMLElement>('[data-learning-nav]');if(nav){if(focusView)setFocusView(false);showWorkspace(nav.dataset.learningNav!,learningTargets[nav.dataset.learningNav!]);return;}
 const grip=event.target.closest<HTMLElement>('[data-practise-grip]');if(grip){stopPreview();overviewPosition=grip.dataset.practiseGrip!;if(settings.progression)chooseOverviewPosition(overviewPosition);exerciseView.study='grip';exerciseView.stage='cell';exerciseView.fretboard=true;exerciseView.recall=false;exerciseSelectionStart=null;exerciseSelectionEnd=null;renderGuitar();showWorkspace('exercises','caged-exercise');}
});
select('practice-goal').addEventListener('input',()=>{const goal=GOALS.find(g=>g.id===select('practice-goal').value)!;el('goal-description').textContent=goal.tip+' Keeps your selected tonic. Configures tools without starting audio.';});
el('dismiss-guided-session').addEventListener('click',()=>{el('guided-session').hidden=true;activeGoal='';});
el('start-guided-goal').addEventListener('click',()=>void startGuidedGoal());
async function startGuidedGoal(){
 if(playing)await stop();stopPreview();
 const goal=GOALS.find(g=>g.id===select('practice-goal').value)!;activeGoal=goal.id;
 settings.progression=Boolean(goal.template);gripOnly=goal.id==='shape';step=0;overviewPosition='I';input('manual-position-route').value='';select('featured-position').value='path';select('quality').value=goal.mode;select('template').value=goal.template||'parallel1';settings.template=select('template').value;fillChords();select('chord').value=goal.chord;
 for(const id of ['pedal','progression']){const chosen=id===(settings.progression?'progression':'pedal');el(id).classList.toggle('selected',chosen);el(id).setAttribute('aria-pressed',String(chosen));}
 for(const id of ['sequence','drums','bass','comping','trainer-enabled','gap-enabled','loop-enabled','extension-morph'])input(id).checked=false;
 for(const channel of MIX_CHANNELS)input('mute-'+channel.id).checked=false;soloChannels.clear();
 input('show-grip').checked=true;input('highlight-mode').checked=true;input('count-in').checked=true;select('beats').value='4';select('subdivision').value='1';input('bpm').value='80';input('click').value='40';input('harmony').value='35';input('space').value='20';
 const accompaniment=select('practice-accompaniment').value;
 if(accompaniment==='trio'){for(const id of ['drums','bass','comping'])input(id).checked=true;select('drum-groove').value='swing';select('bass-pattern').value='walk';}
 if(accompaniment==='modal'){input('extension-morph').checked=true;input('space').value='60';}
 if(accompaniment==='sparse'||goal.id==='time'){input('gap-enabled').checked=true;input('gap-play').value='2';input('gap-mute').value='1';select('gap-target').value='click';input('harmony').value='20';}
 theoryView.kind='none';theoryView.choiceId='';select('theory-view').value='none';
 Object.assign(exerciseView,{study:goal.study,application:'cell-space',response:'demo',stage:goal.id==='jazz'?'full':'cell',fretboard:true,recall:false,tempo:80,tempoLinked:true,loop:false,autoTempo:false,motion:'ascending',setupOpen:false,backing:true});exerciseSelectionStart=null;exerciseSelectionEnd=null;
 fillLoopOptions(true);tempo(80);update();
 if(goal.id==='pentatonic'){const choices=theoryOptions(chordInfo(0)).pentatonics;exerciseView.source=choices[0]?.id||'';renderGuitar();}
 el('guided-session-title').textContent=goal.name;el('guided-session-tip').textContent=goal.tip+(goal.id==='jazz'?' Guide tones follow the chord durations. Choose Explore the position to hear every chord; a short cell leaves the other chord slots silent.':accompaniment==='modal'?' Modal exploration has evolving extensions enabled.':' Stable harmony is selected unless the setup states otherwise.');el('guided-session').hidden=false;input('preset-name').value=goal.name;
 showWorkspace(goal.workspace,learningTargets[goal.workspace]);
}

// Move the existing setup and context map below the principal practice material.
const guitarSetup=document.createElement('details');guitarSetup.className='guitar-setup';guitarSetup.innerHTML='<summary>Diagram and chord-shape settings</summary>';
const guitarOverview=document.querySelector('.guitar-overview')!;
const guitarRouteControls=document.createElement('div');guitarRouteControls.className='position-path-controls';const guitarRouteHeading=el('position-path-guide').querySelector('.position-path-heading')!;guitarRouteHeading.prepend(guitarRouteControls);guitarRouteControls.append(select('featured-position').closest('label')!,select('position-region').closest('label')!);
guitarRouteControls.append(select('guitar-chord-position').closest('label')!);select('guitar-chord-position').addEventListener('input',()=>{chooseOverviewPosition(select('guitar-chord-position').value);select('guitar-chord-position').focus({preventScroll:true});});
for(const selector of ['.guitar-controls','.grip-toggle','#grip-toggle-help','.shared-theory-controls','#theory-description','.guitar-legend']){const element=guitarOverview.querySelector(selector);if(element)guitarSetup.append(element);}
guitarOverview.append(guitarSetup);
const guitarPanel=document.querySelector('.guitar')!;const contextMap=el('full-fretboard-panel');for(const element of [el('position-overview'),el('guitar-diagrams'),document.querySelector('.position-navigation')!])guitarPanel.insertBefore(element,contextMap);

installJournal({
 capture:()=>{const preset=snapshotPreset();return {preset,exercise:{...exerciseView},position:overviewPosition,step,goal:activeGoal,gripOnly};},
 restore:async(saved:any)=>{if(busy||stopping)throw new Error('Wait for playback to finish stopping.');
  await loadPracticePreset(saved.preset);stopPreview();
  Object.assign(exerciseView,{application:'cell-space',response:'demo'},saved.exercise);overviewPosition=saved.position;step=Math.max(0,Math.min(progressionDurations(settings).length-1,saved.step));activeGoal=saved.goal;gripOnly=saved.gripOnly;
  exerciseSelectionStart=null;exerciseSelectionEnd=null;update();
  el('guided-session').hidden=true;if(focusView)setFocusView(false);showWorkspace('exercises','caged-exercise');
 },
});
