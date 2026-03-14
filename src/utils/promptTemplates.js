/**
 * Generador de prompts prearmados para copiar/pegar en ChatGPT o Gemini.
 * No hace llamadas a APIs — solo genera strings con datos del negocio.
 */

export function generateWebAnalysisPrompt(business, lighthouse, searchLocation = '') {
  const name = business.name || 'el negocio'
  const rating = business.rating || 'N/A'
  const reviews = business.user_ratings_total || 0
  const location = business.vicinity || searchLocation || 'ubicación desconocida'
  const website = business.website || null

  if (!website) {
    return `Actuá como un consultor de marketing digital experto en PyMEs argentinas.

El negocio "${name}" ubicado en "${location}" tiene ${rating}★ con ${reviews} reseñas en Google Maps, pero NO tiene sitio web propio.

Necesito que:
1. Expliques por qué es crítico tener un sitio web en 2026 para un negocio local
2. Estimes cuántos clientes potenciales pierde por no tener presencia web
3. Describas qué tipo de sitio web le convendría (landing page, catálogo, e-commerce, etc.)
4. Des 3 argumentos de venta convincentes para ofrecerle el servicio de creación web
5. Sugieras qué contenido debería tener su sitio basándote en su rubro y ubicación

Sé específico y práctico. Responde en español argentino.`
  }

  const hasScores = lighthouse && !lighthouse.error && !lighthouse.noWebsite
  const scoresBlock = hasScores
    ? `
Datos de Google PageSpeed Insights (Lighthouse):
- Performance: ${lighthouse.performance}/100
- SEO: ${lighthouse.seo}/100
- Accesibilidad: ${lighthouse.accessibility}/100
- Buenas Prácticas: ${lighthouse.bestPractices}/100
- LCP (Largest Contentful Paint): ${lighthouse.lcp}
- CLS (Cumulative Layout Shift): ${lighthouse.cls}
- TBT (Total Blocking Time): ${lighthouse.fid}
- FCP (First Contentful Paint): ${lighthouse.fcp}
- Speed Index: ${lighthouse.speedIndex}`
    : '\n(No se pudieron obtener métricas de Lighthouse para este sitio)'

  return `Actuá como un consultor de marketing digital experto en PyMEs argentinas.

Analizá el sitio web de "${name}" (${website}).
Ubicación: ${location}
Google Maps: ${rating}★ con ${reviews} reseñas
${scoresBlock}

Necesito que:
1. Identifiques los 3 problemas más críticos del sitio web y cómo afectan al negocio
2. Priorices las mejoras por impacto en conversiones y captación de clientes
3. Evalúes su posicionamiento SEO local y qué keywords debería atacar
4. Compares su presencia digital con lo esperado para su rubro
5. Des un plan de acción concreto de 30 días con pasos específicos
6. Estimes el ROI potencial de implementar tus recomendaciones

Sé específico, usa datos concretos y responde en español argentino.`
}

