# Real keytool, simulated GitHub API. Never changes repository secrets.
$ErrorActionPreference = 'Stop'
$testDirectory = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $testDirectory | Out-Null
$keyPath = Join-Path $testDirectory 'release.p12'
$setup = Join-Path $PSScriptRoot '..\setup-signing.ps1'
$global:SigningMock = @{ Fingerprint = ''; Secrets = @{}; Password = [guid]::NewGuid().ToString('N') }
function global:Read-Host {
    ConvertTo-SecureString $global:SigningMock.Password -AsPlainText -Force
}
function global:gh {
    $global:LASTEXITCODE = 0
    if ($args[0] -eq 'auth') { return }
    if ($args[0] -eq 'variable' -and $args[1] -eq 'list') {
        if ($global:SigningMock.Fingerprint) {
            ConvertTo-Json -InputObject @(@{name='ANDROID136_CERT_SHA256';value=$global:SigningMock.Fingerprint}) -Compress
        } else { '[]' }
        return
    }
    if ($args[0] -eq 'variable' -and $args[1] -eq 'set') {
        $index = [Array]::IndexOf($args,'--body')
        $global:SigningMock.Fingerprint = $args[$index + 1]
        return
    }
    if ($args[0] -eq 'secret' -and $args[1] -eq 'set') {
        $global:SigningMock.Secrets[$args[2]] = (@($input) -join "`n")
        return
    }
    throw 'Unexpected gh command in signing test.'
}
try {
    & $setup -KeyPath $keyPath
    if (-not (Test-Path $keyPath)) { throw 'No key generated.' }
    if ($global:SigningMock.Secrets.ANDROID136_KEYSTORE_PASSWORD -ne $global:SigningMock.Password) { throw 'Wrong password uploaded.' }
    $encoded = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keyPath))
    if ($global:SigningMock.Secrets.ANDROID136_KEYSTORE_BASE64 -ne $encoded) { throw 'Wrong key uploaded.' }
    if (Test-Path Env:ANDROID136_KEYSTORE_PASSWORD) { throw 'Password environment variable not cleaned up.' }
    $original = (Get-FileHash $keyPath).Hash
    & $setup -KeyPath $keyPath
    if ((Get-FileHash $keyPath).Hash -ne $original) { throw 'Key changed on repeat setup.' }
    $global:SigningMock.Fingerprint = '0' * 64
    $rejected = $false
    try { & $setup -KeyPath $keyPath } catch { $rejected = $true }
    if (-not $rejected) { throw 'Different registered certificate accepted.' }
    if (Test-Path Env:ANDROID136_KEYSTORE_PASSWORD) { throw 'Password not cleaned after failure.' }
    $rejected = $false
    try { & $setup -KeyPath (Join-Path $testDirectory 'missing.p12') } catch { $rejected = $true }
    if (-not $rejected) { throw 'Lost registered key silently replaced.' }
    Write-Host 'PASS: setup registers key/password, reuses existing key, rejects mismatch/lost key, cleans credentials.'
} finally {
    Remove-Item -LiteralPath $testDirectory -Recurse -Force
    Remove-Item Function:gh,Function:Read-Host -ErrorAction SilentlyContinue
    Remove-Variable SigningMock -Scope Global -ErrorAction SilentlyContinue
}
