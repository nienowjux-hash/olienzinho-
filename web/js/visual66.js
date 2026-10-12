'use strict';
// ---------- 66: aba CONTROLES nas Opcoes: controles detectados sozinhos, diagrama ao vivo, troca de botoes e vibracao ----------
const Visual66 = { wait: null };
Visual66.NAMES = {
  xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT'],
  ps: ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2'],
  ns: ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR'],
};
Visual66.KEYS = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt'];
Visual66.TYPE = { xbox: 'Xbox', ps: 'PlayStation', ns: 'Nintendo', gen: 'Genérico' };
Visual66.kind = id => /054c|playstation|dualshock|dualsense|wireless controller/i.test(id) ? 'ps' : /057e|nintendo|switch|pro controller|joy-?con/i.test(id) ? 'ns' : /xbox|045e|xinput|microsoft/i.test(id) ? 'xbox' : 'gen';
Visual66.list = function () {
  const out = [], l = (navigator.getGamepads && navigator.getGamepads()) || [];
  for (const g of l) if (g && g.connected) { const k = Visual66.kind(g.id || ''); let nm = (g.id || 'Controle').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim(); if (nm.length > 34) nm = nm.slice(0, 34) + '…'; out.push({ g, kind: k, name: nm || 'Controle' }); }
  return out;
};
Visual66.label = function () { const p = Visual66.list(); return p.length ? ' ' + Visual66.TYPE[p[0].kind] : ''; };
Visual66.glyph = (kind, key) => (Visual66.NAMES[kind] || Visual66.NAMES.xbox)[Visual66.KEYS.indexOf(key)] || key.toUpperCase();
addEventListener('gamepadconnected', () => { try { Visual6.toast = 3.2; Snd.init(); } catch (e) { } });
addEventListener('gamepaddisconnected', () => { try { Visual6.toast = 3.2; } catch (e) { } });

// enquanto espera um botao para trocar, o controle nao pode navegar pelos menus
{
  const pp = Visual6.pollPads;
  Visual6.pollPads = function () { const r = pp.apply(this, arguments); if (Visual66.wait) for (const k of ['enter', 'escape', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'p']) if (!Input.keys[k]) delete Input.hit[k]; return r; };
}

