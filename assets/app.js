/* Koriko Library, versi statis untuk GitHub Pages. Data disimpan di localStorage browser. */
(function () {
'use strict';
var KEY = 'koriko_db_v1', SES = 'koriko_login';

var P = {
  rumah: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  buku: '<path d="M5 3h13a1 1 0 0 1 1 1v15H7a2 2 0 0 0-2 2z"/><path d="M5 21a2 2 0 0 1 2-2h12"/>',
  kartu: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M5.5 16c.8-2.2 5.2-2.2 7 0"/><path d="M14 10h4M14 14h4"/>',
  tukar: '<path d="M17 3l4 4-4 4"/><path d="M21 7H8a4 4 0 0 0-4 4"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h13a4 4 0 0 0 4-4"/>',
  cari: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  kunci: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9"/><path d="M16 7l3 3"/><path d="M14 9l2 2"/>',
  keluar: '<path d="M9 21H5V3h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  tambah: '<path d="M12 5v14M5 12h14"/>',
  ubah: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  hapus: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  berkas: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  kiri: '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
  centang: '<path d="M5 12l5 5 9-10"/>',
  awas: '<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><path d="M12 18h.01"/>'
};
function ikon(n) { return '<svg class="ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>'; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

/* ---------- tanggal ---------- */
var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function pad(n) { return (n < 10 ? '0' : '') + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function today() { return iso(new Date()); }
function parse(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
function diffDays(a, b) { return Math.round((parse(a) - parse(b)) / 864e5); }
function tgl(s) { if (!s) return '-'; var d = parse(s); return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); }
function rp(n) { return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

/* ---------- data ---------- */
function seed() {
  return {
    seq: { anggota: 1, buku: 2, sirkulasi: 0 },
    admin: { username: 'admin', password: '123' },
    anggota: [{ id: 1, nomor: 'AG-0001', nama: 'Afrian Bedari', jk: 'L', alamat: 'Meteseh', hp: '', tgl: '2026-11-13' }],
    buku: [
      { id: 1, kode: 'BK-0001', judul: 'Black House', pengarang: 'Charles Dickens', penerbit: 'Wordsworth Editions Limited', tahun: '', isbn: '', panggil: '', stok: 1, pdf: '' },
      { id: 2, kode: 'BK-0002', judul: 'Herb Garden Guide', pengarang: 'University of Illinois Extension', penerbit: 'University of Illinois Extension', tahun: '', isbn: '', panggil: '635.7', stok: 1, pdf: 'files/1794723884_Herb Garden Guide.pdf' }
    ],
    sirkulasi: []
  };
}
function load() { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} return seed(); }
var db = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { alert('Penyimpanan browser penuh. Hapus data atau PDF yang tidak dipakai.'); return false; } }
function nextId(t) { db.seq[t] = (db.seq[t] || 0) + 1; return db.seq[t]; }
function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

/* ---------- kerangka tampilan ---------- */
var query = new URLSearchParams(location.search);
function kikiHtml() { return '<img class="kiki terbang" src="assets/kiki.svg" alt="" width="240" height="130">'; }
function langit(inner) {
  return '<div class="awan awan-1"></div><div class="awan awan-2"></div><div class="awan awan-3"></div><img class="menara" src="assets/menara.svg" alt=""><div class="kota"></div>' + kikiHtml() + inner;
}
function adminHeader(aktif) {
  var menu = [['dashboard.html', 'dashboard', 'Beranda'], ['bibliografi.html', 'bibliografi', 'Bibliografi'], ['keanggotaan.html', 'keanggotaan', 'Keanggotaan'], ['sirkulasi.html', 'sirkulasi', 'Sirkulasi']];
  var li = menu.map(function (m) { return '<li><a href="' + m[0] + '"' + (m[1] === aktif ? ' aria-current="page"' : '') + '>' + m[2] + '</a></li>'; }).join('');
  return '<header class="langit">' + langit(
    '<div class="langit-isi"><div class="bar"><a href="dashboard.html" class="merek"><img src="assets/pita.svg" alt="">Koriko Library</a>' +
    '<div class="pengguna"><span class="pengguna-nama">Halo, ' + esc(sessionStorage.getItem(SES)) + '</span>' +
    '<a href="ganti_password.html" class="tombol tombol-tepi tombol-kecil">' + ikon('kunci') + 'Ganti password</a>' +
    '<a href="#" id="keluar" class="tombol tombol-tepi tombol-kecil">' + ikon('keluar') + 'Keluar</a></div></div>' +
    '<nav class="rute" aria-label="Menu petugas"><ul>' + li + '<li><a href="opac.html" target="_blank" rel="noopener">Katalog OPAC</a></li></ul></nav></div>') + '</header>';
}
var FOOT = '<footer class="kaki">Koriko Library, sistem otomasi perpustakaan (versi demo statis)</footer>';
function adminPage(aktif, judul, sub, isi) {
  return adminHeader(aktif) + '<main class="halaman"><div class="judul-halaman"><h1>' + judul + '</h1><p>' + sub + '</p></div>' + isi + '</main>' + FOOT;
}
function mount(html) {
  document.body.innerHTML = html;
  var k = document.querySelector('.kiki');
  if (k) { try { if (sessionStorage.getItem('kikiTerbang')) k.classList.remove('terbang'); else sessionStorage.setItem('kikiTerbang', '1'); } catch (e) {} }
  var out = document.getElementById('keluar');
  if (out) out.addEventListener('click', function (e) { e.preventDefault(); sessionStorage.removeItem(SES); location.href = 'index.html'; });
}
function guard() { if (!sessionStorage.getItem(SES)) { location.replace('index.html'); return false; } return true; }
function kosong(span, judul, teks) { return '<tr><td colspan="' + span + '" class="kosong"><span class="tulisan">' + judul + '</span><p>' + teks + '</p></td></tr>'; }
function openPdf(b) {
  if (!b || !b.pdf) return;
  if (b.pdf.indexOf('data:') === 0) { fetch(b.pdf).then(function (r) { return r.blob(); }).then(function (bl) { window.open(URL.createObjectURL(bl), '_blank'); }); }
  else window.open(b.pdf, '_blank');
}
function pdfLink(b, kelas) {
  var isData = b.pdf.indexOf('data:') === 0;
  return '<a href="' + (isData ? '#' : esc(b.pdf)) + '"' + (isData ? ' data-pdf="' + b.id + '"' : ' target="_blank" rel="noopener"') + ' class="' + kelas + '">' + ikon('berkas');
}
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('[data-pdf]');
  if (a) { e.preventDefault(); openPdf(byId(db.buku, +a.getAttribute('data-pdf'))); }
});
function toDataURL(f) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(f); }); }

