'use strict';
// ---------- 80: inimigos que teletransportam/refletem/constroem, golpes proprios dos capitaes, escolha de rota, metas semanais, chefe sem dano,
// furia extra no Novo++, tutorial guiado, voz nas falas, tema por setor, joystick de toque, registro de fps nas lutas ----------
const Visual80 = { bh: 0, bossRun: null, mot: 0, step: 0, tm: {}, stick: null, worst: 0, fsum: 0, fn: 0, spk: '', spkI: -1, msnWeek: false };
const wkKey = () => Math.floor((Date.now() - 4 * 864e5) / (7 * 864e5));
const wk = () => { const d = Save.data; if (!d.wk || d.wk.week !== wkKey()) d.wk = { week: wkKey(), kills: 0, clears: 0, bosses: 0, got: [] }; return d.wk; };

// ---------- 1. tres inimigos com comportamento proprio (variantes de corpo: teletransporte, espelho, construtor) ----------
{
  const OKT = ['drone', 'zig', 'shooter', 'kami', 'shield'], PICK = { 1: 'blink', 2: 'barreira', 0: 'espelho' };
  const se = spawnEnemy;
  spawnEnemy = function (type) {
    const e = se.apply(this, arguments); if (!e) return e;
    if (!e.variant && G.stageIdx > 0 && OKT.includes(type) && !G.training && Math.random() < .11) e.variant = PICK[G.stageIdx % 3];
    return e;
  };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const p = G.player; if (!p || G.state !== 'play') return r;
    for (const e of G.enemies) {
      if (e.dead || e.mode === 'enter' || !e.variant) continue;
      if (e.variant === 'blink') { e._bt = (e._bt ?? rand(1, 2.4)) - dt; if (e._bt <= 0) { e._bt = rand(2.2, 3); burst(e.x, e.y, ['#7fe0ff', '#ffffff'], 8, 160, 4); e.x = clamp(p.x + rand(-260, 260), 60, W - 60); e.bx = e.x; e.tx = e.x; burst(e.x, e.y, ['#7fe0ff', '#ffffff'], 8, 160, 4); } }
      else if (e.variant === 'barreira') { e._bt = (e._bt ?? rand(2, 4)) - dt; if (e._bt <= 0) { e._bt = 4.2; if (G.enemies.filter(q => q.type === 'rock').length < 6 && e.y < H - 200) { spawnEnemy('rock', e.x, e.y + 70, { vx: 0, vy: 70, rot: 0, vr: rand(-1, 1) }); shockwave(e.x, e.y + 40, 60, '#ffb340'); } } }
      else if (e.variant === 'espelho') { for (const b of G.pb) if (!b.refl && !b.dead && Math.hypot(b.x - e.x, b.y - e.y) < e.rad + 8) { b.refl = 1; if (Math.random() < .4) ebullet(b.x, b.y, Math.atan2(-b.vy, -b.vx), 230, { r: 6, c: '#9fe8ff' }); } }
    }
    return r;
  };
  const en = Art.enemy;
  Art.enemy = function (e) {
    const r = en.call(this, e); if (e.dead || !['blink', 'espelho', 'barreira'].includes(e.variant)) return r; const R = (e.rad || 24) + 6, t = World.t;
    ctx.save(); ctx.translate(e.x, e.y);
    if (e.variant === 'blink') { ctx.rotate(t * 2); ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(-R, -R, R * 2, R * 2); }
    else if (e.variant === 'espelho') { ctx.strokeStyle = '#e8f4ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-R * .4, -R * .4, R * .35, R * .15, -.7, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + t; ctx.beginPath(); ctx.arc(0, 0, R, a, a + .6); ctx.stroke(); } }
    ctx.restore(); return r;
  };
}

