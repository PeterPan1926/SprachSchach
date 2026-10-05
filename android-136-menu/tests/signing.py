"""Exercise real APK signing and refusal of missing/mismatched credentials."""
import base64
import hashlib
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import tempfile

source = Path(sys.argv[1]).resolve()
apksigner = str(Path(sys.argv[2]).resolve())
signer = Path(__file__).resolve().parents[1] / 'sign-apk.py'
keytool = str(Path(os.environ['JAVA_HOME']) / 'bin/keytool')
with tempfile.TemporaryDirectory(prefix='signing-test-') as directory:
    directory = Path(directory)
    env = os.environ.copy()
    for name in ['ANDROID136_KEYSTORE_BASE64', 'ANDROID136_KEYSTORE_PASSWORD', 'ANDROID136_CERT_SHA256']:
        env.pop(name, None)
    env['ANDROID136_KEYSTORE_PASSWORD'] = secrets.token_urlsafe(32)
    key = directory / 'release.p12'
    certificate = directory / 'certificate.der'
    subprocess.run([keytool, '-genkeypair', '-storetype', 'PKCS12', '-keystore', str(key),
                    '-storepass:env', 'ANDROID136_KEYSTORE_PASSWORD', '-keypass:env',
                    'ANDROID136_KEYSTORE_PASSWORD', '-alias', 'sprachschach', '-keyalg',
                    'RSA', '-keysize', '2048', '-validity', '365', '-dname', 'CN=Test'],
                   env=env, check=True, capture_output=True)
    subprocess.run([keytool, '-exportcert', '-keystore', str(key), '-storepass:env',
                    'ANDROID136_KEYSTORE_PASSWORD', '-alias', 'sprachschach', '-file',
                    str(certificate)], env=env, check=True, capture_output=True)
    expected = hashlib.sha256(certificate.read_bytes()).hexdigest()

    def invoke(apk=None):
        args = [sys.executable, str(signer), '--apksigner', apksigner]
        if apk is not None:
            args.append(str(apk))
        result = subprocess.run(args, env=env, capture_output=True, text=True)
        assert env['ANDROID136_KEYSTORE_PASSWORD'] not in result.stdout + result.stderr
        return result

    result = invoke()
    assert result.returncode != 0 and 'Signatur fehlt' in result.stderr
    env['ANDROID136_KEYSTORE_BASE64'] = base64.b64encode(key.read_bytes()).decode()
    env['ANDROID136_CERT_SHA256'] = '0' * 64
    unchanged = directory / 'unchanged.apk'
    shutil.copyfile(source, unchanged)
    before = hashlib.sha256(unchanged.read_bytes()).digest()
    result = invoke(unchanged)
    assert result.returncode != 0 and 'stimmt nicht' in result.stderr
    assert hashlib.sha256(unchanged.read_bytes()).digest() == before
    env['ANDROID136_CERT_SHA256'] = expected
    assert invoke().returncode == 0
    for number in [1, 2]:
        apk = directory / f'build-{number}.apk'
        shutil.copyfile(source, apk)
        result = invoke(apk)
        assert result.returncode == 0, result.stderr
        verified = subprocess.run([apksigner, 'verify', '--print-certs', str(apk)],
                                  env=env, check=True, capture_output=True, text=True)
        assert f'certificate SHA-256 digest: {expected}' in verified.stdout
    print('PASS: two APK builds reuse the same certificate; missing and mismatched keys fail; no password output.')
