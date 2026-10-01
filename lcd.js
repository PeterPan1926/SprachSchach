import {Chess} from './core.js';
// Offline, monochrome dot-matrix LCD characters with faint inactive pixels.
const characters={
 '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],
 '2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],
 '4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],
 '6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],
 '8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
 'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],
 'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],
 'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],
 'G':['01111','10000','10000','10111','10001','10001','01111'],'H':['10001','10001','10001','11111','10001','10001','10001'],
 'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'N':['10001','11001','10101','10011','10001','10001','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],
 'M':['10001','11011','10101','10101','10001','10001','10001'],'T':['11111','00100','00100','00100','00100','00100','00100'],
 '+':['00000','00100','00100','11111','00100','00100','00000'],'-':['00000','00000','00000','11111','00000','00000','00000'],
 '.':['00000','00000','00000','00000','00000','00110','00110'],' ':['00000','00000','00000','00000','00000','00000','00000']};
export function lcdMove(move){return move?`${move.from.toUpperCase()}-${move.to.toUpperCase()}${move.promotion?.toUpperCase()||''}`:'-- --';}
export function lcdScore(evaluation){if(!evaluation)return '--.--';if(evaluation.checkmate)return evaluation.winner==='w'?'+M0':'-M0';if(evaluation.mate!==undefined)return `${evaluation.mate<0?'-':'+'}M${Math.abs(evaluation.mate)}`;const score=evaluation.cp/100;return (score>0?'+':'')+score.toFixed(2);}
export function renderLcdText(container,text,label){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${text.length*6-1} 7`);svg.setAttribute('role','img');svg.setAttribute('aria-label',label);svg.setAttribute('class','lcd-digits');svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('preserveAspectRatio','xMinYMid meet');for(const [i,char]of [...text].entries()){const rows=characters[char]||characters[' '];for(let y=0;y<7;y++)for(let x=0;x<5;x++){const pixel=document.createElementNS(ns,'rect');pixel.setAttribute('x',String(i*6+x));pixel.setAttribute('y',String(y));pixel.setAttribute('width','.84');pixel.setAttribute('height','.88');pixel.setAttribute('rx','.06');pixel.setAttribute('fill','currentColor');pixel.setAttribute('opacity',rows[y][x]==='1'?'1':'.055');svg.append(pixel);}}container.dataset.value=text;container.replaceChildren(svg);}

export function lcdVariation(fen,evaluation,count=5){const moves=[];let g;try{g=new Chess(fen);}catch{return moves;}for(const uci of (evaluation?.pv||[]).slice(0,count)){if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci))break;try{const m=g.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});moves.push({text:lcdMove(m),san:m.san,number:Number(m.before.split(' ')[5]),color:m.color,uci});}catch{break;}}return moves;}
export function lcdTime(evaluation){return Number.isFinite(evaluation?.timeMs)?(evaluation.timeMs/1000).toFixed(2)+' S':'--.-- S';}

// Full-move rows keep White on the left and Black on the right, including black-to-move starts.
export function lcdMoveLines(moves){const lines=[];for(const move of moves){let line=lines.at(-1);if(!line||line.number!==move.number){line={number:move.number,white:null,black:null};lines.push(line);}line[move.color==='w'?'white':'black']=move;}return lines;}
