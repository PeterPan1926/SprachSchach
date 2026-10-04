from playwright.sync_api import sync_playwright
import os
BASE=os.environ.get("WEB_TEST_URL", "http://127.0.0.1:8767/")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':900},service_workers='block')
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'?ansicht=menue',wait_until='networkidle')
 assert page.locator('#enginePanel').is_visible()
 assert not page.locator('#lcdPanel').is_visible()
 page.locator('#engineVariantCount').select_option('4')
 page.wait_for_function("[...document.querySelectorAll('.engine-line')].length===4&&[...document.querySelectorAll('.engine-line')].every(e=>Number(e.dataset.depth)>0&&e.querySelector('.engine-line-pv').dataset.uci)",timeout=90000)
 assert page.locator('.engine-line svg').count()==0
 assert page.locator('.engine-line-score').all_text_contents()!=['--.--']*4
 page.locator('[data-category="game"]').click();page.locator('#appMode').select_option('analysis');page.locator('#menuClose').click()
 page.locator('#entry').fill('e2e4');page.locator('#submit').click()
 page.wait_for_function("document.querySelector('#enginePanel').dataset.fen.split(' ')[1]==='b'&&[...document.querySelectorAll('.engine-line')].every(e=>Number(e.dataset.depth)>0)",timeout=90000)
 assert page.locator('.engine-line-pv').first.inner_text().startswith('1…')
 oldfen=page.locator('#enginePanel').get_attribute('data-fen')
 page.locator('#replayStart').click()
 page.wait_for_function("document.querySelector('#enginePanel').dataset.fen.split(' ')[1]==='w'&&[...document.querySelectorAll('.engine-line')].every(e=>Number(e.dataset.depth)>0)",timeout=90000)
 assert oldfen!=page.locator('#enginePanel').get_attribute('data-fen')
 page.locator('[data-category="display"]').click();page.locator('#engineDisplay').select_option('lcd');page.locator('#menuClose').click()
 assert page.locator('#lcdPanel').is_visible();assert not page.locator('#enginePanel').is_visible()
 page.locator('[data-category="display"]').click();page.locator('#engineDisplay').select_option('off');page.locator('#menuClose').click()
 assert not page.locator('#lcdPanel').is_visible();assert not page.locator('#enginePanel').is_visible()
 page.locator('[data-category="display"]').click();page.locator('#engineDisplay').select_option('normal');page.locator('#menuClose').click()
 page.reload(wait_until='networkidle');assert page.locator('#engineVariantCount').input_value()=='4';assert page.locator('#enginePanel').is_visible()
 page.locator('#language').select_option('en')
 assert page.locator('#engineVariantLabel').inner_text().strip()=='Lines:'
 page.wait_for_function("document.querySelector('#engineViewState').innerText.includes('complete')",timeout=90000)
 print('Completed PV lengths:',page.locator('.engine-line-pv').evaluate_all("els=>els.map(e=>e.dataset.uci.split(' ').filter(Boolean).length)"))
 page.locator('#engineContinuous').check()
 page.wait_for_function("document.querySelector('#engineViewState').innerText.includes('Analyzing')",timeout=90000)
 page.locator('#engineContinuous').uncheck()
 if os.environ.get('SCREENSHOT'):page.screenshot(path=os.environ['SCREENSHOT'])
 # Rendering a long legal PV must keep exactly the first eight half-moves.
 page.evaluate("""async()=>{const {renderEngineView}=await import('./engine-view.js');const {Chess}=await import('./chess.js');renderEngineView(new Chess().fen(),{cp:75,depth:12,pv:'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7'.split(' ')},'ready','en');}""")
 assert len(page.locator('.engine-line-pv').first.get_attribute('data-uci').split())==8
 assert page.locator('.engine-line-depth').first.inner_text()=='Depth: 12'
 page.evaluate("""async()=>{const {renderEngineView}=await import('./engine-view.js');renderEngineView('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1',{terminal:true,checkmate:true,winner:'w'},'terminal','en');}""")
 assert page.locator('.engine-line-score').first.inner_text()=='+M0'
 assert page.locator('.engine-line-pv').first.get_attribute('data-uci')==''
 mobile=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,service_workers='block')
 m=mobile.new_page();m.goto(BASE+'?ansicht=menue',wait_until='networkidle')
 m.locator('#engineVariantCount').select_option('4')
 assert m.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert m.locator('#enginePanel').is_visible()
 classic=c.new_page();classic.goto(BASE,wait_until='networkidle')
 assert classic.locator('#enginePanel').is_visible()
 assert not errors,errors
 print('PASS: real Stockfish 4 lines with individual scores/depth, white/black move numbering, replay position, normal/LCD/off switching, saved settings, localization; no JS errors')
 b.close()
