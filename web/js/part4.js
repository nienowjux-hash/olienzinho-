'use strict';
// ---------- FASE 10: O Último Céu, com o Coração do Outro Lado (3 atos, um para cada chefe da Parte 3) ----------
STAGES.push({
  id: 9, name: 'O Último Céu', desc: 'Uma fenda costura pedaços de todos os setores. No centro dela, algo bate.',
  music: 's10', bossMusic: 'b10', duration: 135, boss: 'heart', bossName: 'Coração do Outro Lado', tint: '#fff0c0',
  pal: { top: '#1c1040', bot: '#03010c', star: '#ffffff', dust: '#e8d8ff', shaft: '255,240,200', rock0: '#6a5a9a', rock1: '#120a30', rim: 'rgba(255,240,200,.5)', rocks: 12,
    nebA: [[200, 200, 420, '#ffb340', .2], [1050, 300, 440, '#33c4ff', .18], [640, 620, 380, '#c04aff', .2]], nebB: [[860, 140, 320, '#ffffff', .1], [240, 470, 340, '#ff7ac8', .12]], planets: [PLANET_PALS.gold, PLANET_PALS.sea, PLANET_PALS.glass] },
  phases: [{ until: 45, every: .74, pool: { kami: 2, shield: 1 } }, { until: 90, every: .64, pool: { kami: 2, tank: 1 } }, { until: 135, every: .56, pool: { kami: 2, tank: 2 } }],
  events: [{ at: 22, name: 'flare' }, { at: 44, name: 'mirrorshots' }, { at: 62, name: 'gravflip' }, { at: 82, name: 'blackout' }, { at: 104, name: 'storm' }],
});
CHARS.K = { name: 'CORAÇÃO', c: '#fff0c0', bg0: '#6a4a9a', bg1: '#0a0420' };
Portraits.face_K = function (mood, t, talk) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 140, '#fff0c0', .6); ctx.restore(); ctx.globalAlpha = 1;
  const s = 62 * (1 + Math.max(0, Math.sin(t * 4)) ** 3 * .08); ctx.fillStyle = rdl(-14, -20, 4, 90, [[0, '#ffffff'], [.5, '#ffd9a0'], [1, '#c04a7a']]); ctx.strokeStyle = '#3a1050'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, s * .9); ctx.bezierCurveTo(-s * 1.5, s * .1, -s * 1.1, -s * 1.0, 0, -s * .45); ctx.bezierCurveTo(s * 1.1, -s * 1.0, s * 1.5, s * .1, 0, s * .9); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 4, 24, 14, 0, 0, TAU); ctx.fill(); ctx.fillStyle = mood === 'angry' ? '#ff3a5a' : '#8a4aff'; ctx.beginPath(); ctx.arc(Math.sin(t * .9) * 6, 4, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#10062a'; ctx.beginPath(); ctx.arc(Math.sin(t * .9) * 6, 4, 4, 0, TAU); ctx.fill();
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.5 + k * .2) * (k % 2 ? -1 : 1)); ctx.strokeStyle = ['#ffd36a', '#33c4ff', '#e8d0ff'][k]; ctx.globalAlpha = .55; ctx.lineWidth = 3; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.ellipse(0, 0, 86 + k * 8, 70 + k * 6, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
};

