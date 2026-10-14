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
  T83.standalone = !!(window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone));
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
  T83.fs = function () {
    const el = document.documentElement;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const rq = el.requestFullscreen || el.webkitRequestFullscreen; if (!rq) { Visual7.msg = 'Neste aparelho use "Adicionar à Tela de Início" para jogar em tela cheia'; Visual7.shotT = 4; return; }
      const pr = rq.call(el, { navigationUI: 'hide' }); const lock = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } };
      if (pr && pr.then) pr.then(lock).catch(() => { }); else lock();
    } catch (e) { }
  };
  T83.install = function () {
    if (T83.standalone) { Visual7.msg = 'O jogo já está instalado.'; Visual7.shotT = 3; return; }
    if (T83.dp) { T83.dp.prompt(); T83.dp.userChoice.then(() => { T83.dp = null; }).catch(() => { }); return; }
    Visual7.msg = /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'No iPhone/iPad: toque em Compartilhar e depois em "Adicionar à Tela de Início"' : 'No menu do navegador, escolha "Instalar aplicativo" ou "Adicionar à tela inicial"'; Visual7.shotT = 5;
  };
  const first = e => { if (T83.fsTried) return; T83.fsTried = true; if (set83().autoFs === false || T83.standalone || document.fullscreenElement) return; if (e.type === 'keydown' && (e.key === 'Escape' || e.key === 'F11')) return; T83.fs(); };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true);
  // mantem a tela ligada durante o jogo no celular
  hookRender(rn => function () { rn(); if (T83.on && G.state === 'play' && !T83.wl && navigator.wakeLock) { T83.wl = 1; navigator.wakeLock.request('screen').then(l => { T83.wl = l; l.addEventListener('release', () => { T83.wl = null; }); }).catch(() => { T83.wl = null; }); } });
}

