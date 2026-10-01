export function fitTabletLayout(){
 const board=document.getElementById('board'),stage=document.getElementById('playArea'),main=document.querySelector('main');if(!board||!stage||!main)return;
 const landscape=matchMedia('(orientation:landscape)').matches;
 document.body.classList.toggle('ipad-landscape',landscape);
 const width=main.clientWidth-parseFloat(getComputedStyle(main).paddingLeft)-parseFloat(getComputedStyle(main).paddingRight);
 if(landscape){
  const viewport=window.visualViewport?.height||document.documentElement.clientHeight;
  const top=stage.getBoundingClientRect().top+scrollY;
  const navigation=document.getElementById('replayControls').getBoundingClientRect().height;
  const available=Math.max(180,viewport-top-12);
  const side=Math.max(160,Math.min((width-16)*.49,available-navigation-10));
  stage.style.setProperty('--ipad-board-side',side+'px');stage.style.setProperty('--ipad-info-height',available+'px');
 }else{stage.style.removeProperty('--ipad-board-side');stage.style.removeProperty('--ipad-info-height');}
 board.style.removeProperty('max-width');board.style.removeProperty('--piece-size');
}
export function prepareTabletLayout(){
 const stage=document.getElementById('playArea');
 const left=document.createElement('div');left.id='ipadBoardColumn';left.append(document.getElementById('board'),document.getElementById('replayControls'));
 const right=document.createElement('div');right.id='ipadInfoColumn';right.append(document.getElementById('lcdPanel'),document.getElementById('notationCard'),document.getElementById('chatCard'));
 stage.replaceChildren(left,right);document.body.classList.add('ipad-ready');fitTabletLayout();
 window.addEventListener('resize',fitTabletLayout);window.visualViewport?.addEventListener('resize',fitTabletLayout);
 if(typeof ResizeObserver==='function')new ResizeObserver(fitTabletLayout).observe(document.getElementById('playingHeader'));
}
