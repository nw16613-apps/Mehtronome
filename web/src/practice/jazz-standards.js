import {normalizeCustomProgression,recommendedMode} from './custom-progression.js';
const pitches={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
// Bar arrays are deliberately uncompressed: split bars retain exact two-beat changes.
function standard(id,name,rootName,bars,sections,note,slug){
 const key=(pitches[rootName[0]]+(rootName.includes('b')?-1:rootName.includes('#')?1:0)+12)%12;
 const steps=bars.flatMap((bar,index)=>bar.split(' ').map((token,i,parts)=>{
  const [root,chord,guide]=token.split(':'),pc=(pitches[root[0]]+(root.includes('b')?-1:root.includes('#')?1:0)+12)%12;
  return {root:(pc-key+12)%12,letter:('CDEFGAB'.indexOf(root[0])-'CDEFGAB'.indexOf(rootName[0])+7)%7,chord,mode:guide||recommendedMode(chord),...(parts.length===1?{bars:1}:{beats:4/parts.length}),...(i===0&&sections[index+1]?{section:sections[index+1]}:{})};
 }));
 return {id,name,key,beats:4,barCount:bars.length,form:Object.values(sections).join(' / '),progression:normalizeCustomProgression({name,steps,sourceNotes:`Common performance version (iReal Jazz 1460 changes), concert pitch. ${note} Scale guides are editable suggestions, not part of the source chord symbols. Not verified against a specific Real Book edition.`,sources:[{label:'Changes and version reference',url:`https://jazzchanges.app/${slug}/`}]})};
}
const autumnA=['C:min7','F:dom7','Bb:maj7','Eb:maj7:lydian','A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min6:melodic_minor','G:min6:melodic_minor'];
export const JAZZ_STANDARDS=[
 standard('autumn-leaves','Autumn Leaves','G',[
 ...autumnA,...autumnA,
 'A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min6:melodic_minor','G:min6:melodic_minor','C:min7','F:dom7','Bb:maj7','Eb:maj7:lydian',
 'A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min7 Gb:dom7:lydian_dominant','F:min7 E:dom7:lydian_dominant','A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min6:melodic_minor','G:min6:melodic_minor'
 ],{1:'A1',9:'A2',17:'B',25:'C'},'32-bar AABC; opening eight bars repeated in full. This version uses minor-six tonics, flat-thirteenth dominants and the chromatic Gm7–Gb7 / Fm7–E7 ending in bars 27–28. Other fake books use different final-eight-bar changes.','autumn-leaves'),
 standard('blue-bossa','Blue Bossa','C',[
 'C:min7:minor','C:min7:minor','F:min7','F:min7','D:halfDim:locrian','G:dom7b9:phrygian_dominant','C:min7:minor','C:min7:minor',
 'Eb:min7','Ab:dom7','Db:maj7','Db:maj7','D:halfDim:locrian','G:dom7b9:phrygian_dominant','C:min7:minor','D:halfDim:locrian G:dom7b9:phrygian_dominant'
 ],{1:'A',9:'B'},'16-bar form; Db-major modulation at bar 9, and a two-beat iiø–V in bar 16. The G dominants are explicitly flat-nine in this version.','blue-bossa'),
 standard('all-the-things','All the Things You Are','Ab',[
 'F:min7:minor','Bb:min7','Eb:dom7','Ab:maj7','Db:maj7:lydian','D:min7 G:dom7','C:maj7','C:maj7',
 'C:min7:minor','F:min7','Bb:dom7','Eb:maj7','Ab:maj7:lydian','A:min7 D:dom7','G:maj7','G:maj7',
 'A:min7','D:dom7','G:maj7','G:maj7','F#:halfDim:locrian','B:dom7b9:phrygian_dominant','E:maj7','C:dom7b13:mixolydian_b6',
 'F:min7:minor','Bb:min7','Eb:dom7','Ab:maj7','Db:maj7:lydian','Db:minMaj7:melodic_minor','C:min7:minor','B:dim7:diminished_whole_half','Bb:min7','Eb:dom7','Ab:maj7','G:halfDim:locrian C:dom7b9:phrygian_dominant'
 ],{1:'A1',9:'A2',17:'B',25:'A3 · 12 bars'},'Full 36-bar chorus, no introduction. Keeps the split ii–Vs at bars 6 and 14, F#ø7–B7b9 at 21–22, C7b13 at 24, Dbm(maj7) at 30, Bdim7 at 32 and the split turnaround at 36. Versions with F#m7 at 21 or Dbm7 at 30 are also common.','all-the-things-you-are'),
 standard('another-you','There Will Never Be Another You','Eb',[
 'Eb:maj7','Eb:maj7','D:halfDim:locrian','G:dom7b9:phrygian_dominant','C:min7:minor','C:min7:minor','Bb:min7','Eb:dom7',
 'Ab:maj7:lydian','Db:dom7sharp11:lydian_dominant','Eb:maj7','C:min7:minor','F:dom7:lydian_dominant','F:dom7:lydian_dominant','F:min7','Bb:dom7',
 'Eb:maj7','Eb:maj7','D:halfDim:locrian','G:dom7b9:phrygian_dominant','C:min7:minor','C:min7:minor','Bb:min7','Eb:dom7',
 'Ab:maj7:lydian','Db:dom7sharp11:lydian_dominant','Eb:maj7','A:halfDim:locrian_natural2 D:dom7','Eb:maj7 Ab:dom7:lydian_dominant','G:min7 C:dom7','F:min7 Bb:dom7','Eb:six Bb:dom7'
 ],{1:'A1',9:'B',17:'A2',25:'C'},'32-bar ABAC; retains the minor ii–V, backdoor Db7#11 and the two-chords-per-bar closing passage (28–32). Last-four-bar changes differ between recordings and fake-book editions.','there-will-never-be-another-you')
];
