# Free comping and melodic palette

Electric-guitar and bass assignments are superseded by the selected playable
[Emily/Yamaha/Sneaky update](preferred-playable-instruments.md). The recording
details below remain provenance for the earlier palette and the unchanged keys,
flute and nylon families.

The user chose free, redistributable instruments for both backing tracks and
prefers the current Sonor kit. No purchase, subscription, model service or extra
sound-library selector is required. The normal style selector chooses this
palette. Drums, bass and the independent exercise/fretboard guitar retain their
sources and patterns; the Sonor Fusion/Legato Fusion kit is retained.

## Sources and actual changes

244 bundled recordings cover seven families:

| Family | Recordings | Source | Change |
| --- | ---: | --- | --- |
| Acoustic upright piano | 60 | Meta Open Sound, CC0 | Four real velocity layers, three-semitone zones spanning MIDI 42–84, natural recorded decay. |
| Nylon guitar | 42 | Meta Open Sound, CC0 | Separate fingerstyle, light-picked and firm-picked dynamics across the comping register. |
| Clean electric guitar | 54 | FreePats FSBS clean, CC0 | A separate FLAC recording set with soft/normal layers and alternate takes, including lower-register chord parts. Used for comping and guitar melodies with tone-specific filtering/drive. |
| Flute | 30 | Ixox Flute, Xavier Hosxe; mapping by kinwie, CC BY 4.0 | A separate acoustic recording set with three real dynamic layers and source-map tuning. |
| Tonewheel organ | 10 | Roberto / FreePats setBfree emulation, CC0; keyboardia source mirror | Sampled output of the dedicated organ model, with source sustain-loop points, replacing the app's small additive model for these backing tracks. Not a physical Hammond recording. |
| Wurlitzer EP200 | 30 | Greg Sullivan; mapping by kinwie, CC BY 3.0 | Four recorded dynamics and fuller mapping from the existing source session, replacing the old two-layer selection. |
| Clav-style keys | 18 | VCSL TX81Z Clavisynth, CC0 | Three recorded FM-patch dynamics including the missing middle layer. Same underlying instrument; not a newly sampled Hohner. |

Exact source URLs, pinned revisions, original and derivative SHA-256 hashes,
format/processing and full licences are in
`web/src/audio/samples/studio-instruments/sources.json` and the adjoining licence
files. Public audio credits describe the sources and changes. Meta's official
mono OGG web samples are used, not its much larger stereo lossless releases.
Other sources are FLAC/WAV. Derivatives use the established mono 32 kHz PCM16
bank format with DC/onset trim, normalized peaks, short edge fades and documented
crop lengths. These are curated recordings, not a claim that higher bit depth
alone improves musical realism.

## Playback

`studio-zones.js` keeps mapping/loop metadata safe for the worklet;
`studio-manifest.js` declares bundled fingerprinted URLs. The new maps override
the corresponding expanded bank maps, without mixing in superseded original
piano/guitar notes. Legacy files remain for old/internal source checks.

Layer selection follows explicit velocity ranges, rotates available independent
takes, and falls back to a nearby available upper-register recording when a
soft layer would require excessive pitch shifting. Guitar chord attacks spread
by 6 ms per string and alternate direction; single-note melodies retain their
onset. Guitar damping uses the natural recording and release envelope rather
than borrowing the old recording session's staccato samples. Swelled and driven
guitar levels are rebalanced for the new sustained recordings.

The organ loops while a note sustains and releases through the existing envelope.
Connected sampled flute notes crossfade and enter a little after the breath
attack; these are connected ordinary sustain recordings, not recorded interval
legato transitions. Melodic legato-guitar voices now use real guitar recordings.
Piano/key/flute/guitar roles and the composed phrase vocabulary remain chosen by
style. No generated chart, exercise, tempo, mixer mute/solo, send or melodic
activity setting is replaced.

## Loading and validation

Only audible instrument families load. A family is shared when both tracks need
it. Existing four-request/decode concurrency and cache budgets remain; prepared
PCM is delivered before use, never fetched or decoded in the sample callback.
First-play loading per family is larger for denser piano and flute maps; muted
tracks require none, and loaded samples are reused. The full bank is roughly
56.6 MiB of PCM16 assets but is not loaded as a whole in the app.

Validation covers source hashes/licences, real layer/take selection, requested
registers, all-style sampled comping/melody, muted/source-selective loading,
organ sustain/release, alternating chord attacks, flute connections, deterministic
output, all-style headroom, bounded audio callback behavior and stereo full-fader
mixes at 32 kHz for six representative styles. Browser workflows cover both
tracks on a phone viewport, cache reuse, standard presets/style selection and
existing mobile audio behavior. `free-palette-mix-audit.json` records the new
20-style reference/full-fader dry-mix measurements. Listening preference remains
for the user to assess; no paid-library quality claim is made.
