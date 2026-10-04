// Alternative presentation: move existing controls so their state and handlers stay shared.
const categories=[
 ['game','Partie','Game'],['analysis','Analyse','Analysis'],['files','Dateien','Files'],
 ['voice','Sprache & KI','Voice & AI'],['display','Darstellung','Display'],['help','Hilfe','Help']
];
window.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),main=document.querySelector('main');
 const enabled=new URLSearchParams(location.search).get('ansicht')==='menue';
 const link=document.createElement('a');link.className='view-switch';
 const url=new URL(location.href);if(enabled)url.searchParams.delete('ansicht');else url.searchParams.set('ansicht','menue');
 link.href=url.pathname+url.search+url.hash;
 const german=()=>$('language').value!=='en',text=(de,en)=>german()?de:en;
 const updateLink=()=>link.textContent=enabled?text('Klassische Ansicht','Classic view'):text('Menüansicht ausprobieren','Try menu view');
 main.prepend(link);updateLink();$('language').addEventListener('change',updateLink);
 if(!enabled)return;
 document.body.classList.add('menu-view');
 const bar=document.createElement('nav');bar.className='menu-bar';bar.setAttribute('aria-label',text('Funktionen und Einstellungen','Features and settings'));
 const mode=document.createElement('span');mode.id='menuMode';main.prepend(bar);
 const dialog=document.createElement('dialog');dialog.id='appMenu';dialog.setAttribute('aria-labelledby','menuTitle');
 const heading=document.createElement('div');heading.className='menu-heading';
 const title=document.createElement('h2');title.id='menuTitle';
 const close=document.createElement('button');close.id='menuClose';close.type='button';heading.append(title,close);
 const layout=document.createElement('div');layout.className='menu-layout';
 const nav=document.createElement('nav');nav.className='menu-categories';
 const content=document.createElement('div');content.className='menu-content';layout.append(content);dialog.append(heading,layout);document.body.append(dialog);bar.append(nav,mode);
 const panels={},buttons={};let selected='game',returnFocus=null,leaveTimer,suppressFocusDismiss=false;
 for(const [id]of categories){
  const button=document.createElement('button');button.type='button';button.dataset.category=id;button.setAttribute('aria-controls','appMenu');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');if(id==='game')button.id='menuOpen';buttons[id]=button;nav.append(button);
  const panel=document.createElement('section');panel.id='menu-'+id;panel.hidden=id!==selected;panel.setAttribute('aria-labelledby','menu-heading-'+id);
  const h=document.createElement('h3');h.id='menu-heading-'+id;panel.append(h);panels[id]=panel;content.append(panel);
  button.onclick=()=>openMenu(id);
  button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover: hover)').matches)openMenu(id,false);});
  button.addEventListener('keydown',e=>{
   if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault();const ids=categories.map(c=>c[0]),i=ids.indexOf(id);
    const next=e.key==='Home'?0:e.key==='End'?ids.length-1:(i+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length;
    buttons[ids[next]].focus();if(dialog.open)openMenu(ids[next],false);
   }else if(e.key==='ArrowDown'||(e.key==='Tab'&&!e.shiftKey&&dialog.open)){e.preventDefault();openMenu(id);panels[id].querySelector('button,input,select,textarea,a,summary')?.focus();}
  });
 }
 const move=(category,node)=>{if(node)panels[category].append(node);};
 move('game',$('modeControls'));move('game',$('new').parentElement);move('game',$('opponentSettings'));move('game',$('resign').parentElement);move('game',$('archive').closest('.card'));
 move('analysis',$('variationTools'));move('analysis',$('engineSettings'));move('analysis',$('analyzeGame'));move('analysis',$('analysisHint'));move('analysis',$('summaryCard'));
 move('files',$('importText').parentElement);move('files',$('pgnSave').closest('.card'));
 move('voice',$('speechOutputToggle'));move('voice',$('voiceLabel').closest('.card'));
 move('display',$('lcdEnabled').closest('label'));move('display',$('lcdTools'));move('display',$('mmviViewOptions'));
 move('help',$('help'));move('help',$('privacy'));move('help',main.querySelector('details.footer'));move('help',main.querySelector('.pwa-card'));
 // Keep move entry and its immediate feedback beside the board.
 const quick=document.createElement('section');quick.className='menu-quick';quick.setAttribute('aria-label',text('Zug eingeben','Enter a move'));
 quick.append($('mic').parentElement,$('entry').parentElement,$('message'));$('ipadBoardColumn').append(quick);
 const explanation=$('explanation').closest('.card');explanation.classList.add('menu-explanation');$('ipadInfoColumn').append(explanation,$('history').closest('.card'));
 const status=document.createElement('p');status.id='menuOfflineStatus';status.className='menu-offline';status.setAttribute('role','status');main.append(status);
 const originalStatus=$('offlineStatus');if(originalStatus){const sync=()=>status.textContent=originalStatus.textContent;new MutationObserver(sync).observe(originalStatus,{childList:true,characterData:true,subtree:true});sync();}
 const positionMenu=()=>{
  const rect=bar.getBoundingClientRect();
  dialog.style.top=Math.max(0,rect.bottom)+'px';
  dialog.style.left=Math.max(12,Math.min(rect.left,innerWidth-dialog.offsetWidth-12))+'px';
  dialog.style.maxHeight=Math.max(120,innerHeight-rect.bottom-12)+'px';
 };
 const dismiss=(restore=true)=>{
  clearTimeout(leaveTimer);dialog.close();
  for(const button of Object.values(buttons))button.setAttribute('aria-expanded','false');
  if(restore)returnFocus?.focus();
 };
 const openMenu=(id,focus=true)=>{
  clearTimeout(leaveTimer);selected=id;returnFocus=buttons[id];
  for(const [key,p]of Object.entries(panels)){p.hidden=key!==id;buttons[key].setAttribute('aria-expanded',key===id?'true':'false');}
  title.textContent=buttons[id].textContent;content.scrollTop=0;
  if(!dialog.open){
   const previous=document.activeElement;suppressFocusDismiss=true;
   try{dialog.show();if(!focus)(previous===document.body?buttons[id]:previous)?.focus({preventScroll:true});}
   finally{suppressFocusDismiss=false;}
  }
  positionMenu();
 };
 const leave=()=>{clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{
  if(dialog.open&&!dialog.matches(':hover')&&!bar.matches(':hover')&&!dialog.contains(document.activeElement))dismiss(false);
 },200);};
 for(const node of [bar,dialog]){node.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));node.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')leave();});}
 close.onclick=()=>dismiss();dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.open&&!document.querySelector('dialog:modal')){e.preventDefault();dismiss();}});
 document.addEventListener('pointerdown',e=>{if(dialog.open&&!dialog.contains(e.target)&&!bar.contains(e.target))dismiss(false);});
 document.addEventListener('focusin',e=>{if(!suppressFocusDismiss&&dialog.open&&!dialog.contains(e.target)&&!bar.contains(e.target))dismiss(false);});
 addEventListener('resize',()=>{if(dialog.open)positionMenu();});
 addEventListener('scroll',()=>{if(dialog.open)positionMenu();},{passive:true});
 // Close before actions that open their own dialog or return to the board.
 const actions=new Set(['new','resign','offerDraw','loadGame','importPosition','importImage','importText','chatConfigure','openAi','lcdOpenFullscreen','lcdOpenMinimal','variationNew','variationMain','variationDelete','analyzeGame','reviewRetry','pwaReload']);
 dialog.addEventListener('click',e=>{const button=e.target.closest('button');if(button&&actions.has(button.id))dismiss();},{capture:true});
 const localize=()=>{
  updateLink();close.textContent=text('Schließen','Close');
  nav.setAttribute('aria-label',text('Menübereiche','Menu sections'));bar.setAttribute('aria-label',text('Funktionen und Einstellungen','Features and settings'));
  for(const [id,de,en]of categories){buttons[id].textContent=text(de,en);panels[id].querySelector('h3').textContent=text(de,en);}
  title.textContent=buttons[selected].textContent;
  mode.textContent=$('appMode').value==='analysis'?text('Analyse · beide Seiten','Analysis · both sides'):$('opponent').selectedOptions[0].textContent;
 };
 $('language').addEventListener('change',localize);$('appMode').addEventListener('change',localize);$('opponent').addEventListener('change',localize);
 new MutationObserver(localize).observe($('appMode'),{childList:true,subtree:true,characterData:true});localize();
});
