'use strict';
// ---------- conquistas, fragmentos escondidos, encontros e conversas com o Orbi ----------
const ACH = [
  { id: 'first_light', name: 'Primeira Luz', desc: 'Complete a fase 1.', ok: () => !!Save.data.cleared[0] },
  { id: 'part1', name: 'Guardião da Parte 1', desc: 'Complete as 4 primeiras fases.', ok: () => [0, 1, 2, 3].every(i => Save.data.cleared[i]) },
  { id: 'no_hit_boss', name: 'Intocável', desc: 'Derrote um chefe sem tomar dano.', ok: () => G.bossDone && G.stats && G.stats.bossHit === 0 && !G.endless },
  { id: 'combo30', name: 'Em Chamas', desc: 'Alcance um combo de 30.', ok: () => G.stats && G.stats.maxCombo >= 30 },
  { id: 'combo60', name: 'Imparável', desc: 'Alcance um combo de 60.', ok: () => G.stats && G.stats.maxCombo >= 60 },
  { id: 'lvl10', name: 'Nível 10', desc: 'Chegue ao nível 10 em uma única jornada.', ok: () => G.player && G.level >= 10 },
  { id: 'rich', name: 'Chuva de Estrelas', desc: 'Guarde 1000 estrelas ao mesmo tempo.', ok: () => Save.data.coins >= 1000 },
  { id: 'rank_s', name: 'Nota S', desc: 'Tire a nota S em uma fase.', ok: () => Object.values(Save.data.grades).some(g => g >= 3) },
  { id: 'wave10', name: 'Sobrevivente', desc: 'Chegue à onda 10 no Modo Infinito.', ok: () => (Save.data.bestWave || 0) >= 10 },
  { id: 'collector4', name: 'Caçador de Fragmentos', desc: 'Ache 4 fragmentos escondidos.', ok: () => Extras.fragCount() >= 4 },
  { id: 'collector6', name: 'Coração Completo', desc: 'Ache os 6 fragmentos escondidos.', ok: () => Extras.fragCount() >= 6 },
  { id: 'arsenal', name: 'Arsenal Completo', desc: 'Tenha as 4 armas.', ok: () => WEAPON_ORDER.every(w => Save.data.owned.weapons[w]) },
  { id: 'dash50', name: 'Esquiva Mestre', desc: 'Use a esquiva 50 vezes.', ok: () => (Save.data.stats.dashes || 0) >= 50 },
  { id: 'chat5', name: 'Melhor Amigo', desc: 'Converse 5 vezes com o Orbi.', ok: () => (Save.data.stats.chats || 0) >= 5 },
  { id: 'mini5', name: 'Caçador de Capitães', desc: 'Derrote 5 minichefes.', ok: () => (Save.data.stats.minis || 0) >= 5 },
  { id: 'enc4', name: 'Bom Vizinho', desc: 'Ajude 4 viajantes perdidos.', ok: () => Extras.encCount() >= 4 },
  { id: 'part2', name: 'O Vazio Vencido', desc: 'Derrote o Vazio e zere o jogo.', ok: () => !!Save.data.won },
  { id: 'daily', name: 'Desafio do Dia', desc: 'Termine um Desafio Diário.', ok: () => !!(Save.data.daily && Save.data.daily.played) },
];

