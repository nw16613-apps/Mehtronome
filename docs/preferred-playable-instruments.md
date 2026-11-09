# Preferred playable guitar and bass update

The audition is now integrated into ordinary app playback. The user selected
Emilyguitar and Yamaha RBX Finger, preferred the new upright bass, and requested
35% chorus on clean, Blues and Fusion swell guitar tones. Existing backing-style
selection, arbitrary charts, tempo, mute/solo, faders and FX sends remain the UI.
No audition/source selector is added to the app.

## Actual recordings

`preferred/sources.json` pins original and derivative hashes and licences for 94
recordings: 60 Emilyguitar, 12 Yamaha RBX Finger and 22 Sneakybass. Emily retains
two takes per note and two useful dynamic layers across 15 source pitches. Its
natural recorded decay is retained up to four seconds. This keeps the active
guitar transfer below 16 MiB and decoded mobile bank around 30 MiB, similar to the
previous guitar bank. The original four-layer audition contains more dynamics;
this mobile subset preserves its commonly played middle/firm recordings. Bass
tails are retained up to 3.5 seconds. Only audible families load, through the
existing bounded queues/cache. Superseded bass banks are not co-loaded.

Yamaha has one recorded dynamic and no alternate takes: velocity affects gain
and existing articulation, not an invented sample layer. Its sparse one-octave
source map requires transposition for higher notes. Sneakybass uses source-map
tuning and independent takes. Nylon guitar, piano, other keys, flute and drums
retain their selected sources. All new note recordings are CC0.

## Playable guitar processing

Electric-guitar DI notes are summed in the music engine, without per-note drive.
Native Web Audio nodes provide a shared two-stage oversampled soft-clipping amp,
input/coupling/tone filters and the audition's credited public-domain speaker IR.
The convolution and oversampling do not run as JavaScript per-sample loops in the
musical worklet. Native filter/oversampling implementations are not bit-identical
to the Python audition; the small offline envelope-sag component is not added to
the realtime callback. This is a lightweight model, not a neural/circuit capture.

The clean, Blues and Fusion swell comping tones have a 35% wet / 65% dry stereo
chorus after the speaker: 0.32 Hz, 14 ms centre delay, 1.3 ms depth, quadrature
left/right modulation, wet high/low filtering, no feedback, undelayed dry attack.
Other guitar tones and melodic movement have no added chorus. Style-dependent
drive/tone and calibrated levels are automatic.

The native dry path replaces the original raw guitar dry path; it is never summed
twice. FX sends receive processed guitar. Fader compensation keeps amplifier
drive stable when the mixer fader changes. Mutes silence the new path; master
volume and existing limiter remain downstream. Silent/non-guitar playback creates
no cabinet processor or cabinet download. Switching styles reuses the graph and
source cache. Guitar exercises/strum previews retain their separate instrument.

## Validation

Checks cover source hashes/licences, recorded layers/takes, selective loading,
bank budgets, no duplicate raw guitar, exact musical events/stems, finite renders,
all-style engine headroom, callback allocations and existing bass behaviour.
Native OfflineAudioContext checks cover actual amp/chorus output, stereo width,
unchanged drive across a 4× fader change, and comparable 32/48 kHz levels.
Mobile browser workflows play the new Emily and Yamaha sources, switch the three
chorus styles, verify muting, sample/cache reuse, arrangement development and
exercise FX reconnections. Browser checks do not prove subjective preference or
guarantee glitch-free performance on every physical phone.
