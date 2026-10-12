'use strict';
// ferramenta de medicao (so carregada com ?perf=1): mede o tempo de cada etapa do quadro numa luta de chefe com armas fundidas e guardiao
const Perf = { acc: {}, n: 0, on: false };
Perf.wrap = (obj, name, label) => { if (!obj || typeof obj[name] !== 'function') return; const f = obj[name]; obj[name] = function (...a) { if (!Perf.on) return f.apply(this, a); const t = performance.now(); const r = f.apply(this, a); Perf.acc[label] = (Perf.acc[label] || 0) + performance.now() - t; return r; }; };
Perf.setup = () => {
  if (Perf.ready) return; Perf.ready = true;
  Perf.wrap(Game, 'updatePlay', 'update'); Perf.wrap(Game, 'drawPlay', 'drawPlay'); Perf.wrap(Art, 'pbullet', 'pbullet'); Perf.wrap(Art, 'ebullet', 'ebullet'); Perf.wrap(Art, 'enemy', 'enemy');
  Perf.wrap(Visual, 'biome', 'biome'); Perf.wrap(World, 'draw', 'World.draw'); Perf.wrap(Visual13, 'draw', 'Visual13.draw'); Perf.wrap(Game, 'drawHud', 'hud'); Perf.wrap(Art, 'ship', 'ship');
  if (typeof VGL !== 'undefined' && VGL.draw) Perf.wrap(VGL, 'draw', 'VGL'); Perf.wrap(Visual16, 'drawFx', 'v16fx'); if (typeof Visual50 !== 'undefined') Perf.wrap(Visual50, 'draw', 'v50');
  Perf.wrap(Visual15, 'hudDraw', 'hudDraw'); Perf.wrap(Visual12, 'fg', 'fg'); Perf.wrap(Visual, 'overlay', 'overlay');
};
Perf.stress = async function (stageIdx, secs, extraParts) {
  Object.values(GUARDS).forEach(g => { g.ok = () => true; });
  Visual31.register('fan', 'laser'); Visual31.register('chain', 'flame'); Visual31.register('cannon', 'boomerang');
  Save.data.comp = { id: 'P' };
  Game.noStory = true; Game.startStage(stageIdx, { skipStory: true }); G.state = 'play';
  const p = G.player; p.weapon = 'fz_fan_laser'; recalcStats(p); p.hp = p.maxHp = 99; p.inv = 1e9; p.fireDelay = .06; p.shots = 5; p.buffs = p.buffs || {}; p.buffs.rapid = 1e9; p.dmg = 1;
  G.upCounts.shield = 2; p.shieldReady = true;
  G.t = G.stage.duration * .99; G.bossPending = true;
  await new Promise(r => setTimeout(r, 7000)); const b = G.boss; if (b) { b.hp = b.maxHp = 1e9; }
  Perf.setup(); Perf.acc = {}; Perf.n = 0; Perf.on = true; const gaps = []; let last = performance.now(), maxParts = 0, maxPb = 0, maxEb = 0;
  await new Promise(res => { const t0 = performance.now(); function f(t) { gaps.push(t - last); last = t; Perf.n++; maxParts = Math.max(maxParts, G.parts.length); maxPb = Math.max(maxPb, G.pb.length); maxEb = Math.max(maxEb, G.eb.length); p.inv = 1e9; p.hp = p.maxHp; if (extraParts && G.parts.length < extraParts) for (let i = 0; i < 60; i++) G.parts.push({ x: rand(0, W), y: rand(0, H), vx: rand(-80, 80), vy: rand(-80, 80), life: rand(.3, 1), max: 1, r: rand(2, 6), c: ['#ffb340', '#b98cff', '#7fe0ff'][i % 3], drag: 1 }); if (t - t0 < secs * 1000) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  Perf.on = false; gaps.shift(); const s = gaps.slice().sort((a, b) => a - b), avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const cpu = {}; for (const k in Perf.acc) cpu[k] = +(Perf.acc[k] / Perf.n).toFixed(2);
  return { boss: b && b.constructor.name, frames: gaps.length, fps: Math.round(1000 / avg), p95: Math.round(s[Math.floor(s.length * .95)]), p99: Math.round(s[Math.floor(s.length * .99)]), max: Math.round(s[s.length - 1]), maxParts, maxPb, maxEb, cpu };
};
