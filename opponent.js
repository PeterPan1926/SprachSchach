export const DEFAULT_OPPONENT={type:'stockfish',name:'Stockfish 17.1'};
export function normalizeOpponent(value){
 return value?.type==='mame'&&value.machine==='mm6'
  ?{type:'mame',machine:'mm6',name:'Mephisto MM VI'}:{...DEFAULT_OPPONENT};
}
export const opponentName=session=>normalizeOpponent(session?.opponent).name;
export const isEmulated=session=>normalizeOpponent(session?.opponent).type==='mame';
