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

  // ---------- Bar atas (Menu / Latihan / Admin / Keluar) ----------
  function addBar() {
    if (document.getElementById('__bar')) return;
    var bar = document.createElement('div');
    bar.id = '__bar';
    bar.style.cssText = 'position:fixed;top:10px;right:12px;z-index:9999;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;';
    var s = 'font:600 12px/1 -apple-system,sans-serif;background:#1A2540;border:1px solid #26324d;padding:9px 13px;border-radius:20px;text-decoration:none;';

    var id = tenseIdFromPath();
    var quizLink = id ? '<a href="quiz.html?tense=' + id + '" style="' + s + 'color:#F59E0B">&#9998; Latihan</a>' : '';
    var adminLink = isAdmin() ? '<a href="admin.html" style="' + s + 'color:#A78BFA">&#9881; Admin</a>' : '';

    bar.innerHTML =
      quizLink +
      adminLink +
      '<a href="home.html" style="' + s + 'color:#2DD4BF">&#9776; Menu</a>' +
      '<a href="#" id="__logoutBtn" style="' + s + 'color:#8A97B0">Keluar</a>';
    document.body.appendChild(bar);
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
