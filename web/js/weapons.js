'use strict';
// ---------- armas, habilidades especiais, esquiva e skins ----------
function mkBullet(p, x, y, ang, speed, dmgMul, o = {}) {
  const crit = Math.random() < p.crit;
  const b = { x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, dmg: p.dmg * dmgMul * (crit ? p.critMul : 1) * (p.od ? 1.5 : 1), bounce: p.ricochet || 0, crit, pierce: p.pierce, hits: [], c: crit ? '#ffe9a8' : WEAPONS[p.weapon].c };
  Object.assign(b, o); G.pb.push(b); return b;
}
const muzzle = (p, c = '#e2d4ff', r = 18) => G.parts.push({ k: 'flash', x: p.x, y: p.y - 34, vx: 0, vy: 0, life: .07, max: .07, r, c, drag: 1 });

const WEAPONS = {
  violet: {
    name: 'Tiro Violeta', desc: 'Equilibrado e preciso. Rajadas rápidas de luz.', c: '#b98cff', price: 0, delay: 1,
    special: 'starfall', specName: 'Chuva de Estrelas', specDesc: 'Dispara 20 estrelas que perseguem os inimigos.',
    fire(p) {
      const n = p.shots;
      for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; mkBullet(p, p.x + k * 14, p.y - 36, -Math.PI / 2 + k * .09, 920, 1); }
      muzzle(p); Snd.play('shoot', { lv: n - 1, pan: Snd.panX(p.x) * .5 });
    },
  },
  fan: {
    name: 'Leque Solar', desc: 'Vários tiros em leque. Devastador de perto.', c: '#ffb340', price: 300, delay: 1.35,
    special: 'burst', specName: 'Explosão Solar', specDesc: 'Dois anéis de tiros em todas as direções.',
    fire(p) {
      const n = 5 + (p.shots - 1) * 2;
      for (let i = 0; i < n; i++) mkBullet(p, p.x, p.y - 30, -Math.PI / 2 + (i / (n - 1) - .5) * .95, 830, .62, { life: .52 });
      muzzle(p, '#ffe9a8', 26); Snd.play('shoot', { lv: 0, wpn: 'fan', pan: Snd.panX(p.x) * .5 });
    },
  },
  laser: {
    name: 'Laser Prisma', desc: 'Feixe contínuo que atravessa tudo.', c: '#7fe0ff', price: 400, delay: .3, beam: true,
    special: 'mega', specName: 'Raio Total', specDesc: 'Um feixe gigante por quase 2 segundos.',
    fire(p) { laserTick(p); },
  },
  cannon: {
    name: 'Canhão Pesado', desc: 'Tiro lento e enorme que explode em área.', c: '#ff7a4a', price: 500, delay: 2.6,
    special: 'bomb', specName: 'Bomba Estelar', specDesc: 'Uma bomba gigante que destrói tudo em volta.',
    fire(p) {
      const n = p.shots;
      mkBullet(p, p.x, p.y - 44, -Math.PI / 2, 640, 5.5, { kind: 'cannon', r: 22, aoe: 125, life: 1.4, pierce: 0 });
      for (let i = 1; i < n; i++) { const s = i % 2 ? -1 : 1, k = Math.ceil(i / 2); mkBullet(p, p.x + s * 22 * k, p.y - 30, -Math.PI / 2 + s * .1 * k, 600, 2.4, { kind: 'cannon', r: 12, aoe: 70, life: 1.4, pierce: 0 }); }
      muzzle(p, '#ffb340', 34); shake(2); Snd.play('cannon', { pan: Snd.panX(p.x) * .5 });
    },
  },
};
const WEAPON_ORDER = ['violet', 'fan', 'laser', 'cannon'];

