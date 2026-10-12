'use strict';
// ---------- Hangar com abas: ARMAS, NAVE, PILOTO e OFICINA ----------
const Visual34 = { tabs: [['arm', 'ARMAS'], ['nav', 'NAVE'], ['pil', 'PILOTO'], ['ofi', 'OFICINA']] };
const hx = () => Save.data.loadout;
const tabBar = () => {
  G.htab = G.htab || 'arm'; const w = 230;
  Visual34.tabs.forEach(([id, lab], i) => { if (UI.button('ht' + id, W / 2 - (w * 4 + 30) / 2 + i * (w + 10), 82, w, 38, lab, { size: 17, color: G.htab === id ? '#9a63ff' : undefined })) { G.htab = id; Snd.play('uiSelect'); } });
};
const back = () => { if (UI.button('back', W / 2 - 160, 640, 320, 48, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); } };

// --- aba ARMAS ---
Visual34.armas = function () {
  const t = World.t, ld = hx(), own = Save.data.owned, ch = ld.char || 'olien';
  if (ch !== 'olien') {
    UI.panel(240, 160, 800, 250, { r: 24 }); txt(ch === 'orbi' ? 'O Orbi atira com o próprio tiro.' : GUARDS[ch].name + ' usa uma arma própria: ' + GUARDS[ch].sp + '.', W / 2, 200, 26, '#fff', 'center', 740);
    txt('As armas abaixo só valem para o Olienzinho.', W / 2, 252, 18, '#cdb8ff', 'center', 700); if (UI.button('toOl', W / 2 - 170, 320, 340, 52, 'JOGAR COM O OLIENZINHO', { size: 18, color: '#9a63ff' })) { ld.char = 'olien'; Save.save(); }
    if (ch !== 'orbi') txt('Evolua o guardião na aba OFICINA.', W / 2, 400, 16, '#ffb340', 'center', 800); return;
  }
  const n = WEAPON_ORDER.length, per = 6, np = Math.ceil(n / per); G.wpage = (G.wpage || 0) % np; const wp0 = G.wpage * per;
  txt('PÁGINA ' + (G.wpage + 1) + ' / ' + np, W - 120, 134, 15, '#8a7fb0', 'right', 800);
  if (UI.button('wpL', W - 110, 128, 44, 30, '◀', { size: 14 })) G.wpage = (G.wpage + np - 1) % np; if (UI.button('wpR', W - 60, 128, 44, 30, '▶', { size: 14 })) G.wpage = (G.wpage + 1) % np;
  const ids = WEAPON_ORDER.slice(wp0, wp0 + per);
  ids.forEach((id, i) => {
    const w = WEAPONS[id], col = i % 2, row = Math.floor(i / 2), x = 70 + col * 570, y = 168 + row * 120, cw = 550, ch2 = 108, has = !!own.weapons[id], eq = ld.weapon === id, fid = 'w_' + id, f = UI.focus(fid);
    const ek = Screens.enterK(i); ctx.save(); ctx.translate((1 - ek) * -60, 0); ctx.globalAlpha = clamp(ek, 0, 1);
    if (UI.hit(fid, x, y, has ? cw - 170 : cw, ch2, { sound: 'buy' })) { if (has) { ld.weapon = id; Save.save(); } else if (Save.data.coins >= w.price) { Save.data.coins -= w.price; own.weapons[id] = true; ld.weapon = id; Save.save(); } else Snd.play('uiDeny'); }
    UI.panel(x, y, cw, ch2, { fill: eq ? 'rgba(60,34,140,.88)' : f ? 'rgba(50,28,120,.8)' : 'rgba(20,8,55,.72)', stroke: eq ? w.c : f ? '#e2d4ff' : 'rgba(190,160,255,.3)', r: 18 });
    Screens.weaponGlyph(id, x + 52, y + 54, w.c, t); txt(w.name, x + 104, y + 12, 22, '#fff', 'left', 300); txt(w.desc, x + 104, y + 42, 14, '#cdb8ff', 'left', 380); txt('Especial: ' + w.specName, x + 104, y + 66, 13, w.c, 'left', 800);
    if (eq) txt('EQUIPADA', x + cw - 16, y + 12, 15, '#7fe0a0', 'right'); else if (!has) txt('★ ' + w.price, x + cw - 16, y + 10, 22, Save.data.coins >= w.price ? '#ffcf6b' : '#7a70a0', 'right');
    if (has) { const lv = Visual5.wl(id), maxed = lv >= 5, cost = Visual5.wCost(lv), ex = x + cw - 164, ey = y + 56, eid = 'wu_' + id, ef = UI.focus(eid);
      if (UI.hit(eid, ex, ey, 148, 34, { sound: 'buy', disabled: maxed })) { if (Save.data.coins >= cost) { Save.data.coins -= cost; Save.data.wlevel[id] = lv + 1; Save.save(); Snd.play('levelUp'); Ach.check(); } else Snd.play('uiDeny'); }
      ctx.fillStyle = maxed ? 'rgba(255,211,106,.25)' : ef ? '#9a63ff' : Save.data.coins >= cost ? 'rgba(90,50,190,.95)' : 'rgba(50,30,100,.8)'; ctx.beginPath(); ctx.roundRect(ex, ey, 148, 34, 12); ctx.fill();
      txt(maxed ? 'NÍVEL MÁXIMO' : 'EVOLUIR  ★' + cost, ex + 74, ey + 17, 13, '#fff', 'center', 900, 'middle'); for (let k = 0; k < 5; k++) { ctx.fillStyle = k < lv ? w.c : 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(x + 112 + k * 20, y + 92, 5, 0, TAU); ctx.fill(); } }
    ctx.restore();
  });
  // painel de evolucao da arma em foco
  let fid = ld.weapon; for (const wid of ids) if (UI.focus('w_' + wid) || UI.focus('wu_' + wid)) fid = wid;
  const fw = WEAPONS[fid], lv = Visual5.wl(fid), info = k => ({ d: 12 * (k - 1), c: Math.round((1 - Math.pow(.93, k - 1)) * 100), s: k >= 5 ? 2 : k >= 3 ? 1 : 0, k: k >= 5 ? 10 : 0 });
  const fm = o => [o.d ? '+' + o.d + '% de dano' : '', o.c ? 'especial ' + o.c + '% mais rápido' : '', o.s ? '+' + o.s + (o.s > 1 ? ' tiros' : ' tiro') : '', o.k ? '+' + o.k + '% de crítico' : ''].filter(Boolean).join('  •  ') || 'sem bônus';
  UI.panel(70, 534, 1140, 78, { r: 14, fill: 'rgba(14,6,40,.82)', stroke: fw.c });
  txt(fw.name.toUpperCase() + '  —  nível ' + lv + ' de 5', 90, 542, 16, fw.c, 'left', 900); txt('Especial (Q): ' + fw.specName + ' — ' + fw.specDesc, 1190, 543, 13, '#cdb8ff', 'right', 700);
  txt('Agora: ' + fm(info(lv)), 90, 568, 15, '#e2d4ff', 'left', 700); txt(lv >= 5 ? 'Nível máximo alcançado' : 'Próximo nível (' + (lv + 1) + '): ' + fm(info(lv + 1)), 90, 588, 15, lv >= 5 ? '#7fe0a0' : '#ffd36a', 'left', 800);
};

