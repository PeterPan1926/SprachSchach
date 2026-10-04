# Web-App 1.2.1 – Stand Android 1.36

## Android-App mit Menüansicht

Eine eigenständige Android-App auf Basis dieser Web-App liegt unter
[`android/`](android/README.md). Sie enthält die lokalen Schach-Engines und startet
mit der Menüansicht. Installation, Datenübernahme und APK-Build sind dort beschrieben.

## Alternative Menüansicht

Über **„Menüansicht ausprobieren“** oben auf der Seite wird die alternative
Ansicht geöffnet. Sie ist auch direkt über `?ansicht=menue` an der bisherigen
Website-Adresse erreichbar. Brett, Notation, Chat und Zugeingabe bleiben im
Spielfenster; **„☰ Menü“** bündelt die übrigen Funktionen:

- **Partie:** Spiel-/Analysemodus, neue Partie, Gegner, Spielstärke, Farbe,
  Aufgeben/Remis und gespeicherte Partien samt Sicherung.
- **Analyse:** Varianten, Stockfish-Einstellungen und Partieauswertung.
- **Dateien:** Kamera/Bild, PGN/FEN importieren und PGN exportieren.
- **Sprache & KI:** Spracheingabe, Zugansagen, Gesprächsanbieter und API-Zugang.
- **Darstellung:** LCD, Hauptvarianten, Daueranalyse und Mephisto-Ansicht.
- **Hilfe:** Bedienhinweise, Lizenzen und Offline-Installation.

**„Klassische Ansicht“** führt zur bisherigen Oberfläche zurück. Beide Ansichten
verwenden am selben Website-Ursprung dasselbe Archiv und dieselben Einstellungen.
Die Menüansicht unterstützt Deutsch/Englisch, Tastaturbedienung und kleine
Bildschirme. Nach dem vollständigen Offline-Download ist auch sie offline nutzbar.

Die Notation lässt sich mit den Pfeiltasten durchgehen: **←** vorheriger Halbzug,
**→** nächster Halbzug, **↑** Partieanfang, **↓** Partieende. Die Navigation gilt
für die ausgewählte Hauptpartie oder Variante. In Eingabefeldern und geöffneten
Dialogen bleiben die normalen Tastaturfunktionen erhalten.

Vancouver: Aufgenommene Figuren behalten jetzt ihren Typ und ihre Farbe.
Der Sensor-Versatz von 14 statt 12 wird auch für FEN und Modulstände verwendet.
MM VI: zusätzliche Textgrafik unter dem Brett entfernt; authentisches LCD bleibt.
Vancouver: vergrößertes LCD kompakter. MM VI/Vancouver nutzen im Hochformat
jeweils die volle Breite der Modulansicht. Tasten sind durch Scrollen erreichbar.
Polgar: unterer Fotoabschnitt entfernt, vergrößertes LCD und Tasten direkt darunter.

Das Update-ZIP enthält alle neuen Webdateien einschließlich Mephisto-Engine.
Die unveränderten sechs Stockfish-WASM-Teile auf der bestehenden Website behalten.
Entpackte Inhalte ins bestehende GitHub-Pages-Repository hochladen, keine ZIP-Datei.
Website-Adresse und Browserprofil beibehalten; Browserdaten nicht löschen.
Nach dem Update auf WEB 1.2.1 und den vollständig geladenen Offline-Cache warten.
Die Veröffentlichung der Website ist nicht Teil dieses Download-Pakets.

# Web-App 1.2.0 – Mephisto-Module lokal

Neu gegenüber Web 1.1.5: MM VI, Vancouver 32 Bit und Polgar 10 MHz (10.1)
lokal über WebAssembly; Originalansichten samt korrektem LCD, Feld-LEDs,
Originaltasten und Polgar-/Vancouver-Fotos aus Android 1.33. Vollständige
Modul-Spielstände können benannt gespeichert und später geladen werden.
Brett, Partienspeicherung, Chat, Spiel-/Analysemodus, Varianten, PGN und
Sprachoptionen stammen aus dem aktuellen gemeinsamen Android-Code.

