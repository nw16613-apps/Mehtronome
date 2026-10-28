# Interactive branch preview

## Current simplification

The other five workspaces now follow purpose-based control groups. See [workspace-layout-review.md](workspace-layout-review.md) for the audit, final structure and validation scope.


The note-counter/progress/legend row is removed from Exercises. Clear selection sits beside the main playback button and appears only when a passage is selected.


Playback now follows notation. One Play button plays the full exercise or the selected passage and uses the same Loop option. Dragging selects without starting playback; the button and selection summary identify the active scope. Clear selection restores full-exercise playback. The duplicate Play selection button is removed.


Guitar and Exercises each have one combined progression/position selector: current context, navigation controls and cards containing chord, duration, scale guide and CAGED location. The redundant Full progression list is removed. Cards retain click/Enter inspection and held pointer/Space audition. Exercises places the centered-title CAGED diagram after these selectors and before View; View now controls the notation below.


The CAGED reference now sits above full-width notation, with its chord/position heading beside the compact diagram on desktop and above it on mobile. The former sticky sidebar is removed. Show/Hide fretboard remains in View; notation retains full width in either state.


Exercises is now organized by purpose: Exercise (type/material/direction/rhythm/scope), Playback (play, BPM/speed, loop/accompaniment, tempo trainer, passage controls), Chord & position, View (display/size/diagram/focus), the shared practice material, one Reference & guidance disclosure, and Save & export. Duplicate exercise-changing shortcut buttons are removed; their choices remain in the Exercise menu. Tempo trainer and display settings are separate.


Diagram and notation share one practice surface, with a wider 37.5% diagram column and references below the fretboard. Material, Direction, Rhythm, Loop and Use accompaniment are visible beside the exercise workflow; the lower disclosure now contains tempo/playback/display controls only.


The Exercises practice area now uses compact navigation, a shallow horizontally scrollable chord strip, a 30/70 desktop diagram/notation split and a sticky diagram below the workspace tabs. The chord/position heading stays with the diagram. Diagram key and chord-symbol explanations are optional disclosures. Hide fretboard expands notation to full width; mobile remains stacked.


Exercises show the CAGED diagram beside notation on desktop, stacking on narrower screens.


Written application rhythms, demonstrate/response flow and the diagram recall challenge are removed. Exercises retain short-cell and full-position stages, ordinary rhythms/playback, and an optional fretboard visibility toggle for layout. Older Apply favourites open as full-position studies.


The manual “Choose loop with controls” disclosure and “Find a chord tone” self-check are removed. Select loops directly on the chord chart. Highlight chord shapes and Explore all positions now sit visibly above Guitar diagrams, outside Diagram display settings. Progression-card navigation remains independent of quizzes.


Shell/drop workshops, ear training, microphone recording/A–B comparison and the practice journal have been removed from the active app. Their launchers, exercise choices and guided goal are removed. Existing CAGED chord-shape references, connected exercises, presets, learning path, repertoire and remaining teaching guidance are retained. Old workshop favourites fall back to the harmonized study. Stored journal/audio data is left untouched; it is not loaded by the app. Earlier checkpoint instructions below are historical and may describe removed tools.

Future chord-shape learning should be integrated with the existing CAGED diagrams rather than separate workshops.


- Branch: `feature/guided-practice-beta`
- Independent private preview: https://mehtronome-guided-practice-preview.wintrycandy7.chatgpt.site
- GitHub Pages live app remains on `main`: https://nw16613-apps.github.io/Mehtronome/
- Current preview app checkpoint: Checkpoints 11–13 complete the agreed musical-review, teaching and beta acceptance pass. See [the acceptance report](beta-acceptance.md) for scope, checks and limits.

The preview has its own origin and browser storage. Sign in with the owning ChatGPT account if prompted. It does not read or overwrite the live app's browser presets. Export/import presets explicitly if you want to test existing saved setups; keep your backup file.

## Try the completed review (checkpoints 11–13)

