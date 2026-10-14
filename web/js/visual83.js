'use strict';
// ---------- 83: jogo como aplicativo (tela cheia, instalar, sem cara de navegador) e celular de verdade:
// analogico flutuante, botoes de habilidade com recarga, pausa, tutorial proprio para toque, textos sem referencia a teclado ----------
const Visual83 = { touch: false, dp: null, stick: null, pts: {}, fsTried: false, wl: null };
const T83 = Visual83;
const set83 = () => Save.data.settings || {};
{
  const mode = () => set83().tmode || 0;   // 0 automatico, 1 sempre, 2 nunca
  T83.coarse = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
  Object.defineProperty(T83, 'on', { get() { const m = mode(); return m === 1 || (m === 0 && T83.touch); } });
  T83.touch = T83.coarse;
  T83.standalone = !!(window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone)) || /OlienzinhoApp/.test(navigator.userAgent); T83.isApp = /OlienzinhoApp/.test(navigator.userAgent); if (T83.isApp) { T83.touch = true; T83.coarse = true; }
}

// ---------- 1. pagina so para o jogo ----------
{
  const st = document.createElement('style');
  st.textContent = 'html,body{overscroll-behavior:none;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}@supports (height:100dvh){html,body{height:100dvh}}canvas{touch-action:none;outline:none}';
  document.head.appendChild(st);
  addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('dragstart', e => e.preventDefault());
  addEventListener('gesturestart', e => e.preventDefault());
  addEventListener('dblclick', e => e.preventDefault());
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); T83.dp = e; });
  addEventListener('appinstalled', () => { T83.dp = null; T83.standalone = true; });
  const fix = () => { try { resize(); } catch (e) { } };
  addEventListener('orientationchange', () => setTimeout(fix, 250)); if (window.visualViewport) visualViewport.addEventListener('resize', fix); document.addEventListener('fullscreenchange', () => setTimeout(fix, 150));
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  T83.isFs = isFs;
  T83.fs = function (userWants) {
    const el = document.documentElement;
    try {
      if (isFs()) { T83.userExit = true; try { navigator.keyboard && navigator.keyboard.unlock(); } catch (e) { } (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const rq = el.requestFullscreen || el.webkitRequestFullscreen; if (!rq) { Visual7.msg = 'Neste aparelho use "Adicionar à Tela de Início" para jogar em tela cheia'; Visual7.shotT = 4; return; }
      const pr = rq.call(el, { navigationUI: 'hide' });
      const after = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(() => { }); } catch (e) { } };
      if (pr && pr.then) pr.then(after).catch(() => { }); else after();
    } catch (e) { }
  };
  // se a tela cheia fechar sem querer (ESC no Firefox/Safari, por exemplo), volta no proximo toque ou tecla
  document.addEventListener('fullscreenchange', () => { if (!isFs()) { if (T83.userExit) T83.userExit = false; else if (set83().fsKeep !== false && !T83.standalone) T83.reenter = true; } else T83.reenter = false; });
  const again = e => { if (!T83.reenter || isFs()) return; if (e.type === 'keydown' && e.key === 'F11') return; T83.reenter = false; T83.fs(); };
  addEventListener('pointerdown', again, true); addEventListener('keydown', again, true);
  T83.install = function () {
    if (T83.standalone) { Visual7.msg = 'O jogo já está instalado.'; Visual7.shotT = 3; return; }
    if (T83.dp) { T83.dp.prompt(); T83.dp.userChoice.then(() => { T83.dp = null; }).catch(() => { }); return; }
    Visual7.msg = /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'No iPhone/iPad: toque em Compartilhar e depois em "Adicionar à Tela de Início"' : 'No menu do navegador, escolha "Instalar aplicativo" ou "Adicionar à tela inicial"'; Visual7.shotT = 5;
  };
  const first = e => { if (T83.fsTried) return; T83.fsTried = true; if (set83().autoFs !== true || T83.standalone || document.fullscreenElement) return; if (e.type === 'keydown' && (e.key === 'Escape' || e.key === 'F11')) return; T83.fs(); };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true);
  // mantem a tela ligada durante o jogo no celular
  hookRender(rn => function () { rn(); if (T83.on && G.state === 'play' && !T83.wl && navigator.wakeLock) { T83.wl = 1; navigator.wakeLock.request('screen').then(l => { T83.wl = l; l.addEventListener('release', () => { T83.wl = null; }); }).catch(() => { T83.wl = null; }); } });
}

