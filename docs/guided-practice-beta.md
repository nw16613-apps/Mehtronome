# Guided practice beta — branch implementation

Branch: `feature/guided-practice-beta`. Main remains the deployed baseline. Do not merge/deploy this branch as part of implementation.

## Audit

Already present: synchronized notation/TAB, acoustic chord audition, passage drag selection, range playback, count-in, backing, bar-aligned loops, tempo trainer, named presets with import/export, guide-tone exercises, nearest-position paths, modal superimposition overlays, studio surfaces/icons. Reuse these.

Applicable gaps: progression tonic vs current chord/scale ambiguity; reference/setup blocks before practice material; generic exercise copy; no goal launcher or exact-grip exercise hand-off; no exercise fretboard; richer jazz preset presented as a generic foundation; algorithmic grips need explicit distinction from a CAGED framework; recall and review notes need modest support.

## Implementation increments and acceptance

1. Context and progression foundations: distinct tonic, active chord, scale guide and next chord; inactive pedal controls hidden/identified; four labelled major ii–V–I choices transpose correctly. Preserve the existing richer preset ID and saved pedal settings.
2. Guided entry: a small goal launcher configures existing controls and stable/sparse accompaniment without starting sound; learning-path link discoverable there. Sessions retain the selected tonic.
3. Grip → exercise: exact current grip notes can be practised in Exercises; selected chord/position retained, distinct from a full positional arpeggio; formulas, actual low-to-high pitches, omissions and bass/inversion identified. Do not display inferred finger numbers as verified instruction.
4. Teaching and connected material: family-specific pattern/listening/application guidance; short-cell/full-position stages; optional synchronized exercise fretboard with position changes and active/target markers. Setup/reference progressively disclosed, material readily accessible. Keep note audition and transport coordination.
5. Recall/review: hide/reveal exercise fretboard, explicit no-diagram challenge; self-assessed review state, comfortable tempo and notes stored separately without changing existing preset/progress schema. Export/import the new review data. Completion remains distinct from mastery.

For each increment: musical/persistence unit checks, focused browser workflows, desktop/mobile/zoom inspection. Existing transport, audio, preset and export tests remain regression gates. Do not claim device-level audio timing/fidelity testing.

## Deliberate later work

- Beat-level custom durations: engine currently advances progression changes on bar boundaries and v1 stored steps use whole `bars`. Requires a dedicated migration + scheduler/UI alignment project; no fractional-bar control will be exposed prematurely.
- Authored audio phrases with rests/ties/accents, call-and-response scheduling and automatic voice-leading/fingering curricula need richer event data than the current uniform subdivision model. This beta supplies explicit rhythmic application prompts and existing passage playback; no fake audio playback controls.
- Curated transformations, verified fingering/barre curriculum and advanced voicings: retain generated pitch-valid grips as suggestions, do not claim anatomical verification. Broader grip transformation lessons need separately reviewed content.
- Full enharmonic spelling preference, account sync, spaced repetition, recording, tunings and restricted-string fingering remain backlog. Explain affected scale/chord spelling and compound intervals in this beta.

## Checkpoint 2 — connected learning flow

Implemented: six goal setups using existing controls and the current tonic; session navigation and learning-path access; exact-grip hand-off, full positional arpeggio and enclosure stages; short-cell/full-position/application views; exercise-specific guidance and explicit rhythmic application prompts; linked exercise fretboard with selected/playing/target markers, position selection and hide/reveal recall; formula/voiced notes/omissions/bass clarification; compact references, collapsible setup, focused Guitar material before the full-neck map; tempo ceiling and persistent stop coordination. Existing presets and exercise favourites remain separate, compatible tools.

At checkpoint 2, guide-tone demonstrations played as melodic examples without accompaniment. Their uniform-subdivision playback must not be presented as bar-aligned progression targets. Chord-by-chord application is a player-performed task over the main backing. Authored example audio and chord-aligned exercise scheduling remain future work.

Validation: unit checks cover all 12 roots and five CAGED regions for exact-grip pitch/string/fret agreement, larger arpeggio contents, target retention in short cells, and transposed third/seventh examples. Browser checks cover goal setup, grip-to-notation coordinates, linked highlighting, recall, positions, disclosures, playback stop, presets, chord audition and all themes. Device-level latency, acoustic fidelity and anatomical comfort are not claimed.

Next: self-assessed review/notes and backup, full saved-session recall, then dedicated beat-level duration/scheduling and curated transformation content. The complete product brief is not yet finished.

