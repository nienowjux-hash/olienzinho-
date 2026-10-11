'use strict';
// ---------- telas: titulo, mapa, loja, opcoes, pausa, level-up, fim de fase, fim de jogo ----------
const Screens = {
  wrapLines(text, maxW, size, weight = 700) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    const lines = []; let line = '';
    for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    return lines;
  },
  // escreve so os primeiros `shown` caracteres (efeito maquina de escrever)
  typed(lines, shown, x, y, lh, size, color, align = 'left', weight = 700) {
    let left = shown;
    for (const ln of lines) {
      if (left <= 0) break;
      ctx.font = `${weight} ${size}px ${FONT}`;
      const x0 = align === 'center' ? x - ctx.measureText(ln).width / 2 : x;
      txt(ln.slice(0, left), x0, y, size, color, 'left', weight);
      left -= ln.length + 1; y += lh;
    }
  },
  orbi(x, y, s, a) {
    const t = World.t; ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 8 * s); ctx.globalAlpha = a;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 130 * s, '#7fe0ff', .9); ctx.restore(); ctx.globalAlpha = a;
    ctx.fillStyle = rdl(-18 * s, -22 * s, 4, 62 * s, [[0, '#ffffff'], [.45, '#7fe0ff'], [1, '#1b6aa8']]); ctx.beginPath(); ctx.arc(0, 0, 58 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3 * s; ctx.save(); ctx.rotate(-.4 + Math.sin(t) * .1); ctx.beginPath(); ctx.ellipse(0, 0, 84 * s, 22 * s, 0, 0, TAU); ctx.stroke();
    const sa = t * 2; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(sa) * 84 * s, Math.sin(sa) * 22 * s, 6 * s, 0, 7); ctx.fill(); ctx.restore();
    const bl = (t % 4) < .14 ? .15 : 1;
    ctx.fillStyle = '#0e2a52'; for (const e of [-1, 1]) { ctx.beginPath(); ctx.ellipse(e * 20 * s, -4 * s, 9 * s, 13 * s * bl, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#fff'; for (const e of [-1, 1]) { ctx.beginPath(); ctx.arc(e * 20 * s - 3 * s, -9 * s, 3 * s, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#0e2a52'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 12 * s, 12 * s, .2, Math.PI - .2); ctx.stroke();
    ctx.restore();
  },

  // ---- cenas de fundo da historia ----
  sceneVoid(t) {
    const cx = W / 2, cy = H * .4;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,170,255,.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 30; i++) { const a = i * 2.399 + 1, p = (t * .22 + i * .137) % 1, r0 = 640 * (1 - p), r1 = r0 * .9; ctx.globalAlpha = p * .8; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .7); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .7); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = rdl(cx, cy, 10, 380, [[0, '#000'], [.45, 'rgba(4,1,18,.97)'], [.75, 'rgba(40,10,90,.55)'], [1, 'rgba(120,70,220,0)']]); ctx.beginPath(); ctx.arc(cx, cy, 380, 0, 7); ctx.fill();
    for (let k = 0; k < 5; k++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * (.15 + k * .05) * (k % 2 ? -1 : 1) + k); ctx.strokeStyle = `rgba(150,90,255,${.14 + k * .04})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 300 - k * 34, 120 + k * 22, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) { drawGlow(cx + s * 60, cy - 6, 50, '#b98cff', .7 + Math.sin(t * 2) * .2); ctx.fillStyle = '#f2e8ff'; ctx.beginPath(); ctx.ellipse(cx + s * 60, cy - 6, 30, 5, s * -.2, 0, 7); ctx.fill(); } ctx.restore(); ctx.globalAlpha = 1;
  },
  sceneHeart(t) {
    const cx = W / 2, cy = H * .38, pu = 1 + Math.sin(t * 3) * .06;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(cx, cy, 340 * pu, '#ffe9a8', .8); drawGlow(cx, cy, 170, '#ffffff', .9);
    ctx.strokeStyle = 'rgba(255,233,168,.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .15; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70); ctx.lineTo(cx + Math.cos(a) * (240 + Math.sin(t * 2 + i) * 30), cy + Math.sin(a) * (240 + Math.sin(t * 2 + i) * 30)); ctx.stroke(); }
    const cols = ['#ffb340', '#c8a0b8', '#ff7ac8', '#ff8a1f'];
    for (let i = 0; i < 4; i++) { const a = t * .5 + i * Math.PI / 2; drawGlow(cx + Math.cos(a) * 230, cy + Math.sin(a) * 120, 60, cols[i], .9); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pu, pu); ctx.fillStyle = rdl(0, 0, 4, 70, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#ffb340']]);
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU - Math.PI / 2, r = i % 2 ? 34 : 74; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) { const a = t * .5 + i * Math.PI / 2; ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 230, cy + Math.sin(a) * 120, 14, 0, 7); ctx.fill(); }
  },
  sceneLumi(t) {
    const cx = W / 2, cy = H * .38;
    const fl = .5 + Math.sin(t * 22) * .06 - (Math.random() < .05 ? .3 : 0), gl = Math.random() < .03 ? rand(-14, 14) : 0;
    ctx.save(); ctx.translate(cx + gl, cy); ctx.globalAlpha = fl; ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 300, '#ffd36a', .8);
    ctx.fillStyle = rdl(0, 0, 6, 160, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#e0a030']]);
    ctx.save(); ctx.rotate(t * .2); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 88 : 170; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.restore(); ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = 'rgba(8,2,26,1)'; for (let y = cy - 190; y < cy + 190; y += 6) ctx.fillRect(cx - 200, y, 400, 2); ctx.restore(); ctx.globalAlpha = 1;
  },
  sceneBoss(S, t) {
    if (!S.bossObj) { try { const b = new BOSS_CLASSES[G.stage.boss](); b.state = 'fight'; S.bossObj = b; } catch (e) { return; } }
    const b = S.bossObj; b.t = t; b.x = W / 2; b.y = 250; b.flash = 0; b.phase = 0;
    ctx.save(); ctx.globalAlpha = .55; ctx.translate(W / 2 + Math.sin(t * .3) * 22, 250); ctx.scale(1.6, 1.6); ctx.translate(-b.x, -b.y);
    try { b.draw(); } catch (e) { /* so cenario */ }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(20,6,50,.5)'; ctx.fillRect(0, 0, W, H);
  },
  storyBackdrop() {
    const S = G.story, pg = S && S.pages[S.i], t = World.t;
    ctx.save();
    const z = 1 + clamp((S ? S.t : 0) / 16, 0, 1) * .06;
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    World.draw(Math.sin(t * .2) * 70);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const sc = pg && (pg.scene || (pg.mission ? 'boss' : null));
    if (sc === 'void') this.sceneVoid(t); else if (sc === 'heart') this.sceneHeart(t); else if (sc === 'lumi') this.sceneLumi(t); else if (sc === 'boss') this.sceneBoss(S, t);
    ctx.restore();
  },

  story() {
    const S = G.story; if (!S) return;
    const pg = S.pages[S.i]; if (!pg) { Game.endStory(); return; }
    const now = World.t, dt = Math.min(.05, now - (S.last ?? now)); S.last = now; S.t += dt;
    const t = now, adv = Input.pressed(' ') || Input.pressed('enter') || Input.mouse.click;
    const narr = pg.who === 'N', title = !!pg.title, mis = !!pg.mission;
    const next = () => { S.i++; S.t = 0; S.lastShown = 0; S.doneAt = null; Snd.play('uiSelect'); if (S.i >= S.pages.length) Game.endStory(); };
    ctx.globalAlpha = 1; ctx.fillStyle = `rgba(8,2,26,${title ? .88 : mis ? .6 : narr ? .42 : .22})`; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rdl(W / 2, H / 2, H * .35, H * .95, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.7)']]); ctx.fillRect(0, 0, W, H);
    const BH = 64;

    if (title) { // cartao de titulo (ato / setor)
      const k = easeOut(S.t / 1.1);
      ctx.save(); ctx.translate(W / 2, H / 2 - 10);
      ctx.fillStyle = '#ffb340'; const lw = 560 * k; ctx.fillRect(-lw / 2, -112, lw, 3); ctx.fillRect(-lw / 2, 62, lw, 3);
      ctx.globalAlpha = clamp((S.t - .25) / .5, 0, 1); txt(pg.title.split('').join(' '), 0, -96, 28, '#ffb340', 'center', 900);
      ctx.globalAlpha = clamp((S.t - .6) / .7, 0, 1); ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 40; txt(pg.sub, 0, -56, pg.sub.length > 16 ? 70 : 84, '#ffffff', 'center', 900); ctx.restore();
      ctx.globalAlpha = 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sw = (S.t * .5) % 1.6 - .3; drawGlow(-300 + sw * 600, -4, 160, '#ffe9a8', .5 * k); ctx.restore(); ctx.globalAlpha = 1;
      if (S.t > 2) { ctx.globalAlpha = .5 + .4 * Math.sin(t * 5); txt('clique ou ENTER para continuar', 0, 100, 17, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1; }
      ctx.restore();
      if (adv && S.t > 1.2) next();
    } else if (mis) { // cartao da missao
      const m = pg.mission, k = easeBack(S.t / .6);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k);
      UI.panel(-430, -190, 860, 380, { fill: 'rgba(20,8,55,.9)', stroke: '#ffb340' });
      txt('MISSÃO ' + m.n, 0, -160, 26, '#ffb340', 'center', 900);
      ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 30; txt(m.title, 0, -118, 62, '#ffffff', 'center', 900); ctx.restore();
      ctx.fillStyle = '#ffb340'; ctx.fillRect(-80, -40, 160, 4);
      UI.wrap(m.goal, 0, -10, 720, 36, 28, '#e2d4ff', 'center', 700);
      txt('CHEFE:  ' + m.boss, 0, 100, 24, '#ff8a5f', 'center', 900);
      ctx.globalAlpha = .55 + .4 * Math.sin(t * 5); txt('clique ou ENTER para começar', 0, 146, 18, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1;
      ctx.restore();
      if (adv && S.t > .6) next();
    } else { // dialogo
      const ch = CHARS[pg.who], text = pg.text, len = text.length, sp = 44;
      const shown = Math.min(len, Math.floor(S.t * sp));
      if (shown > S.lastShown && text[shown - 1] !== ' ' && shown % 2 === 0) Snd.play('blip', { who: pg.who });
      S.lastShown = shown;
      if (shown >= len && S.doneAt === null) S.doneAt = now;
      if (S.prevWho !== pg.who) { S.prevWho = pg.who; S.sw = 0; } S.sw += dt;
      const talking = shown < len, y0 = 420, y1 = H - BH;
      // faixa do dialogo (legenda de cinema)
      ctx.fillStyle = lin(0, y0, 0, y1, [[0, 'rgba(8,2,26,0)'], [.3, 'rgba(8,2,26,.82)'], [1, 'rgba(8,2,26,.96)']]); ctx.fillRect(0, y0, W, y1 - y0);
      if (narr) {
        const lines = this.wrapLines(text, 920, 32, 700);
        ctx.fillStyle = '#ffb340'; ctx.fillRect(W / 2 - 40, y0 + 52, 80, 3);
        ctx.save(); ctx.globalAlpha = Math.min(1, S.t / .3); this.typed(lines, shown, W / 2, y0 + 78, 46, 32, '#e2d4ff', 'center', 700); ctx.restore();
        if (!talking) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 6); txt('▼', W / 2, y1 - 40, 20, '#cdb8ff', 'center'); ctx.globalAlpha = 1; }
      } else {
        const sl = easeOut(S.sw / .3);
        ctx.save(); ctx.globalAlpha = sl; ctx.translate((1 - sl) * -30, 0);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(150, 540, 170, ch.c, talking ? .5 : .25); ctx.restore(); ctx.globalAlpha = sl;
        Portraits.draw(pg.who, 150, 540, 190, { mood: pg.mood, talk: talking, t });
        ctx.restore();
        txt(ch.name, 272, y0 + 46, 22, ch.c, 'left', 900);
        ctx.fillStyle = ch.c; ctx.fillRect(272, y0 + 76, 54, 3);
        const lines = this.wrapLines(text, 830, 30, 700);
        this.typed(lines, shown, 272, y0 + 92, 40, 30, '#ffffff', 'left', 700);
        if (!talking) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 6); txt('▼', 1130, y1 - 40, 20, ch.c, 'center'); ctx.globalAlpha = 1; }
      }
      if (adv && S.t > .1) { if (talking) S.t = len / sp + .01; else if (now - S.doneAt > .3) next(); }
    }
    // barras de cinema, progresso e dicas
    ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, BH); ctx.fillRect(0, H - BH, W, BH);
    const pw = 260, px = W / 2 - pw / 2; ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(px, BH / 2 - 2, pw, 4); ctx.fillStyle = '#ffb340'; ctx.fillRect(px, BH / 2 - 2, pw * clamp((S.i + 1) / S.pages.length, 0, 1), 4);
    txt('ESC  pular cena', W - 28, BH / 2 - 9, 16, '#8a7fb0', 'right', 800);
    txt('clique / ENTER: continuar', W / 2, H - BH / 2 - 9, 16, '#8a7fb0', 'center', 800);
    if (Input.pressed('escape')) { Snd.play('uiBack'); Game.endStory(); }
  },

  dim(a = .72) { ctx.globalAlpha = 1; ctx.fillStyle = `rgba(10,3,30,${a})`; ctx.fillRect(0, 0, W, H); },
  blinkAt(t) { const ph = t % 4; return ph < .16 ? .16 - ph : 0; },
  stars() { return '★ ' + Save.data.coins; },

  // ---- menu principal cinematografico ----
  dyingStars(t) {
    const pos = [[180, 130], [430, 78], [770, 150], [1110, 96], [300, 340], [930, 310], [1210, 270]];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    pos.forEach(([x, y], i) => {
      const c = (t * .1 + i * .37) % 1; let b = 1;
      if (c > .55 && c < .8) b = Math.random() < .5 ? .15 : .9; else if (c >= .8 && c < .95) b = .04; else if (c >= .95) b = (c - .95) / .05;
      drawGlow(x, y, 26, '#e2d4ff', b * .8);
      ctx.globalAlpha = b; ctx.fillStyle = '#fff'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 2.5 : 9; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    });
    ctx.restore(); ctx.globalAlpha = 1;
  },
  voidEdges(t) {
    for (const [x, y, sg] of [[0, H, 1], [W, 0, -1]]) {
      const r = 560 + Math.sin(t * .6 + sg) * 40;
      ctx.fillStyle = rdl(x, y, 20, r, [[0, 'rgba(2,0,12,.96)'], [.55, 'rgba(8,2,30,.7)'], [1, 'rgba(8,2,30,0)']]); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 1.3 + .1, sw = Math.sin(t * .8 + i * 1.7) * 30, l = 340 + i * 36;
        ctx.strokeStyle = `rgba(150,90,255,${.22 - i * .02})`; ctx.lineWidth = 6 - i * .8;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + sg * l * .3, y - sg * (l * .2 + sw), x + sg * l * .7, y - sg * (l * .6 - sw), x + sg * l * Math.cos(a), y - sg * l * Math.sin(a) * .9); ctx.stroke();
      }
      ctx.restore();
    }
  },
  titleBackdrop() {
    const t = World.t, tt = t - (G.titleStart ?? t), dt = Math.min(.05, t - (this.tl ?? t)); this.tl = t;
    const mx = Input.mouse.x - W / 2;
    ctx.save();
    const z = 1.07 - easeOut(tt / 7) * .06 + Math.sin(t * .15) * .006;
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    World.draw(mx * .3);
    // planeta gigante com anel (luz de borda)
    const P = this.bigPlanet || (this.bigPlanet = { x: 1040, y: 760, r: 340, a: 1, pal: PLANET_PALS.violet, tilt: -.38, par: .04, ph: 0 });
    World.drawPlanet(P, mx);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,233,168,.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(P.x - mx * P.par, P.y, P.r + 2, Math.PI * 1.08, Math.PI * 1.5); ctx.stroke(); drawGlow(P.x - 250 - mx * P.par, P.y - 240, 140, '#ffe9a8', .5); ctx.restore(); ctx.globalAlpha = 1;
    this.dyingStars(t);
    // feixes de luz
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(120 + i * 280 + Math.sin(t * .2 + i) * 40, -60); ctx.rotate(.45); ctx.fillStyle = lin(0, 0, 0, 900, [[0, 'rgba(255,233,168,.1)'], [1, 'rgba(255,233,168,0)']]); ctx.fillRect(-40, 0, 80, 900); ctx.restore(); }
    ctx.restore();
    this.voidEdges(t);
    // nave entra voando e depois paira
    const fl = easeOut(clamp((tt - .5) / 3.4, 0, 1)), sx = lerp(-260, 800, fl), sy = 320 + Math.sin(t * 1.4) * 14 - fl * 20, mov = (1 - fl) * 700 + 60;
    this.trail = this.trail || [];
    this.trail.push({ x: sx - 16, y: sy + 44, vx: rand(-30, 10) - mov * .4, vy: rand(60, 120), life: .6 });
    for (const q of this.trail) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    this.trail = this.trail.filter(q => q.life > 0).slice(-120);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const q of this.trail) drawGlow(q.x, q.y, 12 + q.life * 16, Math.random() < .5 ? '#ffb340' : '#ffe9a8', q.life); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sx, sy, 200, '#8b4dff', .45); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-.5 + fl * .22); ctx.translate(-sx, -sy);
    Art.ship(sx, sy, { vx: (1 - fl) * 500, t, lookx: clamp((Input.mouse.x - sx) / 500, -1, 1), looky: clamp((Input.mouse.y - sy) / 500, -1, 1), blinkT: this.blinkAt(t), scale: 1.35, boost: .6 });
    ctx.restore();
    // reflexo de lente
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fx = P.x - 250 - mx * P.par, fy = P.y - 240;
    ctx.globalAlpha = .22 + Math.sin(t * .8) * .06; ctx.fillStyle = lin(fx - 380, fy, fx + 380, fy, [[0, 'rgba(255,233,168,0)'], [.5, 'rgba(255,233,168,1)'], [1, 'rgba(255,233,168,0)']]); ctx.fillRect(fx - 380, fy - 2, 760, 4);
    for (const [k, r, c] of [[.4, 26, '#8b4dff'], [.8, 14, '#33c4ff'], [1.3, 40, '#ffb340']]) drawGlow(lerp(fx, W / 2, k * .5), lerp(fy, H / 2, k * .5), r, c, .25);
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.restore();
  },

  title() {
    const t = World.t;
    if (G.titleStart === undefined) G.titleStart = t;
    let tt = t - G.titleStart;
    if (tt < 3.2 && (Input.any() || Input.mouse.click)) { G.titleStart = t - 3.3; tt = 3.3; }
    const bh = 54 * easeOut(tt / 1.2);
    // logotipo, letra por letra
    const word = 'OLIENZINHO', X0 = 112, Y0 = 262;
    ctx.save(); ctx.font = `900 124px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const ws = [...word].map(c => ctx.measureText(c).width), total = ws.reduce((a, b) => a + b, 0), sweep = (t * .22) % 1.8 - .3;
    ctx.fillStyle = lin(X0, 0, X0 + total, 0, [[0, '#ffffff'], [clamp(sweep - .12, 0, 1), '#c9a8ff'], [clamp(sweep, 0, 1), '#ffffff'], [clamp(sweep + .12, 0, 1), '#c9a8ff'], [1, '#a77bff']]);
    let x = X0;
    [...word].forEach((c, i) => {
      const a = clamp((tt - (1 + i * .085)) / .5, 0, 1);
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 44; ctx.fillText(c, x, Y0 + (1 - easeOut(a)) * 46); ctx.restore(); }
      x += ws[i];
    });
    ctx.restore();
    const sa = clamp((tt - 2.2) / .8, 0, 1);
    if (sa > 0) {
      ctx.globalAlpha = sa; ctx.fillStyle = '#ffb340'; ctx.fillRect(X0 + 4, Y0 + 26, 70 * sa, 4);
      txt('G U A R D I Ã O   D A S   E S T R E L A S', X0 + 4, Y0 + 44, 24, '#ffb340', 'left', 800); ctx.globalAlpha = 1;
    }
    // menu lateral
    if (tt >= 3) {
      UI.enterAt = G.titleStart + 3;
      if (UI.button('play', X0, 372, 360, 66, 'JOGAR', { size: 30, color: '#9a63ff' })) Game.goSelect();
      if (UI.button('shop', X0, 450, 360, 54, 'LOJA', { size: 22, sub: this.stars() })) { G.shopBack = 'title'; G.state = 'shop'; }
      if (UI.button('opt', X0, 516, 360, 54, 'OPÇÕES', { size: 22 })) { G.setBack = 'title'; G.state = 'settings'; }
    } else if (tt > 2.3 && !Snd.ready) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 4); txt('PRESSIONE QUALQUER TECLA', X0 + 4, 400, 22, '#e2d4ff', 'left', 800); ctx.globalAlpha = 1; }
    txt('olien.digital', X0 + 4, H - bh - 36, 16, '#8a7fb0', 'left', 800);
    txt('Parte 1 — O Coração Partido', W - 40, H - bh - 36, 16, '#8a7fb0', 'right', 800);
    // barras de cinema e fade inicial
    ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    if (tt < 1.6) { ctx.globalAlpha = 1 - easeOut(tt / 1.6); ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  },

  lock(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#cdb8ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 11, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#cdb8ff'; ctx.beginPath(); ctx.roundRect(-16, -8, 32, 26, 5); ctx.fill();
    ctx.fillStyle = '#2a1478'; ctx.beginPath(); ctx.arc(0, 4, 4, 0, 7); ctx.fill(); ctx.restore();
  },

  select() {
    const t = World.t, unlocked = Save.data.unlocked;
    txt('ESCOLHA A FASE', W / 2, 36, 40, '#fff', 'center');
    txt(this.stars(), W - 26, 40, 26, '#ffcf6b', 'right');
    const pos = i => [200 + i * 293, 215 + (i % 2 ? 46 : -6)];
    // trilha
    ctx.save(); ctx.strokeStyle = 'rgba(190,160,255,.4)'; ctx.lineWidth = 4; ctx.setLineDash([4, 14]); ctx.lineCap = 'round';
    ctx.beginPath(); STAGES.forEach((s, i) => { const [x, y] = pos(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.restore();
    STAGES.forEach((s, i) => {
      const [x, y0] = pos(i), locked = i >= unlocked, sel = i === G.sel, y = y0 + (sel ? Math.sin(t * 3) * 5 : 0), R = sel ? 62 : 52;
      if (UI.hit('stage' + i, x - R, y - R, R * 2, R * 2, { disabled: false })) { if (!locked) { Game.startStage(i); return; } Snd.play('uiDeny'); }
      if (UI.focus('stage' + i) && G.sel !== i) { G.sel = i; World.setStage(STAGES[i].pal); }
      ctx.save(); ctx.translate(x, y);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.2, locked ? '#5a4a90' : s.tint, sel ? .55 : .3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const gr = ctx.createRadialGradient(-R * .35, -R * .35, 4, 0, 0, R);
      if (locked) { gr.addColorStop(0, '#6a5aa0'); gr.addColorStop(1, '#241a50'); } else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, s.tint); gr.addColorStop(1, '#1a0840'); }
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      ctx.strokeStyle = locked ? 'rgba(190,160,255,.3)' : '#e2d4ff'; ctx.lineWidth = sel ? 4 : 2; ctx.stroke();
      if (i % 2 === 0) { ctx.strokeStyle = 'rgba(226,212,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.6, R * .42, -.35, 0, TAU); ctx.stroke(); }
      if (locked) this.lock(0, 0, 1.2);
      else txt(String(i + 1), 0, 0, 40, '#fff', 'center', 900, 'middle');
      ctx.restore();
      if (sel) Art.ship(x, y - R - 44, { vx: 0, t, scale: .5, blinkT: 0, lookx: 0, looky: .5 });
      if (Save.data.best[i]) txt('★'.repeat(Math.min(3, 1 + Math.floor(Save.data.best[i] / 2500))), x, y + R + 14, 20, '#ffcf6b', 'center');
    });
    const s = STAGES[G.sel], locked = G.sel >= unlocked;
    UI.panel(140, 360, 1000, 190);
    txt('FASE ' + (G.sel + 1), 176, 380, 18, s.tint, 'left', 900);
    txt(s.name, 176, 402, 36, '#fff');
    UI.wrap(locked ? 'Derrote o chefe da fase anterior para desbloquear.' : s.desc, 176, 454, 560, 26, 21, '#cdb8ff');
    txt('CHEFE', 800, 380, 18, '#ff8a5f'); txt(locked ? '???' : s.bossName, 800, 402, 28, '#fff');
    txt('MELHOR', 800, 454, 18, '#ffcf6b'); txt(String(Save.data.best[G.sel] || 0) + ' pts', 800, 476, 28, '#fff');
    if (UI.button('go', 140, 580, 330, 62, locked ? 'BLOQUEADA' : 'JOGAR', { size: 28, disabled: locked, color: '#9a63ff' })) { Game.startStage(G.sel); return; }
    if (UI.button('shop2', 490, 580, 330, 62, 'LOJA', { size: 24, sub: this.stars() })) { G.shopBack = 'select'; G.state = 'shop'; }
    if (UI.button('back', 840, 580, 300, 62, 'VOLTAR', { size: 24 })) { Snd.play('uiBack'); Game.goTitle(); }
    if (Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
  },

  shop() {
    txt('LOJA DO OLIENZINHO', W / 2, 30, 40, '#fff', 'center');
    txt('Melhorias permanentes para todas as fases', W / 2, 78, 18, '#cdb8ff', 'center', 700);
    txt(this.stars(), W - 40, 38, 32, '#ffcf6b', 'right');
    SHOP_ITEMS.forEach((it, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 80 + col * 560, y = 130 + row * 112, w = 540, h = 100;
      const lv = shopLevel(it.id), maxed = lv >= it.max, cost = maxed ? 0 : it.cost(lv), can = !maxed && Save.data.coins >= cost;
      const id = 'item' + it.id, f = UI.focus(id);
      if (UI.hit(id, x, y, w, h, { sound: 'buy' })) {
        if (can) { Save.data.coins -= cost; Save.data.shop[it.id] = lv + 1; Save.save(); G.buyFlash = { id, t: 0 }; }
        else { Snd.play('uiDeny'); }
      }
      ctx.save();
      if (f) { ctx.shadowColor = it.col; ctx.shadowBlur = 24; }
      UI.panel(x, y, w, h, { fill: f ? 'rgba(60,30,140,.85)' : 'rgba(20,8,55,.72)', stroke: f ? '#e2d4ff' : 'rgba(190,160,255,.35)', r: 18 });
      ctx.restore();
      ctx.fillStyle = it.col; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, 8, h - 28, 4); ctx.fill();
      txt(it.name, x + 38, y + 14, 26, '#fff'); txt(it.desc, x + 38, y + 48, 16, '#cdb8ff', 'left', 700);
      for (let k = 0; k < it.max; k++) { ctx.fillStyle = k < lv ? it.col : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.roundRect(x + 38 + k * 22, y + 74, 18, 8, 4); ctx.fill(); }
      const bf = G.buyFlash && G.buyFlash.id === id ? 1 - G.buyFlash.t * 2.5 : 0;
      if (bf > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = bf * .5; ctx.fillStyle = it.col; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.restore(); G.buyFlash.t += .016; }
      if (maxed) txt('MÁXIMO', x + w - 24, y + 36, 26, '#ffe9a8', 'right');
      else txt('★ ' + cost, x + w - 24, y + 36, 28, can ? '#ffcf6b' : '#7a70a0', 'right');
    });
    if (UI.button('back', W / 2 - 160, 600, 320, 58, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) {
      Snd.play('uiBack');
      if (G.shopBack === 'select') Game.goSelect(); else if (G.shopBack === 'clear') G.state = 'clear'; else if (G.shopBack === 'over') G.state = 'over'; else Game.goTitle();
    }
  },

  settings() {
    const s = Save.data.settings;
    UI.panel(300, 120, 680, 440);
    txt('OPÇÕES', W / 2, 146, 40, '#fff', 'center');
    txt('MÚSICA  ' + Math.round(s.music * 100) + '%', 360, 230, 22, '#e2d4ff');
    const m = UI.slider('music', 360, 275, 560, s.music);
    txt('EFEITOS SONOROS  ' + Math.round(s.sfx * 100) + '%', 360, 330, 22, '#e2d4ff');
    const e = UI.slider('sfx', 360, 375, 560, s.sfx);
    if (m !== s.music || e !== s.sfx) {
      const sfxChanged = e !== s.sfx; s.music = m; s.sfx = e; Snd.setVolumes(s.sfx, s.music); Save.save();
      if (sfxChanged && !G.sfxTest) { Snd.play('explode', { size: .5 }); G.sfxTest = 10; }
    }
    if (G.sfxTest) G.sfxTest--;
    const sure = G.confirmReset;
    if (UI.button('reset', 360, 440, 560, 50, sure ? 'TEM CERTEZA? CLIQUE DE NOVO' : 'APAGAR PROGRESSO', { size: 20, color: '#c2185b' })) {
      if (sure) { Save.reset(); G.confirmReset = false; Snd.setVolumes(Save.data.settings.sfx, Save.data.settings.music); G.sel = 0; } else G.confirmReset = true;
    }
    if (UI.button('back', 360, 502, 560, 44, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) {
      G.confirmReset = false; Snd.play('uiBack');
      if (G.setBack === 'pause') G.state = 'pause'; else Game.goTitle();
    }
  },

  pause() {
    this.dim(.6);
    txt('PAUSADO', W / 2, 190, 64, '#fff', 'center');
    if (UI.button('resume', W / 2 - 190, 290, 380, 62, 'CONTINUAR', { size: 28, color: '#9a63ff' }) || Input.pressed('escape') || Input.pressed('p')) { G.state = 'play'; Snd.play('uiSelect'); }
    if (UI.button('opt', W / 2 - 190, 368, 380, 56, 'OPÇÕES', { size: 24 })) { G.setBack = 'pause'; G.state = 'settings'; }
    if (UI.button('quit', W / 2 - 190, 440, 380, 56, 'SAIR PARA O MAPA', { size: 22, sub: 'as estrelas coletadas ficam com você' })) Game.quitRun();
  },

  levelup() {
    this.dim(.72);
    txt('SUBIU DE NÍVEL!', W / 2, 110, 70, '#fff', 'center');
    txt('NÍVEL ' + G.level, W / 2, 190, 26, '#ffb340', 'center', 800);
    const cw = 330, ch = 300, gap = 36, x0 = W / 2 - (cw * 3 + gap * 2) / 2, y0 = 250;
    G.options.forEach((u, i) => {
      const x = x0 + i * (cw + gap), rar = RARITY[u.r], id = 'up' + i, f = UI.focus(id);
      if (UI.hit(id, x, y0, cw, ch) || Input.pressed(String(i + 1))) { Game.chooseUpgrade(i); return; }
      ctx.save(); if (f) { ctx.shadowColor = rar.c; ctx.shadowBlur = 36; }
      const g = ctx.createLinearGradient(0, y0, 0, y0 + ch); g.addColorStop(0, f ? '#4b2bd6' : '#2f1782'); g.addColorStop(1, '#14083a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y0, cw, ch, 22); ctx.fill();
      ctx.strokeStyle = f ? '#fff' : rar.c; ctx.lineWidth = f ? 4 : 2; ctx.stroke(); ctx.restore();
      ctx.fillStyle = rar.c; ctx.beginPath(); ctx.roundRect(x, y0, cw, 8, [22, 22, 0, 0]); ctx.fill();
      txt(rar.name, x + cw / 2, y0 + 26, 15, rar.c, 'center', 900);
      txt(String(i + 1), x + 18, y0 + 24, 22, '#8a7fb0');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x + cw / 2, y0 + 96, 60, rar.c, .7); ctx.restore(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.beginPath();
      for (let k = 0; k < 10; k++) { const r = k % 2 ? 11 : 26, a = k * TAU / 10 - Math.PI / 2 + World.t * (f ? 1.5 : 0); ctx.lineTo(x + cw / 2 + Math.cos(a) * r, y0 + 96 + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill();
      txt(u.name, x + cw / 2, y0 + 150, 26, '#fff', 'center');
      UI.wrap(u.desc, x + cw / 2, y0 + 194, cw - 44, 24, 18, '#cdb8ff', 'center');
      const have = G.upCounts[u.id] || 0;
      if (u.max < 90) txt('Nível ' + have + ' → ' + (have + 1) + (u.max < 90 ? ' / ' + u.max : ''), x + cw / 2, y0 + ch - 34, 16, rar.c, 'center', 800);
    });
    txt('Clique, aperte 1 / 2 / 3 ou use as setas + Enter', W / 2, 590, 18, '#8a7fb0', 'center', 700);
  },

  clear() {
    const r = G.result; this.dim(.7);
    txt('FASE COMPLETA!', W / 2, 90, 78, '#ffe9a8', 'center');
    txt(G.stage.name, W / 2, 180, 28, '#fff', 'center');
    UI.panel(380, 230, 520, 270);
    const rows = [['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Nível alcançado', String(r.level)], ['Estrelas coletadas', '★ ' + r.coins], ['Bônus do chefe', '★ ' + r.bonus]];
    rows.forEach(([a, b], i) => { txt(a, 420, 254 + i * 44, 22, '#cdb8ff', 'left', 700); txt(b, 860, 252 + i * 44, 26, i > 2 ? '#ffcf6b' : '#fff', 'right'); });
    if (r.best === r.score) txt('NOVO RECORDE!', W / 2, 472, 18, '#ffb340', 'center');
    const last = G.stageIdx + 1 >= STAGES.length;
    if (UI.button('next', 340, 540, 300, 62, last ? 'MAPA' : 'PRÓXIMA FASE', { size: 26, color: '#9a63ff', sub: last ? 'você zerou tudo!' : '' })) { G.sel = last ? 0 : G.stageIdx + 1; Game.goSelect(); }
    if (UI.button('shop', 660, 540, 280, 62, 'LOJA', { size: 24, sub: this.stars() })) { G.shopBack = 'clear'; G.state = 'shop'; }
  },

  over() {
    const r = G.result; this.dim(.75);
    txt('NAVE DESTRUÍDA', W / 2, 100, 74, '#ff7ac8', 'center');
    txt('O Olienzinho vai tentar de novo.', W / 2, 190, 24, '#cdb8ff', 'center', 700);
    UI.panel(400, 240, 480, 190);
    [['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Estrelas guardadas', '★ ' + r.coins]].forEach(([a, b], i) => { txt(a, 436, 266 + i * 50, 22, '#cdb8ff', 'left', 700); txt(b, 844, 264 + i * 50, 26, i > 1 ? '#ffcf6b' : '#fff', 'right'); });
    if (UI.button('retry', 320, 480, 300, 62, 'TENTAR DE NOVO', { size: 24, color: '#9a63ff' })) Game.startStage(G.stageIdx, { skipStory: true });
    if (UI.button('shop', 640, 480, 140, 62, 'LOJA', { size: 22 })) { G.shopBack = 'over'; G.state = 'shop'; }
    if (UI.button('map', 800, 480, 160, 62, 'MAPA', { size: 22 })) Game.goSelect();
    txt('Dica: gaste as estrelas na loja para ficar mais forte.', W / 2, 570, 18, '#8a7fb0', 'center', 700);
  },
};
