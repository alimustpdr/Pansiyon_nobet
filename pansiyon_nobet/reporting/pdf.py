from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Table, TableStyle


def write_monthly_pdf(
    *,
    rows: list[dict[str, str]],
    output_path: str,
    title: str = "Aylık Nöbet Listesi",
    max_rows_per_page: int = 22,
) -> str:
    """
    Aylık nöbet listesini PDF olarak yazar.
    Varsayılan: yatay A4, satır sayısı fazlaysa sayfalara böler.
    """
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(out),
        pagesize=landscape(A4),
        leftMargin=18,
        rightMargin=18,
        topMargin=18,
        bottomMargin=18,
    )

    styles = getSampleStyleSheet()
    story = [Paragraph(title, styles["Title"])]

    headers = ["Tarih", "Gün", "Erkek Pansiyon", "Kız Pansiyon"]
    chunks = [rows[i : i + max_rows_per_page] for i in range(0, len(rows), max_rows_per_page)]

    for ci, chunk in enumerate(chunks):
        data = [headers] + [[r.get(h, "") for h in headers] for r in chunk]
        tbl = Table(data, colWidths=[70, 80, 300, 300], repeatRows=1)
        tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]
            )
        )
        story.append(tbl)
        if ci != len(chunks) - 1:
            story.append(PageBreak())

    doc.build(story)
    return str(out)

