import {normalizeCustomProgression,recommendedMode} from './custom-progression.js';
function practiceQuality(chord,mode){
 if(chord==='min7')return mode==='dorian'?'min13':'min9';
 if(chord==='maj7')return mode==='lydian'?'maj9sharp11':'maj9';
 if(chord==='dom7')return mode==='lydian_dominant'?'dom13sharp11':'dom13';
 if(chord==='halfDim')return mode==='locrian_natural2'?'halfDim9':'halfDim11';
 return ({min6:'minSixNine',minMaj7:'minMaj9',dom7sharp11:'dom13sharp11',dom9sharp11:'dom13sharp11',dom7sharp5:'dom9sharp5'})[chord]||(chord==='dom7b13'?(mode==='phrygian_dominant'?'dom7b9b13':'dom9b13'):chord);
}
const pitches={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
// Bar arrays are deliberately uncompressed: split bars retain exact two-beat changes.
function standard(id,name,rootName,bars,sections,note,slug,reference=null){
 const key=(pitches[rootName[0]]+(rootName.includes('b')?-1:rootName.includes('#')?1:0)+12)%12;
 const steps=bars.flatMap((bar,index)=>bar.split(' ').map((token,i,parts)=>{
  const [root,sourceChord,guide]=token.split(':'),pc=(pitches[root[0]]+(root.includes('b')?-1:root.includes('#')?1:0)+12)%12;
  const mode=guide||recommendedMode(sourceChord),chord=practiceQuality(sourceChord,mode);
  return {root:(pc-key+12)%12,letter:('CDEFGAB'.indexOf(root[0])-'CDEFGAB'.indexOf(rootName[0])+7)%7,chord,mode,...(parts.length===1?{bars:1}:{beats:4/parts.length}),...(i===0&&sections[index+1]?{section:sections[index+1]}:{})};
 }));
 return {id,name,key,beats:4,barCount:bars.length,form:Object.values(sections).join(' / '),progression:normalizeCustomProgression({name,standardMelody:id,steps,sourceNotes:`Practice arrangement: extensions have been added to illustrate the suggested scale colours, not transcribed from the recording. A chord can support more than one scale; guides remain editable. Dorian minor 13 highlights natural 6; major 9♯11 highlights Lydian; dominant 13♯11 highlights Lydian dominant; 7♭9♭13 highlights Phrygian dominant. Foundation: `+(reference?`${reference.note} ${note} Scale guides are editable suggestions, not source chord symbols.`:`Common performance version (iReal Jazz 1460 changes), concert pitch. ${note} Scale guides are editable suggestions, not part of the source chord symbols. Not verified against a specific Real Book edition.`),sources:reference?reference.sources:[{label:'Changes and version reference',url:`https://jazzchanges.app/${slug}/`}]})};
}
const autumnA=['C:min7','F:dom7','Bb:maj7','Eb:maj7:lydian','A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min6:melodic_minor','G:min6:melodic_minor'];
export const JAZZ_STANDARDS=[
 standard('autumn-leaves','Autumn Leaves','G',[
 ...autumnA,...autumnA,
 'A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min6:melodic_minor','G:min6:melodic_minor','C:min7','F:dom7','Bb:maj7','Eb:maj7:lydian',
 'A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min7 Gb:dom7:lydian_dominant','F:min7 E:dom7:lydian_dominant','A:halfDim:locrian','D:dom7b13:phrygian_dominant','G:min6:melodic_minor','G:min6:melodic_minor'
 ],{1:'A1',9:'A2',17:'B',25:'C'},'32-bar AABC; opening eight bars repeated in full. This version uses minor-six tonics, flat-thirteenth dominants and the chromatic Gm7–Gb7 / Fm7–E7 ending in bars 27–28. Other fake books use different final-eight-bar changes.','autumn-leaves'),
 standard('all-the-things','All the Things You Are','Ab',[
 'F:min7:minor','Bb:min7','Eb:dom7','Ab:maj7','Db:maj7:lydian','G:dom7','C:maj7','C:maj7',
 'C:min7:minor','F:min7','Bb:dom7','Eb:maj7','Ab:maj7:lydian','D:dom7','G:maj7','G:maj7',
 'A:min7','D:dom7','G:maj7','G:maj7','F#:min7','B:dom7','E:maj7','C:dom7sharp5',
 'F:min7:minor','Bb:min7','Eb:dom7','Ab:maj7','Db:maj7:lydian','Db:min7','C:min7:minor','B:dim7:diminished_whole_half','Bb:min7','Eb:dom7','Ab:maj7','G:dom7 C:dom7'
 ],{1:'A1',9:'A2',17:'B',25:'A3 · 12 bars'},'36-bar solo chorus in the sounding opening key area of Ab. Compared with the common version: full-bar G7 and D7 at bars 6 and 14; F#m7–B7 at 21–22; C7♯5 at 24; Dbm7 at 30; G7–C7 at 36. No introduction or chorus-specific solo substitutions included.', '',{
 note:'Pat Metheny, Question and Answer, recorded 21 December 1989 with Dave Holland and Roy Haynes. Changes follow the Weimar Jazz Database solo annotations. These describe the harmonic framework, not every voicing or extension sounded on the recording.',
 sources:[{label:'Weimar Jazz Database · Pat Metheny recording and changes',url:'https://jazzomat.hfm-weimar.de/dbformat/synopsis/solo342.html'}]
 }),
 standard('another-you','There Will Never Be Another You','F',[
 'F:maj7','F:maj7','E:halfDim:locrian','A:dom7b9:phrygian_dominant','D:min7:minor','D:min7:minor','C:min7','F:dom7',
 'Bb:maj7:lydian','Eb:dom9sharp11','F:maj7','D:min7:minor','G:dom7:lydian_dominant','G:dom7:lydian_dominant','G:min7','C:dom7',
 'F:maj7','F:maj7','E:halfDim:locrian','A:dom7b9:phrygian_dominant','D:min7:minor','D:min7:minor','C:min7','F:dom7',
 'Bb:maj7:lydian','Eb:dom9sharp11','F:maj7','B:halfDim:locrian_natural2 E:dom7','F:maj7 Bb:dom7:lydian_dominant','A:min7 D:dom7','G:min7 C:dom7','F:maj7 C:dom7'
 ],{1:'A1',9:'B',17:'A2',25:'C'},'32-bar chorus in F, retaining Eb9♯11 at bars 10 and 26 and all split changes at bars 28–32. The annotated no-chord passage outside the chorus is excluded. The foundation writes the minor-key dominant as A7; this practice arrangement adds b9 to point towards D harmonic minor. The closing tonic retains major-seventh harmony rather than 6.', '',{
 note:'Chet Baker, recorded 15 February 1954 with Russ Freeman, Carson Smith and Bob Neel; listed on Let’s Get Lost in the Weimar Jazz Database. Changes follow its solo annotations, not a complete piano voicing transcription.',
 sources:[{label:'Weimar Jazz Database · Chet Baker recording and changes',url:'https://jazzomat.hfm-weimar.de/dbformat/synopsis/solo74.html'}]
 }),
 standard('blue-bossa','Blue Bossa','C',[
 'C:min7:minor','C:min7:minor','F:min7','Bb:dom7','D:halfDim:locrian','G:dom7b9:phrygian_dominant','C:min7:minor','C:min7:minor',
 'Eb:min7','Ab:dom7','Db:maj7','Db:maj7','D:halfDim:locrian','G:dom7b9:phrygian_dominant','C:min7:minor','D:halfDim:locrian G:dom7b9:phrygian_dominant'
 ],{1:'A',9:'B'},'16-bar practice variant: bar 4 changes from Fm7 to Bb7. All other changes, including G7b9 and the final split turnaround, retain the common iReal version. This is not a verified transcription of the complete Page One arrangement, bass line, introduction or shout chorus.', '',{
 note:'Second Floor Music’s public Blue Bossa notes document Bb7 in bar 4 of the original Page One version, contrasting it with F minor in Dorham’s 1967 Bronx recording. That documented difference supplies the foundation; the practice extensions described above are editorial additions.',
 sources:[{label:'Composer’s publisher · recording differences',url:'https://jazzleadsheets.com/blue-bossa.html'},{label:'Remaining changes · common performance version',url:'https://jazzchanges.app/blue-bossa/'}]
 })
];
