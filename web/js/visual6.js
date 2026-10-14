'use strict';
// ---------- controle (gamepad) e cooperativo local (Olienzinho + Orbi) ----------
const Visual6 = { ps: [{}, {}], pad2: { x: 0, y: 0, sp: false, dash: false }, connected: 0, toast: 0 };

// ===== gamepad =====
Input.gpk = {};
Visual6.pollPads = function () {
  const list = (navigator.getGamepads && navigator.getGamepads()) || [], act = [];
  for (const g of list) if (g && g.connected) act.push(g);
  if (act.length !== Visual6.connected) { Visual6.connected = act.length; Visual6.toast = 3; Snd.init(); }
  Input.gpk = {}; Input.gpAx = 0; Input.gpAy = 0; Visual6.pad2 = { x: 0, y: 0, sp: false, dash: false };
  const coop = !!Save.data.coop, inPlay = G.state === 'play';
  act.slice(0, 2).forEach((g, i) => {
    const s = Visual6.ps[i], b = n => !!(g.buttons[n] && g.buttons[n].pressed), ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    let mx = Math.abs(ax) > .3 ? Math.sign(ax) : 0, my = Math.abs(ay) > .3 ? Math.sign(ay) : 0;
    if (b(14)) mx = -1; if (b(15)) mx = 1; if (b(12)) my = -1; if (b(13)) my = 1;
    const cur = { a: b(0), b: b(1), x: b(2), y: b(3), lb: b(4), rb: b(5), lt: b(6), rt: b(7), st: b(9), up: my < 0, dn: my > 0, lf: mx < 0, rg: mx > 0 };
    const edge = k => cur[k] && !s[k];
    const role = coop ? (i === 0 ? 'p2' : 'p1') : (i === 0 ? 'p1' : 'none');   // no coop: controle 1 joga; com coop: controle 1 = P2, controle 2 = P1
    if (role === 'p1') {
      { const dpx = (b(15) ? 1 : 0) - (b(14) ? 1 : 0), dpy = (b(13) ? 1 : 0) - (b(12) ? 1 : 0), gx = inPlay ? dpx : mx, gy = inPlay ? dpy : my;
        if (gx < 0) Input.gpk.a = true; if (gx > 0) Input.gpk.d = true; if (gy < 0) Input.gpk.w = true; if (gy > 0) Input.gpk.s = true;
        if (inPlay) { const mag = Math.hypot(ax, ay), dz = .16, kk = mag > dz ? Math.min(1, (mag - dz) / (1 - dz)) / mag : 0; Input.gpAx = ax * kk; Input.gpAy = ay * kk; } }
      if (inPlay) { const pm = Save.data.pad || {}, ev = (act, def) => { const k = pm[act]; return k ? edge(k) : def.some(edge); }; if (ev('pulse', ['a'])) Input.hit[' '] = true; if (ev('special', ['x', 'rt'])) Input.hit.q = true; if (ev('dash', ['lb', 'rb', 'y'])) Input.hit.shift = true; if (ev('parry', ['b'])) Input.hit.f = true; if (ev('sec', ['lt'])) Input.hit.r = true; }
    } else if (role === 'p2') { Visual6.pad2 = { x: mx, y: my, sp: edge('x') || edge('rt') || edge('a'), dash: edge('lb') || edge('rb') || edge('y') }; }
    if (role !== 'none') { // menus
      const now = performance.now();
      if (!inPlay) {
        const dir = my < 0 ? 'arrowup' : my > 0 ? 'arrowdown' : mx < 0 ? 'arrowleft' : mx > 0 ? 'arrowright' : '';
        if (dir) { if (s.dir !== dir) { s.dir = dir; s.rep = now + 350; Input.hit[dir] = true; } else if (now > s.rep) { s.rep = now + 130; Input.hit[dir] = true; } } else s.dir = '';
        if (edge('a')) Input.hit.enter = true; if (edge('b')) Input.hit.escape = true;
      }
      if (edge('st')) { Input.hit.escape = true; Input.hit.p = true; }
    }
    Object.assign(s, cur);
  });
};
{ const d0 = Input.down.bind(Input); Input.down = function (k) { return d0(k) || !!this.gpk[k]; }; }
Visual6.rumble = function (ms, st, wk) { try { const g = (navigator.getGamepads() || []).find(q => q && q.connected); if (g && g.vibrationActuator) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: st, weakMagnitude: wk }); } catch (e) { } };
{ const h0 = hurtPlayer; hurtPlayer = function (d) { const p = G.player, b = p ? p.hp : 0; h0(d); if (p && p.hp < b) Visual6.rumble(220, .9, .5); }; }

