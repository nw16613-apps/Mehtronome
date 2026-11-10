import {modernJazzDrumCell} from './modern-jazz-drums.js';
import {fusionJazzDrumCell} from './fusion-jazz-drums.js';
import {ADDITIONAL_STYLES} from './additional-styles.js';
import {latinDrumCell,SON_BELL} from './latin-grooves.js';
// Coordinated written ensembles. The approved Legato Fusion/Blues parts are
// retained rhythmically; Blues timekeeping uses ride. Other styles have their own vocabulary.
// Comping: [sixteenth slot, harmonic role, duration in beats, velocity].
const legatoComp=[
 [[0,'chord',3.7,.35]],[],[[6,'chord',2.4,.34]],[[2,'upperColour',2.7,.32]],
 [[0,'chord',3.7,.35]],[[10,'upperInversion',1.3,.3]],[],[[4,'chord',2.8,.34]],
 [[0,'chord',3.6,.35]],[],[[2,'chord',3.2,.34]],[[10,'top',1.3,.26]],
 [[0,'chord',3.8,.35]],[[6,'upperColour',2.3,.32]],[[2,'chord',3.1,.34]],[[0,'chord',2.4,.34]],
];
const bluesComp=[
 [[0,'lowDyad',.8,.44],[8,'upper',.7,.35]],[[0,'root',1,.35],[10,'third',.5,.29]],
 [[0,'lowDyad',.7,.43],[6,'upper',.45,.34],[8,'lowDyad',.7,.41]],[[2,'shell',1.2,.36],[12,'fifth',.65,.29]],
 [[0,'lowDyad',.85,.43],[8,'upper',.7,.35]],[[0,'root',1.3,.35],[10,'seventh',.6,.29]],
 [[0,'lowDyad',.7,.43],[6,'thirdDown',.4,.29],[8,'upper',.7,.35]],[[0,'shell',1.6,.37]],
 [[0,'lowDyad',.8,.43],[8,'upper',.7,.35]],[[2,'shell',1.4,.36],[12,'third',.5,.29]],
 [[0,'lowDyad',1,.43],[8,'upper',.75,.35]],[[0,'shell',1.3,.36],[8,'seventh',.4,.28],[10,'fifth',.4,.28],[14,'root',.4,.33]],
];
// Bass: [sixteenth slot, chord-member index (-1 fifth, -2 seventh), octave, beats, velocity].
const legatoBass=[
 [[0,0,0,2.5,.65],[12,-1,0,.75,.51]],[[0,0,0,1.4,.64],[7,1,0,.8,.52],[12,-2,0,.8,.51]],
 [[0,0,0,2.1,.64],[10,-1,0,.9,.52]],[[0,0,0,1.5,.64],[8,1,0,.7,.51],[14,-1,0,.4,.49]],
 [[0,0,0,2.7,.65],[14,-1,0,.4,.49]],[[0,0,0,1.4,.64],[6,-1,0,.65,.52],[10,-2,0,1.1,.51]],
 [[0,0,0,1.2,.64],[6,1,0,.6,.52],[9,-1,0,.6,.51],[13,-2,0,.6,.5]],[[0,0,0,2.2,.64],[12,-1,0,.7,.51]],
];
const bluesBass=[
 [[0,0,0,.85,.68],[4,1,0,.8,.56],[8,-1,0,.85,.62],[12,-2,0,.8,.57]],
 [[0,0,0,1.4,.68],[6,-1,0,.4,.52],[8,1,0,.8,.57],[12,-1,0,.8,.6]],
 [[0,0,0,.85,.68],[4,-1,0,.8,.6],[8,-2,0,.85,.58],[12,1,0,.8,.56]],
 [[0,0,0,1.6,.68],[8,-1,0,.7,.6],[12,1,0,.4,.55],[14,-2,0,.4,.52]],
];
// Melody cells: [slot, diatonic offset from the current guide tone, held beats].
// Two-bar questions and answers leave intentional space for the comping replies.
const legatoMelody=[
 [[2,0,.55],[4,3,.55],[6,1,1.1],[10,4,.55],[12,2,.9]],[[0,1,1.1],[4,0,1.7]],
 [],[[6,0,.55],[8,-2,.55],[10,1,.55],[12,-1,.9]],
 [[0,0,.55],[2,3,.55],[4,1,.55],[6,5,.55],[8,2,1.2]],[],
 [[2,0,.55],[4,2,1.1],[8,4,.55],[10,1,.55],[12,0,.9]],[[0,-1,2.3]],
 [[4,0,.55],[6,3,.55],[8,1,.55],[10,4,.55],[12,2,.9]],[[0,1,.55],[2,0,1.8]],
 [],[[2,0,.55],[4,-2,.55],[6,1,1.1],[10,-1,1.3]],
 [[2,0,.55],[4,3,.55],[6,1,.55],[8,5,.55],[10,2,1.3]],[],
 [[0,0,.55],[2,2,.55],[4,1,1.1],[8,-1,1.5]],[[0,0,2.7]],
];
const bluesMelody=[
 [[4,0,.55],[6,2,.45],[8,1,.85]],[[0,0,1.35],[8,2,.45],[10,1,.45],[12,0,.8]],
 [],[[4,0,.45],[6,-1,.45],[8,1,.55],[10,0,1]],
 [[2,0,.45],[4,2,.55],[6,1,1.1]],[[2,1,.45],[4,0,1.1],[10,-1,.55]],
 [],[[4,0,.45],[6,1,.45],[8,2,.55],[10,1,1.1]],
 [[2,0,.45],[4,2,.45],[6,1,.55],[8,3,1.1]],[[0,1,1.25],[8,0,1.3]],
 [[4,0,.45],[6,-1,.45],[8,-2,.55],[10,0,1.1]],[],
];
// Authored cells, in slots of four per beat. Melodic calls and their answers
// share contour, but change length, placement and direction across a section.
const parts={
 popRock:{comp:[[[0,'lowDyad',2.6,.44],[10,'top',.9,.28]],[[0,'root',1.8,.35],[8,'upper3',1.5,.38]],[[0,'lowDyad',3.4,.43]],[[2,'third',.7,.29],[6,'fifth',.7,.28],[10,'upper',1.3,.38]]],bass:[[[0,0,0,1.3,.7],[6,-1,0,.4,.54],[8,0,0,1.4,.68]],[[0,0,0,1.6,.69],[8,-1,0,.8,.6],[14,1,0,.4,.51]],[[0,0,0,1.4,.7],[6,-1,0,.4,.53],[8,0,1,.9,.58],[12,-1,0,.7,.6]],[[0,0,0,1.8,.69],[8,-1,0,.8,.59],[12,1,0,.4,.53],[14,0,0,.4,.55]]],call:[[2,0,.55],[4,2,.55],[8,1,.8],[12,0,.7]],answer:[[4,1,.8],[8,2,.55],[10,0,1.2]],gate:.8},
 traditionalJazz:{comp:[[[2,'shell',1.3,.4],[11,'top',.65,.25]],[[6,'chord',2,.41]],[[4,'chord',2.5,.4]],[[2,'third',.7,.26],[8,'shell',1.1,.37],[14,'seventh',.5,.25]]],bass:[[[0,0,0,.82,.67],[4,1,0,.8,.56],[8,-1,0,.82,.61],[12,-2,0,.82,.57]],[[0,0,0,.85,.67],[4,-1,0,.8,.6],[8,1,0,.8,.55],[12,-2,0,.8,.57]],[[0,0,0,1.4,.66],[6,1,0,.4,.5],[8,-1,0,.85,.6],[12,-2,0,.8,.57]],[[0,0,0,.85,.67],[4,-2,0,.8,.56],[8,-1,0,.7,.6],[12,1,0,.5,.54],[14,-2,0,.35,.5]]],call:[[2,0,.5],[4,1,.5],[6,3,.8],[10,2,.8]],answer:[[0,1,1.3],[6,0,.5],[10,-1,1]],gate:.9},
 fusionJazz:{comp:[[[0,'lowDyad',1.8,.4],[10,'upperColour',1.2,.39]],[[3,'root',1,.31],[9,'upperInversion',1.4,.38]],[[0,'lowDyad',2.8,.4]],[[2,'third',.55,.28],[7,'fifthUp',.55,.27],[11,'upperColour',1,.38]]],bass:[[[0,0,0,.9,.7],[5,-1,0,.5,.54],[9,1,0,.6,.55],[14,-2,0,.4,.51]],[[0,0,0,1.3,.69],[7,-1,0,.55,.55],[11,1,0,.8,.53]],[[0,0,0,.7,.7],[3,-1,0,.4,.53],[8,0,1,.8,.59],[13,-2,0,.5,.52]],[[0,0,0,1.6,.68],[9,-1,0,.5,.54],[12,1,0,.4,.51],[15,-2,0,.22,.48]]],call:[[1,0,.5],[3,3,.6],[6,1,.6],[10,4,.7],[13,2,.6]],answer:[[3,1,1],[8,-1,.6],[11,0,1]],gate:.95},
 motown:{comp:[[[2,'upper',.35,.4],[10,'upper3',.4,.4]],[[2,'third',.45,.28],[6,'upper',.35,.4],[14,'fifth',.4,.27]],[[2,'upper',.5,.39],[10,'upper',.5,.39]],[[2,'upperInversion',.35,.38],[6,'third',.4,.28],[10,'upper',.4,.39],[14,'root',.45,.3]]],bass:[[[0,0,0,.7,.73],[4,1,0,.6,.57],[6,-1,0,.35,.56],[8,0,1,.7,.63],[12,-2,0,.65,.59]],[[0,0,0,1,.72],[6,1,0,.4,.54],[8,-1,0,.75,.62],[14,-2,0,.4,.54]],[[0,0,0,.75,.73],[4,-1,0,.65,.61],[8,1,0,.7,.57],[12,0,1,.6,.62]],[[0,0,0,.85,.72],[4,1,0,.5,.56],[8,-1,0,.7,.61],[12,-2,0,.4,.55],[14,0,0,.4,.58]]],call:[[2,0,.45],[4,2,.55],[8,3,.6],[12,1,.6]],answer:[[4,2,.7],[8,1,.5],[10,0,1.1]],gate:.75},
 funk:{comp:[[[1,'root',.18,.34],[6,'upper',.22,.41],[10,'fifth',.2,.29]],[[2,'third',.2,.29],[6,'upper',.24,.4],[12,'root',.22,.33]],[[1,'root',.23,.33],[10,'upper',.3,.4]],[[1,'root',.18,.33],[4,'upperInversion',.22,.39],[7,'fifth',.16,.27],[11,'seventh',.18,.26],[14,'upper',.23,.39]]],bass:[[[0,0,0,.35,.76],[3,0,0,.2,.53],[6,-1,0,.4,.59],[10,0,1,.3,.6],[14,-2,0,.3,.53]],[[0,0,0,.55,.75],[5,-1,0,.25,.56],[8,0,0,.4,.69],[11,1,0,.3,.53]],[[0,0,0,.35,.76],[2,0,0,.2,.52],[7,-1,0,.4,.57],[10,-2,0,.3,.54],[14,0,1,.3,.59]],[[0,0,0,.6,.74],[6,-1,0,.3,.56],[9,1,0,.3,.52],[12,0,0,.4,.66],[15,-2,0,.2,.49]]],call:[[1,0,.28],[4,2,.35],[7,0,.4],[11,3,.5]],answer:[[3,1,.4],[7,2,.35],[10,0,.8]],gate:.55},
 neoSoul:{comp:[[[0,'pad',3.7,.42,'pad'],[8,'innerColour',1.5,.27,'inner']],[[0,'pad',3.6,.41,'pad'],[4,'innerThird',1.4,.28,'inner'],[12,'innerSeventh',.9,.25,'inner']],[[0,'chord',3.8,.4]],[[0,'pad',3.7,.4,'pad'],[2,'innerFifth',1.1,.25,'inner'],[8,'innerColour',1.1,.26,'inner'],[12,'innerThird',1.2,.28,'inner']]],bass:[[[0,0,0,1.7,.68],[9,-1,0,.8,.54]],[[0,0,0,1.3,.67],[6,1,0,.55,.51],[12,-2,0,.7,.5]],[[0,0,0,2.1,.68],[12,-1,0,.7,.53]],[[0,0,0,1.6,.67],[8,1,0,.6,.51],[13,-2,0,.55,.49]]],call:[[2,0,.75],[5,1,.75],[9,3,1.3]],answer:[[0,2,1.5],[7,1,.7],[11,0,1.1]],gate:1.03},
 bossa:{comp:[[[0,'thumbRoot',.75,.28],[6,'upper3',.85,.4],[8,'thumbFifth',.75,.26],[12,'upper3',.65,.37]],[[0,'thumbRoot',.75,.28],[4,'upper',.65,.35],[8,'thumbFifth',.75,.26],[10,'upper3',1.2,.4]],[[0,'thumbRoot',1,.27],[6,'upper3',1.2,.38],[8,'thumbFifth',1,.25]],[[0,'thumbRoot',.8,.28],[4,'upperInversion',.65,.35],[8,'thumbFifth',.8,.26],[10,'upper3',.8,.39],[14,'third',.45,.24]]],bass:[[[0,0,0,1.1,.64],[6,-1,0,.45,.48],[8,-1,0,1.1,.59],[14,0,0,.4,.48]],[[0,0,0,1.2,.64],[6,-1,0,.4,.48],[8,-1,0,1.2,.59],[14,1,0,.4,.47]],[[0,0,0,1.35,.64],[8,-1,0,1.35,.58]],[[0,0,0,1.1,.64],[6,-1,0,.4,.48],[8,-1,0,1,.58],[14,-2,0,.4,.47]]],call:[[2,0,.65],[4,2,.7],[8,1,.8],[12,0,.8]],answer:[[0,1,1.1],[6,2,.6],[10,0,1.2]],gate:.9},
 latin:{comp:[[[0,'rootOctave',.45,.32],[2,'upper',.35,.3],[6,'upperColour',.4,.36],[8,'fifthOctave',.45,.3],[14,'upper',.4,.34]],[[0,'rootOctave',.45,.32],[2,'upper',.35,.3],[6,'upperColour',.4,.35],[8,'fifthOctave',.45,.3],[12,'upper',.35,.32],[14,'third',.4,.25]],[[0,'rootOctave',.6,.31],[6,'upperColour',.65,.34],[8,'fifthOctave',.6,.29],[14,'upper',.5,.33]],[[0,'rootOctave',.45,.31],[2,'upperInversion',.35,.29],[6,'upperColour',.4,.35],[8,'fifthOctave',.45,.29],[10,'seventh',.35,.25],[12,'third',.35,.25],[14,'upper',.4,.33]]],bass:[[[6,0,0,1.25,.67],[14,-1,0,1.25,.6]],[[6,0,0,1.3,.67],[14,-1,0,1.3,.6]],[[6,0,0,1.3,.66],[14,0,1,1.2,.58]],[[6,0,0,1.2,.66],[14,-2,0,1.2,.56]]],call:[[0,0,.45],[2,2,.55],[6,3,.65],[10,1,.7]],answer:[[2,2,.6],[6,1,.6],[12,0,.8]],gate:.75},
 ballad:{comp:[[[0,'lowDyad',3.7,.37],[4,'upper3',2.7,.35]],[[2,'chord',3.3,.37]],[[0,'chord',3.8,.37]],[[0,'root',3.6,.31],[6,'upper',2.1,.34],[12,'top',1.1,.23]]],bass:[[[0,0,0,2.7,.61]],[[0,0,0,1.9,.6],[10,-1,0,1.1,.47]],[[0,0,0,3.2,.61]],[[0,0,0,2.2,.6],[12,1,0,.75,.46]]],call:[[2,0,1.1],[7,2,1.6]],answer:[[0,1,1.4],[8,0,1.8]],gate:1.05},
 jazzWaltz:{native:3,comp:[[[2,'shell',1.5,.38]],[[6,'chord',1.3,.39]],[[0,'chord',2.8,.38]],[[2,'third',.55,.25],[6,'shell',1.1,.36],[10,'seventh',.45,.24]]],bass:[[[0,0,0,.85,.66],[4,1,0,.8,.54],[8,-1,0,.85,.59]],[[0,0,0,.85,.66],[4,-1,0,.85,.58],[8,-2,0,.8,.54]],[[0,0,0,1.4,.65],[6,1,0,.4,.5],[8,-1,0,.85,.58]],[[0,0,0,.85,.65],[4,-2,0,.7,.54],[8,1,0,.7,.51],[10,-1,0,.35,.48]]],call:[[0,0,.55],[2,1,.55],[6,3,.8]],answer:[[2,2,.6],[6,1,.6],[8,0,.8]],gate:.9},
 afroCuban68:{native:3,comp:[[[0,'rootOctave',.55,.3],[2,'third',.45,.27],[4,'upper',.55,.35],[6,'fifthOctave',.55,.29],[10,'upper',.55,.34]],[[0,'rootOctave',.55,.3],[2,'upper',.45,.33],[4,'third',.55,.26],[6,'fifthOctave',.55,.29],[8,'upperColour',.45,.34],[10,'seventh',.45,.25]],[[0,'rootOctave',.9,.29],[6,'upper',1.2,.34]],[[0,'rootOctave',.55,.29],[4,'upperColour',.65,.34],[6,'fifthOctave',.55,.28],[8,'third',.45,.25],[10,'upper',.5,.33]]],bass:[[[0,0,0,1.2,.65],[6,-1,0,1.2,.58]],[[0,0,0,1,.65],[4,1,0,.4,.49],[6,-1,0,1.2,.58]],[[0,0,0,1.3,.64],[6,0,1,1.2,.56]],[[0,0,0,1.1,.64],[6,-2,0,.8,.54],[10,-1,0,.4,.49]]],call:[[0,0,.6],[2,2,.55],[6,3,.8]],answer:[[2,1,.7],[6,2,.65],[10,0,.45]],gate:.85},
 samba:{comp:[[[0,'thumbRoot',.6,.27],[3,'upper3',.45,.37],[8,'thumbFifth',.6,.25],[10,'upper3',.6,.38]],[[0,'thumbRoot',.6,.27],[2,'upper',.4,.32],[6,'upper3',.6,.37],[8,'thumbFifth',.6,.25],[14,'upper',.45,.33]],[[0,'thumbRoot',.8,.26],[6,'upper3',.8,.36],[8,'thumbFifth',.8,.24]],[[0,'thumbRoot',.6,.26],[3,'upperInversion',.45,.34],[8,'thumbFifth',.6,.24],[11,'third',.4,.24],[14,'upper3',.5,.36]]],bass:[[[0,0,0,.65,.65],[3,-1,0,.2,.44],[4,-1,0,.7,.7],[8,0,0,.65,.64],[12,-1,0,.7,.69]],[[0,0,0,.65,.65],[4,-1,0,.7,.7],[8,0,0,.65,.64],[11,-1,0,.2,.44],[12,1,0,.7,.56]],[[0,0,0,.65,.64],[4,-1,0,.75,.69],[8,0,0,.65,.63],[12,-1,0,.75,.68]],[[0,0,0,.65,.64],[4,-1,0,.7,.69],[8,0,0,.65,.63],[12,-2,0,.5,.54],[14,-1,0,.4,.51]]],call:[[2,0,.5],[5,2,.55],[8,1,.65],[12,3,.6]],answer:[[0,2,.7],[6,1,.6],[10,0,1]],gate:.8},
 secondLine:{comp:[[[0,'lowDyad',.9,.37],[6,'upper',.7,.39],[12,'chord',.7,.39]],[[0,'root',.9,.3],[4,'upper',.7,.37],[10,'shell',.8,.35]],[[0,'lowDyad',1.5,.36],[8,'upper',1.1,.37]],[[2,'third',.45,.26],[6,'upper',.6,.38],[10,'fifth',.5,.26],[14,'thirdDown',.45,.26]]],bass:[[[0,0,0,.75,.7],[4,-1,0,.7,.59],[6,1,0,.35,.51],[8,0,1,.7,.63],[12,-2,0,.65,.57]],[[0,0,0,.75,.7],[3,-1,0,.3,.5],[6,1,0,.45,.53],[8,0,0,.75,.66],[12,-1,0,.6,.58]],[[0,0,0,1.2,.69],[6,-1,0,.4,.51],[8,0,1,.8,.62],[12,1,0,.7,.53]],[[0,0,0,.8,.69],[4,1,0,.5,.53],[8,-1,0,.6,.58],[10,-2,0,.4,.52],[14,0,0,.4,.57]]],call:[[2,0,.5],[4,2,.5],[8,1,.7],[12,0,.7]],answer:[[0,2,.7],[6,1,.5],[10,-1,1.1]],gate:.85},
 reggae:{comp:[[[2,'upper3',.18,.37],[6,'upper',.18,.36],[10,'upper3',.18,.37],[14,'upper',.18,.36]],[[2,'upper',.18,.36],[5,'third',.12,.2],[6,'upper3',.18,.37],[10,'upper',.18,.36],[13,'seventh',.12,.2],[14,'upper3',.18,.37]],[[2,'upper',.22,.35],[10,'upper3',.22,.36]],[[2,'upperInversion',.18,.35],[6,'upper3',.18,.36],[10,'upper',.18,.35],[14,'upper3',.22,.36]]],bass:[[[0,0,0,1.4,.72],[6,-1,0,.4,.54],[8,0,1,.8,.61]],[[0,0,0,1.8,.71],[8,-1,0,.7,.59],[14,1,0,.4,.51]],[[0,0,0,1.3,.72],[6,-1,0,.4,.53],[10,-2,0,.7,.51],[14,0,0,.4,.58]],[[0,0,0,1.7,.71],[8,-1,0,.65,.58],[12,1,0,.4,.5],[14,0,0,.4,.57]]],call:[[2,0,.65],[6,0,.55],[10,2,.9]],answer:[[2,1,.7],[8,2,.55],[12,0,.7]],gate:.85},
 slowSoul128:{comp:[[[0,'pad',3.7,.38,'pad'],[8,'innerColour',1.5,.25,'inner']],[[0,'pad',3.7,.37,'pad'],[4,'innerThird',1.5,.26,'inner'],[12,'innerSeventh',.8,.24,'inner']],[[0,'chord',3.8,.37]],[[0,'pad',3.7,.37,'pad'],[2,'innerFifth',1.3,.24,'inner'],[8,'innerColour',1,.25,'inner'],[12,'innerThird',.9,.26,'inner']]],bass:[[[0,0,0,1.6,.68],[8,-1,0,1.25,.58]],[[0,0,0,1.6,.67],[8,-2,0,.9,.54],[12,-1,0,.6,.55]],[[0,0,0,2,.67],[10,-1,0,.8,.55]],[[0,0,0,1.6,.67],[8,1,0,.8,.51],[12,-1,0,.5,.54],[14,0,0,.3,.49]]],call:[[4/3,0,.65],[4,1,.7],[20/3,3,1.4]],answer:[[0,2,1.35],[20/3,1,.7],[32/3,0,1.2]],gate:1.05},
 boogaloo:{comp:[[[0,'lowDyad',1.2,.38],[6,'upper',.7,.4],[14,'shell',.5,.36]],[[0,'root',1.1,.3],[4,'upper',.8,.38],[12,'upperColour',.8,.38]],[[0,'lowDyad',1.8,.37],[8,'upper',1.5,.37]],[[2,'third',.6,.25],[6,'upperInversion',.7,.37],[10,'seventh',.5,.25],[14,'root',.6,.3]]],bass:[[[0,0,0,.75,.71],[3,-1,0,.35,.53],[6,-2,0,.45,.54],[8,0,1,.75,.62],[12,-1,0,.7,.59]],[[0,0,0,.75,.71],[3,-1,0,.35,.53],[6,1,0,.45,.51],[8,0,1,.75,.62],[14,-2,0,.4,.52]],[[0,0,0,1.1,.7],[6,-1,0,.4,.52],[8,0,1,.8,.61],[12,1,0,.6,.51]],[[0,0,0,.8,.7],[4,-1,0,.6,.57],[8,-2,0,.5,.53],[12,1,0,.4,.5],[14,0,0,.4,.56]]],call:[[0,0,.55],[2,2,.45],[6,1,.65],[10,3,.7]],answer:[[2,2,.65],[6,1,.6],[12,0,.8]],gate:.85},
 modernStraightJazz:{comp:[[[1,'chord',2.2,.36]],[[6,'upperColour',2.2,.35]],[[4,'chord',2.6,.35]],[[2,'seventh',.8,.24],[9,'upper',1.2,.33],[14,'thirdDown',.6,.24]]],bass:[[[0,0,0,.9,.64],[6,-1,0,.7,.53],[10,1,0,.85,.55]],[[0,0,0,1.2,.64],[7,-2,0,.7,.51],[12,-1,0,.7,.54]],[[0,0,0,1.7,.63],[9,1,0,.6,.5],[13,-1,0,.5,.51]],[[0,0,0,1,.63],[5,-1,0,.6,.52],[10,-2,0,.6,.5],[14,1,0,.4,.48]]],call:[[1,0,.65],[4,2,.65],[8,3,.75],[12,1,.8]],answer:[[3,2,.8],[8,0,.7],[11,-1,1]],gate:.98},
 hardRock:{comp:[[[0,'power',.25,.4],[6,'power',.3,.39],[8,'power',1.5,.41]],[[0,'power',1.4,.41],[6,'root',.25,.27],[10,'power',1.2,.39]],[[0,'power',2.7,.4],[12,'power',.6,.38]],[[0,'power',.25,.39],[3,'root',.2,.26],[6,'power',.3,.38],[10,'fifth',.25,.26],[12,'power',.7,.39]]],bass:[[[0,0,0,.4,.77],[2,0,0,.35,.62],[4,0,0,.4,.71],[6,-1,0,.35,.61],[8,0,0,.4,.75],[12,-1,0,.4,.7],[14,0,0,.35,.64]],[[0,0,0,.45,.77],[2,0,0,.35,.61],[4,-1,0,.4,.68],[8,0,0,.75,.74],[12,0,1,.4,.64]],[[0,0,0,.45,.76],[4,0,0,.4,.7],[6,-1,0,.35,.6],[8,0,0,1.2,.74],[14,-1,0,.35,.62]],[[0,0,0,.45,.76],[2,0,0,.35,.6],[6,-1,0,.4,.62],[8,0,0,.7,.73],[12,-1,0,.4,.67],[14,0,0,.4,.63]]],call:[[0,0,.55],[2,2,.45],[6,0,.65],[10,3,.75]],answer:[[2,2,.65],[6,1,.55],[10,0,1.1]],gate:.8},
};
const FORM=[0,1,2,3,4,5,6,7,0,3,4,5,6,1,2,7];
const compForm=[0,1,3,2,0,2,1,3,0,1,3,2,0,3,1,2];
const namedSections=['theme','development','answer','return'];
function makeMelody(p){const c=p.call,a=p.answer,copy=xs=>xs.map(n=>n.slice());return [copy(c),copy(a),[],c.map(([at,d,len],i)=>[at,i?d+1:d,len]),[[Math.min((p.native||4)*4-2,2),a[0][1],(p.native||4)-1]],[],a.map(([at,d,len],i)=>[at,i?d-1:d,len]),[[0,0,(p.native||4)*.65]]];}
const plans=Object.fromEntries(Object.entries(parts).map(([id,p])=>[id,{native:p.native||4,bars:16,comp:compForm.map((n,i)=>p.comp[n]),bass:Array.from({length:16},(_,i)=>p.bass[(i+Math.floor(i/4))%p.bass.length]),melody:FORM.map(n=>makeMelody(p)[n])}]));
plans.legatoFusion={native:4,bars:16,comp:legatoComp,bass:legatoBass,melody:legatoMelody};
plans.blues={native:4,bars:12,comp:bluesComp,bass:bluesBass,melody:bluesMelody};
export const ENSEMBLE_STYLES=Object.fromEntries(Object.entries(plans).map(([id,p])=>[id,{bars:p.bars,native:p.native}]));
export const ensembleStyle=s=>Object.hasOwn(plans,s.accompanimentStyle||s.sequenceStyle||s.backingStyle)?s.accompanimentStyle||s.sequenceStyle||s.backingStyle:null;
const mappedCache=new Map();
// Cache meter adaptation outside the sample loop. Empty cells remain deliberate rests.
function planFor(s){const id=ensembleStyle(s);if(!id)return null;const p=plans[id],beats=Math.max(1,s.beats||p.native),key=id+':'+beats;if(mappedCache.has(key))return mappedCache.get(key);const ratio=beats/p.native;
 const slots=cell=>{const found=new Set();return cell.flatMap(([at,...rest])=>{const position=Math.min(beats*4-1,Math.round(at*ratio)),key=position+':'+rest[0];if(found.has(key))return [];found.add(key);return [[position,...rest]];});};
 const plan={id,beats,bars:p.bars,comp:p.comp.map(cell=>slots(cell.map(([at,role,len,...tail])=>[at,role,len*ratio,...tail]))),bass:p.bass.map(cell=>slots(cell.map(([at,index,oct,len,gain])=>[at,index,oct,len*ratio,gain]))),melody:p.melody.map(cell=>cell.map(([at,degree,len])=>[at*ratio,degree,len*ratio]))};mappedCache.set(key,plan);return plan;}
