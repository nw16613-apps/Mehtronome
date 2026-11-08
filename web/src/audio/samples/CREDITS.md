> Current kit assignments: DRSKit for pop/rock, blues, fusion jazz, Motown, funk, second-line, reggae, boogaloo, hard rock and legato fusion; Virtuosity for the other styles, plus VCSL Latin percussion. Earlier replacement sections below record processing history, not current assignments.

# Recording credits

The Wilkinson drum recordings are released under **Creative Commons Attribution 4.0 International**; the Virtuosity jazz drums, Big Rusty studio drums and bass recordings are released under **CC0 1.0 Universal**. The complete local license copies are [LICENSE-CC-BY-4.0](LICENSE-CC-BY-4.0) and [LICENSE](LICENSE). Retrieved 2026-10-21.

## Tight acoustic drums

[Wilkinson Audio Naked Drums](https://github.com/sfzinstruments/WilkinsonAudio.NakedDrums) is a multi-microphone Yamaha Recording Custom kit with Ayotte and Pearl snares, Sabian/Zildjian cymbals, vintage Neve 1073/1081, BAE 1073 and API 512 preamps, and Apogee converters. The upstream [README](https://github.com/sfzinstruments/WilkinsonAudio.NakedDrums/blob/master/README.md) documents the instruments, microphones and recording chain; its [license](https://github.com/sfzinstruments/WilkinsonAudio.NakedDrums/blob/master/LICENSE) is CC BY 4.0.

Source revision: `407732a548606ac715ad8f3fbac63d9f4df77c0d`.

Mehtronome uses direct close microphones for kick, snare, toms, hats and ride. Only the pedal hat and crash use the overhead channel. The selected recordings include separate round robins and dedicated low-velocity snare hits. This creates a drier, faster fusion/rock response while keeping each hit acoustic.

| Local WAVs | Upstream source group | Microphone | Finished tail |
| --- | --- | --- | --- |
| `kick.wav`, `kick2.wav` | `-Bottom_Black_D2_50` | kick in | 0.72 s |
| `snare.wav`–`snare3.wav` | `-TopOne_Black_D2_50` | snare top | 0.82 s |
| `snareGhost.wav`, `snareGhost2.wav` | `-TopOne_Black_D2_10` | snare top, low velocity | 0.55 s |
| `hat.wav`–`hat3.wav` | `HatMic_A2_30` | hat direct | 0.28 s |
| `hatOpen.wav`, `hatOpen2.wav` | `HatMic_F2_30` | hat direct | 1.25 s |
| `hatPedal.wav`, `hatPedal2.wav` | `OH_E2_10` | overhead | 0.45 s |
| `ride.wav`, `ride2.wav` | `RideMic_D3_30` | ride direct | 3.40 s |
| `rideBell.wav` | `RideMic_E3_10` | ride direct | 2.60 s |
| `rim.wav`, `rim2.wav` | `TopOne_Black_D2_50` side-stick | snare top | 0.48 s |
| `tomHigh.wav`, `tomHigh2.wav` | `-TopOne_D3_30`, 10-inch tom | tom direct | 0.95 s |
| `tomLow.wav`, `tomLow2.wav` | `-TopOne_D3_30`, 16-inch tom | tom direct | 1.15 s |
| `crash.wav` | `OH_D3_30` | overhead | 3.50 s |

Exact upstream filenames, microphone labels, durations, byte sizes and SHA-256 hashes are recorded in [sources.json](sources.json).

## Fingerstyle electric bass

[Black And Blue Basses](https://github.com/sfzinstruments/karoryfer.black-and-blue-basses), **Karoryfer Samples / D. Smolken**. The Darkblack bass is a **Washburn AB-95**, played with fingers and recorded through its neck pickup. The upstream [user guide](https://github.com/sfzinstruments/karoryfer.black-and-blue-basses/blob/main/Black_And_Blue_Basses_user_guide.pdf) describes the instrument and sampling; its [license](https://github.com/sfzinstruments/karoryfer.black-and-blue-basses/blob/main/license) is CC0.

Source revision: `6e7d674cdb41be7a54dbccb15472401ad01099b9`.

These are the warm `mp` plucks, with two independent round robins at each pitch. The source uses written bass pitch names and SFZ key centres an octave above the sounding note. Mehtronome zones identify the actual sounding MIDI pitch, so `darkblack_e2` is the fundamental E1 / MIDI 28.

| Local WAV | Sounding MIDI root | Upstream recording |
| --- | --- | --- |
| `bass28.wav` / `bass28b.wav` | 28 | `darkblack_e2_mp_rr1/rr2.wav` |
| `bass33.wav` / `bass33b.wav` | 33 | `darkblack_a2_mp_rr1/rr2.wav` |
| `bass38.wav` / `bass38b.wav` | 38 | `darkblack_d3_mp_rr1/rr2.wav` |
| `bass43.wav` / `bass43b.wav` | 43 | `darkblack_g3_mp_rr1/rr2.wav` |
| `bass48.wav` / `bass48b.wav` | 48 | `darkblack_c4_mp_rr1/rr2.wav` |
| `bass52.wav` / `bass52b.wav` | 52 | `darkblack_e4_mp_rr1/rr2.wav` |

## Derivative processing

The recordings were converted from lossless FLAC/WAV using FFmpeg. All bundled files are mono, 32,000 Hz, signed 16-bit PCM WAV and peak-normalized near 0.85.

The drum shells use gentle high/low-pass filtering and small body/attack EQ moves. Tails are shortened with smooth fades: kick and snare end within 0.82 seconds, closed hats within 0.28 seconds, and toms within 1.15 seconds. Direct ride/open-hat tails remain long enough to sound acoustic and are still choked by the playback engine. No timing randomization, synthesized transient or runtime gate is applied.

Bass plucks retain the previous 24 Hz high-pass / 7.5 kHz low-pass processing and 3.2-second tail. Small fixed playback-rate corrections bring the measured fundamentals to concert pitch; [sources.json](sources.json) records every correction.

## Genre instrument banks

Piano and guitar: Nicolas Brosowsky / Tone.js instruments (CC BY 3.0), originally Versilian Studios, Karoryfer, and quartertone respectively. Upright bass: Meatbass / Karoryfer Samples / Drogomir Smolken, recorded by Ludwik Zamenhof (CC0). Tambourine: VSCO 2 CE / Versilian Studios / Sam Gossner (CC0). Shipped attribution: web/public/audio-credits.html. Exact source paths, pinned revisions, pitch centres, format and hashes: [band/sources.json](band/sources.json). Derivatives are trimmed, filtered, normalized and faded mono 32 kHz 16-bit WAV.

### Soft upright bass replacement

[Meatbass](https://github.com/sfzinstruments/karoryfer.meatbass/tree/ac9e859564bda286ab5ec672d00ff1aa2fef2895) replaces the previous VSCO contrabass bank. It is a 1958 Otto Rubner double bass played by Drogomir Smolken and recorded by Ludwik Zamenhof, copyright 2016 Karoryfer Lecolds, released under [CC0](https://github.com/sfzinstruments/karoryfer.meatbass/blob/ac9e859564bda286ab5ec672d00ff1aa2fef2895/LICENSE). Only softest-velocity, single-pluck samples are used; no layered, detuned or multi-voice SFZ programs. Source pitches C2, E-flat2, A2, C3 and G-flat3 map to sounding MIDI 36, 39, 45, 48 and 54. These soft plucks were selected for a dominant fundamental. Pitch corrections, a 20 Hz high-pass and a gentle two-pole low-pass at three times each fundamental are applied offline, along with 1 ms/50 ms edge fades. No added oscillators or real-time effects are used. This also replaces the low sample whose upper harmonics dominated its fundamental. The existing electric bass is unchanged.

## Club jazz drum bank

[Virtuosity Drums](https://github.com/sfzinstruments/virtuosity_drums/tree/9f04cf9a734527edfbb0a4eee1f674e45bbf71bc), Versilian Studios with Karoryfer Samples, performed by Austin McMahon at Virtuosity Musical Instruments, Boston. CC0 1.0; pinned revision `9f04cf9a734527edfbb0a4eee1f674e45bbf71bc`. The complete licence is in `jazz/LICENSE`; source paths, source and derivative SHA-256 hashes, and durations are in `jazz/sources.json`.

38 selected acoustic recordings: light and medium kicks, three snare dynamic ranges, overhead rides/flat ride, hats, cross-stick, toms and a soft crash. These are stick recordings, not brushes. `web/scripts/prepare-jazz-drums.py` reproduces the mono 32 kHz PCM16 derivatives with FFmpeg: gentle high/low-pass, leading silence trimmed, peak normalization and edge fades. The existing Wilkinson bank remains for louder styles. New hits receive bounded sample-clock onset delays and touch variations; the exact metronome remains independent.

## Warm studio drum replacement (superseded)

[Big Rusty Drums](https://github.com/sfzinstruments/karoryfer.big-rusty-drums/tree/f07ce00df34a46b6b08375be56fe116cf15782bc), Karoryfer Samples, CC0 1.0. Pinned revision `f07ce00df34a46b6b08375be56fe116cf15782bc`. Full licence: `studio/LICENSE`. Source filenames, original/derivative SHA-256 and processing: `studio/sources.json`.

32 moderate-strength, close-microphone recordings replace Wilkinson for pop/rock, blues, fusion jazz and Motown only. Kick/snare have quieter dynamic layers and multiple takes; cymbals, hats, toms and cross-stick also alternate takes. `web/scripts/prepare-studio-drums.py` reproduces the 1.91 MiB mono 32 kHz PCM16 bank with FFmpeg: gentle high-pass/12.5 kHz low-pass, leading silence removal, normalization and fades. Funk retains Wilkinson; the other existing kit assignments remain unchanged.

## Modern tight bank (superseded)

At this historical checkpoint, pop/rock, blues, fusion jazz, Motown **and funk** profiles used `modern/`, 32 newly processed one-shots (0.69 MiB) derived from the CC0 Big Rusty takes above. `web/scripts/prepare-modern-drums.py` reproduces them from the retained `studio/` source WAVs without downloading anything. `modern/sources.json` records both upstream and source-derivative hashes, filtering, pitch ratios, decay times and output hashes; `modern/LICENSE` retains CC0.

This is an editorial sound-design pass, not a different recording session: short smooth envelopes remove ringing, surgical EQ reduces boxy low-mid content, snare/toms are tuned up, soft saturation firms the attack, and original synthesized kick/snare body layers reinforce the recorded hits. Closed hats end within 120 ms, kick within 240 ms, snare within 180 ms; most energy decays much earlier. Prior studio and Wilkinson recordings remain in source for reproducibility/compatibility but are not selected by any of these five styles.

## Live-fusion acoustic replacement

Current pop/rock, blues, fusion jazz, Motown and funk use [DRSKit v1.0](https://github.com/sfzinstruments/DrumGizmo.DRSKit/tree/b01448990a31f722542f1812e56159a97a6a2a82), by Lars Muldjord / Bent Bisballe Nyeng (DrumGizmo) and Jes Eiler / DRSDrums, SFZ/FLAC port by kinwie. CC BY 4.0; full licence in `live/LICENSE`. Original source/microphone paths, weights and SHA-256 hashes, source revision and derivative hashes are in `live/sources.json`.

`web/scripts/prepare-live-drums.py` reproduces 32 mono 32 kHz PCM16 derivatives (1.97 MiB). It selects distinct real velocity layers and takes, mixes kick microphones and some cymbal overheads, applies gentle high/low-pass, trims leading silence and applies edge fades/normalization. Source tuning and natural decay remain, with no synthesized kick/snare layers or exponential gating. The user’s Snarky Puppy reference guided the live-fusion direction; these are DRSKit recordings, not samples from that artist or an official artist kit. The earlier beats, fills, FX settings and mobile audio optimisations are unchanged.

### Kick-only refinement

The five live kick takes now receive a 44 Hz high-pass, a 4 dB cut at 85 Hz and a smooth release from 55 to 235 ms. Peak normalization retains attack level. Other live samples are byte-for-byte unchanged. `prepare-live-drums.py` reproduces this treatment; source/derivative hashes and filter details remain in `live/sources.json`.

## Acoustic Latin percussion

[Versilian Community Sample Library](https://github.com/sgossner/VCSL/tree/c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e), Sam Gossner / Versilian Studios and contributors, **CC0 1.0 Universal**. Sixteen acoustic recordings: claves, open and fully muted congas, open tumba, cowbell, short/long güiro and alternating shaker strokes. No drum-kit snare or tom substitutes are used for these parts.

Selected hits are downmixed to mono 32 kHz PCM16, gently filtered, trimmed and normalized with short edge fades. See [latin/LICENSE](latin/LICENSE) and [latin/sources.json](latin/sources.json) for the complete licence, original filenames, pinned revision and original/derivative hashes. `web/scripts/prepare-latin-percussion.py` reproduces the bank. Melodic movement shares the existing credited guitar/piano recordings or synthesized electric-key voices.

## Optional expanded recordings

The selectable Expanded recordings library adds 126 recorded notes/hits
(22.40 MiB mono 32 kHz PCM16) using pinned, redistributable sources. Existing
recordings remain selectable through Original sounds. Exact source and
recording hashes, measured/source-mapped pitch centres, layers, durations and
transformations: [expanded/sources.json](expanded/sources.json).

- Karoryfer Samples / D. Smolken, Black And Green Guitars, CC0,
  `b3b3249d37dc977a1a297bd2dc053e6d9b6b805c`: 36 green-guitar sustained
  recordings (nine pitches, two dynamic layers, two takes) and ten separate
  staccato recordings (five pitches, two takes).
- Karoryfer Samples / D. Smolken, Black And Blue Basses, CC0, original revision
  above: 24 soft/strong takes. Original medium-soft plucks supply the middle
  dynamic level. Each take retains its own measured pitch correction.
- Tone.js instruments / Nicolas Brosowsky, CC BY 3.0, original revision above:
  eight additional piano pitches, six nylon-guitar pitches and seven acoustic
  flute notes. Repository code is MIT; the samples are CC BY 3.0 as stated in
  its README. `tone-SAMPLES-NOTICE.txt` distinguishes these licences.
- Greg Sullivan, E-Pianos, mapped by kinwie, CC BY 3.0,
  `8c3e581acda3594b553948ff0222d4f84a698376`: fourteen Wurlitzer EP200 soft
  and strong recordings. Source SFZ pitch centres and tuning are retained.
  These are reed-piano recordings, not Rhodes samples.
- VCSL / Sam Gossner / Versilian Studios and contributors, CC0, original
  revision above: twelve Yamaha TX81Z Clavisynth notes in two velocity layers.
  This is a sampled clav-style synthesizer, not an acoustic Clavinet.
- Meatbass, attribution/revision above: five independent second takes of
  the existing soft upright plucks, with the same fundamental-focused filter.
- DRSKit, attribution/revision above: two soft closed-hat and two soft ride
  takes. Existing kit tuning, tightened kick treatment and cymbal trims remain.

Full source licences are bundled in `expanded/*-LICENSE.txt`. Source attribution
and derivative processing are also included on `/audio-credits.html`. The
expanded nine-drawbar organ, modeled guitar lead and harmony pad remain
synthesized. No third-party sample downloads or generation service run during
playback; only the chosen audible banks are fetched from this app.

Clavisynth source names and its documented octave-up patch produce sounding pitches two octaves above scientific filename pitch. The importer selects source notes two octaves lower and verifies their sounding fundamentals, so the requested MIDI register is preserved.

## Selectable Tama acoustic kit and additional live dynamics

[MuldjordKit](https://github.com/sfzinstruments/DrumGizmo.MuldjordKit/tree/fc165714974aa843125ce88597f341b31376e1d5), Lars Muldjord / DrumGizmo; SFZ/FLAC port by kinwie, CC BY 4.0. Tama Superstar acoustic kit recorded in 2010. Forty real hits supply kick (three strengths), snare (four strengths), hats/ride (three strengths), toms (two strengths), open hats, bell and crash, with independent takes. DRSKit pedal hats and Virtuosity cross-sticks retain their original credits and complete the kit.

Eighteen further DRSKit recordings add kick ghost/accent, snare mid/accent,
hat accent, soft toms, bell and crash. Attribution and pinned DRS source remain
as above. `tama/sources.json` records exact source/derivative hashes, source
revisions, microphone choices and processing; full CC BY 4.0 licences are in
`tama/*-LICENSE.txt`. `prepare-tama-drums.py` reproduces the 58 mono 32 kHz
PCM16 recordings (3.47 MiB), keeping the tightened kick release and natural
acoustic tuning. Group data are separated from asset URLs for AudioWorklet
compatibility. No artist recordings are sampled.

## Sonor Force 3001 replacement fusion kit

Sam Greene, Sonor Force 3001; SFZ/FLAC mapping and conversion by kinwie.
Source: https://github.com/sfzinstruments/SamsSonor/tree/ef3e32058924ed1c3335e86d03094d3f310a9104
Original and modified recordings: CC BY-SA 4.0. Full licence and per-file source
and derivative hashes are in `sonor/LICENSE` and `sonor/sources.json`.
45 selected original velocity/left-right-hand articulations. Derivatives are
mono 32 kHz PCM16 with onset trim, gentle filtering/low-mid cuts, normalization,
edge fades and shortened kick-only decay. Derived WAVs retain CC BY-SA 4.0.
Used for Fusion jazz and Legato fusion. No DRS recordings complete this bank.

## Free comping and melodic palette (studio-instruments)

All 244 bundled derivatives are usable without purchases. Exact source paths,
pinned revisions, original and derivative SHA-256 hashes and mapping information
are in `studio-instruments/sources.json`. Full licences/attribution records are
retained in that directory. Preparation downmixes to mono 32 kHz PCM16, removes
DC, trims leading silence except looped organ sources, normalizes peaks and adds
short edge fades. Recorded decays are retained up to each documented crop length.

- Meta Open Sound, Meta Creative Audio team: acoustic upright piano (four real
  dynamic layers) and nylon guitar (fingerstyle and two picked strengths).
  https://github.com/facebookincubator/Meta-open-sound/tree/251c0be57d5d1b3242b91f53e0cde62ab1cb42d9
  CC0 1.0. These derivatives use the official mono OGG web recordings, not the
  large stereo lossless WAV releases. Piano is a recorded upright, not a grand.
- Electric Guitar FSBS clean, FreePats contributors:
  https://github.com/freepats/electric-guitar-FSBS-clean/tree/192cf0d9bf2c4ba6ead8e3524ba3f78818e4fe91
  CC0 1.0. Original FLAC soft/normal layers with alternate recorded takes.
- Ixox Flute, Xavier Hosxe; SFZ/FLAC mapping by kinwie:
  https://github.com/sfzinstruments/Ixox.Flute/tree/0cc54468bb0d2d9b32921958585caad65ba8df21
  CC BY 4.0. Original FLAC recordings in three normal-note dynamics, tuning from
  the source map. Modified as described above; playback crossfades connected notes.
- Drawbar Organ Emulation, Roberto / FreePats, generated with setBfree:
  https://freepats.zenvoid.org/Organ/electric-organ.html
  CC0 1.0. WAV source mirror with original sustain-loop points:
  https://github.com/adewale/keyboardia/tree/90ecc152330cabc33060788f14c67795307d4bba/app/public/instruments/hammond-organ
  This is sampled organ-model output, not a newly recorded physical Hammond.
- Wurlitzer EP200, Greg Sullivan; SFZ mapping by kinwie:
  https://github.com/sfzinstruments/GregSullivan.E-Pianos/tree/8c3e581acda3594b553948ff0222d4f84a698376
  CC BY 3.0. Four recorded dynamics and source-mapped tuning, replacing the
  previous two-layer subset. Same recording session, expanded coverage.
- VCSL Clavisynth TX81Z patch, Sam Gossner / Versilian Studios and contributors:
  https://github.com/sgossner/VCSL/tree/c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e
  CC0 1.0. Three recorded FM-patch dynamics, including the formerly missing
  middle layer; this is not a sampled acoustic Hohner Clavinet.

Both comping and melodic tracks use this palette automatically by style.
Bass, drums and the independent fretboard/exercise guitar retain their sources.
