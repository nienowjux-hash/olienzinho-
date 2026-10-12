'use strict';
// ---------- 71: telas vazias com ilustracao, cenario que muda com o chefe, furias que transformam o corpo, ligacoes entre inimigos,
// dano visivel na nave, itens que saltam, despedida do chefe e fundos de dialogo ----------
const Visual71 = { dim: 0, shown: 0 };
const ok71 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h71 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 2. telas vazias: foguete olhando a lista ----------
{
  const lone = (x, y, msg) => { const t = World.t; ctx.save(); ctx.globalAlpha = .9; Art.ship(x, y + Math.sin(t * 1.6) * 6, { pal: SKIN_DEFAULT, t, scale: .75, vx: 0, lookx: Math.sin(t * .5) * .6, looky: .2, blinkT: Screens.blinkAt ? Screens.blinkAt(t) : 0, inv: 0, boost: .2, mood: 'worry' }); ctx.restore(); if (msg) txt(msg, x, y + 110, 15, '#cdb8ff', 'center', 700); };
  const rk = Screens.rank;
  Screens.rank = function () { const r = rk.apply(this, arguments); if (QL() >= 1 && !(Save.data.rank || []).length) lone(W / 2, 255, ''); return r; };
  const gl = Screens.gallery;
  Screens.gallery = function () { const r = gl.apply(this, arguments); return r; };
}

// ---------- 3. o cenario escurece e ganha a cor do chefe durante a luta ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); const b = G.boss, on = G.state === 'play' && b && b.state !== 'dying' && QL() >= 1; Visual71.dim += ((on ? 1 : 0) - Visual71.dim) * .03; if (Visual71.dim < .02) return;
    const c = b && ok71(b.col) ? b.col : '#8a4aff'; ctx.save(); ctx.fillStyle = 'rgba(4,0,16,' + (.28 * Visual71.dim) + ')'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * .35, H * .3, W / 2, H * .35, H * .95); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.globalAlpha = Visual71.dim; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12 * Visual71.dim * (.7 + .3 * Math.sin(World.t * 2)); if (b) drawGlow(b.x, b.y + 60, 520, c, .9); ctx.restore();
  };
}

// ---------- 4. furias: o corpo do chefe ganha espinhos e chamas conforme a fase ----------
{
  const CL = { MotherShip, RockGolem, StormEye, SunGuardian, EchoBoss, VoidBoss, Herald, Leviathan, Mirror, Heart };
  for (const name in CL) {
    const d = CL[name].prototype.draw;
    CL[name].prototype.draw = function () {
      d.call(this); if (QL() < 1 || G.state !== 'play' || this.state !== 'fight' || (this.phase || 0) < 1) return;
      const ph = this.phase, R = Math.min(130, this.rad || 100) * 1.22, c = ok71(this.col) ? this.col : '#ff8a5f', t = World.t, n = 6 + ph * 4;
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(t * (.25 + ph * .12)); ctx.fillStyle = c; ctx.strokeStyle = 'rgba(16,2,10,.9)'; ctx.lineWidth = 2; ctx.globalAlpha = .9;
      for (let i = 0; i < n; i++) { const a = i / n * TAU, l = 20 + ph * 8 + Math.sin(t * 4 + i) * 4; ctx.save(); ctx.rotate(a); ctx.translate(R, 0); ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(l, 0); ctx.lineTo(0, 7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.restore();
      if (ph >= 2 && ((t * 60) | 0) % 3 === 0) G.parts.push({ x: this.x + rand(-R, R), y: this.y + rand(-R * .3, R * .6), vx: rand(-30, 30), vy: -rand(60, 140), life: .5, max: .5, r: rand(3, 6), c: Math.random() < .5 ? c : '#ffb340', drag: 1 });
    };
  }
}

// ---------- 5. cartas: brilho na cor da raridade e o alias 'luck' ----------
{
  const ui = Visual2.upIcon;
  Visual2.upIcon = function (id, x, y, s, c, f) {
    if (id === 'luck') id = 'lucky'; if (QL() >= 1 && ok71(c)) { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 8; const r = ui.call(this, id, x, y, s, c, f); ctx.restore(); return r; }
    return ui.call(this, id, x, y, s, c, f);
  };
}

// ---------- 6. inimigos: aviso de tiro (arco crescendo) e ligacoes entre os que atacam em grupo ----------
{
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); if (QL() < 1 || G.state !== 'play' || G.enemies.length > 24) return; const E = G.enemies, t = World.t; ctx.save(); ctx.lineCap = 'round';
    for (const e of E) { if (e.dead || e.type !== 'shooter' && e.type !== 'captain' || e.shootT === undefined || e.mode === 'enter') continue; const k = 1 - clamp(e.shootT / .7, 0, 1); if (e.shootT > .7 || e.shootT <= 0) continue; ctx.globalAlpha = .35 + .5 * k; ctx.strokeStyle = '#ff6a6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, (e.rad || 24) + 8, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); }
    const W2 = E.filter(e => !e.dead && e.wv).sort((a, b) => a.x - b.x); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 2;
    for (let i = 1; i < W2.length; i++) { const a = W2[i - 1], b = W2[i]; if (Math.hypot(a.x - b.x, a.y - b.y) < 110) { ctx.globalAlpha = .28; ctx.strokeStyle = ok71(a.glow) ? a.glow : '#ffd36a'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
    ctx.restore();
  };
}

// ---------- 7. nave machucada: arranhoes e luz de alerta conforme a vida cai ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    const r = sh.call(this, x, y, o), p = G.player;
    if (G.state === 'play' && p && !p.dead && o && !o.orbi && Math.abs(x - p.x) < 1.5 && Math.abs(y - p.y) < 14 && QL() >= 1) {
      const q = p.hp / p.maxHp, k = (o.scale || 1); if (q <= .5) {
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = 'rgba(20,6,40,.75)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        const S = [[-8, -20, 2, -6], [6, 4, -4, 14], [-12, 8, -2, 20], [10, -14, 14, -2], [-4, -2, 6, 10]]; for (let i = 0; i < (q <= .34 ? 5 : 3); i++) { const s = S[i]; ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); ctx.stroke(); }
        if (q <= .34) { const on = Math.sin(World.t * 9) > 0; ctx.fillStyle = on ? '#ff3a3a' : '#5a1020'; ctx.beginPath(); ctx.arc(0, -34, 3.4, 0, TAU); ctx.fill(); if (on) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -34, 16, '#ff3a3a', .8); } }
        ctx.restore();
      }
    }
    return r;
  };
}