// --- aba NAVE ---
Visual34.nave = function () {
  const t = World.t, ld = hx(); const sk = SKINS[G.skinIdx || 0], unlocked = sk.ok(), eqs = ld.skin === sk.id;
  UI.panel(70, 140, 700, 480, { r: 24 }); txt('SKINS', 96, 154, 18, '#ffb340', 'left', 900);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(420, 350, 250, sk.pal.glow, .4); ctx.restore(); ctx.globalAlpha = 1;
  ctx.save(); ctx.globalAlpha = unlocked ? 1 : .35;
  Visual29.auraFx && unlocked && Visual29.auraFx((Save.data.cosm && Save.data.cosm.eq.aura) || 'none', 420, 350 + Math.sin(t * 1.6) * 8, t);
  Art.ship(420, 350 + Math.sin(t * 1.6) * 8, { vx: Math.sin(t * .8) * 80, t, pal: sk.pal, scale: 1.7 * (1 + .22 * Math.max(0, 1 - (World.t - (G.skinPop || -9)) * 3.5)), boost: .5, lookx: clamp((Input.mouse.x - 420) / 400, -1, 1), looky: clamp((Input.mouse.y - 350) / 400, -1, 1), blinkT: Screens.blinkAt(t), inv: 0 });
  ctx.restore(); if (!unlocked) Screens.lock(420, 350, 2);
  txt(sk.name, 420, 500, 30, '#fff', 'center'); txt(unlocked ? (eqs ? 'EQUIPADA' : 'liberada') : '🔒 ' + sk.how, 420, 542, 17, unlocked ? '#7fe0a0' : '#ffb340', 'center', 800);
  const n = SKINS.length; if (UI.button('skL', 96, 330, 54, 80, '◀', { size: 30 })) { G.skinIdx = ((G.skinIdx || 0) + n - 1) % n; G.skinPop = World.t; } if (UI.button('skR', 690, 330, 54, 80, '▶', { size: 30 })) { G.skinIdx = ((G.skinIdx || 0) + 1) % n; G.skinPop = World.t; }
  if (unlocked && !eqs && UI.button('skEq', 330, 570, 180, 36, 'EQUIPAR', { size: 16, color: '#9a63ff' })) { ld.skin = sk.id; Save.save(); Snd.play('buy'); }
  // direita: estilo e cosmeticos
  const st = ld.style || 0; UI.panel(800, 140, 410, 230, { r: 24 }); txt('ESTILO DE TIRO', 1005, 154, 17, '#ffb340', 'center', 900);
  if (UI.button('style', 830, 190, 350, 44, STYLES[st].name, { size: 18, color: st ? '#9a63ff' : undefined })) { ld.style = (st + 1) % STYLES.length; Save.save(); Snd.play('uiSelect'); }
  UI.wrap(STYLES[st].desc, 830, 250, 350, 17, 15, '#cdb8ff');
  UI.panel(800, 390, 410, 230, { r: 24 }); txt('PERSONALIZAR', 1005, 404, 17, '#ffb340', 'center', 900);
  txt('Rastros, auras e molduras.', 1005, 446, 15, '#cdb8ff', 'center', 700);
  if (UI.button('toCos', 830, 490, 350, 54, 'COSMÉTICOS', { size: 20, color: '#ff7ac8' })) { Snd.play('uiSelect'); G.state = 'cosmetics'; }
};

