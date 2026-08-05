import { chromium } from 'playwright';

const OUT = new URL('./__screenshots__/', import.meta.url).pathname;
await (await import('node:fs/promises')).mkdir(OUT, { recursive: true });
const BASE = 'http://localhost:8000';

const CASES = [
  ['home.html', 'dark', 'nav-home-dark'],
  ['home.html', 'light', 'nav-home-light'],
  ['01-simple-present-tense.html', 'dark', 'nav-tense-dark'],
  ['01-simple-present-tense.html', 'light', 'nav-tense-light'],
  ['irregular-verbs.html', 'dark', 'nav-irregular-dark'],
  ['quiz.html', 'dark', 'nav-quiz-dark'],
];

// Pengganti SDK Supabase: cukup untuk melewati gerbang sesi di guard.js.
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
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 3 });

// Blokir CDN Supabase dan sisipkan stub sebagai gantinya.
await ctx.route('**/@supabase/**', route =>
  route.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));

const page = await ctx.newPage();
let failed = false;

for (const [file, theme, name] of CASES) {
  await page.addInitScript(t => { try { localStorage.setItem('tenses-theme', t); } catch (e) {} }, theme);
  await page.goto(`${BASE}/${file}`, { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForSelector('#__bnav', { timeout: 8000, state: 'visible' });
  } catch (e) {
    console.log(`${name.padEnd(20)} SKIP — tidak ada #__bnav (url akhir: ${page.url().split('/').pop()})`);
    failed = true;
    continue;
  }
  await page.waitForTimeout(300);

  const info = await page.evaluate(() => {
    const a = document.querySelector('#__bnav a.active');
    const cs = a && getComputedStyle(a);
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      active: a ? a.textContent.trim() : '(tidak ada)',
      bg: cs ? cs.backgroundColor : '-',
      color: cs ? cs.color : '-',
      strokes: [...document.querySelectorAll('#__bnav a')].map(el => {
        const svg = el.querySelector('svg');
        return el.textContent.trim() + ':' + getComputedStyle(svg).strokeWidth;
      }).join(' '),
    };
  });
  console.log(`${name.padEnd(20)} theme=${info.theme} active=${info.active} bg=${info.bg} color=${info.color}`);
  console.log(`${''.padEnd(20)} stroke → ${info.strokes}`);

  await page.locator('#__bnav').screenshot({ path: `${OUT}/${name}.png` });
}

await browser.close();
process.exit(failed ? 1 : 0);
