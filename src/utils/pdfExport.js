export async function exportToPDF(business, lighthouseData) {
  const html2pdf = (await import('html2pdf.js')).default

  const scores = lighthouseData[business.place_id]

  const getScoreColor = (score) => {
    if (score >= 90) return '#16a34a'
    if (score >= 50) return '#d97706'
    return '#dc2626'
  }

  const getScoreBar = (score) => {
    const color = getScoreColor(score)
    return `<div style="background:#e5e7eb;border-radius:4px;height:8px;width:100%;margin-top:4px;">
      <div style="background:${color};border-radius:4px;height:8px;width:${score}%;"></div>
    </div>`
  }

  const content = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1f2937;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #1e40af;">
        <div>
          <h1 style="font-size:28px; font-weight:800; color:#1e40af; margin:0 0 4px 0;">AutoClientes</h1>
          <p style="color:#6b7280; font-size:14px; margin:0;">Análisis Competitivo Digital</p>
        </div>
        <div style="text-align:right; color:#6b7280; font-size:12px;">
          <p style="margin:0;">${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <!-- Business Info -->
      <div style="background:#f0f9ff; border-radius:12px; padding:24px; margin-bottom:24px; border-left:4px solid #1e40af;">
        <h2 style="font-size:22px; font-weight:700; color:#1e3a8a; margin:0 0 12px 0;">${business.name}</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <p style="color:#6b7280; font-size:12px; margin:0;">Dirección</p>
            <p style="color:#1f2937; font-size:14px; margin:2px 0 0 0;">${business.vicinity || 'N/A'}</p>
          </div>
          <div>
            <p style="color:#6b7280; font-size:12px; margin:0;">Calificación</p>
            <p style="color:#1f2937; font-size:14px; margin:2px 0 0 0;">⭐ ${business.rating || 'N/A'} (${business.user_ratings_total || 0} reseñas)</p>
          </div>
          ${business.website ? `<div>
            <p style="color:#6b7280; font-size:12px; margin:0;">Sitio Web</p>
            <p style="color:#2563eb; font-size:14px; margin:2px 0 0 0;">${business.website}</p>
          </div>` : ''}
        </div>
      </div>

      ${scores ? `
      <!-- Lighthouse Scores -->
      <div style="margin-bottom:24px;">
        <h3 style="font-size:18px; font-weight:700; color:#1f2937; margin:0 0 16px 0;">📊 Métricas Lighthouse</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          ${[
            { label: 'Performance', value: scores.performance },
            { label: 'Accesibilidad', value: scores.accessibility },
            { label: 'Best Practices', value: scores.bestPractices },
            { label: 'SEO', value: scores.seo },
          ].map(({ label, value }) => `
            <div style="background:white; border-radius:8px; padding:16px; border:1px solid #e5e7eb;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:14px; color:#374151;">${label}</span>
                <span style="font-size:24px; font-weight:700; color:${getScoreColor(value)};">${value}</span>
              </div>
              ${getScoreBar(value)}
            </div>
          `).join('')}
        </div>

        <!-- Core Web Vitals -->
        <div style="background:#f9fafb; border-radius:8px; padding:16px; margin-top:16px;">
          <h4 style="font-size:14px; font-weight:600; color:#374151; margin:0 0 12px 0;">Core Web Vitals</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; text-align:center;">
            <div>
              <p style="color:#6b7280; font-size:11px; margin:0;">LCP</p>
              <p style="color:#1f2937; font-size:16px; font-weight:600; margin:4px 0 0 0;">${scores.lcp}</p>
            </div>
            <div>
              <p style="color:#6b7280; font-size:11px; margin:0;">TBT (FID proxy)</p>
              <p style="color:#1f2937; font-size:16px; font-weight:600; margin:4px 0 0 0;">${scores.fid}</p>
            </div>
            <div>
              <p style="color:#6b7280; font-size:11px; margin:0;">CLS</p>
              <p style="color:#1f2937; font-size:16px; font-weight:600; margin:4px 0 0 0;">${scores.cls}</p>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top:32px; padding-top:20px; border-top:1px solid #e5e7eb; text-align:center; color:#9ca3af; font-size:12px;">
        <p style="margin:0;">Generado por AutoClientes • ${new Date().toLocaleDateString('es-ES')} • Análisis Competitivo Digital</p>
      </div>
    </div>
  `

  const element = document.createElement('div')
  element.innerHTML = content
  document.body.appendChild(element)

  const options = {
    margin: [0, 0, 0, 0],
    filename: `autoclientes_${business.name.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  await html2pdf().set(options).from(element).save()
  document.body.removeChild(element)
}
