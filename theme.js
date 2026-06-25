// =====================================================================
//  Toggle Dark / Light mode untuk seluruh halaman.
//  - Menyimpan pilihan di localStorage (key: "tenses-theme").
//  - Menyisipkan CSS override mode terang + tombol mengambang.
//  - Dijalankan dari <head> agar tema diterapkan sebelum halaman tampil
//    (mengurangi "kedip" warna).
//  Semua halaman memakai variabel CSS yang sama (--navy, --teal, dll),
//  jadi cukup menimpa nilai variabel itu saat mode terang.
// =====================================================================
(function () {
  var KEY = 'tenses-theme';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';

  // Terapkan secepat mungkin (sebelum body render).
  document.documentElement.setAttribute('data-theme', theme);

  // ---- CSS override untuk mode terang ----
  var css = '' +
    'html[data-theme="light"]{' +
      '--navy:#EEF2F9; --navy2:#FFFFFF; --navy3:#E6EBF4;' +
      '--white:#15233D; --muted:#5A647D; --border:rgba(15,23,41,0.12);' +
      '--teal:#0D9488; --teal2:#0F766E;' +
      // nama variabel khusus halaman login (index.html)
      '--bg:#EEF2F9; --card:#FFFFFF; --field:#F1F4FA; --txt:#15233D;' +
    '}' +
    'html[data-theme="light"] body{ background:var(--navy) !important; }' +
    'html[data-theme="light"] nav{ background:rgba(255,255,255,0.85) !important; }' +
    'html[data-theme="light"] .nav-badge{ color:#FFFFFF !important; }' +
    // tombol Menu + dropdown dari guard.js (inline style gelap) -> mode terang
    'html[data-theme="light"] #__menuBtn{ background:#FFFFFF !important; border-color:rgba(15,23,41,0.12) !important; color:#0D9488 !important; box-shadow:0 2px 10px rgba(15,23,41,.10); }' +
    'html[data-theme="light"] #__menuDrop{ background:#FFFFFF !important; border-color:rgba(15,23,41,0.12) !important; box-shadow:0 14px 36px rgba(15,23,41,.16) !important; }' +
    'html[data-theme="light"] #__menuDrop a,html[data-theme="light"] #__menuDrop button{ color:#15233D !important; }' +
    'html[data-theme="light"] #__menuDrop a:hover,html[data-theme="light"] #__menuDrop button:hover{ background:#EEF2F9 !important; }' +
    'html[data-theme="light"] #__menuDrop #__logoutBtn{ color:#D64545 !important; }' +
    'html[data-theme="light"] #__menuDrop .__sep{ background:rgba(15,23,41,0.10) !important; }' +
    // shadow kartu lebih halus di mode terang
    'html[data-theme="light"] .card,html[data-theme="light"] .qcard,html[data-theme="light"] .panel,html[data-theme="light"] .row,html[data-theme="light"] .use-card,html[data-theme="light"] .key-box,html[data-theme="light"] .detect-box{ box-shadow:0 1px 3px rgba(15,23,41,.06); }' +
    // tombol toggle
    '#__themeBtn{ position:fixed; right:14px; bottom:16px; z-index:10000; width:46px; height:46px; border-radius:50%; border:1px solid var(--border,#26324d); background:var(--navy2,#1A2540); color:var(--teal,#2DD4BF); font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(0,0,0,.35); transition:transform .12s, filter .15s; }' +
    '#__themeBtn:hover{ filter:brightness(1.1); }' +
    '#__themeBtn:active{ transform:scale(.92); }';

  var style = document.createElement('style');
  style.id = '__themeStyle';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function iconFor(t) { return t === 'light' ? '🌙' : '☀️'; }

  function apply(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var b = document.getElementById('__themeBtn');
    if (b) {
      b.textContent = iconFor(t);
      b.title = t === 'light' ? 'Ganti ke mode gelap' : 'Ganti ke mode terang';
      b.setAttribute('aria-label', b.title);
    }
  }

  function addButton() {
    if (document.getElementById('__themeBtn')) return;
    var btn = document.createElement('button');
    btn.id = '__themeBtn';
    btn.type = 'button';
    btn.textContent = iconFor(theme);
    btn.title = theme === 'light' ? 'Ganti ke mode gelap' : 'Ganti ke mode terang';
    btn.setAttribute('aria-label', btn.title);
    btn.onclick = function () { apply(theme === 'light' ? 'dark' : 'light'); };
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
  else addButton();
})();
