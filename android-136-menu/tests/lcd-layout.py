from playwright.sync_api import sync_playwright
import os
BASE=os.environ.get('ANDROID136_TEST_URL','http://127.0.0.1:8768/')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
 for width,height in [(390,844),(360,640)]:
  c=b.new_context(viewport={'width':width,'height':height},has_touch=True,is_mobile=True)
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE,wait_until='networkidle')
  page.locator('[data-category="game"]').tap();page.locator('#appMode').select_option('analysis')
  for machine in ['stockfish','van32','polgar101','mm6']:
   page.locator('[data-category="game"]').tap();page.locator('#opponent').select_option(machine)
   page.locator('[data-category="display"]').tap()
   if machine!='stockfish':page.locator('#mmviView').select_option('module')
   page.locator('#engineDisplay').select_option('lcd')
   for count in ['1','3']:
    page.locator('[data-category="display"]').tap();page.locator('#lcdPvCount').select_option(count);page.locator('#menuClose').tap()
    page.wait_for_function("document.querySelector('#lcdState').innerText.includes('kurze Analyse')",timeout=90000)
    page.wait_for_timeout(250)
    lcd=page.locator('#lcdPanel').bounding_box();board=page.locator('#board').bounding_box()
    print(width,height,machine,count,'LCD',lcd,'board',board,flush=True)
    assert lcd['y']+lcd['height']<=board['y']
    assert board['y']+board['height']<=height
    assert lcd['y']>=0
    assert page.locator('#lcdPanel').evaluate('e=>e.scrollHeight<=e.clientHeight+2')
    if machine in ['van32','polgar101']:
     stage=page.locator('#boardStage').bounding_box();assert abs(board['width']/stage['width']-.841)<.003
    if os.environ.get('SCREENSHOT_DIR') and count=='3':page.screenshot(path=os.path.join(os.environ['SCREENSHOT_DIR'],f'lcd-{machine}-{width}.png'))
  page.locator('[data-category="display"]').tap();page.locator('#engineDisplay').select_option('normal');page.locator('#menuClose').tap()
  assert not page.locator('#lcdPanel').is_visible()
  assert not page.locator('body').evaluate("e=>e.classList.contains('portrait-lcd-fit')")
  assert not errors,errors
  c.close()
 b.close()
 print('PASS: LCD above board, all contents and full board fit two portrait screens, 1/3 LCD lines, classical/MMVI/Vancouver/Polgar, return to normal.')