/* ---------- halaman ---------- */
var H = {};

H.index = function () {
  document.body.className = 'halaman-masuk';
  mount('<div class="adegan">' + langit(
    '<main class="surat kertas"><div class="kertas-kepala"><span class="merek" style="font-size:22px"><img src="assets/pita.svg" alt="" style="width:30px;height:30px">Koriko Library</span></div>' +
    '<div class="kertas-isi"><h1>Masuk Petugas</h1><p class="catatan">Versi demo. Data tersimpan di browser ini saja. Akun awal: admin / 123.</p>' +
    '<div id="galat"></div><form id="f"><div class="isian"><label for="username">Username</label><input type="text" id="username" required autocomplete="username"></div>' +
    '<div class="isian"><label for="password">Password</label><input type="password" id="password" required autocomplete="current-password"></div>' +
    '<button type="submit" class="tombol tombol-lebar">Masuk</button></form>' +
    '<a href="opac.html" class="tautan-opac">' + ikon('cari') + 'Cari buku di OPAC tanpa login</a></div></main>') + '</div>');
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = document.getElementById('username').value, p = document.getElementById('password').value;
    if (u === db.admin.username && p === db.admin.password) { sessionStorage.setItem(SES, u); location.href = 'dashboard.html'; }
    else document.getElementById('galat').innerHTML = '<div class="peringatan" role="alert">' + ikon('awas') + '<span>Ups! Username atau Password salah.</span></div>';
  });
};

