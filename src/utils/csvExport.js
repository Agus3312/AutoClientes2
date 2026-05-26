const STATUS_LABELS = {
  contacted: 'Contactado',
  responded: 'Respondio',
  interested: 'Interesado',
}

export async function exportToSheet(businesses, lighthouseData = {}, contactStatuses = {}) {
  const XLSX = await import('xlsx')

  const headers = [
    'Nombre', 'Direccion', 'Rating', 'Resenas', 'Telefono', 'Email',
    'Instagram', 'Facebook', 'Sitio Web', 'Tiene Web',
    'Performance', 'SEO', 'Accesibilidad',
    'Buenas Practicas', 'Estado Contacto', 'Google Maps'
  ]

  const rows = businesses.map(b => {
    const lh = lighthouseData[b.place_id]
    const hasScores = lh && !lh.error && !lh.noWebsite
    const status = contactStatuses[b.place_id]
    const getSocial = (key) => b.socials?.find(s => s.key === key)?.url || ''

    return [
      b.name || '',
      b.vicinity || '',
      b.rating || '',
      b.user_ratings_total || 0,
      b.phone || '',
      b.email || '',
      getSocial('instagram'),
      getSocial('facebook'),
      b.website || '',
      b.website ? 'Si' : 'No',
      hasScores ? lh.performance : '',
      hasScores ? lh.seo : '',
      hasScores ? lh.accessibility : '',
      hasScores ? lh.bestPractices : '',
      STATUS_LABELS[status] || 'Sin contactar',
      `https://www.google.com/maps/place/?q=place_id:${b.place_id}`,
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Column widths for readability
  ws['!cols'] = [
    { wch: 30 }, // Nombre
    { wch: 35 }, // Direccion
    { wch: 8 },  // Rating
    { wch: 8 },  // Resenas
    { wch: 18 }, // Telefono
    { wch: 25 }, // Email
    { wch: 30 }, // Instagram
    { wch: 30 }, // Facebook
    { wch: 35 }, // Sitio Web
    { wch: 10 }, // Tiene Web
    { wch: 12 }, // Performance
    { wch: 8 },  // SEO
    { wch: 14 }, // Accesibilidad
    { wch: 16 }, // Buenas Practicas
    { wch: 16 }, // Estado Contacto
    { wch: 50 }, // Google Maps
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Negocios')

  const dateStr = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `AutoClientes_${dateStr}.xlsx`)
}

// Keep backward compat alias
export const exportToCSV = exportToSheet