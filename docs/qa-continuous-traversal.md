# Continuous traversal QA — 12 November 2026

Scope: Exercises → Continuous traversal, Scale notes and Core chord tones. Other exercise families were not part of this audit.

## Findings and fixes

1. Partial older exercise snapshots could throw when `study` was absent. They now restore with the existing positional/core-tone default; explicit starts and the full traversal scope remain intact.
2. Material and fingering could disagree. A core-tone traversal could retain the scale-only 3NPS fingering, or a scale traversal could retain a chord-tone/drop fingering. The fingering menu now offers CAGED/3NPS for scale notes and CAGED/1–2/2–1/Drop 2/Drop 3 for core tones. Switching between incompatible material types selects a compatible fingering and resets its entry/inversion to a valid root/default. Compatible selections retain their state.
3. Continuous directional-leg brackets lost their carried offsets at short bar boundaries. CAGED core-tone and non-CAGED traversal legs now retain their full size and note offset, so a bar boundary does not falsely announce another cell. Pitches and timing are unchanged.

## Verification

- 65 focused model checks pass across positional scales/arpeggios, starts, turns, changed modes/chords/positions, per-string shapes, resolution and brackets. The affected 27-check subset passes after the final entry-reset adjustment.
- Current-menu browser QA compares 60 combinations: two materials × five CAGED positions × two directions × three rhythms. Every written MIDI pitch matches an independently constructed traversal cycle; each string/fret belongs to the selected diagram.
- Structural degree starts, favourite recall, solo playback and mobile width pass.
- Material changes from a high scale starting degree to chord-tone material produce a valid inversion and the correct pitch collection. Default recommended non-CAGED shapes remain fully fretted.
- Mixed minor/dominant/major charts pass automatic-region and manually selected position routes. Third-degree entries follow chord quality; slot onset times, note counts and allowed pitch collections agree with each harmony.
- Backed playback reaches the next written chord/notation slot and highlights one chart card; the original saved chart remains selected.
- Simple bracket selection/looping regression passes. Production build passes.

## Existing musical rules retained

Scales traverse every distinct available scale pitch. CAGED core-tone traversal uses its established window of up to nine consecutive core-tone pitches, anchored at the starting-direction boundary; smaller available collections use shorter spans. A nine-pitch span has sixteen attacks in a complete up/down cycle. Ordinary turning endpoints are sounded once. Explicit degree entries and changes of chord/position retain the existing family-specific continuation rules. Eighths, triplets and sixteenths change timing rather than the pitch pattern.

The nine-pitch core-tone window is a design constraint, not a claim that every available core-tone pitch in a wider position is included. It was left unchanged for review.
