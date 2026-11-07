// Fixed source calibration, measured with the real sample banks. Faders remain
// linear amplitude controls; 25% reads -12.0 dB on the console. Sparse grooves
// retain their dynamics instead of being continuously loudness-normalized.
export const MIX_REFERENCE_PERCENT=25;
export const MIX_REFERENCE_LEVEL=MIX_REFERENCE_PERCENT/100;
const headroom=10**(-2/20);
export const BUS_GAINS=Object.fromEntries(Object.entries({click:.3*10**(1/20),harmony:.37*10**(-5/20),drums:.5*10**(3/20),bass:.3,comping:.24,sequence:.15*10**(3/20)}).map(([channel,gain])=>[channel,gain*headroom]));
export const COMPING_TRIM_DB={fluteLead:5,jazzGuitar:11,legatoGuitar:5,swelledGuitar:10,drawbarOrgan:6,drivenGuitar:6,cleanGuitar:11,bluesGuitar:8.5,acousticPiano:9.5,softPiano:9,nylonGuitar:13,brightKeys:5.5,brightTine:5.5,clav:6.5};
export const COMPING_TRIMS=Object.fromEntries(Object.entries(COMPING_TRIM_DB).map(([tone,db])=>[tone,10**(db/20)]));
export const BASS_TRIMS={electric:10**(2/20),upright:1};

// Audited with repeating hits and recorded tails; hats already have source trims.
export const CYMBAL_TRIM_DB={tama:{ride:-8,rideBell:-3,flatRide:-6,crash:-3},close:{ride:-3,rideBell:-3,flatRide:-2,crash:-3},live:{ride:-7.5,rideBell:-2,flatRide:-2,crash:-1.5},jazz:{ride:-2,rideBell:-2,flatRide:-1,crash:-2.5},default:{ride:-2,rideBell:-2,flatRide:-1,crash:-2}};
