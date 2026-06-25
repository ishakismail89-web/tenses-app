-- =====================================================================
--  SETUP TABEL VIDEO TENSE — jalankan di Supabase Dashboard:
--  Project -> SQL Editor -> New query -> tempel semua -> Run.
--
--  PENTING: ganti 'GANTI_DENGAN_EMAIL_ADMIN@email.com' (2 tempat di bawah)
--  dengan email login admin kamu — HARUS sama dengan ADMIN_EMAIL di config.js.
-- =====================================================================

-- 1) Tabel: satu video per tense (tense_id = '01' .. '16')
create table if not exists public.tense_videos (
  tense_id    text primary key,
  youtube_url text not null,
  updated_at  timestamptz not null default now()
);

-- 2) Aktifkan Row-Level Security
alter table public.tense_videos enable row level security;

-- 3) SEMUA user yang sudah login boleh MEMBACA link video
drop policy if exists "read videos (authenticated)" on public.tense_videos;
create policy "read videos (authenticated)"
  on public.tense_videos
  for select
  to authenticated
  using (true);

-- 4) HANYA admin (berdasarkan email di token) yang boleh menulis
--    (insert / update / delete). Ganti email di bawah.
drop policy if exists "admin can write videos" on public.tense_videos;
create policy "admin can write videos"
  on public.tense_videos
  for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') = 'GANTI_DENGAN_EMAIL_ADMIN@email.com'
  )
  with check (
    (auth.jwt() ->> 'email') = 'GANTI_DENGAN_EMAIL_ADMIN@email.com'
  );

-- Selesai. Untuk menambah admin lain nanti, ubah kedua policy di atas
-- menjadi: (auth.jwt() ->> 'email') in ('email1@x.com','email2@x.com')
