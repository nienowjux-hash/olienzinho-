# -*- coding: utf-8 -*-
# baixa as fontes do Google Fonts para web/fonts e gera um CSS local (o jogo e o APK nao dependem mais de internet para as fontes)
import re, os, urllib.request
B = r'C:\Games\Olienzinho\web\fonts'
css = open(os.path.join(B, 'gf.css'), encoding='utf8').read()
blocks = re.findall(r'(/\* ([a-z-]+) \*/\s*@font-face \{.*?\})', css, re.S)
out = []
done = {}
for full, subset in blocks:
    if subset not in ('latin', 'latin-ext'):
        continue
    url = re.search(r'url\((https://[^)]+)\)', full).group(1)
    name = url.split('/')[-1]
    fam = re.search(r"font-family: '([^']+)'", full).group(1).lower().replace(' ', '')
    fn = fam + '-' + subset + '-' + name[-12:]
    if url not in done:
        p = os.path.join(B, fn)
        if not os.path.exists(p):
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            open(p, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
        done[url] = fn
    out.append(full.replace(url, done[url]))
open(os.path.join(B, 'fonts.css'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print(len(out), 'blocos', len(done), 'arquivos')
