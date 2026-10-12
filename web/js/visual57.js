'use strict';
// ---------- 57: retratos com mais expressoes (boca por silaba, riso, choro) e avisos visuais unicos antes dos golpes de cada chefe ----------
const Visual57 = {};

// ---------- retratos: boca falando por silaba, riso e choro ----------
{
  const syl = t => { const e = .5 + .5 * Math.sin(t * 3.3), v = Math.abs(Math.sin(t * 13.5)); return clamp(v * (.35 + e * .65), 0, 1); };
  Visual57.syl = syl;
  for (const who of ['O', 'B']) {
    const f = Portraits['face_' + who];
    Portraits['face_' + who] = function (mood, t, talk) {
      const laugh = mood === 'laugh', cry = mood === 'cry';
      if (laugh || cry) ctx.translate(0, laugh ? Math.abs(Math.sin(t * 14)) * -5 : Math.sin(t * 22) * 1.2);
      f.call(this, laugh ? 'happy' : cry ? 'sad' : mood, t, talk || laugh);
      if (who === 'O') {
        // a boca do Olienzinho nasce aqui: abre conforme a silaba, vira sorriso no riso e tremida no choro
        ctx.save(); ctx.lineCap = 'round'; const my = 46, o = talk || laugh ? syl(t) : 0;
        if (o > .08) { ctx.fillStyle = '#2a0b4a'; ctx.beginPath(); ctx.ellipse(0, my, 11 + o * 10, 4 + o * 17, 0, 0, 7); ctx.fill(); if (o > .45) { ctx.fillStyle = '#ff7aa8'; ctx.beginPath(); ctx.ellipse(0, my + 5 + o * 5, 6, 3 + o * 3, 0, 0, 7); ctx.fill(); } }
        else if (mood !== 'happy' && !laugh) { ctx.strokeStyle = '#2a0b4a'; ctx.lineWidth = 5; ctx.beginPath(); if (mood === 'sad' || mood === 'worry' || cry) ctx.arc(0, my + 12, 12, Math.PI * 1.15, Math.PI * 1.85); else ctx.arc(0, my - 6, 12, .25, Math.PI - .25); ctx.stroke(); }
        if (cry) { ctx.fillStyle = 'rgba(150,210,255,.9)'; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(s * 32, 6 + ((t * 70 + i * 30) % 60), 4, 7, 0, 0, 7); ctx.fill(); } }
        if (laugh) { ctx.strokeStyle = '#2a0b4a'; ctx.lineWidth = 4; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 58, -18); ctx.lineTo(s * 70, -26); ctx.stroke(); } }
        ctx.restore();
      } else if (cry) {
        ctx.save(); ctx.fillStyle = 'rgba(190,235,255,.95)'; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(s * 26, 6 + ((t * 70 + i * 32) % 62), 4, 7, 0, 0, 7); ctx.fill(); } ctx.restore();
      }
    };
  }
  // estrelinhas de alegria em volta do retrato quando ri
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o = {}) {
    pd.call(this, who, x, y, size, o);
    if (o.mood === 'laugh' && size >= 60) { const t = o.t ?? World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.57, r = size * .62; drawGlow(x + Math.cos(a) * r, y + Math.sin(a) * r * .8, size * .09, '#ffe9a8', .8); } ctx.restore(); }
  };
}

