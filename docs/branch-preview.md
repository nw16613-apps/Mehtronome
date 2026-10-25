# Interactive branch preview

- Branch: `feature/guided-practice-beta`
- Independent private preview: https://mehtronome-guided-practice-preview.wintrycandy7.chatgpt.site
- GitHub Pages live app remains on `main`: https://nw16613-apps.github.io/Mehtronome/
- Current preview app checkpoint: the banner identifies the exact code commit. Checkpoint 2 adds goal setups, a chord-grip → exercise flow, linked exercise diagrams, specific guidance and recall. Personal review notes and the longer-term scheduling/content work remain in development.

The preview has its own origin and browser storage. Sign in with the owning ChatGPT account if prompted. It does not read or overwrite the live app's browser presets. Export/import presets explicitly if you want to test existing saved setups; keep your backup file.

## Try this checkpoint

1. In Metronome & Mixer, choose **Learn a grip and its arpeggio** and **Clear harmony study**, then **Set up this session**. It keeps the selected tonic, configures stable harmony and enables count-in; no sound starts automatically.
2. In Guitar, compare **Learn grip only** with **Connect to scale**. Read the formula, actual voiced notes, bass and omitted tones. Strum the grip while stopped.
3. Choose **Practise this shape**. Exercises keeps the chord and position and shows only the grip's sounding notes in its first cell. Click a notation note or fretboard note to audition it and see the square marker.
4. Compare **Full positional arpeggio** and **Add an enclosure**. Change Position here without returning to Guitar. Try short-cell, full-position and application stages; expand **How to practise** for the purpose and pattern.
5. Use **Try without diagram**, then reveal it to self-check. Open **Playback, material and display settings** for looping, slower speed, tempo training and its ceiling. The persistent Stop button also stops an exercise.
6. Try **Outline an essential ii–V–I**. Its guide lines are unaccompanied demonstrations; read the explicit example targets and apply them yourself over the main progression. These demonstrations do not yet schedule one target per chord bar.
7. The original context changes remain: in Harmony choose a ii–V–I level and distinguish progression tonic, current chord, scale guide and next chord.

Application prompts containing holds and rests are instructions for the player, not falsely advertised playback of authored rhythms. Goal setups use existing controls; presets save backing/display setups and exercise favourites save the study selection.

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
