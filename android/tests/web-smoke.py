from playwright.sync_api import sync_playwright
import os
BASE_URL=os.environ.get("ANDROID_WEB_TEST_URL", "http://127.0.0.1:8766/")
CHROMIUM=os.environ.get("CHROMIUM", "/usr/bin/chromium")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=CHROMIUM,args=['--no-sandbox'])
 context=b.new_context(viewport={'width':412,'height':915})
 context.add_init_script("""window.nativeMessages=[];window.AndroidNative={postMessage:raw=>{const d=JSON.parse(raw);window.nativeMessages.push(d);if(d.type==='speak')setTimeout(()=>window.androidNativeEvent('speechEnd',{id:d.id}),10);}};""")
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE_URL+'?ansicht=menue',wait_until='networkidle')
 assert page.locator('#board button').count()==64
 assert 'Offline bereit.' in page.locator('#menuOfflineStatus').inner_text()
 page.locator('#entry').fill('e2e4');page.locator('#submit').click()
 page.wait_for_function("document.querySelector('#history').innerText.includes('1...')",timeout=90000)
 assert page.evaluate("nativeMessages.some(x=>x.type==='speak')")
 page.locator('#menuOpen').click();page.locator('[data-category="files"]').click();page.locator('#pgnSave').click()
 assert page.evaluate("nativeMessages.some(x=>x.type==='save'&&x.name.endsWith('.pgn'))")
 page.locator('#pgnCopy').click();assert page.evaluate("nativeMessages.some(x=>x.type==='copy')")
 page.locator('[data-category="game"]').click()
 page.get_by_role('button',name='Partien und Chat sichern',exact=True).click()
 assert page.evaluate("nativeMessages.some(x=>x.type==='save'&&x.name.endsWith('.json'))")
 page.locator('#menuClose').click();page.locator('#mic').click()
 assert page.evaluate("nativeMessages.some(x=>x.type==='listen')")
 page.evaluate("androidNativeEvent('recognitionStart',{});androidNativeEvent('recognitionError',{error:'service-not-allowed'})")
 assert not page.locator('#handsFree').is_checked()
 assert not errors,errors

 print('PASS: generated Android assets, menu, offline status, real Stockfish reply, native TTS/save/copy/backup/listen messages and recognition error handling')
 b.close()
