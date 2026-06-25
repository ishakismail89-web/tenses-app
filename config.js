// =====================================================================
//  ISI DUA NILAI DI BAWAH INI dengan data project Supabase kamu.
//  Caranya: Supabase Dashboard -> Project Settings -> API
//    - Project URL          -> tempel ke SUPABASE_URL
//    - Project API keys: anon public  -> tempel ke SUPABASE_ANON_KEY
//
//  Catatan: kunci "anon public" memang AMAN ditaruh di sini (publik by design).
//  JANGAN pakai kunci "service_role" — itu rahasia.
// =====================================================================

const SUPABASE_URL = "https://drroecmqdduirmvwfxue.supabase.co";       // contoh: https://abcdxyz.supabase.co
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycm9lY21xZGR1aXJtdndmeHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDUxODQsImV4cCI6MjA5Nzg4MTE4NH0.C7anhjnhGbBscu5RmwwIY3I-YL1pPUYFtzh1cF0m2JM";   // contoh: eyJhbGciOiJIUzI1NiIs...

// =====================================================================
//  EMAIL ADMIN — akun yang boleh menambah/mengedit link video tense.
//  Isi dengan email login kamu (huruf kecil). HARUS sama persis dengan
//  email yang dipakai di policy SQL Supabase (lihat supabase-setup.sql).
//  Catatan: baris ini hanya untuk menampilkan menu Admin. Keamanan
//  sebenarnya dijaga oleh Row-Level Security di database.
// =====================================================================
const ADMIN_EMAIL = "ishakismail89@gmail.com";