Zum Spielen das Modul unter Gegner auswählen. Original-Artwork und
Original-Modul öffnen zeigen die Firmware-Tasten und das Sensorbrett.
Computerzüge im Originalmodul selbst anhand der roten LEDs ausführen.
Modul-Spielstände speichert den vollständigen Zustand einschließlich
aufgenommener Figuren; die originale SAVE-Taste behält ihre ROM-Funktion.
Stockfish bleibt für Analysen und als Gegner verfügbar.

Für GitHub Pages den Inhalt des entpackten Web-Ordners in den Hauptordner
des bestehenden Repositorys SprachSchach hochladen. index.html, sw.js und
alle Unterordner müssen direkt dort liegen. ZIP-Dateien nicht hochladen.
Das Update-Paket ersetzt Webdateien und enthält die neue Mephisto-Engine;
es lässt die unveränderten Stockfish-WASM-Teile aus. Diese auf GitHub behalten.
Die einzelnen Mephisto-Teile sind kleiner als die GitHub-Browser-Uploadgrenze.
Nach Veröffentlichung mit Internet öffnen, Offline-Download fertigstellen
und neu laden. Website-Adresse und Browserprofil beibehalten, Website-Daten
nicht löschen. Vor dem Update Partien und Chat über die vorhandene Sicherung
exportieren.

Die App läuft unter HTTPS in Safari sowie Chrome/Edge unter Windows. Safari:
Teilen → Zum Home-Bildschirm. Spracherkennung/Kamera und KI-Aufrufe bleiben
von Browserberechtigungen beziehungsweise API-Zugang abhängig.

Details zur Emulation und ihrem Build stehen in native/web/README.md im
Quellcode. Die folgenden Abschnitte dokumentieren die bisherige Web-Version.

# SprachSchach für iPad – Safari und Home-Bildschirm

Kein Mac, Xcode oder Apple-Entwicklerkonto notwendig. Diese Web-App wird über HTTPS veröffentlicht und auf dem iPad in Safari geöffnet. Das lokale Öffnen aus der Dateien-App oder ein ZIP-Link reicht nicht: JavaScript-Module, Worker und Offline-Installation benötigen eine Website. Ein öffentlicher Host ist nicht Teil dieses Downloads. Empfohlen: aktuelles iPadOS, mindestens 17.

## Auf dem iPad

1. Die veröffentlichte HTTPS-Adresse in Safari öffnen. Beim ersten Mal mit Internet und geöffneter App warten, bis unten „Offline bereit“ erscheint. Der vollständige Stockfish mit NNUE ist groß (rund 80 MB entpackt).
2. Safari → Teilen → Zum Home-Bildschirm → Hinzufügen. Falls iPadOS eine Auswahl anbietet, „Als Web-App öffnen“ einschalten.
3. Über das neue Symbol starten. Stockfish, Brett, Analyse, LCD und Archiv arbeiten nach dem vollständigen Laden ohne Internet. Browserdaten können vom Betriebssystem bei Speichermangel gelöscht werden: Partien/Chat regelmäßig als JSON sichern.
4. „Zug sprechen“ antippen, Mikrofon freigeben, ggf. Siri/Diktieren aktivieren. Safari-Spracherkennung hängt vom iPadOS-Gerät/Sprachdienst ab und kann Internet benötigen. Freisprechen hört nach Antworten erneut zu, solange die App im Vordergrund ist. Es ist keine Hintergrund- oder Bildschirm-aus-Erkennung. Fehlt die Sprachfunktion, bleiben Brett/Text nutzbar. Stimmen aus iPadOS sind kostenlos; optional OpenAI gegen API-Kosten.
5. Kamera erlauben oder Screenshots/Bilder aus Fotos/Dateien laden. Aufnahme erst durch „Foto aufnehmen“; API-Übertragung erst durch „Bild erkennen“. Erst kontrollierte Stellung übernehmen.

## Veröffentlichen ohne Mac – eigene Website

