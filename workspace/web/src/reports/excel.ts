import ExcelJS from 'exceljs'

import type { DutySettings, RosterTable } from '../domain/types'
import { decideOrientation } from '../domain/report'
import { formatMonthTitle, formatUiDateFromISO } from '../domain/month'

function downloadBytes(bytes: ArrayBuffer, filename: string, mime: string): void {
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadRosterExcel(params: { settings: DutySettings; table: RosterTable }): Promise<void> {
  const { settings, table } = params
  const monthTitle = formatMonthTitle(table.shape.month)

  const totalColumns = 2 + table.shape.maleColumns + table.shape.femaleColumns
  const orientation = decideOrientation(totalColumns)

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Pansiyon Nöbet'
  wb.created = new Date()

  const ws = wb.addWorksheet('Nöbet Listesi', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
    properties: { defaultRowHeight: 18 },
    views: [{ state: 'frozen', ySplit: 6 }],
  })

  const maleCols = table.shape.maleColumns
  const femaleCols = table.shape.femaleColumns

  const headerLines = [settings.schoolName, settings.activeTerm, `${monthTitle} Ayı Pansiyon Nöbet Listesi`]
  ws.addRow([headerLines[0]])
  ws.addRow([headerLines[1]])
  ws.addRow([headerLines[2]])
  ws.addRow([])

  const tableStartRow = ws.rowCount + 1

  // Header row 1 (group headers)
  const header1 = ['Tarih', 'Gün', ...Array.from({ length: maleCols }, () => ''), ...Array.from({ length: femaleCols }, () => '')]
  ws.addRow(header1)
  // Header row 2 (subheaders)
  const header2 = [
    '',
    '',
    ...Array.from({ length: maleCols }, (_, i) => `Nöbetçi ${i + 1}`),
    ...Array.from({ length: femaleCols }, (_, i) => `Nöbetçi ${i + 1}`),
  ]
  ws.addRow(header2)

  // Merge title lines across all columns
  const lastCol = totalColumns
  for (let r = 1; r <= 3; r += 1) {
    ws.mergeCells(r, 1, r, lastCol)
    ws.getRow(r).getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(r).font = { bold: r === 1 || r === 3, size: r === 1 ? 14 : 12 }
  }

  // Merge header row 1: Date + Day rowspan-like (merge vertically across 2 rows)
  ws.mergeCells(tableStartRow, 1, tableStartRow + 1, 1)
  ws.mergeCells(tableStartRow, 2, tableStartRow + 1, 2)

  // Merge group headers
  const maleStart = 3
  const maleEnd = 2 + maleCols
  const femaleStart = maleEnd + 1
  const femaleEnd = maleEnd + femaleCols
  ws.mergeCells(tableStartRow, maleStart, tableStartRow, maleEnd)
  ws.mergeCells(tableStartRow, femaleStart, tableStartRow, femaleEnd)

  ws.getRow(tableStartRow).getCell(1).value = 'Tarih'
  ws.getRow(tableStartRow).getCell(2).value = 'Gün'
  ws.getRow(tableStartRow).getCell(maleStart).value = 'Erkek Pansiyonu'
  ws.getRow(tableStartRow).getCell(femaleStart).value = 'Kız Pansiyonu'

  // Body rows
  for (const r of table.rows) {
    ws.addRow([formatUiDateFromISO(r.dateISO), r.dayLabel, ...r.male, ...r.female])
  }

  // Column widths (stable)
  ws.getColumn(1).width = 14
  ws.getColumn(2).width = 18
  for (let c = 3; c <= lastCol; c += 1) ws.getColumn(c).width = 22

  // Styling: borders & header backgrounds
  const headerFill1 = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } } as const
  const headerFill2 = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } } as const
  const maleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } } as const
  const femaleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDF2F8' } } as const

  const border = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } },
  } as const

  const tableEndRow = ws.rowCount
  for (let r = tableStartRow; r <= tableEndRow; r += 1) {
    for (let c = 1; c <= lastCol; c += 1) {
      const cell = ws.getRow(r).getCell(c)
      cell.border = border
      cell.alignment = { vertical: 'middle', horizontal: c <= 2 ? 'left' : 'center', wrapText: false }
      if (r === tableStartRow) {
        cell.font = { bold: true }
        cell.fill = c >= maleStart && c <= maleEnd ? maleFill : c >= femaleStart && c <= femaleEnd ? femaleFill : headerFill1
      } else if (r === tableStartRow + 1) {
        cell.font = { bold: true }
        cell.fill = headerFill2
      }
    }
  }

  // Improve print preview stability
  ws.pageSetup.margins = { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }

  const buffer = await wb.xlsx.writeBuffer()
  downloadBytes(buffer, `nobet-listesi-${table.shape.month}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

