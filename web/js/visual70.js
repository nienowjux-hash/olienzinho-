'use strict';
// ---------- 70: previa dos tiros nas armas, holofotes no piloto, planetas com relevo no mapa, pausa com painel, aviso de golpe forte,
// morte de chefes menores em cadeia, efeito de tela por arma, titulos com ornamento, conquistas com brilho ----------
const Visual70 = { fireT: -9, fireC: '#b98cff', kick: 0 };
const ok70 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h70 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 1. hangar / armas: cada cartao mostra o tiro da arma subindo ----------
{
  const ar = Visual34.armas;
  Visual34.armas = function () {
    const r = ar.apply(this, arguments); if (QL() < 1) return r; const ld = Save.data.loadout || {}; if ((ld.char || 'olien') !== 'olien') return r;
    const per = 6, np = Math.ceil(WEAPON_ORDER.length / per), t = World.t, ids = WEAPON_ORDER.slice(((G.wpage || 0) % np) * per, ((G.wpage || 0) % np) * per + per);
    ids.forEach((id, i) => {
      const w = WEAPONS[id]; if (!w) return; const x = 70 + (i % 2) * 570, y = 168 + ((i / 2) | 0) * 120, c1 = ok70(w.c) ? w.c : '#b98cff', c2 = ok70(w.c2) ? w.c2 : c1, fz = id.startsWith('fz_');
      ctx.save(); ctx.beginPath(); ctx.roundRect(x + 4, y + 4, 90, 100, 14); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < (fz ? 6 : 4); k++) { const lane = fz ? (k % 2 ? 1 : -1) * 16 : (k % 2 ? 1 : -1) * 8 * (id === 'fan' ? 2.2 : 1), yy = y + 104 - ((t * 420 + k * 36) % 104), a = clamp(1 - (y + 104 - yy) / 104, 0, 1) * .85; ctx.globalAlpha = a; ctx.fillStyle = fz && k % 2 ? c2 : c1; ctx.beginPath(); ctx.roundRect(x + 49 + lane - 2.5, yy, 5, 18, 3); ctx.fill(); }
      ctx.restore();
    });
    return r;
  };
}

// ---------- 2. piloto: holofote em cada cartao e halo no escolhido ----------
{
  const pi = Visual34.piloto;
  Visual34.piloto = function () {
    const r = pi.apply(this, arguments); if (QL() < 1) return r; const t = World.t, cur = (Save.data.loadout || {}).char || 'olien';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    PILOTS.forEach((id, i) => { const x = 60 + i * 195, col = id === 'olien' ? '#b98cff' : id === 'orbi' ? '#7fe0ff' : (GUARDS[id] && ok70(GUARDS[id].c) ? GUARDS[id].c : '#b98cff'); const g = ctx.createLinearGradient(0, 140, 0, 410); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = .1; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 70, 140); ctx.lineTo(x + 110, 140); ctx.lineTo(x + 170, 410); ctx.lineTo(x + 10, 410); ctx.closePath(); ctx.fill(); if (id === cur) { ctx.globalAlpha = .5 + .2 * Math.sin(t * 3); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 4, 136, 188, 278, 24); ctx.stroke(); } });
    ctx.restore(); return r;
  };
}

// ---------- 3. mapa: planetas com faixas, nuvens e crateras girando devagar ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const r = sel.call(this); if (QL() < 1) return r; const t = World.t, nS = STAGES.length, pos = i => [nS > 6 ? 96 + i * (1088 / (nS - 1)) : 150 + i * 196, 408 + (i % 2 ? 36 : -18)], unl = Save.data.unlocked || 1;
    for (let i = 0; i < nS; i++) {
      if (i >= unl) continue; const [x, y0] = pos(i), s = i === G.sel, y = y0 + (s ? Math.sin(t * 3) * 5 : 0), R = (s ? (nS > 6 ? 50 : 56) : (nS > 6 ? 38 : 44)) - 2, c = ok70(STAGES[i].tint) ? STAGES[i].tint : '#ffffff', kind = i % 4;
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip(); ctx.translate(x, y);
      if (kind === 0) { for (let b = -3; b <= 3; b++) { ctx.fillStyle = b % 2 ? 'rgba(255,255,255,.13)' : 'rgba(0,0,30,.16)'; ctx.fillRect(-R, b * R * .28 + Math.sin(t * .6 + b) * 3 - R * .1, R * 2, R * .16); } }
      else if (kind === 1) { for (let k = 0; k < 4; k++) { const cx = ((t * 6 + k * 40) % (R * 3)) - R * 1.5; ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(cx, -R * .5 + k * R * .3, R * .5, R * .12, 0, 0, TAU); ctx.fill(); } }
      else if (kind === 2) { for (let k = 0; k < 6; k++) { const a = h70(i * 7 + k) * TAU + t * .12, rr = h70(i * 3 + k) * R * .7; ctx.fillStyle = 'rgba(0,0,20,.22)'; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, R * (.08 + h70(k + i) * .1), 0, TAU); ctx.fill(); } }
      else { ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(0, 0, R * (.2 + k * .17), t * .2 + k, t * .2 + k + 2.2); ctx.stroke(); } }
      const g = ctx.createRadialGradient(-R * .4, -R * .4, 2, 0, 0, R * 1.2); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,20,.4)'); ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2); ctx.restore();
    }
    return r;
  };
}

