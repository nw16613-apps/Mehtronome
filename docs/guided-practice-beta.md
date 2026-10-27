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

## Chord-sheet presentation update

Replaced the custom beat tiles with a responsive lead sheet using serif chord symbols, bar lines, beat slashes and repeat signs. Beat/chord editing and the underlying durations/storage are unchanged; live markers use the same worklet beat events and clear on stop. Partial bars remain partial. The first 128 beats of very long charts are displayed with an explicit limit label.

Added chord symbols to standard exercise notation and restyled timed-progression symbols consistently. Material chords are distinct from the held reference/backing label; chromatic target/sequence names are not passed off as chord symbols. Print/SVG output retains symbol typography. Existing note selection, audition, linked diagrams and timed playback remain intact.

Validation: bar/beat placement and partial-bar markup, safe accidental/quality/slash-bass formatting, material/reference labeling; browser chart editing/live marker, narrow layout, notation labels and SVG export, plus beat-editing, guided-flow and timed-playback regressions. All unit test files pass. Rendered chart and notation inspected.

## Exercise backing-symbol correction

Removed arpeggio/cell chord names above the staff. All exercise symbols now describe the backing: selected progression changes or the held pedal chord. Ordinary exercise accompaniment follows a selected progression too; the exercise pitches remain the selected study. On repeated/selected passages the symbols are recalculated against the continuing backing clock while notes and selection DOM are retained. Fixed tempo is used with progression accompaniment; automatic exercise tempo increases remain available without that accompaniment.

Chord symbols have a separate untransformed SVG band; staff/notes are shifted according to measured and numeric note/stem/beam extents. This handles high-register notes and font readiness, preserves TAB alignment and exports the actual layout. Standard notation now uses the selected metre for its bar lines.

Validation: all unit files pass; browser checks cover backing sequence versus cell names, ordinary progression audio settings, loop-cycle symbol changes matching the current chord, high-register separation in both ordinary/timed notation, narrow widths, SVG export and prior guided workflows. No device audio-fidelity claim.

## Exercises adapt to the progression; stacked fretboard layout

Supersedes the starting-material limitation from the preceding symbol correction. Every ordinary selected study now rebuilds from each chord’s actual harmony/scale guide. Existing pattern generators are reused on a nearby CAGED route anchored by the selected starting region. Root-first cells are preferred where available. Complete cells fit the chord duration and subdivision; positional arpeggios use a bounded excerpt. Rests preserve unused time and unavailable/oversized cells produce explicit warnings, not silently truncated enclosure targets. Pentatonic/triad-pair IDs are resolved per harmony and unavailable choices fall back explicitly with source labels.

The existing beat plan drives notation, playback and multiple target markers for all progression exercises. Current/next harmony stays aligned with the backing, including custom beat durations and wrapped loops. The linked map updates its chord/scale labels, notes, grip facts and active pitch at chord boundaries. A stopped Inspect chord control exposes each context. Short-cell mode applies one cell to each chord; dedicated guide-tone/connection handling is retained. Pedal material, preset and journal schemas are unchanged.

Moved the compact fretboard above the full-width score at all viewport sizes, retaining hide/show and recall. Validation: all unit files pass, with new chord-membership, mode/interval, physical-coordinate, target/cell-boundary, source-adaptation and region checks across keys, five frameworks and altered harmony. Browser workflows verify different notes for Bm7/E7/Amaj7, live diagram/harmony changes, manual inspection, desktop/mobile stacking, exports, beat editing, guide playback, pedal fallback and journal recall. These checks do not verify anatomical fingering or device audio fidelity.


## Checkpoint 7 — written application and response

The existing Apply stage now offers three authored rhythmic forms using the selected study’s pitches: cell/hold/space, delayed resolution, and cell/answer. Complete source cells and enclosure targets are preserved; rests, held durations and accents are written and played. Progression phrases retain their chord slots and nearby CAGED context. Cells that cannot fit receive explicit warnings and silence rather than truncation.

Demonstrate/your-turn flow appends a matching response section without lead notes, while enabled backing continues. The transport and score identify the response; looping repeats both parts, and one-shot playback stops after the response. No microphone assessment or timing score is implied. Journal entries and favourites retain phrase/flow choices; older entries use compatible defaults without schema migration.

These forms currently support 4/4 only. Other metres retain the ordinary study and manual prompt. Written forms use fixed tempo and their own rhythm, with no extra playback engine.

Validation: 38 unit-test files passed. Focused browser suites cover written rests/accents, response AudioContext scheduling and exact completion, backing changes, journal recall, mobile layout, adaptive exercises and chord-sheet regressions. Device audio fidelity and anatomical fingering remain outside these checks. Deferred musical-content/shape bugs remain for the later review.


