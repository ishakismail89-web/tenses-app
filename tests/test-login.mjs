import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';

// Stub TANPA sesi, supaya index.html tidak mengalihkan ke home.html.
const STUB_NO_SESSION = `
window.supabase = {
  createClient: function () {
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
        signInWithPassword: () => Promise.resolve({ data: {}, error: { message: 'stub' } }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({ select(){return this;}, eq(){return this;},
                     then(r){return Promise.resolve({data:[],error:null}).then(r);} }),
    };
  }
};`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB_NO_SESSION }));
const page = await ctx.newPage();

let fail = 0;
function check(label, got, want, extra = '') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(50)} ${String(got).padEnd(6)} harap=${want} ${extra}`);
}

await page.addInitScript(() => { try { localStorage.setItem('tenses-theme', 'dark'); } catch (e) {} });
await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(700);

const url = page.url().split('/').pop();
check('tetap di halaman login (tidak dialihkan)', url, 'index.html');

await page.waitForSelector('#__themeWrap', { timeout: 8000 });
const info = await page.evaluate(() => {
  const w = document.getElementById('__themeWrap');
  const l = document.getElementById('__themeLabel');
  const cs = getComputedStyle(l);
  return {
    topLeft: w.classList.contains('__themeTopLeft'),
    visible: getComputedStyle(w).opacity !== '0',
    scrollable: document.documentElement.scrollHeight - window.innerHeight,
    font: cs.fontFamily.split(',')[0].replace(/["']/g, ''),
    weight: cs.fontWeight,
    text: l.textContent.trim(),
  };
});

check('toggle ada dan tampil', info.visible, true, `posisi kiri-atas=${info.topLeft} label="${info.text}"`);
check('label pakai bobot tipis 300', info.weight, '300', `font=${info.font}`);
check('halaman login tidak bisa digulir', info.scrollable <= 0, true, `(${info.scrollable}px)`);
console.log(`      catatan: index.html tanpa Google Fonts, jadi jatuh ke font sistem — itu memang disengaja`);

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
