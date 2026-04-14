🌱 AgriLink – Sustainable Agriculture Marketplace
📚 Tugas Proyek Mata Kuliah Proyek Perangkat Lunak

👥 Tim Pengembang
Nama	NIM

- Muhammad Aidil Fitrah	2308107010035

- Muhammad Nazlul Ramadhyan	2308107010036

- Naufal Farrel Syafilan	2308107010058


AgriLink merupakan aplikasi marketplace berbasis web yang dirancang untuk menghubungkan petani secara langsung dengan konsumen dalam satu platform terpadu. Sistem ini berfokus pada peningkatan efisiensi distribusi hasil pertanian, transparansi harga, serta mendukung praktik pertanian berkelanjutan.

Platform ini mengakomodasi dua jenis pengguna utama, yaitu petani sebagai penjual dan masyarakat umum sebagai pembeli. Dengan pendekatan tersebut, AgriLink berupaya memotong rantai distribusi yang panjang sehingga petani memperoleh keuntungan yang lebih adil, sementara konsumen mendapatkan produk yang lebih segar dengan harga yang kompetitif.

Selain itu, sistem ini mengintegrasikan konsep sustainable agriculture, dengan fitur informasi seperti asal produk, jarak distribusi, dan tingkat kesegaran produk untuk meningkatkan transparansi kepada konsumen.

⚙️ Cara Kerja Sistem
👨‍🌾 Sisi Petani

Petani dapat menggunakan sistem untuk:

Membuat dan mengelola toko
Menambahkan produk hasil pertanian
Mengatur harga dan stok barang
Menampilkan informasi produk (lokasi, tanggal panen, metode budidaya)
🛒 Sisi Pembeli

Pengguna umum dapat:

Mencari produk berdasarkan kategori dan lokasi
Melihat informasi detail produk (asal, kesegaran, jarak distribusi)
Melakukan pemesanan produk
Memantau status transaksi
🚀 Fitur Utama
Pencarian Produk Dinamis
Memungkinkan pengguna menemukan produk secara efisien.
Manajemen Toko Petani
Petani dapat mengelola produk secara mandiri.
Traceability Produk
Menampilkan asal produk, tanggal panen, dan metode budidaya.
Food Miles Indicator
Menampilkan estimasi jarak distribusi antara petani dan pembeli.
Freshness Score
Mengukur tingkat kesegaran produk berdasarkan selisih hari panen dan pembelian.
Dashboard Admin
Menampilkan statistik pengguna dan transaksi.
🛠️ Teknologi yang Digunakan
Framework : Next.js
Bahasa Pemrograman : TypeScript
Library UI : React
Styling : CSS / Tailwind
Backend : Next.js API / Node.js
Database : PostgreSQL
📊 Perancangan Sistem
🧩 Entity Relationship Diagram (ERD)
<p align="center"> <img src="https://github.com/user-attachments/assets/0d543ace-8173-480d-9fdb-51e513fb2e0e" width="75%"> </p>
🗃️ Logical Record Structure (LRS)
<p align="center"> <img src="https://github.com/user-attachments/assets/6742949c-9019-4ef4-9512-818ca3e47143" width="75%"> </p>
🔄 Data Flow Diagram (DFD)
<p align="center"> <img src="https://github.com/user-attachments/assets/ea97e7ad-9d04-49ad-aaed-a63bc3c7d549" width="75%"> </p>
🔁 Flowchart Sistem
📌 Flowchart Registrasi
<p align="center"> <img src="https://github.com/user-attachments/assets/1b3847ca-2169-4c48-92da-5102c517ac4a" width="55%"> </p>
📌 Flowchart Petani
<p align="center"> <img src="https://github.com/user-attachments/assets/0e23c52c-cdbe-4db3-8671-b368673516f9" width="55%"> </p>
📌 Flowchart Pembeli
<p align="center"> <img src="https://github.com/user-attachments/assets/72472785-186b-476d-b495-b04159feaa18" width="55%"> </p>
🧪 Status Pengembangan (Minggu ke-7 / UTS)

Pada tahap ini, sistem telah mencapai fase Minimum Viable Product (MVP) dengan capaian sebagai berikut:

Sistem autentikasi pengguna (login & registrasi)
Fitur dasar marketplace (listing produk & detail produk)
Dashboard sederhana untuk petani
Struktur database dan relasi utama telah terimplementasi
Repository GitHub dan struktur proyek telah tersedia
Dokumen URD dan perancangan sistem telah disusun
Diagram sistem (DFD, ERD, LRS) telah tersedia
Flowchart dan algoritma utama telah dirancang

Sistem pada tahap ini sudah dapat dijalankan (running system) sesuai dengan target evaluasi UTS.

🎯 Tujuan Pengembangan
Meningkatkan akses pasar bagi petani lokal
Mengurangi ketergantungan terhadap perantara
Mendorong transparansi informasi produk
Mendukung sistem pertanian berkelanjutan
Mengimplementasikan konsep traceability dan sustainability dalam marketplace

📄 Dokumen Pendukung
📘 User Requirement Document (URD)
https://docs.google.com/document/d/1w1JcOjfCY90XgQjiL-b7IVcGOMHj7iU-jtpBoPvsBLQ/edit?usp=sharing
📗 Dokumen Tambahan / Analisis Sistem
https://docs.google.com/document/d/1dfHx8PzCHnCt9IX82Oufw17IqljvWLxdCAHS6oKTa4c/edit?usp=sharing
📝 Deskripsi Sistem

⚙️ Cara Menjalankan Proyek
# Clone repository
git clone https://github.com/M-Aidil-Fitrah/AgriLink.git

# Masuk ke direktori project
cd AgriLink

# Install dependencies
npm install

# Jalankan aplikasi
npm run dev
