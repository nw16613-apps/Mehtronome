# Guitar and bass source audition

This is a recording-source comparison, not AI music generation or a replacement
arranger. The app's sampler, style settings and runtime sources are unchanged.

Candidates are pinned CC0 releases of Karoryfer Shinyguitar (pickup), Growlybass
(Squier Jazz bass), and Sneakybass (a separate quiet pizzicato double-bass session).
The current upright already includes Meatbass; it is not labelled as a new source.
Shinyguitar is an archtop electric, not a nylon-string replacement. Acoustic/nylon
replacement remains to be auditioned separately. Growlybass has an intentionally
forceful pluck; it may suit some styles better than others.

## Reproduce

Requirements: Python with NumPy, Node, ffmpeg with libmp3lame, access to the pinned
public GitHub files. Prepared recordings stay outside the app and its load cache.

```sh
python3 tools/sample-audition/prepare.py /workspace/sample-candidates
node tools/sample-audition/render.mjs /workspace/sample-candidates /workspace/instrument-audition
```

Serve the output directory as a static page, or copy it under the private preview's
`public/instrument-audition/` before building. No new controls are added to the app.

The preparation reads actual SFZ pitch centres, tuning corrections and velocity
boundaries, keeps two independent takes per pitch/dynamic, and preserves natural
decay up to six seconds. It verifies the licences and records source/derivative
hashes. These are sustained recordings, not newly implemented release/mute/slide
articulations. Only the pickup signal is used in this first guitar comparison.

Each comparison uses eight bars of the existing style reference chart. Source
selection is overridden offline, using the production comping sampler or bass
voice and envelope. The bass adapter uses explicit source dynamics rather than
mixing layers indiscriminately. The normal runtime bass selector is unchanged.

The renderer asserts exact event parity (pitches, timing and articulation) and
sample-for-sample equality of every unaffected instrument stem. Sources are heard
with identical existing processing: any missing amp/transition realism remains
audible in both. The dry ensemble includes the standard Supporting melody.

Solo files use constant-gain LUFS matching with at least 2 dB true-peak headroom
before encoding. Candidate ensemble files apply that source loudness correction
only to the changed instrument. Both complete mixes then receive the same fixed
gain; the report states any residual ensemble loudness difference. No compressor,
limiter or harmonic repair is used. Compare using headphones and the same device.

## Checkpoint criteria

All downloaded hashes/licences, event parity, unchanged stems, finite renders,
MP3 decoding, loudness and mobile listening-page controls must pass before sharing.
The user judges realism. A successful render is not evidence that the new source
sounds better. Do not replace all guitar/bass styles until these sources are heard.

## Round two: DI guitars through an amp, and alternative electric basses

```sh
python3 tools/sample-audition/prepare-round2.py /workspace/sample-candidates-round2
python3 tools/sample-audition/test-amp.py
node tools/sample-audition/render-round2.mjs /workspace/sample-candidates-round2 /workspace/instrument-audition-2
```

This preparation requires SciPy as well as NumPy/ffmpeg. It pins 332 CC0 source
recordings: Emilyguitar 128, FreePats FSBS Direct 108, Swagbass 84 and Yamaha RBX
Finger 12. The Fender DI source is an unprocessed version of the current guitar,
not a new guitar recording session. Yamaha RBX is a sparse one-octave map with no
recorded alternate takes/dynamic layers; higher notes require transposition. Its
limitations are stated on the listening page rather than hidden by processing.

Three eight-bar guitar parts compare Current, Emily DI/amp and Fender DI/amp.
Two bass parts compare Current, Yamaha RBX and Swagbass, including the troublesome
Funk upper-register phrase and longer Fusion notes. Growlybass is not used.
Current retains its exact existing processing. DI candidates bypass only the old
per-note drive and use a high sampler filter cutoff; note envelopes are retained.

`amp.py` implements original, lightweight offline DSP: two oversampled soft
clipping stages, coupling/input/tone filters, envelope-dependent supply sag and
a separately licensed speaker IR. It is not circuit-accurate modelling or a
neural capture, and does not supply recorded legato/mute articulations. Clean and
Fusion use light gain; Blues breaks up more. Saturation runs at 128 kHz and is
downsampled to 32 kHz before cabinet convolution. The cabinet is `data/ir.wav`
from pinned `jfsantos/guitar-fx`; that repository's README declares this Deluxe
Reverb response public domain and credits Soundwoofer. Source hash and credit
are retained. No third-party amp implementation code was copied.

Raw candidate DI and the same performance through the amp are both available;
fixed-gain solo matching separates loudness preference from timbre. Checks verify
identical event streams, sample-identical unaffected stems, finite output,
decoded MP3 true peaks below zero and solo matches within 0.3 LU of the decoded
reference. The four DSP tests cover silence, actual harmonic change, retained
fundamental, speaker filtering and surviving input accents. Browser validation:

```sh
# Serve /workspace/instrument-audition-2 on loopback port 4185, then:
node tools/sample-audition/browser-check-round2.mjs
```

SampleScience is omitted because Gumroad/Payhip download hosts returned an
explicit network-policy 403; no checkout, email submission or purchase was made.
Standard Guitar is omitted because its publisher's original About page expressly
prohibits modifying/redistributing its data without permission. The published
terms supersede third-party claims that it is public domain. No vendor contact
was made. Neither unavailable candidate is represented as having been auditioned.

Publish the new output under `/instrument-audition-2/`, retaining the earlier
audition and the main app unchanged. Only offline scripts/listening renders are
added; this does not add per-sample work, sample downloads or controls to the app.

### Clean Emily chorus follow-up

The user prefers Emilyguitar and Yamaha RBX. The round-two page now initially
selects those choices, and adds a sixth clean-guitar version: Emily amp + chorus.
`chorus.py` applies a slow, shallow stereo modulated delay after the same clean
amp/cab output (0.32 Hz, 14 ms centre, 1.3 ms depth, 18% wet). The dry attack stays
undelayed, wet lows/highs are filtered, and there is no feedback. Blues/Fusion
guitar and both bass performances have no added chorus. The main app remains
unchanged pending this final tone audition.

All solo renders now have two channels, including dual-mono references, so stereo
chorus and mono sources are matched on the same loudness basis. There are 44
listening files. `test-chorus.py` checks silence, exact bypass, undelayed attack,
no long feedback echo, stereo difference and preserved mono body. The existing
amp tests and event/stem/headroom/decoded-loudness checks still apply.

The main clean-guitar sampler adds no chorus itself. FreePats documents amp/effects
processing in its source recordings but does not identify the effects, so a
baked-in chorus is plausible but unconfirmed. Do not report it as established.

The user then requested a 30% chorus mix and the same test on Blues and Fusion
swells. The default is now 30% wet / 70% dry, with modulation, delay and filtering
unchanged. All three Emily amp versions have a separate 30% chorus option beside
the amp-only version. Descriptions identify each part's actual amp profile. The
audition now has 48 files; browser checks verify the three labelled 30% options
and play every solo/ensemble version. Bass, drums and app runtime are unchanged.