H.dashboard = function () {
  if (!guard()) return;
  var stok = db.buku.reduce(function (s, b) { return s + b.stok; }, 0);
  var pinjam = db.sirkulasi.filter(function (s) { return s.status === 'Dipinjam'; }).length;
  function paket(n, t) { return '<div class="paket"><div class="paket-label"><span class="paket-angka">' + n + '</span><span class="paket-nama">' + t + '</span></div></div>'; }
  mount(adminPage('dashboard', 'Selamat datang di sistem otomasi perpustakaan',
    'Halo, ' + esc(sessionStorage.getItem(SES)) + '. Sistem ini dirancang dengan gaya terbuka (<em>open access</em>) yang terinspirasi dari SLiMS, untuk memenuhi tugas kelompok praktikum aplikasi teknologi informasi.',
    '<div class="paket-grid">' + paket(db.buku.length, 'Judul buku') + paket(stok, 'Total eksemplar / stok') + paket(db.anggota.length, 'Total anggota') + paket(pinjam, 'Buku dipinjam') + '</div>' +
    '<section class="kertas"><div class="kertas-kepala"><h2>' + ikon('tukar') + 'Akses cepat pendataan tugas kelompok</h2></div><div class="kertas-isi">' +
    '<p style="margin-top:0;color:var(--tinta-lembut)">Gunakan pintasan berikut untuk mengisi atau memeriksa data yang diminta dalam penilaian tugas kelompok.</p>' +
    '<ul class="papan-daftar"><li><a href="bibliografi.html" class="papan">Tambah data buku</a></li><li><a href="keanggotaan.html" class="papan">Daftarkan anggota</a></li><li><a href="sirkulasi.html" class="papan">Catat pinjam / kembali</a></li><li><a href="opac.html" class="papan" target="_blank" rel="noopener">Uji coba OPAC</a></li></ul>' +
    '<p style="margin:22px 0 0;font-size:14px;color:var(--tinta-lembut)">Data demo tersimpan di browser ini. <a href="#" id="reset">Setel ulang ke data awal</a></p></div></section>'));
  document.getElementById('reset').addEventListener('click', function (e) { e.preventDefault(); if (confirm('Kembalikan semua data ke kondisi awal? Perubahan Anda akan hilang.')) { localStorage.removeItem(KEY); location.reload(); } });
};

H.keanggotaan = function () {
  if (!guard()) return;
  var ed = byId(db.anggota, +query.get('edit') || 0);
  function v(k) { return ed ? esc(ed[k]) : ''; }
  var rows = db.anggota.slice().sort(function (a, b) { return b.id - a.id; }).map(function (r) {
    return '<tr><td><strong>' + esc(r.nomor) + '</strong></td><td>' + esc(r.nama) + '</td><td>' + esc(r.jk) + '</td><td>' + esc(r.alamat) + '</td><td class="angka">' + esc(r.hp) + '</td><td class="angka">' + tgl(r.tgl) + '</td><td class="aksi">' +
      '<a href="keanggotaan.html?edit=' + r.id + '" class="tombol tombol-kecil tombol-ubah">' + ikon('ubah') + 'Edit</a><a href="#" data-hapus="' + r.id + '" class="tombol tombol-kecil tombol-hapus">' + ikon('hapus') + 'Hapus</a></td></tr>';
  }).join('') || kosong(7, 'Belum ada anggota', 'Isi formulir di atas untuk menambah anggota pertama.');
  mount(adminPage('keanggotaan', 'Manajemen keanggotaan', 'Daftarkan anggota baru, ubah data, atau hapus anggota yang sudah tidak aktif.',
    '<section class="kertas"><div class="kertas-kepala"><h2>' + (ed ? ikon('ubah') + 'Edit data anggota' : ikon('kartu') + 'Tambah anggota baru') + '</h2></div><div class="kertas-isi"><form id="f"><div class="grid-form">' +
    '<div class="isian"><label for="nomor">Nomor anggota <span class="wajib">*</span></label><input id="nomor" required placeholder="Contoh: AG-001" value="' + v('nomor') + '"></div>' +
    '<div class="isian"><label for="nama">Nama lengkap <span class="wajib">*</span></label><input id="nama" required placeholder="Nama anggota" value="' + v('nama') + '"></div>' +
    '<div class="isian"><label for="jk">Jenis kelamin <span class="wajib">*</span></label><select id="jk"><option value="L"' + (ed && ed.jk === 'L' ? ' selected' : '') + '>Laki-laki (L)</option><option value="P"' + (ed && ed.jk === 'P' ? ' selected' : '') + '>Perempuan (P)</option></select></div>' +
    '<div class="isian"><label for="hp">No. HP / WhatsApp</label><input id="hp" placeholder="08xxxxxxxxxx" value="' + v('hp') + '"></div></div>' +
    '<div class="isian isian-lebar"><label for="alamat">Alamat</label><textarea id="alamat" rows="2" placeholder="Alamat tempat tinggal">' + v('alamat') + '</textarea></div>' +
    '<div class="aksi-form">' + (ed ? '<button type="submit" class="tombol">Simpan perubahan</button><a href="keanggotaan.html" class="tombol tombol-tepi">Batal</a>' : '<button type="submit" class="tombol">' + ikon('tambah') + 'Tambah anggota</button>') + '</div></form></div></section>' +
    '<div class="tabel-kepala"><h2>Daftar anggota</h2><span class="jumlah">' + db.anggota.length + ' anggota</span></div><div class="tabel-wrap"><table><thead><tr><th>No. anggota</th><th>Nama lengkap</th><th>L/P</th><th>Alamat</th><th>No. HP</th><th>Tgl daftar</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>'));
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = { nomor: nomor.value.trim(), nama: nama.value.trim(), jk: jk.value, alamat: alamat.value.trim(), hp: hp.value.trim() };
    if (db.anggota.some(function (a) { return a.nomor === d.nomor && (!ed || a.id !== ed.id); })) { alert('Nomor anggota sudah dipakai.'); return; }
    if (ed) Object.assign(ed, d); else { d.id = nextId('anggota'); d.tgl = today(); db.anggota.push(d); }
    if (save()) location.href = 'keanggotaan.html';
  });
  document.querySelectorAll('[data-hapus]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Yakin hapus anggota ini?')) return;
      var id = +a.getAttribute('data-hapus');
      db.anggota = db.anggota.filter(function (x) { return x.id !== id; });
      db.sirkulasi = db.sirkulasi.filter(function (s) { return s.idAnggota !== id; });
      if (save()) location.reload();
    });
  });
};

