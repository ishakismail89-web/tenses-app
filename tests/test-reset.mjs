import { chromium } from 'playwright';

const BASE = 'http://localhost:8000';

// Stub index.html: merekam argumen resetPasswordForEmail.
const STUB_INDEX = `
window.__calls = [];
window.supabase = { createClient: () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    resetPasswordForEmail: (email, opts) => { window.__calls.push({fn:'reset', email, opts});
      return Promise.resolve({ data:{}, error:null }); },
    signUp: () => Promise.resolve({ data:{session:null,user:{identities:[{}]}}, error:null }),
    signInWithPassword: () => Promise.resolve({ data:{}, error:{message:'Invalid login credentials'} }),
    signInWithOAuth: () => Promise.resolve({ data:{}, error:null }),
    signOut: () => Promise.resolve({ error:null }),
  },
  from: () => ({ select(){return this;}, eq(){return this;},
                 then(r){return Promise.resolve({data:[],error:null}).then(r);} }),
})};`;

// Stub reset-password.html: sesi pemulihan ada / tidak ada.
function stubReset(punyaSesi) {
  return `
window.__calls = [];
window.supabase = { createClient: () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: ${punyaSesi
      ? "{ user: { email: 'jodohpintu@gmail.com' } }" : 'null'} } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    updateUser: (args) => { window.__calls.push({fn:'updateUser', args});
      return Promise.resolve({ data:{}, error:null }); },
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
  console.log(`${ok?'PASS':'FAIL'}  ${label.padEnd(54)} ${String(got).slice(0,30).padEnd(30)} harap=${String(want).slice(0,22)} ${extra}`);
}
const vis = (p,s)=>p.locator(s).isVisible();

// ---------- 1. Halaman Masuk: minta link reset ----------
console.log('### index.html — minta link reset');
{
  const ctx = await browser.newContext({ viewport:{width:460,height:980} });
  await ctx.route('**/@supabase/**', r=>r.fulfill({status:200,contentType:'application/javascript',body:STUB_INDEX}));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, {waitUntil:'domcontentloaded'});
  await page.waitForSelector('#form',{timeout:8000}); await page.waitForTimeout(350);

  check('mode Masuk — "Lupa password?" terlihat', await vis(page,'#forgot'), true);
  await page.click('#switchLink'); await page.waitForTimeout(250);
  check('mode Daftar — "Lupa password?" disembunyikan', await vis(page,'#forgot'), false);
  await page.click('#switchLink'); await page.waitForTimeout(250);

  await page.click('#forgotLink'); await page.waitForTimeout(300);
  check('mode reset — judul berganti', (await page.locator('#title').innerText()).trim(), 'Reset password');
  check('mode reset — kolom password disembunyikan', await vis(page,'#passwordField'), false);
  check('mode reset — tombol Google disembunyikan', await vis(page,'#altLogin'), false);
  check('mode reset — teks tombol', (await page.locator('#submitBtn').innerText()).trim(), 'Kirim link reset');

  await page.click('#submitBtn'); await page.waitForTimeout(300);
  check('email kosong ditolak', /email wajib diisi/i.test(await page.locator('#msg').innerText()), true);
  check('email kosong — belum memanggil Supabase', (await page.evaluate(()=>window.__calls)).length, 0);

  await page.fill('#email','jodohpintu@gmail.com');
  await page.click('#submitBtn'); await page.waitForTimeout(500);
  const c = (await page.evaluate(()=>window.__calls))[0];
  check('resetPasswordForEmail dipanggil', c && c.fn, 'reset');
  check('email diteruskan', c.email, 'jodohpintu@gmail.com');
  check('redirectTo ke reset-password.html', /\/reset-password\.html$/.test(c.opts.redirectTo), true, `(${c.opts.redirectTo})`);
  const m = await page.locator('#msg').innerText();
  check('pesan tidak membocorkan apakah email terdaftar', /kalau .* terdaftar/i.test(m), true, `("${m.slice(0,52)}...")`);
  check('kembali ke mode Masuk', (await page.locator('#title').innerText()).trim(), 'Selamat datang kembali');
  await ctx.close();
}

// ---------- 2. Halaman password baru: link sah ----------
console.log('\n### reset-password.html — link sah');
{
  const ctx = await browser.newContext({ viewport:{width:460,height:980} });
  await ctx.route('**/@supabase/**', r=>r.fulfill({status:200,contentType:'application/javascript',body:stubReset(true)}));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/reset-password.html#access_token=abc&type=recovery`, {waitUntil:'domcontentloaded'});
  await page.waitForSelector('#form',{state:'visible',timeout:8000}); await page.waitForTimeout(400);

  check('formulir tampil', await vis(page,'#form'), true);
  check('menyebut email pemilik akun', /jodohpintu@gmail\.com/.test(await page.locator('#subtitle').innerText()), true);
  check('token dibersihkan dari URL', page.url().includes('#'), false, `(${page.url().split('/').pop()})`);

  await page.fill('#password','abc12'); await page.fill('#confirm','abc12');
  await page.click('#submitBtn'); await page.waitForTimeout(300);
  check('kurang dari 6 karakter ditolak', /minimal 6 karakter/i.test(await page.locator('#msg').innerText()), true);
  check('kurang dari 6 — belum menyimpan', (await page.evaluate(()=>window.__calls)).length, 0);

  await page.fill('#password','rahasiabaru'); await page.fill('#confirm','rahasialain');
  await page.waitForTimeout(250);
  check('tidak cocok — hint langsung memberi tahu', (await page.locator('#confirmHint').innerText()).trim(), 'Password tidak sama.');
  await page.click('#submitBtn'); await page.waitForTimeout(300);
  check('tidak cocok ditolak', /tidak sama/i.test(await page.locator('#msg').innerText()), true);
  check('tidak cocok — belum menyimpan', (await page.evaluate(()=>window.__calls)).length, 0);

  await page.fill('#confirm','rahasiabaru'); await page.waitForTimeout(250);
  check('cocok — hint hijau', await page.locator('#confirmHint').getAttribute('class'), 'hint good');
  await page.click('#submitBtn'); await page.waitForTimeout(500);
  const c = (await page.evaluate(()=>window.__calls))[0];
  check('updateUser dipanggil', c && c.fn, 'updateUser');
  check('password baru diteruskan', c.args.password, 'rahasiabaru');
  check('pesan berhasil', /berhasil diganti/i.test(await page.locator('#msg').innerText()), true);
  await ctx.close();
}

// ---------- 3. Halaman password baru: link tidak sah ----------
console.log('\n### reset-password.html — link tidak sah / kedaluwarsa');
for (const [nama, url, stubSesi, cocok] of [
  ['tanpa sesi (link terpakai)', '/reset-password.html', false, /tidak berlaku atau sudah terpakai/i],
  ['fragment error kedaluwarsa', '/reset-password.html#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired', false, /kedaluwarsa/i],
]) {
  const ctx = await browser.newContext({ viewport:{width:460,height:980} });
  await ctx.route('**/@supabase/**', r=>r.fulfill({status:200,contentType:'application/javascript',body:stubReset(stubSesi)}));
  const page = await ctx.newPage();
  await page.goto(BASE+url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900);
  const m = await page.locator('#msg').innerText();
  check(`${nama} — formulir disembunyikan`, await vis(page,'#form'), false);
  check(`${nama} — pesan tepat`, cocok.test(m), true, `("${m.slice(0,46)}...")`);
  check(`${nama} — ada jalan kembali`, await vis(page,'#back'), true);
  await ctx.close();
}

await browser.close();
console.log(fail === 0 ? '\nSemua kasus lolos.' : `\n${fail} kasus GAGAL.`);
process.exit(fail ? 1 : 0);
