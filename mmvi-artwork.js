import {model} from './mephisto-models.js';
import {placeArtwork,createArtworkLamps,paintArtworkLamps} from './mephisto-artwork.js';
import {paintLcd,validLcd} from './mephisto-lcd.js';
let segments=null,profile=null,openOriginal=null,svgText=null;
const $=id=>document.getElementById(id);
export function setupMmviArtwork(changed,original){
 openOriginal=original;$('mmviOriginalOpen').onclick=()=>original(null);$('mmviView').onchange=changed;$('mmviBeep').onchange=changed;
 fetch('mmvi/display.svg').then(r=>{if(!r.ok)throw Error();return r.text();}).then(text=>{svgText=text;loadDisplay();});
 window.localMmviDisplay=values=>{if(!validLcd(values))return;segments=values;paintLcd($('mmviOriginalDisplay'),values);paintArtworkLamps($('boardStage'),values.statusLeds);};
 window.resetMmviDisplay=()=>{segments=null;loadDisplay();};
}
function loadDisplay(){const d=$('mmviOriginalDisplay');d.replaceChildren();if(profile?.id==='mm6'&&svgText){const svg=new DOMParser().parseFromString(svgText,'image/svg+xml').documentElement;d.append(document.importNode(svg,true));}if(segments)paintLcd(d,segments);}
export function renderMmviArtwork(id,lang,status){
 const next=id?model(id):null;if(next?.id!==profile?.id){profile=next;segments=null;$('mmviModuleKeys').replaceChildren();for(const [text,key]of profile?.keys||[]){const b=document.createElement('button');b.textContent=text;b.type='button';b.dataset.key=key;b.title=profile.name+' · '+key;b.onclick=()=>openOriginal(key);$('mmviModuleKeys').append(b);}document.querySelector('.mmvi-brand strong').textContent=profile?.short||'';loadDisplay();}
 const enabled=!!profile&&$('mmviView').value==='module';const stage=$('boardStage');$('board').classList.add('surface-board');$('mmviModule').classList.add('surface-panel');$('mmviOriginalDisplay').classList.add('surface-lcd');$('mmviModuleKeys').classList.add('surface-keys');placeArtwork(stage,enabled?profile?.id:null,$('board'),$('mmviOriginalDisplay'),$('mmviModuleKeys'));const lampMachine=enabled?profile?.id:'';if(stage.dataset.lampMachine!==lampMachine){createArtworkLamps(stage,lampMachine);stage.dataset.lampMachine=lampMachine||'';}
 stage.classList.toggle('mephisto-surface',enabled&&profile.id!=='mm6');document.body.classList.toggle('mmvi-artwork',enabled);document.body.dataset.module=profile?.id||'';$('mmviViewOptions').hidden=!profile;$('mmviModule').hidden=!enabled;$('mmviModule').dataset.machine=profile?.id||'';$('mmviView').options[0].textContent=lang==='de'?'Klassisches Brett':'Classic board';$('mmviView').options[1].textContent=lang==='de'?'Original-Artwork':'Original artwork';$('mmviBeepLabel').textContent=lang==='de'?'Originaler Modulton':'Original module tone';$('mmviOriginalOpen').textContent=lang==='de'?'Original-Modul öffnen':'Open original module';$('mmviModuleStatus').textContent=status;return enabled;
}
export function mmviMoveBeep(mmvi){if(mmvi&&$('mmviView').value==='module'&&$('mmviBeep').checked)window.Android?.playMmviBeep?.();}
