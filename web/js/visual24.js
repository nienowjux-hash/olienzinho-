'use strict';
// ---------- polimento 24: rebater tiros (F), mutadores, arvore de talentos, estatisticas e final verdadeiro ----------
const Visual24 = {};
const sv = (k, d) => (Save.data[k] || (Save.data[k] = d));

// ---------- rebater (tecla F) ----------
Visual24.update = function (dt) {
  const p = G.player; if (!p || p.dead || G.state !== 'play' || G.cut || G.finisher) return;
  p.parryCd = Math.max(0, (p.parryCd || 0) - dt); p.parryT = Math.max(0, (p.parryT || 0) - dt);
  if (Input.pressed('f') && p.parryCd <= 0) { p.parryT = .22; p.parryCd = 1.3; p.parryHit = 0; shockwave(p.x, p.y, 100, '#7fe0ff'); Snd.play('shield'); Visual16.tip('parry', 'Rebater (F)', 'Aperte F quando um tiro estiver bem perto: ele volta contra o inimigo. Se acertar, recarrega mais rápido.'); }
  if (p.parryT > 0) {
    for (const q of G.eb) if (!q.dead && Math.hypot(q.x - p.x, q.y - p.y) < 80) {
      q.dead = true; p.parryHit++; const tg = nearestTarget(p.x, p.y - 30), a = tg ? Math.atan2(tg.y - q.y, tg.x - q.x) : -Math.PI / 2;
      G.pb.push({ x: q.x, y: q.y, vx: Math.cos(a) * 820, vy: Math.sin(a) * 820, dmg: p.dmg * 2.2, crit: false, pierce: 1, hits: [], c: '#7fe0ff', r: 8, life: 1.6 });
      sparks(q.x, q.y, '#7fe0ff', 6, 260); G.score += 40; if (p.parryHit <= 3) popup(q.x, q.y - 20, 'REBATEU!', '#7fe0ff', 20);
    }
    if (p.parryHit > 0 && !p._pf) { p._pf = true; p.parryCd = .45; G.hitstop = Math.max(G.hitstop || 0, .06); flashScreen(.1); Snd.play('hit', { pan: Snd.panX(p.x) }); }
  } else p._pf = false;
};
{
  const vd = Visual13.draw;
  Visual13.draw = function () { vd.call(this); const p = G.player; if (p && p.parryT > 0) { const k = p.parryT / .22; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fe0ff'; ctx.globalAlpha = .9 * k; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(p.x, p.y, 80 * (1.1 - k * .25), 0, TAU); ctx.stroke(); drawGlow(p.x, p.y, 100, '#7fe0ff', .35 * k); ctx.restore(); } };
}

// ---------- mutadores ----------
const MUT = [
  { id: 'single', name: 'TIRO ÚNICO', c: '#ffb340', mul: 1.3, desc: 'Você atira um tiro por vez, sempre.' },
  { id: 'meteor', name: 'CHUVA DE METEOROS', c: '#ff7a4a', mul: 1.2, desc: 'Meteoros caem o tempo todo.' },
  { id: 'explode', name: 'INIMIGOS EXPLOSIVOS', c: '#ff4a6e', mul: 1.25, desc: 'Todo inimigo solta tiros ao morrer.' },
  { id: 'glass', name: 'VIDRO', c: '#9fe8ff', mul: 1.5, desc: '1 de vida, mas +80% de dano.' },
  { id: 'fast', name: 'TUDO RÁPIDO', c: '#7fffa0', mul: 1.2, desc: 'Inimigos 25% mais rápidos.' },
];
Visual24.mutOn = id => !!(sv('mut', {})[id]);
Visual24.mutMul = () => MUT.reduce((m, u) => m * (Visual24.mutOn(u.id) ? u.mul : 1), 1);
{
  const ss = Visual8.styleStats;
  Visual8.styleStats = function (p) {
    ss.call(this, p); if (p.isP2 || G.practice) return;
    if (Visual24.mutOn('single')) p.shots = 1;
    if (Visual24.mutOn('glass')) { p.maxHp = 1; p.dmg *= 1.8; }
    const T = Visual24.tl;
    p.dmg *= 1 + .04 * T('dano'); p.fireDelay *= 1 - .03 * T('cad'); p.crit += .02 * T('crit'); p.maxHp += T('casco'); p.dashCdMax *= 1 - .06 * T('esq'); p.xpMul *= 1 + .06 * T('xp'); p.magnet += 12 * T('ima');
  };
  const ke = killEnemy; killEnemy = function (e, by) { const was = e.counted; ke(e, by); if (!was && e.counted && Visual24.mutOn('explode') && e.type !== 'bit' && e.type !== 'swarmer') ring(e.x, e.y, 6, 170, rand(0, 6), { r: 6 }); (sv('st2', {})).kills = ((Save.data.st2.kills) || 0) + (!was && e.counted ? 1 : 0); };
  const ue = updateEnemy; updateEnemy = function (e, dt) { return ue(e, Visual24.mutOn('fast') ? dt * 1.25 : dt); };
  const sg = Game.startStage; Game.startStage = function (i, o) { const r = sg.call(this, i, o); G.mtT = 2; const act = MUT.filter(u => Visual24.mutOn(u.id)).map(u => u.name); if (act.length && !G.practice) G.timers.push({ t: 1.6, fn: () => popup(W / 2, 200, 'MUTADORES: ' + act.join(' + '), '#ffcf6b', 22) }); return r; };
}
Screens.mutators = function () {
  txt('MUTADORES', W / 2, 24, 44, '#fff', 'center'); txt('Regras extras que valem para as próximas fases. Mais risco, mais estrelas no fim.', W / 2, 86, 17, '#ffb340', 'center', 900);
  const m = sv('mut', {}); MUT.forEach((u, i) => {
    const x = 70 + (i % 3) * 380, y = 140 + Math.floor(i / 3) * 190, w = 340, h = 170, on = !!m[u.id], id = 'mu' + i;
    if (UI.hit(id, x, y, w, h)) { m[u.id] = on ? 0 : 1; Save.save(); Snd.play('uiSelect'); }
    const f = UI.focus(id); UI.panel(x, y, w, h, { r: 20, fill: on ? 'rgba(60,34,140,.88)' : f ? 'rgba(40,20,100,.85)' : 'rgba(20,8,55,.75)', stroke: on ? u.c : f ? '#e2d4ff' : 'rgba(190,160,255,.3)' });
    txt(u.name, x + w / 2, y + 16, 24, u.c, 'center', w - 20); UI.wrap(u.desc, x + w / 2, y + 62, w - 40, 22, 16, '#cdb8ff', 'center'); txt('Estrelas ×' + u.mul.toFixed(2), x + w / 2, y + 116, 16, '#ffcf6b', 'center', 800); txt(on ? 'ATIVO ✓' : 'desligado', x + w / 2, y + 140, 17, on ? '#7fe0a0' : '#8a7fb0', 'center', 900);
  });
  txt('Bônus total de estrelas: ×' + Visual24.mutMul().toFixed(2), W / 2, 540, 22, '#ffcf6b', 'center', 900);
  if (UI.button('back', W / 2 - 160, 600, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};
{ // meteoros constantes
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); if (G.state !== 'play') return; if (Visual24.mutOn('meteor') && !G.boss && !G.practice) { G.mtT = (G.mtT ?? 2) - dt; if (G.mtT <= 0) { G.mtT = 2.4; Events.spawnMeteor(); } }
    Visual24.update(dt); const p = G.player, T = Visual24.tl('regen');
    if (p && !p.dead && T > 0) { p.rgT = (p.rgT ?? 75 - 15 * T) - dt; if (p.rgT <= 0) { p.rgT = 75 - 15 * T; if (p.hp < p.maxHp) { p.hp++; popup(p.x, p.y - 50, '+1', '#7fe0a0', 22); } } }
    const s2 = sv('st2', {}); s2.time = (s2.time || 0) + dt; s2.wu = s2.wu || {}; if (p) s2.wu[p.weapon] = (s2.wu[p.weapon] || 0) + dt; Visual24.sv = (Visual24.sv || 0) + dt; if (Visual24.sv > 15) { Visual24.sv = 0; Save.save(); }
    if (G.stats && G.stats.maxCombo > (s2.combo || 0)) s2.combo = G.stats.maxCombo;
  };
}

// ---------- arvore de talentos ----------
const TAL = [
  { br: 'ATAQUE', c: '#ff8a5f', items: [['dano', 'Força', '+4% de dano por nível', 5], ['cad', 'Cadência', '+3% de velocidade de tiro por nível', 5], ['crit', 'Precisão', '+2% de crítico por nível', 5]] },
  { br: 'DEFESA', c: '#7fe0ff', items: [['casco', 'Casco', '+1 de vida por nível', 3], ['esq', 'Reflexos', 'Esquiva recarrega 6% mais rápido por nível', 5], ['regen', 'Reparo Lento', 'Recupera 1 de vida de vez em quando.', 3]] },
  { br: 'SORTE', c: '#ffd36a', items: [['estr', 'Garimpo', '+8% de estrelas ao fim das fases por nível', 5], ['xp', 'Sabedoria', '+6% de experiência por nível', 5], ['ima', 'Ímã', 'Atrai itens de mais longe', 4]] },
];
Visual24.tl = id => ((Save.data.tal || {})[id]) || 0;
Screens.talents = function () {
  txt('TALENTOS', W / 2, 24, 44, '#fff', 'center'); txt(Screens.stars(), W - 40, 36, 30, '#ffcf6b', 'right'); txt('Melhorias permanentes, para sempre.', W / 2, 86, 17, '#ffb340', 'center', 900);
  TAL.forEach((b, bi) => {
    const x = 50 + bi * 400, w = 370; UI.panel(x, 120, w, 440, { r: 22 }); txt(b.br, x + w / 2, 134, 26, b.c, 'center', w - 20);
    b.items.forEach(([id, name, desc, max], i) => {
      const y = 186 + i * 124, l = Visual24.tl(id), full = l >= max, cost = 120 * (l + 1), can = !full && Save.data.coins >= cost;
      txt(name, x + 22, y, 20, '#fff', 'left', 900); UI.wrap(desc, x + 22, y + 26, w - 44, 17, 13, '#cdb8ff');
      for (let q = 0; q < max; q++) { ctx.fillStyle = q < l ? b.c : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(x + 30 + q * 22, y + 66, 7, 0, TAU); ctx.fill(); }
      if (full) txt('NO MÁXIMO', x + w - 22, y + 56, 15, '#7fe0a0', 'right', 900);
      else if (UI.button('ta' + id, x + w - 150, y + 48, 128, 34, '★ ' + cost, { size: 15, color: can ? '#9a63ff' : undefined })) { if (can) { Save.data.coins -= cost; sv('tal', {})[id] = l + 1; Save.save(); Snd.play('buy'); shockwave(x + w - 86, y + 65, 90, b.c); } else Snd.play('uiDeny'); }
    });
  });
  if (UI.button('back', W / 2 - 160, 600, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hangar'; }
  Screens.thinFrame();
};
{ // bonus de estrelas: talento + mutadores
  const er = Game.endRunSave;
  Game.endRunSave = function (b, c) {
    const r = er.call(this, b, c); if (G.practice || G.secret || G.adv || G.epi || G.weekly) return r;
    const k = (Visual24.mutMul() - 1) + .08 * Visual24.tl('estr'); if (c && k > 0 && G.runCoins > 0) { Save.data.coins += Math.round(G.runCoins * k); Save.save(); }
    return r;
  };
  const go = Game.gameOver; Game.gameOver = function () { const s2 = sv('st2', {}); s2.deaths = s2.deaths || {}; const nm = G.boss ? G.boss.name : (G.stage ? 'Fase ' + (G.stage.id + 1) : '?'); s2.deaths[nm] = (s2.deaths[nm] || 0) + 1; s2.dtotal = (s2.dtotal || 0) + 1; Save.save(); return go.call(this); };
}

// ---------- estatisticas ----------
Screens.stats = function () {
  const s = sv('st2', {}), d = Save.data, fmt = x => { x = Math.floor(x); return Math.floor(x / 3600) + 'h ' + String(Math.floor(x % 3600 / 60)).padStart(2, '0') + 'min'; };
  txt('ESTATÍSTICAS', W / 2, 24, 44, '#fff', 'center'); UI.panel(160, 100, 960, 470, { r: 24 });
  const wu = Object.entries(s.wu || {}).sort((a, b) => b[1] - a[1])[0], dt = Object.entries(s.deaths || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const rows = [['Tempo jogado', fmt(s.time || 0)], ['Inimigos derrotados', String(s.kills || 0)], ['Partidas', String(d.stats && d.stats.runs !== undefined ? d.stats.runs : d.runs || 0)], ['Derrotas', String(s.dtotal || 0)], ['Melhor combo', String(s.combo || 0)], ['Arma mais usada', wu ? (WEAPONS[wu[0]] ? WEAPONS[wu[0]].name : wu[0]) + ' (' + fmt(wu[1]) + ')' : '—'], ['Onde você mais perdeu', dt.length ? dt.map(([n, v]) => n + ' (' + v + ')').join(', ') : '—'], ['Conquistas', ACH.filter(a => d.ach[a.id]).length + ' / ' + ACH.length], ['Fases concluídas', Object.keys(d.cleared || {}).filter(k => d.cleared[k]).length + ' / ' + STAGES.length]];
  rows.forEach(([a, b], i) => { const y = 124 + i * 48; ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.09)'; ctx.fillRect(184, y - 6, 912, 42); txt(a, 208, y + 2, 20, '#cdb8ff', 'left', 700); txt(b, 1072, y + 1, 21, '#fff', 'right', 800); });
  if (UI.button('back', W / 2 - 160, 604, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};

// ---------- final verdadeiro ----------
{
  const F = STORY.finale4, vi = F.findIndex(p => p.video === 'v_end');
  F.splice(vi < 0 ? F.length : vi, 0,
    { req: () => Extras.fragCount() >= 6, music: undefined, who: 'L', scene: 'lumi', mood: 'happy', text: 'Seis fragmentos acesos... Então era você quem faltava, meu broto. A luz agora está inteira.' },
    { req: () => Extras.fragCount() >= 6, who: 'B', mood: 'happy', text: 'Olienzinho! Eu consigo ver todas as estrelas acesas daqui. Todas elas.' },
    { req: () => Extras.fragCount() >= 6, title: 'FINAL VERDADEIRO', sub: 'TODAS AS LUZES ACESAS' });
  ACH.push({ id: 'trueend', name: 'Final Verdadeiro', desc: 'Zere o jogo com os 6 fragmentos de luz.', ok: () => !!Save.data.trueEnd });
  const sc = Game.stageClear; Game.stageClear = function () { if (G.stageIdx === 9 && Extras.fragCount() >= 6) { Save.data.trueEnd = true; Save.save(); } return sc.call(this); };
}
