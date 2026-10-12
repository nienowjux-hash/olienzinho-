'use strict';
// ---------- 75: nomes dos golpes dos chefes, conjunto novo de icones das cartas, ceu de fundo em janelas largas, clima por setor, memorias nos creditos,
// zoom nas furias, painel F3 de desempenho com chaves de efeitos, corpo das skins, molduras de cinema nas cenas ----------
const Visual75 = { fps: 60, dbg: false, ft: 16 };
const ok75 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h75 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
Visual75.LBL = { beam: 'RAIO', bolt: 'RELÂMPAGO', core: 'NÚCLEO', fan: 'LEQUE', kami: 'KAMIKAZES', laser: 'LASER', nova: 'NOVA', ring: 'ANEL', rocks: 'PEDRAS', slam: 'PANCADA', spiral: 'ESPIRAL', sum: 'CONVOCAÇÃO', bits: 'BITS', cannon: 'CANHÃO', cols: 'COLUNAS', dive: 'MERGULHO', mirror: 'ESPELHO', cross: 'CRUZ', drop: 'QUEDA', lances: 'LANÇAS', spit: 'CUSPE', wave: 'ONDA', beat: 'BATIDA', bomb: 'BOMBA', burst: 'EXPLOSÃO', collapse: 'COLAPSO', echo: 'ECO', fan2: 'LEQUE', fan3: 'LEQUE', las: 'LASER', quake: 'TREMOR', rain: 'CHUVA', stream: 'JATO', sweep: 'VARREDURA', current: 'CORRENTE', grid: 'GRADE', halo: 'HALO', invert: 'INVERSÃO', lanterns: 'LANTERNAS', tide: 'MARÉ', clones: 'CLONES', rewrite: 'REESCRITA', tear: 'RASGO' };

