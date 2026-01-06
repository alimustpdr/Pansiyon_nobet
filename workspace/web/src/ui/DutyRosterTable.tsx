import type { Dormitory, RosterTable } from '../domain/types'
import { formatUiDateFromISO } from '../domain/month'

export type CellClick = (params: { dateISO: string; dorm: Dormitory; columnIndex: number }) => void

export function DutyRosterTable(props: {
  table: RosterTable
  onCellClick: CellClick
}) {
  const { table, onCellClick } = props

  const maleCols = table.shape.maleColumns
  const femaleCols = table.shape.femaleColumns

  return (
    <div className="tableWrap" aria-label="Nöbet listesi tablosu">
      <table className="rosterTable">
        <colgroup>
          <col style={{ width: 110 }} />
          <col style={{ width: 140 }} />
          {Array.from({ length: maleCols }).map((_, i) => (
            <col key={`m-col-${i}`} style={{ width: 170 }} />
          ))}
          {Array.from({ length: femaleCols }).map((_, i) => (
            <col key={`f-col-${i}`} style={{ width: 170 }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>Tarih</th>
            <th rowSpan={2}>Gün</th>
            <th className="groupMale" colSpan={Math.max(1, maleCols)}>
              Erkek Pansiyonu
            </th>
            <th className="groupFemale" colSpan={Math.max(1, femaleCols)}>
              Kız Pansiyonu
            </th>
          </tr>
          <tr>
            {Array.from({ length: maleCols }).map((_, i) => (
              <th key={`m-h-${i}`} className="groupMale">
                Nöbetçi {i + 1}
              </th>
            ))}
            {Array.from({ length: femaleCols }).map((_, i) => (
              <th key={`f-h-${i}`} className="groupFemale">
                Nöbetçi {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.dateISO}>
              <td>{formatUiDateFromISO(r.dateISO)}</td>
              <td>{r.dayLabel}</td>
              {r.male.map((v, i) => (
                <td key={`m-${r.dateISO}-${i}`}>
                  <button
                    type="button"
                    className={`cellButton ${v ? '' : 'cellEmpty'}`}
                    onClick={() => onCellClick({ dateISO: r.dateISO, dorm: 'male', columnIndex: i })}
                    title={v ? v : 'Boş (düzenlemek için tıkla)'}
                  >
                    {v ? v : '—'}
                  </button>
                </td>
              ))}
              {r.female.map((v, i) => (
                <td key={`f-${r.dateISO}-${i}`}>
                  <button
                    type="button"
                    className={`cellButton ${v ? '' : 'cellEmpty'}`}
                    onClick={() => onCellClick({ dateISO: r.dateISO, dorm: 'female', columnIndex: i })}
                    title={v ? v : 'Boş (düzenlemek için tıkla)'}
                  >
                    {v ? v : '—'}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

