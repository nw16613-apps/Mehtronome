# Longer-session band development

Normal chart playback now has three ensemble cycles, each containing the existing
Statement, Development, Contrast and Return passes. This gives twelve passes
before the complete arrangement repeats. Short vamps retain a minimum four-bar
pass; long charts use a complete chart cycle per pass.

1. **Opening:** the current melodic/chordal phrases, with bass approaches aimed
   at the actual next chord or written slash bass.
2. **Build:** alternate connected bass routes, occasional phrase-ending pickups,
   different optional drum transitions and a gradual shared lift.
3. **Space and return:** simpler bass movement, fewer optional drum ornaments,
   more gaps in non-ostinato chord/melodic parts during contrast, then a shared
   gradual return to the fuller texture.

Native tumbao anticipations, one-drop placement, clave, swing and compound-metre
foundations remain. Pickups do not get added indiscriminately to those grooves.
New drum fills use section/phrase cues and avoid attacks in the full melodic
line. Cymbals receive no upward session gain. Sustained Harmony, selected sounds,
charts, tempo, mixer and melodic-activity choices retain their current behaviour.
There are no additional user controls.

## Implementation

`session-performance.js` prepares connected bass routes and sparse alternate
event rows on the main thread after the existing harmonic/voicing planner.
Holds are checked against real target changes; anticipated and slash-bass entries
are preserved. Optional extra bass notes are phrase pickups rather than a new
repeated cell on every bar. Cadential approaches may deliberately use chromatic
notes; other new pitches come from the actual chord.

Later-cycle playback selects prepared rows using the absolute musical clock.
Comping/melody gap overrides only omit attacks; they cannot resurrect notes
filtered out by Supporting activity. All four tracks use the same session
envelope. The audio path performs row lookup and scalar gain calculations;
it does not compose, allocate new event arrays or expand twelve full tick grids.
The raw reference scores stay unchanged, including exact written-note playback.

This remains a bounded algorithmic arranger. It does not yet call an external
AI model, infer a musician's intent or generate unlimited new vocabulary.
The next checkpoint is evaluation of an external symbolic-music model, with
generated notes played through the current instruments for a fair comparison.

## Checks

- Audio regression covers all twenty bands across all twelve passes, including
  finite output/headroom, activity, native foundations, slash/anticipated notes,
  cache immutability, callback-block independence and sparse-storage limits.
- A seven-beat selected loop is checked in later cycles.
- Browser checks exercise all twenty styles with ordinary Play controls, prepared
  session payloads, saved chart/mixer choices and mobile audio.
- The [dry mix audit](long-session-mix-audit.json) renders all three cycles for
  twenty styles and eleven kit profiles at 12 kHz, with effects disabled. Its
  test-vamp results are level/headroom evidence, not a claim of subjective
  realism or coverage of every chart and effects configuration.

External-model evaluation follows this checkpoint; no paid service or new sample
library is required for the twelve-pass arrangement.
