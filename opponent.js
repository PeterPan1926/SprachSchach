import {MODELS} from './mephisto-models.js';
export const DEFAULT_OPPONENT={type:'stockfish',name:'Stockfish 17.1'};
export function normalizeOpponent(value){
 return value?.type==='mame'&&MODELS[value.machine]
  ?{type:'mame',machine:value.machine,name:MODELS[value.machine].name}:{...DEFAULT_OPPONENT};
}
export const opponentName=session=>normalizeOpponent(session?.opponent).name;
export const isEmulated=session=>normalizeOpponent(session?.opponent).type==='mame';
