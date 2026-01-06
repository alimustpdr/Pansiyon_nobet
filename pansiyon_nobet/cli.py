from __future__ import annotations

import argparse
import json
from calendar import monthrange
from datetime import date
from pathlib import Path

from pansiyon_nobet.algorithm import generate_assignments
from pansiyon_nobet.models import DailyDormitorySettings, Gender, Settings, Teacher
from pansiyon_nobet.reporting.excel import write_monthly_xlsx
from pansiyon_nobet.reporting.monthly import build_monthly_rows
from pansiyon_nobet.reporting.pdf import write_monthly_pdf


def _load_teachers_json(path: str) -> list[Teacher]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    teachers: list[Teacher] = []
    for item in raw:
        teachers.append(
            Teacher(
                id=str(item["id"]),
                name=str(item["name"]),
                gender=Gender(str(item["gender"])),
                active=bool(item.get("active", True)),
            )
        )
    return teachers


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Pansiyon aylık nöbet listesi üretimi (çekirdek demo).")
    p.add_argument("--year", type=int, required=True)
    p.add_argument("--month", type=int, required=True)
    p.add_argument("--teachers", type=str, required=True, help="teachers.json dosya yolu")

    p.add_argument("--boys-weekday", type=int, required=True)
    p.add_argument("--boys-friday", type=int, required=True)
    p.add_argument("--boys-saturday", type=int, required=True)
    p.add_argument("--boys-sunday", type=int, required=True)

    p.add_argument("--girls-weekday", type=int, required=True)
    p.add_argument("--girls-friday", type=int, required=True)
    p.add_argument("--girls-saturday", type=int, required=True)
    p.add_argument("--girls-sunday", type=int, required=True)

    p.add_argument("--out-xlsx", type=str, default="")
    p.add_argument("--out-pdf", type=str, default="")
    p.add_argument("--title", type=str, default="")
    return p.parse_args()


def main() -> int:
    args = _parse_args()

    last_day = monthrange(args.year, args.month)[1]
    start_day = date(args.year, args.month, 1)
    end_day = date(args.year, args.month, last_day)

    teachers = _load_teachers_json(args.teachers)
    settings = Settings(
        boys=DailyDormitorySettings(
            weekday=args.boys_weekday,
            friday=args.boys_friday,
            saturday=args.boys_saturday,
            sunday=args.boys_sunday,
        ),
        girls=DailyDormitorySettings(
            weekday=args.girls_weekday,
            friday=args.girls_friday,
            saturday=args.girls_saturday,
            sunday=args.girls_sunday,
        ),
    )

    assignments = generate_assignments(
        start_day=start_day,
        end_day=end_day,
        teachers=teachers,
        settings=settings,
    )
    teachers_by_id = {t.id: t for t in teachers}
    rows = build_monthly_rows(
        assignments=assignments,
        teachers_by_id=teachers_by_id,
        start_day=start_day,
        end_day=end_day,
    )

    title = args.title or f"{args.year}-{args.month:02d} Aylık Nöbet Listesi"
    if args.out_xlsx:
        write_monthly_xlsx(rows=rows, output_path=args.out_xlsx)
    if args.out_pdf:
        write_monthly_pdf(rows=rows, output_path=args.out_pdf, title=title)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

