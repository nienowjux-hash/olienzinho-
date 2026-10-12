'use strict';
// ---------- UI em modo imediato (mouse + teclado) ----------
const UI = {
  enterAt: 0, prev: [], cur: [], focusId: null, act: null, last: { x: -1, y: -1 }, drag: null,

  begin() {
    this.act = null;
    const m = Input.mouse, list = this.prev;
    const moved = m.x !== this.last.x || m.y !== this.last.y; this.last = { x: m.x, y: m.y };
    let hov = null;
    for (const r of list) if (!r.dis && m.x >= r.x && m.x <= r.x + r.w && m.y >= r.y && m.y <= r.y + r.h) hov = r;
    if (hov && moved && this.focusId !== hov.id) { this.focusId = hov.id; Snd.play('uiMove'); }
    if (hov && m.click && !hov.slider) { this.focusId = hov.id; this.act = hov.id; }
    const en = list.filter(r => !r.dis);
    if (en.length) {
      let idx = en.findIndex(r => r.id === this.focusId);
      if (idx < 0) { idx = 0; this.focusId = en[0].id; }
      const cur = en[idx]; let d = 0;
      if (Input.pressed('arrowdown') || Input.pressed('s')) d = 1;
      if (Input.pressed('arrowup') || Input.pressed('w')) d = -1;
      if (!cur.slider) { if (Input.pressed('arrowright') || Input.pressed('d')) d = 1; if (Input.pressed('arrowleft') || Input.pressed('a')) d = -1; }
      if (d) { idx = (idx + d + en.length) % en.length; this.focusId = en[idx].id; Snd.play('uiMove'); }
      if (Input.pressed('enter') || (!cur.slider && Input.pressed(' '))) this.act = this.focusId;
    }
    this.cur = [];
  },
  end() { this.prev = this.cur; },
  enter() { this.enterAt = World.t; },
  reset(focus) { this.prev = []; this.cur = []; this.focusId = focus || null; this.act = null; },
  focus(id) { return this.focusId === id; },

  // area clicavel sem desenho; devolve true quando acionada
  hit(id, x, y, w, h, o = {}) {
    this.cur.push({ id, x, y, w, h, dis: !!o.disabled });
    if (this.act === id) {
      this.act = null;
      if (o.disabled) { Snd.play('uiDeny'); return false; }
      Snd.play(o.sound || 'uiSelect'); return true;
    }
    return false;
  },

  button(id, x, y, w, h, label, o = {}) {
    const f = this.focusId === id, dis = !!o.disabled;
    const ent = easeBack((World.t - this.enterAt - this.cur.length * .05) / .4);
    const fired = this.hit(id, x, y, w, h, o);
    ctx.save(); ctx.globalAlpha = clamp(ent, 0, 1); ctx.translate(0, (1 - ent) * 28);
    ctx.save();
    const pulse = f ? 1 + Math.sin(World.t * 8) * .01 : 1;
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(pulse, pulse); ctx.translate(-w / 2, -h / 2);
    const sel = !!o.color && !f && !dis;
    if (f && !dis) { ctx.shadowColor = o.color || '#8b4dff'; ctx.shadowBlur = 28; } else if (sel) { ctx.shadowColor = o.color; ctx.shadowBlur = 16; }
    const gk = h + '|' + (dis ? 'd' : f ? 'f' + (o.color || '') : sel ? 's' + o.color : 'n'), GC = UI._gc || (UI._gc = {}); let g = GC[gk];
    if (!g) { g = ctx.createLinearGradient(0, 0, 0, h);
      if (dis) { g.addColorStop(0, 'rgba(60,50,90,.6)'); g.addColorStop(1, 'rgba(30,20,60,.6)'); }
      else if (f) { g.addColorStop(0, o.color || '#9a63ff'); g.addColorStop(1, '#4b2bd6'); }
      else if (sel) { g.addColorStop(0, o.color); g.addColorStop(1, '#3a1a9a'); }
      else { g.addColorStop(0, 'rgba(70,40,150,.75)'); g.addColorStop(1, 'rgba(30,14,80,.85)'); }
      GC[gk] = g; }
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, 0, w, h, Math.min(18, h / 2)); ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = f || sel ? 3 : 2; ctx.strokeStyle = f ? '#e2d4ff' : sel ? '#ffe9a8' : 'rgba(190,160,255,.35)'; ctx.stroke();
    ctx.restore();
    const sz = o.size || 26;
    txt(label, x + w / 2, y + h / 2 - (o.sub ? 10 : 0), sz, dis ? '#8a7fb0' : '#fff', 'center', 900, 'middle');
    if (o.sub) txt(o.sub, x + w / 2, y + h / 2 + 15, 15, dis ? '#7a70a0' : '#cdb8ff', 'center', 700, 'middle');
    ctx.restore();
    return fired;
  },

  slider(id, x, y, w, val) {
    const f = this.focusId === id, m = Input.mouse;
    this.cur.push({ id, x: x - 14, y: y - 18, w: w + 28, h: 40, dis: false, slider: true });
    const inside = m.x >= x - 14 && m.x <= x + w + 14 && m.y >= y - 18 && m.y <= y + 22;
    if (m.click && inside) this.drag = id;
    if (!m.down) this.drag = null;
    let v = val;
    if (this.drag === id) { v = clamp((m.x - x) / w, 0, 1); this.focusId = id; }
    if (f) { if (Input.pressed('arrowleft') || Input.pressed('a')) { v = clamp(v - .05, 0, 1); Snd.play('uiMove'); } if (Input.pressed('arrowright') || Input.pressed('d')) { v = clamp(v + .05, 0, 1); Snd.play('uiMove'); } }
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(x, y, w, 10, 5); ctx.fill();
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#8b4dff'); g.addColorStop(1, '#ffb340');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, Math.max(8, w * v), 10, 5); ctx.fill();
    ctx.save(); if (f) { ctx.shadowColor = '#b98cff'; ctx.shadowBlur = 20; }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w * v, y + 5, f ? 14 : 11, 0, 7); ctx.fill(); ctx.restore();
    return v;
  },

  panel(x, y, w, h, o = {}) {
    ctx.save();
    ctx.fillStyle = o.fill || 'rgba(20,8,55,.72)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, o.r || 22); ctx.fill();
    ctx.strokeStyle = o.stroke || 'rgba(190,160,255,.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  },

  wrap(s, x, y, maxW, lh, size, color, align = 'left', weight = 700) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    const words = s.split(' '); let line = '', yy = y;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { txt(line, x, yy, size, color, align, weight); line = w; yy += lh; } else line = t;
    }
    if (line) txt(line, x, yy, size, color, align, weight);
    return yy + lh;
  },
};
