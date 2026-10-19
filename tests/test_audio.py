import unittest

import numpy as np

from mehtronome.audio import AudioEngine, scale_notes


class AudioTests(unittest.TestCase):
    def test_callback_boundaries_do_not_change_audio(self):
        for bpm in (90, 137, 240):
            with self.subTest(bpm=bpm):
                whole = AudioEngine()
                blocks = AudioEngine()
                whole.configure(bpm=bpm)
                blocks.configure(bpm=bpm)
                expected = whole.render(150000)
                actual = np.concatenate([blocks.render(256) for _ in range(585)] + [blocks.render(240)])
                np.testing.assert_allclose(actual, expected, atol=1e-6)

    def test_clicks_follow_tempo_and_accent_first_beat(self):
        engine = AudioEngine()
        engine.configure(bpm=120, backing_volume=0)
        output = engine.render(120000)
        for beat in range(1, 5):
            start = beat * 24000
            self.assertGreater(np.max(np.abs(output[start:start + 2400])), .05)
            self.assertEqual(np.max(np.abs(output[start - 3000:start])), 0)
        self.assertEqual(engine.beat_index, 5)

    def test_backing_waits_for_count_in(self):
        engine = AudioEngine()
        engine.configure(bpm=120, click_volume=0)
        output = engine.render(120000)
        self.assertTrue(np.all(output[:96000] == 0))
        self.assertGreater(np.max(np.abs(output[97000:])), .01)

    def test_chord_has_expected_frequencies_and_bounded_output(self):
        engine = AudioEngine()
        engine.configure(count_in=False, click_volume=0, backing_volume=1)
        engine.reset()
        output = engine.render(96000)[48000:]
        spectrum = np.abs(np.fft.rfft(output))
        for frequency in (130.813, 164.814, 195.998):
            self.assertGreater(spectrum[round(frequency)], 1000)
        self.assertTrue(np.isfinite(output).all())
        self.assertLessEqual(np.max(np.abs(output)), 1)

    def test_note_spelling(self):
        self.assertEqual(scale_notes(5, "Major"), ["F", "G", "A", "B♭", "C", "D", "E"])
        self.assertEqual(scale_notes(9, "Minor"), ["A", "B", "C", "D", "E", "F", "G"])

    def test_reset_and_tempo_change(self):
        engine = AudioEngine()
        engine.render(16000)
        phase = engine.beat_phase
        engine.configure(bpm=120)
        engine.render(12000)
        self.assertAlmostEqual(engine.beat_phase, (phase + .5) % 1)
        engine.reset()
        self.assertEqual(engine.sample, 0)
        self.assertEqual(engine.beat_index, 0)


if __name__ == "__main__":
    unittest.main()
