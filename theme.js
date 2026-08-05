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
      '--teal:var(--teal-light,#0D9488); --teal2:var(--teal2-light,#0F766E);' +
      '--glow:var(--glow-light,rgba(13,148,136,.10));' +
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
    // bottom navigation (mode terang)
    'html[data-theme="light"] #__bnav{ background:rgba(255,255,255,0.92) !important; border-top-color:rgba(15,23,41,0.12) !important; }' +
    'html[data-theme="light"] #__bnav a{ color:#5A647D !important; }' +
    'html[data-theme="light"] #__bnav a.active{ color:#0D9488 !important; background:none !important; }' +
    // angkat toggle agar tidak tertutup bottom nav
    'html.__hasbnav #__themeWrap{ bottom:86px; }' +
    // shadow kartu lebih halus di mode terang
    'html[data-theme="light"] .card,html[data-theme="light"] .qcard,html[data-theme="light"] .panel,html[data-theme="light"] .row,html[data-theme="light"] .use-card,html[data-theme="light"] .key-box,html[data-theme="light"] .detect-box{ box-shadow:0 1px 3px rgba(15,23,41,.06); }' +
    // ---- Toggle switch ala Apple/iOS + label (bukan ikon) ----
    '#__themeWrap{ position:fixed; right:18px; bottom:18px; z-index:10000; display:flex; flex-direction:column; align-items:center; gap:7px; }' +
    // halaman login: toggle dipindah ke kiri atas
    '#__themeWrap.__themeTopLeft{ right:auto; bottom:auto; left:18px; top:18px; }' +
    '#__themeLabel{ font-family:"Space Grotesk",sans-serif; font-size:11px; font-weight:600; letter-spacing:0.03em; color:#C7D0E0; background:rgba(15,23,41,0.75); padding:4px 10px; border-radius:20px; white-space:nowrap; -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px); }' +
    'html[data-theme="light"] #__themeLabel{ color:#5A647D; background:rgba(255,255,255,0.85); box-shadow:0 2px 8px rgba(15,23,41,.08); }' +
    '#__themeBtn{ width:52px; height:30px; border-radius:999px; padding:3px; cursor:pointer; border:none;' +
      ' background:#8E8E93; box-shadow:0 4px 14px rgba(0,0,0,.25); transition:background .2s ease, transform .15s ease; }' +
    '#__themeBtn::after{ content:""; display:block; width:24px; height:24px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.3);' +
      ' transition:transform .2s cubic-bezier(.34,1.56,.64,1); transform:translateX(0); }' +
    '#__themeBtn:active{ transform:scale(.94); }' +
    'html[data-theme="dark"] #__themeBtn{ background:#34C759; }' +
    'html[data-theme="dark"] #__themeBtn::after{ transform:translateX(22px); }';

  var style = document.createElement('style');
  style.id = '__themeStyle';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function labelFor(t) { return t === 'dark' ? 'Dark Mode' : 'Light Mode'; }

  function apply(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var b = document.getElementById('__themeBtn');
    var l = document.getElementById('__themeLabel');
    if (b) {
      b.title = t === 'light' ? 'Mode terang — ketuk untuk gelap' : 'Mode gelap — ketuk untuk terang';
      b.setAttribute('aria-label', b.title);
      b.setAttribute('aria-checked', t === 'dark' ? 'true' : 'false');
    }
    if (l) { l.textContent = labelFor(t); }
  }

  function addButton() {
    if (document.getElementById('__themeWrap')) return;
    var wrap = document.createElement('div');
    wrap.id = '__themeWrap';
    // Halaman login (index.html) dapat posisi kiri atas, bukan kanan bawah.
    var file = location.pathname.split('/').pop();
    if (file === '' || file === 'index.html') { wrap.classList.add('__themeTopLeft'); }

    var label = document.createElement('span');
    label.id = '__themeLabel';
    label.textContent = labelFor(theme);

    var btn = document.createElement('button');
    btn.id = '__themeBtn';
    btn.type = 'button';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    btn.title = theme === 'light' ? 'Mode terang — ketuk untuk gelap' : 'Mode gelap — ketuk untuk terang';
    btn.setAttribute('aria-label', btn.title);
    btn.onclick = function () { apply(theme === 'light' ? 'dark' : 'light'); };

    wrap.appendChild(label);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
  else addButton();
})();
