# Systematic exercise library

The library separates **material/source**, **note order**, **routine**, **register**, **travel** and **rhythm**. A familiar name may identify an order; it does not create a second copy of that order. Existing generators and saved identifiers remain readable for compatibility.

## Material-first controls

The visible editor starts with **Material → Source → Pattern family → Pattern → Starting note**. The old study/material/traversal selectors are internal compatibility controls, not parallel user-facing menus.

- Material is Scale notes, Triad arpeggios or Seventh arpeggios. Continuous traversal belongs to either material. Triad material limits selected-chord notes, chromatic targets and the final resolution to three core tones.
- Sources distinguish the current mode, pentatonic collections, the selected chord, all scale-degree arpeggios, arpeggios rooted on chord tones, and triad pairs where applicable. Only compatible families are offered for each source; no source selection is silently ignored. Non-seven-note mode-derived collections retain their three-/four-note stack terminology.
- Families distinguish intervals, overlapping note groups, group permutations, returns, expanding intervals, skips, pedals, whole-arpeggio orders and chromatic patterns. **Groups of 3 notes** and **Groups of 3 arpeggios** explicitly name different units.
- Pattern selects a concrete group size or order. Compatible material changes retain the selected pattern. Whole-arpeggio root sequences remain separate from internal note order.
- Starting note is available beyond continuous traversal. Whole-arpeggio patterns call the control **First arpeggio root**; enclosures/approaches call it **First target**, avoiding a false claim about their first audible note. Choices are constructed from complete fitting cells, rather than offering unusable entries.

Continuous scale entries offer all available scale degrees, retaining structural degree roles across modes; legacy chord-degree starts remain readable. Other sequence entries choose the initial cell, retaining internal order, alternating/rotating phase, bar-line continuity and existing boundary rules. Entries that no longer fit a changed setup report their fallback. Starting entries are included in favourite identity and readable labels.

Less-used advance, order variation, register, routine and preparation controls live under **Pattern variations**, with an active-settings count. Its open state survives control changes. Fingering, position routes, diagrams, rhythm and playback retain their existing areas.

Exact extended-chord shapes transferred from Fretboard use an explicit **Fretboard chord shape** material, retaining their written notes, inversion and register. This contextual option avoids silently reducing an imported extended arpeggio to triad/seventh material. Old per-string favourites retain the same exact-shape behavior. The normal material menu retains its three primary choices.

Study templates and favourites still load the relevant recipe in this editor. The underlying saved identifiers remain compatible. Removed closure, nested bracket and cell-label controls remain absent.

## Canonical arpeggio orders

- Each tone once: **6 triad permutations**, **24 seventh permutations**, grouped by starting tone. Triads play the selected order without automatically repeating the starting tone.
- Repeat one tone: every tone appears, one appears twice, no adjacent repeated tones. **18** four-note triad orders and **144** five-note seventh orders, grouped by repeated tone.
- Starting-tone pedal: 1–3–1–5–1 / 1–3–1–5–1–7–1.
- Up and back for sevenths: 1–3–5–7–5–3.

Named duplicates migrate to the numeric order. Triad Broken pairs and Up/back become 1–3–5–3; triad Wide skips and Outside–inside become the open 1–5–3 permutation. Seventh Broken pairs, Wide skips and Outside–inside become 1–3–7–5, 1–5–3–7 and 1–7–3–5. Straight becomes the corresponding ascending/descending permutation, without adding a triad closure. Familiar names remain labels on those orders.

## Independent routines and preparation

**Order routine** repeats the selected order, reverses alternate cells, cycles entry tones, or chooses the nearest available entry into the next arpeggio. Inversion/nearest-entry routines rotate the chosen order rather than introducing new note-order vocabulary. The nearest-entry choice uses the last audible note, including across bars and turns.

**Chromatic preparation** is separate: none, semitone below, semitone above, or following cell direction. It works on the chosen order and preserves complete approach/target pairs. The older separate Approach every arpeggio tone entry migrates to this configuration.

**Cell register** places the other tones within the octave above/below the entry or alternates that placement. **Travel through position** orders the roots. A fixed permutation is not silently reversed when root travel turns. Repeated notes explicitly required by the selected cell remain written.

The selected-chord source with entry-tone cycling replaces the overlapping Selected-chord inversions / Arpeggio groups of four entries. Old alternating exercise entries migrate into an order routine or alternating register, according to their previous behaviour.

## Boundary rules

Continuous scale/core traversals retain their unrepeated turning endpoints. New fixed cells use their structural root or enclosure target to select the next cell, rather than using an unrelated high/low note within the pattern. Multi-variation routines also track the entry-tone variant, so a turn neither replays the completed boundary cell nor skips the remaining variations of that root.

Repeated unchanged bars continue their cursor. Changed harmony/position follows the existing family-specific entry policy; Shape default for continuous chord-tone traversal re-enters at the directional boundary. Missing pitches never cause substitutions or compressed patterns. Chromatic approach pairs and enclosure cells remain complete within their harmony slots.

## Enclosures

The bounded chromatic family uses ±1/±2-semitone approaches, both sides of the target, no adjacent duplicates, and a final semitone approach. Counts include the target:

| Size | Unique approaches | Repeated approaches | Total |
| --- | ---: | ---: | ---: |
| 4 notes | 12 | 4 | 16 |
| 5 notes | 12 | 40 | 52 |

These counts exhaust the stated family, not all pitches, rhythms or registers. Three-note diatonic/chromatic-neighbour rules remain available under the same Enclosures entry. Legacy four/five-note recipes migrate to the same exact approach order.

## Favourites

