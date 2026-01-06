from __future__ import annotations

from collections import defaultdict
from datetime import date

from pansiyon_nobet.models import Assignment, Dormitory, Teacher


def build_monthly_rows(
    *,
    assignments: list[Assignment],
    teachers_by_id: dict[str, Teacher],
    start_day: date,
    end_day: date,
) -> list[dict[str, str]]:
    """
    Aylık rapor için satırları hazırlar.
    Kolonlar: Tarih, Gün, Erkek Pansiyon, Kız Pansiyon
    """
    by_day_dorm: dict[tuple[date, Dormitory], list[str]] = defaultdict(list)
    for a in assignments:
        by_day_dorm[(a.day, a.dormitory)].append(a.teacher_id)

    def fmt_names(ids: list[str]) -> str:
        names = []
        for tid in ids:
            t = teachers_by_id.get(tid)
            names.append(t.name if t else tid)
        return ", ".join(names)

    rows: list[dict[str, str]] = []
    day = start_day
    while day <= end_day:
        weekday_name_tr = [
            "Pazartesi",
            "Salı",
            "Çarşamba",
            "Perşembe",
            "Cuma",
            "Cumartesi",
            "Pazar",
        ][day.weekday()]
        rows.append(
            {
                "Tarih": day.isoformat(),
                "Gün": weekday_name_tr,
                "Erkek Pansiyon": fmt_names(by_day_dorm.get((day, Dormitory.BOYS), [])),
                "Kız Pansiyon": fmt_names(by_day_dorm.get((day, Dormitory.GIRLS), [])),
            }
        )
        day = date.fromordinal(day.toordinal() + 1)
    return rows

