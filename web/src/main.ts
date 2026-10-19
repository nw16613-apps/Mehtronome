import './style.css';
import workletUrl from './audio/worklet.js?worker&url';
import { DEFAULTS } from './audio/engine.js';
import { MODES, CHORDS, SOUNDS, compatibleChords, modeNotes, pedalLabels } from './audio/music.js';

const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a class="brand" href="./" aria-label="Mehtronome home"><span class="brand-mark">m<span>·</span></span>mehtronome</a><span class="header-note">A little rhythm. A little harmony.</span><span class="tag">PRACTICE ROOM / 01</span></header>
<main>
  <div class="intro"><div><p class="eyebrow">MAKE SPACE FOR PRACTICE</p><h1>Find your rhythm.<br><em>Hear the harmony.</em></h1></div><p class="intro-copy">Give your scales somewhere to go.<br>A steady pulse and a little harmonic context.</p></div>
  <div class="workspace">
    <section class="transport panel" aria-labelledby="pulse-title">
      <div class="section-heading"><h2 id="pulse-title">The pulse</h2><span class="live-dot" id="live-dot"></span></div>
      <div class="tempo-controls"><button class="round" id="slower" aria-label="Decrease tempo">−</button><div><label class="sr-only" for="bpm">Tempo in beats per minute</label><input id="bpm" type="number" min="30" max="240" value="90"><span class="bpm-label">BEATS PER MINUTE</span></div><button class="round" id="faster" aria-label="Increase tempo">+</button></div>
      <label class="sr-only" for="tempo">Tempo</label><input id="tempo" class="tempo-range" type="range" min="30" max="240" value="90"><div class="range-limits"><span>30 · LARGO</span><span>240 · PRESTISSIMO</span></div>
      <div class="beat-dots" id="beat-dots" aria-hidden="true"></div>
      <p class="play-status" id="play-status" role="status">Your next good practice starts here.</p>
      <button class="play-button" id="play"><span id="play-icon">▶</span><span id="play-label">Start practicing</span><kbd>SPACE</kbd></button>
      <div class="transport-options"><label>Beats / bar <select id="beats" aria-label="Beats per bar"><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label><label class="check"><input type="checkbox" id="count-in" checked>One-bar count-in</label></div>
    </section>
    <section class="harmony panel" aria-labelledby="harmony-title">
      <div class="section-heading"><h2 id="harmony-title">The harmony</h2><span class="small-label">YOUR MUSICAL CONTEXT</span></div>
      <div class="field-row"><label>Root note<select id="key">${names.map((n, i) => `<option value="${i}">${n}</option>`).join('')}</select></label><label>Mode<select id="quality">${Object.entries(MODES).map(([id, mode]) => `<option value="${id}">${mode.name}</option>`).join('')}</select></label></div>
      <div class="field-row sound-row"><label>Backing sound<select id="sound">${Object.entries(SOUNDS).map(([id, sound]) => `<option value="${id}">${sound.name}</option>`).join('')}</select></label><label>Pedal chord<select id="chord"></select></label></div>
      <p id="mode-tip" class="mode-tip"></p>
      <div class="mode-label">BACKING</div><div class="segmented" role="group" aria-label="Harmony backing"><button id="pedal" class="selected" aria-pressed="true">Pedal chord</button><button id="progression" aria-pressed="false">Chord progression</button></div>
      <div class="chord-stage"><span class="small-label" id="chord-caption">LET IT RING</span><div id="chord-name">C<span>maj</span></div><p id="chord-notes">C · E · G</p></div>
      <div class="progression-strip" id="progression-strip" hidden></div>
      <p class="backing-description" id="backing-description">One sustained chord. Explore how every note feels against it.</p>
    </section>
    <section class="notes panel" aria-labelledby="notes-title"><div class="section-heading"><h2 id="notes-title">Under your fingers</h2><label class="exercise-label">Exercise <select id="exercise"><option value="scale">Scale</option><option value="arpeggio">Arpeggio</option></select></label></div><div id="note-list" class="note-list"></div><p id="exercise-description">Play these notes on your instrument, at your own pace.</p></section>
    <section class="mix panel" aria-labelledby="mix-title"><div class="section-heading"><h2 id="mix-title">Your mix</h2><span class="small-label">FIND THE BALANCE</span></div><label class="volume-label" for="click">Click <output id="click-value">50%</output></label><input id="click" type="range" min="0" max="100" value="50"><label class="volume-label" for="harmony">Harmony <output id="harmony-value">35%</output></label><input id="harmony" type="range" min="0" max="100" value="35"><label class="volume-label" for="space">Ambient space <output id="space-value">45%</output></label><input id="space" type="range" min="0" max="100" value="45"></section>
  </div>
  <p id="error" class="error" role="alert" hidden></p>
  <footer><span><span class="footer-dot">●</span> Made for listening, not rushing.</span><span>Headphones on. Distractions off.</span></footer>
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

