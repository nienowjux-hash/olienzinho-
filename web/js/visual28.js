'use strict';
// ---------- perfis de save (3 espacos no mesmo navegador) ----------
const Visual28 = { MAIN: 'olienzinho_save_v1' };
Visual28.cur = () => { try { return Math.max(1, Math.min(3, parseInt(localStorage.getItem('olien_profile'), 10) || 1)); } catch (e) { return 1; } };
Visual28.name = n => { try { return localStorage.getItem('olien_pname_' + n) || ('Jogador ' + n); } catch (e) { return 'Jogador ' + n; } };
Visual28.raw = n => { try { return n === Visual28.cur() ? localStorage.getItem(Visual28.MAIN) : localStorage.getItem('olien_prof_' + n); } catch (e) { return null; } };
Visual28.info = n => {
  let d = null; try { if (n === Visual28.cur()) { d = Save.data; } else { const r = Visual28.raw(n); d = r ? JSON.parse(r) : null; } } catch (e) { }
  if (!d) return null; const st2 = d.st2 || {};
  return { coins: d.coins || 0, cleared: Object.keys(d.cleared || {}).filter(k => d.cleared[k]).length, ach: Object.keys(d.ach || {}).filter(k => d.ach[k]).length, time: st2.time || 0, unlocked: d.unlocked || 1 };
};
Visual28.switchTo = function (n) {
  try {
    const c = Visual28.cur(); if (n === c) return; localStorage.setItem('olien_prof_' + c, localStorage.getItem(Visual28.MAIN) || '');
    const nx = localStorage.getItem('olien_prof_' + n); if (nx) localStorage.setItem(Visual28.MAIN, nx); else localStorage.removeItem(Visual28.MAIN);
    localStorage.setItem('olien_profile', String(n)); location.reload();
  } catch (e) { popup(W / 2, 300, 'Não foi possível trocar de perfil', '#ff8a5f', 22); }
};
Visual28.wipe = function (n) {
  try { if (n === Visual28.cur()) { localStorage.removeItem(Visual28.MAIN); } else localStorage.removeItem('olien_prof_' + n); localStorage.removeItem('olien_pname_' + n); location.reload(); } catch (e) { }
};
{
  const mo = Visual6.menuOverlay;
  Visual6.menuOverlay = function (s) {
    mo.call(this, s); if (s !== 'title' || (G.titleStart !== undefined && World.t - G.titleStart < 3)) return;
    if (UI.button('profbtn', W - 232, 40, 208, 34, 'PERFIL: ' + Visual28.name(Visual28.cur()).slice(0, 12), { size: 14 })) { Snd.play('uiSelect'); G.state = 'profiles'; }
  };
}
Screens.profiles = function () {
  txt('PERFIS', W / 2, 24, 46, '#fff', 'center'); txt('Cada perfil tem o seu próprio progresso, estrelas, conquistas e configurações.', W / 2, 88, 17, '#ffb340', 'center', 900);
  const cur = Visual28.cur(); G.pdel = G.pdel || 0;
  for (let n = 1; n <= 3; n++) {
    const x = 70 + (n - 1) * 380, y = 140, w = 340, h = 420, inf = Visual28.info(n), on = n === cur;
    UI.panel(x, y, w, h, { r: 24, fill: on ? 'rgba(60,34,140,.88)' : 'rgba(20,8,55,.75)', stroke: on ? '#ffd36a' : 'rgba(190,160,255,.3)' });
    txt(Visual28.name(n), x + w / 2, y + 18, 28, on ? '#ffe9a8' : '#fff', 'center', w - 30); if (on) txt('EM USO', x + w / 2, y + 58, 15, '#7fe0a0', 'center', 900);
    if (inf) { const rows = [['Fases', inf.cleared + ' / ' + STAGES.length], ['Estrelas', '★ ' + inf.coins], ['Conquistas', inf.ach + ' / ' + ACH.length], ['Tempo', Math.floor(inf.time / 3600) + 'h ' + String(Math.floor(inf.time % 3600 / 60)).padStart(2, '0') + 'min']]; rows.forEach(([a, b], i) => { txt(a, x + 30, y + 100 + i * 40, 18, '#cdb8ff', 'left', 700); txt(b, x + w - 30, y + 100 + i * 40, 20, '#fff', 'right', 800); }); }
    else txt('perfil novo', x + w / 2, y + 150, 22, '#8a7fb0', 'center', 800);
    if (!on && UI.button('pl' + n, x + 40, y + 280, w - 80, 46, inf ? 'USAR ESTE' : 'CRIAR E USAR', { size: 18, color: '#9a63ff' })) Visual28.switchTo(n);
    if (UI.button('pr' + n, x + 40, y + 336, 150, 38, 'NOME', { size: 14 })) { const nm = (prompt('Nome do perfil:', Visual28.name(n)) || '').trim().slice(0, 14); if (nm) { try { localStorage.setItem('olien_pname_' + n, nm); } catch (e) { } } }
    if (UI.button('pw' + n, x + 200, y + 336, 100, 38, G.pdel === n ? 'CERTEZA?' : 'APAGAR', { size: 14, color: G.pdel === n ? '#c2185b' : undefined })) { if (G.pdel === n) { G.pdel = 0; Visual28.wipe(n); } else G.pdel = n; }
  }
  if (UI.button('back', W / 2 - 160, 604, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.pdel = 0; Game.goTitle(); }
  Screens.thinFrame();
};
