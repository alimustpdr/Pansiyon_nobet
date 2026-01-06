# Pansiyon Nöbet (çekirdek)

Bu repo, **pansiyon (yurt) nöbet dağıtımının çekirdek algoritmasını** ve temel raporlama çıktısını içerir.

## Kesin iş kuralları (kilitli)

- **Erkek pansiyonu**: sadece **erkek** öğretmenler
- **Kız pansiyonu**: sadece **kadın** öğretmenler
- Erkek/kız pansiyonları **tamamen bağımsız** dağıtılır:
  - Toplam nöbetçi sayısı, dengeleme, tek/çift gibi mantık **yoktur**
  - Her gün için iki pansiyon ayrı ayrı:
    - Gün tipine göre (hafta içi / Cuma / Cumartesi / Pazar) kendi ayarından sayı alınır
    - O sayı kadar yalnızca uygun cinsiyetten öğretmen atanır

## Test çalıştırma

```bash
python3 -m pip install -r requirements.txt
python3 -m pytest -q
```

## Demo: aylık liste üret (Excel/PDF)

Örnek `teachers.json`:

```json
[
  {"id":"m1","name":"Ahmet Y.","gender":"male"},
  {"id":"m2","name":"Mehmet K.","gender":"male"},
  {"id":"f1","name":"Ayşe D.","gender":"female"},
  {"id":"f2","name":"Fatma S.","gender":"female"}
]
```

Çalıştırma:

```bash
python3 -m pansiyon_nobet.cli \
  --year 2026 --month 1 --teachers teachers.json \
  --boys-weekday 3 --boys-friday 3 --boys-saturday 1 --boys-sunday 1 \
  --girls-weekday 2 --girls-friday 2 --girls-saturday 2 --girls-sunday 2 \
  --out-xlsx out/nobet.xlsx \
  --out-pdf out/nobet.pdf
```