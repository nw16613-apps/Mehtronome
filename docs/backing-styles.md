# Coordinated backing styles

Sound Settings presents a single Style selector instead of per-instrument sound, rhythm and riff controls. Metronome sound remains independent, and the existing chord-extension movement controls remain available. Instrument sound controls are retained inside a hidden compatibility container for saved setups; they cannot override the chosen style during a settings refresh.

| Style | Drums | Bass | Comping |
| --- | --- | --- | --- |
| Pop / rock | Straight backbeat | Root/fifth | Bright chord stabs |
| Traditional jazz | Swing ride | Walking chord tones | Crisp jazz syncopation |
| Fusion jazz | Syncopated fusion | Displaced sixteenths | Bright electric-tine accents |
| Blues | Shuffle | Chord-aware shuffle figure | Short swung responses |
| Motown | Driving backbeat | Melodic eighths | Clipped offbeat clav-style keys |
| Funk | Syncopated pocket | Funk chord-tone figures | Dry sixteenth-note stabs |
| Neo-soul | Spacious pocket | Spacious bass phrases | Articulate electric-key chords |
| Bossa nova | Light cross-stick | Syncopated root/fifth | Bossa chord rhythm |
| Latin | Latin groove | Anticipated tumbao | Interlocking chord accents |
| Ballad | Sparse drums | Gentle counterline | Longer, spacious chords |

Each arrangement also selects a repeatable melodic role/source, phrase length, register, density, development and interaction, plus a sustained harmony texture. The optional melodic track remains under mixer mute control. Patterns follow the current chord and scale guide rather than fixing pitches or replacing the user's chart. Related four-bar cells create answers instead of one identical bar repeated indefinitely.

The style does not alter the tempo, meter, key, chord progression, CAGED positions, metronome subdivision/swing, extension choices, levels, mute or solo. All backing tracks remain enabled; the mixer determines which tracks are audible. Changing style does not start playback. Active playback receives the new arrangement through the existing settings path.

The comping track is now named Comping keys. New bright-key, bright-tine and clav-style synthesized voices use faster attacks, stronger upper partials and shorter releases than the old warm-tine default. They use the existing bounded oscillator pool and cached envelope factors. Older tones remain readable for compatibility. Jazz/blues swing is shared by drums, bass and comping; it does not change the metronome's own swing control.

Style selection persists locally and is included in saved/imported/exported practice setups. Older instrument-based setups infer a matching style from their drum, bass and comping choices while retaining mixer audibility. Explicit saved styles take precedence.

Validation covers catalog bindings, distinct rendered phrase signatures, multiple meters and chord changes, bounded audio, attack/partial/release measurements, shared sample-clock swing, legacy preset migration, persistence, no automatic audio start, preservation of chart/tempo/mix, live engine settings and responsive layouts.