// ---------- 2. conjunto de icones das cartas com o mesmo traco e o mesmo preenchimento ----------
Visual2.newIcon = function (id, c, t) {
  const S = ctx; S.lineWidth = 3.4; S.lineCap = 'round'; S.lineJoin = 'round'; S.strokeStyle = '#fff'; S.fillStyle = 'rgba(255,255,255,.28)';
  const P = (fn, fill) => { S.beginPath(); fn(); if (fill !== false) S.fill(); S.stroke(); };
  const star = (r, n = 5, k = .45) => { for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * k : r, a = i * Math.PI / n - Math.PI / 2; S.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } S.closePath(); };
  switch (id) {
    case 'dmg': P(() => { S.moveTo(0, -26); S.lineTo(7, -12); S.lineTo(7, 10); S.lineTo(-7, 10); S.lineTo(-7, -12); S.closePath(); }); P(() => { S.moveTo(-14, 14); S.lineTo(14, 14); }, false); P(() => { S.moveTo(0, 14); S.lineTo(0, 26); }, false); break;
    case 'rate': for (let k = 0; k < 3; k++) P(() => { S.moveTo(-12, 6 - k * 11); S.lineTo(0, -6 - k * 11); S.lineTo(12, 6 - k * 11); }, false); break;
    case 'speed': P(() => { S.moveTo(-22, -14); S.lineTo(2, 0); S.lineTo(-22, 14); }, false); P(() => { S.moveTo(-4, -16); S.lineTo(20, 0); S.lineTo(-4, 16); }, false); break;
    case 'hp': case 'heal': P(() => { S.moveTo(0, 22); S.bezierCurveTo(-34, -2, -22, -26, 0, -10); S.bezierCurveTo(22, -26, 34, -2, 0, 22); }); if (id === 'heal') { P(() => { S.moveTo(0, -6); S.lineTo(0, 10); S.moveTo(-8, 2); S.lineTo(8, 2); }, false); } break;
    case 'magnet': P(() => { S.moveTo(-16, -20); S.lineTo(-16, 4); S.arc(0, 4, 16, Math.PI, 0, true); S.lineTo(16, -20); }, false); P(() => { S.moveTo(-22, -20); S.lineTo(-10, -20); S.moveTo(10, -20); S.lineTo(22, -20); }, false); break;
    case 'dash': P(() => { S.moveTo(-6, -14); S.lineTo(16, 0); S.lineTo(-6, 14); S.closePath(); }); P(() => { S.moveTo(-24, -8); S.lineTo(-12, -8); S.moveTo(-24, 8); S.lineTo(-12, 8); }, false); break;
    case 'spec': P(() => star(26)); break;
    case 'pulse': for (let k = 0; k < 3; k++) P(() => { S.arc(0, 0, 7 + k * 8, 0, TAU); }, false); break;
    case 'xp': P(() => { S.moveTo(0, -24); S.lineTo(8, -4); S.lineTo(0, 0); S.lineTo(-8, -4); S.closePath(); }); P(() => { S.moveTo(0, 8); S.lineTo(0, 24); S.moveTo(-6, 18); S.lineTo(0, 24); S.lineTo(6, 18); }, false); break;
    case 'lucky': case 'luck': for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; P(() => { S.arc(Math.cos(a) * 11, Math.sin(a) * 11, 9, 0, TAU); }); } P(() => { S.moveTo(0, 4); S.lineTo(4, 24); }, false); break;
    case 'multi': for (const a of [-.55, 0, .55]) { S.save(); S.rotate(a); P(() => { S.moveTo(0, -24); S.lineTo(6, -12); S.lineTo(-6, -12); S.closePath(); }); P(() => { S.moveTo(0, -12); S.lineTo(0, 20); }, false); S.restore(); } break;
    case 'pierce': P(() => { S.arc(6, 0, 14, 0, TAU); }); P(() => { S.moveTo(-26, 0); S.lineTo(22, 0); S.moveTo(14, -8); S.lineTo(22, 0); S.lineTo(14, 8); }, false); break;
    case 'crit': P(() => { S.arc(0, 0, 18, 0, TAU); }, false); P(() => { S.arc(0, 0, 8, 0, TAU); }); P(() => { S.moveTo(-26, 0); S.lineTo(-14, 0); S.moveTo(26, 0); S.lineTo(14, 0); S.moveTo(0, -26); S.lineTo(0, -14); S.moveTo(0, 26); S.lineTo(0, 14); }, false); break;
    case 'shield': P(() => { S.moveTo(0, -24); S.lineTo(20, -16); S.lineTo(18, 6); S.quadraticCurveTo(14, 20, 0, 26); S.quadraticCurveTo(-14, 20, -18, 6); S.lineTo(-20, -16); S.closePath(); }); break;
    case 'ricochet': P(() => { S.moveTo(-22, 18); S.lineTo(-4, -10); S.lineTo(6, 8); S.lineTo(22, -18); }, false); P(() => { S.moveTo(12, -20); S.lineTo(22, -18); S.lineTo(18, -8); }, false); break;
    case 'chain': P(() => { S.ellipse(-8, -6, 12, 7, -.7, 0, TAU); }, false); P(() => { S.ellipse(8, 6, 12, 7, -.7, 0, TAU); }, false); break;
    case 'combochg': P(() => { S.moveTo(0, -26); S.quadraticCurveTo(16, -8, 14, 6); S.quadraticCurveTo(12, 24, 0, 24); S.quadraticCurveTo(-14, 24, -14, 8); S.quadraticCurveTo(-14, -2, -4, -8); S.quadraticCurveTo(-2, -2, 2, -2); S.quadraticCurveTo(4, -14, 0, -26); S.closePath(); }); break;
    case 'reflect': P(() => { S.moveTo(0, -24); S.lineTo(18, -16); S.lineTo(16, 6); S.quadraticCurveTo(12, 18, 0, 24); S.quadraticCurveTo(-12, 18, -16, 6); S.lineTo(-18, -16); S.closePath(); }, false); P(() => { S.moveTo(-8, 8); S.lineTo(0, -8); S.lineTo(8, 8); }, false); break;
    case 'vamp': P(() => { S.moveTo(0, -24); S.quadraticCurveTo(20, 2, 14, 12); S.quadraticCurveTo(8, 24, 0, 24); S.quadraticCurveTo(-8, 24, -14, 12); S.quadraticCurveTo(-20, 2, 0, -24); S.closePath(); }); P(() => { S.moveTo(-6, 6); S.lineTo(-3, 14); S.lineTo(0, 6); S.moveTo(0, 6); S.lineTo(3, 14); S.lineTo(6, 6); }, false); break;
    case 'overdrive': P(() => { S.arc(0, 0, 22, 0, TAU); }, false); P(() => { S.moveTo(4, -16); S.lineTo(-8, 2); S.lineTo(0, 2); S.lineTo(-4, 16); S.lineTo(10, -4); S.lineTo(2, -4); S.closePath(); }); break;
    case 'missile': P(() => { S.moveTo(0, -26); S.quadraticCurveTo(9, -14, 8, 8); S.lineTo(-8, 8); S.quadraticCurveTo(-9, -14, 0, -26); S.closePath(); }); P(() => { S.moveTo(-8, 4); S.lineTo(-16, 16); S.lineTo(-8, 12); S.moveTo(8, 4); S.lineTo(16, 16); S.lineTo(8, 12); }, false); P(() => { S.moveTo(0, 12); S.lineTo(0, 24); }, false); break;
    case 'orbit': P(() => { S.arc(0, 0, 9, 0, TAU); }); P(() => { S.ellipse(0, 0, 24, 9, -.5, 0, TAU); }, false); P(() => { S.arc(18, -10, 3, 0, TAU); }); break;
    default: return false;
  }
  return true;
};

