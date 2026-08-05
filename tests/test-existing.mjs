import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';

// Stub meniru dua balasan Supabase yang bentuknya nyaris sama:
//  - email BARU     → identities berisi satu entri
//  - email SUDAH ADA→ identities kosong, tapi confirmation_sent_at tetap terisi
function stub(mode) {
  return `
window.__calls = [];
window.supabase = { createClient: () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    signUp: (args) => { window.__calls.push(args); return Promise.resolve({
      data: { session: null, user: {
        id: 'x', email: args.email,
        confirmation_sent_at: '2026-08-05T14:40:35Z',
        identities: ${mode === 'baru' ? "[{identity_id:'a'}]" : '[]'}
      } }, error: null }); },
    signInWithPassword: () => Promise.resolve({ data: {}, error: { message: 'Invalid login credentials' } }),
    signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select(){return this;}, eq(){return this;},
                 then(r){return Promise.resolve({data:[],error:null}).then(r);} }),
})};`;
}

const browser = await chromium.launch();
let fail = 0;
function check(label, got, want, extra='') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(52)} ${String(got).slice(0,34).padEnd(34)} harap=${String(want).slice(0,20)} ${extra}`);
}

for (const mode of ['baru', 'sudah-ada']) {
  const ctx = await browser.newContext({ viewport: { width: 460, height: 980 } });
  await ctx.route('**/@supabase/**', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript', body: stub(mode) }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#form', { timeout: 8000 });
  await page.waitForTimeout(350);

  console.log(`\n### email ${mode}`);
  await page.click('#switchLink'); await page.waitForTimeout(250);
  await page.fill('#name', 'Uji');
  await page.fill('#email', 'jodohpintu@gmail.com');
  await page.fill('#password', 'CobaSaja123');
  await page.fill('#confirm', 'CobaSaja123');
  await page.click('#submitBtn');
  await page.waitForTimeout(500);

  const msg = (await page.locator('#msg').innerText()).trim();
  const cls = await page.locator('#msg').getAttribute('class');
  const emailField = await page.locator('#email').inputValue();
  const inRegister = await page.locator('#confirmField').isVisible();

  if (mode === 'baru') {
    check('email baru — diberi tahu cek email', /link verifikasi/i.test(msg), true, `("${msg.slice(0,46)}...")`);
    check('email baru — ditandai sukses', cls, 'msg ok');
  } else {
    check('sudah ada — TIDAK disuruh cek email', /link verifikasi/i.test(msg), false, `("${msg}")`);
    check('sudah ada — diberi tahu sudah terdaftar', /sudah terdaftar/i.test(msg), true);
    check('sudah ada — ditandai error, bukan sukses', cls, 'msg err');
    check('sudah ada — dipindah ke mode Masuk', inRegister, false);
    check('sudah ada — email tetap terisi', emailField, 'jodohpintu@gmail.com');
  }
  const btn = await page.locator('#submitBtn').isEnabled();
  check(`${mode} — tombol aktif kembali`, btn, true);
  await ctx.close();
}

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
