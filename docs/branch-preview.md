# Interactive branch preview

- Branch: `feature/guided-practice-beta`
- Independent private preview: https://mehtronome-guided-practice-preview.wintrycandy7.chatgpt.site
- GitHub Pages live app remains on `main`: https://nw16613-apps.github.io/Mehtronome/
- Current preview app checkpoint: the banner identifies the exact code commit. Checkpoint 5 adds the Guitar chord movement lab: four one-note transformations, two explicit root-string templates, before/after audition, changed-note markers and hide/reveal recall. The previous guided flow, timing experiments and practice journal remain. Earlier timing/shape issues are retained for the requested later review pass; beat-level editing and authored phrase work remain in development.

The preview has its own origin and browser storage. Sign in with the owning ChatGPT account if prompted. It does not read or overwrite the live app's browser presets. Export/import presets explicitly if you want to test existing saved setups; keep your backup file.

## Try this checkpoint

1. In Metronome & Mixer, choose **Learn a grip and its arpeggio** and **Clear harmony study**, then **Set up this session**. It keeps the selected tonic, configures stable harmony and enables count-in; no sound starts automatically.
2. In Guitar, compare **Learn grip only** with **Connect to scale**. Read the formula, actual voiced notes, bass and omitted tones. Strum the grip while stopped.
3. Choose **Practise this shape**. Exercises keeps the chord and position and shows only the grip's sounding notes in its first cell. Click a notation note or fretboard note to audition it and see the square marker.
4. Compare **Full positional arpeggio** and **Add an enclosure**. Change Position here without returning to Guitar. Try short-cell, full-position and application stages; expand **How to practise** for the purpose and pattern.
5. Use **Try without diagram**, then reveal it to self-check. Open **Playback, material and display settings** for looping, slower speed, tempo training and its ceiling. The persistent Stop button also stops an exercise.
6. Try **Outline an essential ii–V–I**. It now opens the full-position stage with accompaniment enabled. Press **Hear jazz guitar**: a guide tone starts at each chord change and holds for the chord’s duration. The tonic’s two-bar hold is tied across the bar line. The reference and focus bar follow the backing. Enable **Loop** for complete-cycle repetitions. Compare **Voice-led connections** in the Exercise selector: each arpeggio starts with its chord, then rests until the next change. **Learn the idea · short cell** plays only the first chord’s material and leaves the remaining chord slots silent. A passage selection retains its original chord timing rather than moving it over the wrong chord.
7. Choose **Review / save session**, enter a name, notes, self-assessment and optional comfortable tempo, then save. Reload, select the entry in Progress and resume. The saved exercise, position, stage, tempo and musical setup return with audio stopped. **Update review only** preserves the original setup. Export/import journals separately from presets; imports retain existing entries.
8. In **Guitar**, open **Chord movement lab · change one note** below the selected-position material. Compare major → minor, maj7 → dominant 7, dominant 7 → minor 7, and minor 7 → minor 6. Switch between 6th- and 5th-string-root templates, compare note names with chord intervals, and use **Strum chord** on Before and After. Dashed rings mark the voice that moves. The focus bar identifies the auditioned chord; the backing setup is retained. **Try without diagrams** hides the answer until you reveal it.
9. The original context changes remain: in Harmony choose a ii–V–I level and distinguish progression tonic, current chord, scale guide and next chord.

Movement-lab templates are chord comparisons on the current chord root, not claims about the selected CAGED region or selected mode. Triads contain all three chord tones; the seventh/sixth shells omit the fifth. Finger/barre instructions are omitted. Lab choices are session-only and are not included in journal or preset snapshots.

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
