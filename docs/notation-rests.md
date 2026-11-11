# Font-independent exercise rests

Both duration-aligned progression notation and legacy exercise notation draw whole, half, quarter, eighth and sixteenth rests as SVG shapes. They no longer rely on optional Unicode music glyphs from Bravura/Noto Music, which displayed as empty squares on some devices.

Duration metadata and accessible labels remain on each rest. Dots, subdivision timing, notation/TAB visibility and SVG exports use the same renderer. Legacy ending rests now also follow the selected subdivision rather than always drawing an eighth rest.