The explicit **☆ Favourite / ★ Favourited** toggle uses the existing `mehtronome-exercise-favourites` store. The Favourites selector recalls choices on the current chart. Clicking an active star removes it. Reloads preserve the list. Existing saved-options records migrate and aliases deduplicate by canonical recipe.

Musical differences such as source, order, register, routine, preparation, direction and rhythm remain separate favourites. Page zoom/display and tempo do not create duplicate bookmarks. Unused fingering values are ignored for CAGED traversals. No existing saves are deleted by a read; a toggle writes the migrated list.

## Verification

100 focused checks cover catalogues, physical pitch validity, source/routine/preparation combinations, upper/lower turns across CAGED regions, inversion cursors, nearest-entry decisions, old-save migration, deduplication and favourites. Seven browser workflows cover the unified menus, actual exercise playback, stars, reloads, old saves, mobile layout and vector rests. Production build passes.

A stale nine-note phase assertion was updated to the already established contract: unchanged bars continue phase, while a changed harmony with Shape default re-enters its directional boundary. The positional traversal implementation itself was not changed.

Licks/transcriptions and other tailored musical vocabulary remain a future category, separate from this rule-based library.

## Notation captions and ending direction

Cell/segment counts are omitted from the score. Position captions appear on entry and when the position changes, without repeating under unchanged bars or on continued systems.

The ending prefers the nearest different core tone of the opening harmony in the final structural traversal direction. This direction comes from cell/root travel, not a permutation's final internal interval; continuous and per-string traversals use their next travel leg. If no such tone remains inside the position, the existing nearest-tone fallback stays within that position. Regressions include descending G on A-string fret 10 resolving to E on A-string fret 7, and its upward counterpart.

## Extended scale and arpeggio sequences

The generators distinguish scale-note sequences, overlapping selected-chord arpeggio sequences and whole arpeggios built from chosen roots. The visible material/source/family controls expose these distinctions without separate top-level exercise lists.

Scale and core-arpeggio sequences share these finite families:

- Pairs at ordinal distances 1–2 through 1–8. Interval names apply to seven-note scales; other collections and arpeggios use note-step labels.
- Overlapping groups of 3–8 consecutive notes.
- All six three-note and 24 four-note permutations, grouped separately. Straight orders reuse the equivalent group recipe when bookmarked; the existing 1–3–2–4 entry belongs to the four-note permutations.
- Return patterns across spans 3–8, with or without the final starting note.
- Expanding, contracting, and combined intervals across spans 3–8.
- Three skip/step pairs using skip distances 2–6 scale/arpeggio steps.
- Fixed lower/upper pedals against a moving note.

Cell advance selects every first, second or third valid anchor in each travel leg. Cell order is written, reversed, alternating in either phase, rotated, or a cycle of all orders for three/four-note groups. Rhythm remains independent. Permutations and internal-order phase continue across bar lines; an incoming harmony/position adapts the outstanding ordinal to a complete fitting cell. No unavailable interior pitch is substituted. Longer cells can span bars. Final resolutions retain structural travel direction. Existing groups of three/four keep their established range-turn policy; straight permutation aliases use the same policy.

**Whole-arpeggio families → Arpeggio-root sequence** applies the same catalogue to whole arpeggios. Root steps refer to the selected source: all scale roots, chord-tone roots, or octaves of the selected chord. Every root in a motif must have a complete realization of the chosen note order/register/preparation. Otherwise the motif is unavailable in that position, rather than compressed or reharmonized. Existing empty-material warnings remain visible. Chromatically prepared motifs retain the complete-cell slot policy.

Legacy core arpeggio groups of three/four restore into Arpeggio sequences. Favourites retain sequence, order, advance and root-sequence settings; unchanged straight defaults remain compatible. Tests cover catalogue completeness, physical pitches and theoretical steps across modes/keys/positions, cell phase, root motifs, preparation targets, legacy saves, actual browser playback and mobile menus.

## Cell brackets in the duration-aware score

The current notation/TAB renderer retains the generator's cell lengths, sizes and carried offsets. Brackets mark each logical cell independently of beat beams and bar lines. A cell crossing a bar has one bracket; one crossing a score-system boundary has open continuation ends and keeps its identifier. Single-chord flattening preserves the original cell metadata. Resolution notes and one-note traversal steps do not receive misleading cell brackets. Cell details are available in bracket accessibility labels/titles; diagnostic count captions remain omitted.

Checks cover scale/core-arpeggio/whole-arpeggio cells, enclosure rests, single-chord flattening, repeated short harmonic cycles, line continuations and browser display/playback.

## Simple interactive cell brackets

Each logical cell has a single bracket level, including whole-arpeggio root motifs. Brackets retain identity across bars and score systems. Playback highlights the current cell; click/tap or Enter/Space selects its notes and enables Loop. Play starts the selected passage. Clear selection restores the full exercise. Solo playback starts at the first selected note; accompaniment retains the enclosing bars and their original harmonies through a private playback chart.

Nested brackets, printed cell labels and the Cell labels menu have been removed. Old label display preferences are ignored. The Close on starting tone control is also removed: restored exercises normalize implicit closure to false. Explicit repeated-tone patterns remain available as written patterns. Favourites no longer distinguish the retired closure setting.

Verification covers the absent controls/layers, unchanged simple-bracket continuations, solo/backed cell playback, keyboard selection, sequence menus, favourites and legacy options.

## Material-first verification

73 focused model checks and five current-menu browser workflows pass. Coverage includes material/source/family mappings, preserved pattern choices, actual non-root entries, bar-split equivalence, chromatic targets, triad resolutions, favourite migration, exact extended-shape transfers, non-seven-note stack labels, playback and mobile width. Production build passes.
