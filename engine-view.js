import {lcdScore,lcdVariation} from './lcd.js';
const $=id=>document.getElementById(id),KEY='sprachschach-engine-view';
let settings={},refresh=()=>{};
try{settings=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
export const normalEngineEnabled=()=>$('engineDisplay')?.value==='normal';
export const engineVariantCount=()=>Math.max(1,Math.min(4,Number($('engineVariantCount')?.value)||1));
function store(){try{localStorage.setItem(KEY,JSON.stringify({view:$('engineDisplay').value,count:engineVariantCount()}));}catch{}}
export function setupEngineView(onChange){
 refresh=onChange;if($('enginePanel'))return;
 const controls=document.createElement('div');controls.id='engineViewControls';controls.className='controls';
 const label=document.createElement('label'),caption=document.createElement('span');caption.id='engineDisplayLabel';label.htmlFor='engineDisplay';
 const display=document.createElement('select');display.id='engineDisplay';
 for(const value of ['normal','lcd','off']){const option=document.createElement('option');option.value=value;display.append(option);}
 label.append(caption,display);controls.append(label);$('lcdEnabled').closest('label').before(controls);
 const panel=document.createElement('section');panel.id='enginePanel';panel.className='card engine-panel';panel.setAttribute('aria-labelledby','enginePanelTitle');
 const heading=document.createElement('div');heading.className='engine-panel-heading';
 const title=document.createElement('h2');title.id='enginePanelTitle';
 const countLabel=document.createElement('label');countLabel.htmlFor='engineVariantCount';
 const countCaption=document.createElement('span');countCaption.id='engineVariantLabel';
 const count=document.createElement('select');count.id='engineVariantCount';
 for(const n of [1,2,3,4]){const option=document.createElement('option');option.value=n;option.textContent=n;count.append(option);}
 count.value=[1,2,3,4].includes(Number(settings.count))?settings.count:1;
 countLabel.append(countCaption,count);heading.append(title,countLabel);
 const continuousLabel=document.createElement('label'),continuous=document.createElement('input'),continuousCaption=document.createElement('span');
 continuous.type='checkbox';continuous.id='engineContinuous';continuousCaption.id='engineContinuousLabel';
 continuousLabel.append(continuous,continuousCaption);heading.append(continuousLabel);
 continuous.onchange=()=>{$('lcdContinuous').checked=continuous.checked;$('lcdContinuous').dispatchEvent(new Event('change'));};
 const legend=document.createElement('p');legend.id='engineLegend';legend.className='hint';
 const state=document.createElement('p');state.id='engineViewState';state.className='hint';state.setAttribute('role','status');
 const retry=document.createElement('button');retry.id='engineViewRetry';retry.type='button';retry.hidden=true;retry.onclick=refresh;
 const lines=document.createElement('div');lines.id='engineLines';panel.append(heading,legend,state,retry,lines);$('lcdPanel').after(panel);
 display.value=['normal','lcd','off'].includes(settings.view)?settings.view:$('lcdEnabled').checked?'lcd':'normal';
 $('lcdEnabled').checked=display.value==='lcd';panel.hidden=!normalEngineEnabled();
 display.onchange=()=>{$('lcdEnabled').checked=display.value==='lcd';store();$('lcdEnabled').dispatchEvent(new Event('change'));};
 count.onchange=()=>{store();refresh();};
 $('lcdEnabled').addEventListener('change',()=>{if($('lcdEnabled').checked)display.value='lcd';else if(display.value==='lcd')display.value='off';store();});
}
export function renderEngineView(fen,evaluation,state,lang='de'){
 const panel=$('enginePanel');if(!panel)return;const text=(de,en)=>lang==='de'?de:en;
 panel.hidden=!normalEngineEnabled();$('engineDisplayLabel').textContent=text('Engine-Anzeige: ','Engine display: ');
 for(const [i,pair]of [['Normal','Normal'],['LCD','LCD'],['Aus','Off']].entries())$('engineDisplay').options[i].textContent=pair[lang==='de'?0:1];
 if(panel.hidden)return;
 panel.dataset.fen=fen;$('enginePanelTitle').textContent=text('Stockfish · Engine-Informationen','Stockfish · Engine information');
 $('engineVariantLabel').textContent=text('Varianten: ','Lines: ');
 $('engineContinuous').checked=$('lcdContinuous').checked;$('engineContinuousLabel').textContent=text('Daueranalyse','Continuous analysis');
 $('engineLegend').textContent=text('Bewertung aus Sicht von Weiß · + Vorteil Weiß, − Vorteil Schwarz · bis zu 8 Halbzüge je Variante.','Evaluation from White’s perspective · + favors White, − favors Black · up to 8 half-moves per line.');
 const states={loading:text('Engine lädt …','Loading engine …'),searching:text('Stellung wird berechnet …','Analyzing position …'),queued:text('Analyse wartet auf die Engine …','Analysis waiting for engine …'),paused:text('Analyse im Hintergrund pausiert.','Analysis paused in the background.'),ready:text('Analyse abgeschlossen.','Analysis complete.'),terminal:text('Partie beendet · keine weitere Zugfolge.','Game over · no continuation.'),error:text('Engine nicht verfügbar. Erneut versuchen.','Engine unavailable. Try again.')};
 const message=states[state]||states.loading;if($('engineViewState').textContent!==message)$('engineViewState').textContent=message;
 $('engineViewRetry').hidden=state!=='error';$('engineViewRetry').textContent=text('Erneut berechnen','Retry analysis');
 const values=evaluation?.variations||(evaluation?[evaluation]:[]),lines=[];
 const count=state==='terminal'?1:engineVariantCount();
 for(let i=0;i<count;i++){
  const e=values[i],row=document.createElement('article');row.className='engine-line';row.dataset.rank=i+1;row.dataset.depth=e?.depth??'';
  const metrics=document.createElement('div');metrics.className='engine-line-metrics';
  const rank=document.createElement('strong');rank.textContent=text('Variante ','Line ')+(i+1);
  const score=document.createElement('span');score.className='engine-line-score';score.textContent=lcdScore(e);
  score.setAttribute('aria-label',text('Bewertung: ','Evaluation: ')+score.textContent);
  const depth=document.createElement('span');depth.className='engine-line-depth';depth.textContent=text('Tiefe: ','Depth: ')+(Number.isFinite(e?.depth)?e.depth:'—');
  metrics.append(rank,score,depth);
  const moves=lcdVariation(fen,e,8),pv=document.createElement('p');pv.className='engine-line-pv';pv.dataset.uci=moves.map(m=>m.uci).join(' ');
  pv.textContent=moves.length?moves.map((m,n)=>(m.color==='w'?m.number+'. ':n===0?m.number+'… ':'')+m.san).join(' '):state==='terminal'?text('Keine weiteren Züge','No further moves'):text('Zugfolge noch nicht berechnet','Continuation not yet computed');
  row.append(metrics,pv);lines.push(row);
 }
 $('engineLines').replaceChildren(...lines);
}
