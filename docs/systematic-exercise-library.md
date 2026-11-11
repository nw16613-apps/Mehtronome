# Systematic exercise library

The exercise library uses **source → material → pattern family → note order**, with register and fretboard travel handled separately. The same families apply to diatonic arpeggios and the diatonic arpeggios rooted on the backing chord's core tones, including their alternating variants. Chord-root filtering and material size remain independent.

## Arpeggio families

- Straight (existing behaviour is the default).
- Permutations: each tone once. Triads have **6**, seventh arpeggios **24**, grouped by starting tone. Triad cells optionally close on their starting tone an octave away, producing the requested four-note cells without changing the permutation count.
- Repeat one tone: every tone appears, one appears twice, and no consecutive tones are identical. There are **18** four-note triad cells and **144** five-note seventh-arpeggio cells, grouped by repeated tone. Closed triad cells overlap with this family; family counts are not disjoint totals.
- Inversion cycle.
- Broken pairs: 1–3–5–3 / 1–3–7–5.
- Wide skips: 1–5–3 / 1–5–3–7.
- Outside–inside: 1–5–3 / 1–7–3–5.
- Return to starting tone: 1–3–1–5–1 / 1–3–1–5–1–7–1.
- Up and back: 1–3–5–3 / 1–3–5–7–5–3.
- Chromatic approach to each tone: semitone below, then target.
- Connected arpeggios: nearest available entry into the next arpeggio.

The shared process naturally produces some identical short triad orders in differently defined families. All numbers describe each individual arpeggio's own tones; actual thirds/fifths/sevenths retain the selected collection's alterations. Notes are never replaced to force a pattern into the position.

**Cell register** places remaining tones within the octave above or below the entry, or alternates that placement. **Travel through position** orders the arpeggio roots from low to high or high to low. Changing travel never reverses a selected permutation. Closed triad permutations end an octave from the entry; other repeated tones retain their window pitch. Existing alternating exercise variants alternate cell placement.

Patterns adapt to the incoming harmony and use the existing fixed-region/manual position path. Longer cells can flow across slots in the existing progression sequencer; chromatic-approach cells retain complete approach/target pairs within a harmony. Cells with unavailable pitches are omitted, and the existing no-fit warning/rest policy applies. Pattern, register and triad closure persist in saved exercises and journal entries. Older snapshots default to Straight.

## Enclosure families

The generated chromatic family is deliberately bounded: approaches are ±1 or ±2 semitones, must use both sides, cannot repeat immediately, and must finish a semitone from the target. Counts include the target:

| Cell size | Unique approaches | Repeated approaches | Total |
| --- | ---: | ---: | ---: |
| 4 notes | 12 | 4 | 16 |
| 5 notes | 12 | 40 | 52 |

Menus separate unique/repeated families, then group orders by final approach above/below. Printed offsets are semitones relative to the target. These counts exhaust this rule set, not every possible enclosure pitch/rhythm/register combination. Diatonic-neighbour three-note enclosures remain separate exercises. Earlier four/five-note saved variants migrate to the exact same pitch order in the new menus, including descending double enclosures.

## Future vocabulary

Licks and transcriptions are a future, separate category for concrete musical vocabulary, organised by source, harmonic setting and musical device. They are not generated or imported by this update.

## Verification

73 focused checks cover catalogue counts/uniqueness, every triad/seventh order in every key and both source families, altered tones and actual string/fret pitches, register/travel, all shared general families, targets, progression timing, snapshots/journal and legacy enclosure migration. Four browser workflows cover the grouped menus, material changes, saved choices, playback and mobile presentation. Production build passes.