// ---------- 2. celular: analogico flutuante e botoes ----------
{
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  const BT = () => {
    const p = G.player, wp = p && WEAPONS[p.weapon]; if (!p || !wp) return [];
    const sc = set83().tbtn === 1 ? 1.2 : 1;
    const L = [{ k: 'q', x: 1180, y: 574, r: 58 * sc, c: wp.c, l: 'ESPECIAL', cd: p.specCd, mx: p.specCdMax }, { k: 'shift', x: 1044, y: 640, r: 46 * sc, c: '#7fe0ff', l: 'ESQUIVA', cd: p.dashCd, mx: p.dashCdMax }, { k: ' ', x: 1180, y: 436, r: 46 * sc, c: '#ffb340', l: 'PULSO', cd: p.pulseT, mx: p.pulseCd }];
    try { const s = typeof Visual13 !== 'undefined' && Visual13.secHud ? Visual13.secHud(p) : []; if (s.length) L.push({ k: 'r', x: 1044, y: 520, r: 40 * sc, c: s[0][4], l: String(s[0][0]).toUpperCase().slice(0, 9), cd: s[0][2], mx: s[0][3] }); } catch (e) { }
    L.push({ k: 'p', x: W - 40, y: 196, r: 26, c: '#cdb8ff', l: 'II', pause: true });
    return L;
  };
  T83.BT = BT;
  const owns = id => id in T83.pts;
  const passthrough = () => G.routeAsk || (typeof Extras !== 'undefined' && Extras.tut && Extras.tut.wait) || G.state !== 'play';
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') { if (!T83.touch) T83.touch = true; } else { if (e.pointerType === 'mouse') T83.touch = false; return; }
    if (!T83.on || G.state !== 'play') return;
    if (typeof Extras !== 'undefined' && Extras.tut && Extras.tut.wait) { Input.mouse.click = true; Input.hit.enter = true; mposSafe(e); e.stopImmediatePropagation(); return; }
    if (G.routeAsk) return;
    const q = pos(e), b = BT().find(b => Math.hypot(b.x - q.x, b.y - q.y) < b.r + 12);
    if (b) { Input.hit[b.k] = true; if (!b.pause) Input.keys[b.k] = true; T83.pts[e.pointerId] = { k: b.k, btn: b }; b.down = true; try { navigator.vibrate && navigator.vibrate(12); } catch (er) { } }
    else if (q.x < W * .55 && !T83.stick) { T83.stick = { id: e.pointerId, ox: q.x, oy: q.y, x: q.x, y: q.y }; T83.pts[e.pointerId] = { stick: 1 }; }
    else T83.pts[e.pointerId] = { none: 1 };
    e.stopImmediatePropagation(); e.preventDefault();
  }, true);
  const mposSafe = e => { try { const q = pos(e); Input.mouse.x = q.x; Input.mouse.y = q.y; } catch (er) { } };
  addEventListener('pointermove', e => {
    if (!owns(e.pointerId)) return; e.stopImmediatePropagation(); const s = T83.stick; if (!s || s.id !== e.pointerId) return;
    const q = pos(e); s.x = q.x; s.y = q.y; let dx = (q.x - s.ox) / 72, dy = (q.y - s.oy) / 72; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; s.ox += (q.x - s.ox) - dx * 72; s.oy += (q.y - s.oy) - dy * 72; } const dz = .12, mm = Math.min(1, m); const k = mm > dz ? (mm - dz) / (1 - dz) / (m || 1) : 0; T83.ax = dx * m * k; T83.ay = dy * m * k; Input.gpAx = T83.ax; Input.gpAy = T83.ay;
  }, true);
  const rel = e => { const o = T83.pts[e.pointerId]; if (!o) return; delete T83.pts[e.pointerId]; if (o.k && !o.btn.pause) Input.keys[o.k] = false; if (o.btn) o.btn.down = false; if (o.stick) { T83.stick = null; T83.ax = 0; T83.ay = 0; Input.gpAx = 0; Input.gpAy = 0; } e.stopImmediatePropagation(); };
  addEventListener('pointerup', rel, true); addEventListener('pointercancel', rel, true);
  addEventListener('keydown', () => { if (T83.touch && !T83.coarse) T83.touch = false; }, true);
  hookRender(rn => function () { rn(); if (G.state !== 'play' && T83.stick) { T83.stick = null; T83.ax = 0; T83.ay = 0; Input.gpAx = 0; Input.gpAy = 0; T83.pts = {}; } });
  const upl = Game.updatePlay; Game.updatePlay = function (dt) { if (T83.stick) { Input.gpAx = T83.ax || 0; Input.gpAy = T83.ay || 0; } return upl.call(this, dt); };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (!T83.on || G.state !== 'play' || !G.player || G.cut) return;
    ctx.save(); const s = T83.stick, t = World.t;
    // analogico
    const bx = s ? s.ox : 170, by = s ? s.oy : 568; ctx.globalAlpha = s ? .55 : .22; ctx.strokeStyle = '#e8dcff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(bx, by, 72, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(184,160,255,.12)'; ctx.fill();
    ctx.globalAlpha = s ? .85 : .3; ctx.fillStyle = 'rgba(200,180,255,.7)'; ctx.beginPath(); ctx.arc(s ? s.ox + clamp(s.x - s.ox, -72, 72) : bx, s ? s.oy + clamp(s.y - s.oy, -72, 72) : by, 34, 0, TAU); ctx.fill();
    if (!s) { ctx.globalAlpha = .35; txt('ARRASTE PARA MOVER', bx, by + 92, 13, '#cdb8ff', 'center', 800); }
    // botoes
    for (const b of BT()) {
      const rdy = !(b.cd > 0), k = rdy ? 1 : 1 - clamp(b.cd / (b.mx || 1), 0, 1); ctx.globalAlpha = b.down ? .95 : .62;
      ctx.fillStyle = b.down ? 'rgba(60,34,140,.9)' : 'rgba(14,6,40,.72)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = rdy ? b.c : '#6a5aa8'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 5, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
      if (rdy && !b.pause) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35 + .15 * Math.sin(t * 6); drawGlow(b.x, b.y, b.r * 1.5, b.c, .6); ctx.restore(); ctx.globalAlpha = b.down ? .95 : .62; }
      txt(b.l, b.x, b.y, b.pause ? 22 : (b.l.length > 6 ? 13 : 15), rdy ? '#fff' : '#a898d8', 'center', 900, 'middle');
    }
    ctx.restore();
  };
  // os botoes de habilidade do HUD antigo e a moldura de baixo somem no modo toque
  T83.hideAb = () => T83.on && G.state === 'play';
}

