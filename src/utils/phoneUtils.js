/**
 * Normaliza un número de teléfono para usar con la API de WhatsApp (wa.me).
 *
 * Google Places devuelve teléfonos en varios formatos:
 *   "+54 9 11 5555-1234"   → internacional con código de país (ideal)
 *   "011 5555-1234"        → formato local argentino
 *   "(011) 5555-1234"      → local con paréntesis
 *   "5555-1234"            → solo número local
 *   "+34 912 345 678"      → internacional España
 *
 * WhatsApp requiere: código de país + número sin 0 inicial, sin espacios ni guiones.
 * Ej: "5491155551234" para Argentina, "34912345678" para España.
 */
export function formatPhoneForWhatsApp(rawPhone) {
  if (!rawPhone) return ''

  // Quitar todo excepto dígitos y el + inicial
  let digits = rawPhone.replace(/[^\d+]/g, '')

  // Si empieza con +, ya tiene código de país
  if (digits.startsWith('+')) {
    digits = digits.slice(1) // quitar el +

    // Argentina: +54 9 XX → ya está bien, solo asegurar que no tenga 0 después del 54 9
    if (digits.startsWith('54')) {
      // Quitar el 0 que a veces queda: +54 0 11 → 54011 → debería ser 5411
      digits = digits.replace(/^54(0)/, '54')
      // Si no tiene el 9 para celular (54 11 → 54 9 11), agregarlo si parece celular (8+ dígitos después de 54)
      const afterCode = digits.slice(2)
      if (!afterCode.startsWith('9') && afterCode.length >= 8 && afterCode.length <= 10) {
        digits = '54' + '9' + afterCode
      }
    }
    return digits
  }

  // Sin +, es número local. Necesitamos inferir el código de país.
  // Quitar todos los no-dígitos
  digits = digits.replace(/\D/g, '')

  // Quitar 0 inicial (prefijo de discado local en muchos países)
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '')
  }

  // Si el número tiene 10+ dígitos y empieza con un código de país conocido, ya está completo
  // Códigos comunes de LATAM y España
  const countryCodes = ['54', '52', '55', '56', '57', '58', '51', '53', '34', '1']
  for (const code of countryCodes) {
    if (digits.startsWith(code) && digits.length >= 10) {
      // Argentina: asegurar el 9 para celular
      if (code === '54') {
        const afterCode = digits.slice(2)
        if (!afterCode.startsWith('9') && afterCode.length >= 8) {
          digits = '54' + '9' + afterCode
        }
      }
      return digits
    }
  }

  // Número corto sin código de país - no podemos garantizar que funcione,
  // pero intentamos devolver lo que tenemos
  return digits
}

/**
 * Genera la URL completa de WhatsApp con mensaje.
 */
export function buildWhatsAppUrl(rawPhone, message = '') {
  const phone = formatPhoneForWhatsApp(rawPhone)
  if (!phone) return ''
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${phone}${params}`
}