H.bibliografi = function () {
  if (!guard()) return;
  var ed = byId(db.buku, +query.get('edit') || 0);
  function v(k) { return ed ? esc(ed[k]) : ''; }
  var rows = db.buku.slice().sort(function (a, b) { return b.id - a.id; }).map(function (r) {
    return '<tr><td><strong>' + esc(r.kode) + '</strong></td><td>' + esc(r.judul) + '</td><td>' + esc(r.pengarang) + '</td><td class="angka">' + (esc(r.panggil) || '-') + '</td><td class="angka">' + r.stok + '</td><td>' +
      (r.pdf ? pdfLink(r, 'tombol tombol-kecil tombol-pdf') + 'Buka PDF</a>' : '<span style="color:var(--tinta-lembut)">Tidak ada file</span>') + '</td><td class="aksi">' +
      '<a href="bibliografi.html?edit=' + r.id + '" class="tombol tombol-kecil tombol-ubah">' + ikon('ubah') + 'Edit</a><a href="#" data-hapus="' + r.id + '" class="tombol tombol-kecil tombol-hapus">' + ikon('hapus') + 'Hapus</a></td></tr>';
  }).join('') || kosong(7, 'Belum ada koleksi buku', 'Tambahkan buku pertama lewat formulir di atas.');
  function f(id, label, req, ph, key, extra) { return '<div class="isian"><label for="' + id + '">' + label + (req ? ' <span class="wajib">*</span>' : '') + '</label><input id="' + id + '"' + (req ? ' required' : '') + ' placeholder="' + ph + '" value="' + v(key) + '"' + (extra || '') + '></div>'; }
  mount(adminPage('bibliografi', 'Manajemen bibliografi', 'Kelola data koleksi buku dan file PDF yang tampil di katalog OPAC.',
    '<section class="kertas"><div class="kertas-kepala"><h2>' + (ed ? ikon('ubah') + 'Edit data bibliografi dan PDF' : ikon('buku') + 'Tambah koleksi buku dan upload PDF') + '</h2></div><div class="kertas-isi"><form id="f"><div class="grid-form">' +
    f('kode', 'Kode buku', 1, 'Contoh: BK-001', 'kode') + f('judul', 'Judul buku', 1, 'Judul lengkap buku', 'judul') + f('pengarang', 'Pengarang', 1, 'Nama penulis', 'pengarang') + f('penerbit', 'Penerbit', 0, 'Nama penerbit', 'penerbit') +
    f('tahun', 'Tahun terbit', 0, '2026', 'tahun', ' maxlength="4"') + f('isbn', 'ISBN', 0, 'Nomor ISBN', 'isbn') + f('panggil', 'Nomor panggil (DDC)', 0, 'Contoh: 025.4', 'panggil') +
    '<div class="isian"><label for="stok">Jumlah stok <span class="wajib">*</span></label><input type="number" id="stok" required min="0" value="' + (ed ? ed.stok : 1) + '"></div></div>' +
    '<div class="isian isian-lebar"><label for="pdf">Upload / ganti file PDF buku</label><input type="file" id="pdf" accept=".pdf,application/pdf">' +
    (ed && ed.pdf ? '<span class="bantuan bantuan-ok">File tersimpan. Kosongkan jika tidak ingin mengganti file.</span>' : '<span class="bantuan">PDF maksimal 1,5 MB (batas penyimpanan versi demo).</span>') + '</div>' +
    '<div class="aksi-form">' + (ed ? '<button type="submit" class="tombol">Simpan perubahan</button><a href="bibliografi.html" class="tombol tombol-tepi">Batal</a>' : '<button type="submit" class="tombol">' + ikon('tambah') + 'Simpan buku dan upload PDF</button>') + '</div></form></div></section>' +
    '<div class="tabel-kepala"><h2>Daftar koleksi</h2><span class="jumlah">' + db.buku.length + ' judul</span></div><div class="tabel-wrap"><table><thead><tr><th>Kode</th><th>Judul buku</th><th>Pengarang</th><th>No. panggil</th><th>Stok</th><th>File PDF</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>'));
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = { kode: kode.value.trim(), judul: judul.value.trim(), pengarang: pengarang.value.trim(), penerbit: penerbit.value.trim(), tahun: tahun.value.trim(), isbn: isbn.value.trim(), panggil: panggil.value.trim(), stok: Math.max(0, parseInt(stok.value, 10) || 0) };
    if (db.buku.some(function (b) { return b.kode === d.kode && (!ed || b.id !== ed.id); })) { alert('Kode buku sudah dipakai.'); return; }
    var file = pdf.files[0], p = Promise.resolve(null);
    if (file) {
      if (!/\.pdf$/i.test(file.name)) { alert('Hanya file PDF yang diterima.'); return; }
      if (file.size > 1.5 * 1024 * 1024) { alert('Ukuran PDF di versi demo maksimal 1,5 MB.'); return; }
      p = toDataURL(file);
    }
    p.then(function (url) {
      if (ed) { Object.assign(ed, d); if (url) ed.pdf = url; } else { d.id = nextId('buku'); d.pdf = url || ''; db.buku.push(d); }
      if (save()) location.href = 'bibliografi.html';
    });
  });
  document.querySelectorAll('[data-hapus]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Yakin hapus buku ini?')) return;
      var id = +a.getAttribute('data-hapus');
      db.buku = db.buku.filter(function (x) { return x.id !== id; });
      db.sirkulasi = db.sirkulasi.filter(function (s) { return s.idBuku !== id; });
      if (save()) location.reload();
    });
  });
};

