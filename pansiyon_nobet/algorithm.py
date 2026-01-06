from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, timedelta

from pansiyon_nobet.models import (
    Assignment,
    DayType,
    Dormitory,
    Gender,
    Settings,
    Teacher,
)


def day_type_for(day: date) -> DayType:
    """
    Gün tipini belirler:
    - Pazartesi(0)-Perşembe(3): WEEKDAY
    - Cuma(4): FRIDAY
    - Cumartesi(5): SATURDAY
    - Pazar(6): SUNDAY
    """
    weekday = day.weekday()
    if weekday in (0, 1, 2, 3):
        return DayType.WEEKDAY
    if weekday == 4:
        return DayType.FRIDAY
    if weekday == 5:
        return DayType.SATURDAY
    return DayType.SUNDAY


@dataclass
class DistributionState:
    """
    Adaletli dağıtımı desteklemek için sayaçlar.
    Kural gereği erkek/kız pansiyonları TAMAMEN BAĞIMSIZ tutulur.
    """

    boys_counts: dict[str, int]
    girls_counts: dict[str, int]

    @classmethod
    def empty(cls) -> "DistributionState":
        return cls(boys_counts={}, girls_counts={})


def _eligible_teachers(teachers: Iterable[Teacher], gender: Gender) -> list[Teacher]:
    return [t for t in teachers if t.active and t.gender == gender]


def _pick_teachers_least_assigned(
    *,
    required: int,
    candidates: list[Teacher],
    counts: dict[str, int],
) -> list[Teacher]:
    if required <= 0:
        return []
    if len(candidates) < required:
        raise ValueError(
            f"Not enough eligible teachers: required={required}, eligible={len(candidates)}"
        )

    # "Adalet": en az nöbeti olan önce gelir; eşitlikte id'ye göre deterministik.
    ordered = sorted(candidates, key=lambda t: (counts.get(t.id, 0), t.id))
    chosen = ordered[:required]
    for t in chosen:
        counts[t.id] = counts.get(t.id, 0) + 1
    return chosen


def generate_assignments(
    *,
    start_day: date,
    end_day: date,
    teachers: Iterable[Teacher],
    settings: Settings,
    state: DistributionState | None = None,
) -> list[Assignment]:
    """
    KESİN KURALLAR:
    - Erkek ve kız pansiyonları tamamen bağımsız dağıtılır.
    - Erkek pansiyonu: sadece erkek öğretmen.
    - Kız pansiyonu: sadece kadın öğretmen.
    - Her gün için: gün tipine göre ilgili pansiyon ayarından sayı alınır ve o sayı kadar atama yapılır.

    Not:
    - Erkek/kız toplamı, dengeleme, tek-çift gibi bir mantık YOKTUR.
    """
    if end_day < start_day:
        raise ValueError("end_day must be >= start_day")

    st = state or DistributionState.empty()
    all_teachers = list(teachers)
    male_teachers = _eligible_teachers(all_teachers, Gender.MALE)
    female_teachers = _eligible_teachers(all_teachers, Gender.FEMALE)

    assignments: list[Assignment] = []

    day = start_day
    while day <= end_day:
        day_type = day_type_for(day)

        # ERKEK PANSİYONU (tamamen bağımsız)
        boys_required = settings.boys.required_for(day_type)
        boys_chosen = _pick_teachers_least_assigned(
            required=boys_required,
            candidates=male_teachers,
            counts=st.boys_counts,
        )
        for t in boys_chosen:
            assignments.append(
                Assignment(day=day, dormitory=Dormitory.BOYS, teacher_id=t.id)
            )

        # KIZ PANSİYONU (tamamen bağımsız)
        girls_required = settings.girls.required_for(day_type)
        girls_chosen = _pick_teachers_least_assigned(
            required=girls_required,
            candidates=female_teachers,
            counts=st.girls_counts,
        )
        for t in girls_chosen:
            assignments.append(
                Assignment(day=day, dormitory=Dormitory.GIRLS, teacher_id=t.id)
            )

        day += timedelta(days=1)

    return assignments