// ---------- o chefe ----------
const ACT_COL = ['#ffd36a', '#33c4ff', '#e8d0ff'];
class Heart extends Boss {
  constructor() { super('Coração do Outro Lado', 1500); this.col = ACT_COL[0]; this.dark = '#3a1050'; this.rad = 120; this.N = 18; this.dive = null; this.real = 0; this.chargeT = 0; this.chargeMax = 1; this.spin = 0; }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 104 + r; }
  seg(i) { return [this.x + Math.sin(this.t * 2 + i * .6) * (10 + i * 5), this.y + 60 + i * 15]; }
  pathAt() { return [this.x, this.y]; }
  pos(s) { const d = 200 + 90 * Math.sin(this.t * .55); return [this.x + (s ? 1 : -1) * d, this.y + 30 + Math.sin(this.t * .9 + s) * 18]; }
  move(dt) { this.chargeT = Math.max(0, this.chargeT - dt); this.x = W / 2 + Math.sin(this.t * (.34 + this.phase * .06)) * 300; this.y = this.baseY + 24 + Math.sin(this.t * .9) * 20; }
  onPhase() {
    super.onPhase(); this.col = ACT_COL[this.phase]; this.cd = {}; this.dive = null;
    popup(W / 2, 250, ['', 'ATO II: AS MARÉS', 'ATO III: OS ESPELHOS'][this.phase] || '', this.col, 30);
    shedDebris(this.x, this.y, 30, [this.col, '#ffffff', '#3a1050'], 560, 14); Snd.play('rumble', { dur: 1.4 });
  }
  ai(dt) {
    const act = this.phase; this.act = act; const lo = [.66, .33, 0][act], within = clamp((this.ratio - lo) / .33, 0, 1), sub = within > .5 ? 1 : 2;
    if (this.tick('beat', dt, 3.4 - act * .5)) { ring(this.x, this.y, 16 + act * 4, 140 + act * 15, this.t, { r: 6 }); shockwave(this.x, this.y, 180, this.col); this.beatAt = this.t; Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (act === 2 && this.tick('collapse', dt, 11)) { // colapso: todos os tiros do Coração são puxados e soltos de novo
      popup(W / 2, 250, 'COLAPSO!', '#e8d0ff', 30); const px = G.player.x, py = G.player.y;
      for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; ebullet(this.x + Math.cos(a) * 60, this.y + Math.sin(a) * 60, a, 90, { r: 6, life: 3 }); }
      P3.at(1.4, () => { for (const q of G.eb) if (!q.dead && q.sty) { const a = Math.atan2(py - q.y, px - q.x); q.vx = Math.cos(a) * 190; q.vy = Math.sin(a) * 190; } shockwave(this.x, this.y, 260, '#ffffff'); });
    }
    const Cls = [Herald, Leviathan, Mirror][act], p0 = this.phase; this.phase = sub; Cls.prototype.ai.call(this, dt); this.phase = p0; if (act === 1) this.dive = null;
  }
  draw() {
    const t = this.t, act = this.phase, hit = this.flash > 0, c = ACT_COL[act], beat = this.beatAt ? Math.max(0, 1 - (t - this.beatAt) * 3) : 0, s = 92 * (1 + beat * .08 + Math.max(0, Math.sin(t * (3 + act))) ** 3 * .04);
    ctx.save(); ctx.translate(this.x, this.y);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 300, c, .16 + beat * .2); drawGlow(0, 0, 150, '#ffffff', .07); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // fragmentos dos tres atos orbitando
    for (let k = 0; k <= act; k++) for (let i = 0; i < 7; i++) {
      const a = t * (.5 + k * .15) * (k % 2 ? -1 : 1) + i / 7 * TAU, d = 150 + k * 34 + Math.sin(t * 2 + i) * 8, x = Math.cos(a) * d, y = Math.sin(a) * d * .62; ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2); ctx.fillStyle = ACT_COL[k]; ctx.globalAlpha = .9;
      if (k === 0) { ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(8, 0); ctx.lineTo(0, 14); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); }
      else if (k === 1) { ctx.globalAlpha = .75; ctx.strokeStyle = ACT_COL[1]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(150,235,255,.25)'; ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-3, 9); ctx.lineTo(-10, -2); ctx.lineTo(-2, -9); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.3 + k * .12) * (k % 2 ? -1 : 1)); ctx.strokeStyle = ACT_COL[k]; ctx.globalAlpha = .65; ctx.lineWidth = 3 + k; ctx.setLineDash([24, 14]); ctx.beginPath(); ctx.ellipse(0, 0, 120 + k * 22, 78 + k * 12, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    // o coracao
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = hit ? '#fff' : rdl(-s * .3, -s * .4, 6, s * 1.5, [[0, '#ffffff'], [.35, '#fff0d0'], [.7, c], [1, '#7a2a6a']]); ctx.strokeStyle = '#3a1050'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(0, s * .9); ctx.bezierCurveTo(-s * 1.5, s * .1, -s * 1.1, -s * 1.0, 0, -s * .45); ctx.bezierCurveTo(s * 1.1, -s * 1.0, s * 1.5, s * .1, 0, s * .9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(58,16,80,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-s * .6, -s * .35); ctx.lineTo(-s * .25, s * .05); ctx.lineTo(-s * .5, s * .45); ctx.moveTo(s * .55, -s * .4); ctx.lineTo(s * .2, s * .1); ctx.lineTo(s * .4, s * .5); ctx.stroke(); ctx.restore();
    const lx = clamp((G.player.x - this.x) / 300, -1, 1) * 10, ly = clamp((G.player.y - this.y) / 400, -.3, 1) * 6;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, s * .05, s * .38, s * .22, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a1050'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = act === 0 ? '#e8a020' : act === 1 ? '#1a8ad8' : '#9a4aff'; ctx.beginPath(); ctx.arc(lx, s * .05 + ly, s * .15, 0, TAU); ctx.fill(); ctx.fillStyle = '#10062a'; ctx.beginPath(); ctx.arc(lx, s * .05 + ly, s * .07, 0, TAU); ctx.fill();
    if (this.chargeT > 0) { const ch = 1 - this.chargeT / this.chargeMax; ctx.globalCompositeOperation = 'lighter'; drawGlow(0, s * .1, 50 + ch * 90, '#ffffff', ch * .7); }
    this.flashOverlay(s * 1.3, s);
    ctx.restore();
  }
  finalFx() { for (let i = 0; i < 3; i++) shockwave(this.x, this.y, 500 + i * 260, ACT_COL[i]); }
}
BOSS_CLASSES.heart = Heart;