const Ach = {
  queue: [], cur: null, t: 0, poll: 0,
  unlock(id) {
    const a = ACH.find(x => x.id === id); if (!a || Save.data.ach[id]) return;
    Save.data.ach[id] = true; Save.save(); this.queue.push(a);
  },
  check() { for (const a of ACH) if (!Save.data.ach[a.id]) { try { if (a.ok()) this.unlock(a.id); } catch (e) { } } },
  draw() {
    if (++this.poll % 20 === 0) this.check();
    if (!this.cur && this.queue.length) { this.cur = this.queue.shift(); this.t = 0; Snd.play('stamp'); }
    if (!this.cur) return;
    this.t += 1 / 60;
    const t = this.t, k = t < .5 ? easeBack(t / .5) : t > 3.6 ? 1 - easeOut((t - 3.6) / .4) : 1;
    if (t > 4) { this.cur = null; return; }
    const w = 400, h = 78, x = W - w - 24 + (1 - k) * (w + 40), y = 92;
    ctx.save(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(20,8,55,.94)'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(x + 40, y + 39); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 44, '#ffb340', .6); ctx.restore();
    Extras.star(x + 40, y + 39, 20, '#ffd36a', t);
    txt('CONQUISTA DESBLOQUEADA', x + 76, y + 12, 13, '#ffb340', 'left', 900); txt(this.cur.name, x + 76, y + 30, 24, '#fff', 'left', 900); txt(this.cur.desc, x + 76, y + 58, 13, '#cdb8ff', 'left', 700);
    ctx.restore();
  },
};

const ENCOUNTERS = [
  { name: 'Zanguinho', c: '#ffb340', reward: 'stars', amt: 60, label: '+60 estrelas', pages: [
    { music: 'hope' },
    { who: 'N', text: 'Atrás de uma rocha, um pequeno Zangão sem brilho tremia. Era só um filhote.' },
    { who: 'Z', mood: 'sad', text: 'Bzzz... não me machuca? A mamãe ficou com tanto medo... e eu acabei fugindo.' },
    { who: 'O', mood: 'happy', text: 'Eu não machuco quem só está com medo. Fica perto da gente, tá?' },
    { who: 'Z', mood: 'happy', text: 'Pra você! Eram as estrelinhas que eu guardava pra mamãe. Diz pra ela que eu sinto muito.' },
  ] },
  { name: 'Mineiro Teo', c: '#ffcf6b', reward: 'level', label: '+1 nível', pages: [
    { music: 'mystery' },
    { who: 'N', text: 'Um velho minerador flutuava dentro de uma cápsula rachada, cercado de pedras brilhantes.' },
    { who: 'Z', mood: 'n', text: 'Ei, foguetinho! Cuidado com o Gigante. Ele nem sempre foi assim, sabe? Quebrava pedra pra gente, de tão bom.' },
    { who: 'B', text: 'Registro confirma: Pétreo trabalhava como guardião de minas há milhares de anos.' },
    { who: 'Z', mood: 'happy', text: 'Leva isto. É um cristal que dá força pra quem tem coragem de ir lá.' },
  ] },
  { name: 'Raiozinho', c: '#7fc4ff', reward: 'heal', label: 'vida cheia', pages: [
    { music: 'hope' },
    { who: 'N', text: 'Uma nuvenzinha elétrica se escondia entre os raios. Parecia estar chorando, com faíscas no lugar de lágrimas.' },
    { who: 'Z', mood: 'sad', text: 'Fiquei aqui sozinho... o Vigia ficou tão bravo. Ele só queria que todo mundo ficasse seguro.' },
    { who: 'O', mood: 'determined', text: 'Vamos trazer ele de volta. Prometo.' },
    { who: 'Z', mood: 'happy', text: 'Então toma um pouquinho do meu raio. Ele cura, sabia?' },
  ] },
  { name: 'Faísca', c: '#ff8a1f', reward: 'stars', amt: 120, label: '+120 estrelas', pages: [
    { music: 'heroic' },
    { who: 'N', text: 'Uma bolinha de fogo girava em volta do Olienzinho, rindo baixinho.' },
    { who: 'Z', mood: 'happy', text: 'Você é o foguete que não apaga? A Solaris falava tanto de você antes de... antes de tudo isso.' },
    { who: 'B', mood: 'worry', text: 'A Solaris falava do Olienzinho? Isso não consta nos meus registros.' },
    { who: 'Z', mood: 'n', text: 'Ela sabia que alguém ia chegar. Toma, ela deixou isto pra você.' },
  ] },
  { name: 'Estrela Cadente', c: '#9a63ff', reward: 'level', label: '+1 nível', pages: [
    { music: 'sad' },
    { who: 'N', text: 'Entre os destroços do cemitério, uma estrelinha ainda piscava, cansada.' },
    { who: 'Z', mood: 'sad', text: 'Eu era a última que sobrou aqui. Todas as outras apagaram... uma por uma.' },
    { who: 'O', mood: 'sad', text: 'Eu não vou deixar você apagar também.' },
    { who: 'Z', mood: 'happy', text: 'Então eu empresto a minha luz. Só não esquece de mim.' },
  ] },
  { name: 'Eco Pequeno', c: '#b8a8e8', reward: 'heal', label: 'vida cheia', pages: [
    { music: 'mystery' },
    { who: 'N', text: 'No silêncio do Vazio, uma voz minúscula repetia as palavras do Olienzinho, baixinho.' },
    { who: 'Z', mood: 'n', text: '...não apaga... não apaga... Quem é você? Você é igual a mim, só que mais quente.' },
    { who: 'B', text: 'Isso é um eco residual. Inofensivo, e curiosamente simpático.' },
    { who: 'Z', mood: 'happy', text: 'Se você vai lá no fundo... leva um pouco de mim. Eu sou feito de coragem que sobrou.' },
  ] },
];

const ORBI_CHATS = [
  [{ who: 'B', text: 'Olienzinho, fiz um cálculo: já derrotamos mais inimigos do que eu consigo contar em ordem alfabética.' }, { who: 'O', mood: 'happy', text: 'Isso nem faz sentido, Orbi!' }, { who: 'B', mood: 'happy', text: 'Faz sentido no meu núcleo. É onde importa.' }],
  [{ who: 'B', mood: 'worry', text: 'Posso te perguntar uma coisa? Você tem medo do escuro?' }, { who: 'O', text: 'Um pouco. Mas aí eu lembro que sou uma luz. Daí o escuro que se preocupe.' }, { who: 'B', mood: 'happy', text: 'Vou anotar isso. "Escuro deve se preocupar."' }],
  [{ who: 'B', text: 'Sabia que o seu motor faz um barulhinho de risada quando você desvia de um tiro?' }, { who: 'O', mood: 'shock', text: 'O meu motor RI?!' }, { who: 'B', mood: 'happy', text: 'Baixinho. É fofo. Não conta pra ele que eu disse.' }],
  [{ who: 'B', mood: 'worry', text: 'Às vezes eu sinto meu núcleo esquentar quando o Vazio fala. Será que ele me conhece?' }, { who: 'O', mood: 'determined', text: 'Não importa quem ele acha que você é. Eu sei quem você é.' }, { who: 'B', mood: 'happy', text: '...Obrigado, Olienzinho. Pode me chamar de parceiro?' }, { who: 'O', mood: 'happy', text: 'Sempre.' }],
  [{ who: 'B', text: 'Teoria: se a gente acender todas as estrelas, eu ganho um upgrade de cor?' }, { who: 'O', text: 'Você já é azul. Que cor você quer?' }, { who: 'B', mood: 'happy', text: 'Uma que combine com você. Roxo-azulado. Chamo de "Amigo".' }],
  [{ who: 'B', mood: 'worry', text: 'Olienzinho, e se um dia eu não conseguir te acompanhar?' }, { who: 'O', mood: 'determined', text: 'Eu espero. Foguete nenhum vai sozinho tão longe.' }],
  [{ who: 'B', text: 'Lembrete do dia: beba água, desvie de projéteis e acredite em você. Eu só consigo cumprir dois dos três.' }, { who: 'O', mood: 'happy', text: 'Qual você não consegue?' }, { who: 'B', mood: 'happy', text: 'Beber água. Mas estou tentando.' }],
  [{ who: 'B', text: 'Sabe qual é a minha estrela favorita? A que você acendeu primeiro, lá na Nebulosa.' }, { who: 'O', mood: 'happy', text: 'Eu me lembro. Ela piscou como se fosse agradecer.' }, { who: 'B', mood: 'happy', text: 'Ela agradeceu. Eu traduzi.' }],
];

const Extras = {
  frag: null, enc: null, hint: 0,
  fragCount() { return (Save.data.frags || []).filter(Boolean).length; },
  encCount() { return Object.keys(Save.data.seen || {}).filter(k => k.startsWith('enc')).length; },
  star(x, y, r, c, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2) * .2); ctx.fillStyle = c; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * .45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  },
  reset() { this.frag = null; this.enc = null; },

  update(dt) {
    if (G.endless || G.training || G.bossPending || G.boss || G.bossDone || !G.player || G.player.dead) return;
    const st = G.stage, idx = G.stageIdx, seen = Save.data.seen || {};
    const startAt = G.t > st.duration * .3 && !this.fragDone, canFrag = !(Save.data.frags || [])[idx];
    if (startAt && canFrag && !this.frag && !G.fragSpawned) {
      G.fragSpawned = true; const left = Math.random() < .5;
      this.frag = { x: left ? 60 : W - 60, y: -40, vx: left ? 32 : -32, vy: 52, t: 0, idx };
    }
    if (G.t > st.duration * .45 && !seen['enc' + idx] && !this.enc && !G.encSpawned && ENCOUNTERS[idx]) {
      G.encSpawned = true; this.enc = { x: rand(200, W - 200), y: -50, t: 0, bx: 0, idx }; this.enc.bx = this.enc.x;
    }
    const p = G.player;
    if (this.frag) {
      const f = this.frag; f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.x += Math.sin(f.t * 1.6) * 30 * dt;
      if (Math.hypot(p.x - f.x, p.y - f.y) < 40) this.collect(f);
      else if (f.y > H + 50 || f.x < -60 || f.x > W + 60) this.frag = null;
    }
    if (this.enc) {
      const e = this.enc; e.t += dt; e.y += 46 * dt; e.x = e.bx + Math.sin(e.t * .8) * 120;
      if (Math.hypot(p.x - e.x, p.y - e.y) < 56) this.meet(e);
      else if (e.y > H + 60) this.enc = null;
    }
  },
  collect(f) {
    const d = Save.data; d.frags = d.frags || []; d.frags[f.idx] = true; Save.save(); this.frag = null;
    burst(f.x, f.y, ['#ffd36a', '#ffffff', '#ff9ac0'], 40, 420, 6); shockwave(f.x, f.y, 260, '#ffd36a'); flashScreen(.3); Snd.play('levelUp');
    popup(f.x, f.y - 30, 'FRAGMENTO DE LUZ  ' + this.fragCount() + '/6', '#ffe9a8', 26);
    recalcStats(G.player); Ach.check();
  },
  meet(e) {
    this.enc = null; const E = ENCOUNTERS[e.idx], p = G.player;
    Save.data.seen = Save.data.seen || {}; Save.data.seen['enc' + e.idx] = true; Save.save();
    const pages = E.pages.map(pg => pg.who === 'Z' ? { ...pg, who: 'Z', nm: E.name } : pg);
    G.encNow = E; CHARS.Z.name = E.name.toUpperCase(); CHARS.Z.c = E.c;
    Game.startStory(pages, () => {
      G.state = 'play'; G.encNow = null;
      if (E.reward === 'stars') { Save.data.coins += E.amt; G.runCoins += 0; Save.save(); }
      else if (E.reward === 'level') { G.pendingLevels++; }
      else if (E.reward === 'heal') { p.hp = p.maxHp; }
      popup(p.x, p.y - 50, E.label, '#7fe0a0', 26); shockwave(p.x, p.y, 220, '#7fe0a0'); Snd.play('shield'); Ach.check();
      Snd.musicPlay(G.stage.music, 1);
    }, { music: null });
  },

  drawWorld() {
    const t = World.t;
    if (this.frag) {
      const f = this.frag, pu = 1 + Math.sin(t * 6) * .12;
      ctx.save(); ctx.translate(f.x, f.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 70 * pu, '#ffd36a', .7); drawGlow(0, 0, 36, '#ff9ac0', .5); ctx.globalCompositeOperation = 'source-over';
      ctx.rotate(t * 1.4); ctx.fillStyle = '#fff2c0'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -22 * pu); ctx.lineTo(11, 0); ctx.lineTo(0, 22 * pu); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      if (Math.random() < .5) G.parts.push({ x: f.x + rand(-10, 10), y: f.y + rand(-10, 10), vx: rand(-20, 20), vy: rand(-30, 10), life: .6, max: .6, r: rand(2, 4), c: '#ffe9a8', drag: 1 });
    }
    if (this.enc) {
      const e = this.enc, E = ENCOUNTERS[e.idx];
      ctx.save(); ctx.translate(e.x, e.y + Math.sin(t * 3) * 4); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 80, E.c, .5); ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 26); g.addColorStop(0, '#fff'); g.addColorStop(1, E.c);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill();
      ctx.fillStyle = '#2a1050'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 9, -3, 4, 0, 7); ctx.fill(); }
      ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 4, 8, .2, Math.PI - .2); ctx.stroke();
      ctx.fillStyle = '#7fe0a0'; ctx.beginPath(); ctx.arc(26, -30, 13, 0, 7); ctx.fill(); txt('!', 26, -31, 18, '#0b3a20', 'center', 900, 'middle');
      ctx.restore();
    }
  },
};

