'use strict';
// ---------- polimento 25: teste automatico (?selftest), exportar/importar o save, teclas configuraveis,
// filtros de cor e vibracao do controle ----------
const Visual25 = { rep: null };

// ---------- teste automatico de regressao ----------
Visual25.selftest = async function () {
  const rep = { errs: [], rows: [], scr: [], t0: performance.now(), phase: 'telas' }; Visual25.rep = rep;
  const eh = e => rep.errs.push(String(e.message || e).slice(0, 110)), ce = console.error; addEventListener('error', eh);
  console.error = (...a) => { rep.errs.push(String(a[0] && a[0].message || a[0]).slice(0, 110)); ce.apply(console, a); };
  const keep = JSON.stringify(Save.data); Save.data.mut = {}; Save.data.tal = {}; Save.data.ngpOn = false; Save.data.keys = {};
  try {
    G.state = 'selftest'; await new Promise(r => setTimeout(r, 50));
    for (const s of ['title', 'playsetup', 'profiles', 'cosmetics', 'fusion', 'select', 'hangar', 'settings', 'access', 'modes', 'pilots', 'talents', 'mutators', 'stats', 'gallery', 'achievements', 'codex', 'records', 'orbi', 'custom']) {
      const n0 = rep.errs.length; try { G.state = s; Trans.t = 9; for (let i = 0; i < 3; i++) { Trans.t = 9; render(); } } catch (e) { rep.errs.push(s + ': ' + e.message); } rep.scr.push([s, rep.errs.length === n0]);
    }
    rep.phase = 'fases'; const mx = {}; SHOP_ITEMS.forEach(s => mx[s.id] = s.max || 5);
    const cfgs = STAGES.map((s, i) => ({ stage: i, diff: 1, weapon: 'violet', skill: .75, shop: mx, wlevel: { violet: 5 } }));
    await new Promise(res => Bot.batch(cfgs, () => res()));
    rep.rows = Bot.out.map(o => [o.stage + 1, !!o.cleared, Math.round(o.t || 0), o.hp, !!o.err]);
  } catch (e) { rep.errs.push('selftest: ' + e.message); }
  removeEventListener('error', eh); console.error = ce;
  try { const d = JSON.parse(keep); for (const k of Object.keys(Save.data)) delete Save.data[k]; Object.assign(Save.data, d); } catch (e) { }
  rep.phase = 'fim'; rep.secs = Math.round((performance.now() - rep.t0) / 1000); G.state = 'selftest';
  console.log('[selftest] ' + rep.rows.filter(r => r[1]).length + '/' + rep.rows.length + ' fases concluidas pelo bot, ' + rep.errs.length + ' erros, ' + rep.scr.filter(s => !s[1]).length + ' telas com erro.');
};
Screens.selftest = function () {
  const r = Visual25.rep; ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, H); txt('TESTE AUTOMÁTICO', W / 2, 20, 40, '#fff', 'center');
  if (!r || r.phase !== 'fim') { txt('Executando... ' + (r ? r.phase : ''), W / 2, 340, 26, '#cdb8ff', 'center'); return; }
  const bad = r.errs.length + r.scr.filter(s => !s[1]).length + r.rows.filter(x => x[4]).length; txt(bad ? bad + ' PROBLEMA(S) ENCONTRADO(S)' : 'TUDO CERTO ✓', W / 2, 70, 28, bad ? '#ff8a5f' : '#7fe0a0', 'center', 900);
  txt('Fases (bot):', 90, 120, 20, '#ffb340', 'left', 900); r.rows.forEach(([n, ok, t, hp, er], i) => txt('Fase ' + n + ': ' + (er ? 'ERRO' : ok ? 'concluída' : 'perdeu') + '  ' + t + 's  vida ' + hp, 90, 152 + i * 28, 17, er ? '#ff6a6a' : ok ? '#cdb8ff' : '#ffcf6b', 'left', 700));
  txt('Telas:', 520, 120, 20, '#ffb340', 'left', 900); r.scr.forEach(([s, ok], i) => txt((ok ? '✓ ' : '✗ ') + s, 520 + Math.floor(i / 8) * 190, 152 + (i % 8) * 28, 17, ok ? '#7fe0a0' : '#ff6a6a', 'left', 700));
  txt('Erros de script: ' + r.errs.length, 520, 400, 20, r.errs.length ? '#ff6a6a' : '#7fe0a0', 'left', 900); r.errs.slice(0, 5).forEach((e, i) => txt(e, 520, 432 + i * 24, 14, '#ffb0b0', 'left', 600));
  txt('Duração: ' + r.secs + 's   •   ESC volta ao título', W / 2, 660, 18, '#8a7fb0', 'center', 700); if (Input.pressed('escape')) Game.goTitle();
};
if (/selftest/.test(location.search)) setTimeout(Visual25.selftest, 1800);