// ---------- 1. ceu de fundo em janelas largas: estrelas atras do quadro do jogo ----------
{
  const bg = document.createElement('canvas'); bg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none'; const g = bg.getContext('2d'); document.body.insertBefore(bg, document.body.firstChild); document.getElementById('c').style.position = 'relative'; document.getElementById('c').style.zIndex = '1';
  let last = 0; const draw = (now) => { requestAnimationFrame(draw); if (now - last < 66) return; last = now; const w = innerWidth, h = innerHeight; if (bg.width !== w || bg.height !== h) { bg.width = w; bg.height = h; }
    const asp = w / h; g.clearRect(0, 0, w, h); if (Math.abs(asp - 16 / 9) < .08 || (typeof G !== 'undefined' && G.state === 'cine')) return; g.fillStyle = '#fff';
    for (let i = 0; i < 90; i++) { const d = .3 + (i % 3) * .35, x = ((h75(i) * w - now * .003 * d * 6) % w + w) % w, y = h75(i + 50) * h, a = .25 + .5 * Math.abs(Math.sin(now * .001 * d + i)); g.globalAlpha = a * .7; g.fillRect(x, y, 1 + d * 1.2, 1 + d * 1.2); } g.globalAlpha = 1;
    const cw = Math.min(w, h * 16 / 9), m = (w - cw) / 2, p = (typeof G !== 'undefined') && G.player; if (m >= 120 && G.state === 'play' && p) {
      const bx = (x, y, wd, k, c) => { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x, y, wd, 10); g.fillStyle = c; g.fillRect(x, y, wd * Math.max(0, Math.min(1, k)), 10); };
      const tx = (s, x, y, sz, c) => { g.font = '800 ' + sz + 'px sans-serif'; g.fillStyle = c; g.textAlign = 'center'; g.fillText(s, x, y); };
      const lx = m / 2, rx = w - m / 2, bw = Math.min(110, m - 40), u = Math.max(.8, h / 720);
      g.globalAlpha = .85; tx('PONTOS', lx, h * .3, 13 * u, '#b8a8e8'); tx(String(Math.floor(G.score || 0)), lx, h * .3 + 30 * u, 26 * u, '#fff'); tx('COMBO', lx, h * .5, 13 * u, '#b8a8e8'); tx('x' + (G.combo || 0), lx, h * .5 + 30 * u, 26 * u, '#ffd36a');
      tx('NÍVEL ' + (G.level || 1), rx, h * .3, 13 * u, '#b8a8e8'); bx(rx - bw / 2, h * .3 + 12 * u, bw, (G.xp || 0) / (G.xpNeed || 1), '#7fe0ff'); tx('VIDA', rx, h * .5, 13 * u, '#b8a8e8'); bx(rx - bw / 2, h * .5 + 12 * u, bw, p.hp / (p.maxHp || 1), '#ff6a8a'); g.globalAlpha = 1;
    } };
  requestAnimationFrame(draw);
}

