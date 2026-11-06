# Current workspace cleanup

This pass prioritises clear controls and accurate guidance in the existing six workspaces.

- Sound Settings contains the click sound, one backing-style choice, a description of each part with its mixer status, and evolving chord extensions. Backing settings now come directly from the selected arrangement rather than being written into an invisible instrument form.
- The mixer owns instrument levels, mute and solo. Old exported setup controls remain accepted for migration to the closest backing style. New setups save the backing style and current controls without reconstructing retired sound controls.
- Harmony uses one chord sheet. The old hidden progression strip and draggable timeline are removed. Chart key and selected chord root have distinct explanations, and copy/edit feedback uses a visible status region.
- Fretboard and Exercises retain shared CAGED choices, current notation, voicing references, overlays and playback. Guided-session and inversion instructions describe the actual available options.
- Progress remains a manual checklist with saved setups; its descriptions refer to chord qualities rather than claiming per-voicing assessment.
- The theme gallery uses palette samples rather than old application screenshots. Historical public design galleries are no longer deployed. Their originals remain in Git history.
- Removed Ambient space channel metadata and unused styling for retired interfaces are removed. Source archives and saved-data migrations are retained where removal would not improve the current interface or would need separate compatibility work.

Validation covers all six pages at desktop/phone widths; chart generator and repeat bars; manual CAGED routes and legacy saved setups; style changes reaching the real audio worklet and exercise backing; visible copy fallback; theme selection; send controls and isolated FX buses. Audio-engine calibration tests and the TypeScript/Vite build also pass. These checks do not establish physical-device listening quality or the status of historical browser suites for removed features.

## Exercise guidance follow-up

Exercise help is now one short, study-specific paragraph under About this exercise. The duplicated chord/material list, starting-note prose, timing essays, grip reference and footer instructions are removed. A single key stays beside the diagram; a single trainer message stays beside its controls. Distinct timing/availability warnings remain near the exercise choices. Eleven browser checks cover the condensed structure, desktop/mobile layouts, chart/CAGED preservation and selected-passage playback; the exercise-option checks and TypeScript build pass.

## App-wide text review

Reviewed all six pages with their reference disclosures expanded. Mixer operations and FX routing each have one explanation; ordinary accent and trainer states no longer repeat the controls. Harmony removes duplicated mode/backing narrative and shows evolving-extension state only when relevant. Fretboard keeps one scale/pitch reference, parent fingering and unique overlay omissions instead of repeating its diagram and legend. Progress uses a short suggested-session pointer instead of repeating checklist labels; the guided banner keeps its title/navigation with the setup tip beside the goal choice. Generator help and statuses are shorter, and routine chart draft updates use a single status location. Saved-data scope, compatibility warnings, mode insights and licence/source information remain.

Twenty scoped browser workflows pass across the text review, generator, shared routes, playback, mobile mixer and current pages; ten context/learning checks and TypeScript pass. Two old pulse-test expectations were updated for the current six-channel mixer and the intentional removal of redundant normal-accent prose.

## Compact practice checklist

The five repeated stage lists are replaced by four cards: Hear the sound, Practise positions, Connect positions and Apply an idea. Normal headings sit inside each card instead of overlapping the fieldset border. Individual completion controls live under Mark progress, with position/pair chips and compact activity labels. All 17 historical completion IDs and the root/mode/chord storage key are preserved.

The cards link to Harmony, a chosen fretboard position, position navigation, an available named pentatonic/triad-pair source or gap-training controls. Links do not start playback; explicit position choices affect only the inspected chord. The time-budget/suggested-session interface and per-task minute estimates are removed. Fourteen browser workflows pass, including heading bounds at desktop/phone widths in all four themes, saved progress and source/position links, plus the existing CAGED regressions. Three curriculum checks and TypeScript/build pass.

## Automatic route region priority

The shared CAGED router now selects each chord's closest-fitting shapes to the requested region before minimising movement between tied candidates. The region applies throughout generated, template and edited charts in Fretboard and Exercises. Complete fingerings may extend beyond a region where no exact fit exists. Explicit manual choices and saved routes keep their existing behaviour.

