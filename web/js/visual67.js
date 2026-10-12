'use strict';
// ---------- 67: o jogo reconhece sozinho se voce esta usando controle ou teclado: dicas, cursor e abas mudam junto ----------
const Visual67 = { dev: 'kb', mx: 0, my: 0, acc: 0, tabHit: 0 };
Visual67.pad = () => Visual67.dev === 'pad' && Visual66.list().length > 0;
Visual67.kind = () => { const p = Visual66.list()[0]; return p ? p.kind : 'xbox'; };
Visual67.ACT = { ESP: 'pulse', 'ESPAÇO': 'pulse', SHIFT: 'dash', Q: 'special', F: 'parry', R: 'sec' };
Visual67.glyph = act => { const k = (Save.data.pad || {})[act] || PDEF[act][1]; return Visual66.glyph(Visual67.kind(), k); };
Visual67.conf = () => Visual66.glyph(Visual67.kind(), 'a');
Visual67.back = () => Visual66.glyph(Visual67.kind(), 'b');
Visual67.swap = function (s) {
  if (typeof s !== 'string' || s.length > 160) return s;
  if (s.length <= 6 && Visual67.ACT[s]) return Visual67.glyph(Visual67.ACT[s]);
  if (!/ENTER|ESC|ESPAÇO|SHIFT|WASD|\bQ\b|\bR\b|ESP\b/.test(s)) return s;
  return s.replace('Mova com WASD, setas ou mouse', 'Mova com o analógico esquerdo').replace(/\bENTER\b/g, Visual67.conf()).replace(/\bESC\b/g, Visual67.back())
    .replace(/\bESPAÇO\b|\bESP\b/g, Visual67.glyph('pulse')).replace(/\bSHIFT\b/g, Visual67.glyph('dash')).replace(/\bQ\b/g, Visual67.glyph('special')).replace(/\bR\b/g, Visual67.glyph('sec'));
};
{
  const t0 = txt;
  txt = function (s, x, y, size, color, align, weight, base) { return t0(Visual67.pad() ? Visual67.swap(s) : s, x, y, size, color, align, weight, base); };
}

