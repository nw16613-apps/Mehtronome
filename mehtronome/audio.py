"""Sample-clock audio synthesis; independent of the desktop UI."""

from dataclasses import dataclass, replace
import math

import numpy as np


KEYS = ("C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B")
SCALES = {"Major": (0, 2, 4, 5, 7, 9, 11), "Minor": (0, 2, 3, 5, 7, 8, 10)}
SPELLINGS = {
    "Major": ("C D E F G A B", "C♯ D♯ E♯ F♯ G♯ A♯ B♯", "D E F♯ G A B C♯", "E♭ F G A♭ B♭ C D", "E F♯ G♯ A B C♯ D♯", "F G A B♭ C D E", "F♯ G♯ A♯ B C♯ D♯ E♯", "G A B C D E F♯", "A♭ B♭ C D♭ E♭ F G", "A B C♯ D E F♯ G♯", "B♭ C D E♭ F G A", "B C♯ D♯ E F♯ G♯ A♯"),
    "Minor": ("C D E♭ F G A♭ B♭", "C♯ D♯ E F♯ G♯ A B", "D E F G A B♭ C", "E♭ F G♭ A♭ B♭ C♭ D♭", "E F♯ G A B C D", "F G A♭ B♭ C D♭ E♭", "F♯ G♯ A B C♯ D E", "G A B♭ C D E♭ F", "A♭ B♭ C♭ D♭ E♭ F♭ G♭", "A B C D E F G", "B♭ C D♭ E♭ F G♭ A♭", "B C♯ D E F♯ G A"),
}


def scale_notes(key: int, quality: str) -> list[str]:
    return SPELLINGS[quality][key].split()


@dataclass(frozen=True)
class Settings:
    bpm: int = 90
    beats: int = 4
    key: int = 0
    quality: str = "Major"
    click_volume: float = 0.5
    backing_volume: float = 0.35
    count_in: bool = True


class AudioEngine:
    """Both voices use one sample position, including across block boundaries."""

    def __init__(self, sample_rate=48000):
        self.sample_rate = sample_rate
        self.settings = Settings()
        self.reset()

    def configure(self, **changes):
        self.settings = replace(self.settings, **changes)

    def reset(self):
        self.sample = 0
        self.phase_ticks = 0
        self.beat_index = 0
        self.click_age = math.inf
        self.click_frequency = 1500
        self.pending_click = True
        self.chord_phases = np.zeros(3)
        self.backing_age = 0
        self.last_chord = None
        self.count_in_beats = self.settings.beats if self.settings.count_in else 0

    @property
    def beat_phase(self):
        return self.phase_ticks / (60 * self.sample_rate)

    @property
    def counting_in(self):
        return self.beat_index < self.count_in_beats

    def render(self, frames):
        s = self.settings
        rate = self.sample_rate
        period = 60 * rate
        # Beat phase is integrated so tempo changes preserve musical position.
        phase = self.phase_ticks + np.arange(frames, dtype=np.int64) * s.bpm
        crossed = phase // period
        beats = self.beat_index + crossed
        starts = np.flatnonzero(np.r_[self.pending_click, np.diff(crossed) > 0])
        click = np.zeros(frames)
        age = self.click_age
        cursor = 0
        frequency = self.click_frequency
        for boundary in [*starts, frames]:
            length = boundary - cursor
            if length:
                t = (age + np.arange(length)) / rate
                click[cursor:boundary] = np.sin(2 * np.pi * frequency * t) * np.exp(-t * 100) * (t < .06)
                age += length
            if boundary < frames:
                age = 0
                frequency = 1500 if beats[boundary] % s.beats == 0 else 1000
            cursor = boundary
        self.click_age = age
        self.click_frequency = frequency
        # Store the active click pitch even when a callback divides a click.
        advanced, self.phase_ticks = divmod(self.phase_ticks + frames * s.bpm, period)
        self.pending_click = advanced > crossed[-1]
        self.beat_index += advanced

        intervals = (0, 4 if s.quality == "Major" else 3, 7)
        frequencies = 440 * 2 ** ((48 + s.key + np.array(intervals) - 69) / 12)
        chord_id = (s.key, s.quality)
        if chord_id != self.last_chord:
            self.backing_age = 0
            self.last_chord = chord_id
        angles = self.chord_phases[:, None] + 2 * np.pi * frequencies[:, None] * np.arange(frames) / rate
        chord = (np.sin(angles) + .15 * np.sin(2 * angles)).sum(axis=0) / 3.45
        self.chord_phases = (self.chord_phases + 2 * np.pi * frequencies * frames / rate) % (2 * np.pi)
        audible = beats >= self.count_in_beats
        ages = self.backing_age + np.cumsum(audible)
        envelope = np.minimum(ages / (rate * .08), 1) * audible
        self.backing_age = int(ages[-1]) if frames else self.backing_age
        fade = np.minimum((self.sample + np.arange(frames)) / (rate * .005), 1)
        output = (.3 * s.click_volume * click + .4 * s.backing_volume * chord * envelope) * fade
        self.sample += frames
        return output.astype(np.float32)