// ---------- telas ----------
Screens.achievements = function () {
  const n = ACH.filter(a => Save.data.ach[a.id]).length, t = World.t;
  txt('CONQUISTAS', W / 2, 26, 42, '#fff', 'center'); txt(n + ' / ' + ACH.length, W / 2, 80, 22, '#ffb340', 'center', 800);
  // fragmentos
  txt('FRAGMENTOS DE LUZ', 70, 112, 16, '#ffb340', 'left', 900);
  for (let i = 0; i < 6; i++) {
    const has = (Save.data.frags || [])[i], x = 300 + i * 54, y = 122;
    ctx.save(); ctx.globalAlpha = has ? 1 : .3; if (has) { ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 26, '#ffd36a', .5); ctx.globalCompositeOperation = 'source-over'; }
    ctx.fillStyle = has ? '#fff2c0' : '#6a5aa0'; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 14); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  txt('+2% de dano por fragmento', 640, 114, 14, '#8a7fb0', 'left', 700);
  const cw = 560, ch = 50, gx = 70, gy = 146;
  ACH.forEach((a, i) => {
    const col = i % 2, row = (i / 2) | 0, x = gx + col * (cw + 20), y = gy + row * (ch + 6), has = Save.data.ach[a.id];
    UI.panel(x, y, cw, ch, { r: 16, fill: has ? 'rgba(60,34,140,.8)' : 'rgba(20,8,55,.65)', stroke: has ? '#ffb340' : 'rgba(190,160,255,.25)' });
    ctx.save(); ctx.globalAlpha = has ? 1 : .35; Extras.star(x + 36, y + ch / 2, 15, has ? '#ffd36a' : '#8a7fb0', t); ctx.restore();
    txt(a.name, x + 72, y + 5, 20, has ? '#fff' : '#a99fd6', 'left', 900); txt(a.desc, x + 72, y + 29, 14, has ? '#cdb8ff' : '#7a70a0', 'left', 700);
  });
  if (UI.button('back', W / 2 - 160, 660, 320, 48, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); }
};

