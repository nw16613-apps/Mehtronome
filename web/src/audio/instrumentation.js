export const BASS_INSTRUMENTS={electric:'Fingerstyle electric bass',upright:'Plucked upright bass'};
// Genre-specific drum banks, damping and brightness.
// Jazz/Latin/soft profiles use the separate club kit; rock retains its original bank.
export const DRUM_KITS={
 rock:{name:'Rock kit',brightness:1,decay:0},
 jazz:{name:'Club jazz kit',bank:'jazz',brightness:1,decay:0},
 fusion:{name:'Punchy fusion kit',brightness:1.08,decay:.8},
 vintage:{name:'Dry blues kit',brightness:.8,decay:.65},
 motown:{name:'Vintage kit + tambourine',brightness:.72,decay:.45,tambourine:true},
 tight:{name:'Tight funk kit',brightness:1.05,decay:.32},
 soul:{name:'Soft soul kit',bank:'jazz',brightness:.85,decay:.8},
 latin:{name:'Acoustic Latin kit',bank:'jazz',brightness:.94,decay:1.8},
 soft:{name:'Soft club kit',bank:'jazz',brightness:.85,decay:2.2},
};
