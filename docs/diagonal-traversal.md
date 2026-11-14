# Diagonal string-block traversal

The existing String set selects the playable strings. Diagonal traversal adds
Strings before position change, an integer from one to the selected string
count. It defaults to two and clamps immediately when the string set shrinks.
One-string sets are supported.

Divide the selected strings into consecutive, non-overlapping blocks. Use the
starting position's fingering for the first block, the neighbouring position
higher on the neck for the next block, and so on. Each position supplies its
actual three scale notes per string, or two core arpeggio tones per string.

Complete the applicable musical cells within a block before moving on. Restart
the pattern locally in the incoming block; do not continue an absolute scale
anchor from the outgoing position. Cell advance and internal note order still
apply within each block. Notes cannot cross into unselected strings or leave
the chosen fret range.

Ascending first visits lower-string blocks followed by higher-string blocks.
Descending first retraces the route from its highest-string block. With Follow
traversal, return movement reverses the same physical blocks. Alternating
positions treats the complete diagonal route as one position: ascend through
all its blocks, descend through every block of the next route, then ascend the
next. It does not alternate direction between the blocks within a route. At
the fret-range limit, traversal returns through complete neighbouring routes.
Existing boundary-repeat and early terminal-position turns remain available.
If the block size equals the entire selected string set, diagonal traversal
reduces to horizontal position traversal.

A final shorter block is retained. If a complete pattern cannot fit any block,
the entire route is explicitly unavailable instead of silently skipping that
block, shortening a pattern, or showing a playable all-rest score. Selecting a
larger block size or smaller pattern can make it available.

The full map previews each route as the union of its shifted blocks, marks the
blocks with numbers, and highlights the active block during playback. Highlight
route selects the starting route. Fretboard and Exercise controls share state;
snapshots and favourites retain the block size. A changed harmony keeps the
current block and maps the chosen start to the nearest available fret region.

Validation covers physical coordinates, exact local patterns, both directions,
bar splits, changing harmony, unavailable partial blocks, saved settings, shared
controls and live map highlighting.

## Later work

Build an organised, named library on top of exercise favourites for quick
practice recall. Preserve pattern, fingering and traversal settings and apply
them to the current chart. This update retains the existing favourites mechanism;
it does not add the larger library interface.
