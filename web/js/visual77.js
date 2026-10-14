'use strict';
// ---------- 77: chama da nave, rachaduras nos inimigos, brilho nos golpes criticos, tela de derrota, vitrine do hangar, vibracao por evento, paleta para daltonismo, dicas no inicio da fase ----------
const Visual77 = { rb: 0, ct: 0, over0: null, tip: 0 };
const ok77 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const rum77 = (ms, s, w, gap = 90) => { const n = performance.now(); if (n - Visual77.rb < gap) return; Visual77.rb = n; try { Visual67.rumble(ms, s, w); } catch (e) { } };

// ---------- 1. chama do motor mais longa com dash/impulso e fagulhas ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    const r = sh.apply(this, arguments); const b = o && o.boost || 0;
    if (QL() >= 1 && b > .35 && !o.orbi) { const k = (o.scale || 1), len = 40 * Math.min(2.5, b) * k; ctx.save(); ctx.translate(x, y + 38 * k); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, 0, len); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.35, 'rgba(127,224,255,.5)'); g.addColorStop(1, 'rgba(127,224,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-8 * k, 0); ctx.quadraticCurveTo(0, len * (1 + .1 * Math.sin((o.t || 0) * 50)), 8 * k, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    return r;
  };
}

// ---------- 2. inimigos feridos racham; golpe critico faz faiscas, vibra e toca um estalo ----------
{
  const en = Art.enemy;
  Art.enemy = function (e) {
    const r = en.call(this, e); if (QL() < 1 || e.dead || e.type === 'dummy') return r; if (e._h0 === undefined) e._h0 = e.hp;
    if (e._h0 > 2 && e.hp / e._h0 < .55 && G.enemies.length <= 30) {
      if (!e._cr) { e._cr = []; for (let i = 0; i < 3; i++) { const a = rand(0, TAU); e._cr.push([a, rand(.3, .6), rand(-.5, .5)]); } }
      const R = e.rad || 22, k = 1 - e.hp / e._h0; ctx.save(); ctx.translate(e.x, e.y); ctx.strokeStyle = 'rgba(10,0,24,.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (const [a, l, w] of e._cr) { ctx.beginPath(); const x0 = Math.cos(a) * R * .15, y0 = Math.sin(a) * R * .15, x1 = Math.cos(a) * R * (.3 + l * k * 1.2), y1 = Math.sin(a) * R * (.3 + l * k * 1.2); ctx.moveTo(x0, y0); ctx.lineTo((x0 + x1) / 2 + w * 6, (y0 + y1) / 2 - w * 6); ctx.lineTo(x1, y1); ctx.stroke(); }
      ctx.restore();
    }
    return r;
  };
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    const h0 = e.hp, r = de.apply(this, arguments); if (QL() < 1) return r;
    if (crit) { sparks(e.x, e.y, '#ffe9a8', 7, 280); rum77(45, .15, .5); const n = performance.now(); if (n - Visual77.ct > 110) { Visual77.ct = n; Snd.play('graze'); } }
    else if (e.hp > 0 && e._h0 && h0 / e._h0 >= .5 && e.hp / e._h0 < .5) shedDebris(e.x, e.y, 2, [e.glow || '#b98cff', '#3a2060'], 200, 6);
    return r;
  };
  const upk = updatePickup;
  updatePickup = function (k, dt) { const was = k.dead; const r = upk.apply(this, arguments); if (!was && k.dead && k.type !== 'xp') rum77(30, 0, .35, 60); return r; };
}

// ---------- 3. derrota: a nave se desfaz em estrelas e aparece um resumo da corrida ----------
{
  const ov = Screens.over;
  Screens.over = function () {
    if (Visual77.os !== 'over') { Visual77.over0 = World.t; const p = G.player; Visual77.ox = p ? p.x : W / 2; Visual77.oy = p ? p.y : H / 2; } Visual77.os = 'over';
    const r = ov.apply(this, arguments); const u = World.t - Visual77.over0;
    if (QL() >= 1 && u < 1.6) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const a = i * 2.399, sp = 80 + (i * 37 % 200), d = u * sp; ctx.globalAlpha = Math.max(0, 1 - u / 1.6) * .8; drawGlow(Visual77.ox + Math.cos(a) * d, Visual77.oy + Math.sin(a) * d + u * u * 40, 7 + (i % 4) * 2, i % 3 ? '#b98cff' : '#ffe9a8', .9); } ctx.restore(); }
    if (!G.endless && G.stats && G.result) { const t = Math.floor(G.t || 0); txt('Você durou ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') + '  •  Maior combo x' + G.stats.maxCombo + '  •  Nível ' + (G.result.level || G.level), W / 2, 542, 17, '#cdb8ff', 'center', 700); }
    return r;
  };
  const rs = Game.updatePlay; Game.updatePlay = function () { if (G.state !== 'over') Visual77.os = G.state; return rs.apply(this, arguments); };
  addEventListener('keydown', () => { if (G.state !== 'over') Visual77.os = G.state; });
}

