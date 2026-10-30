# Exercise playback on slower devices

Exercise playback previously rendered a fresh guitar PCM buffer for every scheduled note on every repeat, and created source/filter/gain nodes for the entire chart at once. It also scanned every notation element on every animation frame, filtered/copy-allocated the selected event plan repeatedly, regenerated hidden Harmony/Fretboard content at exercise chord boundaries, and rebuilt references on every backing beat. These are avoidable CPU, allocation and audio-graph costs on mobile.

## Changes

- Prepare each distinct guitar pitch/duration before starting the guitar or accompaniment clock. Yield between groups of four preparations, and retain generation-based cancellation so a cancelled load cannot later start playing.
- Reuse immutable mono AudioBuffers within the run and through a per-context LRU cache. The reusable cache is bounded to 16 MiB; the active run retains the distinct buffers it needs. Contexts and sample rates do not share cache entries. Fresh source nodes are still used for each attack.
- Queue events on the AudioContext clock with a one-second horizon and a 50 ms refill interval, rather than keeping a chart's worth of scheduled native nodes alive. Preserve absolute event times across repeats and passage selections. Stop clears the queue and active sources. Fully expired events are discarded after a severe timer stall rather than played as a burst; partially late attacks retain their original end time and buffer offset.
- Use a shared guitar low-pass filter and disconnect each source and envelope gain when it ends. Guitar gain, dry/reverb routing and the independent volume control remain intact.
- Prewarm the upcoming tempo's samples before an automatic tempo increase where applicable.
- Snapshot the playback sequence/selected event plan once. Limit cursor polling to about 30 fps, and change notation/diagram highlights only when their note or tied-bar segment changes. Scroll only at note changes in the legacy non-plan path.
- Update only the active exercise reference/diagram at chord boundaries. Hidden Harmony/Fretboard views refresh when opened. Backing beat messages no longer regenerate references repeatedly for the same chord.

## Verification

A Chromium test plays a four-chord positional scale at 240 BPM/sixteenths, with accompaniment and looping, under sixfold main-thread CPU throttling. Before this change it allocated 129 AudioBuffers and reached 79 live/scheduled sources by the first measurement after 75 attacks had been queued. Afterwards it allocated 30 buffers and reached 17–18 sources. The new queue schedules notes incrementally, so the exact number of queued attacks at observation differs. No late starts were measured; adjacent attack times remained spaced by 0.0625 seconds. No hidden Fretboard/Harmony subtree rebuilds occurred during the measured playback.

Unit tests cover deduplication, cache eviction/context separation, preparation cancellation, queue horizon, exact loop event ordering and expired-event handling. Browser checks cover cancellation without stale playback, audible live guitar volume/muting, passage selection and looping, automatic tempo increases, chord/diagram following, positional notation, saved options and responsive layouts.

This is not a physical-phone or mobile audio-driver test. Main-thread CPU emulation does not reproduce thermal throttling, Bluetooth behaviour, competing media sessions or operating-system audio interruptions. The reported device should be checked after refreshing the deployed version.
