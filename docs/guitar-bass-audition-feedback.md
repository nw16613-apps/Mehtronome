# Recording audition feedback and follow-up

User feedback: keep the current FreePats electric-guitar recordings rather than
Shinyguitar. New electric and upright bass candidates were preferred, except
Growlybass's undesirable fret-buzz attacks near the end of the electric-bass clip.
These preferences have not yet been applied as runtime sample replacements.

## Growlybass diagnostic

The eight-bar Funk audition is 104 BPM. Its bass note velocities range from about
0.433 to 0.571. Growlybass selects pp below 61/128 and p below 96/128; f and ff
are never selected in this clip. A blanket high-velocity cap will not solve the
reported problem. The later phrase moves into A2 and C3 source zones.

Analysis of the first 150 ms of the source recordings shows much more energy
above 2.5 kHz relative to 35–2500 Hz in these zones. For example, A2 p takes 1/2
measure about -14/-15.5 dB, compared with Gb2 p take 1 at about -55 dB. This is a
diagnostic difference, not a perceptual fret-buzz detector. A2 pp is similarly
bright; reducing the selected dynamic does not remove that recorded character.
Additional A2 p takes 3/4 and C3 p takes 3/4 also have substantial attack-band
energy (-13 to -14 dB), so merely rotating to those takes is not a demonstrated
fix. No revised clip or repaired bass has been published from this investigation.

## Other electric-guitar candidates

Primary sources checked on 2026-11-09:

| Candidate | Verified source facts | Status for app |
| --- | --- | --- |
| [Karoryfer Emilyguitar](https://shop.karoryfer.com/pages/free-emilyguitar) | Epiphone Emily the Strange, thick flatwound strings; 323 WAV samples, 24-bit/44.1 kHz, 98 MB download. [Repository licence](https://github.com/sfzinstruments/karoryfer.emilyguitar/blob/master/LICENSE) is CC0. | Genuinely different electric guitar; suitable to audition for a rounder tone. No subjective quality improvement established. Exact articulations/dynamics need source-map inspection. |
| [SampleScience Clean Electric Guitar](https://www.samplescience.info/2022/04/clean-electric-guitar.html) | Publisher states that two electric guitars were sampled note by note and explicitly dedicates the samples to the public domain. Plugin is described as an input to amp/effects processing. | Promising additional source; inspect downloadable sample assets and the accompanying terms before adapting. Browser embedding of the plugin itself is not proposed. Dynamic/alternate-take coverage not verified. |
| [Unreal Instruments Standard Guitar](https://unreal-instruments.wixsite.com/unreal-instruments/standard-guitar) | Publisher lists about 2400 DI recordings, humbucker guitar, up to 16 alternates, sustain, mutes, pull-offs, hammer-ons, pick/stop noises. | Strongest articulation candidate on paper. Catalogue lists custom licensing; explicit permission to redistribute/adapt samples inside this app is not verified. Do not treat free music-making use or a third-party public-domain description as embedding permission. |

FreePats Jazz/Distorted FSBS variants are processed versions of the same sampled
guitar family, so they should not be presented as genuinely new recording sessions.
Shinyguitar was already auditioned and was not preferred. Black-and-Green guitar
samples were also used in the app's earlier palette; they are not a new discovery.

Next useful audition is Emilyguitar and the two SampleScience sources against the
preferred current electric guitar, with identical parts and matched loudness.
Standard Guitar remains conditional on the original included licence. No new
guitar source has been downloaded or auditioned in this follow-up yet.

## Further bass alternatives and guitar amplification

The user requested alternatives to Growlybass rather than suppressing its inherent
buzz. Primary publisher pages checked on 2026-11-09:

* [FreePats Bass Guitar YR](https://freepats.zenvoid.org/ElectricGuitar/clean-electric-bass.html):
  Andrea Biasior's Yamaha RBX recordings, separate finger and pick versions, CC0.
  Finger version is the first candidate for a more neutral source. Dynamic/take
  coverage and actual attack cleanliness still need a recording audition.
* [Karoryfer Swagbass](https://shop.karoryfer.com/pages/free-swagbass): active,
  long-scale bass with old flatwound strings; publisher suggests hip-hop, pop and
  R&B. CC0 per the publisher's free-library catalogue. Not the existing app's
  Black-and-Blue bass source. Worth testing for a warmer, less metallic sound.
* [Karoryfer Fashionbass](https://shop.karoryfer.com/pages/free-fashionbass):
  Jazz-style bass with roundwound strings, 426 recordings, extended range.
  CC0 per publisher catalogue. A brighter alternative, not a verified buzz-free
  replacement. Audition the high register explicitly before selection.

Big Little Bass is also CC0, but uses the same hollowbody as the existing
Black-and-Blue set, played high up the neck. Its deliberately unusual thump makes
it a secondary colour rather than the leading general-purpose replacement.
Keep the preferred Sneakybass upright candidate separate from this electric-bass
decision. No new electric bass source has been installed from this shortlist.

[FreePats FSBS Clean documentation](https://freepats.zenvoid.org/ElectricGuitar/clean-electric-guitar.html)
explicitly states its samples were processed through an amplifier and effects
rack. Thus the current app's electric guitar is not simply unamplified DI. The
runtime adds first-order low-pass filtering and per-voice tanh drive; it does not
implement a dedicated complete amp/speaker model. Do not double-amp all current
tones blindly. Shinyguitar pickup auditions used that same existing runtime
processing, not a separately tuned full amp/cab chain.

For new DI sources, compare a suitable clean/edge-of-breakup amp plus speaker
cabinet response and modest EQ using the same source/part. The amp treatment must
be identified separately from the recording-source change, and preserve mobile
performance. Any impulse responses or model weights need their own redistribution
licence. No new amp DSP, IR or sample replacement is implemented in this note.