// --- aba PILOTO ---
Visual34.piloto = function () {
  const t = World.t, ld = hx(), cur = ld.char || 'olien', nm = { olien: 'OLIENZINHO', orbi: 'ORBI' };
  PILOTS.forEach((id, i) => {
    const x = 60 + i * 195, y = 140, w = 180, h = 270, ok = Visual13.pilotOk(id), eq = cur === id, col = id === 'olien' ? '#b98cff' : id === 'orbi' ? '#7fe0ff' : GUARDS[id].c, fid = 'pc' + id;
    if (UI.hit(fid, x, y, w, h)) { if (ok) { ld.char = id; Save.save(); Snd.play('buy'); } else Snd.play('uiDeny'); }
    UI.panel(x, y, w, h, { r: 22, fill: eq ? 'rgba(60,34,140,.9)' : UI.focus(fid) ? 'rgba(50,28,120,.8)' : 'rgba(20,8,55,.75)', stroke: eq ? col : 'rgba(190,160,255,.3)' });
    ctx.save(); ctx.globalAlpha = ok ? 1 : .3; ctx.globalCompositeOperation = 'lighter'; drawGlow(x + w / 2, y + 100, 80, col, .35); ctx.globalCompositeOperation = 'source-over';
    if (id === 'olien') Art.ship(x + w / 2, y + 100, { vx: 0, t, pal: skinOf(ld.skin).pal, scale: .8, boost: .3, lookx: 0, looky: -.2, blinkT: Screens.blinkAt(t), inv: 0 });
    else if (id === 'orbi') { for (let k = 0; k < 3; k++) { ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x + w / 2, y + 100, 18 + k * 17 + Math.sin(t * 3 + k) * 2, 0, TAU); ctx.stroke(); } }
    else { ctx.save(); ctx.beginPath(); ctx.rect(x, y + 20, w, 170); ctx.clip(); Art.guardian(x + w / 2, y + 108, { guard: 'g_' + id, vx: 0, t, scale: .85, lookx: 0, looky: 0, blinkT: Screens.blinkAt(t + i) }); ctx.restore(); }
    ctx.restore(); if (!ok) Screens.lock(x + w / 2, y + 100, 1);
    txt(nm[id] || GUARDS[id].name, x + w / 2, y + 206, 20, '#fff', 'center', 900); txt(eq ? 'EM USO' : ok ? 'usar' : id === 'orbi' ? '🔒 derrote o Vazio' : '🔒 zere as 10 fases', x + w / 2, y + 238, 14, eq ? '#7fe0a0' : ok ? '#8a7fb0' : '#ffb340', 'center', 800);
  });
  const sc = ld.sec || 'none', ids = Object.keys(SECS); UI.panel(60, 430, 560, 180, { r: 22 }); txt('ARMA SECUNDÁRIA (tecla R)', 340, 444, 16, '#ffb340', 'center', 900);
  if (UI.button('sec', 90, 480, 500, 44, SECS[sc].name, { size: 18, color: sc !== 'none' ? '#9a63ff' : undefined })) { ld.sec = ids[(ids.indexOf(sc) + 1) % ids.length]; Save.save(); Snd.play('uiSelect'); }
  UI.wrap(sc !== 'none' ? SECS[sc].desc : 'Escolha uma arma secundária.', 90, 540, 500, 17, 14, sc !== 'none' ? SECS[sc].c : '#8a7fb0');
  const cm = Save.data.comp = Save.data.comp || {}; const gl = guardsOn(), cc = cm.id && cm.id !== 'none' && gl.includes(cm.id) ? cm.id : 'none';
  UI.panel(660, 430, 550, 180, { r: 22 }); txt('COMPANHEIRO', 935, 444, 16, '#ffb340', 'center', 900);
  if (!gl.length) txt('Zere as 10 fases para ter guardiões como companheiros.', 935, 520, 15, '#8a7fb0', 'center', 480);
  else { if (UI.button('compb', 690, 480, 490, 44, COMP[cc][0], { size: 18, color: cc !== 'none' ? COMP[cc][1] : undefined })) { const l = ['none', ...gl]; cm.id = l[(l.indexOf(cc) + 1) % l.length]; Save.save(); Snd.play('uiSelect'); } UI.wrap('Um guardião ajuda você nas fases, sem ser o piloto.', 690, 540, 490, 17, 14, '#cdb8ff'); }
};