ZIP zusammenfügen und auf einem Windows-PC entpacken. **Den Inhalt** von `SprachSchach-iPad-Web-1.2.1` auf die Website hochladen, z. B. in `/sprachschach/`; index.html muss dort direkt liegen. HTTPS aktivieren. Keine Dateien umbenennen: die sechs Stockfish-WASM-Teile müssen mit hochgeladen werden. MIME-Typen: .js text/javascript, .wasm application/wasm, .webmanifest application/manifest+json. Serverseitige API-Schlüssel sind nicht nötig. Für sw.js Cache-Control: no-cache verwenden. Relative Pfade unterstützen Unterordner.

## GitHub Pages als Möglichkeit ohne eigenen Server

1. Auf https://github.com/ ein kostenloses Konto und ein **öffentliches** Repository namens `SprachSchach` anlegen. Keine eigenen API-Schlüssel oder Partien hochladen.
2. Über „Add file → Upload files“ **den Inhalt** des entpackten Webpakets in den Hauptordner des Repository hochladen. Nicht das ZIP und nicht nur den übergeordneten Ordner hochladen: `index.html` muss im Hauptordner liegen. Die Dateien sind jeweils kleiner als 25 MB und passen in den browserseitigen GitHub-Upload. Hochladen mit „Commit changes“ abschließen.
3. In „Settings → Pages“ als Source **„Deploy from a branch“** wählen. Branch **`main`**, Folder **`/ (root)`**, dann Save.
4. Nach Abschluss der Veröffentlichung erscheint dort eine Adresse wie `https://DEIN-NAME.github.io/SprachSchach/`. HTTPS wird von GitHub bereitgestellt; keine Domain kaufen und keinen eigenen Server betreiben. Diese Adresse in Safari öffnen.
5. Wenn GitHub Upload versteckte Dateien auslässt, bei Bedarf über „Add file → Create new file“ eine leere Datei namens `.nojekyll` anlegen. Die Schachdateien und besonders die WASM-Teile müssen vollständig hochgeladen sein.

GitHub Pages für öffentliche Repositories ist kostenlos innerhalb der Anbieterlimits. Öffentlicher Programmcode ist bei dieser GPL-App vorgesehen. Eigene Daten und API-Schlüssel liegen lokal und gehören nicht ins Repository. Diese App wurde hier noch nicht bei GitHub veröffentlicht; es gibt deshalb noch keine fertige öffentliche Adresse.

## Funktionen und Daten

Gemeinsame Schachfunktionen aus Android 1.17: vollständiger Stockfish 17.1 (ein Thread), deutsche/englische Texte und Zugparser, Spiel und Analyse, Daueranalyse 1/4/10 Sekunden/unendlich, Hash-Auswahl, PGN-Import/-Export/Teilen/Kopieren, gespeicherte Partien samt vollständigem Chat, stellungsbezogene Kommentare, Zusammenfassungen mit Diagrammen, Navigation, festes normales LCD mit letzten gespieltem Zug und vier berechneten Halbzügen, Vollbild mit drei Ansichten. Hochformat nutzt die verfügbare Brettbreite; Querformat zeigt Brett/LCD nebeneinander. Safari kann native Vollbild-APIs einschränken; der CSS-Vollbildmodus funktioniert weiterhin.

Der OpenAI-Schlüssel und ein separater Google-Schlüssel werden einmalig mit AES-GCM und einem nicht exportierbaren CryptoKey in IndexedDB des lokalen Browserprofils gespeichert. Das Browserprofil kann die Schlüssel weiterhin verwenden. Keine Apple-Keychain-Sicherung und keine geräteübergreifende Synchronisierung. Optional OpenAI/Gemini: Internet, passender Modellzugang und API-Kosten; CORS-Regeln des Anbieters können direkte Browseranfragen verhindern. Kein Live-API-Test. Die Schlüssel werden nicht im Service-Worker-Cache oder im Quellcode gespeichert. Nur vertrauenswürdiges eigenes Hosting verwenden; gleichberechtigte Skripte derselben Website können lokale Daten lesen. ChatGPT-Abo enthält keine API-Nutzung.

Safari-Tab und Home-Bildschirm-App können je nach iPadOS getrennte Daten verwenden. In der Home-Bildschirm-App einmal konfigurieren. Ein neues Hosting/andere URL oder das Löschen der Websitedaten übernimmt Archive nicht automatisch. Sicherung als JSON herunterladen und bei Bedarf wiederherstellen; PGN enthält die Partie, nicht den ganzen Chat.

