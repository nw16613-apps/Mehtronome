import './style.css';
import './themes.css';
import { POSITIONS, fretboardFor, diagramSvg } from './guitar/fretboard.js';
import { DROP_TYPES, STRING_SETS, guitarVoicings, voicingSvg } from './guitar/voicings.js';
import workletUrl from './audio/worklet.js?worker&url';
import { DEFAULTS } from './audio/engine.js';
import { MODES, CHORDS, SOUNDS, compatibleChords, PROGRESSIONS, progressionDurations, harmonyAt } from './audio/music.js';

const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
function modeOptions() {
  return ['Major scale', 'Melodic minor', 'Harmonic minor'].map(family =>
    `<optgroup label="${family}">${Object.entries(MODES).filter(([, mode]) => ('family' in mode ? mode.family : 'Major scale') === family).map(([id, mode]) => `<option value="${id}">${mode.name}</option>`).join('')}</optgroup>`
  ).join('');
}
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Mehtronome home"><span class="brand-mark">m<span>·</span></span>mehtronome</a><span class="header-note">A little rhythm. A little harmony.</span><div class="theme-controls"><label class="theme-picker">Theme<select id="palette" aria-label="Page theme"><option value="light">Original light</option><option value="dark">Original dark</option><option value="midnight">Midnight Studio</option><option value="paper">Warm Paper</option><option value="plum">Plum Session</option><option value="slate">Slate Minimal</option></select></label><button id="theme" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">Dark mode</button></div></header>
<main>
  <div class="intro"><div><p class="eyebrow">MAKE SPACE FOR PRACTICE</p><h1>Find your rhythm.<br><em>Hear the harmony.</em></h1></div><p class="intro-copy">Give your scales somewhere to go.<br>A steady pulse and a little harmonic context.</p></div>
  <div class="workspace">
    <section class="transport panel" aria-labelledby="pulse-title">
      <div class="section-heading"><h2 id="pulse-title">The pulse</h2><span class="live-dot" id="live-dot"></span></div>
      <div class="tempo-controls"><button class="round" id="slower" aria-label="Decrease tempo">−</button><div><label class="sr-only" for="bpm">Tempo in beats per minute</label><input id="bpm" type="number" min="30" max="240" value="90"><span class="bpm-label">BEATS PER MINUTE</span></div><button class="round" id="faster" aria-label="Increase tempo">+</button></div>
      <label class="sr-only" for="tempo">Tempo</label><input id="tempo" class="tempo-range" type="range" min="30" max="240" value="90"><div class="range-limits"><span>30 · LARGO</span><span>240 · PRESTISSIMO</span></div>
      <div class="beat-dots" id="beat-dots" aria-hidden="true"></div>
      <p class="play-status" id="play-status" role="status">Your next good practice starts here.</p>
      <button class="play-button" id="play" aria-pressed="false"><span id="play-icon">▶</span><span id="play-label">Start practicing</span><kbd>SPACE</kbd></button>
      <div class="pulse-options">
      <div class="transport-options"><label>Beats / bar <select id="beats" aria-label="Beats per bar"><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label><label class="check"><input type="checkbox" id="count-in" checked>One-bar count-in</label></div>
      <div class="transport-options subdivision-options"><label>Subdivision <select id="subdivision"><option value="1">Quarter notes</option><option value="2">Eighth notes</option><option value="3">Eighth-note triplets</option><option value="4">Sixteenth notes</option><option value="6">Sixteenth-note sextuplets</option></select></label><label class="check"><input id="accent" type="checkbox" checked>Accent beat one</label></div>
      </div>
    </section>
    <section class="harmony panel" aria-labelledby="harmony-title">
      <div class="section-heading"><h2 id="harmony-title">The harmony</h2><span class="small-label">YOUR MUSICAL CONTEXT</span></div>
      <div class="field-row"><label><span id="root-label">Root note</span><select id="key">${names.map((n, i) => `<option value="${i}">${n}</option>`).join('')}</select></label><label>Mode<select id="quality">${modeOptions()}</select></label></div>
      <div class="field-row sound-row"><label>Backing sound<select id="sound">${Object.entries(SOUNDS).map(([id, sound]) => `<option value="${id}">${sound.name}</option>`).join('')}</select></label><label><span id="chord-label">Pedal chord</span><select id="chord"></select></label></div>

      <p id="mode-tip" class="mode-tip"></p>
      <div class="mode-label">BACKING</div><div class="segmented" role="group" aria-label="Harmony backing"><button id="pedal" class="selected" aria-pressed="true">Pedal chord</button><button id="progression" aria-pressed="false">Chord progression</button></div>
      <label id="template-field" class="template-field" hidden>Progression template<select id="template">${Object.entries(PROGRESSIONS).map(([id, template]) => `<option value="${id}">${template.name}</option>`).join('')}</select></label>
      <div class="chord-stage"><span class="small-label" id="chord-caption">LET IT RING</span><div id="chord-name">C<span>maj</span></div><p id="chord-notes">C · E · G</p></div>
      <div class="progression-strip" id="progression-strip" hidden></div>
      <div id="preview-controls" hidden><p>While stopped, hold a chord to hear it. Release to stop; its diagrams stay selected.</p><label class="check"><input id="audition" type="checkbox" checked>Sound preview</label><span id="preview-status" role="status" hidden>Release to stop</span></div>
      <p class="backing-description" id="backing-description">One sustained chord. Explore how every note feels against it.</p>
    </section>
    <section class="notes panel" aria-labelledby="notes-title"><div class="section-heading"><h2 id="notes-title">Under your fingers</h2><label class="exercise-label">Exercise <select id="exercise"><option value="scale">Scale</option><option value="arpeggio">Arpeggio</option></select></label></div><div id="note-list" class="note-list"></div><p id="exercise-description">Play these notes on your instrument, at your own pace.</p></section>
    <section class="mix panel" aria-labelledby="mix-title"><div class="section-heading"><h2 id="mix-title">Your mix</h2><span class="small-label">FIND THE BALANCE</span></div><label class="volume-label" for="click">Click <output id="click-value">50%</output></label><input id="click" type="range" min="0" max="100" value="50"><label class="volume-label" for="harmony">Harmony <output id="harmony-value">35%</output></label><input id="harmony" type="range" min="0" max="100" value="35"><label class="volume-label" for="space">Ambient space <output id="space-value">75%</output></label><input id="space" type="range" min="0" max="100" value="75"></section>
    <section class="sequence panel" aria-labelledby="sequence-title">
      <div class="section-heading"><h2 id="sequence-title">Melodic movement</h2><label class="check"><input id="sequence" type="checkbox">Enable sequence</label></div>
      <p class="sequence-help">A quiet chord-tone pattern, locked to the pulse and current harmony. Chord previews stay sustained.</p>
      <div id="sequence-controls" hidden>
        <div class="field-row"><label>Pattern<select id="sequence-pattern"><option value="sparse">Sparse melody</option><option value="pulse">Root pulse</option><option value="up">Ascending arpeggio</option><option value="down">Descending arpeggio</option><option value="updown">Up & down arpeggio</option></select></label><label>Timing<select id="sequence-rate"><option value="2">Eighth notes</option><option value="4">Sixteenth notes</option><option value="3">Eighth-note triplets</option></select></label></div>
        <div class="sequence-sliders"><label class="volume-label" for="sequence-density">Density <output id="sequence-density-value">65%</output></label><input id="sequence-density" type="range" min="0" max="100" value="65"><label class="volume-label" for="sequence-swing">Swing <output id="sequence-swing-value">0%</output></label><input id="sequence-swing" type="range" min="0" max="60" value="0"><label class="volume-label" for="sequence-volume">Sequence volume <output id="sequence-volume-value">25%</output></label><input id="sequence-volume" type="range" min="0" max="100" value="25"></div>
      </div>
    </section>
    <section class="guitar panel" aria-labelledby="guitar-title">
      <div class="section-heading"><div><p class="eyebrow">TAKE IT TO THE FRETBOARD</p><h2 id="guitar-title">Guitar reference</h2></div><span class="small-label">STANDARD TUNING · E A D G B E</span></div>
      <div class="guitar-guide guitar-overview">
        <h3 id="guitar-context"></h3><p id="guitar-scale"></p>
        <div class="guitar-controls"><label>Diagram<select id="fret-view"><option value="scale">Scale + chord tones</option><option value="arpeggio">Chord tones only</option></select></label><label>Labels<select id="fret-labels"><option value="notes">Note names</option><option value="degrees">Scale degrees</option></select></label></div>
        <div class="guitar-legend"><span><i class="root"></i>Chord root</span><span><i class="chord"></i>Chord tone</span><span><i class="scale"></i>Scale tone</span></div>
      </div>
      <div id="guitar-diagrams" class="guitar-diagrams"></div>
      <div class="guitar-guide"><p class="guitar-help">All five positions use CAGED root locations. Dots are choices for scale or arpeggio practice, rather than a chord grip to strum all at once.</p>
        <p class="guitar-help">High E is at the top, low E at the bottom. Frets increase from left to right. Open-position forms are moved up an octave so every position uses fretted notes.</p>
      </div>
    </section>
    <section class="voicings panel" aria-labelledby="voicings-title">
      <div class="section-heading"><div><p class="eyebrow">PLAY THE HARMONY</p><h2 id="voicings-title">Guitar chord voicings</h2></div><span class="small-label">FOUR-NOTE CHORD SHAPES · × = MUTE</span></div>
      <div class="guitar-guide guitar-overview"><h3 id="voicings-chord"></h3><p id="voicings-tones"></p><div class="guitar-controls voicing-controls"><label>Voicing<select id="voicing-type">${Object.entries(DROP_TYPES).map(([id,type])=>`<option value="${id}">${type.name}</option>`).join('')}</select></label><label>String set<select id="voicing-strings"></select></label><label>Labels<select id="voicing-labels"><option value="notes">Note names</option><option value="intervals">Chord intervals</option></select></label></div></div>
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
let settings = { ...DEFAULTS, mode: 'major', chord: 'maj9' };
let master: GainNode | undefined;
let wet: GainNode | undefined;
let reverb: ConvolverNode | undefined;
let impulse: AudioBuffer | undefined;
let playing = false;
let busy = false;
let step = 0;
let context: AudioContext | undefined;
let node: AudioWorkletNode | undefined;
let stopping = false;
let guitarDegrees = false;
let previewHold: string | null = null;
let previewPreparation: Promise<void> | undefined;
let previewing = false;
let previewGeneration = 0;

