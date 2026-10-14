'use strict';
// ---------- 87: desempenho no celular ----------
// Tres perfis: FLUIDO (padrao, o mais leve), EQUILIBRADO e BONITO. Mexem em: resolucao interna, brilho/bloom, sombras desfocadas, particulas,
// efeitos de tela, taxa de quadros (60 no maximo, mesmo em tela de 120 Hz) e reverberacao do audio. So valem no modo toque.
const Visual87 = { lvl: -1, pmax: 99999 };
{
  const S = () => Save.data.settings || (Save.data.settings = {});
  const cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
  Visual87.auto = () => (cores >= 8 && mem >= 4) ? 1 : 0;
  Visual87.level = () => { const v = S().mobPerf; return v === undefined ? Visual87.auto() : v; };
  const PROF = [
    { name: 'FLUIDO', quality: 0, fx: 0, half: true, maxw: cores >= 8 ? 1280 : 1024, bloom: false, shadow: false, pmax: 160, lite: true, soft: true },
    { name: 'EQUILIBRADO', quality: 1, fx: 1, half: true, maxw: cores >= 8 ? 1600 : 1280, bloom: false, shadow: false, pmax: 260, lite: true, soft: true },
    { name: 'BONITO', quality: 2, fx: 1, half: false, maxw: 1920, bloom: true, shadow: true, pmax: 520, lite: false, soft: false },
  ];
  Visual87.PROF = PROF;
  // aplica o perfil (so no celular; no PC nada muda)
  Visual87.apply = function () {
    const on = typeof Visual83 !== 'undefined' && Visual83.on, L = on ? Visual87.level() : -1; if (L === Visual87.lvl && !Visual87.force) return; Visual87.lvl = L; Visual87.force = false;
    if (L < 0) { window.__nobloom = false; window.__noshadow = false; window.__fcap = 0; window.__sndLite = false; window.DYNB = 1; Visual87.pmax = 99999; try { resize(); } catch (e) { } return; }
    const P = PROF[L], s = S();
    s.quality = P.quality; s.fx = P.fx; s.fxHalf = P.half; s.softGlow = P.soft;
    window.__nobloom = !P.bloom; window.__noshadow = !P.shadow; window.__fcap = 15; window.__sndLite = P.lite; Visual87.pmax = P.pmax;
    const full = Math.min(innerWidth, innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2) * (s.res || 1);
    window.DYNB = clamp(P.maxw / Math.max(1, full), .4, 1);
    try { resize(); } catch (e) { }
  };
  hookRender(rn => { let t = 0; return function () { if (++t % 20 === 1) Visual87.apply(); rn(); }; });
  addEventListener('resize', () => { Visual87.force = true; }); addEventListener('orientationchange', () => { Visual87.force = true; });

  // sombras desfocadas (shadowBlur) custam muito na GPU do celular: ficam desligadas fora do perfil BONITO
  {
    const P = CanvasRenderingContext2D.prototype, d = Object.getOwnPropertyDescriptor(P, 'shadowBlur');
    if (d && d.set) Object.defineProperty(P, 'shadowBlur', { configurable: true, enumerable: d.enumerable, get() { return d.get.call(this); }, set(v) { d.set.call(this, window.__noshadow ? 0 : v); } });
  }
  // limite de particulas e de ondas de choque
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const m = Visual87.pmax; if (m < 99999) { if (G.parts.length > m) G.parts.splice(0, G.parts.length - m); if (G.rings.length > 5) G.rings.splice(0, G.rings.length - 5); if (G.pops.length > 8) G.pops.splice(0, G.pops.length - 8); }
    return r;
  };
  // governador: no celular os brilhos grandes tem um orcamento menor
  const va = Visual65.apply; Visual65.apply = function () { va.apply(this, arguments); if (window.__noshadow !== undefined && typeof Visual83 !== 'undefined' && Visual83.on && Visual87.lvl < 2) Visual64.B = Math.min(Visual64.B, W * H * .75); };
}

// linha no menu Tela e Instalacao
{
  const ds = Screens.display;
  Screens.display = function () {
    const r = ds.apply(this, arguments); if (!(typeof Visual83 !== 'undefined' && Visual83.on)) return r;
    const s = Save.data.settings, L = Visual87.level(); txt('Desempenho no celular', 196, 540, 18, '#fff', 'left', 900); txt(['Mais leve possível: máxima fluidez', 'Equilíbrio entre imagem e fluidez', 'Mais bonito (pode pesar)'][L], 196, 566, 13, '#cdb8ff', 'left', 700);
    if (UI.button('d_perf', 800, 540, 280, 40, Visual87.PROF[L].name, { size: 15, color: '#9a63ff' })) { s.mobPerf = (L + 1) % 3; Save.save(); Visual87.force = true; Visual87.apply(); }
    return r;
  };
}
