'use strict';
// ---------- 3 armas novas, sinergias de upgrades e Jogo Novo+ ----------
const Visual11 = {};

// ===== armas novas =====
WEAPONS.boomerang = {
  name: 'Bumerangue Lunar', desc: 'Lâmina que vai e volta, acertando duas vezes.', c: '#ffe9a8', price: 600, delay: 1.35,
  special: 'blades', specName: 'Chuva de Lâminas', specDesc: 'Sete bumerangues em leque.',
  fire(p) {
    const n = Math.min(3, p.shots);
    for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; mkBullet(p, p.x + k * 18, p.y - 30, -Math.PI / 2 + k * .32, 720, 3.0, { kind: 'boom', bt: 0, pierce: 99, r: 22, life: 3.6 }); }
    muzzle(p, '#ffe9a8', 22); Snd.play('shoot', { lv: 0, wpn: 'fan', pan: Snd.panX(p.x) * .5 });
  },
};
WEAPONS.chain = {
  name: 'Raio Voltaico', desc: 'Raio que salta de inimigo em inimigo.', c: '#9fe8ff', price: 700, delay: 1.1,
  special: 'storm', specName: 'Tempestade', specDesc: 'Raios caem sobre todos os inimigos por 2 segundos.',
  fire(p) { Visual11.zapFrom(p); },
};
WEAPONS.flame = {
  name: 'Lança-Chamas', desc: 'Jato de fogo curto que queima os inimigos.', c: '#ff8a30', price: 800, delay: .5,
  special: 'nova', specName: 'Onda Ardente', specDesc: 'Um anel de fogo se espalha em todas as direções.',
  fire(p) {
    for (let i = 0; i < 3 + (p.shots - 1); i++) mkBullet(p, p.x + rand(-12, 12), p.y - 34, -Math.PI / 2 + rand(-.24, .24), rand(520, 680), .62, { kind: 'flame', life: .52, l0: .52, pierce: 99, r: 15, c: '#ff8a30' });
    if (Math.random() < .5) Snd.play('laser', { pan: Snd.panX(p.x) * .5 });
  },
};
WEAPON_ORDER.push('boomerang', 'chain', 'flame');
SPECIALS.blades = function (p) { const d = p.specPow || 1; for (let i = 0; i < 7; i++) mkBullet(p, p.x, p.y - 20, -Math.PI / 2 + (i - 3) * .36, 620, 3.2 * d, { kind: 'boom', bt: 0, pierce: 99, r: 26, life: 3.8 }); flashScreen(.1); };
SPECIALS.storm = function (p) { G.storm = { t: 0, dur: 2.4, tk: 0 }; Snd.play('beam', { dur: 2.4 }); };
SPECIALS.nova = function (p) { const d = p.specPow || 1; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; G.pb.push({ x: p.x, y: p.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, dmg: p.dmg * 1.5 * d, crit: false, pierce: 99, hits: [], c: '#ff8a30', kind: 'flame', life: .8, l0: .8, r: 20, w: 'flame' }); } shockwave(p.x, p.y, 360, '#ff8a30'); shockwave(p.x, p.y, 220, '#ffe9a8'); };

