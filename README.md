# Pansiyon Nöbet

Bu repo içinde `workspace/web` altında, aşağıdaki kuralları **kökten** uygulayan bir örnek “Nöbet Listesi + PDF/Excel rapor” uygulaması bulunur:

- Sayfa ilk açılışta tablo **iskeleti** (başlıklar + sabit sütunlar) görünür; dağıtım sonrası yalnızca gövde hücreleri doldurulur.
- Erkek/Kız pansiyonu sütun sayısı, ilgili ayarlar arasındaki **maksimum** nöbetçi sayısına göre **ay seçildiğinde 1 kez** sabitlenir.
- Günlük dağıtım yalnızca **soldan sağa** (Nöbetçi 1, 2, …) yapılır; fazla sütunlar boş kalır (hata değildir).
- Manuel düzenlemede boş hücre tıklanabilir; ancak o gün için izin verilen sayı **aşılamaz** (modal içinde uyarı + kaydetmez).
- PDF raporu: sütun sayısına göre **otomatik yatay/dikey**, **DejaVu Sans** gömülü font ile Türkçe karakterler bozulmaz.
- Excel raporu: yazdırma önizlemesi için sayfa ayarları (fit-to-width) ile üretilir.

## Çalıştırma

```bash
cd workspace/web
npm install
npm run dev
```

## Test / Lint

```bash
cd workspace/web
npm test
npm run lint
```