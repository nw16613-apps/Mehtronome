# Current workspace cleanup

This pass prioritises clear controls and accurate guidance in the existing six workspaces.

- Sound Settings contains the click sound, one backing-style choice, a description of each part with its mixer status, and evolving chord extensions. Backing settings now come directly from the selected arrangement rather than being written into an invisible instrument form.
- The mixer owns instrument levels, mute and solo. Old exported setup controls remain accepted for migration to the closest backing style. New setups save the backing style and current controls without reconstructing retired sound controls.
- Harmony uses one chord sheet. The old hidden progression strip and draggable timeline are removed. Chart key and selected chord root have distinct explanations, and copy/edit feedback uses a visible status region.
- Fretboard and Exercises retain shared CAGED choices, current notation, voicing references, overlays and playback. Guided-session and inversion instructions describe the actual available options.
- Progress remains a manual checklist with saved setups; its descriptions refer to chord qualities rather than claiming per-voicing assessment.
- The theme gallery uses palette samples rather than old application screenshots. Historical public design galleries are no longer deployed. Their originals remain in Git history.
- Removed Ambient space channel metadata and unused styling for retired interfaces are removed. Source archives and saved-data migrations are retained where removal would not improve the current interface or would need separate compatibility work.

Validation covers all six pages at desktop/phone widths; chart generator and repeat bars; manual CAGED routes and legacy saved setups; style changes reaching the real audio worklet and exercise backing; visible copy fallback; theme selection; send controls and isolated FX buses. Audio-engine calibration tests and the TypeScript/Vite build also pass. These checks do not establish physical-device listening quality or the status of historical browser suites for removed features.
