export function validLcd(data){return Array.isArray(data)&&data.length===48||data&&data.width===97&&data.height===19&&Array.isArray(data.pixels)&&data.pixels.length===1843&&data.pixels.every(v=>v===0||v===1);}
export function paintLcd(container,data){
 if(Array.isArray(data)){for(const el of container.querySelectorAll('[data-segment]')){const [c,s]=el.dataset.segment.slice(1).split('.').map(Number);el.style.opacity=data[c*24+s]?'1':'.06';}return;}
 if(!validLcd(data))return;let canvas=container.querySelector('canvas');if(!canvas){canvas=document.createElement('canvas');canvas.width=97;canvas.height=19;canvas.className='mephisto-pixel-lcd';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Original-LCD · 2 × 16 Zeichen');container.replaceChildren(canvas);}const c=canvas.getContext('2d');c.fillStyle='#a6ada8';c.fillRect(0,0,97,19);c.fillStyle='#18251e';for(let i=0;i<data.pixels.length;i++)if(data.pixels[i])c.fillRect(i%97,Math.floor(i/97),1,1);
}
