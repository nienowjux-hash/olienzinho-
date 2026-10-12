'use strict';
// ---------- Torre Infinita (chefes sem parar, cada andar mais forte) e acabamento dos inimigos comuns ----------
const Visual35 = { tower: false };
Visual35.start = function () {
  const list = []; let last = -1; for (let i = 0; i < 80; i++) { let s; do { s = Math.floor(Math.random() * 10); } while (s === last); list.push(s); last = s; }
  Visual35.tower = true; Save.data.tower = Save.data.tower || { best: 0, runs: 0 }; Save.data.tower.runs++; Save.save(); Visual5.startRush(list);
};
{
  const rs = Visual5.rushStep;
  Visual5.rushStep = function (i) { rs.call(this, i); G.tower = Visual35.tower; if (G.tower) { Events.banner = { t: 0, title: 'ANDAR ' + (i + 1), sub: 'Cada andar deixa o chefe mais forte', c: '#ff8a5f' }; } };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { up.call(this, dt); if (G.tower && G.boss && !G.boss._tw) { G.boss._tw = true; const k = 1 + .1 * (G.rushI || 0); G.boss.maxHp = G.boss.hp = Math.round(G.boss.maxHp * k); } };
  const go = Game.gameOver; Game.gameOver = function () { if (G.tower) { const t = Save.data.tower; const fl = G.rushI || 0; if (fl > t.best) t.best = fl; Save.save(); } return go.call(this); };
  const gt = Game.goTitle; Game.goTitle = function () { Visual35.tower = false; G.tower = false; return gt.call(this); };
  const re = Visual5.rushEnd; Visual5.rushEnd = function () { if (Visual35.tower) { Visual35.tower = false; } return re.call(this); };
}

// ---------- inimigos comuns: brilho de borda, sombra suave e respiracao ----------
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    if (e && e.type !== 'hunter' && typeof e.x === 'number' && QL() >= 1) {
      const col = (e.glow && e.glow.length === 7) ? e.glow : '#ff8a1f', r = (e.rad || 24);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x, e.y, r * 2.3 + Math.sin(World.t * 3 + (e.ph || 0)) * 3, col, .22); ctx.restore();
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(e.x + 5, e.y + r * .9, r * .8, r * .25, 0, 0, TAU); ctx.fill(); ctx.restore();
      const br = 1 + Math.sin(World.t * 4 + (e.ph || 0)) * .025; ctx.save(); ctx.translate(e.x, e.y); ctx.scale(br, 1 / br * 1.0 + (br - 1) * .5); ctx.translate(-e.x, -e.y); try { return ae.call(this, e); } finally { ctx.restore(); }
    }
    return ae.call(this, e);
  };
}
