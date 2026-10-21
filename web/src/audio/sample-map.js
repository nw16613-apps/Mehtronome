// Pure metadata shared with the audio worklet, where URL is unavailable.
export const DRUM_SAMPLE_GROUPS = {
  "kick": [
    "kick",
    "kick2"
  ],
  "snare": [
    "snare",
    "snare2",
    "snare3"
  ],
  "snareGhost": [
    "snareGhost",
    "snareGhost2"
  ],
  "hat": [
    "hat",
    "hat2",
    "hat3"
  ],
  "hatOpen": [
    "hatOpen",
    "hatOpen2"
  ],
  "hatPedal": [
    "hatPedal",
    "hatPedal2"
  ],
  "ride": [
    "ride",
    "ride2"
  ],
  "rideBell": [
    "rideBell"
  ],
  "rim": [
    "rim",
    "rim2"
  ],
  "tomLow": [
    "tomLow",
    "tomLow2"
  ],
  "tomHigh": [
    "tomHigh",
    "tomHigh2"
  ],
  "crash": [
    "crash"
  ]
};

// The library names bass notes an octave above their sounding pitch.
// These zones use the measured sounding MIDI note, without an octave offset.
export const BASS_SAMPLE_ZONES = [
  {id:'bass28',rootMidi:28},
  {id:'bass28b',rootMidi:28},
  {id:'bass33',rootMidi:33},
  {id:'bass33b',rootMidi:33},
  {id:'bass38',rootMidi:38},
  {id:'bass38b',rootMidi:38},
  {id:'bass43',rootMidi:43},
  {id:'bass43b',rootMidi:43},
  {id:'bass48',rootMidi:48},
  {id:'bass48b',rootMidi:48},
  {id:'bass52',rootMidi:52},
  {id:'bass52b',rootMidi:52},
];