// ---------- 2. celular: controles desenhados numa camada propria (usam as barras laterais da tela quando existem) ----------
{
  const OVC = document.createElement('canvas'); OVC.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:6;pointer-events:none'; document.body.appendChild(OVC); const og = OVC.getContext('2d');
  let drawn = false;
  let gc = null, gct = 0;
  const geo = () => { const n = performance.now(); if (gc && n - gct < 400 && gc.w === innerWidth && gc.h === innerHeight) return gc; const w = innerWidth, h = innerHeight, r = cv.getBoundingClientRect(), u = clamp(Math.min(h / 390, 1.4), .7, 1.4); gct = n; return (gc = { w, h, r, u, bar: Math.min(r.left, w - r.right) }); };
  ['resize', 'orientationchange', 'fullscreenchange'].forEach(ev => addEventListener(ev, () => { gc = null; }));
  T83.geo = geo;
  const BT = () => {
    const p = G.player, wp = p && WEAPONS[p.weapon]; if (!p || !wp) return [];
    const g = geo(), sc = set83().tbtn === 1 ? 1.2 : 1;
    const R = clamp(g.h * .058, 20, 32) * sc, m = 14;
    const spec = { k: 'q', c: wp.c, cd: p.specCd, mx: p.specCdMax, r: R * 1.3 };
    const dash = { k: 'shift', c: '#7fe0ff', cd: p.dashCd, mx: p.dashCdMax, r: R };
    const pulse = { k: ' ', c: '#ffb340', cd: p.pulseT, mx: p.pulseCd, r: R };
    const parry = { k: 'f', c: '#7fe0a0', cd: p.parryCd || 0, mx: 4.5, r: R };
    let sec = null; try { const s = typeof Visual13 !== 'undefined' && Visual13.secHud ? Visual13.secHud(p) : []; if (s.length) sec = { k: 'r', c: s[0][4], cd: s[0][2], mx: s[0][3], r: R * .9 }; } catch (e) { }
    // cacho compacto no canto do polegar: ESPECIAL no canto, os outros colados em arco (so icones)
    const sx = g.w - m - spec.r, sy = g.h - m - spec.r, d = spec.r + R + 7;
    spec.x = sx; spec.y = sy;
    dash.x = sx - d; dash.y = sy + spec.r - R;
    parry.x = sx - d * .74; parry.y = sy - d * .74;
    pulse.x = sx; pulse.y = sy - d * 1.12;
    if (sec) { sec.x = dash.x - R - sec.r - 7; sec.y = dash.y; }
    const pr = Math.max(15, R * .62), pause = { k: 'p', c: '#cdb8ff', pause: true, r: pr, x: g.w - 8 - pr, y: 8 + pr };
    return [pause, spec, dash, pulse, parry].concat(sec ? [sec] : []);
  };
  T83.BT = BT;
  const stickR = () => clamp(geo().h * .09, 34, 52);
  const logical = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  const mposSafe = e => { try { const q = logical(e); Input.mouse.x = q.x; Input.mouse.y = q.y; } catch (er) { } };
  const owns = id => id in T83.pts;
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') { if (!T83.touch) T83.touch = true; } else { if (e.pointerType === 'mouse') T83.touch = false; return; }
    if (!T83.on || G.state !== 'play') return;
    if (typeof Extras !== 'undefined' && Extras.tut && Extras.tut.wait) { Input.mouse.click = true; Input.hit.enter = true; mposSafe(e); e.stopImmediatePropagation(); return; }
    if (G.routeAsk) { const q = logical(e); if (q.x > 300 && q.x < 980 && q.y > 230 && q.y < 370) return; }
    { const q = logical(e); if (T83.pass && T83.pass.some(r => q.x >= r[0] && q.x <= r[0] + r[2] && q.y >= r[1] && q.y <= r[1] + r[3])) { mposSafe(e); Input.mouse.click = true; e.stopImmediatePropagation(); return; } }
    const xb = (T83.extra || []).find(q => e.clientX >= q.x - 6 && e.clientX <= q.x + q.w + 6 && e.clientY >= q.y - 6 && e.clientY <= q.y + q.h + 6);
    if (xb) { try { navigator.vibrate && navigator.vibrate(12); } catch (er) { } e.stopImmediatePropagation(); e.preventDefault(); xb.fn(); return; }
    let b = null, bd = 1e9; for (const q of BT()) { const dd = Math.hypot(q.x - e.clientX, q.y - e.clientY) - q.r; if (dd < 12 && dd < bd) { bd = dd; b = q; } }
    if (b) { Input.hit[b.k] = true; if (!b.pause) Input.keys[b.k] = true; T83.pts[e.pointerId] = { k: b.k, btn: b }; T83.down = T83.down || {}; T83.down[b.k] = 1; try { navigator.vibrate && navigator.vibrate(12); } catch (er) { } }
    else if (e.clientX < innerWidth * .5 && !T83.stick) { T83.stick = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY }; T83.pts[e.pointerId] = { stick: 1 }; }
    else T83.pts[e.pointerId] = { none: 1 };
    e.stopImmediatePropagation(); e.preventDefault();
  }, true);
  addEventListener('pointermove', e => {
    if (!owns(e.pointerId)) return; e.stopImmediatePropagation(); const s = T83.stick; if (!s || s.id !== e.pointerId) return; const R = stickR();
    s.x = e.clientX; s.y = e.clientY; let dx = (s.x - s.ox) / R, dy = (s.y - s.oy) / R; const m = Math.hypot(dx, dy); if (m > 1) { s.ox = s.x - dx / m * R; s.oy = s.y - dy / m * R; dx /= m; dy /= m; }
    const mm = Math.min(1, m / .85), dz = .07, k = mm > dz ? (mm - dz) / (1 - dz) / (m > 1e-6 ? Math.min(1, m) : 1) : 0; T83.ax = dx * k; T83.ay = dy * k; Input.gpAx = T83.ax; Input.gpAy = T83.ay;
  }, true);
  const rel = e => { const o = T83.pts[e.pointerId]; if (!o) return; delete T83.pts[e.pointerId]; if (o.k) { if (!o.btn.pause) Input.keys[o.k] = false; if (T83.down) delete T83.down[o.k]; } if (o.stick) { T83.stick = null; T83.ax = 0; T83.ay = 0; Input.gpAx = 0; Input.gpAy = 0; } e.stopImmediatePropagation(); };
  addEventListener('pointerup', rel, true); addEventListener('pointercancel', rel, true);
  addEventListener('keydown', () => { if (T83.touch && !T83.coarse) T83.touch = false; }, true);
  const upl = Game.updatePlay; Game.updatePlay = function (dt) { if (T83.stick) { Input.gpAx = T83.ax || 0; Input.gpAy = T83.ay || 0; } return upl.call(this, dt); };
  hookRender(rn => function () {
    rn(); if (G.state !== 'play' && (T83.stick || Object.keys(T83.pts).length)) { T83.stick = null; T83.ax = 0; T83.ay = 0; Input.gpAx = 0; Input.gpAy = 0; T83.pts = {}; T83.down = {}; }
    const w = innerWidth, h = innerHeight, d = Math.min(window.devicePixelRatio || 1, 2); if (OVC.width !== Math.round(w * d) || OVC.height !== Math.round(h * d)) { OVC.width = Math.round(w * d); OVC.height = Math.round(h * d); }
    og.setTransform(d, 0, 0, d, 0, 0); const on = T83.on && G.state === 'play' && G.player && !G.cut && !G.hideHud;
    if (!on) { if (drawn) { og.clearRect(0, 0, w, h); drawn = false; } return; } drawn = true; og.clearRect(0, 0, w, h);
    const g = geo(), t = World.t, s = T83.stick, R = stickR(), dn = T83.down || {};
    // analogico: discreto (so aparece forte quando voce encosta o dedo)
    const bx = s ? s.ox : Math.max(R + 16, g.bar >= 54 ? g.bar / 2 : g.r.left + 80 * g.u), by = s ? s.oy : g.h - Math.max(70 * g.u, R + 26);
    if (T83.hl === 'move') { og.save(); og.globalAlpha = .55 + .45 * Math.sin(t * 7); og.strokeStyle = '#ffe9a8'; og.lineWidth = 4; og.beginPath(); og.arc(bx, by, R + 7 + 3 * Math.sin(t * 7), 0, TAU); og.stroke(); og.restore(); }
    og.globalAlpha = s ? .5 : .2; og.strokeStyle = '#e8dcff'; og.lineWidth = 2.5; og.fillStyle = 'rgba(184,160,255,.08)'; og.beginPath(); og.arc(bx, by, R, 0, TAU); og.fill(); og.stroke();
    og.globalAlpha = s ? .8 : .25; og.fillStyle = 'rgba(210,190,255,.7)'; const kx = s ? clamp(s.x - s.ox, -R, R) : 0, ky = s ? clamp(s.y - s.oy, -R, R) : 0; og.beginPath(); og.arc(bx + kx, by + ky, R * .42, 0, TAU); og.fill();
    if (T83.hl === 'move' && !s) { og.globalAlpha = .7; og.fillStyle = '#ffe9a8'; og.font = '800 ' + Math.max(10, 11 * g.u) + 'px Nunito,sans-serif'; og.textAlign = 'center'; og.fillText('ARRASTE PARA MOVER', bx, by + R + 14 * g.u); }
    for (const q of (T83.extra || [])) { og.globalAlpha = .9; og.fillStyle = 'rgba(40,22,110,.92)'; og.strokeStyle = '#cdb8ff'; og.lineWidth = 2.5; og.beginPath(); og.roundRect(q.x, q.y, q.w, q.h, q.h / 2); og.fill(); og.stroke(); og.fillStyle = '#fff'; og.font = '900 ' + Math.max(12, q.h * .38) + 'px Nunito,sans-serif'; og.textAlign = 'center'; og.textBaseline = 'middle'; og.fillText(q.label, q.x + q.w / 2, q.y + q.h / 2 + 1); }
    // botoes: so icones, pequenos, transparentes
    for (const b of BT()) {
      const down = !!dn[b.k], rdy = !(b.cd > .05), k = rdy ? 1 : 1 - clamp(b.cd / (b.mx || 1), 0, 1), col = rdy ? b.c : '#7a6aa8';
      og.globalAlpha = down ? .95 : (rdy ? .62 : .42);
      og.fillStyle = down ? 'rgba(80,50,170,.9)' : 'rgba(12,5,36,.55)'; og.beginPath(); og.arc(b.x, b.y, b.r, 0, TAU); og.fill();
      og.lineWidth = Math.max(2.5, b.r * .1); og.strokeStyle = col; og.beginPath(); og.arc(b.x, b.y, b.r - og.lineWidth / 2, -Math.PI / 2, -Math.PI / 2 + TAU * k); og.stroke();
      if (T83.hl && T83.hl === b.k) { og.save(); og.globalAlpha = .55 + .45 * Math.sin(t * 7); og.strokeStyle = '#ffe9a8'; og.lineWidth = 4; og.beginPath(); og.arc(b.x, b.y, b.r + 6 + 3 * Math.sin(t * 7), 0, TAU); og.stroke(); og.restore(); }
      // icone
      og.save(); og.translate(b.x, b.y); og.strokeStyle = rdy ? '#fff' : '#a898d8'; og.fillStyle = og.strokeStyle; og.lineWidth = Math.max(2, b.r * .09); og.lineCap = 'round'; og.lineJoin = 'round'; const u = b.r * .45;
      if (b.k === ' ') { og.beginPath(); og.arc(0, 0, u * .22, 0, TAU); og.fill(); og.beginPath(); og.arc(0, 0, u * .62, -2.5, 2.5 - 3.1 + 3.1); og.stroke(); og.beginPath(); og.arc(0, 0, u * 1.0, 0.6, TAU - 0.6); og.stroke(); }
      else if (b.k === 'shift') { for (const o of [-.5, .35]) { og.beginPath(); og.moveTo(o * u - u * .35, -u * .6); og.lineTo(o * u + u * .35, 0); og.lineTo(o * u - u * .35, u * .6); og.stroke(); } }
      else if (b.k === 'q') { og.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? u * .5 : u * 1.15; og.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } og.closePath(); og.globalAlpha *= .95; og.fill(); }
      else if (b.k === 'f') { og.beginPath(); og.moveTo(0, -u); og.lineTo(u * .85, -u * .55); og.lineTo(u * .7, u * .35); og.quadraticCurveTo(0, u * 1.1, 0, u * 1.1); og.quadraticCurveTo(0, u * 1.1, -u * .7, u * .35); og.lineTo(-u * .85, -u * .55); og.closePath(); og.stroke(); }
      else if (b.k === 'r') { og.beginPath(); og.moveTo(0, -u); og.lineTo(u * .6, u * .4); og.lineTo(0, u * .15); og.lineTo(-u * .6, u * .4); og.closePath(); og.stroke(); }
      else if (b.pause) { og.fillRect(-u * .55, -u * .65, u * .4, u * 1.3); og.fillRect(u * .15, -u * .65, u * .4, u * 1.3); }
      og.restore();
      if (!rdy && (b.mx || 0) > 1.5 && !b.pause) { og.globalAlpha = .95; og.fillStyle = '#fff'; og.font = '900 ' + Math.max(10, b.r * .62) + 'px Nunito,sans-serif'; og.textAlign = 'center'; og.textBaseline = 'middle'; og.fillText(String(Math.ceil(b.cd)), b.x, b.y + 1); }
    }
    og.globalAlpha = 1;
  });
  // os botoes de habilidade do HUD antigo e a moldura de baixo somem no modo toque
  T83.hideAb = () => T83.on && G.state === 'play';
}

