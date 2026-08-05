// Penjaga halaman terproteksi + tombol Menu/Keluar/Admin.
// Juga menyisipkan video pembelajaran (YouTube) di halaman tense.
// Dipakai di home.html, admin.html, dan semua halaman tense.
(function () {
  if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.indexOf('GANTI_') === 0) {
    document.documentElement.innerHTML =
      '<body style="font-family:sans-serif;background:#0e1525;color:#eef1f8;padding:40px;line-height:1.6">' +
      '<h2>⚠️ config.js belum diisi</h2><p>Buka file <b>config.js</b> dan isi SUPABASE_URL serta SUPABASE_ANON_KEY dari dashboard Supabase kamu.</p></body>';
    return;
  }

  var client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.__supa = client;

  var currentEmail = '';
  var adminEmail = (typeof ADMIN_EMAIL !== 'undefined' ? String(ADMIN_EMAIL) : '').trim().toLowerCase();

  client.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) { location.replace('index.html'); return; }
    currentEmail = ((session.user && session.user.email) || '').trim().toLowerCase();
    onReady(function () { addBar(); addBottomNav(); embedVideo(); revealAdminOnly(); });
  });

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function isAdmin() { return !!adminEmail && currentEmail === adminEmail; }

  // Tampilkan elemen ber-atribut [data-admin-only] hanya untuk admin.
  function revealAdminOnly() {
    if (!isAdmin()) return;
    var els = document.querySelectorAll('[data-admin-only]');
    for (var i = 0; i < els.length; i++) els[i].style.display = '';
  }

  function tenseIdFromPath() {
    var f = (location.pathname.split('/').pop() || '');
    var m = f.match(/^(\d{2})-.*tense\.html$/i);
    return m ? m[1] : null;
  }

  // ---------- Tombol Menu (dropdown) — berisi navigasi + Keluar ----------
  function addBar() {
    if (document.getElementById('__bar')) return;

    if (!document.getElementById('__barStyle')) {
      var st = document.createElement('style');
      st.id = '__barStyle';
      st.textContent =
        '#__bar{position:fixed;top:10px;right:12px;z-index:9999;}' +
        '#__menuBtn{font:600 12px/1 -apple-system,sans-serif;background:#1A2540;border:1px solid #26324d;padding:10px 15px;border-radius:20px;color:#2DD4BF;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}' +
        '#__menuBtn:hover{filter:brightness(1.12);}' +
        '#__menuDrop{position:absolute;top:46px;right:0;min-width:194px;background:#1A2540;border:1px solid #26324d;border-radius:14px;padding:6px;box-shadow:0 14px 36px rgba(0,0,0,.45);display:none;flex-direction:column;}' +
        '#__menuDrop.open{display:flex;}' +
        '#__menuDrop a,#__menuDrop button{font:600 13px/1 -apple-system,sans-serif;text-align:left;width:100%;background:none;border:0;padding:11px 13px;border-radius:9px;color:#eef1f8;text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:10px;}' +
        '#__menuDrop a:hover,#__menuDrop button:hover{background:#243356;}' +
        '#__menuDrop .__sep{height:1px;background:#26324d;margin:5px 4px;}' +
        '#__menuDrop #__logoutBtn{color:#ff8a8a;}';
      document.head.appendChild(st);
    }

    var bar = document.createElement('div');
    bar.id = '__bar';

    var items = '';
    if (isAdmin()) items += '<a href="admin.html">&#9881; Admin</a><div class="__sep"></div>';
    items += '<button type="button" id="__logoutBtn">&#9211; Keluar</button>';

    bar.innerHTML =
      '<button type="button" id="__menuBtn">&#9776; Menu</button>' +
      '<div id="__menuDrop">' + items + '</div>';
    document.body.appendChild(bar);

    var btn = document.getElementById('__menuBtn');
    var drop = document.getElementById('__menuDrop');
    btn.onclick = function (e) { e.stopPropagation(); drop.classList.toggle('open'); };
    document.addEventListener('click', function (e) { if (!bar.contains(e.target)) drop.classList.remove('open'); });

    document.getElementById('__logoutBtn').onclick = async function (e) {
      e.preventDefault();
      await client.auth.signOut();
      location.replace('index.html');
    };
  }

  // ---------- Bottom navigation (Tenses / Irregular / Latihan) ----------
  function activeSection() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    if (f === 'irregular-verbs.html') return 'verb';
    if (f === 'quiz.html') return 'latihan';
    if (f === 'home.html' || f === '' || /^\d{2}-.*tense\.html$/.test(f)) return 'tenses';
    return '';
  }

  function addBottomNav() {
    if (document.getElementById('__bnav')) return;

    if (!document.getElementById('__bnavStyle')) {
      var st = document.createElement('style');
      st.id = '__bnavStyle';
      st.textContent =
        'html.__hasbnav body{ padding-bottom:calc(76px + env(safe-area-inset-bottom,0px)); }' +
        '#__bnav{ position:fixed; left:0; right:0; bottom:0; top:auto; height:auto; z-index:9998; display:flex; justify-content:space-around; align-items:stretch;' +
          ' background:rgba(18,26,46,0.92); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border-top:1px solid #26324d;' +
          ' padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px)); }' +
        '#__bnav a{ flex:1; max-width:160px; display:flex; flex-direction:column; align-items:center; gap:5px; padding:7px 4px; text-decoration:none;' +
          ' color:#8A97B0; font:600 11px/1 -apple-system,sans-serif; transition:color .18s ease;' +
          ' -webkit-tap-highlight-color:transparent; }' +
        '#__bnav a:hover{ color:#C7D0E0; }' +
        // Tanda halaman aktif: cukup warna + garis ikon sedikit lebih tebal, tanpa blok warna di belakang ikon.
        '#__bnav a.active{ color:#2DD4BF; }' +
        '#__bnav a.active svg{ stroke-width:1.9; }' +
        '#__bnav svg{ width:22px; height:22px; }';
      document.head.appendChild(st);
    }

    // Satu keluarga ikon garis, tiap siluetnya sengaja dibuat beda supaya mudah
    // dibedakan sekilas: lingkaran (jam), garis mendatar (daftar), diagonal (pensil).
    function icon(body) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
    }
    var ICON = {
      // Jam — tense adalah soal waktu.
      tenses: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 1.9"/>'),
      // Daftar bertitik — kumpulan kata kerja tak beraturan.
      verb: icon('<path d="M9 6.5h10.5M9 12h10.5M9 17.5h10.5"/><path d="M4.6 6.5h.01M4.6 12h.01M4.6 17.5h.01"/>'),
      // Pensil — mengerjakan soal.
      latihan: icon('<path d="M4.6 19.4h3.1L19 8.1a2.2 2.2 0 0 0-3.1-3.1L4.6 16.3z"/>')
    };
    var act = activeSection();
    var nav = document.createElement('div');   // pakai <div>, bukan <nav>, agar tak kena aturan CSS "nav{}" tiap halaman
    nav.id = '__bnav';
    nav.setAttribute('role', 'navigation');
    nav.innerHTML =
      '<a href="home.html" class="' + (act === 'tenses' ? 'active' : '') + '">' + ICON.tenses + '<span>Tenses</span></a>' +
      '<a href="irregular-verbs.html" class="' + (act === 'verb' ? 'active' : '') + '">' + ICON.verb + '<span>Irregular</span></a>' +
      '<a href="quiz.html" class="' + (act === 'latihan' ? 'active' : '') + '">' + ICON.latihan + '<span>Latihan</span></a>';
    document.body.appendChild(nav);
    document.documentElement.classList.add('__hasbnav');
  }

  // ---------- Embed video di halaman tense ----------
  function parseTime(t) {
    if (!t) return null;
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    var s = 0, m = t.match(/(\d+)h/), s2 = t.match(/(\d+)m/), s3 = t.match(/(\d+)s/);
    if (m) s += parseInt(m[1], 10) * 3600;
    if (s2) s += parseInt(s2[1], 10) * 60;
    if (s3) s += parseInt(s3[1], 10);
    return s || null;
  }

  // Ubah berbagai format URL YouTube menjadi URL embed.
  function ytEmbed(url) {
    if (!url) return null;
    url = String(url).trim();
    var id = null, list = null, start = null;
    try {
      var u = new URL(url);
      list = u.searchParams.get('list');
      if (u.hostname.indexOf('youtu.be') >= 0) id = u.pathname.slice(1);
      else if (u.searchParams.get('v')) id = u.searchParams.get('v');
      else if (u.pathname.indexOf('/embed/') >= 0) id = u.pathname.split('/embed/')[1];
      else if (u.pathname.indexOf('/shorts/') >= 0) id = u.pathname.split('/shorts/')[1];
      start = parseTime(u.searchParams.get('t') || u.searchParams.get('start'));
    } catch (e) {
      var mm = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&\/]+)/) || url.match(/\/embed\/([^?&\/]+)/) || url.match(/\/shorts\/([^?&\/]+)/);
      if (mm) id = mm[1];
    }
    if (id) id = id.split('/')[0].split('?')[0];
    if (!id && !list) return null;
    var src = 'https://www.youtube.com/embed/' + (id || 'videoseries');
    var p = ['rel=0'];
    if (list) p.push('list=' + encodeURIComponent(list));
    if (start) p.push('start=' + start);
    return src + '?' + p.join('&');
  }

  function embedVideo() {
    var id = tenseIdFromPath();
    if (!id) return;
    var page = document.querySelector('.page');
    if (!page) return;

    client.from('tense_videos').select('youtube_url').eq('tense_id', id).maybeSingle()
      .then(function (res) {
        if (res.error || !res.data || !res.data.youtube_url) return;
        var src = ytEmbed(res.data.youtube_url);
        if (!src) return;
        if (document.getElementById('__videoSection')) return;
        var navEl = page.querySelector('.tense-nav');   // jika ada blok navigasi, video di atasnya
        var wrap = document.createElement('div');
        wrap.id = '__videoSection';
        wrap.innerHTML =
          '<div class="divider"></div>' +
          '<div class="section" style="margin-bottom:8px;">' +
            '<div class="section-header">' +
              '<div class="section-num">&#9654;</div>' +
              '<div>' +
                '<div class="section-title">Video Pembelajaran</div>' +
                '<div class="section-subtitle">Tonton penjelasan tense ini</div>' +
              '</div>' +
            '</div>' +
            '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;border:1px solid var(--border);background:var(--navy2);">' +
              '<iframe src="' + src + '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0;" ' +
              'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
            '</div>' +
          '</div>';
        if (navEl) page.insertBefore(wrap, navEl); else page.appendChild(wrap);
      });
  }
})();
