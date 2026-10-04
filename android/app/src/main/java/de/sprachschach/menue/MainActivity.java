package de.sprachschach.menue;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONObject;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String HOME = ORIGIN + "/assets/web/index.html?ansicht=menue";
    private static final int PICK_FILE = 1, SAVE_FILE = 2, AUDIO_PERMISSION = 3, CAMERA_PERMISSION = 4;
    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady, foreground, startAfterPermission;
    private SpeechRecognizer recognizer;
    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingFile;
    private String pendingLanguage;
    private PermissionRequest cameraRequest;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        web = new WebView(this);
        web.setBackgroundColor(0xff101c23);
        setContentView(web);
        // Android 15 enforces edge-to-edge: keep controls outside system bars and keyboard.
        web.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        web.requestApplyInsets();
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        // Content URIs selected explicitly by the user are needed for file inputs.
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = assets.shouldInterceptRequest(request.getUrl());
                if (response != null) return response;
                if ("appassets.androidplatform.net".equals(request.getUrl().getHost()))
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(), new java.io.ByteArrayInputStream(new byte[0]));
                return null;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost()) && uri.getPath() != null && uri.getPath().startsWith("/assets/web/")) return false;
                if (request.isForMainFrame() && "https".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (android.content.ActivityNotFoundException e) { notice("Kein Browser verfügbar."); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                // Do not log page data, keys, positions or conversations.
                return true;
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                try { startActivityForResult(intent, PICK_FILE); }
                catch (android.content.ActivityNotFoundException e) { fileCallback.onReceiveValue(null); fileCallback = null; notice("Keine Datei-Auswahl verfügbar."); }
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (!ORIGIN.equals(request.getOrigin().toString().replaceAll("/$", ""))) { request.deny(); return; }
                    if (!java.util.Arrays.asList(request.getResources()).contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                    else { if (cameraRequest != null) cameraRequest.deny(); cameraRequest = request; requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION); }
                });
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) { if (cameraRequest == request) cameraRequest = null; }
        });
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
        WebViewCompat.addWebMessageListener(web, "AndroidNative", Collections.singleton(ORIGIN),
            (view, message, sourceOrigin, mainFrame, reply) -> {
                if (!mainFrame) return;
                try { handle(new JSONObject(message.getData())); }
                catch (Exception e) { notice("Android-Funktion konnte nicht ausgeführt werden."); }
            });
        } else {
            Toast.makeText(this, "Bitte Android System WebView aktualisieren.", Toast.LENGTH_LONG).show(); finish(); return;
        }
        tts = new TextToSpeech(this, status -> {
            ttsReady = status == TextToSpeech.SUCCESS;
            if (ttsReady) tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) {}
                @Override public void onDone(String id) { speechEvent("speechEnd", id); }
                @Override public void onError(String id) { speechEvent("speechError", id); }
            });
        });
        // Reload after Activity recreation; localStorage/IndexedDB restore the game.
        web.loadUrl(HOME);
    }
    private void handle(JSONObject data) throws Exception {
        switch (data.optString("type")) {
            case "listen":
                pendingLanguage = data.optString("language", "de-DE");
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED)
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION);
                else listen(pendingLanguage);
                break;
            case "stopListening": stopListening(); break;
            case "speak":
                String id = Integer.toString(data.getInt("id"));
                if (!ttsReady) { speechEvent("speechError", id); break; }
                int language = tts.setLanguage(Locale.forLanguageTag(data.optString("language", "de-DE")));
                if (language == TextToSpeech.LANG_MISSING_DATA || language == TextToSpeech.LANG_NOT_SUPPORTED) { speechEvent("speechError", id); break; }
                if (tts.speak(data.getString("text"), TextToSpeech.QUEUE_FLUSH, null, id) == TextToSpeech.ERROR) speechEvent("speechError", id);
                break;
            case "stopSpeech": if (tts != null) tts.stop(); break;
            case "copy":
                ((ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("PGN", data.getString("text")));
                notice("PGN in die Zwischenablage kopiert."); break;
            case "save":
                if (pendingFile != null) { notice("Bitte zuerst die geöffnete Datei-Auswahl abschließen."); break; }
                byte[] bytes = data.getString("text").getBytes(StandardCharsets.UTF_8);
                if (bytes.length > 32 * 1024 * 1024) { notice("Die Sicherung ist zu groß."); break; }
                String name = data.optString("name", "SprachSchach.txt").replaceAll("[^a-zA-Z0-9._-]", "_");
                pendingFile = bytes;
                try { startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                    .setType(data.optString("mime", "text/plain")).putExtra(Intent.EXTRA_TITLE, name), SAVE_FILE); }
                catch (android.content.ActivityNotFoundException e) { pendingFile = null; notice("Keine Datei-Auswahl verfügbar."); }
                break;
            case "share":
                try { startActivity(Intent.createChooser(new Intent(Intent.ACTION_SEND).setType("text/plain")
                    .putExtra(Intent.EXTRA_SUBJECT, data.optString("name", "SprachSchach PGN"))
                    .putExtra(Intent.EXTRA_TEXT, data.getString("text")), "PGN teilen")); }
                catch (android.content.ActivityNotFoundException e) { notice("Keine App zum Teilen verfügbar."); }
                break;
        }
    }
    private void event(String type, JSONObject data) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window.androidNativeEvent?.(" + JSONObject.quote(type) + "," + data + ")", null); });
    }
    private JSONObject field(String key, Object value) {
        JSONObject data = new JSONObject(); try { data.put(key, value); } catch (Exception ignored) {} return data;
    }
    private void notice(String text) { event("notice", field("text", text)); }
    private void speechEvent(String type, String id) { try { event(type, field("id", Integer.parseInt(id))); } catch (NumberFormatException ignored) {} }
    private void stopListening() { SpeechRecognizer old = recognizer; recognizer = null; if (old != null) { old.cancel(); old.destroy(); } }
    private void listen(String language) {
        if (!foreground || !SpeechRecognizer.isRecognitionAvailable(this)) { event("recognitionError", field("error", "service-not-allowed")); return; }
        stopListening();
        SpeechRecognizer current = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer = current;
        current.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { event("recognitionStart", new JSONObject()); }
            @Override public void onBeginningOfSpeech() {}
            @Override public void onRmsChanged(float rms) {}
            @Override public void onBufferReceived(byte[] bytes) {}
            @Override public void onEndOfSpeech() {}
            @Override public void onError(int error) {
                if (recognizer != current) return;
                String reason = error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS ? "not-allowed" : "service-not-allowed";
                event("recognitionError", field("error", reason));
            }
            @Override public void onResults(Bundle results) {
                if (recognizer != current) return;
                ArrayList<String> words = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (words != null && !words.isEmpty()) event("recognitionResult", field("text", words.get(0)));
                else event("recognitionError", field("error", "no-speech"));
            }
            @Override public void onPartialResults(Bundle results) {}
            @Override public void onEvent(int type, Bundle params) {}
        });
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, language).putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        recognizer.startListening(intent);
    }
    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] grants) {
        super.onRequestPermissionsResult(code, permissions, grants);
        boolean allowed = grants.length > 0 && grants[0] == PackageManager.PERMISSION_GRANTED;
        if (code == AUDIO_PERMISSION) { if (allowed) { if (foreground) listen(pendingLanguage); else startAfterPermission = true; } else event("recognitionError", field("error", "not-allowed")); }
        if (code == CAMERA_PERMISSION && cameraRequest != null) {
            if (allowed) cameraRequest.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE}); else cameraRequest.deny(); cameraRequest = null;
        }
    }
    @Override protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == PICK_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(result == RESULT_OK && data != null && data.getData() != null ? new Uri[]{data.getData()} : null);
            fileCallback = null;
        }
        if (code == SAVE_FILE) {
            byte[] bytes = pendingFile; pendingFile = null;
            if (result == RESULT_OK && data != null && data.getData() != null && bytes != null) {
                try (OutputStream stream = getContentResolver().openOutputStream(data.getData())) {
                    if (stream == null) throw new java.io.IOException(); stream.write(bytes); notice("Datei gespeichert.");
                } catch (Exception e) { notice("Datei konnte nicht gespeichert werden."); }
            }
        }
    }
    @Override protected void onResume() { super.onResume(); foreground = true; if (startAfterPermission) { startAfterPermission = false; listen(pendingLanguage); } if (web != null) { web.onResume(); web.evaluateJavascript("window.engineForegroundChanged?.(true)", null); } }
    @Override protected void onPause() { foreground = false; stopListening(); if (tts != null) tts.stop(); if (web != null) { web.evaluateJavascript("window.engineForegroundChanged?.(false)", null); web.onPause(); } super.onPause(); }
    @Override public void onBackPressed() {
        web.evaluateJavascript("(()=>{const d=document.querySelector('dialog[open]');if(d){if(d.dispatchEvent(new Event('cancel',{cancelable:true})))d.close();return true;}const f=document.querySelector('#lcdFullscreenPanel:not([hidden])');if(f){window.closeLcdFullscreen?.();return true;}return false;})()", handled -> { if (!"true".equals(handled)) super.onBackPressed(); });
    }
    @Override protected void onDestroy() {
        stopListening();if (tts != null) tts.shutdown();if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (cameraRequest != null) cameraRequest.deny();if (web != null) { web.destroy(); web = null; }super.onDestroy();
    }
}
