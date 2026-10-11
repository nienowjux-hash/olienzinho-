'use strict';
// ---------- cenario: nebulosas, estrelas, planetas, asteroides, cometas ----------
const World = {
  t: 0, scroll: 1, warp: 0, boost: 0, pal: null,
  stars: [], dust: [], planets: [], rocks: [], comet: null, cometT: 3, nebA: null, nebB: null,

  makeNebula(blobs) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    for (const [x, y, r, col, a] of blobs) for (const dy of [-H, 0, H]) {
      const gr = g.createRadialGradient(x, y + dy, 0, x, y + dy, r);
      gr.addColorStop(0, col + Math.round(a * 255).toString(16).padStart(2, '0')); gr.addColorStop(1, col + '00');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
    return c;
  },

  setStage(pal) {
    this.pal = pal;
    this.nebA = this.makeNebula(pal.nebA); this.nebB = this.makeNebula(pal.nebB);
    this.stars = [];
    for (let l = 0; l < 3; l++) for (let i = 0; i < [80, 50, 28][l]; i++)
      this.stars.push({ x: rand(-60, W + 60), y: rand(0, H), l, ph: rand(0, 6.28), sp: [22, 60, 140][l], r: [0.9, 1.5, 2.3][l], par: [.012, .035, .08][l] });
    this.dust = Array.from({ length: 26 }, () => ({ x: rand(-60, W + 60), y: rand(0, H), sp: rand(520, 900), len: rand(60, 170), a: rand(.06, .2) }));
    this.planets = [this.newPlanet(), this.newPlanet(), this.newPlanet()];
    this.rocks = Array.from({ length: pal.rocks || 10 }, () => this.newRock());
    this.comet = null; this.cometT = rand(2, 5); this.warp = 0; this.boost = 0;
  },

  newPlanet(top) {
    const r = rand(38, 130), pl = pick(this.pal.planets);
    return { x: rand(100, W - 100), y: top ? -r * 2.2 : rand(-100, H), r, sp: 8 + r * .22, a: rand(.5, .85), pal: pl, tilt: rand(-.6, .2), par: .02 + r / 130 * .07, ph: rand(0, 6) };
  },
  newRock(top) {
    const r = Math.random() < .2 ? rand(30, 50) : rand(7, 24), n = 9;
    const pts = Array.from({ length: n }, (_, i) => { const a = i / n * TAU, k = rand(.7, 1.15); return [Math.cos(a) * r * k, Math.sin(a) * r * k]; });
    return { x: rand(-40, W + 40), y: top ? -80 : rand(0, H), r, pts, sp: rand(50, 130) + r * 4, vx: rand(-25, 25), rot: rand(0, 6), vr: rand(-1.2, 1.2), par: .03 + r * .004, a: r > 28 ? .45 : .85 };
  },

  update(dt, vy = 0) {
    this.t += dt;
    this.warp = Math.max(0, this.warp - dt * 3);
    const up = clamp(-vy / 500, 0, 1), down = clamp(vy / 500, 0, 1);
    const target = 1 + up * .9 - down * .25 + this.warp + this.boost;
    this.scroll += (target - this.scroll) * Math.min(1, 4 * dt);
    const sc = this.scroll;
    for (const s of this.stars) { s.y += s.sp * sc * dt; if (s.y > H + 10) { s.y = -10; s.x = rand(-60, W + 60); } }
    for (const d of this.dust) { d.y += d.sp * sc * dt; if (d.y - d.len > H) { d.y = -20; d.x = rand(-60, W + 60); d.len = rand(60, 170); } }
    for (const p of this.planets) { p.y += p.sp * sc * dt; if (p.y - p.r * 2.2 > H) Object.assign(p, this.newPlanet(true)); }
    for (const k of this.rocks) {
      k.y += k.sp * sc * dt; k.x += k.vx * dt; k.rot += k.vr * dt;
      if (k.y > H + 80 || k.x < -120 || k.x > W + 120) Object.assign(k, this.newRock(true));
    }
    this.cometT -= dt;
    if (this.cometT <= 0 && !this.comet) {
      const dir = Math.random() < .5 ? 1 : -1;
      this.comet = { x: dir > 0 ? rand(-100, W * .5) : rand(W * .5, W + 100), y: -60, vx: dir * rand(300, 520), vy: rand(520, 760), c: pick(['#ffffff', '#9fe8ff', '#ffb8dc']) };
    }
    if (this.comet) {
      this.comet.x += this.comet.vx * dt; this.comet.y += this.comet.vy * dt;
      if (this.comet.y > H + 100) { this.comet = null; this.cometT = rand(4, 9); }
    }
  },

  drawPlanet(p, cx) {
    const [c0, c1, c2, hasRing] = p.pal;
    ctx.save(); ctx.translate(p.x - cx * p.par, p.y); ctx.rotate(p.tilt + Math.sin(this.t * .15 + p.ph) * .04); ctx.globalAlpha = p.a;
    const R = p.r, rx = R * 1.72, ry = R * 0.47;
    const ring = front => {
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : 2 * Math.PI);
      ctx.lineWidth = Math.max(2, R * 0.045); ctx.lineCap = 'round';
      ctx.strokeStyle = front ? '#e2d4ff' : 'rgba(226,212,255,.55)'; ctx.stroke();
    };
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.9, c1, .35); ctx.restore();
    if (hasRing) ring(false);
    const g = ctx.createRadialGradient(-R * .35, -R * .35, R * .05, 0, 0, R * 1.05);
    g.addColorStop(0, c0); g.addColorStop(.45, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.clip();
    ctx.globalAlpha = p.a * .18; ctx.fillStyle = c0;
    for (let i = -2; i <= 2; i++) { const yy = i * R * .34 + Math.sin(this.t * .4 + i + p.ph) * R * .05; ctx.fillRect(-R, yy, R * 2, R * .09); }
    ctx.restore();
    if (hasRing) ring(true);
    ctx.restore();
  },

  drawRock(k, cx) {
    ctx.save(); ctx.translate(k.x - cx * k.par, k.y); ctx.rotate(k.rot); ctx.globalAlpha = k.a;
    const g = ctx.createLinearGradient(-k.r, -k.r, k.r, k.r); g.addColorStop(0, this.pal.rock0); g.addColorStop(1, this.pal.rock1);
    ctx.beginPath(); k.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1, k.r * .06); ctx.strokeStyle = this.pal.rim; ctx.stroke();
    ctx.restore();
  },

  draw(cx) {
    const pal = this.pal, t = this.t, sc = this.scroll;
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, pal.top); bg.addColorStop(1, pal.bot);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = bg; ctx.fillRect(-10, -10, W + 20, H + 20);
    const ox = -cx * .04, off = (t * 16 * sc) % H, off2 = (t * 42 * sc) % H;
    ctx.globalAlpha = .8 + .2 * Math.sin(t * .4); ctx.drawImage(this.nebA, ox - 60, off, W + 120, H); ctx.drawImage(this.nebA, ox - 60, off - H, W + 120, H);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4 + .3 * Math.sin(t * .23 + 1);
    ctx.drawImage(this.nebB, ox * 2 - 60, off2, W + 120, H); ctx.drawImage(this.nebB, ox * 2 - 60, off2 - H, W + 120, H);
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.translate(W * (.2 + i * .3) + Math.sin(t * .12 + i * 2) * 220 - cx * .05, -100); ctx.rotate(.38);
      const g = ctx.createLinearGradient(-130, 0, 130, 0), sh = pal.shaft;
      g.addColorStop(0, `rgba(${sh},0)`); g.addColorStop(.5, `rgba(${sh},${.04 + .02 * Math.sin(t * .5 + i)})`); g.addColorStop(1, `rgba(${sh},0)`);
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(-130, 0, 260, 1500); ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round'; ctx.strokeStyle = pal.star;
    for (const s of this.stars) {
      const x = s.x - cx * s.par, len = s.sp * (.03 + (sc - 1) * .06);
      ctx.globalAlpha = (.35 + s.l * .25) * (.65 + .35 * Math.sin(t * 2 + s.ph)); ctx.lineWidth = s.r * 1.5;
      ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y - len); ctx.stroke();
    }
    for (const p of this.planets) this.drawPlanet(p, cx);
    if (typeof Events !== 'undefined') Events.drawBack(cx);
    for (const k of this.rocks) if (k.a < .5) this.drawRock(k, cx);
    for (const k of this.rocks) if (k.a >= .5) this.drawRock(k, cx);
    const c = this.comet;
    if (c) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const d = Math.hypot(c.vx, c.vy), tx = c.x - c.vx / d * 280, ty = c.y - c.vy / d * 280;
      const g = ctx.createLinearGradient(c.x, c.y, tx, ty); g.addColorStop(0, c.c); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = .9; ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();
      drawGlow(c.x, c.y, 40, c.c, .9); ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = pal.dust; ctx.lineWidth = 1.5;
    for (const d of this.dust) { ctx.globalAlpha = d.a * (.6 + (sc - 1) * .3); ctx.beginPath(); ctx.moveTo(d.x - cx * .15, d.y); ctx.lineTo(d.x - cx * .15, d.y - d.len * sc * .7); ctx.stroke(); }
    ctx.restore();
    if (typeof Events !== 'undefined') Events.drawFront();
    ctx.globalAlpha = 1;
  },
};
