/**
 * Generador de mensajes de WhatsApp dinámicos según tipo de negocio.
 */

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
  const search = searchType.toLowerCase()
  for (const [key, val] of Object.entries(BUSINESS_TYPES)) {
    if (search.includes(key) || search.includes(val.label)) return val
  }
  const types = business.types || []
  for (const t of types) {
    if (BUSINESS_TYPES[t]) return BUSINESS_TYPES[t]
  }
  const nameLower = (business.name || '').toLowerCase()
  for (const [, val] of Object.entries(BUSINESS_TYPES)) {
    if (nameLower.includes(val.label)) return val
  }
  return null
}

export function generateWhatsAppMessage(business, searchLocation = '', searchType = '', customTemplate = '') {
  // If user has a custom template, use it with placeholder replacement
  if (customTemplate) {
    const detected = detectBusinessType(business, searchType)
    return customTemplate
      .replace(/\{nombre\}/g, business.name || '')
      .replace(/\{rubro\}/g, detected?.label || 'negocio')
      .replace(/\{ubicacion\}/g, business.vicinity || searchLocation || '')
      .replace(/\{rating\}/g, business.rating || '')
      .replace(/\{resenas\}/g, business.user_ratings_total || '0')
  }

  const detected = detectBusinessType(business, searchType)
  const label = detected?.label || 'negocio'
  const service = detected?.service || 'paginas web profesionales que ayudan a captar mas clientes'

  let msg = `Buenas! Estaba viendo ${label === 'negocio' ? 'negocios' : label + 's'} en Google Maps y me aparecio el suyo.\n`
  msg += `Estoy contactando algunos porque estoy armando ${service}.\n`
  msg += `Si quieren puedo mostrarles un boceto rapido de como podria verse una para ustedes, sin compromiso.\n`
  msg += `Actualmente tienen pagina web o trabajan mas con Instagram y WhatsApp?`

  return msg
}
