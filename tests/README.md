# Test

Test UI dan konten untuk aplikasi Tenses, memakai Playwright.

## Menjalankan

Butuh dua terminal. Test membuka halaman lewat HTTP, bukan `file://`, karena
Supabase dan `localStorage` butuh origin yang sah.

```bash
# terminal 1 — dari root repo
python3 -m http.server 8000

# terminal 2 — sekali saja di awal
cd tests && npm install && npx playwright install chromium

# lalu tiap kali mau menguji
cd tests && npm test              # semua suite
node test-reset.mjs               # satu suite saja
```

## Sesi Supabase di-stub

Hampir semua halaman dijaga `guard.js`, yang melempar pengunjung tanpa sesi
kembali ke `index.html` — tanpa stub, bottom nav tidak pernah dirender dan
test tidak menguji apa pun.

Karena itu tiap suite mencegat permintaan ke CDN Supabase dan menggantinya
dengan objek tiruan. Ini juga membuat test bisa memeriksa **argumen** yang
dikirim ke Supabase (misalnya `emailRedirectTo`), bukan sekadar tampilan.

Tidak ada test yang menyentuh Supabase sungguhan. Aman dijalankan kapan saja.

## Isi

| Berkas | Menguji |
|---|---|
| `test-nav.mjs` | menu nav mana yang menyala di tiap halaman — halaman rincian tense tidak menyalakan apa pun |
| `test-scroll.mjs` | bottom nav sembunyi saat menggulir turun, muncul saat naik; ambang anti-kedip; zona puncak & dasar |
| `test-bar.mjs` | tombol Menu hanya tampil di ujung halaman, beda perilaku dari bottom nav |
| `test-toggle.mjs` | toggle tema: bobot font 300, **kontras teks diukur** terhadap ambang WCAG AA, perilaku gulir di 5 halaman |
| `test-login.mjs` | halaman login saat tidak ada sesi (tidak dialihkan ke home) |
| `test-login2.mjs` | toggle benar-benar anak dari kartu, ikon SVG bukan emoji, tidak menimpa elemen lain |
| `test-register.mjs` | konfirmasi password, guard 6 karakter tanpa syarat jenis, `emailRedirectTo` sampai ke Supabase |
| `test-existing.mjs` | email yang sudah terdaftar dikenali dari `identities: []` |
| `test-reset.mjs` | alur reset password, termasuk link kedaluwarsa dan link sudah terpakai |
| `audit.py` | tiap baris contoh di 16 halaman tense berupa kalimat Inggris, bukan keterangan Indonesia |

`shot.mjs`, `shot-toggle.mjs`, `shot-err.mjs` bukan test — keduanya menghasilkan
tangkapan layar ke `__screenshots__/` untuk diperiksa mata.

## Dua jebakan yang pernah menipu

**Test bisa salah, bukan cuma kode.** Dua kegagalan pertama yang pernah muncul
ternyata asersi yang keliru: menggulir naik 150px di halaman pendek justru
mendarat di zona puncak, dan `index.html` diam-diam mengalihkan ke `home.html`
saat sesi ada sehingga kasus itu menguji halaman yang salah. Periksa asumsi
test sebelum menyalahkan kode.

**`package.json` sengaja di sini, bukan di root.** Vercel membaca root untuk
menentukan cara membangun; menaruhnya di root bisa mengubah perilaku deploy
situs statis ini.
