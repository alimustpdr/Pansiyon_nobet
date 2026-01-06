import type { DormDutyRules, DutySettings, MonthKey, RosterShape } from './types'

export function maxColumnsForDorm(rules: DormDutyRules): number {
  return Math.max(rules.weekday, rules.friday, rules.saturday, rules.sunday)
}

export function computeRosterShape(month: MonthKey, settings: DutySettings): RosterShape {
  return {
    month,
    maleColumns: Math.max(1, maxColumnsForDorm(settings.male)),
    femaleColumns: Math.max(1, maxColumnsForDorm(settings.female)),
  }
}

