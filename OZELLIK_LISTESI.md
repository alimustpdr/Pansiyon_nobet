# PANSİYON NÖBET YÖNETİM SİSTEMİ - DETAYLI ÖZELLİK LİSTESİ

## 📋 GENEL BAKIŞ

Bu uygulama, MEB'e bağlı okullardaki pansiyon (yurt) nöbet yönetimini otomatikleştirmek için tasarlanmıştır.

---

## 🏗️ TEMEL MİMARİ PRENSİPLER

### 1. İKİ BAĞIMSIZ PANSİYON SİSTEMİ (KRİTİK)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PANSİYON NÖBET SİSTEMİ                       │
├────────────────────────────┬────────────────────────────────────┤
│     ERKEK PANSİYONU        │        KIZ PANSİYONU               │
│  ───────────────────────   │   ───────────────────────          │
│  • Sadece ERKEK öğretmen   │   • Sadece KADIN öğretmen          │
│  • Kendi nöbetçi sayıları  │   • Kendi nöbetçi sayıları         │
│  • Kendi ayarları          │   • Kendi ayarları                 │
│  • BAĞIMSIZ hesaplama      │   • BAĞIMSIZ hesaplama             │
└────────────────────────────┴────────────────────────────────────┘
```

**DEĞİŞMEZ KURALLAR:**
- ❌ Erkek öğretmen ASLA kız pansiyonuna yazılamaz
- ❌ Kadın öğretmen ASLA erkek pansiyonuna yazılamaz
- ❌ İki pansiyon arasında nöbetçi sayısı dengelemesi YAPILMAZ
- ❌ Toplam nöbetçi hesabı YAPILMAZ
- ❌ "Tek sayıysa..." gibi mantık YOKTUR

---

## 📊 VERİ MODELLERİ

### 1. Eğitim-Öğretim Yılı (AcademicYear)
```
- ID
- Başlangıç Tarihi (örn: 2025-09-01)
- Bitiş Tarihi (örn: 2026-06-30)
- Yıl Adı (örn: "2025-2026")
- Aktif mi?
```

### 2. Öğretmen (Teacher)
```
- ID
- TC Kimlik No
- Ad Soyad
- Cinsiyet (ERKEK / KADIN) [DEĞİŞTİRİLEMEZ]
- Branş
- Telefon
- Email
- Nöbet Tutabilir mi? (aktif/pasif)
- Oluşturulma Tarihi
```

### 3. Pansiyon Ayarları (DormitorySettings)
```
- Eğitim-Öğretim Yılı ID
- Pansiyon Tipi (ERKEK / KIZ)
- Gün Tipi (HAFTA_ICI / CUMA / CUMARTESI / PAZAR)
- Nöbetçi Sayısı
```

### 4. Tatil/Özel Günler (Holiday)
```
- ID
- Tarih
- Açıklama
- Nöbet Var mı? (bazı tatillerde nöbet olabilir)
```

### 5. Öğretmen Mazeret (TeacherExcuse)
```
- ID
- Öğretmen ID
- Başlangıç Tarihi
- Bitiş Tarihi
- Mazeret Tipi (rapor, izin, görev, vb.)
- Açıklama
```

### 6. Nöbet Kaydı (DutyRecord)
```
- ID
- Eğitim-Öğretim Yılı ID
- Öğretmen ID
- Tarih
- Gün Tipi
- Pansiyon Tipi (ERKEK / KIZ)
- Otomatik mi Atandı?
- Manuel Değişiklik Yapıldı mı?
- Oluşturulma Tarihi
```

---

## ⚙️ PANSİYON AYARLARI

### Gün Tiplerine Göre Nöbetçi Sayısı Ayarları

Her pansiyon için AYRI AYRI ayarlanır:

| Gün Tipi | Erkek Pansiyonu | Kız Pansiyonu |
|----------|-----------------|---------------|
| Hafta İçi (Pzt-Per) | 3 | 2 |
| Cuma | 4 | 3 |
| Cumartesi | 1 | 2 |
| Pazar | 2 | 1 |

**ÖNEMLİ:** Bu değerler örnek olup, admin tarafından değiştirilebilir olmalıdır.

---

## 🔄 NÖBET DAĞITIM ALGORİTMASI

### ANA AKIŞ

```
Her Ay İçin:
│
├── Her Gün İçin:
│   │
│   ├── Gün tipini belirle (Hafta içi/Cuma/Cumartesi/Pazar)
│   │
│   ├── Tatil/özel gün kontrolü yap
│   │
│   ├── ERKEK PANSİYONU İÇİN:
│   │   ├── Ayarlardan erkek pansiyonu nöbetçi sayısını al
│   │   ├── Müsait ERKEK öğretmenleri listele
│   │   ├── Adalet skoruna göre sırala
│   │   └── Gerekli sayıda ERKEK öğretmen ata
│   │
│   └── KIZ PANSİYONU İÇİN:
│       ├── Ayarlardan kız pansiyonu nöbetçi sayısını al
│       ├── Müsait KADIN öğretmenleri listele
│       ├── Adalet skoruna göre sırala
│       └── Gerekli sayıda KADIN öğretmen ata
```

### ADALET SKORU HESAPLAMA

```javascript
adaletSkoru = 
  (toplamNöbetSayısı * 100) +     // Çok nöbet tutanı geriye at
  (sonNöbettenGeçenGün * -10) +   // Uzun süre tutmayanı öne al
  (hafta_sonu_nöbet_sayısı * 50) + // Hafta sonu nöbetini dengele
  (cuma_nöbet_sayısı * 30)         // Cuma nöbetini dengele