function laserTick(p) {
  const n = p.shots, beams = [];
  for (let i = 0; i < n; i++) beams.push(p.x + (i - (n - 1) / 2) * 34);
  p.beams = beams; p.beamT = .1;
  for (const bx of beams) {
    const crit = Math.random() < p.crit, dmg = p.dmg * .5 * (crit ? p.critMul : 1);
    for (const e of G.enemies) if (!e.dead && e.y < p.y - 30 && Math.abs(e.x - bx) < e.rad + 14) beamHit(e, dmg, crit);
    const bo = G.boss;
    if (bo && bo.targetable()) for (let yy = p.y - 60; yy > 20; yy -= 36) if (bo.hitTest(bx, yy, 12)) { bo.damage(dmg, crit); break; }
  }
  Snd.play('laser', { pan: Snd.panX(p.x) * .5 });
}
function beamHit(e, dmg, crit) {
  if (e.shield > 0) { e.shield -= dmg; e.hit = .06; sparks(e.x, e.y + e.rad * .6, '#7fe0ff', 3); return; }
  damageEnemy(e, dmg, crit);
}

// habilidade especial de cada arma
const SPECIALS = {
  starfall(p) {
    const d = p.dmg * (p.specPow || 1);
    for (let i = 0; i < 20; i++) {
      const a = -Math.PI / 2 + (i / 19 - .5) * 2.4;
      G.pb.push({ kind: 'missile', star: true, x: p.x, y: p.y - 30, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, dmg: d * 2.2, pierce: 0, hits: [], life: 3.2, speed: 780, target: null, c: '#ffe9a8' });
    }
    flashScreen(.15);
  },
  burst(p) {
    const d = p.dmg * (p.specPow || 1);
    const ringOf = (n, sp, off) => { for (let i = 0; i < n; i++) G.pb.push({ x: p.x, y: p.y, vx: Math.cos(off + i / n * TAU) * sp, vy: Math.sin(off + i / n * TAU) * sp, dmg: d * 1.2, crit: false, pierce: 1, hits: [], c: '#ffb340', life: .95 }); };
    ringOf(36, 580, 0); shockwave(p.x, p.y, 280, '#ffb340');
    G.timers.push({ t: .35, fn: () => { if (G.player && !G.player.dead) { ringOf(36, 540, .09); shockwave(G.player.x, G.player.y, 320, '#ffe9a8'); Snd.play('explode', { size: .8 }); } } });
  },
  mega(p) { G.mega = { t: 0, dur: 1.9, tick: 0 }; Snd.play('beam', { dur: 1.9 }); },
  bomb(p) {
    G.pb.push({ kind: 'bomb', x: p.x, y: p.y - 40, vx: 0, vy: -420, dmg: p.dmg * (p.specPow || 1) * 14, pierce: 0, hits: [], life: .75, r: 26, c: '#ff7a4a' });
  },
};

function useSpecial() {
  const p = G.player;
  if (p.specCd > 0 || p.dead) return;
  p.specCd = p.specCdMax;
  SPECIALS[WEAPONS[p.weapon].special](p);
  Snd.play('specialFire', { w: p.weapon }); shake(8); p.inv = Math.max(p.inv, .4);
}

function bombBoom(b) {
  const R = 270, p = G.player;
  burst(b.x, b.y, ['#ff7a4a', '#ffd36a', '#ffffff'], 60, 620, 8); shockwave(b.x, b.y, R, '#ffb340'); shockwave(b.x, b.y, R * .6, '#ffffff');
  Snd.play('explode', { size: 2 }); shake(18); flashScreen(.4); G.hitstop = Math.max(G.hitstop || 0, .07);
  for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - b.x, e.y - b.y) < R + e.rad) damageEnemy(e, b.dmg, false);
  const bo = G.boss;
  if (bo && bo.targetable() && Math.hypot(bo.x - b.x, bo.y - b.y) < R + 90) bo.damage(Math.min(b.dmg * 1.4, bo.maxHp * .07));
  for (const q of G.eb) if (!q.dead && Math.hypot(q.x - b.x, q.y - b.y) < R) q.dead = true;
  b.dead = true;
}