## Checkpoint 8 — reversible progression editing

My progression now has labelled native Undo/Redo buttons beside Add chord. History covers chord root, quality, mode, bass, bar/beat durations, add, duplicate, delete, reorder and copying a template. Restoring history also restores the editor selection, rebuilds chart/loop options and saves the resulting arrangement. Playback stops first. A new edit clears redo; up to 50 edits are retained per page session. Reload or loading a saved custom progression resets history; saved-data formats are unchanged. Tonic, mixer and loop-selection controls are outside progression history.

Validation: production build and focused browser workflows cover duration round trips, multiple structural edits, redo invalidation, automatic persistence/reload, playback stopping and mobile overflow, alongside existing chart/editing/export regressions. The deferred musical-content and shape review remains deferred.


## Unified progression chart presentation

All Harmony templates now render through the same chord-sheet renderer and container as My progression. Clicking a template beat opens a personal copy at that chord; Enter edits and Space retains hold-to-hear audition. The explicit create action uses the same editor. Original templates remain available. Custom editor controls appear after copying, redundant chord tiles are hidden, and beat highlights now work for built-in templates too. Existing duration, loop, preset, history and storage models are reused. Selecting a chart chord to edit stops playback first.

Validation includes template-to-copy selection, template immutability, beat-duration editing/undo, playback highlights, hold/release audition, preset restoration, chord-sheet/export regressions and narrow-screen layout. The separate musical-content review remains deferred.

The current chord hero and complete chord-note list are now combined with the scale/seventh-chord map inside one Harmony panel. The selected chord retains extensions (for example Bm9) while the diatonic cards continue to show seventh chords (Bm7), avoiding loss or conflation of either reference. Both update from the same active harmony.


## Chart loop selection

Integrated the existing loop controls into the chord chart. Mouse/pen drag selects a contiguous range of complete chords without cloning templates or opening editors, with a persistent underline/highlight. Reverse drags normalize to the same range; existing keyboard controls retain wrapped-loop support. Escape, pointer cancellation and window blur cancel an unfinished gesture. Single clicks and held audition retain their distinct behaviors. A committed selection leaves stopped audio stopped or restarts active playback at the selected range, retaining count-in. Clear loop restores the full progression. Existing preset/journal loop fields and scheduler are reused. Removed Compare two chords, its handlers, state and styles per request.

Validation covers forward/reverse drag, cancellation, audition/edit separation, loop order at playback start, active-playback reselection, clearing and wrapped manual controls.


## Checkpoint 9 — explicit targets on the written voice-leading path

Added a compact transition reference to the existing guide-tone and voice-led connection studies. It derives each source from the previous group’s final written note and the target from the next group’s first note, with chord intervals, exact signed pitch movement and target string/fret. Common tones, semitone/whole-tone movement, octave displacement and larger jumps are distinguished without promising that every transition is a small resolution. It does not generate another path or a chord grip. Silent slots have no inferred connection.

Target buttons reuse existing note audition. Selecting one updates the correct chord’s diagram and highlights its actual note in the score; native buttons support keyboard activation. Existing playback and musical generators remain unchanged.

Validation: all-key/five-framework unit checks for actual pitches, indices, intervals and string/fret agreement; explicit common-tone, semitone, octave and silent-slot cases. Browser checks cover linked target audition, keyboard use, source families, short-cell silence, narrow layout and existing timed audio/loop stopping. The broader musical-content/shape review remains deferred.


## Chord-chart highlight correction

The base chart button rule had higher specificity than the loop highlight, hiding its fill and underline. Scoped the loop styling to the chart and made the selection pale blue with a dark-blue underline. The moving beat now uses amber and a brown marker, with a visible key; these colours target the chart’s existing paper surface consistently across all four themes. Playback stopping restores the loop fill. Browser checks verify the computed fill/marker colours across themes, distinct live-beat colouring, clearing and drag selection.


## Exact beat loops and progression beaming

Drag selection now stores inclusive beat endpoints and clips the edge chords. The shared progression timeline drives engine chord changes, chart beat highlights, references and exercise durations. Single-beat loops are valid; reverse drags normalize their endpoints. Numeric beat controls and the original wrapped whole-chord mode coexist. Count-in remains one full bar and the metronome retains its metre; loops repeat without silent padding. Optional preset controls store the new unit/endpoints, with whole-chord defaults for older setups; existing preset and journal envelopes are retained.