H.sirkulasi = function () {
  if (!guard()) return;
  var hari = today(), pesan = '';
  var anggota = db.anggota.slice().sort(function (a, b) { return a.nama.localeCompare(b.nama); });
  var tersedia = db.buku.filter(function (b) { return b.stok > 0; }).sort(function (a, b) { return a.judul.localeCompare(b.judul); });
  var rows = db.sirkulasi.slice().sort(function (a, b) { return b.id - a.id; }).map(function (s) {
    var a = byId(db.anggota, s.idAnggota), b = byId(db.buku, s.idBuku);
    if (!a || !b) return '';
    var telat = s.status === 'Dipinjam' && s.jatuhTempo < hari;
    return '<tr><td><strong>' + esc(a.nama) + '</strong><small>' + esc(a.nomor) + '</small></td><td><strong>' + esc(b.judul) + '</strong><small>' + esc(b.kode) + '</small></td>' +
      '<td class="angka">' + tgl(s.pinjam) + '</td><td class="angka">' + tgl(s.jatuhTempo) + '</td><td class="angka">' + tgl(s.kembali) + '</td><td>' +
      (s.status === 'Dipinjam' ? '<span class="cap ' + (telat ? 'cap-telat' : 'cap-pinjam') + '">' + (telat ? 'Terlambat' : 'Dipinjam') + '</span>' : '<span class="cap cap-kembali">Kembali</span>') +
      '</td><td class="angka"><strong>' + rp(s.denda) + '</strong></td><td class="aksi">' +
      (s.status === 'Dipinjam' ? '<a href="#" data-kembali="' + s.id + '" class="tombol tombol-kecil tombol-kembali">' + ikon('centang') + 'Kembalikan</a>' : '<span style="color:var(--tinta-lembut)">Selesai</span>') + '</td></tr>';
  }).join('') || kosong(8, 'Belum ada transaksi', 'Catat peminjaman pertama lewat formulir di atas.');
  var opsiA = anggota.map(function (a) { return '<option value="' + a.id + '">' + esc(a.nomor + ' - ' + a.nama) + '</option>'; }).join('');
  var opsiB = tersedia.map(function (b) { return '<option value="' + b.id + '">' + esc(b.kode + ' - ' + b.judul + ' (stok: ' + b.stok + ')') + '</option>'; }).join('');
  mount(adminPage('sirkulasi', 'Sirkulasi peminjaman', 'Catat buku yang dipinjam dan proses pengembaliannya. Denda dihitung Rp 1.000 per hari keterlambatan.',
    '<div id="pesan"></div><section class="kertas"><div class="kertas-kepala"><h2>' + ikon('tukar') + 'Catat peminjaman baru</h2></div><div class="kertas-isi"><form id="f"><div class="grid-form">' +
    '<div class="isian"><label for="a">Pilih anggota <span class="wajib">*</span></label><select id="a" required><option value="">-- Pilih peminjam --</option>' + opsiA + '</select></div>' +
    '<div class="isian"><label for="b">Pilih buku (stok tersedia) <span class="wajib">*</span></label><select id="b" required><option value="">-- Pilih koleksi buku --</option>' + opsiB + '</select></div>' +
    '<div class="isian"><label for="tp">Tanggal pinjam <span class="wajib">*</span></label><input type="date" id="tp" required value="' + hari + '"></div>' +
    '<div class="isian"><label for="lp">Lama pinjam (hari) <span class="wajib">*</span></label><input type="number" id="lp" required min="1" max="30" value="7"></div></div>' +
    '<div class="aksi-form"><button type="submit" class="tombol">' + ikon('tambah') + 'Proses peminjaman</button></div></form></div></section>' +
    '<div class="tabel-kepala"><h2>Riwayat sirkulasi</h2><span class="jumlah">' + db.sirkulasi.length + ' transaksi</span></div><div class="tabel-wrap"><table><thead><tr><th>Peminjam</th><th>Buku</th><th>Tgl pinjam</th><th>Jatuh tempo</th><th>Tgl kembali</th><th>Status</th><th>Denda</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>'));
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var b = byId(db.buku, +document.getElementById('b').value), a = byId(db.anggota, +document.getElementById('a').value);
    if (!a || !b || b.stok < 1) { document.getElementById('pesan').innerHTML = '<div class="peringatan" role="alert">' + ikon('awas') + '<span>Maaf, stok buku yang dipilih sedang habis!</span></div>'; return; }
    var t = document.getElementById('tp').value, n = parseInt(document.getElementById('lp').value, 10);
    db.sirkulasi.push({ id: nextId('sirkulasi'), idAnggota: a.id, idBuku: b.id, pinjam: t, jatuhTempo: addDays(t, n), kembali: null, status: 'Dipinjam', denda: 0 });
    b.stok -= 1;
    if (save()) location.href = 'sirkulasi.html';
  });
  document.querySelectorAll('[data-kembali]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Proses pengembalian buku ini?')) return;
      var s = byId(db.sirkulasi, +a.getAttribute('data-kembali')); if (!s || s.status !== 'Dipinjam') return;
      var telat = diffDays(hari, s.jatuhTempo);
      s.kembali = hari; s.status = 'Kembali'; s.denda = telat > 0 ? telat * 1000 : 0;
      var b = byId(db.buku, s.idBuku); if (b) b.stok += 1;
      if (save()) location.reload();
    });
  });
};

