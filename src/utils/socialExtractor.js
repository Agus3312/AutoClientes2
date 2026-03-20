/**
 * Extrae emails y links de redes sociales del HTML de un sitio web.
 */

const SOCIAL_PATTERNS = [
  {
    key: 'instagram',
    label: 'Instagram',
    pattern: /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/gi,
    buildUrl: (handle) => `https://instagram.com/${handle}`,
    icon: 'instagram',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    pattern: /https?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9.]+)\/?/gi,
    buildUrl: (handle) => `https://facebook.com/${handle}`,
    icon: 'facebook',
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    pattern: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?/gi,
    buildUrl: (handle) => `https://x.com/${handle}`,
    icon: 'twitter',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    pattern: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)\/?/gi,
    buildUrl: (handle) => `https://linkedin.com/company/${handle}`,
    icon: 'linkedin',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    pattern: /https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/?/gi,
    buildUrl: (handle) => `https://tiktok.com/@${handle}`,
    icon: 'tiktok',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    pattern: /https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/)?([a-zA-Z0-9_-]+)\/?/gi,
    buildUrl: (handle) => `https://youtube.com/@${handle}`,
    icon: 'youtube',
  },
]

// Handles genéricos que no son perfiles reales
const IGNORED_HANDLES = new Set([
  'share', 'sharer', 'intent', 'hashtag', 'dialog', 'login', 'signup',
  'help', 'about', 'privacy', 'terms', 'policies', 'settings',
  'tr', 'p', 'pages', 'watch', 'feed', 'explore', 'reels',
  'sharer.php', 'plugins', 'v2', 'oauth', 'embed',
])

/**
 * Extrae info de contacto (emails + redes sociales) del HTML.
 * @param {string} html - HTML del sitio web
 * @returns {{ email: string|null, socials: { key, label, url, handle }[] }}
 */
export function extractContactInfo(html) {
  if (!html) return { email: null, socials: [] }

  // --- Email ---
  // Buscar emails en mailto: links primero (más confiable)
  const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i)
  let email = mailtoMatch ? mailtoMatch[1].toLowerCase() : null

  // Si no hay mailto, buscar emails en texto visible (excluir los de assets/scripts)
  if (!email) {
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
    const allEmails = html.match(emailRegex) || []
    // Filtrar emails que parecen de assets (woff, png, etc) o de servicios
    const validEmail = allEmails.find(e => {
      const lower = e.toLowerCase()
      return !lower.endsWith('.png') && !lower.endsWith('.jpg') &&
             !lower.endsWith('.woff') && !lower.endsWith('.woff2') &&
             !lower.includes('sentry') && !lower.includes('webpack') &&
             !lower.includes('example.com') && !lower.includes('test.')
    })
    email = validEmail ? validEmail.toLowerCase() : null
  }

  // --- Redes sociales ---
  const socials = []
  const seenKeys = new Set()

  for (const social of SOCIAL_PATTERNS) {
    const matches = [...html.matchAll(social.pattern)]
    for (const match of matches) {
      const handle = match[1]
      if (!handle || IGNORED_HANDLES.has(handle.toLowerCase())) continue
      if (seenKeys.has(social.key)) continue
      seenKeys.add(social.key)
      socials.push({
        key: social.key,
        label: social.label,
        url: social.buildUrl(handle),
        handle,
      })
      break // Solo el primer match válido por red social
    }
  }

  return { email, socials }
}