function notes(): string[] { return harmonyAt(settings, step).scaleNames; }
function chordInfo(index: number) { return harmonyAt(settings, index); }
function renderMusic() {
  const template = PROGRESSIONS[settings.template as keyof typeof PROGRESSIONS];
  step = settings.progression ? step % template.roman.length : 0;
  const info = chordInfo(step);
  el('chord-name').innerHTML = `${info.name}<span>${info.suffix}</span>`;
  el('chord-notes').textContent = info.tones.join(' · ');

  const jazz = template.kind === 'jazz';
  el('chord-caption').textContent = !settings.progression ? 'LET IT RING' : jazz ? `${progressionDurations(settings).reduce((sum: number, bars: number) => sum + bars, 0)}-BAR JAZZ LOOP` : template.bars === 2 ? 'TWO BARS PER CHORD' : 'ONE BAR PER CHORD';
  el('progression-strip').classList.toggle('blues', template.roman.length === 12);
  el('progression-strip').hidden = !settings.progression;
  el('preview-controls').hidden = !settings.progression;
  const focusedStep = (document.activeElement as HTMLElement)?.dataset.step;
  el('progression-strip').innerHTML = Array.from({ length: template.roman.length }, (_, i) => {
    const c = chordInfo(i);
    return `<button type="button" data-step="${i}" aria-pressed="${i === step}" ${playing ? 'disabled' : ''} class="${i === step ? 'current' : ''}">${c.name}${c.suffix === 'maj' ? '' : c.suffix}<small>${c.roman}</small>${jazz ? `<small>${progressionDurations(settings)[i]} bar${progressionDurations(settings)[i] === 1 ? '' : 's'}</small>` : ''}</button>`;
  }).join('');
  if (focusedStep !== undefined) el('progression-strip').querySelector<HTMLButtonElement>(`[data-step="${focusedStep}"]`)?.focus({preventScroll: true});
  el('backing-description').textContent = !settings.progression ? 'One sustained chord. Explore how every note feels against it.' : jazz ? 'Classic jazz changes with fixed chord types. The scale guide follows each chord.' : settings.template === 'diatonic' ? 'Diatonic triads, one bar each.' : settings.template.startsWith('fourths') ? `All 12 roots by perfect fourths, keeping the selected chord type. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord.` : `The same chord type on ${template.roman.join('–')}. ${template.bars === 2 ? 'Two bars' : 'One bar'} per chord. Mode notes follow each root.`;

  const arpeggio = select('exercise').value === 'arpeggio';
  const displayed = arpeggio ? info.tones : notes();
  el('note-list').innerHTML = displayed.map((n: string, i: number) => `<div class="note ${arpeggio || info.chordPcs.includes(info.scalePcs[i]) ? 'chord-tone' : ''}"><strong>${n}</strong><small>${arpeggio ? info.intervals[i] : MODES[info.mode as keyof typeof MODES].degrees[i]}</small></div>`).join('');
  el('exercise-description').textContent = arpeggio ? 'Intervals are measured from the current chord root. Follow the harmony on your instrument.' : settings.progression && settings.template !== 'diatonic' ? `${info.name} ${MODES[info.mode as keyof typeof MODES].name}. The scale follows each chord root.` : 'Play the scale on your instrument. Highlighted notes belong to the current chord.';
  renderGuitar();
  renderVoicings();
}
function renderGuitar() {
  const info = chordInfo(step);
  const chord = `${info.name}${info.suffix}`;
  const mode = MODES[info.mode as keyof typeof MODES];
  el('guitar-diagrams').innerHTML = POSITIONS.map(position => {
    const board = fretboardFor(info, position.shape, select('exercise').value === 'arpeggio');
    const title = `${chord}, position ${position.numeral}, frets ${board.start} to ${board.end}`;
    return `<article class="position-card" data-position="${position.numeral}"><div class="position-heading"><h4>Position ${position.numeral}</h4><span>Frets ${board.start}–${board.end}</span></div>${diagramSvg(board, guitarDegrees, mode.degrees, title)}<p class="position-anchor">Root anchor: ${['low E','A','D','G','B','high E'][board.rootString]} string, ${board.rootFret === 0 ? 'open' : `fret ${board.rootFret}`}.</p></article>`;
  }).join('');
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
function update() {
  const previous = [settings.key, settings.mode, settings.chord, settings.template].join('|');
  settings.key = Number(select('key').value);
  settings.mode = select('quality').value;
  settings.minor = settings.mode === 'minor';
  settings.chord = select('chord').value;
  settings.sound = select('sound').value;
  settings.sequence = input('sequence').checked;
  settings.sequencePattern = select('sequence-pattern').value;
  settings.sequenceRate = Number(select('sequence-rate').value);
  settings.sequenceSwing = Number(input('sequence-swing').value)/100;
  settings.sequenceDensity = Number(input('sequence-density').value)/100;
  settings.sequenceVolume = Number(input('sequence-volume').value)/100;
  el('sequence-controls').hidden = !settings.sequence;
  input('sequence-swing').disabled = settings.sequenceRate===3;
  for(const name of ['density','swing','volume']) el(`sequence-${name}-value`).textContent = `${input(`sequence-${name}`).value}%`;
  if(settings.sequenceRate===3) el('sequence-swing-value').textContent='Straight triplets';
  settings.template = select('template').value;
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
  node?.port.postMessage({ type: 'settings', settings });
  el('space-value').textContent = `${input('space').value}%`;
  if (wet && context) wet.gain.setTargetAtTime(Number(input('space').value) / 100 * .65, context.currentTime, .08);
  renderMusic();
  if (!playing) renderBeats();
}
function tempo(value: number) {
  settings.bpm = Math.max(30, Math.min(240, Math.round(value) || 90));
  input('bpm').value = input('tempo').value = String(settings.bpm);
  node?.port.postMessage({ type: 'settings', settings });
}
function reflectPlayback() {
  el('progression-strip').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = playing; });
  el('play-label').textContent = playing ? 'Stop practicing' : 'Start practicing';
  el('play-icon').textContent = playing ? '■' : '▶';
  el('play').setAttribute('aria-pressed', String(playing));
  el('live-dot').classList.toggle('on', playing);
  select('beats').disabled = input('count-in').disabled = playing;
  if (!playing) { renderBeats(); el('play-status').textContent = 'Take a breath. Start again when you’re ready.'; }
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
}
function stopPreview() {
  previewGeneration++;
  previewHold = null;
  previewing = false;
  el('preview-status').hidden = true;
  if (!playing) {
    node?.port.postMessage({type: 'stop'});
    if (master && context) master.gain.setTargetAtTime(0, context.currentTime, .035);
  }
}
async function prepareAudio() {
  if (!window.isSecureContext || !window.AudioWorkletNode) throw new Error('Audio needs a secure HTTPS page and a current Safari, Chrome, or Firefox browser.');
  if (!context || context.state === 'closed') {
    context = new AudioContext({ latencyHint: 'interactive' });
    reverb = undefined;
    await context.audioWorklet.addModule(workletUrl);
    node = new AudioWorkletNode(context, 'mehtronome', { numberOfInputs: 0, numberOfOutputs: 2, outputChannelCount: [2, 2] });
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    node.connect(master, 0); // Click stays dry and rhythmically clear.
    node.connect(master, 1);
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
    node.port.onmessage = ({ data }) => {
      if (!playing) return;
      if (data.type === 'harmony') { step = data.step; renderMusic(); return; }
      renderBeats(data.beat);
      el('play-status').textContent = data.counting ? `Count-in · ${data.beat + 1} of ${settings.beats}` : `Playing · Bar ${data.bar} · Beat ${data.beat + 1}`;
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
  reverb.connect(wet!).connect(master!);
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
    if (previewHold?.startsWith('key:') && !progressionStrip.contains(document.activeElement)) stopPreview();
  });
});
progressionStrip.addEventListener('contextmenu', event => { if (previewHold) event.preventDefault(); });
// Assistive technology can select a chord without synthesizing a held press.
progressionStrip.addEventListener('click', event => {
  const button = chordButton(event.target);
  if (button && !playing) { step = Number(button.dataset.step); renderMusic(); }
});
input('audition').addEventListener('input', () => { if (!input('audition').checked) stopPreview(); });
async function toggle() {
  if (busy || stopping || previewPreparation) return;
  if (playing) { await stop(); return; }
  busy = true;
  el<HTMLButtonElement>('play').disabled = true;
  el('error').hidden = true;
  try {
    stopPreview();
    await prepareAudio();
    step = 0;
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
  } finally { busy = false; el<HTMLButtonElement>('play').disabled = false; }
}

for (const id of ['voicing-type','voicing-strings','voicing-labels']) select(id).addEventListener('input', renderVoicings);
select('fret-labels').addEventListener('input', () => { guitarDegrees = select('fret-labels').value === 'degrees'; renderGuitar(); });
select('fret-view').addEventListener('input', () => { select('exercise').value = select('fret-view').value; renderMusic(); });

el('play').addEventListener('click', () => void toggle());
input('bpm').addEventListener('change', () => tempo(Number(input('bpm').value)));
input('tempo').addEventListener('input', () => tempo(Number(input('tempo').value)));
el('slower').addEventListener('click', () => tempo(settings.bpm - 1));
el('faster').addEventListener('click', () => tempo(settings.bpm + 1));
for (const id of ['sequence','sequence-pattern','sequence-rate','sequence-density','sequence-swing','sequence-volume','key', 'sound', 'chord', 'template', 'subdivision', 'accent', 'space', 'beats', 'count-in', 'exercise', 'click', 'harmony']) el(id).addEventListener('input', update);
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