// ---------- exportar / importar o save ----------
Visual25.exportSave = function () {
  try { const blob = new Blob([localStorage.getItem('olienzinho_save_v1') || JSON.stringify(Save.data)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'olienzinho-save-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); popup(W / 2, 300, 'Save exportado!', '#7fe0a0', 26); } catch (e) { popup(W / 2, 300, 'Não foi possível exportar', '#ff8a5f', 22); }
};
Visual25.importSave = function () {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => { const f = inp.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const d = JSON.parse(rd.result); if (!d || typeof d !== 'object' || !d.settings) throw 0; localStorage.setItem('olienzinho_save_v1', JSON.stringify(d)); location.reload(); } catch (e) { popup(W / 2, 300, 'Arquivo de save inválido', '#ff8a5f', 24); } }; rd.readAsText(f); };
  inp.click();
};
{
  const st = Screens.settings;
  Screens.settings = function () {
    st.call(this);
    if (UI.button('sexp', 558, 632, 110, 40, 'EXPORTAR', { size: 13 })) Visual25.exportSave();
    if (UI.button('simp', 676, 632, 110, 40, 'IMPORTAR', { size: 13 })) Visual25.importSave();
    if (UI.button('sacc', 790, 46, 130, 30, 'TECLAS ▸', { size: 13 })) { Snd.play('uiSelect'); G.state = 'access'; }
  };
}

// ---------- teclas configuraveis, filtros de cor e vibracao ----------
const KEYACT = [['left', 'Esquerda', 'a'], ['right', 'Direita', 'd'], ['up', 'Cima', 'w'], ['down', 'Baixo', 's'], ['pulse', 'Pulso', ' '], ['dash', 'Esquiva', 'shift'], ['special', 'Especial', 'q'], ['sec', 'Secundária', 'r'], ['parry', 'Rebater', 'f']];
Visual25.keyOf = k => { const a = KEYACT.find(x => x[2] === k); if (!a) return k; const m = (Save.data.keys || {})[a[0]]; return m || k; };
{
  Input.down = function (k) { return !!this.keys[Visual25.keyOf(k)]; };
  Input.pressed = function (k) { return !!this.hit[Visual25.keyOf(k)]; };
  addEventListener('keydown', e => {
    if (!G.rebind) return; e.preventDefault(); e.stopImmediatePropagation(); const k = e.key.toLowerCase(); if (k !== 'escape') { Save.data.keys = Save.data.keys || {}; Save.data.keys[G.rebind] = k; Save.save(); } G.rebind = null; Input.hit = {};
  }, true);
}
const CB = ['SEM FILTRO', 'FILTRO 1', 'FILTRO 2', 'FILTRO 3'];
{
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', 0); svg.setAttribute('height', 0); svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="cb1"><feColorMatrix type="matrix" values="0.8 0.2 0 0 0  0 0.9 0.1 0 0  0.25 0 0.75 0 0  0 0 0 1 0"/></filter><filter id="cb2"><feColorMatrix type="matrix" values="1 0 0 0 0  0.35 0.65 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter><filter id="cb3"><feColorMatrix type="matrix" values="0.9 0.1 0 0 0  0 0.8 0.2 0 0  0.1 0.3 0.6 0 0  0 0 0 1 0"/></filter>';
  document.body.appendChild(svg);
  Visual25.applyCB = () => { const n = (Save.data.settings && Save.data.settings.cb) || 0; cv.style.filter = n ? 'url(#cb' + n + ') contrast(1.12) saturate(1.15)' : ''; };
  Visual25.applyCB();
  const hp = hurtPlayer; hurtPlayer = function (d) { const l = G.player ? G.player.hp : 0; const r = hp(d); try { if (G.player && G.player.hp < l && Save.data.settings.rumble !== false) for (const gp of navigator.getGamepads ? navigator.getGamepads() : []) if (gp && gp.vibrationActuator) gp.vibrationActuator.playEffect('dual-rumble', { duration: 220, strongMagnitude: .9, weakMagnitude: .5 }); } catch (e) { } return r; };
}
Screens.access = function () {
  const s = Save.data.settings; txt('TECLAS E ACESSIBILIDADE', W / 2, 22, 40, '#fff', 'center');
  UI.panel(200, 84, 880, 520, { r: 24 }); txt(G.rebind ? 'Aperte a nova tecla (ESC cancela)...' : 'Clique em TROCAR e depois aperte a tecla desejada.', W / 2, 98, 17, G.rebind ? '#ffcf6b' : '#cdb8ff', 'center', 800);
  KEYACT.forEach(([id, name, def], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 230 + col * 430, y = 134 + row * 58, cur = (Save.data.keys || {})[id] || def, lab = k => k === ' ' ? 'ESPAÇO' : k.toUpperCase();
    txt(name, x, y + 4, 20, '#e2d4ff', 'left', 800); ctx.fillStyle = G.rebind === id ? '#ffcf6b' : 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.roundRect(x + 130, y - 2, 90, 34, 10); ctx.fill(); txt(G.rebind === id ? '...' : lab(cur), x + 175, y + 15, 17, G.rebind === id ? '#1a0a40' : '#fff', 'center', 900, 'middle');
    if (UI.button('rk' + id, x + 228, y - 2, 120, 34, 'TROCAR', { size: 13 })) { G.rebind = id; Snd.play('uiSelect'); }
  });
  if (UI.button('rkreset', 230, 424, 220, 38, 'TECLAS PADRÃO', { size: 14 })) { Save.data.keys = {}; Save.save(); }
  txt('FILTRO DE COR', 230, 484, 20, '#ffb340', 'left', 900); if (UI.button('cb', 420, 476, 220, 40, CB[s.cb || 0], { size: 16, color: s.cb ? '#9a63ff' : undefined })) { s.cb = ((s.cb || 0) + 1) % 4; Save.save(); Visual25.applyCB(); }
  txt('Teste qual filtro deixa os tiros mais fáceis de enxergar para você.', 660, 484, 14, '#8a7fb0', 'left', 700);
  if (UI.button('rumb', 230, 530, 260, 40, s.rumble === false ? 'VIBRAÇÃO: NÃO' : 'VIBRAÇÃO: SIM', { size: 16, color: s.rumble === false ? undefined : '#9a63ff' })) { s.rumble = s.rumble === false ? true : false; Save.save(); }
  { const PB = [['a', 'A'], ['b', 'B'], ['x', 'X'], ['y', 'Y'], ['lb', 'LB'], ['rb', 'RB'], ['lt', 'LT'], ['rt', 'RT']], PD = { pulse: ['Pulso', 'a'], special: ['Especial', 'x'], dash: ['Esquiva', 'lb'], parry: ['Rebater', 'b'], sec: ['Secundária', 'lt'] }, pd = Save.data.pad = Save.data.pad || {};
    txt('CONTROLE', 230, 584, 18, '#ffb340', 'left', 900); Object.keys(PD).forEach((k, i) => { const cur = pd[k] || PD[k][1], lab = (PB.find(q => q[0] === cur) || PB[0])[1]; if (UI.button('pd' + k, 330 + i * 150, 574, 142, 34, PD[k][0] + ': ' + lab, { size: 12 })) { const ix = PB.findIndex(q => q[0] === cur); pd[k] = PB[(ix + 1) % PB.length][0]; Save.save(); Snd.play('uiSelect'); } }); }
  if (UI.button('back', W / 2 - 160, 620, 320, 50, 'VOLTAR', { size: 22 }) || (Input.hit.escape && !G.rebind)) { Snd.play('uiBack'); G.rebind = null; G.state = 'settings'; }
  Screens.thinFrame();
};
