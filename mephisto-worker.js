// GPL-3.0-or-later. Runs the original MAME CPU/ROM in a dedicated browser worker.
importScripts('mephisto-core.js');
let core, pending=[], serial=0;
// The EM_JS command bridge owns this allocation; C++ frees it after copying.
function stringToNewUTF8(text){const bytes=new TextEncoder().encode(text),p=core._malloc(bytes.length+1);core.HEAPU8.set(bytes,p);core.HEAPU8[p+bytes.length]=0;return p;}
const send=(type,data)=>postMessage({type,data});
self.addEventListener('error',e=>send('error',e.error?.stack||e.message));
onmessage=async({data:m})=>{
 try{
  if(m.type==='start'){
   const manifest=await (await fetch('mephisto-runtime/manifest.json')).json();
   const files=await Promise.all(manifest.map(async name=>{const r=await fetch('mephisto-runtime/'+name);if(!r.ok)throw Error('Runtime file unavailable: '+name);return {name,bytes:new Uint8Array(await r.arrayBuffer())};}));
   const parts=await (await fetch('mephisto-core-parts.json')).json();
   const buffers=await Promise.all(parts.map(async name=>{const r=await fetch(name);if(!r.ok)throw Error('Emulation file unavailable');return new Uint8Array(await r.arrayBuffer());}));
   const wasm=new Uint8Array(buffers.reduce((n,b)=>n+b.length,0));let offset=0;for(const b of buffers){wasm.set(b,offset);offset+=b.length;}
   core=await createMephistoModule({noInitialRun:true,wasmBinary:wasm,commandQueue:pending,print:line=>send('line',line),printErr:line=>send('log',line),onAbort:reason=>send('error',String(reason))});
   for(const f of files){const target='/runtime/'+f.name;core.FS.mkdirTree(target.slice(0,target.lastIndexOf('/')));core.FS.writeFile(target,f.bytes);}
   for(const dir of ['/work','/work/cfg','/work/nvram','/work/sta/'+m.machine])core.FS.mkdirTree(dir);
   for(const f of m.states||[])core.FS.writeFile('/work/sta/'+m.machine+'/'+f.name+'.sta',new Uint8Array(f.bytes));
   core.FS.chdir('/work');
   core.callMain([m.machine,'-noreadconfig','-rompath','/runtime/roms','-homepath','/work','-cfg_directory','/work/cfg','-nvram_directory','/work/nvram','-state_directory','/work/sta','-pluginspath','/runtime/plugins','-plugins','-plugin','chessengine','-skip_gameinfo','-nothrottle']);
  }else if(m.type==='command'){pending.push(...m.commands);}
  else if(m.type==='pause'){core?._sprach_pause(m.paused?1:0);}
  else if(m.type==='file'){const bytes=core.FS.readFile('/work/sta/'+m.machine+'/'+m.name+'.sta');postMessage({type:'file',id:m.id,bytes},[bytes.buffer]);}
 }catch(e){if(String(e)==='unwind')return;send('error',e.message||String(e));}
};