// ---------- 2. capitaes: cada um com um golpe proprio ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const p = G.player; if (!p || G.state !== 'play' || !G.timers) return r;
    for (const e of G.enemies) {
      if (e.dead || e.type !== 'captain' || e.mode === 'enter') continue; e._ct = (e._ct ?? 1.8) - dt; if (e._ct > 0) continue;
      const nm = e.name || '', ex = e.x, ey = e.y; shockwave(ex, ey, 100, e.glow);
      if (nm.includes('Zangão')) { e._ct = 3.4; G.timers.push({ t: .5, fn: () => { for (let i = 0; i < 14; i++) ebullet(ex, ey, i / 14 * TAU, 150, { r: 7 }); } }); }
      else if (nm.includes('Perfuratriz')) { e._ct = 2.8; G.timers.push({ t: .45, fn: () => { const a = Math.atan2(p.y - ey, p.x - ex); for (let i = -2; i <= 2; i++) ebullet(ex, ey, a + i * .17, 260, { r: 6 }); } }); }
      else if (nm.includes('Para-raios')) { e._ct = 4; const xs = [rand(120, 400), rand(480, 800), rand(880, 1160)]; xs.forEach(x => { for (let k = 0; k < 6; k++) G.timers.push({ t: .6 + k * .12, fn: () => ebullet(x, -10, Math.PI / 2, 340, { r: 6, c: '#e8f6ff' }) }); }); }
      else { e._ct = 4.2; for (let k = 0; k < 20; k++) G.timers.push({ t: .4 + k * .11, fn: () => { if (!e.dead) ebullet(e.x, e.y, k * .6, 200, { r: 6, c: '#ffb340' }); } }); }
    }
    return r;
  };
}

// ---------- 3. bifurcacao: no meio da fase, escolha entre rota segura e rota arriscada ----------
{
  const ss = Game.startStage;
  Game.startStage = function () { const r = ss.apply(this, arguments); G.route = null; G.routeAsk = null; G.routeDone = false; return r; };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); if (G.state !== 'play' || G.endless || G.training || G.rush || G.practice || G.daily || G.boss || G.bossPending) return r;
    if (!G.routeDone && G.t > G.stage.duration * .45 && G.t < G.stage.duration - 40) { G.routeDone = true; G.routeAsk = { t: 0 }; }
    if (G.routeAsk) { G.routeAsk.t += dt; const k = Input.pressed('1') ? 1 : Input.pressed('2') ? 2 : 0; if (k) pickRoute(k === 1 ? 'safe' : 'risk'); else if (G.routeAsk.t > 9) pickRoute('safe'); }
    return r;
  };
  const pickRoute = r => { G.routeAsk = null; G.route = r; if (r === 'risk') { G.adapt = (G.adapt || 1) * 1.25; popup(W / 2, 220, 'ROTA ARRISCADA!', '#ff8a5f', 34); Snd.play('bossWarn'); } else popup(W / 2, 220, 'ROTA SEGURA', '#7fe0a0', 30); };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const q = G.routeAsk; if (!q || G.state !== 'play') return; const a = clamp(q.t / .4, 0, 1);
    ctx.save(); ctx.globalAlpha = a; UI.panel(W / 2 - 330, 236, 660, 128, { r: 20 }); txt('BIFURCAÇÃO NA ROTA', W / 2, 246, 22, '#ffe9a8', 'center', 900);
    if (UI.button('rsafe', W / 2 - 310, 280, 300, 68, '1  SEGURA', { size: 20, sub: 'Sem mudanças' })) pickRoute('safe');
    if (UI.button('rrisk', W / 2 + 10, 280, 300, 68, '2  ARRISCADA', { size: 20, color: '#c2412a', sub: '+25% de vida inimiga, +estrelas' })) pickRoute('risk');
    ctx.fillStyle = '#ffe9a8'; ctx.fillRect(W / 2 - 330, 362, 660 * (1 - q.t / 9), 3); ctx.restore();
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.dead && e.counted; const r = ke.apply(this, arguments);
    if (!was && by && G.route === 'risk' && Math.random() < .35) dropPickup('coin', e.x, e.y, 1);
    if (!was && by) wk().kills++;
    return r;
  };
}

