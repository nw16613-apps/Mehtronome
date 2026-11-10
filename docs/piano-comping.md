# Acoustic piano comping

The previous arranger stacked phrase, contrast and melody-support reductions. This often selected the quietest piano sample layer, deleted syncopated attacks, reduced Jazz voicings to guide-tone dyads and left alternate contrast bars empty. Short articulations also shared a 35 ms mute with guitar/clav sounds.

Acoustic and soft piano now retain their composed attacks in ensemble coordination and later session variants. Contrast still changes dynamics, register and voicing. Traditional Jazz uses a more active eight-bar comping vocabulary. Other styles retain their own rhythms, including Latin guajeos and Motown figures.

Arranged piano draws three- and four-note voicings from the written chord and scale, including suitable ninth/thirteenth combinations while preserving thirds, sevenths and altered fifths. A changing upper voice balances smooth voice leading against repeatedly selecting the same inversion. Triads and fifth chords keep their original identity. Piano voicings are no longer reduced to two-note shells after selection.

Piano comping sample-layer selection uses `min(.95, .22 + .85 * velocity)`; audible gain still uses the original velocity. This gives soft accompaniment a clear recorded attack without turning every hit into a hard strike. Melody piano retains its existing layer selection. Piano releases are 110 ms for short articulations, 200 ms normally, 320 ms for ringing notes, and 100 ms for retrigger transitions. These are decay time constants, not hard gates. Existing samples, faders and mixer trims are retained. Chords still end at incompatible harmony changes.

Validation covers all-key voicing membership/defining tones, triad and fifth identity, piano rhythm retention across session variants, recorded sample layers and audible release tails, complete all-style mixes, deterministic rendering, and pickup/count-in chart highlighting. Musical preference still needs listening feedback in the preview.

## Melodic movement defaults

Default single-note electric guitars have been replaced with the existing flute recordings (Traditional Jazz, Fusion Jazz, Jazz Waltz, Latin and Modern Straight Jazz), electric tine (Motown, Slow Soul and Boogaloo) or organ (Neo-soul and Second-line). Other non-guitar melody choices, including Legato Fusion's approved flute, remain. Guitar comping is unchanged. Each melodic patch differs from its comping patch; these choices apply on normal style selection, including saved charts and reference studies.
