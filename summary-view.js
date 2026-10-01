import {renderPiece} from './pieces.js';
import {Chess,names} from './core.js';
const glyph={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
export function renderSummary(container,parts,lang='de'){
 const fragment=document.createDocumentFragment();
 for(const part of parts){const paragraph=document.createElement('p');paragraph.textContent=part.text;fragment.append(paragraph);if(part.position)fragment.append(positionDiagram(part.position,lang));}
 container.replaceChildren(fragment);
}
function positionDiagram(position,lang){
 const de=lang==='de',g=new Chess(position.fen),black=position.orientation==='b',files=black?'hgfedcba':'abcdefgh',ranks=black?'12345678':'87654321';
 const figure=document.createElement('figure');figure.className='position-diagram';figure.dataset.ply=position.ply;figure.dataset.fen=position.fen;
 const caption=document.createElement('figcaption');const label=`${position.number||Math.ceil(position.ply/2)}${(position.color?position.color==='w':position.ply%2)?'.':'...'} ${position.san}`;
 caption.textContent=position.title|| (position.initial?(de?'Übernommene Ausgangsstellung':'Imported starting position'):(de?'Stellung nach ':'Position after ')+label+` · ${position.move?.from} → ${position.move?.to}`);
 const board=document.createElement('div');board.className='diagram-board';board.setAttribute('role','img');
 const description=[];
 for(const rank of ranks)for(const file of files){const sq=file+rank,p=g.get(sq),cell=document.createElement('span');cell.className='diagram-square'+((file.charCodeAt(0)+Number(rank))%2===0?' dark':'')+(p?.color==='w'?' white':'')+(sq===position.move?.from?' diagram-from':'')+(sq===position.move?.to?' diagram-to':'');cell.dataset.square=sq;renderPiece(cell,p);cell.setAttribute('aria-hidden','true');if(p)description.push((de?(p.color==='w'?'Weiß':'Schwarz'):(p.color==='w'?'White':'Black'))+' '+names[lang][p.type]+' '+sq);board.append(cell);}
 board.setAttribute('aria-label',caption.textContent+'. '+description.join(', '));
 const legend=document.createElement('small');legend.textContent=position.initial?(black?(de?'Schwarz unten':'Black at bottom'):(de?'Weiß unten':'White at bottom')):de?`Gelb: Startfeld · Grün: Zielfeld · ${black?'Schwarz':'Weiß'} unten`:`Yellow: origin · Green: destination · ${black?'Black':'White'} at bottom`;
 figure.append(caption,board,legend);return figure;
}
