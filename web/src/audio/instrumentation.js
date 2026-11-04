export const BASS_INSTRUMENTS={electric:'Fingerstyle electric bass',upright:'Plucked upright bass'};
// Genre-specific drum banks, damping and brightness.
// The five modern profiles share newly shaped, dry one-shots; club profiles stay acoustic.
export const DRUM_KITS={
 rock:{name:'Modern punch kit',bank:'modern',brightness:1,decay:0},
 jazz:{name:'Club jazz kit',bank:'jazz',brightness:1,decay:0},
 fusion:{name:'Modern fusion kit',bank:'modern',brightness:1,decay:0},
 vintage:{name:'Modern dry blues kit',bank:'modern',brightness:.94,decay:.5},
 motown:{name:'Modern soul kit + tambourine',bank:'modern',brightness:.96,decay:.35,tambourine:true},
 tight:{name:'Modern tight funk kit',bank:'modern',brightness:1.05,decay:.2},
 soul:{name:'Soft soul kit',bank:'jazz',brightness:.85,decay:.8},
 latin:{name:'Acoustic Latin kit',bank:'jazz',brightness:.94,decay:1.8},
 soft:{name:'Soft club kit',bank:'jazz',brightness:.85,decay:2.2},
};
