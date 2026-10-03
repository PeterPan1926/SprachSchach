# Lokale Mephisto-Emulation im Browser

MAME 0.289 / Original-ROMs: MM VI, Vancouver 32 Bit, Polgar 10 MHz (10.1).
Der Browser-Port verwendet denselben korrigierten LCD-Zeichensatz wie Android
1.33. Die CPU emuliert die unveränderten Original-ROMs in einem Web Worker.
Kein Server, keine API und keine Browser-Pthreads/SharedArrayBuffer erforderlich.

## Reproduzierbarer Build

MAME 0.289 entpacken. Emscripten 3.1.69, Python 3, GNU Make und ein nativer
GENie-Generator werden benötigt. Die vorhandenen nativen Build-Objekte werden
nicht verändert; Browser-Objekte liegen unter build-web.

```sh
export EMSCRIPTEN=/pfad/zu/emscripten
export MAME_SOURCE_DIR=/pfad/zu/mame-mame0289
bash native/web/build.sh
MEPHISTO_WEB_CORE="$MAME_SOURCE_DIR/mephistoweb" node ipad-web/build.cjs
```

Der Kopflose OSD, eine nachrichtenbasierte Lua-Eingabe ohne Hintergrundthread
und die bereits von MAME unterstützte Emscripten-Hauptschleife werden verwendet.
Die Änderung betrifft den Plattformadapter, nicht das Schach-ROM. WebAssembly
wird in Dateien zu höchstens 8 MiB geteilt; kein Sonder-MIME-Typ oder besondere
HTTP-Header werden für diese Teile benötigt, da der Worker sie zusammensetzt.

Vollständige Modulzustände und automatische Zug-Zwischenstände liegen in
IndexedDB unter der Website-Adresse. Partien, Varianten, PGN und Chat bleiben
im vorhandenen Archiv in localStorage. Datum, Zugverlauf, Geräteart und SHA256
werden zu den benannten Modulständen gespeichert. Neue Speicherungen bleiben
zusätzlich erhalten. Bei anderer Website-Adresse/anderem Browserprofil sind
die lokalen Speicher getrennt; Website-Daten nicht löschen. Android-native
Zustände werden nicht als browserkompatibel vorausgesetzt.

Für Polgar kann eine App-Partie mit passenden automatisch gespeicherten
Zwischenständen fortgesetzt werden. Fremde PGN ohne Firmware-Zustand werden
mit Stockfish analysiert; sie werden nicht als Polgar-ROM-Historie erfunden.
Freie FEN-Stellungen sind für Stockfish; im Originalmodul lassen sich Figuren
mit POS wie auf der Hardware setzen.

WASM wird beim Öffnen eines Moduls geladen. Der Offline-Cache umfasst auch
Unterordner, Originalfotos, Display-SVGs, ROMs, Lua und WASM-Teile. Audio muss
durch Antippen aktiviert werden. Browser und Betriebssystem können die
Emulation beim Hintergrundwechsel unterbrechen; normale Spiele werden aus
Zwischenständen neu gestartet. Benannte Modulstände ausdrücklich speichern.

Lizenz: MAME GPL-2.0-or-later und seine enthaltenen Drittanbieter-Lizenzen;
Browser-Brücke entsprechend dem Hauptprojekt GPL-3.0-or-later. ROMs und
Originalfotos wurden vom Nutzer zur gewünschten Emulation bereitgestellt.
