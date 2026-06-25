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
    // ---- Tombol toggle (elegan) ----
    '#__themeBtn{ position:fixed; right:18px; bottom:18px; z-index:10000; width:50px; height:50px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0;' +
      ' color:#E9D8A6; background:radial-gradient(120% 120% at 30% 25%, #1f2c49 0%, #131c30 70%); border:1px solid rgba(233,216,166,0.22);' +
      ' box-shadow:0 10px 28px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08); -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);' +
      ' transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, color .25s ease, background .25s ease, border-color .25s ease; }' +
    '#__themeBtn svg{ width:22px; height:22px; display:block; transition:transform .4s cubic-bezier(.34,1.56,.64,1); }' +
    '#__themeBtn:hover{ transform:translateY(-3px); box-shadow:0 16px 36px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.1); border-color:rgba(233,216,166,0.45); }' +
    '#__themeBtn:hover svg{ transform:rotate(-18deg); }' +
    '#__themeBtn:active{ transform:scale(.9); }' +
    // versi mode terang: matahari hangat di atas kartu putih
    'html[data-theme="light"] #__themeBtn{ color:#E08A00; background:radial-gradient(120% 120% at 30% 25%, #FFFFFF 0%, #EAF0F8 75%); border:1px solid rgba(224,138,0,0.30);' +
      ' box-shadow:0 10px 26px rgba(15,23,41,.16), inset 0 1px 0 rgba(255,255,255,.9); }' +
    'html[data-theme="light"] #__themeBtn:hover{ border-color:rgba(224,138,0,0.55); box-shadow:0 16px 34px rgba(15,23,41,.22), inset 0 1px 0 rgba(255,255,255,1); }' +
    'html[data-theme="light"] #__themeBtn:hover svg{ transform:rotate(45deg); }';

  var style = document.createElement('style');
  style.id = '__themeStyle';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // Ikon SVG garis (line-icon) yang elegan.
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>';

  // Tampilkan ikon mode yang sedang aktif (gelap = bulan, terang = matahari).
  function iconFor(t) { return t === 'light' ? SUN : MOON; }

  function apply(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var b = document.getElementById('__themeBtn');
    if (b) {
      b.innerHTML = iconFor(t);
      b.title = t === 'light' ? 'Mode terang — ketuk untuk gelap' : 'Mode gelap — ketuk untuk terang';
      b.setAttribute('aria-label', b.title);
    }
  }

  function addButton() {
    if (document.getElementById('__themeBtn')) return;
    var btn = document.createElement('button');
    btn.id = '__themeBtn';
    btn.type = 'button';
    btn.innerHTML = iconFor(theme);
    btn.title = theme === 'light' ? 'Mode terang — ketuk untuk gelap' : 'Mode gelap — ketuk untuk terang';
    btn.setAttribute('aria-label', btn.title);
    btn.onclick = function () { apply(theme === 'light' ? 'dark' : 'light'); };
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
  else addButton();
})();
