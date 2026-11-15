# Fingering and exercise consistency review — 15 November 2026

The governing rule is: material/source defines the musical collection; fingering defines its physical coordinates; traversal orders the physical shapes; pattern, note order and rhythm operate on that same material. Switching pages must preserve this recipe. No additional exercise-scope selector was added.

## Implemented in this change

- Shared arpeggio source definition for the diagrams, alternating-string catalogues and whole-arpeggio exercise seeds.
- Selected chord shows its triad or seventh material. Ordinary modal triads have a compatible seventh counterpart; a triad selection is named as a triad rather than retaining the seventh chord's symbol. Backing harmony is retained.
- All scale degrees displays every modal arpeggio. Chord-tone roots displays the modal arpeggios rooted on the backing chord's core tones; extensions do not become additional source roots.
- Removed the separate View arpeggio filter that silently reduced only the diagrams. Modal position/route details now show separate, named source-member diagrams with degrees relative to each member and its physical bass inversion.
- CAGED and modal 3NPS retain their original physical positions. Dedicated 1–2–1–2–1–2 and 2–1–2–1–2–1 layouts expose the same three sources and their inversion entries. Their selected physical shape, register and inversion stay linked into Exercises.
- Removed redundant Build from selectors for the dedicated arpeggio layouts. Extended inversion persistence beyond the old eight-entry limit.
- Straight whole-arpeggio orders now obey their source. Complete arpeggio patterns no longer receive isolated boundary notes that disrupt their grouping.
- Parent-scale position labels distinguish physical scale anchors from arpeggio roots and no longer claim an unfiltered scale-note count for an arpeggio subset.
- Fixed the selected dedicated arpeggio's neck map: viewing a member no longer recalculates chord-tone roots from that member instead of the backing chord.
- Preserved the vertical gallery → navigation → detailed shapes → neck map arrangement. Restored the relocated Fingering selector's styling.

## Findings addressed in the follow-up implementation

### 1. Study does not use the same material recipe as Fretboard/Exercises — high priority

`web/src/practice/study-path.js` owns a separate `STUDY_MATERIALS` list that combines material, source and pattern (for example Core arpeggio, Arpeggios from chord tones, Scale in thirds). The Study load handler in `main.ts` assigns CAGED and seventh material directly. Consequently a study cannot express every valid recipe available in Exercises, and launching one can replace a chosen fingering.

Recommended next change: Study should construct the same material/source/fingering/pattern recipe, while its tiers control harmony and position progression. Preserve compatible existing physical choices, or expose an explicit study template choice.

### 2. Fit is checked too late for some pattern/shape combinations — high priority

A physically valid small string block can still lack a complete selected arpeggio order or enclosure. `progression-exercises.js` detects this during generation, sometimes leaving no playable study. The diagrams now explicitly identify partial source members, but the exercise menus do not consistently explain or disable incompatible patterns before selection.

Recommended next change: one shared capability check for the selected shape/route and pattern. Disable impossible choices with a specific reason. Show a clear empty state instead of an all-rest score. Do not invent missing pitches or silently switch the pattern.

### 3. Fingerings and sources have uneven pattern/traversal coverage — medium priority

`neck-traversal.js` allows across-neck routes for CAGED, modal 3NPS and dedicated pentatonic layouts, but not the alternating-string arpeggio layouts. `contentFamilies()` gives Triad pair only its dedicated line family, whereas selected triad material offers the systematic groups/permutations families. These restrictions are explicit, but the same general study method is not yet available wherever physically meaningful.

Recommended next change: separate genuinely impossible combinations from unimplemented combinations, then extend the shared route/pattern engine to the latter without adding parallel families.

### 4. Changing a source or pattern resets valid starting choices — medium priority

`changeContentFamily()` unconditionally resets `entryTone` and `startTone`, and it is also called by material/source changes. A valid selected starting degree can therefore disappear when changing another dimension of the recipe.

Recommended next change: preserve each valid starting choice and reset only those that are incompatible with the new material/shape. State any necessary fallback beside the affected control.

## Scope and evidence

Reviewed Study setup/loading, source and material menus, CAGED/modal-3NPS/dedicated-arpeggio diagrams, horizontal/diagonal routes, whole-arpeggio generation, selected inversion maps and favourites. This is a focused structural review; it is not a claim that every app feature or every musical result has been exhaustively audited.

Regression coverage includes exact source membership in all 12 keys and all seven diatonic modes; triads and sevenths; both straight and explicit permutation orders; physical note coordinates; source/inversion catalogues; cross-bar phase; and complete arpeggio-cell boundaries. Browser checks cover both pages, source collections, selected inversion transfer and map correspondence, layout/mobile behaviour, saved recipes and Study workflows. Physically incomplete blocks are treated as unavailable, not as permission to fabricate notes.

Validation completed: 77 focused model tests and 32 distinct browser workflows passed. Existing Favourites/Study checks were updated from hidden retired selectors/aliases to the current public hierarchy. Build passed. Logs are retained in `/workspace/arpeggio-source-model-full.log`, `/workspace/arpeggio-source-browser-verified.log` and `/workspace/arpeggio-source-browser-last.log`; the last two together contain the final 32 passing workflows.

## Follow-up fixes — 15 November 2026

All four findings above have been addressed:

1. Study now renders shared material/source/fingering/pattern controls from the same recipe helpers, retains the selected layout and register on load, and persists the shared recipe across reloads. Tier controls continue to own harmony and route planning. Study progress IDs include the recipe, and explicit Reload study restores the captured setup.
2. Shared capability checks use the real physical boards and pattern generator, disable unavailable orders/families with reasons, and replace unavailable studies with an explicit empty state. Playback/export are disabled for these states. Study uses the same fit check. Shapes are never padded with invented pitches.
3. Alternating-string arpeggio fingerings now support horizontal and diagonal routes, including selected string blocks and complete-cell requirements. Triad pairs support general interval/group/permutation and whole-triad orders using the selected pair, and favourites retain pair identity. Chord voicings still retain their own physical constraints; impossible pattern/block combinations remain unavailable.
4. Source, material and family changes preserve valid starting choices. Equivalent scale/chord labels are reconciled to the same pitch. An unavailable saved entry remains explicit and uses the directional-boundary fallback rather than silently discarding the saved choice.

The checks are based on actual generated cells, not on whether a menu or score merely exists.

Follow-up verification: 94 model checks and 42 distinct browser workflows passed, covering Study recipe load/reload, tempo/sound preservation, automatic randomisation, desktop/mobile layout, impossible-pattern recovery, all source collections, saved recipes, exact physical routes and starting-note preservation. Fit validation now checks every chord slot in a progression. The follow-up logs are `/workspace/wider-fixes-model-full.log`, `/workspace/wider-fixes-browser-final.log` and `/workspace/wider-fixes-browser-release.log`.
