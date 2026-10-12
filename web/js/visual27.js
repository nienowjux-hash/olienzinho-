'use strict';
// ---------- Dificil e Pesadelo de verdade: mais tiros, mais inimigos, chefes mais agressivos e (no Pesadelo) golpes que tiram 2 de vida ----------
Object.assign(DIFF[2], { desc: 'Inimigos mais fortes e mais agressivos, mais deles, e chefes mais rápidos. -1 de vida. Mais pontos e estrelas.', hp: 1.6, bul: 1.25, php: -1, score: 1.6, coin: 1.45, rate: 1.4, spawn: 1.4, boss: 1.35, bhp: 1.25 });
Object.assign(DIFF[3], { desc: 'Brutal: inimigos muito mais fortes e agressivos, hordas, chefes furiosos e cada golpe tira 2 de vida. Muito mais pontos e estrelas.', hp: 2.0, bul: 1.35, php: 0, score: 2.6, coin: 2.1, rate: 1.55, spawn: 1.45, boss: 1.5, bhp: 1.35, hit2: true });
const hard = () => { const d = DIFF[Save.data.settings.diff ?? 1]; return d && d.rate ? d : null; };
{
  const ue = updateEnemy; updateEnemy = function (e, dt) { const h = hard(); return ue(e, h ? dt * (1 + (h.rate - 1) * .6) : dt); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { up.call(this, dt); const h = hard(); if (h && G.state === 'play' && G.spawnT > 0 && !G.boss) G.spawnT -= dt * (h.spawn - 1); };
  const tk = Boss.prototype.tick; Boss.prototype.tick = function (k, dt, every) { const h = hard(); return tk.call(this, k, dt, h ? every / h.boss : every); };
  const bu = Game.updatePlay; Game.updatePlay = function (dt) { const b = G.boss, h = hard(); if (b && !b._hd && G.player) { b._hd = 1; if (h && h.bhp) { b.maxHp = b.hp = Math.round(b.maxHp * h.bhp); } } return bu.call(this, dt); };
  const hp = hurtPlayer; hurtPlayer = function (d = 1) { const h = hard(); return hp(h && h.hit2 ? d * 2 : d); };
}
