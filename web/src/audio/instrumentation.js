export const BASS_INSTRUMENTS={electric:'Fingerstyle electric bass',upright:'Plucked upright bass'};
// Genre-specific drum banks, damping and brightness.
// Club, warm studio and original funk banks remain separate.
export const DRUM_KITS={
 rock:{name:'Warm studio kit',bank:'studio',brightness:.94,decay:.75},
 jazz:{name:'Club jazz kit',bank:'jazz',brightness:1,decay:0},
 fusion:{name:'Studio fusion kit',bank:'studio',brightness:.98,decay:1.2},
 vintage:{name:'Dry studio shuffle kit',bank:'studio',brightness:.82,decay:.45},
 motown:{name:'Dry soul kit + tambourine',bank:'studio',brightness:.78,decay:.28,tambourine:true},
 tight:{name:'Tight funk kit',brightness:1.05,decay:.32},
 soul:{name:'Soft soul kit',bank:'jazz',brightness:.85,decay:.8},
 latin:{name:'Acoustic Latin kit',bank:'jazz',brightness:.94,decay:1.8},
 soft:{name:'Soft club kit',bank:'jazz',brightness:.85,decay:2.2},
};
