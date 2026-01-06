import type { DutySettings } from './domain/types'

export const DEFAULT_SETTINGS: DutySettings = {
  schoolName: 'ÖRNEK OKUL ADI',
  activeTerm: '2025-2026 Eğitim Öğretim Dönemi',
  male: { weekday: 2, friday: 2, saturday: 3, sunday: 3 },
  female: { weekday: 2, friday: 2, saturday: 2, sunday: 2 },
}

export const MALE_STAFF_POOL = [
  'Ahmet Yılmaz',
  'Mehmet Demir',
  'Mustafa Kaya',
  'Ali Şahin',
  'İsmail Öztürk',
] as const

export const FEMALE_STAFF_POOL = [
  'Ayşe Çelik',
  'Fatma Şen',
  'Zeynep Aydın',
  'Elif Güneş',
  'Gül Şimşek',
] as const