Nicht als Ziel im Teilen-Menü anderer Apps registriert: Bilder/PGN/FEN über die Import-Schaltflächen, Einfügen oder ggf. Drag-and-drop übertragen. Dateidownloads/Teilen hängen von Safari-Unterstützung ab. Ein Bildschirmfoto enthält keine vollständige Partie oder Vorgeschichte.

## Prüfung und Lizenzen

Automatisierte GUI-Prüfung mit echtem Stockfish, iPad-Größen, Offline-Service-Worker und PGN/Archiv. Kein echtes iPad-/Safari-Gerät, Mikrofon, Kamera oder Live-KI-Aufruf geprüft. GPL-3.0, Stockfish 17.1, chess.js; Lizenztexte mitliefern und bei Weitergabe den vollständigen App- und Stockfish-Quellcode bereitstellen. Die Downloadanleitung verweist auf beide Quellcodepakete.

## Version 1.1.0: Spiel-/Analyse-Modus und Varianten

Die Auswahl **Modus** oberhalb von Brett und LCD wechselt jederzeit zwischen **Spiel-Modus** (Stockfish antwortet für die Computerfarbe) und **Analyse-Modus** (Züge beider Seiten eingeben). Das gilt auch in geladenen Partien, in Untervarianten und während einer laufenden Berechnung. Die sichtbare Stellung bleibt erhalten; ausstehende Antworten des alten Modus werden verworfen. Beim expliziten Wechsel zum Spiel-Modus setzt Stockfish an der sichtbaren Stellung fort, sofern seine Farbe am Zug ist.

Im Analyse-Modus steht die **anklickbare PGN-Notation** direkt unter Brett und Navigationspfeilen, oberhalb des Chats. Klick/Antippen zeigt die Stellung nach dem gewählten Halbzug. Hauptvariante und Untervarianten sind mit Zugnummern und Klammern sichtbar; lange Notation ist im Fenster scrollbar. Der angezeigte Zug und sein gespeicherter Chatkommentar werden markiert. „Start“/„Abzweig“ zeigen die jeweilige Ausgangsstellung.

Beim Nachspielen einfach einen legalen Zug per Brett, Text oder Sprache eingeben. Der bestehende nächste Zug führt die Linie weiter; ein anderer Zug legt automatisch einen neuen Zweig an. Bereits vorhandene Abzweige werden wiederverwendet. Am Linienende wird angehängt. Hauptpartie, Bewertungen und Ergebnis bleiben beim Abzweigen erhalten; PGN-Export/-Import erhält die Klammerzweige. Modus, aktueller Zweig und sichtbare Stellung werden mit der Partie gespeichert. Auch Varianten können im Spiel-Modus gegen Stockfish fortgesetzt werden. Die manuelle Schaltfläche „Variante ab hier“ bleibt verfügbar.

Sprachbefehle: „Analyse-Modus“ / „Spiel-Modus“, “analysis mode” / “play mode”. Neue Funktionen entsprechen Android 1.19. Enthalten sind außerdem Aufgabe/Remis, gleich großes normales LCD mit letztem Zug sowie den nächsten vier berechneten Halbzügen, und Chat beim Brett. Nach Aufgabe/Remis vor den zu untersuchenden Zug zurückgehen; das gespeicherte Ergebnis bleibt erhalten.

## Bestehende GitHub-Seite aktualisieren

Deine Adresse bleibt https://peterpan1926.github.io/SprachSchach/ . Vorher in der App „Partien und Chat sichern“ wählen. Im GitHub-Repository den **Inhalt** von `SprachSchach-iPad-Web-1.2.1` in den Hauptordner hochladen und vorhandene Programmdateien ersetzen. `index.html`, `sw.js`, `variations.js` und `notation-view.js` müssen direkt im Hauptordner liegen, nicht in einem zusätzlichen Versionsordner. Die bisherigen Pages-Einstellungen bleiben bestehen. Keine Schlüssel oder Partiensicherungen ins Repository hochladen.

