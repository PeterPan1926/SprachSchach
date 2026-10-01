// Map a square preview onto the four photographed board corners, in image order.
export function boardProjection(corners){
 if(corners.length!==4||corners.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw new Error('corners');
 const [a,b,c,d]=corners;
 for(let i=0;i<4;i++){const p=corners[i],q=corners[(i+1)%4],r=corners[(i+2)%4];if((q.x-p.x)*(r.y-q.y)-(q.y-p.y)*(r.x-q.x)<=1)throw new Error('convex');}
 const dx1=b.x-c.x,dx2=d.x-c.x,dx3=a.x-b.x+c.x-d.x,dy1=b.y-c.y,dy2=d.y-c.y,dy3=a.y-b.y+c.y-d.y,den=dx1*dy2-dx2*dy1;
 let g=0,h=0;if(Math.abs(dx3)+Math.abs(dy3)>1e-8){if(Math.abs(den)<1e-8)throw new Error('degenerate');g=(dx3*dy2-dx2*dy3)/den;h=(dx1*dy3-dx3*dy1)/den;}
 const xx=b.x-a.x+g*b.x,xy=d.x-a.x+h*d.x,yx=b.y-a.y+g*b.y,yy=d.y-a.y+h*d.y;
 return (u,v)=>{const z=g*u+h*v+1;return {x:(xx*u+xy*v+a.x)/z,y:(yx*u+yy*v+a.y)/z};};
}
export function rectifyBoard(image,corners,size=1024){
 const project=boardProjection(corners),source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,source.width,source.height).data;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const output=canvas.getContext('2d'),result=output.createImageData(size,size),dst=result.data,w=source.width,h=source.height;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const p=project((x+.5)/size,(y+.5)/size),sx=Math.max(0,Math.min(w-1,p.x-.5)),sy=Math.max(0,Math.min(h-1,p.y-.5)),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,base=(y*size+x)*4;for(let k=0;k<3;k++){const a=pixels[(iy*w+ix)*4+k],b=pixels[(iy*w+Math.min(ix+1,w-1))*4+k],c=pixels[(Math.min(iy+1,h-1)*w+ix)*4+k],d=pixels[(Math.min(iy+1,h-1)*w+Math.min(ix+1,w-1))*4+k];dst[base+k]=(a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy;}dst[base+3]=255;}
 output.putImageData(result,0,0);return canvas;
}