H.ganti_password = function () {
  if (!guard()) return;
  mount(adminPage('', 'Ganti password', 'Password baru berlaku untuk login di browser ini.',
    '<section class="kertas" style="max-width:460px"><div class="kertas-kepala"><h2>' + ikon('kunci') + 'Ubah password</h2></div><div class="kertas-isi"><div id="pesan"></div><form id="f">' +
    '<div class="isian"><label for="lama">Password lama</label><input type="password" id="lama" required></div>' +
    '<div class="isian isian-lebar"><label for="baru">Password baru</label><input type="password" id="baru" required minlength="4"></div>' +
    '<div class="isian isian-lebar"><label for="ulang">Ulangi password baru</label><input type="password" id="ulang" required></div>' +
    '<div class="aksi-form"><button type="submit" class="tombol">Simpan password</button></div></form></div></section>'));
  document.getElementById('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = document.getElementById('pesan');
    if (lama.value !== db.admin.password) { m.innerHTML = '<div class="peringatan" role="alert">' + ikon('awas') + '<span>Password lama salah.</span></div>'; return; }
    if (baru.value !== ulang.value) { m.innerHTML = '<div class="peringatan" role="alert">' + ikon('awas') + '<span>Konfirmasi password tidak sama.</span></div>'; return; }
    db.admin.password = baru.value;
    if (save()) m.innerHTML = '<div class="peringatan" style="color:var(--rumput);background:var(--rumput-muda);border-color:var(--rumput)">' + ikon('centang') + '<span>Password diperbarui.</span></div>';
  });
};

