import {isExactVoicing} from '../guitar/fingering-rules.js';
import {SCALE_SEQUENCES,SCALE_SEQUENCE_FAMILY_LABELS} from '../guitar/scale-sequences.js';
import {SCALE_SEQUENCE_FAMILIES,scaleSequenceFamily} from './exercise-library.js';
import {arpeggioFamilies,arpeggioPatternFamily,arpeggioPatternGroups,normalizeArpeggioPattern} from '../guitar/arpeggio-patterns.js';
export const CONTENT_MATERIALS=[['scale','Scale notes'],['triad','Triad arpeggios'],['seventh','Seventh arpeggios']];
export function contentMaterial(v){if(v.exactFingering)return 'shape';return v.study==='positionalscale'||SCALE_SEQUENCES[v.study]||v.study==='pentatonic'?'scale':v.study==='triadpairs'?'triad':v.material==='triad'?'triad':'seventh';}
export function contentSource(v){if(v.exactFingering)return 'selectedChord';if(contentMaterial(v)==='scale')return v.study==='pentatonic'?'pentatonic':'mode';return v.study==='triadpairs'?'triadPair':v.study==='harmonized'?v.arpeggioSource||'diatonic':v.study==='approach'?'diatonic':'selectedChord';}
export function contentSources(material){if(material==='shape')return [['selectedChord','Selected chord · exact shape']];return material==='scale'?[['mode','Current mode / scale'],['pentatonic','Pentatonic superimposition']]:[['selectedChord','Selected chord'],['diatonic','All scale-degree arpeggios'],['chordRoots','Arpeggios from chord-tone roots'],...(material==='triad'?[['triadPair','Triad pair']]:[])];}
export function contentFamily(v){if(['positional','positionalscale'].includes(v.study))return 'continuous';if(SCALE_SEQUENCES[v.study.replace(/^arpseq_/,'')])return scaleSequenceFamily(v.study);if(v.study==='harmonized')return 'arp_'+arpeggioPatternFamily(v.arpeggioPattern);if(v.study.startsWith('enclosures'))return 'enclosures';return v.study;}
export function contentFamilies(material,source,view={}){
 const whole=arpeggioFamilies(material).map(([id,name])=>['arp_'+id,({permutations:'Whole-arpeggio permutations',repeatTone:'Whole-arpeggio repeated-tone orders',returnStart:'Starting-tone pedals',upBack:'Up and back'})[id]||name]);
 if(isExactVoicing(view.fingering))return [['continuous','Continuous voicing traversal'],...whole.map(([id,label])=>[id,id==='arp_permutations'?`Voicing permutations · ${material==='triad'?6:24}`:id==='arp_repeatTone'?`Repeated-tone orders · ${material==='triad'?18:144}`:id==='arp_returnStart'?`Starting-tone pedals · ${material==='triad'?3:4}`:label]),['enclosures','Enclosures'],['doubleapproach','Double chromatic approaches'],['chromaticneighbors','Chromatic neighbours']];
 if(material==='shape')return [['continuous','Continuous traversal']];
 if(source==='pentatonic')return [['pentatonic','Pentatonic patterns']];if(source==='triadPair')return [['triadpairs','Triad-pair lines']];

 if(material!=='scale'&&source!=='selectedChord')return [...whole,...(source==='diatonic'?[['approach','Approach between arpeggios']]:[])];
 return [['continuous','Continuous traversal'],...Object.entries(SCALE_SEQUENCE_FAMILY_LABELS).map(([id,name])=>[id,id==='groups'?'Overlapping note groups':id==='permutations3'?'3-note group permutations (6)':id==='permutations4'?'4-note group permutations (24)':name]),...(material==='scale'?[]:[...whole,['enclosures','Enclosures'],['doubleapproach','Double chromatic approaches'],['chromaticneighbors','Chromatic neighbours']])];
}
export function changeContentFamily(view,family,{material=contentMaterial(view),source=contentSource(view)}={}){
 const previousFamily=contentFamily(view),previousStudy=view.study,previousOrder=view.arpeggioPattern;
 const available=contentFamilies(material,source,view);if(!available.some(([id])=>id===family))family=(available.some(([id])=>id==='continuous')?available[0]:available.find(([id])=>id==='arp_permutations')||available[0])[0];
 view.exactFingering=material==='shape';
 view.material=material==='triad'?'triad':'seventh';view.entryTone='default';view.startTone='default';
 if(family==='continuous')view.study=material==='scale'?'positionalscale':'positional';
 else if(SCALE_SEQUENCE_FAMILIES[family])view.study=(material==='scale'?'':'arpseq_')+(previousFamily===family&&SCALE_SEQUENCES[previousStudy.replace(/^arpseq_/,'')]?previousStudy.replace(/^arpseq_/,''):SCALE_SEQUENCE_FAMILIES[family][0][0]);
 else if(family.startsWith('arp_')){view.study='harmonized';view.arpeggioSource=source;const id=family.slice(4),groups=arpeggioPatternGroups(view.material,id);view.arpeggioPattern=previousFamily===family&&previousOrder?normalizeArpeggioPattern(previousOrder,view.material):groups.length?groups[0].items[0][0]:id;}
 else view.study=family==='enclosures'?'enclosures4':family;
 if(family==='enclosures'&&material==='triad'&&view.enclosureTarget==='3')view.enclosureTarget='all';
 view.arpeggioPattern=normalizeArpeggioPattern(view.arpeggioPattern||'straight',view.material);
 return view;
}
export function changeContentMaterial(view,material){return changeContentFamily(view,contentFamily(view),{material,source:material==='scale'?'mode':contentMaterial(view)==='scale'?'selectedChord':contentSource(view)==='triadPair'&&material!=='triad'?'selectedChord':contentSource(view)});}
export function changeContentSource(view,source){return changeContentFamily(view,contentFamily(view),{source});}
export function groupPatternLabel(id,label,unit='notes'){if(/^groups[3-8]$/.test(id))return `Groups of ${id.at(-1)} ${unit}`;return label;}
