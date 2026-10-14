'use strict';
// ---------- 88: o celular escolhe sozinho a melhor configuracao grafica ----------
// Na primeira vez que o jogo abre no celular (e quando o aparelho muda), roda um teste curto de ~4 s com uma cena pesada,
// do perfil mais bonito para o mais leve, e fica com o primeiro que se mantem fluido. A "Qualidade automatica" (que mudava os graficos
// no meio da partida) fica desligada no celular.
const Visual88 = { rt: [], cal: null, tried: false, msg: '' };
{
  const S = () => Save.data.settings || (Save.data.settings = {});
  const on = () => typeof Visual83 !== 'undefined' && Visual83.on;
  Visual88.sig = () => (navigator.userAgent || '').slice(0, 90) + '|' + screen.width + 'x' + screen.height + '|' + (window.devicePixelRatio || 1).toFixed(2) + '|' + (navigator.hardwareConcurrency || 0);
  hookRender(rn => function () {
    rn(); Visual88.rt.push(performance.now()); if (Visual88.rt.length > 600) Visual88.rt.shift();
    const s = S(); if (on()) s.gov = false;
    if (G.state === 'title' && on() && !Visual88.tried && !s.mobManual && s.mobCal !== Visual88.sig()) { Visual88.tried = true; Visual88.start(); }
  });
  Visual88.start = function (back) { Visual88.cal = { step: 0, phase: 0, t0: performance.now(), levels: [2, 1, 0], res: [], back: back || 'title' }; G.state = 'calib'; };
  const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
  Screens.calib = function () {
    const c = Visual88.cal; if (!c) { G.state = 'title'; return; } const now = performance.now(), s = S();
    // cena de teste: fundo + muitos brilhos e tiros, parecida com uma luta pesada
    World.draw(0); const t = World.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 260; i++) { const x = (i * 97.1 + t * (30 + i % 7 * 14)) % W, y = (i * 53.3 + t * (60 + i % 5 * 22)) % H; ctx.globalAlpha = .5; drawGlow(x, y, 12 + (i % 4) * 9, i % 3 ? '#b98cff' : '#ffb340', .6); }
    ctx.restore(); ctx.fillStyle = '#ff6a8a'; for (let i = 0; i < 120; i++) { ctx.beginPath(); ctx.arc((i * 131 + t * 90) % W, (i * 71 + t * 140) % H, 6, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 30; txt('OLIENZINHO', W / 2, 250, 72, '#fff', 'center', 900); ctx.restore();
    ctx.fillStyle = 'rgba(6,2,22,.72)'; ctx.fillRect(W / 2 - 320, 300, 640, 150);
    txt('Ajustando os gráficos do seu celular…', W / 2, 322, 28, '#fff', 'center', 900); txt('Testando: ' + Visual87.PROF[c.levels[Math.min(c.step, 2)]].name + '   (isso só acontece uma vez)', W / 2, 372, 18, '#cdb8ff', 'center', 700);
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(W / 2 - 240, 414, 480, 10); ctx.fillStyle = '#ffb340'; ctx.fillRect(W / 2 - 240, 414, 480 * clamp((c.step + clamp((now - c.t0) / 1100, 0, 1)) / 3, 0, 1), 10);
    if (c.phase === 0) { const L = c.levels[c.step]; s.mobPerf = L; Visual87.force = true; Visual87.apply(); c.t0 = performance.now(); c.phase = 1; return; }
    if (c.phase === 1) { if (now - c.t0 > 500) { Visual88.rt.length = 0; c.t0 = now; c.phase = 2; } return; }
    if (now - c.t0 < 1100) return;
    const g = []; for (let i = 1; i < Visual88.rt.length; i++) g.push(Visual88.rt[i] - Visual88.rt[i - 1]); const avg = g.reduce((a, b) => a + b, 0) / Math.max(1, g.length), p90 = g.length ? pct(g, .9) : 99;
    c.res.push([c.levels[c.step], Math.round(1000 / avg), Math.round(p90)]);
    if ((avg <= 18.5 && p90 <= 25) || c.step >= 2) {
      const L = (avg <= 18.5 && p90 <= 25) ? c.levels[c.step] : 0; s.mobPerf = L; s.mobCal = Visual88.sig(); s.mobManual = false; Save.save(); Visual87.force = true; Visual87.apply();
      Visual88.last = c.res; Visual88.cal = null; G.state = c.back; return;
    }
    c.step++; c.phase = 0;
  };
}

// opcao "Qualidade automatica" travada (desligada) no celular
{
  const tg = Visual37.toggle;
  Visual37.toggle = function (id, x, y, w, h, label, on, desc) {
    if (id === 'gov' && typeof Visual83 !== 'undefined' && Visual83.on) { tg.call(this, id, x, y, w, h, label, false, 'Desligada no celular: o jogo já escolheu a melhor configuração para o seu aparelho.'); return false; }
    return tg.apply(this, arguments);
  };
  // botao no menu "Tela e instalacao": refazer o teste
  const ds = Screens.display;
  Screens.display = function () {
    const r = ds.apply(this, arguments); if (!(typeof Visual83 !== 'undefined' && Visual83.on)) return r;
    if (UI.button('d_auto2', 500, 540, 280, 40, 'ESCOLHER O MELHOR (AUTO)', { size: 14 })) { Save.data.settings.mobManual = false; Visual88.start('display'); }
    return r;
  };
  // trocar o perfil na mao desliga a escolha automatica
  const sv = Save.save; Save.save = function () { return sv.apply(this, arguments); };
}
