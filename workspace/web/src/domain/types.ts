export type Dormitory = 'male' | 'female'

export type DayType = 'weekday' | 'friday' | 'saturday' | 'sunday'

export type DormDutyRules = Readonly<{
  weekday: number
  friday: number
  saturday: number
  sunday: number
}>

export type DutySettings = Readonly<{
  schoolName: string
  activeTerm: string
  male: DormDutyRules
  female: DormDutyRules
}>

export type MonthKey = `${number}-${'01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'}`

export type RosterShape = Readonly<{
  month: MonthKey
  maleColumns: number
  femaleColumns: number
}>

export type RosterRow = Readonly<{
  dateISO: string // yyyy-MM-dd
  dayLabel: string
  male: readonly string[]
  female: readonly string[]
}>

export type RosterTable = Readonly<{
  shape: RosterShape
  rows: readonly RosterRow[]
}>