// ---------- 7. clima por setor ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 1 || !G.stage || Visual55.lvl() < 1) return; const nm = (G.stage.name || '').toLowerCase(), t = World.t; let kind = null;
    if (/oceano|mar /.test(nm + ' ')) kind = 'bub'; else if (/solar|sol |lava/.test(nm + ' ')) kind = 'emb'; else if (/cemit|cinza/.test(nm)) kind = 'ash'; else if (/cidade/.test(nm)) kind = 'pet'; else if (/espelho/.test(nm)) kind = 'gls'; if (!kind) return;
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const sp = 20 + h75(i) * 40, x = (h75(i + 3) * W + Math.sin(t * .6 + i) * 30), up = kind === 'bub' || kind === 'emb', y = up ? H + 20 - ((t * sp + h75(i + 8) * H) % (H + 40)) : -20 + ((t * sp + h75(i + 8) * H) % (H + 40)), r = 2 + h75(i + 11) * 4;
      if (kind === 'bub') { ctx.globalAlpha = .4; ctx.strokeStyle = '#bfefff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.stroke(); }
      else if (kind === 'emb') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6; drawGlow(x, y, r * 2.4, '#ff9a4a', .8); }
      else if (kind === 'ash') { ctx.globalAlpha = .4; ctx.fillStyle = '#9a9ab8'; ctx.fillRect(x, y, r, r * .6); }
      else if (kind === 'pet') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .45; drawGlow(x, y, r * 2.6, '#ffe9c0', .7); }
      else { ctx.globalAlpha = .45; ctx.fillStyle = '#e8d8ff'; ctx.save(); ctx.translate(x, y); ctx.rotate(t * (h75(i) - .5) * 3 + i); ctx.beginPath(); ctx.moveTo(0, -r * 1.6); ctx.lineTo(r, r); ctx.lineTo(-r, r * .6); ctx.closePath(); ctx.fill(); ctx.restore(); }
    }
    ctx.restore();
  };
}

