const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

export async function getLighthouseData(url, apiKey) {
  if (!url) throw new Error('URL is required')

  // Clean URL
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`

  const params = new URLSearchParams({
    url: cleanUrl,
    strategy: 'mobile',
    category: ['performance', 'accessibility', 'best-practices', 'seo'].join('&category='),
  })

  if (apiKey) params.append('key', apiKey)

  // Build URL with multiple category params
  const urlStr = `${PAGESPEED_API}?url=${encodeURIComponent(cleanUrl)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo${apiKey ? `&key=${apiKey}` : ''}`

  const response = await fetch(urlStr)

  if (!response.ok) {
    const error = await response.json()
    const msg = error.error?.message || `HTTP ${response.status}`
    // Si el error es de API no habilitada, mensaje más claro
    if (response.status === 403 || msg.includes('not been used') || msg.includes('disabled')) {
      throw new Error('PageSpeed API no habilitada en Google Cloud Console')
    }
    throw new Error(msg)
  }

  const data = await response.json()

  const categories = data.lighthouseResult?.categories || {}
  const audits = data.lighthouseResult?.audits || {}

  return {
    url: cleanUrl,
    performance: Math.round((categories.performance?.score || 0) * 100),
    accessibility: Math.round((categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
    seo: Math.round((categories.seo?.score || 0) * 100),
    // Core Web Vitals
    lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
    fid: audits['total-blocking-time']?.displayValue || 'N/A',
    cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
    fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
    speedIndex: audits['speed-index']?.displayValue || 'N/A',
    // Raw scores for comparison
    lcpScore: Math.round((audits['largest-contentful-paint']?.score || 0) * 100),
    clsScore: Math.round((audits['cumulative-layout-shift']?.score || 0) * 100),
    ttfbScore: Math.round((audits['server-response-time']?.score || 0) * 100),
  }
}

export function getScoreColor(score) {
  if (score >= 90) return 'green'
  if (score >= 50) return 'yellow'
  return 'red'
}

export function getScoreLabel(score) {
  if (score >= 90) return 'Excelente'
  if (score >= 50) return 'Mejorable'
  return 'Deficiente'
}
