// Authored answers, measured backwards from the next downbeat in 12 ticks/beat.
// Accents and quiet lead-ins imply sticking; rests are part of each phrase.
const BANKS={
 rock:[[[12,'snare',.3],[6,'tomHigh',.32],[3,'tomLow',.4]],[[12,'snare',.34],[9,'snare',.15],[3,'tomLow',.39]],[[18,'snare',.2],[12,'tomHigh',.34],[6,'tomLow',.4]],[[12,'snare',.38],[6,'snare',.17],[3,'snare',.3]],[[21,'snare',.14],[18,'snare',.32],[12,'tomHigh',.36],[6,'tomLow',.42]],[[18,'tomHigh',.31],[12,'snare',.37],[9,'snare',.16],[6,'tomLow',.4],[3,'snare',.25]]],
 funk:[[[9,'snare',.14],[6,'snare',.32],[3,'snare',.16]],[[12,'snare',.31],[6,'tomLow',.27]],[[15,'snare',.13],[12,'snare',.34],[3,'tomHigh',.29]],[[12,'snare',.34],[9,'snare',.13],[6,'snare',.22],[3,'tomLow',.32]],[[18,'snare',.28],[15,'snare',.12],[9,'tomHigh',.3],[3,'snare',.24]],[[18,'tomLow',.28],[12,'snare',.35],[9,'snare',.13],[3,'tomHigh',.3]]],
 soul:[[[6,'snare',.21],[3,'snare',.12]],[[9,'snare',.12],[3,'tomLow',.26]],[[12,'rim',.23],[6,'snare',.14]],[[12,'snare',.28],[9,'snare',.12],[3,'snare',.2]],[[18,'snare',.16],[12,'tomHigh',.23],[6,'tomLow',.28]],[[18,'rim',.2],[9,'snare',.12],[3,'tomLow',.27]]],
 jazz:[[[6,'snare',.19]],[[12,'snare',.22],[6,'snare',.12]],[[18,'snare',.14],[6,'tomLow',.22]],[[12,'tomHigh',.2],[6,'snare',.24]],[[24,'snare',.19],[18,'snare',.1],[6,'tomLow',.24]],[[18,'tomHigh',.21],[12,'snare',.13],[6,'snare',.25]]],
 blues:[[[6,'snare',.22]],[[12,'snare',.24],[6,'snare',.13]],[[18,'snare',.15],[6,'tomLow',.27]],[[12,'tomHigh',.24],[6,'tomLow',.29]],[[24,'snare',.23],[18,'snare',.12],[6,'snare',.28]],[[18,'tomHigh',.23],[12,'snare',.16],[6,'tomLow',.3]]],
 soft:[[[6,'rim',.13]],[[3,'hatPedal',.1]],[[12,'rim',.15],[6,'rim',.08]],[[6,'tomLow',.15]],[[18,'rim',.1],[6,'rim',.16]],[[12,'hatPedal',.09],[3,'rim',.13]]],
 compound:[[[8,'snare',.18],[4,'tomLow',.24]],[[12,'snare',.24],[4,'snare',.13]],[[8,'tomHigh',.22],[4,'tomLow',.27]],[[12,'snare',.27],[8,'snare',.12],[4,'snare',.2]],[[20,'snare',.15],[12,'tomHigh',.24],[4,'tomLow',.28]],[[16,'tomHigh',.2],[8,'snare',.25],[4,'snare',.13]]],
 latin:[[[6,'congaMute',.14]],[[3,'congaMute',.17]],[[12,'congaMute',.12],[6,'congaMute',.18]],[[6,'congaMute',.2]],[[9,'congaMute',.12],[3,'congaMute',.17]],[[12,'congaMute',.16],[3,'congaMute',.12]]],
 quietLatin:[[[6,'rim',.12]],[[3,'rim',.14]],[[12,'rim',.1],[6,'rim',.15]],[[6,'hatPedal',.09]],[[9,'rim',.1],[3,'rim',.14]],[[12,'rim',.14]]],
};
export function drumFillFamily(style){
 if(['traditionalJazz','jazzWaltz','modernStraightJazz','legatoFusion','swing','modernJazz'].includes(style))return 'jazz';
 if(['blues','shuffle','secondLine'].includes(style))return 'blues';
 if(['funk','fusion','fusionJazz','fusionRide'].includes(style))return 'funk';
 if(['neoSoul','halftime','motown','soul'].includes(style))return 'soul';
 if(['ballad','soft'].includes(style))return 'soft';
 if(['slowSoul128','soul128'].includes(style))return 'compound';
 if(['latin','tumbao','afroCuban68'].includes(style))return 'latin';
 if(['bossa','samba','reggae'].includes(style))return 'quietLatin';
 return 'rock';
}
export function drumFillPhrase(style,phrase=0,cycle=0,long=false){
 const bank=BANKS[drumFillFamily(style)],index=((phrase+cycle*2)%bank.length+bank.length)%bank.length;
 return bank[index].filter(([before])=>before<=(long?24:12)).map(stroke=>[...stroke]);
}
