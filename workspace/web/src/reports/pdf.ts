import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PageSizes, rgb, type PDFPage } from 'pdf-lib'

import { DEJAVU_SANS_TTF_BASE64 } from '../fonts/dejavuSansBase64'
import type { DutySettings, RosterTable } from '../domain/types'
import { decideOrientation } from '../domain/report'
import { formatMonthTitle, formatUiDateFromISO } from '../domain/month'

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function downloadBytes(bytes: Uint8Array, filename: string, mime: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function fitText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return `${text.slice(0, Math.max(0, maxChars - 1))}…`
}

export async function downloadRosterPdf(params: {
  settings: DutySettings
  table: RosterTable
}): Promise<void> {
  const { settings, table } = params
  const monthTitle = formatMonthTitle(table.shape.month)

  const totalColumns = 2 + table.shape.maleColumns + table.shape.femaleColumns
  const orientation = decideOrientation(totalColumns)
  const pageSize: [number, number] =
    orientation === 'portrait' ? ([...PageSizes.A4] as [number, number]) : [PageSizes.A4[1], PageSizes.A4[0]]

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const fontBytes = base64ToUint8Array(DEJAVU_SANS_TTF_BASE64)
  const font = await pdfDoc.embedFont(fontBytes, { subset: true })

  const margin = 26
  const titleGap = 5
  const titleLineHeight = 16
  const headerH1 = 22
  const headerH2 = 18
  const rowH = 18

  const dateW = 82
  const dayW = 110

  const headerBg1 = rgb(0.97, 0.98, 0.99)
  const headerBg2 = rgb(0.95, 0.96, 0.98)
  const maleBg = rgb(0.93, 0.97, 1.0)
  const femaleBg = rgb(0.99, 0.95, 0.98)
  const border = rgb(0.83, 0.86, 0.9)
  const text = rgb(0.06, 0.09, 0.16)

  type Color = ReturnType<typeof rgb>
  const drawCell = (
    page: PDFPage,
    x: number,
    yTop: number,
    w: number,
    h: number,
    opts?: { bg?: Color; align?: 'left' | 'center' },
  ) => {
    page.drawRectangle({
      x,
      y: yTop - h,
      width: w,
      height: h,
      borderColor: border,
      borderWidth: 0.6,
      color: opts?.bg,
    })
    const align = opts?.align ?? 'left'
    return (value: string, size = 8.5) => {
      const v = fitText(value, Math.max(4, Math.floor(w / 6)))
      const textWidth = font.widthOfTextAtSize(v, size)
      const tx = align === 'center' ? x + Math.max(0, (w - textWidth) / 2) : x + 6
      page.drawText(v, { x: tx, y: yTop - h + 5, size, font, color: text })
    }
  }

  const drawTitle = (page: PDFPage, yTop: number) => {
    const lines = [settings.schoolName, settings.activeTerm, `${monthTitle} Ayı Pansiyon Nöbet Listesi`]
    let y = yTop
    for (const line of lines) {
      const size = 12
      const w = font.widthOfTextAtSize(line, size)
      page.drawText(line, {
        x: (page.getWidth() - w) / 2,
        y: y - size,
        size,
        font,
        color: text,
      })
      y -= titleLineHeight + titleGap
    }
    return y - 6
  }

  const drawTableHeader = (page: PDFPage, yTop: number) => {
    const contentW = page.getWidth() - margin * 2
    const dutyCols = table.shape.maleColumns + table.shape.femaleColumns
    const dutyW = (contentW - dateW - dayW) / Math.max(1, dutyCols)

    let x = margin

    // Date + Day headers with rowspan=2
    drawCell(page, x, yTop, dateW, headerH1 + headerH2, { bg: headerBg1, align: 'center' })('Tarih', 9)
    x += dateW
    drawCell(page, x, yTop, dayW, headerH1 + headerH2, { bg: headerBg1, align: 'center' })('Gün', 9)
    x += dayW

    // Group headers
    drawCell(page, x, yTop, dutyW * table.shape.maleColumns, headerH1, { bg: maleBg, align: 'center' })(
      'Erkek Pansiyonu',
      9,
    )
    x += dutyW * table.shape.maleColumns
    drawCell(page, x, yTop, dutyW * table.shape.femaleColumns, headerH1, { bg: femaleBg, align: 'center' })(
      'Kız Pansiyonu',
      9,
    )

    // Subheaders row
    const y2 = yTop - headerH1
    x = margin + dateW + dayW
    for (let i = 0; i < table.shape.maleColumns; i += 1) {
      drawCell(page, x, y2, dutyW, headerH2, { bg: headerBg2, align: 'center' })(`Nöbetçi ${i + 1}`, 8.5)
      x += dutyW
    }
    for (let i = 0; i < table.shape.femaleColumns; i += 1) {
      drawCell(page, x, y2, dutyW, headerH2, { bg: headerBg2, align: 'center' })(`Nöbetçi ${i + 1}`, 8.5)
      x += dutyW
    }

    return { dutyW, tableTopAfterHeader: yTop - headerH1 - headerH2 }
  }

  const addPage = () => {
    const page = pdfDoc.addPage(pageSize)
    const yAfterTitle = drawTitle(page, page.getHeight() - margin)
    const header = drawTableHeader(page, yAfterTitle)
    return { page, y: header.tableTopAfterHeader, dutyW: header.dutyW }
  }

  let { page, y, dutyW } = addPage()

  for (const r of table.rows) {
    if (y - rowH < margin) {
      ;({ page, y, dutyW } = addPage())
    }

    const contentW = page.getWidth() - margin * 2
    const xStart = margin
    let x = xStart

    drawCell(page, x, y, dateW, rowH)(formatUiDateFromISO(r.dateISO), 8.4)
    x += dateW
    drawCell(page, x, y, dayW, rowH)(r.dayLabel, 8.4)
    x += dayW

    // Male
    for (let i = 0; i < table.shape.maleColumns; i += 1) {
      drawCell(page, x, y, dutyW, rowH)(r.male[i] ?? '', 8.2)
      x += dutyW
    }
    // Female
    for (let i = 0; i < table.shape.femaleColumns; i += 1) {
      drawCell(page, x, y, dutyW, rowH)(r.female[i] ?? '', 8.2)
      x += dutyW
    }

    // ensure right border even if rounding errors
    if (x < xStart + contentW) {
      page.drawLine({
        start: { x: xStart + contentW, y },
        end: { x: xStart + contentW, y: y - rowH },
        color: border,
        thickness: 0.6,
      })
    }

    y -= rowH
  }

  const bytes = await pdfDoc.save()
  downloadBytes(bytes, `nobet-listesi-${table.shape.month}.pdf`, 'application/pdf')
}

