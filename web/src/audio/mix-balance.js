// Fixed source calibration, measured with the real sample banks. Faders remain
// linear amplitude controls; 25% reads -12.0 dB on the console. Sparse grooves
// retain their dynamics instead of being continuously loudness-normalized.
export const MIX_REFERENCE_PERCENT=25;
export const MIX_REFERENCE_LEVEL=MIX_REFERENCE_PERCENT/100;
const headroom=10**(-2/20);
export const BUS_GAINS=Object.fromEntries(Object.entries({click:.3*10**(1/20),harmony:.37*10**(-5/20),drums:.5*10**(3/20),bass:.3,comping:.24,sequence:.15*10**(3/20)}).map(([channel,gain])=>[channel,gain*headroom]));
export const COMPING_TRIM_DB={fluteLead:5,jazzGuitar:11,legatoGuitar:5,swelledGuitar:6,drawbarOrgan:6,drivenGuitar:4,cleanGuitar:11,bluesGuitar:8.5,acousticPiano:9.5,softPiano:9,nylonGuitar:13,brightKeys:5.5,brightTine:5.5,clav:6.5};
export const COMPING_TRIMS=Object.fromEntries(Object.entries(COMPING_TRIM_DB).map(([tone,db])=>[tone,10**(db/20)]));
// VSCO is about 3 dB louder than the previous upright in the matched auditions.
export const VSCO_UPRIGHT_GAIN=10**(-3/20);
export const BASS_TRIMS={electric:10**(2/20),upright:1};

// Audited with repeating hits and recorded tails; hats already have source trims.
export const CYMBAL_TRIM_DB={sonor:{ride:1,rideBell:2,flatRide:1,crash:1},tama:{ride:-8,rideBell:-3,flatRide:-6,crash:-3},close:{ride:-3,rideBell:-3,flatRide:-2,crash:-3},live:{ride:-9,rideBell:-2,flatRide:-2,crash:-1.5},jazz:{ride:-2,rideBell:-2,flatRide:-1,crash:-2.5},default:{ride:-2,rideBell:-2,flatRide:-1,crash:-2}};

// Fixed per-piece source calibration from the common real-bank kit audit.
// These trims do not change the played velocities or recorded layer choice.
export const DRUM_PIECE_TRIM_DB={sonor:{kick:-1.5,snare:-1.5,tomHigh:4.5,tomLow:4},close:{kick:-2,snare:1.5,tomLow:-2},jazz:{kick:-5.5,tomHigh:-1,tomLow:-2},tama:{tomHigh:-1.5}};
