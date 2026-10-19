"""Use QT_QPA_PLATFORM=offscreen when running without a desktop."""

import unittest
from unittest.mock import patch

import numpy as np
from PySide6.QtWidgets import QApplication

from mehtronome.app import Window


class DesktopTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = QApplication.instance() or QApplication([])

    def setUp(self):
        self.window = Window()

    def tearDown(self):
        self.window.close()

    def test_controls_and_audio_lifecycle(self):
        window = self.window
        window.key.setCurrentIndex(5)
        self.assertIn("B♭", window.notes.text())
        window.tempo.setValue(137)
        self.assertEqual(window.engine.settings.bpm, 137)
        with patch("mehtronome.app.sd.OutputStream") as factory:
            window.play.click()
            factory.return_value.start.assert_called_once()
            self.assertEqual(window.play.text(), "Stop")
            self.assertFalse(window.count_in.isEnabled())
            output = np.zeros((512, 1), dtype=np.float32)
            factory.call_args.kwargs["callback"](output, 512, None, False)
            self.assertGreater(np.max(np.abs(output)), 0)
            window.play.click()
            factory.return_value.close.assert_called_once()
            self.assertIsNone(window.stream)
            self.assertTrue(window.count_in.isEnabled())

    def test_device_failure_leaves_app_stopped(self):
        with patch("mehtronome.app.sd.OutputStream", side_effect=RuntimeError("No device")), patch("mehtronome.app.QMessageBox.warning") as warning:
            self.window.play.click()
            warning.assert_called_once()
            self.assertIsNone(self.window.stream)
            self.assertEqual(self.window.play.text(), "Start")