Visual11.zapFrom = function (p) {
  const bo = G.boss, cand = G.enemies.filter(e => !e.dead && e.y < p.y - 10 && e.y > 10 && Math.hypot(e.x - p.x, e.y - p.y) < 640 && e.type !== 'rod');
  cand.sort((a, b) => (Math.hypot(a.x - p.x, a.y - p.y) + Math.abs(a.x - p.x) * .5) - (Math.hypot(b.x - p.x, b.y - p.y) + Math.abs(b.x - p.x) * .5));
  const bolt = (x1, y1, x2, y2) => G.parts.push({ k: 'bolt', x: x1, y: y1, x2, y2, vx: 0, vy: 0, life: .2, max: .2, r: 3, c: '#9fe8ff', drag: 1 });
  let sx = p.x, sy = p.y - 30; const dmg = p.dmg * .42, crit = Math.random() < p.crit;
  let first = cand[0] || null, bossFirst = false;
  if (bo && bo.targetable() && bo.y < p.y && (!first || Math.hypot(bo.x - p.x, bo.y - p.y) < Math.hypot(first.x - p.x, first.y - p.y) + 120)) bossFirst = true;
  if (bossFirst) { bolt(sx, sy, bo.x, bo.y + 30); bo.damage(dmg * 1.3 * Visual5.weakMul(bo, bo.x, bo.y + 30, 40), crit); sparks(bo.x, bo.y + 30, '#9fe8ff', 6, 300); }
  else if (first) {
    const hit = [first], jumps = 1 + (G.upCounts.chain || 0) + (p.shots - 1);
    bolt(sx, sy, first.x, first.y); damageEnemy(first, dmg * (crit ? p.critMul : 1), crit, true); let cur = first;
    for (let j = 0; j < jumps; j++) { let nx = null, nd = 240; for (const e of G.enemies) if (!e.dead && !hit.includes(e) && e.type !== 'rod' && Math.hypot(e.x - cur.x, e.y - cur.y) < nd) { nd = Math.hypot(e.x - cur.x, e.y - cur.y); nx = e; } if (!nx) break; bolt(cur.x, cur.y, nx.x, nx.y); damageEnemy(nx, dmg * .8, false, true); hit.push(nx); cur = nx; }
  } else bolt(sx, sy, sx + rand(-40, 40), sy - 260);
  Snd.play('laser', { pan: Snd.panX(p.x) * .5 });
};

Visual11.update = function (dt) {
  const p = G.player; if (!p) return;
  for (const b of G.pb) if (b.kind === 'boom' && !b.dead) {
    b.bt += dt;
    if (!b.back) { b.vx *= 1 - 2.2 * dt; b.vy *= 1 - 2.2 * dt; if (b.bt > .62) { b.back = true; b.hits = []; } }
    else { const tx = p.x - b.x, ty = p.y - b.y, d = Math.hypot(tx, ty) || 1; b.vx += (tx / d * 800 - b.vx) * Math.min(1, 7 * dt); b.vy += (ty / d * 800 - b.vy) * Math.min(1, 7 * dt); if (d < 34) b.dead = true; }
  }
  for (const e of G.enemies) if (e.burn > 0 && !e.dead) {
    e.burn -= dt; e.burnT = (e.burnT ?? .4) - dt;
    if (e.burnT <= 0) { e.burnT = .4; damageEnemy(e, e.burnDmg || .3, false, true); } if (Math.random() < dt * 14) G.parts.push({ x: e.x + rand(-e.rad, e.rad) * .6, y: e.y + rand(-e.rad, e.rad) * .4, vx: rand(-10, 10), vy: -rand(30, 90), life: .4, max: .4, r: rand(3, 6), c: Math.random() < .5 ? '#ff8a30' : '#ffe9a8', drag: 1 });
  }
  const st = G.storm; if (st) {
    st.t += dt; st.tk -= dt;
    if (st.tk <= 0) {
      st.tk = .11; const d = p.dmg * 1.5 * (p.specPow || 1), tg = G.enemies.filter(e => !e.dead && e.y > 0 && e.type !== 'rod'); const bo = G.boss;
      for (let i = 0; i < 3; i++) { const e = pick(tg.length ? tg : [null]); if (e) { G.parts.push({ k: 'bolt', x: e.x + rand(-60, 60), y: 0, x2: e.x, y2: e.y, vx: 0, vy: 0, life: .2, max: .2, r: 3, c: '#e8fbff', drag: 1 }); damageEnemy(e, d, false, true); } }
      if (bo && bo.targetable()) { const bx = bo.x + rand(-60, 60); G.parts.push({ k: 'bolt', x: bx, y: 0, x2: bx, y2: bo.y + 30, vx: 0, vy: 0, life: .2, max: .2, r: 3, c: '#e8fbff', drag: 1 }); bo.damage(d * .6); }
      shake(3); if (Math.random() < .4) Snd.play('lightning');
    }
    if (st.t > st.dur) G.storm = null;
  }
};
{
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    const p = G.player; if (p && p.weapon === 'flame' && !chained && e.type !== 'rod' && e.type !== 'boulder') { e.burn = 2.4; e.burnDmg = p.dmg * .22; }
    return de(e, dmg, crit, chained);
  };
  const ap = Art.pbullet;
  Art.pbullet = function (b) {
    if (b.kind === 'boom') {
      const t = World.t * 14 + b.x * .01; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(t); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 50, '#ffe9a8', .7); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff6d0'; ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, b.r + 6, -1.2, 1.2); ctx.arc(-6, 0, b.r - 2, 1.0, -1.0, true); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); return;
    }
    if (b.kind === 'flame') {
      const k = 1 - clamp((b.life || 0) / (b.l0 || .38), 0, 1), r = 12 + k * 20; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k * .8;
      drawGlow(b.x, b.y, r * 2.2, k < .5 ? '#ffd36a' : '#ff6a1a', .9); drawGlow(b.x, b.y, r, '#ffffff', (1 - k) * .6); ctx.restore(); return;
    }
    return ap.call(this, b);
  };
  const wg = Screens.weaponGlyph;
  Screens.weaponGlyph = function (id, x, y, c, t) {
    if (!['boomerang', 'chain', 'flame'].includes(id)) return wg.call(this, id, x, y, c, t);
    ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 44, c, .5); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = c; ctx.fillStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 5;
    if (id === 'boomerang') { ctx.rotate(t * 3); ctx.beginPath(); ctx.arc(0, 0, 20, -1.2, 1.2); ctx.stroke(); }
    else if (id === 'chain') { ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(6, -6); ctx.lineTo(-6, 2); ctx.lineTo(8, 24); ctx.stroke(); }
    else { for (let i = -1; i <= 1; i++) { ctx.fillStyle = i ? '#ff8a30' : '#ffe9a8'; ctx.beginPath(); ctx.ellipse(i * 11, 4 - Math.abs(i) * 4 + Math.sin(t * 8 + i) * 2, 7, 15, 0, 0, TAU); ctx.fill(); } }
    ctx.restore();
  };
}

