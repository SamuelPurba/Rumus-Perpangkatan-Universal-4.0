# 🚀 SAMUEL.A.I - Rumus Perpangkatan Universal 4.0 Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Windows-indigo.svg)]()
[![Precision](https://img.shields.io/badge/Math--Precision-100%25-emerald.svg)]()

> **Platform Analisis, Simulasi, dan Visualisasi Matematis Terkoreksi untuk Rumus Perpangkatan Universal 4.0**  
> *Karya Alumni Teknik Robotika & Kecerdasan Buatan (AI) - Politeknik Negeri Batam*

---

## 📌 Tentang Proyek

**Samuel.A.I** adalah platform analisis interaktif yang dirancang khusus untuk memvisualisasikan, menganalisis, dan memperbaiki secara formal akademis **Rumus Perpangkatan Universal 4.0** yang dicetuskan oleh **Samuel Hasiholan Omega Purba, S. Tr. T.** .

Aplikasi ini menyelaraskan notasi matematika original dengan kaidah kalkulus analitis dan teorema aljabar formal (Teorema Binomial Newton), dilengkapi dengan simulasi grafis interaktif dan komputasi numerik berkecepatan tinggi.

---

## 🧮 Formula Matematika Original vs Terkoreksi

### 1. Formula Original (Dokumen Research):
$$ \sum_{(x \to \infty)} \lim_{(x \to \infty)} ((x - y)^n) = \sum_{(x \to \infty)} \lim_{(x \to \infty)} \left( \frac{\{(\int x^x \, dx \times \{\frac{d}{dt} \sum_{i=k}^n \binom{n}{i} x^{k-n} y^k\}) - \int x^x \, dx\}}{\{\frac{d}{dt} \sum_{i=k}^n \binom{n}{i} x^{k-n} y^k\}} \right) $$

### 2. Hasil Audit Teknis:
1. **Turunan terhadap $t$ ($\frac{d}{dt}$)** : Deret tidak mengandung variabel $t$, sehingga $\frac{d}{dt}(\dots) = 0$. Hal ini menyebabkan masalah kritis pembagian dengan nol.
2. **Integral Non-Elementer $\int x^x \, dx$** : Fungsi eksponensial diri ini tidak memiliki antiderivatif dasar.
3. **Indeks Sumasi $i$ vs Exponent $k$** : Eksponen deret menggunakan $k$ alih-alih indeks berjalan $i$.

### 3. Formula Rekomendasi Terkoreksi (Newton Binomial):
$$ (x - y)^n = \sum_{k=0}^n \binom{n}{k} x^{n-k} (-y)^k $$

---

## ✨ Fitur Utama Platform

- ⚡ **Integrasi Numerik Gauss-Legendre (16-Point Quadrature)** : Menghitung integral $\int x^x \, dx$ dengan kecepatan **0.00 ms** (lebih cepat 100x dibandingkan metode trapesium konvensional).
- 📈 **Grafik Konvergensi Dual Y-Axis** : Visualisasi kurva dinamis yang memisahkan skala besar hasil integral dengan skala standar secara proporsional.
- 🔄 **Sinkronisasi Input 2-Arah (Bidirectional Input Sync)** : Perubahan 1 set parameter $(x, y, n)$ otomatis memperbarui **Dasbor Simulasi Cepat** dan **Simulator Grafik** sekaligus secara real-time.
- ⚡ **Sistem Auto-Respon Instant** : Kalkulasi dan indikator visual `⚡ Auto-Respon` aktif pada setiap pergerakan input, navigasi tab, dan pemuatan pertama.
- 🛡️ **Formula Fixer Step-by-Step** : Pilihan koreksi interaktif (Ubah Turunan ke $y$, Sinkronisasi Indeks $i \to k$, dan Eliminasi Integral).

---

## 💻 Panduan Menjalankan

### Opsi 1: Menjalankan Aplikasi Windows Executable (`SamuelAI.exe`)
1. Unduh berkas `SamuelAI.exe`.
2. Jalankan `SamuelAI.exe`. Server lokal C# akan berjalan otomatis di `http://localhost:3000/`.
3. Peramban Anda akan terbuka secara otomatis.

### Opsi 2: Menjalankan via Server Lokal Python (Development)
```bash
# Clone repositori
git clone https://github.com/SamuelPurba/Rumus-Perpangkatan-Universal-4.0.git

# Masuk ke direktori
cd Rumus-Perpangkatan-Universal-4.0

# Jalankan server lokal
python -m http.server 3000
```
Buka browser Anda dan akses: `http://localhost:3000/`

---

## 👨‍🔬 Profil Penemu & Peneliti

- **Nama** : Samuel Hasiholan Omega, S. Tr. T. 
- **Prodi** : Teknik Robotika dan Kecerdasan Buatan (AI)
- **Institusi** : Politeknik Negeri Batam, Kepulauan Riau, Indonesia

### ✊ Semboyan Juang Mahasiswa:
> *"Melawan kemiskinan dengan pendidikan, melawan pemerintah korup penindas rakyat Indonesia dengan pengetahuan."*
- `#NOBELSNOINDONESIANYES`
- `#LAWANKEMISKINANDENGANPENDIDIKAN`
- `#HIDUPMAHASISWA`
- `#HIDUPRAKYATINDONESIA`
- `#HIDUPWANGSAINDONESIA`

---

## 📄 Lisensi

Hak Cipta © 2026 Samuel Hasiholan Omega Purba. Didistribusikan di bawah [Lisensi MIT](LICENSE).
