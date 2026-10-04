# SprachSchach Menü für Android

Eigenständige Android-App auf Basis der Web-App, ab Android 8.0 (API 26).
Die App heißt **SprachSchach Menü**, Paket `de.sprachschach.menue`, Version 1.0.0.
Sie startet mit der Menüansicht. Die klassische Ansicht bleibt über den Link
oben erreichbar. Beide Ansichten teilen das Archiv innerhalb dieser App.

Die App enthält die Web-Dateien, Stockfish und die drei Mephisto-WebAssembly-
Module. Zum Spielen ist kein Webserver und kein Internet nötig. Sie verwendet
Android System WebView; bitte dieses über den Play Store aktuell halten.

## Installation und Daten

Die signierte Entwicklungs-APK installieren und bei Bedarf dem verwendeten
Browser/Dateimanager die Installation unbekannter Apps erlauben. Die App wird
zusätzlich zu vorhandenen SprachSchach-Apps installiert; sie ersetzt diese nicht.
Das ist keine Play-Store-Veröffentlichung.

Browser und Android-App haben getrennte Archive und API-Schlüssel. In der
Web-App **Partie → Partien und Chat sichern** verwenden, dann in der Android-App
**Partie → Sicherung wiederherstellen** auswählen. API-Schlüssel bei Bedarf in
der App neu einrichten. Sicherungen vor einer Deinstallation exportieren;
Deinstallation löscht den privaten App-Speicher. App-Daten werden nicht automatisch
in Android-Cloud-Backups übernommen.

## Android-Funktionen

- Android-Sprachausgabe und Spracherkennung; Mikrofonfreigabe erst beim ersten
  Start der Spracheingabe. Ein Sprachdienst und dessen Sprachpakete müssen auf
  dem Gerät vorhanden sein. Spracherkennung kann Internet benötigen.
- Kamera mit Freigabe beim Öffnen; alternativ Fotos aus der Android-Datei-Auswahl.
- PGN/FEN/Text und JSON-Sicherungen über die Android-Datei-Auswahl importieren.
- PGN und Sicherungen über „Speichern unter“ exportieren, PGN als Text teilen
  oder in die Android-Zwischenablage kopieren.
- Zurück schließt zuerst ein geöffnetes Menü/Dialog bzw. die LCD-Vollbildansicht.
- Keine Hintergrund-Spracherkennung. Beim Verlassen werden Spracheingabe,
  Sprachausgabe und Engine-Aktivität angehalten.

Optionales OpenAI/Gemini verwendet die vorhandene Browser-API-Anbindung mit
verschlüsselter Speicherung im App-Profil. API-Zugang, Kosten und CORS-Regeln
liegen beim Anbieter. Ein ChatGPT-Abo liefert keinen API-Zugang.

## Build

Benötigt: JDK 21 (oder ein mit Gradle 8.13 kompatibles JDK ab 17), Android SDK 35,
Build Tools 35.0.0. `ANDROID_HOME` auf das SDK setzen oder den Pfad in der ignorierten
Datei `android/local.properties` als `sdk.dir=/pfad/zum/sdk` eintragen.

```sh
cd android
./gradlew --no-daemon assembleDebug lintDebug
```

APK: `app/build/outputs/apk/debug/app-debug.apk`.
`prepareWebAssets` übernimmt die Web-Distribution aus dem Repository-Hauptordner
in generierte Assets und ergänzt die Android-Anbindung. Quell-Webdateien werden
nicht überschrieben. Git-Daten, lokale Konfiguration und andere Android-Dateien
werden nicht als Web-Assets eingebunden. Die Web-App bleibt separat unverändert.

Der Gradle-Wrapper prüft seine Download-Prüfsumme. Abhängigkeiten kommen aus
Google Maven und Maven Central. AndroidX WebKit stellt lokale Assets unter einem
HTTPS-Ursprung bereit. Die native Nachrichtenbrücke ist auf diesen Ursprung und
das Hauptfenster beschränkt. Externe HTTPS-Links öffnen den Browser.

Der Debug-Signierschlüssel wird lokal unter `android/debug.keystore` erzeugt und
nicht eingecheckt. Diesen Schlüssel für lokale APK-Updates behalten und sicher
aufbewahren. Neue CI-Läufe erzeugen eigene Debug-Schlüssel; solche APKs sind nicht
als Updates einer anders signierten Installation installierbar. Für dauerhafte
Veröffentlichung und Updates wird ein eigener, sicher verwahrter Release-Schlüssel
benötigt. Die CI stellt die Entwicklungs-APK als GitHub-Actions-Artefakt bereit.

## Prüfung des erzeugten Web-Pakets

Nach dem Build kann das erzeugte Web-Paket mit Python Playwright und Chromium
getestet werden. Der Test prüft Menü, echte Stockfish-Antwort und die Nachrichten
an die native Brücke mit einem Test-Empfänger; er ersetzt keinen Android-Gerätetest.

```sh
# Terminal 1, im Verzeichnis android:
python3 -m http.server 8766 --bind 127.0.0.1 --directory app/build/generated/webAssets/web
# Terminal 2, im Verzeichnis android (Python Playwright muss installiert sein):
CHROMIUM=/pfad/zu/chromium python3 tests/web-smoke.py
```

Die Drittanbieter-Lizenzen der Web-App werden mitgeliefert; siehe die Lizenz- und
Quellcodehinweise im Repository-Hauptordner.
