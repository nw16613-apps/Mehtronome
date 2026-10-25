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
