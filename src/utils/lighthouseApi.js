const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

// Known SaaS/tools patterns to detect in website HTML & network requests
const SAAS_SIGNATURES = [
  // Booking / Appointments
  { pattern: /calendly/i,          name: 'Calendly',        category: 'turnos' },
  { pattern: /booksy/i,            name: 'Booksy',          category: 'turnos' },
  { pattern: /acuityscheduling/i,  name: 'Acuity',          category: 'turnos' },
  { pattern: /setmore/i,           name: 'Setmore',         category: 'turnos' },
  { pattern: /simplybook/i,        name: 'SimplyBook',      category: 'turnos' },
  { pattern: /fresha\.com/i,       name: 'Fresha',          category: 'turnos' },
  { pattern: /mindbody/i,          name: 'Mindbody',        category: 'turnos' },
  { pattern: /vagaro/i,            name: 'Vagaro',          category: 'turnos' },
  // E-commerce / POS
  { pattern: /shopify/i,           name: 'Shopify',         category: 'ecommerce' },
  { pattern: /tiendanube/i,        name: 'Tiendanube',      category: 'ecommerce' },
  { pattern: /woocommerce/i,       name: 'WooCommerce',     category: 'ecommerce' },
  { pattern: /mercadoshops/i,      name: 'MercadoShops',    category: 'ecommerce' },
  { pattern: /vtex/i,              name: 'VTEX',            category: 'ecommerce' },
  // Delivery / Orders
  { pattern: /pedidosya/i,         name: 'PedidosYa',       category: 'delivery' },
  { pattern: /rappi/i,             name: 'Rappi',           category: 'delivery' },
  { pattern: /glovo/i,             name: 'Glovo',           category: 'delivery' },
  // CRM / Marketing
  { pattern: /hubspot/i,           name: 'HubSpot',         category: 'crm' },
  { pattern: /mailchimp/i,        name: 'Mailchimp',       category: 'marketing' },
  { pattern: /activecampaign/i,    name: 'ActiveCampaign',  category: 'crm' },
  // Chat / Support
  { pattern: /tawk\.to/i,          name: 'Tawk.to',         category: 'chat' },
  { pattern: /crisp\.chat/i,       name: 'Crisp',           category: 'chat' },
  { pattern: /intercom/i,          name: 'Intercom',        category: 'chat' },
  { pattern: /tidio/i,             name: 'Tidio',           category: 'chat' },
  // Payments
  { pattern: /mercadopago/i,       name: 'MercadoPago',     category: 'pagos' },
  { pattern: /stripe/i,            name: 'Stripe',          category: 'pagos' },
  { pattern: /paypal/i,            name: 'PayPal',          category: 'pagos' },
  // Analytics (usually means some digital maturity)
  { pattern: /google-analytics|gtag|googletagmanager/i, name: 'Google Analytics', category: 'analytics' },
  { pattern: /facebook\.net\/.*fbevents|fbq\(/i,         name: 'Facebook Pixel',  category: 'analytics' },
]

/**
 * Detect SaaS tools used by a website by fetching its HTML.
 * Returns array of { name, category } or empty array.
 */
export async function detectSaasTools(url) {
  if (!url) return []
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`
  try {
    const resp = await fetch(cleanUrl, {
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000),
    })
    // no-cors returns opaque response, so try cors first if possible
    let html = ''
    try {
      const corsResp = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`, {
        signal: AbortSignal.timeout(6000),
      })
      if (corsResp.ok) html = await corsResp.text()
    } catch {
      // CORS proxy failed, we'll rely on network requests from PageSpeed data
      return []
    }
    const found = []
    const seen = new Set()
    for (const sig of SAAS_SIGNATURES) {
      if (sig.pattern.test(html) && !seen.has(sig.name)) {
        seen.add(sig.name)
        found.push({ name: sig.name, category: sig.category })
      }
    }
    return found
  } catch {
    return []
  }
}

/**
 * Detect SaaS tools from PageSpeed audit data (network requests).
 */
export function detectSaasFromAudits(audits) {
  if (!audits) return []
  const found = []
  const seen = new Set()
  // Check network-requests audit for third-party URLs
  const networkItems = audits['network-requests']?.details?.items || []
  const thirdParty = audits['third-party-summary']?.details?.items || []
  const allUrls = [
    ...networkItems.map(i => i.url || ''),
    ...thirdParty.map(i => i.entity || ''),
  ].join(' ')

  for (const sig of SAAS_SIGNATURES) {
    if (sig.pattern.test(allUrls) && !seen.has(sig.name)) {
      seen.add(sig.name)
      found.push({ name: sig.name, category: sig.category })
    }
  }
  return found
}

export async function getLighthouseData(url, apiKey) {
  if (!url) throw new Error('URL is required')

  // Clean URL
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`

  // Build URL with multiple category params
  const urlStr = `${PAGESPEED_API}?url=${encodeURIComponent(cleanUrl)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo${apiKey ? `&key=${apiKey}` : ''}`

  const response = await fetch(urlStr)

  if (!response.ok) {
    const error = await response.json()
    const msg = error.error?.message || `HTTP ${response.status}`
    if (response.status === 403 || msg.includes('not been used') || msg.includes('disabled')) {
      throw new Error('PageSpeed API no habilitada en Google Cloud Console')
    }
    throw new Error(msg)
  }

  const data = await response.json()

  const categories = data.lighthouseResult?.categories || {}
  const audits = data.lighthouseResult?.audits || {}

  // Detect SaaS tools from PageSpeed network data
  const detectedSaas = detectSaasFromAudits(audits)

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
    // SaaS detection
    detectedSaas,
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
