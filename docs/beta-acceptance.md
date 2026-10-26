# Guided-practice beta acceptance review

Scope: the original implementation brief, narrowed by the agreed deferral of curated chord-transformation/fingering curricula. Feature branch only; no main merge or GitHub Pages publication. The private preview remains owner-only.

## Delivery against the brief

| Request | Delivered beta behaviour |
| --- | --- |
| 1. Active context | Shared tonic/current chord/scale guide/next chord; inactive pedal controls distinguished. |
| 2. Material-first layout | Compact references; selected Guitar diagram and stacked Exercises diagram/score; disclosed setup; persistent transport and mixer. |
| 3. Goal-based entry | Six goals configure existing controls and accompaniment without autoplay; discoverable learning path. |
| 4. Jazz defaults | Essential, extended diatonic, altered dominant and Lydian-tonic variants; transposition and contextual scale explanations. |
| 5. Theory clarity | Notes, intervals, compound degrees, omissions/bass facts and enharmonic explanations; repaired modal Roman numerals, ninth-cell names and written accidental/octave handling. |
| 6. Exercise teaching | Family-specific pattern/listening/application guidance; actual first-cell examples and starting notes, targets distinct from approaches. |
| 7. Idea/exploration/application | Short cell/full position plus three written rhythmic forms and an optional silent response section. Written forms are currently 4/4. |
| 8. Connected fretboard | Shared chord/position navigation; linked notes/targets/grip markers; position selection directly in Exercises; notation, TAB and map coordinate checks. Unsupported restricted-string controls were not added. |
| 9. Passage practice | Existing selection/loop/count-in/slow-speed controls, tempo ceiling and coordinated stop; demonstrate/response on written forms. No accuracy scoring. |
| 10. Chord-shape learning | Compact grip, full positional arpeggio and scale distinguished; formula/voiced notes/omissions/mutes/bass. No unverified finger numbers or barre instructions. |
| 11. Grip-to-exercise flow | Practise this shape → exact grip → full positional arpeggio → enclosure → Apply stage, retaining context. |
| 12. Chord transformations | Deferred by agreement after the earlier movement lesson was removed. Not claimed complete. |
| 13. Voice-leading targets | Actual written source/target notes, intervals, common/semitone movements and linked audition; melodic path, not a chord grip. |
| 14. Pentatonics/triad pairs | Source notes, current-chord-relative degrees, included/omitted colours and resolution suggestions. |
| 15. Accompaniment | Stable study, trio, modal/exploratory and sparse time-practice configurations use existing mixer/settings. |
| 16. Progression editing | Beat durations, editable chord charts, exact beat loops, undo/redo and old bar-duration compatibility. Template copies preserve actual chords, duration, spelling and scale pitch collection. |
| 17. Recall/progress | Hide/reveal, chord-tone self-checks, comfortable tempo, self-review notes, exact session recall and versioned journal backup. Completion is not mastery. |

## Final review fixes

- Removed duplicate position identities in two harmonic-minor modes while preserving parent-scale pitch geometry.
- Kept defining thirds, sevenths/sixths and altered fifths in suggested compact grips; honour slash bass or offer no grip.
- Used actual thirds/sevenths and chord spellings for guide-tone paths, including suspended/altered/diminished cases.
- Corrected seventh/ninth arpeggio naming, Roman-degree quality and written octave/accidental state.
- Made editable copies of diatonic/modal templates preserve their sounding pitches and scale guides. Automatic custom mode suggestions now contain every chord tone for every supported chord type.
- Corrected the mixer’s first-frame time delta, which could briefly produce a meter level before audio.
- Ended backed one-shot studies on sample-counted engine completion, with a regression that advances the wall clock ahead of audio time.

## Validation and limits

Final results:

- Production TypeScript/Vite build passed.
- Full unit suite: 44 test files passed; final theory/custom-progression/persistence follow-up: 6 files passed.
- Broad current-workflow browser run: 86 passed, with one one-shot completion failure that exposed the wall-clock race above. After fixing it, all 25 affected acceptance/regression checks passed, including the original failure and a new accelerated-clock case. This covers 88 distinct passing current browser checks across the runs, not a single all-tests-green invocation.
- `git diff --check` passed. Rendered Exercises layout inspected.

Reproduce the final affected-workflow checks from `web/`:

```sh
npm test
npm run build
npx playwright test browser-tests/beta-acceptance.spec.ts browser-tests/progression-study.spec.ts browser-tests/applications.spec.ts browser-tests/learning-flow.spec.ts browser-tests/progression-history.spec.ts browser-tests/unified-progression.spec.ts browser-tests/journal.spec.ts --workers=2
```


Unit coverage includes all 12 roots, all 21 modes and five CAGED frameworks, every supported chord type, template-copy equivalence, spelling/MIDI/string-fret agreement, defining grip tones, Roman labels, note accidentals, scheduling, loop clipping, persistence and import compatibility.

The focused browser acceptance run covers guided learning, adaptive and guide-tone playback, written applications/response, exact beat loops and chart gestures, undo/redo, journal/preset restore, keyboard recall/chord selection, notation beams/chord clearance/export, shared positions, floating mixer and real meters, all themes and all six workspaces. Layout checks include 1440, 900, 640 and 390 CSS-pixel widths across the suites; the 640px check represents a 1280px desktop at 200% zoom, not a native-browser zoom-control test. Rendered Exercises material was inspected.

The entire historical browser suite is not claimed green. An exploratory run exposed older tests that still assume the pre-tab layout, removed controls, five simultaneous detailed diagrams, or the old triad-only diatonic progression. That run was stopped; the original tests remain intact for migration. The production beta is assessed through the focused current workflows above, not by hiding those failures. Updating the remaining historical browser cases is test-maintenance debt before expecting the repository-wide browser CI job to pass.

Pitch-valid compact spans do not establish anatomical comfort for every player. No device-level audio latency/fidelity measurement, microphone assessment or automatic mastery claim was made. Hosted publication is verified through the hosting service; browser QA uses the built app locally.

## Deliberately retained limits and next discussion

Curated transformations and verified fingering/barres remain deferred. Written application forms remain 4/4. Beat durations are whole quarter-note beats; exceptionally long chord charts show an explicit display limit. Existing tuning and handedness are retained. These limits are stated rather than exposed through nonfunctional controls.

Longer-term candidates from the brief: curated shell-voicing movement, richer authored repertoire/phrases, spaced recall/ear training, recording/comparison, and supported restricted-string/alternative-tuning work. No new long-term feature was started during this pass.