export function ensembleComping(s,bar){const p=planFor(s);return p?{variant:namedSections[Math.floor(bar%p.bars/4)]||'return',cell:p.comp[bar%p.comp.length]}:null;}
export function ensembleBass(s,bar){const p=planFor(s);return p?p.bass[bar%p.bass.length]:null;}
const drumBeds={
 popRock:[[[0,'kick',.65],[8,'kick',.57],[4,'snare',.58],[12,'snare',.63]],[[0,'kick',.65],[6,'kick',.35],[8,'kick',.56],[4,'snare',.58],[12,'snare',.62]]],
 traditionalJazz:[[[0,'kick',.25],[6,'snare',.17],[12,'snare',.21]],[[0,'kick',.23],[10,'snare',.18],[14,'snare',.12]]],

 motown:[[[0,'kick',.61],[4,'kick',.4],[8,'kick',.56],[12,'kick',.37],[4,'snare',.54],[12,'snare',.59]],[[0,'kick',.61],[6,'kick',.32],[8,'kick',.55],[12,'kick',.36],[4,'snare',.54],[12,'snare',.59]]],
 funk:[[[0,'kick',.61],[7,'kick',.38],[10,'kick',.43],[4,'snare',.56],[12,'snare',.61],[3,'snare',.09],[11,'snare',.1]],[[0,'kick',.61],[6,'kick',.39],[14,'kick',.33],[4,'snare',.56],[12,'snare',.61],[7,'snare',.1]]],
 neoSoul:[[[0,'kick',.53],[6,'kick',.31],[11,'kick',.33],[4,'snare',.44],[12,'snare',.49],[7,'snare',.075]],[[0,'kick',.53],[8,'kick',.38],[14,'kick',.27],[4,'snare',.44],[12,'snare',.49]]],
 ballad:[[[0,'kick',.22],[8,'kick',.16],[12,'rim',.19]],[[0,'kick',.22],[4,'rim',.17]]],
};
function append(cell,event){if(!cell.some(n=>n[0]===event[0]&&n[1]===event[1]))cell.push(event);}
function drumCell(id,bar){
 const p=plans[id],native=p.native,end=native*4,chapter=Math.floor(bar/4),last=bar===p.bars-1,answer=bar%4===3,rest=!p.melody[bar%p.melody.length].length;
 let cell;
 if(id==='modernStraightJazz')return modernJazzDrumCell(bar,answer||last);
 if(id==='fusionJazz')return fusionJazzDrumCell(bar,answer||last);
 if(id==='legatoFusion'||id==='blues'){
  // Preserve the approved B rhythms in 4/4, with ride timekeeping for Blues.
  cell=[];if(id==='blues'){for(let i=0;i<16;i+=2)cell.push([i,'ride',i%4===0?.24:.12]);cell.push([0,'kick',.58],[8,'kick',.47],[4,'snare',.51],[12,'snare',.55]);if(bar%3===1)cell.push([6,'kick',.29]);}
  else {for(let i=0;i<16;i+=2)cell.push([i,i===8&&bar%4===2?'rideBell':'ride',i%4===0?.22:.11]);cell.push([0,'kick',.35],[bar%2?10:7,'kick',.23],[bar%2?6:5,'snare',.21],[12,'snare',.28]);}
  if(answer||last)cell.push(...(last?[[10,'snare',.16],[13,'tomHigh',.21],[14,'tomLow',.24]]:[[14,'snare',.15]]));return cell;
 }
 if(id==='latin'||id==='bossa'){
  cell=latinDrumCell(id==='latin'?'tumbao':'bossa',bar).map(n=>n.slice());
  if(id==='latin'&&chapter>=2)for(const n of SON_BELL)append(cell,n);
  // Clave, conga open tones, Brazilian feet and two-bar orientation never move.
  if(id==='latin'&&rest&&answer)append(cell,[end-1,'congaMute',.11]);return cell;
 }
 if(ADDITIONAL_STYLES[id])cell=ADDITIONAL_STYLES[id].drums[(bar+chapter*2)%ADDITIONAL_STYLES[id].drums.length].map(n=>n.slice());
 else {
  cell=drumBeds[id][bar%2].map(n=>n.slice());const jazz=id==='traditionalJazz',ride=jazz||id==='ballad';
  for(let beat=0;beat<native;beat++){
   append(cell,[beat*4,ride?'ride':'hat',ride?(id==='ballad'?.12:beat%2?.23:.2):beat%2?.19:.23]);
   if(id!=='ballad'&&(!jazz||beat%2===1))append(cell,[beat*4+2,ride?'ride':'hat',ride?.12:.1]);
   if(jazz&&beat%2===1)append(cell,[beat*4,'hatPedal',.1]);
   if(id==='motown'){append(cell,[beat*4,'tambourine',beat%2?.14:.085]);append(cell,[beat*4+2,'tambourine',.065]);}
  }
 }
 const latinFamily=['afroCuban68','samba'].includes(id),quiet=['ballad','neoSoul','slowSoul128'].includes(id);
 // Small answers live in melodic gaps; full fills are reserved for section ends.
 if(rest&&!latinFamily&&!['reggae','ballad'].includes(id))append(cell,[end-3,'snare',quiet?.08:.12]);
 if(answer&&!last){const notes=id==='reggae'?[[end-2,'rim',.16]]:latinFamily?[[end-2,'congaMute',.1]]:id==='slowSoul128'?[[end-2,'snare',.14]]:[[end-2,'snare',quiet?.1:.15]];for(const n of notes)append(cell,n);}
 if(last){
  const notes=latinFamily?[[end-4,'congaMute',.12],[end-2,'congaOpen',.18]]:id==='reggae'?[[end-2,'rim',.2]]:id==='ballad'?[[end-2,'hatPedal',.085]]:id==='slowSoul128'?[[end-3,'snare',.13],[end-2,'snare',.18]]:[[end-4,'snare',quiet?.13:.18],[end-2,'tomHigh',quiet?.15:id==='hardRock'?.28:.2],[end-1,'tomLow',quiet?.17:id==='hardRock'?.32:.23]];
  for(const n of notes)append(cell,n);
 }
 // Brief openings are a deliberate lift, rather than an open hat every other bar.
 if(['popRock','funk','motown','hardRock'].includes(id)&&bar%8===6){cell=cell.filter(n=>!(n[0]===end-2&&n[1]==='hat'));append(cell,[end-2,'hatOpen',.14]);}
 return cell;
}
const drumForms=Object.fromEntries(Object.entries(plans).map(([id,p])=>[id,Array.from({length:p.bars},(_,bar)=>drumCell(id,bar))]));
const drumMeters=new Map();
export function ensembleDrums(s,bar){const id=ensembleStyle(s);if(!id)return null;const native=plans[id].native,beats=Math.max(1,s.beats||native),key=id+':'+beats;let forms=drumMeters.get(key);if(!forms){forms=drumForms[id].map(cell=>{const seen=new Set();return cell.flatMap(([at,piece,gain])=>{const slot=Math.min(beats*4-1,Math.round(at*beats/native)),key=slot+':'+piece;if(seen.has(key))return [];seen.add(key);return [[slot,piece,gain]];});});drumMeters.set(key,forms);}return forms[bar%forms.length];}
export function ensembleSequenceStep(s,grid,length){
 const p=planFor(s);if(!p||!length||!(Number(s.sequenceDensity)>0))return null;
 const rate=Math.max(1,Number(s.sequenceRate)||2),barGrid=rate*p.beats,bar=Math.floor(grid/barGrid),slot=grid%barGrid,activity=s.sequenceActivity||'countermelody';
 if(activity==='supporting'&&bar%4===1)return null;
 const phraseBar=s.sequenceDevelopment==='stable'||s.backingVariation===0?bar%4:bar%p.melody.length;
 const source=p.melody[phraseBar],notes=activity==='supporting'?source.filter((_,i)=>i%2===0||i===source.length-1):source;
 const cell=activity==='featured'&&!notes.length?[[p.beats,0,.6],[p.beats*2,2,.6],[p.beats*3,1,.8]]:notes;
 const seen=new Set(),events=[];
 for(const [at,degree,len]of cell){const local=Math.min(barGrid-1,Math.round(at*rate/4));if(!seen.has(local)){seen.add(local);events.push({local,degree,duration:Math.min(len,p.beats-local/rate+.08)});}}
 const index=events.findIndex(n=>n.local===slot);if(index<0)return null;const event=events[index];
 return {...event,index:((event.degree%length)+length)%length,semitones:0,velocity:activity==='featured'?.58:activity==='supporting'?.48:.54,target:index===0?'guide':index===events.length-1?'resolve':null,targetIndex:Math.floor(bar/4)%2,phraseStart:index===0,phraseEnd:index===events.length-1,phraseBar:bar%4,phraseId:bar,section:namedSections[Math.floor(bar%p.bars/4)]||'return'};
}
