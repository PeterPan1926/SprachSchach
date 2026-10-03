-- SPDX-License-Identifier: BSD-3-Clause
-- Read the actual original display, including custom CGRAM symbols and cursor.
return function()
 local m=manager.machine
 if m.system.name=='mm6' then
  local values={};for c=0,1 do for s=0,23 do values[#values+1]=tostring(m.devices[':']:output('s'..c..'.'..s):get()>0 and 1 or 0)end end
  return '['..table.concat(values,',')..']'
 end
 local screen=m.screens[':display:screen'];local pixels={}
 for y=0,18 do for x=0,96 do pixels[#pixels+1]=tostring((screen:pixel(x,y)&0xffffff)<0x808080 and 1 or 0)end end
 local status='';if m.system.name=='polgar101' then local values={};for n=100,105 do values[#values+1]=tostring(m.devices[':']:output('led'..n):get()>0 and 1 or 0)end;status=',"statusLeds":['..table.concat(values,',')..']'end
 return '{"machine":"'..m.system.name..'","width":97,"height":19,"pixels":['..table.concat(pixels,',')..']'..status..'}'
end
