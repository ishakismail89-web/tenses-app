import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';
const PAGE = '05-simple-past-tense.html';

const STUB = `
window.supabase = {
  createClient: function () {
    const q = { select(){return q;}, eq(){return q;}, order(){return q;}, limit(){return q;},
                maybeSingle(){return Promise.resolve({data:null,error:null});},
                single(){return Promise.resolve({data:null,error:null});},
                then(r){return Promise.resolve({data:[],error:null}).then(r);} };
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: { user: { email: 'preview@local' } } } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => q,
    };
  }
};`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
const page = await ctx.newPage();

await page.goto(`${BASE}/${PAGE}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#__bnav', { state: 'visible', timeout: 8000 });
await page.waitForTimeout(300);

// Menu dianggap tampil bila kotaknya masih memotong viewport.
async function state() {
  return page.evaluate(() => {
    const nav = document.querySelector('#__bnav');
    const r = nav.getBoundingClientRect();
    const wrap = document.querySelector('#__themeWrap');
    const bar = document.querySelector('#__bar');
    const br = bar && bar.getBoundingClientRect();
    return {
      visible: r.top < window.innerHeight - 4,
      opacity: Number(getComputedStyle(nav).opacity).toFixed(2),
      // Tombol Menu di kanan atas: dianggap tampil bila sisi bawahnya masih di dalam layar.
      barVisible: bar ? br.bottom > 4 : null,
      barOpacity: bar ? Number(getComputedStyle(bar).opacity).toFixed(2) : '-',
      dropOpen: !!document.querySelector('#__menuDrop.open'),
      themeBottom: wrap ? getComputedStyle(wrap).bottom : '(tidak ada)',
      y: Math.round(window.pageYOffset),
      scrollable: document.documentElement.scrollHeight - window.innerHeight,
    };
  });
}

async function scrollBy(px) {
  await page.evaluate(d => window.scrollBy(0, d), px);
  await page.waitForTimeout(450); // tunggu transisi .28s selesai
}

const init = await state();
console.log(`halaman bisa digulir sejauh ${init.scrollable}px\n`);

let fail = 0;
function check(label, got, want, extra = '') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(46)} tampil=${String(got).padEnd(5)} harap=${want} ${extra}`);
}

check('muat awal — menu tampil', init.visible, true, `themeBottom=${init.themeBottom}`);
check('muat awal — tombol Menu tampil', init.barVisible, true);

await scrollBy(400);
let s = await state();
check('gulir turun 400px — menu sembunyi', s.visible, false, `opacity=${s.opacity} themeBottom=${s.themeBottom}`);
check('gulir turun 400px — tombol Menu sembunyi', s.barVisible, false, `opacity=${s.barOpacity}`);

await scrollBy(-150);
s = await state();
check('gulir naik 150px — menu muncul lagi', s.visible, true, `opacity=${s.opacity} themeBottom=${s.themeBottom}`);
// Tombol Menu sengaja TIDAK ikut muncul di sini: aturannya ujung halaman saja,
// dan y=250px masih di tengah. Ini yang membedakannya dari bottom nav.
check('gulir naik 150px — tombol Menu tetap sembunyi', s.barVisible, false, `y=${s.y} (masih di tengah)`);

await scrollBy(400);
s = await state();
check('gulir turun lagi — menu sembunyi', s.visible, false);

// Getaran kecil di bawah ambang 6px tidak boleh mengubah keadaan.
await scrollBy(-3);
s = await state();
check('gulir naik 3px (di bawah ambang) — tetap sembunyi', s.visible, false, `y=${s.y}`);

// Mentok bawah: menu harus tampil agar tetap terjangkau.
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(450);
s = await state();
check('mentok dasar halaman — menu tampil', s.visible, true, `y=${s.y}`);

// Kembali ke puncak.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(450);
s = await state();
check('kembali ke puncak — menu tampil', s.visible, true, `themeBottom=${s.themeBottom}`);

// Gulir turun sedikit di zona puncak (<=80px) harus tetap tampil.
await scrollBy(50);
s = await state();
check('gulir turun 50px (masih zona puncak) — tetap tampil', s.visible, true, `y=${s.y}`);

// Dropdown yang terbuka harus ditutup saat tombolnya ikut tersembunyi,
// supaya tidak ada panel menggantung yang ikut tergeser keluar layar.
await page.click('#__menuBtn');
await page.waitForTimeout(150);
check('dropdown dibuka', (await state()).dropOpen, true);
await scrollBy(400);
s = await state();
check('gulir turun — dropdown ikut ditutup', s.dropOpen, false, `barTampil=${s.barVisible}`);

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
