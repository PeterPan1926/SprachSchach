const $=id=>document.getElementById(id);
export function fitEngineBoard(){
 const panel=$('enginePanel'),board=$('boardStage'),lcd=$('lcdPanel');if(!panel||!board)return;
 const lcdPortrait=!!lcd&&!lcd.hidden&&matchMedia('(orientation:portrait)').matches;
 document.body.classList.toggle('portrait-lcd-fit',lcdPortrait);
 if(lcdPortrait){
  const viewport=window.visualViewport?.height||innerHeight;
  const remaining=Math.max(100,viewport-Math.max(0,board.getBoundingClientRect().top)-16);
  const photograph=board.classList.contains('mephisto-surface');
  // Photo: top inset (74) plus board height (842), in a 1000px-wide image.
  const ratio=photograph ? 0.916 : 1;
  const width=Math.min(board.parentElement.clientWidth,Math.max(80,remaining)/ratio);
  board.style.setProperty('--lcd-stage-width',Math.floor(width)+'px');
 }else board.style.removeProperty('--lcd-stage-width');
 if(panel.hidden||board.classList.contains('mephisto-surface')){board.style.removeProperty('--engine-board-size');return;}
 const viewport=window.visualViewport?.height||innerHeight;
 const top=board.getBoundingClientRect().top;
 const available=Math.max(100,viewport-Math.max(0,top)-panel.getBoundingClientRect().height-16);
 board.style.setProperty('--engine-board-size',Math.floor(Math.min(board.parentElement.clientWidth,available))+'px');
}
addEventListener('resize',()=>requestAnimationFrame(fitEngineBoard));
window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(fitEngineBoard));
