// Pure metadata shared with the audio worklet, where URL is unavailable.
export const DRUM_SAMPLE_GROUPS = {
  tambourine:['tambourine1','tambourine2'],
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

// A separate, velocity-layered CC0 club-jazz kit, not a filtered rock-kit preset.
export const JAZZ_DRUM_GROUPS={
 kick:['jazzKick1','jazzKick2'],kickSoft:['jazzKickSoft1','jazzKickSoft2'],
 snare:['jazzSnare1','jazzSnare2','jazzSnare3'],snareSoft:['jazzSnareSoft1','jazzSnareSoft2','jazzSnareSoft3'],snareGhost:['jazzSnareGhost1','jazzSnareGhost2'],
 ride:['jazzRide1','jazzRide2','jazzRide3','jazzRide4'],rideAccent:['jazzRideAccent1','jazzRideAccent2','jazzRideAccent3','jazzRideAccent4'],flatRide:['jazzFlatRide1','jazzFlatRide2'],rideBell:['jazzRideBell1','jazzRideBell2'],
 hat:['jazzHat1','jazzHat2','jazzHat3'],hatOpen:['jazzHatOpen1','jazzHatOpen2'],hatPedal:['jazzHatPedal1','jazzHatPedal2'],rim:['jazzRim1','jazzRim2'],tomHigh:['jazzTomHigh1','jazzTomHigh2'],tomLow:['jazzTomLow1','jazzTomLow2'],crash:['jazzCrash1']
};

export const MODERN_DRUM_GROUPS={
 kick:['modernKick1','modernKick2','modernKick3'],kickSoft:['modernKickSoft1','modernKickSoft2'],snare:['modernSnare1','modernSnare2','modernSnare3'],snareSoft:['modernSnareSoft1','modernSnareSoft2'],snareGhost:['modernSnareGhost1','modernSnareGhost2'],hat:['modernHat1','modernHat2','modernHat3'],hatOpen:['modernHatOpen1','modernHatOpen2'],hatPedal:['modernHatPedal1','modernHatPedal2'],ride:['modernRide1','modernRide2','modernRide3'],rideBell:['modernRideBell1','modernRideBell2'],rim:['modernRim1','modernRim2'],tomHigh:['modernTomHigh1','modernTomHigh2'],tomLow:['modernTomLow1','modernTomLow2'],crash:['modernCrash1','modernCrash2']
};