1. Start **Learn a grip and its arpeggio** from Metronome & Mixer. In Guitar, use **Practise this shape**, then compare Exact grip and Full positional arpeggio in Exercises.
2. Change **CAGED position** directly above the Exercises diagram. Open **How to practise** to see the actual starting note and first study cells.
3. For a concrete teaching example, select B Dorian / Bm7 and **Arpeggios from each chord tone**. The explanation distinguishes Bm7, Dmaj7, F♯m7 and Amaj7 cells from inversions of Bm7.
4. In Harmony, choose a minor-key **Diatonic sevenths** template. Its actual qualities/Roman degrees include ♭VImaj7. Make an editable copy: chords and scale pitches are retained. The same preservation applies to modal templates.
5. Select **Ionian ♯5** or **Lydian ♯2** and inspect Guitar/Exercises: all five positions remain separately selectable.
6. Try Apply it musically in 4/4, then Demonstrate, then your turn; save the session in Progress and resume it. Playback remains stopped on resume.
7. Use the mixer and navigation at phone width; the floating mixer and focus transport stay available. Stored presets/journals remain local to this preview origin.

See [beta acceptance](beta-acceptance.md) for the complete delivered/deferred map and validation limits. The live GitHub Pages app remains unchanged.

## Try checkpoint 10

1. In **Exercises**, show the linked fretboard and open **Find a chord tone · self-check** just above the diagram.
2. Choose Third, Seventh, Root or Fifth, then **Find this tone**. All visible dots become neutral and their labels/answer rings are hidden. The question uses the current chord’s actual interval (for example ♭3 or ♭7), not its scale-guide degree.
3. Click a dot, or Tab to one and press Enter/Space. Any visible octave of the correct pitch class is accepted. A wrong choice invites another try. A correct choice reveals the note and rings its available locations.
4. Use **Reveal answer** to self-check without guessing; **Next tone** cycles to another available target. **End self-check** restores normal diagram interaction.
5. Choose another progression card or position. Cards start a fresh question when a self-check is active; other context changes clear old questions. Playback also ends the question and restores the normal diagram; stop to start another question.

Suspended chords do not acquire an invented third. If the formula or position lacks a requested tone, the app explains that and leaves the diagram unmasked. The self-check tests a clicked note, not your played audio or mastery. It does not change learning-path completion, journal ratings or stored presets.

## Progression cards beside practice material

The chord/position/fret-range cards are visible in **both Guitar and Exercises**, in **Manual selection** and **Follow nearest positions**. In Exercises they sit directly above the linked fretboard and self-check, so you can choose a chord beside the practice material. The redundant Inspect chord dropdown has been removed; the cards are native buttons and support keyboard selection.

Selecting a card in either workspace updates the same inspected chord and current position. During an active self-check, card selection starts a fresh question for the new chord while preserving your chosen tone type. Cards remain visible when the fretboard body is hidden; they are disabled during playback while the active highlight follows the progression.

## Connected Guitar / Exercises navigation

In both workspaces, **Position navigation** is grouped with **Fretboard region** directly above the progression cards. **Follow nearest positions** uses the same route in Guitar and Exercises. In manual mode, Exercises shows **Starting position** in that same group. Choose a progression card to select its chord and position in both workspaces. Inspection leaves the exercise’s written notes and playback order intact.

The shared route also applies to guide-tone and voice-led connection studies. During exercise playback the diagram and Guitar reference follow the current chord; stopping retains that chord for inspection. Route/inspection controls are locked during playback. Manual position changes still use the existing shared position selection. Guitar route cards outside an active loop are disabled because that chord is outside the current exercise.

## Try checkpoint 9

1. Launch **Outline an essential ii–V–I**, or select **Guide-tone voice leading** in Exercises with a progression active.
2. In **Explore the position**, read **Targets between chords**. It describes the actual written source and next note, their chord intervals, and their movement; it does not invent another path.
3. While stopped, click a target (or focus it and press Enter) to hear that note and highlight its place in the score and correct chord’s fretboard.
4. Compare **Voice-led connections**: the source is the arpeggio’s last written note, and the target is the first note of the next chord. The stated movement can be larger than a semitone; the panel reports what is actually written.
5. Short-cell stages with silent later chords omit connections across the silent slots. These are melodic examples, not simultaneous chord grips or verified fingerings.

## Chart loop selection

