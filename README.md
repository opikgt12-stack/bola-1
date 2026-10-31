# Head Arena 4.46.0 — Zeabur

Paket ini menyesuaikan deployment backend 4.46.0 ke Zeabur. Mesin fisika, protokol, dan keamanan pertandingan tidak berubah. Website PHP tetap menggunakan paket head-arena-4.46.0-render-web-root.zip yang sudah diberikan; kata “render” pada nama ZIP tidak mengikat server ke Render.

## A. Repository GitHub

Ekstrak ZIP ini, upload ISINYA ke root repository backend yang sudah dibuat, lalu commit. Timpa package.json, package-lock.json, README.md; tambahkan zbpack.json. render.yaml lama boleh dihapus; tidak digunakan oleh Zeabur. Jangan upload ZIP sebagai satu file. package.json dan server.cjs harus langsung terlihat di root; sertakan folder game/. Jangan upload node_modules atau secret.

zbpack.json berisi build `npm ci --omit=dev` dan start `npm start`. package.json meminta Node 22.x. Server membaca PORT dari Zeabur dan mengikat 0.0.0.0; jangan memaksakan port publik sendiri.

## B. Deploy Zeabur

1. Login https://zeabur.com dengan GitHub.
2. Buat project dan pilih opsi Free/shared cluster yang tersedia. Pilih lokasi terdekat, misalnya Singapore jika tersedia untuk akun/paketmu. Jangan membeli server atau mengaktifkan paket berbayar untuk mengikuti panduan ini.
3. Akun pertama kali dapat perlu verifikasi. Dokumentasi menyebut pilihan nomor telepon, deposit, atau kartu. Jika tersedia, gunakan verifikasi telepon untuk tanpa kartu; jika hanya pembayaran yang ditawarkan, berhenti dan periksa opsi akun, jangan membayar otomatis.
4. Add Service → GitHub, izinkan akses ke repository backend, pilih repository/branch yang benar. Jika muncul root directory, kosongkan karena package.json ada di root.
5. Zeabur mendeteksi Node.js. Tambahkan Variables pada service (kadang di Configuration):

   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=256
   MAX_ROOMS=2
   ALLOWED_ORIGINS=https://puasa.zya.me
   ROOM_AUTH_SECRET=<secret acak privat minimal 32 karakter>

   Placeholder secret harus diganti, jangan menyalin teks placeholder secara literal. Buat dengan password generator atau openssl rand -hex 32. Simpan sendiri, tidak di GitHub/chat. PORT disediakan Zeabur. Node 22 ditentukan package.json.
6. Deploy/redeploy setelah variables tersimpan. Jika deploy otomatis sempat gagal sebelum secret diisi, isi variables lalu redeploy. Tidak perlu menambah database, Redis, atau service lain.
7. Tunggu status Running. Log aplikasi: `Head Arena 4.46.0 server ready`.
8. Pada Domains/Networking/Public Networking, buat domain .zeabur.app yang tersedia. Jika diminta memilih port, gunakan web/port service yang terdeteksi. HTTPS disediakan platform.
9. Buka https://DOMAIN-KAMU.zeabur.app/healthz. Respons yang diharapkan:
   {"ok":true,"version":"4.46.0","protocol":446}

Alamat utama / memang mengembalikan Not found; ini backend, bukan halaman game. Jangan menganggap itu kegagalan bila /healthz berhasil.

## C. Hubungkan website PHP

Backup website/database. Jika belum, upload isi ZIP website 4.46.0 ke hosting PHP tempat index.php berada. Pertahankan app/config.php, database, upload pengguna, dan semua konfigurasi privat lama.

Salin app/game-server-private446.example.php menjadi app/game-server-private446.php, kemudian isi:

```php
<?php
if (!defined('ARENA_APP')) { http_response_code(404); exit; }
return [
    'enabled' => true,
    'url' => 'https://DOMAIN-KAMU.zeabur.app',
    'secret' => 'ISI_SECRET_YANG_SAMA_PERSIS_DENGAN_ZEABUR',
];
```

Ganti URL dan secret dengan nilai asli. URL adalah origin HTTPS saja, tanpa /game atau /healthz. Walau file contoh lama memakai contoh onrender.com, ganti dengan domain Zeabur: kode mendukung keduanya. Jangan taruh file PHP privat di repository backend.

CSP website otomatis mengizinkan origin server yang dikonfigurasi. ALLOWED_ORIGINS adalah alamat WEBSITE PHP, bukan alamat backend. Jika ada beberapa hostname website, pisahkan dengan koma tanpa wildcard.

Reload kedua perangkat sampai versi 4.46.0, keluar dari room lama lalu buat room baru. Indikator server memakai label Game; kedua browser menjadi klien prediksi server pusat. Chat tetap menggunakan provider chat sebelumnya.

## D. Pemeriksaan masalah

- Build gagal: pastikan package-lock.json dan folder game ikut ter-upload; lihat error pertama di Build Logs. Jangan ganti versi dependency sembarangan.
- Log meminta secret/origin: isi ROOM_AUTH_SECRET minimal 32 karakter dan ALLOWED_ORIGINS, lalu redeploy.
- /healthz berhasil, game tidak terhubung: periksa URL PHP, kesamaan secret, origin website, serta versi kedua browser. Tiket punya masa berlaku singkat; waktu server harus benar.
- Service Running tetapi domain gagal: periksa pengaitan domain ke port web service dan tunggu penerbitan HTTPS.
- Room penuh: batas awal dua room, room kosong dibersihkan sekitar 45 detik kemudian.
- Putus koneksi: pertandingan ditahan saat pemain hilang atau berhenti mengirim input; otomatis mencoba tersambung lagi. Jika server restart/deploy, room RAM hilang: buat room baru.
- Kembali ke mode lama: enabled => false di konfigurasi PHP, keluar room dan reload kedua perangkat. Provider WebRTC/relay lama harus masih dikonfigurasi.

## Batasan

Paket ini untuk uji coba, belum dideploy atau diuji di akun Zeabur pengguna. Tes mesin/backend lokal bukan jaminan kapasitas/latensi di cloud atau HP fisik. Server pusat bukan janji 0 ms. WSS/TCP tetap dipengaruhi jarak, jitter, packet loss, dan CPU.

Free Plan menurut dokumentasi tidak membutuhkan kartu, tetapi verifikasi akun dapat diminta dan pilihan aktual mengikuti akun/wilayah. Service free dapat auto-sleep saat idle dan tidak memiliki SLA. Cek kuota/harga yang tampil sebelum konfirmasi; jangan memilih upgrade berbayar untuk uji ini.

Gunakan satu instance/replica saja. Room dan fisika berada di RAM satu proses, bukan database bersama; restart/deploy menghapus pertandingan. MAX_ROOMS=2 adalah batas awal konservatif, bukan jaminan performa. Hasil final ditandatangani backend dan disimpan melalui PHP. Website dan backend harus menggunakan mesin fisika versi yang cocok. Grafis browser tidak dikurangi.

## Uji lokal

Node 22+, npm ci, npm test. Jalankan npm start hanya setelah env origin/secret diisi. Jangan gunakan secret pengujian untuk produksi. File game-manifest.json mencatat SHA256 sumber fisika yang dibundel.

## Referensi resmi

https://zeabur.com/docs/en-US/guides/nodejs
https://zeabur.com/docs/en-US/get-started/quick-start
https://zeabur.com/docs/en-US/deploy/config/environment-variables
https://zeabur.com/docs/en-US/pricing/free-plan
