# SprachSchach für iPad – Safari und Home-Bildschirm

Kein Mac, Xcode oder Apple-Entwicklerkonto notwendig. Diese Web-App wird über HTTPS veröffentlicht und auf dem iPad in Safari geöffnet. Das lokale Öffnen aus der Dateien-App oder ein ZIP-Link reicht nicht: JavaScript-Module, Worker und Offline-Installation benötigen eine Website. Ein öffentlicher Host ist nicht Teil dieses Downloads. Empfohlen: aktuelles iPadOS, mindestens 17.

## Auf dem iPad

1. Die veröffentlichte HTTPS-Adresse in Safari öffnen. Beim ersten Mal mit Internet und geöffneter App warten, bis unten „Offline bereit“ erscheint. Der vollständige Stockfish mit NNUE ist groß (rund 80 MB entpackt).
2. Safari → Teilen → Zum Home-Bildschirm → Hinzufügen. Falls iPadOS eine Auswahl anbietet, „Als Web-App öffnen“ einschalten.
3. Über das neue Symbol starten. Stockfish, Brett, Analyse, LCD und Archiv arbeiten nach dem vollständigen Laden ohne Internet. Browserdaten können vom Betriebssystem bei Speichermangel gelöscht werden: Partien/Chat regelmäßig als JSON sichern.
4. „Zug sprechen“ antippen, Mikrofon freigeben, ggf. Siri/Diktieren aktivieren. Safari-Spracherkennung hängt vom iPadOS-Gerät/Sprachdienst ab und kann Internet benötigen. Freisprechen hört nach Antworten erneut zu, solange die App im Vordergrund ist. Es ist keine Hintergrund- oder Bildschirm-aus-Erkennung. Fehlt die Sprachfunktion, bleiben Brett/Text nutzbar. Stimmen aus iPadOS sind kostenlos; optional OpenAI gegen API-Kosten.
5. Kamera erlauben oder Screenshots/Bilder aus Fotos/Dateien laden. Aufnahme erst durch „Foto aufnehmen“; API-Übertragung erst durch „Bild erkennen“. Erst kontrollierte Stellung übernehmen.

## Veröffentlichen ohne Mac – eigene Website

ZIP zusammenfügen und auf einem Windows-PC entpacken. **Den Inhalt** von `SprachSchach-iPad-Web-1.1.2` auf die Website hochladen, z. B. in `/sprachschach/`; index.html muss dort direkt liegen. HTTPS aktivieren. Keine Dateien umbenennen: die sechs Stockfish-WASM-Teile müssen mit hochgeladen werden. MIME-Typen: .js text/javascript, .wasm application/wasm, .webmanifest application/manifest+json. Serverseitige API-Schlüssel sind nicht nötig. Für sw.js Cache-Control: no-cache verwenden. Relative Pfade unterstützen Unterordner.

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

Deine Adresse bleibt https://peterpan1926.github.io/SprachSchach/ . Vorher in der App „Partien und Chat sichern“ wählen. Im GitHub-Repository den **Inhalt** von `SprachSchach-iPad-Web-1.1.2` in den Hauptordner hochladen und vorhandene Programmdateien ersetzen. `index.html`, `sw.js`, `variations.js` und `notation-view.js` müssen direkt im Hauptordner liegen, nicht in einem zusätzlichen Versionsordner. Die bisherigen Pages-Einstellungen bleiben bestehen. Keine Schlüssel oder Partiensicherungen ins Repository hochladen.

Nach abgeschlossenem GitHub-Pages-Build die bisherige Adresse in Safari öffnen. Die neue Offline-Version herunterladen lassen. Bei der Meldung „Neue Version bereit“ die Seite beziehungsweise die Home-Bildschirm-App schließen und erneut öffnen oder neu laden. Erst anschließend offline verwenden. Der Cache erhält eine neue Versionskennung; Archiv und verschlüsselte Schlüssel bleiben am selben Ursprung/Safari-Profil gespeichert. Websitedaten nicht löschen. Safari und eine Home-Bildschirm-Installation können getrennte Datenbestände verwenden.

Die Downloaddateien wurden hier vorbereitet; deine GitHub-Seite wurde nicht verändert.


## Safari-Version 1.1.2: klassische Figuren und Tablet-Querformat

Brett, Zusammenfassungsdiagramme, Bild-Kontrollbrett und Figurenpalette verwenden eigene klassische SVG-Figuren (GPLv3). Weiß ist ausdrücklich elfenbeinfarben mit dunkler Kontur, Schwarz anthrazitfarben. Keine Emoji- oder Schriftabhängigkeit; Bauern haben einen kleineren Kopf und Sockel und sind niedriger als König/Dame. Alle Figuren passen in einheitliche feldbezogene Grafikboxen.