// ---------- tabelas dos outros sistemas ----------
Object.assign(FURY, {
  'Coração do Outro Lado': [[['K', 'Eu sou o que sobra quando todos os medos se juntam!'], ['O', 'Eu ouvi cada um de vocês. Ninguém é só medo!']], [['H', 'Nós ainda estamos aqui, Olienzinho.'], ['Y', 'Não vamos deixar o Coração sozinho.'], ['K', 'SILÊNCIO! EU... EU NÃO QUERO FICAR SOZINHO!']]],
});
EPITHET['Coração do Outro Lado'] = 'O Medo Que Ninguém Ouviu';
BEST.push(['boss:Coração do Outro Lado', 'Coração do Outro Lado', 'Onde se juntam todos os medos do Outro Lado. Chefe do Setor 10, em três atos.', 'Cada ato usa os golpes de um chefe da Parte 3. Aprenda o padrão de cada um.']);
PBOSS.push(['Coração do Outro Lado', 9]);
CAPTAINS.push('Eco do Outro Lado');

// ---------- historia ----------
STORY.stages.push({
  intro: [
    { music: 'mystery' }, { title: 'ATO FINAL', sub: 'O ÚLTIMO CÉU' }, { title: 'SETOR 10', sub: 'O ÚLTIMO CÉU' },
    { who: 'N', text: 'Com o Espelho partido, uma fenda atravessou o céu inteiro. Por ela flutuavam pedaços de todos os setores já visitados, como lembranças soltas.' },
    { who: 'B', mood: 'worry', text: 'Olienzinho, estou lendo sinais de todos os lugares por onde passamos. Alguma coisa está juntando tudo isso.' },
    { who: 'O', mood: 'worry', text: 'Alguma coisa... ou alguém com saudade.' },
    { who: 'B', text: 'No centro da fenda bate um coração. Um coração que nunca foi de ninguém.' },
    { who: 'O', mood: 'determined', text: 'Então vamos conversar com ele.' },
    { mission: { n: 10, title: 'Atravessar o Último Céu', goal: 'Cruze a fenda e enfrente o Coração do Outro Lado, em três atos.', boss: 'Coração do Outro Lado' } },
  ],
  pre: [
    { music: 'tension' }, { who: 'K', scene: 'void', text: 'Eu sou o que sobra quando os medos se encontram: a luz que não quis dividir, a fome que nunca passa e o reflexo que ninguém aceitou.' },
    { who: 'O', scene: 'void', mood: 'determined', text: 'Você não é só medo. Eu ouvi vocês três, um por um. Todos só queriam ser vistos.' },
    { who: 'K', scene: 'void', mood: 'angry', text: 'ENTÃO VEJAM! VEJAM TUDO DE UMA VEZ!' },
  ],
  victory: 'Medo grande é só amor que ainda não achou uma casa!',
  after: [
    { music: 'sad' }, { who: 'K', scene: 'freed', mood: 'sad', text: 'Eu só queria que alguém ficasse. Todos que eu juntei foram embora de novo.' },
    { music: 'hope' }, { who: 'O', scene: 'lit', mood: 'happy', text: 'Eu fico. O Orbi fica. O céu inteiro fica.' },
    { who: 'K', scene: 'freedKeep', mood: 'free', text: '...Então eu posso descansar. Leve o meu batimento: ele vai marcar o ritmo das suas estrelas.' },
  ],
});
STORY.defeat.boss.push(['Cada medo seu cabe em mim. Venha, eu guardo todos.', 'Três vozes, um coração. E você ainda tão sozinho...']);
STORY.finale4 = [
  { music: 'triumph' },
  { who: 'N', scene: 'lit', text: 'O Arauto, o Leviatã, o Reflexo e agora o Coração: cada um, do seu jeito, tinha tido medo. Todos viraram luz no mesmo céu.' },
  { who: 'B', mood: 'happy', text: 'Olienzinho, olhe! A fenda se fechou, mas deixou uma trilha de estrelas novas.' },
  { who: 'O', mood: 'happy', text: 'Orbi, você voltou de verdade?' },
  { who: 'B', mood: 'happy', text: 'Voltei para ficar. Agora eu moro em todas as estrelas e também no seu lado.' },
  { music: 'hope' },
  { who: 'L', scene: 'lumi', mood: 'happy', text: 'Meu pequeno broto... você cuidou do céu inteiro. Agora o céu cuida de você.' },
  { who: 'N', fx: 'dawn', text: 'E assim, o menor foguete da galáxia aprendeu que a maior luz do universo é a que se divide.' },
  { title: 'FIM', sub: 'O ÚLTIMO CÉU' },
];
ACH.push({ id: 'part4', name: 'O Último Céu', desc: 'Derrote o Coração do Outro Lado.', ok: () => !!Save.data.won4 });