Nach abgeschlossenem GitHub-Pages-Build die bisherige Adresse in Safari öffnen. Die neue Offline-Version herunterladen lassen. Bei der Meldung „Neue Version bereit“ die Seite beziehungsweise die Home-Bildschirm-App schließen und erneut öffnen oder neu laden. Erst anschließend offline verwenden. Der Cache erhält eine neue Versionskennung; Archiv und verschlüsselte Schlüssel bleiben am selben Ursprung/Safari-Profil gespeichert. Websitedaten nicht löschen. Safari und eine Home-Bildschirm-Installation können getrennte Datenbestände verwenden.

Die Downloaddateien wurden hier vorbereitet; deine GitHub-Seite wurde nicht verändert.


## Safari-Version 1.1.5: klassische Figuren und Tablet-Querformat

Brett, Zusammenfassungsdiagramme, Bild-Kontrollbrett und Figurenpalette verwenden eigene klassische SVG-Figuren (GPLv3). Weiß ist ausdrücklich elfenbeinfarben mit dunkler Kontur, Schwarz anthrazitfarben. Keine Emoji- oder Schriftabhängigkeit; Bauern haben einen kleineren Kopf und Sockel und sind niedriger als König/Dame. Alle Figuren passen in einheitliche feldbezogene Grafikboxen.

Im Querformat stehen Brett und Navigation links, LCD/anklickbare PGN/Chat rechts. Die Brettgröße wird durch die verfügbare Höhe begrenzt und berücksichtigt die Navigationspfeile. LCD und die rechten Lesefenster passen sich an; bei sehr kleinen Querformaten ist die rechte Spalte scrollbar. Die ganze Seite lässt sich weiterhin auch über dem Brett scrollen, sodass die weiteren Bedienelemente erreichbar bleiben. Im Hochformat bleibt das Brett breit; die Reihenfolge ist LCD, Brett, Navigation, PGN, Chat. Vollbild bleibt auf die ausdrücklich gewählte LCD-Vollbildansicht beschränkt.

Für das bestehende Repository reicht das **kleine Update-ZIP mit allen Webdateien außer WASM**: entpacken und sämtliche enthaltenen Dateien direkt im Repository-Hauptordner ersetzen/ergänzen. Die sechs unveränderten Stockfish-WASM-Dateien müssen bereits dort liegen. Der vollständige Download 1.1.5 enthält sie weiterhin. Nach Pages-Veröffentlichung Seite mit Internet öffnen, neue Offline-Dateien fertig laden lassen und bei „Neue Version bereit“ neu laden. Websitedaten nicht löschen; vorher Archiv/Chat sichern. Die Versionszeile unten zeigt 1.1.5.

Prüfung in Chromium: explizite Figurenfarben/-proportionen, Feldgrenzen, Zug/Replays mit SVG, Bilderkennungs-Kontrollbrett/Palette, Tablet-Hoch-/Querformat mit und ohne LCD, Scrollen über dem Brett, Modus/Varianten/PGN mit vollständigem Stockfish und Offline-Neustart. Update von 1.1.0 auf 1.1.5 erhält Archiv/Chat und verschlüsselte Schlüssel. Ein tatsächlicher Safari-/iPad-Gerätetest ist hier nicht möglich. Die vorhandene GitHub-Seite wurde hier nicht verändert.


### Alternative LCD-Ansicht mit MultiPV

Unter den LCD-Bedienelementen kann **1, 2 oder 3 Hauptvarianten** gewählt werden. 1 zeigt die gewohnte große Einzelbewertung; 2/3 zeigen die besten Stockfish-Kandidaten gleichzeitig, jeweils mit eigener Bewertung aus Sicht von Weiß und den nächsten vier legalen Halbzügen. Weiß/Schwarz bleiben in vollständigen Zugzeilen getrennt; Schwarz-am-Zug kann drei Zeilen benötigen. Kürzere Mattfolgen oder weniger verfügbare legale Kandidaten werden nicht künstlich aufgefüllt. Rechentiefe/-zeit bleiben sichtbar. Die Auswahl bleibt lokal gespeichert und gilt auch für Daueranalyse mit 1/4/10 Sekunden/unendlich.