```

**Düşük skor = Öncelikli atama**

### MÜSAİTLİK KONTROLÜ

Bir öğretmen şu durumlarda müsait DEĞİLDİR:
- O gün için mazereti varsa
- Önceki gün nöbet tuttuysa (opsiyonel: art arda nöbet engeli)
- Aynı hafta içinde X'den fazla nöbet tuttuysa
- Pasif durumda ise

---

## 📱 KULLANICI ARAYÜZÜ ÖZELLİKLERİ

### 1. Dashboard (Ana Sayfa)
- Bu ayki nöbet özeti
- Bugünkü nöbetçiler (erkek/kız ayrı)
- Yaklaşan nöbetler
- Hızlı istatistikler

### 2. Öğretmen Yönetimi
- Öğretmen listesi (filtrelenebilir: cinsiyet, branş, durum)
- Öğretmen ekleme/düzenleme
- Toplu öğretmen içe aktarma (Excel)
- Öğretmen detay sayfası (nöbet geçmişi)

### 3. Nöbet Takvimi
- Aylık takvim görünümü
- Günlük detay görünümü
- Sürükle-bırak ile manuel düzenleme
- Renk kodları (erkek: mavi, kız: pembe)

### 4. Ayarlar
- Pansiyon ayarları (nöbetçi sayıları)
- Tatil tanımlama
- Mazeret türleri
- Algoritma parametreleri

### 5. Raporlama
- Aylık nöbet listesi (PDF/Excel)
- Öğretmen bazlı rapor
- Adalet analizi raporu
- Yıllık özet raporu

---

## 📄 RAPOR FORMATLARI

### Aylık Nöbet Listesi (PDF)

```
┌────────────────────────────────────────────────────────────────────────┐
│           [OKUL ADI] PANSİYON NÖBET ÇİZELGESİ                         │
│                     OCAK 2026                                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ERKEK PANSİYONU                                                       │
│  ┌──────┬────────────────────────────────────────────────────────┐    │
│  │ Gün  │  1  │  2  │  3  │  4  │  5  │ ... │ 30 │ 31 │          │    │
│  ├──────┼─────┼─────┼─────┼─────┼─────┼─────┼────┼────┤          │    │
│  │ Per  │ Cum │ Cmt │ Paz │ Pzt │ Sal │ ... │ Cum│ Cmt│          │    │
│  ├──────┼─────┼─────┼─────┼─────┼─────┼─────┼────┼────┤          │    │
│  │ Nöb.1│ Ali │ Can │ ... │     │     │     │    │    │          │    │
│  │ Nöb.2│Veli │     │     │     │     │     │    │    │          │    │
│  │ Nöb.3│Ayşe │     │     │     │     │     │    │    │          │    │
│  └──────┴─────┴─────┴─────┴─────┴─────┴─────┴────┴────┘          │    │
│                                                                        │
│  KIZ PANSİYONU                                                         │
│  ┌──────┬────────────────────────────────────────────────────────┐    │
│  │ Gün  │  1  │  2  │  3  │  4  │  5  │ ... │ 30 │ 31 │          │    │
│  ├──────┼─────┼─────┼─────┼─────┼─────┼─────┼────┼────┤          │    │
│  │ ...  │     │     │     │     │     │     │    │    │          │    │
│  └──────┴─────┴─────┴─────┴─────┴─────┴─────┴────┴────┘          │    │
│                                                                        │
│  Onaylayan: _______________     Tarih: _______________                 │
└────────────────────────────────────────────────────────────────────────┘
```

**Sayfa Düzeni:**
- Yatay (Landscape) format
- 1 veya 2 sayfa seçeneği
- A4 boyutu

---

## 🛡️ MANTIKSAL HATA ÖNLEYİCİLER

### 1. Cinsiyet Doğrulama Katmanı
```javascript
// Her atama öncesi kontrol
if (pansiyon === 'ERKEK' && öğretmen.cinsiyet !== 'ERKEK') {
  throw new Error('Erkek pansiyonuna sadece erkek öğretmen atanabilir');
}
if (pansiyon === 'KIZ' && öğretmen.cinsiyet !== 'KADIN') {
  throw new Error('Kız pansiyonuna sadece kadın öğretmen atanabilir');
}
```

### 2. Yetersiz Öğretmen Uyarısı
- Eğer müsait öğretmen sayısı, gereken nöbetçi sayısından azsa:
  - Kullanıcıya uyarı göster
  - Mümkün olduğunca ata, eksikleri işaretle
  - Manuel müdahale iste

### 3. Çakışma Kontrolü
- Aynı öğretmenin aynı güne iki kez atanması engellenir
- Art arda nöbet kontrolü (opsiyonel ayar)

### 4. Veri Bütünlüğü
- Öğretmen silinirken nöbet kayıtları kontrol edilir
- Geçmiş nöbetler değiştirilemez (sadece görüntülenir)
- Tüm değişiklikler loglanır

---

## 🎯 KULLANICI DENEYİMİ İYİLEŞTİRMELERİ

### 1. Akıllı Öneri Sistemi
- Nöbet ataması yapılırken en uygun öğretmenleri öner
- "Bu öğretmen son 3 gündür nöbet tuttu" uyarısı
- Adalet dengesizliği uyarısı

### 2. Hızlı Eylemler
- Tek tıkla aylık nöbet oluştur
- Sürükle-bırak ile nöbet değiştir
- Toplu mazeret girişi

### 3. Görsel Geri Bildirim
- Renk kodlu takvim
- İlerleme göstergeleri
- Anlık istatistikler

### 4. Bildirim Sistemi
- Nöbet hatırlatmaları (opsiyonel)
- Mazeret bitiş uyarıları
- Sistem uyarıları

---

## 📊 İSTATİSTİK VE ANALİZ

### Öğretmen Bazlı
- Toplam nöbet sayısı
- Hafta içi / Hafta sonu dağılımı
- Cuma nöbet sayısı
- Son nöbet tarihi
- Adalet skoru

### Genel İstatistikler
- Aylık nöbet özeti
- Cinsiyet bazlı dağılım
- Gün tipi dağılımı
- Adalet analizi grafiği

---

## 🔧 TEKNİK ÖZELLİKLER

### Teknoloji Yığını
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Veritabanı:** SQLite (yerel kullanım için ideal)
- **Raporlama:** jsPDF + xlsx

### Güvenlik
- Kullanıcı girişi (opsiyonel)
- Veri yedekleme
- Şifreli depolama

### Performans
- Lazy loading
- Önbellekleme
- Optimize edilmiş sorgular

---

## ✅ TEST SENARYOLARI

### Senaryo 1: Temel Dağıtım
```
Girdi:
- Erkek Pansiyonu Hafta İçi: 3 nöbetçi
- Kız Pansiyonu Hafta İçi: 2 nöbetçi
- 5 erkek öğretmen, 4 kadın öğretmen

