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

  story() {
    const S = G.story; if (!S) return;
    const pg = S.pages[S.i]; if (!pg) { Game.endStory(); return; }
    const now = World.t, dt = Math.min(.05, now - (S.last ?? now)); S.last = now; S.t += dt;
    const t = World.t, narr = pg.who === 'N', mis = !!pg.mission;
    ctx.globalAlpha = 1; ctx.fillStyle = `rgba(8,2,26,${narr || mis ? .62 : .32})`; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, 54); ctx.fillRect(0, H - 54, W, 54);
    const adv = (Input.pressed(' ') || Input.pressed('enter') || Input.mouse.click);

    if (mis) { // cartao da missao
      const m = pg.mission, k = easeBack(S.t / .6);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k);
      UI.panel(-420, -190, 840, 380, { fill: 'rgba(20,8,55,.88)', stroke: '#ffb340' });
      txt('MISSÃO ' + m.n, 0, -160, 26, '#ffb340', 'center', 900);
      ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 30; txt(m.title, 0, -118, 62, '#ffffff', 'center', 900); ctx.restore();
      ctx.fillStyle = '#ffb340'; ctx.fillRect(-80, -40, 160, 4);
      UI.wrap(m.goal, 0, -10, 700, 36, 28, '#e2d4ff', 'center', 700);
      txt('CHEFE:  ' + m.boss, 0, 100, 24, '#ff8a5f', 'center', 900);
      ctx.globalAlpha = .55 + .4 * Math.sin(t * 5); txt('clique ou ENTER para começar', 0, 146, 18, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1;
      ctx.restore();
      if (adv && S.t > .5) { S.i++; S.t = 0; S.lastShown = 0; Snd.play('uiSelect'); if (S.i >= S.pages.length) { Game.endStory(); return; } }
    } else {
      const ch = CHARS[pg.who], text = pg.text, len = text.length, sp = 46;
      const shown = Math.min(len, Math.floor(S.t * sp));
      if (shown > S.lastShown && text[shown - 1] !== ' ' && shown % 2 === 0) Snd.play('blip', { who: pg.who });
      S.lastShown = shown;
      if (!narr) {
        const hasB = S.pages.some(p => p.who === 'B');
        const oa = pg.who === 'O';
        const k = easeOut(S.t / .35);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(250, 290, 240, '#8b4dff', oa ? .5 : .15); ctx.restore(); ctx.globalAlpha = 1;
        ctx.globalAlpha = oa ? 1 : .5;
        Art.ship(250, 290 + Math.sin(t * 2) * 8, { vx: 0, t, lookx: .5, looky: 0, blinkT: (t % 4) < .16 ? .16 - (t % 4) : 0, scale: oa ? 1.9 : 1.5, mood: pg.who === 'O' ? pg.mood : null, boost: .3 });
        ctx.globalAlpha = 1;
        if (hasB) this.orbi(1030, 290, pg.who === 'B' ? 1.4 : 1.0, pg.who === 'B' ? 1 : .5);
      }
      // caixa de texto
      const lines = this.wrapLines(text, narr ? 900 : 880, narr ? 34 : 30, 700);
      if (narr) {
        ctx.save(); ctx.globalAlpha = Math.min(1, S.t / .3);
        this.typed(lines, shown, W / 2, H / 2 - lines.length * 26, 52, 34, '#e2d4ff', 'center', 700); ctx.restore();
      } else {
        const bx = 150, by = 478, bw = 980, bh = 176;
        UI.panel(bx, by, bw, bh, { fill: 'rgba(18,6,50,.88)', stroke: ch.c });
        ctx.fillStyle = ch.c; ctx.beginPath(); ctx.roundRect(bx + 28, by - 20, 40 + ch.name.length * 14, 38, 19); ctx.fill();
        txt(ch.name, bx + 28 + (40 + ch.name.length * 14) / 2, by - 1, 20, '#12041f', 'center', 900, 'middle');
        this.typed(lines, shown, bx + 40, by + 34, 40, 30, '#ffffff', 'left', 700);
      }
      if (shown >= len) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 6); txt('▼', narr ? W / 2 : 1100, narr ? H / 2 + lines.length * 30 + 20 : 624, 22, narr ? '#cdb8ff' : ch.c, 'center'); ctx.globalAlpha = 1; }
      if (adv && S.t > .1) {
        if (shown < len) S.t = len / sp + .01;
        else { S.i++; S.t = 0; S.lastShown = 0; Snd.play('uiSelect'); if (S.i >= S.pages.length) { Game.endStory(); return; } }
      }
    }
    // progresso e dicas
    for (let i = 0; i < S.pages.length; i++) { ctx.fillStyle = i === S.i ? '#ffb340' : i < S.i ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(W / 2 - (S.pages.length - 1) * 9 + i * 18, 30, 4, 0, 7); ctx.fill(); }
    txt('ESC  pular história', W - 28, 22, 16, '#8a7fb0', 'right', 800);
    if (Input.pressed('escape')) { Snd.play('uiBack'); Game.endStory(); }
  },

  dim(a = .72) { ctx.globalAlpha = 1; ctx.fillStyle = `rgba(10,3,30,${a})`; ctx.fillRect(0, 0, W, H); },
  blinkAt(t) { const ph = t % 4; return ph < .16 ? .16 - ph : 0; },
  stars() { return '★ ' + Save.data.coins; },

  title() {
    const t = World.t, bob = Math.sin(t * 1.6) * 10;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, 250, 330, '#8b4dff', .35); ctx.restore(); ctx.globalAlpha = 1;
    Art.ship(W / 2, 235 + bob, { vx: Math.sin(t * .8) * 60, t, lookx: clamp((Input.mouse.x - W / 2) / 400, -1, 1), looky: clamp((Input.mouse.y - 235) / 400, -1, 1), blinkT: this.blinkAt(t), scale: 1.6, boost: .2 });
    ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 40;
    const g = ctx.createLinearGradient(0, 380, 0, 450); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b98cff');
    ctx.fillStyle = g; ctx.font = `900 96px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('OLIENZINHO', W / 2, 452); ctx.restore();
    txt('GUARDIÃO DAS ESTRELAS', W / 2, 462, 24, '#ffb340', 'center', 800);
    if (UI.button('play', W / 2 - 190, 530, 380, 62, 'JOGAR', { size: 30, color: '#9a63ff' })) Game.goSelect();
    if (UI.button('shop', W / 2 - 190, 604, 182, 52, 'LOJA', { size: 22 })) { G.shopBack = 'title'; G.state = 'shop'; }
    if (UI.button('opt', W / 2 + 8, 604, 182, 52, 'OPÇÕES', { size: 22 })) { G.setBack = 'title'; G.state = 'settings'; }
    txt(this.stars() + ' estrelas', W - 26, H - 40, 22, '#ffcf6b', 'right');
    txt('olien.digital', 26, H - 40, 18, '#8a7fb0', 'left', 800);
    if (!Snd.ready) { ctx.globalAlpha = .6 + .4 * Math.sin(t * 4); txt('Clique ou aperte uma tecla para ativar o som', W / 2, H - 34, 18, '#cdb8ff', 'center', 800); ctx.globalAlpha = 1; }
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