Screens.chatOrbi = function () { // so abre a cena e volta
  const n = Save.data.stats.chats || 0, pages = [{ music: 'hope' }, ...ORBI_CHATS[n % ORBI_CHATS.length]];
  Save.data.stats.chats = n + 1; Save.save(); Ach.check();
  Game.startStory(pages, () => Game.goSelect(), { music: null });
};

// retrato simples dos viajantes (Z): bolinha fofa na cor do encontro
CHARS.Z = { name: 'VIAJANTE', c: '#ffcf6b', bg0: '#6a4a20', bg1: '#1a0e08' };
Portraits.face_Z = function (mood, t, talk) {
  const E = G.encNow, c = E ? E.c : '#ffcf6b';
  ctx.translate(0, Math.sin(t * 2.4) * 3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 110, c, .6); ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = rdl(-20, -26, 4, 76, [[0, '#ffffff'], [.5, c], [1, '#3a2010']]); ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); ctx.fill();
  const eh = this.blink(t, 3.6), sad = mood === 'sad', hp = mood === 'happy';
  ctx.fillStyle = '#2a1050'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 24, -8, 8, 11 * eh, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 24 + 3, -12, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#2a1050'; }
  ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
  if (talk) ctx.ellipse(0, 24, 10, 6 + Math.sin(t * 16) * 3, 0, 0, 7); else if (sad) ctx.arc(0, 38, 14, Math.PI * 1.15, Math.PI * 1.85); else ctx.arc(0, 18, hp ? 18 : 12, .2, Math.PI - .2);
  ctx.stroke();
  if (hp) { ctx.fillStyle = 'rgba(255,120,170,.5)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 40, 14, 11, 7, 0, 0, 7); ctx.fill(); } }
};
