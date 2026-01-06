# Pansiyon Nöbet Yönetim Sistemi - Proje Özellikleri ve Algoritma Spesifikasyonu

Bu doküman, MEB'e bağlı okul pansiyonlarında kullanılmak üzere tasarlanan nöbet dağıtım sisteminin teknik ve işlevsel gereksinimlerini içerir.

## 1. Temel Prensipler ve Algoritma Kuralları (Kırmızı Çizgiler)

Sistemin kalbi olan nöbet dağıtım algoritması aşağıdaki **değişmez** kurallara dayanır:

### 1.1. Tam Ayrışım İlkesi (Strict Separation)
*   **Veri Seti Ayrımı:** Erkek öğretmen havuzu ve Kadın öğretmen havuzu yazılımsal olarak tamamen izole edilecektir.
*   **Konfigürasyon Ayrımı:**
    *   Erkek Pansiyonu Nöbetçi Sayıları (Hafta içi, Cuma, Cmt, Paz)
    *   Kız Pansiyonu Nöbetçi Sayıları (Hafta içi, Cuma, Cmt, Paz)
    *   Bu ayarlar birbirini asla etkilemez (Örn: Erkek tarafında Cuma 3 kişi gerekirken, Kız tarafında 1 kişi gerekebilir).
*   **Etkileşimsizlik:** Bir taraftaki öğretmen eksikliği, nöbet fazlalığı veya sayısal değişiklikler diğer tarafın hesaplamasını matematiksel olarak etkilemeyecektir.

### 1.2. Dağıtım Mantığı (Günlük Çevrim)
Algoritma her takvim günü için şu adımları izler:

1.  **Gün Tipi Belirleme:** Tarih kontrol edilir (Pazartesi-Perşembe, Cuma, Cumartesi, Pazar).
2.  **Paralel İşlem (Erkek):**
    *   O gün tipi için *Erkek* ayarlarından nöbetçi sayısı ($N_{e}$) çekilir.
    *   Erkek öğretmen havuzundan, puan/adalet kriterlerine göre uygun $N_{e}$ kişi seçilir.
3.  **Paralel İşlem (Kadın):**
    *   O gün tipi için *Kadın* ayarlarından nöbetçi sayısı ($N_{k}$) çekilir.
    *   Kadın öğretmen havuzundan, puan/adalet kriterlerine göre uygun $N_{k}$ kişi seçilir.
4.  **Kısıt Kontrolü:**
    *   Bir öğretmene üst üste 2 gün nöbet yazılmaz (özel istek hariç).
    *   Kişisel mazeret günlerine (engel günleri) nöbet yazılmaz.

## 2. Özellik Listesi (Feature List)

### 2.1. Veri Yönetimi ve Ayarlar
*   **Öğretmen Yönetimi:**
    *   Ad, Soyad, Cinsiyet (Değiştirilemez temel alan), Kıdem/Puan, Branş.
    *   **Nöbet Muafiyet Durumu:** (Hamilelik, süt izni, yaş haddi, sağlık raporu vb. durumlarda pasife alma).
    *   **Kişisel Mazeret Takvimi:** Öğretmenlerin "Salı günleri nöbet tutamam" veya "Şu tarihte izinliyim" diyebileceği engelleme sistemi.
*   **Pansiyon Ayarları (Ayrı Tablarda):**
    *   **Erkek Pansiyonu:** Günlük nöbetçi sayıları matrisi.
    *   **Kız Pansiyonu:** Günlük nöbetçi sayıları matrisi.
    *   **Resmi Tatiller:** MEB takvimine göre tatil günlerini işaretleme.

### 2.2. Nöbet Dağıtım Motoru (Scheduler)
*   **Adalet Mekanizması (Puanlama):**
    *   Sadece "sıradaki" değil, toplam nöbet yüküne göre dağıtım.
    *   Hafta içi nöbeti: 1 Puan, Hafta sonu nöbeti: 1.5 Puan (Önerilen ağırlıklandırma).
    *   Ay sonunda herkesin puanı birbirine en yakın olacak şekilde dağıtım.
*   **Manuel Müdahale (Drag & Drop):** Otomatik dağıtım sonrası yöneticinin elle değişiklik yapabilmesi (Sürükle-Bırak arayüzü). Manuel değişimde cinsiyet kuralı uyarısı (Erkek öğretmeni kız listesine sürüklerse sistem bloklar).

### 2.3. Raporlama ve Çıktı
*   **Aylık Çizelge (Excel/PDF):**
    *   Satırlarda Günler (1-30/31), Sütunlarda Nöbet Yerleri/Sıraları.
    *   Yatay (Landscape) format.
    *   İmza sirküsü formatına uygun alt bilgi alanları (Okul Müdürü, Müdür Yrd. onayı).
*   **İstatistik Raporu:**
    *   Hangi öğretmen kaç hafta içi, kaç hafta sonu tuttu?
    *   Yıllık kümülatif toplamlar.

### 2.4. Kullanıcı Deneyimi (UX) Önerileri
*   **Renk Kodlaması:** Erkek pansiyon nöbetleri Mavi, Kız pansiyon nöbetleri Pembe/Kırmızı tonlarında gösterilerek görsel ayrım sağlanmalı.
*   **Hata Önleyici (Poka-Yoke):** Erkek öğretmeni seçip cinsiyetini "Kadın" yapmaya çalışırsa veya tam tersi, sistem nöbet geçmişi bozulacağı için uyarı vermeli.
*   **Sihirli Buton:** "Dağıtımı Başlat" butonuna basıldığında, dağıtımın adım adım nasıl yapıldığını (log) veya başarı oranını gösteren bir özet ekranı.

## 3. Veritabanı Şeması Taslağı (Kavramsal)

*   `Teachers`: id, name, gender, active_status, total_points
*   `Constraints`: teacher_id, date, type (soft/hard)
*   `Settings`: gender_scope, day_type, required_count
*   `Schedule`: date, teacher_id, day_type

## 4. Geliştirme Yol Haritası

1.  Proje Kurulumu (Next.js + Tailwind + SQLite/LocalStore).
2.  Öğretmen ve Ayar Ekranlarının Kodlanması.
3.  **Algoritma Kodlaması (TDD Yaklaşımı ile - Önce Testler).**
4.  Takvim Arayüzü ve Entegrasyon.
5.  Excel/PDF Raporlama.

---
**ÖNEMLİ NOT:** Bu proje MEB yönetmeliklerine uygunluk ve öğretmenler arası çalışma barışı (adalet) açısından kritik öneme sahiptir. Algoritma asla "rastgele" dağıtım yapmamalı, her zaman hesap verilebilir (puan bazlı) bir mantıkla çalışmalıdır.
