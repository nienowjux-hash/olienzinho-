'use strict';
// ---------- pilotos guardioes (Colmeia, Petreo, Vigia, Solaris) e arma secundaria ----------
const Visual13 = { mines: [] };
const GUARDS = {
  C: { name: 'COLMEIA', c: '#ffb340', ok: () => !!Save.data.cleared[9], w: 'g_C', desc: 'Enxame de abelhas teleguiadas.', sp: 'Enxame', st: 'Mais veloz, mas frágil (-1 de vida).' },
  P: { name: 'PÉTREO', c: '#c8a0b8', ok: () => !!Save.data.cleared[9], w: 'g_P', desc: 'Rochas lentas e pesadas que explodem.', sp: 'Terremoto', st: 'Mais resistente (+2 de vida), mais lento.' },
  E: { name: 'VIGIA', c: '#ff7ac8', ok: () => !!Save.data.cleared[9], w: 'g_E', desc: 'Olhares que atravessam tudo.', sp: 'Olhar do Vigia', st: '+10% de crítico.' },
  S: { name: 'SOLARIS', c: '#ff8a1f', ok: () => !!Save.data.cleared[9], w: 'g_S', desc: 'Bolas de fogo em leque largo.', sp: 'Explosão Solar', st: '+10% de dano.' },
};
const PILOTS = ['olien', 'orbi', 'C', 'P', 'E', 'S'];
Visual13.pilotOk = id => id === 'olien' || (id === 'orbi' ? !!Save.data.cleared[5] : GUARDS[id] && GUARDS[id].ok());
Visual13.pilotWeapon = id => id === 'orbi' && Save.data.cleared[5] ? 'orbi' : (GUARDS[id] && GUARDS[id].ok() ? GUARDS[id].w : null);

// ===== armas dos guardioes =====
const bee = (p, k, n, ang, speed, mul, o) => mkBullet(p, p.x + k * 20, p.y - 20, ang, speed, mul, Object.assign({ kind: 'missile', orb: true, speed: 760, target: null, life: 2.2, pierce: 0, r: 8 }, o));
WEAPONS.g_C = { name: 'Enxame', desc: 'Abelhas teleguiadas.', c: '#ffb340', price: 0, delay: 1.15, special: 'swarm', specName: 'Enxame', specDesc: 'Vinte e quatro abelhas atrás dos inimigos.',
  fire(p) { const n = 5 + (p.shots - 1) * 2; for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; bee(p, k * .5, n, -Math.PI / 2 + k * .3 + rand(-.12, .12), rand(420, 600), .32, { bee: true, c: '#ffb340', ph: rand(0, 6) }); } muzzle(p, '#ffb340', 20); Snd.play('shoot', { lv: 0, wpn: 'bee', pan: Snd.panX(p.x) * .5 }); } };
WEAPONS.g_P = { name: 'Rochedo', desc: 'Rocha lenta que explode em área.', c: '#c8a0b8', price: 0, delay: 1.9, special: 'quake', specName: 'Terremoto', specDesc: 'Sacode a tela: todos os inimigos sofrem dano.',
  fire(p) { const n = Math.min(3, p.shots); for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; mkBullet(p, p.x + k * 30, p.y - 40, -Math.PI / 2 + k * .12, 600, 3.2, { kind: 'cannon', rock: true, sd: rand(0, 9), r: 20, aoe: 106, life: 1.5, pierce: 0, c: '#c8a0b8' }); } for (let i = 0; i < 4 + p.shots; i++) mkBullet(p, p.x + rand(-16, 16), p.y - 36, -Math.PI / 2 + rand(-.45, .45), rand(700, 900), .16, { rock: true, small: true, sd: rand(0, 9), r: 7, life: .7, pierce: 0, c: '#c8a0b8' }); muzzle(p, '#c8a0b8', 30); shake(2); Snd.play('shoot', { wpn: 'rock', pan: Snd.panX(p.x) * .5 }); } };
WEAPONS.g_E = { name: 'Olhar', desc: 'Feixes que atravessam os inimigos.', c: '#ff7ac8', price: 0, delay: 1, special: 'gaze', specName: 'Olhar do Vigia', specDesc: 'Limpa os tiros e marca os inimigos: dano dobrado por 4s.',
  fire(p) { const n = 2 + Math.floor((p.shots - 1) / 2) * 2; for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; mkBullet(p, p.x + k * 20, p.y - 34, -Math.PI / 2, 1150, .78, { pierce: 99, c: '#ff7ac8' }); } muzzle(p, '#ff7ac8', 18); Snd.play('shoot', { lv: 0, pan: Snd.panX(p.x) * .5 }); } };
