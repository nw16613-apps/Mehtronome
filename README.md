# Mehtronome
Metronome app for scale practise with harmony backing.

## Browser app (recommended)

The browser version lives in `web/`. It uses TypeScript and the Web Audio API;
Python is not required. A dedicated audio worklet drives both click and harmony
from a single sample clock, with smooth volume changes. It includes:

- Five workspaces organize the app: **01 Metronome & Mixer**, **02 Harmony**
  (including Under your fingers), **03 Guitar**, **04 Exercises**, and **05 Progress**
  (presets and Learning Path). Panels stay mounted so selections and playback
  survive navigation.
- The compact focus bar stays visible across workspaces, including when scrolling
  back to the main metronome. Play/stop, editable tempo and harmony controls remain
  available. **Focus view** hides setup panels and navigation; entering it from
  Metronome & Mixer or Progress opens the guitar reference.
- **Levels & ambience** uses a full-width bank of channel cards (four columns on
  desktop, two on tablet, one on phones), with sound settings underneath. Each
  channel has a mute button that retains its volume and leaves timing running;
  **Unmute all** clears mutes without enabling disabled instruments. Mutes save
  with presets, and older presets load unmuted. All levels stay together: metronome (including subdivisions and polyrhythm), harmony,
  drums, bass, electric piano, melodic movement and ambient space. Instrument
  switches stay in Backing ensemble and Melodic movement, with styles and
  pattern settings in independently collapsible groups. Longer
  explanations sit behind **Learn more** disclosures.
- **The pulse** fills the Metronome & Mixer workspace. Tap its button or press **T** to
  set the tempo, save up to eight tempo shortcuts, and click beat circles to cycle
  strong, soft and silent accents. Click sound & swing offers digital, woodblock,
  rim and soft clicks, and eighth-note swing from
  straight to a triplet feel. The large beat display includes its own play/stop.
- **Practice timer** measures time after the count-in and can stop at the chosen
  duration or finish the current bar. Set minutes to zero for an unlimited session.
  **Polyrhythm** adds a separate higher click and visual row for 3:2, 4:3, 5:4,
  7:4 or 2:3; it follows the shared clock, tempo trainer and click gap mute.
- **Harmony reference** in Guitar and Exercises shows the progression or pedal,
  chord durations, scale guides, current chord tones and the next chord. Selected
  loops keep their original order and durations. Playback highlights the current
  chord without requiring a switch to Harmony.
- **Under your fingers** combines each scale note and degree, its diatonic seventh
  chord, and its four notes in one connected, layered graphic. Chords use a large
  serif root, a smaller italic suffix and a spaced note list.
  Chord-tone fills and modal-colour rings stay on the top note boxes. Arpeggio view
  emphasizes current chord tones and dims other scale notes while
  keeping the full seven-degree map available. The graphic follows the active
  scale guide during progressions and highlights the current chord root below.
- **Evolving chord extensions** in Harmony slowly blends scale-constrained upper
  chord colours over a 4-, 8- or 16-bar cycle. The selected root, progression and
  practice diagrams stay in place. New sustained voicing pitches come from each
  chord's current scale guide; existing extension tones also rise and fall in the
  blend. The feature is optional, follows the tempo clock, and saves with presets.
- **Tempo trainer** adds a selected BPM increment after a chosen number of complete
  musical bars, up to a target. Count-in bars are excluded; click, harmony, bass,
  drums and sequence share the changing audio clock. The starting BPM is retained
  for restart and presets; the compact transport shows the live BPM.
- **Try mode progression** provides a dedicated loop for each of the 21 modes,
  with compatible supporting chords and a short listening guide. The modal tonic
  and scale stay fixed through the loop, including the CAGED reference.
- **Compare two chords** captures the current harmony in A and B. Listen to either
  while stopped, alternate between them, or click the active preview to stop.
- Presets can be exported as JSON and imported into another browser. Imports merge
  with existing setups, validate the file and keep existing presets intact.
- **Practise position** enlarges a chosen CAGED position and places it first while
  keeping the other four available. The selection is saved with practice presets.
- With a progression selected, **Follow nearest positions** maps every chord to
  the closest displayed CAGED shape in a chosen fretboard region. Its route can
  be clicked without starting playback and follows the current chord as it plays.