// ---------- 8. itens saltam do inimigo em arco antes de cair e serem puxados ----------
{
  const dp = dropPickup;
  dropPickup = function (type, x, y, val) {
    const n0 = G.pickups.length; const r = dp(type, x, y, val); const k = G.pickups[G.pickups.length - 1]; if (k && G.pickups.length > n0) { k.hop = { vx: rand(-110, 110), vy: -rand(180, 280), t: 0 }; } return r;
  };
  const up = updatePickup;
  updatePickup = function (k, dt) {
    if (k.hop && !k.mag) { const h = k.hop; h.t += dt; if (h.t < .55) { k.x += h.vx * dt; k.y += h.vy * dt; h.vy += 640 * dt; h.vx *= 1 - 2 * dt; k.age += dt; if (k.y > H - 20) { k.y = H - 20; h.vy *= -.4; } return; } k.hop = null; }
    return up(k, dt);
  };
}

// ---------- 9. fim de fase: o chefe derrotado se despede ----------
{
  const FARE = ['Zzz... o enxame descansa.', 'Rochas também sabem cair devagar.', 'O trovão passou. Obrigado.', 'Eu só queria aquecer alguém.', 'Eu era o seu medo. Já não sou.', 'O Vazio dorme. Eu também.', 'Que a luz continue sem mim.', 'O mar lembra de você.', 'Do outro lado, ainda sou você.', 'Obrigado por ouvir o meu batimento.'];
  const cl = Screens.clear;
  Screens.clear = function () {
    const r = cl.call(this); if (QL() < 1 || !G.stage || !G.bossDone) return r; const t = World.t - (G.clearAt ?? World.t), a = clamp((t - 1.2) / .8, 0, 1) * (.55 + .2 * Math.sin(World.t * 1.5)); if (a <= .02) return r;
    if (!Visual71.ghost || Visual71.ghostFor !== G.stageIdx) { try { Visual71.ghost = new BOSS_CLASSES[G.stage.boss](); Visual71.ghostFor = G.stageIdx; } catch (e) { Visual71.ghost = null; } }
    const gh = Visual71.ghost; if (!gh) return r; gh.t = World.t; gh.x = 0; gh.y = 0; gh.phase = 0; gh.flash = 0; gh.state = 'fight'; gh.dive = null; gh.clones = gh.clones || []; gh.hp = gh.maxHp;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(1160, 522); const sc = clamp(80 / (gh.rad || 110), .2, .5); ctx.scale(sc, sc); try { gh.draw(); } catch (e) { } ctx.restore();
    ctx.save(); ctx.globalAlpha = a + .2; txt('“' + (FARE[G.stageIdx] || '...') + '”', 1160, 636, 13, '#cdb8ff', 'center', 700); ctx.restore(); return r;
  };
}

// ---------- 10. dialogos: camadas de luz extras (raios, poeira, tentaculos lentos) vindas dos videos ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video || !pg.scene || typeof C4 === 'undefined') return r; const sc = pg.scene, t = World.t;
    ctx.save();
    if (sc === 'lit' || sc === 'litKeep') { C4.cam = { x: 0, y: 0, z: 1 }; C4.rays(W * .8, -40, t, 9, 820, '#fff1c0', .22, .05); C4.dust(t, 22, '#ffe9c0', .5); }
    else if (sc === 'void' || sc === 'voidArrive') { for (let i = 0; i < 4; i++) C4.tendril(i % 2 ? W + 60 : -60, 120 + i * 150, W / 2, H * .4, .55 + .1 * Math.sin(t * .6 + i), t, i * 2.1, 20); }
    else if (sc === 'heart') { C4.dust(t, 26, '#ffe9a8', .6); C4.ring(W / 2, H * .4, ((t * .25) % 1) * 560, '#ffe9a8', (1 - (t * .25) % 1) * .3, 4); }
    ctx.restore(); return r;
  };
}