WEAPONS.g_S = { name: 'Fogo Solar', desc: 'Bolas de fogo em leque largo.', c: '#ff8a1f', price: 0, delay: 1.2, special: 'sunburst', specName: 'Explosão Solar', specDesc: 'Um anel de fogo em todas as direções.',
  fire(p) { const n = 5 + (p.shots - 1) * 2; for (let i = 0; i < n; i++) mkBullet(p, p.x, p.y - 30, -Math.PI / 2 + (i / (n - 1) - .5) * 1.15, 700, .78, { r: 12, c: '#ff8a1f', pierce: 1, life: .75, fire: true, ph: rand(0, 6) }); muzzle(p, '#ffb340', 24); Snd.play('shoot', { lv: 0, wpn: 'fire', pan: Snd.panX(p.x) * .5 }); } };
SPECIALS.swarm = function (p) { const d = p.specPow || 1; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; G.pb.push({ kind: 'missile', orb: true, bee: true, x: p.x, y: p.y - 10, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, dmg: p.dmg * 1.1 * d, pierce: 0, hits: [], life: 3.2, speed: 820, target: null, c: '#ffb340', r: 8, crit: false }); } flashScreen(.12); };
SPECIALS.quake = function (p) { const d = (p.specPow || 1) * p.dmg * 3.2; shockwave(p.x, p.y, 900, '#c8a0b8'); shockwave(p.x, p.y, 500, '#ffffff'); shake(24); for (const q of G.eb) q.dead = true; for (const e of G.enemies) if (!e.dead && e.type !== 'dummy') damageEnemy(e, d, false, true); const bo = G.boss; if (bo && bo.targetable()) bo.damage(Math.min(d * 2, bo.maxHp * .045)); shedDebris(p.x, p.y, 20, ['#5a3a58', '#c8a0b8'], 600, 14); };
SPECIALS.gaze = function (p) { G.mark = 4; for (const q of G.eb) q.dead = true; shockwave(p.x, p.y, 700, '#ff7ac8'); flashScreen(.25); };
SPECIALS.sunburst = function (p) { const d = (p.specPow || 1) * p.dmg * 1.4; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; G.pb.push({ x: p.x, y: p.y, vx: Math.cos(a) * 600, vy: Math.sin(a) * 600, dmg: d, crit: false, pierce: 99, hits: [], c: '#ff8a1f', kind: 'flame', life: .85, l0: .85, r: 20, w: 'flame' }); } shockwave(p.x, p.y, 420, '#ffcf6b'); shockwave(p.x, p.y, 250, '#ff8a1f'); };
{
  const de = damageEnemy; damageEnemy = function (e, dmg, crit, chained) { if (G.mark > 0 && !chained) dmg *= 1.9; return de(e, dmg, crit, chained); };
  const ss = Visual8.styleStats;
  Visual8.styleStats = function (p) {
    ss.call(this, p); const w = p.weapon;
    if (w === 'g_C') { p.speed *= 1.1; p.maxHp = Math.max(2, p.maxHp - 1); } else if (w === 'g_P') { p.maxHp += 2; p.speed *= .9; } else if (w === 'g_E') p.crit += .1; else if (w === 'g_S') p.dmg *= 1.1;
  };
  const ap = Art.pbullet;
  Art.pbullet = function (b) {
    if (b.bee) { // abelha de verdade: asas batendo, listras e ferrao
      const t = World.t * 40 + (b.ph || 0), a = Math.atan2(b.vy, b.vx) + Math.PI / 2; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a + Math.sin(t * .2) * .12); ctx.scale(1.8, 1.8);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 20, '#ffb340', .4); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const fl = Math.sin(t); for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (.5 + fl * .45)); ctx.fillStyle = 'rgba(235,248,255,.8)'; ctx.strokeStyle = 'rgba(150,200,240,.9)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(s * 6, -3, 6.5, 3, s * .3, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = '#3a2008'; ctx.beginPath(); ctx.moveTo(-1.8, 9); ctx.lineTo(0, 15); ctx.lineTo(1.8, 9); ctx.fill();
      ctx.fillStyle = '#ffc233'; ctx.beginPath(); ctx.ellipse(0, 3.5, 5.2, 7.2, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 3.5, 5.2, 7.2, 0, 0, TAU); ctx.clip(); ctx.fillStyle = '#2a1404'; ctx.fillRect(-6, 1, 12, 2.3); ctx.fillRect(-6, 5.4, 12, 2.3); ctx.restore();
      ctx.fillStyle = '#6a4010'; ctx.beginPath(); ctx.arc(0, -3, 4.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd96a'; ctx.beginPath(); ctx.arc(0, -8.2, 3.6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 1.9, -8.6, 1.4, 0, TAU); ctx.fill(); } ctx.fillStyle = '#1a0a02'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 1.9, -8.4, .7, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#2a1404'; ctx.lineWidth = .9; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 1.4, -11); ctx.quadraticCurveTo(s * 3, -14, s * 4.6, -13.4); ctx.stroke(); }
      ctx.restore(); return; }
    if (b.rock) { // pedra de verdade: lasca irregular girando
      const R = (b.r || 20) * 1.15, rot = World.t * (b.small ? 9 : 3.4) + (b.sd || 0); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(rot);
      if (!b.small) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.9, '#ff9a6a', .22); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, k = R * (.78 + ((Math.sin(i * 2.9 + (b.sd || 0)) + 1) * .15)); pts.push([Math.cos(a) * k, Math.sin(a) * k * .95]); }
      ctx.fillStyle = lin(-R, -R, R, R, [[0, '#e8ccd8'], [.5, '#a07a98'], [1, '#4a2e48']]); ctx.strokeStyle = '#241428'; ctx.lineWidth = b.small ? 1.5 : 3; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (!b.small) { ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(pts[0][0] * .8, pts[0][1] * .8); ctx.lineTo(pts[1][0] * .8, pts[1][1] * .8); ctx.lineTo(pts[2][0] * .3, pts[2][1] * .3); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(36,20,40,.75)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-R * .1, -R * .6); ctx.lineTo(R * .15, -R * .1); ctx.lineTo(-R * .2, R * .35); ctx.moveTo(R * .15, -R * .1); ctx.lineTo(R * .55, R * .05); ctx.stroke(); }
      ctx.restore(); return; }
    if (b.fire) { Visual13.fireball(b.x, b.y, b.r || 12, Math.atan2(b.vy, b.vx), b.ph || 0, 1); return; }
    if (b.kind === 'flame') { const k = 1 - clamp((b.life || 0) / (b.l0 || .38), 0, 1); Visual13.fireball(b.x, b.y, (b.r || 15) * (.8 + k * .5), Math.atan2(b.vy, b.vx), b.x * .05, 1 - k * .8); return; }
    return ap.call(this, b);
  };
}
// bola de fogo: cabeca branca-amarela, cauda de labaredas que tremem e mudam de cor
Visual13.fireball = function (x, y, r, ang, ph, al) {
  const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx, t = World.t * 22 + ph; ctx.save();
  for (let k = 9; k >= 0; k--) {
    const f = k / 9, w = Math.sin(t + k * 1.1) * k * .9, cx = x - dx * k * r * .62 + px * w, cy = y - dy * k * r * .62 + py * w, rr = r * (1 - f * .55) * (1 + Math.sin(t * 1.3 + k) * .1);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al * (1 - f) * .75; ctx.fillStyle = f < .35 ? '#ffb43a' : f < .7 ? '#ff6a1a' : '#b8300e'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (1 - f) * .5; drawGlow(cx, cy, rr * 2, f < .5 ? '#ff9a2a' : '#ff4a1a', .8);
  }
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al; drawGlow(x, y, r * 2.8, '#ff8a1f', .85);
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(x, y, r * .85, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(x + dx * 1.5, y + dy * 1.5, r * .5, 0, TAU); ctx.fill();
  ctx.restore();
};
// ===== desenho dos guardioes =====
Art.guardian = function (x, y, o) {
  const U = 112 * (o.scale || 1), r = U * .36, t = o.t || 0, g = o.guard.slice(2);
  ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .18); ctx.scale(o.sx || 1, o.sy || 1); if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
  const c = GUARDS[g].c; ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 3, c, .35);
  const fl = r * (.8 + Math.random() * .5), fg = ctx.createLinearGradient(0, r * .7, 0, r * .7 + fl); fg.addColorStop(0, '#fff3c8'); fg.addColorStop(.5, c); fg.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-r * .3, r * .7); ctx.lineTo(0, r * .7 + fl); ctx.lineTo(r * .3, r * .7); ctx.fill(); ctx.restore();
  const eye = (ex, ey, er, col) => { const lx = (o.lookx || 0) * er * .25, ly = (o.looky || 0) * er * .2, h = o.blinkT > 0 ? .15 : 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, er, er * h, 0, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(ex + lx, ey + ly, er * .55, er * .55 * h, 0, 0, TAU); ctx.fill(); };
  if (g === 'C') {
    for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (.7 + Math.sin(t * 40) * .25)); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(s * r * .9, -r * .3, r * .7, r * .3, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = lin(-r, 0, r, 0, [[0, '#ffe08a'], [.5, '#ffb340'], [1, '#d98a10']]); ctx.beginPath(); ctx.ellipse(0, 0, r * .9, r * 1.05, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a2008'; for (const yy of [.15, .5]) ctx.fillRect(-r * .85, r * yy, r * 1.7, r * .16); ctx.strokeStyle = '#3a2008'; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * r * .3, -r); ctx.quadraticCurveTo(s * r * .5, -r * 1.5, s * r * .9, -r * 1.4); ctx.stroke(); } eye(0, -r * .25, r * .42, '#3a2008');
  } else if (g === 'P') {
    ctx.fillStyle = lin(-r, -r, r, r, [[0, '#d8b8c8'], [1, '#5a3a58']]); ctx.strokeStyle = '#2a1830'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, q = r * (1 + ((k * 5) % 3) * .08); ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q * 1.05); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffcf9a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * .38, -r * .15, r * .18, r * .12, 0, 0, TAU); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#2a1830'; ctx.beginPath(); ctx.moveTo(-r * .3, r * .35); ctx.lineTo(r * .3, r * .35); ctx.stroke();
  } else if (g === 'E') {
    ctx.fillStyle = lin(0, -r, 0, r, [[0, '#ffffff'], [1, '#ffc4e6']]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#a8369a'; ctx.lineWidth = 3; ctx.stroke(); eye(0, 0, r * .62, '#ff3d9a'); ctx.fillStyle = '#12041f'; ctx.beginPath(); ctx.ellipse((o.lookx || 0) * r * .15, (o.looky || 0) * r * .1, r * .12, r * .32, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,122,200,.8)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); ctx.lineTo(Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4); ctx.stroke(); }
  } else {
    ctx.save(); ctx.rotate(t * .8); ctx.fillStyle = '#ffb340'; for (let k = 0; k < 10; k++) { ctx.rotate(TAU / 10); ctx.beginPath(); ctx.moveTo(r * .8, -r * .2); ctx.lineTo(r * 1.45 + Math.sin(t * 6 + k) * r * .12, 0); ctx.lineTo(r * .8, r * .2); ctx.fill(); } ctx.restore();
    ctx.fillStyle = lin(0, -r, 0, r, [[0, '#fff0c0'], [1, '#ff8a1f']]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); eye(0, -r * .1, r * .36, '#7a2a0a');
  }
  ctx.restore();
};
{ const as = Art.ship; Art.ship = function (x, y, o) { if (o.guard) return Art.guardian(x, y, o); return as.call(this, x, y, o); }; }