## Checkpoint 3 — personal review and session recall

A separate browser-local journal records self-assessment, optional comfortable tempo and notes alongside a snapshot of existing preset controls/custom progression and exercise position, study, material, direction, rhythm, stage, display, recall, accompaniment, loop range and tempo-training setup. Resume reuses preset restoration, stops audio and opens Exercises without starting playback. Review-only edits retain the original snapshot. Completion remains separate from mastery. Journal export/import is versioned, validated, limited to 100 entries and merges without replacing existing records. Preset, favourite and learning-path formats are unchanged.

Validation: persistence/transfer unit checks, save/reload/resume and review-only browser workflows, malformed and duplicate import handling, mobile overflow, playback stopping and guided-flow/workspace regressions. Remaining work: chord-aligned guide playback, richer authored timing and curated content. Smaller shape/context corrections deferred as requested.

## Checkpoint 4 — chord-aligned progression studies

Guide-tone and voice-led connection studies now use a shared beat-based progression plan with the existing backing engine’s order, whole-bar durations and selected/wrapped loop range. Guide tones sustain through each chord; connected arpeggios use the selected subdivision inside their chord slot and then rest. Direction changes pitches, never backing order. Short-cell mode retains the complete chord cycle, with silent later slots; passage selections also keep their original slots. No saved progression/preset/journal format changes.

New notation/TAB displays the actual metre, note lengths, tied multi-bar holds and rests; chord/interval labels name each slot. Linked fretboard and notation highlighting follow the event timeline; its scale-degree map remains referenced to the starting guide. Jazz goal opens the full progression with accompaniment. Backing uses stable extensions, no gap/tempo trainer, and the existing mixer/ensemble. The exercise tempo trainer is disabled for these timed studies; ordinary position exercises retain it. Small chord slots explain when not every arpeggio note fits; unavailable paths retain a rest slot. Guitar synthesis is bounded to a natural 12-second decay per attack even for longer written holds.

One-shot accompaniment uses the engine’s existing session timer to end at the exact cycle boundary, without starting an extra chord/click. Repeated studies share the scheduled backing start and count-in, and notes repeat at the complete cycle duration. Mixer updates preserve the study tempo and completion timer.

Validation: all-root/all-region guide-tone checks, chord membership and string/fret agreement; multiple metres, wrapped loops and custom whole-bar durations; real-engine agreement and exact one-shot end; notation holds/ties/rests, triplet/sixteenth generation and short-slot warnings; browser AudioContext start-time offsets, count-in, loop boundary, one-shot stopping, mixer changes, mobile layout, guided flow and journal recall. Device-level audio latency/fidelity is not claimed.

Remaining work: fractional-bar custom-change migration, broader authored phrases/rests/accents and call/response, curated transformations and the deferred chord/scale shape review.

## Checkpoint 6 — beat-level custom progressions

Removed the checkpoint 5 chord movement lab following feedback. Custom steps can now keep legacy bar durations or specify 1–32 whole quarter-note beats. Nested format version 2 preserves old bar-based storage, presets and journals; durations remain in their chosen unit when metre changes. New beat-based exports require a compatible app build. The existing browser-local storage key is retained so old data is discovered.

The engine selects harmony on musical beats rather than only bar boundaries for custom changes. Count-in remains one complete bar, metronome/bar indicators continue uninterrupted, and selected/wrapped loops use exact beat durations. A bar/beat grid selects editor steps and follows real worklet beat messages. Chord references and the persistent transport show the new duration/current harmony. Existing built-in progression durations and next-bar anticipation are retained.

Guide-tone/connection plans accept short chord slots, notate multiple changes per bar, and expand odd-length cycles to a common bar boundary for complete-study repeats. The main progression itself repeats immediately at its stated beat length; the builder explains mid-bar cycle starts. No automatic padding silently lengthens chords.

Acceptance: two 2-beat chords occupy one 4/4 bar and change on beat 3; bar/beat editing survives reload and preset transfer; legacy bars follow metre while explicit beats remain fixed; root, scale, fretboard/reference and grid follow worklet changes; selected/wrapped loops, count-in, journal and original workspaces remain operational. Unit checks cover migration, export/import, real engine beat changes across several metres, duration-edit signatures, exercise/engine agreement and notation. Browser checks cover editing, playback, persistence, metre changes, narrow layout and the established study/journal/workspace flows. Device-level audio fidelity/latency is not claimed.

Remaining: sub-beat durations, progression undo/redo, authored phrase/application content, and the consolidated timing/shape/usability review requested for later.