H.opac = function () {
  var kw = (query.get('keyword') || '').trim(), kl = kw.toLowerCase();
  var hasil = db.buku.filter(function (b) { return !kl || [b.judul, b.pengarang, b.penerbit].some(function (x) { return String(x).toLowerCase().indexOf(kl) > -1; }); }).sort(function (a, b) { return b.id - a.id; });
  var warna = ['var(--pita)', 'var(--laut)', 'var(--rumput)', 'var(--kuning)', 'var(--kraft-tua)'];
  var kartu = hasil.map(function (r) {
    return '<article class="buku"><div class="punggung" style="--punggung:' + warna[r.id % 5] + '"></div><div class="buku-isi"><span class="tag-panggil">' + (r.panggil ? esc(r.panggil) : 'tanpa nomor panggil') + '</span><h3>' + esc(r.judul) + '</h3><dl>' +
      '<dt>Pengarang</dt><dd>' + esc(r.pengarang) + '</dd><dt>Penerbit</dt><dd>' + esc(r.penerbit) + (r.tahun ? ' (' + esc(r.tahun) + ')' : '') + '</dd><dt>Kode buku</dt><dd>' + esc(r.kode) + '</dd>' +
      '<dt>Stok fisik</dt><dd' + (r.stok < 1 ? ' class="stok-habis">Habis dipinjam' : '>' + r.stok + ' eksemplar') + '</dd></dl><div class="buku-aksi">' +
      (r.pdf ? pdfLink(r, 'tombol tombol-pdf tombol-kecil') + 'Baca / download PDF</a>' : '<span class="tanpa-pdf">' + ikon('berkas') + 'File PDF belum tersedia</span>') + '</div></div></article>';
  }).join('');
  mount('<header class="langit">' + langit(
    '<div class="langit-isi"><div class="bar"><a href="opac.html" class="merek"><img src="assets/pita.svg" alt="">Koriko Library</a><a href="index.html" class="tombol tombol-tepi tombol-kecil">' + ikon('kunci') + 'Login admin</a></div></div>' +
    '<div class="hero"><h1>Cari katalog buku dan koleksi digital</h1><p>Ketik judul, pengarang, atau penerbit.</p><form method="GET" class="cari" role="search">' + ikon('cari') +
    '<label for="keyword" class="sr-only">Kata kunci</label><input type="text" id="keyword" name="keyword" placeholder="Contoh: Herb Garden" value="' + esc(kw) + '"><button type="submit" class="tombol">Cari buku</button></form></div>') + '</header>' +
    '<main class="halaman"><div class="hasil-kepala"><h2>Daftar koleksi perpustakaan</h2><p>' + (kw ? hasil.length + ' hasil untuk &ldquo;' + esc(kw) + '&rdquo;' : hasil.length + ' judul') + '</p></div>' +
    (hasil.length ? '<div class="rak">' + kartu + '</div>' : '<div class="kertas kosong"><span class="tulisan">Tidak ada yang cocok</span><p>Koleksi buku tidak ditemukan. Coba kata kunci yang lebih pendek.</p></div>') + '</main>' + FOOT);
};

var halaman = document.body.getAttribute('data-halaman');
if (H[halaman]) H[halaman]();
})();
