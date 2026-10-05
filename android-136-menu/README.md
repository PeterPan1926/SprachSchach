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

Im Hochformat steht die optionale LCD-Anzeige kompakt über dem Brett.
Die Brettgröße berücksichtigt den verbleibenden Bildschirmplatz; bei den
Fotobrettern wird das gesamte Artwork gleichmäßig skaliert.
Zwischen den beiden Zugzeilen einer LCD-Variante liegen 6 CSS-Pixel Abstand
(ungefähr 1,6 mm, abhängig von Geräteskalierung).

Die Figurengitter von Vancouver und Polgar verwenden die kalibrierten
Fotobrett-Koordinaten. Die Größenanpassung des klassischen Bretts überschreibt
diese Koordinaten nicht.

Version `1.36-menue.6`, Paket `de.sprachschach.menue136`, Name **SprachSchach 1.36 Menü**.
Sie wird separat neben dem Original installiert. Die Original-App und deren Daten
bleiben erhalten. Archive und API-Schlüssel werden nicht automatisch übernommen;
PGN aus der bisherigen App exportieren und in der Menüfassung importieren.
Die bisherigen Releases bis `android-136-menu-v5` wurden jeweils mit einem neu
erzeugten, nicht gesicherten Entwicklungs-Schlüssel signiert. Android lehnt deshalb
Updates zwischen diesen Releases ab. Ab Version 6 nutzt der Build einen dauerhaften,
privat gespeicherten Schlüssel und prüft dessen Zertifikat-Fingerabdruck.
Updates zwischen damit signierten Versionen behalten Einstellungen und App-Daten;
Paketname und Speicherorte bleiben gleich. Ohne eingerichteten Schlüssel bricht der
Build ab, statt einen Ersatzschlüssel zu erzeugen.

Der Wechsel von einer bisherigen CI-Fassung zu dieser Signatur erfordert weiterhin
eine einmalige Deinstallation. Ohne den alten privaten Schlüssel lässt sich kein
kompatibles Update dieser alten Fassung erzeugen. Die aktuelle App vorerst behalten
und Partien vor einem Wechsel exportieren. PGN enthält weder alle Einstellungen
noch den vollständigen Chatverlauf. Die Original-App deshalb ebenfalls behalten.
Einrichtung und Grenzen: [Dauerhafte Signatur](SIGNING.md).

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
