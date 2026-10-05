from playwright.sync_api import sync_playwright
import os
BASE=os.environ.get('ANDROID136_TEST_URL','http://127.0.0.1:8768/')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
 for width,height in [(390,844),(844,390)]:
  c=b.new_context(viewport={'width':width,'height':height},has_touch=True,is_mobile=True)
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE,wait_until='networkidle')
  page.locator('[data-category="game"]').tap();page.locator('#appMode').select_option('analysis')
  for machine in ['van32','polgar101']:
   page.locator('[data-category="game"]').tap();page.locator('#opponent').select_option(machine)
   page.locator('[data-category="display"]').tap();page.locator('#mmviView').select_option('module')
   for display in ['normal','lcd','off']:
    page.locator('[data-category="display"]').tap();page.locator('#engineDisplay').select_option(display);page.locator('#menuClose').tap()
    page.wait_for_timeout(250)
    stage=page.locator('#boardStage').bounding_box();board=page.locator('#board').bounding_box()
    print(machine,display,width,'relative board width',board['width']/stage['width'],flush=True)
    assert abs(board['width']/stage['width']-.841)<.003
    assert abs(board['height']/stage['height']-842/1245)<.003
    assert abs((board['x']-stage['x'])/stage['width']-.076)<.003
    assert abs((board['y']-stage['y'])/stage['height']-74/1245)<.003
    assert page.locator('#board button').count()==64
    for i,square in enumerate(page.locator('#board button').all()):
     box=square.bounding_box();cx=box['x']+box['width']/2;cy=box['y']+box['height']/2
     assert abs(cx-(board['x']+(i%8+.5)*board['width']/8))<1
     assert abs(cy-(board['y']+(i//8+.5)*board['height']/8))<1
    if os.environ.get('SCREENSHOT_DIR') and display=='normal':page.screenshot(path=os.path.join(os.environ['SCREENSHOT_DIR'],f'artwork-{machine}-{width}.png'),full_page=True)
   page.locator('[data-category="display"]').tap();page.locator('#mmviView').select_option('classic');page.locator('#menuClose').tap()
   assert not page.locator('#boardStage').evaluate("e=>e.classList.contains('mephisto-surface')")
  assert not errors,errors
  c.close()
 b.close()
 print('PASS: Vancouver/Polgar board geometry and all 64 square centers in normal/LCD/off, portrait/landscape and return to classic board.')
