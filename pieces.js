import {meridaPieces} from './merida.js';
// Actual Merida SVG artwork; retain its explicit white/black colors.
const templates=new Map();let serial=0;
export function renderPiece(element,piece){
 element.replaceChildren();if(!piece)return;
 const p=typeof piece==='string'?{type:piece.toLowerCase(),color:piece===piece.toUpperCase()?'w':'b'}:piece;
 const key=p.color+p.type.toUpperCase();if(!meridaPieces[key])return;
 if(!templates.has(key))templates.set(key,new DOMParser().parseFromString(meridaPieces[key],'image/svg+xml').documentElement);
 const svg=templates.get(key).cloneNode(true),prefix='merida-'+(++serial)+'-';
 // Merida gradients reuse IDs across source files. Each rendered instance
 // needs its own IDs, including pieces in diagrams and the import palette.
 const ids=new Map();for(const node of svg.querySelectorAll('[id]')){const id=node.id;ids.set(id,prefix+id);node.id=prefix+id;}
 for(const node of [svg,...svg.querySelectorAll('*')])for(const attr of [...node.attributes]){
  let value=attr.value.replace(/url\(#([^)]*)\)/g,(match,id)=>ids.has(id)?'url(#'+ids.get(id)+')':match);
  if((attr.localName==='href')&&value.startsWith('#')&&ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));
  if(value!==attr.value)node.setAttributeNS(attr.namespaceURI,attr.name,value);
 }
 svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.classList.add('classic-piece');svg.dataset.type=p.type;svg.dataset.color=p.color;
 element.append(svg);
}