Im Querformat stehen Brett und Navigation links, LCD/anklickbare PGN/Chat rechts. Die Brettgröße wird durch die verfügbare Höhe begrenzt und berücksichtigt die Navigationspfeile. LCD und die rechten Lesefenster passen sich an; bei sehr kleinen Querformaten ist die rechte Spalte scrollbar. Die ganze Seite lässt sich weiterhin auch über dem Brett scrollen, sodass die weiteren Bedienelemente erreichbar bleiben. Im Hochformat bleibt das Brett breit; die Reihenfolge ist LCD, Brett, Navigation, PGN, Chat. Vollbild bleibt auf die ausdrücklich gewählte LCD-Vollbildansicht beschränkt.

Für das bestehende Repository reicht das **kleine Update-ZIP mit allen Webdateien außer WASM**: entpacken und sämtliche enthaltenen Dateien direkt im Repository-Hauptordner ersetzen/ergänzen. Die sechs unveränderten Stockfish-WASM-Dateien müssen bereits dort liegen. Der vollständige Download 1.1.2 enthält sie weiterhin. Nach Pages-Veröffentlichung Seite mit Internet öffnen, neue Offline-Dateien fertig laden lassen und bei „Neue Version bereit“ neu laden. Websitedaten nicht löschen; vorher Archiv/Chat sichern. Die Versionszeile unten zeigt 1.1.2.

Prüfung in Chromium: explizite Figurenfarben/-proportionen, Feldgrenzen, Zug/Replays mit SVG, Bilderkennungs-Kontrollbrett/Palette, Tablet-Hoch-/Querformat mit und ohne LCD, Scrollen über dem Brett, Modus/Varianten/PGN mit vollständigem Stockfish und Offline-Neustart. Update von 1.1.0 auf 1.1.2 erhält Archiv/Chat und verschlüsselte Schlüssel. Ein tatsächlicher Safari-/iPad-Gerätetest ist hier nicht möglich. Die vorhandene GitHub-Seite wurde hier nicht verändert.


### Alternative LCD-Ansicht mit MultiPV

Unter den LCD-Bedienelementen kann **1, 2 oder 3 Hauptvarianten** gewählt werden. 1 zeigt die gewohnte große Einzelbewertung; 2/3 zeigen die besten Stockfish-Kandidaten gleichzeitig, jeweils mit eigener Bewertung aus Sicht von Weiß und den nächsten vier legalen Halbzügen. Weiß/Schwarz bleiben in vollständigen Zugzeilen getrennt; Schwarz-am-Zug kann drei Zeilen benötigen. Kürzere Mattfolgen oder weniger verfügbare legale Kandidaten werden nicht künstlich aufgefüllt. Rechentiefe/-zeit bleiben sichtbar. Die Auswahl bleibt lokal gespeichert und gilt auch für Daueranalyse mit 1/4/10 Sekunden/unendlich.

„LCD im Vollbild“ und „LCD · nur Informationen“ öffnen bei 2/3 Hauptvarianten die entsprechende große Variantenansicht. Im Querformat stehen die Varianten nebeneinander, im Hochformat untereinander. Das X bzw. Escape schließt sie. Im normalen Tablet-Querformat vergrößern eine kompakte Kopfzeile und eine höhenabhängige LCD-Größe zugleich Brett und LCD-Zeichen; Pfeile, PGN und Chat bleiben erreichbar.

Stockfish erhält das tatsächliche UCI-MultiPV-Kommando, kein mehrfacher Einzelzug-Tipp. Nur zusammengehörige Varianten derselben Rechentiefe werden gemeinsam übernommen. Vor einem Spielzug/Coach-Auftrag wird MultiPV wieder auf 1 gestellt. Normale Partieauswertung und beste Bewertung werden nicht mit einem Nebenvariantenscore überschrieben. Die reale Engine-Prüfung kontrolliert separate Weiß-Bewertungen einschließlich Schwarz-am-Zug, vier legale Halbzüge, unterschiedliche Erstzüge, gemeinsame Tiefe, Vollbild/Neustart und Rückkehr zum Spiel/Einzelmodus.

## Merida-Figuren (1.1.2)

Brett, Stellungsdiagramme und Import-Kontrollbrett verwenden den originalen Merida-SVG-Figurensatz von Armando Hernandez Marroquin (GPLv2 oder neuer). Weiße Figuren bleiben weiß; Bauern sind etwas kleiner als die übrigen Figuren. Quellen und Lizenzhinweise: MERIDA-NOTICE.txt und THIRD-PARTY-NOTICES.md. Die Figuren werden lokal mitgeliefert und sind nach der Offline-Installation ohne Internet verfügbar.