// ===== sinergias =====
const TAGS = {
  elec: { name: 'ELÉTRICO', c: '#9fe8ff', ids: ['chain', 'combochg', 'crit', 'spec'], b: ['+10% de crítico', '+5% de crítico e raios saltam mais'] },
  fire: { name: 'FOGO', c: '#ff8a30', ids: ['missile', 'overdrive', 'dmg', 'pierce'], b: ['+10% de dano', '+10% de dano'] },
  guard: { name: 'GUARDIÃO', c: '#7fe0a0', ids: ['shield', 'reflect', 'hp', 'vamp', 'heal'], b: ['+1 de vida máxima', '+1 de vida e escudo recarrega mais rápido'] },
  flow: { name: 'FLUXO', c: '#b98cff', ids: ['rate', 'speed', 'dash', 'multi', 'magnet'], b: ['+10% de cadência', '+10% de cadência e +8% de velocidade'] },
};
Visual11.syn = function () { const o = {}; for (const k in TAGS) { const n = TAGS[k].ids.filter(id => (G.upCounts[id] || 0) > 0).length; o[k] = n >= 5 ? 2 : n >= 3 ? 1 : 0; } return o; };
Visual11.synergyStats = function (p) {
  const s = Visual11.syn();
  if (s.elec >= 1) p.crit += .1; if (s.elec >= 2) { p.crit += .05; p.chainL = (p.chainL || 0) + 2; }
  if (s.fire >= 1) p.dmg *= 1.1; if (s.fire >= 2) p.dmg *= 1.1;
  if (s.guard >= 1) p.maxHp += 1; if (s.guard >= 2) { p.maxHp += 1; p.shieldCd *= .6; }
  if (s.flow >= 1) p.fireDelay *= .9; if (s.flow >= 2) { p.fireDelay *= .9; p.speed *= 1.08; }
};
Visual11.chipDraw = function (id, cx, y) {
  const cur = Visual11.syn(); let x = cx;
  const hit = Object.keys(TAGS).filter(k => TAGS[k].ids.includes(id)); if (!hit.length) return;
  const w = hit.map(k => 18 + TAGS[k].name.length * 8).reduce((a, b) => a + b + 8, -8); x = cx - w / 2;
  for (const k of hit) {
    const T = TAGS[k], n = T.ids.filter(q => (G.upCounts[q] || 0) > 0).length, n2 = n + ((G.upCounts[id] || 0) > 0 ? 0 : 1), up = (n2 >= 5 ? 2 : n2 >= 3 ? 1 : 0) > cur[k], cw = 18 + T.name.length * 8;
    ctx.save(); ctx.fillStyle = up ? T.c : 'rgba(255,255,255,.1)'; ctx.strokeStyle = T.c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x, y, cw, 20, 10); ctx.fill(); ctx.stroke();
    txt(T.name + (up ? '!' : ''), x + cw / 2, y + 10, 11, up ? '#10062a' : T.c, 'center', 900, 'middle'); ctx.restore(); x += cw + 8;
  }
};
Visual11.hud = function () {
  if (G.state !== 'play') return; const s = Visual11.syn(); let x = 24;
  const lines = Object.keys(TAGS).filter(k => s[k] > 0); if (G.ngp) txt('JOGO NOVO+', 24, 120, 12, '#ffcf6b', 'left', 900);
  lines.forEach((k, i) => { txt(TAGS[k].name + ' ' + (s[k] > 1 ? 'II' : 'I'), 24 + i * 100, G.ngp ? 134 : 120, 12, TAGS[k].c, 'left', 900); });
};