function megaTick(p) {
  const d = p.dmg * (p.specPow || 1) * 2.4;
  for (const e of G.enemies) if (!e.dead && e.y < p.y && Math.abs(e.x - p.x) < 90 + e.rad) beamHit(e, d, false);
  const bo = G.boss;
  if (bo && bo.targetable()) for (let yy = p.y - 40; yy > 20; yy -= 40) if (bo.hitTest(p.x - 70, yy, 12) || bo.hitTest(p.x, yy, 12) || bo.hitTest(p.x + 70, yy, 12)) { bo.damage(d * .7); break; }
  for (const q of G.eb) if (!q.dead && q.y < p.y && Math.abs(q.x - p.x) < 100) { q.dead = true; G.parts.push({ x: q.x, y: q.y, vx: 0, vy: 0, life: .25, max: .25, r: 7, c: '#7fe0ff', drag: 1 }); }
  if (Math.random() < .5) shake(3);
}

// esquiva (dash)
function tryDash(ax, ay) {
  const p = G.player;
  if (p.dashCd > 0 || p.dashT > 0 || p.dead) return;
  let dx = ax, dy = ay;
  if (!dx && !dy) { dx = 0; dy = -1; }
  const m = Math.hypot(dx, dy); dx /= m; dy /= m;
  p.dashT = .2; p.dashDir = [dx, dy]; p.dashCd = p.dashCdMax; p.inv = Math.max(p.inv, .34);
  Save.data.stats.dashes = (Save.data.stats.dashes || 0) + 1;
  shockwave(p.x, p.y, 90, '#7fe0ff'); Snd.play('dash');
}

// ---------- skins do Olienzinho ----------
const SKIN_DEFAULT = { g0: '#c6a6ff', g1: '#9a63ff', g2: '#5326b8', fin: '#5b2fc0', nozzle: '#3f2290', stripe: '#e2d4ff', glow: '#8b4dff' };
const SKINS = [
  { id: 'violet', name: 'Violeta Clássico', how: 'Já é seu', pal: SKIN_DEFAULT, ok: () => true },
  { id: 'rose', name: 'Nebulosa', how: 'Vença a fase 2', pal: { g0: '#ffd0ea', g1: '#ff7ac8', g2: '#a8246e', fin: '#c2307e', nozzle: '#6a1448', stripe: '#fff0f8', glow: '#ff5ab8' }, ok: () => !!Save.data.cleared[1] },
  { id: 'cyan', name: 'Cristal', how: 'Alcance combo 30', pal: { g0: '#d6f6ff', g1: '#5fd0ff', g2: '#1a68b0', fin: '#2a8ad0', nozzle: '#124a8a', stripe: '#f0fcff', glow: '#33c4ff' }, ok: () => !!Save.data.ach.combo30 },
  { id: 'solar', name: 'Solar', how: 'Vença a fase 4', pal: { g0: '#fff0c0', g1: '#ffb340', g2: '#c8481a', fin: '#d8601e', nozzle: '#7a2a0a', stripe: '#fff6dc', glow: '#ff8a1f' }, ok: () => !!Save.data.cleared[3] },
  { id: 'shadow', name: 'Sombra', how: 'Chegue à onda 8 no Infinito', pal: { g0: '#8a78b8', g1: '#4a3a7a', g2: '#150c34', fin: '#241450', nozzle: '#0a0420', stripe: '#b8a8e8', glow: '#6a3ad8' }, ok: () => (Save.data.bestWave || 0) >= 8 },
  { id: 'gold', name: 'Dourado', how: 'Ache os 6 fragmentos escondidos', pal: { g0: '#fffbe0', g1: '#ffd84a', g2: '#b8860a', fin: '#d4a017', nozzle: '#6a4a08', stripe: '#fffdf0', glow: '#ffd36a' }, ok: () => Save.data.frags.filter(Boolean).length >= 6 },
];
const skinOf = id => SKINS.find(s => s.id === id) || SKINS[0];
