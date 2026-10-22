import { roomImpulse } from './audio/ambience.js';
import { theoryOptions } from './guitar/superimposition.js';
import { recommendedGrip } from './guitar/grips.js';
import { PRESET_KEY, PRESET_CONTROLS, readPresets, writePresets, exportPresets, importPresets, MAX_PRESET_FILE_BYTES } from './practice/presets.js';
import { SEQUENCE_PATTERNS } from './audio/sequence.js';
import { loadDrumKit } from './audio/load-kit.js';
import './style.css';
import './themes.css';
import './practice.css';
import { POSITIONS, cagedPositionFor, fretboardFor, diagramSvg, parentMajorFor } from './guitar/fretboard.js';
import { cagedStudy, exerciseNotationSvg, flattenExercise, PENTATONIC_PATTERNS } from './guitar/exercises.js';
import { FRET_REGIONS, progressionPositionPath } from './guitar/position-path.js';
import { DRUM_GROOVES, BASS_PATTERNS } from './audio/rhythm.js';
import workletUrl from './audio/worklet.js?worker&url';
import { DEFAULTS } from './audio/engine.js';
import { renderJazzGuitarNote } from './audio/jazz-guitar.js';
import { MODES, CHORDS, SOUNDS, compatibleChords, PROGRESSIONS, progressionDurations, progressionOrder, progressionStep, characteristicNotes, harmonyAt } from './audio/music.js';

