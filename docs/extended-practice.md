# Extended practice — selected development track

The user selected six directions: curated shell voicings/chord movement, more musical application phrases, repertoire-oriented practice, restricted-string exercises, interactive ear training, and recording/comparison. Alternative tunings and left-handed views are excluded. Spaced recall was not selected for this track.

## Increment 1 — shells, two written phrases and restricted string sets

Entry: Metronome & Mixer → **Connect shell voicings** → **Set up this session**. This opens an essential major ii–V–I at the selected tonic. Guitar → **Shell voicing workshop** opens the same study for the current harmony/progression without replacing it.

Explicit three-note templates use strings 6–4–3 or 5–4–3. Both keep the guide voices on D and G while changing the bass string. Notes retain root, third and seventh (or sixth when the chord has no seventh); omitted fifths/extensions are disclosed. Half-diminished shells can share a minor-seven grip when the flat fifth is omitted, which is explained. No inferred finger numbers or barre instructions are presented as verified fingering.

The route selects transpositions of these templates near the chosen register while reducing actual D/G voice movement. Each card shows its sounding pitches, intervals, muted strings and frets, with an acoustic strum of exactly those notes. The movement list identifies common tones, semitones and larger moves. C-major ii–V–I in the low register produces the familiar F–F–E and C–B–B upper lines.

**Shell grip notes** picks the exact three sounding strings and rests. **Shell guide-tone phrases** supplies two authored one-bar rhythmic forms: a guide-tone motif with a held note/rest/answer, and a chromatic approach resolving to the next chord’s string-4 guide. The final chord resolves to its own guide. Phrases use strings 4 and 3; their bass-string setting determines the source shell/register. Longer chord slots retain written space after the phrase. Shell phrases currently require 4/4 and at least four beats per chord. Unsupported chords or short slots remain explicit rests, never substituted harmonies.

These use the existing notation/TAB, note selection, linked fretboard/self-check, guitar synthesis, transport, accompaniment, count-in, loop and export systems. The score is a single-note exercise; card audition plays the simultaneous shell. Shell strings, register and phrase choice are retained in favourites and journal snapshots. CAGED navigation continues to describe actual CAGED positions, while this workshop has its own explicit shell register/string choices.

## Selected development scope

1. **Repertoire-oriented practice:** section-aware personal charts, rehearsal marks and reusable passage practice; preserve beat durations and loop/count-in alignment. Start with original practice studies rather than a preloaded copyrighted song catalogue.
2. **Broader phrases and restricted-string studies:** develop the shell material into reviewed comping/melodic examples, then offer single-string and selected-set drills only where the pitch-to-string paths are valid. Extend styles with deliberately authored material, not generic transposition alone.
3. **Interactive ear training:** begin with heard guide-tone movement and chord-quality identification using selectable answers and fretboard responses. Reuse audition and recall; do not imply microphone analysis.
4. **Recording and comparison:** user-initiated microphone capture, take playback and A/B comparison, local audio storage/export, visible input selection and latency calibration. No permission prompt on page load and no automatic accuracy grading. Timeline alignment and device/browser support need explicit validation.

The shell/drop workshops, repertoire, written/restricted phrases, ear training and recording now have first implementations. Recording alignment is manual; no automatic latency measurement or performance grading is claimed. Existing historical browser-test migration remains separate maintenance debt; this increment uses focused current-workflow regression checks.

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

## Remaining selected additions — first implementations

All six selected directions now have working implementations on this branch. Alternative tunings, left-handed layouts and spaced recall remain excluded as requested. Historical browser-test migration is separate maintenance work.

### Written drop phrases and restricted strings

In **Guitar → Drop voicing workshop** (or Exercises → Drop 2 / drop 3), choose **Exercise voices**: all four, upper two, inner two, or top voice on one string. Restricted parts select a fixed supported string set so their physical strings remain consistent across chords. **Grip notes** picks the selected voices low to high on eighths. **Held note and answer** holds the top selected voice for a dotted quarter, rests an eighth, answers from below, then holds the top again. **Late chromatic resolution** plays a short opening, leaves beat 3 silent, then approaches the next chord's lowest selected voice by semitone on that voice's string. The final chord ends on its own voice; no resolution is fabricated across an unsupported chord.

The two written phrases need 4/4 and at least four beats per chord, and use only the first bar of longer slots. Unsupported slots remain rests. Chord-card audition still strums all four source voices; the score and exercise audio play the selected part only. Approach notes can fall outside the current scale and are explicitly chromatic. Their fretboard extent includes the actual approach location. Phrase/part choices persist in favourites and journal entries.

### Interactive ear training

