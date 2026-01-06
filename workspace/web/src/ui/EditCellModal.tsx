import { useState } from 'react'

import type { Dormitory } from '../domain/types'

export type EditCellModalProps = Readonly<{
  open: boolean
  dateLabel: string
  dayLabel: string
  dorm: Dormitory
  columnIndex: number
  currentValue: string
  staffOptions: readonly string[]
  warningMessage?: string
  onClose: () => void
  onSave: (value: string) => void
}>

export function EditCellModal(props: EditCellModalProps) {
  const { open, dorm, dateLabel, dayLabel, columnIndex, currentValue, staffOptions, warningMessage, onClose, onSave } =
    props
  const [value, setValue] = useState(currentValue)

  if (!open) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Hücre düzenleme">
      <div className="modal">
        <div className="modalHeader">
          <div>
            <div style={{ fontWeight: 800 }}>
              {dorm === 'male' ? 'Erkek Pansiyonu' : 'Kız Pansiyonu'} — Nöbetçi {columnIndex + 1}
            </div>
            <div className="subtle">
              {dateLabel} / {dayLabel}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat">
            Kapat
          </button>
        </div>

        <div className="modalBody">
          {warningMessage ? <div className="warning">{warningMessage}</div> : null}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="subtle">Nöbetçi</span>
            <select value={value} onChange={(e) => setValue(e.target.value)}>
              <option value="">— Boş bırak —</option>
              {staffOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="modalFooter">
          <button type="button" onClick={onClose}>
            Vazgeç
          </button>
          <button type="button" className="primary" onClick={() => onSave(value)}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}

