// Original classic chess artwork; GPL-3.0-only, like the application.
// Explicit SVG colors avoid platform fonts and color emoji.
const shapes={
 p:'<circle cx="32" cy="23" r="6.5"/><path d="M27 29h10l-1 7c0 5 3 9 7 12H21c4-3 7-7 7-12z"/>',
 r:'<path d="M17 10h8v7h5v-7h5v7h5v-7h8v15H17z"/><path d="M23 25h18l-2 18 6 5H19l6-5z"/>',
 n:'<path d="M19 48c1-8 4-15 11-22l-8 5-8-5 5-11 9-6 4-6 5 7c13 3 13 17 8 27l-1 11z"/><path d="M19 20l5 1m12-7c5 5 6 13 3 21" fill="none" stroke="ACCENT"/><circle cx="29" cy="16" r="1.7" fill="ACCENT" stroke="none"/>',
 b:'<path d="M32 7c-5 6-12 11-12 18 0 5 4 8 8 9l-3 9-7 5h28l-7-5-3-9c4-1 8-4 8-9 0-7-7-12-12-18z"/><path d="M33 14l-7 12m0 10h12" fill="none" stroke="ACCENT"/><circle cx="32" cy="6" r="2.5"/>',
 q:'<path d="M17 18l6 7 2-12 7 12 7-12 2 12 6-7-7 22H24z"/><circle cx="16" cy="15" r="3"/><circle cx="25" cy="10" r="3"/><circle cx="32" cy="6" r="3"/><circle cx="39" cy="10" r="3"/><circle cx="48" cy="15" r="3"/><path d="M24 40h16l4 8H20z"/><path d="M25 33h14" fill="none" stroke="ACCENT"/>',
 k:'<path d="M30 4h4v5h5v4h-5v6h-4v-6h-5V9h5z"/><path d="M32 23c-12-13-23-2-15 9l7 8h16l7-8c8-11-3-22-15-9z"/><path d="M24 40h16l4 8H20z"/><path d="M32 24v12m-8 0h16" fill="none" stroke="ACCENT"/>'
};
export function renderPiece(element,piece){
 element.replaceChildren();if(!piece)return;
 const p=typeof piece==='string'?{type:piece.toLowerCase(),color:piece===piece.toUpperCase()?'w':'b'}:piece;
 if(!shapes[p.type])return;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 64 64');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.classList.add('classic-piece');svg.dataset.type=p.type;svg.dataset.color=p.color;
 const white=p.color==='w',fill=white?'#fff8e7':'#20272b',stroke=white?'#30383b':'#080f14',accent=white?'#687276':'#c2cbd0';
 const base=p.type==='p'?'<path d="M21 48h22l3 5H18z"/><path d="M18 53h28v5H18z"/>':'<path d="M19 48h26l3 5H16z"/><path d="M16 53h32v5H16z"/>';
 svg.innerHTML=`<g fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${shapes[p.type].replaceAll('ACCENT',accent)}${base}<path d="M22 51h20" fill="none" stroke="${accent}" stroke-width="1.2"/></g>`;
 element.append(svg);
}