// ---------- 4. pausa: painel com cartas, vida, combo e chefe ----------
{
  const ps = Screens.pause;
  Screens.pause = function () {
    const r = ps.apply(this, arguments); if (QL() < 1 || !G.player) return r; const p = G.player;
    // esquerda: cartas
    const L = typeof Visual59 !== 'undefined' ? Visual59.list() : []; UI.panel(520, 150, 320, 410, { r: 22, fill: 'rgba(14,6,40,.7)' }); txt('SUAS CARTAS', 680, 164, 17, '#ffb340', 'center', 900);
    if (!L.length) txt('Nenhuma carta ainda.', 680, 330, 17, '#8a7fb0', 'center', 700);
    L.slice(0, 9).forEach(({ id, n, u }, i) => { const x = 548 + (i % 3) * 94, y = 196 + ((i / 3) | 0) * 118, col = ok70((RARITY[u.r] || {}).c) ? RARITY[u.r].c : '#b98cff'; ctx.save(); ctx.fillStyle = 'rgba(20,8,58,.9)'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, 70, 70, 14); ctx.fill(); ctx.stroke(); try { Visual2.upIcon(id, x + 35, y + 35, 17, col, false); } catch (e) { } if (n > 1) txt('x' + n, x + 66, y + 52, 12, col, 'right', 900); txt(u.name.length > 11 ? u.name.slice(0, 10) + '…' : u.name, x + 35, y + 74, 10, '#cdb8ff', 'center', 700); ctx.restore(); });
    // direita: status
    UI.panel(870, 150, 380, 410, { r: 22, fill: 'rgba(14,6,40,.7)' }); txt('STATUS', 1060, 164, 17, '#ffb340', 'center', 900);
    const rows = [['Fase', (G.stageIdx + 1) + ' • ' + (G.stage ? G.stage.name : '')], ['Nível', String(G.level)], ['Vida', p.hp + ' / ' + p.maxHp], ['Pontos', String(G.score)], ['Combo', 'x' + (G.combo || 0)], ['Inimigos', String(G.kills)], ['Estrelas', '★ ' + G.runCoins]];
    rows.forEach(([a, b], i) => { txt(a, 896, 200 + i * 38, 16, '#8a7fb0', 'left', 800); txt(b.length > 22 ? b.slice(0, 21) + '…' : b, 1224, 200 + i * 38, 17, '#fff', 'right', 800); });
    const b = G.boss; if (b && b.state === 'fight') { txt('CHEFE', 896, 480, 14, '#ff8a5f', 'left', 900); txt(b.name, 1224, 478, 15, '#fff', 'right', 800); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(896, 506, 328, 12); ctx.fillStyle = '#ff8a5f'; ctx.fillRect(896, 506, 328 * clamp(b.ratio, 0, 1), 12); }
    return r;
  };
}

// ---------- 5. golpes fortes do chefe: aviso grande (bordas pulsam e uma mira tracejada aponta para voce) ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const b = G.boss, p = G.player; if (!b || !p || b.state !== 'fight' || G.state !== 'play' || QL() < 1 || !b.tele) return;
    let m = 0; for (const k in b.tele) if (b.tele[k] > m) m = b.tele[k]; if (m < .25) return; const t = World.t;
    ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(255,60,60,0)'); g.addColorStop(1, 'rgba(255,60,60,' + (m * .28) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 90; ctx.strokeStyle = 'rgba(255,200,120,' + (m * .6) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x, b.y + (b.rad || 80)); ctx.lineTo(p.x, p.y - 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = m; ctx.translate(b.x, b.y - (b.rad || 80) - 30); ctx.scale(1 + .12 * Math.sin(t * 14), 1 + .12 * Math.sin(t * 14)); ctx.fillStyle = '#ffcf6b'; ctx.strokeStyle = '#3a1050'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(16, 12); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3a1050'; ctx.fillRect(-2, -6, 4, 10); ctx.fillRect(-2, 7, 4, 3);
    ctx.restore();
  };
}