- A shared **Explore** selector applies pentatonic superimposition or triad pairs
  across all five CAGED positions. Pentatonic choices include every complete minor pentatonic in
  the parent scale plus a five-note selection specific to the current mode.
  Triad pairs highlight six notes from two disjoint triads.
  A/B badges and solid/dashed rings distinguish the triads, alongside note names,
  modal degrees and short practice guidance. Established fingerings stay intact;
  chord shapes return when exploration is off. The shared choice is retained in
  practice presets. Suggestions follow the tonic
  scale through modal vamps and update with other chord/scale changes.
- Fresh sessions start in A Dorian over Am13, with the count-in off and numeric
  degree labels in the guitar diagrams. Mode suggestions use seventh chords,
  retaining colour extensions for Dorian, Lydian and other distinctive modes.
- 30–240 BPM, optional downbeat accent, 3–7 beats/bar, and a one-bar count-in.
- Quarter notes, eighth notes, eighth-note triplets, sixteenth notes, quintuplets
  (five evenly spaced clicks per beat), sixteenth-note sextuplets, and septuplets
  (seven per beat), all locked to the same audio sample clock.
  Subdivision clicks are softer; turning off beat-one accent makes every main
  beat identical, including during count-in.
- All twelve keys and 21 modes, grouped by major, melodic minor, and harmonic
  minor parent scales. Melodic minor follows the jazz convention (same notes
  ascending and descending). Each family contains all seven rotations, with
  correctly spelled notes, characteristic degrees, and compatible backing chords.
- Seven backing sounds retain their existing names and preset IDs. Bloom Pad
  blends two rounded analogue spectra; Velvet Strings adds a richer ensemble
  texture; Glass Atmosphere brings out bell-like upper partials. Warm Pad, Glass
  Cloud, Velvet Drone and Air Choir have their own layered colours and slow
  filter/timbre movement. Independent stereo layers add width. Chord changes
  crossfade changed notes while retaining shared notes, instead of sliding
  oscillator pitch between chords. Band-limited lookup tables and interpolated
  control-rate modulation keep expensive maths off the per-sample path.
  Ambient space still defaults to 75%, now with a short pre-delay, early room
  reflections and a diffuse stereo tail that darkens as it decays. The native
  convolver handles the room; click, drums and bass retain their dry bus.
  Playback requests a buffered 48 kHz audio context.
- Optional **Melodic movement**, off by default: sparse melody, root pulse,
  ascending, descending or up/down chord-tone arpeggios, root & colours, Alberti
  figures, skipping arpeggios, descending cascades, offbeat answers, 3–3–2 ostinatos,
  3–2 clave melodies and repeatable wandering chord tones. Each pattern has an
  on-screen description. Eighth notes, sixteenths
  and triplets share the metronome's sample clock. Density, swing amount and
  sequence volume are independent controls; triplets stay straight. Sequences
  respect the count-in, follow every chord change and stay off during held previews.
- Optional **Drums & bass**, both off by default, with independent switches and
  volume controls. Five drum styles: pop/rock, blues shuffle, jazz swing, neo-soul
  half-time and bossa nova. Five bass styles: sustained ambient roots, pop/rock
  root-and-fifth, jazz chord-tone walking, bossa and syncopated funk. Four-bar
  phrases answer and vary, with restrained eight-bar turnarounds. Recorded drum
  takes alternate, with genuine soft snare hits, open/pedal hats, ride bell,
  cross-stick, toms and occasional phrase-ending cymbals. Closed/pedal hats choke
  open hats. Bass uses recorded fingerstyle electric-bass multisamples across
  six pitches with two takes each; note length, articulation, octave choices
  and chord-tone connections vary by style. Walking lines connect to the next
  chord without introducing notes outside the current harmony.
  Patterns adapt to beats per bar, share the metronome's sample clock, respect
  count-in and follow chord changes. Bass timing remains independent of drum
  swing. Both stay silent during chord previews and use a separate dry output.
  The app bundles 36 attributed/open recordings (about 4.0 MiB of WAV assets),
  including a close-miked Yamaha rock kit and fingerstyle electric bass.
  Samples load and decode before the first playback, then remain cached; no hit fetches or
  decodes a recording on the audio thread. A failed load can be retried.
  Sources, exact file mappings and processing:
  [sample credits](web/src/audio/samples/README.md).
