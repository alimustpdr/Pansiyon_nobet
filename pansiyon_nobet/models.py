from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class Dormitory(str, Enum):
    BOYS = "boys"
    GIRLS = "girls"


class DayType(str, Enum):
    WEEKDAY = "weekday"  # Pazartesi-Salı-Çarşamba-Perşembe
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


@dataclass(frozen=True)
class Teacher:
    id: str
    name: str
    gender: Gender
    active: bool = True


@dataclass(frozen=True)
class DailyDormitorySettings:
    weekday: int
    friday: int
    saturday: int
    sunday: int

    def required_for(self, day_type: DayType) -> int:
        match day_type:
            case DayType.WEEKDAY:
                return self.weekday
            case DayType.FRIDAY:
                return self.friday
            case DayType.SATURDAY:
                return self.saturday
            case DayType.SUNDAY:
                return self.sunday
        raise ValueError(f"Unsupported day type: {day_type}")


@dataclass(frozen=True)
class Settings:
    boys: DailyDormitorySettings
    girls: DailyDormitorySettings


@dataclass(frozen=True)
class Assignment:
    day: date
    dormitory: Dormitory
    teacher_id: str

