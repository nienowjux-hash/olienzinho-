'use strict';
// ---------- 86: tutorial unico e organizado (um cartao so, um passo de cada vez, com o botao destacado no celular) ----------
// Substitui o tutorial antigo (cartoes que pausavam o jogo, barra de baixo e lista lateral), que apareciam todos juntos.
const Visual86 = { step: 0, run: -1, done: 0, base: {}, moved: 0, px: 0, py: 0, k0: 0, fin: 0 };
{
  // o tutorial antigo e a lista lateral nao rodam mais
  Extras.tutStart = function () { this.tut = null; };
  const sd = Save.data; if ((sd.seen && sd.seen.tutorial) || sd.tutDone) sd.tut2 = true;

  const isTouch = () => typeof Visual83 !== 'undefined' && Visual83.on;
  const STEPS = () => {
    const t = isTouch();
    return [
      { key: 'move', title: 'MOVER', hint: t ? 'Arraste o dedo no lado esquerdo da tela para mover a nave.' : 'Mova a nave com WASD, as setas ou o mouse.', ok: () => Visual86.moved > 380 },
      { key: null, title: 'ATIRAR', hint: 'A nave atira sozinha. Derrote 3 inimigos.', ok: () => G.kills - Visual86.k0 >= 3 || G.t - Visual86.t0 > 14 },
      { key: 'shift', title: 'ESQUIVAR', hint: t ? 'Toque em ESQUIVA para dar um pulo rápido e ficar protegido.' : 'Aperte SHIFT para uma esquiva rápida e protegida.', ok: () => G.player.dashCd > Visual86.base.dash + .3 || G.player.dashT > 0 },
      { key: ' ', title: 'PULSO', hint: t ? 'Toque em PULSO: apaga os tiros inimigos da tela.' : 'Aperte ESPAÇO: o pulso apaga os tiros inimigos da tela.', ok: () => G.player.pulseT > Visual86.base.pulse + .3 },
      { key: 'q', title: 'ESPECIAL', hint: t ? 'Toque no botão grande ESPECIAL: cada arma tem o seu.' : 'Aperte Q para o especial da arma: cada uma tem o seu.', ok: () => G.player.specCd > Visual86.base.spec + .3 },
      { key: 'f', title: 'REBATER', hint: t ? 'Toque em REBATER quando um tiro estiver bem perto: ele volta contra o inimigo.' : 'Aperte F quando um tiro estiver bem perto: ele volta contra o inimigo.', ok: () => (G.player.parryT || 0) > 0 },
    ];
  };
  Visual86.skip = function () { Save.data.tut2 = true; Save.save(); G.tutOn = false; if (typeof Visual83 !== 'undefined') { Visual83.hl = null; Visual83.pass = []; Visual83.extra = []; } };

  const upd = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = upd.call(this, dt); const p = G.player; if (!p || G.state !== 'play') return r;
    const V = Visual86, ok = !Save.data.tut2 && G.stageIdx === 0 && !G.endless && !G.training && !G.rush && !G.practice && !G.daily && !G.weekly && !G.secret;
    if (!ok) { G.tutOn = false; return r; }
    if (V.run !== G.runId) { V.run = G.runId; V.step = 0; V.fin = 0; V.moved = 0; V.px = p.x; V.py = p.y; V.k0 = 0; V.t0 = G.t; V.base = { dash: p.dashCd, pulse: p.pulseT, spec: p.specCd }; }
    if (G.t < 3.5) { G.tutOn = false; return r; }   // primeiro o titulo da fase, depois o tutorial
    G.tutOn = true;
    if (p.dashT > 0) { V.px = p.x; V.py = p.y; } else { V.moved += Math.hypot(p.x - V.px, p.y - V.py); V.px = p.x; V.py = p.y; }
    const S = STEPS();
    if (V.step < S.length) {
      const cur = S[V.step];
      if (cur.ok()) { V.step++; V.base = { dash: p.dashCd, pulse: p.pulseT, spec: p.specCd }; if (V.step === 1) { V.k0 = G.kills; V.t0 = G.t; } if (V.step === 4) { p.specCd = 0; V.base.spec = 0; } if (V.step === 5) { p.parryCd = 0; } if (V.step === 3) { p.pulseT = 0; V.base.pulse = 0; } Snd.play('uiSelect'); if (V.step >= S.length) { V.fin = World.t; Snd.play('stamp'); } }
    } else if (World.t - V.fin > 2.6) { Visual86.skip(); }
    return r;
  };

  // um cartao so, sempre no mesmo lugar (no alto, abaixo da barra da fase)
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const V = Visual86; if (!G.tutOn || G.state !== 'play' || G.cut) { if (typeof Visual83 !== 'undefined') { Visual83.hl = null; Visual83.pass = []; Visual83.extra = []; } return; }
    const S = STEPS(), n = S.length, fin = V.step >= n, cur = fin ? null : S[V.step], t = World.t;
    const w = 700, h = 92, x = W / 2 - w / 2, y = 92, a = fin ? clamp((2.6 - (t - V.fin)) / .5, 0, 1) : clamp((t - (V.lastT || t)) * 8, 0, 1);
    V.lastT = V.lastT || t;
    ctx.save(); ctx.globalAlpha = .96 * a; UI.panel(x, y, w, h, { r: 20, fill: 'rgba(14,6,44,.92)', stroke: fin ? '#7fe0a0' : '#ffb340' });
    if (fin) { txt('PRONTO!', W / 2, y + 16, 30, '#7fe0a0', 'center', 900); txt('Bom jogo, Guardião das Estrelas.', W / 2, y + 56, 18, '#e8dcff', 'center', 700); }
    else {
      txt('PASSO ' + (V.step + 1) + ' DE ' + n, x + 28, y + 12, 13, '#ffb340', 'left', 900); txt(cur.title, x + 28, y + 30, 28, '#fff', 'left', 900);
      UI.wrap(cur.hint, x + 210, y + 16, w - 210 - 24, 22, 16, '#e8dcff', 'left', 700);
      for (let i = 0; i < n; i++) { ctx.fillStyle = i < V.step ? '#7fe0a0' : i === V.step ? '#ffb340' : 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.arc(x + 32 + i * 18, y + h - 14, 4.5, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    if (typeof Visual83 !== 'undefined' && Visual83.on) { const g = Visual83.geo(); Visual83.extra = fin ? [] : [{ x: g.r.left + g.r.width / 2 - 66, y: g.r.top + (y + h) * (g.r.width / W) + 8, w: 132, h: 44, label: 'PULAR', fn: () => Visual86.skip() }]; }
    else if (!fin) {   // botao PULAR so reage a clique/toque (nunca a ESPACO/ENTER, que sao pulso e confirmacao)
      const bx = x + w - 112, by = y + h - 36, bw = 96, bh = 26, m = Input.mouse, inside = m.x >= bx && m.x <= bx + bw && m.y >= by && m.y <= by + bh;
      ctx.save(); ctx.fillStyle = inside ? 'rgba(154,99,255,.9)' : 'rgba(60,34,140,.85)'; ctx.strokeStyle = 'rgba(205,184,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 15); ctx.fill(); ctx.stroke(); txt('PULAR', bx + bw / 2, by + 3, 13, '#fff', 'center', 800); ctx.restore();
      if (m.click && inside) Visual86.skip();
    }
    if (typeof Visual83 !== 'undefined') { Visual83.hl = fin ? null : cur.key === 'move' ? 'move' : cur.key; Visual83.pass = []; }
  };

  // dicas soltas (rebater, etc.) e a dica de inicio de fase nao aparecem durante o tutorial
  const vh = Visual16.hud; Visual16.hud = function () { if (G.tutOn) return; return vh.apply(this, arguments); };
  const ss = Game.startStage; Game.startStage = function () { const r = ss.apply(this, arguments); if (!Save.data.tut2 && typeof Visual39 !== 'undefined' && Visual39.card) Visual39.card.tip = null; Visual86.lastT = 0; return r; };
  // textos das dicas no celular
  if (typeof Visual83 !== 'undefined') {
    const sw = Visual83.swap; Visual83.swap = function (s) { if (typeof s === 'string') s = s.replace(/Rebater \(F\)/g, 'Rebater').replace(/Aperte F quando/g, 'Toque em REBATER quando').replace(/^F$/, 'REB.'); return sw.call(this, s); };
  }
}