// teclado ou mouse: volta para o modo teclado
addEventListener('keydown', () => { Visual67.dev = 'kb'; });
addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') Visual67.dev = 'kb'; });
addEventListener('pointermove', e => { const dx = e.clientX - Visual67.mx, dy = e.clientY - Visual67.my; Visual67.mx = e.clientX; Visual67.my = e.clientY; Visual67.acc += Math.hypot(dx, dy); if (Visual67.acc > 120) { Visual67.dev = 'kb'; Visual67.acc = 0; } });
// controle: qualquer botao ou analogico muda para o modo controle e libera as abas (LB / RB)
{
  const pp = Visual6.pollPads, prev = {};
  Visual6.pollPads = function () {
    const r = pp.apply(this, arguments); const l = (navigator.getGamepads && navigator.getGamepads()) || [];
    for (const g of l) if (g && g.connected) {
      let act = false; for (let i = 0; i < g.buttons.length; i++) if (g.buttons[i] && g.buttons[i].pressed) { act = true; break; }
      if (!act) for (let i = 0; i < 4 && i < g.axes.length; i++) if (Math.abs(g.axes[i]) > .55) { act = true; break; }
      if (act) { if (Visual67.dev !== 'pad') { Visual67.dev = 'pad'; Visual67.acc = 0; } }
      const lb = !!(g.buttons[4] && g.buttons[4].pressed), rb = !!(g.buttons[5] && g.buttons[5].pressed), k = g.index;
      if (G.state !== 'play' && !Visual66.wait) { if (lb && !(prev[k] && prev[k].lb)) Input.hit.tabl = true; if (rb && !(prev[k] && prev[k].rb)) Input.hit.tabr = true; }
      prev[k] = { lb, rb };
    }
    return r;
  };
}
// abas: LB / RB no controle (ou PageUp / PageDown no teclado)
Visual67.step = (list, cur, d) => list[(list.indexOf(cur) + d + list.length) % list.length];
Visual67.tabDir = () => (Input.pressed('tabl') || Input.pressed('pageup')) ? -1 : (Input.pressed('tabr') || Input.pressed('pagedown')) ? 1 : 0;
Visual67.hint = function (xL, xR, y) { if (!Visual67.pad()) return; const a = Visual66.glyph(Visual67.kind(), 'lb'), b = Visual66.glyph(Visual67.kind(), 'rb'); ctx.save(); ctx.font = `900 14px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; for (const [x, lab] of [[xL, a], [xR, b]]) { ctx.fillStyle = 'rgba(20,8,60,.9)'; ctx.strokeStyle = '#cdb8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 24, y - 14, 48, 28, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillText(lab, x, y + 1); } ctx.restore(); };
{
  const st = Screens.settings;
  Screens.settings = function () {
    const d = Visual67.tabDir(); if (d && !Visual66.wait) { G.stab = Visual67.step(Visual37.STABS.map(q => q[0]), G.stab || 'aud', d); Snd.play('uiSelect'); }
    const r = st.call(this); Visual67.hint(40, W - 40, 98); return r;
  };
  const hg = Screens.hangar;
  Screens.hangar = function () {
    const d = Visual67.tabDir(); if (d) { G.htab = Visual67.step(Visual34.tabs.map(q => q[0]), G.htab || 'arm', d); Snd.play('uiSelect'); }
    const r = hg.call(this); Visual67.hint(40, W - 40, 101); return r;
  };
  const ac = Screens.achievements;
  Screens.achievements = function () {
    const d = Visual67.tabDir(); if (d) { G.afil = Visual67.step(['all', 'done', 'todo'], G.afil || 'all', d); Snd.play('uiSelect'); }
    return ac.call(this);
  };
}
// cursor: some quando se joga com controle
{
  const pad = () => Visual67.pad();
  hookRender(rn => function () { rn(); if (pad() && G.state !== 'play') cv.style.cursor = 'none'; });
}

// ---------- vibracao: tenta os dois tipos de atuador e mostra o resultado na aba Controles ----------
Visual67.rumbleInfo = { sup: null, last: '' };
Visual67.rumble = function (ms, strong, weak) {
  if (Save.data.settings && Save.data.settings.rumble === false) return;
  const l = (navigator.getGamepads && navigator.getGamepads()) || [];
  for (const g of l) { if (!g || !g.connected) continue;
    try {
      if (g.vibrationActuator && g.vibrationActuator.playEffect) { Visual67.rumbleInfo.sup = true; const pr = g.vibrationActuator.playEffect(g.vibrationActuator.type || 'dual-rumble', { startDelay: 0, duration: ms, weakMagnitude: weak, strongMagnitude: strong }); if (pr && pr.then) pr.then(r => { Visual67.rumbleInfo.last = String(r); }, e => { Visual67.rumbleInfo.last = 'erro: ' + (e && e.message || e); }); }
      else if (g.hapticActuators && g.hapticActuators[0] && g.hapticActuators[0].pulse) { Visual67.rumbleInfo.sup = true; g.hapticActuators[0].pulse(Math.max(strong, weak), ms); Visual67.rumbleInfo.last = 'pulso'; }
      else Visual67.rumbleInfo.sup = false;
    } catch (e) { Visual67.rumbleInfo.last = 'erro: ' + (e && e.message || e); }
  }
};
Visual6.rumble = Visual67.rumble;
{
  const td = tryDash; tryDash = function (x, y) { const c = G.player ? G.player.dashCd : 1; const r = td(x, y); if (G.player && c <= 0 && G.player.dashCd > 0) Visual67.rumble(90, .25, .5); return r; };
  const op = Boss.prototype.onPhase; Boss.prototype.onPhase = function () { Visual67.rumble(420, .9, .7); return op.call(this); };
  const bd = Game.bossDefeated; Game.bossDefeated = function () { Visual67.rumble(800, 1, .8); return bd.apply(this, arguments); };
  const ke = killEnemy; killEnemy = function (e, by) { const was = e && !e.dead; const r = ke(e, by); if (was && e.dead && (e.mini || e.type === 'captain')) Visual67.rumble(200, .6, .4); return r; };
}
