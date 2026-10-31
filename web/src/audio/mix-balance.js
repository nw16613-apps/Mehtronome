// Fixed source calibration, measured with the real sample banks. Faders remain
// linear amplitude controls; 25% reads -12.0 dB on the console. Sparse grooves
// retain their dynamics instead of being continuously loudness-normalized.
export const MIX_REFERENCE_PERCENT=25;
export const MIX_REFERENCE_LEVEL=MIX_REFERENCE_PERCENT/100;
const headroom=10**(-2/20);
export const BUS_GAINS=Object.fromEntries(Object.entries({click:.3*10**(1/20),harmony:.37*10**(-5/20),drums:.5*10**(3/20),bass:.3,comping:.24,sequence:.15*10**(3/20),space:.65}).map(([channel,gain])=>[channel,channel==='space'?gain:gain*headroom]));
export const COMPING_TRIM_DB={cleanGuitar:11,bluesGuitar:8.5,acousticPiano:9.5,softPiano:9,nylonGuitar:13,brightKeys:5.5,brightTine:5.5,clav:6.5};
export const COMPING_TRIMS=Object.fromEntries(Object.entries(COMPING_TRIM_DB).map(([tone,db])=>[tone,10**(db/20)]));
export const BASS_TRIMS={electric:10**(2/20),upright:1};
