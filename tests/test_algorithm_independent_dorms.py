from datetime import date

import pytest

from pansiyon_nobet.algorithm import generate_assignments
from pansiyon_nobet.models import (
    DailyDormitorySettings,
    Dormitory,
    Gender,
    Settings,
    Teacher,
)


def _by_day_and_dorm(assignments):
    out = {}
    for a in assignments:
        out.setdefault((a.day, a.dormitory), []).append(a.teacher_id)
    return out


def test_required_scenario_independent_distribution_and_gender_rule():
    # Verilen senaryo ayarları:
    # Erkek pansiyonu: hafta içi 3, cumartesi 1
    # Kız pansiyonu: hafta içi 2, cumartesi 2
    settings = Settings(
        boys=DailyDormitorySettings(weekday=3, friday=3, saturday=1, sunday=1),
        girls=DailyDormitorySettings(weekday=2, friday=2, saturday=2, sunday=2),
    )

    # Yeterli sayıda öğretmen (cinsiyete göre ayrık):
    male_ids = ["m1", "m2", "m3", "m4"]
    female_ids = ["f1", "f2", "f3"]
    teachers = (
        [Teacher(id=i, name=i, gender=Gender.MALE) for i in male_ids]
        + [Teacher(id=i, name=i, gender=Gender.FEMALE) for i in female_ids]
    )

    # 2026-01-06 Salı (hafta içi), 2026-01-10 Cumartesi
    assignments = generate_assignments(
        start_day=date(2026, 1, 6),
        end_day=date(2026, 1, 10),
        teachers=teachers,
        settings=settings,
    )

    by = _by_day_and_dorm(assignments)

    # Salı (2026-01-06): erkek 3, kız 2
    boys_tue = by[(date(2026, 1, 6), Dormitory.BOYS)]
    girls_tue = by[(date(2026, 1, 6), Dormitory.GIRLS)]
    assert len(boys_tue) == 3
    assert len(girls_tue) == 2

    # Cumartesi (2026-01-10): erkek 1, kız 2
    boys_sat = by[(date(2026, 1, 10), Dormitory.BOYS)]
    girls_sat = by[(date(2026, 1, 10), Dormitory.GIRLS)]
    assert len(boys_sat) == 1
    assert len(girls_sat) == 2

    # Cinsiyet kuralı ASLA bozulmaz:
    assert set(boys_tue + boys_sat).issubset(set(male_ids))
    assert set(girls_tue + girls_sat).issubset(set(female_ids))

    # Erkek/kız sayıları birbirini ETKİLEMEZ (bağımsız):
    # Erkek ihtiyaçları kızları, kız ihtiyaçları erkekleri asla değiştirmez;
    # bu, her gün/dorm için ayrı ayrı sayım ve seçim yapıldığı için sağlanır.
    # (Bu assert, bağımsızlığı gözle görünür şekilde doğrular.)
    assert len(boys_tue) == settings.boys.weekday
    assert len(girls_tue) == settings.girls.weekday
    assert len(boys_sat) == settings.boys.saturday
    assert len(girls_sat) == settings.girls.saturday


def test_raises_when_not_enough_gender_eligible_teachers():
    settings = Settings(
        boys=DailyDormitorySettings(weekday=3, friday=3, saturday=1, sunday=1),
        girls=DailyDormitorySettings(weekday=2, friday=2, saturday=2, sunday=2),
    )
    teachers = [
        Teacher(id="m1", name="m1", gender=Gender.MALE),
        Teacher(id="m2", name="m2", gender=Gender.MALE),
        # erkek 3 gerektiği gün var -> yetersiz
        Teacher(id="f1", name="f1", gender=Gender.FEMALE),
        Teacher(id="f2", name="f2", gender=Gender.FEMALE),
    ]

    with pytest.raises(ValueError, match="Not enough eligible teachers"):
        generate_assignments(
            start_day=date(2026, 1, 6),  # Salı (week day) -> boys required 3
            end_day=date(2026, 1, 6),
            teachers=teachers,
            settings=settings,
        )