// ---------- 8. creditos: tres cartoes de memoria no inicio ----------
{
  const cr = Screens.credits;
  Screens.credits = function () {
    const r = cr.apply(this, arguments); if (QL() < 1) return r; const u = World.t - (typeof Visual61 !== 'undefined' && Visual61.cr0 !== null ? Visual61.cr0 : 0); if (u < 0 || u > 8) return r;
    const gr = Object.values(Save.data.grades || {}), cards = [['NOTAS S', gr.filter(g => g >= 3).length, '#ffd36a'], ['SETORES', Object.values(Save.data.cleared || {}).filter(Boolean).length, '#7fe0a0'], ['CONQUISTAS', Object.values(Save.data.ach || {}).filter(Boolean).length, '#ff7ac8']];
    cards.forEach(([lab, v, c], i) => { const k = clamp((u - .5 - i * .3) / .5, 0, 1) * clamp((8 - u) / .6, 0, 1); if (k <= 0) return; const x = W / 2 - 270 + i * 190, y = 126 + (1 - k) * 18; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(12,4,34,.82)'; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, 170, 62, 14); ctx.fill(); ctx.stroke(); txt(lab, x + 85, y + 8, 12, c, 'center', 900); txt(String(v), x + 85, y + 26, 28, '#fff', 'center', 900); ctx.restore(); });
    return r;
  };
}

// ---------- 9. furias: o enquadramento fecha um pouco no chefe (sem camera lenta) ----------
{
  const op = Boss.prototype.onPhase;
  Boss.prototype.onPhase = function () { const r = op.apply(this, arguments); if (QL() >= 1) { G.zoom = Math.max(G.zoom || 0, .06); G.zoomCx = this.x; G.zoomCy = this.y; } return r; };
}

// ---------- 10. painel F3: desempenho e chaves de efeitos (1 = brilhos grandes, 2 = eventos de fundo, 3 = metade das particulas) ----------
{
  addEventListener('keydown', e => {
    if (e.key === 'F3') { e.preventDefault(); Visual75.dbg = !Visual75.dbg; return; }
    if (!Visual75.dbg) return; const s = Save.data.settings; const m = { '1': 'fxBig', '2': 'fxEv', '3': 'fxHalf' }[e.key]; if (m) { s[m] = m === 'fxHalf' ? !s[m] : (s[m] === false); Save.save(); }
  });
  hookRender(rn => { let last = performance.now(); return function () {
    const now = performance.now(), d = now - last; last = now; if (d > 0 && d < 500) Visual75.ft += (d - Visual75.ft) * .08; rn();
    const s = Save.data.settings; if (s.fxEv === false) { if (typeof Visual60 !== 'undefined') Visual60.ev = null; if (typeof Visual68 !== 'undefined') Visual68.bg = null; }
    if (!Visual75.dbg) return; ctx.setTransform(K, 0, 0, K, 0, 0); ctx.save(); ctx.fillStyle = 'rgba(6,2,22,.8)'; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(W - 292, 200, 280, 150, 12); ctx.fill(); ctx.stroke(); ctx.font = `800 13px ${FONT}`; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = '#c8f6ff';
    const L = ['FPS ' + Math.round(1000 / Math.max(1, Visual75.ft)) + '  (' + Visual75.ft.toFixed(1) + ' ms)', 'Partículas ' + G.parts.length + '  Tiros ' + G.pb.length + ' / ' + G.eb.length, 'Inimigos ' + G.enemies.length + '  Resolução ' + Math.round((window.DYN || 1) * 100) + '%', 'Qualidade automática: nível ' + (typeof Visual65 !== 'undefined' ? Visual65.level : 0), '[1] Brilhos grandes: ' + (s.fxBig === false ? 'NÃO' : 'SIM'), '[2] Eventos de fundo: ' + (s.fxEv === false ? 'NÃO' : 'SIM'), '[3] Metade das partículas: ' + (s.fxHalf ? 'SIM' : 'NÃO'), 'F3 fecha']; L.forEach((l, i) => ctx.fillText(l, W - 280, 208 + i * 17)); ctx.restore();
  }; });
}

// ---------- 5. corpo das skins: casulos de motor e anel na cabine ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    const r = sh.call(this, x, y, o); if (QL() < 1 || !o || o.orbi || !o.pal || (o.scale || 1) < .6) return r; const inPlay = G.state === 'play' && G.player && Math.abs(x - G.player.x) < 2, inHg = G.state === 'hangar'; if (!inPlay && !inHg) return r;
    const sk = (typeof SKINS !== 'undefined') ? SKINS.find(s => s.pal === o.pal) : null; if (!sk || sk.id === 'violet') return r; let h = 0; for (const ch of sk.id) h = (h * 17 + ch.charCodeAt(0)) | 0; const v = Math.abs(h) % 3; if (v === 0) return r; const k = (o.scale || 1), c = ok75(o.pal.glow) ? o.pal.glow : '#b98cff';
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    if (v === 1) { for (const s of [-1, 1]) { ctx.fillStyle = 'rgba(30,16,70,.95)'; ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(s * 20 - 5, 14, 10, 24, 4); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 20, 40, 10, c, .7); ctx.globalCompositeOperation = 'source-over'; } }
    else { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.globalAlpha = .8; ctx.beginPath(); ctx.ellipse(0, -12, 13, 13, 0, 0, TAU); ctx.stroke(); }
    ctx.restore(); return r;
  };
}

// ---------- 6. cenas importantes: luz de cinema que passa e filetes dourados ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video || !['lumi', 'lumiFade', 'void', 'voidArrive', 'voidBreak', 'heart'].includes(pg.scene)) return r; const t = World.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x = ((t * 60) % (W + 600)) - 300, g = ctx.createLinearGradient(x - 120, 0, x + 120, 0); g.addColorStop(0, 'rgba(255,233,168,0)'); g.addColorStop(.5, 'rgba(255,233,168,.07)'); g.addColorStop(1, 'rgba(255,233,168,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 120, 0); ctx.lineTo(x + 120, 0); ctx.lineTo(x + 60, H); ctx.lineTo(x - 180, H); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(255,214,120,.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(22, 70, W - 44, H - 140); ctx.restore(); return r;
  };
}

// ---------- chaves do painel F3 ligadas ao desenho ----------
{
  const dg = drawGlow;
  drawGlow = function (x, y, r, c, a = 1) { if (r >= 90 && Save.data.settings.fxBig === false) return; return dg(x, y, r, c, a); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { const n = G.parts.length, r = up.call(this, dt); if (Save.data.settings.fxHalf && G.parts.length > n) { let k = 0; for (let i = n; i < G.parts.length; i++) if ((k++ & 1)) G.parts[i] = null; G.parts = G.parts.filter(Boolean); } return r; };
}