// ---------- 6. minichefes e capitaes morrem em cadeia ----------
{
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e && !e.dead, x = e && e.x, y = e && e.y, big = e && (e.mini || e.type === 'captain'), c = e && ok70(e.glow) ? e.glow : '#ffb340'; const r = ke(e, by);
    if (was && e.dead && big && QL() >= 1 && G.timers) { for (let i = 1; i <= 5; i++) G.timers.push({ t: i * .13, fn: () => { const ox = rand(-50, 50), oy = rand(-40, 40); burst(x + ox, y + oy, [c, '#ffffff', '#ffb340'], 14, 320, 6); shockwave(x + ox, y + oy, 80 + i * 14, c); if (i % 2) Snd.play('explode', { size: .6 }); shake(3 + i); } }); }
    return r;
  };
}

// ---------- 7. efeito de tela por arma ao disparar ----------
{
  const mb = mkBullet;
  mkBullet = function (p, x, y, ang, speed, dmgMul, o) {
    const b = mb(p, x, y, ang, speed, dmgMul, o);
    if (p === G.player && World.t - Visual70.fireT > .14 && QL() >= 1) { Visual70.fireT = World.t; const w = WEAPONS[p.weapon]; Visual70.fireC = w && ok70(w.c) ? w.c : '#b98cff'; if (/cannon|boomerang/.test(p.weapon)) shake(1.4); }
    return b;
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const p = G.player; if (!p || G.state !== 'play' || QL() < 1) return; const a = 1 - (World.t - Visual70.fireT) / .16; if (a <= 0) return;
    if (/laser|fz_/.test(p.weapon)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(p.x, p.y - 40, p.x, 0); g.addColorStop(0, Visual70.fireC); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a * .14; ctx.fillStyle = g; ctx.fillRect(p.x - 22, 0, 44, p.y - 40); ctx.restore(); }
  };
}

// ---------- 8. titulos de tela com ornamento ----------
{
  const t0 = txt;
  txt = function (s, x, y, size, color, align, weight, base) {
    const r = t0(s, x, y, size, color, align, weight, base);
    if (size >= 38 && size <= 56 && align === 'center' && y < 40 && typeof s === 'string' && s.length > 3 && G.state !== 'play' && G.state !== 'over' && G.state !== 'clear' && QL() >= 1) {
      ctx.save(); ctx.font = `900 ${size}px ${FONT}`; const w = ctx.measureText(s).width, yy = y + size * 1.12, g = ctx.createLinearGradient(x - w / 2 - 60, 0, x + w / 2 + 60, 0); g.addColorStop(0, 'rgba(255,214,120,0)'); g.addColorStop(.5, 'rgba(255,214,120,.9)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - w / 2 - 60, yy, w + 120, 2.5); ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.moveTo(x, yy - 5); ctx.lineTo(x + 7, yy + 1); ctx.lineTo(x, yy + 7); ctx.lineTo(x - 7, yy + 1); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    return r;
  };
}

// ---------- 9. conquistas: cartoes conquistados com brilho que passa ----------
{
  const ac = Screens.achievements;
  Screens.achievements = function () {
    const r = ac.apply(this, arguments); if (QL() < 1) return r; const list = ACH.filter(a => (G.afil || 'all') === 'all' || ((G.afil === 'done') === !!Save.data.ach[a.id])), PP = 12, t = World.t;
    list.slice((G.apage || 0) * PP, (G.apage || 0) * PP + PP).forEach((a, i) => {
      if (!Save.data.ach[a.id]) return; const x = 58 + (i % 3) * 402, y = 150 + ((i / 3) | 0) * 108, k = ((t * .35 + i * .17) % 1.6) - .3;
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, 388, 98, 18); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const gx = x - 60 + k * 520, g = ctx.createLinearGradient(gx - 40, 0, gx + 40, 0); g.addColorStop(0, 'rgba(255,233,168,0)'); g.addColorStop(.5, 'rgba(255,233,168,.16)'); g.addColorStop(1, 'rgba(255,233,168,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 388, 98); ctx.restore();
    });
    return r;
  };
}
