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

## Shared engine follow-up: Firefox on OnePlus 9 Pro

The user confirmed that the phone speaker in Firefox on a OnePlus 9 Pro also glitches with every mixer track except Metronome muted. That rules out an exercise-only scheduling explanation. The previous main-thread throttling test did not emulate mobile AudioWorklet or device-output limits.

The shared realtime engine still performed electric-piano synthesis while muted, constructed tone-shape objects per active voice/sample, recalculated pitch powers and exponential envelopes per sample, rendered muted melodic/pad waveforms, and allocated typed-array subviews in every worklet callback. The follow-up:

- Hoists electric-piano tone parameters and computes pitch/envelope coefficients at note-on. Multiplicative envelopes preserve the original waveform (reference-equation tests stay within 1e-9). Muted voices still age and advance phase/envelopes, but skip FM waveform calculations.
- Skips inaudible pad and melodic waveform reads after the bus fade, retaining the common musical clock and current instrument state. Mixer switches remain enabled and unmuting does not restart a pile of frozen notes.
- Uses native output channel arrays directly during steady-state worklet processing. Partial start-block subviews remain, with tested identical silent prefixes and offsets across outputs.
- Lets AudioContext choose the native device sample rate, instead of forcing 48 kHz. Phones request the standard 'playback' latency hint; desktop retains 'balanced'. Hints are implemented by the browser and do not guarantee a particular hardware buffer size.
- Removes the reverb impulse after a short mute fade, avoiding convolution work with the Ambient space return muted. Restoring the return restores the impulse. Repeated starts reconnect the exercise guitar send to the new convolver rather than retaining the old send.
- Keeps instrument-note notifications out of the main transport beat handler.

A same-machine 48 kHz/128-frame Engine benchmark averaged roughly 0.337 ms per block before and 0.098 ms after with all backing muted (~71% lower). With harmony audible and other backing muted it averaged 0.299 → 0.120 ms; with all parts active, 0.286 → 0.194 ms. These are desktop Node measurements, not handset measurements or a guarantee of the worst callback time.

Additional tests cover original electric-piano waveforms/releases, muted voice aging, zero muted-pad waveform reads, sample clocks, callback sizes, the phone context-option policy, allocation-free steady-state worklet views, audible click-only output, real mixer mute/unmute reverb state, and repeated guitar/reverb routing. The browser phone profile uses Android Firefox user-agent/touch settings in Chromium to validate app policy; it does not run Firefox Android. Physical-device confirmation is still required.
