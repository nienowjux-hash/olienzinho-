# -*- coding: utf-8 -*-
# Gera o APK do Olienzinho (jogo guardado dentro do aplicativo, abre em tela cheia). Uso: python tools/build_apk.py [versao]
# Ferramentas (JDK 17, Android SDK, Gradle) ficam em C:\Users\juxni\android-build, fora do repositorio.
import os, sys, shutil, subprocess, glob, secrets, datetime
ROOT = r'C:\Games\Olienzinho'
TOOLS = r'C:\Users\juxni\android-build'
JDK = glob.glob(os.path.join(TOOLS, 'jdk-17*'))[0]
SDK = os.path.join(TOOLS, 'sdk')
GRADLE = os.path.join(TOOLS, 'gradle-8.7', 'bin', 'gradle.bat')
KS = os.path.join(TOOLS, 'olien.keystore')
KSPASS_FILE = os.path.join(TOOLS, 'ks_pass.txt')
WEB = os.path.join(ROOT, 'web')
AND = os.path.join(ROOT, 'android')
ASSETS = os.path.join(AND, 'app', 'src', 'main', 'assets', 'web')
DIST = os.path.join(ROOT, 'dist')

def run(cmd, **kw):
    print('>', cmd if isinstance(cmd, str) else ' '.join(cmd)); r = subprocess.run(cmd, **kw)
    if r.returncode: sys.exit('falhou (%s)' % r.returncode)

env = dict(os.environ, JAVA_HOME=JDK, ANDROID_HOME=SDK, ANDROID_SDK_ROOT=SDK)
env['PATH'] = os.path.join(JDK, 'bin') + os.pathsep + env['PATH']

# 1. bundle do jogo
run([sys.executable, os.path.join(ROOT, 'tools', 'build_bundle.py')])

# 2. copia so o necessario para dentro do aplicativo
if os.path.exists(ASSETS): shutil.rmtree(ASSETS)
os.makedirs(os.path.join(ASSETS, 'js'))
for f in ('index.html', 'icon-192.png', 'icon-512.png'): shutil.copy(os.path.join(WEB, f), ASSETS)
shutil.copy(os.path.join(WEB, 'js', 'bundle.js'), os.path.join(ASSETS, 'js'))
shutil.copytree(os.path.join(WEB, 'fonts'), os.path.join(ASSETS, 'fonts'))
shutil.copytree(os.path.join(WEB, 'video'), os.path.join(ASSETS, 'video'))

# 3. icones do aplicativo
from PIL import Image
src = Image.open(os.path.join(WEB, 'icon-512.png')).convert('RGBA')
for d, sz in (('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)):
    p = os.path.join(AND, 'app', 'src', 'main', 'res', 'mipmap-' + d); os.makedirs(p, exist_ok=True)
    src.resize((sz, sz), Image.LANCZOS).save(os.path.join(p, 'ic_launcher.png'))

# 4. chave de assinatura (so existe no seu computador; guarde-a para poder atualizar o aplicativo depois)
if not os.path.exists(KS):
    pw = secrets.token_urlsafe(18); open(KSPASS_FILE, 'w').write(pw)
    run([os.path.join(JDK, 'bin', 'keytool.exe'), '-genkeypair', '-keystore', KS, '-alias', 'olienzinho', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-storepass', pw, '-keypass', pw, '-dname', 'CN=Olienzinho, O=Olien Digital, C=BR'], env=env)
env['OLIEN_KS'] = KS; env['OLIEN_KS_PASS'] = open(KSPASS_FILE).read().strip()
now = datetime.datetime.now(); env['OLIEN_VCODE'] = str(int(now.strftime('%y%m%d%H')) % 2000000000); env['OLIEN_VNAME'] = sys.argv[1] if len(sys.argv) > 1 else now.strftime('%Y.%m.%d')

# 5. compila
run([GRADLE, '-p', AND, '--no-daemon', 'assembleRelease'], env=env)
apk = os.path.join(AND, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
os.makedirs(DIST, exist_ok=True); out = os.path.join(DIST, 'Olienzinho.apk'); shutil.copy(apk, out)
print('APK:', out, round(os.path.getsize(out) / 1048576, 1), 'MB')