Beklenen:
- Pazartesi: 3 erkek (erkek pansiyonu) + 2 kadın (kız pansiyonu)
- Hiçbir erkek kız pansiyonuna yazılmaz
- Hiçbir kadın erkek pansiyonuna yazılmaz
```

### Senaryo 2: Hafta Sonu
```
Girdi:
- Erkek Pansiyonu Cumartesi: 1 nöbetçi
- Kız Pansiyonu Cumartesi: 2 nöbetçi

Beklenen:
- Cumartesi: 1 erkek + 2 kadın
- Cinsiyet kuralı BOZULMAZ
```

### Senaryo 3: Yetersiz Öğretmen
```
Girdi:
- Kız Pansiyonu: 3 nöbetçi gerekli
- Müsait kadın öğretmen: 2

Beklenen:
- 2 kadın öğretmen atanır
- Eksik 1 kişi için uyarı gösterilir
- ASLA erkek öğretmen atanmaz
```

---

## 📋 ÖNCELİK SIRASI

### Faz 1 (MVP)
1. ✅ Öğretmen yönetimi
2. ✅ Temel nöbet algoritması
3. ✅ Aylık takvim görünümü
4. ✅ PDF rapor oluşturma

### Faz 2
1. Excel rapor
2. Mazeret yönetimi
3. Tatil tanımlama
4. Manuel düzenleme

### Faz 3
1. İstatistik ve analiz
2. Yedekleme/Geri yükleme
3. Kullanıcı yönetimi
4. Bildirimler

---

## 🚫 YAPILMAYACAKLAR (ANTİ-PATTERN)

1. ❌ Erkek + Kız nöbetçi sayısını toplama
2. ❌ "Toplam nöbetçi tek sayıysa..." mantığı
3. ❌ Hafta sonu için cinsiyet kuralını gevşetme
4. ❌ İki pansiyon arasında dengeleme
5. ❌ Otomatik cinsiyet değiştirme
6. ❌ Karışık pansiyon ataması

---

*Bu doküman, Pansiyon Nöbet Yönetim Sistemi'nin temel tasarım prensiplerini içerir.*
*Versiyon: 1.0*
*Tarih: Ocak 2026*
