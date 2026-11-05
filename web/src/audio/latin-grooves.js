// Straight-eighth, two-bar vocabularies. Keep the two sides in order: reordering
// four-bar variations can reverse the clave and break the percussion's phrasing.
// Positions are sixteenths within a 4/4 bar; shorter meters clip the cell.
const bossaHat=[[0,'hat',.10],[2,'hat',.065],[4,'hat',.13],[6,'hat',.065],[8,'hat',.10],[10,'hat',.065],[12,'hat',.13],[14,'hat',.065]];
const bossaFeet=[[0,'kick',.32],[6,'kick',.20],[8,'kick',.30],[14,'kick',.20]];
const bossaShaker=[[2,'shaker',.045],[6,'shaker',.055],[10,'shaker',.045],[14,'shaker',.055]];
const BOSSA=[
 [...bossaFeet,...bossaHat,...bossaShaker,[0,'rim',.28],[6,'rim',.36],[12,'rim',.30]],
 [...bossaFeet,...bossaHat,...bossaShaker,[4,'rim',.32],[10,'rim',.36]],
];
// Conga marcha: quiet muted hand strokes, an accented closed stroke on beat 2,
// then the open tones on 4 and 4-and. Use actual muted/open/tumba recordings.
const marcha=[[0,'congaMute',.085],[2,'congaMute',.065],[4,'congaMute',.31],[6,'congaMute',.08],[8,'congaMute',.085],[10,'congaMute',.065],[12,'congaOpen',.29],[14,'congaOpen',.33]];
const guiro=[[0,'guiroLong',.085],[4,'guiroShort',.075],[6,'guiroShort',.06],[8,'guiroLong',.085],[12,'guiroShort',.075],[14,'guiroShort',.06]];
const feet=[[0,'kick',.16],[8,'kick',.14]];
const SON=[
 [...feet,...marcha,...guiro,[4,'clave',.23],[8,'clave',.23]],
 [...feet,...marcha.map(e=>e[0]===14?[14,'tumbaOpen',.32]:e),...guiro,[0,'clave',.25],[6,'clave',.23],[12,'clave',.24]],
];
// A modest bell section opens the next eight bars; it never replaces the clave
// or conga foundation. It is absent when phrase variation is disabled.
export const SON_BELL=[[0,'cowbell',.14],[2,'cowbell',.075],[6,'cowbell',.10],[8,'cowbell',.14],[10,'cowbell',.075],[14,'cowbell',.10]];
export function latinDrumCell(groove,bar){return (groove==='bossa'?BOSSA:SON)[bar%2];}
