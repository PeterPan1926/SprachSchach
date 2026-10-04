package de.sprachschach.menue;

import android.content.Intent;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class AndroidSmokeTest {
    private MainActivity activity;
    private String evaluate(String expression) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        activity.runOnUiThread(() -> {
            WebView web = (WebView)((ViewGroup)activity.findViewById(android.R.id.content)).getChildAt(0);
            web.evaluateJavascript(expression, value -> { result.set(value); done.countDown(); });
        });
        assertTrue("WebView evaluation timed out", done.await(15, TimeUnit.SECONDS));
        return result.get();
    }
    private void awaitTrue(String expression) throws Exception {
        long until = System.currentTimeMillis() + 120000;
        do {
            if ("true".equals(evaluate(expression))) return;
            Thread.sleep(250);
        } while (System.currentTimeMillis() < until);
        fail("Android WebView condition did not become true: " + expression);
    }
    @Test public void bundledMenuAndStockfishWorkInAndroidWebView() throws Exception {
        android.app.Instrumentation instrumentation = InstrumentationRegistry.getInstrumentation();
        Intent launch = new Intent(instrumentation.getTargetContext(), MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity = (MainActivity)instrumentation.startActivitySync(launch);
        try {
            awaitTrue("document.querySelectorAll('#board button').length===64 && document.querySelectorAll('.menu-bar [data-category]').length===6");
            assertEquals("true", evaluate("location.origin==='https://appassets.androidplatform.net' && location.search==='?ansicht=menue' && typeof AndroidNative.postMessage==='function'"));
            assertEquals("true", evaluate("document.querySelector('.menu-bar').getBoundingClientRect().top < document.querySelector('#playingHeader').getBoundingClientRect().top"));
            evaluate("document.querySelector('[data-category=game]').click()");
            assertEquals("true", evaluate("document.querySelector('#appMenu').open && !document.querySelector('#menu-game').hidden"));
            evaluate("document.querySelector('[data-category=display]').click()");
            assertEquals("true", evaluate("!document.querySelector('#menu-display').hidden"));
            evaluate("document.querySelector('#menuClose').click()");
            assertEquals("false", evaluate("document.querySelector('#appMenu').open"));
            evaluate("window.androidSmokeResult=null;import('./stockfish-client.js').then(async({StockfishClient})=>{const {Chess}=await import('./chess.js');const r=await new StockfishClient().search([],'w',{nodes:12000});window.androidSmokeResult=new Chess().moves({verbose:true}).some(m=>m.from+m.to+(m.promotion||'')===r.move);}).catch(()=>window.androidSmokeResult=false)");
            awaitTrue("window.androidSmokeResult===true");
            assertEquals("true", evaluate("document.querySelector('#offlineStatus').innerText.includes('Offline bereit.')"));
        } finally { activity.runOnUiThread(activity::finish); }
    }
}
