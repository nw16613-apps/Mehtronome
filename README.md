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
- Four synthesized ambient backing sounds: Warm Pad, Glass Cloud, Velvet Drone,
  and Air Choir. Adjustable ambient space adds stereo reverb to harmony only,
  keeping the click dry. Sound and chord changes fade smoothly.
- 33 pedal-chord types, filtered to chords whose notes fit the selected mode.
  Each mode selects a suggested starting chord. Choices include major/minor
  sevenths, ninths, elevenths, sixths, thirteenths, suspended chords, open fifths,
  major ♯11 voicings, and half-diminished chords. Rich voicings sound all their
  displayed chord tones; arpeggio view follows the chosen chord. Minor-major,
  augmented-major, altered dominant, dominant ♭9/♯11, diminished, and
  half-diminished ninth chords support the added minor modes.
- Four piano-inspired pedal voicings for each mode: Soft Shell + Color, Open
  Piano, Modal Color, and Floating Upper Voices. They use a stable tenor root,
  guide tones, and upper extensions without lowering notes below the root.
  Modal Color has deliberately selected harmonic content for all 21 modes;
  the chord label, highlighted notes, and octave display follow what is played.
  Choose Custom chord to access the full 33-chord menu. The ambient instrument
  sounds are unchanged: these are piano-style note arrangements, not piano samples.
  Existing progressions use the selected spacing style on each original triad;
  mode-specific color content is reserved for pedal backing.
- Dark mode, initially following the system preference, with a theme button that
  remembers your choice in this browser.
- A sustained pedal triad or I–vi–IV–V (minor: i–VI–iv–v), one chord per bar.
- Scale and current-chord arpeggio note displays; separate click/harmony volume.

For modal practice, start with Dorian + minor 13, Lydian + major 9 ♯11,
Mixolydian + dominant 13, or Locrian + half-diminished 7. Try the characteristic
mode degree against the sustained harmony. The new modes use pedal chords;
mode-specific progression templates are deferred. Existing major/minor
progressions remain available, with their original triads.

Notes are visual guides for playing your own instrument, not automatic scale
playback. Backing uses synthesized tones. Playback pauses when the page is hidden;
press Start to begin again. Use wired headphones for consistent perceived timing.

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

### Publish a testing link

No public deployment has been created from this workspace. The included GitHub
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