// --- aba OFICINA ---
Visual34.oficina = function () {
  const gOK = !!Save.data.cleared[9], cards = [
    { id: 'tal', n: 'TALENTOS', c: '#ffd36a', d: 'Melhorias permanentes de ataque, defesa e sorte.', st: 'talents', ok: true },
    { id: 'fus', n: 'FUSÃO DE ARMAS', c: '#ff8a5f', d: 'Una duas armas numa só, com o bônus de cada uma.', st: 'fusion', ok: true },
    { id: 'gev', n: 'EVOLUÇÃO DOS GUARDIÕES', c: '#ffb340', d: 'Melhore Colmeia, Pétreo, Vigia e Solaris.', st: 'pilots', ok: gOK, lock: 'Zere as 10 fases' },
    { id: 'orb', n: 'HABILIDADES DO ORBI', c: '#7fe0ff', d: 'Melhore tiro, gravidade e escudo do Orbi.', st: 'orbi', ok: !!Save.data.cleared[5], lock: 'Derrote o Vazio' },
  ];
  cards.forEach((c, i) => {
    const x = 70 + (i % 2) * 575, y = 150 + Math.floor(i / 2) * 200, w = 555, h = 180; const fid = 'of' + c.id;
    if (UI.hit(fid, x, y, w, h)) { if (c.ok) { Snd.play('uiSelect'); G.state = c.st; } else Snd.play('uiDeny'); }
    UI.panel(x, y, w, h, { r: 24, fill: UI.focus(fid) ? 'rgba(60,34,140,.85)' : 'rgba(20,8,55,.78)', stroke: c.ok ? c.c : 'rgba(190,160,255,.25)' });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x + 80, y + 90, 70, c.c, c.ok ? .3 : .08); ctx.restore();
    txt(c.n, x + 170, y + 30, 26, c.ok ? '#fff' : '#8a7fb0', 'left', 900); txt(c.d, x + 170, y + 76, 16, '#cdb8ff', 'left', 700); txt(c.ok ? 'ABRIR ▸' : '🔒 ' + c.lock, x + 170, y + 130, 17, c.ok ? c.c : '#ffb340', 'left', 800);
    txt(c.n[0], x + 80, y + 62, 64, c.ok ? c.c : '#554a80', 'center', 900);
  });
};

Screens.hangar = function () {
  txt('HANGAR', W / 2, 20, 42, '#fff', 'center'); txt(Screens.stars(), W - 40, 30, 30, '#ffcf6b', 'right');
  tabBar(); const tab = G.htab || 'arm';
  if (tab === 'arm') Visual34.armas(); else if (tab === 'nav') Visual34.nave(); else if (tab === 'pil') Visual34.piloto(); else Visual34.oficina();
  back(); Screens.thinFrame();
};
