import {Chess} from './chess.js';
const START=new Chess().fen();
export class EmulatorError extends Error{
 constructor(code){super(code);this.code=code;}
}
export function bridgeUrl(value,page=globalThis.location){
 let url;try{url=new URL(String(value).trim());}catch{throw new EmulatorError('bridge_not_configured');}
 if(!['ws:','wss:'].includes(url.protocol)||url.username||url.password||url.hash)throw new EmulatorError('invalid_bridge_url');
 if(page?.protocol==='https:'&&url.protocol!=='wss:')throw new EmulatorError('secure_bridge_required');
 return url.href;
}
class EmulatorTransport{
 constructor(){this.config={url:'',level:'a4',token:''};this.socket=null;this.opening=null;this.current=null;this.sequence=0;}
 configure(value){
  const next={url:String(value.url||'').trim(),level:/^[a-h][1-8]$/.test(value.level)?value.level:'a4',token:String(value.token||'')};
  if(JSON.stringify(next)!==JSON.stringify(this.config))this.close(new EmulatorError('cancelled'));
  this.config=next;
 }
 connect(){
  if(this.opening)return this.opening;
  if(this.socket?.readyState===WebSocket.OPEN)return Promise.resolve(this.machines);
  const url=bridgeUrl(this.config.url);
  this.opening=new Promise((resolve,reject)=>{
   const socket=this.socket=new WebSocket(url);
   const timer=setTimeout(()=>this.close(new EmulatorError('bridge_timeout')),12000);
   this.starting={resolve,reject,timer};
   socket.onopen=()=>{if(this.socket===socket)socket.send(JSON.stringify({type:'hello',protocol:1,token:this.config.token}));};
   socket.onmessage=event=>{
    if(this.socket!==socket)return;
    let data;try{data=JSON.parse(event.data);}catch{this.close(new EmulatorError('invalid_bridge_response'));return;}
    if(data?.type==='ready'&&this.starting){
     if(data.protocol!==1||!Array.isArray(data.machines)||!data.machines.some(m=>m.id==='mm6')){this.close(new EmulatorError('unsupported_machine'));return;}
     clearTimeout(timer);this.machines=data.machines;this.starting=null;this.opening=null;resolve(data.machines);return;
    }
    if(data?.type==='error'&&!data.id){this.close(new EmulatorError(data.code||'bridge_error'));return;}
    const job=this.current;if(!job||data?.id!==job.id)return;
    if(data.type==='state'){job.onState?.(data.state);return;}
    if(data.type==='error'){this.finish(job,new EmulatorError(data.code||'bridge_error'));return;}
    if(data.type==='bestmove'){
     if(data.machine!=='mm6'||data.fen!==job.fen||!Array.isArray(data.moves)||data.moves.join(' ')!==job.moves.join(' ')){
      this.close(new EmulatorError('stale_engine_move'));return;
     }
     const board=new Chess(job.fen);
     try{
      for(const move of job.moves)board.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});
      if(typeof data.move!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(data.move))throw Error();
      board.move({from:data.move.slice(0,2),to:data.move.slice(2,4),promotion:data.move[4]});
     }catch{this.close(new EmulatorError('illegal_engine_move'));return;}
     this.finish(job,null,{move:data.move,evaluation:null});
    }
   };
   socket.onerror=()=>{if(this.socket===socket)this.close(new EmulatorError('bridge_unavailable'));};
   socket.onclose=()=>{if(this.socket===socket)this.close(new EmulatorError('bridge_disconnected'));};
  });
  // A synchronous URL/WebSocket failure must not retain a rejected connection.
  const opening=this.opening;
  opening.catch(()=>{if(this.opening===opening)this.opening=null;});
  return this.opening;
 }
 async search(owner,moves,turn,{fen=null,game='',onState=null}={}){
  const initial=fen||START;
  if(initial!==START)throw new EmulatorError('start_position_required');
  if(this.current)throw new EmulatorError('bridge_busy');
  owner.cancelled=false;
  await this.connect();
  if(owner.cancelled)throw new EmulatorError('cancelled');
  if(this.current)throw new EmulatorError('bridge_busy');
  return new Promise((resolve,reject)=>{
   const job=this.current={id:'mame-'+(++this.sequence),owner,moves:[...moves],fen:initial,onState,resolve,reject};
   job.timer=setTimeout(()=>this.close(new EmulatorError('emulator_timeout')),120000);
   try{this.socket.send(JSON.stringify({type:'search',id:job.id,machine:'mm6',level:this.config.level,game,moves:job.moves,fen:initial,turn}));}
   catch{this.close(new EmulatorError('bridge_disconnected'));}
  });
 }
 finish(job,error,result){
  clearTimeout(job.timer);if(this.current===job)this.current=null;
  if(error)job.reject(error);else job.resolve(result);
 }
 cancel(owner,error){owner.cancelled=true;if(this.current?.owner===owner)this.close(error);else if(this.starting)this.close(error);}
 close(error=new EmulatorError('cancelled')){
  const socket=this.socket;this.socket=null;
  if(socket){socket.onclose=null;socket.onerror=null;socket.close();}
  if(this.starting){clearTimeout(this.starting.timer);this.starting.reject(error);this.starting=null;}
  this.opening=null;
  if(this.current)this.finish(this.current,error);
 }
}
const transport=new EmulatorTransport();
export const configureEmulator=value=>transport.configure(value);
export const checkEmulator=()=>transport.connect();
export const disconnectEmulator=()=>transport.close();
export class EmulatorClient{
 search(moves,turn,options){return transport.search(this,moves,turn,options);}
 abort(error=new EmulatorError('cancelled')){transport.cancel(this,error);}
}
export function emulatorErrorText(error,lang='de'){
 const texts={
  local_emulator_unavailable:['Der lokale MM-VI-Kern ist auf diesem Gerät nicht verfügbar.','The local MM VI engine is unavailable on this device.'],
  local_emulator_failed:['Die lokale MM-VI-Emulation konnte nicht starten. Tippe zum erneuten Versuch.','The local MM VI emulator could not start. Tap to retry.'],
  polgar_history_unavailable:['Für diese Polgar-Zugfolge fehlt der native Modul-Spielstand. Eine neue Partie starten oder einen gespeicherten Spielstand im Originalmodul laden. Externe PGN-Partien weiterhin mit Stockfish analysieren.','No native Polgar state exists for this move sequence. Start a new game or load a saved state in the original module. Analyze external PGN games with Stockfish.'],
  emulator_interface_error:['Die lokale Emulator-Anbindung wurde unterbrochen. Bitte erneut versuchen.','The local emulator interface was interrupted. Please retry.'],
  bridge_not_configured:['Bitte die Adresse des Emulator-Dienstes eintragen.','Enter the emulator service address.'],
  invalid_bridge_url:['Die Adresse muss mit ws:// oder wss:// beginnen.','The address must start with ws:// or wss://.'],
  secure_bridge_required:['Diese HTTPS-Seite benötigt eine verschlüsselte wss://-Verbindung.','This HTTPS page requires an encrypted wss:// connection.'],
  unauthorized:['Der Verbindungscode stimmt nicht.','The connection code is incorrect.'],
  start_position_required:['Die Mephisto-Module unterstützen hier Partien aus der Grundstellung. Importierte Einzelstellungen können weiterhin mit Stockfish gespielt werden.','The Mephisto modules support games from the starting position here. Imported positions can still be played with Stockfish.'],
  bridge_busy:['Der Emulator-Dienst ist belegt. Bitte später erneut versuchen.','The emulator service is busy. Try again later.'],
  emulator_timeout:['Der emulierte Computer hat nicht rechtzeitig geantwortet. Stufe oder Verbindung prüfen.','The emulated computer did not reply in time. Check its level or connection.'],
  emulator_unavailable:['MAME konnte auf dem Emulator-Dienst nicht starten.','MAME could not start on the emulator service.'],
  emulator_stopped:['Die Emulation wurde beendet. ROM-Dateien und den Emulator-Dienst prüfen.','The emulator stopped. Check the ROM files and emulator service.'],
  illegal_engine_move:['Der Emulator lieferte einen ungültigen Zug. Die Stellung wurde nicht verändert.','The emulator returned an illegal move. The position was not changed.'],
  stale_engine_move:['Die Antwort gehört zu einer anderen Stellung. Die Stellung wurde nicht verändert.','The reply belongs to another position. The position was not changed.'],
  bridge_disconnected:['Die Emulator-Verbindung wurde getrennt. Partie gespeichert; erneut verbinden.','The emulator connection was lost. Game saved; reconnect.'],
 };
 return (texts[error?.code]||['Emulator-Dienst nicht erreichbar. Adresse, Verbindungscode und gestarteten Dienst prüfen.','Emulator service unavailable. Check its address, connection code and running service.'])[lang==='en'?1:0];
}
