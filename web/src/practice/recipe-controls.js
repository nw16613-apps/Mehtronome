import {fretboardStudyControls} from '../guitar/fretboard-study.js';
import {fingeringOptions,materialKind} from './material-hierarchy.js';
import {contentMaterial,contentSource,contentFamily,contentFamilies} from './exercise-catalogue.js';
import {SCALE_SEQUENCE_FAMILIES} from './exercise-library.js';
import {arpeggioPatternGroups} from '../guitar/arpeggio-patterns.js';
import {traversalControls} from '../guitar/neck-traversal.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function recipePatterns(view,family=contentFamily(view)){
 if(family.startsWith('arp_'))return arpeggioPatternGroups(view.material,family.slice(4)).flatMap(g=>g.items).map(([value,label])=>({value,label,field:'arpeggioPattern'}));
 if(SCALE_SEQUENCE_FAMILIES[family])return SCALE_SEQUENCE_FAMILIES[family].map(([id,label])=>({value:(contentMaterial(view)==='scale'?'':'arpseq_')+id,label,field:'study'}));
 return [];
}
const menu=(id,label,items,value)=>`<label>${label}<select id="${id}">${items.map(([id,name])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`;
export function studyRecipeControls(h,view){
 const patterns=recipePatterns(view),family=contentFamily(view),pattern=patterns[0]?.field==='study'?view.study:view.arpeggioPattern;
 return `<section class="study-practice-recipe" aria-label="Shared practice setup"><div class="study-path-fields">${fretboardStudyControls(h,view).replaceAll('guitar-','study-recipe-')}${menu('study-recipe-fingering','Fingering',fingeringOptions(view),view.fingering)}${menu('study-recipe-family','Pattern family',contentFamilies(contentMaterial(view),contentSource(view),view),family)}${patterns.length?menu('study-recipe-pattern','Pattern',patterns.map(p=>[p.value,p.label]),pattern):''}${menu('study-recipe-motion','Starting direction',[['ascending','Upward first'],['descending','Downward first']],view.motion)}${menu('study-recipe-rhythm','Rhythm',[['eighths','Eighth notes'],['triplets','Eighth-note triplets'],['sixteenths','Sixteenth notes']],view.rhythm)}</div>${traversalControls(view,'study-recipe').replaceAll('data-neck-field','data-recipe-field').replace(/<label>Fingering[\s\S]*?<\/label>/,'')}<button type="button" class="practice-button" id="study-recipe-variations">Pattern variations →</button></section>`;
}

const fields=['study','material','scaleCollection','source','pattern','fingering','inversion','fingeringFret','fingeringStringSet','spreadSource','traversal','traversalStrings','traversalStart','traversalEnd','traversalShiftStrings','traversalCell','traversalPositionOrder','traversalTurn','motion','rhythm','entryTone','startTone','sequenceAdvance','sequenceOrder','arpeggioSequence','arpeggioSource','arpeggioPattern','arpeggioRegister','arpeggioRoutine','arpeggioApproach','enclosurePattern','enclosureTarget'];
export const PRACTICE_RECIPE_KEY='mehtronome-practice-recipe-v1';
export const practiceRecipe=v=>Object.fromEntries(fields.filter(k=>v[k]!==undefined).map(k=>[k,v[k]]));

export function practiceRecipeKey(view){let hash=2166136261;for(const c of JSON.stringify(practiceRecipe(view)))hash=Math.imul(hash^c.charCodeAt(0),16777619);return (hash>>>0).toString(36);}

export function practiceRecipeLabel(view){
 const material=contentMaterial(view),kind=materialKind(view),name=kind==='chords'?(material==='triad'?'Triad chords':'Seventh chords'):material==='scale'?'Scale':material==='triad'?'Triad arpeggios':'Seventh arpeggios';
 const family=contentFamily(view),pattern=recipePatterns(view).find(p=>view[p.field]===p.value)?.label||contentFamilies(material,contentSource(view),view).find(([id])=>id===family)?.[1],fingering=fingeringOptions(view).find(([id])=>id===view.fingering)?.[1];
 return [name,pattern,fingering].filter(Boolean).join(' · ');
}