- **Practice presets**: name and save up to 50 setups in this browser, then load,
  update/rename or delete them. Presets recall tempo, meter, harmony, mix, rhythm,
  sequence, gap/loop settings and guitar display choices. Loading stops playback;
  it never starts audio automatically. They persist across reloads through local
  storage, so they are specific to this browser and can be removed by clearing
  site data. Storage failures are shown without claiming a save succeeded.
- **Gap training** in The pulse: choose 1/2/4/8 audible bars, then 1/2/4 gap bars.
  Mute the click, backing or both. The clock, chords and musical patterns continue
  through gaps, with short fades at the boundaries. Backing gaps also silence the
  external reverb tail. Optional progressive silence adds one silent bar after
  each complete cycle, up to a selected maximum of 2, 4, 8 or 16 bars. The count-in
  and held chord previews are unaffected.
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
  **Highlight chord shapes** overlay recommends one compact 3–4-string chord shape per position:
  solid rings select the sounding notes, numbered badges show fingers 1–4, and ×
  marks muted strings. Other scale notes are dimmed, and modal colour rings remain
  dashed. The chord shape voices the current chord, even when the position uses a different
  parent-major anchor. Reductions list omitted tones; barre instructions appear
  when needed. **Strum chord** previews the exact fretted MIDI pitches using
  a modeled, lightly bright nylon-string guitar down-strum and Harmony volume, while stopped. Each
  string is picked from low to high and rings with a natural decay; chord previews
  bypass pad layers and echoes, with warm stereo reverb controlled by Ambient space.
  Guitar output leaves headroom for reverb, and re-strums briefly fade the previous
  chord to keep attacks clean. Click, tap, or activate the button with Space or Enter
  to strum and let the chord ring out. The button changes to **Stop chord** while active; clicking it again stops
  the sound. Selecting another chord switches the preview. Blur, a diagram
  change or starting playback stops the preview. The overlay
  toggle removes the chord rings and mute marks when switched off,
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
the guitar diagrams. Sound preview is always enabled for progression chords and the harmony reference boxes in Guitar and Exercises. Hold a chord box with the mouse or touch, or
hold Space/Enter while it is focused. The chord sounds without a metronome only
while held; releasing stops it with a short fade, and its diagrams stay selected. Starting practice begins the progression from its first chord.
Arpeggio notes include intervals relative to the current chord root, preserving
extensions and alterations (for example 9, ♯11, ♭9 and ♯9). Dark mode uses bright
teal chord-tone markers, amber roots and muted scale tones.

Choose **Theme** in the header to try Midnight Studio (navy/cyan), Warm Paper
(cream/terracotta), Plum Session (aubergine/rose), or Slate Minimal (grey/blue).
Original light and dark remain available, and explicit choices persist locally.
Use **Compare themes** in the footer for the screenshot gallery at `themes.html`.
Links such as `?theme=midnight` preview a palette without overwriting a saved
preference; choosing from the menu saves the choice and clears that preview URL.

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

The sixth workspace, Sound Settings, holds backing styles, instrument tones, sustained-pad shaping and melodic sequence settings. Metronome & Mixer keeps vertical channel faders, instrument enable switches and non-destructive mute/solo controls. Multiple solos can be combined; ambience stays available, and Clear solos restores the mix. Solos are temporary and clear when loading a preset.

Metronome click timbres live in Sound Settings; eighth-note swing stays with the rhythm controls. Polyrhythm uses the shared Metronome level with a fixed balance alongside the main pulse.

The focus bar’s Mixer button opens the shared console above the bar in any workspace, including Focus view. The same faders, mute/solo buttons and instrument switches move between the main panel and the floating console, preserving their state. Channel strips scroll horizontally on smaller screens. Close or Escape returns the console; mixer level changes preserve exercise playback and tempo.

Evolving chord extensions start enabled for new sessions (an eight-bar blend). Saved presets retain their explicit on/off choice; older presets keep their original static harmony.

Theme surfaces use tonal layers throughout the workspaces: darker page backgrounds, lighter panels and raised cards, clearer controls and background-matched console fader caps. Palette accents and musical highlight colours remain consistent.

Raised surfaces blend toward the palette accent rather than white, retaining their colour. Mixer fader caps match the surrounding mixer background.