The reported Amaj7–Dbmaj7–Fmaj7 Lydian cycle around frets 7–11 now repeats II/D (6–11), I/E (8–12), IV/A (7–11). Unit coverage checks region fit across all roots, nine modes and five regions, plus smooth tie-breaking. Twenty-three targeted route/timing/exercise checks, ten browser workflows and TypeScript/build pass.

## Generator automatic cycle length

With full root coverage off, automatic chord count now follows one complete interval cycle: major thirds produce three chords, minor thirds four, whole steps six and tritones two. Alternating intervals close when both pitch and pattern phase return. Random order uses one selected-root pass; full coverage still visits all selected roots, and explicit counts retain longer repeating drills. The automatic option now names its behaviour and is selected explicitly on initialisation.

Eight generator unit checks, six generator/region browser workflows and TypeScript/build pass, including preview/apply/undo, filtered roots and manual-position preservation.

## Chord outline playback highlight

Generator previews, fretboard/exercise route cards and harmony reference cards share a gold playing highlight and visible Playing marker. Exactly the sounding slot is marked in each outline, including repeated harmonies and loop/resolution returns. Inspection remains separate; indicators clear on stop and wait through count-in. Unapplied previews only follow playback if their harmony and durations match the working chart. Four playback workflows (desktop/mobile, backed/unbacked exercises, loop and count-in), five generator regressions and TypeScript/build pass.

## Per-string fretboard fingerings

A Fingering selector adds continuous diagonal scale patterns with exactly three consecutive tones on each string (including pentatonic, blues, symmetric and parent-scale modes), plus 1–2–1–2–1–2 and 2–1–2–1–2–1 arpeggios read from low E to high E. Arpeggios use the actual chord quality including extensions; degree labels refer to chord intervals. Starting degree, playable low-E register and note/degree labels are selectable. Invalid registers beyond frets 0–24 are omitted, unavailable starting notes are labelled, and boundary tones are never duplicated or skipped to force a fit.

This is an alternate Fretboard display. CAGED routes, manual positions and existing Exercises remain intact. Unrelated CAGED/overlay controls are hidden in the alternate view. Diagrams follow the inspected/playing harmony, retain scrolling between beats and scroll horizontally on phones. Exhaustive scale/chord/transposition unit checks and three browser workflows pass; four playback-highlight regression workflows and TypeScript/build also pass.

## Complete per-string shape galleries

The alternate fretboard now shows one separate diagram for every distinct starting degree of the mode and every arpeggio inversion. The single Starting note selector is removed. Each diagram labels its starting tone/degree and offers its own register choices where available. Changing one register leaves the other shapes unchanged; playback updates the whole gallery at chord boundaries without rebuilding it between beats.

Continuous patterns that cannot fit a 24-fret guitar remain visible as clearly labelled reference diagrams extending beyond fret 24, rather than silently omitting a degree. The default fingering API retains its 24-fret limit; the complete gallery prefers playable registers and uses extended diagrams only when required. Exhaustive coverage checks every starting tone across all scale families, chord qualities and twelve roots, including both arpeggio patterns and duplicate pitch-class removal.

Validation: four unit checks covering the full scale/chord catalogue, four browser workflows for degree/inversion completeness, independent registers, phone overflow, playback updates and CAGED restoration, plus TypeScript/build passed.

## Full-neck maps for per-string shapes

Scale and alternating-arpeggio galleries now include a full-neck map spanning open strings through fret 24. Scale maps show only mode tones; arpeggio maps show only chord tones with chord-interval labels. Highlight shape selects the exact notes of any starting-degree shape or inversion and follows that shape's register choice. Extended reference shapes expand the labelled map range beyond fret 24 as required.

The map supports persistent hide/show, fullscreen and horizontal phone scrolling. Its DOM stays mounted across chord changes so fullscreen is retained, and it does not redraw between playback beats. Three map browser workflows verify all scale/string/fret positions, exact shape highlighting, register/label changes, both arpeggio patterns, extended pentatonics, fullscreen, phone layout and playback updates. Four existing gallery regressions and TypeScript/build pass.
