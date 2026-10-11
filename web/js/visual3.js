'use strict';
// ---------- cutscenes de furia dos chefes: o jogo para, a camera chega perto, o chefe se transforma e fala ----------
const Visual3 = {};
const FURY = {
  'Nave-Mãe Zangão': [[['C', 'Vocês machucaram os meus filhos... ZANGÕES, ACORDEM! O enxame inteiro vai cobrir o céu!'], ['O', 'Eu não quero machucar ninguém, Colmeia!']], [['C', 'Se é pelo meu enxame, eu queimo este céu inteiro!'], ['O', 'Eu vou te trazer de volta. Prometo!']]],
  'Gigante de Rocha': [[['P', 'Eu sou a montanha. Montanhas não caem... elas ESMAGAM!'], ['O', 'Então eu vou ser a faísca que atravessa a pedra!']], [['P', 'Pedra por pedra, eu me levanto! Não vou cair de novo!'], ['O', 'Pétreo, você não precisa carregar tudo sozinho!']]],
  'Olho da Tempestade': [[['E', 'Eu vi o seu fim antes mesmo de você nascer, pequeno.'], ['O', 'Então me diga: eu ganhei?']], [['E', 'ABRAM-SE, CÉUS! Que a tempestade me obedeça!'], ['O', 'Eu já vi o seu medo, Vigia. Ele não é maior que você!']]],
  'Sol-Guardião': [[['S', 'Quanto mais você me fere, mais eu brilho!'], ['O', 'Eu não quero apagar você, Solaris!']], [['S', 'QUEIME! Queime comigo, pequeno foguete!'], ['O', 'Eu sou feito de luz também. Não vou queimar!']]],
  'Eco do Olienzinho': [[['X', 'Cada golpe seu me deixa mais parecido com você.'], ['O', 'Então você também pode escolher ser outra coisa!']], [['X', 'Eu sou você quando perde tudo! SINTA O MEDO!'], ['O', 'Eu sinto. E continuo voando!']]],
  'O Vazio': [[['V', 'Você acende... eu apago. Sempre foi assim, desde o começo.'], ['O', 'Não precisa ser assim. Eu estou aqui!']], [['V', 'NÃO ME DEIXE SOZINHO DE NOVO!'], ['B', 'Olienzinho, ele está com medo! Ele só quer companhia!']]],
};
const FURY_TITLE = ['', 'ENFURECIDO', 'FÚRIA TOTAL'];

{
  const op = Boss.prototype.onPhase;
  Boss.prototype.onPhase = function () {
    op.call(this);
    const set = FURY[this.name], lines = set && set[Math.min(1, this.phase - 1)] ? set[Math.min(1, this.phase - 1)] : [['O', '...']];
    G.furyCut = { boss: this, t: 0, ph: this.phase, lines, li: 0, typed: 0, wait: 0, flashed: false, endAt: null, zoom: 0, prog: 0 };
    this.popK = 0;
  };
}

Visual3.furyUpdate = function (dt) {
  const c = G.furyCut, b = c.boss; c.t += dt;
  // fisica minima dos efeitos (o jogo esta congelado)
  for (const q of G.parts) { q.life -= dt; if (q.k === 'debris') { q.rot += q.vr * dt; q.vy += 380 * dt; } q.x += q.vx * dt; q.y += q.vy * dt; const d = Math.max(0, 1 - q.drag * dt); q.vx *= d; q.vy *= d; }
  for (const r of G.rings) { r.r += (r.max - r.r) * Math.min(1, 7 * dt) + 20 * dt; r.life -= dt * 2.2; }
  for (const o of G.pops) { o.y -= 50 * dt; o.life -= dt * 1.2; }
  G.parts = G.parts.filter(q => q.life > 0); G.rings = G.rings.filter(r => r.life > 0); G.pops = G.pops.filter(o => o.life > 0);
  World.update(dt * .25, 0);
  const R = b.rad || 110, shaking = c.t > .45 && c.t < 1.85;
  c.prog = clamp((c.t - .45) / 1.4, 0, 1);
  const inZ = easeOut(clamp(c.t / .7, 0, 1)), outZ = c.endAt === null ? 0 : easeOut(clamp((c.t - c.endAt) / .5, 0, 1));
  c.zk = inZ * (1 - outZ); G.zoom = .55 * c.zk;
  // a camera leva o chefe para o meio da tela
  const z = 1 + G.zoom, S = { x: lerp(b.x, W / 2, .85 * c.zk), y: lerp(b.y, H * .4, .85 * c.zk) };
  G.zoomCx = (S.x - z * b.x) / (1 - z); G.zoomCy = (S.y - z * b.y) / (1 - z);
  b.shx = shaking ? rand(-1, 1) * (3 + c.prog * 9) : 0; b.shy = shaking ? rand(-1, 1) * (3 + c.prog * 9) : 0;
  if (shaking) {
    if (Math.random() < dt * 22) shedDebris(b.x + rand(-R, R) * .8, b.y + rand(-R, R) * .6, 2, [b.dark || '#3a2060', b.col, '#ffe9a8'], 320, 11);
    if (Math.random() < dt * 40) sparks(b.x + rand(-R, R), b.y + rand(-R, R) * .7, '#ffe9a8', 4, 320);
    if (Math.random() < dt * 24) { const a = rand(0, TAU), r = R * rand(1.6, 2.6); G.parts.push({ x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r * .8, vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r * 1.3, life: .6, max: .6, r: rand(2, 4), c: b.col || '#ffb340', drag: 0 }); }
    if (Math.random() < dt * 6) shockwave(b.x, b.y, R * 2.2, b.col);
  }
  if (c.t >= 1.85 && !c.flashed) { // o momento da transformacao
    c.flashed = true; flashScreen(1); shake(26); Snd.play('impact'); Snd.play('bossWarn');
    for (let i = 0; i < 5; i++) shockwave(b.x, b.y, R * 2 + i * 150, i % 2 ? '#ffffff' : b.col);
    burst(b.x, b.y, [b.col, '#ffe9a8', '#ffffff', '#ff5a3c'], 90, 700, 8); b.popK = .32;
    G.parts.push({ k: 'flash', x: b.x, y: b.y, vx: 0, vy: 0, life: .35, max: .35, r: R * 3, c: '#ffffff', drag: 1 });
  }
  b.popK = Math.max(0, (b.popK || 0) - dt * .35);
  // dialogo
  if (c.t > 2.05 && c.endAt === null) {
    const ln = c.lines[c.li], full = ln[1].length;
    if (c.typed < full) { const was = Math.floor(c.typed); c.typed = Math.min(full, c.typed + dt * 46); if (Math.floor(c.typed) !== was && Math.floor(c.typed) % 2 === 0) Snd.play('blip', { who: ln[0] }); }
    else c.wait += dt;
    const adv = c.t > 2.4 && (Input.pressed('enter') || Input.mouse.click);
    if (adv && c.typed < full) c.typed = full;
    else if ((adv && c.typed >= full) || c.wait > 3.2) { c.li++; c.typed = 0; c.wait = 0; if (c.li >= c.lines.length) { c.endAt = c.t; c.li = c.lines.length - 1; Snd.play('uiSelect'); } }
  }
  if (c.endAt !== null && c.t > c.endAt + .55) { G.furyCut = null; b.shx = b.shy = 0; b.stun = Math.max(b.stun, .7); G.zoom = .02; }
};

