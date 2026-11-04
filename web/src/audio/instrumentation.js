export const BASS_INSTRUMENTS={electric:'Fingerstyle electric bass',upright:'Plucked upright bass'};
// Genre-specific drum banks, damping and brightness.
// Live-fusion acoustic recordings for the five band styles; club profiles stay unchanged.
export const DRUM_KITS={
 rock:{name:'Live acoustic kit',bank:'live',brightness:1,decay:0},
 jazz:{name:'Club jazz kit',bank:'jazz',brightness:1,decay:0},
 fusion:{name:'Live fusion kit',bank:'live',brightness:1,decay:0},
 vintage:{name:'Live blues kit',bank:'live',brightness:.96,decay:1},
 motown:{name:'Live soul kit + tambourine',bank:'live',brightness:.96,decay:.75,tambourine:true},
 tight:{name:'Live funk kit',bank:'live',brightness:1.02,decay:1},
 soul:{name:'Soft soul kit',bank:'jazz',brightness:.85,decay:.8},
 latin:{name:'Acoustic Latin kit',bank:'jazz',brightness:.94,decay:1.8},
 soft:{name:'Soft club kit',bank:'jazz',brightness:.85,decay:2.2},
};
