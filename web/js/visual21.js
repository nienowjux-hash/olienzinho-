'use strict';
// ---------- Eco do Olienzinho reformulado: copia a esquiva, rasga a tela, cria ecos e reescreve os proprios tiros ----------
class EchoBoss2 extends EchoBoss {
  constructor() { super(); this.maxHp = this.hp = 900; this.clones = []; this._pd = false; }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 100 + r; }
  big(fn) { ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1.3, 1.3); ctx.translate(-this.x, -this.y); fn(); ctx.restore(); }
  onPhase() { super.onPhase(); this.cd = {}; this.clones = []; G.glitchT = .9; popup(W / 2, 290, this.phase === 1 ? 'ELE TE COPIA!' : 'SOBRECARGA!', '#ff4ad0', 28); }
  ai(dt) {
    super.ai(dt); if (this.dive || this.state !== 'fight') return;
    const ph = this.phase, p = G.player;
    // copia a esquiva do jogador
    const dashing = p.dashT > 0;
    if (dashing && !this._pd) { this._pd = true; this.x = clamp(W - p.x + rand(-60, 60), 120, W - 120); shockwave(this.x, this.y, 150, '#ff4ad0'); ring(this.x, this.y, 10, 210, rand(0, 6), { r: 6 }); popup(this.x, this.y - 90, 'COPIOU!', '#ff4ad0', 20); }
    if (!dashing) this._pd = false;
    // rasga a tela: linhas horizontais de glitch
    if (this.tick('tear', dt, ph === 0 ? 7.5 : ph === 1 ? 5.8 : 4.5)) { popup(W / 2, 250, 'GLITCH!', '#ff4ad0', 24); for (const y of [rand(250, 360), rand(430, 580)]) Events.hazardRect(W / 2, y, W + 40, 54, 1.15, .5, '#ff4ad0', 'beam'); G.glitchT = .35; Snd.play('bossWarn'); }
    // ecos: duas copias apagadas atiram junto
    if (ph >= 1 && this.tick('clones', dt, 10)) { this.clones = [{ dx: -220, t: 0 }, { dx: 220, t: 0 }]; popup(W / 2, 250, 'ECOS!', '#c040ff', 24); }
    for (const c of this.clones) {
      c.t += dt; c.x = clamp(this.x + c.dx, 80, W - 80); c.y = this.y + 36 + Math.sin(this.t * 2 + c.dx) * 12; c.fT = (c.fT ?? .9) - dt;
      if (c.fT <= 0 && c.t < 6.5) { c.fT = 1.5; fanAimed(c.x, c.y + 30, 3, .55, 235); }
    }
    this.clones = this.clones.filter(c => c.t < 7.2);
    // reescrita: o anel muda de rumo e vai em direcao a nave
    if (ph === 2 && this.tick('rewrite', dt, 5.4)) { popup(W / 2, 250, 'REESCRITA!', '#2ad4ff', 24); for (let i = 0; i < 22; i++) ebullet(this.x, this.y + 20, i / 22 * TAU, 110, { r: 6, rd: .95, c: '#2ad4ff' }); Snd.play('bossWarn'); }
  }
  drawShip() {
    const t = this.t; ctx.save(); ctx.translate(this.x, this.y);
    // chuva de codigo atras do chefe
    ctx.globalCompositeOperation = 'lighter'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
    for (let i = 0; i < 9; i++) { const x = (i - 4) * 34, f = (t * 1.2 + hsh(i + 300)) % 1; for (let k = 0; k < 7; k++) { const yy = -130 + ((f * 260 + k * 34) % 260); ctx.globalAlpha = (1 - k / 7) * .42; ctx.fillStyle = k === 0 ? '#ffffff' : '#ff4ad0'; ctx.fillText(((i * 7 + k + Math.floor(t * 3)) % 2) ? '1' : '0', x, yy); } }
    ctx.restore();
    for (const c of this.clones) { const ox = this.x, oy = this.y, a = clamp(Math.min(c.t / .6, (7.2 - c.t) / .6), 0, 1); this.x = c.x; this.y = c.y; ctx.save(); ctx.filter = 'opacity(' + Math.round(a * 45) + '%) hue-rotate(40deg)'; this.big(() => super.drawShip()); ctx.restore(); this.x = ox; this.y = oy; }
    this.big(() => super.drawShip());
    ctx.save(); ctx.translate(this.x, this.y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = this.phase === 2 ? '#2ad4ff' : '#ff4ad0'; ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.6 + k * .3) * (k % 2 ? -1 : 1)); ctx.setLineDash([22, 12 + k * 6]); ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(0, 0, 118 + k * 24, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.setLineDash([]); const n = 2 + this.phase * 2; for (let i = 0; i < n; i++) { if (Math.random() < .55) { ctx.globalAlpha = .4; ctx.fillStyle = i % 2 ? '#2ad4ff' : '#ff4ad0'; ctx.fillRect(rand(-130, 130), rand(-110, 110), rand(30, 120), rand(2, 6)); } }
    ctx.restore();
  }
}
BOSS_CLASSES.echo = EchoBoss2;
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt);
    for (const b of G.eb) if (b.rd !== undefined && !b.dead) { b.rd -= dt; if (b.rd <= 0) { b.rd = undefined; const a = aimAt(b.x, b.y); b.vx = Math.cos(a) * 235; b.vy = Math.sin(a) * 235; sparks(b.x, b.y, '#2ad4ff', 2, 90); } }
  };
}