// ===== arma secundaria (tecla R) =====
const SECS = { none: { name: 'NENHUMA', c: '#8a7fb0', cd: 9, desc: '' }, missiles: { name: 'MÍSSEIS DE APOIO', c: '#ffb340', cd: 9, desc: 'Seis mísseis teleguiados.' }, mine: { name: 'MINA', c: '#ff7a4a', cd: 7, desc: 'Deixa uma mina que explode quando algo chega perto.' }, barrier: { name: 'BARREIRA', c: '#7fe0ff', cd: 11, desc: 'Orbes giratórios destroem tiros por 4 segundos.' } };
Visual13.useSec = function (p) {
  const id = Save.data.loadout.sec || 'none'; if (id === 'none' || p.secCd > 0 || p.dead) return; p.secCd = p.secMax = SECS[id].cd;
  Snd.play('specialFire', { w: 'secondary' }); const d = p.dmg;
  if (id === 'missiles') { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .45; G.pb.push({ kind: 'missile', x: p.x, y: p.y - 10, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, dmg: d * 1.4, pierce: 0, hits: [], life: 3, speed: 780, target: null, c: '#ffb340', crit: false }); } }
  else if (id === 'mine') Visual13.mines.push({ x: p.x, y: p.y - 10, t: 0, life: 12 });
  else G.barrier = { t: 0, dur: 4 };
};
Visual13.update = function (dt) {
  const p = G.player; if (!p || p.dead) return; p.secCd = Math.max(0, (p.secCd || 0) - dt);
  if (Input.pressed('r')) Visual13.useSec(p);
  for (const m of Visual13.mines) {
    m.t += dt; m.life -= dt; if (m.t < .6) continue; let hit = null;
    for (const e of G.enemies) if (!e.dead && e.type !== 'dummy' && Math.hypot(e.x - m.x, e.y - m.y) < 90 + e.rad * .5) { hit = e; break; }
    if (!hit && G.boss && G.boss.targetable() && G.boss.hitTest(m.x, m.y, 60)) hit = G.boss;
    if (hit || m.life <= 0) { m.dead = true; if (!hit) continue; burst(m.x, m.y, ['#ff7a4a', '#ffd36a', '#ffffff'], 40, 460, 6); shockwave(m.x, m.y, 180, '#ff7a4a'); Snd.play('explode', { size: 1.1 }); shake(8); for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - m.x, e.y - m.y) < 170 + e.rad) damageEnemy(e, p.dmg * 6, false, true); if (G.boss && G.boss.targetable() && Math.hypot(G.boss.x - m.x, G.boss.y - m.y) < 220) G.boss.damage(Math.min(p.dmg * 7, G.boss.maxHp * .035)); }
  }
  Visual13.mines = Visual13.mines.filter(m => !m.dead);
  const b = G.barrier; if (b) {
    b.t += dt; for (let i = 0; i < 5; i++) { const a = b.t * 4 + i * TAU / 5, ox = p.x + Math.cos(a) * 62, oy = p.y + Math.sin(a) * 62;
      for (const q of G.eb) if (!q.dead && Math.hypot(q.x - ox, q.y - oy) < 26) { q.dead = true; sparks(q.x, q.y, '#7fe0ff', 5, 220); }
      for (const e of G.enemies) if (!e.dead && e.type !== 'dummy' && Math.hypot(e.x - ox, e.y - oy) < e.rad + 14 && (e.bar || 0) <= 0) { e.bar = .3; damageEnemy(e, p.dmg * 1.2, false, true); } }
    for (const e of G.enemies) if (e.bar > 0) e.bar -= dt;
    if (b.t > b.dur) G.barrier = null;
  }
  if (G.mark > 0) G.mark -= dt;
  for (const q of G.pb) {
    if (q.fire && Math.random() < .7) G.parts.push({ x: q.x + rand(-6, 6), y: q.y + rand(-3, 8), vx: rand(-50, 50), vy: rand(-90, 20), life: rand(.25, .5), max: .5, r: rand(2, 5), c: Math.random() < .5 ? '#ffb340' : '#ff6a1a', drag: 1.5 });
    else if (q.rock && !q.small && Math.random() < .5) G.parts.push({ x: q.x + rand(-8, 8), y: q.y + 12, vx: rand(-30, 30), vy: rand(20, 90), life: rand(.3, .6), max: .6, r: rand(3, 6), c: Math.random() < .5 ? '#b89aa8' : '#6a4a68', drag: 2 });
  }
};
Visual13.draw = function () {
  const p = G.player; if (!p) return; const t = World.t;
  for (const m of Visual13.mines) { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(t * 2); ctx.fillStyle = '#3a1a10'; ctx.strokeStyle = '#ff7a4a'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 11 : 17; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 24, m.t < .6 ? '#8a7fb0' : (Math.sin(t * 14) > 0 ? '#ff4a2a' : '#ff9a5a'), .8); ctx.restore(); }
  const b = G.barrier; if (b) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const k = Math.min(1, b.t / .2) * Math.min(1, (b.dur - b.t) / .3); for (let i = 0; i < 5; i++) { const a = b.t * 4 + i * TAU / 5, ox = p.x + Math.cos(a) * 62, oy = p.y + Math.sin(a) * 62; ctx.globalAlpha = k; drawGlow(ox, oy, 34, '#7fe0ff', .9); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ox, oy, 7, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#7fe0ff'; ctx.globalAlpha = .25 * k; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 62, 0, TAU); ctx.stroke(); ctx.restore(); }
  if (G.mark > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const e of G.enemies) if (!e.dead) { ctx.strokeStyle = '#ff7ac8'; ctx.globalAlpha = .7; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.rad * 1.4, 0, TAU); ctx.stroke(); } ctx.restore(); }
};
Visual13.secHud = function (p) { const id = Save.data.loadout.sec || 'none'; if (id === 'none') return []; return [[SECS[id].name, 'R', p.secCd || 0, p.secMax || SECS[id].cd, SECS[id].c]]; };

