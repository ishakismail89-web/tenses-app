import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';

// [url, tema, menu yang diharapkan menyala ('' = tidak ada]
const CASES = [
  ['home.html',                        'dark',  'Tenses'],
  ['home.html',                        'light', 'Tenses'],
  ['01-simple-present-tense.html',     'dark',  ''],
  ['01-simple-present-tense.html',     'light', ''],
  ['05-simple-past-tense.html',        'dark',  ''],
  ['13-past-future-tense.html',        'dark',  ''],
  ['16-past-future-perfect-continuous-tense.html', 'dark', ''],
  ['irregular-verbs.html',             'dark',  'Irregular'],
  ['irregular-verbs.html',             'light', 'Irregular'],
  ['quiz.html',                        'dark',  'Latihan'],
  ['quiz.html?tense=05',               'dark',  'Latihan'],
];

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
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2 });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));

const page = await ctx.newPage();
let fail = 0;

for (const [url, theme, want] of CASES) {
  await page.addInitScript(t => { try { localStorage.setItem('tenses-theme', t); } catch (e) {} }, theme);
  await page.goto(`${BASE}/${url}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__bnav', { timeout: 8000, state: 'visible' });
  await page.waitForTimeout(250);

  const got = await page.evaluate(() => {
    const a = document.querySelector('#__bnav a.active');
    // Cek juga tidak ada latar berwarna yang tersisa di menu mana pun.
    const bgs = [...document.querySelectorAll('#__bnav a')]
      .map(el => getComputedStyle(el).backgroundColor)
      .filter(c => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent');
    return { active: a ? a.textContent.trim() : '', strayBg: bgs };
  });

  const okActive = got.active === want;
  const okBg = got.strayBg.length === 0;
  if (!okActive || !okBg) fail++;
  console.log(
    `${okActive && okBg ? 'PASS' : 'FAIL'}  ${url.padEnd(46)} ${theme.padEnd(5)} ` +
    `nyala=${(got.active || '(tidak ada)').padEnd(12)} harap=${want || '(tidak ada)'}` +
    (okBg ? '' : `  ← masih ada latar: ${got.strayBg.join(',')}`)
  );
}

await browser.close();
console.log(fail === 0 ? `\nSemua ${CASES.length} kasus lolos.` : `\n${fail} dari ${CASES.length} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
