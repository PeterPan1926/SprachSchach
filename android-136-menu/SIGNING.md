# Updates ohne wiederholte Deinstallation

Android verlangt für ein Update denselben Paketnamen, einen passenden Versionscode
und dasselbe Signierzertifikat. Ein neuer Schlüssel pro Release verursacht den
gemeldeten Paketkonflikt. Die bisherigen CI-Schlüssel aus Releases 1–5 sind nicht
gesichert und lassen sich aus der APK nicht rekonstruieren. Eine Signaturrotation
hilft hier nicht: Sie benötigt ebenfalls den alten privaten Schlüssel.

Ab Version `1.36-menue.6` (Versionscode 43) erzeugt der Release-Workflow keinen
Schlüssel mehr. Er nutzt ausschließlich den dauerhaft hinterlegten Schlüssel mit
Alias `sprachschach`, prüft den öffentlichen SHA-256-Zertifikat-Fingerabdruck vor
und nach dem Signieren und bricht bei fehlender oder falscher Konfiguration ab.
Der Paketname `de.sprachschach.menue136` und die bisherigen Speicherorte bleiben gleich.

## Einmalige Einrichtung auf Windows

Voraussetzungen: Java JDK (Befehl `keytool`) und GitHub CLI (Befehl `gh`). Falls sie fehlen:

```powershell
winget install --id EclipseAdoptium.Temurin.21.JDK -e
winget install --id GitHub.cli -e
```

Anschließend PowerShell neu öffnen und mit dem GitHub-Konto anmelden, das dieses
Repository verwalten darf:

```powershell
gh auth login
```

Das Skript aus dem eigenen Repository nach Downloads laden und lokal ausführen:

```powershell
$script = Join-Path $env:USERPROFILE 'Downloads\SprachSchach-Signatur.ps1'
Invoke-WebRequest 'https://raw.githubusercontent.com/PeterPan1926/SprachSchach/main/android-136-menu/setup-signing.ps1' -OutFile $script
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script
```

Das Skript fragt das Keystore-Passwort verdeckt ab. Bei der ersten Ausführung ein
neues Passwort mit mindestens 12 Zeichen wählen und dauerhaft im Passwortmanager
aufbewahren. Es erstellt den Schlüssel ausschließlich, wenn noch keiner vorhanden
ist, und speichert ihn unter:

```text
C:\Users\DEIN_NAME\.sprachschach-signing\menu136-release.p12
```

Die Datei zusätzlich an einem sicheren Ort sichern. Die private Schlüsseldatei und
das Passwort nicht in Git, Chat, öffentliche Downloads oder Release-Anhänge stellen.
Eine spätere Ausführung verwendet dieselbe Datei und dasselbe Passwort. Falls GitHub
bereits einen Fingerabdruck enthält, wird ein anderer Schlüssel nicht akzeptiert.

Das Skript hinterlegt direkt über die GitHub CLI:

| Einstellung | Zweck |
| --- | --- |
| Actions-Secret `ANDROID136_KEYSTORE_BASE64` | Base64 des privaten PKCS12-Keystores |
| Actions-Secret `ANDROID136_KEYSTORE_PASSWORD` | Gemeinsames Keystore-/Schlüssel-Passwort |
| Actions-Variable `ANDROID136_CERT_SHA256` | Öffentlicher Zertifikat-Fingerabdruck, 64 Hex-Zeichen |

Keystore und Passwort werden nicht ausgegeben. GitHub-Secrets sind keine
herunterladbare Sicherung; deshalb die lokale Datei und das Passwort behalten.
Den Fingerabdruck nicht ändern, um einen verlorenen Schlüssel zu ersetzen.
Nur vertrauenswürdige Repository-Verwalter dürfen den Release-Workflow bearbeiten.

## Neues Release bauen

Nach erfolgreicher Einrichtung [Android 1.36 Menu Release](https://github.com/PeterPan1926/SprachSchach/actions/workflows/android-136-release.yml)
öffnen, **Run workflow** auswählen, Branch **main** und Tag **android-136-menu-v6**
beibehalten. Der Workflow baut die Version 6 und veröffentlicht ihre APK als
Vorab-Release. Alternativ:

```powershell
gh workflow run android-136-release.yml --repo PeterPan1926/SprachSchach --ref main -f release_tag=android-136-menu-v6
```

Der Release-Tag muss zur vorbereiteten Versionsnummer passen. Spätere Versionen
erhalten einen höheren Versionscode und verwenden weiterhin exakt dieselbe Signatur.
Ein bereits bestehendes Release wird nicht überschrieben.

## Übergang von den alten Releases

Die neue dauerhafte Signatur passt nicht zu den früheren CI-Releases. Diese alte
Fassung nicht vorzeitig deinstallieren. Zuerst Partien exportieren und wichtige
Einstellungen separat notieren. PGN sichert keine vollständigen Einstellungen oder
Chatverläufe. Der anschließende einmalige Wechsel kann diese Daten daher verlieren.
Erst nach Installation einer mit dem dauerhaften Schlüssel signierten Version sind
weitere Updates unter derselben Signatur ohne Deinstallation möglich. Falls eine
alte APK stattdessen lokal signiert wurde und deren privater Schlüssel noch vorhanden
ist, kann mit genau diesem Schlüssel ein kompatibles Update erstellt werden.
