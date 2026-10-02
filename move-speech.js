import {names} from './core.js';
export const speechDetail=value=>value==='moves'?'moves':'tactics';
export function moveAnnouncement(move,position,lang='de'){
 const de=lang==='de',n=names[lang];let text;
 if(move.flags.includes('k')||move.flags.includes('q'))text=de?(move.flags.includes('k')?'Kurze Rochade.':'Lange Rochade.'):(move.flags.includes('k')?'Kingside castling.':'Queenside castling.');
 else{text=de?`${n[move.piece]} von ${move.from} nach ${move.to}.`:`${n[move.piece]} from ${move.from} to ${move.to}.`;if(move.captured)text+=de?` Schlägt ${n[move.captured]}${move.flags.includes('e')?' en passant':''}.`:` Captures ${n[move.captured]}${move.flags.includes('e')?' en passant':''}.`;if(move.promotion)text+=de?` Umwandlung in ${n[move.promotion]}.`:` Promotes to ${n[move.promotion]}.`;}
 if(position.isCheckmate())text+=de?' Schachmatt.':' Checkmate.';else if(position.isCheck())text+=de?' Schach.':' Check.';return text;
}
export function tacticalMoveSpeech(move,position,lang='de',mode='tactics'){
 const base=moveAnnouncement(move,position,lang);if(speechDetail(mode)==='moves'||position.isGameOver())return base;
 const de=lang==='de',n=names[lang],piece=position.get(move.to),notes=[];
 if(piece?.color===move.color){const targets=position.board().flat().filter(p=>p&&p.color!==move.color&&p.type!=='k'&&position.attackers(p.square,move.color).includes(move.to));const values={q:9,r:5,b:3,n:3,p:1};targets.sort((a,b)=>values[b.type]-values[a.type]);
  if(targets.length)notes.push(de?`${n[piece.type]} auf ${move.to} greift ${targets.slice(0,2).map(p=>`${n[p.type]} auf ${p.square}`).join(' und ')} an.`:`The ${n[piece.type]} on ${move.to} attacks ${targets.slice(0,2).map(p=>`the ${n[p.type]} on ${p.square}`).join(' and ')}.`);
  const captures=position.moves({verbose:true}).filter(m=>m.to===move.to&&m.captured);if(captures.length&&!position.attackers(move.to,move.color).length){const capture=captures[0];notes.push(de?`Achtung: ${n[piece.type]} auf ${move.to} ist ungedeckt und kann von ${n[capture.piece]} auf ${capture.from} geschlagen werden.`:`Warning: the ${n[piece.type]} on ${move.to} is undefended and can be captured by the ${n[capture.piece]} on ${capture.from}.`);}
 }
 return [base,...notes].join(' ');
}
// Both scores are White-normalized and must describe the immediately preceding
// and following position. Never infer a blunder from one score or mere exposure.
export function moveBlunderSpeech(move,before,after,lang='de'){
 if(!before||!after||(!before.terminal&&!(before.depth>=10))||(!after.terminal&&!(after.depth>=10))||!Number.isFinite(before.cp)||!Number.isFinite(after.cp))return '';
 const loss=(before.cp-after.cp)*(move.color==='w'?1:-1);if(loss<200)return '';
 const de=lang==='de',n=names[lang];if(after.mate!==undefined&&after.cp*(move.color==='w'?1:-1)<0)return de?`Stockfish meldet einen möglichen Patzer: ${n[move.piece]} von ${move.from} nach ${move.to}. Danach kann ${move.color==='w'?'Schwarz':'Weiß'} laut Berechnung eine Mattfolge erzwingen.`:`Stockfish indicates a possible blunder: ${n[move.piece]} from ${move.from} to ${move.to}. ${move.color==='w'?'Black':'White'} now has a forced mating line according to the calculation.`;if(before.mate!==undefined)return de?`Stockfish meldet einen möglichen Patzer: ${n[move.piece]} von ${move.from} nach ${move.to}. Die zuvor berechnete Mattfolge geht verloren.`:`Stockfish indicates a possible blunder: ${n[move.piece]} from ${move.from} to ${move.to}. The previously calculated mating line is lost.`;return de?`Stockfish meldet einen möglichen Patzer: ${n[move.piece]} von ${move.from} nach ${move.to}. Die Bewertung verschlechtert sich für ${move.color==='w'?'Weiß':'Schwarz'} um etwa ${(loss/100).toFixed(1)} Bauerneinheiten.`:`Stockfish indicates a possible blunder: ${n[move.piece]} from ${move.from} to ${move.to}. The evaluation worsens for ${move.color==='w'?'White':'Black'} by about ${(loss/100).toFixed(1)} pawns.`;
}
