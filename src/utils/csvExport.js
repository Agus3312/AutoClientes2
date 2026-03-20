const STATUS_LABELS = {
  contacted: 'Contactado',
  responded: 'Respondio',
  interested: 'Interesado',
}

export function exportToCSV(businesses, lighthouseData = {}, contactStatuses = {}) {
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
      (b.vicinity || '').replace(/,/g, ' -'),
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

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `AutoClientes_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
