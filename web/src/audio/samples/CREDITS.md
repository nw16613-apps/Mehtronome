# Recording credits

The drum recordings are released under **Creative Commons Attribution 4.0 International**; the bass recordings are released under **CC0 1.0 Universal**. The complete local license copies are [LICENSE-CC-BY-4.0](LICENSE-CC-BY-4.0) and [LICENSE](LICENSE). Retrieved 2026-10-21.

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
