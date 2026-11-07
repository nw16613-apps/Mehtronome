# Written reference performances

This checkpoint adds two original ensemble scores, as an audition target for a
future progression-aware arranger. It does not call a music-generation model or
service. The existing standard arrangements and recorded sounds remain available.

## Audition

Open Sound Settings → Reference performances. Load either study, then choose
**Play full band**. Stop with the regular transport. Loading stores the previous
chart in the chord-sheet Undo history, selects the matching style and suggested
tempo, and turns off automatic extensions, tempo training and gap training.
Play full band unmutes the four backing tracks, clears solos and mutes the click
and sustained Harmony. Existing faders and FX remain unchanged.

- **Blues · Two conversations**: 24 bars / two 12-bar choruses in F, 112 BPM.
  Walking electric bass includes written chromatic approaches, while guitar
  chord replies leave room for the organ line. The second chorus develops the
  opening motif and has its own voicings, bass route and drum dynamics.
- **Legato Fusion · Drifting light**: an original 16-bar form, 104 BPM, opening
  in A Lydian and moving through C minor, E-flat Lydian, D minor, G dominant,
  C Lydian, F-sharp minor, B-flat Lydian and E dominant before returning to A.
  Recorded flute carries connected phrases over sustained guitar and a melodic
  electric-bass line. Ride, ghost notes and tom transitions follow the score.

## Score and playback contract

`reference-performances.js` contains exact MIDI pitches, beat onsets, durations,
velocities and per-bar drum events. It indexes these on configure; no network
requests or generative work run in the audio callback. It bypasses the standard
bar-cell/scale-index selection while retaining the current samples, common clock,
mixer and FX. Blues eighths swing; fusion uses the straight sixteenth grid.
Held notes are not cut merely because the engine updates its current harmony.

Tempo and whole-chart transposition are supported. Matching checks require the
written chord roots, qualities, modes, bass overrides and durations, the matching
style, 4/4, Full chart, and automatic chord extensions off. If those change, the
app displays the reason and plays the standard chord-aware backing instead.
Names and rehearsal marks may be edited without invalidating the score.
The reference ID survives draft normalization, chart import/export and saved
setups; it never suffices by itself to authorize playback against altered chords.
The normal startup chart selection is unchanged. Reopen the working draft or a
saved setup to resume its reference score. The melody activity selector is
inactive for a written score because its notes and rests are fixed.

## Remaining work

These are reference performances for musical feedback, not a general arranger.
Next: identify successful multi-bar phrases, add chord-function/voice-leading
constraints, and test their adaptation against unfamiliar progressions. Runtime
or offline external model generation would be a separate integration, with output
validated before playback. No claim of external model generation is made here.
