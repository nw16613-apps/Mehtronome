# Extended practice — selected development track

The user selected six directions: curated shell voicings/chord movement, more musical application phrases, repertoire-oriented practice, restricted-string exercises, interactive ear training, and recording/comparison. Alternative tunings and left-handed views are excluded. Spaced recall was not selected for this track.

## Increment 1 — shells, two written phrases and restricted string sets

Entry: Metronome & Mixer → **Connect shell voicings** → **Set up this session**. This opens an essential major ii–V–I at the selected tonic. Guitar → **Shell voicing workshop** opens the same study for the current harmony/progression without replacing it.

Explicit three-note templates use strings 6–4–3 or 5–4–3. Both keep the guide voices on D and G while changing the bass string. Notes retain root, third and seventh (or sixth when the chord has no seventh); omitted fifths/extensions are disclosed. Half-diminished shells can share a minor-seven grip when the flat fifth is omitted, which is explained. No inferred finger numbers or barre instructions are presented as verified fingering.

The route selects transpositions of these templates near the chosen register while reducing actual D/G voice movement. Each card shows its sounding pitches, intervals, muted strings and frets, with an acoustic strum of exactly those notes. The movement list identifies common tones, semitones and larger moves. C-major ii–V–I in the low register produces the familiar F–F–E and C–B–B upper lines.

**Shell grip notes** picks the exact three sounding strings and rests. **Shell guide-tone phrases** supplies two authored one-bar rhythmic forms: a guide-tone motif with a held note/rest/answer, and a chromatic approach resolving to the next chord’s string-4 guide. The final chord resolves to its own guide. Phrases use strings 4 and 3; their bass-string setting determines the source shell/register. Longer chord slots retain written space after the phrase. Shell phrases currently require 4/4 and at least four beats per chord. Unsupported chords or short slots remain explicit rests, never substituted harmonies.

These use the existing notation/TAB, note selection, linked fretboard/self-check, guitar synthesis, transport, accompaniment, count-in, loop and export systems. The score is a single-note exercise; card audition plays the simultaneous shell. Shell strings, register and phrase choice are retained in favourites and journal snapshots. CAGED navigation continues to describe actual CAGED positions, while this workshop has its own explicit shell register/string choices.

## Next increments

1. **Repertoire-oriented practice:** section-aware personal charts, rehearsal marks and reusable passage practice; preserve beat durations and loop/count-in alignment. Start with original practice studies rather than a preloaded copyrighted song catalogue.
2. **Broader phrases and restricted-string studies:** develop the shell material into reviewed comping/melodic examples, then offer single-string and selected-set drills only where the pitch-to-string paths are valid. Extend styles with deliberately authored material, not generic transposition alone.
3. **Interactive ear training:** begin with heard guide-tone movement and chord-quality identification using selectable answers and fretboard responses. Reuse audition and recall; do not imply microphone analysis.
4. **Recording and comparison:** user-initiated microphone capture, take playback and A/B comparison, local audio storage/export, visible input selection and latency calibration. No permission prompt on page load and no automatic accuracy grading. Timeline alignment and device/browser support need explicit validation.

The shell/drop workshops and first repertoire increment are implemented here. Broader authored phrases, ear training and recording remain authorised directions, not completed features or placeholder controls. Existing historical browser-test migration remains separate maintenance debt; this increment uses focused current-workflow regression checks.

Validation for increment 1: all 46 unit-test files passed, including all-key/chord shell contents, exact string/fret pitches, omitted-tone facts, the C-major guide paths, phrase timing/approach resolutions and unsupported/short-slot behaviour. Focused browser checks cover exact acoustic-note messages, restricted strings, notation/targets/rests, shared backing and completion, journal/favourite recall, mobile overflow and existing guided/manual-route/workspace flows. Rendered workshop and notation inspected. Device audio fidelity and anatomical fingering are not claimed tested.

For a minor ii–V–i, choose the existing Jazz minor progression in Harmony and open the workshop from Guitar. Its half-diminished and minor-sixth shell omissions are shown explicitly. Card audition and shell route controls are unavailable while the main transport or exercise playback is running; opening the workshop does not stop the main transport.

## Drop-voicing workshop

Guitar → **Drop voicing workshop**, or Exercises → Exercise → **Drop 2 / drop 3 voicing arpeggios**. Uses the current pedal chord or progression; no template is replaced. Choose drop 2 or drop 3, an automatic/fixed supported string set, and register. The route selects nearby inversions while minimising movement of the four voices in pitch order, with a small cost for changing string sets. It optimises the open route, not the final return to chord one.

Cards show exact sounding pitches, intervals, bass, muted strings and omitted tones. Strum auditions those exact four notes; the linked score picks them low to high on four eighth notes then rests. The linked fretboard follows the inspected/playing chord. Four distinct tones are required: doubled triads and power chords are excluded. Extensions use the existing four-voice reduction and disclose omissions. Candidates are restricted to frets 1–17 and a maximum four-fret span, without claiming anatomical fingering validation. Unsupported shapes and slots shorter than two beats leave explicit rests; their chord slots remain intact. Drop type, strings and register survive journal and favourite recall. Existing CAGED routes and the legacy drop-voicing browser retain their behavior.

Validation: all-key/chord/string-set physical pitches, octave-drop reconstruction, four-tone uniqueness, spans, known Cmaj7 grip, register choice, timing/gaps and four-voice movement. Browser checks cover exact four-note audition messages, drop/string changes, playback locks/chord-following map, journal/favourites, unsupported material and mobile width. Existing shell browser checks passed alongside these. Device audio fidelity and finger comfort remain for hands-on review.

## Repertoire increment — personal charts and rehearsal sections

Harmony → **Repertoire · personal charts & original studies**. Two original studies provide a 12-bar dominant blues and a 16-bar A/B turnaround form, loaded in the current tonic with four beats per bar. These are practice forms, not transcriptions of named songs. Loading stops playback without starting audio; the resulting custom chart remains fully editable.

Save up to 50 named charts, load/update/delete them, or export/import a JSON backup. Saved charts retain their tonic, metre, exact chord durations, scale guides, slash basses and rehearsal marks. Imports add new copies and validate before storing. They do not replace existing saved charts. A chart is a harmonic form; use the existing journal to retain the accompanying exercise and wider session setup.

In the chord editor, **Chart title** renames the active form and **Start a section at this chord** marks a passage. A mark lasts until the next marked chord. The first unmarked passage is called Opening. Marks travel with chords when reordered; adding/duplicating a chord leaves its new mark blank. Deleting a marked chord deletes that boundary. These edits support existing undo/redo. Durations are derived from beat/bar values and current metre, with no extra beats added by marks.

**Loop section** buttons appear below the Harmony chart and in both Guitar/Exercises harmony references. They select the existing exact beat range; **Full chart** clears the range. Controls lock during playback/preparation. Shared count-in, backing and exercise-following behavior remain in use. Rehearsal labels appear on the chord sheet; sections also survive preset/journal snapshots and repertoire backups. Existing chart limit: first 128 beats rendered, although saved forms and section ranges retain all chords (up to 32).

Validation: all 48 unit-test files passed before the final focused checks; repertoire/custom-chart/chord-sheet tests passed again after final rendering changes. Tests cover all-key starter harmony, section boundaries under mixed beat/bar durations, transfer validation, preservation through presets, shared workspace loops, saved-chart import/export and reload, mobile overflow, undo/redo and playback locking. Drop-workshop regression checks also passed. Device-specific audio remains for hands-on review.