// ---------- 4. metas da semana (aparecem na tela de metas) ----------
{
  const WS = [['Derrotar 1500 inimigos', 'kills', 1500, 150], ['Completar 5 fases', 'clears', 5, 200], ['Vencer 3 chefes', 'bosses', 3, 150]];
  const ms = Screens.missions;
  Screens.missions = function () {
    if (!Visual80.msnWeek) { const r = ms.apply(this, arguments); if (UI.button('wkb', 60, 590, 220, 40, 'SEMANAIS ▸', { size: 15 })) Visual80.msnWeek = true; return r; }
    const w = wk(), d = Save.data; txt('METAS DA SEMANA', W / 2, 40, 48, '#fff', 'center'); txt('Mudam toda semana. Recompensas maiores.', W / 2, 100, 17, '#cdb8ff', 'center', 700); txt('★ ' + d.coins, W - 60, 40, 28, '#ffcf6b', 'right', 900);
    WS.forEach(([nm, key, goal, rw], i) => {
      const y = 160 + i * 130, v = Math.min(goal, w[key]), done = v >= goal, got = w.got.includes(key); UI.panel(180, y, 920, 108, { r: 20 });
      txt(nm, 214, y + 18, 24, '#fff', 'left', 800); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(214, y + 62, 520, 14, 7); ctx.fill(); ctx.fillStyle = done ? '#7fe0a0' : '#ff9a3c'; ctx.beginPath(); ctx.roundRect(214, y + 62, Math.max(8, 520 * v / goal), 14, 7); ctx.fill(); txt(v + ' / ' + goal, 750, y + 56, 20, '#cdb8ff', 'left', 800);
      if (got) txt('RECEBIDO', 960, y + 44, 22, '#7fe0a0', 'center', 900); else if (UI.button('wk' + key, 860, y + 24, 200, 60, done ? '★ ' + rw + ' RECEBER' : '★ ' + rw, { size: 18, disabled: !done })) { w.got.push(key); d.coins += rw; Save.save(); Snd.play('coin', {}); }
    });
    if (UI.button('wkb', 60, 590, 220, 40, '◂ DO DIA', { size: 15 })) Visual80.msnWeek = false;
    if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Visual80.msnWeek = false; G.state = 'hub'; }
  };
  hookRender(rn => { let last = ''; return function () { rn(); const s = G.state; if (s === last) return; if (s === 'clear' && !G.rush && !G.practice) { wk().clears++; Save.save(); } last = s; }; });
}

// ---------- 5. chefe sem dano: troféu e recompensa na primeira vez ----------
{
  const hp = hurtPlayer;
  hurtPlayer = function (d) { const p = G.player, b = p ? p.hp : 0; const r = hp.apply(this, arguments); if (p && p.hp < b && G.boss && G.boss.state === 'fight') Visual80.bh++; return r; };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const b = G.boss;
    if (b && b.state === 'fight') { if (Visual80.bossRun !== b) { Visual80.bossRun = b; Visual80.bh = 0; Visual80.fsum = 0; Visual80.fn = 0; Visual80.worst = 0; } }
    return r;
  };
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    const d = Save.data; d.bossNoHit = d.bossNoHit || {}; d.perfLog = d.perfLog || {};
    if (!G.rush && !G.endless && !G.training) { wk().bosses++; if (Visual80.bh === 0 && G.state === 'play') { if (!d.bossNoHit[G.stageIdx]) { d.bossNoHit[G.stageIdx] = 1; d.coins += 100; popup(W / 2, 290, 'SEM DANO! +100 ★', '#ffd36a', 32); } else popup(W / 2, 290, 'SEM DANO!', '#ffd36a', 28); } }
    if (Visual80.fn > 60) d.perfLog[G.stageIdx] = { avg: Math.round(1000 / (Visual80.fsum / Visual80.fn)), worst: Math.round(1000 / Math.max(1, Visual80.worst)) };
    return bd.apply(this, arguments);
  };
  const bt = Screens.bosstime;
  Screens.bosstime = function () {
    const r = bt.apply(this, arguments); const nh = Save.data.bossNoHit || {};
    STAGES.forEach((st, i) => { if (!nh[i]) return; const x = 80 + (i % 2) * 570, y = 130 + Math.floor(i / 2) * 90; txt('★ SEM DANO', x + 520, y + 14, 14, '#ffd36a', 'right', 900); });
    return r;
  };
  // fps das lutas de chefe e painel F3
  hookRender(rn => { let last = performance.now(); return function () {
    const n = performance.now(), d = n - last; last = n; rn(); if (G.boss && G.boss.state === 'fight' && d < 500 && d > 0) { Visual80.fsum += d; Visual80.fn++; Visual80.worst = Math.max(Visual80.worst, d); }
    if (typeof Visual75 !== 'undefined' && Visual75.dbg && Visual80.fn > 10) { ctx.setTransform(K, 0, 0, K, 0, 0); txt('Luta: média ' + Math.round(1000 / (Visual80.fsum / Visual80.fn)) + ' fps • pior ' + Math.round(1000 / Visual80.worst) + ' fps', W - 280, 356, 14, '#c8f6ff', 'left', 800); }
  }; });
}

