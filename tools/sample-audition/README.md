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