export function generateOutreachPrompt(business, lighthouse, channel = 'whatsapp', searchLocation = '') {
  const name = business.name || 'el negocio'
  const rating = business.rating || 'N/A'
  const reviews = business.user_ratings_total || 0
  const location = business.vicinity || searchLocation || ''
  const website = business.website || null

  const hasScores = lighthouse && !lighthouse.error && !lighthouse.noWebsite
  const webContext = !website
    ? 'NO tiene sitio web propio'
    : hasScores
      ? `Su sitio web tiene: Performance ${lighthouse.performance}/100, SEO ${lighthouse.seo}/100, Accesibilidad ${lighthouse.accessibility}/100`
      : `Tiene sitio web: ${website}`

  const channelInstructions = {
    whatsapp: `- Formato WhatsApp: máximo 3-4 líneas, tono casual argentino
- Empezá con algo que demuestre que investigaste el negocio
- Terminá con una pregunta abierta que invite a responder
- Máximo 1-2 emojis, no parecer spam
- NO pongas links ni archivos adjuntos en el primer mensaje`,
    email: `- Formato email profesional pero cercano
- Asunto atractivo que genere curiosidad (incluilo al principio)
- Máximo 5-6 oraciones en el cuerpo
- Incluí un dato específico del negocio que demuestre investigación
- Call to action claro: proponer una llamada de 15 min o reunión
- Firma profesional con nombre y cargo`,
    instagram: `- Formato DM de Instagram: breve y visual
- Máximo 2-3 líneas, tono amigable
- Mencioná algo específico de su perfil/contenido
- Sugerí cómo podrías ayudarlos a mejorar su presencia en redes
- Terminá con pregunta que invite a responder`,
  }

  return `Actuá como un agente de ventas de servicios de marketing digital para PyMEs argentinas.

Escribí un mensaje de primer contacto por ${channel.toUpperCase()} para "${name}" ubicado en "${location}".
Google Maps: ${rating}★ con ${reviews} reseñas.
${webContext}

Instrucciones del canal:
${channelInstructions[channel] || channelInstructions.whatsapp}

Reglas generales:
- Sonar natural y auténtico, NUNCA robótico o genérico
- Demostrar que investigaste el negocio (mencioná algo específico)
- No vendas directamente, generá curiosidad
- Español argentino informal (vos, ¿cómo andás?, etc.)
- El objetivo es conseguir una respuesta, no cerrar una venta

Devolvé SOLO el mensaje listo para enviar, sin explicaciones.`
}

export function generateWebsiteCreationPrompt(business, lighthouse, searchLocation = '') {
  const name = business.name || 'el negocio'
  const rating = business.rating || 'N/A'
  const reviews = business.user_ratings_total || 0
  const location = business.vicinity || searchLocation || 'ubicación no especificada'
  const website = business.website || null
  const phone = business.phone || null

  const hasScores = lighthouse && !lighthouse.error && !lighthouse.noWebsite
  const currentWebContext = website && hasScores
    ? `\nTiene un sitio actual (${website}) con estos scores:
- Performance: ${lighthouse.performance}/100, SEO: ${lighthouse.seo}/100
- El nuevo sitio debe superar estos números.`
    : website
      ? `\nTiene un sitio actual (${website}) que necesita ser reemplazado/mejorado.`
      : '\nActualmente NO tiene sitio web.'

  return `Actuá como un desarrollador web fullstack experto en sitios para PyMEs argentinas.

Necesito que crees un sitio web completo para "${name}".
Ubicación: ${location}
Google Maps: ${rating}★ con ${reviews} reseñas
${phone ? `Teléfono: ${phone}` : ''}
${currentWebContext}

Requisitos del sitio:
1. **Diseño**: Moderno, responsive (mobile-first), con paleta de colores profesional acorde al rubro
2. **Secciones**: Hero con CTA, Sobre nosotros, Servicios/Productos, Testimonios (usar las ${reviews} reseñas como base), Ubicación con mapa, Contacto (WhatsApp, teléfono, formulario)
3. **SEO**: Meta tags optimizados, schema markup para negocio local, Open Graph tags
4. **Performance**: Código limpio, imágenes optimizadas (lazy loading), Core Web Vitals verdes
5. **Tecnología**: HTML5 + CSS3 + JavaScript vanilla (o el framework que consideres mejor para un sitio simple)
6. **Integaciones**: Botón de WhatsApp flotante, Google Maps embed, Google Analytics ready

⚠️ PLACEHOLDER PARA IMÁGENES: Donde corresponda, indicá "[INSERTAR FOTO: descripción de qué foto usar]" para que yo agregue las fotos reales del negocio.

Generá el código completo y listo para deployar. Incluí comentarios explicando las secciones clave.`
}

