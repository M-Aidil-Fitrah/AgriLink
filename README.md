🌱 AgriLink – Sustainable Agriculture Marketplace
Tugas Proyek Mata Kuliah Proyek Perangkat Lunak

Disusun oleh:

Muhammad Aidil Fitrah (2308107010035)
Muhammad Nazlul Ramadhyan (2308107010036)
Naufal Farrel Syafilan (2308107010058)

📝 Deskripsi Sistem

AgriLink adalah aplikasi marketplace berbasis web yang dirancang untuk menghubungkan petani langsung dengan konsumen dalam satu platform terpadu. Sistem ini berfokus pada distribusi hasil pertanian yang lebih efisien, transparan, dan mendukung konsep pertanian berkelanjutan.

Platform ini mengakomodasi dua jenis pengguna utama, yaitu petani sebagai penjual dan masyarakat umum sebagai pembeli. Dengan pendekatan ini, AgriLink berupaya memotong rantai distribusi yang panjang sehingga petani dapat memperoleh keuntungan yang lebih adil, sementara konsumen mendapatkan produk yang lebih segar dengan harga yang kompetitif.

⚙️ Cara Kerja Sistem
👨‍🌾 Sisi Petani

Petani dapat menggunakan sistem untuk:

Membuat dan mengelola toko
Menambahkan produk hasil pertanian
Mengatur harga dan stok barang
Melihat pesanan yang masuk
🛒 Sisi Pembeli

Pengguna umum dapat:

Mencari produk pertanian berdasarkan kategori atau lokasi
Melihat detail produk dan informasi penjual
Melakukan pemesanan produk
Memantau status transaksi
🚀 Fitur Utama
Pencarian Produk Dinamis
Memudahkan pengguna menemukan produk berdasarkan kebutuhan melalui filter yang tersedia.
Manajemen Toko Petani
Petani dapat mengelola toko dan produk secara mandiri dalam satu dashboard.
Sistem Transaksi Sederhana
Proses pembelian dirancang ringkas mulai dari pemilihan produk hingga checkout.
Dashboard Pengguna
Menyediakan informasi aktivitas seperti data produk dan pesanan.
Antarmuka Responsif
Tampilan dirancang agar tetap nyaman digunakan pada berbagai ukuran layar.
🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi web modern:

Framework: Next.js
Bahasa: TypeScript
Library UI: React
Styling: CSS / Tailwind (disesuaikan dengan implementasi)
Database: (sesuaikan dengan yang digunakan pada proyek)
📊 Perancangan Sistem

Sebagai bagian dari proses pengembangan perangkat lunak, sistem ini dilengkapi dengan beberapa diagram pendukung:

ERD (Entity Relationship Diagram)
<img width="6238" height="3941" alt="ERD PPL" src="https://github.com/user-attachments/assets/0d543ace-8173-480d-9fdb-51e513fb2e0e" />
Menjelaskan hubungan antar entitas seperti user, produk, dan transaksi.
LRS (Logical Record Structure)
<img width="3414" height="1756" alt="LRS PPL" src="https://github.com/user-attachments/assets/6742949c-9019-4ef4-9512-818ca3e47143" />
Menggambarkan struktur tabel database beserta relasi kunci.
DFD (Data Flow Diagram)
![DFD](https://github.com/user-attachments/assets/ea97e7ad-9d04-49ad-aaed-a63bc3c7d549)

Menunjukkan alur data dari pengguna hingga ke sistem penyimpanan.
Flowchart
<img width="3274" height="6572" alt="flowchart registrasi" src="https://github.com/user-attachments/assets/1b3847ca-2169-4c48-92da-5102c517ac4a" />
<img width="4299" height="6899" alt="flowchart petani" src="https://github.com/user-attachments/assets/0e23c52c-cdbe-4db3-8671-b368673516f9" />
<img width="1566" height="7976" alt="flowchart pembeli" src="https://github.com/user-attachments/assets/72472785-186b-476d-b495-b04159feaa18" />
Mengilustrasikan alur proses utama dalam sistem, seperti proses pembelian dan pengelolaan produk.
🎯 Tujuan Pengembangan

Pengembangan AgriLink bertujuan untuk:

Meningkatkan akses pasar bagi petani lokal
Mengurangi ketergantungan pada perantara
Mendorong transparansi harga produk
Mendukung ekosistem pertanian berkelanjutan
⚙️ Cara Menjalankan Proyek
# Clone repository
git clone https://github.com/M-Aidil-Fitrah/AgriLink.git

# Masuk ke folder project
cd AgriLink

# Install dependencies
npm install

# Jalankan aplikasi
npm run dev