// ===== cooperativo =====
Visual6.target = function (x, y) {
  const a = G.player, b = G.p2; if (!b || b.dead) return a; if (a.dead) return b;
  return Math.hypot(a.x - x, a.y - y) <= Math.hypot(b.x - x, b.y - y) ? a : b;
};
Visual6.initP2 = function () {
  G.p2 = null; if (!Save.data.coop || G.sanct || !Save.data.cleared[5] || (typeof Visual83 !== 'undefined' && Visual83.on)) return;
  const p = newPlayer(); p.weapon = 'orbi'; p.x = W / 2 + 90; p.y = H - 130; p.isP2 = true; p.specCd = 6; p.buffs = {};
  recalcStats(p); p.hp = p.maxHp; G.p2 = p; G.player.x = W / 2 - 90;
};
Visual6.in2 = function () {
  const k = n => (Input.keys[n] ? 1 : 0), pd = Visual6.pad2;
  let ax = k('arrowright') - k('arrowleft') + pd.x, ay = k('arrowdown') - k('arrowup') + pd.y;
  return { ax: clamp(ax, -1, 1), ay: clamp(ay, -1, 1), special: Input.pressed('enter') || pd.sp, dash: Input.pressed('.') || Input.pressed(',') || pd.dash };
};
Visual6.update = function (dt) {
  const p = G.p2; if (!p) return; p.t += dt;
  if (p.buffs) for (const k of Object.keys(p.buffs)) if (p.buffs[k] > 0) p.buffs[k] -= dt;
  if (p.dead) return;
  const i = Visual6.in2(); p.inv = Math.max(0, p.inv - dt); p.dashCd = Math.max(0, p.dashCd - dt); p.specCd = Math.max(0, p.specCd - dt);
  if (i.dash && p.dashCd <= 0 && p.dashT <= 0) { let dx = i.ax, dy = i.ay; if (!dx && !dy) dy = -1; const m = Math.hypot(dx, dy); p.dashT = .2; p.dashDir = [dx / m, dy / m]; p.dashCd = p.dashCdMax; p.inv = Math.max(p.inv, .34); shockwave(p.x, p.y, 90, '#7fe0ff'); Snd.play('dash'); }
  if (p.dashT > 0) { p.dashT -= dt; const [dx, dy] = p.dashDir; p.vx = dx * 500; p.vy = dy * 500; p.x += dx * 1500 * dt; p.y += dy * 1500 * dt; G.parts.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: .2, max: .2, r: 12, c: '#7fe0ff', drag: 1 }); }
  else if (i.ax || i.ay) { const m = Math.hypot(i.ax, i.ay); p.vx += (i.ax / m * p.speed - p.vx) * Math.min(1, 10 * dt); p.vy += (i.ay / m * p.speed - p.vy) * Math.min(1, 10 * dt); p.x += p.vx * dt; p.y += p.vy * dt; }
  else { p.vx *= 1 - Math.min(1, 6 * dt); p.vy *= 1 - Math.min(1, 6 * dt); p.x += p.vx * dt; p.y += p.vy * dt; }
  p.x = clamp(p.x, 50, W - 50); p.y = clamp(p.y, 90, H - 70);
  p.fireT -= dt; if (p.fireT <= 0) { const W2 = WEAPONS[p.weapon] || WEAPONS.orbi; W2.fire(p); p.fireT = p.fireDelay * W2.delay / (p.buffs.rapid > 0 ? 1.6 : 1); }
  if (i.special && p.specCd <= 0) { p.specCd = p.specCdMax; SPECIALS[(WEAPONS[p.weapon] || WEAPONS.orbi).special](p); Snd.play('specialFire', { w: p.weapon }); shake(6); p.inv = Math.max(p.inv, .4); }
  if (Math.random() < dt * 26) G.parts.push({ x: p.x + rand(-6, 6), y: p.y + 26, vx: rand(-20, 20), vy: rand(80, 160), life: .4, max: .4, r: rand(3, 6), c: '#bff0ff', drag: 1.4 });
};
Visual6.hurtP2 = function (d) {
  const p = G.p2; if (!p || p.dead || p.inv > 0 || G.state !== 'play' || G.training) return;
  p.hp -= d; p.inv = 1.4; Snd.play('playerHit'); shake(10); burst(p.x, p.y, ['#bff0ff', '#7fe0ff', '#ffffff'], 20, 300, 5); shockwave(p.x, p.y, 170, '#7fe0ff'); Visual6.rumble(180, .5, .8);
  if (p.hp <= 0) {
    p.hp = 0; p.dead = true; burst(p.x, p.y, ['#bff0ff', '#7fe0ff', '#ffffff'], 50, 440, 6); for (let k = 0; k < 2; k++) shockwave(p.x, p.y, 220 + k * 130, '#7fe0ff'); Snd.play('explode', { size: 1.4 }); shake(16);
    popup(p.x, Math.min(p.y, H - 120), 'P2 CAIU! Suba de nível para reviver.', '#7fe0ff', 22);
    if (G.player.dead) { G.overT = 2.2; Snd.musicStop(); }
  }
};
Visual6.drawP2 = function () {
  const p1 = G.player, p = G.p2; if (!p) return;
  if (!p.dead) {
    ctx.save(); ctx.globalAlpha = 1; if (p.weapon && p.weapon.startsWith('g_')) Art.guardian(p.x, p.y + Math.sin(p.t * 3) * 2.5, { guard: p.weapon, vx: p.vx, t: p.t, scale: SHIP_S * 1.1, lookx: clamp(p.vx / 300, -1, 1), looky: -.4, blinkT: 0, inv: p.inv }); else Art.orbi(p.x, p.y + Math.sin(p.t * 3) * 2.5, { vx: p.vx, t: p.t, scale: SHIP_S, lookx: clamp(p.vx / 300, -1, 1), looky: -.4, blinkT: 0, inv: p.inv, sx: 1 - Math.abs(p.vx) / 500 * .14, sy: 1 });
    ctx.restore(); txt('P2', p.x, p.y - 56, 13, '#7fe0ff', 'center', 900);
  }
  if (p1 && !p1.dead) txt('P1', p1.x, p1.y - 56, 13, '#e2d4ff', 'center', 900);
};
Visual6.hud = function () {
  const p = G.p2; if (!p) return;
  ctx.save(); txt('P2', W - 24, 176, 14, '#7fe0ff', 'right', 900);
  for (let i = 0; i < p.maxHp; i++) { ctx.fillStyle = i < p.hp ? '#7fe0ff' : 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.roundRect(W - 24 - (p.maxHp - i) * 26, 196, 20, 8, 4); ctx.fill(); }
  if (p.dead) txt('suba de nível para reviver', W - 24, 210, 11, '#8a7fb0', 'right', 700);
  ctx.restore();
};
// coletar itens e levar dano em pares
{
  const up = updatePickup;
  updatePickup = function (k, dt) {
    const p1 = G.player, p2 = G.p2;
    if (p2 && !p2.dead && (p1.dead || Math.hypot(k.x - p2.x, k.y - p2.y) < Math.hypot(k.x - p1.x, k.y - p1.y))) { G.player = p2; try { up(k, dt); } finally { G.player = p1; } } else up(k, dt);
  };
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    ue(e, dt); const p = G.p2;
    if (p && !p.dead && !e.dead && Math.hypot(p.x - e.x, p.y - e.y) < e.rad + 12) { Visual6.hurtP2(e.type === 'kami' ? 2 : 1); if (!['tank', 'captain', 'dummy', 'crystal'].includes(e.type)) killEnemy(e, false); }
  };
  const uh = Events.updateHazards;
  Events.updateHazards = function (dt) {
    uh.call(this, dt); const p = G.p2; if (!p || p.dead) return;
    for (const h of G.hazards) {
      if (h.hit2 || !(h.t >= h.warn && h.t < h.warn + h.dur)) continue;
      let hx;
      if (h.rot) { const dx = p.x - h.cx, dy = p.y - h.cy, ca = Math.cos(-h.rot), sa = Math.sin(-h.rot), lx = dx * ca - dy * sa, ly = dx * sa + dy * ca; hx = Math.abs(lx) < h.w / 2 + 12 && Math.abs(ly) < h.h / 2 + 12; }
      else hx = Math.abs(p.x - h.cx) < h.w / 2 + 12 && Math.abs(p.y - h.cy) < h.h / 2 + 12;
      if (hx) { h.hit2 = true; Visual6.hurtP2(1); }
    }
  };
  const cu = Game.chooseUpgrade;
  Game.chooseUpgrade = function (i) { cu.call(this, i); const p = G.p2; if (p) { const hp = p.hp; recalcStats(p); p.hp = Math.min(hp, p.maxHp); } };
  const ol = Game.openLevelUp;
  Game.openLevelUp = function () { // subir de nivel revive o parceiro
    const p1 = G.player, p2 = G.p2;
    if (p2) {
      if (p1.dead && !p2.dead) { p1.dead = false; p1.hp = 2; p1.inv = 3; G.overT = 0; popup(p1.x, p1.y - 60, 'P1 VOLTOU!', '#e2d4ff', 26); shockwave(p1.x, p1.y, 260, '#e2d4ff'); }
      else if (p2.dead && !p1.dead) { p2.dead = false; p2.hp = 2; p2.inv = 3; popup(p2.x, p2.y - 60, 'P2 VOLTOU!', '#7fe0ff', 26); shockwave(p2.x, p2.y, 260, '#7fe0ff'); }
    }
    return ol.call(this);
  };
  const pd = Game.playerDied;
  Game.playerDied = function () {
    const p = G.player;
    if (G.p2 && !G.p2.dead) { p.dead = true; burst(p.x, p.y, ['#e2d4ff', '#b98cff', '#ff7ac8', '#ffffff'], 50, 440, 6); for (let k = 0; k < 2; k++) shockwave(p.x, p.y, 220 + k * 130, '#b98cff'); Snd.play('explode', { size: 1.4 }); shake(16); popup(p.x, Math.min(p.y, H - 120), 'P1 CAIU! Suba de nível para reviver.', '#e2d4ff', 22); G.eb.forEach(b => { b.dead = true; }); return; }
    pd.call(this);
  };
}
function aimAt(x, y) { const t = Visual6.target(x, y); return Math.atan2(t.y - y, t.x - x); }