// ---------- 3. textos: nada de teclado no celular, e tutorial proprio para toque ----------
{
  const R = [[/clique ou ENTER para continuar|ENTER ou clique para continuar|clique \/ ENTER: continuar|ENTER para continuar|clique ou ENTER para começar/, 'toque para continuar'], [/ENTER: pular vídeo.*/, 'toque no botão PULAR'], [/ESC {1,2}pular cena/, ''], [/^ENTER$/, '▸'], [/^.*↑ ↓.*ENTER.*$/, ''], [/clique/g, 'toque'], [/Mova com WASD, setas ou mouse.*/, 'Arraste à esquerda para mover  •  Tiro automático  •  Botões à direita'],
    [/Mova a nave com WASD, as setas ou o mouse\./, 'Arraste o dedo no lado esquerdo da tela para mover a nave (analógico).'], [/Aperte SHIFT para uma esquiva rápida\./, 'Toque no botão azul ESQUIVA para uma esquiva rápida.'], [/Aperte Q para o ESPECIAL da sua arma\./, 'Toque no botão grande ESPECIAL. Cada arma tem o seu!'], [/Aperte ESPAÇO para o Pulso Olien:/, 'Toque no botão laranja PULSO:'], [/Aperte R para a arma SECUNDÁRIA/, 'Toque no botão da arma SECUNDÁRIA'],
    [/SHIFT faz uma esquiva/, 'O botão ESQUIVA faz uma esquiva'], [/Mova a nave \(setas, WASD ou mouse\)/, 'Arraste para mover a nave'], [/Esquive: aperte SHIFT/, 'Toque em ESQUIVA'], [/Use o pulso: ESPAÇO/, 'Toque em PULSO'], [/Use o especial: Q/, 'Toque em ESPECIAL']];
  R.push([/^SHIFT$/, 'ESQ.'], [/^ESP(AÇO)?$/, 'PULSO'], [/^Q$/, 'ESP.'], [/^R$/, 'SEC.'], [/\bWASD\b/g, 'o analógico'], [/\bSHIFT\b/g, 'ESQUIVA'], [/\bESPAÇO\b/g, 'PULSO'], [/\bENTER\b/g, 'toque'], [/\bESC\b/g, 'II']);
  T83.swap = s => { if (typeof s !== 'string' || s.length > 220) return s; let o = s; for (const [re, to] of R) o = o.replace(re, to); return o; };
  const w0 = UI.wrap; UI.wrap = function (s) { const a = Array.from(arguments); if (T83.on) a[0] = T83.swap(s); return w0.apply(this, a); };
  const t0 = txt;
  txt = function (s, x, y, size, color, align, weight, base) { return t0(T83.on ? T83.swap(s) : s, x, y, size, color, align, weight, base); };
  // tutorial de teclas (cartao que pausa o jogo): teclas viram nomes dos botoes
  const orig = TUT.map(q => ({ ...q, keys: (q.keys || []).slice() }));
  const TK = [['MOVER'], [], ['ESQUIVA'], ['ESPECIAL'], ['PULSO'], ['ARMA 2']];
  const ts = Extras.tutStart; Extras.tutStart = function () { const r = ts.apply(this, arguments); TUT.forEach((q, i) => { q.keys = ((T83.on && TK[i]) || (orig[i] ? orig[i].keys : q.keys)).slice(); }); return r; };
  // padroes de dica / fundo do tutorial guiado (visual80) trocados no proprio lugar
  Visual83.touchSkip = function () {
    if (!T83.on || (G.state !== 'story' && !(G.state === 'cine'))) return;
    if (UI.button('tskip', W - 270, 10, 250, 62, 'PULAR CENA ▸', { size: 22 })) { const S = G.story; if (S) { try { const pg = S.pages[S.i]; if (pg && pg.video) Visual18.get(pg.video).pause(); } catch (e) { } S.vOn = false; Snd.play('uiBack'); Game.endStory(); } }
  };
  const st = Screens.story; Screens.story = function () { const r = st.apply(this, arguments); Visual83.touchSkip(); return r; };
}

