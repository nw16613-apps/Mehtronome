# Mehtronome
Metronome app for scale practise with harmony backing.

## Browser app (recommended)

The browser version lives in `web/`. It uses TypeScript and the Web Audio API;
Python is not required. A dedicated audio worklet drives both click and harmony
from a single sample clock, with smooth volume changes. It includes:

- 30–240 BPM, optional downbeat accent, 3–7 beats/bar, and a one-bar count-in.
- Quarter notes, eighth notes, eighth-note triplets, sixteenth notes, and
  sixteenth-note sextuplets, all locked to the same audio sample clock.
  Subdivision clicks are softer; turning off beat-one accent makes every main
  beat identical, including during count-in.
- All twelve keys and 21 modes, grouped by major, melodic minor, and harmonic
  minor parent scales. Melodic minor follows the jazz convention (same notes
  ascending and descending). Each family contains all seven rotations, with
  correctly spelled notes, characteristic degrees, and compatible backing chords.
- Seven synthesized backing sounds. Bloom Pad (the browser default), Velvet
  Strings and Glass Atmosphere have distinct sources: a rounded, odd-harmonic pad,
  a brighter saw-derived string texture, and a softer bell-like glass tone.
  They add layered detuning, slow brightness changes, stereo movement and soft
  fixed-delay echoes. Warm Pad, Glass Cloud, Velvet Drone
  and Air Choir remain available. Ambient space defaults to 75% and adds stereo
  reverb to harmony only, keeping the click dry. Sound changes fade smoothly.
  Playback requests a buffered 48 kHz audio context. The synth uses precomputed,
  band-limited waveforms and interpolated control-rate modulation to reduce
  work on the audio thread; the sequencer uses cached decay envelopes.
- Optional **Melodic movement**, off by default: sparse melody, root pulse,
  ascending, descending or up/down chord-tone arpeggios. Eighth notes, sixteenths
  and triplets share the metronome's sample clock. Density, swing amount and
  sequence volume are independent controls; triplets stay straight. Sequences
  respect the count-in, follow every chord change and stay off during held previews.
- Optional **Drums & bass**, both off by default, with independent switches and
  volume controls. Five drum styles: pop/rock, blues shuffle, jazz swing, neo-soul
  half-time and bossa nova. Five bass styles: sustained ambient roots, pop/rock
  root-and-fifth, jazz chord-tone walking, bossa and syncopated funk. Bass styles
  also vary note length and articulation, with octave movement and syncopated pickups.
  Drum grooves include velocity accents, ghost notes, two-bar kick variations
  and restrained fourth-bar turnarounds. Bass timing stays independent when
  mixing a straight bass pattern with swung drums. Patterns
  adapt to beats per bar, share the sample clock, respect the count-in and follow
  the current chord. Both stay silent during held chord previews. Drums and bass
  have a separate dry output, bypassing pad reverb and echoes. Drum samples are
  bundled CC0 recordings, decoded once before playback and cached in memory
  (about 153 KB of WAV assets). No third-party audio service or soundfont is needed.
  Sources, modifications and licenses: [sample credits](web/src/audio/samples/README.md).
- **Practice presets**: name and save up to 50 setups in this browser, then load,
  update/rename or delete them. Presets recall tempo, meter, harmony, mix, rhythm,
  sequence, gap/loop settings and guitar display choices. Loading stops playback;
  it never starts audio automatically. They persist across reloads through local
  storage, so they are specific to this browser and can be removed by clearing
  site data. Storage failures are shown without claiming a save succeeded.
- **Gap training** in The pulse: choose 1/2/4/8 audible bars, then 1/2/4 gap bars.
  Mute the click, backing or both. The clock, chords and musical patterns continue
  through gaps, with short fades at the boundaries. Backing gaps also silence the
  external reverb tail. The count-in and held chord previews are unaffected.
- **Loop selected chords** in The harmony: choose inclusive start/end chords.
  The loop retains each chord's original bar duration, can hold a single chord,
  and can wrap across the end of a template. Excluded chords are dimmed but can
  still be inspected/previewed while stopped. Selecting another template resets
  the range to that whole progression and switches the range loop off.