// ===== alternar jogadores (C) e aviso do controle =====
Visual6.menuOverlay = function (s) {
  if (!['title', 'select', 'modes'].includes(s)) return;
  if (typeof Visual83 !== 'undefined' && Visual83.on) return;   // no celular nao existe 2 jogadores
  if (Input.pressed('c')) { if (Save.data.cleared[5] || Save.data.coop) { Save.data.coop = !Save.data.coop; Save.save(); Snd.play('uiSelect'); } else Snd.play('uiDeny'); }
  const w = 360, x = W / 2 - w / 2, y = H - 52, id = 'coopTog';
  if (UI.hit(id, x, y, w, 36)) { if (Save.data.cleared[5] || Save.data.coop) { Save.data.coop = !Save.data.coop; Save.save(); } else Snd.play('uiDeny'); }
  const f = UI.focus(id), co = !!Save.data.coop;
  ctx.save(); ctx.fillStyle = f ? 'rgba(90,50,190,.9)' : 'rgba(20,8,55,.75)'; ctx.strokeStyle = co ? '#7fe0ff' : 'rgba(190,160,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, 36, 18); ctx.fill(); ctx.stroke();
  txt('[C]  ' + (co ? '2 JOGADORES  (Olienzinho + Orbi)' : Save.data.cleared[5] ? '1 JOGADOR' : '1 JOGADOR   🔒 2P: derrote o Vazio'), W / 2, y + 18, 15, co ? '#7fe0ff' : '#cdb8ff', 'center', 900, 'middle'); ctx.restore();
  if (Visual6.connected) txt('controle conectado: ' + Visual6.connected, 28, H - 40, 13, '#7fe0a0', 'left', 800);
};
Visual6.toastDraw = function () {
  if (Visual6.toast <= 0) return; Visual6.toast -= 1 / 60; const a = clamp(Visual6.toast, 0, 1);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(14,5,40,.9)'; ctx.strokeStyle = '#7fe0a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(W / 2 - 170, 72, 340, 40, 20); ctx.fill(); ctx.stroke();
  txt(Visual6.connected ? 'CONTROLE CONECTADO' + (typeof Visual66 !== 'undefined' ? Visual66.label() : '') + ' (' + Visual6.connected + ')' : 'CONTROLE DESCONECTADO', W / 2, 92, 15, '#7fe0a0', 'center', 900, 'middle'); ctx.restore();
};
