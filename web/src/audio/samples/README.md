# Bundled drum recordings

CC0 1.0 public-domain samples from [kringel-samples](https://github.com/Gradigang-Solutions/kringel-samples), retrieved 2026-10-20.
The upstream [credits](CREDITS.md) preserve original creators and Freesound links; [LICENSE](LICENSE) contains the CC0 dedication.

| Local file | Upstream file | Original source |
| --- | --- | --- |
| kick.wav | SonicPiAcoustic/bd.flac | Zajo, drum_heavy_kick / Freesound 4832 |
| snare.wav | SonicPiAcoustic/sd.flac | menegass, drum_snare_hard / 100058 |
| hat.wav | SonicPiAcoustic/hh.flac | menegass, drum_cymbal_closed / 100053 |
| ride.wav | SonicPiAcoustic/rd.flac | trivialAccapella, ride_via / 425448 |
| rim.wav | Fischer808/rim.wav | tidalcycles/sounds-tr808-fischer, rs8/RS.WAV |

Converted with FFmpeg to mono, 24 kHz, 16-bit PCM WAV for broad browser support and small downloads. Capped at two seconds with a 200 ms end fade for longer sounds. The browser resamples to its AudioContext rate and peak-normalizes to 0.85 before passing PCM to the worklet. Decoding/fetching happens before playback; hits never fetch or decode audio. Bass remains a lightweight synthesized instrument, with style-specific envelopes.
