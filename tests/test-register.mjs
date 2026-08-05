import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';
const OUT = new URL('./__screenshots__/', import.meta.url).pathname;
await (await import('node:fs/promises')).mkdir(OUT, { recursive: true });

// Stub merekam argumen signUp supaya bisa diperiksa dari test.
const STUB = `
window.__calls = [];
window.supabase = { createClient: () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    signUp: (args) => { window.__calls.push({ fn:'signUp', args });
      return Promise.resolve({ data: { session: null, user: {} }, error: null }); },
    signInWithPassword: (args) => { window.__calls.push({ fn:'signInWithPassword', args });
      return Promise.resolve({ data: {}, error: { message: 'Invalid login credentials' } }); },
    signInWithOAuth: (args) => { window.__calls.push({ fn:'signInWithOAuth', args });
      return Promise.resolve({ data: {}, error: null }); },
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({ select(){return this;}, eq(){return this;},
                 then(r){return Promise.resolve({data:[],error:null}).then(r);} }),
})};`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 460, height: 980 }, deviceScaleFactor: 2 });
await ctx.route('**/@supabase/**', r =>
  r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
const page = await ctx.newPage();

let fail = 0;
function check(label, got, want, extra = '') {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(56)} ${String(got).slice(0,28).padEnd(28)} harap=${String(want).slice(0,24)} ${extra}`);
}

async function fresh() {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#form', { timeout: 8000 });
  await page.waitForTimeout(400);
}
const msgText = () => page.locator('#msg').innerText();
const visible = sel => page.locator(sel).isVisible();

// ---------- 1. Field konfirmasi hanya muncul di mode Daftar ----------
console.log('--- Tampilan field ---');
await fresh();
check('mode Masuk — field konfirmasi tersembunyi', await visible('#confirmField'), false);
check('mode Masuk — keterangan 6 karakter tersembunyi', await visible('#pwHint'), false);

await page.click('#switchLink');
await page.waitForTimeout(300);
check('mode Daftar — field konfirmasi muncul', await visible('#confirmField'), true);
check('mode Daftar — keterangan 6 karakter muncul', await visible('#pwHint'), true);
check('keterangan menyebut 6 karakter',
      /6 karakter/.test(await page.locator('#pwHint').innerText()), true,
      `("${await page.locator('#pwHint').innerText()}")`);

// ---------- 2. Umpan balik langsung saat mengetik ----------
console.log('\n--- Umpan balik kecocokan ---');
await page.fill('#name', 'Ishak');
await page.fill('#email', 'coba@contoh.com');
await page.fill('#password', 'abc123');
await page.fill('#confirm', 'abc1');
await page.waitForTimeout(250);
check('belum sama — hint memberi tahu', await page.locator('#confirmHint').innerText(), 'Password tidak sama.');
check('belum sama — hint berwarna merah',
      await page.locator('#confirmHint').getAttribute('class'), 'hint bad');

await page.fill('#confirm', 'abc123');
await page.waitForTimeout(250);
check('sudah sama — hint memberi tahu', await page.locator('#confirmHint').innerText(), 'Password sama.');

// Panjang diperiksa lebih dulu daripada kecocokan: dua isian yang sama tapi
// terlalu pendek dulu menyala hijau "cocok", lalu ditolak begitu tombol ditekan.
await page.fill('#password', 'abc'); await page.fill('#confirm', 'abc');
await page.waitForTimeout(250);
check('pendek — keterangan password memerah',
      await page.locator('#pwHint').getAttribute('class'), 'hint bad');
check('pendek walau sama — konfirmasi tidak hijau',
      (await page.locator('#confirmHint').getAttribute('class') || '').includes('good'), false,
      `("${await page.locator('#confirmHint').innerText()}")`);
check('pendek walau sama — konfirmasi menyebut batas panjang',
      /terlalu pendek/i.test(await page.locator('#confirmHint').innerText()), true);

await page.fill('#password', 'abc123'); await page.fill('#confirm', 'abc123');
await page.waitForTimeout(250);
check('cukup panjang — keterangan password menghijau',
      await page.locator('#pwHint').getAttribute('class'), 'hint good');

// Peringatan merah sisa percobaan sebelumnya harus pergi begitu isian diperbaiki.
await page.fill('#password', 'abc'); await page.fill('#confirm', 'abc');
await page.click('#submitBtn'); await page.waitForTimeout(350);
check('submit pendek — muncul peringatan merah',
      (await page.locator('#msg').getAttribute('class') || '').includes('err'), true);
await page.fill('#password', 'abc123');
await page.waitForTimeout(200);
check('peringatan merah hilang saat mengetik lagi',
      (await page.locator('#msg').getAttribute('class') || '').includes('err'), false);

// Sebaliknya, keterangan hijau masih perlu dibaca — jangan ikut terhapus.
await page.evaluate(() => { const m = document.getElementById('msg'); m.className = 'msg ok'; m.textContent = 'Link verifikasi sudah dikirim.'; });
await page.fill('#password', 'abc1234');
await page.waitForTimeout(200);
check('pesan hijau bertahan saat mengetik',
      (await page.locator('#msg').getAttribute('class') || '').includes('ok'), true);

// ---------- 3. Guard: panjang minimal, tanpa syarat jenis karakter ----------
console.log('\n--- Guard password ---');
await fresh(); await page.click('#switchLink'); await page.waitForTimeout(250);
await page.fill('#name', 'Ishak'); await page.fill('#email', 'coba@contoh.com');
await page.fill('#password', 'abc12'); await page.fill('#confirm', 'abc12');
await page.click('#submitBtn'); await page.waitForTimeout(350);
check('5 karakter ditolak', /minimal 6 karakter/i.test(await msgText()), true, `("${await msgText()}")`);
check('5 karakter — signUp tidak dipanggil',
      await page.evaluate(() => window.__calls.length), 0);

// Simbol / huruf besar / spasi semuanya harus diterima — tidak ada syarat jenis karakter.
for (const pw of ['!@#$%^', 'ABCDEF', 'a B c!1', '••••••']) {
  await fresh(); await page.click('#switchLink'); await page.waitForTimeout(250);
  await page.fill('#name', 'Ishak'); await page.fill('#email', 'coba@contoh.com');
  await page.fill('#password', pw); await page.fill('#confirm', pw);
  await page.click('#submitBtn'); await page.waitForTimeout(400);
  const calls = await page.evaluate(() => window.__calls);
  check(`password "${pw}" (${pw.length} kar.) diterima`, calls.length, 1, `msg="${(await msgText()).slice(0,40)}"`);
}

// ---------- 4. Konfirmasi tidak cocok harus menahan pendaftaran ----------
console.log('\n--- Konfirmasi tidak cocok ---');
await fresh(); await page.click('#switchLink'); await page.waitForTimeout(250);
await page.fill('#name', 'Ishak'); await page.fill('#email', 'coba@contoh.com');
await page.fill('#password', 'rahasia1'); await page.fill('#confirm', 'rahasia2');
await page.click('#submitBtn'); await page.waitForTimeout(350);
check('tidak cocok ditolak', /tidak sama/i.test(await msgText()), true, `("${await msgText()}")`);
check('tidak cocok — signUp tidak dipanggil',
      await page.evaluate(() => window.__calls.length), 0);

await page.fill('#confirm', '');
await page.click('#submitBtn'); await page.waitForTimeout(350);
check('konfirmasi kosong ditolak', /konfirmasi password wajib/i.test(await msgText()), true);

// ---------- 5. emailRedirectTo benar-benar dikirim ----------
console.log('\n--- Link verifikasi email ---');
await fresh(); await page.click('#switchLink'); await page.waitForTimeout(250);
await page.fill('#name', 'Ishak'); await page.fill('#email', 'coba@contoh.com');
await page.fill('#password', 'rahasia1'); await page.fill('#confirm', 'rahasia1');
await page.click('#submitBtn'); await page.waitForTimeout(500);

const call = (await page.evaluate(() => window.__calls))[0];
check('signUp dipanggil', call && call.fn, 'signUp');
const redirect = call && call.args && call.args.options && call.args.options.emailRedirectTo;
check('emailRedirectTo dikirim ke Supabase', typeof redirect, 'string', `(${redirect})`);
check('emailRedirectTo mengarah ke home.html', /\/home\.html$/.test(redirect || ''), true);
check('nama ikut terkirim', call.args.options.data.name, 'Ishak');
check('pesan menyebut cek email', /link verifikasi/i.test(await msgText()), true, `("${(await msgText()).slice(0,60)}...")`);
check('kembali ke mode Masuk setelah daftar', await visible('#confirmField'), false);

// Tombol Google harus memakai tujuan yang sama.
await fresh();
await page.click('#googleBtn'); await page.waitForTimeout(400);
const g = (await page.evaluate(() => window.__calls)).find(c => c.fn === 'signInWithOAuth');
check('Google memakai tujuan home yang sama', /\/home\.html$/.test(g.args.options.redirectTo), true,
      `(${g.args.options.redirectTo})`);

// Potret mode Daftar.
await fresh(); await page.click('#switchLink'); await page.waitForTimeout(300);
await page.fill('#password', 'rahasia1'); await page.fill('#confirm', 'rahasia9');
await page.waitForTimeout(250);
await page.locator('.card').screenshot({ path: `${OUT}/register.png` });

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
