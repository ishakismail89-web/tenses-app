import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';

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

// Hitung kontras WCAG antara warna teks dan latar efektif hasil komposit.
const PROBE = `(() => {
  const el = document.getElementById('__themeLabel');
  const cs = getComputedStyle(el);
  const parse = c => c.match(/[\\d.]+/g).map(Number);
  const over = (fg, bg) => { const a = fg.length > 3 ? fg[3] : 1;
    return [0,1,2].map(i => fg[i]*a + bg[i]*(1-a)); };
  const lum = c => { const s = c.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
    return 0.2126*s[0] + 0.7152*s[1] + 0.0722*s[2]; };
  // Latar halaman di belakang pill.
  const pageBg = parse(getComputedStyle(document.body).backgroundColor.replace(/^rgba?\\(/,'rgba(')) ;
  const base = pageBg.length >= 3 && (pageBg[3] === undefined || pageBg[3] > 0)
    ? pageBg.slice(0,3)
    : parse(getComputedStyle(document.documentElement).backgroundColor).slice(0,3);
  const pill = over(parse(cs.backgroundColor), base);
  const text = over(parse(cs.color), pill);
  const L1 = lum(text), L2 = lum(pill);
  const ratio = (Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05);
  return {
    font: cs.fontFamily.split(',')[0].replace(/["']/g,''),
    weight: cs.fontWeight,
    size: cs.fontSize,
    tracking: cs.letterSpacing,
    labelBgAlpha: (parse(cs.backgroundColor)[3] ?? 1).toFixed(2),
    contrast: ratio.toFixed(2),
  };
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
const page = await ctx.newPage();

let fail = 0;
function check(label, got, want, extra = '') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(52)} ${String(got).padEnd(6)} harap=${want} ${extra}`);
}

async function visible() {
  return page.evaluate(() => {
    const w = document.getElementById('__themeWrap');
    return getComputedStyle(w).opacity !== '0';
  });
}

// ---------- 1. Gaya label + kontras, di kedua tema ----------
console.log('--- Label: font & kontras ---');
for (const [file, theme] of [['05-simple-past-tense.html', 'dark'], ['05-simple-past-tense.html', 'light'], ['index.html', 'dark']]) {
  await page.addInitScript(t => { try { localStorage.setItem('tenses-theme', t); } catch (e) {} }, theme);
  await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__themeLabel', { timeout: 8000 });
  await page.waitForTimeout(500); // beri waktu webfont terpasang
  const m = await page.evaluate(PROBE);
  const okWeight = m.weight === '300';
  const okContrast = Number(m.contrast) >= 4.5; // ambang WCAG AA teks normal
  if (!okWeight || !okContrast) fail++;
  console.log(
    `${okWeight && okContrast ? 'PASS' : 'FAIL'}  ${(file + ' / ' + theme).padEnd(34)} ` +
    `font=${m.font.padEnd(12)} bobot=${m.weight} ukuran=${m.size} spasi=${m.tracking} ` +
    `alphaLatar=${m.labelBgAlpha} kontras=${m.contrast}:1`
  );
}

// ---------- 2. Perilaku gulir, di semua jenis halaman ----------
console.log('\n--- Perilaku gulir toggle ---');
for (const file of ['05-simple-past-tense.html', 'home.html', 'irregular-verbs.html', 'quiz.html', 'index.html']) {
  await page.addInitScript(() => { try { localStorage.setItem('tenses-theme', 'dark'); } catch (e) {} });
  await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__themeWrap', { timeout: 8000 });
  await page.waitForTimeout(300);

  const max = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight);

  check(`${file} — di puncak, toggle tampil`, await visible(), true, `(bisa digulir ${max}px)`);

  if (max <= 80) {
    console.log(`      ${file} tidak bisa digulir — lewati uji tengah/dasar (toggle memang harus tetap tampil)`);
    continue;
  }

  await page.evaluate(m => window.scrollTo(0, Math.round(m / 2)), max);
  await page.waitForTimeout(450);
  check(`${file} — di tengah, toggle sembunyi`, await visible(), false);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(450);
  check(`${file} — di dasar, toggle tampil`, await visible(), true);

  // Menggulir naik dari tengah TIDAK boleh memunculkan toggle (beda dari bottom nav).
  // Titik awal dan jarak naik dihitung dari lebar zona tengah, supaya di halaman
  // pendek kita tidak tanpa sengaja mendarat di zona puncak — di sana toggle
  // memang sudah seharusnya tampil.
  const TOP_ZONE = 80, END_ZONE = 24, MARGIN = 30;
  const bandLo = TOP_ZONE + MARGIN, bandHi = max - END_ZONE - MARGIN;
  if (bandHi - bandLo < 60) {
    console.log(`      ${file} zona tengahnya terlalu sempit (${Math.max(0, bandHi - bandLo)}px) — lewati uji gulir-naik`);
  } else {
    const from = Math.round(bandLo + (bandHi - bandLo) * 0.75);
    const up = Math.min(150, from - bandLo);
    await page.evaluate(y => window.scrollTo(0, y), from);
    await page.waitForTimeout(450);
    await page.evaluate(d => window.scrollBy(0, -d), up);
    await page.waitForTimeout(450);
    const landed = await page.evaluate(() => Math.round(window.pageYOffset));
    check(`${file} — gulir naik di tengah, tetap sembunyi`, await visible(), false, `(${from}px → ${landed}px)`);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(450);
  check(`${file} — kembali ke puncak, tampil lagi`, await visible(), true);
}

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
