'use strict';
// ---------- polimento 33: sinergias de fusao, relíquias novas, Expedicao mais funda (descanso, bau, ascensao), impacto na morte de chefe ----------
const Visual33 = {};

// ---------- fusao: cada arma da fusao traz um bonus para os tiros ----------
const SYN = {
  violet: { dmg: 1.2 }, fan: { pierce: 1, dmg: 1.1 }, laser: { dmg: 1.15, pierce: 1 }, cannon: { dmg: 1.25 },
  boomerang: { life: 1.35, dmg: 1.1 }, chain: { dmg: 1.2 }, flame: { pierce: 1, dmg: 1.15 },
};
Visual33.synergy = function (a, b, fire, p) {
  const n0 = G.pb.length; fire();
  const ma = SYN[a] || {}, mb = SYN[b] || {};
  for (let i = n0; i < G.pb.length; i++) { const q = G.pb[i]; for (const m of [ma, mb]) { if (m.dmg) q.dmg *= m.dmg; if (m.pierce) q.pierce = (q.pierce || 0) + m.pierce; if (m.life && q.life) q.life *= m.life; } }
};
{
  const reg = Visual31.register;
  Visual31.register = function (a, b) {
    const id = reg.call(this, a, b), W_ = WEAPONS[id]; if (W_ && !W_._syn) { W_._syn = true; const A = WEAPONS[a], B = WEAPONS[b]; W_.fire = function (p) { const d = p.dmg; p.dmg = d * .62; try { Visual33.synergy(a, b, () => { A.fire(p); B.fire(p); }, p); } finally { p.dmg = d; } }; W_.desc = 'Fusão de ' + A.name + ' com ' + B.name + ': atira as duas e ganha o bônus de cada uma (dano, perfuração).'; }
    return id;
  };
}

// ---------- relíquias novas (valem tambem nas jornadas normais) ----------
RELICS.push(
  { id: 'glass', name: 'Canhão de Vidro', icon: 'crit', desc: '+35% de dano, mas -2 de vida máxima.' },
  { id: 'gale', name: 'Vento Cortante', icon: 'rate', desc: '+20% de velocidade de tiro e +5% de crítico.' },
  { id: 'rich', name: 'Coração Dourado', icon: 'magnet', desc: '+50% de estrelas e atrai de mais longe.' },
);
{
  const rs = Visual5.relicStats;
  Visual5.relicStats = function (p) {
    rs.call(this, p);
    if (G.relic === 'glass') { p.dmg *= 1.35; p.maxHp = Math.max(2, p.maxHp - 2); }
    else if (G.relic === 'gale') { p.fireDelay /= 1.2; p.crit += .05; }
    else if (G.relic === 'rich') { p.coinMul *= 1.5; p.magnet += 80; }
  };
}

// ---------- Expedicao: descanso, bau e ascensao ----------
{
  const XP = typeof XPLAN !== 'undefined' ? XPLAN : null;
  if (XP) { XP[1] = ['battle', 'event']; XP[4] = ['treasure', 'elite']; XP[5] = ['rest', 'shop']; }
  XN.rest = { n: 'DESCANSO', c: '#7fe0a0', i: '♥' }; XN.treasure = { n: 'BAÚ', c: '#ffcf6b', i: '◆' };
  XEV.push(
    { t: 'Cometa instável', d: 'Um cometa cruza a sua rota, cheio de cristais.', a: ['Pegar os cristais (-1 de vida, +60 de ouro)', r => { r.hp = Math.max(1, (r.hp ?? 6 + r.hpB) - 1); r.gold += 60; return 'Ouro de sobra, e um arranhão.'; }], b: ['Desviar', () => 'Você desvia com folga.'] },
    { t: 'Oficina abandonada', d: 'Uma oficina antiga ainda tem peças aproveitáveis.', a: ['Vasculhar (+1 melhoria)', () => { Visual32.giveUp(); return 'Você achou uma peça boa.'; }], b: ['Consertar a nave (cura 3)', r => { r.hp = (r.hp ?? 6 + r.hpB) + 3; return 'A nave ficou nova.'; }] },
  );
  const en = Visual32.enter;
  Visual32.enter = function (node) {
    const r = Visual32.run;
    if (node.type === 'rest') { r.cur = node; r.ev = { t: 'Ponto de descanso', d: 'Um lugar calmo para respirar antes da próxima batalha.', a: ['Descansar (cura 4)', r2 => { r2.hp = (r2.hp ?? 6 + r2.hpB) + 4; return 'Você recuperou as forças.'; }], b: ['Treinar (+1 melhoria)', () => { Visual32.giveUp(); return 'O treino valeu a pena.'; }] }; r.evDone = ''; G.state = 'expevent'; return; }
    if (node.type === 'treasure') { r.cur = node; r.ev = { t: 'Baú estelar', d: 'Um baú flutua entre os asteroides.', a: ['Abrir com cuidado (+50 de ouro e +1 melhoria)', () => { r.gold += 50; Visual32.giveUp(); return 'Dentro havia ouro e uma peça rara.'; }], b: ['Arrombar (+110 de ouro, -1 de vida)', r2 => { r2.gold += 110; r2.hp = Math.max(1, (r2.hp ?? 6 + r2.hpB) - 1); return 'Rendeu muito ouro, mas uma faísca te pegou.'; }] }; r.evDone = ''; G.state = 'expevent'; return; }
    return en.call(this, node);
  };
  // ascensao: cada vitoria sobe o nivel; inimigos mais fortes, mais estrelas
  Visual33.asc = () => Math.min(5, ((Save.data.exp || {}).asc || 0));
  const st = Visual32.start;
  Visual32.start = function () { st.call(this); const r = Visual32.run; r.asc = Visual33.asc(); };
  const fin = Visual32.finish;
  Visual32.finish = function (win) {
    const r = Visual32.run; if (!r || r.done) return; fin.call(this, win);
    if (win) { const d = Save.data.exp; r.bonus = Math.round(r.stars * (r.asc || 0) * .2); if (r.bonus) { Save.data.coins += r.bonus; r.stars += r.bonus; } if ((r.asc || 0) === (d.asc || 0) && (d.asc || 0) < 5) d.asc = (d.asc || 0) + 1; Save.save(); }
  };
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o) { const e = se(type, x, y, o); if (G.exp && G.exp.asc) { const k = 1 + .15 * G.exp.asc; e.hp = e.maxHp = Math.ceil(e.hp * k); } return e; };
  const xh = Screens.expmap;
  Screens.expmap = function () { xh.call(this); const r = Visual32.run; if (r && r.asc) txt('ASCENSÃO ' + r.asc + '  (inimigos +' + r.asc * 15 + '% de vida, +' + r.asc * 20 + '% de estrelas na vitória)', W / 2, 98, 16, '#ff8a5f', 'center', 900); };
}

// ---------- impacto na morte de chefe ----------
{
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    try { shake(26); if (G.stageIdx === 9) { G.hitFinal = true; G.hitstop = Math.max(G.hitstop || 0, .3); } flashScreen(.45); Snd.duck && Snd.duck(.6, 1.2); } catch (e) { }
    return bd.call(this);
  };
}