// Map of Google Places types → business type labels and service descriptions
const BUSINESS_TYPES = {
  gym: { label: 'gimnasio', service: 'paginas web que ayudan a gestionar alumnos y cargar rutinas para los clientes' },
  restaurant: { label: 'restaurante', service: 'paginas web con menu digital, reservas online y pedidos para delivery' },
  cafe: { label: 'cafeteria', service: 'paginas web con carta digital, sistema de pedidos y programa de fidelidad' },
  bakery: { label: 'panaderia', service: 'paginas web con catalogo de productos, pedidos anticipados y delivery' },
  dentist: { label: 'consultorio dental', service: 'paginas web con sistema de turnos online y ficha de pacientes' },
  doctor: { label: 'consultorio', service: 'paginas web con sistema de turnos online y portal para pacientes' },
  lawyer: { label: 'estudio juridico', service: 'paginas web profesionales con formulario de consulta y seguimiento de casos' },
  accounting: { label: 'estudio contable', service: 'paginas web con portal de clientes y gestion de documentos' },
  beauty_salon: { label: 'salon de belleza', service: 'paginas web con reserva de turnos, galeria de trabajos y precios' },
  hair_care: { label: 'peluqueria', service: 'paginas web con reserva de turnos, galeria de trabajos y precios' },
  spa: { label: 'spa', service: 'paginas web con reserva de tratamientos, paquetes y gift cards' },
  car_repair: { label: 'taller mecanico', service: 'paginas web con turnos, seguimiento de reparaciones y presupuestos online' },
  car_dealer: { label: 'concesionaria', service: 'paginas web con catalogo de vehiculos, financiacion y cotizador online' },
  real_estate_agency: { label: 'inmobiliaria', service: 'paginas web con buscador de propiedades, filtros y contacto directo' },
  store: { label: 'tienda', service: 'paginas web con catalogo de productos, carrito de compras y envios' },
  clothing_store: { label: 'tienda de ropa', service: 'paginas web con tienda online, lookbook y sistema de talles' },
  electronics_store: { label: 'tienda de electronica', service: 'paginas web con e-commerce, comparador de productos y garantias' },
  pet_store: { label: 'pet shop', service: 'paginas web con tienda online, turnos de peluqueria canina y tips' },
  veterinary_care: { label: 'veterinaria', service: 'paginas web con turnos online, historial de mascotas y emergencias' },
  school: { label: 'institucion educativa', service: 'paginas web con portal de alumnos, inscripcion online y noticias' },
  lodging: { label: 'alojamiento', service: 'paginas web con motor de reservas, galeria y tarifas actualizadas' },
  pharmacy: { label: 'farmacia', service: 'paginas web con catalogo de productos, pedidos y turnos de vacunacion' },
  insurance_agency: { label: 'aseguradora', service: 'paginas web con cotizador online, gestion de polizas y siniestros' },
}

function detectBusinessType(business, searchType = '') {
  // First try from the search query type
  const search = searchType.toLowerCase()
  for (const [key, val] of Object.entries(BUSINESS_TYPES)) {
    if (search.includes(key) || search.includes(val.label)) return val
  }
  // Then try from Google Places types array
  const types = business.types || []
  for (const t of types) {
    if (BUSINESS_TYPES[t]) return BUSINESS_TYPES[t]
  }
  // Fallback: try matching business name
  const nameLower = (business.name || '').toLowerCase()
  for (const [, val] of Object.entries(BUSINESS_TYPES)) {
    if (nameLower.includes(val.label)) return val
  }
  return null
}

export function generateWhatsAppMessage(business, lighthouse, searchLocation = '', searchType = '') {
  const name = business.name || ''
  const detected = detectBusinessType(business, searchType)
  const label = detected?.label || 'negocio'
  const service = detected?.service || 'paginas web profesionales que ayudan a captar mas clientes'

  let msg = `Buenas! Estaba viendo ${label === 'negocio' ? 'negocios' : label + 's'} en Google Maps y me aparecio el suyo.\n`
  msg += `Estoy contactando algunos porque estoy armando ${service}.\n`
  msg += `Si quieren puedo mostrarles un boceto rapido de como podria verse una para ustedes, sin compromiso.\n`
  msg += `Actualmente tienen pagina web o trabajan mas con Instagram y WhatsApp?`

  return msg
}

// Keep old exports for backward compatibility
export { generateWhatsAppMessage as generateWhatsAppDirectMessage }