Drag across chart beats to select an exact inclusive beat range. Partial chords and a single beat are supported; dragging backward selects the same range. The chosen beats are pale blue with a dark-blue underline; the playing beat is amber. Clear loop restores the whole progression. Escape cancels an unfinished drag.

**Choose loop with controls** offers **Beats** for numeric endpoints (counted from beat 1 of the chart) and **Whole chords** for the original chord ranges, including wrapped end-to-start loops. Dragging always selects beats. Mouse/pen support dragging; touch users can use the numeric controls.

Stopped audio stays stopped. A selection during playback restarts at its first beat, preserving the existing count-in setting. The metronome keeps the selected metre; a short loop repeats immediately without padding to a full bar. Guitar/Exercises references use the clipped chord durations, and progression exercises follow the same timeline. Their notation can show several loop cycles to finish on a bar line.

New presets and journal sessions retain beat endpoints. Older saved setups default to whole-chord mode. Beat-loop exports need this preview or a compatible newer app; the older live app cannot interpret those endpoints. Compare two chords remains removed.

Progression-following exercise notation now beams quavers, triplets and semiquavers within each quarter-note beat, breaking at rests, bars and chord changes. Long/tied notes keep their durations; exported SVG retains the beams and chord-symbol clearance.

## Try the unified progression chart

1. In **Harmony → Chord progression**, choose any template. Its chords now appear as the same chord chart used by **My progression**.
2. Click a chord/beat, or focus it and press Enter. A template becomes a personal copy and opens that chord’s editor. The original template remains in the selector. **Create from this progression** opens the same chart editor at the start.
3. Edit the chord, scale guide, bass or duration; add, duplicate, move, delete, undo and redo using the existing controls. Chord tiles no longer duplicate the chart.
4. Hold a chart chord, or focus it and hold Space, to hear it while stopped. Release to stop. Playback highlights chart beats for templates as well as personal progressions. Clicking to edit stops playback.

The current chord symbol and its complete note list now sit inside **Under your fingers**, above the scale degrees and seven seventh-chord cards, within the same Harmony panel. Extensions remain in the current chord display rather than being reduced to the seventh chord shown below.

## Try checkpoint 8

1. Open **Harmony**, choose a progression and **Create from this progression**.
2. In **My progression**, change a chord or duration, duplicate/delete a chord, or reorder it.
3. Use **Undo** and **Redo** beside **Add chord**. The selected chord and arrangement return together; the chart and saved progression update.
4. Undo, then make a different edit: Redo clears. Undo/redo stops playback before restoring an arrangement.

History holds up to 50 edits in this page session. It resets on reload or when a saved session/preset loads a custom progression. The restored arrangement itself remains saved in this browser. History covers progression content, not tonic, mixer, or loop-selection controls.

## Try checkpoint 7

1. In Exercises choose a study, then **Stage → Apply it musically** in 4/4.
2. Compare the **Written phrase** choices: Cell, hold, space; Delay the resolution; Cell and answer. Read the rests, holds and accents in the score. These rhythmic forms use the selected study’s pitches.
3. Choose **Practice flow → Demonstrate, then your turn**, then **Hear jazz guitar**. Listen first; play during the equally long response section. The lead guitar rests while enabled backing continues. Loop repeats both sections. This does not record or score your playing.
4. Try a progression: each phrase uses that chord’s study material. Short chord slots that cannot fit a complete cell show a warning and rest.
5. Save a journal session, reload and resume it to recall the stage, phrase and practice flow.

Authored forms currently use 4/4. Other metres retain the regular study and manual application prompt, with an explicit notice. Written phrases use fixed tempo; the ordinary subdivision choice remains available in other stages.

## Earlier checkpoint checks

