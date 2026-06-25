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
    (auth.jwt() ->> 'email') = 'ishakismail89@gmail.com'
  )
  with check (
    (auth.jwt() ->> 'email') = 'ishakismail89@gmail.com'
  );

-- Selesai. Untuk menambah admin lain nanti, ubah kedua policy di atas
-- menjadi: (auth.jwt() ->> 'email') in ('email1@x.com','email2@x.com')


-- =====================================================================
--  PROGRESS HAFALAN IRREGULAR VERBS — satu baris per user.
--  Menyimpan urutan kata (order_keys) + berapa kata yang sudah ditampilkan
--  (shown), supaya saat user buka lagi / dari HP lain, lanjut dari posisi
--  terakhir. Tiap user hanya bisa baca/tulis miliknya sendiri (RLS).
-- =====================================================================

create table if not exists public.irregular_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  order_keys jsonb not null default '[]'::jsonb,   -- daftar v1 sesuai urutan tampil
  shown      int   not null default 5,             -- jumlah kata yang sudah ditampilkan
  updated_at timestamptz not null default now()
);

alter table public.irregular_progress enable row level security;

drop policy if exists "own irregular progress" on public.irregular_progress;
create policy "own irregular progress"
  on public.irregular_progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
