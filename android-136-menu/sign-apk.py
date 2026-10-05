"""Sign with the persistent repository key; never generate a replacement key."""
import argparse
import base64
import binascii
import hashlib
import os
from pathlib import Path
import re
import subprocess
import tempfile


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        # Tool diagnostics must not accidentally disclose signing credentials.
        raise ValueError("Signaturprüfung fehlgeschlagen. Keystore, Alias sprachschach und Passwort prüfen.")
    return result.stdout


def sign(apk, apksigner):
    encoded = os.environ.get('ANDROID136_KEYSTORE_BASE64', '')
    password = os.environ.get('ANDROID136_KEYSTORE_PASSWORD', '')
    expected = os.environ.get('ANDROID136_CERT_SHA256', '').lower()
    if not encoded or not password or not re.fullmatch(r'[0-9a-f]{64}', expected):
        raise ValueError('Dauerhafte Signatur fehlt: GitHub-Secrets ANDROID136_KEYSTORE_BASE64, '
                         'ANDROID136_KEYSTORE_PASSWORD und Variable ANDROID136_CERT_SHA256 einrichten. '
                         'Es wird kein Ersatzschlüssel erzeugt.')
    try:
        key = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        raise ValueError('ANDROID136_KEYSTORE_BASE64 ist ungültig.') from None
    if not key:
        raise ValueError('Der Keystore ist leer.')
    with tempfile.TemporaryDirectory(prefix='sprachschach-sign-') as directory:
        keystore = Path(directory) / 'release.p12'
        keystore.write_bytes(key)
        keystore.chmod(0o600)
        # Verify the public certificate before signing anything.
        java_home = os.environ.get('JAVA_HOME')
        keytool = str(Path(java_home) / 'bin/keytool') if java_home else 'keytool'
        certificate = Path(directory) / 'certificate.der'
        run([keytool, '-exportcert', '-keystore', str(keystore), '-storetype', 'PKCS12',
             '-storepass:env', 'ANDROID136_KEYSTORE_PASSWORD', '-alias', 'sprachschach',
             '-file', str(certificate)])
        if hashlib.sha256(certificate.read_bytes()).hexdigest() != expected:
            raise ValueError('Signierzertifikat stimmt nicht mit ANDROID136_CERT_SHA256 überein. '
                             'Abbruch zum Schutz der Update-Kompatibilität.')
        if apk is None:
            print('Dauerhafter Signierschlüssel und Zertifikat geprüft.')
            return
        run([apksigner, 'sign', '--ks', str(keystore), '--ks-key-alias', 'sprachschach',
             '--ks-pass', 'env:ANDROID136_KEYSTORE_PASSWORD', '--key-pass',
             'env:ANDROID136_KEYSTORE_PASSWORD', str(apk)])
        output = run([apksigner, 'verify', '--verbose', '--print-certs', str(apk)])
        fingerprints = re.findall(r'^Signer #\d+ certificate SHA-256 digest: ([0-9a-fA-F]+)$',
                                  output, re.MULTILINE)
        if [value.lower() for value in fingerprints] != [expected]:
            raise ValueError('Die fertige APK hat nicht das erwartete Signierzertifikat.')
        print('APK-Signatur geprüft. Zertifikat SHA-256: ' + expected)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', nargs='?', type=Path, help='Ohne APK nur die Konfiguration prüfen.')
    parser.add_argument('--apksigner', default='apksigner')
    args = parser.parse_args()
    try:
        sign(args.apk, args.apksigner)
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')
