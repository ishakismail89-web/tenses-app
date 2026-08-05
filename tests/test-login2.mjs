import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';
const OUT = new URL('./__screenshots__/', import.meta.url).pathname;
await (await import('node:fs/promises')).mkdir(OUT, { recursive: true });

const NO_SESSION = `
window.supabase = { createClient: () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: { message: 'stub' } }),
    signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select(){return this;}, eq(){return this;},
                 then(r){return Promise.resolve({data:[],error:null}).then(r);} }),
})};`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 460, height: 900 }, deviceScaleFactor: 2 });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: NO_SESSION }));
const page = await ctx.newPage();

let fail = 0;
function check(label, got, want, extra = '') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(54)} ${String(got).padEnd(7)} harap=${want} ${extra}`);
}

for (const theme of ['dark', 'light']) {
  await page.addInitScript(t => { try { localStorage.setItem('tenses-theme', t); } catch (e) {} }, theme);
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__themeWrap', { timeout: 8000 });
  await page.waitForTimeout(500);

  console.log(`\n### mode ${theme}`);

  const r = await page.evaluate(() => {
    const card = document.querySelector('.card');
    const wrap = document.getElementById('__themeWrap');
    const logo = document.querySelector('.logo');
    const cb = card.getBoundingClientRect();
    const wb = wrap.getBoundingClientRect();
    const cs = getComputedStyle(wrap);
    return {
      // Benar-benar anak dari kartu, bukan kebetulan tampak di dekatnya.
      insideCardDom: card.contains(wrap),
      // Dan kotaknya memang berada di dalam batas kartu.
      insideCardBox: wb.top >= cb.top && wb.right <= cb.right + 1 &&
                     wb.left >= cb.left && wb.bottom <= cb.bottom,
      // Menempel di pojok KANAN ATAS: jarak ke tepi kanan & atas kartu kecil.
      gapRight: Math.round(cb.right - wb.right),
      gapTop: Math.round(wb.top - cb.top),
      position: cs.position,
      direction: cs.flexDirection,
      // Ikon: SVG satu warna, bukan emoji di atas gradasi.
      logoHasSvg: !!logo.querySelector('svg'),
      logoText: logo.textContent.trim(),
      logoBg: getComputedStyle(logo).backgroundImage,
      // Teks yang harus hilang.
      noteGone: !document.querySelector('.note') &&
                !document.body.innerText.includes('tersimpan aman di server'),
      supabaseMentioned: document.body.innerText.includes('Supabase'),
    };
  });

  check('toggle benar-benar anak dari .card (DOM)', r.insideCardDom, true);
  check('kotak toggle di dalam batas kartu', r.insideCardBox, true);
  check('menempel di pojok kanan atas', r.gapRight <= 20 && r.gapTop <= 20, true,
        `(kanan ${r.gapRight}px, atas ${r.gapTop}px)`);
  check('tidak lagi position:fixed', r.position !== 'fixed', true, `(${r.position}, ${r.direction})`);
  check('ikon berupa SVG', r.logoHasSvg, true);
  check('emoji gembok sudah hilang', r.logoText === '', true, `(sisa teks: "${r.logoText}")`);
  check('ubin ikon tanpa gradasi', r.logoBg === 'none', true, `(${r.logoBg})`);
  check('keterangan Supabase sudah dihapus', r.noteGone, true, `(kata "Supabase" ada: ${r.supabaseMentioned})`);

  // Toggle harus tetap berfungsi di posisi barunya.
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.click('#__themeBtn');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('toggle masih berfungsi saat diklik', before !== after, true, `(${before} → ${after})`);

  // Tidak menutupi kolom isian atau tombol mana pun.
  const overlap = await page.evaluate(() => {
    const wb = document.getElementById('__themeWrap').getBoundingClientRect();
    const hits = [];
    document.querySelectorAll('input, button:not(#__themeBtn), h1, .sub').forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.width && wb.left < b.right && wb.right > b.left && wb.top < b.bottom && wb.bottom > b.top) {
        hits.push(el.id || el.tagName.toLowerCase() + '.' + el.className);
      }
    });
    return hits;
  });
  check('tidak menimpa elemen lain', overlap.length, 0, overlap.length ? `(${overlap.join(', ')})` : '');

  await page.evaluate(t => { localStorage.setItem('tenses-theme', t); }, theme);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__themeWrap', { timeout: 8000 });
  await page.waitForTimeout(600);
  await page.locator('.card').screenshot({ path: `${OUT}/login-${theme}.png` });
}

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
