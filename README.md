# Pansiyon Nöbet Yönetim Sistemi

MEB'e bağlı okullardaki pansiyon (yurt) nöbet yönetimi için geliştirilmiş kapsamlı bir web uygulaması.

## 🎯 Temel Özellikler

### Nöbet Dağıtım Algoritması
- **Erkek ve Kız pansiyonları TAMAMEN BAĞIMSIZ** çalışır
- Erkek pansiyonuna SADECE erkek öğretmenler atanır
- Kız pansiyonuna SADECE kadın öğretmenler atanır
- Bu kural hafta sonu dahil TÜM günler için geçerlidir
- Adalet skoru hesaplaması ile dengeli dağıtım

### Gün Tiplerine Göre Nöbetçi Sayısı
- Hafta içi (Pazartesi-Perşembe)
- Cuma
- Cumartesi
- Pazar

Her pansiyon için her gün tipi ayrı ayrı ayarlanabilir.

### Raporlama
- **PDF Rapor:** Otomatik sayfa yönü (yatay/dikey), Türkçe karakter desteği
- **Excel Rapor:** Yazdırmaya hazır format
- İstatistik raporları

### Diğer Özellikler
- Öğretmen yönetimi (ekleme, düzenleme, silme)
- Tatil günleri tanımlama
- Öğretmen mazeret yönetimi (rapor, izin, görev)
- Eğitim-öğretim yılı bazında veri saklama
- Manuel nöbet düzenleme
- Nöbet istatistikleri ve adalet analizi

## 🛠️ Teknoloji Yığını

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- jsPDF (PDF oluşturma)
- xlsx (Excel oluşturma)

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm 9+

### Adımlar

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/alimustpdr/Pansiyon_nobet.git
cd Pansiyon_nobet
```

2. **Bağımlılıkları yükleyin:**
```bash
npm run install:all
```

Bu komut tüm bağımlılıkları (root, backend ve frontend) kurar.

3. **Geliştirme modunda çalıştırın:**
```bash
npm run dev
```

Bu komut hem backend (port 3001) hem de frontend (port 5173) sunucularını eşzamanlı olarak başlatır.

4. **Üretim için derleyin:**
```bash
npm run build
```

Backend ve frontend ayrı ayrı derlemek için:
```bash
npm run build:backend
npm run build:frontend
```

5. **Üretim modunda çalıştırın:**
```bash
npm start
```

### Ortam Değişkenleri (Opsiyonel)

Backend için `.env` dosyası oluşturabilirsiniz (`.env.example` dosyasını referans alın):
```bash
cp .env.example .env
```

Backend varsayılan olarak `PORT=3001` kullanır.

## 🚀 Kullanım

### 1. İlk Kurulum
1. Uygulamayı başlatın
2. **Ayarlar** sayfasına gidin
3. Okul adını güncelleyin
4. Varsayılan eğitim-öğretim yılı (2025-2026) otomatik oluşturulur

### 2. Öğretmen Ekleme
1. **Öğretmenler** sayfasına gidin
2. "Yeni Öğretmen" butonuna tıklayın
3. Ad, soyad, cinsiyet ve branş bilgilerini girin
4. ⚠️ **Önemli:** Cinsiyet seçimi sonradan değiştirilemez!

### 3. Nöbetçi Sayılarını Ayarlama
1. **Ayarlar** sayfasına gidin
2. Her pansiyon için gün tiplerine göre nöbetçi sayılarını belirleyin
3. "Ayarları Kaydet" butonuna tıklayın

### 4. Nöbet Dağıtımı
1. **Nöbet Listesi** sayfasına gidin
2. Ay seçin
3. "Nöbet Dağıt" butonuna tıklayın
4. Algoritma otomatik olarak adaletli dağıtım yapar

### 5. Manuel Düzenleme
- Tablodaki herhangi bir hücreye tıklayarak nöbetçi değiştirebilirsiniz
- ⚠️ Sadece o gün için izin verilen slot'lara atama yapılabilir

### 6. Rapor Alma
- PDF veya Excel butonlarına tıklayarak aylık nöbet listesini indirin

## 📋 Proje Yapısı

```
/workspace
├── backend/                 # Backend (API)
│   ├── src/
│   │   ├── database/       # Veritabanı başlatma
│   │   ├── routes/         # API rotaları
│   │   ├── services/       # İş mantığı
│   │   └── types/          # TypeScript tipleri
│   └── data/               # SQLite veritabanı
├── frontend/               # Frontend (React)
│   ├── src/
│   │   ├── components/     # Ortak bileşenler
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── services/       # API servisleri
│   │   └── types/          # TypeScript tipleri
│   └── dist/               # Üretim derlemesi
└── OZELLIK_LISTESI.md      # Detaylı özellik dokümanı
```

## ⚠️ Önemli Kurallar

### Cinsiyet Kuralı (DEĞİŞMEZ)
- ❌ Erkek öğretmen ASLA kız pansiyonuna yazılamaz
- ❌ Kadın öğretmen ASLA erkek pansiyonuna yazılamaz
- Bu kural hafta sonu dahil TÜM günler için geçerlidir

### Yapılmayacaklar (Anti-Pattern)
- ❌ Erkek + Kız nöbetçi sayısını toplama
- ❌ "Toplam nöbetçi tek sayıysa..." mantığı
- ❌ Hafta sonu için cinsiyet kuralını gevşetme
- ❌ İki pansiyon arasında dengeleme

## 🚦 Continuous Integration

Proje GitHub Actions ile otomatik olarak test edilir ve derlenir:
- Her push ve pull request'te otomatik build
- Node.js 18.x ve 20.x versiyonları ile test
- Backend ve frontend TypeScript derleme kontrolü

## 🔧 API Endpoints

### Öğretmenler
- `GET /api/teachers` - Tüm öğretmenler
- `POST /api/teachers` - Yeni öğretmen
- `PUT /api/teachers/:id` - Güncelle
- `DELETE /api/teachers/:id` - Sil

### Nöbetler
- `GET /api/duties/monthly/:yearId/:year/:month` - Aylık liste
- `POST /api/duties/distribute/:yearId/:year/:month` - Dağıtım yap
- `POST /api/duties/assign` - Manuel atama
- `DELETE /api/duties/assign` - Atama sil

### Ayarlar
- `GET /api/settings/dormitory/:yearId` - Pansiyon ayarları
- `POST /api/settings/dormitory/:yearId/bulk` - Toplu güncelle

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

**Geliştirici Notu:** Bu uygulama, MEB pansiyon nöbet sisteminin ihtiyaçlarını karşılamak üzere tasarlanmıştır. Cinsiyet bazlı atama kuralları, Türk eğitim sisteminin gereklilikleri doğrultusunda uygulanmaktadır.
