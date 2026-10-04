from playwright.sync_api import sync_playwright
import os
BASE=os.environ.get("ANDROID136_TEST_URL","http://127.0.0.1:8768/")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
 for width,height in [(390,844),(360,640),(844,390)]:
  c=b.new_context(viewport={'width':width,'height':height},has_touch=True,is_mobile=True)
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE,wait_until='networkidle')
  page.locator('#engineVariantCount').select_option('4')
  page.wait_for_function("[...document.querySelectorAll('.engine-line')].length===4&&[...document.querySelectorAll('.engine-line')].every(e=>Number(e.dataset.depth)>0)",timeout=90000)
  page.wait_for_timeout(200)
  box=page.locator('#enginePanel').bounding_box();board=page.locator('#board').bounding_box()
  print(width,height,'board',board,'panel',box,flush=True)
  assert box['y']>=board['y']+board['height']-1
  assert box['y']-(board['y']+board['height'])<20
  assert box['y']+box['height']<=height,('Display overflow',width,height,box)
  for row in page.locator('.engine-line').all():
   assert row.bounding_box()['height']<40
   assert row.evaluate("e=>getComputedStyle(e.querySelector('.engine-line-pv')).whiteSpace==='nowrap'")
  assert not errors,errors
  if os.environ.get('SCREENSHOT_DIR'):page.screenshot(path=os.path.join(os.environ['SCREENSHOT_DIR'],f'compact-native-{width}.png'))
  c.close()
 print('PASS: four one-line variants directly under the board fit portrait and landscape displays.')
 b.close()
