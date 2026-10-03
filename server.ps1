# Only local static assets. No API keys, shell commands or uploads are accepted.
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 8765)
try { $listener.Start() } catch { Write-Host 'Port 8765 ist belegt. Bitte eine schon laufende SprachSchach-Browser-Version nutzen oder schliessen.'; exit 1 }
Start-Process 'http://127.0.0.1:8765/'
Write-Host 'SprachSchach laeuft im Browser. Dieses Fenster offen lassen. Beenden: Strg+C.'
try {
 while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
   $client.ReceiveTimeout = 5000
   $client.SendTimeout = 15000
   $stream = $client.GetStream()
   $reader = [IO.StreamReader]::new($stream,[Text.Encoding]::ASCII,$false,4096,$true)
   $line = $reader.ReadLine()
   $headers = @{}
   for ($i=0; $i -lt 100; $i++) { $h=$reader.ReadLine(); if ([string]::IsNullOrEmpty($h)) { break }; if($h.Length -gt 8192){throw 'invalid header'}; $pair=$h.Split(@(':'),2);if($pair.Length -eq 2){$headers[$pair[0].ToLowerInvariant()]=$pair[1].Trim()} }
   $status='404 Not Found'; $mime='text/plain'; $body=[Text.Encoding]::UTF8.GetBytes('Not found')
   if ($line -match '^GET (/[^ ]*) HTTP/1\.[01]$' -and $headers['host'] -eq '127.0.0.1:8765') {
    $url=[Uri]::UnescapeDataString(($Matches[1].Split('?')[0])); if($url -eq '/'){ $url='/index.html' }
    $file=[IO.Path]::GetFullPath((Join-Path $root $url.TrimStart('/')))
    if ($file.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -and [IO.File]::Exists($file)) {
     $body=[IO.File]::ReadAllBytes($file); $status='200 OK'
     switch ([IO.Path]::GetExtension($file).ToLowerInvariant()) { '.html' {$mime='text/html; charset=utf-8'} '.js' {$mime='text/javascript; charset=utf-8'} '.css' {$mime='text/css; charset=utf-8'} '.wasm' {$mime='application/wasm'} '.svg' {$mime='image/svg+xml'} default {$mime='application/octet-stream'} }
    }
   }
   $head=[Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`nCross-Origin-Resource-Policy: same-origin`r`n`r`n")
   $stream.Write($head,0,$head.Length);$stream.Write($body,0,$body.Length);$stream.Flush()
  } catch { } finally { $client.Close() }
 }
} finally { $listener.Stop() }