„LCD im Vollbild“ und „LCD · nur Informationen“ öffnen bei 2/3 Hauptvarianten die entsprechende große Variantenansicht. Im Querformat stehen die Varianten nebeneinander, im Hochformat untereinander. Das X bzw. Escape schließt sie. Im normalen Tablet-Querformat vergrößern eine kompakte Kopfzeile und eine höhenabhängige LCD-Größe zugleich Brett und LCD-Zeichen; Pfeile, PGN und Chat bleiben erreichbar.

Stockfish erhält das tatsächliche UCI-MultiPV-Kommando, kein mehrfacher Einzelzug-Tipp. Nur zusammengehörige Varianten derselben Rechentiefe werden gemeinsam übernommen. Vor einem Spielzug/Coach-Auftrag wird MultiPV wieder auf 1 gestellt. Normale Partieauswertung und beste Bewertung werden nicht mit einem Nebenvariantenscore überschrieben. Die reale Engine-Prüfung kontrolliert separate Weiß-Bewertungen einschließlich Schwarz-am-Zug, vier legale Halbzüge, unterschiedliche Erstzüge, gemeinsame Tiefe, Vollbild/Neustart und Rückkehr zum Spiel/Einzelmodus.

## Merida-Figuren (1.1.5)

Brett, Stellungsdiagramme und Import-Kontrollbrett verwenden den originalen Merida-SVG-Figurensatz von Armando Hernandez Marroquin (GPLv2 oder neuer). Weiße Figuren bleiben weiß; Bauern sind etwas kleiner als die übrigen Figuren. Quellen und Lizenzhinweise: MERIDA-NOTICE.txt und THIRD-PARTY-NOTICES.md. Die Figuren werden lokal mitgeliefert und sind nach der Offline-Installation ohne Internet verfügbar.

## Mehrvarianten auf kleineren Bildschirmen (1.1.5)

Jede Variante nutzt die volle LCD-Breite mit der Bewertung darüber. Weiß-am-Zug-Folgen nutzen zwei Zugzeilen; Schwarz-am-Zug-Folgen drei, ohne Züge wegzulassen. Die normale Mehrvariantenanzeige ist unabhängig von 2/3 Kandidaten 420 CSS-Pixel hoch. Für bessere Lesbarkeit ist sie größer als die Einzelanzeige; die Seite bzw. Querformat-Seitenleiste bleibt scrollbar. Im kleinen Querformat-Vollbild stehen Varianten untereinander, auf großen Displays weiter nebeneinander.

## Zugansagen (1.1.5)

Unter Sprachgespräch zwischen „Nur Züge ansagen“ und „Züge mit Drohungen/Patzer“ wählen. Gilt für automatische Zugansagen und wird gespeichert, unabhängig von iPad-Stimme oder OpenAI. Vollständiger Chat und ausdrücklich angeforderte Erklärungen bleiben verfügbar. Patzer nur bei ausreichend tiefen Stockfish-Vorher-/Nachher-Bewertungen; ohne zuvor berechnete Ausgangsstellung keine Behauptung. Der Android-Fix für Leerlauf-Diensttöne betrifft die native Android-Spracherkennung.

## Plauder-Modus (1.1.5)

Unter Sprachgespräch den Plauder-Modus und OpenAI/Gemini/lokal wählen. Texte und Sprache besprechen die angezeigte Stellung statt Züge auszuführen; Computerantworten pausieren. Im Chat direkt unter dem Brett erscheinen Fragefeld und Stellung-/Zugideen-Schaltflächen. „Zugmodus“ schaltet zurück. API funktioniert auch mit TTS und bereits gespeichertem Schlüssel. OpenAI: gpt-4.1-mini; Google: gemini-flash-latest (eigener Schlüssel). API-Nutzung kann kostenpflichtig sein, keine bestätigte Überlegenheit oder verifizierte Version „Gemini 3.8 Flash“. Bei Anbieterfehler ausdrücklich gemeldete lokale Antwort. Kein API-Request im Leerlauf.
