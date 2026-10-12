#!/usr/bin/env python3
"""Junta os scripts do jogo (na ordem do index.html) em web/js/bundle.js e grava a versao no index.html."""
import re, hashlib, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'web'
html = (root / 'index.html').read_text(encoding='utf-8')
m = re.search(r"\[('util'.*?'main')\]", html, re.S)
names = re.findall(r"'([^']+)'", m.group(1))
parts = []
for n in names:
    f = root / 'js' / (n + '.js')
    parts.append('/* ==== ' + n + '.js ==== */\n' + f.read_text(encoding='utf-8'))
out = '\n;\n'.join(parts) + '\n'
(root / 'js' / 'bundle.js').write_text(out, encoding='utf-8', newline='\n')
v = hashlib.md5(out.encode('utf-8')).hexdigest()[:10]
html2 = re.sub(r"BUNDLE_V='[0-9a-f]*'", "BUNDLE_V='" + v + "'", html)
if html2 != html: (root / 'index.html').write_text(html2, encoding='utf-8', newline='')
print('bundle', len(names), 'arquivos,', len(out) // 1024, 'KB, versao', v)
