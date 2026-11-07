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

export const LIVE_DRUM_GROUPS={
 kick:['liveKick1','liveKick2','liveKick3'],kickSoft:['liveKickSoft1','liveKickSoft2'],snare:['liveSnare1','liveSnare2','liveSnare3'],snareSoft:['liveSnareSoft1','liveSnareSoft2'],snareGhost:['liveSnareGhost1','liveSnareGhost2'],hat:['liveHat1','liveHat2','liveHat3'],hatOpen:['liveHatOpen1','liveHatOpen2'],hatPedal:['liveHatPedal1','liveHatPedal2'],ride:['liveRide1','liveRide2','liveRide3'],rideBell:['liveRideBell1','liveRideBell2'],rim:['liveRim1','liveRim2'],tomHigh:['liveTomHigh1','liveTomHigh2'],tomLow:['liveTomLow1','liveTomLow2'],crash:['liveCrash1','liveCrash2']
};

// CC0 acoustic percussion from the Versilian Community Sample Library.
export const LATIN_DRUM_GROUPS={
 clave:['latinClave1','latinClave2'],congaOpen:['latinCongaOpen1','latinCongaOpen2'],
 congaMute:['latinCongaMute1','latinCongaMute2'],tumbaOpen:['latinTumbaOpen1','latinTumbaOpen2'],
 cowbell:['latinCowbell1','latinCowbell2'],guiroShort:['latinGuiroShort1','latinGuiroShort2'],
 guiroLong:['latinGuiroLong1','latinGuiroLong2'],shaker:['latinShaker1','latinShaker2']
};
const SON_PERCUSSION_GROUPS=Object.fromEntries(Object.entries(LATIN_DRUM_GROUPS).filter(([name])=>name!=='shaker'));
const BOSSA_PERCUSSION_GROUPS={shaker:LATIN_DRUM_GROUPS.shaker};
export function latinSampleGroups(groove){return groove==='tumbao'?SON_PERCUSSION_GROUPS:groove==='bossa'?BOSSA_PERCUSSION_GROUPS:groove==='afroCuban68'?{cowbell:LATIN_DRUM_GROUPS.cowbell,congaOpen:LATIN_DRUM_GROUPS.congaOpen,congaMute:LATIN_DRUM_GROUPS.congaMute,tumbaOpen:LATIN_DRUM_GROUPS.tumbaOpen,shaker:LATIN_DRUM_GROUPS.shaker}:groove==='samba'?{shaker:LATIN_DRUM_GROUPS.shaker,congaOpen:LATIN_DRUM_GROUPS.congaOpen,congaMute:LATIN_DRUM_GROUPS.congaMute}:groove==='boogaloo'?{cowbell:LATIN_DRUM_GROUPS.cowbell}:{};}
