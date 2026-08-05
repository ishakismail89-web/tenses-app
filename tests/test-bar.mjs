import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';

const STUB = `
window.supabase = { createClient: () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: { user: { email: 'preview@local' } } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select(){return this;}, eq(){return this;},
                 then(r){return Promise.resolve({data:[],error:null}).then(r);} }),
})};`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
const page = await ctx.newPage();

let fail = 0;
function check(label, got, want, extra = '') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(56)} ${String(got).padEnd(6)} harap=${want} ${extra}`);
}

// Ketiga elemen sekaligus, supaya perbedaan perilakunya terlihat berdampingan.
async function state() {
  return page.evaluate(() => {
    const vis = sel => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return getComputedStyle(el).opacity !== '0';
    };
    return {
      bar: vis('#__bar'),
      toggle: vis('#__themeWrap'),
      nav: (() => {
        const n = document.querySelector('#__bnav');
        return n ? n.getBoundingClientRect().top < window.innerHeight - 4 : null;
      })(),
      dropOpen: !!document.querySelector('#__menuDrop.open'),
      y: Math.round(window.pageYOffset),
    };
  });
}

const PAGES = ['05-simple-past-tense.html', 'home.html', 'quiz.html', 'irregular-verbs.html'];

for (const file of PAGES) {
  await page.addInitScript(() => { try { localStorage.setItem('tenses-theme', 'dark'); } catch (e) {} });
  await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__bar', { timeout: 8000 });
  await page.waitForTimeout(400);

  const max = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight);
  console.log(`\n### ${file}  (bisa digulir ${max}px)`);

  let s = await state();
  check('di puncak — tombol Menu tampil', s.bar, true, `toggle=${s.toggle} nav=${s.nav}`);

  await page.evaluate(m => window.scrollTo(0, Math.round(m / 2)), max);
  await page.waitForTimeout(450);
  s = await state();
  check('di tengah — tombol Menu sembunyi', s.bar, false, `toggle=${s.toggle} nav=${s.nav}`);

  // Inti permintaan: menggulir naik di tengah TIDAK boleh memunculkan tombol Menu,
  // padahal bottom nav memang harus muncul. Di sinilah perilakunya sengaja berbeda.
  const TOP_ZONE = 80, END_ZONE = 24, MARGIN = 30;
  const lo = TOP_ZONE + MARGIN, hi = max - END_ZONE - MARGIN;
  if (hi - lo >= 60) {
    const from = Math.round(lo + (hi - lo) * 0.75);
    const up = Math.min(150, from - lo);
    await page.evaluate(y => window.scrollTo(0, y), from);
    await page.waitForTimeout(450);
    await page.evaluate(d => window.scrollBy(0, -d), up);
    await page.waitForTimeout(450);
    s = await state();
    check('gulir naik di tengah — Menu tetap sembunyi', s.bar, false, `(${from}px → ${s.y}px)`);
    check('gulir naik di tengah — tapi bottom nav muncul', s.nav, true, '← perilakunya memang beda');
  } else {
    console.log(`      zona tengah terlalu sempit — lewati uji gulir-naik`);
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(450);
  s = await state();
  check('di dasar — tombol Menu tampil', s.bar, true, `toggle=${s.toggle} nav=${s.nav}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(450);
  s = await state();
  check('kembali ke puncak — tombol Menu tampil', s.bar, true);

  // Menu dan toggle kini seaturan, jadi keduanya harus selalu seiring.
  check('Menu dan toggle selalu seiring', s.bar === s.toggle, true, `Menu=${s.bar} toggle=${s.toggle}`);
}

// Dropdown yang terbuka harus ditutup saat tombolnya tersembunyi.
console.log('\n### dropdown');
await page.goto(`${BASE}/05-simple-past-tense.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#__menuBtn', { timeout: 8000 });
await page.waitForTimeout(400);
await page.click('#__menuBtn');
await page.waitForTimeout(200);
check('dropdown terbuka', (await state()).dropOpen, true);
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(450);
const s2 = await state();
check('menggulir ke tengah — dropdown ikut ditutup', s2.dropOpen, false, `Menu tampil=${s2.bar}`);

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
