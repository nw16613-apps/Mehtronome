# Expressive backing playback

The experimental Musical phrasing exercise group was removed at the user’s request. Existing scale, arpeggio and other exercises are restored. Saved options for its three retired studies fall back to Positional arpeggio. The backing articulation improvements and louder swell adjustment below are retained.

## Backing performance

The current sample sources, guitar amplifier/cabinet and 35% chorus are retained. No external AI, downloads, new sound choices or arrangement controls are involved.

- Comping, bass and melodic movement receive a modest eight-bar dynamic arc; melodic answers are quieter. This is deliberate phrasing, independent of timing jitter.
- Short comping gestures use damped releases; longer guitar/piano gestures can ring. Authored reference articulations take precedence. Guitar strokes have a small low/high-string emphasis and faster muted strokes or slower swelled strokes.
- Connected melodic articulation is requested by suitable tones/styles. Sampled flute uses its existing sustained sample start only for different, nearby, overlapping pitches (up to a fifth). Repeated notes, large leaps, detached phrases and notes after rests retain their attack. Guitar recordings have no invented hammer-on/pull-off layers; their overlap uses envelope crossfades. Delayed incoming notes do not release the preceding note early.
- Bass attack responds to velocity, short notes release faster and a fresh pluck damps the previous low note with a 25ms overlap rather than stacking long bass tails.
- Sample endings fade over 64 output frames, avoiding a hard edge at EOF.

Pitches, backing rhythms, drum parts and the selected instrument libraries are preserved. This changes articulation and phrasing; it does not supply new recorded performance articulations. Long notes remain limited by the real recording's length or its existing sustain loop.

## Validation

The retained audio changes passed the earlier ensemble, source and native/mobile browser checks. Removing the musical phrasing exercises passed 28 targeted checks covering existing exercise options, progression timing, resolution, expression and preferred samples, plus the production TypeScript/Vite build. Retired favourites migrate to an available exercise. No audio source files changed during removal.

## Swell balance follow-up

The native swelled-guitar **comping** output now has a +5dB post-amplifier trim. This brings the soft body forward without increasing sample velocities, changing the amplifier drive, attack/release shape, chorus mix, other guitar tones or melodic movement. The mixer fader remains a linear level control. Native offline browser coverage includes reference and full-fader swell levels.