// ---------- fundo: pedacos de todos os setores ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); const st = G.stage ? G.stage.id : 0; if (st !== 9 || QL() < 1) return;
    const t = World.t, act = G.boss ? Math.min(2, G.boss.phase) : Math.min(2, Math.floor((G.t || 0) / (G.stage.duration || 135) * 3)), c = ACT_COL[act];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(W * .3, 0, W * .7, H); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, c); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.globalAlpha = .1 + Math.sin(t * 1.5) * .03; ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(W * .46, 0); ctx.lineTo(W * .54, 0); ctx.lineTo(W * .62, H); ctx.lineTo(W * .38, H); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 10; i++) { const x = (hsh(i + 700) * W + t * (6 + i * 2)) % (W + 100) - 50, y = (hsh(i + 710) * H + t * (10 + i)) % (H + 80) - 40, col = STAGES[i % 9].tint || '#fff'; ctx.save(); ctx.translate(x, y); ctx.rotate(t * .2 + i); ctx.globalAlpha = .22; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(14, 4); ctx.lineTo(-4, 20); ctx.lineTo(-16, 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.restore();
  };
}

// ---------- EPILOGO: o Reflexo do Olienzinho (ataques escolhidos pela sua arma) ----------
class SelfEcho extends Heart {
  constructor() {
    super(); this.name = 'Reflexo do Olienzinho'; this.maxHp = this.hp = 1900; this.col = '#c8a0ff'; this.rad = 90; const w = Save.data.loadout.weapon;
    this.grp = ['fan', 'g_S', 'flame', 'boomerang'].includes(w) ? 'spread' : ['laser', 'g_E', 'chain'].includes(w) ? 'beam' : ['cannon', 'g_P'].includes(w) ? 'heavy' : 'swarm'; this.wep = w;
  }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 74 + r; }
  move(dt) { const p = G.player; this.chargeT = Math.max(0, this.chargeT - dt); this.x += (clamp(W - p.x, 120, W - 120) - this.x) * Math.min(1, 1.1 * dt); this.y = this.baseY + 40 + Math.sin(this.t * 1.3) * 16; }
  onPhase() { Boss.prototype.onPhase.call(this); this.cd = {}; popup(W / 2, 250, this.phase === 1 ? 'MAIS RÁPIDO!' : 'IGUAL A VOCÊ!', this.col, 30); shedDebris(this.x, this.y, 20, ['#c8a0ff', '#ffffff', '#3a1050'], 500, 12); }
  ai(dt) {
    const a = this.phase, k = 1 - a * .16, g = this.grp, p = G.player;
    if (this.tick('mirror', dt, 7 * k)) { popup(this.x, this.y - 80, 'REFLEXO!', '#e8d0ff', 22); shockwave(this.x, this.y, 150, '#c8a0ff'); }
    if (g === 'spread') {
      if (this.tick('fan', dt, 1.8 * k)) fanAimed(this.x, this.y + 20, 7 + a * 2, 1.3, 230, { r: 7 });
      if (this.tick('ring', dt, 3.2 * k)) { ring(this.x, this.y, 18 + a * 4, 170, this.t); shockwave(this.x, this.y, 200, '#ffb340'); }
      if (a >= 1 && this.tick('rain', dt, .22)) ebullet(rand(60, W - 60), -10, Math.PI / 2, 250, { r: 6 });
    } else if (g === 'beam') {
      if (this.tick('las', dt, 3.4 * k)) { const an = aimAt(this.x, this.y); bossLaser(this, an, 1.0, .7, '#c8a0ff'); if (a >= 1) { bossLaser(this, an + .5, 1.0, .7, '#c8a0ff'); bossLaser(this, an - .5, 1.0, .7, '#c8a0ff'); } }
      if (this.tick('fan2', dt, 2.4 * k)) fanAimed(this.x, this.y + 20, 5, .8, 240, { r: 6 });
      if (a === 2 && this.tick('sweep', dt, .12)) { this.spin += .35; ebullet(this.x, this.y, this.spin, 210, { r: 6 }); ebullet(this.x, this.y, this.spin + Math.PI, 210, { r: 6 }); }
    } else if (g === 'heavy') {
      if (this.tick('bomb', dt, 2.4 * k)) for (let i = 0; i < 1 + (a >= 1 ? 1 : 0); i++) ebullet(this.x + (i ? 60 : 0), this.y + 20, aimAt(this.x, this.y) + (i ? .35 : 0), 120, { r: 15, fuse: 1.1, sty: 'orb' });
      if (a >= 1 && this.tick('quake', dt, 6)) for (let i = 0; i < 3; i++) Events.hazardRect(rand(100, W - 100), H / 2, 90, H, 1.1, .4, '#c8a0ff', 'bolt');
      if (this.tick('fan3', dt, 3 * k)) fanAimed(this.x, this.y + 20, 3, .5, 200, { r: 9 });
    } else {
      if (this.tick('stream', dt, .14 * (1 + a * -.15))) ebullet(this.x, this.y + 20, aimAt(this.x, this.y) + Math.sin(this.t * 3) * .45, 220, { r: 5 });
      if (this.tick('burst', dt, 3 * k)) fanAimed(this.x, this.y + 20, 9, 1.6, 200, { r: 6 });
      if (a >= 1 && this.tick('echo', dt, 5)) { const past = []; for (let i = 0; i < 4; i++) { const tt = World.t - 1.8 + i * .45, s = P3.hist.find(h => h[0] >= tt); if (s) past.push(s[1]); } past.forEach((x, i) => P3.at(.3 + i * .35, () => Events.hazardRect(x, H / 2, 56, H, .8, .25, '#e8d0ff', 'bolt'))); }
    }
  }
  draw() {
    const t = this.t, hit = this.flash > 0, w = this.wep;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(this.x, this.y, 240, '#a070ff', .3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (let i = 3; i >= 1; i--) { ctx.save(); ctx.globalAlpha = .12 * (4 - i); ctx.translate(0, 2 * this.y); ctx.scale(1, -1); try { Art.ship(this.x + Math.sin(t * 2 + i) * i * 8, this.y, { pal: skinOf(Save.data.loadout.skin).pal, guard: w && w.startsWith('g_') ? w : null, vx: 0, t, lookx: 0, looky: 1, blinkT: 0, inv: 0, scale: SHIP_S * 2.4, mood: 'angry' }); } catch (e) { } ctx.restore(); }
    ctx.save(); ctx.translate(0, 2 * this.y); ctx.scale(1, -1); ctx.globalAlpha = hit ? 1 : .55; try { Art.ship(this.x, this.y, { pal: skinOf(Save.data.loadout.skin).pal, guard: w && w.startsWith('g_') ? w : null, vx: 0, t, lookx: Math.sin(t) * .5, looky: 1, blinkT: 0, inv: 0, scale: SHIP_S * 2.4, mood: 'angry' }); } catch (e) { } ctx.filter = 'none'; ctx.restore();
    ctx.restore();
  }
}
{
  const BC = BOSS_CLASSES.heart; BOSS_CLASSES.heart = function () { return G.epi ? new SelfEcho() : new BC(); };
  const ss = Game.startStage; Game.startStage = function (idx, o) { const r = ss.call(this, idx, o); G.epi = null; return r; };
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    if (G.epi) {
      const d = Save.data, first = !d.epiDone; d.epiDone = true; const reward = first ? 300 : 0; d.coins += reward; Save.save(); Ach.check(); G.bossDone = true; for (const k of G.pickups) k.mag = true;
      G.timers.push({ t: 2.4, fn: () => { G.bonusEnd = { title: 'EPÍLOGO CONCLUÍDO', sub: 'Você venceu o seu próprio reflexo.', rows: [['Golpes sofridos', String(G.stats.hits)], ['Recompensa (1ª vez)', '★ ' + reward], ['Skin nova', first ? 'Reflexo' : 'já liberada']], again: () => Visual16.startEpi(), best: '' }; G.state = 'bonusEnd'; G.bonusAt = undefined; Snd.play('stageClear'); Snd.musicPlay('triumph', 1); } }); return;
    }
    return bd.call(this);
  };
  const ec = Game.endRunSave; Game.endRunSave = function (b, c) { if (G.epi) return; return ec.call(this, b, c); };
}
Visual16.startEpi = function () {
  noStoryOn(); Game.startStage(9, { skipStory: true }); G.epi = true; G.t = G.stage.duration - .1; G.miniDone = true; G.state = 'play'; Events.banner = null; recalcStats(G.player); G.player.hp = G.player.maxHp;
};
ACH.push({ id: 'epi', name: 'Cara a Cara', desc: 'Vença o Reflexo do Olienzinho no Epílogo.', ok: () => !!Save.data.epiDone });