// ===== Jogo Novo+ =====
RELICS.push(
  { id: 'scar', name: 'Cicatriz Estelar', icon: 'dmg', ng: true, desc: '+8% de dano a cada 25 inimigos derrotados na fase (até +48%).' },
  { id: 'goldecho', name: 'Eco Dourado', icon: 'lucky', ng: true, desc: '+35% de estrelas e +25% de pontos.' },
  { id: 'voideye', name: 'Olho do Vazio', icon: 'crit', ng: true, desc: 'Pontos fracos maiores e +30% de dano neles.' },
);
{
  const rs = Visual5.relicStats;
  Visual5.relicStats = function (p) {
    rs.call(this, p);
    if (G.relic === 'scar') p.dmg *= 1 + .08 * Math.min(6, Math.floor((G.kills || 0) / 25));
    if (G.relic === 'goldecho') p.coinMul *= 1.35;
    Visual11.synergyStats(p);
  };
  const w0 = Visual5.weak; Visual5.weak = function (b) { const w = w0.call(this, b); if (G.relic === 'voideye') w.r *= 1.5; return w; };
  const wm = Visual5.weakMul; Visual5.weakMul = function (b, x, y, r) { const m = wm.call(this, b, x, y, r); return m > 1 && G.relic === 'voideye' ? m * 1.3 : m; };
  { const ke = killEnemy; killEnemy = function (e, by) { const w = e.counted; ke(e, by); if (!w && e.counted && by && G.relic === 'scar' && G.kills % 25 === 0) recalcStats(G.player); }; }
  const bu = Boss.prototype.update; Boss.prototype.update = function (dt) { if (!this._ngd) { this._ngd = true; if (Save.data.ngpOn) { this.maxHp = Math.round(this.maxHp * 1.4); this.hp = this.maxHp; } } bu.call(this, dt); };
  const dl = Game.startStage; Game.startStage = function (idx, opts) { dl.call(this, idx, opts); G.ngp = !!Save.data.ngpOn; };
  const mo = Visual6.menuOverlay;
  Visual6.menuOverlay = function (s) {
    mo.call(this, s);
  };
  const en = Game.enter;
  Game.enter = function (idx, opts) {
    if (Save.data.ngpOn && idx === 0 && !(Save.data.seen && Save.data.seen.ngpIntro) && !this.noStory) {
      Save.data.seen = Save.data.seen || {}; Save.data.seen.ngpIntro = true; Save.save();
      return this.startStory([{ music: 'mystery' }, { who: 'N', text: 'O céu estava em paz. Mas o Vazio, mesmo vencido, deixou uma marca em cada estrela.' }, { who: 'B', mood: 'worry', text: 'Olienzinho... os mesmos setores estão tremendo de novo. E os inimigos parecem mais fortes.' }, { who: 'O', mood: 'determined', text: 'Então a gente acende tudo outra vez. Agora com tudo o que aprendemos.' }, { who: 'B', mood: 'happy', text: 'Eu estou com você. Sempre estive.' }, { title: 'JOGO NOVO+', sub: 'O CÉU REPETE' }], () => en.call(Game, idx, opts), { music: null });
    }
    return en.call(this, idx, opts);
  };
}