Progression notation now joins contiguous short notes within each quarter-note beat. Rests, chord changes and bar lines break groups. Semiquavers have secondary beams, isolated notes retain flags, and accents sit above their beam group. Chord bands measure beams/stems to retain clearance; SVG output keeps the notation. Musical pitches and event times are unchanged by beaming.

Validation includes real-engine beat/count-in agreement in several metres and built-in/custom progressions; timeline clipping, one-beat and reverse bounds, legacy wrapped loops, timed-exercise alignment and preset transfer; browser drag/playback/highlights, saved setup recall, single-beat controls, beam rendering, chord-symbol clearance, mobile layout and SVG export. Device audio fidelity is not claimed.


## Connected chord inspection and position routes

Follow nearest positions now supplies the same full-progression route to Guitar and Exercises, filtered to the playback loop. Adaptive exercises and guide-tone/connection studies use the corresponding per-chord fretboards. Exercises exposes the shared navigation and region controls; Inspect chord labels each chord with its position and frets and updates Guitar’s current context. Inspection changes the displayed context without rebuilding the written exercise. Guitar route-card changes select the matching inspection slot. Route cards outside the active loop are unavailable.

Exercise playback updates the connected Guitar context at chord boundaries without rebuilding/stopping the score. Stopping retains the current chord rather than resetting only the diagram to chord one. Inspection controls are locked during playback; the existing shared manual-position workflow remains available. Validation includes route coordinate/chord membership across keys and regions, bidirectional selection, unchanged notation on inspection, shared region controls, narrow layout and uninterrupted timed playback. Anatomical fingering and the deferred content review are not claimed resolved.


## Checkpoint 10 — targeted chord-tone recall

Added a small self-check within the existing exercise fretboard, alongside hide/reveal recall. Questions use actual chord intervals and available note coordinates for thirds, sevenths, roots and fifths, accepting every visible octave of the target pitch class. Labels, root/chord colours, grip/target rings and answer-bearing tooltip/accessible names are masked while asking. Mouse or keyboard choices receive direct feedback; reveal/next/end actions restore labels and identify available answers. Suspended or missing tones are explained without fabricated answers.

The controller reuses the linked diagram and current harmony. Inspection/position changes clear stale questions. Playback cancels the question and restores normal interaction; quiz controls are unavailable during playback. No microphone grading, mastery inference, new saved-data format or automatic learning-path completion is introduced.

Validation: all-key/five-region checks for chord pitch/interval/name agreement, octave locations, altered/diminished/suspended formulas and missing positions. Browser tests cover neutral masking and accessible names, wrong/right answers, keyboard use, reveal, context changes, playback, responsive layout, shared routes and existing guided practice. Anatomical fingering and the previously deferred content audit remain outstanding.


## Visible progression cards in both practice workspaces

Reused one card renderer for Guitar and Exercises, showing the actual progression study’s chords, CAGED positions/shapes and fret ranges in both manual and nearest-position modes. The exercise cards sit above the linked diagram, outside its hide/show body, near self-check controls. Selection reuses Inspect chord and does not rebuild the written score. Guitar and exercise highlights stay synchronized. Cards are disabled during playback.

When a self-check is active, choosing a progression card starts the same requested tone on the new chord, using its new diagram and answer set. The self-check stays open and the selected tone type is retained; no answer from the previous chord survives. Keyboard selection in Guitar retains focus after its cards update. Validation covers both modes, cross-workspace selections, unchanged notes, self-check context, keyboard selection, narrow layout and existing shared-route/recall workflows.


## Progression control layout consolidation

Moved Position navigation out of Guitar’s diagram-settings disclosure and out of the Exercises toolbar into the visible progression header, alongside Fretboard region. The manual exercise Starting position control sits in the same header; its redundant disabled display is hidden in automatic mode, where the active card identifies the position. Guitar’s remaining diagram settings contain Diagram and Labels.

Removed Inspect chord and its input handler. Native progression-card buttons now use a shared inspection event and retain keyboard access, current-chord highlighting, self-check continuity and playback locks. No hidden duplicate selector is retained. Browser validation covers control placement in both modes, absence of Inspect chord, keyboard selection, mobile layout and existing shared-route/self-check behavior.

## Checkpoint 11 — musical correctness review

Reviewed pitch/spelling agreement in all 12 roots, all 21 modes and five frameworks, and compact grips for every chord type. Position identities now follow one complete CAGED cycle instead of independent root-mask guesses that duplicated two positions in Ionian ♯5 and Lydian ♯2. Parent geometry and current-root identities remain distinct; no scale pitches were changed. Guide-tone studies now choose actual thirds/sevenths, use functional chord spelling, and use real nearby per-chord CAGED boards in manual mode too.

