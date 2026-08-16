import { jsPDF } from 'jspdf'

type RGB = [number, number, number]

const GREEN: RGB     = [47, 93, 78]
const AMBER: RGB     = [201, 162, 39]
const DARK: RGB      = [28, 25, 23]
const GRAY: RGB      = [120, 113, 108]
const LIGHT: RGB     = [231, 229, 228]
const CREAM: RGB     = [253, 251, 247]

function fill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]) }
function stroke(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]) }
function color(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]) }

export function buildPdfBuffer(result: any): Buffer {
  const doc = new jsPDF()
  const child = result.survey?.child
  const parent = result.survey?.parent
  const W = 210
  const M = 20
  const CW = W - M * 2

  // ── Header bar ──────────────────────────────────────────
  fill(doc, GREEN)
  doc.rect(0, 0, W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22); doc.setFont('helvetica', 'bold')
  doc.text('PetaBakat', W / 2, 16, { align: 'center' })
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text('Laporan Potensi Anak Berbasis Nasab & Hasab', W / 2, 26, { align: 'center' })

  let y = 52

  // ── Data Anak ────────────────────────────────────────────
  color(doc, GREEN); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Data Anak', M, y)
  stroke(doc, AMBER); doc.setLineWidth(0.8)
  doc.line(M, y + 2, M + 28, y + 2)
  y += 9
  color(doc, DARK); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text(`Nama Anak  : ${child?.name || '-'}`, M, y); y += 6
  doc.text(`Orang Tua  : ${parent?.name || '-'}`, M, y); y += 14

  // ── Persona ───────────────────────────────────────────────
  color(doc, GREEN); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Persona Potensi', M, y)
  stroke(doc, AMBER); doc.line(M, y + 2, M + 38, y + 2)
  y += 8

  // set font dulu sebelum splitTextToSize agar lebar diukur dengan font yang benar
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  const descLines = doc.splitTextToSize(result.personaDescription || '', CW - 10)
  const boxH = 14 + descLines.length * 5
  fill(doc, CREAM); stroke(doc, AMBER); doc.setLineWidth(0.5)
  doc.roundedRect(M, y, CW, boxH, 3, 3, 'FD')
  color(doc, GREEN); doc.setFontSize(11); doc.setFont('helvetica', 'bold')
  doc.text(result.personaLabel, M + 5, y + 8)
  color(doc, DARK); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.text(descLines, M + 5, y + 15)
  y += boxH + 12

  // ── Skor Hasab ────────────────────────────────────────────
  color(doc, GREEN); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Skor Hasab', M, y)
  stroke(doc, AMBER); doc.line(M, y + 2, M + 26, y + 2)
  y += 8

  const scores = [
    { label: 'Asyiha', value: result.scoreAsyiha, pct: result.pctAsyiha },
    { label: 'Ilmi',   value: result.scoreIlmi,   pct: result.pctIlmi   },
    { label: 'Amali',  value: result.scoreAmali,  pct: result.pctAmali  },
    { label: 'Wajdan', value: result.scoreWajdan, pct: result.pctWajdan },
  ]
  const bW = (CW - 9) / 4
  scores.forEach((s, i) => {
    const x = M + i * (bW + 3)
    const isDom = s.label.toLowerCase() === result.dominantHasab
    isDom ? fill(doc, AMBER) : fill(doc, CREAM)
    stroke(doc, LIGHT); doc.setLineWidth(0.3)
    doc.roundedRect(x, y, bW, 26, 2, 2, 'FD')
    color(doc, GRAY); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text(s.label.toUpperCase(), x + bW / 2, y + 7, { align: 'center' })
    color(doc, isDom ? DARK : GREEN); doc.setFontSize(17); doc.setFont('helvetica', 'bold')
    doc.text(String(s.value), x + bW / 2, y + 17, { align: 'center' })
    color(doc, GRAY); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text(`${s.pct}%`, x + bW / 2, y + 23, { align: 'center' })
  })
  y += 34

  color(doc, DARK); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  const narrLines = doc.splitTextToSize(result.scoreNarrative || '', CW - 5)
  doc.text(narrLines, M, y)
  y += narrLines.length * 5 + 12

  // ── Micro-Dosing ─────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20 }
  color(doc, GREEN); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  const planTitle = doc.splitTextToSize(result.microdosingPlan?.title || 'Rencana Stimulasi Mingguan', CW)
  doc.text(planTitle, M, y)
  stroke(doc, AMBER); doc.setLineWidth(0.8)
  doc.line(M, y + 2, M + 55, y + 2)
  y += (planTitle.length - 1) * 6
  y += 9

  for (const item of result.microdosingPlan?.schedule || []) {
    // set font dulu sebelum splitTextToSize agar wrapping akurat
    doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    const actLines = doc.splitTextToSize(item.activity || '', CW - 5)
    const rowH = 20 + (actLines.length - 1) * 5
    if (y + rowH > 272) { doc.addPage(); y = 20 }

    // day badge: auto-width based on text
    doc.setFontSize(7); doc.setFont('helvetica', 'bold')
    const dayText = item.day || ''
    const dayW = doc.getTextWidth(dayText) + 8
    fill(doc, GREEN)
    doc.roundedRect(M, y - 1, dayW, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text(dayText, M + 4, y + 4.5)
    y += 12

    color(doc, DARK); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.text(actLines, M, y)
    y += actLines.length * 5
    color(doc, GRAY); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text(`${item.durationMinutes} menit`, M, y)
    y += 10
  }

  // ── Catatan Orang Tua ────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20 }
  y += 4
  color(doc, GREEN); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Catatan untuk Orang Tua', M, y)
  stroke(doc, AMBER); doc.line(M, y + 2, M + 52, y + 2)
  y += 9
  color(doc, DARK); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  const notesLines = doc.splitTextToSize(result.parentNotes || '', CW - 5)
  doc.text(notesLines, M, y)

  // ── Footer semua halaman ─────────────────────────────────
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    stroke(doc, LIGHT); doc.setLineWidth(0.4)
    doc.line(M, 284, W - M, 284)
    color(doc, GRAY); doc.setFontSize(7)
    doc.text('PetaBakat · Laporan Potensi Anak', W / 2, 289, { align: 'center' })
  }

  return Buffer.from(doc.output('arraybuffer'))
}
