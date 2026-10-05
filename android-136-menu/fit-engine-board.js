const $=id=>document.getElementById(id);
export function fitEngineBoard(){
 const panel=$('enginePanel'),board=$('boardStage');if(!panel||!board)return;
 if(panel.hidden||board.classList.contains('mephisto-surface')){board.style.removeProperty('--engine-board-size');return;}
 const viewport=window.visualViewport?.height||innerHeight;
 const top=board.getBoundingClientRect().top;
 const available=Math.max(100,viewport-Math.max(0,top)-panel.getBoundingClientRect().height-16);
 board.style.setProperty('--engine-board-size',Math.floor(Math.min(board.parentElement.clientWidth,available))+'px');
}
addEventListener('resize',()=>requestAnimationFrame(fitEngineBoard));
window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(fitEngineBoard));
