# Interactive branch preview

- Branch: `feature/guided-practice-beta`
- Independent private preview: https://mehtronome-guided-practice-preview.wintrycandy7.chatgpt.site
- GitHub Pages live app remains on `main`: https://nw16613-apps.github.io/Mehtronome/
- Current preview app checkpoint: Checkpoint 6 adds beat-level custom progression durations and a live bar/beat grid. Existing bar-based progressions remain compatible. The checkpoint 5 movement lab has been removed following feedback.

The preview has its own origin and browser storage. Sign in with the owning ChatGPT account if prompted. It does not read or overwrite the live app's browser presets. Export/import presets explicitly if you want to test existing saved setups; keep your backup file.

## Try this checkpoint

1. In Metronome & Mixer, choose **Learn a grip and its arpeggio** and **Clear harmony study**, then **Set up this session**. It keeps the selected tonic, configures stable harmony and enables count-in; no sound starts automatically.
2. In Guitar, compare **Learn grip only** with **Connect to scale**. Read the formula, actual voiced notes, bass and omitted tones. Strum the grip while stopped.
3. Choose **Practise this shape**. Exercises keeps the chord and position and shows only the grip's sounding notes in its first cell. Click a notation note or fretboard note to audition it and see the square marker.
4. Compare **Full positional arpeggio** and **Add an enclosure**. Change Position here without returning to Guitar. Try short-cell, full-position and application stages; expand **How to practise** for the purpose and pattern.
5. Use **Try without diagram**, then reveal it to self-check. Open **Playback, material and display settings** for looping, slower speed, tempo training and its ceiling. The persistent Stop button also stops an exercise.
6. Try **Outline an essential ii–V–I**. It now opens the full-position stage with accompaniment enabled. Press **Hear jazz guitar**: a guide tone starts at each chord change and holds for the chord’s duration. The tonic’s two-bar hold is tied across the bar line. The reference and focus bar follow the backing. Enable **Loop** for complete-cycle repetitions. Compare **Voice-led connections** in the Exercise selector: each arpeggio starts with its chord, then rests until the next change. **Learn the idea · short cell** plays only the first chord’s material and leaves the remaining chord slots silent. A passage selection retains its original chord timing rather than moving it over the wrong chord.
7. In **Harmony**, choose a progression and **Create from this progression**. Select a chord, set **Duration unit → Beats**, then choose **2 beats**. Give the next chord 2 beats too: the grid places it on beat 3 of the same 4/4 bar. Press Play and check the current chord, scale guide, fretboard and highlighted grid beat. Existing **Bars** durations still follow the metre; **Beats** durations stay fixed. Save a preset or journal session to recall the changes.
8. Choose **Review / save session**, enter a name, notes, self-assessment and optional comfortable tempo, then save. Reload, select the entry in Progress and resume. The saved exercise, position, stage, tempo and musical setup return with audio stopped. **Update review only** preserves the original setup. Export/import journals separately from presets; imports retain existing entries.
9. The original context changes remain: in Harmony choose a ii–V–I level and distinguish progression tonic, current chord, scale guide and next chord.

The guide-tone and connection studies now play their displayed holds/rests on the chord timeline. Separate prose application prompts remain instructions for the player; they do not change the written exercise. Timed studies use fixed tempo and stable extensions; ordinary position studies keep their tempo trainer. Long guitar notes decay naturally. Small chord slots warn if the selected subdivision cannot fit every arpeggio note. Goal setups use existing controls; presets save backing/display setups and exercise favourites save the study selection.

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