// ---------- 4. padroes para celular ----------
{
  const k = Visual78.k; Visual78.k = function () { const s = set83(); if (s.sprK === undefined && T83.on) return 1; return k.apply(this, arguments); };
}

// ---------- 5. tela "Tela e instalacao" ----------
Screens.display = function () {
  const s = set83(); txt('TELA E INSTALAÇÃO', W / 2, 30, 46, '#fff', 'center'); UI.panel(160, 100, 960, 470, { r: 22 });
  const row = (i, id, lab, val, desc, fn, on) => { const y = 124 + i * 72; txt(lab, 196, y, 21, '#fff', 'left', 900); txt(desc, 196, y + 28, 14, '#cdb8ff', 'left', 700); if (UI.button(id, 800, y - 6, 280, 46, val, { size: 15, color: on ? '#9a63ff' : undefined })) { fn(); Save.save(); } };
  const full = !!(document.fullscreenElement || document.webkitFullscreenElement);
  row(0, 'd_fs', 'Tela cheia agora', full ? 'SAIR DA TELA CHEIA' : 'ENTRAR EM TELA CHEIA', 'Esconde a barra do navegador. No PC também funciona F11.', () => T83.fs(), full);
  row(1, 'd_auto', 'Voltar sozinho para a tela cheia', s.fsKeep === false ? 'NÃO' : 'SIM', 'Se a tela cheia fechar sem querer, volta no próximo toque ou tecla.', () => { s.fsKeep = s.fsKeep === false; }, s.fsKeep !== false);
  row(2, 'd_inst', 'Instalar como aplicativo', T83.standalone ? 'JÁ INSTALADO' : 'INSTALAR', 'Abre em janela própria, sem barra de endereço (PC e celular).', () => T83.install(), T83.standalone);
  row(3, 'd_touch', 'Controles de toque', ['AUTOMÁTICO', 'SEMPRE LIGADOS', 'DESLIGADOS'][s.tmode || 0], 'Analógico e botões na tela. Automático liga ao tocar na tela.', () => { s.tmode = ((s.tmode || 0) + 1) % 3; }, (s.tmode || 0) !== 0);
  row(4, 'd_size', 'Tamanho dos botões de toque', s.tbtn === 1 ? 'GRANDES' : 'NORMAIS', 'Botões maiores ajudam em telas pequenas.', () => { s.tbtn = s.tbtn === 1 ? 0 : 1; }, s.tbtn === 1);
  row(5, 'd_rot', 'Dica', 'JOGUE NA HORIZONTAL', 'No celular gire o aparelho: o jogo é feito para a tela deitada.', () => { }, false);
  if (UI.button('back', W / 2 - 160, 590, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
};
{
  const ti = Screens.title;
  Screens.title = function () {
    return ti.apply(this, arguments);
  };
}

// fillText/measureText: o que o jogo desenha direto no canvas tambem perde as referencias a teclado no modo toque
{
  const P = CanvasRenderingContext2D.prototype, ft = P.fillText, mt = P.measureText, hot = /WASD|SHIFT|ESPAÇO|\bESC\b|ENTER|clique|^ESP$|^[QR]$/;
  P.fillText = function (t, ...a) { if (T83.on && typeof t === 'string' && hot.test(t)) t = T83.swap(t); return ft.call(this, t, ...a); };
  P.measureText = function (t) { if (T83.on && typeof t === 'string' && hot.test(t)) t = T83.swap(t); return mt.call(this, t); };
}

// ---------- porta de entrada: ao clicar em JOGAR, oferece a tela cheia ----------
Screens.fsgate = function () {
  World.draw(0); ctx.fillStyle = 'rgba(3,1,14,.82)'; ctx.fillRect(0, 0, W, H);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen), port = innerHeight > innerWidth;
  UI.panel(240, 120, 800, 400, { r: 28 });
  txt('JOGAR EM TELA CHEIA?', W / 2, 150, 46, '#fff', 'center', 900);
  UI.wrap(ios ? 'No iPhone o navegador não abre tela cheia. Toque em Compartilhar e depois em "Adicionar à Tela de Início": o jogo abre como aplicativo, sem barra.' : 'A tela cheia esconde a barra do navegador e deixa o jogo maior. Ela volta sozinha se fechar sem querer.' + (T83.on ? ' Para sair, deslize a partir da borda da tela.' : ' Para sair, segure ESC por 2 segundos.'), 290, 224, 700, 30, 21, '#cdb8ff', 'left', 700);
  if (port) txt('Gire o aparelho: o jogo é na horizontal.', W / 2, 330, 20, '#ffb340', 'center', 800);
  const go = () => { G.state = T83.gateNext || 'select'; T83.gateNext = null; };
  if (!ios && UI.button('gfs', 290, 380, 700, 62, 'TELA CHEIA E JOGAR', { size: 26, color: '#9a63ff' })) { T83.fs(); try { sessionStorage.setItem('olien_gate', '1'); } catch (e) { } T83.gate = true; go(); }
  if (UI.button('gno', 290, ios ? 380 : 452, 700, ios ? 62 : 48, ios ? 'ENTENDI, JOGAR ASSIM' : 'JOGAR ASSIM', { size: ios ? 24 : 18 })) { try { sessionStorage.setItem('olien_gate', '1'); } catch (e) { } T83.gate = true; go(); }
};
{
  let last = '';
  hookRender(rn => function () {
    const prev = last; rn(); const s = G.state; last = s;
    if (prev === 'title' && ['select', 'story', 'play', 'cine'].includes(s) && !T83.gate && !T83.isFs() && !T83.standalone) { let seen = false; try { seen = !!sessionStorage.getItem('olien_gate'); } catch (e) { } if (!seen) { T83.gateNext = s; G.state = 'fsgate'; last = 'fsgate'; } }
  });
}
{
  const ti = Screens.title;
  Screens.title = function () {
    const r = ti.apply(this, arguments); if (!T83.standalone && UI.button('tfs2', W - 232, 4, 218, 34, T83.isFs() ? '⛶ SAIR DA TELA CHEIA' : '⛶ TELA CHEIA', { size: 15 })) T83.fs(); return r;
  };
}

// ---------- faixa "Instalar o jogo" na tela inicial (PC e celular) + tamanho da tela sempre certo ----------
{
  const bn = document.createElement('div');
  bn.id = 'installBar';
  bn.style.cssText = 'position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:30;display:none;align-items:center;gap:10px;max-width:92vw;padding:8px 10px 8px 16px;border-radius:999px;background:rgba(22,9,60,.94);border:2px solid #9a63ff;color:#fff;font:800 15px Nunito,sans-serif;box-shadow:0 6px 30px rgba(0,0,0,.5);-webkit-user-select:none;user-select:none';
  const tx = document.createElement('span'); tx.textContent = 'Instale o jogo: tela cheia, sem barra do navegador';
  const go = document.createElement('button'); go.textContent = 'INSTALAR'; go.style.cssText = 'cursor:pointer;border:0;border-radius:999px;padding:9px 18px;background:linear-gradient(#a874ff,#6a3aff);color:#fff;font:900 15px Nunito,sans-serif;touch-action:manipulation';
  const x = document.createElement('button'); x.textContent = '×'; x.setAttribute('aria-label', 'Fechar'); x.style.cssText = 'cursor:pointer;border:0;background:transparent;color:#cdb8ff;font:900 22px Nunito,sans-serif;padding:0 6px;touch-action:manipulation';
  bn.append(tx, go, x); document.body.appendChild(bn);
  const KEY = 'olien_inst_hide';
  const hidden = () => { try { return Date.now() - (+localStorage.getItem(KEY) || 0) < 14 * 864e5; } catch (e) { return false; } };
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  go.addEventListener('click', e => { e.stopPropagation(); if (T83.dp) T83.install(); else if (ios) { alert('No iPhone/iPad: toque no botão Compartilhar (quadrado com seta) e escolha "Adicionar à Tela de Início".'); } else T83.install(); });
  x.addEventListener('click', e => { e.stopPropagation(); try { localStorage.setItem(KEY, String(Date.now())); } catch (er) { } bn.style.display = 'none'; });
  bn.addEventListener('pointerdown', e => e.stopPropagation()); bn.addEventListener('pointerup', e => e.stopPropagation());
  let shown = false;
  hookRender(rn => function () {
    rn(); const want = G.state === 'title' && !T83.standalone && (T83.dp || ios) && !hidden() && !T83.isFs();
    if (want !== shown) { shown = want; bn.style.display = want ? 'flex' : 'none'; }
  });
  // confere o tamanho do jogo a cada meio segundo: se a janela mudou (tela cheia, barra do navegador) e o jogo nao acompanhou, ajusta
  let tick = 0;
  hookRender(rn => function () {
    rn(); if (++tick % 30) return; let w = innerWidth, h = innerHeight; if (w / h > W / H) w = h * W / H; else h = w * H / W;
    if (Math.abs(parseFloat(cv.style.width) - w) > 2 || Math.abs(parseFloat(cv.style.height) - h) > 2) { try { resize(); } catch (e) { } }
  });
  [60, 250, 700, 1500].forEach(ms => document.addEventListener('fullscreenchange', () => setTimeout(() => { try { resize(); } catch (e) { } }, ms)));
}
