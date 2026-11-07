# Reference performances and chart-aware arrangements

All twenty backing styles now have a complete original ensemble study. The first
Blues and Legato Fusion scores are retained. Eighteen additional studies supply
native-style lead lines, written bass figures and comping parts across a 16-bar
form: statement, development, contrast and return. Blues remains 24 bars.

## Listening

Open Sound Settings, select a backing style, then use Reference performances:

- **Load reference study** loads that style's original chart and suggested tempo.
  The chord-sheet Undo history retains the previous chart.
- **Arrange my chart** applies that style's longer phrasing to the current chart.
  It preserves the chord entries, key, tempo, metre and selected loop; automatic
  chord-extension morphing is disabled so the written changes govern the score.
- **Play full band** unmutes Drums, Bass, Comping and Melodic movement, clears
  solos and mutes Metronome and sustained Harmony. Faders and FX stay as set.
  Stop with the usual transport.
- **Remove arrangement** restores standard backing for the same chart. Undo
  restores the arrangement. The existing standard arrangement library remains
  the default for charts that have not had an arrangement applied.

Only the selected style's study is displayed, keeping the panel compact. The
melodic activity selector is inactive during a scored performance: its phrase
lengths, rests and note counts are written into the score.

## Style catalogue

| Style | Study | Bars | BPM | Pulse |
| --- | --- | --- | --- | --- |
| Pop / rock | Open roads | 16 | 112 | 4/4 |
| Traditional jazz | Turning corners | 16 | 144 | Swing 4/4 |
| Fusion jazz | Side streets | 16 | 118 | Straight 4/4 |
| Blues | Two conversations | 24 | 112 | Shuffle 4/4 |
| Motown | Moving together | 16 | 116 | 4/4 |
| Funk | The small hours | 16 | 104 | Sixteenth-note 4/4 |
| Neo-soul | After the rain | 16 | 78 | 4/4 |
| Bossa nova | Morning tide | 16 | 126 | 4/4 |
| Cuban son | Across the courtyard | 16 | 112 | 2–3 son clave |
| Ballad | Last light | 16 | 66 | 4/4 |
| Jazz waltz | Three steps home | 16 | 138 | Swing 3/4 |
| Afro-Cuban 6/8 | Turning water | 16 | 120 | Three quarter-note metronome beats |
| Samba | Sunlit steps | 16 | 152 | Two-beat feel in 4/4 |
| Second-line | Around the block | 16 | 108 | Shuffled 4/4 |
| Reggae | Leave a little room | 16 | 84 | One-drop 4/4 |
| Slow soul | Hold the line | 16 | 62 | Four pulses, twelve triplet eighths |
| Boogaloo | Late bus | 16 | 108 | Straight 4/4 |
| Modern straight jazz | Oblique lines | 16 | 122 | Straight 4/4 |
| Hard rock | Redline | 16 | 128 | 4/4 |
| Legato Fusion | Drifting light | 16 | 104 | Straight 4/4 |

The existing recorded instrument palette and curated kits are unchanged. Native
percussion foundations are retained where appropriate (including son clave,
conga marcha, samba and one-drop), with scored dynamics, density changes and
transitions over the full form. The new references are compositions, not claims
of newly recorded drum performances or an external AI music service.

## Playback and adaptation

`reference-catalogue.js` contains the additional studies. Lead rows specify exact
MIDI pitches, onsets and durations; bass degree figures and chord attacks are
compiled against the original harmony into exact note/voicing timelines. Drum
foundations and written transitions are compiled over the complete form.
Twelve ticks per beat support both thirds and sixteenths; swing warps the shared
beat phase. The two original references retain their approved timing.

`reference-arranger.js` compiles the entire actual target progression before
playback, including split bars, chord or beat loops, and slash bass notes. It:

- Retains multi-bar source rhythms, rests and melodic contour, while mapping
  chord-tone functions and modal scale degrees to the target harmony.
- Targets chord tones on stronger melodic arrivals, respects altered qualities
  and modal ninths, and chooses nearby registers from the preceding note.
- Voice-leads chord voicings, retaining defining thirds, sevenths and available
  written extensions. Hard-rock power voicings retain their root/fifth character;
  the melody expresses major/minor quality.
- Preserves explicit bass anticipations and chromatic approaches, states new
  changes when needed, and shortens holds that would cross into incompatible
  harmony. Son bass remains anticipated rather than receiving forced downbeats.
- Keeps a full source phrase window across short repeated charts, aligning source
  and target cycles where practical and supplying a closing bar for irregular
  lengths. It does not restart a one-bar melody at every chord change.

Plans are cached across mixer/FX/tempo changes and rebuilt when the harmony,
style, key, metre or loop changes. No generation or network access occurs in the
sample callback. Markers survive draft, export/import and saved-setup normalization.

Exact reference playback requires its matching harmony, durations, native metre,
style, Full chart and chord morphing off. Editing an exact reference falls back
to standard backing with a visible explanation. Applied arrangements instead
recompile for subsequent chord edits. The first adaptive implementation supports
the style's native metre and playback timelines up to 512 beats; unsupported
settings fall back with a visible reason. Tempo and transposition are supported.

## Scope of this checkpoint

This is a deterministic, reference-driven arranger authored with AI-assisted
software/composition work. It does not call Suno or another external generative
music model, learn from audio, or claim live player-level improvisation. The next
musical refinement is listening-led revision of phrase choices, transitions and
adaptation constraints, using these references and unfamiliar charts as evidence.
