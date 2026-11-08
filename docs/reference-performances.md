# Reference performances and chart-aware arrangements

All twenty backing styles now have a complete original ensemble study. The first
Blues and Legato Fusion scores are retained. Eighteen additional studies supply
native-style lead lines, written bass figures and comping parts across a 16-bar
form: statement, development, contrast and return. Blues remains 24 bars.

## Listening

Open Sound Settings, select a backing style, then use Reference performances:

- **Load reference study** loads that style's original chart and suggested tempo.
  The chord-sheet Undo history retains the previous chart.
- **Arrange my chart** composes a four-pass performance around the current chart.
  It preserves the chord entries, key, tempo, metre and selected loop; automatic
  chord-extension morphing is disabled so the written changes govern the score.
- **Play full band** unmutes Drums, Bass, Comping and Melodic movement, clears
  solos and mutes Metronome and sustained Harmony. Faders and FX stay as set.
  Stop with the usual transport.
- **Remove arrangement** restores standard backing for the same chart. Undo
  restores the arrangement. The existing standard arrangement library remains
  the default for charts that have not had an arrangement applied.

Only the selected style's study is displayed, keeping the panel compact. All
reference studies and newly applied arrangements default to **Supporting**.
Reopening a saved reference chart also selects Supporting. The melodic activity
selector remains available during playback: Supporting keeps short connected
phrases with longer rests, Countermelody retains more of the line, and Featured
plays the complete written or adapted line. Whole phrase windows are selected rather than
random individual notes. A short cadential answer can finish a retained lead-in
across a phrase boundary. Activity changes do not restart playback.

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
- Builds a complete development cycle over actual chart repetitions. Short vamps
  keep at least a four-bar phrase arc before changing pass, while real rehearsal
  sections cue returning themes and newly composed phrases.

Plans are cached across mixer/FX/tempo changes and rebuilt when the harmony,
style, key, metre or loop changes. Activity changes only re-filter the cached
melodic score, without recomposing or restarting the rhythm section. No generation or network access occurs in the sample callback. Markers survive draft, export/import and saved-setup normalization.

Exact reference playback requires its matching harmony, durations, native metre,
style, Full chart and chord morphing off. Editing an exact reference falls back
to standard backing with a visible explanation. Applied arrangements instead
recompile for subsequent chord edits. The arranger supports the style's native metre and selected chart timelines
up to 512 beats; the compiled development cycle can span up to four chart passes; unsupported
settings fall back with a visible reason. Tempo and transposition are supported.

## Section and cadence checkpoint

Applied arrangements now analyse the actual rehearsal sections and common
cadences before playback. A–B–A forms select opening, contrasting and returning
source material. Unmarked short vamps keep a longer four-bar phrase arc instead
of restarting the melody each cycle. Section cues can occur inside a bar.

Dominant resolutions, tritone substitutes, backdoor movement and minor plagal
returns guide nearby melodic arrivals; deceptive movement resolves into the
actual written destination. Suitable walking, shuffle and Motown bass parts
approach that destination, while son keeps its anticipated bass placement.
Target-section endings receive restrained percussion transitions. Source-location
tom/crash fills are removed when they do not fit the target form. Son clave,
one-drop kicks and twelve-triplet soul patterns retain their native placement.
Contrast sections reduce comping intensity, leaving room around the lead.

The complete Featured source scores remain intact for direct reference playback;
structural recomposition applies only to **Arrange my chart**.

## Chorus development and ensemble interaction

**Arrange my chart** now prepares four passes: Statement, Development, Contrast
and Return. A short vamp repeats for at least four bars before changing pass;
a longer chart uses a complete chart cycle per pass. The active pass is shown
beneath the arrangement controls during playback. This finite development cycle
repeats; it is not unlimited improvisation.

The statement and return keep a recognisable connection to the reference. The
middle passes compose new melodic phrases from a style-specific rhythm and motif
grammar, with goals selected from the actual upcoming changes and cadences.
Contrast develops a slower, inverted motif in a different register. Bass routes
and chordal parts also change across passes: walking/two-feel, sustained parts,
comping replies or ostinatos are chosen to fit the style. Written slash bass and
son anticipations retain their harmonic destinations.

`progression-composer.js` plans complete pitch paths for melody, bass register
and chord voicings. Its shortest-path search considers later candidates and
cadential constraints before tracing the earlier choices. This goes beyond
mapping each reference note independently onto the current chord. Editing an
upcoming destination can change an earlier newly composed phrase while leaving
the opening harmony unchanged. Rhythm/contour grammars remain authored musical
vocabulary; this is a deterministic composition system.

`ensemble-conversation.js` then responds to the **audible** melodic activity:

- Conversational comping softens beneath the lead and removes selected colliding
  stabs. Prepared upper-voice replies can fill genuine gaps. Ostinatos retain
  their defining accents, and sustained chord tails are not cut for a reply.
- Bass attacks can reinforce existing kick accents in suitable styles. Walking,
  son and one-drop foundations are protected rather than forced into that rule.
- Optional tom/soft-snare ornaments move into gaps between lead attacks, including
  space beneath held notes, or are omitted when there is no room. Backbeats,
  clave, conga/bell foundations, one-drop kicks and triplet grids remain in place.
- Shared pass dynamics let the ensemble build, contrast and return together.

The full composition is prepared on the browser's main thread before being sent
to the audio worklet. The engine accepts a matching keyed prepared plan; subsequent
fader and activity messages carry the key without resending or recomposing the
whole score. Activity changes reselect phrases and coordinate the band from the
cached composition. No external model/service is called, and the established
recorded instrument palette is retained.

## Scope of this checkpoint

The chorus-development, ensemble-interaction and first whole-progression
composition checkpoints are implemented together. The fixed reference studies
remain available for comparison and default to Supporting. The arranger's finite
four-pass performances are ready for listening-led assessment on familiar and
unfamiliar charts. External AI-model investigation remains deferred until this
local arranger work has been assessed; no such model has been integrated.
