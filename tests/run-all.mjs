// Jalankan seluruh suite berurutan dan ringkas hasilnya.
// Butuh server statis di http://localhost:8000 dari root repo.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

const SUITES = [
  ['test-nav.mjs',      'menu nav mana yang menyala di tiap halaman'],
  ['test-scroll.mjs',   'bottom nav & tombol Menu saat menggulir'],
  ['test-bar.mjs',      'tombol Menu hanya di ujung halaman'],
  ['test-toggle.mjs',   'toggle tema: font, kontras, perilaku gulir'],
  ['test-login.mjs',    'halaman login tanpa sesi'],
  ['test-login2.mjs',   'tata letak kartu login & toggle di dalamnya'],
  ['test-register.mjs', 'pendaftaran: konfirmasi password, guard, email'],
  ['test-existing.mjs', 'email yang sudah terdaftar dikenali'],
  ['test-reset.mjs',    'alur reset password'],
];

function jalankan(file) {
  return new Promise(res => {
    const p = spawn(process.execPath, [join(HERE, file)], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => out += d);
    p.on('close', code => res({ code, out }));
  });
}

// Cek server dulu — tanpa ini semua suite gagal dengan pesan yang membingungkan.
try {
  const r = await fetch('http://localhost:8000/home.html');
  if (!r.ok) throw new Error(String(r.status));
} catch {
  console.error('Server tidak jalan. Dari root repo, jalankan dulu:\n  python3 -m http.server 8000');
  process.exit(2);
}

let gagal = 0;
for (const [file, ket] of SUITES) {
  const { code, out } = await jalankan(file);
  const ringkas = out.trim().split('\n').pop();
  if (code !== 0) gagal++;
  console.log(`${code === 0 ? 'LULUS' : 'GAGAL'}  ${file.padEnd(20)} ${ket}`);
  if (code !== 0) console.log(out.split('\n').filter(l => l.startsWith('FAIL')).map(l => '        ' + l).join('\n'));
  else console.log(`       ${ringkas}`);
}

const { code: kodeAudit, out: outAudit } = await new Promise(res => {
  const p = spawn('python3', [join(HERE, 'audit.py')], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
  p.on('close', code => res({ code, out }));
});
if (kodeAudit !== 0) gagal++;
console.log(`${kodeAudit === 0 ? 'LULUS' : 'GAGAL'}  audit.py             isi contoh benar/salah di 16 halaman tense`);
console.log(`       ${outAudit.trim().split('\n').pop()}`);

console.log(gagal === 0 ? '\nSemua suite lulus.' : `\n${gagal} suite GAGAL.`);
process.exit(gagal ? 1 : 0);
