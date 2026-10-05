# Menüfassung der Original-Android-App 1.36

Diese Variante baut auf der bereitgestellten APK aus dem Release
`sprach_schach_v1_36` auf. Apktool rekonstruiert Ressourcen und Dalvik-Code;
der ursprüngliche Java-Quellcode liegt weiterhin nicht vor. Die Schachdateien,
Sprachanbindung und nativen MM-VI-Bibliotheken stammen aus der Original-APK.
Ergänzt werden die obere Menüleiste, die Anordnung der vorhandenen Bedienelemente
und die normale Engine-Anzeige: 1–4 Varianten mit Bewertung, individueller
Rechentiefe und bis zu acht berechneten Halbzügen. Jede Variante steht
einzeilig direkt unter dem Brett; die Brettgröße berücksichtigt den Platz
für die Varianten. Lange Zeilen lassen sich seitlich scrollen. Unter Darstellung kann zwischen
Normal, LCD und Aus gewählt werden; Daueranalyse bleibt konfigurierbar.

Die Figurengitter von Vancouver und Polgar verwenden die kalibrierten
Fotobrett-Koordinaten. Die Größenanpassung des klassischen Bretts überschreibt
diese Koordinaten nicht.

Version `1.36-menue.4`, Paket `de.sprachschach.menue136`, Name **SprachSchach 1.36 Menü**.
Sie wird separat neben dem Original installiert. Die Original-App und deren Daten
bleiben erhalten. Archive und API-Schlüssel werden nicht automatisch übernommen;
PGN aus der bisherigen App exportieren und in der Menüfassung importieren.
CI-Versionen sind mit neuen Entwicklungs-Schlüsseln signiert und können nicht
über eine anders signierte Menüfassung installiert werden. PGN enthält keinen
vollständigen Chatverlauf. Die Original-App deshalb behalten.

`prepare.py` ändert die App-Identität und die passenden Datei-Provider-Adressen,
behält die ursprünglichen nativen Klassennamen für die JNI-Anbindung und ergänzt
`menu-view.js`/`menu-view.css` aus dem Repository. Die ursprünglichen Engine-Assets
bleiben byteweise erhalten. `app.js` erhält die zusätzliche Anzeige-Anbindung,
`stockfish-client.js` erlaubt nun bis zu vier Varianten. Menüs öffnen durch Antippen und schließen durch
„Schließen“ oder Tippen außerhalb. Android-Zurück behält das Verhalten des Originals.

Der Workflow `android-136-release.yml` lädt die APK und Apktool mit festgelegten
SHA-256-Prüfsummen, baut und signiert eine Entwicklungs-APK und veröffentlicht
sie als Vorab-Release. Die native Ausführung wurde bislang nicht auf einem echten
Android-Gerät geprüft. Die Web-Oberfläche ist mit echter Stockfish-Antwort und
Testempfänger für die originalen Android-Brückenaufrufe geprüft.