// ---------- 4. hangar: vitrine com anel de luz girando e a nave virando de leve ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    if (G.state === 'hangar' && x === 960 && o && !o.orbi) {
      const t = World.t; o.sx = .93 + .07 * Math.cos(t * .9);
      if (QL() >= 1) { ctx.save(); ctx.translate(x, y + 120); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(184,160,255,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 150, 26, 0, 0, TAU); ctx.stroke(); drawGlow(0, 0, 130, '#7a52e8', .35); for (let i = 0; i < 3; i++) { const a = t * .8 + i * TAU / 3; drawGlow(Math.cos(a) * 150, Math.sin(a) * 26, 14, '#e8dcff', .9); } ctx.restore(); }
    }
    return sh.apply(this, arguments);
  };
}

// ---------- 5. paleta para daltonismo: tiros do jogador azuis, inimigos laranja com miolo branco (opcao em Acessibilidade) ----------
{
  const pb = Art.pbullet, eb = Art.ebullet;
  Art.pbullet = function (b) { if (Save.data.settings.dalt) { const c = b.c; b.c = '#3aa0ff'; try { return pb.call(this, b); } finally { b.c = c; } } return pb.call(this, b); };
  Art.ebullet = function (b) { if (Save.data.settings.dalt) { const c = b.c; b.c = '#ff9a1a'; try { return eb.call(this, b); } finally { b.c = c; } } return eb.call(this, b); };
  const ac = Screens.access;
  Screens.access = function () {
    const r = ac.apply(this, arguments); const s = Save.data.settings;
    if (UI.button('dalt', 470, 424, 330, 38, 'PALETA DALTÔNICA: ' + (s.dalt ? 'SIM' : 'NÃO'), { size: 14, color: s.dalt ? '#9a63ff' : undefined })) { s.dalt = !s.dalt; Save.save(); }
    return r;
  };
}

// ---------- 6. dicas curtas no comeco de cada fase ----------
{
  const TIPS = ['Segure o tiro e deslize: o dash atravessa tiros inimigos.', 'Combos altos dão mais pontos: não deixe o contador zerar.', 'O ímã puxa estrelas de longe: invista nele se gosta de coletar.', 'Perto de um tiro inimigo sem ser atingido rende pontos de raspão.', 'Armas fundidas misturam os efeitos das duas: experimente no hangar.', 'O guardião ajuda a atirar e a defender: escolha o que combina com a sua arma.', 'Os chefes ficam mais fortes ao perder vida: guarde o especial para a fúria.', 'Na loja, melhorias permanentes valem para todas as fases.'];
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (G.state !== 'play' || QL() < 1 || !G.t || G.t > 5 || G.endless || G.training || G.tutOn) return; if (Visual77.tipRun !== G.runId) { Visual77.tipRun = G.runId; Visual77.tip = (Visual77.tip + 1) % TIPS.length; }
    const a = clamp(G.t / .6, 0, 1) * clamp((5 - G.t) / .8, 0, 1); ctx.save(); ctx.globalAlpha = a * .9; ctx.font = `700 17px ${FONT}`; const s = 'DICA: ' + TIPS[Visual77.tip], w = ctx.measureText(s).width + 36; ctx.fillStyle = 'rgba(10,4,32,.75)'; ctx.beginPath(); ctx.roundRect(W / 2 + 100 - w / 2, 664, w, 34, 17); ctx.fill(); ctx.fillStyle = '#e8dcff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, W / 2 + 100, 681); ctx.restore();
  };
  const sf = Game.startStage; Game.startStage = function () { G.runId = (G.runId || 0) + 1; return sf.apply(this, arguments); };
}
