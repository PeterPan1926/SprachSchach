import {parseEvaluation} from './review.js';
import {normalizeEngineConfig} from './engine-settings.js';
export const ENGINE_FILE='./stockfish-17.1-single-a496a04.js';
// One full NNUE engine serves all clients. Moves and coaching preempt display analysis.
class EnginePool {
 constructor(){this.worker=null;this.queue=[];this.active=null;this.foreground=true;this.starting=false;this.idleTimer=null;this.config={threads:1,hash:32};this.workerConfig=null;}
 submit(job){clearTimeout(this.idleTimer);this.queue.push(job);if((this.active?.infinite||this.active?.background)&&!job.infinite&&!job.background)this.interrupt();this.kick();}
 kick(){if(!this.foreground||this.active||!this.queue.length)return;if(this.worker&&JSON.stringify(this.config)!==JSON.stringify(this.workerConfig))this.release();if(!this.worker){this.start();return;}if(this.starting)return;const index=this.queue.findIndex(j=>!j.infinite&&!j.background);const job=this.queue.splice(index<0?0:index,1)[0];if(job.cancelled){this.kick();return;}this.active=job;job.evaluation=null;job.stopping=false;job.state?.('searching');this.worker.postMessage('setoption name Skill Level value '+job.skill);this.worker.postMessage((job.fen?'position fen '+job.fen:'position startpos')+(job.moves.length?' moves '+job.moves.join(' '):''));if(!job.infinite)job.timer=setTimeout(()=>this.fail(new Error('Stockfish search timeout')),30000);this.worker.postMessage(job.infinite?'go infinite':job.nodes?'go nodes '+job.nodes:'go movetime '+job.movetime);}
 start(){if(this.starting)return;this.starting=true;for(const j of this.queue)j.state?.('loading');try{this.workerConfig={...this.config};const worker=this.worker=new Worker(ENGINE_FILE);worker.onerror=()=>{if(this.worker===worker)this.fail(new Error('Stockfish unavailable'));};worker.onmessage=({data})=>{if(this.worker===worker)this.message(data);};}catch(e){this.fail(e);return;}this.startupTimer=setTimeout(()=>this.fail(new Error('Stockfish startup timeout')),60000);this.worker.postMessage('uci');}
 message(data){if(typeof data!=='string')return;if(data==='uciok'){this.worker.postMessage('setoption name Hash value '+this.workerConfig.hash);this.worker.postMessage('setoption name MultiPV value 1');this.worker.postMessage('isready');return;}if(data==='readyok'){clearTimeout(this.startupTimer);this.starting=false;this.kick();return;}const job=this.active;if(!job)return;const score=parseEvaluation(data,job.turn);if(score&&!job.stopping){job.evaluation=score;job.update?.(score);}else if(!job.stopping&&data.startsWith('info ')&&job.evaluation){const time=data.match(/\btime (\d+)/),nodes=data.match(/\bnodes (\d+)/);if(time){job.evaluation={...job.evaluation,timeMs:Number(time[1]),...(nodes?{nodes:Number(nodes[1])}:{})};job.update?.(job.evaluation);}}
  if(data.startsWith('bestmove ')){clearTimeout(job.timer);this.active=null;if(job.stopping){if(!job.cancelled){job.state?.(this.foreground?'queued':'paused');this.queue.push(job);}}else if(!job.cancelled)job.resolve({move:data.split(' ')[1],evaluation:job.evaluation});this.kick();this.scheduleIdle();}}
 interrupt(){const job=this.active;if(!job||job.stopping)return;clearTimeout(job.timer);job.stopping=true;job.state?.(this.foreground?'queued':'paused');this.worker.postMessage('stop');job.timer=setTimeout(()=>this.fail(new Error('Stockfish stop timeout')),5000);}
 cancel(owner,error){for(const job of this.queue.filter(j=>j.owner===owner)){job.cancelled=true;job.reject(error);}this.queue=this.queue.filter(j=>j.owner!==owner);const job=this.active;if(job?.owner===owner){job.cancelled=true;job.reject(error);this.interrupt();}this.scheduleIdle();}
 configure(value){const next=normalizeEngineConfig(value);if(JSON.stringify(next)===JSON.stringify(this.config))return {...this.config};this.config=next;if(this.active)this.interrupt();else{this.release();this.kick();}return {...this.config};}
 setForeground(active){this.foreground=active;if(!active){if(this.active)this.interrupt();for(const j of this.queue)j.state?.('paused');}else this.kick();}
 scheduleIdle(){if(this.active||this.queue.length)return;clearTimeout(this.idleTimer);this.idleTimer=setTimeout(()=>this.release(),30000);}
 release(){clearTimeout(this.idleTimer);clearTimeout(this.startupTimer);this.worker?.terminate();this.worker=null;this.workerConfig=null;this.starting=false;}
 fail(error){const jobs=[...this.queue,...(this.active?[this.active]:[])];this.queue=[];this.active=null;this.release();for(const j of jobs){clearTimeout(j.timer);if(!j.cancelled)j.reject(error);}}
}
const pool=new EnginePool();
export const configureEngine=value=>pool.configure(value);
export const getEngineConfig=()=>({...pool.config});
export const setEngineForeground=active=>pool.setForeground(active);
export class StockfishClient {
 search(moves,turn,{skill=20,nodes=null,movetime=800,fen=null,infinite=false,background=false,onUpdate=null,onState=null}={}){return new Promise((resolve,reject)=>{pool.submit({owner:this,moves:[...moves],turn,skill,nodes,movetime,fen,infinite,background,update:onUpdate,state:onState,resolve,reject});});}
 abort(error=new Error('cancelled')){pool.cancel(this,error);}
}
