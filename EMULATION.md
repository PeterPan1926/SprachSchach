# Mephisto MM VI in SprachSchach (1.1.6)

SprachSchach kann jetzt gegen den mit MAME emulierten **Mephisto MM VI** spielen.
Spielereingaben, Computerzüge, Sprachansagen, Brettanzeige, Archiv und PGN nutzen
die vorhandene Oberfläche. Im PGN steht der tatsächliche Gegnername.
Stockfish bleibt als alternativer Gegner und für Analysen verfügbar.

## Wo läuft die Emulation?

Die Oberfläche läuft im Browser auf Android, iPad oder PC. Die Emulation läuft
in dieser Version auf einem verbundenen PC/Server mit **MAME 0.289**. Ein kleiner
Python-Dienst verbindet beide über WebSocket und den MessNew-UCI-Adapter.
Die installierte MAME4droid-App wird nicht von dieser Web-App gesteuert. Diese
Erweiterung ist kein neues Android-APK und keine vollständig lokale Android-Lösung.

Zunächst wird nur `mm6` unterstützt. Das MM-V-Artwork wird nicht benötigt: Die
Web-App zeichnet das normale Schachbrett selbst. MAME benötigt dennoch die
Display-Gerätedatei `mdisplay3.zip` zusätzlich zu `mm6.zip`.
ROMs und Artwork werden separat aus dem vorhandenen Bestand bereitgestellt.

## Installation auf dem PC/Server

Benötigt werden Python 3.10 oder neuer, MAME 0.289 einschließlich seiner normalen
Plugin-/Artwork-/Hash-Dateien und die beiden geprüften ROM-ZIPs. Der Dienst
benötigt keine grafische MAME-Oberfläche. Beispiel für Linux/macOS:

```sh
cd SprachSchach
python3 -m venv .venv
.venv/bin/python -m pip install -r bridge/requirements.txt
.venv/bin/python bridge/server.py \
  --mame /absoluter/pfad/mame \
  --roms /absoluter/pfad/roms \
  --mame-data /absoluter/pfad/mame-daten
```

`--mame-data` ist der Ordner mit `plugins`, `artwork` und `hash`.
`--mame` erwartet eine ausführbare Datei oder ein ausführbares Wrapper-Skript,
keine zusammengesetzte Shell-Anweisung. Unter Windows entsprechend
`.venv\Scripts\python.exe` verwenden; Windows wurde hier nicht getestet.

Auf demselben PC die vom Dienst bereitgestellte Seite im Browser öffnen
(Standardport 8765). Unter **Gegner → Mephisto MM VI** die WebSocket-Adresse
des Dienstes mit Pfad `/engine` eintragen, die Verbindung prüfen und eine neue
Partie beginnen. Die standardmäßige MM-VI-Stufe ist `a4`; Stufen `a1` bis `h8`
werden an den originalen Adapter weitergereicht. Sehr lange Rechenstufen können
die Zeitgrenze überschreiten; `--timeout` erlaubt bis zu 300 Sekunden auf dem
Server, der Browser wartet bis zu 120 Sekunden pro Antwort.

## Android/iPad über das Netzwerk

Für ein zweites Gerät muss der PC/Server erreichbar sein. Netzwerkbetrieb
benötigt einen Verbindungscode in einer Datei mit mindestens 24 Zeichen:

```sh
python3 -c "import secrets,pathlib; pathlib.Path('.emulator-token').write_text(secrets.token_urlsafe(32))"
.venv/bin/python bridge/server.py \
  --mame /absoluter/pfad/mame \
  --roms /absoluter/pfad/roms \
  --mame-data /absoluter/pfad/mame-daten \
  --host 0.0.0.0 --token-file .emulator-token \
  --cert-file /pfad/zertifikat.pem --key-file /pfad/privater-schluessel.pem
```