// ===== hangar: piloto e secundaria =====
Screens.hangarGuard = function (g) {
  const t = World.t, G0 = GUARDS[g]; txt('HANGAR', W / 2, 26, 42, '#fff', 'center'); txt(Screens.stars(), W - 40, 36, 30, '#ffcf6b', 'right');
  UI.panel(70, 118, 580, 416, { r: 22 }); txt(G0.name, 100, 136, 38, G0.c, 'left', 900); txt('guardião liberto, agora a seu lado', 100, 184, 17, '#cdb8ff', 'left', 700);
  const rows = [['Arma: ' + WEAPONS[G0.w].name, WEAPONS[G0.w].desc], ['Especial (Q): ' + G0.sp, WEAPONS[G0.w].specDesc], ['Característica', G0.st], ['Esquiva e pulso', 'Iguais aos do Olienzinho.']];
  rows.forEach(([a, b], i) => { const y = 232 + i * 62; ctx.fillStyle = i < 2 ? G0.c : '#7fe0a0'; ctx.beginPath(); ctx.arc(110, y + 12, 6, 0, TAU); ctx.fill(); txt(a, 130, y, 21, '#fff', 'left', 800); UI.wrap(b, 130, y + 26, 490, 20, 15, '#cdb8ff'); });
  UI.panel(700, 92, 520, 430, { r: 24 }); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(960, 300, 230, G0.c, .4); ctx.restore();
  Art.guardian(960, 300 + Math.sin(t * 1.6) * 8, { guard: WEAPONS[G0.w] ? 'g_' + g : 'g_C', vx: Math.sin(t * .8) * 80, t, scale: 1.9, lookx: clamp((Input.mouse.x - 960) / 400, -1, 1), looky: clamp((Input.mouse.y - 300) / 400, -1, 1), blinkT: Screens.blinkAt(t) });
  txt(G0.name, 960, 440, 30, '#fff', 'center'); txt('liberado ao derrotar o chefe do setor', 960, 482, 16, '#7fe0a0', 'center', 800);
  if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); }
};
{
  const ha = Screens.hangar;
  Screens.hangar = function () {
    const ld = Save.data.loadout, ch = ld.char || 'olien'; let idx = PILOTS.indexOf(ch); if (idx < 0) idx = 0;
    if (GUARDS[ch] && GUARDS[ch].ok()) { this.hangarGuard(ch); }
    else ha.call(this);
    const nm = ch === 'olien' ? 'OLIENZINHO' : ch === 'orbi' ? 'ORBI' : GUARDS[ch].name;
    if (UI.button('pilot', 70, 36, 220, 40, 'PILOTO: ' + nm + ' ▸', { size: 14 })) { let n = (idx + 1) % PILOTS.length, k = 0; while (!Visual13.pilotOk(PILOTS[n]) && k++ < 8) n = (n + 1) % PILOTS.length; ld.char = PILOTS[n]; Save.save(); Snd.play('uiSelect'); }
    { const lk = []; if (!Save.data.cleared[5]) lk.push('Orbi: derrote o Vazio (fase 6)'); if (!Save.data.cleared[9]) lk.push('Guardiões: zere as 10 fases'); if (lk.length) txt('🔒 ' + lk.join('  •  '), 70, 82, 13, '#ffcf6b', 'left', 800); }
    const sc = ld.sec || 'none', ids = Object.keys(SECS);
    if (UI.button('sec', 780, 36, 210, 40, 'SECUNDÁRIA: ' + SECS[sc].name.split(' ')[0], { size: 13, color: sc !== 'none' ? '#9a63ff' : undefined })) { ld.sec = ids[(ids.indexOf(sc) + 1) % ids.length]; Save.save(); Snd.play('uiSelect'); }
    if (sc !== 'none') txt('R: ' + SECS[sc].desc, 890, 82, 13, SECS[sc].c, 'center', 800); else txt('Escolha uma arma secundária (tecla R)', 890, 82, 13, '#8a7fb0', 'center', 700);
  };
}
{ const os = Visual8.onStart; Visual8.onStart = function () { os.call(this); Visual13.mines = []; G.barrier = null; G.mark = 0; if (G.player) G.player.secCd = 0; }; }
