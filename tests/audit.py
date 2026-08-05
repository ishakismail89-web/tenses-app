import re, glob, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ID_WORDS = r'\b(ia|dia|yang|lalu|disangka|dulu|setiap|bukan|adalah|dengan|untuk|sudah|saat|tetapi|padahal|kalau|karena|hanya|maka|jika|ini|itu|dan|atau|di|ke|dari)\b'

rows = []
for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    html = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<div class="err-sentence (err-bad|err-good)">(.*?)</div>', html, re.S):
        kind, text = m.group(1), re.sub(r'<[^>]+>', '', m.group(2)).strip()
        rows.append((os.path.basename(path), html[:m.start()].count('\n') + 1, kind, text))

fail = 0

# 1. Setiap baris contoh harus berupa kalimat Inggris, bukan keterangan Indonesia.
flagged = [r for r in rows
           if len(re.findall(ID_WORDS, r[3], re.I)) >= 2 and len(r[3].split()) > 3]
print(f'[1] Baris contoh berupa keterangan Indonesia, bukan kalimat Inggris')
print(f'    diperiksa {len(rows)} baris → {len(flagged)} bermasalah')
for f, line, kind, text in flagged:
    fail += 1
    print(f'    FAIL {f}:{line} [{kind}] {text}')
if not flagged:
    print('    PASS')

# 2. Tiap pasangan ✕/✓ harus seimbang dan tiap contoh punya penjelasan.
print(f'\n[2] Struktur pasangan salah/benar')
for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    html = open(path, encoding='utf-8').read()
    bad = len(re.findall(r'err-sentence err-bad', html))
    good = len(re.findall(r'err-sentence err-good', html))
    expl = len(re.findall(r'class="err-explain"', html))
    if bad == 0 and good == 0:
        continue
    name = os.path.basename(path)
    if bad != good or expl != bad + good:
        fail += 1
        print(f'    FAIL {name}: ✕={bad} ✓={good} penjelasan={expl}')
print('    PASS — semua halaman seimbang' if fail == len(flagged) else '')

# 3. Frasa yang dipakai contoh rusak itu tidak boleh tersisa di mana pun.
print(f'\n[3] Sisa contoh lama')
leftovers = []
for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    html = open(path, encoding='utf-8').read()
    for pat in ['disangka itu Past Future', 'kecil dulu, ia']:
        if pat in html:
            leftovers.append((os.path.basename(path), pat))
for f, p in leftovers:
    fail += 1
    print(f'    FAIL {f}: masih memuat "{p}"')
if not leftovers:
    print('    PASS')

print('\nSemua pemeriksaan lolos.' if fail == 0 else f'\n{fail} pemeriksaan GAGAL.')
sys.exit(1 if fail else 0)