// ---------- 6. furia extra no Novo++ (fim da vida do chefe) ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const b = G.boss; if (!b || b.state !== 'fight' || !Save.data.ngpOn || !b.maxHp) return r;
    if (b.hp / b.maxHp < .12) {
      if (!b._f4) { b._f4 = 1; b._f4t = 0; G.zoom = Math.max(G.zoom || 0, .08); G.zoomCx = b.x; G.zoomCy = b.y; shockwave(b.x, b.y, 400, '#ff4a5a'); shake(10); Events.banner = { t: 0, title: 'FÚRIA FINAL', sub: 'O chefe não vai cair sem lutar', c: '#ff4a5a' }; Snd.play('bossWarn'); }
      b._f4t += dt; if (b._f4t > 1.7) { b._f4t = 0; const n = 14, off = rand(0, TAU); for (let i = 0; i < n; i++) ebullet(b.x, b.y, off + i / n * TAU, 170, { r: 7, c: '#ff6a8a' }); }
    }
    return r;
  };
}

// ---------- 7. tutorial guiado na primeira fase ----------
{
  const STEPS = [['Mova a nave (setas, WASD ou mouse)', 'move'], ['Esquive: aperte SHIFT', 'dash'], ['Use o pulso: ESPAÇO', 'pulse'], ['Use o especial: Q', 'spec']];
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const p = G.player, d = Save.data; if (!p || G.state !== 'play' || d.tutDone || Extras.tut || G.stageIdx !== 0 || G.endless || G.training || G.rush || G.practice) return;
    const T = Visual80.tm; if (T.run !== G.runId) { Visual80.step = 0; Visual80.tm = { run: G.runId, px: p.x, py: p.y, mv: 0, dc: p.dashCd, pt: p.pulseT, sc: p.specCd }; }
    const t = Visual80.tm; t.mv += Math.hypot(p.x - t.px, p.y - t.py); t.px = p.x; t.py = p.y;
    const k = STEPS[Visual80.step][1];
    if ((k === 'move' && t.mv > 500) || (k === 'dash' && p.dashCd > t.dc + .3) || (k === 'pulse' && p.pulseT > t.pt + .3) || (k === 'spec' && p.specCd > t.sc + .3)) { Visual80.step++; Snd.play('stamp'); if (Visual80.step >= STEPS.length) { d.tutDone = true; Save.save(); popup(W / 2, 260, 'TUTORIAL COMPLETO!', '#7fe0a0', 30); return; } }
    t.dc = p.dashCd; t.pt = p.pulseT; t.sc = p.specCd;
    ctx.save(); ctx.globalAlpha = .92; UI.panel(24, 200, 350, 30 + STEPS.length * 32, { r: 16 }); txt('TUTORIAL', 40, 208, 16, '#ffb340', 'left', 900);
    STEPS.forEach(([l], i) => { const done = i < Visual80.step, cur = i === Visual80.step; txt((done ? '✓ ' : cur ? '▸ ' : '   ') + l, 40, 236 + i * 32, 15, done ? '#7fe0a0' : cur ? '#fff' : '#8a7fb0', 'left', cur ? 900 : 700); });
    ctx.restore();
  };
}

