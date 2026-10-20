import { recommendedGrip } from './guitar/grips.js';
import { PRESET_KEY, PRESET_CONTROLS, readPresets, writePresets } from './practice/presets.js';
import { SEQUENCE_PATTERNS } from './audio/sequence.js';
import { loadDrumKit } from './audio/load-kit.js';
import './style.css';
import './themes.css';
import { POSITIONS, fretboardFor, diagramSvg, parentMajorFor } from './guitar/fretboard.js';
import { DROP_TYPES, STRING_SETS, guitarVoicings, voicingSvg } from './guitar/voicings.js';
import { DRUM_GROOVES, BASS_PATTERNS } from './audio/rhythm.js';
import workletUrl from './audio/worklet.js?worker&url';
import { DEFAULTS } from './audio/engine.js';
import { MODES, CHORDS, SOUNDS, compatibleChords, PROGRESSIONS, progressionDurations, progressionOrder, progressionStep, characteristicNotes, harmonyAt } from './audio/music.js';

const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
function modeOptions() {
  return ['Major scale', 'Melodic minor', 'Harmonic minor'].map(family =>
    `<optgroup label="${family}">${Object.entries(MODES).filter(([, mode]) => ('family' in mode ? mode.family : 'Major scale') === family).map(([id, mode]) => `<option value="${id}" ${id === 'dorian' ? 'selected' : ''}>${mode.name}</option>`).join('')}</optgroup>`
  ).join('');
}
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Mehtronome home"><span class="brand-mark">m<span>·</span></span>mehtronome</a><span class="header-note">A little rhythm. A little harmony.</span><div class="theme-controls"><label class="theme-picker">Theme<select id="palette" aria-label="Page theme"><option value="light">Original light</option><option value="dark">Original dark</option><option value="midnight">Midnight Studio</option><option value="paper">Warm Paper</option><option value="plum">Plum Session</option><option value="slate">Slate Minimal</option></select></label><button id="theme" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">Dark mode</button></div></header>
<main>
  <div class="intro"><div><p class="eyebrow">MAKE SPACE FOR PRACTICE</p><h1>Find your rhythm.<br><em>Hear the harmony.</em></h1></div><p class="intro-copy">Give your scales somewhere to go.<br>A steady pulse and a little harmonic context.</p></div>
  <section class="presets panel" aria-labelledby="presets-title">
    <div class="section-heading"><h2 id="presets-title">Practice presets</h2><span class="small-label">PICK UP WHERE YOU LEFT OFF</span></div>
    <div class="preset-fields"><label>Preset name<input id="preset-name" type="text" maxlength="60" placeholder="e.g. D Dorian · slow groove"></label><button id="preset-save" class="practice-button">Save new</button><label>Saved setups<select id="preset-list"><option value="">Choose a preset</option></select></label><div class="preset-actions"><button id="preset-load" class="practice-button" disabled>Load</button><button id="preset-update" class="practice-button" disabled>Update</button><button id="preset-delete" class="practice-button" disabled>Delete</button></div></div>
    <p id="preset-status" class="practice-help" role="status">Saved on this browser. Loading a preset stops playback.</p>
  </section>
  <div class="workspace">
    <section class="transport panel" aria-labelledby="pulse-title">
      <div class="section-heading"><h2 id="pulse-title">The pulse</h2><span class="live-dot" id="live-dot"></span></div>
      <div class="tempo-controls"><button class="round" id="slower" aria-label="Decrease tempo">−</button><div><label class="sr-only" for="bpm">Tempo in beats per minute</label><input id="bpm" type="number" min="30" max="240" value="90"><span class="bpm-label">BEATS PER MINUTE</span></div><button class="round" id="faster" aria-label="Increase tempo">+</button></div>
      <label class="sr-only" for="tempo">Tempo</label><input id="tempo" class="tempo-range" type="range" min="30" max="240" value="90"><div class="range-limits"><span>30 · LARGO</span><span>240 · PRESTISSIMO</span></div>
      <div class="beat-dots" id="beat-dots" aria-hidden="true"></div>
      <p class="play-status" id="play-status" role="status">Your next good practice starts here.</p>
      <button class="play-button" id="play" aria-pressed="false"><span id="play-icon">▶</span><span id="play-label">Start practicing</span><kbd>SPACE</kbd></button>
      <div class="pulse-options">
      <div class="transport-options"><label>Beats / bar <select id="beats" aria-label="Beats per bar"><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label><label class="check"><input type="checkbox" id="count-in">One-bar count-in</label></div>
      <div class="transport-options subdivision-options"><label>Subdivision <select id="subdivision"><option value="1">Quarter notes</option><option value="2">Eighth notes</option><option value="3">Eighth-note triplets</option><option value="4">Sixteenth notes</option><option value="6">Sixteenth-note sextuplets</option></select></label><label class="check"><input id="accent" type="checkbox" checked>Accent beat one</label></div>
      </div>
      <div class="practice-block gap-training"><label class="check"><input id="gap-enabled" type="checkbox">Gap training</label><div id="gap-controls" hidden><div class="field-row"><label>Audible bars<select id="gap-play"><option>1</option><option>2</option><option selected>4</option><option>8</option></select></label><label>Gap bars<select id="gap-mute"><option>1</option><option>2</option><option>4</option></select></label></div><label class="template-field">Mute during gaps<select id="gap-target"><option value="all">Click + backing</option><option value="click">Click only</option><option value="backing">Backing only</option></select></label><p class="practice-help">Keep playing through the gap. The harmony and pulse continue underneath; the count-in stays audible.</p></div></div>
    </section>
    <section class="harmony panel" aria-labelledby="harmony-title">
      <div class="section-heading"><h2 id="harmony-title">The harmony</h2><span class="small-label">YOUR MUSICAL CONTEXT</span></div>
      <div class="field-row"><label><span id="root-label">Root note</span><select id="key">${names.map((n, i) => `<option value="${i}" ${i === 9 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Mode<select id="quality">${modeOptions()}</select></label></div>
      <div class="field-row sound-row"><label>Backing sound<select id="sound">${Object.entries(SOUNDS).map(([id, sound]) => `<option value="${id}">${sound.name}</option>`).join('')}</select></label><label><span id="chord-label">Pedal chord</span><select id="chord"></select></label></div>

      <p id="mode-tip" class="mode-tip"></p>
      <div class="mode-label">BACKING</div><div class="segmented" role="group" aria-label="Harmony backing"><button id="pedal" class="selected" aria-pressed="true">Pedal chord</button><button id="progression" aria-pressed="false">Chord progression</button></div>
      <label id="template-field" class="template-field" hidden>Progression template<select id="template">${Object.entries(PROGRESSIONS).map(([id, template]) => `<option value="${id}">${template.name}</option>`).join('')}</select></label>
      <div class="chord-stage"><span class="small-label" id="chord-caption">LET IT RING</span><div id="chord-name">C<span>maj</span></div><p id="chord-notes">C · E · G</p></div>
      <div class="progression-strip" id="progression-strip" hidden></div>
      <div id="loop-controls" class="practice-block" hidden><label class="check"><input id="loop-enabled" type="checkbox">Loop selected chords</label><div id="loop-range" hidden><div class="field-row"><label>Start chord<select id="loop-start"></select></label><label>End chord<select id="loop-end"></select></label></div><p id="loop-summary" class="practice-help"></p></div></div>
      <div id="preview-controls" hidden><p>While stopped, hold a chord to hear it. Release to stop; its diagrams stay selected.</p><label class="check"><input id="audition" type="checkbox" checked>Sound preview</label><span id="preview-status" role="status" hidden>Release to stop</span></div>
      <p class="backing-description" id="backing-description">One sustained chord. Explore how every note feels against it.</p>
    </section>
    <section class="notes panel" aria-labelledby="notes-title"><div class="section-heading"><h2 id="notes-title">Under your fingers</h2><label class="exercise-label">Exercise <select id="exercise"><option value="scale">Scale</option><option value="arpeggio">Arpeggio</option></select></label></div><label class="check characteristic-toggle"><input id="highlight-mode" type="checkbox" checked>Highlight modal colour notes</label><p id="characteristic-notes" class="practice-help"></p><div id="note-list" class="note-list"></div><p id="exercise-description">Play these notes on your instrument, at your own pace.</p></section>
    <section class="mix panel" aria-labelledby="mix-title"><div class="section-heading"><h2 id="mix-title">Your mix</h2><span class="small-label">FIND THE BALANCE</span></div>
      <div class="mix-sections">
        <section class="mix-levels mix-group" aria-labelledby="levels-title"><h3 id="levels-title">Levels & ambience</h3><label class="volume-label" for="click">Click <output id="click-value">50%</output></label><input id="click" type="range" min="0" max="100" value="50"><label class="volume-label" for="harmony">Harmony <output id="harmony-value">35%</output></label><input id="harmony" type="range" min="0" max="100" value="35"><label class="volume-label" for="space">Ambient space <output id="space-value">75%</output></label><input id="space" type="range" min="0" max="100" value="75"></section>
    <section class="rhythm mix-group" aria-labelledby="rhythm-title">
      <div class="section-heading"><h3 id="rhythm-title">Drums & bass</h3></div>
      <p class="sequence-help">Five styles for each instrument, with syncopated bass lines, drum ghost notes and four-bar turnarounds. Follows your tempo, beats per bar and chord changes. Starts after the count-in; chord previews stay sustained.</p>
      <div class="field-row rhythm-instruments">
        <div class="rhythm-instrument"><label class="check rhythm-toggle"><input id="drums" type="checkbox">Drums</label><div id="drums-controls" hidden><label>Drum style<select id="drum-groove">${Object.entries(DRUM_GROOVES).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label class="volume-label" for="drums-volume">Drums volume <output id="drums-volume-value">35%</output></label><input id="drums-volume" type="range" min="0" max="100" value="35"></div></div>
        <div class="rhythm-instrument"><label class="check rhythm-toggle"><input id="bass" type="checkbox">Bass</label><div id="bass-controls" hidden><label>Bass style<select id="bass-pattern">${Object.entries(BASS_PATTERNS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label class="volume-label" for="bass-volume">Bass volume <output id="bass-volume-value">40%</output></label><input id="bass-volume" type="range" min="0" max="100" value="40"></div></div>
      </div>
    </section>
    <section class="sequence mix-group" aria-labelledby="sequence-title">
      <div class="section-heading"><h3 id="sequence-title">Melodic movement</h3><label class="check"><input id="sequence" type="checkbox">Enable sequence</label></div>
      <p id="sequence-help" class="sequence-help">A quiet chord-tone pattern, locked to the pulse and current harmony.</p>
      <div id="sequence-controls" hidden>
        <div class="field-row"><label>Pattern<select id="sequence-pattern">${Object.entries(SEQUENCE_PATTERNS).map(([id,pattern])=>`<option value="${id}">${pattern.name}</option>`).join('')}</select></label><label>Timing<select id="sequence-rate"><option value="2">Eighth notes</option><option value="4">Sixteenth notes</option><option value="3">Eighth-note triplets</option></select></label></div>
        <div class="sequence-sliders"><label class="volume-label" for="sequence-density">Density <output id="sequence-density-value">65%</output></label><input id="sequence-density" type="range" min="0" max="100" value="65"><label class="volume-label" for="sequence-swing">Swing <output id="sequence-swing-value">0%</output></label><input id="sequence-swing" type="range" min="0" max="60" value="0"><label class="volume-label" for="sequence-volume">Sequence volume <output id="sequence-volume-value">25%</output></label><input id="sequence-volume" type="range" min="0" max="100" value="25"></div>
      </div>
    </section>
      </div>
    </section>
    <section class="guitar panel" aria-labelledby="guitar-title">
      <div class="section-heading"><div><p class="eyebrow">TAKE IT TO THE FRETBOARD</p><h2 id="guitar-title">Guitar reference</h2></div><span class="small-label">STANDARD TUNING · E A D G B E</span></div>
      <div class="guitar-guide guitar-overview">
        <h3 id="guitar-context"></h3><p id="guitar-scale"></p><p id="guitar-parent" class="guitar-help"></p>
        <div class="guitar-controls"><label>Diagram<select id="fret-view"><option value="scale">Scale + chord tones</option><option value="arpeggio">Chord tones only</option></select></label><label>Labels<select id="fret-labels"><option value="notes">Note names</option><option value="degrees" selected>Scale degrees</option></select></label></div>
        <label class="check grip-toggle"><input id="show-grip" type="checkbox" aria-describedby="grip-toggle-help" checked>Highlight chord shapes</label><p id="grip-toggle-help" class="guitar-help">Turn off to show all scale notes at full brightness.</p><p id="grip-preview-status" class="guitar-help" role="status" hidden>Chord ringing · click a grip to strum again.</p><div class="guitar-legend"><span><i class="root"></i>Chord root</span><span><i class="chord"></i>Chord tone</span><span><i class="scale"></i>Scale tone</span><span id="grip-legend"><i class="grip"></i>Grip · numbers = fingers</span><span id="characteristic-legend"><i class="characteristic"></i>Modal colour note</span></div>
      </div>
      <div id="guitar-diagrams" class="guitar-diagrams"></div>
      <div class="guitar-guide"><p class="guitar-help">Major-scale modes share their parent-major CAGED fingerings. Gold dots mark the current chord/modal root. With the grip overlay on, play only the solid-ring notes together. Faded notes remain available for scale or arpeggio practice. Click Strum grip while stopped to hear a warm nylon-string guitar chord at your Harmony volume. Ambient space adds reverb. Let it ring, or click again to strum again.</p>
        <p class="guitar-help">High E is at the top, low E at the bottom. Frets increase from left to right. Open-position forms are moved up an octave so every position uses fretted notes.</p>
      </div>
    </section>
    <section class="voicings panel" aria-labelledby="voicings-title">
      <div class="section-heading"><div><p class="eyebrow">PLAY THE HARMONY</p><h2 id="voicings-title">Guitar chord voicings</h2></div><span class="small-label">FOUR-NOTE CHORD SHAPES · × = MUTE</span></div>
      <div class="guitar-guide guitar-overview"><h3 id="voicings-chord"></h3><p id="voicings-tones"></p><div class="guitar-controls voicing-controls"><label>Voicing<select id="voicing-type">${Object.entries(DROP_TYPES).map(([id,type])=>`<option value="${id}">${type.name}</option>`).join('')}</select></label><label>String set<select id="voicing-strings"></select></label><label>Labels<select id="voicing-labels"><option value="notes">Note names</option><option value="intervals" selected>Chord intervals</option></select></label></div></div>
      <div class="guitar-guide"><p id="voicings-description" class="guitar-help"></p></div>
      <div id="voicing-diagrams" class="guitar-diagrams"></div>
      <div class="guitar-guide"><p class="guitar-help">Play the four marked notes together; mute strings marked ×. All grips use fretted notes. These diagrams follow the current chord; backing audio keeps its existing voicing.</p></div>
    </section>
  </div>
  <p id="error" class="error" role="alert" hidden></p>
  <footer><span><span class="footer-dot">●</span> Made for listening, not rushing.</span><span><a class="theme-preview-link" href="./themes.html">Compare themes</a> · Headphones on. Distractions off.</span></footer>
</main>`;

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
const positionGrips = new Map<string, ReturnType<typeof recommendedGrip>>();
let previewGeneration = 0;

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
  el('chord-caption').textContent = !settings.progression ? 'LET IT RING' : settings.loopEnabled ? `${order.reduce((sum: number,i: number)=>sum+progressionDurations(settings)[i],0)}-BAR SELECTED LOOP` : jazz ? `${progressionDurations(settings).reduce((sum: number, bars: number) => sum + bars, 0)}-BAR JAZZ LOOP` : template.bars === 2 ? 'TWO BARS PER CHORD' : 'ONE BAR PER CHORD';
  el('progression-strip').classList.toggle('blues', template.roman.length === 12);
  el('progression-strip').hidden = !settings.progression;
  el('preview-controls').hidden = !settings.progression;
  const focusedStep = (document.activeElement as HTMLElement)?.dataset.step;
  el('progression-strip').innerHTML = Array.from({ length: template.roman.length }, (_, i) => {
    const c = chordInfo(i);
    return `<button type="button" data-step="${i}" aria-pressed="${i === step}" ${playing ? 'disabled' : ''} class="${i === step ? 'current' : ''} ${settings.loopEnabled && !order.includes(i) ? 'outside-loop' : ''}">${c.name}${c.suffix === 'maj' ? '' : c.suffix}<small>${c.roman}</small>${jazz ? `<small>${progressionDurations(settings)[i]} bar${progressionDurations(settings)[i] === 1 ? '' : 's'}</small>` : ''}</button>`;
  }).join('');
  if (focusedStep !== undefined) el('progression-strip').querySelector<HTMLButtonElement>(`[data-step="${focusedStep}"]`)?.focus({preventScroll: true});
  el('backing-description').textContent = !settings.progression ? 'One sustained chord. Explore how every note feels against it.' : jazz ? 'Classic jazz changes with fixed chord types. The scale guide follows each chord.' : settings.template === 'diatonic' ? 'Diatonic triads, one bar each.' : settings.template.startsWith('fourths') ? `All 12 roots by perfect fourths, keeping the selected chord type. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord.` : `The same chord type on ${template.roman.join('–')}. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord. Mode notes follow each root.`;

  const colour = characteristicNotes(info);
  const highlight = input('highlight-mode').checked;
  el('characteristic-notes').hidden = !highlight;
  el('characteristic-notes').textContent = `${info.scaleNames[0]} ${MODES[info.mode as keyof typeof MODES].name} colour notes: ${colour.map((n: any)=>`${n.name} (${n.degree})`).join(' · ')}. Listen to their character against the chord.`;
  el('characteristic-legend').hidden = !highlight;
  const arpeggio = select('exercise').value === 'arpeggio';
  const displayed = arpeggio ? info.tones : notes();
  el('note-list').innerHTML = displayed.map((n: string, i: number) => `<div class="note ${arpeggio || info.chordPcs.includes(info.scalePcs[i]) ? 'chord-tone' : ''} ${highlight && colour.some((c: any)=>c.pc === (arpeggio ? info.chordPcs[i] : info.scalePcs[i])) ? 'characteristic' : ''}"><strong>${n}</strong><small>${arpeggio ? info.intervals[i] : MODES[info.mode as keyof typeof MODES].degrees[i]}</small></div>`).join('');
  el('exercise-description').textContent = arpeggio ? 'Intervals are measured from the current chord root. Follow the harmony on your instrument.' : settings.progression && settings.template !== 'diatonic' ? `${info.name} ${MODES[info.mode as keyof typeof MODES].name}. The scale follows each chord root.` : 'Play the scale on your instrument. Highlighted notes belong to the current chord.';
  renderGuitar();
  renderVoicings();
}
function renderGuitar() {
  if (previewGripShape) stopPreview();
  positionGrips.clear();
  const showGrip = input('show-grip').checked;
  el('grip-legend').hidden = !showGrip;
  const info = chordInfo(step);
  const chord = `${info.name}${info.suffix}`;
  const mode = MODES[info.mode as keyof typeof MODES];
  el('guitar-diagrams').innerHTML = POSITIONS.map(position => {
    const board = fretboardFor(info, position.shape, select('exercise').value === 'arpeggio');
    const grip = showGrip ? recommendedGrip(info, board) : null;
    positionGrips.set(position.shape,grip);
    const gripDetails = !showGrip ? '' : grip ? `<div class="grip-details"><p class="grip-tones">Grip: ${grip.notes.map((n: any,i: number)=>`${n.name} (${grip.intervals[i]})`).join(' · ')}</p><p class="grip-help">${grip.omitted.length ? `Omitted: ${grip.omitted.join(' · ')}. ` : ''}${grip.barres.map((b: any)=>`Finger ${b.finger}: barre strings ${6-b.from}–${6-b.to} at fret ${b.fret}. `).join('')}Mute × strings when playing the grip.</p><button type="button" class="practice-button grip-preview" data-grip="${position.shape}" aria-label="Strum grip, position ${position.numeral}" ${playing ? 'disabled' : ''}>Strum grip</button></div>` : '<p class="grip-help">No compact grip fits this position.</p>';
    const title = `${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    return `<article class="position-card" data-position="${position.numeral}"><div class="position-heading"><h4>Position ${position.numeral}</h4><span>Frets ${board.start}–${board.end}</span></div>${diagramSvg(board, guitarDegrees, mode.degrees, title, input('highlight-mode').checked, grip)}<p class="position-anchor">Shape anchor: ${board.anchorName} · ${['low E','A','D','G','B','high E'][board.rootString]} string, ${board.rootFret === 0 ? 'open' : `fret ${board.rootFret}`}.</p>${gripDetails}</article>`;
  }).join('');
  const parentMajor = parentMajorFor(info);
  el('guitar-parent').hidden = !parentMajor;
  el('guitar-parent').textContent = parentMajor ? `CAGED shapes: ${parentMajor.name} major · chord/modal root: ${info.name}.` : '';
  el('guitar-context').textContent = chord;
  el('guitar-scale').textContent = `${info.scaleNames[0]} ${mode.name} · ${info.scaleNames.join(' · ')}`;
  select('fret-view').value = select('exercise').value;
}
function renderVoicings() {
  const info = chordInfo(step);
  const chord = `${info.name}${info.suffix}`;
  const type = select('voicing-type').value;
  const sets = STRING_SETS[type as keyof typeof STRING_SETS];
  const previousSet = select('voicing-strings').value;
  select('voicing-strings').innerHTML = sets.map(set => `<option value="${set.id}">${set.label}</option>`).join('');
  if (sets.some(set => set.id === previousSet)) select('voicing-strings').value = previousSet;
  const result = guitarVoicings(info, type, select('voicing-strings').value);
  el('voicings-chord').textContent = chord;
  el('voicings-tones').textContent = `Included: ${result.indices.map((i: number) => `${info.tones[i]} (${info.intervals[i]})`).join(' · ')}${result.omitted.length ? `. Omitted: ${result.omitted.join(' · ')}.` : ''}`;
  el('voicings-description').textContent = result.fifths ? 'An open fifth has only two distinct notes, so these are spread root/fifth grips rather than four-part drop voicings.' : `${DROP_TYPES[type as keyof typeof DROP_TYPES].name} lowers ${type==='drop24'?'the second- and fourth-highest voices':type==='drop4'?'the lowest voice':type==='drop3'?'the third-highest voice':'the second-highest voice'} of a close-position chord by an octave.${result.doubled ? ' Triads use four voices by doubling one chord tone, with root position and two inversions.' : ''} ${result.omitted.length ? 'Extended chords use the four-note selection shown above; inversion names refer to that selection.' : ''}`;
  el('voicing-diagrams').innerHTML = result.voicings.map((board: any) => {
    const title = `${chord}, ${result.fifths ? 'spread fifths' : DROP_TYPES[type as keyof typeof DROP_TYPES].name.toLowerCase()}, ${board.inversionName.toLowerCase()}, ${board.bass} bass, strings ${board.strings.join(', ')}`;
    return `<article class="position-card voicing-card" data-inversion="${board.inversion}"><div class="position-heading"><h4>${board.inversionName} · ${board.bass} bass</h4><span>Frets ${board.start}–${board.end}</span></div>${voicingSvg(board, info.intervals, select('voicing-labels').value === 'intervals', title)}<p class="position-anchor">Strings ${board.strings.join('–')} · Bass interval ${board.bassInterval}${board.wide ? ' · Wide stretch' : ''}</p></article>`;
  }).join('') || '<p class="guitar-help">No fretted grip found within frets 1–24 for this string set.</p>';
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
  if (previewGripShape) stopPreview();
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
  settings.gapEnabled = input('gap-enabled').checked;
  settings.gapPlayBars = Number(select('gap-play').value);
  settings.gapMuteBars = Number(select('gap-mute').value);
  settings.gapTarget = select('gap-target').value;
  el('gap-controls').hidden = !settings.gapEnabled;
  el('template-field').hidden = !settings.progression;
  const diatonic = settings.progression && settings.template === 'diatonic';
  const jazz = settings.progression && PROGRESSIONS[settings.template as keyof typeof PROGRESSIONS].kind === 'jazz';
  select('quality').parentElement!.hidden = jazz;
  select('chord').parentElement!.hidden = jazz || diatonic;
  el('mode-tip').hidden = jazz;
  select('chord').disabled = diatonic;
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
  updateSpace();
  renderMusic();
  if (!playing) renderBeats();
}
function tempo(value: number) {
  settings.bpm = Math.max(30, Math.min(240, Math.round(value) || 90));
  input('bpm').value = input('tempo').value = String(settings.bpm);
  node?.port.postMessage({ type: 'settings', settings });
}
function reflectPlayback() {
  el('guitar-diagrams').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing; });
  el('progression-strip').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing; });
  el('play-label').textContent = playing ? 'Stop practicing' : 'Start practicing';
  el('play-icon').textContent = playing ? '■' : '▶';
  el('play').setAttribute('aria-pressed', String(playing));
  el('live-dot').classList.toggle('on', playing);
  select('beats').disabled = input('count-in').disabled = playing;
  if (!playing) { renderBeats(); el('play-status').textContent = 'Take a breath. Start again when you’re ready.'; }
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
function stopPreview() {
  clearTimeout(gripRingTimer);
  gripRingTimer = undefined;
  previewGeneration++;
  previewHold = null;
  previewing = false;
  previewGripShape = null;
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
    impulse = context.createBuffer(2, Math.ceil(context.sampleRate * 3.5), context.sampleRate);
    let seed = 42;
    for (let channel = 0; channel < 2; channel++) {
      const samples = impulse.getChannelData(channel);
      let filtered = 0;
      for (let i = 0; i < samples.length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        filtered = .65 * filtered + .35 * (seed / 2147483648 - 1);
        samples[i] = i < context.sampleRate * .025 ? 0 : filtered * Math.exp(-i / (context.sampleRate * .65));
      }
    }
    wet = context.createGain();
    wet.gain.value = Number(input('space').value) / 100 * .65;
    reverbGate = context.createGain();
    reverbGate.gain.value = 0;
    node.connect(reverbGate.gain,3);
    wet.connect(reverbGate).connect(master);
    node.port.onmessage = ({ data }) => {
      if (!playing) return;
      if (data.type === 'harmony') { step = data.step; renderMusic(); return; }
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
      if ((playing || previewing) && context?.state !== 'running') {
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
  const grip = positionGrips.get(shape);
  if (!grip) return;
  const replacing = previewing || previewGripShape !== null;
  stopPreview();
  const generation = previewGeneration;
  previewGripShape = shape;
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
    el('error').textContent = error instanceof Error ? error.message : 'Could not preview this grip.';
    el('error').hidden = false;
    stopPreview();
    await context?.close().catch(()=>{});
    context=undefined;node=undefined;
  }
}
const guitarDiagrams = el('guitar-diagrams');
const gripButton = (target: EventTarget | null) => target instanceof HTMLElement ? target.closest<HTMLButtonElement>('button[data-grip]') : null;
guitarDiagrams.addEventListener('click',event=>{
  const button=gripButton(event.target);
  if (!button || button.disabled) return;
  void previewGrip(button.dataset.grip!);
});
// Native buttons activate on mouse click, touch tap, Space and Enter.
guitarDiagrams.addEventListener('keydown',event=>{
  if (gripButton(event.target) && event.repeat && ['Space','Enter'].includes(event.code)) event.preventDefault();
});
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
    await prepareAudio();
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
    await context?.close().catch(() => {});
    context = undefined;
    node = undefined;
  } finally { busy = false; el<HTMLButtonElement>('play').disabled = false; reflectPresetButtons(); }
}

for (const id of ['voicing-type','voicing-strings','voicing-labels']) select(id).addEventListener('input', renderVoicings);
select('fret-labels').addEventListener('input', () => { guitarDegrees = select('fret-labels').value === 'degrees'; renderGuitar(); });
select('fret-view').addEventListener('input', () => { select('exercise').value = select('fret-view').value; renderMusic(); });

el('play').addEventListener('click', () => void toggle());
input('bpm').addEventListener('change', () => tempo(Number(input('bpm').value)));
input('tempo').addEventListener('input', () => tempo(Number(input('tempo').value)));
el('slower').addEventListener('click', () => tempo(settings.bpm - 1));
el('faster').addEventListener('click', () => tempo(settings.bpm + 1));
for (const id of ['show-grip','highlight-mode','gap-enabled','gap-play','gap-mute','gap-target','loop-enabled','loop-start','loop-end','drums','bass','drum-groove','bass-pattern','drums-volume','bass-volume','sequence','sequence-pattern','sequence-rate','sequence-density','sequence-swing','sequence-volume','key', 'sound', 'chord', 'template', 'subdivision', 'accent', 'beats', 'count-in', 'exercise', 'click', 'harmony']) el(id).addEventListener('input', update);
for (const mode of ['pedal', 'progression']) {
  el(mode).addEventListener('click', () => {
    settings.progression = mode === 'progression';
    stopPreview();
    step = 0;
    for (const id of ['pedal', 'progression']) {
      el(id).classList.toggle('selected', mode === id);
      el(id).setAttribute('aria-pressed', String(mode === id));
    }
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
  const modal = mode !== 'major' && mode !== 'minor';
  select('template').querySelector<HTMLOptionElement>('[value=diatonic]')!.disabled = modal;
  if (modal && select('template').value === 'diatonic') select('template').value = 'parallel1';

}
select('quality').addEventListener('input', () => { fillChords(); update(); });

document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest('input, select, button, a, textarea'))) {
    event.preventDefault(); void toggle();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (playing) void stop(); else stopPreview(); }
});
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
  for (const id of ['preset-load','preset-update','preset-delete']) el<HTMLButtonElement>(id).disabled = !selected || busy || stopping;
}
function snapshotPreset(id: string = crypto.randomUUID()) {
  const name = input('preset-name').value.trim().slice(0,60);
  if (!name) throw new Error('Give your preset a name first.');
  const controls = Object.fromEntries(PRESET_CONTROLS.map(key => {
    const control = el<HTMLInputElement | HTMLSelectElement>(key);
    return [key,control instanceof HTMLInputElement && control.type === 'checkbox' ? control.checked : control.value];
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
    restoreControl('quality',preset.controls.quality);
    restoreControl('key',preset.controls.key);
    restoreControl('template',preset.controls.template);
    settings.progression = preset.progression;
    for (const id of ['pedal','progression']) {
      const selected = (id === 'progression') === settings.progression;
      el(id).classList.toggle('selected',selected);
      el(id).setAttribute('aria-pressed',String(selected));
    }
    fillChords();
    for (const id of PRESET_CONTROLS) if (!['quality','key','template','loop-enabled','loop-start','loop-end','voicing-strings'].includes(id)) restoreControl(id,preset.controls[id]);
    tempo(Number(input('bpm').value));
    guitarDegrees = select('fret-labels').value === 'degrees';
    step = 0;
    update();
    for (const id of ['loop-enabled','loop-start','loop-end','voicing-strings']) restoreControl(id,preset.controls[id]);
    update();
    input('preset-name').value = preset.name;
    el('preset-status').textContent = `Loaded “${preset.name}”. Ready to practice.`;
  } finally { busy = false; reflectPresetButtons(); }
});
renderPresets();
