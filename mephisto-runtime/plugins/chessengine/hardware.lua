-- SPDX-License-Identifier: BSD-3-Clause
-- Raw MM VI keypad/sensor interface. No invented menu behavior: the ROM handles it.
return function(env)
 local hw={active=false};local machine=nil;local display=env.display;local kind=nil
 local van=false;local polgar=false
 local keys={pawn={1,1},knight={1,2},bishop={1,4},rook={1,128},queen={1,64},king={1,16},save={0,1},opt={0,2},lev={0,4},left={0,8},new={0,16},right={0,32},pos={0,64},info={0,128},cl={1,8},ent={1,32}}
 local function configure()
 kind=machine.system.name;van=kind=='van32';polgar=kind=='polgar101'
 if van then keys={ent={':KEY3',0x8000},left={':KEY3',0x4000},up={':KEY2',0x8000},down={':KEY2',0x4000},cl={':KEY1',0x8000},right={':KEY1',0x4000}}
 elseif polgar then keys={pawn={':KEY',1},info={':KEY',2},mem={':KEY',4},pos={':KEY',8},lev={':KEY',16},fct={':KEY',32},ent={':KEY',64},cl={':KEY',128}}
 else for _,k in pairs(keys)do k[1]=':IN.'..k[1]end end
 end
 local function port(k)return machine.ioport.ports[k[1]]end
 local function inputs()if van then return {~machine.ioport.ports[':KEY1']:read()&0xc000,~machine.ioport.ports[':KEY2']:read()&0xc000,~machine.ioport.ports[':KEY3']:read()&0xc000}elseif polgar then return {machine.ioport.ports[':KEY']:read()}else return {machine.ioport.ports[':IN.0']:read(),machine.ioport.ports[':IN.1']:read()}end end
 local function idle()for _,v in ipairs(inputs())do if v~=0 then return false end end;return true end
 local frames=0;local last='';local tap;local edges={};local previous=-1;local lastedge=0
 local function out(s)io.stdout:write(s..'\n');io.stdout:flush()end
 local function value(name)return machine.devices[':']:output(name):get()end
 local function release()for _,k in pairs(keys)do port(k):field(k[2]):set_value(0)end end
 local function snapshot(force)
  local p,l,d={},{},{}
  for y=1,8 do for x=0,7 do p[#p+1]=tostring(value('piece_'..string.char(97+x)..y));l[#l+1]=tostring(value('led'..(x+(y-1)*8))>0 and 1 or 0)end end
  local ports={};for _,v in ipairs(inputs())do ports[#ports+1]=tostring(v)end
  local extra='';if polgar then local lamps={};for i=100,105 do lamps[#lamps+1]=tostring(value('led'..i)>0 and 1 or 0)end;extra=',"statusLeds":['..table.concat(lamps,',')..']'end
  local data='{"pieces":['..table.concat(p,',')..'],"leds":['..table.concat(l,',')..'],"lcd":'..display()..',"hand":'..value('piece_ui0')..',"inputs":['..table.concat(ports,',')..']'..extra..'}'
  if force or last~=data then last=data;out('raw_state '..data)end
 end
 local function install_audio()
  tap=machine.devices[':maincpu'].spaces['program']:install_write_tap(van and 0xa0000010 or polgar and 0x2004 or 0xffba,van and 0xa0000013 or polgar and 0x2004 or 0xffbb,'mmvi_original_dac',function(offset,data,mask)
   if not hw.active then return end
   if van then data=data>>24;mask=mask>>24 end
   if (mask&0xff)==0 then return end
   local bit
   if van or polgar then local dac=(data>>2)&3;bit=dac==1 and 1 or dac==2 and -1 or 0 else bit=(data&1)*2-1 end
   if bit~=previous then
    local now=machine.time:as_double();previous=bit
    if #edges<2000 then edges[#edges+1]={now,bit}end
    lastedge=now
   end
  end)
 end
 local function tone()
  if #edges==0 then return end
  local now=machine.time:as_double()
  if now-lastedge<.025 and now-edges[1][1]<.35 then return end
  if #edges>=40 then
   local t0=edges[1][1];local data={}
   for _,e in ipairs(edges)do data[#data+1]=string.format('[%.9f,%d]',e[1]-t0,e[2])end
   out('raw_tone ['..table.concat(data,',')..']')
  end
  edges={}
 end
 function hw.frame()
  if not hw.active then return end
  tone();frames=frames+1
  if frames%6==0 then snapshot(false)end
  if frames%1800==0 and idle() then machine:save('module')end
 end
 function hw.command(cmd)
  if cmd:sub(1,4)~='raw ' then return false end
  machine=manager.machine;if not kind then configure()end
  local action,args=cmd:match('^raw (%S+)%s*(.*)$')
  if action=='init' then
   env.initialise(args);hw.active=true;release();install_audio();snapshot(true);out('raw_ready')
  elseif not hw.active then out('raw_error not_ready')
  elseif action=='key' then
   local name,state=args:match('^(%w+) ([01])$');local key=keys[name]
   if key then port(key):field(key[2]):set_value(tonumber(state));out('raw_ack '..name..' '..state);snapshot(true)else out('raw_error invalid_key')end
  elseif action=='tap' then
   local file,rank,mode=args:match('^([1-8]) ([1-8]) (move|press)$')
   -- Lua patterns do not have alternation.
   if not file then file,rank,mode=args:match('^([1-8]) ([1-8]) (%a+)$')end
   if file and (mode=='move' or mode=='press')then
    if mode=='press' then env.press(tonumber(file),tonumber(rank))else env.move(tonumber(file),tonumber(rank))end
    snapshot(true)
   else out('raw_error invalid_square')end
  elseif action=='spawn' then
   local n=tonumber(args);if n and n>=1 and n<=12 then env.input(':board:board:SPAWN',1<<(n-1),.2);snapshot(true)end
  elseif action=='remove' then env.input(':board:board:UI',8,.2);snapshot(true)
  elseif action=='clearboard' then env.input(':board:board:UI',256,.2);snapshot(true)
  elseif action=='resetboard' then env.input(':board:board:UI',512,.2);snapshot(true)
  elseif action=='restore' then
   local name=args=='' and 'module' or args
   if name~='module' and not name:match('^snapshot_%x+$')then out('raw_error invalid_snapshot');return true end
   release();edges={};previous=-1;hw.active=false;machine:load(name);emu.wait(.4);release();hw.active=true;snapshot(true);out('raw_restored')
  elseif action=='checkpoint' then
   local name=args=='' and 'module' or args
   if name~='module' and not name:match('^snapshot_%x+$')then out('raw_error invalid_snapshot');return true end
   release();machine:save(name);emu.wait(.35);snapshot(true);out('raw_saved'..(name=='module' and '' or ' '..name))
  elseif action=='quit' then release();machine:save('module');emu.wait(.35);machine:exit()
  else out('raw_error invalid_command')end
  return true
 end
 return hw
end
