import {Chess,names} from './core.js';
import {uci,terminalEvaluation} from './review.js';
import {lcdVariation,lcdScore} from './lcd.js';
export const conversationMode=value=>value==='chat'?'chat':'commands';
export const conversationProvider=value=>['openai','gemini','local'].includes(value)?value:'openai';
export function conversationModeIntent(text){const s=text.trim().toLowerCase();if(/^(?:bitte |please )?(?:plauder[- ]?modus|plaudern|chat mode|conversation mode)(?: (?:an|ein|einschalten|on))?[.! ]*$/.test(s))return 'chat';if(/^(?:bitte |please )?(?:zug[- ]?modus|befehls[- ]?modus|move mode|command mode|plauder[- ]?modus aus|chat mode off)[.! ]*$/.test(s))return 'commands';return null;}
export async function positionConversation(game,question,lang,analyze,startFen,recent=[]){
 const board=game.board().flat().filter(Boolean),values={p:1,n:3,b:3,r:5,q:9,k:0};
 const material={},pawns={};for(const color of ['w','b']){const own=board.filter(p=>p.color===color),files=Array.from({length:8},(_,i)=>own.filter(p=>p.type==='p'&&p.square[0]===String.fromCharCode(97+i)).length);material[color]={points:own.reduce((sum,p)=>sum+values[p.type],0),pieces:own.map(p=>({type:p.type,square:p.square}))};pawns[color]={doubled_files:files.flatMap((n,i)=>n>1?[String.fromCharCode(97+i)]:[]),isolated_files:files.flatMap((n,i)=>n&&!files[i-1]&&!files[i+1]?[String.fromCharCode(97+i)]:[])};}
 const legal=game.moves({verbose:true}).map(m=>({uci:uci(m),san:m.san}));
 let evaluation=terminalEvaluation(game),analysisError=false;if(!evaluation)try{evaluation=(await analyze(game.history({verbose:true}).map(uci),game.turn())).evaluation;}catch{analysisError=true;}
 const lines=(evaluation?.variations||(evaluation?[evaluation]:[])).slice(0,3).map(e=>({score_white:lcdScore(e),depth:e.depth||0,pv:lcdVariation(game.fen(),e,6).map(m=>({uci:m.uci,san:m.san}))}));
 const context={conversation_mode:'chat',preferred_language:lang,question,board_fen:game.fen(),side_to_move:game.turn(),in_check:game.isCheck(),game_over:game.isGameOver(),legal_moves:legal,material,pawn_structure:pawns,stockfish_lines:lines,analysis_available:!!evaluation&&!analysisError,recent_conversation:recent.slice(-8).map(e=>({role:e.kind==='coach'?'assistant':'user',text:e.text.slice(0,1000),board_fen:e.context?.board_fen||e.fen||null}))};
 const de=lang==='de',difference=material.w.points-material.b.points;const materialText=difference===0?(de?'Das Material ist nach üblichen Figurenwerten ausgeglichen.':'Material is equal by conventional piece values.'):(de?`${difference>0?'Weiß':'Schwarz'} hat rechnerisch ${Math.abs(difference)} Bauerneinheiten mehr Material.`:`${difference>0?'White':'Black'} has ${Math.abs(difference)} more points of material.`);
 const best=lines[0]?.pv[0];const text=[de?`${game.turn()==='w'?'Weiß':'Schwarz'} ist am Zug.`:`${game.turn()==='w'?'White':'Black'} to move.`,materialText,best?(de?`Stockfish schlägt ${best.san} vor; die Bewertung aus Sicht von Weiß ist ${lines[0].score_white}.`:`Stockfish suggests ${best.san}; the White evaluation is ${lines[0].score_white}.`):(de?'Ich habe gerade keine berechnete Fortsetzung.':'I have no calculated continuation right now.'),game.isCheck()?(de?'Der König der Seite am Zug steht im Schach.':'The side to move is in check.'):''].filter(Boolean).join(' ');
 return {context,text};
}