1. In Metronome & Mixer, choose **Learn a grip and its arpeggio** and **Clear harmony study**, then **Set up this session**. It keeps the selected tonic, configures stable harmony and enables count-in; no sound starts automatically.
2. In Guitar, compare **Learn grip only** with **Connect to scale**. Read the formula, actual voiced notes, bass and omitted tones. Strum the grip while stopped.
3. Choose **Practise this shape**. Exercises keeps the chord and position and shows only the grip's sounding notes in its first cell. Click a notation note or fretboard note to audition it and see the square marker.
4. Compare **Full positional arpeggio** and **Add an enclosure**. Change Position here without returning to Guitar. Try short-cell, full-position and application stages; expand **How to practise** for the purpose and pattern.
5. Use **Try without diagram**, then reveal it to self-check. Open **Playback, material and display settings** for looping, slower speed, tempo training and its ceiling. The persistent Stop button also stops an exercise.
6. Try **Outline an essential ii–V–I**. It now opens the full-position stage with accompaniment enabled. Press **Hear jazz guitar**: a guide tone starts at each chord change and holds for the chord’s duration. The tonic’s two-bar hold is tied across the bar line. The reference and focus bar follow the backing. Enable **Loop** for complete-cycle repetitions. Compare **Voice-led connections** in the Exercise selector: each arpeggio starts with its chord, then rests until the next change. **Learn the idea · short cell** plays only the first chord’s material and leaves the remaining chord slots silent. A passage selection retains its original chord timing rather than moving it over the wrong chord.
7. In **Harmony**, choose a progression and **Create from this progression**. Select a chord, set **Duration unit → Beats**, then choose **2 beats**. Give the next chord 2 beats too: the chord sheet places it on beat 3 of the same 4/4 bar. Press Play and check the current chord, scale guide, fretboard and live beat marker. Existing **Bars** durations still follow the metre; **Beats** durations stay fixed. Save a preset or journal session to recall the changes.
8. Choose **Review / save session**, enter a name, notes, self-assessment and optional comfortable tempo, then save. Reload, select the entry in Progress and resume. The saved exercise, position, stage, tempo and musical setup return with audio stopped. **Update review only** preserves the original setup. Export/import journals separately from presets; imports retain existing entries.
9. The original context changes remain: in Harmony choose a ii–V–I level and distinguish progression tonic, current chord, scale guide and next chord.

The guide-tone and connection studies now play their displayed holds/rests on the chord timeline. In the 4/4 Apply stage the application is now written and played; outside that supported stage, prose prompts remain instructions for the player. Timed studies use fixed tempo and stable extensions; ordinary position studies keep their tempo trainer. Long guitar notes decay naturally. Small chord slots warn if the selected subdivision cannot fit every arpeggio note. Goal setups use existing controls; presets save backing/display setups and exercise favourites save the study selection.

This is a versioned checkpoint, not automatic deployment on every branch push. Rebuild and publish the separate preview after subsequent completed increments.

## Run locally instead

Use Node.js 22 LTS (or a newer compatible version) and Git. Start in a directory where you want the checkout:

