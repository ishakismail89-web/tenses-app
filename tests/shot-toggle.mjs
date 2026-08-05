import { chromium } from 'playwright';

const OUT = new URL('./__screenshots__/', import.meta.url).pathname;
await (await import('node:fs/promises')).mkdir(OUT, { recursive: true });
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
const ctx = await browser.newContext({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 3 });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
const page = await ctx.newPage();

for (const theme of ['dark', 'light']) {
  await page.addInitScript(t => { try { localStorage.setItem('tenses-theme', t); } catch (e) {} }, theme);
  await page.goto(`${BASE}/05-simple-past-tense.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#__themeWrap', { timeout: 8000 });
  await page.waitForTimeout(700);
  // Potret pojok kanan bawah: toggle + label di atas isi halaman sungguhan.
  await page.screenshot({
    path: `${OUT}/toggle-${theme}.png`,
    clip: { x: 200, y: 640, width: 220, height: 220 },
  });
}

await browser.close();