// ---------- 3. textos: nada de teclado no celular, e tutorial proprio para toque ----------
{
  const R = [[/clique ou ENTER para continuar|ENTER ou clique para continuar|clique \/ ENTER: continuar|ENTER para continuar|clique ou ENTER para começar/, 'toque para continuar'], [/ENTER: pular vídeo.*/, 'toque no botão PULAR'], [/ESC {1,2}pular cena/, ''], [/^ENTER$/, '▸'], [/^.*↑ ↓.*ENTER.*$/, ''], [/clique/g, 'toque'], [/Mova com WASD, setas ou mouse.*/, 'Arraste à esquerda para mover  •  Tiro automático  •  Botões à direita'],
    [/Mova a nave com WASD, as setas ou o mouse\./, 'Arraste o dedo no lado esquerdo da tela para mover a nave (analógico).'], [/Aperte SHIFT para uma esquiva rápida\./, 'Toque no botão azul ESQUIVA para uma esquiva rápida.'], [/Aperte Q para o ESPECIAL da sua arma\./, 'Toque no botão grande ESPECIAL. Cada arma tem o seu!'], [/Aperte ESPAÇO para o Pulso Olien:/, 'Toque no botão laranja PULSO:'], [/Aperte R para a arma SECUNDÁRIA/, 'Toque no botão da arma SECUNDÁRIA'],
    [/SHIFT faz uma esquiva/, 'O botão ESQUIVA faz uma esquiva'], [/Mova a nave \(setas, WASD ou mouse\)/, 'Arraste para mover a nave'], [/Esquive: aperte SHIFT/, 'Toque em ESQUIVA'], [/Use o pulso: ESPAÇO/, 'Toque em PULSO'], [/Use o especial: Q/, 'Toque em ESPECIAL']];
  T83.swap = s => { if (typeof s !== 'string' || s.length > 220) return s; let o = s; for (const [re, to] of R) o = o.replace(re, to); return o; };
  const t0 = txt;
  txt = function (s, x, y, size, color, align, weight, base) { return t0(T83.on ? T83.swap(s) : s, x, y, size, color, align, weight, base); };
  // tutorial de teclas (cartao que pausa o jogo): teclas viram nomes dos botoes
  const orig = TUT.map(q => ({ ...q, keys: (q.keys || []).slice() }));
  const TK = [['ANALÓGICO'], [], ['ESQUIVA'], ['ESPECIAL'], ['PULSO'], ['SECUNDÁRIA']];
  const ts = Extras.tutStart; Extras.tutStart = function () { const r = ts.apply(this, arguments); TUT.forEach((q, i) => { q.keys = ((T83.on && TK[i]) || (orig[i] ? orig[i].keys : q.keys)).slice(); }); return r; };
  // padroes de dica / fundo do tutorial guiado (visual80) trocados no proprio lugar
  Visual83.touchSkip = function () {
    if (!T83.on || (G.state !== 'story' && !(G.state === 'cine'))) return;
    if (UI.button('tskip', W - 188, 12, 172, 40, 'PULAR ▸', { size: 16 })) Input.hit.escape = true;
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
  row(1, 'd_auto', 'Tela cheia automática', s.autoFs === false ? 'NÃO' : 'SIM', 'Entra em tela cheia no primeiro toque ou clique.', () => { s.autoFs = s.autoFs === false; }, s.autoFs !== false);
  row(2, 'd_inst', 'Instalar como aplicativo', T83.standalone ? 'JÁ INSTALADO' : 'INSTALAR', 'Abre em janela própria, sem barra de endereço (PC e celular).', () => T83.install(), T83.standalone);
  row(3, 'd_touch', 'Controles de toque', ['AUTOMÁTICO', 'SEMPRE LIGADOS', 'DESLIGADOS'][s.tmode || 0], 'Analógico e botões na tela. Automático liga ao tocar na tela.', () => { s.tmode = ((s.tmode || 0) + 1) % 3; }, (s.tmode || 0) !== 0);
  row(4, 'd_size', 'Tamanho dos botões de toque', s.tbtn === 1 ? 'GRANDES' : 'NORMAIS', 'Botões maiores ajudam em telas pequenas.', () => { s.tbtn = s.tbtn === 1 ? 0 : 1; }, s.tbtn === 1);
  row(5, 'd_rot', 'Dica', 'JOGUE NA HORIZONTAL', 'No celular gire o aparelho: o jogo é feito para a tela deitada.', () => { }, false);
  if (UI.button('back', W / 2 - 160, 590, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
};
{
  const ti = Screens.title;
  Screens.title = function () {
    const r = ti.apply(this, arguments); if (!T83.standalone && UI.button('tfs', W - 66, 8, 54, 40, '⛶', { size: 22 })) T83.fs(); return r;
  };
}
