# Phrase-based harmonic comping

Normal automatic backing now draws on a chord/mode-aware vocabulary in addition to the existing performance rhythms and instrument recordings. No extra controls or arrangement-loading steps are required.

- Rootless colours and guide-tone shells alternate with more open structures.
- Quartal candidates contain three or four stacked perfect fourths, optionally with a separate guide-tone anchor.
- Pentatonic superimpositions use three notes from a compatible major/minor pentatonic plus a guide tone where needed. A phrase keeps the same source rather than picking a new pentatonic independently at each stroke.
- Triad pairs use two disjoint major/minor triads from the allowed collection. The arranger alternates their members over consecutive eligible attacks. Both must be playable for a pair to be admitted.
- A phrase contour guides the top voice; whole-performance path selection balances that contour with register, common tones and voice leading.
- Four-bar rhythm development displaces selected attacks in non-ostinato, non-sustained parts. Change entries stay in place, and a displaced attack cannot cross to another harmony. Native rhythmic foundations and sustained-swell gestures remain authored.

Jazz/fusion and neo-soul use the wider vocabulary more frequently; traditional jazz mixes it with shells and conventional rootless chords. Blues favours compact shells and pentatonic colour. Other styles use lighter colour, while hard-rock power riffs bypass superimposition. A technique need not occur in every chart: short forms, rests, chord quality, scale and instrument range can rule it out.

All candidates stay in the chart's chord/scale collection, avoid the major-third/natural-eleventh clash, and preserve structural altered fifths. Triad-only charts fall back to their existing identity. Unsupported techniques fall back to ordinary chord voicings. Advanced guitar candidates must fit distinct standard-tuning strings with frets 1–20 and a maximum four-fret stretch. Articulation preserves the selected advanced structure rather than stripping it into a dyad or respreading it into an unplayable grip.

Verification includes all-key harmonic/physical checks, intact quartal/pentatonic/triad-pair structures after articulation and ensemble coordination, actual reference progressions, static vamps, deterministic development, recorded mixes for all 20 styles, and browser verification through the normal style/Play controls.

Validation result: 27 targeted model/audio checks and three browser workflows passed, including recorded mix headroom for all 20 styles. The three older tests in `sparse-comping.test.js` fail identically on the unchanged pre-update commit (checked from an isolated archive of `4138e29`); they assert earlier fallback-pattern behaviour and are not introduced by this change.
