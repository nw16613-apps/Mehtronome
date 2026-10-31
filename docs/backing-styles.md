# Coordinated backing styles

Sound Settings presents a single Style selector instead of per-instrument sound, rhythm and riff controls. Metronome sound remains independent, and the existing chord-extension movement controls remain available. Instrument sound controls are retained inside a hidden compatibility container for saved setups; they cannot override the chosen style during a settings refresh.

| Style | Drums | Bass | Comping |
| --- | --- | --- | --- |
| Pop / rock | Straight backbeat | Root/fifth | Bright chord stabs |
| Traditional jazz | Swing ride | Walking chord tones | Crisp jazz syncopation |
| Fusion jazz | Syncopated fusion | Displaced sixteenths | Bright electric-tine accents |
| Blues | Shuffle | Chord-aware shuffle figure | Short swung responses |
| Motown | Driving backbeat | Melodic eighths | Clipped offbeat piano |
| Funk | Syncopated pocket | Funk chord-tone figures | Dry sixteenth-note stabs |
| Neo-soul | Spacious pocket | Spacious bass phrases | Articulate electric-key chords |
| Bossa nova | Light cross-stick | Syncopated root/fifth | Bossa chord rhythm |
| Latin | Latin groove | Anticipated tumbao | Interlocking chord accents |
| Ballad | Sparse drums | Gentle counterline | Longer, spacious chords |

Each arrangement also selects a repeatable melodic role/source, phrase length, register, density, development and interaction, plus a sustained harmony texture. The optional melodic track remains under mixer mute control. Patterns follow the current chord and scale guide rather than fixing pitches or replacing the user's chart. Related four-bar cells create answers instead of one identical bar repeated indefinitely.

The style does not alter the tempo, meter, key, chord progression, CAGED positions, metronome subdivision/swing, extension choices, levels, mute or solo. All backing tracks remain enabled; the mixer determines which tracks are audible. Changing style does not start playback. Active playback receives the new arrangement through the existing settings path.

The comping track is named Comping. New bright-key, bright-tine and clav-style synthesized voices use faster attacks, stronger upper partials and shorter releases than the old warm-tine default. They use the existing bounded oscillator pool and cached envelope factors. Older tones remain readable for compatibility. Jazz/blues swing is shared by drums, bass and comping; it does not change the metronome's own swing control.

Style selection persists locally and is included in saved/imported/exported practice setups. Older instrument-based setups infer a matching style from their drum, bass and comping choices while retaining mixer audibility. Explicit saved styles take precedence.

Validation covers catalog bindings, distinct rendered phrase signatures, multiple meters and chord changes, bounded audio, attack/partial/release measurements, shared sample-clock swing, legacy preset migration, persistence, no automatic audio start, preservation of chart/tempo/mix, live engine settings and responsive layouts.

## Chord-only comping

Comping never adds an isolated single-note hook between chord hits. Each attack has at least three simultaneous pitches, on the style's existing chord rhythm. Variation amount chooses among cached complete voicings; it does not add notes or change hit timing. All styles use chord-extension variations and inversions. Fusion and neo-soul also use related modal chord colours.

Base voicings retain the selected chord quality and a suitable written extension when present (the exercise seventh-chord limit does not apply to backing). Triads stay triads; two-tone chords use octave doubling without inventing a third or seventh. Compact inversions stay in the keyboard register. Seven-note modal alternatives use complete alternate-note triads sharing a third/seventh guide tone with the backing chord; every note belongs to the current scale. Other collection sizes retain actual chord inversions and only their available modal extensions. Future harmony is not played before its change.

The removed hook generator and single-note event path cannot be reactivated by old saved movement settings. The separate Melodic movement track and its mute, rhythm and note-source behavior are unchanged.

### Genre instruments

Each style also selects its comping instrument, bass bank and acoustic-kit treatment. Pop/rock uses clean electric guitar; blues uses the same recorded guitar with modest drive. Traditional jazz and Latin use acoustic piano; Motown uses clipped piano plus recorded tambourine; bossa uses nylon guitar. Ballad uses softened acoustic piano. Traditional jazz, bossa, Latin and ballad use plucked upright bass; the other styles use fingerstyle electric bass. Fusion and neo-soul retain electric tine keys; funk retains dry clav-style keys.

The drum treatments share the existing acoustic recordings and vary damping/brightness; they are not separate recorded kits. Instrument banks load before transport, with at most four simultaneous decodes, and remain installed across restarts and live style changes. The comping sampler keeps the existing 32-voice bound and ages muted voices. Sample sources and licences ship at `/audio-credits.html`; source hashes and pitch centres are in `web/src/audio/samples/band/sources.json`.

The upright bank now uses soft single-note Meatbass pizzicato recordings selected for stronger fundamentals. Offline pitch correction and gentle overtone damping keep the bass line clear, with no extra worklet processing. Electric bass and the style assignments are unchanged.


## Mix reference and extension vocabulary

Every fader starts at 25% linear gain, displayed as −12.0 dB; double-click returns a fader to this reference. Source calibration is fixed before the faders. Piano, clean guitar, blues guitar, nylon guitar, tine and clav have individual trims so a style change does not make its comping disappear or leap forward. Electric bass, the metronome, drums and melodic movement have calibrated gains; the sustained pad sits further behind the rhythm section. A common 2 dB headroom allowance applies to dry buses. Ambient space stays a quieter reverb return. Saved setup levels, mute and solo choices still apply.

Calibration uses the actual shipped recordings, the same normalization as the browser loader, 20-second Am7/A Dorian renders at 100 BPM with every fader at −12 dB, EBU R128 integrated loudness, transient peaks and active-window RMS. `node scripts/measure-band-balance.mjs` reproduces the measurements (FFmpeg is an offline developer dependency). Across the ten arrangements, comping now measures about −35.7 to −37.5 LUFS, versus approximately −39.3 to −47.4 before calibration. Groove density, accents and the deliberately gentler jazz/ballad patterns remain musical differences; this is not runtime loudness normalization. Tests also check full-band reference headroom over minor, dominant-13 and major-9 harmony and meter accuracy after calibration.

The cached comping vocabulary has up to twelve complete voicings. Chord-extension movement includes mode-compatible 9ths, 11ths and 13ths, their alterations where available, and paired tensions in rootless voicings. Seventh chords retain their defining third/suspension and seventh; altered fifths are retained where they define the quality. Triads do not acquire an invented seventh. A natural 11 is avoided against a major third. Written extensions can vary among suitable subsets rather than being excluded from the vocabulary. The first hit states the base voicing and subsequent style-rhythm hits cycle through colours; no isolated-note hook or extra rhythmic attack is added. Pad extension motion remains separately controlled.
