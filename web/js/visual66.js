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
  const cx = X + 170, cy = 340;
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(30,14,80,.9)'; ctx.strokeStyle = P ? '#b98cff' : '#4a4070'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-120, -30); ctx.quadraticCurveTo(-140, 30, -112, 78); ctx.quadraticCurveTo(-92, 100, -66, 70); ctx.lineTo(-40, 48); ctx.lineTo(40, 48); ctx.lineTo(66, 70); ctx.quadraticCurveTo(92, 100, 112, 78); ctx.quadraticCurveTo(140, 30, 120, -30); ctx.quadraticCurveTo(60, -62, 0, -52); ctx.quadraticCurveTo(-60, -62, -120, -30); ctx.fill(); ctx.stroke();
  const dot = (x, y, r, on, c, lab) => { ctx.fillStyle = on ? c : 'rgba(80,60,140,.8)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = on ? '#fff' : 'rgba(190,160,255,.5)'; ctx.lineWidth = 2; ctx.stroke(); if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, r * 2.4, c, .6); ctx.restore(); } if (lab) txt(lab, x, y, 12, '#fff', 'center', 900, 'middle'); };
  const N = Visual66.NAMES[kind] || Visual66.NAMES.xbox, face = [[1, 0, 0, '#7fe08a'], [2, 1, 0, '#ff5a6a'], [3, 0, 1, '#6aa8ff'], [4, 0, -1, '#ffd36a']];
  dot(66, -6, 11, bt(0), '#7fe08a', N[0]); dot(90, -28, 11, bt(1), '#ff5a6a', N[1]); dot(42, -28, 11, bt(2), '#6aa8ff', N[2]); dot(66, -50, 11, bt(3), '#ffd36a', N[3]);
  // direcional
  dot(-66, -6, 9, bt(14), '#cdb8ff'); dot(-34, -6, 9, bt(15), '#cdb8ff'); dot(-50, -22, 9, bt(12), '#cdb8ff'); dot(-50, 10, 9, bt(13), '#cdb8ff');
  // analogicos
  const ax = i => (g && g.axes[i]) || 0; dot(-62 + ax(0) * 8, 34 + ax(1) * 8, 15, bt(10), '#7fe0ff'); dot(26 + ax(2) * 8, 34 + ax(3) * 8, 15, bt(11), '#7fe0ff');
  // ombros e gatilhos
  const sh = (x, y, w, on, lab) => { ctx.fillStyle = on ? '#b98cff' : 'rgba(80,60,140,.9)'; ctx.beginPath(); ctx.roundRect(x, y, w, 16, 6); ctx.fill(); ctx.strokeStyle = on ? '#fff' : 'rgba(190,160,255,.5)'; ctx.lineWidth = 2; ctx.stroke(); txt(lab, x + w / 2, y + 8, 11, '#fff', 'center', 900, 'middle'); };
  sh(-118, -82, 70, bt(4), N[4]); sh(48, -82, 70, bt(5), N[5]); sh(-118, -104, 70, bt(6), N[6]); sh(48, -104, 70, bt(7), N[7]);
  ctx.restore();
  txt(P ? 'Aperte os botões: eles acendem aqui.' : 'O diagrama acende quando um controle for detectado.', cx, cy + 112, 14, '#8a7fb0', 'center', 700);
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