function notes(): string[] { return modeNotes(settings.key, settings.mode); }
function chordInfo(index: number): { name: string; suffix: string; tones: string[] } {
  if (!settings.progression) return { name: names[settings.key], suffix: CHORDS[settings.chord as keyof typeof CHORDS].symbol, tones: pedalLabels(settings) };
  const degree = settings.progression ? [0, 5, 3, 4][index] : 0;
  const minorChord = settings.minor ? [true, false, true, true][index] : [false, true, false, false][index];
  const isMinor = settings.progression ? minorChord : settings.minor;
  const scale = notes();
  return { name: scale[degree], suffix: isMinor ? 'min' : 'maj', tones: [degree, degree + 2, degree + 4].map(i => scale[i % 7]) };
}
function renderMusic() {
  const info = chordInfo(step);
  el('chord-name').innerHTML = `${info.name}<span>${info.suffix}</span>`;
  el('chord-notes').textContent = info.tones.join(' · ');
  el('chord-caption').textContent = settings.progression ? 'ONE CHORD PER BAR' : 'LET IT RING';
  el('progression-strip').hidden = !settings.progression;
  el('progression-strip').innerHTML = Array.from({ length: 4 }, (_, i) => {
    const c = chordInfo(i);
    return `<span class="${i === step ? 'current' : ''}">${c.name}${c.suffix === 'min' ? 'm' : ''}<small>${(settings.minor ? ['i', 'VI', 'iv', 'v'] : ['I', 'vi', 'IV', 'V'])[i]}</small></span>`;
  }).join('');
  el('backing-description').textContent = settings.progression ? 'Four chords, one bar each. Listen as the same notes change color.' : 'One sustained chord. Explore how every note feels against it.';
  const arpeggio = select('exercise').value === 'arpeggio';
  const displayed = arpeggio ? info.tones : notes();
  el('note-list').innerHTML = displayed.map((n, i) => `<div class="note ${info.tones.includes(n) ? 'chord-tone' : ''}"><strong>${n}</strong><small>${arpeggio ? 'chord tone' : MODES[settings.mode as keyof typeof MODES].degrees[i]}</small></div>`).join('');
  el('exercise-description').textContent = arpeggio ? 'Current chord tones. Follow the harmony on your instrument.' : 'Play the scale on your instrument. Highlighted notes belong to the current chord.';
}
function renderBeats(active = -1) {
  el('beat-dots').innerHTML = Array.from({ length: settings.beats }, (_, i) => `<span class="beat ${i === active ? 'active' : ''} ${i === 0 ? 'downbeat' : ''}">${i + 1}</span>`).join('');
}
function update() {
  settings.key = Number(select('key').value);
  settings.mode = select('quality').value;
  settings.minor = settings.mode === 'minor';
  settings.chord = select('chord').value;
  settings.sound = select('sound').value;
  settings.beats = Number(select('beats').value);
  settings.countIn = input('count-in').checked;
  settings.click = Number(input('click').value) / 100;
  settings.harmony = Number(input('harmony').value) / 100;
  el('click-value').textContent = `${Math.round(settings.click * 100)}%`;
  el('harmony-value').textContent = `${Math.round(settings.harmony * 100)}%`;
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
async function toggle() {
  if (busy || stopping) return;
  if (playing) { await stop(); return; }
  busy = true;
  el<HTMLButtonElement>('play').disabled = true;
  el('error').hidden = true;
  try {
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
        renderBeats(data.beat);
        el('play-status').textContent = data.counting ? `Count-in · ${data.beat + 1} of ${settings.beats}` : `Playing · Bar ${data.bar} · Beat ${data.beat + 1}`;
        if (step !== data.step) { step = data.step; renderMusic(); }
      };
      node.onprocessorerror = () => {
        playing = false;
        reflectPlayback();
        el('error').textContent = 'Audio stopped unexpectedly. Press Start to try again.';
        el('error').hidden = false;
        void context?.close();
      };
      context.onstatechange = () => {
        if (playing && context?.state !== 'running') {
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

el('play').addEventListener('click', () => void toggle());
input('bpm').addEventListener('change', () => tempo(Number(input('bpm').value)));
input('tempo').addEventListener('input', () => tempo(Number(input('tempo').value)));
el('slower').addEventListener('click', () => tempo(settings.bpm - 1));
el('faster').addEventListener('click', () => tempo(settings.bpm + 1));
for (const id of ['key', 'sound', 'chord', 'space', 'beats', 'count-in', 'exercise', 'click', 'harmony']) el(id).addEventListener('input', update);
for (const mode of ['pedal', 'progression']) {
  el(mode).addEventListener('click', () => {
    settings.progression = mode === 'progression';
    step = 0;
    for (const id of ['pedal', 'progression']) {
      el(id).classList.toggle('selected', mode === id);
      el(id).setAttribute('aria-pressed', String(mode === id));
    }
    select('chord').disabled = settings.progression;
    update();
  });
}
function fillChords() {
  const mode = select('quality').value as keyof typeof MODES;
  select('chord').innerHTML = compatibleChords(mode).map(id => {
    const chord = CHORDS[id as keyof typeof CHORDS];
    return `<option value="${id}">${chord.name}${id === MODES[mode].chord ? ' · suggested' : ''}</option>`;
  }).join('');
  select('chord').value = MODES[mode].chord;
  el('mode-tip').textContent = MODES[mode].tip;
  const modal = mode !== 'major' && mode !== 'minor';
  el<HTMLButtonElement>('progression').disabled = modal;
  el('progression').title = modal ? 'Mode-specific progressions are coming later. Explore a pedal chord.' : '';
  if (modal) {
    settings.progression = false;
    step = 0;
    el('pedal').classList.add('selected');
    el('pedal').setAttribute('aria-pressed', 'true');
    el('progression').classList.remove('selected');
    el('progression').setAttribute('aria-pressed', 'false');
  }
  select('chord').disabled = settings.progression;
}
select('quality').addEventListener('input', () => { fillChords(); update(); });

document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest('input, select, button, a, textarea'))) {
    event.preventDefault(); void toggle();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) void stop();
});
fillChords();
update();
