// Geometry aligned to the supplied original Vancouver and Polgar photographs.
// Polgar keys/status lamps also follow the supplied polgar101.lay coordinates.
export const artworks={
 van32:{image:'vancouver/van32.png',source:'uploaded-van32',width:1000,height:1245,board:[76,74,841,842],lcd:[371,1088,214,43],keys:{ent:[825,1064,40,43],up:[875,1064,40,43],cl:[924,1064,40,43],left:[825,1113,40,43],right:[924,1113,40,43],down:[875,1162,40,43]},lamps:[]},
 polgar101:{image:'polgar/polgar10.png',source:'uploaded-polgar10',width:1000,height:1245,board:[76,74,841,842],lcd:[376,1090,213,43],keys:{pawn:[698,1051,34,40],info:[743,1051,34,40],mem:[791,1051,34,40],pos:[840,1051,34,40],lev:[887,1051,34,40],fct:[934,1051,34,40],ent:[887,1156,34,40],cl:[934,1156,34,40]},lamps:[[696,1026,11,11],[741,1024,11,11],[791,1024,11,11],[838,1024,11,11],[883,1024,11,11],[932,1024,11,11]]}
};
function rectangle(element,rect,a){if(!rect)return;const [x,y,w,h]=rect;element.style.setProperty('--surface-width',100*w/a.width+'%');element.style.setProperty('--surface-height',100*h/a.height+'%');element.style.left=100*x/a.width+'%';element.style.top=100*y/a.height+'%';element.style.width=100*w/a.width+'%';element.style.height=100*h/a.height+'%';}
export function placeArtwork(surface,id,board,lcd,keys){
 const a=artworks[id];surface.classList.toggle('mephisto-surface',!!a);surface.dataset.artworkSource=a?.source||'';
 if(!a){surface.style.removeProperty('background-image');surface.style.removeProperty('aspect-ratio');for(const e of [board,lcd,...keys.children])for(const p of ['left','top','width','height','--surface-width','--surface-height'])e.style.removeProperty(p);return;}
 surface.style.backgroundImage=`url('${a.image}')`;surface.style.aspectRatio=a.width+'/'+a.height;rectangle(board,a.board,a);rectangle(lcd,a.lcd,a);for(const b of keys.children)rectangle(b,a.keys[b.dataset.key],a);
}
export function createArtworkLamps(surface,id){surface.querySelectorAll('.artwork-lamp').forEach(e=>e.remove());const a=artworks[id];for(const r of a?.lamps||[]){const lamp=document.createElement('span');lamp.className='artwork-lamp';rectangle(lamp,r,a);surface.append(lamp);}}
export function paintArtworkLamps(surface,values){surface.querySelectorAll('.artwork-lamp').forEach((e,n)=>e.classList.toggle('on',!!values?.[n]));}
