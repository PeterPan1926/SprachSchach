import {uci} from './review.js';
import {Chess} from './core.js';
import {declaredOutcome} from './outcome.js';
import {variationsPgn} from './variations.js';
export function pgnResult(game){if(game.isCheckmate())return game.turn()==='w'?'0-1':'1-0';return game.isDraw()?'1/2-1/2':'*';}
export function sessionPgn(session,currentGame=null){const g=new Chess(session.startFen),comments=new Map((session.sourceComments||[]).map(c=>[c.fen,c.comment]));const apply=m=>{g.move(m);if(comments.has(g.fen()))g.setComment(comments.get(g.fen()));};if(comments.has(g.fen()))g.setComment(comments.get(g.fen()));if(currentGame){for(const m of currentGame.history({verbose:true}))apply({from:m.from,to:m.to,promotion:m.promotion});}else for(const m of session.moves||[])apply(m);
 const date=new Date(session.created);let pgnDate='????.??.??';if(!Number.isNaN(date.getTime())){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const part=type=>parts.find(p=>p.type===type).value;pgnDate=`${part('year')}.${part('month')}.${part('day')}`;}
 for(const [tag,value]of Object.entries({Event:'SprachSchach',Site:'Android',Date:pgnDate,Round:'-',White:session.analysis?'White':session.human==='b'?'Stockfish 17.1':'Player',Black:session.analysis?'Black':session.human==='b'?'Player':'Stockfish 17.1',Result:pgnResult(g)}))g.setHeader(tag,value);
 for(const [tag,value]of Object.entries(session.sourceHeaders||{})){if(/^[A-Za-z][A-Za-z0-9_]{0,49}$/.test(tag)&&!['FEN','SetUp','Result'].includes(tag))g.setHeader(tag,String(value).replace(/[\r\n]/g,' ').replace(/\\/g,"\\\\").replace(/"/g,'\\"').slice(0,512));}
 if(!g.isGameOver()&&g.fen()===session.sourceFinalFen&&g.history({verbose:true}).map(uci).join(' ')===session.sourceUci)g.setHeader('Result',session.sourceResult||'*');
 const declared=declaredOutcome(session,g);if(declared){g.setHeader('Result',declared.result);g.setHeader('Termination',declared.reason==='agreement'?'draw agreement':'resignation');}
 if(session.variations?.length){const result=g.getHeaders().Result||'*',headers=g.pgn().split('\n\n')[0];return headers+'\n\n'+variationsPgn({...session,moves:g.history({verbose:true}).map(m=>({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})}))},g)+' '+result+'\n';}
 return g.pgn({maxWidth:80})+'\n';
}
export function pgnFilename(session){const date=new Date(session.created);const day=Number.isNaN(date.getTime())?'game':new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replace(/[^0-9]/g,'');const id=String(session.id||'game').replace(/[^a-zA-Z0-9]/g,'').slice(0,16)||'game';return `SprachSchach-${day}-${id}.pgn`;}
