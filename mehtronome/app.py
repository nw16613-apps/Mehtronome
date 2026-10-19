"""Qt desktop interface and PortAudio stream lifecycle."""

import sys

import sounddevice as sd
from PySide6.QtCore import Qt, QTimer
from PySide6.QtWidgets import (
    QApplication, QCheckBox, QComboBox, QFormLayout, QHBoxLayout, QLabel,
    QMainWindow, QMessageBox, QPushButton, QSlider, QSpinBox, QVBoxLayout, QWidget,
)

from .audio import AudioEngine, KEYS, scale_notes


class Window(QMainWindow):
    def __init__(self):
        super().__init__()
        self.engine = AudioEngine()
        self.stream = None
        self.audio_warning = False
        self.setWindowTitle("Mehtronome")
        self.setMinimumWidth(460)
        container = QWidget()
        self.setCentralWidget(container)
        layout = QVBoxLayout(container)
        title = QLabel("Mehtronome")
        title.setStyleSheet("font-size: 28px; font-weight: bold;")
        layout.addWidget(title)
        layout.addWidget(QLabel("Hear your scales against harmony."))
        form = QFormLayout()
        layout.addLayout(form)
        self.tempo = QSpinBox()
        self.tempo.setRange(30, 240)
        self.tempo.setValue(90)
        self.tempo.setSuffix(" BPM")
        form.addRow("Tempo", self.tempo)
        self.meter = QSpinBox()
        self.meter.setRange(1, 12)
        self.meter.setValue(4)
        form.addRow("Beats per bar (quarter notes)", self.meter)
        self.key = QComboBox()
        self.key.addItems(KEYS)
        form.addRow("Key", self.key)
        self.quality = QComboBox()
        self.quality.addItems(["Major", "Minor"])
        form.addRow("Scale / pedal chord", self.quality)
        self.count_in = QCheckBox("One-bar count-in")
        self.count_in.setChecked(True)
        form.addRow(self.count_in)
        for label, field, value in [("Click volume", "click", 50), ("Harmony volume", "backing", 35)]:
            slider = QSlider(Qt.Orientation.Horizontal)
            slider.setRange(0, 100)
            slider.setValue(value)
            slider.setAccessibleName(label)
            setattr(self, field, slider)
            form.addRow(label, slider)
            slider.valueChanged.connect(self.update_settings)
        self.notes = QLabel()
        self.notes.setWordWrap(True)
        layout.addWidget(self.notes)
        self.status = QLabel("Stopped")
        layout.addWidget(self.status)
        buttons = QHBoxLayout()
        self.play = QPushButton("Start")
        self.play.clicked.connect(self.toggle)
        buttons.addWidget(self.play)
        layout.addLayout(buttons)
        for control in (self.tempo, self.meter):
            control.valueChanged.connect(self.update_settings)
        for control in (self.key, self.quality):
            control.currentIndexChanged.connect(self.update_settings)
        self.count_in.toggled.connect(self.update_settings)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.refresh_status)
        self.timer.start(80)
        self.update_settings()

    def update_settings(self, *_):
        self.engine.configure(
            bpm=self.tempo.value(), beats=self.meter.value(), key=self.key.currentIndex(),
            quality=self.quality.currentText(), click_volume=self.click.value() / 100,
            backing_volume=self.backing.value() / 100, count_in=self.count_in.isChecked(),
        )
        notes = scale_notes(self.key.currentIndex(), self.quality.currentText())
        chord = " · ".join(notes[i] for i in (0, 2, 4))
        label = "Major" if self.quality.currentText() == "Major" else "Natural minor"
        self.notes.setText(f"{label} scale: {' · '.join(notes)}\nPedal chord: {chord}")

    def callback(self, outdata, frames, _time, status):
        if status:
            self.audio_warning = True
        outdata[:, 0] = self.engine.render(frames)

    def toggle(self):
        if self.stream is not None:
            self.stop()
            return
        try:
            self.engine.reset()
            self.audio_warning = False
            self.stream = sd.OutputStream(samplerate=self.engine.sample_rate, channels=1,
                                          dtype="float32", callback=self.callback, latency="high")
            self.stream.start()
        except Exception as exc:
            self.stop()
            QMessageBox.warning(self, "Audio unavailable", f"Could not start audio. Check your macOS sound output device.\n\n{exc}")
            return
        self.play.setText("Stop")
        self.meter.setEnabled(False)
        self.count_in.setEnabled(False)

    def stop(self):
        if self.stream is not None:
            self.stream.close()
            self.stream = None
        self.play.setText("Start")
        self.meter.setEnabled(True)
        self.count_in.setEnabled(True)
        self.status.setText("Stopped")

    def refresh_status(self):
        if self.stream is None:
            return
        if not self.stream.active:
            self.stop()
            QMessageBox.warning(self, "Audio stopped", "Playback stopped unexpectedly. Check your sound output and restart.")
            return
        prefix = "Count-in" if self.engine.counting_in else "Playing"
        warning = " · Audio underrun: try closing other audio apps" if self.audio_warning else ""
        self.status.setText(f"{prefix} · Beat {self.engine.beat_index % self.engine.settings.beats + 1}{warning}")

    def closeEvent(self, event):
        self.stop()
        event.accept()


def main():
    app = QApplication(sys.argv)
    window = Window()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
