import {setupMultiPv} from './multipv.js';
import {prepareTabletLayout} from './tablet-layout.js';
window.addEventListener('DOMContentLoaded',()=>{
 prepareTabletLayout();setupMultiPv();
 const card=document.createElement('section');card.className='card pwa-card';
 card.innerHTML='<small>SPRACHSCHACH · ANDROID · 1.0.0</small><p id="androidInfo"></p><p id="offlineStatus" role="status"></p>';
 document.querySelector('main').append(card);
 const labels=()=>{const de=document.querySelector('#language').value!=='en';document.querySelector('#androidInfo').textContent=de?'Die Schachfunktionen und Engines sind in der App enthalten. Partien bleiben auf diesem Gerät.':'Chess features and engines are bundled in the app. Games stay on this device.';document.querySelector('#offlineStatus').textContent=de?'Offline bereit. KI-Anbieter und ggf. Spracherkennung benötigen Internet.':'Offline ready. AI providers and some speech services need Internet.';};
 document.querySelector('#language').addEventListener('change',labels);labels();
 document.getElementById('mic').addEventListener('click',()=>window.pwaSpeechStarted=true,{capture:true});
 document.getElementById('handsFree').addEventListener('change',e=>{if(e.target.checked)window.pwaSpeechStarted=true;},{capture:true});
});
