Version 1.0.1 bringt die Menüleiste in die obere Zeile: **Partie · Analyse · Dateien · Sprache & KI · Darstellung · Hilfe**. Menüs öffnen durch Antippen und schließen mit „Schließen“, der Android-Zurück-Taste oder einem Tipp außerhalb. Die Leiste bleibt beim Scrollen sichtbar und kann auf schmalen Bildschirmen seitlich gescrollt werden. Mit angeschlossener Maus funktioniert auch Mouse-over.

Die Android-App auf Basis von SprachSchach startet in der Menüansicht und enthält die Web-App, Stockfish sowie die Mephisto-Engines für Offline-Partien.

**Download:** Unter **Assets** die vollständige Datei `SprachSchach-Menue-1.0.1.apk` herunterladen. Die ZIP-Dateien „Source code“ enthalten nur Quellcode und sind keine installierbare App.

**Installation:** Ab Android 8.0. Android System WebView aktuell halten. Die APK auf dem Android-Gerät öffnen und bei Bedarf dem Browser oder Dateimanager die Installation unbekannter Apps erlauben.

Browser-Partien können über „Partie → Partien und Chat sichern“ exportiert und über „Sicherung wiederherstellen“ in die App importiert werden.

**Prüfung:** APK-Build und Android Lint werden vor der Veröffentlichung ausgeführt. Die eingebettete Web-App wurde einschließlich Menübedienung und Stockfish-Antwort geprüft. Der native Gerätetest ist wegen des bislang fehlgeschlagenen Emulatorstarts noch nicht bestätigt; Mikrofon und Kamera sind noch nicht auf einem echten Gerät geprüft.

Dies ist eine mit einem Entwicklungs-Schlüssel signierte Vorabversion, keine Play-Store-Veröffentlichung. Der CI-Build erzeugt einen eigenen Schlüssel und lässt sich daher möglicherweise nicht über eine zuvor anders signierte APK installieren. Vor einer notwendigen Deinstallation Partien und Chat sichern; eine Deinstallation löscht die App-Daten.