// ---------- 8. voz nas falas (voz do sistema, opcional) ----------
{
  const PIT = { N: .9, O: 1.5, B: 1.7, L: 1.1, V: .5, C: 1.2, P: .6, E: .8, S: 1.0 };
  hookRender(rn => function () {
    rn(); const s = Save.data.settings; if (!s || !s.voz || !window.speechSynthesis) { if (Visual80.spk && window.speechSynthesis) { speechSynthesis.cancel(); Visual80.spk = ''; } return; }
    if (G.state !== 'story' || !G.story) { if (Visual80.spk) { speechSynthesis.cancel(); Visual80.spk = ''; Visual80.spkI = -1; } return; }
    const pg = G.story.pages[G.story.i]; if (!pg || !pg.text || Visual80.spkI === G.story.i + ':' + G.story.pages.length) return; Visual80.spkI = G.story.i + ':' + G.story.pages.length; speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(pg.text); u.lang = 'pt-BR'; u.pitch = PIT[pg.who] || 1; u.rate = pg.who === 'V' ? .85 : 1; u.volume = .8; Visual80.spk = pg.text; speechSynthesis.speak(u);
  });
  const ac = Screens.access;
  Screens.access = function () {
    const r = ac.apply(this, arguments), s = Save.data.settings;
    if (UI.button('voz', 740, 578, 260, 36, 'VOZ NAS FALAS: ' + (s.voz ? 'SIM' : 'NÃO'), { size: 13, color: s.voz ? '#9a63ff' : undefined })) { s.voz = !s.voz; Save.save(); }
    return r;
  };
}

// ---------- 9. tema melodico de cada setor ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); if (G.state !== 'play' || G.boss || G.training) return r;
    if (G.t - Visual80.mot > 24 || G.t < Visual80.mot) { Visual80.mot = G.t < 5 ? G.t + 8 : G.t; if (G.t > 6) Snd.play('motif', { k: G.stageIdx }); }
    return r;
  };
}

// ---------- 10. celular: joystick virtual na esquerda e aviso para girar o aparelho ----------
{
  const touchy = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
  if (touchy) {
    const st = document.createElement('style'); st.textContent = '#rotHint{display:none;position:fixed;inset:0;z-index:50;background:#0a0420;color:#fff;font:700 22px sans-serif;align-items:center;justify-content:center;text-align:center;padding:30px}@media (orientation:portrait){#rotHint{display:flex}}'; document.head.appendChild(st);
    const d = document.createElement('div'); d.id = 'rotHint'; d.textContent = 'Gire o aparelho para jogar na horizontal'; document.body.appendChild(d);
  }
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  const keys = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown'];
  const rel = () => { Visual80.stick = null; keys.forEach(k => { Input.keys[k] = false; }); };
  addEventListener('pointerdown', e => { if (typeof Visual83 !== 'undefined' || e.pointerType !== 'touch' || G.state !== 'play') return; const q = pos(e); if (q.x > W * .42 || q.y < H * .35 || Visual80.stick) return; e.stopImmediatePropagation(); Visual80.stick = { id: e.pointerId, ox: q.x, oy: q.y, x: q.x, y: q.y }; }, true);
  addEventListener('pointermove', e => { if (typeof Visual83 !== 'undefined') return; const s = Visual80.stick; if (!s || e.pointerId !== s.id) return; e.stopImmediatePropagation(); const q = pos(e); s.x = q.x; s.y = q.y; const dx = q.x - s.ox, dy = q.y - s.oy, th = 14; Input.keys.arrowleft = dx < -th; Input.keys.arrowright = dx > th; Input.keys.arrowup = dy < -th; Input.keys.arrowdown = dy > th; }, true);
  addEventListener('pointerup', e => { if (Visual80.stick && e.pointerId === Visual80.stick.id) rel(); }, true); addEventListener('pointercancel', e => { if (Visual80.stick && e.pointerId === Visual80.stick.id) rel(); }, true);
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const s = Visual80.stick; if (!s || G.state !== 'play') return; const dx = clamp(s.x - s.ox, -60, 60), dy = clamp(s.y - s.oy, -60, 60);
    ctx.save(); ctx.globalAlpha = .5; ctx.strokeStyle = '#e8dcff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(s.ox, s.oy, 64, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(184,160,255,.6)'; ctx.beginPath(); ctx.arc(s.ox + dx, s.oy + dy, 28, 0, TAU); ctx.fill(); ctx.restore();
  };
}
