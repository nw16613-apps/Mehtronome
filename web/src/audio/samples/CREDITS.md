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

## Warm studio drum replacement

[Big Rusty Drums](https://github.com/sfzinstruments/karoryfer.big-rusty-drums/tree/f07ce00df34a46b6b08375be56fe116cf15782bc), Karoryfer Samples, CC0 1.0. Pinned revision `f07ce00df34a46b6b08375be56fe116cf15782bc`. Full licence: `studio/LICENSE`. Source filenames, original/derivative SHA-256 and processing: `studio/sources.json`.

32 moderate-strength, close-microphone recordings replace Wilkinson for pop/rock, blues, fusion jazz and Motown only. Kick/snare have quieter dynamic layers and multiple takes; cymbals, hats, toms and cross-stick also alternate takes. `web/scripts/prepare-studio-drums.py` reproduces the 1.91 MiB mono 32 kHz PCM16 bank with FFmpeg: gentle high-pass/12.5 kHz low-pass, leading silence removal, normalization and fades. Funk retains Wilkinson; the other existing kit assignments remain unchanged.

## Modern tight bank

The current pop/rock, blues, fusion jazz, Motown **and funk** profiles use `modern/`, 32 newly processed one-shots (0.69 MiB) derived from the CC0 Big Rusty takes above. `web/scripts/prepare-modern-drums.py` reproduces them from the retained `studio/` source WAVs without downloading anything. `modern/sources.json` records both upstream and source-derivative hashes, filtering, pitch ratios, decay times and output hashes; `modern/LICENSE` retains CC0.

This is an editorial sound-design pass, not a different recording session: short smooth envelopes remove ringing, surgical EQ reduces boxy low-mid content, snare/toms are tuned up, soft saturation firms the attack, and original synthesized kick/snare body layers reinforce the recorded hits. Closed hats end within 120 ms, kick within 240 ms, snare within 180 ms; most energy decays much earlier. Prior studio and Wilkinson recordings remain in source for reproducibility/compatibility but are not selected by any of these five styles.