- **Modal colour notes**: optional dashed highlights on the note cards and all
  five CAGED diagrams, plus spelled notes and degrees (for example Dorian's 6
  and Lydian's ♯4). Covers all 21 modes and follows jazz scale changes. Root and
  chord-tone fills stay visible beneath the highlight. In arpeggio view only
  colour notes that are also part of the chord are shown.
- 33 pedal-chord types, filtered to chords whose notes fit the selected mode.
  Each mode selects a suggested starting chord. Choices include major/minor
  sevenths, ninths, elevenths, sixths, thirteenths, suspended chords, open fifths,
  major ♯11 voicings, and half-diminished chords. Rich voicings sound all their
  displayed chord tones; arpeggio view follows the chosen chord. Minor-major,
  augmented-major, altered dominant, dominant ♭9/♯11, diminished, and
  half-diminished ninth chords support the added minor modes.
- Simple root-position chord selection, with the piano/drop voicing controls removed.
- Chord progression templates for I–♭III–♭V–VI and I–IV: one bar per chord or two bars
  per chord. The selected chord type is kept on each root (for example, Cmaj7 →
  E♭maj7 → G♭maj7 → Amaj7). All 33 chord types are available in parallel-root progression
  mode, regardless of the scale selected. The displayed scale transposes to each
  chord root, while arpeggio view shows the actual current chord tones.
- Cycle-of-fourths templates with one or two bars per chord, keeping the selected
  chord type through all 12 roots. From C: C / F / B♭ / E♭ / A♭ / D♭ / G♭ /
  B / E / A / D / G, then repeat. Enharmonic names keep the cycle readable.
- A guitar reference panel in standard E–A–D–G–B–e tuning. All five horizontal
  position diagrams appear together, with Roman numbering: I = E form,
  II = D form, III = C form, IV = A form, V = G form. Each preserves its
  CAGED root layout and fret window; the fret numbers identify its location.
  All seven major-scale modes use their parent-major CAGED shapes: for example,
  C Mixolydian uses the same five fingerings as F major, and D Dorian uses C major.
  Chord/modal root highlights, interval labels and colour notes still follow the
  selected harmony. Shape anchors are labelled with the parent-major tonic.
  Positions IV and V retain the corrected parent-major string boundaries. Position IV
  relocates the lower strings’ far-edge notes and ends the G string earlier;
  Position V relocates the D string’s far-edge note onto the G string at the same
  pitch and also ends the G string earlier.
  High E is at the top, low E at the bottom, and frets increase left to right.
  All positions use fretted notes; open-position forms move up an octave,
  preserving their CAGED patterns and root anchors.
  Scale/arpeggio note maps keep their established fingering boundaries. An optional
  **Highlight chord shapes** overlay recommends one compact 3–4-string grip per position:
  solid rings select the sounding notes, numbered badges show fingers 1–4, and ×
  marks muted strings. Other scale notes are dimmed, and modal colour rings remain
  dashed. The grip voices the current chord, even when the position uses a different
  parent-major anchor. Reductions list omitted tones; barre instructions appear
  when needed. **Hold to hear grip** previews the exact fretted MIDI pitches using
  a modeled acoustic guitar down-strum and Harmony volume, while stopped. Each
  string is picked from low to high and rings with a natural decay; grip previews
  bypass ambient pad effects. Release, touch
  cancellation, keyboard release, blur or a diagram change stops the preview.
  Short taps released before audio loads never trigger a late note. The overlay
  toggle removes the grip rings, finger numbers and mute marks when switched off,
  restoring all scale notes to full brightness. Its setting is included in saved practice presets.
  Chord roots, other chord tones, and scale tones have distinct colors.
  Choose note names or scale degrees, and scale-plus-chord or chord-only view;
  these controls update all five diagrams at once and stay synchronized with
  the main Exercise control. Degrees refer to the displayed scale, while roots
  refer to the current chord. All five diagrams follow key, mode, chord and
  progression changes, including automatic jazz scale guides.
- Jazz templates: major ii–V–I (ii7 / V7alt / Imaj7♯11 held for two bars; Dorian / altered / Lydian guides), minor
  iiø–V–i (iiø7 / V7♭9 / i6 held for two bars), a ii–V–I–VI7 turnaround
  (one bar each), and a 12-bar jazz blues (one chord per bar). These set their
  own chord qualities and a suggested scale guide for each chord; choose the
  tonic key to transpose the entire progression. Jazz blues uses
  I7 / IV7 / I7 / I7 / IV7 / ♯iv°7 / I7 / VI7 / ii7 / V7 / I7 / V7.
- The pulse controls use shared columns so dropdowns and checkboxes align on
  both desktop and phone layouts.
- Dark mode, initially following the system preference, with a theme button that
  remembers your choice in this browser.
- A sustained pedal chord, plus the original diatonic I–vi–IV–V
  (minor: i–VI–iv–v) template, one bar per triad. This legacy template keeps the
  starting key’s scale fixed and is available for major and natural minor.
- Scale and current-chord arpeggio note displays; separate click/harmony volume.

For modal practice, start with Dorian + minor 13, Lydian + major 9 ♯11,
Mixolydian + dominant 13, or Locrian + half-diminished 7. Try the characteristic
mode degree against the sustained harmony. All modes support the new parallel-root templates. Additional mode-specific
progression templates remain future additions.

Notes are visual guides for playing your own instrument, not automatic scale
playback. Backing uses synthesized tones. Playback pauses when the page is hidden;
press Start to begin again. Use wired headphones for consistent perceived timing.

While stopped, select any progression chord box to view its scale/arpeggio and
all five guitar positions. With Sound preview enabled, hold a chord box with the mouse or touch, or
hold Space/Enter while it is focused. The chord sounds without a metronome only
while held; releasing stops it with a short fade. Uncheck Sound preview for silent
inspection. Starting practice begins the progression from its first chord.
Arpeggio notes include intervals relative to the current chord root, preserving
extensions and alterations (for example 9, ♯11, ♭9 and ♯9). Dark mode uses bright
teal chord-tone markers, amber roots and muted scale tones.

Choose **Theme** in the header to try Midnight Studio (navy/cyan), Warm Paper
(cream/terracotta), Plum Session (aubergine/rose), or Slate Minimal (grey/blue).
Original light and dark remain available, and explicit choices persist locally.
Use **Compare themes** in the footer for the screenshot gallery at `themes.html`.
Links such as `?theme=midnight` preview a palette without overwriting a saved
preference; choosing from the menu saves the choice and clears that preview URL.

The **Guitar chord voicings** section follows the current chord. Choose Drop 2,
Drop 3, Drop 2 & 4 or Drop 4, a string set, and note-name or interval labels.
Drop 2 offers strings 6–5–4–3, 5–4–3–2 and 4–3–2–1; Drop 3 offers 6–4–3–2 and
5–3–2–1; Drop 2 & 4 offers 6–5–3–2 and 5–4–2–1; Drop 4 uses 6–3–2–1.
Each selected string set shows root position and all three inversions for a
four-note chord, in that order. Play the four marked notes together and mute ×.
Extended chords disclose their four-note reduction; inversion names refer to that
selection. Triads double one tone and show root position plus two inversions;
open-fifth chords show two spread root/fifth bass choices. All notes are fretted
within frets 1–24. Wide stretches are marked and diagrams expand to show every
fret needed. These diagram selections do not change the backing audio voicing.

### Develop

Use Node.js 22.12+ (Node 24 also works):

```sh
cd web
npm ci
npm run dev
```

Open the address printed by Vite on your own computer. Remote browser audio needs
HTTPS; a local development server can use localhost. Opening `index.html` directly
as a file will not work. An initial click on Start enables audio in the browser.
Modern Safari, Chrome, and Firefox support the required APIs; Chromium is tested
here, while audible output and Safari behavior still need a Mac check.

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests run against the production build, checking actual audio-worklet
output, progression, controls, count-in/restart, and mobile layout. If a system
Chromium exists it is used; set `CHROMIUM_PATH` to override its location. On Linux,
Playwright may require `npx playwright install --with-deps chromium`.

For audio performance work, run `npm run bench:audio` from `web/`. It measures
128-sample render blocks at 44.1, 48 and 96 kHz with six chord voices, a dense
sequencer, drums and bass, reporting mean/p95/p99 times against each block's deadline. It measures
the synth only; browser scheduling, reverb and output-device costs are additional.
Compare runs on the same machine without concurrent builds.

### Publish a testing link

The live app is at https://nw16613-apps.github.io/Mehtronome/. The included GitHub
Actions workflows check changes and provide an explicit Pages publication step:

1. Commit and push the browser files and `.github/workflows/` to GitHub.
2. In the repository's **Settings → Pages**, select **GitHub Actions** as the source.
3. In **Actions → Publish browser app → Run workflow**, choose the branch to publish.
4. Open the deployment URL reported by the workflow. Future updates use the same URL;
   rerun the publication workflow after pushing changes, then refresh the page.

Pages availability depends on the repository's visibility and GitHub plan. A
public site exposes the application to anyone with its URL; no secrets belong in
frontend code. Alternatively, deploy `web/dist/` to any HTTPS static host after
`npm ci && npm run build`. Relative asset paths support repository subdirectories.
There are no server, account, API-key, or database requirements.

The browser UI and audio engine can later be packaged with Tauri or Electron for
desktop use. Desktop packaging has not been implemented.

## Original Python desktop prototype

The earlier Python prototype remains available independently.

Install Python 3.10 or newer from python.org, then open Terminal in this repository:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
mehtronome
```

Choose a key and major or natural minor scale, then press Start. After the optional
one-bar count-in, a sustained root-position triad accompanies the click. The first
beat has a higher click. Practice the displayed notes on your instrument; the app
does not play the scale or listen through your microphone.

Tempo, key, quality, and volumes can change during playback. Beats per bar and
count-in can change while stopped. The click and harmony share a 48 kHz audio
clock. Backing uses simple synthesized tones; chord progressions, arpeggio modes,
and sampled instruments are future additions.

Use macOS Sound settings to select your output before starting. If audio cannot
start, check that an output device is available and restart playback. Use wired
headphones for the most consistent latency. No microphone permission is required.
The sounddevice macOS wheel normally includes PortAudio; if installation reports
a missing PortAudio library, install it with `brew install portaudio` and retry.

## Development checks

```sh
python -m unittest discover -s tests -v
```

Tests render audio without a sound device and check timing across callback blocks,
count-in, chord frequencies, tempo changes, note spelling, and UI playback controls.
The UI tests mock the audio device. On a headless Linux
machine, GUI checks can use `QT_QPA_PLATFORM=offscreen`; actual audio playback and
macOS window behavior require a local desktop check.
