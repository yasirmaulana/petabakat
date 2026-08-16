export function buildPdfHtml(result: any) {
  const child = result.survey?.child
  const parent = result.survey?.parent
  const responses = result.survey?.responses?.map((r: any) => r.responseOption).join(', ') || '-'

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; color: #1c1917; background: #fff; }
    .header { text-align: center; border-bottom: 3px solid #2F5D4E; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2F5D4E; margin: 0; font-size: 28px; }
    .header p { color: #78716c; margin: 8px 0 0; }
    .section { margin-bottom: 28px; }
    .section h2 { color: #2F5D4E; font-size: 18px; border-left: 4px solid #C9A227; padding-left: 12px; margin-bottom: 12px; }
    .persona { background: #FDFBF7; border: 1px solid #C9A227; border-radius: 12px; padding: 20px; }
    .persona h3 { color: #2F5D4E; margin: 0 0 10px; font-size: 22px; }
    .scores { display: flex; gap: 16px; margin: 16px 0; }
    .score-box { flex: 1; background: #FDFBF7; border-radius: 10px; padding: 14px; text-align: center; }
    .score-box .label { font-size: 12px; color: #78716c; text-transform: uppercase; }
    .score-box .value { font-size: 24px; font-weight: 700; color: #2F5D4E; }
    .score-box .pct { font-size: 13px; color: #a8a29e; }
    .schedule-item { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start; }
    .schedule-item .day { background: #2F5D4E; color: #fff; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .schedule-item .content { flex: 1; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PetaBakat</h1>
    <p>Laporan Potensi Anak Berbasis Nasab & Hasab</p>
  </div>

  <div class="section">
    <h2>Data Anak</h2>
    <p><strong>Nama:</strong> ${child?.name || '-'}</p>
    <p><strong>Orang Tua:</strong> ${parent?.name || '-'}</p>
    <p><strong>Respon Alami:</strong> ${responses}</p>
  </div>

  <div class="section persona">
    <h3>${result.personaLabel}</h3>
    <p>${result.personaDescription}</p>
  </div>

  <div class="section">
    <h2>Skor Hasab</h2>
    <div class="scores">
      <div class="score-box">
        <div class="label">Asyiha</div>
        <div class="value">${result.scoreAsyiha}</div>
        <div class="pct">${result.pctAsyiha}%</div>
      </div>
      <div class="score-box">
        <div class="label">Ilmi</div>
        <div class="value">${result.scoreIlmi}</div>
        <div class="pct">${result.pctIlmi}%</div>
      </div>
      <div class="score-box">
        <div class="label">Amali</div>
        <div class="value">${result.scoreAmali}</div>
        <div class="pct">${result.pctAmali}%</div>
      </div>
      <div class="score-box">
        <div class="label">Wajdan</div>
        <div class="value">${result.scoreWajdan}</div>
        <div class="pct">${result.pctWajdan}%</div>
      </div>
    </div>
    <p>${result.scoreNarrative}</p>
  </div>

  <div class="section">
    <h2>${result.microdosingPlan?.title || 'Rencana Micro-Dosing'}</h2>
    ${(result.microdosingPlan?.schedule || []).map((item: any) => `
      <div class="schedule-item">
        <div class="day">${item.day}</div>
        <div class="content">
          <strong>${item.activity}</strong><br>
          <span style="color:#78716c;font-size:13px;">${item.durationMinutes} menit</span>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Catatan untuk Orang Tua</h2>
    <p>${result.parentNotes}</p>
  </div>

  <div class="footer">
    Dibuat oleh aplikasi PetaBakat — www.petabakat.id
  </div>
</body>
</html>
  `.trim()
}
