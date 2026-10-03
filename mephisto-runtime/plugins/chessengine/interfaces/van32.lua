-- SPDX-License-Identifier: BSD-3-Clause
-- Vancouver 32 Bit: authentic six-button menus; no changes to the program ROM.
local interface={invert=false,level='1',cur_level=nil,both=false,resume=false}
local keys={cl={':KEY1',0x8000},right={':KEY1',0x4000},up={':KEY2',0x8000},down={':KEY2',0x4000},left={':KEY3',0x4000},ent={':KEY3',0x8000}}
local function press(name)local k=keys[name];send_input(k[1],k[2],.5);emu.wait(.20)end
local function text()
 local device=machine.devices[':display:hd44780'];local ram=emu.item(device.items['0/m_ddram']);local out=''
 for _,base in ipairs({0,64})do for n=base,base+15 do out=out..string.char(ram:read(n))end end;return out
end
local function cursor()return emu.item(machine.devices[':display:hd44780'].items['0/m_ac']):read(0)end
local function menu(item)
 for n=1,6 do if text():find('INFO ZIEHT ALTER',1,true)then break end;press('cl')end
 if not text():find('INFO ZIEHT ALTER',1,true)then error('Vancouver menu unavailable')end
 local target=({STUFE=75,START=69,ZIEHT=5})[item]
 if item=='BEIDE'then
  for n=1,6 do if text():find('FUNKT BEIDE AUTO',1,true)and cursor()<64 then break end;press('up')end
  if not text():find('FUNKT BEIDE AUTO',1,true)then error('Vancouver both-player menu unavailable')end
  target=6
 end
 if (cursor()>=64)~=(target>=64)then press(target>=64 and 'down' or 'up')end
 for n=1,4 do if cursor()==target then break end;press('right')end
 if cursor()~=target then error('Vancouver menu cursor unavailable')end
 press('ent')
end
function interface.setlevel()
 if interface.cur_level==nil or interface.cur_level==interface.level then return end
 menu('STUFE');press('ent') -- edit NORMAL program/level
 for n=1,8 do if text():find('NORML',1,true)then break end;press('up')end
 if not text():find('NORML',1,true)then error('Vancouver normal level unavailable')end
 local wanted=tonumber(interface.level);local reached=false
 for n=1,10 do local number=tonumber(text():match('NORML%s+(%d+)'));if number==wanted then reached=true;break end;press('right')end
 if not reached then error('Vancouver requested level unavailable')end
 press('ent');press('cl');interface.cur_level=interface.level
end
function interface.setup_machine()
 sb_reset_board(':board:board');interface.invert=false;interface.both=false;emu.wait(2)
 if text():find('FORT',1,true)then press('right');press('ent');emu.wait(1)end
 interface.cur_level=false;interface.setlevel()
end
function interface.edit_game(enabled)
 if enabled==nil then enabled=not interface.both end
 if interface.both~=enabled then menu('BEIDE');interface.both=enabled;if not enabled then interface.resume=true end end
end
function interface.start_play(init)
 if init or interface.resume then
  menu('ZIEHT');emu.wait(.5)
  -- Retry only while the firmware still displays the menu. Another ENT during
  -- an actual search would be the original move-now command.
  for n=1,2 do
   if not text():find('INFO ZIEHT ALTER',1,true)then break end
   if cursor()~=5 then error('Vancouver search menu lost selection')end
   press('ent');emu.wait(.5)
  end
  if text():find('INFO ZIEHT ALTER',1,true)then error('Vancouver did not start its search')end
  interface.resume=false
 end
end
local lcd_time=-1
local completed_lcd=""
function interface.is_selected(x,y)
 if output:get_value('led'..((x-1)+(y-1)*8))~=0 then return true end
 -- Board LEDs blink. The ROM's completed-move display is also authoritative;
 -- ignore clocks/menus and already executed moves whose source is empty.
 local now=machine.time:as_double()
 if now<lcd_time or now-lcd_time>=.05 then lcd_time=now;completed_lcd=text()end
 local lcd=completed_lcd
 if not lcd:find('*SPIEL',1,true)then return false end
 for f,r,t,q in lcd:gmatch('([A-H])([1-8])[-x]([A-H])([1-8])')do
  local fx,fy,tx,ty=f:byte()-64,tonumber(r),t:byte()-64,tonumber(q)
  if get_piece_id(fx,fy)~=0 and ((x==fx and y==fy)or(x==tx and y==ty))then return true end
 end
 return false
end
function interface.select_piece(x,y,event)sb_select_piece(':board:board',1,x,y,event)end
function interface.get_options()return {{'string','Level','1'}}end
function interface.set_option(name,value)if name=='level'and value:match('^%d+$')and tonumber(value)>=1 and tonumber(value)<=9 then interface.level=tostring(tonumber(value));interface.setlevel()end end
function interface.get_promotion(x, y)
	-- HD44780 Display Data RAM
	local ddram = emu.item(machine.devices[':display:hd44780'].items['0/m_ddram']):read_block(0x00, 0x80)
	local line0 = ddram:sub(0x01,0x10)
	local line1 = ddram:sub(0x41,0x50)

	if     (line1:find('\x01') or line1:find('\x09')) then	return 'q'
	elseif (line1:find('\x02') or line1:find('\x0a')) then	return 'r'
	elseif (line1:find('\x03') or line1:find('\x0b')) then	return 'b'
	elseif (line1:find('\x04') or line1:find('\x0c')) then	return 'n'
	elseif (line0:find('\x01') or line0:find('\x09')) then	return 'q'
	elseif (line0:find('\x02') or line0:find('\x0a')) then	return 'r'
	elseif (line0:find('\x03') or line0:find('\x0b')) then	return 'b'
	elseif (line0:find('\x04') or line0:find('\x0c')) then	return 'n'
	end

	return nil
end

function interface.promote(x, y, piece)
	sb_promote(":board:board", x, y, piece)
	local right = -1
	if     (piece == "q") then	right = 0
	elseif (piece == "r") then	right = 1
	elseif (piece == "b") then	right = 2
	elseif (piece == "n") then	right = 3
	end

	if (right ~= -1) then
		for i=1,right do
			send_input(":KEY1", 0x4000, 0.5)	-- RIGHT
		end

		send_input(":KEY3", 0x8000, 0.5)		-- ENT
	end
end

return interface