**Exercises → Ear training** (shortcut above the exercise heading): identify major/minor/dominant/half-diminished seventh qualities; distinguish a held pitch or a one/two-semitone movement; or match a heard pitch on your guitar and choose its location on strings 4/3, frets 5–9. The heard guitar samples match the answer's pitches. Answers enable after listening. Replay is allowed, only the first answer counts, Reveal does not add an attempt, and Next creates a new question. Scores are per session. This is answer-based ear practice, not microphone pitch recognition. Main transport, exercise and chord audition stop ear audio to avoid overlaps.

### Recording and comparison

**Progress → Record & compare**, with an Exercises shortcut. Press **Record microphone** to request permission. Input selection is available; Refresh inputs enumerates devices without asking for recording access. Capture uses MediaRecorder, disables browser voice processing where supported, and saves the original microphone/interface signal. App backing is not digitally mixed into the take. Mic tracks stop when capture ends, on input loss and on page exit. No microphone request occurs on page load. Permission errors leave the interface usable.

Up to ten takes are stored in IndexedDB, each capped at three minutes/25 MB, with a 100 MB library cap. Takes retain name, timestamp, input label, tempo/metre/chart/exercise context, review notes and trim. Local-storage failure retains nonempty audio for session-only export with an explicit status; empty captures are not saved. Export downloads the original audio in the browser's recording format (WebM/Opus, MP4 or Ogg). Browser storage is origin-specific and can be cleared; export backups before moving devices.

Choose two takes as A and B. Switching while playing keeps the elapsed comparison point after each take's trim. A shorter take reports when it ends before that point instead of jumping to an unrelated ending. Native audio controls also stop app transport before playback. **Lead-in / latency trim** is saved per take for manual alignment to a recorded count-in/first attack. This is not automated device-latency measurement or timing/pitch grading. Real interface/phone/Bluetooth round-trip behavior needs hands-on validation. The browser checks use a synthetic audio-input device and exercise the real permission/MediaRecorder/IndexedDB/playback APIs.

Validation: all 49 unit-test files passed, including all-key/type/part phrase timing, physical strings/pitches, semitone resolutions, ear answer/audio consistency and take alignment/limits. Focused browser checks cover new controls, persistence, ear scoring, recording consent/denial/release, two distinct takes, reload/export/deletion, playback, mobile width and existing shell/drop/repertoire regressions. Synthetic-device success is not a claim of testing the user's physical audio hardware.

## Polish pass — harmony context and audio review

Custom chord/scale pairs now explain which actual chord pitches the selected guide omits. The note appears in the chord editor, Guitar and the Exercises harmony reference; deliberate outside guides remain selectable. **Use compatible scale guide** applies the existing chord-specific recommendation and supports Undo. Compatibility is checked by pitch class so enharmonic spellings do not produce false differences. Shared modal-vamp guides remain intentional; the automatic/manual CAGED route behavior is preserved.

Ear answers now unlock only when the scheduled audio sources finish, rather than when playback is requested. Cancelling an initial listening during preparation or playback leaves answers unscored and requests another listening. Cancelling a replay retains a previously completed listening. Audio completion follows the audio context, not a fixed browser timer. Hear question also stays disabled while the main/exercise transport prepares, plays or completes its stop fade, then re-enables once audio is available.

Changing recording A/B selections no longer clears unsaved review text or trim edits. Deleting the take loaded in the audio player removes its source and revokes its object URL, so native controls cannot replay a deleted take. Cancelled comparison loads do not overwrite the newer status with stale errors.

Validation: all 49 unit-test files passed, including all chord recommendations in every key and deliberate outside-guide cases. Focused browser checks cover compatibility explanations across workspaces, correction/Undo, off-scale chord dots, CAGED manual-route sharing/persistence/playback locks, ear completion/interruption, restricted parts, recording draft retention and active-take deletion. Physical audio hardware remains outside the synthetic-device browser checks.

## Polish pass — exercise inspection and selected passages

A note clicked in a later chord now updates the same musical context as a chord card: current/next harmony references, main chord display, Guitar context/route and the linked exercise diagram. Keyboard note inspection follows the same path and retains score focus; the notation is not rebuilt. The group slot is mapped back to its original progression index, including selected beat loops that omit earlier chords.

Starting progression exercise playback restores the first selected loop chord during count-in, rather than leaving a previously inspected later chord on screen. Note inspection is ignored while exercise audio is preparing. Normal playback, card inspection and shell/drop strum inspection share the same context update helper.

Changing shell/drop strings, part, phrase or register clears an existing passage selection so old note indices cannot leave an empty active range. Rhythm/application changes and favourite restoration also clear outdated passage selections. Context refresh does not replace the notation.

Validation: four new browser cases cover mouse/keyboard note inspection, preserved score DOM/focus, original chord indices in a clipped loop, count-in context, restricted workshop settings and stale selection clearing. Existing adaptive-study, beat-loop and progression timing/count-in/engine-completion checks passed. Progression exercise/timing and extended-tool unit files also passed; production builds include TypeScript validation.
