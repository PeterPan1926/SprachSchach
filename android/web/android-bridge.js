// The native bridge is restricted to the app's local HTTPS origin by AndroidX WebKit.
const send=data=>window.AndroidNative.postMessage(JSON.stringify(data));
let recognition=null,utterance=null,utteranceId=0;
window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;this.lang='de-DE';}};
Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
 getVoices:()=>[],cancel:()=>{utterance=null;send({type:'stopSpeech'});},
 speak:u=>{utterance=u;send({type:'speak',text:u.text,language:u.lang,id:++utteranceId});}
}});
class AndroidRecognition {
 start(){recognition=this;send({type:'listen',language:this.lang||'de-DE'});}
 abort(){if(recognition===this)recognition=null;send({type:'stopListening'});}
}
window.SpeechRecognition=AndroidRecognition;
window.androidNativeEvent=(type,data)=>{
 if(type==='speechEnd'||type==='speechError'){const u=utterance;if(data.id!==utteranceId)return;utterance=null;u?.[type==='speechEnd'?'onend':'onerror']?.();}
 if(type==='recognitionStart')recognition?.onstart?.();
 if(type==='recognitionResult'){const r=recognition;recognition=null;r?.onresult?.({results:[[{transcript:data.text}]]});r?.onend?.();}
 if(type==='recognitionError'){const r=recognition;recognition=null;r?.onerror?.({error:data.error});r?.onend?.();}
 if(type==='notice'){const n=document.querySelector('#message');if(n)n.textContent=data.text;}
};
export function installAndroidBridge(){
 const save=(text,name,mime)=>send({type:'save',text,name,mime});
 window.Android.copyPgn=text=>send({type:'copy',text});
 window.Android.savePgn=(text,name)=>save(text,name,'application/x-chess-pgn');
 window.Android.sharePgn=(text,name)=>send({type:'share',text,name});
 window.desktopHost.exportArchive=text=>save(text,'SprachSchach-Partien-und-Chat.json','application/json');
 window.Android.setLcdFullscreen=()=>{};
}