```sh
git clone https://github.com/nw16613-apps/Mehtronome.git
cd Mehtronome
git fetch origin
git switch feature/guided-practice-beta
cd web
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173/ on the same computer. Click Play to enable audio; localhost is a secure context for browser audio. Stop the server with Ctrl+C.

For an existing checkout with no uncommitted changes, use `git fetch origin`, `git switch feature/guided-practice-beta`, and `git pull --ff-only`, then run the `web` commands above. Do not discard local changes to switch branches.

To test the production build locally:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open http://127.0.0.1:4173/.

## Hosting isolation

Sites project: `appgprj_6ade42239a348191953eab7987e72841`. The preview source checkout is separate at `/workspace/sites/mehtronome-guided-practice-preview`; its `.openai/hosting.json` is the retained identity for future preview updates. Its source repository is independent of GitHub. Do not bind GitHub Pages to this branch or deploy the Pages workflow from it. The existing Pages push trigger remains restricted to `main`.

## Beat-duration compatibility

Custom progressions now have nested format version 2. Older bar-based saved progressions, presets and journals load with their original duration units. New durations support 1–32 whole quarter-note beats per chord; this is not sub-beat editing. Beat-based exports require this preview build or a compatible later release; the older live app does not understand these durations. No live-app data is changed automatically.

Cycles ending partway through a bar repeat immediately while the main bar/beat clock continues. The grid explains this. Timed exercise notation repeats enough harmonic cycles to return to beat 1, and labels every mid-bar change. This keeps its count-in, full-study loops and one-shot end aligned. The earlier timing/content review remains deferred.

## Chord-sheet and exercise symbols

The My progression tiles are replaced by a lead-sheet-style chord chart: four bars per row on wide screens, two on medium screens and one on phones; slash marks count the beats, chord symbols appear at changes/new bars and the live marker follows playback. Click any beat to edit its chord. Partial ending bars show their actual length and repeat immediately; the chart does not add silent beats.

Exercise chord symbols now follow the selected backing progression at its actual change beats, never the exercise cells. The selected exercise is rebuilt from each chord’s tones or scale guide and placed inside its chord duration, using CAGED regions near the chosen starting position. Repeated passages update the printed symbols for the next backing cycle. Pedal studies keep the held chord. Progression accompaniment uses fixed exercise tempo. Symbols occupy a separate band above the music, with clearance calculated from note/stem height, and remain in SVG export.

## Exercises that follow the chords

Choose a progression in Harmony, then select an exercise in Exercises. The written notes now change with each chord: for example, short thirds cells over Bm7 → E7 → Amaj7 are B–D, E–G♯ and A–C♯. Arpeggios, chord-tone cells, enclosures and other study families use each chord’s own harmonic context. Complete cells are fitted to the chord slot; remaining time is a written rest. If a cell cannot fit, the slot explains the rest rather than dropping its resolution target. Longer durations or faster subdivisions expose more material.

The chosen position anchors a nearby CAGED route. The compact fretboard is above the full-width score and follows the current chord during playback. Select a progression card while stopped to examine another chord’s notes, scale and grip information. **Starting position** moves the route; **Try without diagram** still hides/reveals it. Source pentatonics or triad pairs are adapted only to available choices, with the per-chord choices listed in **How to practise → Material and region for each chord**.

Short-cell mode now gives one cell per chord for these adaptive studies. Dedicated guide-line studies retain their separate short-cell behavior. Pedal mode remains a held-chord study. Existing presets and journal formats are unchanged.

The pedal-chord Exercises view now places CAGED position directly above its fretboard. Change it there to rebuild the linked notation and diagram together. Progression studies retain their grouped route controls.

## Automatic routes and independent manual positions

Progression practice now defaults to **Automatic route** in Guitar and Exercises. Choose a fretboard region to calculate nearby positions for the whole progression.

For a custom route, choose **Choose positions yourself**, select a chord card, then change **Selected chord position**. Only that card changes. The other chords keep their positions; Guitar and Exercises share the same route and notation follows it. Switching temporarily to Automatic route does not discard the manual route. Presets and journal snapshots retain these choices. A different/reordered harmonic progression seeds a fresh route rather than attaching old choices to unrelated chords. Old presets without a navigation choice now use Automatic route; explicit older manual choices are retained.

## Try shell voicings and written guide-tone phrases

1. In Metronome & Mixer, choose **Connect shell voicings**, then **Set up this session**. Alternatively, open **Shell voicing workshop** from Guitar for your current chord/progression.
2. Compare the three-note shell cards and their omitted tones. **Strum chord** sounds exactly the displayed notes; click again to stop. Read **What moves between these grips?** for each D/G-string voice.
3. Set **Shell strings** to 6–4–3, 5–4–3 or either bass, and choose **Shell register**. Hear jazz guitar plays the notated single-note shell study with accompaniment.
4. Choose **Apply as a guide-tone phrase**, then compare **Guide-tone motif** and **Chromatic resolution**. Holds, rests and resolution targets are written and played. The phrase uses strings 4 and 3; its final chord resolves rather than leaving an approach hanging.
5. Save a journal entry or favourite and restore it to retain the string set, register and phrase choice. The authored phrases currently need 4/4 and four or more beats per chord; unsupported cases explain their rests.

See [the extended-practice track](extended-practice.md) for this delivered increment and the selected next directions. Alternative tunings and left-handed views are excluded.

### Drop voicing workshop

1. Set a seventh-chord progression in Harmony (or use **Connect shell voicings** to set up a ii–V–I).
2. Open **Guitar → Drop voicing workshop**, or select **Drop 2 / drop 3 voicing arpeggios** in Exercises.
3. Compare Drop 2/Drop 3, register and fixed/automatic string sets. Cards give the real bass, notes, omissions and mutes.
4. **Strum chord** hears the exact grip and selects its linked diagram. **Hear jazz guitar** plays its four-note arpeggio in time with the progression. Read the movement breakdown to follow each low-to-high voice.
5. Save a favourite or journal entry and resume it to retain the workshop settings. Unsupported four-tone shapes and chord slots below two beats remain rests.

### Personal repertoire charts and section practice

1. In **Harmony**, open **Repertoire · personal charts & original studies**. Load a blues or A/B original study in the current key.
2. Read its rehearsal marks on the chord sheet. Click a chord to edit it; use **Chart title** and **Start a section at this chord** to change the form. Marks apply until the next marked chord.
3. Choose **Loop section** below the chart, or in the harmony references in **Guitar** and **Exercises**. The selected beat range is shared. **Full chart** restores the whole form. Section controls lock during playback.
4. Give the form a name under **Save chart as** and choose **Save new chart**. Reload it from **My charts**, or update a selected saved chart from the current progression.
5. Export/import a backup; importing creates new copies. Charts retain harmony, key, metre and marks. For a complete exercise/session setup use the existing journal.

### Written phrases, ear training and recording

1. Open the **Drop voicing workshop**. Choose **Exercise voices → Top voice** and **Written phrase → Late chromatic resolution**. It fixes the string set; the score/TAB now uses one string and approaches the next chord. Compare upper/inner two-voice parts and Held note and answer. Favourites/journal retain these choices.
2. In **Exercises**, use **Ear training ↓**. Hear a question, choose an answer, replay or reveal, and advance. Try chord quality, voice movement and matching a heard pitch to a fretboard location. Only first answers count; Reveal skips scoring.
3. Use **Record & compare →** (or Progress → Record & compare). Press Record to request microphone access; no access is requested automatically. Stop saves locally. Record a second take.
4. Choose A/B, play A then switch to B while playing. Comparison retains elapsed position after each take's lead-in/latency trim. Adjust trim by ear against a recorded count-in/first attack; this is manual alignment, not measured device calibration.
5. Edit notes/name, reload to verify persistence, and export original audio as a backup. The recording contains microphone/interface input, without a digitally mixed backing track. Hardware/browser/device latency needs hands-on checking; automated browser recording tests use synthetic input.

### Harmony/audio polish checks

- In a custom C-major-seventh chord, choose C Dorian as its scale guide. The editor, Guitar and Exercises explain that E and B are outside that guide. **Use compatible scale guide** selects a matching guide; Undo restores the deliberate choice. Chord dots remain visible either way.
- Ear-training answer buttons stay disabled until the complete example finishes. Interrupt the first listening with the main transport, stop it, and listen again; no attempt is scored by the interruption.
- Draft some recording review notes or trim edits, then change A/B selections: the draft remains. Delete a loaded take and confirm the native player no longer retains its audio source.

### Exercise inspection synchronization

1. Set an essential ii–V–I, open Exercises and choose a scale/connection study. Click a note head from the second chord. Current/next references, the main chord, route selection, linked diagram and Guitar now inspect that chord together.
2. Focus a note in the score and press Enter; its chord context updates without rebuilding the notation or losing focus.
3. Select a beat loop that begins in the second chord, inspect its later chord, then start the exercise with count-in. The diagram/reference immediately return to the first chord of that selected loop.
4. Drag a passage in a drop/shell study, stop it, then change voices, strings or phrase. The old range clears instead of referring to the previous notes.

### Options 1–4 updates

1. In Harmony's repertoire library, choose **Minor ii–V–i** or **Dorian conversation**. Read the brief and choose **Load & practise study**. The correct phrase/strings are configured without starting audio. Edit or transpose the chart normally.
2. In either voicing workshop, fold **Source chords, omissions & voice movement** away. That preference stays when switching studies or reloading. Mobile controls stack into a single column.
3. Test a slash chord: shells explain unsupported inverted basses; drop grips either use the actual requested bass or leave an explicit gap. Chord-tone interval labels preserve altered spellings.
4. In Ear training choose **Extended** for seven chord qualities, larger movements or all-six-string pitch finding. Activity/level results survive reload; reveals count once.
5. In Record & compare, watch the input peak meter during capture. Select a take to see its waveform, click/tap to set the starting trim, then Save take details. The numeric field provides the same control. The waveform follows all four palettes; original export and manual A/B alignment remain available.
