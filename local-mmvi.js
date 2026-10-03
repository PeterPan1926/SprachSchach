import {model,validLevel} from './mephisto-models.js';
import {Chess} from './chess.js';
import {EmulatorError} from './emulator-client.js';
const START=new Chess().fen();let sequence=0;const jobs=new Map();
export function localMmviAvailable(){return globalThis.Android?.hasLocalMmvi?.()===true;}
globalThis.localMmviAnswer=(id,move,error)=>{
 const job=jobs.get(id);if(!job)return;
 jobs.delete(id);clearTimeout(job.timer);job.owner.id=null;
 if(error){job.reject(new EmulatorError(error));return;}
 try{if(typeof move!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))throw Error();job.board.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});}
 catch{job.reject(new EmulatorError('illegal_engine_move'));return;}
 job.resolve({move,evaluation:null});
};
export class LocalMmviClient{
 constructor(level='a4',machine='mm6'){this.machine=model(machine).id;this.level=validLevel(this.machine,level)?level:model(this.machine).level;this.id=null;}
 search(moves,turn,{fen=START,game='local'}={}){
  if(fen!==START)return Promise.reject(new EmulatorError('start_position_required'));
  if(!localMmviAvailable())return Promise.reject(new EmulatorError('local_emulator_unavailable'));
  const board=new Chess(fen);try{for(const move of moves)board.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});}catch{return Promise.reject(new EmulatorError('illegal_engine_move'));}
  if(board.turn()!==turn)return Promise.reject(new EmulatorError('stale_engine_move'));
  cancelLocalMmvi();globalThis.resetMmviDisplay?.();const id=this.id=++sequence;
  return new Promise((resolve,reject)=>{
   const job={owner:this,board,resolve,reject,timer:null};jobs.set(id,job);
   try{Android.searchLocalMmvi(id,JSON.stringify({game,moves:[...moves],fen,turn,level:this.level,machine:this.machine}));}catch{jobs.delete(id);clearTimeout(job.timer);this.id=null;reject(new EmulatorError('local_emulator_failed'));}
  });
 }
 abort(error=new EmulatorError('cancelled')){
  if(this.id===null)return;const job=jobs.get(this.id);jobs.delete(this.id);this.id=null;if(job){clearTimeout(job.timer);job.reject(error);Android.cancelLocalMmvi();}
 }
}
export function cancelLocalMmvi(stopIdle=false){for(const job of [...jobs.values()])job.owner.abort();if(stopIdle&&localMmviAvailable())Android.cancelLocalMmvi();}
export async function checkLocalMmvi(level,machine='mm6'){const client=new LocalMmviClient(level,machine);let ticket;try{const pending=client.search([],'w',{game:'local-diagnostic'});ticket=client.id;await pending;return true;}finally{if(sequence===ticket)Android.cancelLocalMmvi();}}