Visual3.furyDraw = function () {
  const c = G.furyCut; if (!c || G.state !== 'play') return;
  const b = c.boss, env = c.endAt === null ? easeOut(clamp(c.t / .5, 0, 1)) : 1 - easeOut(clamp((c.t - c.endAt) / .5, 0, 1)), bh = 70 * env;
  ctx.save(); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  const vg = ctx.createRadialGradient(W / 2, H * .42, H * .25, W / 2, H * .42, H * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,0,10,' + .55 * env + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // titulo da fase de furia
  if (c.t < 2.3) {
    const a = clamp((c.t - .3) / .3, 0, 1) * clamp((2.3 - c.t) / .3, 0, 1), sc = 1 + (1 - clamp((c.t - .3) / .5, 0, 1)) * .3;
    ctx.save(); ctx.translate(W / 2, bh + 54); ctx.scale(sc, sc); ctx.globalAlpha = a; ctx.shadowColor = b.col; ctx.shadowBlur = 36; txt(FURY_TITLE[c.ph] || 'FÚRIA', 0, -34, 54, '#fff', 'center', 900); ctx.restore();
  }
  if (c.t > 2.0) { // caixa de fala
    const ln = c.lines[c.li], ch = CHARS[ln[0]], k = easeOut(clamp((c.t - 2.0) / .3, 0, 1)) * (c.endAt === null ? 1 : env);
    const w = 980, h = 170, x = W / 2 - w / 2, y = H - bh - h - 14 + (1 - k) * 40;
    ctx.globalAlpha = k; ctx.fillStyle = 'rgba(12,4,34,.93)'; ctx.strokeStyle = ch.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill(); ctx.stroke();
    Portraits.draw(ln[0], x + 100, y + h / 2, 130, { mood: ln[0] === 'O' ? 'determined' : ln[0] === 'B' ? 'worry' : 'angry', talk: c.typed < ln[1].length, t: c.t });
    txt(ch.name, x + 190, y + 20, 19, ch.c, 'left', 900);
    UI.wrap(ln[1].slice(0, Math.floor(c.typed)), x + 190, y + 52, w - 230, 32, 25, '#fff');
    if (c.typed >= ln[1].length) { ctx.globalAlpha = k * (.5 + .4 * Math.sin(World.t * 6)); txt('ENTER', x + w - 28, y + h - 30, 14, '#cdb8ff', 'right', 800); }
  }
  ctx.restore();
};

// aparencia do chefe muda a cada furia (cor mais quente, mais brilho) e ele "pula" ao se transformar
Visual3.bossDraw = function (b) {
  let ph = b.phase || 0; const c = G.furyCut;
  if (c && c.boss === b) ph = Math.max(0, ph - 1 + c.prog);
  if ((ph > 0 || G.secret) && QL() >= 2 && b.state !== 'dying') ctx.filter = (G.secret ? G.secret.filter + ' ' : '') + 'saturate(' + (1 + .32 * ph) + ') hue-rotate(' + (-13 * ph) + 'deg) brightness(' + (1 + .08 * ph) + ') contrast(' + (1 + .04 * ph) + ')';
  const pk = 1 + (b.popK || 0) * Math.sin(clamp(b.popK / .32, 0, 1) * Math.PI * .5);
  if (pk !== 1) { ctx.translate(b.x, b.y); ctx.scale(pk, pk); ctx.translate(-b.x, -b.y); }
  b.draw();
};
