# Pansiyon Nöbet Sistemi

Okul pansiyonları için nöbet listesi yönetim sistemi. Erkek ve kız pansiyonları için ayrı ayrı nöbet dağıtımı yapabilir, PDF ve Excel formatında raporlar alabilirsiniz.

## Özellikler

### 1. Stabil Tablo Yapısı
- Sayfa açıldığında tablo iskeleti hemen yüklenir
- Dağıtım yapılmasa bile başlıklar ve sütunlar görünür
- Dağıtım yapıldığında sadece hücreler doldurulur, yapı değişmez

### 2. Akıllı Sütun Yönetimi
- Her pansiyon için ayrı sütun sayısı
- Hafta içi / Cuma / Cumartesi / Pazar için farklı nöbetçi sayıları
- Maksimum nöbetçi sayısına göre otomatik sütun belirleme

### 3. Dağıtım Algoritması
- Soldan sağa sıralı dağıtım (Nöbetçi 1, Nöbetçi 2, ...)
- Adil dağıtım (en az nöbeti olan önce atanır)
- Gerekli sayıdan fazla sütunlar boş kalır

### 4. Manuel Düzenleme
- Hücrelere tıklayarak düzenleme
- İzin verilen nöbetçi sayısı kontrolü
- Aynı gün aynı öğretmen ataması engelleme

### 5. PDF Raporu
- Otomatik sayfa yönü (sütun sayısına göre)
- Türkçe karakter desteği
- Renkli başlıklar ve hafta sonu vurgulama
- Okul adı, dönem ve ay bilgisi

### 6. Excel Raporu
- Türkçe karakter desteği (UTF-8)
- Birleştirilmiş başlık hücreleri
- Yazdırma ayarları

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim için derle
npm run build
```

## Kullanım

1. **Ay Seçimi**: Üst kısımdan yıl ve ay seçin
2. **Ayarlar**: Nöbetçi sayılarını ve okul bilgilerini düzenleyin
3. **Dağıtım**: "Dağıtım Yap" butonuyla otomatik atama yapın
4. **Manuel Düzenleme**: Hücrelere tıklayarak değişiklik yapın
5. **Rapor**: PDF veya Excel formatında indirin

## Ayarlar

### Okul Bilgileri
- Okul Adı
- Aktif Dönem (örn: 2025-2026 Eğitim Yılı)

### Nöbetçi Sayıları (Her Pansiyon İçin Ayrı)
- Hafta İçi: 1-10 arası
- Cuma: 1-10 arası
- Cumartesi: 1-10 arası
- Pazar: 1-10 arası

## Teknik Detaylar

- **Framework**: React 19 + TypeScript
- **State Yönetimi**: Zustand (persist ile)
- **Stil**: Tailwind CSS
- **PDF**: jsPDF + jspdf-autotable
- **Excel**: xlsx (SheetJS)
- **Tarih**: date-fns

## Yapı

```
src/
├── components/
│   ├── DutyRosterTable.tsx    # Ana tablo bileşeni
│   ├── CellEditModal.tsx      # Hücre düzenleme modalı
│   ├── SettingsModal.tsx      # Ayarlar modalı
│   └── MonthSelector.tsx      # Ay seçici
├── store/
│   └── useStore.ts            # Zustand store
├── types/
│   └── index.ts               # TypeScript tipleri
├── utils/
│   ├── pdfExport.ts           # PDF dışa aktarma
│   ├── excelExport.ts         # Excel dışa aktarma
│   └── dateUtils.ts           # Tarih yardımcıları
└── App.tsx                    # Ana uygulama
```

## Lisans

MIT
