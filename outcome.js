const key=g=>g.history({verbose:true}).map(m=>m.from+m.to+(m.promotion||'')).join(' ');
export function declaredOutcome(session,g){const o=session.outcome;return o&&['1-0','0-1','1/2-1/2'].includes(o.result)&&o.fen===g.fen()&&o.moves===key(g)?o:null;}
export function finishOutcome(session,g,reason,color){if(g.isGameOver())throw Error('Game already ended');if(!['resignation','agreement'].includes(reason)||!['w','b'].includes(color))throw Error('Invalid result');session.outcome={result:reason==='agreement'?'1/2-1/2':color==='w'?'0-1':'1-0',reason,color,fen:g.fen(),moves:key(g)};return session.outcome;}
export function outcomeText(session,g,lang){const o=declaredOutcome(session,g);if(!o)return null;return o.reason==='agreement'?(lang==='de'?'Remis vereinbart.':'Draw by agreement.'):o.color==='w'?(lang==='de'?'Weiß gibt auf. Schwarz gewinnt.':'White resigns. Black wins.'):(lang==='de'?'Schwarz gibt auf. Weiß gewinnt.':'Black resigns. White wins.');}
// Stockfish has no UCI draw negotiation: the app accepts when the computer is not ahead.
export function acceptsDraw(evaluation,human){return !!evaluation&&Number.isFinite(evaluation.cp)&&evaluation.cp*(human==='w'?1:-1)>=-35;}