Das Zertifikat muss auf den Geräten als vertrauenswürdig gelten. Über HTTPS
bereitgestelltes SprachSchach benötigt eine **wss://**-Adresse. Für Mikrofon und
PWA-Nutzung ebenfalls HTTPS verwenden. Alternativ kann ein eigener TLS-Reverse-
Proxy sowohl Webseite als auch `/engine` bereitstellen und WebSocket-Upgrades
weiterreichen. Ein eventuell gesetzter eigener Origin muss mit `--allow-origin`
genau zugelassen werden. Beispielsweise beim bestehenden GitHub-Pages-Auftritt:
`--allow-origin https://peterpan1926.github.io`. Eine Pages-Unterverzeichnis-
Adresse gehört nicht zum Origin. Der tatsächliche Origin muss zur geöffneten
Seite passen. GitHub Pages kann nur die Webdateien hosten, nicht den Python-Dienst.

Im Gegnerbereich die Dienstadresse und den Verbindungscode eintragen. Der Code
bleibt ausschließlich im Sitzungsspeicher des Browsers; nach dem Schließen
gegebenenfalls erneut eingeben. Er wird nicht im Partienarchiv oder PGN abgelegt.
Adresse und Stufe werden lokal gespeichert.

## Partie und Änderungen übernehmen

- Brett oder vorhandene Texteingabe/Sprachfunktion für eigene Züge verwenden.
- Computerantworten werden auf Legalität und Zugehörigkeit zur aktuellen Stellung
  geprüft. Bei Fehlern bleibt die Stellung erhalten; es wird kein Ersatzgegner
  eingeschaltet. Die Fehlermeldung kann zum erneuten Versuch angeklickt werden.
- Partien und Chat werden automatisch lokal archiviert. **PGN speichern** exportiert
  die Partie als Datei. Für eine dauerhafte Sicherung PGN oder Archiv exportieren;
  das Löschen von Browser-Websitedaten entfernt die lokale Speicherung.
- Neue Partie, Rücknahme und Neuladen sind unterstützt. Der Dienst rekonstruiert
  die Zughistorie bei Bedarf in einer frischen Emulation. Eine laufende Partie
  benötigt eine Verbindung zum Dienst; Stockfish kann weiterhin lokal spielen.
- MM VI wird aus der normalen Grundstellung gespielt. Importierte Einzelstellungen
  sind weiterhin mit Stockfish nutzbar. Unterumwandlungen sind im übernommenen
  Adapter nicht unterstützt und können eine Fehlermeldung auslösen.

Das Update-ZIP enthält alle Webdateien **außer den unveränderten Stockfish-WASM-
Dateien** sowie Dienst, Adapter und Tests. Im vorhandenen Repository alle
enthaltenen Dateien ersetzen/ergänzen und die sechs WASM-Dateien behalten.
Vorher Archiv sichern. Nach einer eigenen Veröffentlichung einmal online öffnen,
Offline-Dateien laden lassen und bei „Neue Version bereit“ neu laden. Archivschlüssel
und vorhandene Partien bleiben erhalten; Websitedaten nicht löschen.

## Prüfung

```sh
node --test tests/emulator.test.mjs
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
# Optionaler echter Browser-/Emulatortest; Dienst muss bereits laufen:
.venv/bin/python -m pip install playwright
.venv/bin/python tests/browser_emulator.py --chromium /pfad/chromium
```

Geprüft unter Linux mit MAME 0.289 und Chromium: mehrere echte MM-VI-Gegenzüge,
MM VI als Weiß, Anzeige im Brett/Chat, Neuladen und Wiederaufbau, Rücknahme mit
abweichender Fortsetzung, Archiv, PGN-Dateidownload und anschließendes Stockfish-
Spiel, Offline-Dateien und Brettbreite bei Smartphone-Auflösung. Protokolltests prüfen ungültige/veraltete Züge, Abbruch, Origin,
Authentifizierung und dass ROM-/Geheimnisdateien nicht über HTTP ausgeliefert
werden. Ein Android-/iPad-Gerätetest dieser Erweiterung steht noch aus.

Der Dienst begrenzt gleichzeitig zugelassene Verbindungen auf zwei und beendet
die jeweilige MAME-Instanz beim Verbindungsende. NVRAM und Konfiguration liegen
pro Verbindung in temporären Ordnern und werden anschließend entfernt.