const PDEF = { pulse: ['Pulso', 'a'], dash: ['Esquiva', 'lb'], special: ['Especial', 'x'], parry: ['Rebater', 'b'], sec: ['Secundária', 'lt'] };
Visual37.controls = function (X, Wd) {
  const s = Save.data.settings, pads = Visual66.list(), t = World.t, pd = Save.data.pad = Save.data.pad || {};
  txt('CONTROLES CONECTADOS', X, 154, 17, '#ffb340', 'left', 900);
  if (!pads.length) {
    const a = .6 + .4 * Math.sin(t * 4);
    txt('Nenhum controle detectado.', X, 182, 20, '#fff', 'left', 800);
    ctx.globalAlpha = a; txt('Conecte o controle e aperte qualquer botão nele. O navegador só avisa depois disso.', X, 210, 15, '#cdb8ff', 'left', 700); ctx.globalAlpha = 1;
  } else pads.slice(0, 2).forEach((p, i) => { const y = 182 + i * 28; ctx.fillStyle = '#7fe0a0'; ctx.beginPath(); ctx.arc(X + 8, y + 12, 6, 0, TAU); ctx.fill(); txt(p.name + '  •  ' + Visual66.TYPE[p.kind], X + 24, y, 18, '#fff', 'left', 800); txt(i === 0 ? (Save.data.coop ? 'Jogador 2' : 'Jogador 1') : (Save.data.coop ? 'Jogador 1' : 'reserva'), X + Wd, y + 2, 15, '#7fe0a0', 'right', 800); });
  const P = pads[0], kind = P ? P.kind : 'xbox', g = P ? P.g : null, bt = n => !!(g && g.buttons[n] && g.buttons[n].pressed);
  // diagrama ao vivo
  const cx = X + 170, cy = 352, N = Visual66.NAMES[kind] || Visual66.NAMES.xbox, on = P ? '#fff' : 'rgba(255,255,255,.4)';
  const ax = i => (g && g.axes[i]) || 0, val = n => (g && g.buttons[n] ? g.buttons[n].value || (g.buttons[n].pressed ? 1 : 0) : 0);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1.12, 1.12);
  // gatilhos e ombros
  const trig = (x, flip, n, lab, y0, w, h) => { const v = val(n); ctx.save(); ctx.translate(x, y0); ctx.scale(flip, 1); ctx.fillStyle = 'rgba(40,22,100,.95)'; ctx.strokeStyle = v > .05 ? '#fff' : 'rgba(190,160,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-w / 2, 0, w, h, 7); ctx.fill(); if (v > .05) { ctx.fillStyle = '#b98cff'; ctx.beginPath(); ctx.roundRect(-w / 2, 0, w, h * v, 7); ctx.fill(); } ctx.stroke(); ctx.restore(); txt(lab, x, y0 + h / 2, 11, '#fff', 'center', 900, 'middle'); };
  trig(-82, 1, 6, N[6], -92, 62, 18); trig(82, 1, 7, N[7], -92, 62, 18); trig(-92, 1, 4, N[4], -70, 78, 14); trig(92, 1, 5, N[5], -70, 78, 14);
  // corpo
  const body = () => { ctx.beginPath(); ctx.moveTo(-60, -52); ctx.quadraticCurveTo(-112, -62, -132, -28); ctx.bezierCurveTo(-152, 8, -152, 62, -130, 88); ctx.quadraticCurveTo(-106, 108, -84, 80); ctx.quadraticCurveTo(-70, 58, -48, 48); ctx.lineTo(48, 48); ctx.quadraticCurveTo(70, 58, 84, 80); ctx.quadraticCurveTo(106, 108, 130, 88); ctx.bezierCurveTo(152, 62, 152, 8, 132, -28); ctx.quadraticCurveTo(112, -62, 60, -52); ctx.quadraticCurveTo(0, -64, -60, -52); ctx.closePath(); };
  const bg = ctx.createLinearGradient(0, -60, 0, 100); bg.addColorStop(0, '#4a2aa8'); bg.addColorStop(1, '#1c0e58'); ctx.fillStyle = bg; body(); ctx.fill(); ctx.strokeStyle = P ? '#c8a8ff' : '#5a4a90'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); body(); ctx.clip(); const hl = ctx.createLinearGradient(0, -60, 0, 0); hl.addColorStop(0, 'rgba(255,255,255,.18)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = hl; ctx.fillRect(-160, -70, 320, 80); ctx.restore();
  if (kind === 'ps') { ctx.fillStyle = 'rgba(20,10,60,.9)'; ctx.strokeStyle = 'rgba(190,160,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-34, -48, 68, 32, 8); ctx.fill(); ctx.stroke(); }
  // share / options / botao central
  const pill = (x, y, n) => { const p = val(n) > .5; ctx.fillStyle = p ? '#fff' : 'rgba(190,160,255,.75)'; ctx.beginPath(); ctx.roundRect(x - 7, y - 3, 14, 6, 3); ctx.fill(); }; pill(-48, -30, 8); pill(48, -30, 9);
  ctx.fillStyle = val(16) > .5 ? '#fff' : 'rgba(190,160,255,.75)'; ctx.beginPath(); ctx.arc(0, 14, 6, 0, TAU); ctx.fill();
  // direcional em cruz
  const arm = (x, y, w, h, n) => { const p = val(n) > .5; ctx.fillStyle = p ? '#fff' : 'rgba(80,56,150,.95)'; ctx.strokeStyle = 'rgba(200,170,255,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 4); ctx.fill(); ctx.stroke(); if (p) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 18, '#b98cff', .8); ctx.restore(); } };
  arm(-80, -14, 15, 19, 12); arm(-80, 22, 15, 19, 13); arm(-98, 4, 19, 15, 14); arm(-62, 4, 19, 15, 15);
  // botoes de acao: baixo, direita, esquerda, cima
  const FC = kind === 'ps' ? ['#6aa8ff', '#ff6a7a', '#ff9ad0', '#7fe0a0'] : kind === 'xbox' ? ['#7fe08a', '#ff5a6a', '#6aa8ff', '#ffd36a'] : ['#cdb8ff', '#cdb8ff', '#cdb8ff', '#cdb8ff'];
  [[0, 0, 22], [1, 22, 0], [2, -22, 0], [3, 0, -22]].forEach(([n, ox, oy], k) => { const p = val(n) > .5, x = 80 + ox, y = 0 + oy; ctx.fillStyle = p ? FC[[0, 1, 2, 3][n]] : 'rgba(60,40,130,.95)'; ctx.strokeStyle = FC[n]; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill(); ctx.stroke(); if (p) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 26, FC[n], .9); ctx.restore(); } txt(N[n], x, y, 11, p ? '#10062a' : '#fff', 'center', 900, 'middle'); });
  // analogicos
  const stick = (x, y, ix, n) => { const p = val(n) > .5; ctx.fillStyle = 'rgba(20,10,60,.95)'; ctx.strokeStyle = p ? '#fff' : 'rgba(190,160,255,.7)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(x, y, 20, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = p ? '#fff' : '#7a58d8'; ctx.beginPath(); ctx.arc(x + ax(ix) * 9, y + ax(ix + 1) * 9, 12, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke(); };
  stick(-42, 40, 0, 10); stick(42, 40, 2, 11);
  ctx.restore();
  txt(P ? 'Aperte os botões: eles acendem aqui.' : 'O diagrama acende quando um controle for detectado.', cx, cy + 128, 14, '#8a7fb0', 'center', 700);
  // trocar botoes
  const MX = X + 400; txt('BOTÕES DO JOGO', MX, 250, 17, '#ffb340', 'left', 900);
  const keys = Object.keys(PDEF);
  keys.forEach((k, i) => {
    const y = 276 + i * 40, cur = pd[k] || PDEF[k][1], waiting = Visual66.wait === k;
    txt(PDEF[k][0], MX, y + 8, 18, '#fff', 'left', 800);
    const lab = waiting ? 'APERTE UM BOTÃO…' : Visual66.glyph(kind, cur);
    if (UI.button('pdb' + k, MX + 170, y, 190, 34, lab, { size: 15, color: waiting ? '#ffb340' : '#9a63ff' })) { Visual66.wait = waiting ? null : k; Snd.play('uiSelect'); G.padPrev = {}; }
  });
  if (Visual66.wait && g) {
    const prev = G.padPrev || (G.padPrev = {}); let hit = -1; for (let n = 0; n < 8; n++) { const on = bt(n); if (on && !prev[n] && G.padPrevInit) hit = n; prev[n] = on; } G.padPrevInit = true;
    if (hit >= 0) { pd[Visual66.wait] = Visual66.KEYS[hit]; Save.save(); Visual66.wait = null; Snd.play('upgrade'); G.padPrevInit = false; }
    if (Input.pressed('escape')) { Visual66.wait = null; G.padPrevInit = false; }
  } else if (!Visual66.wait) G.padPrevInit = false;
  // vibracao e atalhos
  const rb = s.rumble === false;
  if (Visual37.toggle('rumble2', X, 500, 420, 78, 'Vibração do controle', !rb, 'Treme quando você leva dano.')) { s.rumble = rb ? true : false; Save.save(); }
  if (UI.button('vtest', X + 440, 500, 200, 36, 'TESTAR VIBRAÇÃO', { size: 14, disabled: !P })) { try { Visual67.rumble(500, .9, .7); } catch (e) { } }
  { const ri = typeof Visual67 !== 'undefined' ? Visual67.rumbleInfo : null; if (P && ri) txt(ri.sup === false ? 'Este controle não aceita vibração no navegador.' : ri.last ? 'Vibração: ' + ri.last : (P.g.vibrationActuator || (P.g.hapticActuators && P.g.hapticActuators.length)) ? 'Vibração disponível. Aperte TESTAR.' : 'Vibração não informada pelo navegador.', X + 440, 586, 12, '#8a7fb0', 'left', 700); }
  if (UI.button('prst', X + 660, 500, 200, 36, 'BOTÕES PADRÃO', { size: 14 })) { Save.data.pad = {}; Save.save(); Visual66.wait = null; }
  if (UI.button('kbd', X + 440, 544, 420, 36, 'TECLAS DO TECLADO ▸', { size: 14 })) { Snd.play('uiSelect'); G.state = 'access'; }
};
