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
const ctx = await browser.newContext({ viewport: { width: 460, height: 900 }, deviceScaleFactor: 2 });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
const page = await ctx.newPage();

await page.goto(`${BASE}/13-past-future-tense.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.error-pair', { timeout: 8000 });
await page.waitForTimeout(600);

// Pasangan ✕/✓ terakhir — yang tadi rusak.
const pairs = page.locator('.error-pair');
const n = await pairs.count();
await pairs.nth(n - 1).scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await pairs.nth(n - 1).screenshot({ path: `${OUT}/err-pair.png` });

// Kotak peringatan baru di bagian 7 — isinya terlipat, jadi buka toggle-nya dulu.
// Klik hanya toggle Time Signal; mengklik semuanya justru menutup yang sudah terbuka.
await page.locator('.ex-toggle[data-show*="Time Signal"]').click();
await page.waitForTimeout(600);
const warn = page.locator('.detect-box > div', { hasText: 'Tidak semua "would"' }).last();
await warn.waitFor({ state: 'visible', timeout: 8000 });
await warn.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await warn.screenshot({ path: `${OUT}/err-note.png` });

console.log('teks contoh terakhir:', (await pairs.nth(n - 1).innerText()).replace(/\n/g, ' | '));
await browser.close();
