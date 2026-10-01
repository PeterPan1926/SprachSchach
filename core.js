import {Chess} from './chess.js';
export {Chess};
export const names={de:{p:'Bauer',n:'Springer',b:'Läufer',r:'Turm',q:'Dame',k:'König'},en:{p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'}};
const numberWords={eins:'1',ein:'1',one:'1',zwei:'2',two:'2',drei:'3',three:'3',vier:'4',four:'4',fünf:'5',funf:'5',five:'5',sechs:'6',six:'6',sieben:'7',seven:'7',acht:'8',eight:'8'};
export function parseMove(game,input){
 let s=input.toLowerCase().replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();
 let legal=game.moves({verbose:true});
 if(/rochade|castl/.test(s)){
  const long=/lang|long|queen|damen/.test(s),short=/kurz|short|king|könig/.test(s);
  return legal.filter(m=>m.san===(long?'O-O-O':short?'O-O':(m.san.startsWith('O-O')?m.san:'')));
 }
 s=s.replace(/\b(eins|ein|one|zwei|two|drei|three|vier|four|fünf|funf|five|sechs|six|sieben|seven|acht|eight)\b/g,w=>numberWords[w]);
 s=s.replace(/\b(be|bee)\b/g,'b').replace(/\b(zeh|cee|see)\b/g,'c').replace(/\b(dee)\b/g,'d').replace(/\b(eh)\b/g,'e').replace(/\b(ef|eff)\b/g,'f').replace(/\b(gee)\b/g,'g').replace(/\b(ha|aitch)\b/g,'h');
 const squares=[...s.matchAll(/\b([a-h])\s*([1-8])\b/g)].map(m=>m[1]+m[2]);
 const pieceWords={bauer:'p',pawn:'p',springer:'n',knight:'n',läufer:'b',laufer:'b',bishop:'b',turm:'r',rook:'r',dame:'q',queen:'q',könig:'k',konig:'k',king:'k'};
 let piece=null; for(const [word,p] of Object.entries(pieceWords))if(new RegExp('\\b'+word+'\\b').test(s)){piece=p;break;}
 let promotion=null;const promo=s.match(/(?:umwandlung|umwandeln|promote|promotion|zu|into|to a)\s+(dame|queen|turm|rook|läufer|bishop|springer|knight)/);if(promo)promotion=pieceWords[promo[1]];
 if(squares.length>=2)legal=legal.filter(m=>m.from===squares[0]&&m.to===squares[1]);
 else if(squares.length===1)legal=legal.filter(m=>m.to===squares[0]&&(!piece||m.piece===piece));
 else{try{const clone=new Chess(game.fen());const m=clone.move(input.trim());return m?legal.filter(x=>x.from===m.from&&x.to===m.to&&x.promotion===m.promotion):[];}catch{return [];}}
 if(promotion)legal=legal.filter(m=>m.promotion===promotion);
 return legal;
}
export function explain(m,g,lang){
 const de=lang==='de',p=names[lang][m.piece],details=[];
 let text=de?`${p} von ${m.from} nach ${m.to}.`:`${p} from ${m.from} to ${m.to}.`;
 if(m.flags.includes('k')||m.flags.includes('q')){const rank=m.color==='w'?'1':'8',short=m.flags.includes('k');details.push(de?`Bei der Rochade zieht der Turm von ${short?'h':'a'}${rank} nach ${short?'f':'d'}${rank}.`:`Castling moves the rook from ${short?'h':'a'}${rank} to ${short?'f':'d'}${rank}.`);}
 if(m.captured){const square=m.flags.includes('e')?m.to[0]+m.from[1]:m.to;const captured=m.captured==='q'?'die gegnerische Dame':`den gegnerischen ${m.captured==='p'?'Bauern':names.de[m.captured]}`;details.push(de?`Der Zug schlägt ${captured} auf ${square}${m.flags.includes('e')?' en passant':''}.`:`The move captures an opposing ${names.en[m.captured]} on ${square}${m.flags.includes('e')?' en passant':''}.`);}
 if(m.promotion)details.push(de?`Der Bauer wird in ${m.promotion==='q'?'eine Dame':'einen '+names.de[m.promotion]} umgewandelt.`:`The pawn promotes to a ${names.en[m.promotion]}.`);
 const moved=g.get(m.to);
 if(moved&&moved.color===m.color){
  const subject=(moved.type==='q'?'die ':'der ')+names.de[moved.type];
  const controls=square=>g.attackers(square,m.color).includes(m.to);
  const targets=g.board().flat().filter(piece=>piece&&piece.color!==m.color&&piece.type!=='k'&&controls(piece.square));
  const values={q:9,r:5,b:3,n:3,p:1};targets.sort((a,b)=>values[b.type]-values[a.type]);
  if(targets.length){const list=targets.slice(0,2).map(piece=>de?`${piece.type==='q'?'die gegnerische Dame':piece.type==='p'?'den gegnerischen Bauern':'den gegnerischen '+names.de[piece.type]} auf ${piece.square}`:`the ${names.en[piece.type]} on ${piece.square}`).join(de?' und ':' and ');details.push(de?`Von ${m.to} aus greift ${subject} ${list} an.`:`From ${m.to}, the ${names.en[moved.type]} attacks ${list}.`);}
  else{const center=['d4','e4','d5','e5'].filter(controls);if(center.length)details.push(de?`Von ${m.to} aus kontrolliert ${subject} ${center.join(', ')} im Zentrum.`:`From ${m.to}, the ${names.en[moved.type]} controls ${center.join(', ')} in the center.`);else if(['d4','e4','d5','e5'].includes(m.to))details.push(de?`Der Zug besetzt das Zentrumsfeld ${m.to}.`:`The move occupies the central square ${m.to}.`);}
 }
 if(g.isCheckmate())details.push(de?'Schachmatt. Die Partie ist beendet.':'Checkmate. The game is over.');
 else if(g.isCheck())details.push(de?'Der gegnerische König steht im Schach.':'The opposing king is in check.');
 else if(g.isStalemate())details.push(de?'Patt: Die Seite am Zug hat keinen legalen Zug und steht nicht im Schach.':'Stalemate: the side to move has no legal move and is not in check.');
 else if(g.isThreefoldRepetition())details.push(de?'Remis durch dreifache Stellungswiederholung.':'Draw by threefold repetition.');
 else if(g.isInsufficientMaterial())details.push(de?'Remis wegen unzureichenden Materials.':'Draw by insufficient material.');
 else if(g.isDraw())details.push(de?'Remis nach der Fünfzig-Züge-Regel.':'Draw under the fifty-move rule.');
 return [text,...details].join(' ');
}
// Also suppress old boilerplate when archived descriptions are read again.
export function meaningfulText(text){return text
 .replace(/(?:Die Figur wird (?:neu )?positioniert|The piece is (?:re)?positioned)\.?/gi,'')
 .replace(/Ob der Zug gut ist,? hängt von der gesamten Stellung ab\.?/gi,'')
 .replace(/Its quality depends on the whole position\.?/gi,'')
 .replace(/[^\S\n]{2,}/g,' ').trim();}

export function spokenText(text,lang){const words=lang==='de'?['','eins','zwei','drei','vier','fünf','sechs','sieben','acht']:['','one','two','three','four','five','six','seven','eight'];return meaningfulText(text).replace(/\b([a-h])([1-8])\b/g,(_,file,rank)=>file.toUpperCase()+' '+words[Number(rank)]);}
