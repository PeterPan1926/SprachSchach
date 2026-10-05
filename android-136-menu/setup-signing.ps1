# Einmalige Einrichtung auf dem eigenen Windows-PC. Keine Geheimnisse ausgeben.
param(
    [string]$Repository = 'PeterPan1926/SprachSchach',
    [string]$KeyPath = (Join-Path $env:USERPROFILE '.sprachschach-signing\menu136-release.p12')
)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI fehlt. Installiere sie mit: winget install --id GitHub.cli -e'
}
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    throw 'Java JDK fehlt. Installiere es mit: winget install --id EclipseAdoptium.Temurin.21.JDK -e; danach PowerShell neu starten.'
}
& gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw 'Zuerst gh auth login ausführen und beim Repository-Eigentümer anmelden.' }
$variablesJson = & gh variable list --repo $Repository --json name,value
if ($LASTEXITCODE -ne 0) { throw 'GitHub-Variablen konnten nicht gelesen werden. Repository-Berechtigungen prüfen.' }
$registered = ($variablesJson | ConvertFrom-Json | Where-Object { $_.name -eq 'ANDROID136_CERT_SHA256' }).value
if ($registered -and -not (Test-Path -LiteralPath $KeyPath)) {
    throw 'GitHub hat bereits ein Signierzertifikat. Den gesicherten ursprünglichen Keystore verwenden; keinen neuen erzeugen.'
}
$securePassword = Read-Host 'Passwort des Keystores (bei Ersteinrichtung ein neues, dauerhaft aufbewahrtes Passwort)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$certificate = $null
try {
    $env:ANDROID136_KEYSTORE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    if ($env:ANDROID136_KEYSTORE_PASSWORD.Length -lt 12) { throw 'Mindestens 12 Zeichen verwenden.' }
    $KeyPath = [IO.Path]::GetFullPath($KeyPath)
    if (-not (Test-Path -LiteralPath $KeyPath)) {
        New-Item -ItemType Directory -Path (Split-Path $KeyPath) -Force | Out-Null
        & keytool -genkeypair -storetype PKCS12 -keystore $KeyPath -alias sprachschach -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=SprachSchach Android Release' -storepass:env ANDROID136_KEYSTORE_PASSWORD -keypass:env ANDROID136_KEYSTORE_PASSWORD
        if ($LASTEXITCODE -ne 0) { throw 'Keystore konnte nicht erzeugt werden.' }
    }
    $certificate = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
    & keytool -exportcert -storetype PKCS12 -keystore $KeyPath -alias sprachschach -storepass:env ANDROID136_KEYSTORE_PASSWORD -file $certificate
    if ($LASTEXITCODE -ne 0) { throw 'Keystore oder Passwort ungültig.' }
    $fingerprint = (Get-FileHash -LiteralPath $certificate -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($registered -and $registered.Trim().ToLowerInvariant() -ne $fingerprint) {
        throw 'Dieser Schlüssel passt nicht zum registrierten Zertifikat. Vorhandene Signatur wird nicht ersetzt.'
    }
    # Register the public fingerprint first: retries may only use this same key.
    & gh variable set ANDROID136_CERT_SHA256 --repo $Repository --body $fingerprint
    if ($LASTEXITCODE -ne 0) { throw 'Zertifikat-Fingerabdruck konnte nicht gespeichert werden.' }
    [Convert]::ToBase64String([IO.File]::ReadAllBytes($KeyPath)) | & gh secret set ANDROID136_KEYSTORE_BASE64 --repo $Repository
    if ($LASTEXITCODE -ne 0) { throw 'Keystore konnte nicht als GitHub-Secret gespeichert werden.' }
    $env:ANDROID136_KEYSTORE_PASSWORD | & gh secret set ANDROID136_KEYSTORE_PASSWORD --repo $Repository
    if ($LASTEXITCODE -ne 0) { throw 'Passwort konnte nicht als GitHub-Secret gespeichert werden.' }
    Write-Host "Dauerhafte Signatur eingerichtet. Keystore sichern: $KeyPath"
    Write-Host 'Passwort getrennt im Passwortmanager aufbewahren. Schlüssel und Passwort nicht in Git oder Chat hochladen.'
    Write-Host 'Der Release-Build kann jetzt auf der GitHub-Actions-Seite manuell gestartet werden.'
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    Remove-Item Env:ANDROID136_KEYSTORE_PASSWORD -ErrorAction SilentlyContinue
    if ($certificate) { Remove-Item -LiteralPath $certificate -ErrorAction SilentlyContinue }
    $securePassword.Dispose()
}
