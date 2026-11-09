# Musical phrasing and expressive playback

The Exercises menu now has a Musical phrasing group:

- **Motif and space:** a compact scale motif, a chord-tone ending, a held note and a breath. The answer changes the placement and ending.
- **Chord-change targets:** a nearby third or seventh at the chord boundary, followed by current-scale movement and a current-chord tone that leads toward the next guide tone. Shorter chord qualities use available core tones.
- **Question and answer:** short calls followed by quieter answers with reversed contour and changed rhythmic placement.

These are original generated studies, not Tim Miller transcriptions. They use the current chart and assigned CAGED positions. With a held chord, they write a four-bar phrase. Phrase subdivision controls eighths, triplets or sixteenths; notes also have longer written durations and real rests. Short chord slots reduce the phrase to a target and space. All selected notes are actual fretted pitches; no open-string defaults are introduced.

Targets, dynamics and timing travel through the same score, TAB, note selection, fretboard, playback, looping and final-resolution path as the existing studies. The chart itself stays unchanged. Saved exercise options and journal imports recognize the new studies. Position captions appear when the position changes, rather than under every repeated bar.

## Backing performance

The current sample sources, guitar amplifier/cabinet and 35% chorus are retained. No external AI, downloads, new sound choices or arrangement controls are involved.

- Comping, bass and melodic movement receive a modest eight-bar dynamic arc; melodic answers are quieter. This is deliberate phrasing, independent of timing jitter.
- Short comping gestures use damped releases; longer guitar/piano gestures can ring. Authored reference articulations take precedence. Guitar strokes have a small low/high-string emphasis and faster muted strokes or slower swelled strokes.
- Connected melodic articulation is requested by suitable tones/styles. Sampled flute uses its existing sustained sample start only for different, nearby, overlapping pitches (up to a fifth). Repeated notes, large leaps, detached phrases and notes after rests retain their attack. Guitar recordings have no invented hammer-on/pull-off layers; their overlap uses envelope crossfades. Delayed incoming notes do not release the preceding note early.
- Bass attack responds to velocity, short notes release faster and a fresh pluck damps the previous low note with a 25ms overlap rather than stacking long bass tails.
- Sample endings fade over 64 output frames, avoiding a hard edge at EOF.

Pitches, backing rhythms, drum parts and the selected instrument libraries are preserved. This changes articulation and phrasing; it does not supply new recorded performance articulations. Long notes remain limited by the real recording's length or its existing sustain loop.

## Validation

- 80 targeted engine/exercise/source checks passed, including all 20 ensembles, chart harmony, block-independent rendering, full-fader headroom, new phrase timing and transition envelopes.
- Phrasing pitch and target checks span all 12 keys, essential and altered ii–V–I charts, and 1/2/3/4/5/7-beat slots. Subdivision tests verify notes, rests, durations and score/playback correspondence.
- Nine browser workflows passed: the two new phrasing workflows plus existing all-style, chart/mixer preservation, composition, mobile engine and native guitar processing workflows. The new score was inspected at phone width.
- Production TypeScript/Vite build passed. The callback benchmark was run; it measures this machine, not a physical phone's audio stability.

An older ensemble test still expected the superseded qElectricGuitar source prefix; its assertion now checks the preferred qEmilyGuitar bank. The flute transition test now requests legato explicitly and additional tests verify reattacks after rests/repetitions/leaps.
