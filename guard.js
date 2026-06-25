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
    onReady(function () { addBar(); embedVideo(); revealAdminOnly(); });
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

    var id = tenseIdFromPath();
    var items = '<a href="home.html">&#9776; Menu Utama</a>';
    if (id) items += '<a href="quiz.html?tense=' + id + '">&#9998; Latihan Soal</a>';
    if (isAdmin()) items += '<a href="admin.html">&#9881; Admin</a>';
    items += '<div class="__sep"></div>';
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
        page.appendChild(wrap);
      });
  }
})();
