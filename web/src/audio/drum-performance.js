// Performance touch before recorded velocity-layer selection, shared by the
// developed arranger and fallback grooves. Cymbal and percussion balances stay
// calibrated; quiet snare ghosts remain quiet rather than becoming backbeats.
const DRIVE={popRock:1,traditionalJazz:.5,fusionJazz:1,blues:1,motown:1,funk:1,neoSoul:.8,bossa:.4,latin:.6,ballad:.35,jazzWaltz:.5,afroCuban68:.6,samba:.55,secondLine:.9,reggae:.8,slowSoul128:.75,boogaloo:.9,modernStraightJazz:.65,hardRock:1.15,legatoFusion:1};
export function drumStrokeGain(style,name,gain){
 const drive=DRIVE[style];if(!drive)return gain;
 if(name==='kick'&&gain>=.24)return Math.min(.97,gain+(1-gain)*.4*drive);
 if(name==='snare'&&gain>=.3)return Math.min(.97,gain+(1-gain)*.48*drive);
 if(name==='tomHigh'||name==='tomLow')return Math.min(.94,gain+(1-gain)*.3*drive);
 if(name==='rim'&&gain>=.25)return Math.min(.85,gain+(1-gain)*.16*drive);
 return gain;
}
