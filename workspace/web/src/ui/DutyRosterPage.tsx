import { useState } from 'react'

import type { Dormitory, MonthKey } from '../domain/types'
import { computeRosterShape } from '../domain/shape'
import { clearRosterAssignments, distributeRoster } from '../domain/distribution'
import { applyCellEdit, validateCellEdit } from '../domain/editing'
import { createEmptyRosterTable, monthKeyFromDate } from '../domain/roster'
import { formatUiDateFromISO } from '../domain/month'

import { DEFAULT_SETTINGS, FEMALE_STAFF_POOL, MALE_STAFF_POOL } from '../sampleData'
import { downloadRosterPdf } from '../reports/pdf'
import { downloadRosterExcel } from '../reports/excel'
import { DutyRosterTable } from './DutyRosterTable'
import { EditCellModal } from './EditCellModal'

type EditingState =
  | null
  | Readonly<{
      dateISO: string
      dayLabel: string
      dorm: Dormitory
      columnIndex: number
    }>

export function DutyRosterPage() {
  const settings = DEFAULT_SETTINGS

  const initialMonth = monthKeyFromDate(new Date())
  const [month, setMonth] = useState<MonthKey>(initialMonth)
  const [table, setTable] = useState(() => createEmptyRosterTable(computeRosterShape(initialMonth, settings)))
  const [editing, setEditing] = useState<EditingState>(null)
  const [modalWarning, setModalWarning] = useState<string | undefined>(undefined)

  const malePool = MALE_STAFF_POOL
  const femalePool = FEMALE_STAFF_POOL

  const onMonthChange = (m: MonthKey) => {
    // Column counts are fixed once per month selection.
    const shape = computeRosterShape(m, settings)
    setMonth(m)
    setEditing(null)
    setModalWarning(undefined)
    setTable(createEmptyRosterTable(shape))
  }

  const openCell = (p: { dateISO: string; dorm: Dormitory; columnIndex: number }) => {
    const row = table.rows.find((r) => r.dateISO === p.dateISO)
    if (!row) return
    setModalWarning(undefined)
    setEditing({ dateISO: p.dateISO, dorm: p.dorm, columnIndex: p.columnIndex, dayLabel: row.dayLabel })
  }

  const closeModal = () => {
    setEditing(null)
    setModalWarning(undefined)
  }

  const currentCellValue = (() => {
    if (!editing) return ''
    const row = table.rows.find((r) => r.dateISO === editing.dateISO)
    if (!row) return ''
    return editing.dorm === 'male' ? (row.male[editing.columnIndex] ?? '') : (row.female[editing.columnIndex] ?? '')
  })()

  const staffOptions = editing?.dorm === 'female' ? femalePool : malePool

  const onSaveCell = (value: string) => {
    if (!editing) return
    const verdict = validateCellEdit(settings, {
      dateISO: editing.dateISO,
      dorm: editing.dorm,
      columnIndex: editing.columnIndex,
      value,
    })
    if (!verdict.ok) {
      setModalWarning(verdict.message)
      return
    }
    setTable((t) =>
      applyCellEdit(t, { dateISO: editing.dateISO, dorm: editing.dorm, columnIndex: editing.columnIndex, value }),
    )
    closeModal()
  }

  return (
    <div className="page">
      <div className="card">
        <div className="cardHeader">
          <div className="headerLeft">
            <h1>Nöbet Listesi — Dağıtım, Liste ve Raporlar</h1>
            <div className="subtle">
              Sütunlar ay başında sabitlenir • Dağıtım yalnızca soldan sağa doldurur • Fazla sütunlar boş kalır
            </div>
          </div>

          <div className="actions">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="subtle">Ay</span>
              <input
                type="month"
                value={month}
                onChange={(e) => onMonthChange(e.target.value as MonthKey)}
                aria-label="Ay seçimi"
              />
            </label>
            <button
              type="button"
              className="primary"
              onClick={() => setTable((t) => distributeRoster({ table: t, settings, malePool, femalePool }))}
            >
              Dağıtımı Yap
            </button>
            <button type="button" className="danger" onClick={() => setTable((t) => clearRosterAssignments(t))}>
              Temizle
            </button>
            <button type="button" onClick={() => void downloadRosterPdf({ settings, table })}>
              PDF
            </button>
            <button type="button" onClick={() => void downloadRosterExcel({ settings, table })}>
              Excel
            </button>
          </div>
        </div>

        <div className="cardBody">
          <DutyRosterTable table={table} onCellClick={openCell} />
        </div>
      </div>

      <EditCellModal
        key={editing ? `${editing.dateISO}-${editing.dorm}-${editing.columnIndex}` : 'closed'}
        open={editing !== null}
        dateLabel={editing ? formatUiDateFromISO(editing.dateISO) : ''}
        dayLabel={editing ? editing.dayLabel : ''}
        dorm={editing?.dorm ?? 'male'}
        columnIndex={editing?.columnIndex ?? 0}
        currentValue={currentCellValue}
        staffOptions={staffOptions}
        warningMessage={modalWarning}
        onClose={closeModal}
        onSave={onSaveCell}
      />
    </div>
  )
}