Diatonic progression Roman numerals, mode-aware template captions and descriptions now agree with seventh-chord qualities and altered degrees (including ♭VI in natural minor). Custom half-diminished/diminished qualities retain lowercase numerals. Ninth-arpeggio cell labels retain their seventh quality and altered ninth instead of defaulting to dominant 9.

Both notation renderers share written-spelling octave placement and bar-scoped accidental state: B♯/C♭ cross-octave spellings stay on the correct staff step, and a natural explicitly cancels a preceding accidental. TAB and sounding MIDI remain unchanged. Suggested compact grips retain defining thirds, sevenths/sixths and altered fifths, and honour a requested slash bass or report no suggestion. Spans/muted strings/omissions remain disclosed; these are pitch-validated suggestions, not anatomically verified fingerings.

Focused new checks cover unique positions, spelled pitch/physical coordinate agreement, quality-defining grip contents and slash bass, Roman labels, ninth qualities, both notation renderers and suspended/altered guide-tone cases. Curated fingering/barre/transformations remain the agreed later project.

## Checkpoint 12 — teaching and usability refinement

Exercise explanations now define the actual study cell, show the first available cells and their note names, and identify the first written note/string/fret. Chord-tone-rooted stacks explicitly differ from inversions of the current chord. The guide no longer tells players to look for removed cell-chord symbols: staff symbols name the accompaniment; examples in the explanation describe study material. Progression guidance describes rebuilding the same idea at each change rather than implying a static backing throughout. The footer reports the actual starting note rather than assuming every family starts at the lowest/highest pitch.

Pentatonic/triad-pair descriptions retain source notes, included/omitted colours and resolutions, and now calculate spelled degrees relative to the current chord root even when a modal vamp retains a different scale tonic. Existing short-cell/full-position, direction, material and source options remain progressively disclosed; no unsupported string/fingering controls were added. Corrected the guide-tone help to reflect the map's current scale guide.

Validation adds actual-cell teaching and adaptive-cell extraction checks, chord-relative overlay examples and browser workflows for Bm7/Dorian cell explanations, minor-key Roman labels, every position in the previously ambiguous modes, all six workspaces at desktop/phone and a 200%-desktop-zoom-equivalent viewport. No mastery or automatic accuracy claim is introduced.

## Checkpoint 13 — acceptance review and final regression fixes

Completed the agreed product-scope review; [beta-acceptance.md](beta-acceptance.md) maps every original request to delivered behaviour or its agreed deferral. The final pass also found and repaired editable-template copying: diatonic copies no longer repeat a fallback chord, and modal copies retain the same pitch collection using each chord's relative scale guide. Root/degree spelling is preserved, and automatic mode suggestions now contain every note of each supported chord type. Older saved custom structures remain accepted without changing pitches or durations.

Fixed initial mixer meter time deltas so a first animation frame cannot create an idle level. Timed one-shot accompaniment now stops from the engine's sample-counted session-complete event; a wall timer could otherwise stop a study early under CPU load. Unbacked one-shots recheck the audio clock before stopping. Added a deliberately accelerated wall-clock browser regression for this race.

Validation includes the full unit suite and focused current browser workflows for musical state, guided learning, actual notation/maps, playback/count-in/loop completion, save/import/resume, editable progressions, keyboard recall, desktop/mobile/zoom-equivalent layouts and all four themes. The acceptance report distinguishes those results from the out-of-date historical full-browser suite; no repository-wide green browser CI claim is made. Curated anatomical fingering and device audio measurements remain outside this review.

## Independent chord-position routes

Replaced the previous manual starting-anchor behaviour with true per-chord choices. Automatic route is now the fresh-session and unspecified-preset default. Manual mode seeds a route once, then changes only the selected chord's numeral/geometry. Both workspaces, all adaptive study families and guide-tone/connection studies consume the same complete route, filtered to the current loop. Inspection updates the manual selector to that chord without rebuilding the score; changing its position rebuilds the exercise with other chord positions retained.

Added an optional compact versioned preset control for route choices, reused by journal snapshots and preset import/export. Its harmonic-context fingerprint avoids stale assignments after changing/reordering the progression. Switching modes/automatic regions retains the manual route. Corrected exercise position event ordering so stop/inspection cleanup cannot overwrite a new selection before it is committed. Position edits are locked during playback. Pedal position browsing remains independent of progression navigation.

Validation for independent routes: production build and all 45 unit-test files passed. Targeted browser runs cover independent edits in each workspace, switching modes/regions without losing choices, preset reload, older unspecified/explicit manual presets, playback locks, self-checks and the existing guided/journal/adaptive flows. Self-check tests now explicitly enter manual mode before changing a progression chord's position, matching the new automatic default.
