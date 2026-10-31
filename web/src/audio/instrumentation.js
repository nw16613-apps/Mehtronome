export const BASS_INSTRUMENTS={electric:'Fingerstyle electric bass',upright:'Plucked upright bass'};
// The acoustic kit recordings receive genre-specific damping and brightness.
// Rock retains the original bank unchanged. No filtering/decoding at hit time.
export const DRUM_KITS={
 rock:{name:'Rock kit',brightness:1,decay:0},
 jazz:{name:'Light jazz kit',brightness:.82,decay:1.8},
 fusion:{name:'Punchy fusion kit',brightness:1.08,decay:.8},
 vintage:{name:'Dry blues kit',brightness:.8,decay:.65},
 motown:{name:'Vintage kit + tambourine',brightness:.72,decay:.45,tambourine:true},
 tight:{name:'Tight funk kit',brightness:1.05,decay:.32},
 soul:{name:'Soft soul kit',brightness:.75,decay:.65},
 latin:{name:'Light Latin kit',brightness:.9,decay:.8},
 soft:{name:'Gentle ballad kit',brightness:.65,decay:1.1},
};
