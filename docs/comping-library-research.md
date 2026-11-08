# Comping library replacement research — 8 November 2026

The current comping sound bank has not been replaced by this research. The user
has requested investigation of higher-quality redistributable and commercial
options. No vendor has been contacted, no quote obtained and no purchase made.

## Candidate sources

| Family | Candidate | Verified scope | Outstanding work |
| --- | --- | --- | --- |
| Acoustic piano | [Salamander Grand Piano](https://github.com/sfzinstruments/SalamanderGrandPiano) | Yamaha C5; many recorded velocity layers. [FreePats description](https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html) documents minor-third sampling, 16 velocities and releases. | Audition a substantial dynamic subset against the actual existing piano; verify pinned licence/version. Do not reduce it to a few single-layer notes. |
| Piano, nylon and steel guitar | [Meta Open Sound](https://github.com/facebookincubator/Meta-open-sound) | Instrument collections explicitly CC0, including modification and app redistribution; design specs and SFZ maps. | Read per-instrument maps, audition representative phrases, measure stereo/mono and mobile loading tradeoffs. |
| Clean electric guitar | [FreePats FSBS clean](https://github.com/freepats/electric-guitar-FSBS-clean) | Separate clean electric-guitar library, CC0. | Verify full map/articulations; compare sustained notes and muted parts at matched loudness with current Black-and-Green recordings. |
| Commercial electric piano | [AcousticSamples VTines MK1](https://www.acousticsamples.net/vtines), VReeds | VTines is a Rhodes sampling/modelling hybrid, with continuous velocity, releases and amp response. | Separate app/embedding agreement and technical delivery required. A desktop UVI product is not a browser sampler package. |
| Commercial organ | [AcousticSamples B-5 Organ V3](https://www.acousticsamples.net/B5) | Hammond B3 product and demos. | Separate licence and compatible engine/data delivery; reproduce rotary/percussion behavior rather than extracting one preset note. |
| Commercial clavinet | [AcousticSamples Clavi D9](https://www.acousticsamples.net/clavid9) | Dedicated clavinet product and demos. | Separate app licence, actual articulations and usable format. |
| Commercial electric guitar | [AcousticSamples Strategy](https://www.acousticsamples.net/strategy) | Stratocaster instrument product and demos. | Separate licence; browser-suitable sustain/mute/release data and amp/cabinet processing. |
| Commercial sound-development partner | [Sonic Reality](https://sonicreality.com/company.php) | Documents instrument-sampling work and partnerships with software/hardware vendors across guitars, keyboards, drums and bass. | Potential bespoke-content enquiry, not a verified off-the-shelf app licence. No price or availability confirmed. |

## Commercial licensing findings

[AcousticSamples terms](https://www.acousticsamples.net/terms_conditions),
sections 4(b), 4(d), 4(e), distinguish musical output from sampled instruments,
playable app sounds and remote rendering services. They invite a separate written
agreement for these uses. Retail licences do not permit extracting/resampling
notes into our app, nor putting the instrument behind a public MIDI-render API.
Their documented separate-agreement route is promising; raw-data availability,
browser compatibility and cost are not confirmed.

[UVI's retail EULA](https://www.uvi.net/index.php/end-user-license-agreement)
prohibits redistributing its sounds as sampler material.
[Sonic Reality's retail EULA](https://sonicreality.com/eula.php) likewise does not
cover computer-game/DLS/multimedia sound-set distribution. Their partnership
history is a reason to enquire, not permission to embed a retail library.

For app-specific negotiation, require permission for: browser delivery/cache of
playable note data; transposition, trimming, resampling and compression;
indefinite arbitrary chord progressions; all users/devices covered by the app;
exports if offered; clear one-off/minimum/per-user fees; and no desktop plug-in
or iLok dependency for end users. Ask separately about streaming rendering if
raw-data delivery is unavailable. Its latency/offline limitations change the
current browser architecture. No vendor messages are authorized by this report.

Commissioning original sampling with explicit app-distribution rights is an
alternative where existing libraries cannot supply an appropriate agreement.
No fee estimate is represented as a vendor quote.

## Audition and implementation acceptance

Use the same actual Blues, Legato Fusion, Bossa, Funk and Jazz progressions,
voicings and dynamics, at matched loudness, with dry and modest-reverb versions.
Compare sources before choosing the replacement palette; paid status alone is
not evidence of improved sound in this app.

Preserve recorded attacks and natural decays; support multiple dynamic layers,
nearby pitch zones, appropriate repeated-note alternatives, muted/sustained
articulations and release behavior. Keep stereo when it contributes materially.
Guitar should use believable note spreads/string choices and amp/cabinet tone;
piano requires release/pedal decisions; organ requires sustained/rotary behavior.
Current sparse zones and shared envelopes can compromise otherwise good sources.

Load only audible instrument families, retain bounded decode concurrency and
caches, and verify first-play/mobile cost and all-style headroom. The app keeps
one curated palette selected by style; this work does not require returning
sound-library comparison controls to the main interface.