// ---------- avisos de golpe unicos por chefe ----------
{
  const tk = Boss.prototype.tick;
  Boss.prototype.tick = function (k, dt, every) {
    const r = tk.call(this, k, dt, every); const v = this.cd[k];
    if (v !== undefined && every > .6 && this.state === 'fight') { (this.tele || (this.tele = {}))[k] = v < .55 && v > 0 ? 1 - v / .55 : 0; }
    return r;
  };
  const tp = b => { let m = 0; if (b.tele) for (const k in b.tele) if (b.tele[k] > m) m = b.tele[k]; return m; };
  const hexp = (x, y, r, rot) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i * TAU / 6; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); };
  const SIG = {
    MotherShip(b, p, t) { ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { const r = 190 - p * 110 + i * 34; ctx.globalAlpha = p * (.9 - i * .25); hexp(b.x, b.y, r, t * .8 + i); ctx.stroke(); } },
    RockGolem(b, p, t) { ctx.fillStyle = '#d8c09a'; for (let i = 0; i < 9; i++) { const x = b.x + (i - 4) * 70 + Math.sin(i * 9) * 20, y = H - 10 - Math.abs(Math.sin(t * 20 + i)) * 26 * p; ctx.globalAlpha = p * .8; ctx.fillRect(x, y, 10, 14 * p + 4); } ctx.strokeStyle = '#ffb06a'; ctx.lineWidth = 3; ctx.globalAlpha = p; ctx.beginPath(); ctx.moveTo(b.x - 70, b.y + 10); ctx.lineTo(b.x - 20 * p, b.y + 80 * p); ctx.lineTo(b.x + 60, b.y + 20); ctx.stroke(); },
    StormEye(b, p, t) { ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 3; ctx.globalAlpha = p; for (let i = 0; i < 6; i++) { const a = i * 1.047 + t * 3; let x = b.x + Math.cos(a) * 60, y = b.y + Math.sin(a) * 60; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 5; k++) { x += Math.cos(a) * 24 + (Math.random() - .5) * 20; y += Math.sin(a) * 24 + (Math.random() - .5) * 20; ctx.lineTo(x, y); } ctx.stroke(); } },
    SunGuardian(b, p, t) { drawGlow(b.x, b.y, 140 + 160 * p, '#ffcf5a', .5 * p); ctx.strokeStyle = '#fff1b0'; ctx.lineWidth = 3; ctx.globalAlpha = p; for (let i = 0; i < 16; i++) { const a = i * TAU / 16 + t, r0 = 90 + 40 * p, r1 = r0 + 40 + 120 * p * (i % 2 ? .5 : 1); ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); ctx.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1); ctx.stroke(); } },
    EchoBoss(b, p, t) { ctx.strokeStyle = '#c8a0ff'; ctx.lineWidth = 3; ctx.globalAlpha = p * .7; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(b.x + Math.sin(t * 9 + i) * 30 * i * p, b.y, 70 + i * 16, 50 + i * 10, 0, 0, TAU); ctx.stroke(); } },
    VoidBoss(b, p, t) { ctx.fillStyle = '#b98cff'; ctx.globalAlpha = p; for (let i = 0; i < 18; i++) { const a = i * 2.4 + t * 2, r = (1 - p) * 260 + 30 + (i % 3) * 14; ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r, 3, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#8a4aff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(b.x, b.y, 50 + 30 * p, 0, TAU); ctx.stroke(); },
    Herald(b, p, t) { ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3; ctx.globalAlpha = p * .8; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 90; for (let i = -2; i <= 2; i++) { const x = b.x + i * 120; ctx.beginPath(); ctx.moveTo(x, b.y + 40); ctx.lineTo(x + i * 20, H); ctx.stroke(); } ctx.setLineDash([]); },
    Leviathan(b, p, t) { ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const k = (p * 1.5 + i * .33) % 1; ctx.globalAlpha = (1 - k) * p; ctx.beginPath(); ctx.ellipse(b.x, b.y + 20, 60 + k * 220, 24 + k * 80, 0, 0, TAU); ctx.stroke(); } ctx.fillStyle = '#cdf6ff'; ctx.globalAlpha = p; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(b.x + Math.sin(i * 5) * 90, b.y + 60 - ((t * 120 + i * 40) % 160), 4, 0, TAU); ctx.fill(); } },
    Mirror(b, p, t) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = p * .8; for (let i = 0; i < 5; i++) { const a = i * 1.26 + t, r = 80 + i * 8; ctx.save(); ctx.translate(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(8, 0); ctx.lineTo(0, 14); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); ctx.restore(); } },
    Heart(b, p, t) { ctx.strokeStyle = '#ff7aa8'; ctx.lineWidth = 4; const k = Math.abs(Math.sin(p * Math.PI * 3)); ctx.globalAlpha = p; ctx.beginPath(); ctx.arc(b.x, b.y, 80 + k * 30 + p * 60, 0, TAU); ctx.stroke(); drawGlow(b.x, b.y, 120 + k * 40, '#ff4a8a', .35 * p); }
  };
  const CL = { MotherShip, RockGolem, StormEye, SunGuardian, EchoBoss, VoidBoss, Herald, Leviathan, Mirror, Heart };
  for (const name in SIG) {
    const C = CL[name], d = C.prototype.draw;
    C.prototype.draw = function () {
      d.call(this); if (QL() < 1 || this.state !== 'fight') return; const p = tp(this); if (p < .04) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; SIG[name](this, p, World.t); ctx.restore();
    };
  }
}

// ---------- inimigos comuns: cardumes em onda, enxames e divisores (a partir do setor 2) ----------
{
  let busy = false;
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o = {}) {
    const e = se(type, x, y, o); if (busy || !e || o.nofx || !G.stage) return e;
    const st = G.stage.id, boss = G.boss && G.boss.state === 'fight';
    if (st < 2 || boss || G.enemies.length > 34 || type !== 'drone' && type !== 'bit') return e;
    busy = true;
    try {
      if (type === 'drone') {
        const r = Math.random();
        if (r < .26) { e.wv = 1; for (let i = 1; i <= 4; i++) { const s = se('drone', clamp(x + (i - 2.5) * 62, 40, W - 40), y - Math.abs(i - 2.5) * 34, { nofx: 1, wv: 1 }); s.ph = e.ph + i * .55; s.fr = e.fr; s.amp = e.amp; s.bx = clamp(x + (i - 2.5) * 62, 40, W - 40); } }
        else if (st >= 4 && r < .42) { e.split = 1; e.hp = e.maxHp = Math.ceil(e.hp * 1.4); }
      } else if (type === 'bit' && st >= 3 && Math.random() < .3) { for (let i = 0; i < 6; i++) se('bit', clamp(x + rand(-110, 110), 30, W - 30), y - rand(0, 90), { nofx: 1 }); }
    } finally { busy = false; }
    return e;
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e && !e.dead, x = e && e.x, y = e && e.y; const r = ke(e, by);
    if (was && e.dead && e.split && by && !busy) { busy = true; try { for (const s of [-1, 1]) { const b = se('bit', x + s * 16, y, { nofx: 1, xp: 0, coin: 0, score: 2, vx: s * 90 }); b.bx = b.x; b.hp = b.maxHp = 1; } } finally { busy = false; } burst(x, y, ['#ffe9a8', e.glow || '#fff'], 10, 220, 4); }
    return r;
  };
  const ae = Art.enemy;
  Art.enemy = function (e) {
    ae.call(this, e); if (QL() < 1 || (!e.split && !e.wv)) return; const t = World.t;
    ctx.save(); ctx.translate(e.x, e.y); if (e.split) { ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 20; ctx.beginPath(); ctx.arc(0, 0, e.rad + 7, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(0, -e.rad); ctx.lineTo(0, e.rad); ctx.stroke(); }
    else { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35; ctx.fillStyle = e.glow || '#fff'; ctx.beginPath(); ctx.ellipse(0, -e.rad - 6, 4, 12 + Math.sin(t * 9 + e.ph) * 3, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
}