const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
function modeOptions() {
  return ['Major scale', 'Melodic minor', 'Harmonic minor'].map(family =>
    `<optgroup label="${family}">${Object.entries(MODES).filter(([, mode]) => ('family' in mode ? mode.family : 'Major scale') === family).map(([id, mode]) => `<option value="${id}" ${id === 'dorian' ? 'selected' : ''}>${mode.name}</option>`).join('')}</optgroup>`
  ).join('');
}
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Mehtronome home"><span class="brand-mark">m<span>·</span></span>mehtronome</a><span class="header-note">A little rhythm. A little harmony.</span><div class="theme-controls"><button id="focus-view" class="practice-button" aria-pressed="false">Focus view</button><label class="theme-picker">Theme<select id="palette" aria-label="Page theme"><option value="light">Original light</option><option value="dark">Original dark</option><option value="midnight">Midnight Studio</option><option value="paper">Warm Paper</option><option value="plum">Plum Session</option><option value="slate">Slate Minimal</option></select></label><button id="theme" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">Dark mode</button></div></header>
<main>
  <div class="intro"><div><p class="eyebrow">MAKE SPACE FOR PRACTICE</p><h1>Find your rhythm.<br><em>Hear the harmony.</em></h1></div><p class="intro-copy">Give your scales somewhere to go.<br>A steady pulse and a little harmonic context.</p></div>
  <section class="presets panel" aria-labelledby="presets-title">
    <div class="section-heading"><h2 id="presets-title">Practice presets</h2><span class="small-label">PICK UP WHERE YOU LEFT OFF</span></div>
    <div class="preset-fields"><label>Preset name<input id="preset-name" type="text" maxlength="60" placeholder="e.g. D Dorian · slow groove"></label><button id="preset-save" class="practice-button">Save new</button><label>Saved setups<select id="preset-list"><option value="">Choose a preset</option></select></label><div class="preset-actions"><button id="preset-load" class="practice-button" disabled>Load</button><button id="preset-update" class="practice-button" disabled>Update</button><button id="preset-delete" class="practice-button" disabled>Delete</button></div></div>
    <p id="preset-status" class="practice-help" role="status">Saved on this browser. Loading a preset stops playback.</p>
  <div class="preset-transfer"><button id="preset-export" class="practice-button">Export presets</button><button id="preset-import" class="practice-button">Import presets</button><input id="preset-file" type="file" accept=".json,application/json" hidden></div>
  </section>
  <div class="workspace">
    <section class="transport panel" aria-labelledby="pulse-title">
      <div class="section-heading"><h2 id="pulse-title">The pulse</h2><span class="live-dot" id="live-dot"></span></div>
      <div class="tempo-controls"><button class="round" id="slower" aria-label="Decrease tempo">−</button><div><label class="sr-only" for="bpm">Tempo in beats per minute</label><input id="bpm" type="number" min="30" max="240" value="90"><span id="bpm-caption" class="bpm-label">BEATS PER MINUTE</span></div><button class="round" id="faster" aria-label="Increase tempo">+</button></div>
      <label class="sr-only" for="tempo">Tempo</label><input id="tempo" class="tempo-range" type="range" min="30" max="240" value="90"><div class="range-limits"><span>30 · LARGO</span><span>240 · PRESTISSIMO</span></div>
      <div class="beat-dots" id="beat-dots" aria-hidden="true"></div>
      <p class="play-status" id="play-status" role="status">Your next good practice starts here.</p>
      <button class="play-button" id="play" aria-pressed="false"><span id="play-icon">▶</span><span id="play-label">Start practicing</span><kbd>SPACE</kbd></button>
      <div class="pulse-options">
      <div class="transport-options"><label>Beats / bar <select id="beats" aria-label="Beats per bar"><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label><label class="check"><input type="checkbox" id="count-in">One-bar count-in</label></div>
      <div class="transport-options subdivision-options"><label>Subdivision <select id="subdivision"><option value="1">Quarter notes</option><option value="2">Eighth notes</option><option value="3">Eighth-note triplets</option><option value="4">Sixteenth notes</option><option value="6">Sixteenth-note sextuplets</option></select></label><label class="check"><input id="accent" type="checkbox" checked>Accent beat one</label></div>
      </div>
      <div class="practice-block tempo-training"><label class="check"><input id="trainer-enabled" type="checkbox">Tempo trainer</label><div id="trainer-controls" hidden><div class="trainer-fields"><label>Every <select id="trainer-bars"><option>1</option><option>2</option><option selected>4</option><option>8</option></select> bars</label><label>Increase <input id="trainer-increment" type="number" min="1" max="30" value="2"> BPM</label><label>Target <input id="trainer-target" type="number" min="30" max="240" value="120"> BPM</label></div><p id="trainer-status" class="practice-help" role="status">Starts at your selected tempo.</p></div></div>
      <div class="practice-block gap-training"><label class="check"><input id="gap-enabled" type="checkbox">Gap training</label><div id="gap-controls" hidden><div class="field-row"><label>Audible bars<select id="gap-play"><option>1</option><option>2</option><option selected>4</option><option>8</option></select></label><label>Gap bars<select id="gap-mute"><option>1</option><option>2</option><option>4</option></select></label></div><label class="template-field">Mute during gaps<select id="gap-target"><option value="all">Click + backing</option><option value="click">Click only</option><option value="backing">Backing only</option></select></label><p class="practice-help">Keep playing through the gap. The harmony and pulse continue underneath; the count-in stays audible.</p></div></div>
    </section>
    <section class="harmony panel" aria-labelledby="harmony-title">
      <div class="section-heading"><h2 id="harmony-title">The harmony</h2><span class="small-label">YOUR MUSICAL CONTEXT</span></div>
      <div class="field-row"><label><span id="root-label">Root note</span><select id="key">${names.map((n, i) => `<option value="${i}" ${i === 9 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Mode<select id="quality">${modeOptions()}</select></label></div>
      <div class="field-row sound-row"><label>Backing sound<select id="sound">${Object.entries(SOUNDS).map(([id, sound]) => `<option value="${id}">${sound.name}</option>`).join('')}</select></label><label><span id="chord-label">Pedal chord</span><select id="chord"></select></label></div>

      <p id="mode-tip" class="mode-tip"></p>
      <div class="mode-label">BACKING</div><div class="segmented" role="group" aria-label="Harmony backing"><button id="pedal" class="selected" aria-pressed="true">Pedal chord</button><button id="progression" aria-pressed="false">Chord progression</button></div>
      <button id="mode-template" class="practice-button mode-template-button">Try a mode progression</button>
      <label id="template-field" class="template-field" hidden>Progression template<select id="template">${['Parallel movements','Jazz standards','Mode practice'].map(group=>`<optgroup label="${group}">${Object.entries(PROGRESSIONS).filter(([,template])=>group==='Mode practice'?template.kind==='modal':group==='Jazz standards'?template.kind==='jazz':!['modal','jazz'].includes(template.kind)).map(([id,template])=>`<option value="${id}">${template.name}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <div class="chord-stage"><span class="small-label" id="chord-caption">LET IT RING</span><div id="chord-name">C<span>maj</span></div><p id="chord-notes">C · E · G</p></div>
      <div class="progression-strip" id="progression-strip" hidden></div>
      <div id="loop-controls" class="practice-block" hidden><label class="check"><input id="loop-enabled" type="checkbox">Loop selected chords</label><div id="loop-range" hidden><div class="field-row"><label>Start chord<select id="loop-start"></select></label><label>End chord<select id="loop-end"></select></label></div><p id="loop-summary" class="practice-help"></p></div></div>
      <div id="preview-controls" hidden><p>While stopped, hold a chord to hear it. Release to stop; its diagrams stay selected.</p><label class="check"><input id="audition" type="checkbox" checked>Sound preview</label><span id="preview-status" role="status" hidden>Release to stop</span></div>
      <p class="backing-description" id="backing-description">One sustained chord. Explore how every note feels against it.</p>
      <details class="learn-more"><summary>Learn more about this harmony</summary><p id="harmony-explanation" class="practice-help"></p></details>
      <details class="compare-panel"><summary>Compare two chords</summary><p class="practice-help">Capture the current harmony in A and B, then listen to the difference while stopped.</p><div class="compare-slots"><div><button id="compare-a" class="practice-button">Capture as A</button><button id="compare-play-a" class="practice-button" aria-pressed="false" disabled>Listen to A</button><p id="compare-name-a">No chord captured</p></div><div><button id="compare-b" class="practice-button">Capture as B</button><button id="compare-play-b" class="practice-button" aria-pressed="false" disabled>Listen to B</button><p id="compare-name-b">No chord captured</p></div></div><button id="compare-swap" class="practice-button" disabled>Alternate A / B</button><p id="compare-status" class="practice-help" role="status">Capture two chords to compare.</p></details>
    </section>
    <section class="notes panel" aria-labelledby="notes-title"><div class="section-heading"><h2 id="notes-title">Under your fingers</h2><label class="exercise-label">Exercise <select id="exercise"><option value="scale">Scale</option><option value="arpeggio">Arpeggio</option></select></label></div><label class="check characteristic-toggle"><input id="highlight-mode" type="checkbox" checked>Highlight modal colour notes</label><p id="characteristic-notes" class="practice-help"></p><div id="note-list" class="note-list"></div><p id="exercise-description">Play these notes on your instrument, at your own pace.</p></section>
    <section class="mix panel" aria-labelledby="mix-title"><div class="section-heading"><h2 id="mix-title">Your mix</h2><span class="small-label">FIND THE BALANCE</span></div>
      <div class="mix-sections">
        <section class="mix-levels mix-group" aria-labelledby="levels-title"><h3 id="levels-title">Levels & ambience</h3><label class="volume-label" for="click">Click <output id="click-value">50%</output></label><input id="click" type="range" min="0" max="100" value="50"><label class="volume-label" for="harmony">Harmony <output id="harmony-value">35%</output></label><input id="harmony" type="range" min="0" max="100" value="35"><label class="volume-label" for="space">Ambient space <output id="space-value">75%</output></label><input id="space" type="range" min="0" max="100" value="75"></section>
    <section class="rhythm mix-group" aria-labelledby="rhythm-title">
      <div class="section-heading"><h3 id="rhythm-title">Drums & bass</h3></div>
      <div class="field-row rhythm-instruments">
        <div class="rhythm-instrument"><label class="check rhythm-toggle"><input id="drums" type="checkbox">Drums</label><label class="volume-label" for="drums-volume">Volume <output id="drums-volume-value">35%</output></label><input id="drums-volume" type="range" min="0" max="100" value="35"></div>
        <div class="rhythm-instrument"><label class="check rhythm-toggle"><input id="bass" type="checkbox">Bass</label><label class="volume-label" for="bass-volume">Volume <output id="bass-volume-value">40%</output></label><input id="bass-volume" type="range" min="0" max="100" value="40"></div>
      </div>
      <details id="rhythm-details" class="mixer-details"><summary>Styles & patterns</summary><div class="field-row"><div id="drums-controls" hidden><label>Drum style<select id="drum-groove">${Object.entries(DRUM_GROOVES).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label></div><div id="bass-controls" hidden><label>Bass style<select id="bass-pattern">${Object.entries(BASS_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label></div></div><p class="practice-help">Recorded drums and bass follow your tempo and harmony, with four- and eight-bar phrases.</p></details>
    </section>
    <section class="sequence mix-group" aria-labelledby="sequence-title">
      <div class="section-heading"><h3 id="sequence-title">Melodic movement</h3><label class="check"><input id="sequence" type="checkbox">Enable sequence</label></div>
      <label class="volume-label" for="sequence-volume">Volume <output id="sequence-volume-value">25%</output></label><input id="sequence-volume" type="range" min="0" max="100" value="25">
      <details id="sequence-details" class="mixer-details"><summary>Pattern & movement</summary><p id="sequence-help" class="sequence-help"></p><div id="sequence-controls" hidden>
        <div class="field-row"><label>Pattern<select id="sequence-pattern">${Object.entries(SEQUENCE_PATTERNS).map(([id,pattern])=>`<option value="${id}">${pattern.name}</option>`).join('')}</select></label><label>Timing<select id="sequence-rate"><option value="2">Eighth notes</option><option value="4">Sixteenth notes</option><option value="3">Eighth-note triplets</option></select></label></div>
        <div class="sequence-sliders"><label class="volume-label" for="sequence-density">Density <output id="sequence-density-value">65%</output></label><input id="sequence-density" type="range" min="0" max="100" value="65"><label class="volume-label" for="sequence-swing">Swing <output id="sequence-swing-value">0%</output></label><input id="sequence-swing" type="range" min="0" max="60" value="0"></div>
      </div></details>
    </section>
      </div>
    </section>
    <section class="guitar panel" aria-labelledby="guitar-title">
      <div class="section-heading"><div><p class="eyebrow">TAKE IT TO THE FRETBOARD</p><h2 id="guitar-title">Guitar reference</h2></div><span class="small-label">STANDARD TUNING · E A D G B E</span></div>
      <div class="guitar-guide guitar-overview">
        <h3 id="guitar-context"></h3><p id="guitar-scale"></p><p id="guitar-parent" class="guitar-help"></p>
        <div class="guitar-controls"><label>Position navigation<select id="featured-position"><option value="all">Manual selection</option><option value="path">Follow nearest positions</option></select></label><label>Diagram<select id="fret-view"><option value="scale">Scale + chord tones</option><option value="arpeggio">Chord tones only</option></select></label><label>Labels<select id="fret-labels"><option value="notes">Note names</option><option value="degrees" selected>Scale degrees</option></select></label></div>
        <div id="position-path-guide" class="position-path-guide" hidden><div class="position-path-heading"><label>Fretboard region<select id="position-region">${Object.entries(FRET_REGIONS).map(([id,region])=>`<option value="${id}" ${id==='middle'?'selected':''}>${region.name}</option>`).join('')}</select></label><p>Nearest CAGED route through this progression</p></div><div id="position-path" class="position-path"></div></div>
        <label class="check grip-toggle"><input id="show-grip" type="checkbox" aria-describedby="grip-toggle-help">Highlight chord shapes</label><p id="grip-toggle-help" class="guitar-help">Turn on to show the suggested chord inside each position.</p><p id="grip-preview-status" class="guitar-help" role="status" hidden>Chord on · click the active button to stop.</p>
        <div class="theory-controls shared-theory-controls"><label>Explore all positions<select id="theory-view" aria-label="Explore all CAGED positions"><option value="none">Off</option><option value="pentatonic">Pentatonic superimposition</option><option value="triads">Triad pairs</option></select></label><label id="theory-choice-label" hidden>Suggestion<select id="theory-choice" aria-label="Suggestion for all CAGED positions"><option value="">None</option></select></label></div><div id="theory-description"></div>
        <div class="guitar-legend"><span><i class="root"></i>Current root</span><span><i class="chord"></i>Chord tone</span><span><i class="scale"></i>Scale tone</span><span id="grip-legend"><i class="grip"></i>Suggested chord shape</span><span id="characteristic-legend"><i class="characteristic"></i>Modal colour note</span></div>
      </div>
      <div id="position-overview" class="position-overview" role="tablist" aria-label="CAGED positions"></div>
      <div id="guitar-diagrams" class="guitar-diagrams"></div>
      <div class="position-navigation" aria-label="Position navigation"><button id="position-previous" type="button" class="practice-button">← Previous</button><span id="position-indicator" aria-live="polite"></span><button id="position-next" type="button" class="practice-button">Next →</button></div>
      <section id="caged-exercise" class="caged-exercise" aria-labelledby="caged-exercise-title"></section>
      <details class="guitar-guide learn-more"><summary>Learn more about the diagrams</summary><p class="guitar-help">Major-scale modes share their parent-major fretboard fingerings. Position numbers and CAGED names follow the current modal root within each fingering; gold dots mark that root. With the chord overlay on, play only the solid-ring notes together. Faded notes remain available for scale or arpeggio practice. Click Strum chord while stopped to hear a warm nylon-string guitar chord at your Harmony volume. Ambient space adds reverb. Click the same button again to stop the chord. The shared Explore selector applies a pentatonic superimposition or triad pair to all five positions at once. These highlight notes within the same CAGED fingerings, with modal degrees and A/B triad markers. Chord shapes and modal rings return when exploration is off.</p>
        <p class="guitar-help">High E is at the top, low E at the bottom. Frets increase from left to right. Open-position forms are moved up an octave so every position uses fretted notes.</p>
      </details>
    </section>
  </div>
  <p id="error" class="error" role="alert" hidden></p>
  <footer><span><span class="footer-dot">●</span> Made for listening, not rushing.</span><span><a class="theme-preview-link" href="./themes.html">Compare themes</a> · Headphones on. Distractions off.</span></footer>
</main>
<div id="mini-transport" class="mini-transport" aria-label="Practice controls" hidden><button id="mini-play" class="practice-button" aria-pressed="false">▶ Play</button><label><span id="mini-tempo-label">BPM</span><input id="mini-bpm" type="number" min="30" max="240" value="90" aria-label="Practice tempo"></label><div class="mini-harmony"><strong id="mini-chord">Am13</strong><span id="mini-mode">A Dorian</span></div><div class="mini-harmony-controls"><label>Root<select id="mini-key" aria-label="Root note">${names.map((name,index)=>`<option value="${index}">${name}</option>`).join('')}</select></label><label>Mode<select id="mini-mode-select" aria-label="Mode">${modeOptions()}</select></label><label>Chord<select id="mini-chord-select" aria-label="Chord type"></select></label><label>Progression<select id="mini-progression" aria-label="Progression"><option value="off">Pedal chord</option>${Object.entries(PROGRESSIONS).map(([id,template])=>`<option value="${id}">${template.name}</option>`).join('')}</select></label></div><div class="mini-pulse-options"><label class="check"><input id="mini-count-in" type="checkbox">One-bar count-in</label><label class="check"><input id="mini-accent" type="checkbox">Accent beat one</label></div><span id="mini-beat" aria-hidden="true">●</span><button id="exit-focus" class="practice-button" hidden>Exit focus</button></div>`;

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
const select = (id: string) => el<HTMLSelectElement>(id);
let settings = { ...DEFAULTS, key:9, mode: 'dorian', chord: MODES.dorian.chord, countIn:false };
let master: GainNode | undefined;
let wet: GainNode | undefined;
let reverbGate: GainNode | undefined;
let reverb: ConvolverNode | undefined;
let impulse: AudioBuffer | undefined;
let playing = false;
let busy = false;
let step = 0;
let context: AudioContext | undefined;
let node: AudioWorkletNode | undefined;
let stopping = false;
let guitarDegrees = true;
let previewHold: string | null = null;
let gripRingTimer: ReturnType<typeof setTimeout> | undefined;
let previewPreparation: Promise<void> | undefined;
let previewing = false;
let previewGripShape: string | null = null;
type TheorySuggestion = {id:string; name:string; rootPc?:number; pcs:number[]; names:string[]; degrees:string[]; explanation:string; groups?:{name:string; rootPc?:number; pcs:number[]; names:string[]}[]};
type TheoryView = {kind:'none'|'pentatonic'|'triads'; choiceId:string};
const theoryView:TheoryView = {kind:'none',choiceId:''};
const positionGrips = new Map<string, ReturnType<typeof recommendedGrip>>();
let overviewPosition = 'I';
const exerciseView={study:'harmonized',material:'seventh',motion:'ascending',rhythm:'eighths',loop:false,backing:true,source:'',pattern:'groups3',display:'both',zoom:'comfortable',tempo:90,tempoLinked:true,loopStart:0,loopEnd:-1,autoTempo:false,autoEvery:4,autoIncrement:2};
exerciseView.display=localStorage.getItem('mehtronome-notation-display')||'both';exerciseView.zoom=localStorage.getItem('mehtronome-notation-zoom')||'comfortable';
let currentExerciseGroups:any[]=[];
let currentExercise:any[]=[];
let exerciseTimer:ReturnType<typeof setTimeout>|undefined;
let exerciseSources:AudioScheduledSourceNode[]=[];
let exercisePlaying=false;
let exerciseNextStart:number|undefined;
let exerciseTimelineStart:number|undefined;
let exerciseAnimationFrame=0;
let exerciseRepetitions=0;
let exerciseSelectionStart:number|null=null,exerciseSelectionEnd:number|null=null;
let exerciseDragPointer:number|null=null,exerciseDragMoved=false,suppressExerciseNoteClick=false;
const EXERCISE_FAVOURITES_KEY='mehtronome-exercise-favourites';
let exerciseHistory:any[]=[];let exerciseHistoryIndex=-1;
let previewGeneration = 0;
let currentBpm = settings.bpm;
let transportInView = true;
let focusView = false;
type ComparedChord = {settings:typeof settings; step:number; name:string};
const comparisons:Partial<Record<'a'|'b',ComparedChord>> = {};
let activeComparison:'a'|'b'|null = null;
let mixerDrums = false, mixerBass = false, mixerSequence = false;

function escapeHtml(text:string) { return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }

function stopExercisePreview() {
  const stopBacking=exercisePlaying&&exerciseView.backing&&!playing;
  clearTimeout(exerciseTimer);exerciseTimer=undefined;
  for(const source of exerciseSources){try{source.stop();}catch{}}
  exerciseSources=[];exercisePlaying=false;exerciseNextStart=undefined;exerciseTimelineStart=undefined;exerciseRepetitions=0;cancelAnimationFrame(exerciseAnimationFrame);
  if(stopBacking)node?.port.postMessage({type:'stop'});
  const button=document.querySelector<HTMLButtonElement>('#exercise-preview');
  if(button){button.textContent='▶ Hear jazz guitar';button.setAttribute('aria-pressed','false');}
  const rangeButton=document.querySelector<HTMLButtonElement>('#exercise-play-range');if(rangeButton)rangeButton.textContent='▶ Play selection';
  document.querySelectorAll('.exercise-note').forEach(note=>note.classList.remove('playing','played'));
  reflectExerciseSelection();
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
  else if(sequence.length){const cycle=Math.max(0,elapsed-countIn),index=Math.min(sequence.length-1,Math.floor((cycle%(sequence.length*noteLength))/noteLength)),globalIndex=exerciseRange().start+index;
    document.querySelectorAll<HTMLElement>('.exercise-note').forEach(note=>{const value=Number(note.dataset.noteIndex);note.classList.toggle('playing',value===globalIndex);note.classList.toggle('played',value<globalIndex&&value>=exerciseRange().start);});
    document.querySelector(`[data-note-index="${globalIndex}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});
    if(status)status.textContent=`Note ${index+1} / ${sequence.length} · repetition ${Math.floor(cycle/(sequence.length*noteLength))+1} · ${exerciseView.tempo} BPM`;
    const tempoControl=document.querySelector<HTMLInputElement>('#exercise-tempo');if(tempoControl&&document.activeElement!==tempoControl)tempoControl.value=String(exerciseView.tempo);
    if(progress)progress.style.width=`${((index+1)/sequence.length)*100}%`;
  }
  exerciseAnimationFrame=requestAnimationFrame(updateExerciseCursor);
}

function renderCagedExercise(position:any,board:any,info:any) {
  if(exerciseView.tempoLinked)exerciseView.tempo=settings.bpm;
  const exerciseProgression=settings.progression?progressionOrder(settings).map((index:number)=>chordInfo(index)):[info];
  const suggestions=theoryOptions(info);
  const sourceChoices=exerciseView.study==='triadpairs'?suggestions.triadPairs:exerciseView.study==='pentatonic'?suggestions.pentatonics:[];
  const sourceChoice=sourceChoices.find((choice:any)=>choice.id===exerciseView.source)||sourceChoices[0];
  if(sourceChoice)exerciseView.source=sourceChoice.id;
  currentExerciseGroups=cagedStudy(board,info,exerciseView.study,exerciseView.material,exerciseView.motion,{progression:exerciseProgression,source:sourceChoice?.id,pattern:exerciseView.pattern});
  currentExercise=flattenExercise(currentExerciseGroups);
  const rhythmName={eighths:'Eighth notes',triplets:'Eighth-note triplets',sixteenths:'Sixteenth notes'}[exerciseView.rhythm] || 'Eighth notes';
  const materialName=exerciseView.material==='triad'?'triads':exerciseView.material==='extensions'?'ninth chords':'tetrads';
  const alternatingLabel={ascending:'Up/down',descending:'Down/up','up-down':'Up/down then down/up','down-up':'Down/up then up/down'}[exerciseView.motion] || 'Up/down';
  const materialTitle=materialName[0].toUpperCase()+materialName.slice(1);
  const studyName={harmonized:`Harmonized ${materialName}`,alternating:`${alternatingLabel} diatonic ${materialName}`,chordtones:`${materialTitle} from each chord tone`,chordtonesalternating:`${alternatingLabel} ${materialName} from each chord tone`,cells:'Diatonic 1–2–3–5 cells',thirds:'Scale in thirds',fourths:'Scale in fourths',sixths:'Scale in sixths',digital1324:'Diatonic 1–3–2–4 pattern',groups3:'Ascending groups of three',groups4:'Ascending groups of four',inversions:`${info.name}${info.suffix} inversion cycle`,enclosures:'Bebop chord-tone enclosures',approach:`Chromatic approach-note ${materialName}`,upperstructure:'3–5–7–9 upper structures',guidetones:'Guide-tone voice leading',connections:`Voice-led ${materialName} connections`,triadpairs:'Triad-pair lines',pentatonic:'Superimposed pentatonic sequences'}[exerciseView.study] || `Harmonized ${materialName}`;
  const startsHigh=exerciseView.motion==='descending'||exerciseView.motion==='down-up';
  const alternatingStudy=['alternating','chordtonesalternating'].includes(exerciseView.study);
  const directionOptions=alternatingStudy?'<option value="ascending">Up/down · low to high</option><option value="descending">Down/up · high to low</option>':'<option value="ascending">Ascending</option><option value="descending">Descending</option><option value="up-down">Ascending and descending</option><option value="down-up">Descending and ascending</option>';
  const exerciseRoot=exerciseView.study==='pentatonic'&&sourceChoice?.rootPc!==undefined?info.scaleNames[info.scalePcs.indexOf(sourceChoice.rootPc)]:info.scaleNames[0];
  const notation=exerciseNotationSvg(currentExerciseGroups,exerciseView.rhythm,`${studyName} · ${exerciseRoot}`);
  const favouriteOptions=exerciseFavourites().map((item:any,index:number)=>`<option value="${index}">${escapeHtml(item.study)} · ${escapeHtml(item.pattern||item.material)}</option>`).join('');
  const sourceControl=sourceChoices.length?`<label>Source<select id="exercise-source">${sourceChoices.map((choice:any)=>`<option value="${escapeHtml(choice.id)}">${escapeHtml(choice.name)}</option>`).join('')}</select></label>`:'';
  const patternControl=exerciseView.study==='pentatonic'?`<label>Pattern<select id="exercise-pattern">${Object.entries(PENTATONIC_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>`:'';
  el('caged-exercise').innerHTML=`<div class="exercise-heading"><div><p class="eyebrow">POSITION PRACTICE</p><h3 id="caged-exercise-title">${escapeHtml(studyName)} · Position ${position.numeral}</h3></div><span>${escapeHtml(info.scaleNames[0])} ${escapeHtml(MODES[info.mode as keyof typeof MODES].name)} · ${rhythmName}</span></div><div class="exercise-controls"><label>Exercise<select id="exercise-study"><optgroup label="Scale sequences"><option value="thirds">Scale in thirds</option><option value="fourths">Scale in fourths</option><option value="sixths">Scale in sixths</option><option value="groups3">Groups of three</option><option value="groups4">Groups of four</option><option value="digital1324">Diatonic 1–3–2–4</option><option value="cells">Diatonic 1–2–3–5</option></optgroup><optgroup label="Diatonic triads & arpeggios"><option value="harmonized">Harmonized scale</option><option value="alternating">Alternating diatonic arpeggios</option><option value="chordtones">Arpeggios from each chord tone</option><option value="chordtonesalternating">Alternating arpeggios from each chord tone</option><option value="inversions">Selected-chord inversions</option></optgroup><optgroup label="Voice leading"><option value="guidetones">Guide-tone lines</option><option value="connections">Arpeggio connections</option><option value="upperstructure">3-to-9 arpeggios</option></optgroup><optgroup label="Chromatic language"><option value="enclosures">Bebop enclosures</option><option value="approach">Approach-note arpeggios</option></optgroup><optgroup label="Superimpositions"><option value="triadpairs">Triad-pair lines</option><option value="pentatonic">Pentatonic sequences</option></optgroup></select></label><label>Material<select id="exercise-material"><option value="triad">Triads</option><option value="seventh">Tetrads</option><option value="extensions">Ninth chords</option></select></label>${sourceControl}${patternControl}<label>Direction<select id="exercise-motion">${directionOptions}</select></label><label>Rhythm<select id="exercise-rhythm"><option value="eighths">Eighth notes</option><option value="triplets">Triplets</option><option value="sixteenths">Sixteenth notes</option></select></label><label class="check exercise-loop"><input id="exercise-loop" type="checkbox">Loop</label><label class="check exercise-backing"><input id="exercise-backing" type="checkbox">Metronome + harmony</label></div><div class="exercise-practice-bar"><div class="exercise-tempo"><label>Exercise tempo <input id="exercise-tempo" type="number" min="30" max="240" value="${exerciseView.tempo}"></label><button type="button" class="practice-button" data-tempo-ratio=".5">½ speed</button><button type="button" class="practice-button" data-tempo-ratio=".75">¾ speed</button><button type="button" class="practice-button" data-tempo-ratio="1">Main tempo</button></div><div class="exercise-display"><label>Favourites<select id="exercise-favourites"><option value="">Saved exercises</option>${favouriteOptions}</select></label><label>Display<select id="exercise-display"><option value="both">Notation + TAB</option><option value="tab">TAB only</option><option value="notation">Notation only</option><option value="names">Note names + TAB</option><option value="degrees">Degrees + TAB</option></select></label><label>Size<select id="exercise-zoom"><option value="fit">Fit width</option><option value="comfortable">Comfortable</option><option value="large">Large</option></select></label></div><label class="check"><input id="exercise-auto-tempo" type="checkbox">Auto-increase tempo</label><label>Every <select id="exercise-auto-every"><option>2</option><option selected>4</option><option>8</option></select> repetitions</label><label>+ <input id="exercise-auto-increment" type="number" min="1" max="20" value="2"> BPM</label></div><div class="exercise-status-row"><span id="exercise-playback-status" role="status">Ready · click a note to hear it.</span><div class="exercise-progress"><i id="exercise-progress-fill"></i></div><div class="notation-legend"><span><i class="legend-target"></i>Target</span><span><i class="legend-active"></i>Playing</span></div></div><div class="exercise-range-controls" aria-label="Notation selection"><button id="exercise-play-range" type="button" class="practice-button" disabled>▶ Play selection</button><button id="exercise-clear-range" type="button" class="practice-button" disabled>Clear selection</button><span>Drag across notation notes to select and hear a passage.</span></div><div class="notation-scroll display-${exerciseView.display} zoom-${exerciseView.zoom}">${notation}</div><div class="exercise-footer"><p>This study starts at the ${startsHigh?'highest':'lowest'} available note and stays inside the displayed ${position.shape}-position. Note names or degrees can be shown beneath the synchronized notation and TAB.</p><div class="exercise-actions"><button id="exercise-history-back" type="button" class="practice-button" aria-label="Previous exercise">←</button><button id="exercise-history-forward" type="button" class="practice-button" aria-label="Next exercise">→</button><button id="exercise-favourite" type="button" class="practice-button">☆ Favourite</button><button id="exercise-export" type="button" class="practice-button">Export SVG</button><button id="exercise-print" type="button" class="practice-button">Print / PDF</button><button id="exercise-focus" type="button" class="practice-button" aria-pressed="false">Focus notation</button><button id="exercise-preview" type="button" class="practice-button" aria-pressed="false" ${playing||!currentExercise.length?'disabled':''}>▶ Hear jazz guitar</button></div></div>`;
  select('exercise-study').value=exerciseView.study;
  select('exercise-material').value=exerciseView.material;
  if(sourceChoice)select('exercise-source').value=sourceChoice.id;
  if(exerciseView.study==='pentatonic')select('exercise-pattern').value=exerciseView.pattern;
  select('exercise-material').disabled=['cells','thirds','fourths','sixths','digital1324','groups3','groups4','enclosures','upperstructure','guidetones','triadpairs','pentatonic'].includes(exerciseView.study);
  select('exercise-motion').value=exerciseView.motion;
  select('exercise-motion').disabled=false;
  select('exercise-rhythm').value=exerciseView.rhythm;
  input('exercise-loop').checked=exerciseView.loop;
  input('exercise-backing').checked=exerciseView.backing;
  select('exercise-display').value=exerciseView.display;select('exercise-zoom').value=exerciseView.zoom;
  input('exercise-auto-tempo').checked=exerciseView.autoTempo;select('exercise-auto-every').value=String(exerciseView.autoEvery);input('exercise-auto-increment').value=String(exerciseView.autoIncrement);
  const focusButton=el<HTMLButtonElement>('exercise-focus'),notationFocused=el('caged-exercise').classList.contains('notation-focused');
  focusButton.textContent=notationFocused?'Exit notation focus':'Focus notation';focusButton.setAttribute('aria-pressed',String(notationFocused));
  reflectExerciseSelection();
  if(!exerciseHistory.length)rememberExercise();
}

function scheduleExercise(scheduledStart?:number) {
  if(!context||!master||!currentExercise.length||!exercisePlaying)return;
  const divisions=exerciseView.rhythm==='sixteenths'?4:exerciseView.rhythm==='triplets'?3:2;
  const noteLength=60/exerciseView.tempo/divisions,sequence=selectedExercise();
  const countIn=scheduledStart===undefined&&settings.countIn?settings.beats*60/exerciseView.tempo:0;
  const start=scheduledStart??context.currentTime+.03+countIn;
  if(exerciseTimelineStart===undefined){exerciseTimelineStart=start-countIn;updateExerciseCursor();}
  sequence.forEach((note,index)=>{
    const at=start+index*noteLength;
    const duration=Math.max(.045,noteLength*.96),release=Math.min(.045,duration*.3);
    const samples=renderJazzGuitarNote(context!.sampleRate,note.midi,duration);
    const buffer=context!.createBuffer(1,samples.length,context!.sampleRate);buffer.copyToChannel(samples,0);
    const source=context!.createBufferSource(),gain=context!.createGain(),filter=context!.createBiquadFilter();source.buffer=buffer;
    filter.type='lowpass';filter.frequency.value=3100;filter.Q.value=.45;
    gain.gain.setValueAtTime(.3,at);gain.gain.setValueAtTime(.3,at+duration-release);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    source.connect(filter).connect(gain).connect(master!);
    if(reverb)gain.connect(reverb);
    source.start(at);source.stop(at+duration);exerciseSources.push(source);
    source.onended=()=>{const sourceIndex=exerciseSources.indexOf(source);if(sourceIndex>=0)exerciseSources.splice(sourceIndex,1);};
  });
  const duration=sequence.length*noteLength;
  exerciseNextStart=start+duration;
  const lookahead=Math.min(1,Math.max(.2,duration*.25));
  exerciseTimer=setTimeout(()=>{
    if(exerciseView.loop&&exercisePlaying){exerciseRepetitions++;if(exerciseView.autoTempo&&exerciseRepetitions%exerciseView.autoEvery===0){exerciseView.tempo=Math.min(240,exerciseView.tempo+exerciseView.autoIncrement);exerciseTimelineStart=exerciseNextStart;node?.port.postMessage({type:'settings',settings:{...settings,bpm:exerciseView.tempo}});}scheduleExercise(exerciseNextStart);}else stopExercisePreview();
  },Math.max(0,(exerciseNextStart-context.currentTime-(exerciseView.loop?lookahead:-.06))*1000));
}

async function toggleExercisePreview() {
  if(exercisePlaying){stopExercisePreview();return;}
  if(playing||busy||stopping||!currentExercise.length)return;
  stopPreview();
  try{
    await prepareAudio();exercisePlaying=true;
    if(exerciseView.backing)node!.port.postMessage({type:'start',settings:{...settings,bpm:exerciseView.tempo,countIn:settings.countIn,drums:false,bass:false,sequence:false}});
    const button=el<HTMLButtonElement>('exercise-preview');button.textContent='■ Stop exercise';button.setAttribute('aria-pressed','true');
    reflectExerciseSelection();
    scheduleExercise();
  }catch(error){stopExercisePreview();el('error').textContent=error instanceof Error?error.message:'Could not preview this exercise.';el('error').hidden=false;}
}

function notes(): string[] { return harmonyAt(settings, step).scaleNames; }
function chordInfo(index: number) { return harmonyAt(settings, index); }
function renderMusic() {
  const template = PROGRESSIONS[settings.template as keyof typeof PROGRESSIONS];
  step = settings.progression ? step % template.roman.length : 0;
  const info = chordInfo(step);
  const order = progressionOrder(settings);
  el('loop-controls').hidden = !settings.progression;
  el('loop-range').hidden = !settings.loopEnabled;
  el('loop-summary').textContent = `${order.map((i: number) => { const c=chordInfo(i); return c.name+c.suffix; }).join(' → ')} · ${order.reduce((sum: number,i: number)=>sum+progressionDurations(settings)[i],0)} bars. Original chord durations are kept.${settings.loopStart > settings.loopEnd ? ' Wraps across the end of the template.' : ''}`;
  el('chord-name').innerHTML = `${info.name}<span>${info.suffix}</span>`;
  el('chord-notes').textContent = info.tones.join(' · ');

  const jazz = template.kind === 'jazz';
  const modal = template.kind === 'modal';
  el('chord-caption').textContent = settings.progression && modal ? `${progressionDurations(settings).reduce((sum:number,bars:number)=>sum+bars,0)}-BAR MODAL LOOP` : !settings.progression ? 'LET IT RING' : settings.loopEnabled ? `${order.reduce((sum: number,i: number)=>sum+progressionDurations(settings)[i],0)}-BAR SELECTED LOOP` : jazz ? `${progressionDurations(settings).reduce((sum: number, bars: number) => sum + bars, 0)}-BAR JAZZ LOOP` : template.bars === 2 ? 'TWO BARS PER CHORD' : 'ONE BAR PER CHORD';
  el('progression-strip').classList.toggle('blues', template.roman.length === 12);
  el('progression-strip').hidden = !settings.progression;
  el('preview-controls').hidden = !settings.progression;
  const focusedStep = (document.activeElement as HTMLElement)?.dataset.step;
  el('progression-strip').innerHTML = Array.from({ length: template.roman.length }, (_, i) => {
    const c = chordInfo(i);
    return `<button type="button" data-step="${i}" aria-pressed="${i === step}" ${playing ? 'disabled' : ''} class="${i === step ? 'current' : ''} ${settings.loopEnabled && !order.includes(i) ? 'outside-loop' : ''}">${c.name}${c.suffix === 'maj' ? '' : c.suffix}<small>${c.roman}</small>${jazz || modal ? `<small>${progressionDurations(settings)[i]} bar${progressionDurations(settings)[i] === 1 ? '' : 's'}</small>` : ''}</button>`;
  }).join('');
  if (focusedStep !== undefined) el('progression-strip').querySelector<HTMLButtonElement>(`[data-step="${focusedStep}"]`)?.focus({preventScroll: true});
  el('harmony-explanation').textContent = modal ? ('explanation' in template ? String(template.explanation) : '') : MODES[info.mode as keyof typeof MODES].tip;
  el('backing-description').textContent = modal && settings.progression ? `A ${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name} practice loop.` : !settings.progression ? 'One sustained chord. Explore how every note feels against it.' : jazz ? 'Classic jazz changes with fixed chord types. The scale guide follows each chord.' : settings.template === 'diatonic' ? 'Diatonic triads, one bar each.' : settings.template.startsWith('fourths') ? `All 12 roots by perfect fourths, keeping the selected chord type. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord.` : `The same chord type on ${template.roman.join('–')}. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord. Mode notes follow each root.`;

  const colour = characteristicNotes(info);
  const highlight = input('highlight-mode').checked;
  el('characteristic-notes').hidden = !highlight;
  el('characteristic-notes').textContent = `${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name} colour notes: ${colour.map((n: any)=>`${n.name} (${n.degree})`).join(' · ')}. Listen to their character against the chord.`;
  el('characteristic-legend').hidden = !highlight;
  const arpeggio = select('exercise').value === 'arpeggio';
  const displayed = arpeggio ? info.tones : notes();
  el('note-list').innerHTML = displayed.map((n: string, i: number) => `<div class="note ${arpeggio || info.chordPcs.includes(info.scalePcs[i]) ? 'chord-tone' : ''} ${highlight && colour.some((c: any)=>c.pc === (arpeggio ? info.chordPcs[i] : info.scalePcs[i])) ? 'characteristic' : ''}"><strong>${n}</strong><small>${arpeggio ? info.intervals[i] : MODES[info.mode as keyof typeof MODES].degrees[i]}</small></div>`).join('');
  el('exercise-description').textContent = arpeggio ? 'Intervals are measured from the current chord root. Follow the harmony on your instrument.' : settings.progression && settings.template !== 'diatonic' ? `${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name}. Follow the scale guide through the harmony.` : 'Play the scale on your instrument. Highlighted notes belong to the current chord.';
  renderGuitar();
  syncMiniTransport();
}
function renderGuitar() {
  if(exercisePlaying)stopExercisePreview();
  if (previewGripShape) stopPreview();
  positionGrips.clear();
  const showGrip = input('show-grip').checked;
  let requestedFeatured = select('featured-position').value;
  if(!['all','path'].includes(requestedFeatured)){
    select('featured-position').value='all';
    requestedFeatured='all';
  }
  const pathOption=select('featured-position').querySelector<HTMLOptionElement>('option[value="path"]')!;
  pathOption.disabled=!settings.progression;
  if(!settings.progression&&requestedFeatured==='path')select('featured-position').value='all';
  const pathRegion=FRET_REGIONS[select('position-region').value as keyof typeof FRET_REGIONS] || FRET_REGIONS.middle;
  const path=settings.progression?progressionPositionPath(
    Array.from({length:PROGRESSIONS[settings.template as keyof typeof PROGRESSIONS].roman.length},(_,index)=>chordInfo(index)),
    pathRegion,
  ):[];
  const following=settings.progression&&requestedFeatured==='path';
  const featured=following?path[step]?.numeral||'I':'all';
  el('position-path-guide').hidden=!following;
  el('position-path').innerHTML=following?path.map((choice,index)=>{
    const harmony=chordInfo(index);
    return `<button type="button" data-position-step="${index}" data-position="${choice.numeral}" data-shape="${choice.shape}" class="${index===step?'current':''}" aria-pressed="${index===step}" ${playing?'disabled':''}><strong>${escapeHtml(harmony.name+harmony.suffix)}</strong><span>Position ${choice.numeral} · ${choice.shape} shape</span><small>Frets ${choice.start}–${choice.end}</small></button>`;
  }).join(''):'';
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
  el('theory-description').innerHTML = !selectedTheory ? '' : `<div class="theory-description"><h5>${escapeHtml(selectedTheory.name)}</h5><p class="theory-tones">${selectedTheory.names.map((name,i)=>`${escapeHtml(name)} (${escapeHtml(selectedTheory.degrees[i])})`).join(' · ')}</p>${selectedTheory.groups?`<div class="theory-legend">${selectedTheory.groups.map((group,i)=>`<span class="theory-group-${i===0?'a':'b'}"><i>${i===0?'A':'B'}</i>${escapeHtml(group.name)} · ${group.names.map(escapeHtml).join(' – ')}</span>`).join('')}</div>`:'<div class="theory-legend"><span><i class="theory-pentatonic-key"></i>Coloured notes form the pentatonic.</span><span><i class="theory-pentatonic-root-key"></i>Plum ring marks its root; gold remains the modal root.</span></div>'}<p>${escapeHtml(selectedTheory.explanation)}</p><p class="theory-hint">${theoryView.kind==='triads'?'Alternate triad A and triad B as single-note lines. ':'Try short phrases from the coloured notes. '}Degrees are relative to ${escapeHtml(info.scaleNames[0])} ${escapeHtml(mode.name)}.${select('exercise').value==='arpeggio'?' Exploration shows the scale; switching off restores chord tones only.':''}</p></div>`;
  const displayedPositions=POSITIONS.map(position=>{
    const board=fretboardFor(info,position.shape,select('exercise').value==='arpeggio');
    return {...cagedPositionFor(board),geometryShape:position.shape,board};
  });
  const selectedNumeral = featured === 'all' ? overviewPosition : featured;
  const selectedPosition = displayedPositions.find(position=>position.numeral===selectedNumeral) || displayedPositions[0]!;
  overviewPosition = selectedPosition.numeral || 'I';
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
    const gripDetails = !showGrip ? '' : grip ? `<div class="grip-details"><p class="grip-tones">Chord: ${grip.notes.map((n: any,i: number)=>`${n.name} (${grip.intervals[i]})`).join(' · ')}</p><p class="grip-help">${selectedTheory ? 'Strum chord previews the accompanying harmony. Explore the highlighted notes melodically.' : `${grip.omitted.length ? `Omitted: ${grip.omitted.join(' · ')}. ` : ''}Ringed notes form the suggested chord; mute × strings.`}</p><button type="button" class="practice-button grip-preview" data-grip="${position.geometryShape}" data-preview-label="position ${position.numeral}" aria-label="Strum chord, position ${position.numeral}" aria-pressed="false" ${playing ? 'disabled' : ''}>Strum chord</button></div>` : '<p class="grip-help">No compact chord shape fits this position.</p>';
    const title = `${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    return `<article class="position-card featured-position" data-position="${position.numeral}" data-shape="${position.shape}" data-geometry="${position.geometryShape}"><div class="position-heading"><h4>Position ${position.numeral} · ${position.shape} shape</h4><span>Frets ${board.start}–${board.end}</span></div>${diagramSvg(board, guitarDegrees, mode.degrees, title, input('highlight-mode').checked, grip, overlay)}<p class="position-anchor">Parent-shape anchor: ${board.anchorName} · ${['low E','A','D','G','B','high E'][board.rootString]} string, ${board.rootFret === 0 ? 'open' : `fret ${board.rootFret}`}.</p>${gripDetails}</article>`;
  }).join('');
  renderCagedExercise(selectedPosition,fretboardFor(info,selectedPosition.geometryShape),info);
  const parentMajor = parentMajorFor(info);
  el('guitar-parent').hidden = !parentMajor;
  el('guitar-parent').textContent = parentMajor ? `Parent fingering: ${parentMajor.name} ${parentMajor.family.replace(' scale','').toLowerCase()} · current root: ${info.name}.` : '';
  el('guitar-context').textContent = chord;
  el('guitar-scale').textContent = `${info.scaleNames[0]} ${mode.name} · ${info.scaleNames.join(' · ')}`;
  select('fret-view').value = select('exercise').value;
}
function renderBeats(active = -1) {
  el('beat-dots').innerHTML = Array.from({ length: settings.beats }, (_, i) => `<span class="beat ${i === active ? 'active' : ''} ${i === 0 && settings.accent ? 'downbeat' : ''}">${i + 1}</span>`).join('');
}
function fillLoopOptions(reset = false) {
  const count = PROGRESSIONS[select('template').value as keyof typeof PROGRESSIONS].roman.length;
  const start = reset ? 0 : Number(select('loop-start').value || 0);
  const end = reset ? count-1 : Number(select('loop-end').value || 0);
  const loopSettings = {...settings, key:Number(select('key').value), mode:select('quality').value, chord:select('chord').value, template:select('template').value, progression:true};
  for (const [id,value] of [['loop-start',start],['loop-end',end]] as const) {
    select(id).innerHTML = Array.from({length:count},(_,i)=>{const c=harmonyAt(loopSettings,i);return `<option value="${i}">${i+1}. ${c.name}${c.suffix} · ${c.roman}</option>`;}).join('');
    select(id).value = String(Math.min(count-1,value));
  }
}
function updateSpace() {
  el('space-value').textContent = `${input('space').value}%`;
  if (wet && context) wet.gain.setTargetAtTime(Number(input('space').value) / 100 * .65, context.currentTime, .08);
}
function update() {
  if (previewGripShape || activeComparison) stopPreview();
  const previousLoop = [settings.loopEnabled,settings.loopStart,settings.loopEnd].join('|');
  const previous = [settings.key, settings.mode, settings.chord, settings.template].join('|');
  settings.key = Number(select('key').value);
  settings.mode = select('quality').value;
  settings.minor = settings.mode === 'minor';
  settings.chord = select('chord').value;
  settings.sound = select('sound').value;
  settings.drums=input('drums').checked;
  settings.bass=input('bass').checked;
  settings.drumGroove=select('drum-groove').value;
  settings.bassPattern=select('bass-pattern').value;
  settings.drumsVolume=Number(input('drums-volume').value)/100;
  settings.bassVolume=Number(input('bass-volume').value)/100;
  for(const name of ['drums','bass']) {
    el(`${name}-controls`).hidden=!input(name).checked;
    el(`${name}-volume-value`).textContent=`${input(`${name}-volume`).value}%`;
  }
  settings.sequence = input('sequence').checked;
  settings.sequencePattern = select('sequence-pattern').value;
  el('sequence-help').textContent = `${SEQUENCE_PATTERNS[settings.sequencePattern as keyof typeof SEQUENCE_PATTERNS].help} Follows the current chord; Timing sets the step length.`;
  settings.sequenceRate = Number(select('sequence-rate').value);
  settings.sequenceSwing = Number(input('sequence-swing').value)/100;
  settings.sequenceDensity = Number(input('sequence-density').value)/100;
  settings.sequenceVolume = Number(input('sequence-volume').value)/100;
  el('sequence-controls').hidden = !settings.sequence;
  input('sequence-swing').disabled = settings.sequenceRate===3;
  for(const name of ['density','swing','volume']) el(`sequence-${name}-value`).textContent = `${input(`sequence-${name}`).value}%`;
  if(settings.sequenceRate===3) el('sequence-swing-value').textContent='Straight triplets';
  const newTemplate = settings.template !== select('template').value;
  fillLoopOptions(newTemplate || !select('loop-start').options.length);
  settings.template = select('template').value;
  if (newTemplate) input('loop-enabled').checked = false;
  settings.loopEnabled = input('loop-enabled').checked;
  settings.loopStart = Number(select('loop-start').value);
  settings.loopEnd = Number(select('loop-end').value);
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
  el('gap-controls').hidden = !settings.gapEnabled;
  el('template-field').hidden = !settings.progression;
  const diatonic = settings.progression && settings.template === 'diatonic';
  const selectedTemplate = PROGRESSIONS[settings.template as keyof typeof PROGRESSIONS];
  const jazz = settings.progression && selectedTemplate.kind === 'jazz';
  const modal = settings.progression && selectedTemplate.kind === 'modal';
  select('quality').parentElement!.hidden = jazz;
  select('chord').parentElement!.hidden = jazz || diatonic || modal;
  el('mode-tip').hidden = jazz;
  select('chord').disabled = diatonic || modal;
  el('root-label').textContent = jazz ? 'Tonic key' : settings.progression ? 'Starting root' : 'Root note';
  el('chord-label').textContent = settings.progression ? 'Chord type' : 'Pedal chord';
  settings.subdivision = Number(select('subdivision').value);
  settings.accent = input('accent').checked;
  settings.beats = Number(select('beats').value);
  settings.countIn = input('count-in').checked;
  settings.click = Number(input('click').value) / 100;
  settings.harmony = Number(input('harmony').value) / 100;
  el('click-value').textContent = `${Math.round(settings.click * 100)}%`;
  el('harmony-value').textContent = `${Math.round(settings.harmony * 100)}%`;
  if (!playing && previous !== [settings.key, settings.mode, settings.chord, settings.template].join('|')) { stopPreview(); step = 0; }
  if (!playing && settings.progression && settings.loopEnabled && previousLoop !== [settings.loopEnabled,settings.loopStart,settings.loopEnd].join('|')) { stopPreview(); step = progressionStep(settings,0); }
  node?.port.postMessage({ type: 'settings', settings });
  syncMixerDetails();
  updateSpace();
  renderMusic();
  if (!playing) renderBeats();
}
function tempo(value: number) {
  if (activeComparison) stopPreview();
  settings.bpm = Math.max(30, Math.min(240, Math.round(value) || 90));
  currentBpm = settings.bpm;
  input('bpm').value = input('tempo').value = String(settings.bpm);
  syncMiniTransport();
  syncTrainerStatus();
  node?.port.postMessage({ type: 'settings', settings });
}
function reflectPlayback() {
  document.querySelectorAll<HTMLButtonElement>('#guitar-diagrams button').forEach(button => { button.disabled = playing; });
  el('progression-strip').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing; });
  el('position-path').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing; });
  el('play-label').textContent = playing ? 'Stop practicing' : 'Start practicing';
  el('play-icon').textContent = playing ? '■' : '▶';
  el('play').setAttribute('aria-pressed', String(playing));
  el('live-dot').classList.toggle('on', playing);
  select('beats').disabled = input('count-in').disabled = playing;
  if (!playing) { renderBeats(); el('play-status').textContent = 'Take a breath. Start again when you’re ready.'; }
  if (!playing) currentBpm = settings.bpm;
  syncMiniTransport();
  reflectComparison();
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
  stopExercisePreview();
  clearTimeout(gripRingTimer);
  gripRingTimer = undefined;
  previewGeneration++;
  previewHold = null;
  previewing = false;
  previewGripShape = null;
  activeComparison = null;
  reflectComparison();
  reflectChordPreviews();
  el('grip-preview-status').hidden = true;
  el('preview-status').hidden = true;
  if (!playing) {
    node?.port.postMessage({type: 'stop'});
    if (master && context) master.gain.setTargetAtTime(0, context.currentTime, .035);
  }
}
async function prepareAudio() {
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
    wet.gain.value = Number(input('space').value) / 100 * .65;
    reverbGate = context.createGain();
    reverbGate.gain.value = 0;
    node.connect(reverbGate.gain,3);
    wet.connect(reverbGate).connect(master);
    node.port.onmessage = ({ data }) => {
      if (!playing) return;
      if (data.type === 'harmony') { step = data.step; renderMusic(); return; }
      if (typeof data.bpm === 'number') currentBpm = data.bpm;
      syncMiniTransport();
      syncTrainerStatus();
      el('mini-beat').textContent = `${data.beat + 1} / ${settings.beats}`;
      renderBeats(data.beat);
      el('play-status').textContent = data.counting ? `Count-in · ${data.beat + 1} of ${settings.beats}` : `${data.gap ? 'Gap' : 'Playing'} · Bar ${data.bar} · Beat ${data.beat + 1}`;
      if (step !== data.step) { step = data.step; renderMusic(); }
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
      if ((playing || previewing || exercisePlaying) && context?.state !== 'running') {
        stopPreview();
        playing = false;
        reflectPlayback();
        el('play-status').textContent = 'Audio paused by your browser. Press Start to resume.';
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
  if (playing || busy || stopping) return;
  stopPreview();
  const generation = previewGeneration;
  previewHold = hold;
  step = index;
  renderMusic();
  if (!input('audition').checked) return;
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
const positionNumerals=['I','II','III','IV','V'];
function chooseOverviewPosition(numeral:string, focus=false) {
  if(!positionNumerals.includes(numeral))return;
  overviewPosition=numeral;
  select('featured-position').value='all';
  renderGuitar();
  if(focus)positionOverview.querySelector<HTMLButtonElement>(`[data-overview-position="${numeral}"]`)?.focus({preventScroll:true});
}
function moveOverviewPosition(direction:number) {
  if(select('featured-position').value==='path')return;
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
el('position-previous').addEventListener('click',()=>moveOverviewPosition(-1));
el('position-next').addEventListener('click',()=>moveOverviewPosition(1));
function handleExerciseControl(event:Event){
  const target=event.target;
  if(!(target instanceof HTMLInputElement||target instanceof HTMLSelectElement))return;
  const deferredNumber=target instanceof HTMLInputElement&&target.type==='number'&&['exercise-tempo','exercise-auto-increment'].includes(target.id);
  // Rebuilding the panel on each keystroke dismisses mobile number keyboards and
  // makes multi-digit values effectively impossible to enter. Commit those fields
  // when the edit is complete; all other controls remain immediate.
  if(event.type==='input'&&deferredNumber)return;
  if(event.type==='change'&&!deferredNumber)return;
  if(target.id==='exercise-favourites'&&target.value!==''){restoreExercise(exerciseFavourites()[Number(target.value)]);return;}
  stopExercisePreview();
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
  rememberExercise();
  document.getElementById(target.id)?.focus({preventScroll:true});
}
el('caged-exercise').addEventListener('input',handleExerciseControl);
el('caged-exercise').addEventListener('change',handleExerciseControl);
function setNotationFocus(value:boolean) {
  el('caged-exercise').classList.toggle('notation-focused',value);
  document.body.classList.toggle('notation-focus-open',value);
  const button=document.querySelector<HTMLButtonElement>('#exercise-focus');
  if(button){button.textContent=value?'Exit notation focus':'Focus notation';button.setAttribute('aria-pressed',String(value));}
}
async function auditionExerciseNote(index:number){
  if(playing||exercisePlaying||!currentExercise[index])return;await prepareAudio();const note=currentExercise[index],duration=.9,samples=renderJazzGuitarNote(context!.sampleRate,note.midi,duration),buffer=context!.createBuffer(1,samples.length,context!.sampleRate);buffer.copyToChannel(samples,0);const source=context!.createBufferSource(),gain=context!.createGain();source.buffer=buffer;gain.gain.value=.26;source.connect(gain).connect(master!);if(reverb)gain.connect(reverb);source.start();source.stop(context!.currentTime+duration);
}
function chooseOrAuditionExerciseNote(index:number){void auditionExerciseNote(index);}
function exerciseSnapshot(){return {study:exerciseView.study,material:exerciseView.material,motion:exerciseView.motion,rhythm:exerciseView.rhythm,source:exerciseView.source,pattern:exerciseView.pattern,display:exerciseView.display,zoom:exerciseView.zoom,tempo:exerciseView.tempo,tempoLinked:exerciseView.tempoLinked};}
function rememberExercise(){const snapshot=exerciseSnapshot(),encoded=JSON.stringify(snapshot);if(JSON.stringify(exerciseHistory[exerciseHistoryIndex])===encoded)return;exerciseHistory=exerciseHistory.slice(0,exerciseHistoryIndex+1);exerciseHistory.push(snapshot);exerciseHistoryIndex=exerciseHistory.length-1;}
function restoreExercise(snapshot:any){if(!snapshot)return;Object.assign(exerciseView,snapshot);stopExercisePreview();renderGuitar();}
function exerciseFavourites(){try{return JSON.parse(localStorage.getItem(EXERCISE_FAVOURITES_KEY)||'[]');}catch{return [];}}
function favouriteExercise(){const favourites=exerciseFavourites(),snapshot=exerciseSnapshot(),key=JSON.stringify(snapshot);if(!favourites.some((item:any)=>JSON.stringify(item)===key))favourites.push(snapshot);localStorage.setItem(EXERCISE_FAVOURITES_KEY,JSON.stringify(favourites.slice(-30)));const button=document.querySelector<HTMLButtonElement>('#exercise-favourite');if(button)button.textContent='★ Saved';}
function exportExerciseSvg(){
  const svgs=Array.from(document.querySelectorAll<SVGSVGElement>('#caged-exercise .exercise-notation'));if(!svgs.length)return;const width=1200,heights=svgs.map(svg=>Number(svg.viewBox.baseVal.height)||280),height=heights.reduce((a,b)=>a+b,0);let y=0;
  const body=svgs.map((svg,index)=>{const viewWidth=Number(svg.viewBox.baseVal.width)||760,result=`<svg x="0" y="${y}" width="${width}" height="${heights[index]}" viewBox="0 0 ${viewWidth} ${heights[index]}">${svg.innerHTML}</svg>`;y+=heights[index];return result;}).join('');
  const file=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>text{fill:#17201d}.notation-paper,.tab-fret-bg{fill:#fffdf8}.notation-line,.ledger-line,.bar-line,.note-stem{stroke:#26302c}.note-head{fill:#17201d}.note-beam{stroke:#17201d;stroke-width:5}</style>${body}</svg>`,url=URL.createObjectURL(new Blob([file],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download=`mehtronome-${exerciseView.study}.svg`;link.click();URL.revokeObjectURL(url);
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
  // TAB uses SVG text, so prevent the browser's native text-drag gesture from
  // taking over before the passage selector receives pointer movement.
  event.preventDefault();
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
  if(!exerciseDragMoved){exerciseSelectionStart=null;exerciseSelectionEnd=null;reflectExerciseSelection();return;}
  suppressExerciseNoteClick=true;setTimeout(()=>{suppressExerciseNoteClick=false;},0);void toggleExercisePreview();
});
el('caged-exercise').addEventListener('pointercancel',event=>{
  if(exerciseDragPointer!==event.pointerId)return;
  exerciseDragPointer=null;exerciseSelectionStart=null;exerciseSelectionEnd=null;reflectExerciseSelection();
});
el('caged-exercise').addEventListener('click',event=>{
  if(!(event.target instanceof Element))return;
  if(event.target.closest('#exercise-play-range')){void toggleExercisePreview();return;}
  if(event.target.closest('#exercise-clear-range')){if(exercisePlaying)stopExercisePreview();exerciseSelectionStart=null;exerciseSelectionEnd=null;reflectExerciseSelection();return;}
  if(event.target.closest('#exercise-preview'))void toggleExercisePreview();
  if(event.target.closest('#exercise-focus'))setNotationFocus(!el('caged-exercise').classList.contains('notation-focused'));
  const note=event.target.closest<SVGElement>('.exercise-note');if(note){if(suppressExerciseNoteClick)suppressExerciseNoteClick=false;else chooseOrAuditionExerciseNote(Number(note.dataset.noteIndex));}
  const ratio=event.target.closest<HTMLElement>('[data-tempo-ratio]');if(ratio){exerciseView.tempoLinked=ratio.dataset.tempoRatio==='1';exerciseView.tempo=Math.round(settings.bpm*Number(ratio.dataset.tempoRatio));renderGuitar();}
  if(event.target.closest('#exercise-history-back')&&exerciseHistoryIndex>0)restoreExercise(exerciseHistory[--exerciseHistoryIndex]);
  if(event.target.closest('#exercise-history-forward')&&exerciseHistoryIndex<exerciseHistory.length-1)restoreExercise(exerciseHistory[++exerciseHistoryIndex]);
  if(event.target.closest('#exercise-favourite'))favouriteExercise();
  if(event.target.closest('#exercise-export'))exportExerciseSvg();
  if(event.target.closest('#exercise-print'))window.print();
});
el('caged-exercise').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof SVGElement&&event.target.matches('.exercise-note')){event.preventDefault();chooseOrAuditionExerciseNote(Number(event.target.dataset.noteIndex));}});
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
const progressionStrip = el('progression-strip');
const chordButton = (target: EventTarget | null) => target instanceof HTMLElement ? target.closest<HTMLButtonElement>('button[data-step]') : null;
progressionStrip.addEventListener('pointerdown', event => {
  const button = chordButton(event.target);
  if (!button || button.disabled || event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  button.focus();
  void previewChord(Number(button.dataset.step), `pointer:${event.pointerId}`);
  // Capture on the stable container: selecting a chord redraws its buttons.
  progressionStrip.setPointerCapture(event.pointerId);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
  window.addEventListener(type, event => {
    if (previewHold === `pointer:${event.pointerId}`) stopPreview();
  });
}
progressionStrip.addEventListener('keydown', event => {
  const button = chordButton(event.target);
  if (!button || button.disabled || !['Space', 'Enter'].includes(event.code)) return;
  event.preventDefault();
  if (!event.repeat) void previewChord(Number(button.dataset.step), `key:${event.code}`);
});
window.addEventListener('keyup', event => {
  if (previewHold === `key:${event.code}`) { event.preventDefault(); stopPreview(); }
});
window.addEventListener('blur', stopPreview);
progressionStrip.addEventListener('focusout', () => {
  // Let a redraw restore focus before deciding whether keyboard focus left.
  queueMicrotask(() => {
    if (!previewGripShape && previewHold?.startsWith('key:') && !progressionStrip.contains(document.activeElement)) stopPreview();
  });
});
progressionStrip.addEventListener('contextmenu', event => { if (previewHold) event.preventDefault(); });
// Assistive technology can select a chord without synthesizing a held press.
progressionStrip.addEventListener('click', event => {
  const button = chordButton(event.target);
  if (button && !playing) { step = Number(button.dataset.step); renderMusic(); }
});
input('space').addEventListener('input', updateSpace);
input('audition').addEventListener('input', () => { if (!input('audition').checked) stopPreview(); });
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

el('play').addEventListener('click', () => void toggle());
input('bpm').addEventListener('change', () => tempo(Number(input('bpm').value)));
input('tempo').addEventListener('input', () => tempo(Number(input('tempo').value)));
el('slower').addEventListener('click', () => tempo(settings.bpm - 1));
el('faster').addEventListener('click', () => tempo(settings.bpm + 1));
for (const id of ['trainer-enabled','trainer-bars','trainer-increment','trainer-target','show-grip','highlight-mode','gap-enabled','gap-play','gap-mute','gap-target','loop-enabled','loop-start','loop-end','drums','bass','drum-groove','bass-pattern','drums-volume','bass-volume','sequence','sequence-pattern','sequence-rate','sequence-density','sequence-swing','sequence-volume','key', 'sound', 'chord', 'template', 'subdivision', 'accent', 'beats', 'count-in', 'exercise', 'click', 'harmony']) el(id).addEventListener('input', update);
for (const mode of ['pedal', 'progression']) {
  el(mode).addEventListener('click', () => {
    settings.progression = mode === 'progression';
    stopPreview();
    step = 0;
    for (const id of ['pedal', 'progression']) {
      el(id).classList.toggle('selected', mode === id);
      el(id).setAttribute('aria-pressed', String(mode === id));
    }
    const selectedTemplate = PROGRESSIONS[select('template').value as keyof typeof PROGRESSIONS];
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
  const template = PROGRESSIONS[select('template').value as keyof typeof PROGRESSIONS];
  if (template.kind === 'modal' && 'mode' in template) { select('quality').value = String(template.mode); fillChords(); update(); }
});

document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest('input, select, button, a, textarea, summary, [contenteditable]'))) {
    event.preventDefault(); void toggle();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (playing) void stop(); else stopPreview(); }
});
function syncMixerDetails() {
  if ((settings.drums && !mixerDrums) || (settings.bass && !mixerBass)) el<HTMLDetailsElement>('rhythm-details').open = true;
  if (settings.sequence && !mixerSequence) el<HTMLDetailsElement>('sequence-details').open = true;
  mixerDrums = settings.drums; mixerBass = settings.bass; mixerSequence = settings.sequence;
}
function syncTrainerStatus() {
  el('bpm-caption').textContent=settings.trainerEnabled?'STARTING BPM':'BEATS PER MINUTE';
  el('trainer-status').textContent = !settings.trainerEnabled ? 'Starts at your selected tempo.' : playing ? `${currentBpm} BPM · ${currentBpm >= Math.max(settings.bpm,settings.trainerTarget) ? 'Target reached' : `towards ${settings.trainerTarget} BPM`}. Starting tempo: ${settings.bpm} BPM.` : `Start at ${settings.bpm} BPM; add ${settings.trainerIncrement} every ${settings.trainerBars} bars, up to ${Math.max(settings.bpm,settings.trainerTarget)} BPM.`;
}
function syncMiniTransport() {
  const mini = el('mini-transport');
  mini.hidden = transportInView && !focusView;
  if (document.activeElement !== input('mini-bpm')) input('mini-bpm').value = String(playing ? currentBpm : settings.bpm);
  el('mini-tempo-label').textContent = playing && settings.trainerEnabled ? 'LIVE BPM' : 'BPM';
  el('mini-play').textContent = playing ? '■ Stop' : '▶ Play';
  el('mini-play').setAttribute('aria-pressed',String(playing));
  el<HTMLButtonElement>('mini-play').disabled = busy || stopping;
  const info = chordInfo(step);
  el('mini-chord').textContent = info.name+info.suffix;
  el('mini-mode').textContent = `${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name}`;
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
new IntersectionObserver(entries => { transportInView = entries[0].isIntersecting; syncMiniTransport(); },{threshold:.15}).observe(el('pulse-title').closest('section')!);
el('mini-play').addEventListener('click',()=>void toggle());
input('mini-bpm').addEventListener('change',()=>{ tempo(Number(input('mini-bpm').value)); input('mini-bpm').value=String(settings.bpm); });
select('mini-key').addEventListener('input',()=>{select('key').value=select('mini-key').value;update();});
select('mini-mode-select').addEventListener('input',()=>{
  select('quality').value=select('mini-mode-select').value;
  if(select('template').value.startsWith('modal_'))select('template').value=`modal_${select('quality').value}`;
  fillChords();update();
});
select('mini-chord-select').addEventListener('input',()=>{select('chord').value=select('mini-chord-select').value;update();});
input('mini-count-in').addEventListener('input',()=>{input('count-in').checked=input('mini-count-in').checked;update();});
input('mini-accent').addEventListener('input',()=>{input('accent').checked=input('mini-accent').checked;update();});
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
  syncMiniTransport();
  if(value)el('harmony-title').scrollIntoView({block:'start'});
}
el('focus-view').addEventListener('click',()=>setFocusView(!focusView));
el('exit-focus').addEventListener('click',()=>setFocusView(false));
select('featured-position').addEventListener('input',renderGuitar);
select('position-region').addEventListener('input',renderGuitar);
el('position-path').addEventListener('click',event=>{
  const button=event.target instanceof HTMLElement?event.target.closest<HTMLButtonElement>('button[data-position-step]'):null;
  if(!button||button.disabled)return;
  stopPreview();
  step=Number(button.dataset.positionStep);
  renderMusic();
});
function reflectComparison() {
  for(const slot of ['a','b'] as const){
    const captured=comparisons[slot];
    el('compare-name-'+slot).textContent=captured?.name || 'No chord captured';
    const button=el<HTMLButtonElement>('compare-play-'+slot);
    button.disabled=!captured || playing || busy || stopping;
    button.setAttribute('aria-pressed',String(activeComparison===slot));
    button.textContent=activeComparison===slot?`Stop ${slot.toUpperCase()}`:`Listen to ${slot.toUpperCase()}`;
  }
  el<HTMLButtonElement>('compare-swap').disabled=!comparisons.a || !comparisons.b || playing || busy || stopping;
  el('compare-status').textContent=activeComparison?`Listening to ${activeComparison.toUpperCase()} · ${comparisons[activeComparison]!.name}`:'Capture two chords to compare.';
}
for(const slot of ['a','b'] as const){
  el('compare-'+slot).addEventListener('click',()=>{
    if(activeComparison)stopPreview();
    const info=chordInfo(step);comparisons[slot]={settings:{...settings},step,name:info.name+info.suffix};reflectComparison();
  });
  el('compare-play-'+slot).addEventListener('click',()=>void previewComparison(slot));
}
async function previewComparison(slot:'a'|'b') {
  const captured=comparisons[slot];if(!captured || playing || busy || stopping)return;
  if(activeComparison===slot){stopPreview();return;}
  stopPreview();const generation=previewGeneration;activeComparison=slot;reflectComparison();
  try{
    previewPreparation ??= prepareAudio().finally(()=>{previewPreparation=undefined;});await previewPreparation;
    if(generation!==previewGeneration || document.hidden)return;
    previewing=true;
    node!.port.postMessage({type:'audition',settings:{...captured.settings,harmony:settings.harmony},step:captured.step});
  }catch(error){stopPreview();el('error').textContent=error instanceof Error?error.message:'Could not compare chords.';el('error').hidden=false;}
}
el('compare-swap').addEventListener('click',()=>void previewComparison(activeComparison==='a'?'b':'a'));
fillChords();
update();

function reflectTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  select('palette').value = document.documentElement.dataset.palette || (dark ? 'dark' : 'light');
  el('theme').setAttribute('aria-pressed', String(dark));
  el('theme').textContent = dark ? 'Light mode' : 'Dark mode';
}
function applyTheme(palette: string) {
  document.documentElement.dataset.palette = palette;
  document.documentElement.dataset.theme = ['dark', 'midnight', 'plum'].includes(palette) ? 'dark' : 'light';
  try { localStorage.setItem('mehtronome-theme', palette); } catch { /* Session-only if storage is unavailable. */ }
  // An explicit choice replaces a preview link's theme on reload.
  const url = new URL(location.href);
  url.searchParams.delete('theme');
  history.replaceState(null, '', url);
  reflectTheme();
}
select('palette').addEventListener('input', () => applyTheme(select('palette').value));
el('theme').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
reflectTheme();

type PracticePreset = {id:string; name:string; progression:boolean; controls:Record<string,string | boolean>};
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
  reflectComparison();
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
  return {id,name,controls,progression:settings.progression};
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
  } else if (control.type === 'checkbox') {
    if (typeof value === 'boolean') control.checked = value;
  } else if (typeof value === 'string' && Number.isFinite(Number(value))) {
    const number = Number(value);
    control.value = String(Math.max(Number(control.min),Math.min(Number(control.max),number)));
  }
}
el('preset-load').addEventListener('click',async()=>{
  const preset = presets.find(p => p.id === select('preset-list').value);
  if (!preset || busy || stopping) return;
  busy = true;
  reflectPresetButtons();
  try {
    stopPreview();
    if (playing) await stop();
    // Presets saved before these features existed keep their original behavior.
    for (const [id,value] of Object.entries({'trainer-enabled':false,'trainer-bars':'4','trainer-increment':'2','trainer-target':'120','featured-position':'all'})) {
      if (!(id in preset.controls)) restoreControl(id,value);
    }
    restoreControl('quality',preset.controls.quality);
    restoreControl('key',preset.controls.key);
    settings.progression = preset.progression;
    fillChords(); // Refresh mode-dependent template availability before restoring it.
    restoreControl('template',preset.controls.template);
    const restoredTemplate = PROGRESSIONS[select('template').value as keyof typeof PROGRESSIONS];
    if (settings.progression && restoredTemplate.kind === 'modal' && 'mode' in restoredTemplate) select('quality').value = String(restoredTemplate.mode);
    for (const id of ['pedal','progression']) {
      const selected = (id === 'progression') === settings.progression;
      el(id).classList.toggle('selected',selected);
      el(id).setAttribute('aria-pressed',String(selected));
    }
    fillChords();
    for (const id of PRESET_CONTROLS) if (!id.startsWith('theory-') && !['quality','key','template','loop-enabled','loop-start','loop-end'].includes(id)) restoreControl(id,preset.controls[id]);
    tempo(Number(input('bpm').value));
    guitarDegrees = select('fret-labels').value === 'degrees';
    restoreTheoryViews(preset.controls);
    step = 0;
    update();
    for (const id of ['loop-enabled','loop-start','loop-end']) restoreControl(id,preset.controls[id]);
    update();
    input('preset-name').value = preset.name;
    el('preset-status').textContent = `Loaded “${preset.name}”. Ready to practice.`;
  } finally { busy = false; reflectPresetButtons(); }
});
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
