import {Chess} from './core.js';
import {variationMoves,positionLineId} from './variations.js';
// DOM text only: imported SAN/comments never become HTML.
export function renderNotation(container,session,activeId,ply,onSelect,lang='de'){
 const currentId=positionLineId(session,activeId,ply),oldScroll=container.scrollTop,vars=session.variations||[],fragment=document.createDocumentFragment();
 const button=(text,id,target)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.line=id||'';b.dataset.ply=target;if((currentId||null)===(id||null)&&ply===target){b.classList.add('current-move');b.setAttribute('aria-current','true');}b.onclick=()=>onSelect(id,target);return b;};
 fragment.append(button(lang==='de'?'Start':'Start',null,0));
 function line(id=null,depth=0){if(depth>=30)return;const v=vars.find(v=>v.id===id),moves=variationMoves(session,id),g=new Chess(session.startFen),group=document.createElement('span');group.className=id?'notation-branch':'notation-main';if(id){group.append(' (',button(lang==='de'?'Abzweig':'Fork',id,v.basePly));}for(let i=0;i<moves.length;i++){const m=g.move(moves[i]);if(i<(v?.basePly||0))continue;group.append(button(`${m.before.split(' ')[5]}${m.color==='w'?'.':'…'} ${m.san}`,id,i+1));for(const child of vars.filter(c=>(c.parentId||null)===id&&c.basePly===i&&c.moves.length)){group.append(line(child.id,depth+1));}}if(id)group.append(') ');return group;}
 fragment.append(line(), ' '+(session.pgn?.match(/\[Result "([^"]+)"\]/)?.[1]||'*'));container.replaceChildren(fragment);container.scrollTop=oldScroll;
}
